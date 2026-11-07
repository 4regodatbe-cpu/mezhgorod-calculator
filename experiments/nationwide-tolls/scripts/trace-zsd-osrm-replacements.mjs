// Bounded five-case follow-up. Provider routing is replayed; only missing
// trace_attributes payloads may use the network, after a durable STARTED.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {osrmRoute, brouterFast} from '../../../lib/route-providers.ts';
import {isUsableRoute} from '../../../lib/v3-calculation/route-candidate.ts';
import {hasReviewedZsdReentry} from '../../../lib/v3-calculation/zsd-reentry-policy.ts';
import {validateTollEdges} from '../../../lib/toll-validator.ts';
import {calculateLegTolls} from '../../../lib/v3-calculation/route-leg-pricing.ts';
import {matrixZsdCashCardComponent} from '../../../lib/v3-calculation/zsd-cash-card-component.ts';
import {tollsForApi} from '../../../lib/v2-calculation/free-route-selection.ts';
import {requestKey, replayingFetch} from './systemic-audit-io.mjs';

const [mode, directory] = process.argv.slice(2);
assert.ok(['--live', '--resume', '--replay'].includes(mode) && directory,
  'Usage: --live <new-directory> | --resume <started-directory> | --replay <done-directory>');
const manifestPath = 'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/source-manifest.json';
const seedPath = 'experiments/nationwide-tolls/checks/2026-10-17-zsd-selected-osrm-trace/capture.json.gz';
const manifest = JSON.parse(fs.readFileSync(manifestPath));
const inputs = manifest.cases.filter(c => c.caseId !== 'pair-m11-zsd-prim-to-moscow');
assert.equal(inputs.length, 5);
const originalFetch = globalThis.fetch;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readJson = p => JSON.parse(fs.readFileSync(p));
const readGzip = p => JSON.parse(gunzipSync(fs.readFileSync(p)));
const save = (name, value) => {
  const target = path.join(directory, name);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const bytes = JSON.stringify(value, null, name.endsWith('.gz') ? 0 : 2) + '\n';
  fs.writeFileSync(`${target}.tmp`, name.endsWith('.gz') ? gzipSync(bytes, {mtime: 0}) : bytes);
  fs.renameSync(`${target}.tmp`, target);
  return {path: name, sha256: sha(fs.readFileSync(target))};
};
const sourcePaths = [manifestPath, seedPath, 'experiments/nationwide-tolls/scripts/trace-zsd-osrm-replacements.mjs',
  'lib/v3-calculation/route-candidate.ts', 'lib/v3-calculation/zsd-reentry-policy.ts',
  'lib/toll-validator.ts', 'lib/v3-calculation/route-leg-pricing.ts',
  'lib/v3-calculation/zsd-cash-card-component.ts', 'lib/v3-calculation/zsd-zone1-component.ts'];
const sourceHashes = Object.fromEntries(sourcePaths.map(p => [p, sha(fs.readFileSync(p))]));
const maxNetworkRequests = 35;
const deadline = Date.now() + 180000;
let networkRequests = 0;
let networkSerial = 0;
let terminalBlock = null;
let currentCase = null;
let currentRefs = [];
const cache = new Map();
const results = [];
const progress = () => save('progress.json', {atUtc: new Date().toISOString(),
  phase: 'IN_PROGRESS', processed: results.length, total: inputs.length,
  currentCase, completedRequestOccurrences: currentRefs.filter(r => r.response).length,
  startedRequestOccurrences: currentRefs.length, networkRequests, terminalBlock});
const responseFrom = call => {
  if (call.error) throw Error(call.error);
  const headers = {'content-type': call.contentType ?? 'application/json'};
  if (call.retryAfter != null) headers['retry-after'] = call.retryAfter;
  return new Response(call.text, {status: call.status, headers});
};
function loadResponse(ref) {
  const file = path.join(directory, ref.path);
  assert.equal(sha(fs.readFileSync(file)), ref.sha256, ref.path);
  return readGzip(file);
}
function remember(ref, call) {
  if (call.status === 200 && !call.error) cache.set(call.key, {ref, call});
}

