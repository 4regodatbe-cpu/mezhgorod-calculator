// Independent saved-artifact checks; no fetch and no pricing replay.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {requestKey} from './systemic-audit-io.mjs';
import {nearestSegment, haversineKm} from '../../../lib/toll-engine/m11-moscow-geometry.ts';

const directory = process.argv[2];
assert.ok(directory, 'Supply the five-case directory');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name)));
const readGzip = name => JSON.parse(gunzipSync(fs.readFileSync(path.join(directory, name))));
const summary = read('summary.json');
for (const [p, hash] of Object.entries(summary.sourceHashes)) assert.equal(sha(fs.readFileSync(p)), hash, p);
const zoneRoot = 'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1';
const zone = JSON.parse(fs.readFileSync(`${zoneRoot}/zone1-readiness.json`));
const reviewedWays = new Set(zone.ways.map(w => w.id));
const gate = zone.gates.find(g => g.kind === 'entry-blagodatnaya');
const sourceChecks = Object.entries(zone.sourceSHA256).map(([p, hash]) => {
  assert.equal(sha(fs.readFileSync(`${zoneRoot}/${p}`)), hash);
  return {path: `${zoneRoot}/${p}`, sha256: hash};
});
const ownerRoot = 'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka';
const owner = JSON.parse(fs.readFileSync(`${ownerRoot}/source-manifest.json`));
for (const d of owner.documents.filter(d => ['owner-zones-96.pdf', 'owner-base-32-1.pdf', 'owner-rules.html'].includes(d.path))) {
  assert.equal(sha(fs.readFileSync(`${ownerRoot}/${d.path}`)), d.sha256);
  sourceChecks.push({path: `${ownerRoot}/${d.path}`, sha256: d.sha256});
}
const checkedCases = [];
const used = new Map();
let mainTraceOccurrences = 0;
let auxiliaryOccurrences = 0;
for (const row of summary.cases) {
  const base = `cases/${row.caseId}`;
  const capture = readGzip(`${base}/capture.json.gz`);
  const {core} = read(`${base}/result.json`);
  const route = readGzip(`${base}/route.json.gz`);
  assert.equal(sha(fs.readFileSync(capture.input.capture)), capture.input.sha256);
  assert.equal(sha(JSON.stringify(route)), core.routeSha256);
  assert.equal(sha(JSON.stringify(route.coordinates)), core.geometrySha256);
  const old = JSON.parse(gunzipSync(fs.readFileSync(capture.input.capture)));
  const rawRoute = JSON.parse(old.calls.find(c => c.url.includes('router.project-osrm.org')).text).routes[0];
  assert.deepEqual(route.coordinates, rawRoute.geometry.coordinates);
  assert.equal(route.meters, Math.round(rawRoute.distance));
  assert.equal(route.seconds, Math.round(rawRoute.duration));
  const points = new Set(route.coordinates.map(p => JSON.stringify(p)));
  let ownFullTraceCount = 0;
  let auxiliaryCount = 0;
  for (const [index, occurrence] of capture.responseRefs.entries()) {
    const ref = occurrence.response;
    assert.equal(sha(fs.readFileSync(path.join(directory, ref.path))), ref.sha256);
    const call = readGzip(ref.path);
    assert.equal(call.status, 200);
    assert.equal(call.error, undefined);
    assert.equal(call.key, occurrence.key);
    assert.equal(call.key, requestKey(call.url, {method: call.method, body: call.body}));
    const body = JSON.parse(call.body);
    assert.ok(body.shape.every(p => points.has(JSON.stringify([p.lon, p.lat]))), 'Trace points must belong to this selected route');
    if (index < capture.validation.chunkCount) ownFullTraceCount++; else auxiliaryCount++;
    used.set(ref.path, {key: call.key, path: ref.path, sha256: ref.sha256,
      requestSha256: sha(call.body), responseSha256: sha(call.text),
      priorSeed: ref.path.includes('/seed-'), points: body.shape.length});
  }
  assert.equal(ownFullTraceCount, capture.validation.chunkCount);
  assert.equal(capture.validation.complete, true);
  assert.equal(capture.validation.boothEventCoverage, 'complete');
  const namedEdges = capture.validation.paidRoadEdges.filter(e => (e.roadNames ?? []).includes('ЗСД'));
  assert.ok(namedEdges.length > 0);
  assert.ok(namedEdges.every(e => reviewedWays.has(e.wayId)));
  const zsdBooths = capture.validation.tollBooths.filter(b => zone.boothNodeIds.includes(b.osmNodeId));
  assert.equal(zsdBooths.length, 1);
  assert.equal(zsdBooths[0].osmNodeId, gate.gate.id);
  assert.equal(zsdBooths[0].wayId, gate.wayId);
  const witnesses = [gate.before, gate.gate, gate.after].map(p => nearestSegment(route.coordinates, [[p.lon, p.lat]]));
  for (let i = 0; i < witnesses.length; i++) {
    assert.ok(witnesses[i].distanceKm <= 0.025);
    if (i) assert.ok(witnesses[i - 1].index < witnesses[i].index);
    const k = Math.floor(witnesses[i].index);
    assert.ok(haversineKm(route.coordinates[k], route.coordinates[k + 1]) <= 0.5);
  }
  const firstCall = readGzip(capture.responseRefs[0].response.path);
  assert.ok(capture.responseRefs[0].response.path.includes('/seed-'), 'ZSD boundary uses the exact previously proved own-OSRM payload');
  const edges = JSON.parse(firstCall.text).edges;
  let cursor = -1;
  for (const wayId of ['375574651', '81348980', '129780705', '27462214', '427378978', '427378977', '129780711', '27462227', '129780707', '400111366']) {
    const next = edges.findIndex((e, i) => i > cursor && String(e.way_id) === wayId);
    assert.ok(next > cursor); cursor = next;
  }
  assert.ok(edges[cursor].names.includes('КАД'));
  assert.equal(core.zsdComponent.tolls.amount, 300);
  assert.ok(core.negativeChecks.length === 3 && core.negativeChecks.every(c => c.status === 'PASS'));
  if (core.componentAudit.missing.length) {
    assert.equal(core.apiTolls.amount, null, 'A known ZSD/subtotal must not become a full trip price');
    assert.equal(core.apiTolls.pricingStatus, 'unknown');
  }
  assert.equal(core.priceConfirmation, 'unconfirmed');
  checkedCases.push({caseId: row.caseId, ownFullTraceCount, auxiliaryCount, directedScope: 'Благодатная → КАД-юг к Пулковскому',
    namedZsdWayIds: [...new Set(namedEdges.map(e => e.wayId))].sort(), witnesses, negativeChecks: 3,
    calculatedComponents: core.pricedComponents, zsdRub: 300,
    knownSubtotalRub: core.componentAudit.components.reduce((n, c) => n + (c.detected && c.tolls ? c.tolls.amount : 0), 0),
    calculatedTripRub: core.apiTolls.amount, missing: core.componentAudit.missing,
    missingReasons: core.componentAudit.components.filter(c => core.componentAudit.missing.includes(c.id)).map(c => ({id: c.id, reason: c.reason})),
    confirmedFullTripFares: 0});
  mainTraceOccurrences += ownFullTraceCount;
  auxiliaryOccurrences += auxiliaryCount;
}
assert.equal(checkedCases.length, 5);
assert.equal(mainTraceOccurrences, 41);
assert.equal(auxiliaryOccurrences, 2);
assert.equal(used.size, 20);
assert.equal(summary.newTraceNetworkRequests, 16);
const output = {status: 'PASS', checkedCases, sourceChecks,
  distinctUsedResponses: [...used.values()], mainTraceOccurrences, auxiliaryOccurrences,
  localM4Explanation: 'Two pricing invocations use one identical own-route local M4 trace, archived once and reused exactly.',
  counts: summary.counts, negativeChecks: 15, fullTripPriceRemainsUnknownCases: checkedCases.filter(c => c.missing.length).length,
  pricedButUnconfirmedTripCases: checkedCases.filter(c => c.calculatedTripRub !== null).length};
fs.writeFileSync(path.join(directory, 'integrity.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({status: 'PASS', cases: 5, sourceHashes: sourceChecks.length,
  distinctUsedResponses: used.size, mainTraceOccurrences, auxiliaryOccurrences, negativeChecks: 15,
  unknownFullTrips: output.fullTripPriceRemainsUnknownCases, confirmedFullTripFares: 0}));
