import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFileSync,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const dates=['2026-10-15T09:00:00+03:00','2026-10-17T09:00:00+03:00'];
const base='experiments/nationwide-tolls';
const root=base+'/source-snapshots/systemic-road-audit-2026-10-15';
const queuePath=base+'/PART19_FINDINGS_QUEUE.json';
const branch='fix/v3-missing-route-prices-2026-10-15';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024}).trim();
const raw=p=>JSON.parse(gunzipSync(fs.readFileSync(p)));
const isZsd=names=>(names??[]).some(n=>/зсд|западный скоростной диаметр/iu.test(n));

export function nextZsdCase(queue){
 const finding=queue.findings.find(f=>f.code==='zsd:unpriced');
 const rows=queue.zsdReview?.evaluatedCases??[];
 if(!finding||new Set(finding.caseIds).size!==finding.caseIds.length
  ||new Set(rows.map(r=>r.caseId)).size!==rows.length
  ||rows.some((r,i)=>r.caseId!==finding.caseIds[i])
  ||(queue.zsdReview?.checked!=null&&queue.zsdReview.checked!==rows.length))throw Error('INVALID_PROGRESS');
 const done=new Set(rows.map(r=>r.caseId));
 const next=finding.caseIds.find(id=>!done.has(id))??null;
 if(queue.nextCase!==next)throw Error('NEXT_CASE_MISMATCH');
 if(rows.at(-1)?.status==='current_unknown_needs_distinct_scope_review')throw Error('SCOPE_DIAGNOSIS_REQUIRED');
 return next;
}

export function verifyFindingPair(outputs,identity){
 if(outputs.length!==2)throw Error('TWO_PROFILES_REQUIRED');
 for(let i=0;i<2;i++){
  const o=outputs[i];
  if(o.caseId!==identity.caseId||o.captureSha256!==identity.captureSha256||o.provider!==identity.provider)throw Error('SELECTED_CAPTURE_MISMATCH');
  if(o.mode!=='offline-recorded-response-replay'||o.departureAt!==dates[i]
   ||o.tariffPolicy?.id!=='trip-departure-v1'||o.tariffPolicy.basisAt!==dates[i])throw Error('DEPARTURE_POLICY_MISMATCH');
  if(o.traceComplete!==true||o.replayIntegrity?.complete!==true||o.replayIntegrity.missingResponses?.length!==0)throw Error('INCOMPLETE_REPLAY');
  const missing=o.audit?.missing;
  if(!Array.isArray(missing)||(missing.length&&(o.tolls?.amount!==null||o.audit.status!=='unknown'))
   ||(!missing.length&&(!Number.isFinite(o.tolls?.amount)||o.audit.status!=='priced')))throw Error('INCONSISTENT_TOTAL_COMPLETENESS');
 }
 return [...new Set(outputs.flatMap(o=>o.audit.missing))].sort();
}

/** Audit equivalence only: never an input to live pricing or a fare proof. */
export function zsdScopeFingerprint(validation,knownNodes=[]){
 const known=new Set(knownNodes);
 return {
  ways:[...new Set((validation.paidRoadEdges??[]).filter(e=>isZsd(e.roadNames)).map(e=>e.wayId))].sort(),
  gates:(validation.tollBooths??[]).filter(b=>known.has(b.osmNodeId)||isZsd(b.roadNames)).map(b=>b.osmNodeId),
 };
}

export function zsdRouteManeuvers(route){
 return (route.legs??[]).flatMap(l=>l.maneuvers??[]).filter(m=>m&&isZsd(m.street_names));
}

