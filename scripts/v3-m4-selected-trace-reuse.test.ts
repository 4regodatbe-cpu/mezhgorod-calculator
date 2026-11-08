import test from 'node:test';
import assert from 'node:assert/strict';
import {validateKnownM4Plazas} from '../lib/toll-engine/m4-route-validator.ts';
import {resolveSelectedM4Endpoints} from '../lib/toll-engine/m4-production.ts';
import {roadRouteSignature} from '../lib/toll-engine/road-boundaries.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {Coordinate} from '../lib/tolls.ts';
const route:Coordinate[]=[[40.04738,50.7458],[40.04738,50.7508],[40.04738,50.7558]];
const trace:TollValidation={status:'toll',source:'Valhalla map matching',complete:true,boothEventCoverage:'complete',
 routeSignature:roadRouteSignature(route),
 tollEdgeCount:1,checkedEdgeCount:1,wayIds:[],roadNames:[],message:'complete selected route fixture',
 tollBooths:[{osmNodeId:'7678126300',wayId:'1042937798',roadNames:[],edgeIndex:0,edgeToll:true}]};
test('complete selected-route positive booth proof survives local service failure without another request',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return new Response('',{status:503});};
 try{
  const result=await resolveSelectedM4Endpoints(route,60,trace);
  assert.equal(result.exact,true);assert.deepEqual(result.m4PvpPreview?.confirmedPvps,['m4-636']);
  assert.equal(calls,0);assert.equal(result.tolls,null,'road proof never manufactures money');
 }finally{globalThis.fetch=original;}
});
test('incomplete traces never replace crossing proof and stay unresolved',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('',{status:503});
 try{
  for(const unsafe of [
   {...trace,complete:false},
   {...trace,boothEventCoverage:'partial' as const},
  ]){
   const result=await validateKnownM4Plazas(route,60,true,unsafe);
   assert.equal(result.confirmedCount,0);assert.equal(result.complete,false);
  }
 }finally{globalThis.fetch=original;}
});

test('complete trace resolves a non-toll or wrong-node negative without local fallback',async()=>{
 let calls=0;const original=globalThis.fetch;globalThis.fetch=async()=>{calls++;return new Response('',{status:503});};
 try{
  for(const unsafe of [
   {...trace,tollBooths:[{...trace.tollBooths![0],edgeToll:false}]},
   {...trace,tollBooths:[{...trace.tollBooths![0],osmNodeId:'not-the-booth'}]},
  ]){
   const result=await validateKnownM4Plazas(route,60,true,unsafe);
   assert.equal(result.confirmedCount,0);assert.equal(result.rejectedCount,1);assert.equal(result.complete,true);
  }
  assert.equal(calls,0,'complete selected-route trace is authoritative; local map matching must not run again');
 }finally{globalThis.fetch=original;}
});

test('a complete trace for a different geometry cannot confirm or reject the selected route',async()=>{
 const otherRoute:Coordinate[]=[[40.04738,50.7458],[40.04738,50.7508],[40.04738,50.7568]];
 let calls=0;const original=globalThis.fetch;globalThis.fetch=async()=>{calls++;return new Response('',{status:503});};
 try{
  for(const foreignTrace of [trace,{...trace,tollBooths:[],tollEdgeCount:0,status:'free' as const}]){
   const result=await validateKnownM4Plazas(otherRoute,60,true,foreignTrace);
   assert.equal(result.confirmedCount,0,'foreign positive event is not transferable');
   assert.equal(result.rejectedCount,0,'foreign complete-negative list is not authoritative');
   assert.ok(result.unknownCount>0,'failed validation remains unknown rather than free');
   assert.equal(result.complete,false);
  }
  assert.ok(calls>0,'geometry mismatch must use selected-route validation instead of the foreign trace');
 }finally{globalThis.fetch=original;}
});
