import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import snapshot from '../experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json' with {type:'json'};
import {matrixZsdZone1Component} from '../lib/v3-calculation/zsd-zone1-component.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {Coordinate} from '../lib/tolls.ts';
const point=(n:{lon:number;lat:number}):Coordinate=>[n.lon,n.lat];
const routeFor=(g:typeof snapshot.gates[number])=>[point(g.before),point(g.gate),point(g.after)];
const trace=(g:typeof snapshot.gates[number]):TollValidation=>({status:'toll',source:'Valhalla map matching',complete:true,boothEventCoverage:'complete',message:'fixture',tollEdgeCount:1,checkedEdgeCount:1,wayIds:[],roadNames:['ЗСД'],paidRoadEdges:[{wayId:snapshot.ways[0].id,roadNames:['ЗСД']}],tollBooths:[{osmNodeId:g.gate.id,wayId:g.wayId,roadNames:[],edgeIndex:0,edgeToll:true}]});
const date='2026-10-15T12:00:00+03:00';
test('primary owner HTML gives actual cash base fare and matches saved hashes',()=>{
 const base=new URL('../experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/',import.meta.url);
 for(const [name,sha]of Object.entries(snapshot.sourceSHA256))assert.equal(createHash('sha256').update(readFileSync(new URL(name,base))).digest('hex'),sha);
 const html=readFileSync(new URL('whsd-owner-tariffs.html',base),'utf8');
 assert.ok(html.includes('01.05.2025'));assert.ok(html.includes('300'));assert.ok(html.includes('Благодатная'));
});
test('either actual directed zone1 plaza charges exactly300 without a transponder/night discount',()=>{
 for(const g of snapshot.gates)for(const at of [date,'2026-10-15T02:00:00+03:00']){
  const result=matrixZsdZone1Component(routeFor(g),trace(g),at,60);
  assert.equal(result.tolls?.amount,300);assert.equal(result.tolls?.weekdayAmount,300);assert.equal(result.tolls?.weekendAmount,300);
 }
});
test('another zone, missing IDs, repeated plazas and incomplete trace cannot turn zone1 into a complete ZSD total',()=>{
 const g=snapshot.gates[0],validation=trace(g);
 for(const unsafe of [
  {...validation,complete:false},
  {...validation,paidRoadEdges:undefined},
  {...validation,paidRoadEdges:[{wayId:'130062824',roadNames:['ЗСД']}]},
  {...validation,paidRoadEdges:[{wayId:null,roadNames:['ЗСД']}]},
  {...validation,tollBooths:[...validation.tollBooths!,{...validation.tollBooths![0],osmNodeId:snapshot.gates[1].gate.id}]},
  {...validation,tollBooths:[{...validation.tollBooths![0],edgeToll:false}]},
  {...validation,tollBooths:[...validation.tollBooths!,{...validation.tollBooths![0],osmNodeId:'other-zsd-booth',roadNames:['ЗСД']}]},
 ])assert.equal(matrixZsdZone1Component(routeFor(g),unsafe,date,60).tolls,null);
 assert.equal(matrixZsdZone1Component(routeFor(g).toReversed(),validation,date,60).tolls,null);
 assert.equal(matrixZsdZone1Component(routeFor(g),validation,'2025-04-30T12:00:00+03:00',60).tolls,null);
});
test('recorded complete Krasnodar–Moscow–SPb geometry prices its actual ZSD zone1, not a named-road guess',()=>{
 const p=new URL('../experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/krasnodar-spb-moscow-2026-10-14T21-33-34-774Z/capture.json.gz',import.meta.url);
 const d=JSON.parse(gunzipSync(readFileSync(p)).toString());
 const paidRoadEdges=d.calls.filter((c:any)=>c.status===200&&c.url.includes('/trace_attributes')&&!JSON.parse(c.body).trace_options).flatMap((c:any)=>JSON.parse(c.text).edges.filter((e:any)=>e.toll===true).map((e:any)=>({wayId:e.way_id==null?null:String(e.way_id),roadNames:e.names??[]})));
 const result=matrixZsdZone1Component(d.route.coordinates,{...d.validation,paidRoadEdges},'2026-10-13T09:00:00+03:00',d.route.seconds);
 assert.equal(result.tolls?.amount,300);assert.equal(result.reason,'zsd_zone1_complete_directed_base_tariff');
});
