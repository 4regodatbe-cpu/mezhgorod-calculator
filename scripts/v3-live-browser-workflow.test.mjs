import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classifyAnalyticsCheck,classifyApiAndDom,summarizeCalculationResponse} from './v3-live-browser-acceptance-contract.mjs';

const workflow=readFileSync(new URL('../.github/workflows/v3-live-browser-acceptance.yml',import.meta.url),'utf8');
const runner=readFileSync(new URL('./v3-live-browser-acceptance.mjs',import.meta.url),'utf8');

test('new workflow is limited to V3 acceptance files and has explicit read-only permissions',()=>{
  assert.match(workflow,/name: V3 live browser acceptance/);
  assert.match(workflow,/permissions:\s*\n\s*contents: read/);
  assert.match(workflow,/scripts\/v3-live-browser-acceptance\.mjs/);
  assert.match(workflow,/scripts\/v3-live-browser-workflow\.test\.mjs/);
  assert.match(workflow,/actions\/upload-artifact@v4/);
});
test('V3 browser suite uses real suggestions and real calculation responses',()=>{
  assert.match(runner,/waitForResponse/);
  assert.match(runner,/\/api\/v3\/calculate/);
  assert.match(runner,/\/api\/version/);
  assert.doesNotMatch(runner,/route\.fulfill\(/);
  assert.doesNotMatch(runner,/\*\*\/api\/v3\/calculate['"]/);
  assert.doesNotMatch(runner,/\*\*\/r['"]/);
  assert.match(runner,/context\.route\('\*\*\/api\/collect',\s*async route\s*=>\s*\{[\s\S]*?route\.abort\('blockedbyclient'\)/);
});
test('route card is located by the rendered h3 and that heading\'s article',()=>{
  assert.match(runner,/getByRole\('heading',\s*\{level:3,\s*name:routeHeading\}\)/);
  assert.match(runner,/heading\.locator\('xpath=ancestor::article\[1\]'\)/);
  assert.match(runner,/headingFound:false,distanceFound:false,durationFound:false,pricingFound:false/);
  assert.match(runner,/pricePatterns\s*=\s*\{/);
  assert.doesNotMatch(runner,/article'\)\.filter\(\{hasText:routeHeading\}/);
});
test('API response is recorded before DOM checks and keeps API_PASS / UI_FAIL separate',()=>{
  assert.match(runner,/target\.api = summarizeCalculationResponse/);
  assert.ok(runner.indexOf('target.api = summarizeCalculationResponse') < runner.indexOf('const heading = page.getByRole'));
  const payload={options:[{fast:{meters:58260,seconds:4320,tolls:{pricingStatus:'unknown',amount:null,weekdayAmount:null,weekendAmount:null},pricingByVehicle:{standard:{totalPrice:null},comfort:{totalPrice:null},comfort_plus:{totalPrice:null},minivan:{totalPrice:null}}}}]};
  const api=summarizeCalculationResponse({status:200,elapsedMs:3210,payload,jsonValid:true});
  assert.equal(api.apiStatus,'API_PASS');
  assert.equal(api.httpStatus,200);
  assert.equal(api.distanceMeters,58260);
  assert.equal(api.distanceKm,58.3);
  assert.equal(api.durationMin,72);
  assert.equal(api.tollPricingStatus,'unknown');
  assert.equal(classifyApiAndDom(api,{status:'FAIL'}),'API_PASS / UI_FAIL');
  const badTariff=summarizeCalculationResponse({status:502,elapsedMs:84,payload:{options:[{fast:{meters:12000,seconds:900,tolls:{pricingStatus:'unknown',amount:0},pricingByVehicle:{}}}]},jsonValid:true});
  assert.equal(badTariff.apiStatus,'API_FAIL');
  assert.equal(badTariff.httpStatus,502);
  assert.equal(badTariff.distanceMeters,12000);
  assert.equal(badTariff.durationSeconds,900);
});
test('Yalta search records bounded /r diagnostics without response payloads',()=>{
  for (const field of ['requestSent','searchText','httpStatus','elapsedMs','itemCount','partial','fallback','searchUiState','searchStateVisible','javaScriptErrors']) assert.ok(runner.includes(field),field);
  assert.match(runner,/target\.searchDiagnostics\s*=\s*\(/);
  assert.doesNotMatch(runner,/entry\.rawResponse|target\.rawResponse|entry\.geometry/);
});
test('analytics PASS requires an observed abort and successful API plus DOM result',()=>{
  assert.equal(classifyAnalyticsCheck({interceptedRequests:1,blockedRequests:1,abortErrors:0,apiStatus:'API_PASS',domStatus:'PASS'}),'PASS');
  assert.equal(classifyAnalyticsCheck({interceptedRequests:0,blockedRequests:0,abortErrors:0,apiStatus:'API_PASS',domStatus:'PASS'}),'NOT_VERIFIED');
  assert.equal(classifyAnalyticsCheck({interceptedRequests:2,blockedRequests:1,abortErrors:0,apiStatus:'API_PASS',domStatus:'PASS'}),'NOT_VERIFIED');
  assert.equal(classifyAnalyticsCheck({interceptedRequests:1,blockedRequests:1,abortErrors:0,apiStatus:'API_PASS',domStatus:'FAIL'}),'NOT_VERIFIED');
  assert.match(runner,/classifyAnalyticsCheck\(/);
  assert.match(runner,/analytics\.intercepted\+\+/);
  assert.match(runner,/analytics\.blocked\+\+/);
});
test('all eight scenarios are named and the source SHA is surfaced',()=>{
  for(let i=1;i<=8;i++)assert.match(runner,new RegExp(`\\['${String(i).padStart(2,'0')}',`));
  assert.match(runner,/deployedSha/);
  assert.match(runner,/deployedVersionIdentified/);
  assert.match(runner,/Выбран маршрут/);
  assert.doesNotMatch(runner,/Самый быстрый маршрут/);
  assert.match(runner,/displayedDistance/);
  assert.match(runner,/displayedDuration/);
});
