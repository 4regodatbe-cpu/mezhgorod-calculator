import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {inspectM11P214Entry} from '@/lib/v3-calculation/m11-p214-entry-boundary.ts';
import {resolveM11ProductBoundaries} from '@/lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '../../engine/m11-route-adapter.mjs';
import {calculateLegTolls} from '@/lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '@/lib/v2-calculation/free-route-selection.ts';
const base=new URL('./',import.meta.url),inputs=JSON.parse(readFileSync(new URL('inputs.json',base)));
let fetchAttempts=0;globalThis.fetch=async()=>{fetchAttempts++;throw Error('offline batch forbids network');};
const progress={status:'IN_PROGRESS',completed:[],errors:[],networkAttempts:0};
const save=()=>writeFileSync(new URL('progress.json',base),JSON.stringify(progress,null,2)+'\n');
mkdirSync(new URL('cases/',base),{recursive:true});save();
for(const item of inputs.cases){
 const id=item.path.split('/').at(-2),bytes=readFileSync(item.path);
 try{
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  const r=JSON.parse(gunzipSync(bytes)).record,route=r.route.coordinates,e=r.route.m11RoadEvidence,v=r.validation;
  assert.equal(inspectM11P214Entry(route,e,v),true);
  const noGate={...v,tollBooths:v.tollBooths.filter(b=>b.osmNodeId!=='5286168661')};
  assert.equal(inspectM11P214Entry(route,e,noGate),false);assert.equal(inspectM11P214Entry(route,e,null),false);
  assert.equal(inspectM11P214Entry(route.toReversed(),e,v),false);
  const profiles=[];
  for(const at of inputs.departures){
   const bound=resolveM11ProductBoundaries(route,r.route.seconds,at,e,v);
   assert.equal(bound.resolved,true);assert.equal(bound.parts.from,'p214');assert.equal(bound.parts.to,'p58');
   assert.equal(bound.parts.headDetected,true);assert.equal(bound.parts.head,null);
   const m=matrixM11GeometryComponent({exact:bound.resolved,parts:bound.parts});
   const main=m.components.find(c=>c.id==='m11-58-679');assert.equal(main.tolls.amount,at.startsWith('2026-10-15')?1250:1390);assert.equal(m.tolls,null);
   const q=await calculateLegTolls({routeGeometry:route,routeSeconds:r.route.seconds,departureAt:at,selectedFastProvider:r.provider,
    selectedFastRoute:r.route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:v});
   const api=tollsForApi(q.tolls,q.fastValidation);assert.equal(api.amount,null);assert.ok(q.componentAudit.priced.includes('m11-58-679'));assert.ok(q.componentAudit.missing.includes('m11-15-58'));
   profiles.push({departureAt:at,mainlineRub:main.tolls.amount,fullAmount:api.amount,priced:q.componentAudit.priced,missing:q.componentAudit.missing});
  }
  const out={status:'DONE',caseId:id,capturePath:item.path,captureSha256:item.sha256,provider:r.provider,traceComplete:v.complete,
   chunkCount:v.chunkCount,checkedChunkCount:v.checkedChunkCount,strictBlockCount:e.strictBlocks.length,profiles,negativeGuards:3,
   materialException:false,scope:'Own component boundary/composer exception check, not new route audit or confirmed whole fare'};
  writeFileSync(new URL(`cases/${id}.json`,base),JSON.stringify(out,null,2)+'\n');progress.completed.push(out);save();
 }catch(error){progress.errors.push({caseId:id,message:error.message,stack:error.stack});save();}
}
// Fetch is always a throwing offline mock; attempts are not external requests.
progress.networkAttempts=fetchAttempts;progress.blockedFetchAttempts=fetchAttempts;progress.networkRequests=0;progress.status=progress.errors.length?'FAILED':'DONE';save();
const summary={status:progress.status,casesChecked:progress.completed.length,profilesChecked:progress.completed.reduce((n,c)=>n+c.profiles.length,0),negativeGuards:progress.completed.length*3,
 materialExceptions:progress.errors.length,errors:progress.errors,networkRequests:0,blockedFetchAttempts:fetchAttempts,newPricedComponents:progress.completed.length,confirmedWholeTripFares:0,
 results:progress.completed.map(c=>({caseId:c.caseId,profiles:c.profiles}))};
writeFileSync(new URL('summary.json',base),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
if(progress.errors.length)process.exitCode=1;
