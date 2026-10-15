import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {deriveM12FromOsrm} from '../lib/toll-engine/m12-osrm-span.ts';
import {validateKnownM4Plazas} from '../lib/toll-engine/m4-route-validator.ts';
import {matrixM11Component} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import type {Coordinate} from '../lib/tolls.ts';
const shape:Coordinate[]=[[38,55],[38.01,55],[38.02,55],[38.03,55],[38.04,55]];
const step=(coordinates:Coordinate[],ref='М-12')=>({distance:1000,ref,geometry:{coordinates}});
test('OSRM M12 span follows exactly the chosen geometry in either direction',()=>{
 for(const coordinates of [shape,[...shape].reverse()]){
  const result=deriveM12FromOsrm([{steps:[step(coordinates.slice(0,3)),step(coordinates.slice(2))]}],coordinates);
  assert.equal(result.candidate,true);assert.ok(result.span);assert.equal(result.reason,null);
 }
});
test('M12 destinations, disjoint entries and mismatched overview cannot manufacture a complete vector',()=>{
 assert.equal(deriveM12FromOsrm([{steps:[{...step(shape,'М-7'),destinations:'М-12: Москва'}]}],shape).candidate,false);
 const disconnected=deriveM12FromOsrm([{steps:[step(shape.slice(0,2)),step(shape.slice(1,4),'М-7'),step(shape.slice(3))]}],shape);
 assert.equal(disconnected.candidate,true);assert.equal(disconnected.span,null);assert.ok(disconnected.endpointSpan);
 assert.equal(deriveM12FromOsrm([{steps:[step(shape)]}],shape.slice(1)).endpointSpan,null);
});
test('M4 worker pool completes candidates in route order with at most two remote requests',async()=>{
 const record=JSON.parse(readFileSync('experiments/nationwide-tolls/live-controls/2026-10-13-stage10-ui-volnovakha-moscow.json','utf8'));
 const coordinates=JSON.parse(gunzipSync(readFileSync(record.selectedRawFile)).toString()).routes[0].geometry.coordinates;
 const original=globalThis.fetch;let active=0,peak=0,calls=0;
 globalThis.fetch=async()=>{calls++;active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,calls===1?25:3));active--;return Response.json({edges:[{toll:false,names:['М-4']} ]});};
 try{const result=await validateKnownM4Plazas(coordinates,record.seconds);assert.equal(result.complete,true);assert.equal(result.checkedCandidateCount,result.candidateCount);assert.equal(result.unknownCount,0);assert.ok(calls>2);assert.ok(peak<=2);assert.deepEqual(result.checks.map(c=>c.km),[672,636,620,545,515,460,416,355,339,322,228,133,71,62]);}finally{globalThis.fetch=original;}
});
test('M11 retains departure fare overnight and across an intervening weekend',()=>{
 const p={boundaryStatus:'resolved',traversal:{entryPointId:'p67',exitPointId:'p124'}};
 const daily=matrixM11Component(p,'2026-10-13T19:00:00+03:00',0);
 assert.ok(daily?.tolls);
 assert.equal(matrixM11Component(p,'2026-10-13T19:00:00+03:00',17*3600)?.tolls.amount,daily.tolls.amount);
 assert.equal(matrixM11Component(p,'2026-10-13T19:00:00+03:00',7*86400)?.tolls.amount,daily.tolls.amount);
});

test('new M4 path checks only its outer boundaries, never intermediate PVPs',async()=>{
 const record=JSON.parse(readFileSync('experiments/nationwide-tolls/live-controls/2026-10-13-stage10-ui-volnovakha-moscow.json','utf8'));
 const coordinates=JSON.parse(gunzipSync(readFileSync(record.selectedRawFile)).toString()).routes[0].geometry.coordinates;
 const original=globalThis.fetch;let calls=0;
 const {M4_PLAZA_NODES}=await import('../lib/toll-engine/m4-plaza-nodes.ts');
 globalThis.fetch=async()=>{calls++;return Response.json({edges:M4_PLAZA_NODES.flatMap(p=>p.nodeIds.map(node_id=>({toll:true,end_node:{type:'toll_booth',node_id}})))});};
 try{
  const {resolveSelectedM4Endpoints}=await import('../lib/toll-engine/m4-production.ts');
  for(const route of [coordinates,[...coordinates].reverse()]){
   calls=0;const result=await resolveSelectedM4Endpoints(route,record.seconds);
   assert.equal(calls,2);assert.equal(result.endpointOnly,true);assert.equal(result.tolls,null);
   assert.equal(result.m4PvpPreview?.candidateCount,2);
  }
 }finally{globalThis.fetch=original;}
});
