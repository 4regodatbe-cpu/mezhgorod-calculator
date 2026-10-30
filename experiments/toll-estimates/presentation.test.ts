import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSavedSamples} from './saved-samples.ts';
import {tollEstimateView} from './presentation.ts';
import {renderTollDemo} from './demo.ts';
const samples=buildSavedSamples();
const confirmed=samples.find(s=>s.result.status==='confirmed')!,estimated=samples.find(s=>s.result.status==='estimated')!,unknown=samples.find(s=>s.result.status==='insufficient')!;
test('E4 confirmed full toll label is exact and has no approximate suffix',()=>{
 const v=tollEstimateView(confirmed.result);assert.equal(v.label,'Платные дороги: 600 ₽');assert.equal(v.secondary,null);
});
test('E4 estimated full toll label has explicit approximation and applies only to tolls',()=>{
 const withBase={...estimated.result,baseTransferFare:99999};const v=tollEstimateView(withBase);assert.match(v.label!,/10\s464 ₽ \(ориентировочно\)/u);assert.equal(v.subject,'tolls-only');assert.doesNotMatch(v.label!,/99\s999/u);assert.equal(withBase.baseTransferFare,99999);
});
test('E4 unknown full total displays clarified status and non-additive partial explanation',()=>{
 const v=tollEstimateView(unknown.result);assert.equal(v.label,'Платные дороги: стоимость уточняется');assert.match(v.secondary!,/5\s987/u);assert.match(v.secondary!,/включая подтверждённую часть 4\s274/u);assert.match(v.secondary!,/не полный итог/u);assert.doesNotMatch(v.label!,/₽/u);
});
test('E4 disabled shadow view does not replace existing strict presentation',()=>{
 const v=tollEstimateView({...confirmed.result,status:'disabled'});assert.equal(v.label,null);assert.equal(v.secondary,null);assert.equal(confirmed.result.strict.amount,600);
});
test('E4 insufficient state cannot accidentally publish a stale numeric total',()=>{
 const v=tollEstimateView({...unknown.result,totalRub:9999});assert.equal(v.label,'Платные дороги: стоимость уточняется');assert.doesNotMatch(v.label!,/9999/u);
});
test('E4 standalone responsive markup escapes source text and stays visibly local/offline',()=>{
 const html=renderTollDemo([{...confirmed,caseId:'<script>alert(1)</script>'},estimated,unknown]);assert.match(html,/&lt;script&gt;/u);assert.doesNotMatch(html,/<script>/u);assert.match(html,/name="viewport"/u);assert.match(html,/В приложении выключен/u);assert.equal((html.match(/role="status"/gu)??[]).length,3);
});
