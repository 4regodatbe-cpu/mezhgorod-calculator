import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectRow} from './local-gazetteer-admission.mjs';
const row=[1,'Тест',['Тест'],48,37,'UA',['Область'],0,'PPL',['05','','',''],42,'2026-10-24','UA',[]];
test('source populated-place class is not certified independent road access',()=>{
 const r=inspectRow(row);assert.equal(r.sourceIsSettlement,true);assert.equal(r.independentCoordinateReview,'NOT_CONFIRMED');assert.equal(r.roadAccess,'NOT_CHECKED');
});
test('unverified administrative labels remain unverified with valid codes and Russian name',()=>{
 const r=inspectRow([...row.slice(0,13),['admin_ru_unverified']]);assert.equal(r.adminLabelsVerified,false);assert.equal(r.russianNameVerified,true);assert.deepEqual(r.adminCodes,['05','','','']);
});
test('missing binding is not hidden by a matching label',()=>{
 const r=inspectRow([...row.slice(0,13),['admin_binding_missing','ru_name_unverified']]);assert.equal(r.adminLabelsVerified,false);assert.equal(r.russianNameVerified,false);
});
