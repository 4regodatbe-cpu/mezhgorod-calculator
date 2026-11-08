import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSavedSamples} from './saved-samples.ts';
import {tollEstimateView} from './presentation.ts';
import {renderTollDemo} from './demo.ts';
import type {EstimateResult} from './estimate.ts';
const samples=buildSavedSamples();
const zsd=samples.find(s=>s.caseId.startsWith('dnr-'))!,estimated=samples.find(s=>s.caseId==='pair-m4-m11-krasnodar-to-spb')!,unknown=samples.find(s=>s.result.status==='insufficient')!;
// Controlled presentation-only input, NOT a newly confirmed real route/source.
const confirmed:EstimateResult={status:'confirmed',totalRub:123,confirmedSubtotalRub:123,assessedSubtotalRub:123,
 missingCoverage:[],components:[],reasons:[],strict:{pricingStatus:'priced',amount:123,priceConfirmation:'confirmed'}};
test('E4 confirmed full toll label is exact and has no approximate suffix',()=>{
 const v=tollEstimateView(confirmed);assert.equal(v.label,'Платные дороги: 123 ₽');assert.equal(v.secondary,null);
});
test('source-derived ZSD600 is displayed approximately and never relabelled exact by the view',()=>{
 const v=tollEstimateView(zsd.result);assert.equal(v.label,'Платные дороги: 600 ₽ (ориентировочно)');assert.equal(v.status,'estimated');assert.equal(zsd.result.strict.amount,600);assert.equal(zsd.result.strict.priceConfirmation,'confirmed');
});
test('E4 estimated full toll label has explicit approximation and applies only to tolls',()=>{
 const withBase={...estimated.result,baseTransferFare:99999};const v=tollEstimateView(withBase);assert.match(v.label!,/10\s464 ₽ \(ориентировочно\)/u);assert.equal(v.subject,'tolls-only');assert.doesNotMatch(v.label!,/99\s999/u);assert.equal(withBase.baseTransferFare,99999);
});
test('E4 unknown full total displays clarified status and non-additive partial explanation',()=>{
 const v=tollEstimateView(unknown.result);assert.equal(v.label,'Платные дороги: стоимость уточняется');assert.match(v.secondary!,/5\s987/u);assert.match(v.secondary!,/включая подтверждённую часть 4\s274/u);assert.match(v.secondary!,/не полный итог/u);assert.doesNotMatch(v.label!,/₽/u);
});
test('E4 disabled shadow view does not replace existing strict presentation',()=>{
 const v=tollEstimateView({...zsd.result,status:'disabled'});assert.equal(v.label,null);assert.equal(v.secondary,null);assert.equal(zsd.result.strict.amount,600);
});
test('E4 insufficient state cannot accidentally publish a stale numeric total',()=>{
 const v=tollEstimateView({...unknown.result,totalRub:9999});assert.equal(v.label,'Платные дороги: стоимость уточняется');assert.doesNotMatch(v.label!,/9999/u);
});
test('E4 standalone responsive markup escapes source text and stays visibly local/offline',()=>{
 const html=renderTollDemo([{...zsd,caseId:'<script>alert(1)</script>'},estimated,unknown]);assert.match(html,/&lt;script&gt;/u);assert.doesNotMatch(html,/<script>/u);assert.match(html,/name="viewport"/u);assert.match(html,/В приложении выключен/u);assert.equal((html.match(/role="status"/gu)??[]).length,3);
});