function preflight(){
 if(git('branch','--show-current')!==branch||git('status','--porcelain'))throw Error('WRONG_BRANCH_OR_UNSAVED_STEP');
 const remote=git('ls-remote','origin','refs/heads/'+branch).split(/\s/)[0];
 if(remote!==git('rev-parse','origin/'+branch)||git('rev-parse','HEAD^{tree}')!==git('rev-parse','origin/'+branch+'^{tree}'))throw Error('REMOTE_READBACK_REQUIRED');
 return remote;
}
function saveStep(queue,record,title,next){
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const checkpoint='docs/checkpoints/zsd-'+stamp+'.md';
 const evidence='docs/checkpoints/evidence/zsd-'+stamp+'.json';
 const plan=read(base+'/SMALL_PARTS_PLAN.json');
 const completed=plan.parts.filter(p=>p.status==='done').length;
 const percent=100*completed/plan.parts.length;
 record={...record,at:new Date().toISOString(),checkpoint,evidence,overallPlanPercent:percent};
 write(evidence,record);
 fs.writeFileSync(checkpoint,`# ${title}\n\n${record.at}. Branch ${branch}, draftPR14. Parent ${record.parent}.\n\n${record.note}\n\nExact inputs, exit codes, outputs and SHA: ${evidence}. Offline replay is not fresh live/operator confirmation. Unknown is not0; component subtotal is not a wholequote. No runtime pricing changes or newfullgate claimed for this audit step.\n\nPlan ${percent}% (${completed}/${plan.parts.length} completed parts), NOT tariff coverage. Part19 remains inprogress/20planned.\n\nNEXT STARTED: ${next}. Caller MUST commit/publish and verify exactremotehead/tree before next invocation. No main/merge/Production/Android/messages.\n`);
 plan.progressReporting={...plan.progressReporting,completedParts:completed,totalParts:plan.parts.length,percent};
 plan.parts.find(p=>p.id===19).nextSubstep=next;
 write(base+'/SMALL_PARTS_PLAN.json',plan);
 queue.nextAction=next;
 write(queuePath,queue);
 for(const name of ['WORK_LOG.md','NEXT_STEPS.md'])fs.appendFileSync(base+'/'+name,`\n${record.at}: ${title}; plan${percent}% (${completed}/${plan.parts.length}). [Checkpoint](../../${checkpoint}). NEXT ${next}.\n`);
 const state=fs.readFileSync('docs/WORK_STATE.md','utf8');
 const marker=state.indexOf('## NEXT STARTED');
 if(marker<0)throw Error('HANDOFF_MARKER_MISSING');
 fs.writeFileSync('docs/WORK_STATE.md',state.slice(0,marker).replace(/\*\*ZSDreview\d+\/76\*\*/,`**ZSDreview${queue.zsdReview.evaluatedCases.length}/76**`)+`## NEXT STARTED\n\n**${next}**\n\nZSD review **${queue.zsdReview.evaluatedCases.length}/76**. [Latest checkpoint](checkpoints/${path.basename(checkpoint)}). Overall plan **${percent}% (${completed}/${plan.parts.length} completed parts)**; not tariff coverage. Latest fullgate/readiness references above remain prior checks, not rerun for audit-only changes.\n\nRepository-owned utility: \`node ${base}/scripts/review-zsd-finding-case.mjs --next\` (or \`--diagnose\` after a new scope). One step only; caller commits/publishes/exacthead-tree before continuing. Do not rerun completed M4/policy/live queues. No main/merge/Production. Autocontinuation remains enabled.\n`);
 return record;
}

export function reviewNext(){
 const parent=preflight(),queue=read(queuePath),caseId=nextZsdCase(queue);
 if(!caseId)throw Error('ZSD_CLASS_REVIEWED_NOT_ALL_PARTS_COMPLETE');
 const specs=['corpus.json','road-cases.json'].flatMap(p=>read(root+'/'+p).routes);
 const matches=specs.filter(s=>s.id===caseId);
 if(matches.length!==1)throw Error('EXACTLY_ONE_SPEC_REQUIRED');
 const capture=matches[0].auditEvidence?.capture;
 if(!capture||!path.normalize(capture).startsWith(root+'/runs/'+caseId+'/'))throw Error('EXACT_CAPTURE_REQUIRED');
 const captured=raw(capture),captureSha256=sha(capture),provider=captured.record?.provider;
 if(captured.record?.spec?.id!==caseId)throw Error('RAW_CASE_MISMATCH');
 const before=new Set(fs.readdirSync(path.dirname(capture))),execution=[];
 for(const date of dates){
  const args=['--import','./scripts/register-ts-paths.mjs',base+'/scripts/run-systemic-route-case.mjs','--replay',capture,date];
  const run=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
  execution.push({command:[process.execPath,...args],exitCode:run.status,stdout:run.stdout,stderr:run.stderr,error:run.error?.message});
  if(run.status!==0){write('docs/checkpoints/evidence/zsd-replay-failed-'+Date.now()+'.json',{caseId,capture,captureSha256,execution});throw Error('REPLAY_FAILED_NO_PROGRESS');}
 }
 const added=fs.readdirSync(path.dirname(capture)).filter(p=>!before.has(p)&&p.startsWith('replay-')&&p.endsWith('.json')).map(p=>path.join(path.dirname(capture),p));
 const outputs=dates.map(date=>{
  const xs=added.map(p=>({path:p,value:read(p)})).filter(x=>x.value.departureAt===date);
  if(xs.length!==1)throw Error('EXACTLY_ONE_OUTPUT_PER_PROFILE_REQUIRED');return xs[0];
 });
 const missing=verifyFindingPair(outputs.map(o=>o.value),{caseId,captureSha256,provider});
 if(sha(capture)!==captureSha256)throw Error('RAW_CHANGED');
 const identities=read(base+'/source-snapshots/long-chain-2026-10-15/identity-sources/node-identities.json');
 const knownNodes=identities.nodes.filter(n=>n.productId==='zsd').map(n=>n.osmNodeId);
 const scope=zsdScopeFingerprint(captured.record.validation,knownNodes);
 let sameReviewedScopeCase=null;
 for(const previous of queue.zsdReview.evaluatedCases){
  if(!previous.evidence||!(previous.status.startsWith('source_gated')||previous.status==='zsd_identity_recovered_other_products_unknown'))continue;
  const source=read(path.join(base,previous.evidence));
  if(source.capture&&JSON.stringify(zsdScopeFingerprint(raw(source.capture).record.validation,knownNodes))===JSON.stringify(scope)){sameReviewedScopeCase=previous.caseId;break;}
 }
 const zsd=outputs.map(o=>o.value.detectedRoadComponents.find(c=>c.id==='zsd'));
 const status=zsd.every(c=>c?.amount!=null)?'zsd_component_priced_current_engine':!scope.ways.length&&!scope.gates.length&&!zsd.some(Boolean)?'zsd_not_detected_current_engine':sameReviewedScopeCase?'source_gated_same_reviewed_zsd_scope':'current_unknown_needs_distinct_scope_review';
 const rows=queue.zsdReview.evaluatedCases;
 rows.push({caseId,status,sameReviewedScopeCase,missing});
 const finding=queue.findings.find(f=>f.code==='zsd:unpriced');
 queue.nextCase=finding.caseIds.find(id=>!rows.some(r=>r.caseId===id))??null;
 queue.zsdReview.checked=rows.length;queue.zsdReview.total=finding.caseIds.length;
 const next=status==='current_unknown_needs_distinct_scope_review'?'Diagnose current ZSD scope using --diagnose before the nextcase':queue.nextCase?'ZSD nextcase '+queue.nextCase+'; --next; savedcapture twoofflineprofiles':'ZSD class reviewed; assess remaining finding classes, do not mark part19 complete';
 const record=saveStep(queue,{parent,caseId,capture,captureSha256,provider,execution,scope,sameReviewedScopeCase,status,missing,
  uniqueZsdWays:scope.ways,selectedZsdBooths:captured.record.validation.tollBooths.filter(b=>knownNodes.includes(b.osmNodeId)||isZsd(b.roadNames)),
  outputs:outputs.map(o=>({path:o.path,sha256:sha(o.path),caseId:o.value.caseId,departureAt:o.value.departureAt,provider:o.value.provider,captureSha256:o.value.captureSha256,tolls:o.value.tolls,detectedRoadComponents:o.value.detectedRoadComponents,audit:{status:o.value.audit.status,missing:o.value.audit.missing},traceComplete:o.value.traceComplete,replayIntegrity:o.value.replayIntegrity})),
  note:`Case${rows.length}: both profiles exit0/complete/SHA/departure verified. Status ${status}; whole-route missing ${missing.join(',')}. Scope equivalence reuses diagnosis only, never a fare.`},'ZSD case'+rows.length+' replay DONE',next);
 rows.at(-1).checkpoint='../../'+record.checkpoint;rows.at(-1).evidence='../../'+record.evidence;write(queuePath,queue);
 return {caseId,index:rows.length,total:finding.caseIds.length,status,nextCase:queue.nextCase,checkpoint:record.checkpoint};
}

