import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assessTariffGate,verifySavedOfficialSource} from '../experiments/tariff-gate-proposal/gate.mjs';
import {evaluateTariffFreshness,freshnessExitCode} from './check-tariff-freshness.mjs';
const report={asOf:'2026-11-07',rows:[{id:'synthetic',status:'STALE',effectiveFrom:null,effectiveDateStatus:'UNKNOWN'}]};
const entry={id:'synthetic',source:{},fareKnown:true,versionBasis:'latest_available_official_document',applicability:{status:'accepted_working_calculation',basis:'Synthetic owner-accepted latest edition; exact legal date unknown'},contradiction:'none',productBinding:'accepted_working_calculation',doubleChargeRisk:false};
const run=(changes={},r=report,verify=()=>true)=>assessTariffGate(r,{schemaVersion:1,rows:[{...entry,...changes}]},verify);
test('stale observation warns; unknown legal date permits explicitly accepted working application',()=>{
 const result=run();assert.equal(result.exitCode,0);assert.deepEqual(result.warnings.map(x=>x.code),['observation_recheck_due','effective_date_not_established']);
 assert.equal(freshnessExitCode({stale:2,invalid:0},true),2,'mandatory gate remains unchanged');
});
test('missing official fare/source, wrong application date, conflict and double charge block',()=>{
 for(const changes of [{fareKnown:false},{versionBasis:'secondary_summary'},{applicability:{status:'wrong_date',basis:'future edition'}},{contradiction:'material'},{contradiction:'unknown'},{productBinding:'unknown'},{doubleChargeRisk:true}])assert.equal(run(changes).exitCode,2);
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
test('real registry still has current mandatory stale blockers; absent source assessment stays blocked',()=>{
 const real=evaluateTariffFreshness(fs.readFileSync('lib/toll-engine/tariff-registry.ts','utf8'),'2026-11-07');
 assert.equal(real.stale,2);assert.equal(freshnessExitCode(real,true),2);
 assert.equal(assessTariffGate(real,undefined).exitCode,2);
});
