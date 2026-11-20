// Offline evidence integrity, directed boundary and fail-closed exceptions.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {nearestSegment, haversineKm} from '../../../lib/toll-engine/m11-moscow-geometry.ts';
import {matrixZsdCashCardComponent} from '../../../lib/v3-calculation/zsd-cash-card-component.ts';
import {hasReviewedZsdReentry} from '../../../lib/v3-calculation/zsd-reentry-policy.ts';
import {isUsableRoute} from '../../../lib/v3-calculation/route-candidate.ts';

const directory = process.argv[2];
assert.ok(directory, 'Supply the evidence directory');
const sha = b => createHash('sha256').update(b).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name)));
const readGzip = name => JSON.parse(gunzipSync(fs.readFileSync(path.join(directory, name))));
const capture = readGzip('capture.json.gz');
const route = readGzip('selected-route.json.gz');
const result = read('result.json');
const sourceCapture = JSON.parse(gunzipSync(fs.readFileSync(capture.source)));
const brouterRaw = JSON.parse(sourceCapture.calls.find(c => c.url.includes('brouter.de')).text).features[0];
// The existing route schema rejects altitude-bearing positions. Check that
// this faster recorded response is also physically inadmissible if projected
// to 2D; this diagnostic never changes runtime parsing or selection.
const projectedBrouter = {meters: Number(brouterRaw.properties['track-length']),
  seconds: Number(brouterRaw.properties['total-time']),
  coordinates: brouterRaw.geometry.coordinates.map(p => p.slice(0, 2))};
assert.equal(hasReviewedZsdReentry(projectedBrouter.coordinates), true);
assert.equal(isUsableRoute(projectedBrouter, capture.record.spec.from, capture.record.spec.to), false);
assert.deepEqual(capture.record.route, route);
assert.equal(sha(JSON.stringify(route)), result.routeSha256);
assert.equal(sha(JSON.stringify(route.coordinates)), result.geometrySha256);
assert.equal(hasReviewedZsdReentry(route.coordinates), false);
assert.equal(capture.calls.length, 6);
const responses = capture.calls.map((c, i) => {
  assert.equal(c.status, 200);
  assert.equal(c.error, undefined);
  assert.equal(c.networkAttempted, true);
  assert.deepEqual(readGzip(`requests/${String(i + 1).padStart(3, '0')}.json.gz`), c);
  const request = JSON.parse(c.body);
  assert.ok(request.shape.every(p => route.coordinates.some(q => q[0] === p.lon && q[1] === p.lat)));
  return {index: i, requestSha256: sha(c.body), responseSha256: sha(c.text),
    points: request.shape.length, edges: JSON.parse(c.text).edges.length};
});
const zoneRoot = 'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1';
const zone = JSON.parse(fs.readFileSync(`${zoneRoot}/zone1-readiness.json`));
const sourceChecks = Object.entries(zone.sourceSHA256).map(([name, expected]) => {
  const actual = sha(fs.readFileSync(`${zoneRoot}/${name}`)); assert.equal(actual, expected);
  return {path: `${zoneRoot}/${name}`, sha256: actual};
});
const ownerRoot = 'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka';
const owner = JSON.parse(fs.readFileSync(`${ownerRoot}/source-manifest.json`));
for (const doc of owner.documents.filter(d => ['owner-zones-96.pdf', 'owner-base-32-1.pdf', 'owner-rules.html'].includes(d.path))) {
  assert.equal(sha(fs.readFileSync(`${ownerRoot}/${doc.path}`)), doc.sha256);
  sourceChecks.push({path: `${ownerRoot}/${doc.path}`, sha256: doc.sha256, url: doc.url});
}
const validation = capture.record.validation;
assert.equal(validation.complete, true);
assert.equal(validation.boothEventCoverage, 'complete');
const gate = zone.gates.find(g => g.kind === 'entry-blagodatnaya');
const witnesses = [gate.before, gate.gate, gate.after].map(p => ({nodeId: p.id,
  ...nearestSegment(route.coordinates, [[p.lon, p.lat]])}));
