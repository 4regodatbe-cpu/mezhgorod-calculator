import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {matrixZsdZone1Component} from '../lib/v3-calculation/zsd-zone1-component.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
import type {Coordinate} from '../lib/tolls.ts';
const base=new URL('../',import.meta.url);
const proof=JSON.parse(readFileSync(new URL('docs/checkpoints/evidence/2026-10-16-zsd-planernaya-identity-proof.json',base),'utf8'));
const capture=JSON.parse(gunzipSync(readFileSync(new URL('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz',base))).toString());
const validation=capture.record.validation as TollValidation;
const coverage=(v:TollValidation)=>unpricedRoadCoverage({segments:[],candidateNetworks:[],m1m3Candidates:[],validation:v});
test('Planernaya plaza identity has hashed primary booth and continuous directed ZSD topology',()=>{
 const elements=new Map<string,{id:number;type:string;nodes?:number[];tags?:Record<string,string>}>();
 for(const source of proof.sources){
  const raw=readFileSync(new URL(source.path,base));
  assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);
  for(const element of JSON.parse(raw.toString()).elements)elements.set(element.type+':'+element.id,element);
 }
 assert.equal(elements.get('node:1766158781')?.tags?.barrier,'toll_booth');
 const chain=['721839717','165031082','252148968','355755817'].map(id=>elements.get('way:'+id)!);
 assert.equal(chain[0].tags?.name,'ЗСД');
 for(let i=0;i<chain.length;i++){
  assert.equal(chain[i].tags?.oneway,'yes');assert.equal(chain[i].tags?.toll,'yes');
  if(i)assert.equal(chain[i-1].nodes!.at(-1),chain[i].nodes![0]);
 }
 assert.equal(chain.at(-1)!.nodes!.at(-1),1766158781);
 const selected=(validation.paidRoadEdges??[]).map(e=>e.wayId);
 const indices=chain.map(w=>selected.indexOf(String(w.id)));
 assert.ok(indices.every((index,i)=>index>=0&&(!i||indices[i-1]<index)));
});
test('actual unnamed Planernaya event resolves as ZSD while its larger trip still has no zone1 fare',()=>{
 assert.ok(validation.tollBooths?.some(b=>b.osmNodeId==='1766158781'&&b.wayId==='355755817'&&!b.roadNames.length));
 const result=coverage(validation);
 assert.deepEqual(result.regionalProducts.map(p=>p.id),['zsd']);
 const price=matrixZsdZone1Component(capture.record.route.coordinates as Coordinate[],validation,'2026-10-15T09:00:00+03:00',capture.record.route.seconds);
 assert.equal(price.tolls,null);assert.equal(price.reason,'zsd_trip_extends_outside_reviewed_zone1');
});
test('an unreviewed neighbouring node on the same unnamed way remains an unknown paid road',()=>{
 const result=coverage({...validation,tollBooths:[...(validation.tollBooths??[]),{osmNodeId:'1766158782',wayId:'355755817',roadNames:[],edgeIndex:999,edgeToll:true}]});
 assert.ok(result.regionalProducts.some(p=>p.id==='zsd'));
 assert.ok(result.regionalProducts.some(p=>p.id==='unknown-paid-road'&&p.reason.includes('unmapped_selected_route_paid_booth')));
});
test('resolving Planernaya identity cannot hide incomplete selected payment coverage',()=>{
 const result=coverage({...validation,complete:false});
 assert.ok(result.regionalProducts.some(p=>p.id==='unknown-paid-road'&&p.reason.includes('selected_route_payment_trace_incomplete')));
});
