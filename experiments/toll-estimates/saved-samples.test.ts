import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSavedSamples,sampleReport} from './saved-samples.ts';
const oldFetch=globalThis.fetch;let network=0;
globalThis.fetch=async()=>{network++;throw new Error('No external fetch permitted in E3');};
let samples:ReturnType<typeof buildSavedSamples>;
try{samples=buildSavedSamples();}finally{globalThis.fetch=oldFetch;}
test('E3 full saved multi-road total retained exactly and explicitly graded estimated',()=>{
 const rows=samples.filter(s=>s.caseId==='pair-m4-m11-krasnodar-to-spb');assert.equal(rows.length,2);assert.deepEqual(rows.map(s=>s.result.totalRub),[10464,12334]);assert.ok(rows.every(s=>s.result.status==='estimated'));
 assert.deepEqual(rows[0].result.components.filter(c=>c.status==='estimated').map(c=>c.id),['m4']);assert.equal(rows[0].result.confirmedSubtotalRub,5424);
});
test('E3 missing CKAD/ZSD does not turn5987 or6327 into a complete route estimate',()=>{
 const rows=samples.filter(s=>s.caseId.includes('arzamas-to-prim'));assert.equal(rows.length,2);assert.ok(rows.every(s=>s.result.totalRub===null&&s.result.status==='insufficient'));assert.deepEqual(rows.map(s=>s.result.assessedSubtotalRub),[5987,6327]);assert.deepEqual(rows[0].result.missingCoverage,['ckad','zsd']);assert.equal(rows[0].result.components.find(c=>c.id==='m12')?.status,'estimated');
});
test('E practical recovery: derived ZSD600 is estimated without rewriting original strict status/source/amount',()=>{
 const rows=samples.filter(s=>s.caseId.startsWith('dnr-'));assert.equal(rows.length,2);
 for(const row of rows){assert.equal(row.result.totalRub,600);assert.equal(row.result.status,'estimated');assert.equal(row.result.confirmedSubtotalRub,null);assert.equal(row.strictTotalRub,600);
  assert.deepEqual(row.result.strict,{pricingStatus:'priced',amount:600,priceConfirmation:'confirmed'});assert.equal(row.result.strict,row.input.strict);
  const q=row.input.components[0].quote;assert.equal(q?.assurance,'working_estimate');assert.equal(q?.source,'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json');
  assert.equal(row.geometryUnchanged,true);}
});
test('E3 selected geometry strict snapshots and departure calendars remain source-bound without network',()=>{
 assert.equal(network,0);for(const s of samples){assert.equal(s.geometryUnchanged,true);assert.equal(s.result.strict,s.input.strict);assert.equal(s.result.strict.amount,s.strictTotalRub);assert.ok(s.result.components.every(c=>c.conditions.profile===s.input.components.find(p=>p.id===c.id)?.quote?.profile||c.status==='unknown'));}
});
test('E3 report counts three distinct retained routes, not six evaluations or synthetic estimates',()=>{
 const r=sampleReport();assert.deepEqual(r.countsAtSavedDeparture,{confirmed:0,estimated:2,unknown:1});assert.equal(r.newNumericTotalsForPreviouslyUnknownRoutes,0);assert.equal(r.multiRoadRoutes,2);assert.equal(r.networkRequests,0);
});
