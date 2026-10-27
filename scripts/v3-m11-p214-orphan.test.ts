import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {replayingFetch} from '../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs';
import type {TollValidation} from '../lib/toll-validator';
const packed=new Uint8Array(readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/single-m11-torzhok-to-moscow/2026-10-16T01-56-26-781Z-capture.json.gz',import.meta.url)));
const capture=JSON.parse(gunzipSync(packed).toString('utf8')),r=capture.record,v:TollValidation=r.validation;
const gate=v.tollBooths!.find(b=>b.osmNodeId==='5286168661')!;
const coverage=(validation:TollValidation)=>unpricedRoadCoverage({segments:[],validation,candidateNetworks:[],m1m3Candidates:[]});
const unknown=(validation:TollValidation)=>coverage(validation).regionalProducts.some(p=>p.id==='unknown-paid-road');
const quote=(validation:TollValidation,at='2026-10-15T09:00:00+03:00',route=r.route)=>calculateLegTolls({routeGeometry:route.coordinates,routeSeconds:route.seconds,departureAt:at,selectedFastProvider:r.provider,selectedFastRoute:route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation});

test('only exact independently identified unnamed p214 node and way join the M11 product',()=>{
 const one={...v,tollBooths:[gate],roadNames:[]};assert.equal(gate.edgeToll,false);
 assert.deepEqual(coverage(one).matchedCoreProducts,['m11']);assert.equal(unknown(one),false);
 for(const booth of [{...gate,osmNodeId:'5286168662'},{...gate,wayId:'766468435'},{...gate,wayId:null}])assert.equal(unknown({...one,tollBooths:[booth]}),true);
 assert.equal(unknown({...one,tollBooths:[gate,{...gate,osmNodeId:'unreviewed'}]}),true);
 assert.equal(unknown({...one,complete:false}),true);
});
test('road identity alone does not authorize a fare or hide missing own trace, head or entry evidence',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>{throw Error('offline identity test');};
 try{
  for(const changed of [{...v,complete:false},{...v,failedChunkCount:1},{...v,tollBooths:v.tollBooths!.filter(b=>b!==gate)},
   {...v,tollBooths:v.tollBooths!.map(b=>b===gate?{...b,wayId:'other'}:b)},
   {...v,tollBooths:[...v.tollBooths!,gate]},
   {...v,tollBooths:[...v.tollBooths!,{...gate,osmNodeId:'unreviewed'}]}]){
   const q=await quote(changed);assert.equal(tollsForApi(q.tolls,q.fastValidation).amount,null);
  }
  const noStrict=await quote(v,undefined,{...r.route,m11RoadEvidence:null});assert.equal(tollsForApi(noStrict.tolls,noStrict.fastValidation).amount,null);
 }finally{globalThis.fetch=old;}
});
async function api(traceUnavailable:boolean){
 const replay=replayingFetch(capture.calls),old=globalThis.fetch;const requests:string[]=[];
 globalThis.fetch=async(input,init)=>{const url=new URL(String(input));requests.push(url.href);if(traceUnavailable&&url.pathname==='/trace_attributes')return new Response('{}',{status:503});return replay.fetch(input,init);};
 try{
  const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from:r.spec.from,to:r.spec.to,departureAt:'2026-10-15T09:00:00+03:00'})}));
  assert.equal(response.status,200);assert.deepEqual(replay.misses,[]);
  assert.equal(requests.some(u=>u.includes('avoid_toll')||u.includes('toll_booth_penalty')),false);
  return (await response.json()).legs[0].fast;
 }finally{globalThis.fetch=old;}
}
test('public V3 API prices its own selected trace and keeps unknown when trace is unavailable',async()=>{
 const ready=await api(false);assert.equal(ready.meters,r.route.meters);assert.equal(ready.seconds,r.route.seconds);
 assert.ok(ready.quality.providers.includes('Valhalla'));assert.equal(ready.tolls.amount,2380);assert.equal(ready.tolls.pricingStatus,'priced');
 assert.equal('priceConfirmation' in ready.tolls,false);
 const blocked=await api(true);assert.equal(blocked.tolls.amount,null);assert.equal(blocked.tolls.pricingStatus,'unknown');
});
