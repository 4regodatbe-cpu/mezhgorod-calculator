// Offline evidence reconciliation only. Not imported by app/lib or pricing engines.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {inspectArzamas,buildArzamasRecovery} from '../practical-recovery.mjs';

const base='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/';
const recoveryPath='experiments/toll-estimates/checks/2026-10-30-recovery/arzamas-recovery.json';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

export function reconcile(){
 const evidence=inspectArzamas();
 const stored=read(recoveryPath),current=buildArzamasRecovery();
 assert.equal(evidence.capture.sha256,stored.evidence.capture.sha256);
 const old=fs.readdirSync(base).filter(f=>f.startsWith('replay-')).sort().map(f=>{
  const raw=fs.readFileSync(base+f),r=JSON.parse(raw);
  assert.equal(r.captureSha256,evidence.capture.sha256);
  return {path:base+f,sha256:hash(raw),departureAt:r.departureAt,whole:r.tolls.amount,
   components:r.audit.components.map(c=>({id:c.id,rub:c.tolls?.amount??null,reason:c.reason})),
   numericSubtotal:r.audit.components.reduce((n,c)=>n+(c.tolls?.amount??0),0)};
 });
 const rows=stored.rows.map((r,i)=>{
  const c=current.rows[i];
  const compact=x=>x.result.components.map(({id,status,rub})=>({id,status,rub}));
  assert.deepEqual(compact(c),compact(r));
  assert.equal(c.result.assessedSubtotalRub,r.result.assessedSubtotalRub);
  const previous=old.filter(v=>v.departureAt===r.departureAt);
  assert.equal(previous.length,3);
  const head=r.result.components.find(c=>c.id==='m11-15-58');
  const ckad=r.result.components.find(c=>c.id==='ckad');
  assert.equal(ckad.status,'estimated');
  return {departureAt:r.departureAt,oldReplaySubtotal:previous[0].numericSubtotal,
   oldReplayVersions:previous.map(v=>v.path),headRub:head.rub,
   subtotalAfterHead:r.oldAssessedSubtotalRub,ckadRub:ckad.rub,ckadGrade:ckad.status,
   assessedSubtotal:r.result.assessedSubtotalRub,confirmedGradeSubtotal:r.result.confirmedSubtotalRub,
   estimatedComponents:r.result.components.filter(c=>c.status==='estimated').map(({id,rub})=>({id,rub})),
   components:compact(r),missing:r.result.missingCoverage,whole:r.result.totalRub,
   deltaFromOld:r.result.assessedSubtotalRub-previous[0].numericSubtotal,
   externalYandexReportedRub:9353,conditionalExternalMinusAssessed:9353-r.result.assessedSubtotalRub,
   conditionalExternalRemainderIsZsdTariff:false,comparableYandexGeometryConfirmed:false};
 });
 return {status:'LOCAL_EVIDENCE_RECONCILED',caseId:evidence.caseId,externalRequests:0,
  classification:['REPLAY_VERSION_HEAD_RECOVERY','ADDITIONAL_SOURCE_BOUND_WORKING_CKAD_COMPONENT','ASSESSED_SUBTOTAL_NOT_CONFIRMED_SUBTOTAL','REPORTING_TERMINOLOGY'],
  arithmeticDefectDemonstrated:false,doubleChargingDemonstrated:false,
  priceSource:{path:evidence.ckad.source,pdf:evidence.ckad.operatorPdf,pdfSha256:evidence.ckad.sourceSha256,
   page:1,category:'I',row:'М-7',column:'М-11',rub:evidence.ckad.rub,payment:'post-payment / listed transponders',
   effectiveFrom:evidence.ckad.effectiveFrom,routeBindingAssurance:'working_estimate',runtimeMatrixChanged:false},
  routeEvidence:{capture:evidence.capture,geometrySha256:evidence.geometrySha256,entry:evidence.ckad.entry,
   exit:evidence.ckad.exit,shapeRange:evidence.ckad.shapeRange,entryCoordinate:evidence.ckad.entryCoordinate,
   exitCoordinate:evidence.ckad.exitCoordinate,strictOldCkadStillUnknown:true},
  oldReplays:old,rows,sourceReportAvailable:false,
  limitations:['Stage G component-analysis/evidence-manifest and library report not available in this workspace; no claim to reproduce their content.',
   '9353 is user-reported on 31 October, not a new browser observation. Different dates/geometry/payment are not reconciled.',
   'Confirmed-grade subtotal is the existing estimator classification, not new independent certification of all M11 charges.',
   'ZSD finished cash/card collection bundle remains unknown; no residual assigned as its tariff.']};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const result=reconcile();
 fs.writeFileSync(new URL('./reconciliation.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:result.status,oldVersions:result.oldReplays.length,rows:result.rows.map(r=>({date:r.departureAt,old:r.oldReplaySubtotal,head:r.headRub,ckad:r.ckadRub,assessed:r.assessedSubtotal,confirmedGrade:r.confirmedGradeSubtotal,whole:r.whole}))}));
}
