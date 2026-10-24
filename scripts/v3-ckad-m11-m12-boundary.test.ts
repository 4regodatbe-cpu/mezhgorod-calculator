import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {inspectCkadM11ToM12} from '../lib/v3-calculation/ckad-m11-m12-boundary.ts';
import {resolveCkadProductBoundaries} from '../lib/v3-calculation/ckad-product-boundaries.ts';
import {matrixCkadComponent} from '../experiments/nationwide-tolls/engine/ckad-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {validateTollEdges, type TollValidation} from '../lib/toll-validator.ts';
import type {RouteWithGeometry} from '../lib/route-providers.ts';
import type {Coordinate} from '../lib/tolls.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';

const root = 'experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five';
const sourceRoot = 'experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding';
const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url));
const json = (p: string) => JSON.parse(read(p).toString());
const gz = (p: string) => JSON.parse(gunzipSync(read(p)).toString());
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const ids = ['max-chain-m12-ckad-m11-zsd-prim-to-arzamas', 'max-chain-m12-ckad-m11-zsd-prim-to-cheboksary'];
const cases = ids.map(id => ({id, route: gz(`${root}/cases/${id}/route.json.gz`) as RouteWithGeometry,
  capture: gz(`${root}/cases/${id}/capture.json.gz`), validation: null as TollValidation | null}));
const physical = json(`${sourceRoot}/physical-directed.json`);
type RecordedCall = {url: string; method: string; body: string; text: string; status: number; key: string};
function calls(c: typeof cases[number], breakContinuity = false): RecordedCall[] {
  return c.capture.responseRefs.map((o: {response: {path: string}}) => {
    const call = gz(`${root}/${o.response.path}`);
    if (breakContinuity && call.text.includes('8120716327')) {
      const response = JSON.parse(call.text);
      const index = response.edges.findIndex((e: {end_node?: {node_id: number}}) => e.end_node?.node_id === 8120716327);
      assert.ok(index >= 0);
      response.edges.splice(index + 1, 0, {way_id: 999999999, toll: false, names: ['Городская улица'], end_node: {node_id: 999999999}});
      call.text = JSON.stringify(response);
    }
    return call;
  });
}
async function validation(c: typeof cases[number], broken = false) {
  const replay = replayingFetch(calls(c, broken)), original = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async (input, init) => {count++; return replay.fetch(input, init);};
  try {
    const v = await validateTollEdges(c.route.coordinates);
    assert.equal(count, c.capture.validation.chunkCount); assert.deepEqual(replay.misses, []);
    return v;
  } finally {globalThis.fetch = original;}
}
const quote = (c: typeof cases[number], v = c.validation!, at = c.capture.departureAt) => calculateLegTolls({
  routeGeometry: c.route.coordinates, routeSeconds: c.route.seconds, departureAt: at, selectedFastProvider: 'OSRM',
  selectedFastRoute: c.route, valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: v});
const inspect = (c: typeof cases[number], v = c.validation!, geometry = c.route.coordinates, evidence = c.route.m11RoadEvidence) =>
  inspectCkadM11ToM12(geometry, evidence, v);
const save = (file: string, value: unknown) => {
  if (!process.env.CKAD_RESULTS_DIR) return;
  mkdirSync(`${process.env.CKAD_RESULTS_DIR}/cases`, {recursive: true});
  writeFileSync(`${process.env.CKAD_RESULTS_DIR}/${file}`, JSON.stringify(value, null, 2) + '\n');
};
const networkFetch = globalThis.fetch;
const unexpectedRequests: string[] = [];
test.before(async () => {
  globalThis.fetch = async input => {
    unexpectedRequests.push(String(input)); throw Error(`UNEXPECTED_UNRECORDED_FETCH:${String(input)}`);
  };
  for (const c of cases) {
    c.validation = await validation(c);
    const {ckadTraceBlocks, ...originalFields} = c.validation;
    assert.deepEqual(originalFields, c.capture.validation);
    assert.equal(ckadTraceBlocks?.length, 1);
  }
});
test.after(() => {globalThis.fetch = networkFetch; assert.deepEqual(unexpectedRequests, []);});

