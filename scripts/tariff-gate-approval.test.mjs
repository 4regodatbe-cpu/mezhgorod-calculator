import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assessTariffGate,verifySavedOfficialSource} from '../experiments/tariff-gate-proposal/gate.mjs';
import {assessTariffProducts} from '../experiments/tariff-gate-proposal/product-gate.mjs';
import {evaluateTariffFreshness,freshnessExitCode} from './check-tariff-freshness.mjs';
const report={asOf:'2026-11-07',rows:[{id:'synthetic',status:'STALE',effectiveFrom:null,effectiveDateStatus:'UNKNOWN'}]};
const entry={id:'synthetic',source:{},fareKnown:true,versionBasis:'latest_available_official_document',coverageComplete:true,applicability:{status:'accepted_working_calculation',basis:'Synthetic owner-accepted latest edition; exact legal date unknown'},contradiction:'none',productBinding:'accepted_working_calculation',doubleChargeRisk:false};
const run=(changes={},r=report,verify=()=>true)=>assessTariffGate(r,{schemaVersion:1,rows:[{...entry,...changes}]},verify);
test('stale observation warns; unknown legal date permits explicitly accepted working application',()=>{
 const result=run();assert.equal(result.exitCode,0);assert.deepEqual(result.warnings.map(x=>x.code),['observation_recheck_due','effective_date_not_established']);
 assert.equal(freshnessExitCode({stale:2,invalid:0},true),2,'mandatory gate remains unchanged');
});
test('missing official fare/source, wrong application date, conflict and double charge block',()=>{
 for(const changes of [{fareKnown:false},{versionBasis:'secondary_summary'},{coverageComplete:false},{applicability:{status:'wrong_date',basis:'future edition'}},{contradiction:'material'},{contradiction:'unknown'},{productBinding:'unknown'},{doubleChargeRisk:true}])assert.equal(run(changes).exitCode,2);
 assert.equal(run({},report,()=>false).exitCode,2);
});
test('future/invalid dates block; freshness alone never manufactures validity',()=>{
 for(const change of [{status:'FUTURE_OBSERVATION'},{status:'INVALID'},{effectiveDateStatus:'INVALID'},{effectiveFrom:'2026-12-01'}])assert.equal(run({}, {...report,rows:[{...report.rows[0],...change}]}).exitCode,2);
});
test('missing, duplicate, unrelated and empty evidence cannot silently pass',()=>{
 for(const evidence of [undefined,{schemaVersion:1,rows:[]},{schemaVersion:1,rows:[null]},{schemaVersion:1,rows:[entry,entry]},{schemaVersion:1,rows:[{...entry,id:'other'}]}])assert.equal(assessTariffGate(report,evidence,()=>true).exitCode,2);
 assert.equal(assessTariffGate({rows:[]},{schemaVersion:1,rows:[]}).exitCode,2);
});
test('source verifier checks real saved bytes; fixture is not certified as an actual operator source',()=>{
 const file='docs/TARIFF_SOURCE_POLICY.md';
 const source={officialDocumentReviewed:true,url:'https://example.test/synthetic',path:file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')};
 assert.equal(verifySavedOfficialSource(source),true);
 for(const change of [{sha256:'0'.repeat(64)},{officialDocumentReviewed:false},{path:'/etc/passwd'},{path:'missing-source'}])assert.equal(verifySavedOfficialSource({...source,...change}),false);
});
test('mandatory product gate accepts evidenced active products with stale/fact-date warnings; absent evidence stays blocked',()=>{
 const real=evaluateTariffFreshness(fs.readFileSync('lib/toll-engine/tariff-registry.ts','utf8'),'2026-11-07');
 assert.equal(real.stale,2);assert.equal(freshnessExitCode(real,true),2);
 const productEvidence=JSON.parse(fs.readFileSync('experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json','utf8'));
 const assessment=assessTariffProducts(real,productEvidence);
 assert.equal(assessment.exitCode,0);assert.equal(assessment.status,'PASS_WITH_WARNINGS');
 assert(assessment.warnings.some(row=>row.code==='observation_recheck_due'));
 assert(assessment.warnings.some(row=>row.code==='effective_date_not_established'));
 assert.equal(assessTariffProducts(real,undefined).exitCode,2);
});
test('prepared Avtodor rows verify only retained primary PDFs and stay blocked on the missing M1 artifact',()=>{
 const evidence=JSON.parse(fs.readFileSync('experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json','utf8'));
 assert.equal(evidence.rows.length,2);
 const expected={
  m3:['experiments/nationwide-tolls/source-documents/m3-order53-effective-2026-03-02.pdf','d5344fd6bb54329466c5236e3d1657a14dd87ca8c3eddf2529276fbe1fa9d3a3'],
  ckad:['experiments/nationwide-tolls/source-documents/ckad-order56-effective-2026-03-02.pdf','839488fed07f8e611b5304498f22d49626ff0dc7529df67734a2052a49bea3e7'],
  a289:['experiments/nationwide-tolls/source-documents/a289-order55-effective-2026-03-02.pdf','da558d538e5a9e2ef8d36d46e0aec69c43b987f81c10d2186733a19aaca933bd'],
 };
 for(const row of evidence.rows){
  assert.equal(row.observedAt,'2026-10-01');assert.equal(row.coverageComplete,false);
  assert.equal(row.roadCoverage.find(x=>x.road==='m1-33-66').status,'MISSING_PRIMARY_ARTIFACT');
  for(const [road,[file,sha]] of Object.entries(expected)){
   const record=row.roadCoverage.find(x=>x.road===road);assert.equal(record.status,'PRIMARY_DOCUMENT_REVIEWED');
   assert.equal(record.sourcePath,file);assert.equal(record.sourceSha256,sha);
   assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),sha);
  }
  const ckad=row.roadCoverage.find(x=>x.road==='ckad');
  assert.equal(createHash('sha256').update(fs.readFileSync(ckad.transcribedMatrixPath)).digest('hex'),ckad.transcribedMatrixSha256);
  assert.equal(JSON.parse(fs.readFileSync(ckad.transcribedMatrixPath,'utf8')).sourceFareStatus,'verified-operator-category1-direct-matrix');
  assert.deepEqual(row.roadCoverage.find(x=>x.road==='a289').fareCellsRub,{
   'Maryanskaya-Slavyansk':415,'Slavyansk-Varenikovskaya':205,'Maryanskaya-Varenikovskaya':620,
   'Varenikovskaya-Temryuk':180,'Maryanskaya-Temryuk':800,'Slavyansk-Temryuk':385,
  });
  const assessment=assessTariffGate({asOf:'2026-11-07',rows:[{id:row.id,status:'STALE',effectiveFrom:null,effectiveDateStatus:'UNKNOWN'}]},
   {schemaVersion:1,rows:[row]});
  assert.equal(assessment.status,'BLOCKED');assert.equal(assessment.exitCode,2);
  assert.deepEqual(assessment.warnings.map(x=>x.code),['observation_recheck_due','effective_date_not_established']);
  assert(assessment.errors.some(x=>x.code==='official_source_missing_or_unverified'));
  assert(assessment.errors.some(x=>x.code==='official_source_coverage_incomplete'));
 }
});
test('prepared-evidence mutation controls block future application date, fare conflict and double-charge risk',()=>{
 const evidence=JSON.parse(fs.readFileSync('experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json','utf8'));
 const row=evidence.rows[0];
 for(const changes of [
  {applicability:{status:'wrong_date',basis:'future tariff edition'}},
  {contradiction:'material'},
  {doubleChargeRisk:true},
 ]){
  const result=assessTariffGate({asOf:'2026-11-07',rows:[{id:row.id,status:'STALE',effectiveFrom:null,effectiveDateStatus:'UNKNOWN'}]},
   {schemaVersion:1,rows:[{...row,...changes}]});
  assert.equal(result.exitCode,2);
 }
});
