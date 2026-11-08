import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {inspectCkadM11ToEgoryevskoye} from '../lib/v3-calculation/ckad-m11-egoryevskoye-boundary.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {RouteWithGeometry} from '../lib/route-providers.ts';
import type {Coordinate} from '../lib/tolls.ts';
const read = (p: string) => readFileSync(new URL('../' + p, import.meta.url));
const capture = JSON.parse(gunzipSync(read('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz')).toString());
const route = capture.record.route as RouteWithGeometry;
const validation = JSON.parse(read('experiments/nationwide-tolls/checks/2026-10-18-ckad-ramenskoe-boundary/diagnosis.json').toString()).rebuiltValidation as TollValidation;
const inspect = (v = validation, coordinates = route.coordinates, evidence = route.m11RoadEvidence) => inspectCkadM11ToEgoryevskoye(coordinates, evidence, v);

test('own saved current named trace proves directed M11 to Egoryevskoye; old paid-only snapshot cannot', () => {
  assert.equal(inspect(), true);
  assert.equal(inspect(capture.record.validation), false);
});

test('incomplete trace, other boundary, repeated passage or wrong plaza cannot borrow proof', () => {
  const variants: Array<[string, (v: TollValidation) => void]> = [
    ['status', v => {v.status = 'unknown';}],
    ['incomplete', v => {v.complete = false;}],
    ['partial booth coverage', v => {v.boothEventCoverage = 'partial';}],
    ['failed chunk', v => {v.failedChunkCount = 1;}],
    ['unchecked chunk', v => {v.checkedChunkCount = 0;}],
    ['no context', v => {delete v.ckadTraceBlocks;}],
    ['second block', v => {v.ckadTraceBlocks!.push(v.ckadTraceBlocks![0]);}],
    ['repeat', v => {v.ckadTraceBlocks![0].repeatedWayId = true;}],
    ['first way', v => {v.ckadTraceBlocks![0].firstWayId = 'other';}],
    ['last way', v => {v.ckadTraceBlocks![0].lastWayId = 'other';}],
    ['before way', v => {v.ckadTraceBlocks![0].before!.wayId = 'other';}],
    ['before node', v => {v.ckadTraceBlocks![0].before!.endNodeId = 'other';}],
    ['before name', v => {v.ckadTraceBlocks![0].before!.roadNames = [];}],
    ['after way', v => {v.ckadTraceBlocks![0].after[0].wayId = 'other';}],
    ['after node', v => {v.ckadTraceBlocks![0].after[0].endNodeId = 'other';}],
    ['after order', v => {v.ckadTraceBlocks![0].after.reverse();}],
    ['after missing', v => {v.ckadTraceBlocks![0].after.pop();}],
    ['after name', v => {v.ckadTraceBlocks![0].after[3].roadNames = ['М-12'];}],
    ['CKAD link', v => {v.ckadTraceBlocks![0].after[1].roadNames = ['А-113'];}],
    ['paid exit missing', v => {v.paidRoadEdges = v.paidRoadEdges!.filter(e => e.wayId !== '886019081');}],
    ['plaza missing', v => {v.tollBooths = [];}],
    ['plaza repeated', v => {v.tollBooths!.push(v.tollBooths!.find(b => b.osmNodeId === '8087316064')!);}],
    ['plaza way', v => {v.tollBooths!.find(b => b.osmNodeId === '8087316064')!.wayId = 'other';}],
  ];
  for (const [name, mutate] of variants) {const v = structuredClone(validation); mutate(v); assert.equal(inspect(v), false, name);}
});

test('reverse, shift, sparse, detour, malformed or mismatched strict end fail closed', () => {
  const e = route.m11RoadEvidence!;
  assert.equal(inspect(validation, route.coordinates.toReversed()), false);
  assert.equal(inspect(validation, route.coordinates.map(([x, y]): Coordinate => [x + 0.002, y])), false);
  assert.equal(inspect(validation, route.coordinates.filter((_, i) => i % 15 === 0)), false);
  const detour = structuredClone(route.coordinates); detour.splice(1060, 0, [38, 56]);
  assert.equal(inspect(validation, detour), false);
  assert.equal(inspect(validation, route.coordinates, {...e, malformedStrictCount: 1}), false);
  assert.equal(inspect(validation, route.coordinates, {...e, strictBlocks: [e.strictBlocks[0], e.strictBlocks[0]]}), false);
  assert.equal(inspect(validation, route.coordinates, {...e, strictBlocks: [{...e.strictBlocks[0], endCoordinate: [37, 56]}]}), false);
  assert.equal(inspect(validation, [[NaN, 56], ...route.coordinates]), false);
});
