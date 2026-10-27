import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {inspectM11CkadHeadExit} from '../lib/v3-calculation/m11-ckad-head-exit.ts';
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {Coordinate} from '../lib/tolls';
import type {TollValidation} from '../lib/toll-validator';
import type {M11RoadEvidence} from '../lib/toll-engine/m11-road-evidence';
const root='../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/';
const load=(p:string)=>JSON.parse(gunzipSync(new Uint8Array(readFileSync(new URL(root+p,import.meta.url)))).toString('utf8')).record;
const r=load('pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz');
const route:Coordinate[]=r.route.coordinates,v:TollValidation=r.validation,e:M11RoadEvidence=r.route.m11RoadEvidence;
const inspect=(g=route,validation:TollValidation|null=v,evidence:M11RoadEvidence|null=e)=>inspectM11CkadHeadExit(g,evidence,validation);

test('full independent directed source chain and own exit prove the southbound head despite non-toll access',()=>{
 const base='../experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit/';
 const proof=JSON.parse(readFileSync(new URL(base+'source-proof.json',import.meta.url),'utf8'));
 for(const s of proof.sources)assert.equal(createHash('sha256').update(new Uint8Array(readFileSync(new URL('../'+s.path,import.meta.url)))).digest('hex'),s.sha256);
 assert.equal(proof.directedWayConnectivity.length,10);
 for(let i=1;i<proof.directedWayConnectivity.length;i++)assert.equal(proof.directedWayConnectivity[i-1].lastNode,proof.directedWayConnectivity[i].firstNode);
 assert.ok(proof.directedWayConnectivity.every((w:{oneway:string})=>w.oneway==='yes'));
 assert.equal(v.tollBooths?.find(g=>g.osmNodeId==='8087316064')?.edgeToll,false);assert.equal(inspect(),true);
});
test('missing, wrong, duplicate exit and incomplete coverage cannot authorize a head fare',()=>{
 const gate=v.tollBooths!.find(g=>g.osmNodeId==='8087316064')!;
 const variants:TollValidation[]=[{...v,complete:false},{...v,boothEventCoverage:'partial'},{...v,chunkCount:undefined},
 {...v,checkedChunkCount:0},{...v,failedChunkCount:1},{...v,tollBooths:v.tollBooths!.filter(b=>b!==gate)},
 {...v,tollBooths:[...v.tollBooths!,gate]},{...v,tollBooths:v.tollBooths!.map(b=>b===gate?{...b,wayId:'other'}:b)}];
 assert.equal(inspect(route,null),false);
 for(const validation of variants){assert.equal(inspect(route,validation),false);assert.equal(resolveM11ProductBoundaries(route,r.route.seconds,'2026-10-15T09:00:00+03:00',e,validation).parts?.head??null,null);}
});
test('wrong direction, shifted, sparse, cropped and diverted corridors cannot borrow the source gate',()=>{
 const detour=route.map(p=>[...p] as Coordinate);detour[1050][1]+=.003;
 for(const g of [route.toReversed(),route.map(([x,y]):Coordinate=>[x,y+.001]),[route[0],route.at(-1)!],route.slice(0,1050),detour])assert.equal(inspect(g),false);
});
test('the own strict M11 end must bind this exit junction after p58',()=>{
 assert.equal(inspect(route,v,null),false);
 for(const evidence of [{...e,malformedStrictCount:1},{...e,strictBlocks:[]},{...e,strictBlocks:[...e.strictBlocks,...e.strictBlocks]},
 {...e,strictBlocks:[{...e.strictBlocks[0],endCoordinate:[0,0] as Coordinate}]},
 {...e,strictBlocks:[{...e.strictBlocks[0],beginCoordinate:route[1040]}]}])assert.equal(inspect(route,v,evidence),false);
});
test('own Ramenskoe head uses its reverse published fare at departure and leaves CKAD unknown',async()=>{
 const old=globalThis.fetch;let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('offline CKAD exit test');};
 try{
  for(const [at,head,main]of [['2026-10-15T09:00:00+03:00',200,1250],['2026-10-15T23:59:00+03:00',200,1250],
   ['2026-10-16T09:00:00+03:00',220,1390],['2026-10-17T09:00:00+03:00',240,1390],['2026-10-18T09:00:00+03:00',320,1390]]as const){
   const b=resolveM11ProductBoundaries(route,r.route.seconds,at,e,v);assert.equal(b.parts?.head?.from,'solnechnogorsk');assert.equal(b.parts?.head?.to,'tskad');
   const m=matrixM11GeometryComponent({exact:b.resolved,parts:b.parts});assert.equal(m?.components.find(c=>c.id==='m11-15-58')?.tolls?.amount,head);assert.equal(m?.tolls?.amount,main+head);
   const q=await calculateLegTolls({routeGeometry:route,routeSeconds:r.route.seconds,departureAt:at,selectedFastProvider:r.provider,selectedFastRoute:r.route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:v});
   assert.ok(q.componentAudit.priced.includes('m11-15-58'));assert.ok(q.componentAudit.missing.includes('ckad'));assert.equal(tollsForApi(q.tolls,q.fastValidation).amount,null);
   console.log(JSON.stringify({at,head,m11Subtotal:main+head,missing:q.componentAudit.missing}));
  }
  assert.equal(attempts,0);
 }finally{globalThis.fetch=old;}
});
test('other own CKAD exit routes prove their own corridors, while Moscow stays a separate head',()=>{
 for(const path of ['triple-m11-ckad-m12-torzhok-to-kazan/2026-10-16T00-34-01-248Z-capture.json.gz']){
  const own=load(path);assert.equal(inspectM11CkadHeadExit(own.route.coordinates,own.route.m11RoadEvidence,own.validation),true);
  for(const [at,subtotal]of [['2026-10-15T09:00:00+03:00',1450],['2026-10-17T09:00:00+03:00',1630]]as const){
   const b=resolveM11ProductBoundaries(own.route.coordinates,own.route.seconds,at,own.route.m11RoadEvidence,own.validation);
   assert.equal(b.parts?.head?.to,'tskad');assert.equal(matrixM11GeometryComponent({exact:b.resolved,parts:b.parts})?.tolls?.amount,subtotal);
  }
 }
 for(const path of ['single-m11-torzhok-to-moscow/2026-10-16T01-56-26-781Z-capture.json.gz','pair-m4-m11-torzhok-to-krasnodar/2026-10-16T01-43-51-795Z-capture.json.gz']){
  const own=load(path);assert.equal(inspectM11CkadHeadExit(own.route.coordinates,own.route.m11RoadEvidence,own.validation),false);
  assert.equal(resolveM11ProductBoundaries(own.route.coordinates,own.route.seconds,'2026-10-15T09:00:00+03:00',own.route.m11RoadEvidence,own.validation).parts?.head?.to,'moscow');
 }
});
