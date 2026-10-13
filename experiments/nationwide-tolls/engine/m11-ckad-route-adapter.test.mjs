import test from 'node:test';
import assert from 'node:assert/strict';
import {matrixM11Component, matrixM11GeometryComponent} from './m11-route-adapter.mjs';
import {matrixCkadComponent} from './ckad-route-adapter.mjs';
import core from './quote.cjs';
const date='2026-10-13T12:00:00+03:00';
const m11 = (from,to) => ({boundaryStatus:'resolved',blockedByMixedRoadEvidence:false,traversal:{entryPointId:from,exitPointId:to},tolls:null});
test('M11 uses directed current OD even where the old native table is unknown',()=>{
 for(const [from,to] of [['p58','p593'],['p593','p58'],['p147','p58']]) {
  const actual=matrixM11Component(m11(from,to),date,3600);
  const expected=core.quote({routeId:'r',evidenceComplete:true,components:[{routeId:'r',traversalId:'m11',exactTraversal:true,profileResolved:true,road:'m11-58-679',from,to,profile:'monThu',localDate:'2026-10-13'}]});
  assert.ok(expected.rub>0);assert.equal(actual.tolls.amount,expected.rub);
 }
});
test('M11 local Moscow Friday profile, missing/expired/profile-transition/mixed are blocked',()=>{
 const p=m11('p58','p593');
 assert.equal(matrixM11Component(p,'2026-10-15T22:00:00Z',600).tolls.period,'пятница–воскресенье');
 assert.equal(matrixM11Component(p,'bad',600).tolls,null);
 assert.equal(matrixM11Component(p,'2026-10-13T23:50:00+03:00',3600).tolls.amount,matrixM11Component(p,date,0).tolls.amount);
 assert.equal(matrixM11Component(p,'2026-10-15T23:50:00+03:00',3600).tolls,null);
 assert.equal(matrixM11Component(p,'2026-01-01T12:00:00+03:00',600).tolls,null);
 assert.equal(matrixM11Component({...p,blockedByMixedRoadEvidence:true},date,600).tolls,null);
 assert.equal(matrixM11Component({boundaryStatus:'unresolved'},date,600),null);
});
test('M11 geometry adapter replaces only separately identified mainline, keeps the head once',()=>{
 const parts={headAmount:100,headWeekday:100,headWeekend:200,from:'p147',to:'p58',mainlineAt:date};
 const direct=matrixM11Component(m11('p147','p58'),date,0);
 assert.equal(matrixM11GeometryComponent({exact:true,parts}).tolls.amount,direct.tolls.amount+100);
 assert.equal(matrixM11GeometryComponent({exact:true,parts:{...parts,to:'missing'}}).tolls,null);
});
test('CKAD direct matrix uses actual direction and date, no guessed section sum',()=>{
 for(const [from,to] of [['М-4 Дон','М-11 Нева'],['М-11 Нева','М-4 Дон']]) {
  const p={exact:true,traversal:{from,to}};
  assert.equal(matrixCkadComponent(p,date).tolls.amount,2517);
  assert.equal(matrixCkadComponent(p,'2026-01-01T12:00:00+03:00').tolls,null);
 }
 assert.equal(matrixCkadComponent({exact:false},date),null);
 assert.equal(matrixCkadComponent({exact:true,traversal:{from:'missing',to:'М-11 Нева'}},date).tolls,null);
});
