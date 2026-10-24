import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import physical from '../experiments/nationwide-tolls/source-snapshots/odintsovo/2026-10-18-directed-lanes.json' with {type: 'json'};
import inventory from '../experiments/nationwide-tolls/m1-m3-official-gates.json' with {type: 'json'};
import {isOdintsovoLane} from '../experiments/nationwide-tolls/odintsovo-lane-identity.mjs';
import {auditM1M3SelectedRoute} from '../experiments/nationwide-tolls/m1-m3-gate-evidence.mjs';
import {unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url));
const cases = [
  'single-odintsovo-golitsyno-to-rublevo/2026-10-16T02-07-00-749Z-capture.json.gz',
  'single-odintsovo-rublevo-to-golitsyno/2026-10-16T02-09-24-620Z-capture.json.gz',
].map(p => JSON.parse(gunzipSync(read('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/' + p)).toString()).record);
const coverage = (v: TollValidation) => unpricedRoadCoverage({segments: [], validation: v, candidateNetworks: [], m1m3Candidates: []});
const audit = (v: TollValidation) => auditM1M3SelectedRoute(inventory, v, 'selected-fast-route');
const unknown = (v: TollValidation) => coverage(v).regionalProducts.some(p => p.id === 'unknown-paid-road');
const originalFetch = globalThis.fetch, unexpected: string[] = [];
test.before(() => {globalThis.fetch = async input => {unexpected.push(String(input)); throw Error('OFFLINE_IDENTITY_TEST');};});
test.after(() => {globalThis.fetch = originalFetch; assert.deepEqual(unexpected, []);});

test('four product identities retain exact primary booth and one-way source provenance', () => {
  assert.equal(physical.lanes.length, 4);
  for (const lane of physical.lanes) {
    const bytes = read(lane.sourceFile), text = bytes.toString();
    assert.equal(createHash('sha256').update(bytes).digest('hex'), lane.sourceSha256);
    assert.match(text, new RegExp(`<node\\b[^>]* id="${lane.osmNodeId}"`));
    assert.match(text, /k="barrier" v="toll_booth"/); assert.ok(text.includes(lane.plazaName));
    assert.match(text, new RegExp(`<way\\b[^>]* id="${lane.wayId}"`)); assert.match(text, /k="oneway" v="yes"/);
    assert.equal(isOdintsovoLane(lane), true);
    assert.equal(isOdintsovoLane({...lane, wayId: 'other'}), false);
    assert.equal(isOdintsovoLane({...lane, osmNodeId: 'other'}), false);
  }
});
test('both own traces classify the separate bypass without a second M1 or anonymous product', () => {
  for (const r of cases) {
    const v: TollValidation = r.validation;
    assert.ok(v.tollBooths!.every(isOdintsovoLane));
    assert.deepEqual(audit(v).candidateRoads, []); assert.deepEqual(audit(v).unmappedPaidNodes, []);
    const c = coverage(v); assert.equal(c.m1, false); assert.equal(c.m3, false);
    assert.deepEqual(c.regionalProducts.map(p => p.id), ['odintsovo']);
    // Identity is independent of trace aliases, including omitted lane names.
    const unnamed = {...v, roadNames: [], tollBooths: v.tollBooths!.map(b => ({...b, roadNames: []}))};
    assert.deepEqual(coverage(unnamed).regionalProducts.map(p => p.id), ['odintsovo']);
  }
});
test('wrong tuples, other paid booths, real M1 and partial coverage remain conservative', () => {
  const v: TollValidation = cases[0].validation, lane = v.tollBooths![1];
  for (const b of [{...lane, osmNodeId: 'other'}, {...lane, wayId: 'other'}, {...lane, wayId: undefined}]) {
    assert.equal(unknown({...v, roadNames: [], tollBooths: [b]}), true);
    const m1 = {...v, roadNames: [], tollBooths: [{...b, roadNames: ['М-1'], edgeToll: true}]};
    assert.deepEqual(audit(m1).candidateRoads, ['m1']); assert.equal(coverage(m1).m1, true);
  }
  assert.equal(unknown({...v, tollBooths: [...v.tollBooths!, {...lane, osmNodeId: 'unreviewed'}]}), true);
  assert.equal(unknown({...v, complete: false}), true);
  const extra = {...v, tollBooths: [...v.tollBooths!, {...lane, osmNodeId: 'actual-m1', roadNames: ['М-1'], edgeToll: true}]};
  assert.deepEqual(audit(extra).candidateRoads, ['m1']); assert.equal(coverage(extra).m1, true);
});
test('product identity authorizes no money for either saved selected route', async () => {
  const results: unknown[] = [];
  for (const r of cases) {
    const q = await calculateLegTolls({routeGeometry: r.route.coordinates, routeSeconds: r.route.seconds,
      departureAt: '2026-10-15T09:00:00+03:00', selectedFastProvider: r.provider, selectedFastRoute: r.route,
      valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: r.validation});
    const api = tollsForApi(q.tolls, q.fastValidation);
    assert.ok(q.componentAudit.missing.includes('odintsovo')); assert.equal(api.amount, null);
    assert.equal(api.pricingStatus, 'unknown');
    results.push({spec: r.spec, componentAudit: q.componentAudit, api});
  }
  if (process.env.ODINTSOVO_IDENTITY_RESULTS_DIR) {
    mkdirSync(process.env.ODINTSOVO_IDENTITY_RESULTS_DIR, {recursive: true});
    writeFileSync(process.env.ODINTSOVO_IDENTITY_RESULTS_DIR + '/quotes.json', JSON.stringify({results, externalRequests: 0, newPrices: 0}, null, 2) + '\n');
  }
});