for (let i = 0; i < witnesses.length; i++) {
  assert.ok(witnesses[i].distanceKm <= 0.025);
  if (i) assert.ok(witnesses[i - 1].index < witnesses[i].index);
  const k = Math.floor(witnesses[i].index);
  assert.ok(haversineKm(route.coordinates[k], route.coordinates[k + 1]) <= 0.5);
}
const edges = JSON.parse(capture.calls[0].text).edges;
const orderedWays = ['305638466', '375574651', '375574658', '81348980', '129780705',
  '27462214', '427378978', '427378977', '129780711', '27462227', '129780707', '400111366'];
let cursor = -1;
const orderedTrace = orderedWays.map(wayId => {
  const index = edges.findIndex((e, i) => i > cursor && String(e.way_id) === wayId);
  assert.ok(index > cursor, `Missing ordered boundary way ${wayId}`); cursor = index;
  return {wayId, edgeIndex: index, ...edges[index]};
});
assert.ok(orderedTrace.some(e => String(e.end_node?.node_id) === gate.gate.id && e.end_node?.type === 'toll_booth'));
assert.ok(orderedTrace.at(-1).names.includes('КАД'));
assert.equal(orderedTrace.at(-1).toll, false);
const ready = matrixZsdCashCardComponent(route.coordinates, validation, result.departureAt, route.seconds);
assert.deepEqual(ready, result.zsdComponent);
assert.equal(ready.tolls.amount, 300);
const negatives = [
  ['incomplete_trace', route.coordinates, {...validation, complete: false}],
  ['partial_booth_coverage', route.coordinates, {...validation, boothEventCoverage: 'partial'}],
  ['unreviewed_zsd_way', route.coordinates, {...validation,
    paidRoadEdges: [...validation.paidRoadEdges, {wayId: 'not-reviewed', roadNames: ['ЗСД']}]}],
  ['additional_zsd_plaza', route.coordinates, {...validation,
    tollBooths: [...validation.tollBooths, {osmNodeId: 'not-reviewed', roadNames: ['ЗСД'], edgeToll: true}]}],
  ['wrong_direction_geometry', [...route.coordinates].reverse(), validation],
].map(([name, geometry, v]) => {
  const r = matrixZsdCashCardComponent(geometry, v, result.departureAt, route.seconds);
  assert.equal(r.tolls, null, name); return {name, reason: r.reason, status: 'PASS'};
});
assert.equal(result.counts.pricedComponents, 4);
assert.equal(result.counts.pricedZsdComponents, 1);
assert.equal(result.counts.confirmedFullTripFares, 0);
assert.equal(result.apiTolls.amount, 5424);
assert.equal(result.apiTolls.priceConfirmation, 'unconfirmed');
const output = {caseId: result.caseId, status: 'PASS', ownGeometryProof: 'every trace request point belongs to selected OSRM geometry; strict offline replay additionally checks exact request bodies',
  otherRecordedCandidate: {provider: 'BRouter', seconds: projectedBrouter.seconds,
    originalDimensions: [3], projectionDiagnosticOnly: true, reviewedReentryAfter2DProjection: true,
    admittedAfter2DProjection: false, runtimeNormalizationChanged: false},
  directedScope: 'Благодатная → КАД-юг, далее на восток к Пулковскому шоссе',
  entry: {wayId: gate.wayId, booth: gate.gate.id, witnesses}, exit: {orderedTrace},
  primaryBasis: 'Owner order96 zone1 expressly includes Blagodatnaya entry towards KAD and KAD exit towards Pulkovo. Owner order32_1 classI zone1=300. No Avtomobilnaya↔Blagodatnaya receipt discount transplanted.',
  fareBasis: 'existing ready source-derived zone1 vector, not an independent operator OD receipt',
  responses, sourceChecks, negatives, counts: result.counts};
fs.writeFileSync(path.join(directory, 'boundary-proof.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({status: 'PASS', rawResponses: responses.length, sourceHashes: sourceChecks.length,
  directedBoundary: output.directedScope, zsdRub: ready.tolls.amount, negativeChecks: negatives.length}));
