import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {paidProductsFromName, unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';
const cases = [
  'single-odintsovo-golitsyno-to-rublevo/2026-10-16T02-07-00-749Z-capture.json.gz',
  'single-odintsovo-rublevo-to-golitsyno/2026-10-16T02-09-24-620Z-capture.json.gz',
].map(p => JSON.parse(gunzipSync(readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/' + p, import.meta.url))).toString()));
const savedFetch = globalThis.fetch, unexpected: string[] = [];
test.before(() => {globalThis.fetch = async input => {unexpected.push(String(input)); throw Error('UNRECORDED_FETCH');};});
test.after(() => {globalThis.fetch = savedFetch; assert.deepEqual(unexpected, []);});
const save = (name: string, data: unknown) => {
  if (!process.env.CKAD_ALIAS_RESULTS_DIR) return;
  mkdirSync(process.env.CKAD_ALIAS_RESULTS_DIR, {recursive: true});
  writeFileSync(`${process.env.CKAD_ALIAS_RESULTS_DIR}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
test('exact A113 references and full CKAD name identify paid product including booth aliases', () => {
  for (const name of ['А-113', 'A-113', 'а113', 'А‑113', 'А–113', 'А 113', ' А—113 ',
    'Центральная кольцевая автомобильная дорога', 'А-113 · Центральная кольцевая автомобильная дорога',
    'дорога · A-113', 'ЦКАД']) assert.deepEqual(paidProductsFromName(name), ['ckad'], name);
  for (const name of ['А-1130', 'А-113а', 'A-13', 'А-107', 'А-112', 'А-114', 'М-113',
    'съезд на А-113', 'А-113 подъезд', 'Центральная кольцевая автомобильная дорога: съезд']) {
    assert.equal(paidProductsFromName(name).includes('ckad'), false, name);
  }
  assert.deepEqual(paidProductsFromName('Северный обход Одинцова · М-1'), ['odintsovo']);
  assert.deepEqual(paidProductsFromName('Малые Вязёмы · А-113'), ['ckad-small-vyazemy']);
});
test('paid trace name without any booth still requires the CKAD component; incomplete trace stays unknown', () => {
  const v = {...cases[0].record.validation, roadNames: ['А-113'], tollBooths: []};
  const coverage = (validation = v) => unpricedRoadCoverage({segments: [], validation, candidateNetworks: [], m1m3Candidates: []});
  assert.ok(coverage().matchedCoreProducts.includes('ckad'));
  const partial = coverage({...v, complete: false});
  assert.ok(partial.matchedCoreProducts.includes('ckad'));
  assert.ok(partial.regionalProducts.some(p => p.id === 'unknown-paid-road'));
});
test('own forward route retains omitted paid CKAD; reverse does not inherit the other direction evidence', async () => {
  const results: unknown[] = [];
  for (const [i, c] of cases.entries()) {
    const r = c.record;
    const q = await calculateLegTolls({routeGeometry: r.route.coordinates, routeSeconds: r.route.seconds,
      departureAt: '2026-10-15T09:00:00+03:00', selectedFastProvider: r.provider, selectedFastRoute: r.route,
      valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: r.validation});
    assert.equal(q.componentAudit.missing.includes('ckad'), i === 0);
    assert.ok(q.componentAudit.missing.includes('odintsovo'));
    assert.equal(q.componentAudit.missing.includes('m1'), false);
    const api = tollsForApi(q.tolls, q.fastValidation);
    assert.equal(api.amount, null); assert.equal(api.pricingStatus, 'unknown');
    results.push({spec: r.spec, componentAudit: q.componentAudit, api});
  }
  save('quotes', {results, externalRequests: 0, newPrices: 0});
});
test('own POST replay keeps forward CKAD unknown and prices only the complete reverse route', async () => {
  for (const [i, c] of cases.entries()) {
    const r = c.record, replay = replayingFetch(c.calls), previous = globalThis.fetch, requests: string[] = [];
    globalThis.fetch = async (input, init) => {requests.push(String(input)); return replay.fetch(input, init);};
    try {
      const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
        body: JSON.stringify({from: r.spec.from, to: r.spec.to, departureAt: '2026-10-15T09:00:00+03:00'})}));
      assert.equal(response.status, 200); assert.deepEqual(replay.misses, []);
      assert.equal(requests.some(u => u.includes('avoid_toll') || u.includes('toll_booth_penalty')), false);
      const fast = (await response.json()).legs[0].fast;
      assert.equal(fast.meters, r.route.meters); assert.equal(fast.seconds, r.route.seconds);
      assert.ok(fast.quality.providers.includes(r.provider));
      assert.equal(fast.tolls.amount, i === 0 ? null : 650); assert.equal(fast.tolls.pricingStatus, i === 0 ? 'unknown' : 'priced');
      assert.equal(fast.tolls.segments.some((s: string) => s.includes('ckad_east_arc_not_proven')), i === 0);
      save(`api-${i}`, {fast, requests, misses: replay.misses, externalRequests: 0});
    } finally {globalThis.fetch = previous;}
  }
});
