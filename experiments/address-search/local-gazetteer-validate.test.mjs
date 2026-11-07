import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCatalog} from './local-gazetteer-validate.mjs';
const row=[1,'Пункт',['Пункт'],48,37,'UA',['Область'],0,'PPL',['05','','',''],1,'2026-10-24','UA',[]];
const catalog=records=>({schemaVersion:1,license:{name:'CC-BY-4.0'},sources:[{},{},{},{}],records});
test('structural acceptance does not certify semantic accuracy or road access',()=>{
 const r=validateCatalog(catalog([row]));assert.equal(r.eligibleForFurtherReview,1);assert.equal(r.semanticAccuracyCertified,false);assert.equal(r.roadAccessCertified,false);
});
test('invalid coordinates, duplicated IDs and malformed provenance are explicit',()=>{
 const bad=[...row];bad[3]=Infinity;bad[10]=0;
 const r=validateCatalog(catalog([row,bad]));assert.equal(r.status,'BLOCKED_DUPLICATE_IDS');assert.equal(r.counts.invalid_coordinate,1);assert.equal(r.counts.invalid_provenance,1);
});
test('unknown names and administrative bindings are quarantined rather than invented',()=>{
 const bad=[...row];bad[13]=['ru_name_unverified'];const r=validateCatalog(catalog([bad]));assert.equal(r.eligibleForFurtherReview,0);assert.equal(r.counts.unverified_russian_name,1);
});