test('primary directed CKAD source bytes and49 physical witnesses retain exact object/owner provenance', () => {
  const plan = json('experiments/nationwide-tolls/checks/2026-10-17-ckad-m11-m12/inputs.json');
  for (const [p, sha256] of Object.entries(plan.sourceHashes)) if (!p.startsWith('lib/')) assert.equal(hash(read(p)), sha256, p);
  const proof = json(`${sourceRoot}/binding-proof.json`);
  assert.equal(proof.primaryResponses.length, 12);
  const rawNodes = new Map<string, {lon: number; lat: number}>();
  for (const r of proof.primaryResponses) {
    const bytes = read(`${sourceRoot}/${r.bodyFile}`); assert.equal(hash(bytes), r.sha256); assert.equal(r.status, 200);
    const text = bytes.toString();
    for (const match of text.matchAll(/<node\b([^>]*)>/g)) {
      const a = Object.fromEntries([...match[1].matchAll(/([\w:]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
      rawNodes.set(a.id, {lon: Number(a.lon), lat: Number(a.lat)});
    }
    for (const match of text.matchAll(/<way\b[^>]*\sid="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
      assert.deepEqual([...match[2].matchAll(/<nd ref="(\d+)"/g)].map(m => m[1]), proof.ways[match[1]].nodes);
      assert.match(match[2], /k="oneway" v="yes"/);
    }
  }
  for (const p of physical.witnesses) assert.deepEqual(rawNodes.get(p.nodeId), {lon: p.lon, lat: p.lat});
  assert.equal(physical.witnesses.length, 49);
  const chain = ['1189855267', '916593974', '916593983', '916593976', '1189855268'];
  for (let i = 1; i < chain.length; i++) assert.equal(proof.ways[chain[i - 1]].nodes.at(-1), proof.ways[chain[i]].nodes[0]);
  assert.equal(proof.ways['1189855268'].tags.ref, 'М-12');
  assert.equal(proof.operatorPair.from, 'М-11 Нева'); assert.equal(proof.operatorPair.to, 'М-12 Восток');
  assert.equal(hash(read(proof.operatorPdf)), proof.operatorPdfSha256);
  assert.equal(proof.independentOperatorOdReceipt, false);
});

test('both own complete traces bind the shared directed pair; old paid-only validation cannot authorize it', () => {
  for (const c of cases) {
    assert.equal(inspect(c), true);
    assert.equal(inspect(c, c.capture.validation), false);
    const b = resolveCkadProductBoundaries(c.route.coordinates, c.route.m11RoadEvidence, c.validation);
    assert.equal(b.exact, true); assert.deepEqual(b.traversal, {from: 'М-11 Нева', to: 'М-12 Восток'});
    assert.equal(matrixCkadComponent(b, c.capture.departureAt, c.route.seconds)?.tolls?.amount, 981);
  }
});

test('a free city gap lost from paidRoadEdges creates two real named trace blocks and rejects the pair', async () => {
  const c = cases[0], broken = await validation(c, true);
  assert.deepEqual(broken.paidRoadEdges, c.validation!.paidRoadEdges);
  assert.deepEqual(broken.wayIds, c.validation!.wayIds);
  assert.equal(broken.ckadTraceBlocks?.length, 2);
  assert.equal(inspect(c, broken), false);
});

test('incomplete coverage and missing/repeated/wrong boundary context or plaza fail closed', () => {
  const c = cases[0], v = c.validation!;
  const variants: Array<[string, (x: TollValidation) => void]> = [
    ['incomplete', x => {x.complete = false;}], ['partial-booths', x => {x.boothEventCoverage = 'partial';}],
    ['failed-chunk', x => {x.failedChunkCount = 1;}], ['unchecked-chunk', x => {x.checkedChunkCount = x.checkedChunkCount! - 1;}],
    ['missing-context', x => {delete x.ckadTraceBlocks;}], ['second-block', x => {x.ckadTraceBlocks!.push(x.ckadTraceBlocks![0]);}],
    ['repeat-way', x => {x.ckadTraceBlocks![0].repeatedWayId = true;}],
    ['wrong-entry', x => {x.ckadTraceBlocks![0].firstWayId = 'other';}],
    ['wrong-exit', x => {x.ckadTraceBlocks![0].lastWayId = 'other';}],
    ['wrong-before-way', x => {x.ckadTraceBlocks![0].before!.wayId = 'other';}],
    ['wrong-before-node', x => {x.ckadTraceBlocks![0].before!.endNodeId = 'other';}],
    ['wrong-link', x => {x.ckadTraceBlocks![0].after[1].wayId = 'other';}],
    ['wrong-link-direction', x => {x.ckadTraceBlocks![0].after[1].endNodeId = 'other';}],
    ['incomplete-links', x => {x.ckadTraceBlocks![0].after.pop();}],
    ['missing-M12-name', x => {x.ckadTraceBlocks![0].after[3].roadNames = [];}],
    ['missing-paid-exit', x => {x.paidRoadEdges = x.paidRoadEdges!.filter(e => e.wayId !== '1189855267');}],
    ['missing-paid-M12', x => {x.paidRoadEdges = x.paidRoadEdges!.filter(e => e.wayId !== '1189855268');}],
    ['missing-plaza', x => {x.tollBooths = x.tollBooths!.filter(b => b.osmNodeId !== '8087316064');}],
    ['wrong-plaza-way', x => {x.tollBooths!.find(b => b.osmNodeId === '8087316064')!.wayId = 'other';}],
    ['repeated-plaza', x => {x.tollBooths!.push(x.tollBooths!.find(b => b.osmNodeId === '8087316064')!);}],
  ];
  for (const [name, mutate] of variants) {const x = structuredClone(v); mutate(x); assert.equal(inspect(c, x), false, name);}
  save('negative-context-checks.json', {status: 'PASS', checked: variants.map(([name]) => name), count: variants.length});
});

test('reverse, shifted, sparse or inconsistent own geometry cannot borrow a complete trace', () => {
  const c = cases[0], e = c.route.m11RoadEvidence!;
  assert.equal(inspect(c, c.validation!, c.route.coordinates.toReversed()), false);
  const shifted = c.route.coordinates.map(([x, y]): Coordinate => x > 37 && x < 39 && y > 55.5 && y < 56.3 ? [x + 0.002, y] : [x, y]);
  assert.equal(inspect(c, c.validation!, shifted), false);
  const sparse = physical.witnesses.map((p: {lon: number; lat: number}): Coordinate => [p.lon, p.lat]);
  assert.equal(inspect(c, c.validation!, sparse), false);
  assert.equal(inspect(c, c.validation!, c.route.coordinates, {...e, malformedStrictCount: 1}), false);
  assert.equal(inspect(c, c.validation!, c.route.coordinates, {...e, strictBlocks: [e.strictBlocks[0], e.strictBlocks[0]]}), false);
  assert.equal(inspect(c, c.validation!, c.route.coordinates, {...e, strictBlocks: [{...e.strictBlocks[0], endCoordinate: [37, 56]}]}), false);
});

test('each own quote adds981 only to the known subtotal; M12 remains the sole missing component and API amount stays null', async () => {
  const completed: string[] = [];
  for (const c of cases) {
    const q = await quote(c), api = tollsForApi(q.tolls, q.fastValidation);
    assert.equal(q.componentAudit.status, 'unknown'); assert.deepEqual(q.componentAudit.missing, ['m12']);
    assert.deepEqual(q.componentAudit.priced, ['m11-15-58', 'm11-58-679', 'm11-679-684', 'ckad', 'zsd']);
    assert.equal(q.componentAudit.components.find(c => c.id === 'ckad')?.tolls?.amount, 981);
    const subtotal = q.componentAudit.components.reduce((sum, c) => sum + (c.detected && c.tolls ? c.tolls.amount : 0), 0);
    assert.equal(subtotal, 5475); assert.equal(api.amount, null); assert.equal(api.pricingStatus, 'unknown');
    assert.equal(api.priceConfirmation, 'unconfirmed');
    save(`cases/${c.id}.json`, {caseId: c.id, status: 'CASE_READY', validation: c.validation, componentAudit: q.componentAudit,
      apiTolls: api, knownSubtotalRub: subtotal, newCkadRub: 981, newlyPricedComponents: 1, confirmedFullTripFares: 0,
      ownTraceRequestsReplayed: c.capture.validation.chunkCount, networkRequests: 0});
    completed.push(c.id); save('progress.json', {status: 'IN_PROGRESS', completedCases: completed});
  }
  const c = cases[0];
  for (const at of ['2026-10-15T23:59:00+03:00', '2026-10-16T09:00:00+03:00']) {
    const q = await quote(c, c.validation!, at);
    assert.equal(q.componentAudit.components.find(c => c.id === 'ckad')?.tolls?.amount, 981);
    assert.equal(tollsForApi(q.tolls, q.fastValidation).amount, null);
  }
});

test('independent own Voronezh OSRM keeps7254 and gains no CKAD merely from its historical case name', async () => {
  const id = 'max-chain-m4-ckad-m11-zsd-prim-to-voronezh';
  const c = {id, route: gz(`${root}/cases/${id}/route.json.gz`) as RouteWithGeometry,
    capture: gz(`${root}/cases/${id}/capture.json.gz`), validation: null as TollValidation | null};
  c.validation = c.capture.validation;
  assert.equal(inspect(c), false);
  const b = resolveCkadProductBoundaries(c.route.coordinates, c.route.m11RoadEvidence);
  assert.equal(b.exact, false);
  const auxiliary = c.capture.responseRefs.slice(c.capture.validation.chunkCount)
    .map((o: {response: {path: string}}) => gz(`${root}/${o.response.path}`));
  assert.equal(auxiliary.length, 1, 'Replay the existing own local M4 trace too');
  const replay = replayingFetch(auxiliary), original = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async (input, init) => {count++; return replay.fetch(input, init);};
  try {
    const q = await quote(c);
    assert.equal(q.componentAudit.priced.includes('ckad'), false);
    assert.equal(tollsForApi(q.tolls, c.validation!).amount, 7254);
    assert.equal(count, 1); assert.deepEqual(replay.misses, []);
  } finally {globalThis.fetch = original;}
});

test('V3 API uses each own OSRM and exact trace responses while preserving unknown full fare', async () => {
  for (const c of cases) {
    const old = gz(c.capture.input.capture);
    const osrm = (old.calls as RecordedCall[]).find(c => c.url.includes('router.project-osrm.org'))!;
    const replay = replayingFetch(calls(c)), original = globalThis.fetch;
    let traced = 0;
    globalThis.fetch = async (input, init) => {
      const u = new URL(String(input));
      if (u.pathname === '/trace_attributes') {traced++; return replay.fetch(input, init);}
      if (u.hostname === 'router.project-osrm.org') {assert.equal(u.href, osrm.url); return new Response(osrm.text, {status: 200});}
      if (u.hostname === 'valhalla1.openstreetmap.de' || u.hostname === 'brouter.de') return new Response('{}', {status: 503});
      throw Error(`UNEXPECTED_FETCH:${u.href}`);
    };
    try {
      const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
        body: JSON.stringify({from: old.record.spec.from, to: old.record.spec.to, departureAt: c.capture.departureAt})}));
      assert.equal(response.status, 200);
      const fast = (await response.json()).legs[0].fast;
      assert.equal(fast.meters, c.route.meters); assert.equal(fast.seconds, c.route.seconds);
      assert.deepEqual(fast.quality.providers, ['OSRM']);
      assert.equal(fast.tolls.amount, null); assert.equal(fast.tolls.pricingStatus, 'unknown');
      // Public API deliberately does not expose componentAudit. Its unknown
      // explanation must retain M12 and must no longer report CKAD missing.
      assert.match(fast.tolls.segments.join('\n'), /m12_current_operator_pair_not_bound/);
      assert.doesNotMatch(fast.tolls.segments.join('\n'), /ckad_east_arc_not_proven/);
      assert.deepEqual(replay.misses, []); assert.equal(traced, c.capture.validation.chunkCount);
    } finally {globalThis.fetch = original;}
  }
});
