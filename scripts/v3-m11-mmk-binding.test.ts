import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import snapshot from '../experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json' with {type:'json'};
import {inspectM11MmkHeadBoundary} from '../lib/v3-calculation/m11-mmk-head-boundary.ts';
import {matrixM11HeadComponent} from '../experiments/nationwide-tolls/engine/m11-head-route-adapter.mjs';
import type {Coordinate} from '../lib/tolls.ts';
const point=(n:{lon:number;lat:number}):Coordinate=>[n.lon,n.lat];
const routeFor=(g:typeof snapshot.gates[number])=>[point(g.before),point(g.gate),point(g.after)];
const date='2026-10-15T12:00:00+03:00';
test('primary OSM bytes and original operator identity PDF match the recorded proof hashes',()=>{
 const base=new URL('../experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/',import.meta.url);
 const packed=readFileSync(new URL(snapshot.rawFile,base)),raw=gunzipSync(packed);
 assert.equal(createHash('sha256').update(packed).digest('hex'),snapshot.archiveSHA256);
 assert.equal(createHash('sha256').update(raw).digest('hex'),snapshot.rawSHA256);
 const pdf=readFileSync(new URL('../'+snapshot.operatorIdentitySource,import.meta.url));
 assert.equal(createHash('sha256').update(pdf).digest('hex'),snapshot.operatorPdfSHA256);
 for(const g of snapshot.gates){assert.match(raw.toString(),new RegExp(`id="${g.gate.id}"`));assert.equal(g.wayTags.oneway,'yes');assert.equal(g.gateTags.fee,'yes');}
});
test('both directed MMK lanes select their own existing fare, never a CKAD or Moscow row',()=>{
 for(const g of snapshot.gates){
  const proof=inspectM11MmkHeadBoundary(routeFor(g));
  assert.equal(proof.boundaryStatus,'resolved');assert.equal(proof.from,g.from);assert.equal(proof.to,g.to);
  const quote=matrixM11HeadComponent({...proof,paymentAt:date,paymentWindowSeconds:0});
  assert.equal(quote.tolls?.amount,g.from==='mmk_a107'?280:200);assert.ok(quote.tolls?.segments.some(s=>s.includes('mmk_a107')));
 }
});
test('wrong-way, nearby and interpolated chords do not authorize MMK entry',()=>{
 for(const g of snapshot.gates){
  assert.equal(inspectM11MmkHeadBoundary(routeFor(g).toReversed()).boundaryStatus,'unknown');
  assert.equal(inspectM11MmkHeadBoundary(routeFor(g).map(([x,y]):Coordinate=>[x,y+0.002])).candidate,false);
  const [x,y]=point(g.gate);assert.equal(inspectM11MmkHeadBoundary([[x-0.1,y-0.1],[x+0.1,y+0.1]]).boundaryStatus,'unknown');
 }
});
