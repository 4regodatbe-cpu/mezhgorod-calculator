import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {inspectM11SouthboundMoscowHead} from '../lib/v3-calculation/m11-southbound-moscow-head.ts';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {Coordinate} from '../lib/tolls';
import type {TollValidation} from '../lib/toll-validator';
import type {M11RoadEvidence} from '../lib/toll-engine/m11-road-evidence';
const prefix='../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/';
const load=(p:string)=>JSON.parse(gunzipSync(readFileSync(new URL(prefix+p,import.meta.url)))).record;
const r=load('single-m11-torzhok-to-moscow/2026-10-16T01-56-26-781Z-capture.json.gz');
const route:Coordinate[]=r.route.coordinates, validation:TollValidation=r.validation, evidence:M11RoadEvidence=r.route.m11RoadEvidence;
const inspect=(g=route,v:TollValidation|null=validation,e:M11RoadEvidence|null=evidence)=>inspectM11SouthboundMoscowHead(g,e,v);

test('independent physical lane source bytes remain intact and own southbound route proves head',()=>{
 const base='../experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-moscow-head7171624764/';
 for(const [file,sha] of [['node7171624764.osm','a0694e1a4a9860a5f7830ef728c23b940d34aef008645b568f3139dead41140b'],['way502872285-full.osm','3f10db930083c10ca7d232957fc3b1e4d0bd7f713a3706ad83434727220a5b40']])
  assert.equal(createHash('sha256').update(readFileSync(new URL(base+file,import.meta.url))).digest('hex'),sha);
 assert.equal(inspect(),true);
});
test('missing, wrong, duplicate and unpaid gate plus incomplete chunks fail closed',()=>{
 const gate=validation.tollBooths!.find(g=>g.osmNodeId==='7171624764')!;
 const variants:TollValidation[]=[{...validation,complete:false},{...validation,boothEventCoverage:'partial'},
 {...validation,chunkCount:undefined},{...validation,checkedChunkCount:0},{...validation,failedChunkCount:1},
 {...validation,tollBooths:[]},{...validation,tollBooths:[...validation.tollBooths!,gate]},
 ...[{wayId:'other'},{edgeToll:false}].map(change=>({...validation,tollBooths:validation.tollBooths!.map(g=>g===gate?{...g,...change}:g)})),
 {...validation,paidRoadEdges:validation.paidRoadEdges!.filter(e=>e.wayId!=='502872285')}];
 assert.equal(inspect(route,null),false);
 for(const v of variants){assert.equal(inspect(route,v),false);assert.equal(resolveM11ProductBoundaries(route,r.route.seconds,'2026-10-15T09:00:00+03:00',evidence,v).parts?.head??null,null);}
});
test('borrowed direction, nearby geometry, sparse chord, truncation and local detour fail closed',()=>{
 const detour=route.map(p=>[...p] as Coordinate);detour[1256][0]+=.003;
 for(const g of [route.toReversed(),route.map(([x,y]):Coordinate=>[x,y+.001]),[route[0],route.at(-1)!],route.slice(0,1260),detour])assert.equal(inspect(g),false);
});
test('one selected strict span must cover p58 and continue beyond exact gate to Moscow',()=>{
 assert.equal(inspect(route,validation,null),false);
 for(const e of [{...evidence,malformedStrictCount:1},{...evidence,strictBlocks:[]},
 {...evidence,strictBlocks:[...evidence.strictBlocks,...evidence.strictBlocks]},
 {...evidence,strictBlocks:[{...evidence.strictBlocks[0],beginCoordinate:route[1200]}]},
 {...evidence,strictBlocks:[{...evidence.strictBlocks[0],endCoordinate:route[1250]}]},
 {...evidence,strictBlocks:[{...evidence.strictBlocks[0],endCoordinate:[0,0] as Coordinate}]}])assert.equal(inspect(route,validation,e),false);
});
test('own partial mainline composes only the directed reverse head pair at departure and returns a complete unconfirmed estimate when every product is identified',async()=>{
 const old=globalThis.fetch;let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('offline head test');};
 try{
  for(const [at,head,mainline] of [['2026-10-15T09:00:00+03:00',1130,1250],['2026-10-15T23:59:00+03:00',1130,1250],
   ['2026-10-16T09:00:00+03:00',1260,1390],['2026-10-17T09:00:00+03:00',1500,1390],['2026-10-18T09:00:00+03:00',1650,1390]] as const){
   const b=resolveM11ProductBoundaries(route,r.route.seconds,at,evidence,validation);
   assert.equal(b.parts?.from,'p214');assert.equal(b.parts?.to,'p58');assert.equal(b.parts?.head?.from,'solnechnogorsk');assert.equal(b.parts?.head?.to,'moscow');
   const m=matrixM11GeometryComponent({exact:b.resolved,parts:b.parts});
   assert.equal(m?.components.find(c=>c.id==='m11-15-58')?.tolls?.amount,head);assert.equal(m?.tolls?.amount,head+mainline);
   const q=await calculateLegTolls({routeGeometry:route,routeSeconds:r.route.seconds,departureAt:at,selectedFastProvider:r.provider,selectedFastRoute:r.route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation});
   assert.ok(q.componentAudit.priced.includes('m11-15-58'));assert.ok(q.componentAudit.priced.includes('m11-58-679'));
   assert.deepEqual(q.componentAudit.missing,[]);assert.equal(tollsForApi(q.tolls,q.fastValidation).amount,head+mainline);assert.equal(q.tolls.priceConfirmation,'unconfirmed');
   console.log(JSON.stringify({at,head,mainline,m11Subtotal:head+mainline,missing:q.componentAudit.missing}));
  }
  assert.equal(attempts,0);
 }finally{globalThis.fetch=old;}
});
test('other own p214 exits cannot inherit Moscow head',()=>{
 for(const p of ['pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz','triple-m11-ckad-m12-torzhok-to-kazan/2026-10-16T00-34-01-248Z-capture.json.gz']){
  const other=load(p);assert.equal(inspectM11SouthboundMoscowHead(other.route.coordinates,other.route.m11RoadEvidence,other.validation),false);
  assert.equal(resolveM11ProductBoundaries(other.route.coordinates,other.route.seconds,'2026-10-15T09:00:00+03:00',other.route.m11RoadEvidence,other.validation).parts?.head?.to,'tskad');
 }
});