if (mode === '--live') {
  assert.ok(!fs.existsSync(path.join(directory, 'STARTED.json')), 'Historical batch exists; use --resume or a new directory');
  assert.ok(process.env.ZSD_DURABLE_STARTED_COMMIT, 'Set the verified durable STARTED commit SHA');
  save('STARTED.json', {atUtc: new Date().toISOString(), sourceHead: '8fecbab5245fed3b7bff644eb0ccce4f2efa2c33',
    durableStartedCommit: process.env.ZSD_DURABLE_STARTED_COMMIT, sourceHashes, inputs,
    maxNetworkRequests, maxBatchNetworkBudgetMs: 180000,
    scope: 'Five changed saved ordinary OSRM routes; exact trace payload reuse only; no new routing or old Valhalla trace'});
  const seed = readGzip(seedPath);
  for (const call of seed.calls) {
    assert.equal(call.status, 200);
    assert.equal(call.key, requestKey(call.url, {method: call.method, body: call.body}));
    const ref = save(`responses/seed-${call.key}.json.gz`, {...call,
      provenance: {kind: 'previous_own_osrm_trace', source: seedPath, sourceSha256: sourceHashes[seedPath]}});
    remember(ref, call);
  }
} else {
  const started = readJson(path.join(directory, 'STARTED.json'));
  assert.deepEqual(started.sourceHashes, sourceHashes, 'Source changed; start a separate reviewed batch');
  for (const filename of fs.readdirSync(path.join(directory, 'responses')).filter(n => n.endsWith('.json.gz')).sort()) {
    const ref = {path: `responses/${filename}`, sha256: sha(fs.readFileSync(path.join(directory, 'responses', filename)))};
    const call = loadResponse(ref);
    if (filename.startsWith('network-')) {
      networkSerial = Math.max(networkSerial, Number(filename.match(/network-(\d+)/)[1]));
      if (call.networkAttempted) networkRequests++;
      if (call.error || [401, 403, 451].includes(call.status)) terminalBlock = call.error ?? `HTTP_${call.status}`;
    }
    if (call.state === 'STARTED') { terminalBlock = 'INTERRUPTED_REQUEST_WITHOUT_RESPONSE'; continue; }
    remember(ref, call);
  }
  if (mode === '--resume') assert.ok(!fs.existsSync(path.join(directory, 'summary.json')), 'Completed batch: use --replay');
}

async function boundedTraceFetch(url, init) {
  const u = new URL(String(url));
  assert.equal(u.origin + u.pathname, 'https://valhalla1.openstreetmap.de/trace_attributes');
  assert.equal(init?.method, 'POST');
  const key = requestKey(url, init);
  const occurrence = {key, response: null, cacheHit: false, networkAttemptedThisOccurrence: false};
  currentRefs.push(occurrence);
  const hit = cache.get(key);
  if (hit) {
    assert.equal(hit.call.body, init.body);
    assert.equal(hit.call.url, String(url));
    assert.equal(hit.call.method, init.method);
    occurrence.response = hit.ref;
    occurrence.cacheHit = true;
    progress();
    return responseFrom(hit.call);
  }
  const call = {key, url: String(url), method: init.method, body: init.body,
    state: 'STARTED', startedAt: new Date().toISOString(), networkAttempted: false};
  const filename = `responses/network-${String(++networkSerial).padStart(4, '0')}.json.gz`;
  save(filename, call);
  progress();
  const startedAt = Date.now();
  try {
    if (terminalBlock) throw Error(`CIRCUIT_OPEN:${terminalBlock}`);
    if (networkRequests >= maxNetworkRequests || Date.now() >= deadline) throw Error('BOUNDED_BATCH_BUDGET_EXHAUSTED');
    networkRequests++;
    call.networkAttempted = occurrence.networkAttemptedThisOccurrence = true;
    save(filename, call);
    const signal = AbortSignal.any([init.signal, AbortSignal.timeout(Math.max(1, deadline - Date.now()))].filter(Boolean));
    const response = await originalFetch(url, {...init, signal});
    Object.assign(call, {status: response.status, text: await response.clone().text(),
      contentType: response.headers.get('content-type'), retryAfter: response.headers.get('retry-after')});
    if ([401, 403, 451].includes(response.status)) terminalBlock = `HTTP_${response.status}`;
    return response;
  } catch (error) {
    call.error = String(error);
    if (call.networkAttempted) terminalBlock = call.error;
    throw error;
  } finally {
    call.state = 'DONE';
    call.elapsedMs = Date.now() - startedAt;
    occurrence.response = save(filename, call);
    remember(occurrence.response, call);
    progress();
  }
}

