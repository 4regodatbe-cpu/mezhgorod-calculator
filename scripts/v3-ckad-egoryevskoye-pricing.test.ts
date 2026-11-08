import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {resolveCkadProductBoundaries} from '../lib/v3-calculation/ckad-product-boundaries.ts';
import {matrixCkadComponent} from '../experiments/nationwide-tolls/engine/ckad-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {RouteWithGeometry} from '../lib/route-providers.ts';

const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url));
const captureBytes = read('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz');
const capture = JSON.parse(gunzipSync(captureBytes).toString()), r = capture.record;
const route = r.route as RouteWithGeometry;
const validation: TollValidation = JSON.parse(read('experiments/nationwide-tolls/checks/2026-10-18-ckad-ramenskoe-boundary/diagnosis.json').toString()).rebuiltValidation;
const profiles = [
  ['2026-10-15T09:00:00+03:00', 2668], ['2026-10-15T23:59:00+03:00', 2668],
  ['2026-10-16T09:00:00+03:00', 2828], ['2026-10-17T09:00:00+03:00', 2848],
  ['2026-10-18T09:00:00+03:00', 2928],
] as const;
const boundary = (v = validation) => resolveCkadProductBoundaries(route.coordinates, route.m11RoadEvidence, v);
const quote = (v = validation, at: string = profiles[0][0]) => calculateLegTolls({routeGeometry: route.coordinates,
  routeSeconds: route.seconds, departureAt: at, selectedFastProvider: r.provider, selectedFastRoute: route,
  valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: v});
const save = (name: string, data: unknown) => {
  if (!process.env.CKAD_EGORYEVSKOYE_RESULTS_DIR) return;
  mkdirSync(process.env.CKAD_EGORYEVSKOYE_RESULTS_DIR, {recursive: true});
  writeFileSync(`${process.env.CKAD_EGORYEVSKOYE_RESULTS_DIR}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
const originalFetch = globalThis.fetch;
const unexpected: string[] = [];
test.before(() => {globalThis.fetch = async input => {unexpected.push(String(input)); throw Error('UNRECORDED_FETCH');};});
test.after(() => {globalThis.fetch = originalFetch; assert.deepEqual(unexpected, []);});

test('own directed exit resolves the exact existing1218 cell without M12 endpoint restriction', () => {
  assert.equal(createHash('sha256').update(captureBytes).digest('hex'), '8fe0ec0ac265d465dbeabeed12087a44d105529839c120bf3bc8231a7feeb4d6');
  assert.equal(route.meters, 354824); assert.equal(route.seconds, 13566); assert.equal(route.coordinates.length, 2140);
  const b = boundary(); assert.equal(b.exact, true);
  assert.deepEqual(b.traversal, {from: 'М-11 Нева', to: 'Егорьевское шоссе'});
  assert.equal(matrixCkadComponent(b, profiles[0][0], route.seconds)?.tolls?.amount, 1218);
  assert.ok(route.seconds > 120 * 60);
});

test('five own departure profiles compose complete unconfirmed estimates using the departure date', async () => {
  const completed: unknown[] = [];
  for (const [at, expected] of profiles) {
    const q = await quote(validation, at), api = tollsForApi(q.tolls, q.fastValidation);
    assert.equal(q.componentAudit.status, 'priced'); assert.deepEqual(q.componentAudit.missing, []);
    assert.equal(q.componentAudit.components.find(c => c.id === 'ckad')?.tolls?.amount, 1218);
    assert.equal(api.amount, expected); assert.equal(api.pricingStatus, 'priced');
    assert.equal(api.priceConfirmation, 'unconfirmed');
    completed.push({departureAt: at, amount: api.amount, componentAudit: q.componentAudit, apiTolls: api});
    save('profiles', {completed, externalRequests: 0, confirmedFullTripFares: 0});
  }
});

test('old, absent, partial or wrong context cannot turn a CKAD subtotal into a full fare', async () => {
  const variants: Array<[string, TollValidation]> = [['old', r.validation]];
  const mutations: Array<[string, (v: TollValidation) => void]> = [
    ['absent', v => {delete v.ckadTraceBlocks;}], ['partial', v => {v.complete = false;}],
    ['wrong entry', v => {v.ckadTraceBlocks![0].firstWayId = 'other';}],
    ['other exit', v => {v.ckadTraceBlocks![0].lastWayId = '1189855267';}],
    ['M12 connector', v => {v.ckadTraceBlocks![0].after[0].wayId = '916593974';}],
    ['repeated', v => {v.ckadTraceBlocks![0].repeatedWayId = true;}],
  ];
  for (const [name, mutate] of mutations) {const v = structuredClone(validation); mutate(v); variants.push([name, v]);}
  for (const [name, v] of variants) {
    assert.equal(boundary(v).exact, false, name);
    const q = await quote(v), api = tollsForApi(q.tolls, q.fastValidation);
    assert.ok(q.componentAudit.missing.includes('ckad'), name); assert.equal(api.amount, null, name);
    assert.equal(api.pricingStatus, 'unknown', name);
  }
  save('negative-pricing', {status: 'PASS', checked: variants.map(([name]) => name), externalRequests: 0});
});

async function api(traceUnavailable: boolean) {
  const replay = replayingFetch(capture.calls), previous = globalThis.fetch, requests: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input)); requests.push(url.href);
    if (traceUnavailable && url.pathname === '/trace_attributes') return new Response('{}', {status: 503});
    return replay.fetch(input, init);
  };
  try {
    const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
      body: JSON.stringify({from: r.spec.from, to: r.spec.to, departureAt: profiles[0][0]})}));
    assert.equal(response.status, 200); assert.deepEqual(replay.misses, []);
    assert.equal(requests.some(u => u.includes('avoid_toll') || u.includes('toll_booth_penalty')), false);
    const fast = (await response.json()).legs[0].fast;
    save(traceUnavailable ? 'api-trace-unavailable' : 'api-ready', {fast, replayRequests: requests, misses: replay.misses, externalRequests: 0});
    return fast;
  } finally {globalThis.fetch = previous;}
}
test('own public API uses recorded Valhalla geometry and prices only a complete trace', async () => {
  const ready = await api(false);
  assert.equal(ready.meters, route.meters); assert.equal(ready.seconds, route.seconds);
  assert.ok(ready.quality.providers.includes('Valhalla'));
  assert.equal(ready.tolls.amount, 2668); assert.equal(ready.tolls.pricingStatus, 'priced');
  const blocked = await api(true);
  assert.equal(blocked.tolls.amount, null); assert.equal(blocked.tolls.pricingStatus, 'unknown');
});
