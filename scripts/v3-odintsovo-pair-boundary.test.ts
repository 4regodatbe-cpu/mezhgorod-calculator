import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {validateTollEdges, type TollValidation} from '../lib/toll-validator.ts';
import {inspectOdintsovoPair} from '../lib/v3-calculation/odintsovo-pair-boundary.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {Coordinate} from '../lib/tolls.ts';
const cases = [
  'single-odintsovo-golitsyno-to-rublevo/2026-10-16T02-07-00-749Z-capture.json.gz',
  'single-odintsovo-rublevo-to-golitsyno/2026-10-16T02-09-24-620Z-capture.json.gz',
].map(p => ({capture: JSON.parse(gunzipSync(readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/' + p, import.meta.url))).toString()), validation: null as TollValidation | null}));
const originalFetch = globalThis.fetch, unexpected: string[] = [];
const save = (name: string, data: unknown) => {
  if (!process.env.ODINTSOVO_PAIR_RESULTS_DIR) return;
  mkdirSync(process.env.ODINTSOVO_PAIR_RESULTS_DIR, {recursive: true});
  writeFileSync(`${process.env.ODINTSOVO_PAIR_RESULTS_DIR}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
async function replay(c: typeof cases[number], cityGap = false) {
  const calls = structuredClone(c.capture.calls);
  if (cityGap) {
    const call = calls.find((c: {url: string}) => c.url.includes('/trace_attributes'));
    const raw = JSON.parse(call.text);
    const i = raw.edges.findIndex((e: {end_node?: {node_id: number}}) => e.end_node?.node_id === 3109177688);
    assert.ok(i >= 0);
    raw.edges.splice(i + 1, 0, {way_id: 999999999, toll: false, names: ['Городская улица'], end_node: {node_id: 999999999}});
    call.text = JSON.stringify(raw);
  }
  const io = replayingFetch(calls), previous = globalThis.fetch; let count = 0;
  globalThis.fetch = async (input, init) => {count++; return io.fetch(input, init);};
  try {
    const v = await validateTollEdges(c.capture.record.route.coordinates);
    assert.deepEqual(io.misses, []); assert.equal(count, 1); return v;
  } finally {globalThis.fetch = previous;}
}
test.before(async () => {
  globalThis.fetch = async input => {unexpected.push(String(input)); throw Error('UNRECORDED_FETCH');};
  for (const [i, c] of cases.entries()) {
    c.validation = await replay(c);
    const {odintsovoTraceBlocks, ckadTraceBlocks: _ckad, ...oldFields} = c.validation;
    void _ckad;
    assert.deepEqual(oldFields, c.capture.record.validation);
    assert.equal(odintsovoTraceBlocks?.length, 1);
    save(`validation-${i}`, c.validation);
  }
});
test.after(() => {globalThis.fetch = originalFetch; assert.deepEqual(unexpected, []);});
const inspect = (c: typeof cases[number], v = c.validation!, geometry = c.capture.record.route.coordinates) => inspectOdintsovoPair(geometry, v);
test('each own continuous named trace and independent physical lanes prove its directed two-plaza pair only', () => {
  assert.deepEqual(inspect(cases[0]), {direction: 'towardMoscow', plazas: ['17.7', '6.9']});
  assert.deepEqual(inspect(cases[1]), {direction: 'fromMoscow', plazas: ['6.9', '17.7']});
  for (const c of cases) assert.equal(inspect(c, c.capture.record.validation), null);
});
test('a free city gap with unchanged paid edges and booth order prevents exit-reentry borrowing', async () => {
  const c = cases[0], broken = await replay(c, true);
  assert.deepEqual(broken.paidRoadEdges, c.validation!.paidRoadEdges);
  assert.deepEqual(broken.tollBooths, c.validation!.tollBooths);
  assert.equal(broken.odintsovoTraceBlocks?.length, 2); assert.equal(inspect(c, broken), null);
  save('city-gap', {validation: broken, matchingPaidEdges: true, accepted: false, externalRequests: 0});
});
test('incomplete, repeated, unknown or wrong directional context cannot authorize the pair', () => {
  const variants: Array<[string, (v: TollValidation) => void]> = [
    ['missing context', v => {delete v.odintsovoTraceBlocks;}], ['partial', v => {v.complete = false;}],
    ['failed chunk', v => {v.failedChunkCount = 1;}], ['missing chunks', v => {v.chunkCount = undefined;}],
    ['partial booth coverage', v => {v.boothEventCoverage = 'partial';}],
    ['second block', v => {v.odintsovoTraceBlocks!.push(v.odintsovoTraceBlocks![0]);}],
    ['reentry flag', v => {v.odintsovoTraceBlocks![0].repeatedWayId = true;}],
    ['route starts in block', v => {v.odintsovoTraceBlocks![0].before = null;}],
    ['route ends in block', v => {v.odintsovoTraceBlocks![0].after = null;}],
    ['unknown link', v => {v.odintsovoTraceBlocks![0].edges[15].roadNames = ['Городская улица'];}],
    ['missing node', v => {v.odintsovoTraceBlocks![0].edges[15].endNodeId = null;}],
    ['duplicate node', v => {v.odintsovoTraceBlocks![0].edges[15].endNodeId = v.odintsovoTraceBlocks![0].edges[14].endNodeId;}],
    ['repeat way', v => {v.odintsovoTraceBlocks![0].edges[15].wayId = v.odintsovoTraceBlocks![0].edges[0].wayId;}],
    ['unknown payment event', v => {v.odintsovoTraceBlocks![0].edges[15].paymentEvent = true;}],
    ['wrong plaza way', v => {v.odintsovoTraceBlocks![0].edges.find(e => e.paymentEvent)!.wayId = 'other';}],
    ['wrong plaza node', v => {v.odintsovoTraceBlocks![0].edges.find(e => e.paymentEvent)!.endNodeId = 'other';}],
    ['wrong booth context', v => {v.tollBooths![0].wayId = 'other';}],
    ['booth order', v => {v.tollBooths!.reverse();}],
    ['repeated booth', v => {v.tollBooths!.push(v.tollBooths![0]); v.tollBoothCount!++;}],
    ['no paid evidence', v => {v.paidRoadEdges = [];}],
  ];
  for (const c of cases) for (const [name, change] of variants) {
    const v = structuredClone(c.validation!); change(v); assert.equal(inspect(c, v), null, name);
  }
  save('negative-context', {variants: variants.map(([name]) => name), ownCases: 2, assertions: variants.length * 2, status: 'PASS'});
});
test('reversed, shifted, sparse or detouring geometry cannot borrow valid trace context', () => {
  for (const c of cases) {
    const geometry = c.capture.record.route.coordinates as Coordinate[];
    assert.equal(inspect(c, c.validation!, geometry.toReversed()), null);
    assert.equal(inspect(c, c.validation!, geometry.map(([x, y]): Coordinate => [x + 0.002, y])), null);
    assert.equal(inspect(c, c.validation!, [geometry[0], geometry.at(-1)!]), null);
    const bad = structuredClone(geometry); bad.splice(Math.floor(geometry.length / 2), 0, [38, 56]);
    assert.equal(inspect(c, c.validation!, bad), null);
    assert.equal(inspect(c, c.validation!, [[NaN, 55], ...geometry]), null);
  }
});
test('standalone physical pair proof has not enabled any component price', async () => {
  for (const c of cases) {
    const r = c.capture.record;
    const q = await calculateLegTolls({routeGeometry: r.route.coordinates, routeSeconds: r.route.seconds,
      departureAt: '2026-10-15T09:00:00+03:00', selectedFastProvider: r.provider, selectedFastRoute: r.route,
      valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: c.validation});
    assert.ok(q.componentAudit.missing.includes('odintsovo'));
    assert.equal(tollsForApi(q.tolls, q.fastValidation).amount, null);
  }
});
