import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { valhalla, osrmRoute, brouterFast } from '../../../lib/route-providers.ts';
import { safeRoutePositions } from '../../../lib/safe-route.ts';
import { isUsableRoute } from '../../../lib/v3-calculation/route-candidate.ts';
import { candidatePlans, findPlanLegStretchAnomaly, followsPlan } from '../../../lib/special-territory-policy.ts';
import { SPECIAL_TERRITORY_BOUNDARIES } from '../../../lib/special-territory-boundaries.ts';
import { selectFastestRoute } from '../fastest-route-policy.mjs';
import { validateTollEdges } from '../../../lib/toll-validator.ts';
import { calculateLegTolls } from '../../../lib/v3-calculation/route-leg-pricing.ts';
import { tollsForApi } from '../../../lib/v2-calculation/free-route-selection.ts';
import { recordingFetch, replayingFetch, assessRoadCoverage, summarizePassageEvidence } from './systemic-audit-io.mjs';
import { paidProductsFromName } from '../../../lib/v3-calculation/unpriced-road-coverage.ts';
import { M4_NODE_TO_PLAZA } from '../../../lib/toll-engine/m4-plaza-nodes.ts';
import { priceA289Route } from '../../../lib/toll-engine/a289-engine.ts';

const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'corpus.json'), 'utf8'));
const corridorPath = path.join(root, 'road-cases.json');
const corridorCorpus = fs.existsSync(corridorPath) ? JSON.parse(fs.readFileSync(corridorPath, 'utf8')) : { routes: [] };
const nodeIdentities = JSON.parse(fs.readFileSync('experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/identity-sources/node-identities.json', 'utf8'));
const originalFetch = globalThis.fetch;
const calls = [];
let record;
let replayState;
let capturePath;

