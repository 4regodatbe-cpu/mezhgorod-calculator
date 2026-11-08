// Bounded saved-artifact review of two changed routes. No fetch, quote replay,
// tariff mutation, projection-radius change or promotion of candidate pairs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolveM12ProductBoundaries} from '../../../lib/v3-calculation/m12-product-boundaries.ts';
import {m12PairFromBoundary} from '../engine/m12-route-adapter.mjs';
import {projectM12Evidence} from '../../../lib/toll-engine/m12-route-projection.ts';
import {resolveCkadProductBoundaries} from '../../../lib/v3-calculation/ckad-product-boundaries.ts';
import {CKAD_EAST_ARC_ANCHORS} from '../../../lib/toll-engine/ckad-evidence.ts';
import {nearestSegment} from '../../../lib/toll-engine/m11-moscow-geometry.ts';
import {requestKey} from './systemic-audit-io.mjs';

const output = process.argv[2];
assert.ok(output, 'Supply a new review directory');
fs.mkdirSync(path.join(output, 'cases'), {recursive: true});
const root = 'experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five';
const sourceCommit = '54f4cccccd0d4b70ae34f063ac4db351b013acba';
const ids = ['max-chain-m12-ckad-m11-zsd-prim-to-arzamas', 'max-chain-m12-ckad-m11-zsd-prim-to-cheboksary'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const gz = p => JSON.parse(gunzipSync(fs.readFileSync(p)));
const write = (p, value) => fs.writeFileSync(path.join(output, p), JSON.stringify(value, null, 2) + '\n');
const manifest = new Map();
const record = p => {const sha256 = hash(fs.readFileSync(p)); manifest.set(p, sha256); return sha256;};
const sourceSummary = read(`${root}/summary.json`);
const historicalSourceCommit = '5281fa019eda95128035be5a0a1d2d1d95f34425';
const historicalCodeChanges = [];
for (const [p, sha256] of Object.entries(sourceSummary.sourceHashes)) {
  const currentSha256 = record(p);
  if (currentSha256 === sha256) continue;
  // The later, already saved Torzhok fix passes own validation to M11. Check
  // the frozen original bytes in Git, retain both versions, never rewrite raw.
  assert.equal(p, 'lib/v3-calculation/route-leg-pricing.ts');
  assert.equal(hash(execFileSync('git', ['show', `${historicalSourceCommit}:${p}`])), sha256);
  historicalCodeChanges.push({path: p, originalSha256: sha256, currentSha256, historicalSourceCommit,
    reason: 'Saved Torzhok change; this review does not run historical pricing or claim parity.'});
}
const registryPath = 'experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json';
const registry = read(registryPath); record(registryPath);
const ckadSourcePath = 'experiments/nationwide-tolls/source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json';
const m12SourcePath = 'experiments/nationwide-tolls/source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json';
const sourceData = [ckadSourcePath, m12SourcePath].map(p => {record(p); return read(p);});
for (const source of sourceData) {
  const pdf = `experiments/nationwide-tolls/${source.sourceFile}`;
  assert.equal(record(pdf), source.sourceSha256, pdf);
}
for (const p of ['data/tolls/m12-rvp-evidence-2026-09-30.json', 'data/tolls/m12-2026-03-02-category1.json',
  'lib/v3-calculation/m12-product-boundaries.ts', 'lib/v3-calculation/ckad-product-boundaries.ts',
  'lib/toll-engine/m12-route-evidence.ts', 'lib/toll-engine/m12-route-projection.ts', 'lib/toll-engine/ckad-evidence.ts',
  'experiments/nationwide-tolls/engine/m12-route-adapter.mjs']) record(p);
const markers = read('data/tolls/m12-rvp-evidence-2026-09-30.json');
assert.ok(!markers.anchors.some(a => [81, 118, 174].includes(a.rvpKm)));
const candidateFixturePath = 'data/fixtures/m12-osm-5a2-limited.json';
const candidateFixture = read(candidateFixturePath); record(candidateFixturePath);
const westernCandidates = ['10782165529', '11214930528', '11157985901'].map(id => {
  const c = candidateFixture.candidates.find(c => String(c.id) === id);
  assert.ok(c && c.kind === 'gantry' && c.platon === false);
  return {nodeId: id, coordinate: [c.lon, c.lat], operatorMarkerBindingProven: false};
});
const cases = [], common = [], responsePaths = new Set();
let occurrences = 0;
write('progress.json', {status: 'IN_PROGRESS', sourceCommit, completedCases: []});
for (const id of ids) {
  const p = `${root}/cases/${id}`;
  const route = gz(`${p}/route.json.gz`), capture = gz(`${p}/capture.json.gz`), {core} = read(`${p}/result.json`);
  for (const name of ['route.json.gz', 'capture.json.gz', 'result.json']) record(`${p}/${name}`);
  assert.equal(record(capture.input.capture), capture.input.sha256);
  assert.equal(hash(JSON.stringify(route)), core.routeSha256);
  assert.equal(hash(JSON.stringify(route.coordinates)), core.geometrySha256);
  assert.equal(capture.validation.complete, true);
  assert.equal(capture.validation.boothEventCoverage, 'complete');
  assert.equal(capture.validation.checkedChunkCount, capture.validation.chunkCount);
  assert.equal(capture.responseRefs.length, capture.validation.chunkCount);
  const old = gz(capture.input.capture);
  const rawRoute = JSON.parse(old.calls.find(c => c.url.includes('router.project-osrm.org')).text).routes[0];
  assert.deepEqual(route.coordinates, rawRoute.geometry.coordinates);
  const steps = rawRoute.legs.flatMap(l => l.steps);
  const corridorSteps = steps.slice(32, 36);
  assert.deepEqual(corridorSteps.map(s => s.ref ?? null), ['А-113', 'А-113', null, null]);
  assert.equal(steps[36].ref, 'М-12');
  const corridor = corridorSteps.map(s => s.geometry.coordinates);
  common.push(corridor);
  const points = new Set(route.coordinates.map(p => JSON.stringify(p)));
  const gantries = [], traceTransitions = [];
  for (const [chunk, occurrence] of capture.responseRefs.entries()) {
    const file = `${root}/${occurrence.response.path}`;
    assert.equal(record(file), occurrence.response.sha256);
    const call = gz(file); assert.equal(call.status, 200); assert.equal(call.error, undefined);
    assert.equal(call.key, occurrence.key); assert.equal(call.key, requestKey(call.url, {method: call.method, body: call.body}));
    assert.ok(JSON.parse(call.body).shape.every(p => points.has(JSON.stringify([p.lon, p.lat]))));
    responsePaths.add(file); occurrences++;
    const edges = JSON.parse(call.text).edges;
    const compact = e => ({wayId: String(e.way_id), toll: e.toll, names: e.names ?? [], endNodeId: String(e.end_node?.node_id)});
    for (const [index, edge] of edges.entries()) {
      if (edge.end_node?.type === 'toll_gantry' && (edge.names ?? []).some(n => ['М-12', 'А-113'].includes(n))) {
        gantries.push({chunk, edgeIndex: index, ...compact(edge)});
      }
      for (const road of ['А-113', 'М-12']) {
        if (!(edge.names ?? []).includes(road)) continue;
        const previous = edges[index - 1], next = edges[index + 1];
        if ((previous && !(previous.names ?? []).includes(road)) || (next && !(next.names ?? []).includes(road))) {
          traceTransitions.push({chunk, edgeIndex: index, road, edges: edges.slice(Math.max(0, index - 2), index + 3).map(compact)});
        }
      }
    }
  }
  const m12 = resolveM12ProductBoundaries(route.coordinates, route.m12EndpointSpan);
  assert.equal(m12PairFromBoundary(m12.boundary), null);
  const ckad = resolveCkadProductBoundaries(route.coordinates, route.m11RoadEvidence);
  assert.equal(ckad.exact, false); assert.equal(ckad.reason, 'ckad_east_arc_not_proven');
  const m12Step = steps[36], exitStep = steps[37], nextStep = steps[38];
  const newPairIsNotEstablished = {physicalEntryPrimaryBinding: false, physicalExitPrimaryBinding: false,
    independentOperatorOdReceipt: false, candidateAmountApplied: false};
  const westernGantryCandidates = westernCandidates.map(c => ({...c, ownGeometry: nearestSegment(route.coordinates, [c.coordinate])}));
  for (const [i, c] of westernGantryCandidates.entries()) {
    assert.ok(c.ownGeometry.distanceKm <= 0.025);
    if (i) assert.ok(c.ownGeometry.index > westernGantryCandidates[i - 1].ownGeometry.index);
    assert.ok(gantries.some(g => g.endNodeId === c.nodeId && g.names.includes('М-12') && g.toll === true));
  }
  const entry = {coordinate: m12Step.geometry.coordinates[0], stepIndex: 36, mergeFrom: corridorSteps[3].geometry.coordinates.at(-1)};
  const exit = {coordinate: m12Step.geometry.coordinates.at(-1), stepIndex: 37, exitManeuver: exitStep.maneuver.type,
    followingRoadRef: nextStep.ref, followingCoordinate: nextStep.geometry.coordinates[0]};
  if (id.endsWith('arzamas')) {
    assert.deepEqual(m12.directMarkers, [184, 281, 314, 392, 420]);
    assert.equal(m12.boundary.reason, 'Entry boundary does not exclude the previous official RVP');
    assert.equal(exit.followingRoadRef, '22Н-0239');
  } else {
    assert.deepEqual(m12.directMarkers, []); assert.equal(exit.followingRoadRef, 'М-7');
    assert.ok(projectM12Evidence(route.coordinates).find(p => p.rvpKm === 184).nearestDistanceKm > markers.directCrossingRadiusKm);
  }
  assert.equal(core.apiTolls.amount, null);
  const existingSubtotalRub = core.componentAudit.components.reduce((sum, c) => sum + (c.detected && c.tolls ? c.tolls.amount : 0), 0);
  assert.equal(existingSubtotalRub, 4494);
  const result = {caseId: id, reviewStatus: 'DONE', causeReviewStatus: 'blocked_missing_reliable_boundary_data',
    sourceRouteSha256: core.routeSha256, sourceGeometrySha256: core.geometrySha256, ownFullTraceChunksChecked: capture.validation.chunkCount,
    departureAt: core.departureAt, provider: 'OSRM', ckadCorridorSha256: hash(JSON.stringify(corridor)),
    ckadProviderEvidence: {entryFromM11: corridorSteps[0].geometry.coordinates[0], mainlineBegin: corridorSteps[1].geometry.coordinates[0],
      mainlineEnd: corridorSteps[1].geometry.coordinates.at(-1), ownMainlineMeters: corridorSteps[1].distance,
      m12Merge: entry.coordinate, runtime: ckad,
      fullM4ArcAnchorDistancesKm: CKAD_EAST_ARC_ANCHORS.map(coordinate => ({coordinate, ...nearestSegment(route.coordinates, [coordinate])}))},
    m12ProviderEvidence: {entry, exit, selectedSpan: route.m12EndpointSpan, runtime: m12,
      calibratedProjectionEvidence: projectM12Evidence(route.coordinates).filter(p => p.nearestDistanceKm < 0.5), westernGantryCandidates},
    gantries, traceTransitions, newPairIsNotEstablished, existingPricedComponents: core.pricedComponents,
    existingSubtotalRub, fullTripRub: null, newlyPricedComponents: 0, confirmedFullTripFares: 0};
  cases.push(result); write(`cases/${id}.json`, result);
  write('progress.json', {status: 'IN_PROGRESS', sourceCommit, completedCases: cases.map(c => c.caseId)});
}
assert.deepEqual(common[0], common[1], 'All own CKAD and connecting ramp geometry must match, not just a road name');
assert.notDeepEqual(cases[0].m12ProviderEvidence.exit, cases[1].m12ProviderEvidence.exit);
const candidateLookup = (road, from, to) => {
  const rows = registry.selected.filter(r => r.road === road && r.from === from && r.to === to && r.profile === 'allDays');
  assert.equal(rows.length, 1);
  const r = rows[0]; return {road, from, to, rub: r.rub, effectiveFrom: r.effectiveFrom, source: r.source,
    requiresTariffContext: r.requiresTariffContext === true, bindingProven: false, appliedToCase: false};
};
const summary = {status: 'DONE', sourceCommit, unit: 'bounded common-scope and exception review',
  historicalCodeChanges,
  causeReviewStatus: 'blocked_missing_reliable_boundary_data', cases: cases.map(c => ({caseId: c.caseId, evidence: `cases/${c.caseId}.json`,
    ownFullTraceChunksChecked: c.ownFullTraceChunksChecked, existingSubtotalRub: c.existingSubtotalRub, fullTripRub: null})),
  commonCkadCorridor: {exactOwnGeometryEqual: true, sha256: cases[0].ckadCorridorSha256,
    providerScope: 'М-11 → А-113 eastbound → М-12 eastbound; not the full М-11→М-4 arc',
    existingAdapterSupportsOnly: 'М-11↔М-4 full east arc'},
  m12MaterialException: 'Arzamas leaves to22Н-0239 after the420 witness; Cheboksary leaves toМ-7 before the184 witness. Destination city is not the M12 tariff exit.',
  unboundCandidateRows: [candidateLookup('ckad', 'М-11 Нева', 'М-12 Восток'), candidateLookup('m12', 'ckad', 'arzamas_p158'), candidateLookup('m12', 'ckad', 'vladimir')],
  tariffContext: {primaryFootnote: sourceData[0].paymentContextFootnote,
    northOfM12PairUsesConditionalM12NosovSection: false,
    rationale: 'The candidate М-11→М-12 pair is on the М7/М10 side; source policy excludes it from the16 conditional cells. This fact does not establish its physical binding.'},
  blockers: [
    {id: 'ckad_partial_physical_pair', needed: 'Primary directed entry/exit/connector binding for selected М-11→М-12 subset and a complete-scope adapter. Full М4 arc cannot be shortened by weakening anchors.',
      exactWayIds: ['1148492112', '1148492111', '1189855267', '916593974', '916593983', '916593976', '1189855268']},
    {id: 'm12_western_outer_boundaries', needed: 'Primary physical-to-operator binding of CKAD entry, western gantries and both distinct exits; calibrated81/118/174 are absent. Exact first/last charged intervals must be proved before choosing direct cells.',
      coordinatesAlreadySavedInLimitedFixture: true, missingIsOperatorMarkerBindingNotCoordinates: true,
      sourceTraceGantryNodeIds: ['10782165529', '11214930528', '11157985901'],
      distinctExitWayIds: ['1550135076', '1550561305', '1206479738', '972809728', '972809720', '292501171']}
  ],
  counts: {reviewedCases: 2, representativeReviews: 1, siblingExceptionChecks: 1, verifiedTraceOccurrences: occurrences,
    distinctRawResponses: responsePaths.size, newRoutingRequests: 0, newTraceRequests: 0, newPrimaryRequests: 0,
    fullPricingReplays: 0, newlyPricedComponents: 0, newlyCalculatedFullTrips: 0, confirmedFullTripFares: 0},
  nextAction: 'One bounded primary binding pass for the common CKAD М11→М12 segment using exact saved transition IDs; then add the narrow adapter only if proved. Investigate M12 western-entry and differing exit binding separately, without new routing or74/76/309 replay.'};
record('experiments/nationwide-tolls/scripts/review-selected-osrm-m12-ckad-scope.mjs');
write('summary.json', summary); write('source-hashes.json', Object.fromEntries([...manifest].sort(([a], [b]) => a.localeCompare(b))));
write('progress.json', {status: 'DONE', sourceCommit, completedCases: cases.map(c => c.caseId), counts: summary.counts});
console.log(JSON.stringify({status: summary.status, outcome: summary.causeReviewStatus, ...summary.counts,
  hashedFiles: manifest.size, commonCorridorSha256: summary.commonCkadCorridor.sha256}));
