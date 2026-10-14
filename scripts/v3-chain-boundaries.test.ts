import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import {unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {facilityAnchors,nearestSegment} from '../lib/toll-engine/m11-moscow-geometry.ts';
import type {Coordinate} from '../lib/tolls.ts';
import type {M11RoadEvidence} from '../lib/toll-engine/m11-road-evidence.ts';
const root=new URL('../experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/',import.meta.url);
const folder=readdirSync(root).find(name=>name.startsWith('kazan-spb-ckad-2026-'))!;
const captured=JSON.parse(gunzipSync(readFileSync(new URL(folder+'/capture.json.gz',root))).toString());
const date='2026-10-13T09:00:00+03:00';
test('actual M12–CKAD–M11 chain resolves mainline without inventing a Moscow head',()=>{
 const route=captured.route;
 const boundaries=resolveM11ProductBoundaries(route.coordinates,route.seconds,date,route.m11RoadEvidence);
 assert.equal(boundaries.resolved,true);assert.equal(boundaries.headDetected,true);
 assert.equal(boundaries.parts?.head,null,'partial head entry is still physically unbound');
 assert.equal(boundaries.parts?.from,'p58');assert.equal(boundaries.parts?.to,'p679');
 const quote=matrixM11GeometryComponent({exact:boundaries.resolved,parts:boundaries.parts})!;
 assert.equal(quote.components.find(c=>c.id==='m11-58-679')?.tolls?.amount,3900);
 assert.equal(quote.components.find(c=>c.id==='m11-15-58')?.tolls,null);
 assert.equal(quote.tolls,null,'known mainline must not substitute for complete head+mainline');
});
test('a genuinely headless mainline pair does not manufacture a head charge',()=>{
 const all=captured.route.coordinates as Coordinate[];
 const first=Math.round(nearestSegment(all,facilityAnchors('p58')).index);
 const last=Math.round(nearestSegment(all,facilityAnchors('p679')).index);
 const route=all.slice(first,last+1);
 for(const shape of [route,route.toReversed()]){
  const evidence:M11RoadEvidence={provider:'osrm',malformedStrictCount:0,candidateClues:[],strictBlocks:[{
   provider:'osrm',legIndex:0,sourceStartIndex:0,sourceEndIndex:1,beginKm:0,endKm:600,lengthKm:600,
   beginCoordinate:shape[0],endCoordinate:shape.at(-1)!,labels:['М-11']}]};
  const boundaries=resolveM11ProductBoundaries(shape,20000,date,evidence);
  assert.equal(boundaries.resolved,true);assert.equal(boundaries.headDetected,false);
  const result=matrixM11GeometryComponent({exact:true,parts:boundaries.parts})!;
  assert.equal(result.components.find(c=>c.id==='m11-15-58')?.detected,false);
  assert.equal(result.tolls?.amount,3900);
 }
});
test('real unnamed ZSD/M11 events have their own identity and no invented fare',()=>{
 const validation={...captured.validation,complete:true,roadNames:[],tollBooths:[
  {osmNodeId:'933974949',wayId:'381576635',roadNames:[],edgeIndex:0,edgeToll:true},
  {osmNodeId:'7014845616',wayId:'241701006',roadNames:[],edgeIndex:1,edgeToll:false}]};
 const result=unpricedRoadCoverage({segments:[],candidateNetworks:[],m1m3Candidates:[],validation});
 assert.deepEqual(result.matchedCoreProducts,['m11']);
 assert.deepEqual(result.regionalProducts.map(p=>p.id),['zsd']);
});


test('reverse-chain unnamed booths map to ZSD and M4, preserving incomplete trace refusal',()=>{
 const validation={...captured.validation,complete:true,roadNames:[],tollBooths:[
  {osmNodeId:'318102347',wayId:'375574651',roadNames:[],edgeIndex:0,edgeToll:true},
  {osmNodeId:'6257559336',wayId:'668217934',roadNames:[],edgeIndex:1,edgeToll:false}]};
 const result=unpricedRoadCoverage({segments:[],candidateNetworks:[],m1m3Candidates:[],validation});
 assert.deepEqual(result.matchedCoreProducts,['m4']);
 assert.deepEqual(result.regionalProducts.map(p=>p.id),['zsd']);
 const incomplete=unpricedRoadCoverage({segments:[],candidateNetworks:[],m1m3Candidates:[],validation:{...validation,complete:false}});
 assert.ok(incomplete.regionalProducts.some(p=>p.id==='unknown-paid-road'));
});
