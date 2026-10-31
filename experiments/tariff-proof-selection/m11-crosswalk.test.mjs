import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
const root = new URL('../../', import.meta.url);
const load = path => JSON.parse(readFileSync(new URL(path, root)));
const base = 'experiments/nationwide-tolls/source-snapshots/';
const bytes = readFileSync(new URL(base+'systemic-road-audit-2026-10-15/runs/pair-m11-ckad-noginsk-to-tver/2026-10-16T01-29-30-153Z-capture.json.gz', root));
const capture = JSON.parse(gunzipSync(bytes));
const matrix = load(base+'m11/2026-10-12-58-679-category1-a1-current.json').currentOrder274Matrix;
test('retained selected route proves M11 to M10 exit, not a p58 entry or reverse booth', () => {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '3235c04e3f0d95c30df518d159c3e47bce988a0c4a0b1b5700b5ee9e206f61b1');
  const edges = JSON.parse(capture.calls[4].text).edges;
  assert.deepEqual(edges.slice(63,73).map(e=>e.way_id), [1307036919,1301779282,1301779282,1307036921,1307036920,1307036920,599932042,423187295,599934826,900434333]);
  assert.equal(edges[67].end_node.node_id,6588472831);
  assert.ok(edges[63].names.includes('М-11'));
  assert.ok(edges[72].names.includes('М-10'));
  assert.ok(!edges.some(e=>e.end_node?.node_id===6588472832));
  const booths = capture.record.validation.tollBooths.map(b=>b.osmNodeId);
  assert.deepEqual(booths,['8087316065','6588472831']);
  assert.ok(!booths.includes('3243217926'));
});
test('saved current direct cells distinguish reciprocal price from physical direction and neighbor',()=>{
  const cell=(profile,from,to)=>matrix.dayProfiles[profile].directRowsByOrigin[from][matrix.pointOrder.indexOf(to)];
  for(const [profile,amount,neighbor] of [['monThu',610,460],['friSun',750,570]]){
    assert.equal(cell(profile,'p58','p147'),amount);
    assert.equal(cell(profile,'p147','p58'),amount);
    assert.equal(cell(profile,'p58','p124'),neighbor);
    assert.notEqual(amount,neighbor);
  }
  const spatial=load('data/tolls/m11/2026-10-01-58-679-spatial-anchors.json');
  assert.equal(spatial.facilities.some(f=>f.tariffPointId==='p147'),false);
});
