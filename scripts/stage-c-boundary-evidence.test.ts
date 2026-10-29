import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roadBoundariesFromTrace,type RoadTraceEdge} from '../lib/toll-engine/road-trace-boundaries.ts';
import {resolveSelectedM4Endpoints} from '../lib/toll-engine/m4-production.ts';
import {matrixM4Component} from '../experiments/nationwide-tolls/engine/m4-route-adapter.mjs';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import type {Coordinate} from '../lib/tolls.ts';
import type {TollValidation} from '../lib/toll-validator.ts';

// Synthetic graph location is deliberately outside real PVP zones. Source
// quantities below are test contracts, not newly verified official prices.
const route:Coordinate[]=[[10,10],[10,11]];
const edge=(names:string[],way:number,node:number,begin:number,end:number):RoadTraceEdge=>({names,way_id:way,end_node:{node_id:node},begin_shape_index:begin,end_shape_index:end});
const edges=()=>[edge(['А-280'],10,100,0,1),edge(['М-4'],20,200,1,2),edge(['Р-260'],30,300,2,3)];
const complete=(m4RoadBoundaries=roadBoundariesFromTrace([edges()],route)):TollValidation=>({status:'toll',source:'Valhalla map matching',complete:true,boothEventCoverage:'complete',tollBooths:[],checkedEdgeCount:3,tollEdgeCount:1,wayIds:['20'],roadNames:['М-4'],message:'synthetic selected complete trace',paidRoadEdges:[{wayId:'20',roadNames:['М-4']}],m4RoadBoundaries});
const dates=['2026-10-15T09:00:00+03:00','2026-10-17T09:00:00+03:00'];
async function noNetwork(run:()=>Promise<void>){const original=globalThis.fetch;let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('STAGE_C_NETWORK_FORBIDDEN');};try{await run();assert.equal(attempts,0);}finally{globalThis.fetch=original;}}

