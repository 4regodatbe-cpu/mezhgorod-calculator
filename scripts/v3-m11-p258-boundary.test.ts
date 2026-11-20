import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {inspectM11P258Exit} from '../lib/v3-calculation/m11-p258-exit-boundary.ts';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {RouteWithGeometry} from '../lib/route-providers.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {Coordinate} from '../lib/tolls.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';

const root = 'experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five';
const base = `${root}/cases/pair-m11-zsd-prim-to-torzhok`;
const readGzip = (p: string) => JSON.parse(gunzipSync(readFileSync(new URL('../' + p, import.meta.url))).toString());
const route = readGzip(`${base}/route.json.gz`) as RouteWithGeometry;
const capture = readGzip(`${base}/capture.json.gz`) as {validation: TollValidation; departureAt: string;
  input: {capture: string}; responseRefs: {response: {path: string}}[]};
const validation = capture.validation;
const date = capture.departureAt;
const physical = (geometry = route.coordinates, v = validation, evidence = route.m11RoadEvidence) =>
  inspectM11P258Exit(geometry, evidence, v);
const quote = (r = route, v = validation, at = date) => calculateLegTolls({routeGeometry: r.coordinates,
  routeSeconds: r.seconds, departureAt: at, selectedFastProvider: 'OSRM', selectedFastRoute: r,
  valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: v});

test('p258 primary raw bytes, named258 facility and connected paid links retain their proof hashes', () => {
  const prefix = '../experiments/nationwide-tolls/source-snapshots/m11/2026-10-17-p258-binding/';
  const proof = JSON.parse(readFileSync(new URL(prefix + 'binding-proof.json', import.meta.url), 'utf8'));
  for (const raw of proof.rawSources as {bodyFile: string; sha256: string; status: number}[]) {
    assert.equal(raw.status, 200);
    assert.equal(createHash('sha256').update(readFileSync(new URL(prefix + raw.bodyFile, import.meta.url))).digest('hex'), raw.sha256);
  }
  assert.equal(proof.operatorPoint.id, 'p258');
  assert.match(proof.osmNamedFacility.tags.name, /258 км/);
  assert.equal(proof.observedGate.nodeId, '3183012434');
  const links = proof.directedTopology.slice(1, -1) as {nodes: string[]; tags: {oneway: string; toll: string}}[];
  for (let i = 0; i < links.length; i++) {
    assert.equal(links[i].tags.oneway, 'yes'); assert.equal(links[i].tags.toll, 'yes');
    if (i) assert.equal(links[i - 1].nodes.at(-1), links[i].nodes[0]);
  }
});

test('own complete trace resolves p679→p258 without widening the generic mainline endpoint tolerance', () => {
  assert.equal(physical(), true);
  assert.equal(resolveM11ProductBoundaries(route.coordinates, route.seconds, date, route.m11RoadEvidence).resolved, false);
  const bound = resolveM11ProductBoundaries(route.coordinates, route.seconds, date, route.m11RoadEvidence, validation);
  assert.equal(bound.resolved, true); assert.equal(bound.parts?.from, 'p679'); assert.equal(bound.parts?.to, 'p258');
  assert.equal(bound.headDetected, false);
});

test('incomplete coverage, missing/wrong/duplicate booth, missing paid link and extra M11 plaza fail closed', () => {
  const variants: TollValidation[] = [
    {...validation, complete: false}, {...validation, boothEventCoverage: 'partial'},
    {...validation, tollBooths: validation.tollBooths!.filter(b => b.osmNodeId !== '3183012434')},
    {...validation, tollBooths: validation.tollBooths!.map(b => b.osmNodeId === '3183012434' ? {...b, wayId: 'wrong'} : b)},
    {...validation, tollBooths: [...validation.tollBooths!, validation.tollBooths!.find(b => b.osmNodeId === '3183012434')!]},
    {...validation, paidRoadEdges: validation.paidRoadEdges!.filter(e => e.wayId !== '312444614')},
    {...validation, tollBooths: [...validation.tollBooths!, {osmNodeId: 'unproved', wayId: 'unproved', edgeIndex: 99, edgeToll: true, roadNames: ['М-11']}]},
  ];
  for (const v of variants) assert.equal(physical(route.coordinates, v), false);
});