export function diagnoseCurrent(){
 const parent=preflight(),queue=read(queuePath),entry=queue.zsdReview.evaluatedCases.at(-1);
 if(entry?.status!=='current_unknown_needs_distinct_scope_review')throw Error('NO_PENDING_SCOPE_DIAGNOSIS');
 const evidence=read(path.join(base,entry.evidence)),captured=raw(evidence.capture);
 const snapshot=read(base+'/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json');
 const known=new Set(snapshot.ways.map(w=>w.id));
 const outside=evidence.uniqueZsdWays.filter(w=>!known.has(w));
 if(!outside.length||!evidence.outputs.every(o=>o.detectedRoadComponents.find(c=>c.id==='zsd')?.reason==='zsd_trip_extends_outside_reviewed_zone1'))throw Error('NEW_CAUSE_REQUIRES_MANUAL_REVIEW');
 const maneuvers=zsdRouteManeuvers(captured.record.route);
 entry.status='source_gated_distinct_finished_zsd_scope';
 const next=queue.nextCase?'ZSD nextcase '+queue.nextCase+'; --next; savedcapture twoofflineprofiles':'ZSD class reviewed; review other finding classes';
 const record=saveStep(queue,{parent,caseId:entry.caseId,capture:evidence.capture,captureSha256:evidence.captureSha256,outsideZone1Ways:outside,maneuvers,
  scope:evidence.scope,remainingMissing:evidence.missing,note:`Selected trace really extends beyond zone1: ${outside.length} unreviewed way IDs. Current refusal is consistent with that scope, not an established runtimebug. Exact source-backed finished collection span remains unbound. No per-zone/gate-count sum activated; unrelated missing products remain open.`},'ZSD distinct scope diagnosis DONE',next);
 entry.scopeCheckpoint='../../'+record.checkpoint;entry.scopeEvidence='../../'+record.evidence;write(queuePath,queue);
 return {caseId:entry.caseId,status:entry.status,nextCase:queue.nextCase,checkpoint:record.checkpoint};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{
  const mode=process.argv[2];if(!['--next','--diagnose'].includes(mode))throw Error('Usage: --next | --diagnose. Publish/readback each step before continuing.');
  console.log(JSON.stringify(mode==='--next'?reviewNext():diagnoseCurrent()));
 }catch(error){console.error(String(error));process.exitCode=1;}
}
