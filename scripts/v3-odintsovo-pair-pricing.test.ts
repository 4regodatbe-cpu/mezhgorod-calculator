import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {matrixOdintsovoPairComponent} from '../lib/v3-calculation/odintsovo-pair-component.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';
import type {TollValidation} from '../lib/toll-validator.ts';
const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url));
const cases = [
  'single-odintsovo-golitsyno-to-rublevo/2026-10-16T02-07-00-749Z-capture.json.gz',
  'single-odintsovo-rublevo-to-golitsyno/2026-10-16T02-09-24-620Z-capture.json.gz',
].map((p, i) => ({capture: JSON.parse(gunzipSync(read('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/' + p)).toString()),
  validation: JSON.parse(read(`experiments/nationwide-tolls/checks/2026-10-18-odintsovo-continuity/validation-${i}.json`).toString()) as TollValidation}));
const original = globalThis.fetch, unexpected: string[] = [];
test.before(() => {globalThis.fetch = async input => {unexpected.push(String(input)); throw Error('UNRECORDED_FETCH');};});
test.after(() => {globalThis.fetch = original; assert.deepEqual(unexpected, []);});
const save = (name: string, data: unknown) => {
  if (!process.env.ODINTSOVO_FARE_RESULTS_DIR) return;
  mkdirSync(process.env.ODINTSOVO_FARE_RESULTS_DIR, {recursive: true});
  writeFileSync(`${process.env.ODINTSOVO_FARE_RESULTS_DIR}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
const component = (i: number, at: string, v = cases[i].validation, seconds = cases[i].capture.record.route.seconds) =>
  matrixOdintsovoPairComponent(cases[i].capture.record.route.coordinates, v, at, seconds);
const quote = (i: number, at: string) => {
  const r = cases[i].capture.record;
  return calculateLegTolls({routeGeometry: r.route.coordinates, routeSeconds: r.route.seconds, departureAt: at,
    selectedFastProvider: r.provider, selectedFastRoute: r.route, valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: cases[i].validation});
};
test('planning baseline is650 in both directions across hours, weekends, holidays and future calendar years', () => {
  const dates = ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-11-04', '2026-12-31', '2027-01-15'];
  const times = ['00:00:00', '00:59:59', '01:00:00', '04:59:59', '05:00:00', '06:59:59', '07:00:00',
    '12:59:59', '13:00:00', '15:59:59', '16:00:00', '21:59:59', '22:00:00', '23:59:59'];
  for (const date of dates) for (const time of times) for (const i of [0, 1]) {
    const result = component(i, date + 'T' + time + '+03:00');
    assert.equal(result.tolls?.amount, 650, `${i}/${date}/${time}`);
    assert.equal(result.tolls?.period, 'базовая оценка');
  }
  save('planning-base-controls', {dates, times, ownDirections: 2, checked: dates.length * times.length * 2, planningRub: 650, externalRequests: 0});
});
test('planning baseline preserves tariff validity, invalid date guards and departure-only calculation', () => {
  for (const i of [0, 1]) {
    assert.equal(component(i, '2026-10-15T06:00:00Z').tolls?.amount, component(i, '2026-10-15T09:00:00+03:00').tolls?.amount);
    assert.equal(component(i, '2026-10-15T23:59:59+03:00', cases[i].validation, 100000).tolls?.amount, 650);
    for (const at of ['2026-01-14T09:00:00+03:00', '2026-02-30T09:00:00+03:00', 'bad']) assert.equal(component(i, at).tolls, null);
    assert.equal(component(i, '2026-10-15T09:00:00+03:00', cases[i].validation, -1).tolls, null);
  }
});
test('five own profiles in each direction price the component but never hide forward CKAD', async () => {
  const profiles = [
    ['2026-10-15T09:00:00+03:00', 650, 650], ['2026-10-15T23:59:00+03:00', 650, 650],
    ['2026-10-16T17:00:00+03:00', 650, 650], ['2026-10-17T09:00:00+03:00', 650, 650],
    ['2026-10-18T02:00:00+03:00', 650, 650],
  ] as const;
  const results: unknown[] = [];
  for (const [at, forward, reverse] of profiles) for (const i of [0, 1]) {
    const q = await quote(i, at), api = tollsForApi(q.tolls, q.fastValidation), expected = i === 0 ? forward : reverse;
    assert.equal(q.componentAudit.components.find(c => c.id === 'odintsovo')?.tolls?.amount, expected);
    assert.deepEqual(q.componentAudit.missing, i === 0 ? ['ckad'] : []);
    assert.equal(api.amount, i === 0 ? null : expected); assert.equal(api.priceConfirmation, 'unconfirmed');
    assert.equal(api.pricingStatus, i === 0 ? 'unknown' : 'priced');
    results.push({caseId: cases[i].capture.record.spec.id, departureAt: at, componentAudit: q.componentAudit, api});
    save('profiles', {completed: results, newConfirmedFullTripFares: 0, externalRequests: 0});
  }
});
test('missing, partial, repeated or wrong own context never authorize a planning charge', () => {
  for (const i of [0, 1]) {
    const variants = [cases[i].capture.record.validation,
      {...cases[i].validation, complete: false}, {...cases[i].validation, failedChunkCount: 1},
      {...cases[i].validation, odintsovoTraceBlocks: undefined}];
    const repeated = structuredClone(cases[i].validation); repeated.odintsovoTraceBlocks![0].repeatedWayId = true; variants.push(repeated);
    const wrong = structuredClone(cases[i].validation); wrong.tollBooths![0].wayId = 'other'; variants.push(wrong);
    for (const v of variants) assert.equal(component(i, '2026-10-15T09:00:00+03:00', v).tolls, null);
  }
});
async function api(i: number, traceUnavailable: boolean, departureAt = '2026-10-15T09:00:00+03:00') {
  const c = cases[i], r = c.capture.record, io = replayingFetch(c.capture.calls), old = globalThis.fetch, requests: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input)); requests.push(url.href);
    if (traceUnavailable && url.pathname === '/trace_attributes') return new Response('{}', {status: 503});
    return io.fetch(input, init);
  };
  try {
    const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
      body: JSON.stringify({from: r.spec.from, to: r.spec.to, departureAt})}));
    assert.equal(response.status, 200); assert.deepEqual(io.misses, []);
    assert.equal(requests.some(u => u.includes('avoid_toll') || u.includes('toll_booth_penalty')), false);
    const fast = (await response.json()).legs[0].fast;
    assert.equal(fast.meters, r.route.meters); assert.equal(fast.seconds, r.route.seconds); assert.ok(fast.quality.providers.includes(r.provider));
    save(`api-${i}-${traceUnavailable ? 'unavailable' : 'ready'}-${departureAt.replace(/[^0-9]/g, '')}`, {fast, requests, misses: io.misses, externalRequests: 0});
    return fast;
  } finally {globalThis.fetch = old;}
}
test('public API prices reverse650, forward remains CKAD-unknown, unavailable trace stays null', async () => {
  const forward = await api(0, false), reverse = await api(1, false), unavailable = await api(1, true);
  assert.equal(forward.tolls.amount, null); assert.equal(forward.tolls.pricingStatus, 'unknown');
  assert.equal(reverse.tolls.amount, 650); assert.equal(reverse.tolls.pricingStatus, 'priced');
  // The established public API omits confirmation metadata and its label;
  // internal quote assertions above still require unconfirmed estimates.
  assert.equal('priceConfirmation' in reverse.tolls, false);
  assert.match(reverse.tolls.segments.join('\n'), /ПВП 6\.9 → 17\.7/);
  assert.equal(unavailable.tolls.amount, null); assert.equal(unavailable.tolls.pricingStatus, 'unknown');
  for (const at of ['2026-10-18T02:00:00+03:00', '2026-10-16T17:00:00+03:00', '2026-10-15T00:30:00+03:00']) {
    const planning = await api(1, false, at); assert.equal(planning.tolls.amount, 650); assert.equal(planning.tolls.pricingStatus, 'priced');
  }
});
