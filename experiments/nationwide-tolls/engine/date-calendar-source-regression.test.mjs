import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import core from './quote.cjs';
import {matrixM11Component,matrixM11GeometryComponent,m11MainlineTariffAt} from './m11-route-adapter.mjs';
import {matrixCkadComponent} from './ckad-route-adapter.mjs';
import validity from './fare-validity.cjs';
const main={boundaryStatus:'resolved',traversal:{entryPointId:'p58',exitPointId:'p593'}};
const request=(road,from,to,profile,date,extra={})=>({routeId:'r',evidenceComplete:true,components:[{road,from,to,profile,localDate:date,routeId:'r',traversalId:road,exactTraversal:true,profileResolved:true,...extra}]});
test('M11 current order switches at01:00, including holiday boundaries',()=>{
 for(const [instant,profile]of [
  ['2026-10-16T00:59:59+03:00','monThu'],['2026-10-16T01:00:00+03:00','friSun'],
  ['2026-10-19T00:59:59+03:00','friSun'],['2026-10-19T01:00:00+03:00','monThu'],
  ['2026-11-03T00:59:59+03:00','monThu'],['2026-11-03T01:00:00+03:00','friSun'],
  ['2026-11-05T00:59:59+03:00','friSun'],['2026-11-05T01:00:00+03:00','monThu'],
  ['2026-12-30T01:00:00+03:00','friSun']])assert.equal(m11MainlineTariffAt(instant).profile,profile,instant);
 const ordinary=matrixM11Component(main,'2026-10-15T12:00:00+03:00',0).tolls.amount;
 assert.equal(matrixM11Component(main,'2026-10-16T00:30:00+03:00',20*60).tolls.amount,ordinary);
 assert.equal(matrixM11Component(main,'2026-10-16T00:30:00+03:00',40*60).tolls,null);
 // Both endpoints can have the same profile while a holiday lies inside.
 assert.equal(matrixM11Component(main,'2026-11-02T12:00:00+03:00',3*86400).tolls,null);
});
test('M11 early Monday interval never uses a noon sample outside the journey',()=>{
 const weekend=matrixM11Component(main,'2026-10-18T12:00:00+03:00',0).tolls.amount;
 assert.equal(matrixM11Component(main,'2026-10-19T00:10:00+03:00',20*60).tolls.amount,weekend);
 assert.equal(matrixM11Component(main,'2026-10-18T23:50:00+03:00',40*60).tolls.amount,weekend);
 assert.equal(matrixM11Component(main,'2026-10-19T00:40:00+03:00',30*60).tolls,null);
});
test('CKAD andM11 reject normalized impossible dates, absent timezone andnon-string times',()=>{
 const ckad={exact:true,traversal:{from:'М-4 Дон',to:'М-11 Нева'}};
 for(const bad of [null,0,undefined,'2026-10-14','2026-02-30T12:00:00+03:00','2026-10-14T24:00:00+03:00','2026-10-14T12:00:00']){
  assert.equal(validity.validInstant(bad),false);
  assert.equal(matrixCkadComponent(ckad,bad).tolls,null);
  assert.equal(matrixM11Component(main,bad,0).tolls,null);
 }
 assert.equal(matrixCkadComponent(ckad,'2026-10-14T12:00:00+03:00').tolls.amount,1800);
});
test('native head money cannot substitute absent directed head boundaries',()=>{
 const parts={headAmount:Number.MAX_SAFE_INTEGER,headWeekday:100,headWeekend:100,from:'p58',to:'p593',mainlineAt:'2026-10-14T12:00:00+03:00'};
 assert.equal(matrixM11GeometryComponent({exact:true,parts}).reason,'m11_head_boundary_unresolved');
});
test('17new date bounds block pre-tariff lookups and preserve current amounts',()=>{
 for(const [road,from,to,profile,before,start,amount]of [
  ['m1','33 km','66 km','allDays','2026-03-01','2026-03-02',250],
  ['ryazan','before-overpass','after-overpass','standard','2026-09-30','2026-10-01',45],
  ['udmurtia','kamaBridgeRub-A','kamaBridgeRub-B','allDays','2026-01-31','2026-02-01',400],
  ['kazan','before-gantry','after-gantry','weekdayPeak','2025-03-08','2025-03-10',150]]){
  assert.equal(core.quote(request(road,from,to,profile,before)).rub,null);
  assert.equal(core.quote(request(road,from,to,profile,start)).rub,amount);
 }
 assert.equal(core.quote(request('kazan','before-gantry','after-gantry','otherTimes','2025-03-09')).rub,null);
 const matrix=JSON.parse(readFileSync(new URL('../TARIFF_VECTOR_MATRIX_2026-10-12.json',import.meta.url)));
 assert.equal(matrix.rows.filter(r=>r.sourceSnapshot==='source-snapshots/regional-date-proof-2026-10-14.json').length,17);
});
test('Ryazan night zero requires verified lane; MSDtransit requires eligibility context',()=>{
 const r=()=>request('ryazan','outside','city','night:22:00-06:30:lane6','2026-10-14');
 assert.equal(core.quote(r()).reason,'unresolved-operator-lane');
 const wrong=r();wrong.components[0].verifiedLane='1';assert.equal(core.quote(wrong).rub,null);
 const proven=r();proven.components[0].verifiedLane='6';assert.equal(core.quote(proven).rub,0);
 const m=()=>request('msd','ЦКАД','ЦКАД via МСД','transit','2026-10-14');
 assert.equal(core.quote(m()).rub,null);
 const transit=m();transit.components[0].tariffContextResolved=true;assert.equal(core.quote(transit).rub,950);
 transit.components[0].localDate='2023-01-01';assert.equal(core.quote(transit).rub,null);
});
