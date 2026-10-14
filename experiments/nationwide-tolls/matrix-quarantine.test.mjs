import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import core from './engine/quote.cjs';
const matrix=JSON.parse(readFileSync(new URL('./TARIFF_VECTOR_MATRIX_2026-10-12.json',import.meta.url)));
const request=row=>({routeId:'chosen',evidenceComplete:true,components:[{routeId:'chosen',traversalId:'m4',exactTraversal:true,profileResolved:true,road:row.road,from:row.from,to:row.to,profile:row.profile,localDate:'2026-10-14'}]});
test('all quarantined M4 chains stay unknown even with an exact full-vector key',()=>{
 const rows=matrix.rows.filter(r=>r.runtimeEligible===false);
 assert.ok(rows.length>0);
 const engine=core.createQuoteEngine({selected:[],provisional:rows,history:[]});
 for(const row of rows){
  const quote=engine.quote(request(row));
  assert.equal(quote.rub,null,row.from);
  assert.equal(quote.reason,'audit-only-fare-row',row.from);
 }
});
test('quarantine propagates through multi-road quote; it never becomes a subtotal',()=>{
 const row=matrix.rows.find(r=>r.runtimeEligible===false);
 const known={road:'a289',from:'A',to:'B',profile:'allDays',rub:800,source:'fixture',effectiveFrom:'2026-01-01',vehicleCategory:1};
 const engine=core.createQuoteEngine({selected:[known],provisional:[row],history:[]});
 const input=request(row);
 input.components.unshift({...input.components[0],road:known.road,from:'A',to:'B',profile:'allDays',traversalId:'a289'});
 const quote=engine.quote(input);
 assert.equal(quote.rub,null);
 assert.equal(quote.pricingStatus,'unknown');
 assert.equal(quote.components[0].rub,800);
});
