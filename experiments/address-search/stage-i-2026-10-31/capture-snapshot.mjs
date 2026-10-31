// Bounded live recapture of the SAME four snapshot records. Never enables fallback/pilot.
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {NextRequest} from 'next/server';
import {GET} from '../../../app/api/suggest/route.ts';
import {localPilotAllowed} from '../../../lib/local-settlement-search.ts';
import switches from '../../../data/toll-feature-switches.json' with {type:'json'};
import {createHash} from 'node:crypto';
const out='experiments/address-search/stage-i-2026-10-31/';
if(localPilotAllowed()||switches.addressCitySnapshot)throw Error('Capture must be Photon only: local pilot/snapshot OFF');
const sourceCommit=process.argv[2];if(!/^[a-f0-9]{40}$/.test(sourceCommit??''))throw Error('Supply exact source SHA');
const plans=[{id:'donetsk',query:'Донецк',required:['R-1413957','R-1517207']},{id:'krasn',query:'Красн',required:['R-7373058']},{id:'rostov',query:'Ростов',required:['R-1285772']}];
const report={status:'STARTED',sourceCommit,transport:'Real current GET handler + Photon fetch; direct local handler invocation, not Preview HTTP; no mocks',maxQueries:3,perQueryBudgetMs:20000,rows:[]};
const save=()=>fs.writeFileSync(out+'capture-review.json',JSON.stringify(report,null,2)+'\n');save();
for(const plan of plans){
 const startedAt=new Date().toISOString(),at=performance.now();const c=new AbortController(),timer=setTimeout(()=>c.abort(),20500);
 try{
  const response=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(plan.query),{signal:c.signal}));
  const body=await response.json(),capturedAt=new Date().toISOString();
  const result={sourceCommit,query:plan.query,startedAt,capturedAt,status:response.status,elapsedMs:performance.now()-at,sourceKind:'real-local-handler-photon',body};
  const filename=out+'capture-'+plan.id+'.json',bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');fs.writeFileSync(filename,bytes);
  const valid=response.status===200&&!body.fallback&&!body.localSource&&plan.required.every(id=>body.items?.some(item=>item.id===id));
  report.rows.push({id:plan.id,path:filename,sha256:createHash('sha256').update(bytes).digest('hex'),status:response.status,capturedAt,elapsedMs:result.elapsedMs,requiredIdsPresent:valid});
  if(!valid){report.status='BLOCKED_CAPTURE_NOT_ADMITTED';save();process.exitCode=2;break;}
 }catch(error){report.status='BLOCKED_CAPTURE_ERROR';report.rows.push({id:plan.id,error:String(error),elapsedMs:performance.now()-at});process.exitCode=2;save();break;}
 finally{clearTimeout(timer);c.abort();}
 save();
}
if(report.status==='STARTED')report.status='CAPTURED_PENDING_REVIEW';save();console.log(JSON.stringify(report));
