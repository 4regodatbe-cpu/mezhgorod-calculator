import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import physical from '../experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-entry/directed-ckad47-entry.json' with {type:'json'};
import {inspectM11CkadHeadEntry} from '../lib/v3-calculation/m11-ckad-head-entry.ts';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import type {Coordinate} from '../lib/tolls';
import type {TollValidation} from '../lib/toll-validator';

const packed=readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz',import.meta.url));
const capture=JSON.parse(gunzipSync(packed).toString()),record=capture.record;
const route:Coordinate[]=record.route.coordinates,validation:TollValidation=record.validation;
const date='2026-10-15T09:00:00+03:00';
const boundary=(v:TollValidation|null,at=date)=>resolveM11ProductBoundaries(route,record.route.seconds,at,record.route.m11RoadEvidence,v);
const sha=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');

test('CKAD47 physical source and original own capture hashes remain independently verifiable',()=>{
 assert.equal(sha(packed),'e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0');
 for(const s of physical.primarySources)assert.equal(sha(readFileSync(new URL('../'+s.path,import.meta.url))),s.sha256);
 assert.equal(sha(readFileSync(new URL('../'+physical.officialIdentity.path,import.meta.url))),physical.officialIdentity.sha256);
 assert.equal(physical.corridorCoordinates.length,38);
 for(let i=1;i<physical.wayConnectivity.length;i++)assert.equal(physical.wayConnectivity[i-1].lastNodeId,physical.wayConnectivity[i].firstNodeId);
 assert.ok(physical.wayConnectivity.every(w=>w.oneway==='yes'));
});

test('own CKAD access resolves its ready head pair despite non-toll access ways being absent from paid-only wayIds',()=>{
 assert.ok(physical.orderedWayIds.slice(0,-1).every(w=>!validation.wayIds.includes(w)));
 assert.equal(validation.tollBooths?.find(b=>b.osmNodeId===physical.gateNodeId)?.edgeToll,false);
 assert.equal(boundary(null).parts?.head,null);
 assert.equal(inspectM11CkadHeadEntry(route,validation).resolved,true);
 const b=boundary(validation);
 assert.equal(b.parts?.head?.from,'tskad');assert.equal(b.parts?.head?.to,'solnechnogorsk');
 const result=matrixM11GeometryComponent({exact:b.resolved,parts:b.parts});
 assert.equal(result?.components.find(c=>c.id==='m11-15-58')?.tolls?.amount,280);
 assert.equal(result?.components.find(c=>c.id==='m11-58-679')?.tolls?.amount,3900);
 assert.equal(result?.tolls?.amount,4180);
});

test('CKAD head uses departure profile even when the final payment falls on the following day',()=>{
 for(const [at,head,total]of [['2026-10-15T22:00:00+03:00',280,4180],['2026-10-17T09:00:00+03:00',320,4520]] as const){
  const b=boundary(validation,at),q=matrixM11GeometryComponent({exact:b.resolved,parts:b.parts});
  assert.equal(q?.components.find(c=>c.id==='m11-15-58')?.tolls?.amount,head);assert.equal(q?.tolls?.amount,total);
 }
});

test('incomplete validation or missing exact gate and paid continuation cannot enable CKAD head',()=>{
 const variants:TollValidation[]=[{...validation,complete:false},{...validation,boothEventCoverage:'partial'},
  {...validation,chunkCount:undefined},{...validation,checkedChunkCount:1},{...validation,failedChunkCount:1},
  {...validation,tollBooths:[]},{...validation,tollBooths:validation.tollBooths?.map(g=>g.osmNodeId===physical.gateNodeId?{...g,wayId:'other'}:g)},
  {...validation,tollBooths:[...validation.tollBooths!,validation.tollBooths!.find(g=>g.osmNodeId===physical.gateNodeId)!]},
  {...validation,paidRoadEdges:[]},{...validation,wayIds:[]}];
 for(const v of variants){assert.equal(inspectM11CkadHeadEntry(route,v).resolved,false);assert.equal(boundary(v).parts?.head,null);}
});

test('wrong direction and nearby parallel geometry do not reuse a captured CKAD gate',()=>{
 assert.equal(inspectM11CkadHeadEntry(route.toReversed(),validation).resolved,false);
 assert.equal(inspectM11CkadHeadEntry(route.map(([x,y]):Coordinate=>[x,y+.001]),validation).resolved,false);
 const [x,y]=physical.anchors[1].coordinate;
 assert.equal(inspectM11CkadHeadEntry([[x-.1,y-.1],[x+.1,y+.1]],validation).resolved,false);
});

test('a local detour between anchors cannot borrow the original gate and way identities',()=>{
 const diverted=route.map(p=>[...p] as Coordinate);diverted[3555][1]+=.003;
 assert.equal(inspectM11CkadHeadEntry(diverted,validation).resolved,false);
});

test('proved CKAD entry does not replace missing strict M11 mainline evidence',()=>{
 const b=resolveM11ProductBoundaries(route,record.route.seconds,date,null,validation);
 assert.equal(b.resolved,false);assert.equal(b.parts,null);
});
