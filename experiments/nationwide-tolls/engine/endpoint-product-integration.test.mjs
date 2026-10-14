import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import core from './quote.cjs';
import {matrixM12Component,m12PairFromBoundary} from './m12-route-adapter.mjs';
const component=(road,from,to,profile='allDays')=>({road,from,to,profile,localDate:'2026-10-14',routeId:'r',traversalId:road,exactTraversal:true,profileResolved:true});
const request=components=>({routeId:'r',evidenceComplete:true,components});
const production=(first,last,direction='forward')=>({core:{status:'priced',finalMarkers:[first,last],boundary:{status:'proven',firstRvpKm:first,lastRvpKm:last,direction}},tolls:{amount:1}});
test('M12 ready direct pair ignores native money and intermediate vector representation',()=>{
 const p=production(184,764);
 assert.deepEqual(m12PairFromBoundary(p.core.boundary),{from:'vladimir',to:'ivanovskoe_p241'});
 p.core.finalMarkers=[NaN,9999,184,184];p.tolls.amount=Number.MAX_VALUE;
 assert.equal(matrixM12Component(p,'2026-10-14T12:00:00+03:00').tolls.amount,3513);
 const reverse=production(764,184,'reverse');
 assert.deepEqual(m12PairFromBoundary(reverse.core.boundary),{from:'ivanovskoe_p241',to:'vladimir'});
 assert.equal(matrixM12Component(reverse,'2026-10-14T12:00:00+03:00').tolls.amount,3513);
});
test('recorded calibrated M12 projection controls select their operator pair in both directions',async()=>{
 const fixture=JSON.parse(readFileSync(new URL('../../../data/fixtures/m12-route-projections-2026-09-30.json',import.meta.url)));
 const {evaluateM12Evidence}=await import('../../../lib/toll-engine/m12-route-core.ts');
 for(const id of ['moscow->kazan','kazan->moscow']){
  const route=fixture.routes.find(r=>r.id===id);
  const native=evaluateM12Evidence(route);
  assert.equal(native.status,'priced');
  const quote=matrixM12Component({core:native,tolls:{amount:native.amountRub}},'2026-10-14T12:00:00+03:00');
  assert.equal(quote.tolls.amount,3513);
 }
});
test('M12 rejects missing/impossible date, direction conflict and unbound OctoberShali',()=>{
 for(const bad of [null,0,'2026-10-14','2026-02-30T12:00:00+03:00'])assert.equal(matrixM12Component(production(184,764),bad).tolls,null);
 assert.equal(matrixM12Component(production(184,764,'reverse'),'2026-10-14T12:00:00+03:00').tolls,null);
 assert.equal(matrixM12Component(production(184,832),'2026-10-14T12:00:00+03:00').tolls,null);
 assert.equal(matrixM12Component(production(184,764),'2026-10-07T12:00:00+03:00').tolls,null);
 assert.equal(matrixM12Component({...production(184,764),blockedByMixedRoadEvidence:true},'2026-10-14T12:00:00+03:00').tolls,null);
 assert.equal(m12PairFromBoundary({status:'unknown',firstRvpKm:184,lastRvpKm:764,direction:'forward'}),null);
});
test('M4 and its separate western bypass add once, but two M4 representations stay rejected',()=>{
 const m4=component('m4-south','1046','1223','monThu');
 const bypass={...component('m4-dzok','0','51','monThu'),productId:'krasnodar-west-bypass'};
 const a289=component('a289','Maryanskaya','Temryuk');
 assert.equal(core.quote(request([m4,bypass])).rub,1640);
 assert.equal(core.quote(request([m4,bypass,a289])).rub,2440);
 assert.equal(core.quote(request([m4,component('m4-candidate','m4-71','m4-71','monThu')])).rub,null);
 assert.equal(core.quote(request([bypass,{...bypass,traversalId:'another'}])).rub,null);
 assert.equal(core.quote(request([{...bypass,productId:'m4'}])).reason,'component-product-mismatch');
});
test('missing separate bypass price never becomes a numeric M4 subtotal',()=>{
 const q=core.quote(request([component('m4-south','1046','1223','monThu'),component('m4-dzok','missing','51','monThu')]));
 assert.equal(q.rub,null);assert.equal(q.components[0].rub,1230);
});
test('CKAD footnote requires context only for the16M12–Nosov-side pairs',()=>{
 const matrix=JSON.parse(readFileSync(new URL('../TARIFF_VECTOR_MATRIX_2026-10-12.json',import.meta.url)));
 assert.equal(matrix.rows.filter(r=>r.road==='ckad'&&r.requiresTariffContext).length,16);
 for(const[from,to]of [['М-12 Восток','М-7 Волга'],['М-7 Волга','М-12 Восток']])assert.equal(core.quote(request([component('ckad',from,to)])).rub,40);
 assert.equal(core.quote(request([component('ckad','М-12 Восток','Носовихинское шоссе')])).rub,null);
});
