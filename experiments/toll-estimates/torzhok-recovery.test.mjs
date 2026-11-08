import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTorzhokRecovery} from './torzhok-recovery.mjs';
import {estimateRouteTolls} from './estimate.ts';
const r=buildTorzhokRecovery();
test('previously unknown Torzhok→Kazan has source-bound full shadow5904Thu/6084Sat, not strict repricing',()=>{
 assert.equal(r.newFullEstimatedRoutes,1);assert.deepEqual(r.rows.map(s=>s.result.totalRub),[5904,6084]);
 for(const s of r.rows){assert.equal(s.result.status,'estimated');assert.deepEqual(s.result.missingCoverage,[]);assert.equal(s.result.strict,s.input.strict);assert.equal(s.result.strict.amount,null);assert.equal(s.result.strict.pricingStatus,'unknown');}
});
test('southbound M11 head uses actual reverse200/240 and mainline1250/1390, not forward280/320',()=>{
 assert.deepEqual(r.rows.map(s=>s.input.components.find(c=>c.id==='m11-15-58').quote.rub),[200,240]);assert.deepEqual(r.rows.map(s=>s.input.components.find(c=>c.id==='m11-58-679').quote.rub),[1250,1390]);
 for(const s of r.rows){assert.equal(s.m11Boundary.parts.head.from,'solnechnogorsk');assert.equal(s.m11Boundary.parts.head.to,'tskad');}
});
test('all eight retained trace chunks and both formerly unmapped plazas are source-covered once',()=>{
 assert.equal(r.proof.traceChunks,8);assert.deepEqual(r.proof.unmappedBooths,[]);assert.deepEqual(r.proof.booths,[{osmNodeId:'5286168661',wayId:'766468434'},{osmNodeId:'8087316064',wayId:'1270188041'}]);
 assert.equal(r.proof.ckad.rub,941);assert.equal(r.proof.ckad.to,'М-7 Волга');assert.equal(r.proof.ckad.footnote120Applies,false);assert.equal(r.geometryUnchanged,true);assert.equal(r.networkRequests,0);assert.equal(r.newFullRouteReplays,0);
});
test('M12 retained3513 is explicitly working-grade, not new endpoint certification',()=>{
 for(const s of r.rows){const c=s.input.components.find(c=>c.id==='m12');assert.equal(c.quote.rub,3513);assert.equal(c.quote.assurance,'working_estimate');assert.equal(c.entry,'vladimir');assert.equal(c.exit,'ivanovskoe_p241');
  for(const part of s.input.components.filter(v=>v.id!=='ckad')){assert.equal(part.quote.source,'experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json');assert.notEqual(part.quote.source,part.scope.reference,'physical proof is not a monetary tariff source');}}
});
test('no full estimate if any recovered component lacks evidence or extra unknown product is present',()=>{
 const input=r.rows[0].input;
 for(const c of input.components){const parts=input.components.map(v=>v.id===c.id?{...v,scope:{...v.scope,proven:false}}:v);assert.equal(estimateRouteTolls({...input,components:parts},{enabled:true}).totalRub,null);}
 assert.equal(estimateRouteTolls({...input,requiredCoverage:[...input.requiredCoverage,'unmapped-plaza']},{enabled:true}).totalRub,null);
});
test('default remains off and M11 head cannot be counted twice',()=>{
 const input=r.rows[0].input;assert.equal(estimateRouteTolls(input).status,'disabled');const c=input.components[1];
 const out=estimateRouteTolls({...input,components:[...input.components,{...c,id:'head-copy'}]},{enabled:true});assert.equal(out.totalRub,null);assert.equal(out.reasons[0],'overlapping_product_or_aggregate_coverage');
});
