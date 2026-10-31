import test from 'node:test';
import assert from 'node:assert/strict';
import {buildArzamasRecovery,inspectArzamas} from './practical-recovery.mjs';
import {estimateRouteTolls} from './estimate.ts';

test('saved Arzamas destination is Saint Petersburg Primorsky avenue, not Primorsk town',()=>{
 const e=inspectArzamas();assert.equal(e.notPrimorskTown,true);assert.equal(e.destination.label,'Санкт-Петербург, Приморский проспект, контроль');assert.deepEqual(e.destination.position,{lng:30.24,lat:59.982});
});
test('actual saved CKAD M7→M11 selects category I direct941, not M12→M11=981 or category II',()=>{
 const e=inspectArzamas();assert.equal(e.ckad.rub,941);assert.equal(e.ckad.entry,'М-7 Волга');assert.equal(e.ckad.exit,'М-11 Нева');assert.equal(e.ckad.footnote120Applies,false);assert.equal(e.ckad.effectiveFrom,'2026-03-02T00:00:00+03:00');assert.equal(e.networkRequests,0);assert.equal(e.newRouteOrTraceReplays,0);
});
test('two exact ZSD plazas and exit are retained;900 hypothesis is not a usable quote',()=>{
 const e=inspectArzamas();assert.deepEqual(e.zsd.booths.map(b=>b.node),[933974870,1766158781]);assert.equal(e.zsd.exit.way,355755817);assert.equal(e.zsd.conditionalZoneSumRub,900);assert.equal(e.zsd.admittedFareRub,null);assert.equal(e.zsd.status,'unknown');
});
test('CKAD adds941 to both date subtotals without promoting incomplete6928/7268 to whole fare',()=>{
 const r=buildArzamasRecovery();assert.deepEqual(r.rows.map(s=>s.result.assessedSubtotalRub),[6928,7268]);assert.deepEqual(r.rows.map(s=>s.oldAssessedSubtotalRub),[5987,6327]);assert.equal(r.newFullEstimatedRoutes,0);
 for(const s of r.rows){assert.equal(s.result.totalRub,null);assert.equal(s.result.status,'insufficient');assert.deepEqual(s.result.missingCoverage,['zsd']);assert.equal(s.strict.amount,null);assert.equal(s.result.strict,s.strict);assert.equal(s.geometryUnchanged,true);assert.equal(s.input.components.find(c=>c.id==='zsd').quote,undefined);}
});
test('recovered CKAD cannot bypass disabled default or overlap guards',()=>{
 const s=buildArzamasRecovery().rows[0];assert.equal(estimateRouteTolls(s.input).status,'disabled');const c=s.input.components.find(v=>v.id==='ckad');
 const out=estimateRouteTolls({...s.input,components:[...s.input.components,{...c,id:'duplicate-ckad'}]},{enabled:true});assert.equal(out.totalRub,null);assert.equal(out.reasons[0],'overlapping_product_or_aggregate_coverage');
});