test('C3: complete selected graph transitions define a physical vector without inventing an operator fare',async()=>noNetwork(async()=>{
 const production=await resolveSelectedM4Endpoints(route,3600,complete());
 assert.equal(production.roadBoundaries?.status,'resolved');
 for(const date of dates){const quote=matrixM4Component(production,date,3600);assert.equal(quote.tariffVector.selectionBasis,'selected-road-transitions');assert.equal(quote.tariffVector.from,'osm-transition:100:10>20');assert.equal(quote.tariffVector.to,'osm-transition:200:20>30');assert.equal(quote.tariffVector.priceStatus,'unknown');assert.equal(quote.tolls,null);}
}));
test('C3: incomplete selected trace cannot fall back to otherwise resolved maneuver or graph evidence',async()=>noNetwork(async()=>{
 for(const partial of [{complete:false,boothEventCoverage:'partial' as const},{complete:true,boothEventCoverage:'partial' as const}]){
  const trace={...complete(),...partial},production=await resolveSelectedM4Endpoints(route,3600,trace,complete().m4RoadBoundaries);
  assert.equal(production.roadBoundaries?.reason,'road_trace_incomplete');assert.equal(matrixM4Component(production,dates[0],3600),null);
 }
}));
test('C3: exact boundary IDs from a different selected geometry cannot authorize the present vector',async()=>noNetwork(async()=>{
 const production=await resolveSelectedM4Endpoints([[10,10],[10.01,11]],3600,complete());
 assert.equal(production.roadBoundaries?.reason,'road_evidence_geometry_mismatch');assert.equal(production.roadBoundaries?.entry,null);
 assert.equal(matrixM4Component(production,dates[0],3600),null);
}));
test('C3: a maneuver-only pair is not silently promoted to graph or payment-boundary precision',()=>{
 const access={...roadBoundariesFromTrace([edges()],route),provider:'valhalla',precision:'route-maneuver'};
 assert.equal(matrixM4Component({candidate:true,exact:false,endpointOnly:true,roadBoundaries:access},dates[0],3600),null);
});
test('C3: repeat entry or an ambiguous graph seam is unresolved, never a collapsed whole-road vector',()=>{
 const reentry=[...edges(),edge(['М-4'],40,400,3,4),edge(['А-1'],50,500,4,5)];
 const repeated=roadBoundariesFromTrace([reentry],route);assert.equal(repeated.status,'unknown');assert.match(repeated.reason,/multiple_or_discontinuous/);
 const target=edge(['М-4'],20,200,1,2);
 const ambiguous=roadBoundariesFromTrace([[edges()[0],target,{...target}], [{...target,begin_shape_index:0,end_shape_index:1},{...target,begin_shape_index:1,end_shape_index:2},edges()[2]]],route);
 assert.equal(ambiguous.status,'unknown');
 for(const access of [repeated,ambiguous])assert.equal(matrixM4Component({candidate:true,exact:false,endpointOnly:true,roadBoundaries:access},dates[0],3600),null);
});
test('C3: a synthetic reverse traversal keeps its own directed way keys and remains unpriced',()=>{
 const forward=roadBoundariesFromTrace([edges()],route);
 const reverse=roadBoundariesFromTrace([[edge(['Р-260'],30,200,0,1),edge(['М-4'],20,100,1,2),edge(['А-280'],10,999,2,3)]],[...route].reverse());
 assert.equal(reverse.status,'resolved');assert.equal(reverse.entry?.id,'osm-transition:200:30>20');assert.equal(reverse.exit?.id,'osm-transition:100:20>10');
 assert.notEqual(reverse.entry?.id,forward.exit?.id);assert.notEqual(reverse.exit?.id,forward.entry?.id);
 assert.equal(matrixM4Component({candidate:true,exact:false,endpointOnly:true,roadBoundaries:reverse},dates[0],3600).tolls,null);
});
test('C3: existing active directed payment-boundary rows retain both registered departure-day amounts',()=>{
 const register=JSON.parse(readFileSync(new URL('../experiments/nationwide-tolls/M4_ACTIVE_ENDPOINT_REGISTER.json',import.meta.url),'utf8')) as {rows:Array<{from:string;to:string;profile:string;rub:number}>};
 const production={candidate:true,exact:true,endpointOnly:true,m4PvpPreview:{confirmedPvps:['m4-133','m4-1046']}};
 for(const [index,date] of dates.entries()){
  const profile=index===0?'monThu':'friSun',row=register.rows.find(r=>r.from==='m4-133'&&r.to==='m4-1046'&&r.profile===profile);assert.ok(row);
  const quote=matrixM4Component(production,date,3600);assert.equal(quote.tariffVector.selectionBasis,'confirmed-payment-boundaries');assert.equal(quote.tariffVector.priceStatus,'known');assert.equal(quote.tolls.amount,row.rub);
 }
});
test('C3: a known independent component or duplicate traversal cannot make an unknown/partial M4 total complete',()=>{
 const known={amount:10,weekdayAmount:10,weekendAmount:10,period:'synthetic',segments:['synthetic'],confidence:'matched' as const};
 const unknown=composeRouteTolls([{id:'m4',detected:true,tolls:null},{id:'m11',detected:true,tolls:known}]);assert.equal(unknown.status,'unknown');assert.equal(unknown.tolls,null);assert.deepEqual(unknown.priced,['m11']);
 const partial=composeRouteTolls([{id:'m4',detected:true,tolls:{...known,confidence:'partial'}}]);assert.equal(partial.status,'unknown');assert.equal(partial.tolls,null);assert.deepEqual(partial.missing,['m4']);
 const duplicate=composeRouteTolls([{id:'m4',detected:true,tolls:known},{id:'m4',detected:true,tolls:known}]);assert.equal(duplicate.status,'unknown');assert.equal(duplicate.tolls,null);
});
