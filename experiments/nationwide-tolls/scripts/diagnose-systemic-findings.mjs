import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { a289Endpoint } from '../../../lib/v3-calculation/a289-short-route.ts';
import { priceA289Route } from '../../../lib/toll-engine/a289-engine.ts';
import { M4_NODE_TO_PLAZA } from '../../../lib/toll-engine/m4-plaza-nodes.ts';
import { nearestSegment, crossingAt, haversineKm } from '../../../lib/toll-engine/m11-moscow-geometry.ts';
import { CKAD_EAST_ARC_ANCHORS, resolveCkadEastArcEvidence } from '../../../lib/toll-engine/ckad-evidence.ts';
import { stableTariffWindow } from '../engine/tariff-window.mjs';
import { m4TariffPeriodAt } from '../../toll-od-matrix/m4-fare-calendar-2026.mjs';
import { paidProductsFromName } from '../../../lib/v3-calculation/unpriced-road-coverage.ts';

const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const report = JSON.parse(fs.readFileSync(path.join(root, 'REPORT.json')));
const rows = [];
const unmapped = new Map();
const identities = JSON.parse(fs.readFileSync('experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/identity-sources/node-identities.json'));
const interesting = new Set(report.findings.filter(row => ['m4_crossing_profile_changes', 'a289:unpriced', 'm4:unpriced'].includes(row.code)).flatMap(row => row.cases));
// This diagnostic is purely geometric; it must never perform new provider calls.
globalThis.fetch = async () => { throw Error('DIAGNOSTIC_NETWORK_FORBIDDEN'); };
for (const output of report.results) {
  const live = JSON.parse(fs.readFileSync(output.live));
  const bytes = fs.readFileSync(live.capture);
  const capture = JSON.parse(gunzipSync(bytes));
  const { record } = capture;
  const route = record.route;
  for (const booth of record.validation.tollBooths ?? []) {
    const id = booth.osmNodeId;
    if (!id || M4_NODE_TO_PLAZA.has(id) || identities.nodes.some(node => node.osmNodeId === id) || paidProductsFromName((booth.roadNames ?? []).join(' · ')).length) continue;
    if (!unmapped.has(id)) unmapped.set(id, { osmNodeId: id, ways: new Set(), names: new Set(), cases: new Set(), captures: new Set() });
    const ledger = unmapped.get(id);
    if (booth.wayId) ledger.ways.add(booth.wayId);
    for (const name of booth.roadNames ?? []) ledger.names.add(name);
    ledger.cases.add(output.caseId);
    ledger.captures.add(live.capture);
  }
  if (!interesting.has(output.caseId)) continue;
  const plazas = [];
  for (const booth of record.validation.tollBooths ?? []) {
    const plaza = M4_NODE_TO_PLAZA.get(booth.osmNodeId);
    if (!plaza || plazas.some(item => item.km === plaza.km)) continue;
    const anchors = plaza.anchors.map(anchor => [anchor.lon, anchor.lat]);
    const nearest = nearestSegment(route.coordinates, anchors);
    plazas.push({ km: plaza.km, nodeId: booth.osmNodeId, routeIndex: nearest.index,
      approximatePassageAt: crossingAt(new Date(live.departureAt), route.coordinates, nearest.index, route.seconds).toISOString() });
  }
  const frames = priceA289Route(route.coordinates, live.departureAt).crossedFrames;
  rows.push({ caseId: live.caseId, live: output.live, captureSha256: createHash('sha256').update(bytes).digest('hex'),
    from: record.spec.from, to: record.spec.to, provider: record.provider,
    wholeRouteWindow: { departureAt: live.departureAt, arrivalAt: new Date(new Date(live.departureAt).getTime() + route.seconds * 1000).toISOString(), resolved: stableTariffWindow(live.departureAt, route.seconds, m4TariffPeriodAt) },
    m4SelectedTracePlazas: plazas.sort((a, b) => a.routeIndex - b.routeIndex),
    a289: { frames, originClass: a289Endpoint(route.coordinates[0]), destinationClass: a289Endpoint(route.coordinates.at(-1)),
      hasEasternM4Proof: plazas.length > 0,
      limitation: 'a289ShortRoute can supply Maryanskaya from M4 proof only when the other trip endpoint already maps to an A289 local endpoint. Two distant trip endpoints remain unresolved even when every A289 frame is crossed.' },
  });
}
const chainDir = 'experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/krasnodar-spb-ckad-2026-10-15T10-03-48-754Z';
const chain = JSON.parse(gunzipSync(fs.readFileSync(path.join(chainDir, 'capture.json.gz'))));
const route = chain.route.coordinates;
const matches = CKAD_EAST_ARC_ANCHORS.map(anchor => ({ anchor, ...nearestSegment(route, [anchor]) }));
let measuredKm = 0;
const low = Math.ceil(Math.min(matches[0].index, matches.at(-1).index));
const high = Math.floor(Math.max(matches[0].index, matches.at(-1).index));
for (let index = low + 1; index <= high; index++) measuredKm += haversineKm(route[index - 1], route[index]);
const drilldown = { generatedAt: new Date().toISOString(), scope: 'No product/tariff mutation. Passage times are distance-proportional diagnostic estimates, not exact provider timestamps or operator billing events. Partial/missing identities cannot prove an entire road is free.',
  rows, unmappedPaymentNodes: [...unmapped.values()].map(row => ({ ...row, ways: [...row.ways], names: [...row.names], cases: [...row.cases], captures: [...row.captures] })),
  ckadControl: { capture: path.join(chainDir, 'capture.json.gz'), resolution: resolveCkadEastArcEvidence(route, chain.route.m11RoadEvidence), approximateArcKm: measuredKm, configuredRangeKm: [135, 230], anchorMatches: matches,
    limitation: 'Do not widen the guard before checking exact physical route and whether these audit controls force a detour.' } };
fs.writeFileSync(path.join(root, 'FINDING_DRILLDOWN.json'), `${JSON.stringify(drilldown, null, 2)}\n`);
console.log(JSON.stringify({ geometricDiagnostics: rows.length, unmappedPaymentNodes: unmapped.size, ckadArcKm: measuredKm, ckadResolution: drilldown.ckadControl.resolution }));
