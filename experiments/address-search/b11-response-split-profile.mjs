// Bounded saved-data experiment, NOT a public algorithm change or full replay.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { analyzeRoute } from '../../lib/special-territory-policy.ts';
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from '../../lib/special-territory-boundaries.ts';

const source = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-донецк-moscow-center/2026-10-15T22-34-03-156Z-capture.json.gz';
const bytes = fs.readFileSync(source);
const capture = JSON.parse(zlib.gunzipSync(bytes));
const call = capture.calls.find(c => new URL(c.url).pathname.startsWith('/route/v1/driving/') && c.status === 200);
assert.ok(call, 'saved OSRM body required');
const route = JSON.parse(call.text).routes[0];
const coordinates = route.geometry.coordinates;
const { from, to } = capture.record.spec;
globalThis.fetch = async () => { throw Error('network forbidden'); };
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const inputHash = hash(coordinates);
const analyze = () => analyzeRoute(coordinates, route.distance, route.duration, from.position, to.position, zones);
const expected = analyze(); // one warmup, not timed
const samples = [], baselineCalls = [], candidateCalls = [];
for (let index = 0; index < 3; index++) {
  // Alternate order to reduce systematic warmup/order bias; no speed threshold.
  const run = reuse => {
    const started = performance.now();
    const first = analyze();
    const final = reuse ? first : analyze();
    const elapsedMs = performance.now() - started;
    assert.deepEqual(first, expected); assert.deepEqual(final, expected);
    assert.equal(hash(coordinates), inputHash, 'geometry must not mutate');
    (reuse ? candidateCalls : baselineCalls).push(elapsedMs);
    return elapsedMs;
  };
  const pair = index % 2 ? { candidateMs: run(true), baselineMs: run(false) }
    : { baselineMs: run(false), candidateMs: run(true) };
  samples.push(pair);
}
const median = values => [...values].sort((a,b) => a-b)[1];
const baselineMedianMs = median(baselineCalls), candidateMedianMs = median(candidateCalls);
console.log(JSON.stringify({ schemaVersion: 1, node: process.version, source,
  sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  providerBodySha256: hash(call.text), geometrySha256: inputHash, coordinateCount: coordinates.length,
  boundaryFileSha256: crypto.createHash('sha256').update(fs.readFileSync('data/special-territory-boundaries.json')).digest('hex'),
  networkRequests: 0, samples, baselineMedianMs, candidateMedianMs,
  medianSavedMs: baselineMedianMs - candidateMedianMs,
  analysisCallsPerCandidate: { before: 2, proposed: 1 }, resultSha256: hash(expected), resultParity: 'MATCH',
  runtimeChanged: false, limitations: ['one historical geometry, not current route selection or pricing',
    'three paired samples are descriptive, not an SLA', 'proposed reuse not deployed or integrated',
    'no direct attribution of historical server elapsed time to these CPU samples'] }, null, 2));
