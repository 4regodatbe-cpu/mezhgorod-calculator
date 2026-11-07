// Thin sequential orchestration of the existing diagnostic client; no HTTP implementation here.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {main,validateOwnerApproval} from '../experiments/2gis-diagnostics/diagnose.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),project=path.dirname(root),diag=path.join(project,'experiments/2gis-diagnostics');
const read=p=>JSON.parse(fs.readFileSync(p));const save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
async function run(){
 const manifest=read(path.join(root,'APPROVAL_MANIFEST.json')),auth=read(path.join(root,'OWNER_APPROVALS.json'));
 if(manifest.maximumUnits!==11||manifest.windows.length!==11)throw Error('Exact eleven-window scope required');
 if(createHash('sha256').update(fs.readFileSync(path.join(root,'APPROVAL_MANIFEST.json'))).digest('hex')!==auth[0].manifestSha256)throw Error('Manifest mismatch');
 const ledgerFile=path.join(diag,'.query-history.json'),preFile=path.join(diag,'preflight.local.json');const base=read(preFile);const ids=new Set(manifest.windows.map(x=>x.id));
 const reserved=()=>read(ledgerFile).attempts.filter(a=>ids.has(a.id));
 const out=path.join(root,'RESULT_SUMMARIES');fs.mkdirSync(out,{recursive:true});let stop=false,failures=0;
 for(const w of manifest.windows){
  if(stop)break;if(reserved().some(x=>x.id===w.id))continue;if(fs.existsSync(path.join(out,w.id+'.json')))throw Error('Saved result exists without primary reservation; restore ledger, never resend');if(reserved().length>=11)break;
  const last=read(ledgerFile).attempts.map(x=>Date.parse(x.completedAt??x.startedAt)).filter(Number.isFinite).sort((a,b)=>b-a)[0]??0;
  const delay=Math.max(0,15000-(Date.now()-last));if(delay)await new Promise(r=>setTimeout(r,delay));
  const approval=auth.find(x=>x.ownerApproval.windowIds[0]===w.id);validateOwnerApproval(approval,w.id,Date.now());
  save(preFile,{...base,remainingUnits:985-reserved().length,ownerApproval:approval.ownerApproval});
  let summary=null,error=null;const original=console.log;
  console.log=s=>{summary=JSON.parse(s);};
  try{await main(['--case',w.id,'--execute']);}catch{error='Existing runner failed; consult durable reservation/status, never retry this ID.';}finally{console.log=original;}
  const attempt=reserved().find(x=>x.id===w.id);const result={id:w.id,group:w.group,object:w.object,type:w.type,status:attempt?.status??'NOT_SENT_GATE_ERROR',reservedUnits:attempt?1:0,httpAttempts:attempt?1:0,summary,error,requestParameters:attempt?.requestParameters??null,startedAt:attempt?.startedAt??null,completedAt:attempt?.completedAt??null,rawDataRetained:false};
  save(path.join(out,w.id+'.json'),result);fs.appendFileSync(path.join(root,'REQUEST_RESULTS.jsonl'),JSON.stringify(result)+'\n');
  save(path.join(root,'LIVE_PROGRESS.json'),{completedIds:reserved().map(x=>x.id),reservedUnits:reserved().length,lastId:w.id,at:new Date().toISOString()});
  original(JSON.stringify({id:w.id,status:result.status,http:summary?.httpStatus??null,distanceM:summary?.distanceM??null,reservedUnits:reserved().length}));
  if(!attempt||[401,402,403,429].includes(summary?.httpStatus))stop=true;
  if(attempt?.status==='outcome_unknown'){failures++;if(failures>=2)stop=true;}
 }
}
process.stdin.once('data',async c=>{process.env.DGIS_HTTP_API_KEY=c.toString().trim();try{await run();}catch(e){console.error('Orchestration stopped without retry: '+e.message);process.exitCode=1;}finally{delete process.env.DGIS_HTTP_API_KEY;process.exit(process.exitCode||0);}});process.stdin.resume();
