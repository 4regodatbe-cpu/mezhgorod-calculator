import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {odintsovoDepartureProfile, matrixOdintsovoPairComponent} from '../lib/v3-calculation/odintsovo-pair-component.ts';
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
test('departure profile uses independent 2026 calendar, directional peaks and explicit unknown windows', () => {
  const profile = (at: string, direction: 'towardMoscow' | 'fromMoscow' = 'towardMoscow') => odintsovoDepartureProfile(at, direction);
  assert.deepEqual(profile('2026-10-15T06:00:00Z'), profile('2026-10-15T09:00:00+03:00'));
  for (const date of ['2026-11-04', '2026-12-31', '2026-03-09', '2026-05-11', '2026-10-17', '2026-10-18']) {
    assert.deepEqual(profile(date + 'T09:00:00+03:00'), {status: 'resolved', date, profile: 'weekendDay'});
  }
  assert.deepEqual(profile('2026-10-16T09:00:00+03:00'), {status: 'resolved', date: '2026-10-16', profile: 'weekdayPeak'});
  for (const at of ['2027-01-15T09:00:00+03:00', '2026-02-30T09:00:00+03:00', 'bad', '2026-10-15T00:00:00+03:00', '2026-10-15T00:59:59+03:00']) {
    assert.equal(profile(at).status, 'unknown', at);
  }
});
test('ready matrix values respect 01/05/07/13/16/22 boundaries and freeze at departure', () => {
  const controls: Array<[string, number, number]> = [
    ['01:00:00', 20, 20], ['04:59:59', 20, 20], ['05:00:00', 650, 650],
    ['06:59:59', 650, 650], ['07:00:00', 700, 650], ['12:59:59', 700, 650],
    ['13:00:00', 650, 650], ['15:59:59', 650, 650], ['16:00:00', 650, 700],
    ['21:59:59', 650, 700], ['22:00:00', 650, 650], ['23:59:59', 650, 650],
  ];
  for (const [time, forward, reverse] of controls) {
    const at = '2026-10-15T' + time + '+03:00';
    assert.equal(component(0, at).tolls?.amount, forward, time);
    assert.equal(component(1, at).tolls?.amount, reverse, time);
    assert.equal(component(1, at, cases[1].validation, 100000).tolls?.amount, reverse, 'arrival must not reprice');
  }
  for (const at of ['2026-01-14T09:00:00+03:00', '2027-10-15T09:00:00+03:00', '2026-10-15T00:30:00+03:00']) assert.equal(component(1, at).tolls, null);
  assert.equal(component(1, '2026-10-15T09:00:00+03:00', cases[1].validation, -1).tolls, null);
  save('time-boundaries', {controls, status: 'PASS', externalRequests: 0});
});
test('five own profiles in each direction price the component but never hide forward CKAD', async () => {
  const profiles = [
    ['2026-10-15T09:00:00+03:00', 700, 650], ['2026-10-15T23:59:00+03:00', 650, 650],
    ['2026-10-16T17:00:00+03:00', 650, 700], ['2026-10-17T09:00:00+03:00', 650, 650],
    ['2026-10-18T02:00:00+03:00', 20, 20],
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
test('missing, partial, repeated or wrong own context and unsupported calendar never authorize money', () => {
  for (const i of [0, 1]) {
    const variants = [cases[i].capture.record.validation,
      {...cases[i].validation, complete: false}, {...cases[i].validation, failedChunkCount: 1},
      {...cases[i].validation, odintsovoTraceBlocks: undefined}];
    const repeated = structuredClone(cases[i].validation); repeated.odintsovoTraceBlocks![0].repeatedWayId = true; variants.push(repeated);
    const wrong = structuredClone(cases[i].validation); wrong.tollBooths![0].wayId = 'other'; variants.push(wrong);
    for (const v of variants) assert.equal(component(i, '2026-10-15T09:00:00+03:00', v).tolls, null);
  }
});
async function api(i: number, traceUnavailable: boolean) {
  const c = cases[i], r = c.capture.record, io = replayingFetch(c.capture.calls), old = globalThis.fetch, requests: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input)); requests.push(url.href);
    if (traceUnavailable && url.pathname === '/trace_attributes') return new Response('{}', {status: 503});
    return io.fetch(input, init);
  };
  try {
    const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
      body: JSON.stringify({from: r.spec.from, to: r.spec.to, departureAt: '2026-10-15T09:00:00+03:00'})}));
    assert.equal(response.status, 200); assert.deepEqual(io.misses, []);
    assert.equal(requests.some(u => u.includes('avoid_toll') || u.includes('toll_booth_penalty')), false);
    const fast = (await response.json()).legs[0].fast;
    assert.equal(fast.meters, r.route.meters); assert.equal(fast.seconds, r.route.seconds); assert.ok(fast.quality.providers.includes(r.provider));
    save(`api-${i}-${traceUnavailable ? 'unavailable' : 'ready'}`, {fast, requests, misses: io.misses, externalRequests: 0});
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
});
