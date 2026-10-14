import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {matrixM4Component} from './engine/m4-route-adapter.mjs';
const root=new URL('./',import.meta.url);
const source=JSON.parse(readFileSync(new URL('source-snapshots/m4-order58-2026-03-02-category1-verified.json',root)));
const boundary=id=>({endpointOnly:true,exact:true,tolls:null,m4PvpPreview:{confirmedPvps:[id]}});
test('verified operator transcription is linked to the actual preserved PDF bytes',()=>{
 assert.equal(createHash('sha256').update(readFileSync(new URL(source.sourceFile,root))).digest('hex'),source.sourceSha256);
 assert.equal(source.effectiveFrom,'2026-03-02T00:00:00+03:00');
 assert.equal(source.constraints['m4-355'].publishedDirection,'towards Moscow');
});
test('operator355 receipt semantics link to the second unchanged uploaded PDF',()=>{
 const rules=JSON.parse(readFileSync(new URL('source-snapshots/m4-355-receipt-rule-verified-2026-10-14.json',root)));
 assert.equal(createHash('sha256').update(readFileSync(new URL(rules.sourceFile,root))).digest('hex'),rules.sha256);
 assert.equal(rules.rule355.entry,'m4-355');assert.equal(rules.rule355.nextGate,'m4-339');
});
test('no-transponder636/672 fare never picks the slash transponder-only value',()=>{
 for(const[id,weekday,weekend]of [['m4-636',570,640],['m4-672',350,440]]){
  assert.equal(matrixM4Component(boundary(id),'2026-10-15T10:00:00+03:00',0).tolls.amount,weekday);
  assert.equal(matrixM4Component(boundary(id),'2026-10-17T10:00:00+03:00',0).tolls.amount,weekend);
 }
});
test('verified tariff start excludes pre-March2 endpoint fares and retains unconfirmed OD status',()=>{
 assert.equal(matrixM4Component(boundary('m4-71'),'2026-03-01T10:00:00+03:00',0).tolls,null);
 const q=matrixM4Component(boundary('m4-71'),'2026-03-02T10:00:00+03:00',0);
 assert.equal(q.tolls.amount,310);assert.equal(q.priceConfirmation,'unconfirmed');
});
