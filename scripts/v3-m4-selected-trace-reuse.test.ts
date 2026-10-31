import test from 'node:test';
import assert from 'node:assert/strict';
import {validateKnownM4Plazas} from '../lib/toll-engine/m4-route-validator.ts';
import {resolveSelectedM4Endpoints} from '../lib/toll-engine/m4-production.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {Coordinate} from '../lib/tolls.ts';
const route:Coordinate[]=[[40.04738,50.7458],[40.04738,50.7508],[40.04738,50.7558]];
const trace:TollValidation={status:'toll',source:'Valhalla map matching',complete:true,boothEventCoverage:'complete',
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
test('incomplete, ambiguous, non-toll and wrong-node trace never replace crossing proof',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('',{status:503});
 try{
  for(const unsafe of [
   {...trace,complete:false},
   {...trace,boothEventCoverage:'partial' as const},
   {...trace,tollBooths:[{...trace.tollBooths![0],edgeToll:false}]},
   {...trace,tollBooths:[{...trace.tollBooths![0],osmNodeId:'not-the-booth'}]},
  ]){
   const result=await validateKnownM4Plazas(route,60,true,unsafe);
   assert.equal(result.confirmedCount,0);assert.equal(result.complete,false);
  }
 }finally{globalThis.fetch=original;}
});
