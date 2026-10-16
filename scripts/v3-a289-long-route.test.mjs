import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { load, root } from './helpers/load-ts.mjs';

const { a289ShortRoute } = load(resolve(root, 'lib/v3-calculation/a289-short-route.ts'));
const { priceA289Route } = load(resolve(root, 'lib/toll-engine/a289-engine.ts'));
const { composeSelectedM4A289 } = load(resolve(root, 'lib/v3-calculation/m4-a289-composition.ts'));
const capture = JSON.parse(gunzipSync(readFileSync(resolve(root,
  'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/kherson-аскания-нова-kazan-center/2026-10-15T23-18-27-629Z-capture.json.gz'))));
const route = capture.record.route.coordinates;
const date = '2026-10-15T09:00:00+03:00';

test('saved long route proves a complete A289 frame vector with both trip ends outside local exits', () => {
  assert.deepEqual(Array.from(priceA289Route(route, date).crossedFrames), ['103', '82', '23']);
  for (const geometry of [route, route.toReversed()]) {
    for (const departureAt of [date, '2026-10-17T09:00:00+03:00']) {
      const result = a289ShortRoute(geometry, [], departureAt, true);
      assert.equal(result?.tolls?.amount, 800, result?.reason);
      assert.match(result.reason, /complete ordered three-frame/);
      assert.match(result.tolls.segments[0], /РВП/);
    }
  }
});

test('unbound partial A289 traversal still blocks a long-route price', () => {
  const frames = [[37.5878131, 45.168457], [37.8330177, 45.1961096]];
  const result = a289ShortRoute([[36, 47], ...frames, [39, 46]], [], date, true);
  assert.equal(result?.tolls, null);
});

test('full A289 physical frames do not bypass fare validity', () => {
  for (const invalid of ['2026-02-30T09:00:00+03:00', '2025-10-15T09:00:00+03:00', undefined]) {
    assert.equal(a289ShortRoute(route, [], invalid, true)?.tolls, null);
  }
});

test('A289 full-vector recovery cannot hide an unresolved M4 component', () => {
  const production = { candidate: true, m4PvpPreview: { confirmedPvps: ['m4-1223'] }, reason: 'missing M4 price' };
  const result = composeSelectedM4A289(route, production, null, [], date);
  assert.equal(result.components.find(component => component.id === 'a289').tolls.amount, 800);
  assert.equal(result.tolls, null);
  assert.match(result.reason, /M-4 selected traversal is not completely priced/);
});

test('returning to an A289 frame remains an unresolved repeated traversal', () => {
  const gate23 = [38.5327744, 45.171408], gate82 = [37.8330177, 45.1961096], gate103 = [37.5878131, 45.168457];
  const geometry = [[36, 47], gate103, gate82, gate23, gate82, [39, 46]];
  assert.ok(priceA289Route(geometry, date).repeatedFrames.length > 0);
  assert.match(a289ShortRoute(geometry, [], date, true).reason, /repeated passage/);
  assert.equal(a289ShortRoute(geometry, [], date, true).tolls, null);
});