function stamp() { return new Date().toISOString().replace(/[:.]/g, '-'); }
function outputDir(caseId) {
  const dir = path.join(root, 'runs', caseId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function live(caseId) {
  const spec = [...corpus.routes, ...corridorCorpus.routes].find((item) => item.id === caseId);
  if (!spec) throw new Error(`CASE_NOT_FOUND:${caseId}`);
  const from = { label: spec.from.label, position: spec.from.position };
  const to = { label: spec.to.label, position: spec.to.position };
  const plans = candidatePlans(from.position, to.position, SPECIAL_TERRITORY_BOUNDARIES);
  const plan = plans[0] ?? null;
  if (spec.controls && plan) throw Error('EXPLICIT_CONTROLS_CANNOT_REPLACE_SPECIAL_TERRITORY_POLICY');
  const controls = spec.controls ?? plan?.positions ?? safeRoutePositions(from, to);
  const originalPlans = spec.controls ? [{ corridor: 'explicit-audit-controls', positions: controls }] : plans.length ? plans : [{ corridor: 'ordinary', positions: controls }];
  const providers = [
    ['Valhalla', () => valhalla(from, to, 1, controls)],
    ['OSRM', () => osrmRoute(from, to, controls)],
    ['BRouter', () => brouterFast(from, to, controls)],
  ];
  const accepted = [];
  const rejected = [];
  const responses = await Promise.allSettled(providers.map(([, get]) => get()));
  for (const [index, [name]] of providers.entries()) {
    try {
      const response = responses[index];
      if (response.status !== 'fulfilled') throw response.reason;
      const route = response.value;
      const qualityError = !isUsableRoute(route, from, to) ? 'route_quality_rejected'
        : findPlanLegStretchAnomaly(route.coordinates, controls) ? 'control_leg_stretch_anomaly'
          : !followsPlan(route.coordinates, controls, plan?.corridor ?? 'mainland', Boolean(plan)) ? 'route_control_not_followed' : null;
      if (qualityError) throw new Error(qualityError);
      accepted.push({ id: name, seconds: route.seconds, tollStatus: 'unknown', route });
    } catch (error) { rejected.push({ provider: name, error: String(error) }); }
  }
  if (!accepted.length) throw new Error(`NO_ACCEPTED_PROVIDER:${JSON.stringify(rejected)}`);
  const selected = selectFastestRoute(accepted).route;
  const validation = await validateTollEdges(selected.route.coordinates);
  return {
    spec,
    capturedAt: new Date().toISOString(),
    routePlan: originalPlans.map(({ corridor, positions }) => ({ corridor, positions })),
    providers: accepted.map(({ id, route }) => ({ name: id, meters: route.meters, seconds: route.seconds })),
    rejected,
    provider: selected.id,
    route: selected.route,
    validation,
  };
}

async function replay(capture) {
  replayState = replayingFetch(capture.calls);
  globalThis.fetch = replayState.fetch;
  return capture.record;
}

const mode = process.argv[2];
const firstArg = process.argv[3];
const departureAt = process.argv[4] ?? '2026-10-15T09:00:00+03:00';
let dir;
try {
  if (mode === '--live') {
    globalThis.fetch = recordingFetch(originalFetch, calls);
    record = await live(firstArg);
    dir = outputDir(firstArg);
  } else if (mode === '--replay') {
    capturePath = firstArg;
    const capture = JSON.parse(gunzipSync(fs.readFileSync(capturePath)));
    record = await replay(capture);
    dir = path.dirname(capturePath);
  } else throw new Error('Usage: --live <case-id> | --replay <capture.json.gz> [departureAt]');

  const route = record.route;
  const result = await calculateLegTolls({
    routeGeometry: route.coordinates,
    routeSeconds: route.seconds,
    departureAt,
    selectedFastProvider: record.provider,
    selectedFastRoute: route,
    valhallaEvidence: record.provider === 'Valhalla' ? route : null,
    confirmedFreeRoute: null,
    diagnosticFastValidation: record.validation,
  });
  // Pricing can request local plaza evidence after full-route trace validation.
  // Persist only after pricing so those responses are available to offline runs.
  if (mode === '--live') {
    capturePath = path.join(dir, `${stamp()}-capture.json.gz`);
    fs.writeFileSync(capturePath, gzipSync(JSON.stringify({ schemaVersion: 2, departureAt, record, calls })));
  }
  const components = result.componentAudit.components;
  const paidRoadEdges = record.validation.paidRoadEdges ?? [];
  const passageEvidence = [];
  for (const edge of paidRoadEdges) {
    const products = paidProductsFromName((edge.roadNames ?? []).join(' · '));
    // Ambiguous junction names do not prove passage of every named road.
    if (products.length === 1) passageEvidence.push({ road: products[0], kind: 'selected-paid-edge', wayId: edge.wayId, names: edge.roadNames });
  }
  for (const booth of record.validation.tollBooths ?? []) {
    const known = M4_NODE_TO_PLAZA.has(booth.osmNodeId) ? 'm4' : nodeIdentities.nodes.find(node => node.osmNodeId === booth.osmNodeId)?.productId;
    if (known) passageEvidence.push({ road: known, kind: 'selected-trace-exact-node', osmNodeId: booth.osmNodeId });
    else {
      const products = paidProductsFromName((booth.roadNames ?? []).join(' · '));
      if (products.length === 1) passageEvidence.push({ road: products[0], kind: 'selected-booth-name', osmNodeId: booth.osmNodeId });
    }
  }
  const a289 = priceA289Route(route.coordinates, departureAt);
  if (a289.crossedFrames.length) passageEvidence.push({ road: 'a289', kind: 'selected-geometry-exact-frames', frames: a289.crossedFrames });
  const evidenceSummary = summarizePassageEvidence(passageEvidence);
  const output = {
    caseId: record.spec.id,
    region: record.spec.region,
    mode: mode === '--live' ? 'live' : 'offline-recorded-response-replay',
    departureAt,
    provider: record.provider,
    providerCandidates: record.providers,
    rejectedProviders: record.rejected,
    routeMeters: route.meters,
    routeSeconds: route.seconds,
    controls: record.routePlan,
    traceComplete: record.validation.complete,
    roadCoverage: assessRoadCoverage(record.spec.expectedRoads ?? [], passageEvidence, record.validation.complete),
    passageEvidence: evidenceSummary.evidence,
    passageEvidenceSummaryVersion: 1,
    passageEvidenceScope: 'Up to three paid-way examples per road plus every exact-node/frame proof. Full selected paid-edge ledger is retained in the SHA-linked compressed capture.',
    paidEdgeEvidenceCounts: evidenceSummary.counts,
    replayIntegrity: mode === '--live' ? null : { complete: replayState.misses.length === 0, missingResponses: replayState.misses },
    capture: capturePath,
    captureSha256: createHash('sha256').update(fs.readFileSync(capturePath)).digest('hex'),
    detectedRoadComponents: components.filter((item) => item.detected).map((item) => ({ id: item.id, amount: item.tolls?.amount ?? null, reason: item.reason ?? null })),
    paidRoadEdgeNames: [...new Set(paidRoadEdges.flatMap((edge) => edge.roadNames ?? []))],
    tollNodeIds: (record.validation.tollBooths ?? []).map((item) => item.osmNodeId),
    m4PvpPreview: result.m4PvpPreview ?? null,
    selectedM12Span: route.m12EndpointSpan ?? route.m12StrictSpan ?? null,
    a289CrossedFrames: a289.crossedFrames,
    tolls: tollsForApi(result.tolls, result.fastValidation),
    audit: result.componentAudit,
  };
  const resultPath = path.join(dir, `${mode === '--live' ? 'live' : 'replay'}-${departureAt.replace(/[:+]/g, '-')}-${stamp()}.json`);
  fs.writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`);
  if (mode === '--live') {
    const targetCorpus = corpus.routes.some(item => item.id === output.caseId) ? corpus : corridorCorpus;
    const plannedCase = targetCorpus.routes.find((item) => item.id === output.caseId);
    plannedCase.status = 'live-captured';
    plannedCase.liveEvidence = {
      result: path.relative('experiments/nationwide-tolls', resultPath),
      capture: path.relative('experiments/nationwide-tolls', capturePath),
      provider: output.provider,
      routeMeters: output.routeMeters,
      traceComplete: output.traceComplete,
    };
    fs.writeFileSync(targetCorpus === corpus ? path.join(root, 'corpus.json') : corridorPath, `${JSON.stringify(targetCorpus, null, 2)}\n`);
  }
  console.log(JSON.stringify({ caseId: output.caseId, mode: output.mode, provider: output.provider, routeMeters: output.routeMeters, traceComplete: output.traceComplete, tolls: output.tolls, detectedRoadComponents: output.detectedRoadComponents }));
  if (replayState?.misses.length) process.exitCode = 2;
} catch (error) {
  dir ??= outputDir(firstArg || 'failed');
  const failedAt = stamp();
  fs.writeFileSync(path.join(dir, `failure-${failedAt}.json.gz`), gzipSync(JSON.stringify({ mode, firstArg, departureAt, error: String(error), record: record ?? null, calls })));
  fs.writeFileSync(path.join(dir, `failure-${failedAt}.json`), `${JSON.stringify({ mode, firstArg, departureAt, error: String(error), capturedProviderCalls: calls.length })}\n`);
  console.error(String(error));
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
}
