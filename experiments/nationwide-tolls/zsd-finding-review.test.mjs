import test from 'node:test';
import assert from 'node:assert/strict';
import {nextZsdCase,verifyFindingPair,zsdScopeFingerprint,dates} from './scripts/review-zsd-finding-case.mjs';
const identity={caseId:'a',captureSha256:'raw',provider:'Valhalla'};
const pair=()=>dates.map(departureAt=>({...identity,mode:'offline-recorded-response-replay',departureAt,tariffPolicy:{id:'trip-departure-v1',basisAt:departureAt},traceComplete:true,replayIntegrity:{complete:true,missingResponses:[]},audit:{status:'unknown',missing:['zsd']},tolls:{amount:null}}));
test('ZSD resume rejects duplicates, skipped cases and unresolved scope before advancing',()=>{
 const q={findings:[{code:'zsd:unpriced',caseIds:['a','b']}],zsdReview:{evaluatedCases:[{caseId:'a',status:'source_gated'}]},nextCase:'b'};
 assert.equal(nextZsdCase(q),'b');
 for(const mutate of [x=>x.nextCase='a',x=>x.zsdReview.evaluatedCases.push({...x.zsdReview.evaluatedCases[0]}),x=>x.zsdReview.evaluatedCases[0].caseId='other',x=>x.zsdReview.evaluatedCases[0].status='current_unknown_needs_distinct_scope_review']){
  const bad=structuredClone(q);mutate(bad);assert.throws(()=>nextZsdCase(bad));
 }
});
test('replay identity, departure and complete recorded evidence are mandatory',()=>{
 assert.deepEqual(verifyFindingPair(pair(),identity),['zsd']);
 for(const mutate of [o=>o.provider='OSRM',o=>o.caseId='b',o=>o.captureSha256='other',o=>o.departureAt=dates[1],o=>o.tariffPolicy.basisAt=dates[1],o=>o.replayIntegrity.missingResponses.push('missing'),o=>o.traceComplete=false,o=>o.mode='live']){
  const bad=pair();mutate(bad[0]);assert.throws(()=>verifyFindingPair(bad,identity));
 }
 assert.throws(()=>verifyFindingPair(pair().slice(0,1),identity));
});
test('known road component subtotal cannot pass as a whole unknown quote',()=>{
 const bad=pair();bad[0].tolls.amount=300;assert.throws(()=>verifyFindingPair(bad,identity),/TOTAL_COMPLETENESS/);
 const priced=pair();for(const o of priced){o.audit={status:'priced',missing:[]};o.tolls.amount=600;}
 assert.deepEqual(verifyFindingPair(priced,identity),[]);priced[1].tolls.amount=null;assert.throws(()=>verifyFindingPair(priced,identity));
});
test('scope equivalence retains physical gate order and recognizes exact unnamed identities only',()=>{
 const v={paidRoadEdges:[{wayId:'one',roadNames:['ЗСД']},{wayId:'two',roadNames:['ЗСД']}],tollBooths:[{osmNodeId:'gateA',roadNames:[]},{osmNodeId:'gateB',roadNames:['ЗСД']}]};
 const original=zsdScopeFingerprint(v,['gateA']);assert.deepEqual(original.gates,['gateA','gateB']);
 assert.notDeepEqual(zsdScopeFingerprint({...v,tollBooths:v.tollBooths.toReversed()},['gateA']),original);
 assert.notDeepEqual(zsdScopeFingerprint({...v,paidRoadEdges:[...v.paidRoadEdges,{wayId:'extra',roadNames:['ЗСД']}]},['gateA']),original);
 assert.deepEqual(zsdScopeFingerprint(v,[]).gates,['gateB']);
});
