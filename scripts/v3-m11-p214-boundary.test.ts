import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
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
