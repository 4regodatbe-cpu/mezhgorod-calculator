import assert from 'node:assert/strict';
import test from 'node:test';
import {planFallbackBudget,normalizeFallbackForReview,runFallbackAdmissionReview} from './fallback-admission-review.mjs';
const city=(id,city,state,lat,lng)=>({provider:'geoapify',id,city,state,country:'Россия',position:{lat,lng},
  reviewRequired:true,precision:'provider-reported-city-center',datasource:{sourcename:'synthetic-test'}});
const reviewed=candidates=>({status:'unreviewed-candidates',publicUseApproved:false,candidates});
test('disabled/uncredentialed fallback preserves all remaining primary time; enabled plan never exceeds20s',()=>{
  assert.deepEqual(planFallbackBudget({deadline:20000,now:0}),{status:'primary-only',primaryMs:20000,fallbackMs:0});
  assert.equal(planFallbackBudget({enabled:true,deadline:20000,now:0}).primaryMs,20000);
  assert.deepEqual(planFallbackBudget({enabled:true,hasCredentials:true,deadline:20000,now:0}),{status:'review-plan-only',primaryMs:18000,fallbackMs:2000});
  const late=planFallbackBudget({enabled:true,hasCredentials:true,deadline:20000,now:15000});
  assert.equal(late.primaryMs+late.fallbackMs,5000);
  assert.equal(planFallbackBudget({enabled:true,hasCredentials:true,deadline:20000,now:19000}).status,'insufficient-reserve');
  assert.equal(planFallbackBudget({deadline:20000,now:20000}).status,'budget-exhausted');
});
test('existing polygon/ranker keeps Donetsk DNR then Rostov, with distinct explicit provider identities',()=>{
  const r=normalizeFallbackForReview(reviewed([
    city('rostov','Донецк','Ростовская область',48.3382864,39.9509488),
    city('dnr','Донецк','Донецкая область',48.0158753,37.8013407),
  ]),'Донецк');
  assert.equal(r.publicUseApproved,false);assert.equal(r.reviewItems[0].id,'geoapify-dnr');
  assert.equal(r.reviewItems[0].label,'Донецк — ДНР');assert.equal(r.reviewItems[1].id,'geoapify-rostov');
  assert.ok(r.reviewItems.every(i=>i.source.reviewRequired&&!i.source.coordinateAuthenticityVerified));
});
test('invalid coordinates, unknown precision and missing admin labels do not produce suggestions',()=>{
  const good=city('ok','Test','Region',1,2);
  const r=normalizeFallbackForReview(reviewed([{...good,id:'bad',position:{lat:91,lng:2}},{...good,id:'admin',state:''},{...good,id:'precision',precision:'unknown'}]),'Test');
  assert.deepEqual(r.reviewItems,[]);
  assert.equal(normalizeFallbackForReview({status:'unreviewed-candidates',publicUseApproved:true,candidates:[good]},'Test').status,'not-reviewable');
});
test('no credential/opt-in performs zero provider calls, including nominally available transport',async()=>{
  let calls=0;const research=async()=>{calls++;return reviewed([]);};
  assert.equal((await runFallbackAdmissionReview({enabled:true,research})).status,'BLOCKED_NO_CREDENTIALS');
  assert.equal((await runFallbackAdmissionReview({apiKey:'synthetic',research})).status,'DISABLED');
  assert.equal(calls,0);
});
test('review has exactly four capped calls and cannot turn mocked outage into public success',async()=>{
  let calls=0;const r=await runFallbackAdmissionReview({enabled:true,apiKey:'synthetic',now:()=>100,research:async options=>{
    calls++;assert.equal(options.photon.unavailable,true);assert.equal(options.deadline,2100);
    return reviewed([city('x','Test','Region',1,2)]);
  }});
  assert.equal(calls,4);assert.equal(r.status,'REVIEW_REQUIRED');assert.equal(r.publicUseApproved,false);
  assert.match(r.mode,/injected-primary-outage/u);
});
test('quota response stops the review without retry or subsequent city requests',async()=>{
  let calls=0;const r=await runFallbackAdmissionReview({enabled:true,apiKey:'synthetic',research:async()=>{calls++;return {status:'provider-http-429'};}});
  assert.equal(calls,1);assert.equal(r.status,'INCOMPLETE');
});