try {
  for (const input of inputs) {
    currentCase = input.caseId;
    currentRefs = [];
    const casePath = `cases/${input.caseId}`;
    if (mode === '--resume' && fs.existsSync(path.join(directory, casePath, 'result.json'))) {
      const done = readJson(path.join(directory, casePath, 'result.json'));
      const capture = readGzip(path.join(directory, casePath, 'capture.json.gz'));
      assert.equal(done.sourceSha256, input.sha256);
      for (const r of capture.responseRefs) loadResponse(r.response);
      results.push(done);
      continue;
    }
    const sourceBytes = fs.readFileSync(input.capture);
    assert.equal(sha(sourceBytes), input.sha256);
    const source = JSON.parse(gunzipSync(sourceBytes));
    const old = source.record;
    const providers = replayingFetch(source.calls.filter(c => !c.url.includes('trace_attributes')));
    globalThis.fetch = providers.fetch;
    const route = await osrmRoute(old.spec.from, old.spec.to, old.routePlan[0].positions);
    const brouter = await brouterFast(old.spec.from, old.spec.to, old.routePlan[0].positions);
    assert.deepEqual(providers.misses, []);
    const candidates = [{provider: 'Valhalla', route: old.route}, {provider: 'OSRM', route}, {provider: 'BRouter', route: brouter}]
      .map(c => ({provider: c.provider, admitted: isUsableRoute(c.route, old.spec.from, old.spec.to), seconds: c.route.seconds}));
    assert.equal(candidates.filter(c => c.admitted).sort((a, b) => a.seconds - b.seconds)[0]?.provider, 'OSRM');
    assert.equal(hasReviewedZsdReentry(brouter.coordinates.map(p => p.slice(0, 2))), true,
      'A projected faster BRouter must not be silently overlooked');
    const routeSha256 = sha(JSON.stringify(route));
    const geometrySha256 = sha(JSON.stringify(route.coordinates));
    let offline;
    let consumed = 0;
    let priorCapture;
    if (mode === '--replay') {
      priorCapture = readGzip(path.join(directory, casePath, 'capture.json.gz'));
      assert.equal(priorCapture.routeSha256, routeSha256);
      assert.equal(priorCapture.geometrySha256, geometrySha256);
      currentRefs = priorCapture.responseRefs;
      offline = replayingFetch(currentRefs.map(r => loadResponse(r.response)));
      globalThis.fetch = (...args) => { consumed++; return offline.fetch(...args); };
    } else {
      save(`${casePath}/STARTED.json`, {atUtc: new Date().toISOString(), input, routeSha256, geometrySha256, candidates});
      save(`${casePath}/route.json.gz`, route);
      globalThis.fetch = boundedTraceFetch;
      progress();
    }
    const validation = await validateTollEdges(route.coordinates);
    const calculated = await calculateLegTolls({routeGeometry: route.coordinates, routeSeconds: route.seconds,
      departureAt: source.departureAt, selectedFastProvider: 'OSRM', selectedFastRoute: route,
      valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: validation});
    const zsd = matrixZsdCashCardComponent(route.coordinates, validation, source.departureAt, route.seconds);
    const negativeChecks = [
      ['incomplete_trace', route.coordinates, {...validation, complete: false}],
      ['outside_zone1_way', route.coordinates, {...validation,
        paidRoadEdges: [...(validation.paidRoadEdges ?? []), {wayId: 'not-reviewed', roadNames: ['ЗСД']}]}],
      ['reversed_geometry', [...route.coordinates].reverse(), validation],
    ].map(([name, geometry, v]) => {
      const result = matrixZsdCashCardComponent(geometry, v, source.departureAt, route.seconds);
      assert.equal(result.tolls, null, name);
      return {name, reason: result.reason, status: 'PASS'};
    });
    const core = {caseId: input.caseId, sourceCapture: input.capture, sourceSha256: input.sha256,
      departureAt: source.departureAt, selectedProvider: 'OSRM', routeSha256, geometrySha256,
      routeMeters: route.meters, routeSeconds: route.seconds, candidates, projectedBrouterAlsoReentry: true,
      validation: {complete: validation.complete, boothEventCoverage: validation.boothEventCoverage,
        chunks: validation.chunkCount, checked: validation.checkedChunkCount, failed: validation.failedChunkCount},
      zsdComponent: zsd, componentAudit: calculated.componentAudit,
      apiTolls: tollsForApi(calculated.tolls, calculated.fastValidation),
      priceConfirmation: calculated.tolls.priceConfirmation, negativeChecks,
      pricedComponents: calculated.componentAudit.components.filter(c => c.detected && c.tolls).length,
      pricedZsdComponents: zsd.tolls ? 1 : 0,
      confirmedFullTripFares: calculated.tolls.priceConfirmation === 'confirmed' ? 1 : 0};
    if (mode === '--replay') {
      assert.deepEqual(offline.misses, []);
      assert.equal(consumed, currentRefs.length, 'Unused recorded response');
      assert.deepEqual(core, readJson(path.join(directory, casePath, 'result.json')).core);
      results.push({core});
    } else {
      const output = {core, outcome: zsd.tolls ? 'fixed_and_verified' : 'blocked_by_missing_reliable_data',
        traceRequestOccurrences: currentRefs.length,
        networkRequestsThisCase: currentRefs.filter(r => r.networkAttemptedThisOccurrence).length,
        reusedResponseOccurrences: currentRefs.filter(r => r.cacheHit).length};
      save(`${casePath}/capture.json.gz`, {input, departureAt: source.departureAt, routeSha256, geometrySha256,
        responseRefs: currentRefs, validation, calculated});
      save(`${casePath}/result.json`, output);
      results.push(output);
      progress();
    }
  }
  const counts = {checkedCases: results.length, pricedComponents: results.reduce((n, r) => n + r.core.pricedComponents, 0),
    pricedZsdComponents: results.reduce((n, r) => n + r.core.pricedZsdComponents, 0),
    confirmedFullTripFares: results.reduce((n, r) => n + r.core.confirmedFullTripFares, 0),
    completeOwnTraces: results.filter(r => r.core.validation.complete).length, newRoutingRequests: 0};
  if (mode !== '--replay') {
    const usedRefs = results.flatMap(r => readGzip(path.join(directory, `cases/${r.core.caseId}/capture.json.gz`)).responseRefs);
    const uniqueUsed = [...new Set(usedRefs.map(r => r.response.path))];
    save('summary.json', {sourceHashes, counts, newTraceNetworkRequests: networkRequests,
      traceRequestOccurrences: usedRefs.length, reusedResponseOccurrences: usedRefs.filter(r => r.cacheHit).length,
      distinctUsedRawResponses: uniqueUsed.length,
      distinctPriorSeedResponsesUsed: uniqueUsed.filter(p => p.includes('/seed-')).length,
      terminalBlock, cases: results.map(r => ({caseId: r.core.caseId, zsdRub: r.core.zsdComponent.tolls?.amount ?? null,
        calculatedTripRub: r.core.apiTolls.amount, priceConfirmation: r.core.priceConfirmation,
        missing: r.core.componentAudit.missing})),
      historicalBaselineRecomputed: false, priorRepresentativeNotRepriced: true});
    save('progress.json', {phase: 'DONE', atUtc: new Date().toISOString(), counts, networkRequests, terminalBlock});
  }
  console.log(JSON.stringify({mode, counts, newLiveRequestsThisExecution: mode === '--replay' ? 0 : networkRequests,
    strictReplay: mode === '--replay' ? 'PASS five exact results, zero misses/unused responses' : 'not_run'}));
} catch (error) {
  if (mode !== '--replay') save('FAILED.json', {atUtc: new Date().toISOString(), currentCase, error: String(error),
    completedCases: results.map(r => r.core.caseId), responseRefs: currentRefs});
  throw error;
} finally {
  globalThis.fetch = originalFetch;
}
