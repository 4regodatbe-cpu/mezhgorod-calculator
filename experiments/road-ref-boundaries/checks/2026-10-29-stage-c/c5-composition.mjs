import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {calculateLegTolls} from '../../../../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../../../../lib/v2-calculation/free-route-selection.ts';
import {validateTollEdges} from '../../../../lib/toll-validator.ts';
import {resolveM12ProductBoundaries} from '../../../../lib/v3-calculation/m12-product-boundaries.ts';
const read=p=>readFileSync(p),hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(read('experiments/routing-reliability/2026-10-29/krasnodar-spb-replay.json'));
const root='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/';
const cases=[{path:baseline.source,sha256:baseline.sourceSha256,expectedTotal:baseline.body.legs[0].fast.tolls.amount,scope:'M4→M11(head/mainline/tail)→ZSDzone1',expectedMissing:[]},
 {path:root+'max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz',sha256:'e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0',expectedTotal:null,scope:'M12→CKAD→M11→ZSDPlanernaya',expectedMissing:['ckad','zsd'],expectedCurrentM12Amount:1713}];
let externalAttempts=0;globalThis.fetch=async()=>{externalAttempts++;throw Error('STAGE_C_UNRECORDED_REQUEST_FORBIDDEN');};
const report={status:'IN_PROGRESS',scope:'two current upper-composer evaluations; positive M4 case rebuilds selected trace/private context AND retains stored local-M4 trace responses required by the existing validator; no provider/API replay or new capture',networkRequests:0,results:[]};
const save=()=>writeFileSync(new URL('./c5-composition.json',import.meta.url),JSON.stringify(report,null,2)+'\n');save();
for(const item of cases){
 const raw=read(item.path);assert.equal(hash(raw),item.sha256);
 const capture=JSON.parse(gunzipSync(raw)),r=capture.record,geometry=r.route.coordinates,before=JSON.stringify(geometry);
 assert.equal(r.validation.complete,true);assert.equal(r.validation.boothEventCoverage,'complete');
 let validation=r.validation;
 const traceReplays=[];
 if(item.expectedTotal!==null){
  globalThis.fetch=async(input,init)=>{
   const url=new URL(String(input)),request=JSON.parse(String(init?.body??'{}'));
   const index=capture.calls.findIndex(c=>c.url.includes('/trace_attributes')&&url.pathname==='/trace_attributes'&&c.method==='POST'&&JSON.stringify(JSON.parse(c.body).shape)===JSON.stringify(request.shape));
   if(index<0){externalAttempts++;throw Error('STAGE_C_STORED_TRACE_MISS');}
   const c=capture.calls[index],savedRequest=JSON.parse(c.body);
   assert.equal(savedRequest.costing,request.costing);assert.equal(savedRequest.shape_match,request.shape_match);
   traceReplays.push({sourceCall:index,httpStatus:c.status,responseSha256:hash(c.text),shapeSha256:hash(JSON.stringify(request.shape))});
   return new Response(c.text,{status:c.status,headers:{'content-type':'application/json'}});
  };
  validation=await validateTollEdges(geometry);
  assert.equal(validation.complete,true);assert.equal(validation.boothEventCoverage,'complete');
 }
 const result=await calculateLegTolls({routeGeometry:geometry,routeSeconds:r.route.seconds,departureAt:'2026-10-15T09:00:00+03:00',selectedFastProvider:r.provider,selectedFastRoute:r.route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation});
 assert.equal(JSON.stringify(geometry),before,'selected geometry mutated');
 const audit=result.componentAudit,api=tollsForApi(result.tolls,result.fastValidation);
 globalThis.fetch=async()=>{externalAttempts++;throw Error('STAGE_C_UNRECORDED_REQUEST_FORBIDDEN');};
 const ids=audit.components.map(c=>c.id);assert.equal(new Set(ids).size,ids.length,'duplicate detected product');
 console.log(JSON.stringify({caseId:r.spec.id,status:audit.status,missing:audit.missing,components:audit.components.map(c=>({id:c.id,amount:c.tolls?.amount??null,reason:c.reason}))}));
 assert.ok(!(ids.includes('m11')&&ids.some(id=>/^m11-/u.test(id))),'aggregate M11 overlaps split products');
 assert.ok(!(ids.includes('m4_a289')&&ids.some(id=>['m4','a289','krasnodar-west-bypass'].includes(id))),'aggregate M4 overlaps split products');
 assert.equal(api.amount,item.expectedTotal);
 if(item.expectedTotal===null){assert.equal(api.pricingStatus,'unknown');for(const id of item.expectedMissing)assert.ok(audit.missing.includes(id),id);assert.equal(audit.components.find(c=>c.id==='m12')?.tolls?.amount,item.expectedCurrentM12Amount);}
 else{assert.equal(api.pricingStatus,'priced');assert.equal(audit.status,'priced');assert.equal(audit.components.reduce((sum,c)=>sum+c.tolls.amount,0),api.amount);}
 assert.equal(externalAttempts,0);
 report.results.push({caseId:r.spec.id,scope:item.scope,capture:{path:item.path,sha256:item.sha256},provider:r.provider,meters:r.route.meters,seconds:r.route.seconds,selectedGeometrySha256:hash(before),geometryUnchanged:true,date:'2026-10-15T09:00:00+03:00',traceContext:{rebuilt:validation!==r.validation,oldSerializedBooths:r.validation.tollBooths?.length??0,selectedBooths:validation.tollBooths?.length??0,storedTraceCalls:traceReplays},componentAudit:audit,api,comparison:item.expectedTotal===null?'missing products block full total despite independently returned component amounts':'same total as previously saved current-runtime full API replay; exact split components recorded',expectedMissing:item.expectedMissing,...(item.expectedCurrentM12Amount?{currentM12Boundary:resolveM12ProductBoundaries(geometry,r.route.m12EndpointSpan??r.route.m12StrictSpan),operatorBindingCaution:'Existing runtime reverse420→184 quote returns1713 under its directed-marker model; this is NOT a new independently proven22Н-approach→operator registration crosswalk or tariff source. C4 eastbound case and experimental directional crosswalk gaps remain separate/open.'}:{})});save();
}
report.status='PASS';report.networkRequests=externalAttempts;save();
console.log(JSON.stringify(report.results.map(r=>({caseId:r.caseId,ids:r.componentAudit.components.map(c=>c.id),priced:r.componentAudit.priced,missing:r.componentAudit.missing,status:r.api.pricingStatus,amount:r.api.amount})),null,2));