test('borrowed trace cannot price reverse, neighbouring, sparse/chord or inconsistent strict evidence', () => {
  assert.equal(physical(route.coordinates.toReversed()), false);
  const shifted = route.coordinates.map(([x, y]): Coordinate => x > 34.90 && x < 34.92 && y > 57.22 && y < 57.24 ? [x + 0.002, y] : [x, y]);
  assert.equal(physical(shifted), false);
  const access = route.coordinates.findIndex(p => p[0] === 34.90904 && p[1] === 57.23313);
  assert.ok(access > 0);
  assert.equal(physical([route.coordinates[0], ...route.coordinates.slice(access)]), false);
  const e = route.m11RoadEvidence!;
  assert.equal(physical(route.coordinates, validation, {...e, strictBlocks: [e.strictBlocks[0], e.strictBlocks[0]]}), false);
  assert.equal(physical(route.coordinates, validation, {...e, malformedStrictCount: 1}), false);
  assert.equal(physical(route.coordinates, validation, {...e, strictBlocks: [{...e.strictBlocks[0], endCoordinate: [34, 57]}]}), false);
});

test('own selected quote composes2400+94+300 at departure; later Friday does not reprice Thursday', async () => {
  for (const [at, expected] of [[date, 2794], ['2026-10-15T23:59:00+03:00', 2794], ['2026-10-16T09:00:00+03:00', 2884]] as const) {
    const q = await quote(route, validation, at);
    assert.equal(q.componentAudit.status, 'priced'); assert.deepEqual(q.componentAudit.missing, []);
    assert.deepEqual(q.componentAudit.priced, ['m11-58-679', 'm11-679-684', 'zsd']);
    const api = tollsForApi(q.tolls, q.fastValidation);
    assert.equal(api.amount, expected); assert.equal(api.priceConfirmation, 'unconfirmed');
  }
  const v = {...validation, paidRoadEdges: validation.paidRoadEdges!.filter(e => e.wayId !== '312444614')};
  const incomplete = await quote(route, v);
  assert.equal(tollsForApi(incomplete.tolls, incomplete.fastValidation).amount, null);
  assert.ok(incomplete.componentAudit.missing.includes('m11-58-679'));
});

test('independent through-M11 own OSRM route keeps its existing complete composition5424', async () => {
  const other = readGzip('experiments/nationwide-tolls/checks/2026-10-17-zsd-selected-osrm-trace/capture.json.gz');
  assert.equal(inspectM11P258Exit(other.record.route.coordinates, other.record.route.m11RoadEvidence, other.record.validation), false);
  const q = await quote(other.record.route, other.record.validation);
  assert.equal(tollsForApi(q.tolls, q.fastValidation).amount, 5424);
});

async function api(traceUnavailable: boolean) {
  const old = readGzip(capture.input.capture);
  const osrm = (old.calls as {url: string; text: string}[]).find(c => c.url.includes('router.project-osrm.org'))!;
  const replay = replayingFetch(capture.responseRefs.map(ref => readGzip(`${root}/${ref.response.path}`)));
  const original = globalThis.fetch;
  const requests: string[] = [];
  let traced = 0;
  globalThis.fetch = async (input, init) => {
    const u = new URL(String(input)); requests.push(u.href);
    if (u.pathname === '/trace_attributes') {
      traced++;
      return traceUnavailable ? new Response('{}', {status: 503}) : replay.fetch(input, init);
    }
    if (u.hostname === 'router.project-osrm.org') { assert.equal(u.href, osrm.url); return new Response(osrm.text, {status: 200}); }
    if (u.hostname === 'valhalla1.openstreetmap.de' || u.hostname === 'brouter.de') return new Response('{}', {status: 503});
    throw Error(`UNEXPECTED_FETCH:${u.href}`);
  };
  try {
    const response = await POST(new NextRequest('http://localhost/api/v3/calculate', {method: 'POST',
      body: JSON.stringify({from: old.record.spec.from, to: old.record.spec.to, departureAt: date})}));
    assert.equal(response.status, 200);
    assert.deepEqual(replay.misses, []);
    assert.equal(traced, 4);
    assert.equal(requests.some(url => url.includes('avoid_toll') || url.includes('toll_booth_penalty')), false);
    return (await response.json()).legs[0].fast;
  } finally { globalThis.fetch = original; }
}

test('V3 API returns2794 on the selected own OSRM trace and preserves unknown when that trace is unavailable', async () => {
  const ready = await api(false);
  assert.equal(ready.meters, route.meters); assert.equal(ready.seconds, route.seconds);
  assert.deepEqual(ready.quality.providers, ['OSRM']);
  assert.equal(ready.tolls.amount, 2794); assert.equal(ready.tolls.pricingStatus, 'priced');
  // Public API omits internal confirmation metadata under the existing policy.
  assert.equal('priceConfirmation' in ready.tolls, false);
  const unknown = await api(true);
  assert.equal(unknown.tolls.amount, null); assert.equal(unknown.tolls.pricingStatus, 'unknown');
});
