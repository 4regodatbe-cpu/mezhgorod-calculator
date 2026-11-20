import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {inspectM11P214Entry} from '../lib/v3-calculation/m11-p214-entry-boundary.ts';
import type {Coordinate} from '../lib/tolls';
import type {TollValidation} from '../lib/toll-validator';
import type {M11RoadEvidence} from '../lib/toll-engine/m11-road-evidence';
const packed = readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz', import.meta.url));
const r = JSON.parse(gunzipSync(packed).toString()).record;
const route: Coordinate[] = r.route.coordinates, validation: TollValidation = r.validation, evidence: M11RoadEvidence = r.route.m11RoadEvidence;
const inspect = (v: TollValidation | null = validation, e: M11RoadEvidence | null = evidence, g = route) => inspectM11P214Entry(g, e, v);

test('own complete capture proves only its directed p214 access', () => {
  assert.equal(createHash('sha256').update(packed).digest('hex'), '8fe0ec0ac265d465dbeabeed12087a44d105529839c120bf3bc8231a7feeb4d6');
  assert.equal(inspect(), true);
});
test('incomplete chunks, coverage and missing or duplicate physical identities fail closed', () => {
  const gate = validation.tollBooths!.find(g => g.osmNodeId === '5286168661')!;
  const variants: TollValidation[] = [{...validation, status: 'unknown'}, {...validation, complete: false},
    {...validation, boothEventCoverage: 'partial'}, {...validation, chunkCount: undefined},
    {...validation, checkedChunkCount: 0}, {...validation, failedChunkCount: 1},
    {...validation, tollBooths: []}, {...validation, tollBooths: [...validation.tollBooths!, gate]},
    {...validation, tollBooths: validation.tollBooths!.map(g => g === gate ? {...g, wayId: 'other'} : g)},
    ...['766468433', '1205158257'].map(w => ({...validation, paidRoadEdges: validation.paidRoadEdges!.filter(e => e.wayId !== w)}))];
  assert.equal(inspect(null), false);
  for (const v of variants) assert.equal(inspect(v), false);
});
test('missing, malformed, multiple and shifted strict mainline boundaries fail closed', () => {
  assert.equal(inspect(validation, null), false);
  for (const e of [{...evidence, malformedStrictCount: 1}, {...evidence, strictBlocks: []},
    {...evidence, strictBlocks: [...evidence.strictBlocks, ...evidence.strictBlocks]},
    {...evidence, strictBlocks: [{...evidence.strictBlocks[0], beginCoordinate: [0, 0] as Coordinate}]},
    {...evidence, strictBlocks: [{...evidence.strictBlocks[0], endCoordinate: evidence.strictBlocks[0].beginCoordinate}]}]) assert.equal(inspect(validation, e), false);
});
test('reverse, parallel, sparse and truncated geometry cannot borrow the gate identity', () => {
  for (const g of [route.toReversed(), route.map(([x,y]): Coordinate => [x,y+.001]),
    [route[0], route.at(-1)!], route.slice(0, 900)]) assert.equal(inspect(validation, evidence, g), false);
});

test('directed p214→p58 prices its own component and keeps the unpriced CKAD product separate in both departure profiles', async () => {
  const oldFetch = globalThis.fetch; let attempts = 0;
  globalThis.fetch = async () => { attempts++; throw Error('offline test forbids network'); };
  try {
    for (const at of ['2026-10-15T09:00:00+03:00', '2026-10-15T23:59:00+03:00', '2026-10-17T09:00:00+03:00']) {
      const b = resolveM11ProductBoundaries(route, r.route.seconds, at, evidence, validation);
      assert.equal(b.resolved, true); assert.equal(b.parts?.from, 'p214'); assert.equal(b.parts?.to, 'p58');
      assert.equal(b.headDetected, true); assert.equal(b.parts?.head?.to, 'tskad');
      const m = matrixM11GeometryComponent({exact: b.resolved, parts: b.parts});
      const main = m?.components.find(c => c.id === 'm11-58-679');
      assert.equal(main?.tolls?.amount, at.startsWith('2026-10-17') ? 1390 : 1250); assert.equal(m?.tolls?.amount, at.startsWith('2026-10-17') ? 1630 : 1450);
      const q = await calculateLegTolls({routeGeometry: route, routeSeconds: r.route.seconds, departureAt: at,
        selectedFastProvider: 'Valhalla', selectedFastRoute: r.route, valhallaEvidence: null,
        confirmedFreeRoute: null, diagnosticFastValidation: validation});
      assert.ok(q.componentAudit.priced.includes('m11-58-679'));
      assert.ok(q.componentAudit.missing.includes('ckad'));assert.ok(q.componentAudit.priced.includes('m11-15-58'));
      assert.equal(tollsForApi(q.tolls, q.fastValidation).amount, null);
      console.log(JSON.stringify({departureAt: at, mainlineRub: main!.tolls!.amount, missing: q.componentAudit.missing}));
    }
    assert.equal(resolveM11ProductBoundaries(route, r.route.seconds, 'invalid', evidence, validation).resolved, false);
    assert.equal(resolveM11ProductBoundaries(route, r.route.seconds, '2026-10-15T09:00:00+03:00', evidence, null).resolved, false);
    assert.equal(attempts, 0);
  } finally { globalThis.fetch = oldFetch; }
});
