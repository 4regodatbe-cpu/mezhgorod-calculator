import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { analyzeRoute } from '../../lib/special-territory-policy.ts';
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from '../../lib/special-territory-boundaries.ts';
import { calculateRoutePricing } from '../../lib/route-pricing-integration.ts';
const evidence = JSON.parse(fs.readFileSync(new URL('./b11-response-split-profile.json', import.meta.url)));
const source = fs.readFileSync(evidence.source);
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
assert.equal(sha(source), evidence.sourceSha256);
const capture = JSON.parse(zlib.gunzipSync(source));
const response = capture.calls.find(c => new URL(c.url).pathname.startsWith('/route/v1/driving/') && c.status === 200);
const route = JSON.parse(response.text).routes[0];
const { from, to } = capture.record.spec;
globalThis.fetch = async () => { throw Error('network forbidden'); };
const analyze = () => analyzeRoute(route.geometry.coordinates, route.distance, route.duration, from.position, to.position, zones);
const first = analyze(), repeated = analyze();
test('saved geometry and zone versions reproduce exactly equal reused/recomputed split', () => {
  assert.equal(sha(JSON.stringify(route.geometry.coordinates)), evidence.geometrySha256);
  assert.equal(sha(fs.readFileSync('data/special-territory-boundaries.json')), evidence.boundaryFileSha256);
  assert.deepEqual(first, repeated);
  assert.equal(sha(JSON.stringify(first)), evidence.resultSha256);
});
test('both pricing modes/all vehicles preserve every fare field with exact split reuse', () => {
  for (const vehicle of ['standard','comfort','comfort_plus','minivan']) for (const mode of ['standard','dual']) {
    const fare = split => calculateRoutePricing({ from: from.label, to: to.label, vehicle, mode,
      legs: [{ from: from.label, to: to.label, distanceKm: route.distance / 1000, territorySplit: split }] });
    assert.deepEqual(fare(first), fare(repeated));
  }
});
test('proposal keeps ordinary-path analysis and never changes provider/tariff selection', () => {
  const patch = fs.readFileSync(new URL('./b11-reuse-territory-split.patch', import.meta.url), 'utf8');
  assert.match(patch, /verifiedSplit \?\? analyzeRoute/);
  assert.match(patch, /attachPricing\(option.fast,option.split\)/);
  assert.equal(patch.split('\n').filter(line=>line.startsWith('+')&&!line.startsWith('+++')).length, 3);
});
