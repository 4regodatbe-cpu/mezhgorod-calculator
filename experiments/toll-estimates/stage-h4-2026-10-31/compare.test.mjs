import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {compare} from './compare.mjs';
const d='experiments/toll-estimates/stage-h4-2026-10-31/',p=d+'imported/stage_g_reconstruction_2026-10-31/';
const read=x=>JSON.parse(fs.readFileSync(x,'utf8'));
const hash=x=>crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex');

test('H4 supplied ZIP and five imported raw files retain declared hashes',()=>{
 const v=read(d+'input-validation.json');assert.equal(v.files.length,5);assert.equal(hash(d+'stage_g_reconstruction_2026-10-31.zip'),v.archiveSha256);for(const f of v.files)assert.equal(hash(f.localPath),f.sha256);
});
test('H4 report and reconstructed analysis match package manifest, not an original G claim',()=>{
 const m=read(p+'evidence-manifest.reconstructed.json'),a=read(p+'component-analysis.reconstructed.json');assert.equal(hash(p+m.source_file),m.source_sha256);assert.equal(hash(p+'component-analysis.reconstructed.json'),m.reconstructed_component_analysis_sha256);assert.equal(a.original_stage_g_commit_verified,false);assert.equal(a.original_stage_g_component_analysis_recovered_bytewise,false);assert.equal(m.screenshots_separately_available,false);
});
test('H4 all four endpoints, retained geometry hashes and historical amounts agree with E F',()=>{
 const r=compare();assert.equal(r.records.length,4);for(const v of r.records){assert.equal(v.endpointsMatchSavedEF,true);assert.equal(v.savedGeometrySha256.length,64);assert.ok(Math.abs(v.milesToKm-v.reportedYandexDistanceKmApprox)<0.1);}
});
test('H4 monetary records and diagnostic differences agree without tariff attribution',()=>{
 const r=compare();const money=r.records.filter(x=>x.reportedYandexTotal!==null);assert.deepEqual(money.map(x=>x.reportedYandexTotal),[11070,10320,9353]);assert.deepEqual(money.map(x=>x.diagnosticYandexMinusHistoric),[{weekday:606,saturday:-1264},{weekday:786,saturday:-864},{weekday:2425,saturday:2085}]);assert.ok(money.every(x=>!x.tollDifferenceAssignedToRoad&&!x.runtimeAdmission));
 const g=read(p+'component-analysis.reconstructed.json').routes[2].conditional_group_residual;assert.equal(g.known_m11_saturday_components_rub,5944);assert.equal(g.amount_rub,10320-5944);
});
test('H4 retains H2 assessed versus confirmed grades, null total and conditional residual only',()=>{
 const a=compare().arzamasCurrent;assert.deepEqual(a.assessed,[6928,7268]);assert.deepEqual(a.confirmedGrade,[4274,4614]);assert.equal(a.estimatedM12+a.estimatedCkad,a.estimatedSubtotal);assert.equal(a.routeApplicationGrade,'working_estimate');assert.equal(a.full,null);assert.equal(a.zsd,null);assert.equal(a.conditionalDifferenceIsZsdTariff,false);
});
test('H4 stale report claims are recorded as discrepancies rather than modifying historical sources',()=>{
 const r=compare();assert.ok(r.findings.some(x=>x.id==='H4-DATA-01'));assert.ok(r.findings.some(x=>x.id==='H4-DATA-02'));assert.equal(hash(p+'source/YANDEX_PAID_ROADS_REPORT_2026-10-31.md'),'9262482b666455be2a65550e77c88a327d804fd50abe480d8a02e9df53af8f76');
});
test('H4 no browser or tariff authority is inferred; ferry control excluded',()=>{
 const saved=globalThis.fetch;globalThis.fetch=()=>{throw Error('H4 network forbidden');};try{const r=compare();assert.equal(r.newYandexRequests,0);assert.equal(r.newRouteAudits,0);const tor=r.records[0];assert.equal(tor.reportedYandexTotal,null);assert.equal(tor.diagnosticYandexMinusHistoric,null);assert.equal(tor.ferryReported,true);assert.ok(r.records.every(x=>!x.sameTariffDate&&!x.exactPolylineMatch&&!x.entryExitPaymentMatch&&!x.screenshotFilesAvailable));assert.equal(r.publication.externalEstimatesRuntimeReady,false);assert.equal(r.originalGRecovered,false);}finally{globalThis.fetch=saved;}
});
test('H4 saved comparison is reproducible from the unchanged supplied and project data',()=>{
 assert.deepEqual(read(d+'comparison.json'),compare());
});
