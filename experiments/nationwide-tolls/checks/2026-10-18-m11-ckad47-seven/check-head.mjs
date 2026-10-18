import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {inspectM11CkadHeadEntry} from '@/lib/v3-calculation/m11-ckad-head-entry.ts';
import {resolveM11ProductBoundaries} from '@/lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11GeometryComponent} from '@/experiments/nationwide-tolls/engine/m11-route-adapter.mjs';

const base=dirname(fileURLToPath(import.meta.url));
const digest=b=>createHash('sha256').update(b).digest('hex');
const inputBytes=readFileSync(join(base,'inputs.json')),inputs=JSON.parse(inputBytes);
const runnerSha=digest(readFileSync(fileURLToPath(import.meta.url)));
const codeHashes=Object.fromEntries(Object.keys(inputs.codeSha256).map(p=>[p,digest(readFileSync(p))]));
if(JSON.stringify(codeHashes)!==JSON.stringify(inputs.codeSha256))throw Error('CODE_FINGERPRINT_CHANGED');
const fingerprint=digest(Buffer.from(JSON.stringify({input:digest(inputBytes),runnerSha,codeHashes})));
const save=(p,d)=>{writeFileSync(p+'.tmp',JSON.stringify(d,null,2)+'\n');renameSync(p+'.tmp',p);};
mkdirSync(join(base,'cases'),{recursive:true});
const results=[];const startedAt=Date.now();
let networkCalls=0;const fetch0=globalThis.fetch;
globalThis.fetch=async()=>{networkCalls++;throw Error('NETWORK_NOT_ALLOWED_IN_SAVED_CAPTURE_CHECK');};
try{
 for(const input of inputs.cases){
  if(Date.now()-startedAt>inputs.limits.maxWorkSeconds*1000)throw Error('BATCH_TIME_BUDGET_REACHED');
  const path=join(base,'cases',input.caseId+'.json');
  if(existsSync(path)){
   const old=JSON.parse(readFileSync(path));
   if(old.fingerprint===fingerprint&&old.captureGitBlob===input.captureGitBlob&&old.status==='DONE'){
    results.push(old);save(join(base,'progress.json'),{status:'IN_PROGRESS',fingerprint,completedCaseIds:results.map(r=>r.caseId)});continue;
   }
   throw Error('EXISTING_RESULT_FINGERPRINT_MISMATCH:'+input.caseId);
  }
  save(join(base,'progress.json'),{status:'IN_PROGRESS',fingerprint,currentCaseId:input.caseId,completedCaseIds:results.map(r=>r.caseId)});
  const bytes=execFileSync('git',['cat-file','blob',input.captureGitBlob],{maxBuffer:8*1024*1024,timeout:10000});
  const blob=createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
  if(blob!==input.captureGitBlob)throw Error('CAPTURE_GIT_BLOB_MISMATCH:'+input.caseId);
  const captured=JSON.parse(gunzipSync(bytes)),r=captured.record,route=r.route.coordinates,v=r.validation;
  if(v.complete!==true||v.boothEventCoverage!=='complete')throw Error('INCOMPLETE_SAVED_CAPTURE:'+input.caseId);
  const physical=inspectM11CkadHeadEntry(route,v);
  const profiles=inputs.departureProfiles.map(departureAt=>{
   const b=resolveM11ProductBoundaries(route,r.route.seconds,departureAt,r.route.m11RoadEvidence,v);
   const before=resolveM11ProductBoundaries(route,r.route.seconds,departureAt,r.route.m11RoadEvidence,null);
   const q=matrixM11GeometryComponent({exact:b.resolved,parts:b.parts},departureAt);
   const head=q?.components?.find(c=>c.id==='m11-15-58');
   return {departureAt,physicalResolved:physical.resolved,boundariesResolved:b.resolved,
    from:b.parts?.head?.from??null,to:b.parts?.head?.to??null,
    headRub:head?.tolls?.amount??null,headReason:head?.reason??q?.reason??b.reason,
    headWithoutSelectedGateValidation:before.parts?.head??null,
    m11SubtotalRub:q?.tolls?.amount??null,wholeTripEvaluated:false};
  });
  const negatives={reverseRejected:!inspectM11CkadHeadEntry(route.toReversed(),v).resolved,
   incompleteRejected:!inspectM11CkadHeadEntry(route,{...v,complete:false}).resolved,
   absentGateRejected:!inspectM11CkadHeadEntry(route,{...v,tollBooths:v.tollBooths?.filter(g=>g.osmNodeId!=='8087316065')}).resolved};
  if(Object.values(negatives).some(x=>!x))throw Error('NEGATIVE_GUARD_FAILED:'+input.caseId);
  const recovered=profiles.every(p=>p.from==='tskad'&&p.to==='solnechnogorsk'&&p.headRub!==null&&p.headWithoutSelectedGateValidation===null);
  const result={status:'DONE',fingerprint,caseId:input.caseId,capturePath:input.capture,
   captureGitBlob:blob,captureSha256:digest(bytes),provider:r.provider,routeMeters:r.route.meters,
   routeSeconds:r.route.seconds,completeOwnCapture:true,gateIndex:physical.gateIndex,
   profiles,negativeChecks:negatives,recoveredHeadComponent:recovered,
   outcome:recovered?'fixed_and_verified_for_this_own_capture':'material_exception_requires_separate_review',
   confirmedWholeTripFares:0,networkCalls};
  save(path,result);results.push(result);
  save(join(base,'progress.json'),{status:'IN_PROGRESS',fingerprint,completedCaseIds:results.map(r=>r.caseId),remaining:inputs.cases.length-results.length});
 }
 const summary={status:'DONE',fingerprint,inputCaseCount:inputs.cases.length,ownCasesChecked:results.length,
  profilesChecked:results.reduce((n,r)=>n+r.profiles.length,0),headComponentsRecovered:results.filter(r=>r.recoveredHeadComponent).length,
  materialExceptions:results.filter(r=>!r.recoveredHeadComponent).map(r=>r.caseId),
  negativeChecksPassed:results.reduce((n,r)=>n+Object.values(r.negativeChecks).filter(Boolean).length,0),
  confirmedWholeTripFares:0,wholeTripEvaluations:0,networkCalls,newRoutingRequests:0,newTraceRequests:0,
  newSourceGets:0,newFullPricingReplays:0,representativeRepeated:false,
  caseResults:results.map(r=>({caseId:r.caseId,path:'cases/'+r.caseId+'.json',sha256:digest(readFileSync(join(base,'cases',r.caseId+'.json')))}))};
 save(join(base,'summary.json'),summary);save(join(base,'progress.json'),{status:'DONE',fingerprint,completedCaseIds:results.map(r=>r.caseId),remaining:0});
 console.log(JSON.stringify(summary));
}finally{globalThis.fetch=fetch0;}
