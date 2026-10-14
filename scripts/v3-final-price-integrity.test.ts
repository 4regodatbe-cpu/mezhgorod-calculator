import test from 'node:test';
import assert from 'node:assert/strict';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
const value=(amount:number)=>({amount,weekdayAmount:amount,weekendAmount:amount,
 period:'allDays',segments:[],confidence:'matched' as const});

test('composition rejects fractional and unsafe money in every displayed amount',()=>{
 for(const field of ['amount','weekdayAmount','weekendAmount']) {
  for(const amount of [0.5,Number.MAX_SAFE_INTEGER+1]) {
   const result=composeRouteTolls([{id:'m11',detected:true,tolls:{...value(1),[field]:amount}}]);
   assert.equal(result.status,'unknown'); assert.equal(result.tolls,null);
  }
 }
});

test('individually safe fares cannot overflow any route total',()=>{
 for(const field of ['amount','weekdayAmount','weekendAmount']) {
  const result=composeRouteTolls([
   {id:'m11',detected:true,tolls:{...value(0),[field]:Number.MAX_SAFE_INTEGER}},
   {id:'ckad',detected:true,tolls:{...value(0),[field]:1}},
  ]);
  assert.equal(result.status,'unknown'); assert.equal(result.tolls,null);
 }
 assert.equal(composeRouteTolls([{id:'m11',detected:true,tolls:value(Number.MAX_SAFE_INTEGER)}]).tolls?.amount,Number.MAX_SAFE_INTEGER);
});

const coordinates:[number,number][]=[[60,60],[60.01,60.01]];
const args={routeGeometry:coordinates,routeSeconds:100,departureAt:'2026-10-14T12:00:00+03:00',
 selectedFastProvider:'OSRM',selectedFastRoute:{coordinates,meters:1000,seconds:100},
 valhallaEvidence:null,confirmedFreeRoute:{meters:100000,seconds:10000}};
const validation=(status:TollValidation['status'],complete?:boolean):TollValidation=>({
 status,complete,source:'Valhalla map matching',tollEdgeCount:status==='toll'?1:0,
 checkedEdgeCount:1,wayIds:[],roadNames:[],message:'selected route test evidence',
});

test('a free alternative and incomplete selected-route free evidence never produce zero',async()=>{
 for(const evidence of [null,validation('free'),validation('free',false),validation('toll',true)]) {
  const result=await calculateLegTolls({...args,diagnosticFastValidation:evidence});
  const api=tollsForApi(result.tolls,result.fastValidation);
  assert.equal(api.pricingStatus,'unknown');
  for(const field of ['amount','weekdayAmount','weekendAmount'] as const)assert.equal(api[field],null);
 }
});

test('complete selected-route free evidence still permits an explicit zero',async()=>{
 const result=await calculateLegTolls({...args,diagnosticFastValidation:validation('free',true)});
 const api=tollsForApi(result.tolls,result.fastValidation);
 assert.equal(api.pricingStatus,'free'); assert.equal(api.amount,0);
});
