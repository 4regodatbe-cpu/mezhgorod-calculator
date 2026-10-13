import assert from 'node:assert/strict';import {test} from 'node:test';import {matrixM4Component} from './m4-route-adapter.mjs';
const production=ids=>({exact:true,tolls:{segments:[]},m4PvpPreview:{confirmedPvps:ids}});
const t='2026-10-13T09:00:00+03:00';
test('strict south vector uses finished matrix price',()=>assert.equal(matrixM4Component(production(['m4-1046','m4-1093','m4-1184','m4-1223']),t,3600).tolls.amount,1230));
test('reverse south vector same fare',()=>assert.equal(matrixM4Component(production(['m4-1223','m4-1184','m4-1093']),t,3600).tolls.amount,850));
test('current candidate exact vector carries warning',()=>{const q=matrixM4Component(production(['m4-71','m4-133']),t,3600);assert.equal(q.tolls.amount,710);assert.equal(q.priceConfirmation,'unconfirmed');});
test('partial gate evidence does not replace fare',()=>assert.equal(matrixM4Component({...production(['m4-1184','m4-1223']),exact:false},t,3600),null));
test('missing date and midnight profile changes do not choose arbitrary price',()=>{assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),undefined,3600).tolls,null);assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-10-15T23:30:00+03:00',3600).tolls,null);});
test('A289 component cannot vanish in M4 replacement',()=>{const p=production(['m4-1184','m4-1223']);p.tolls.segments=['А-289: fee'];assert.equal(matrixM4Component(p,t,3600),null);});

test('single confirmed M4 plaza uses its existing candidate fare',()=>assert.equal(matrixM4Component(production(['m4-71']),t,900)?.tolls.amount,310));


test('ordinary weekday midnight and weekend midnight retain an unchanged complete M4 fare',()=>{
 assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-10-13T19:00:00+03:00',17*3600)?.tolls.amount,700);
 assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-10-16T23:30:00+03:00',3600)?.tolls.amount,850);
});
test('same endpoint profile cannot conceal an intervening weekend or unverified year',()=>{
 assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-10-13T19:00:00+03:00',7*86400)?.tolls,null);
 assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-12-31T23:30:00+03:00',3600)?.tolls,null);
});

const boundaries=ids=>({endpointOnly:true,exact:true,tolls:null,m4PvpPreview:{confirmedPvps:ids}});
test('new endpoint-only south lookup needs no intermediate plaza evidence',()=>{
 for(const ids of [['m4-1046','m4-1223'],['m4-1223','m4-1046']])
  assert.equal(matrixM4Component(boundaries(ids),t,3600)?.tolls.amount,1230);
});
test('new endpoint-only lookup supports a single tariff section without native sums',()=>{
 assert.equal(matrixM4Component(boundaries(['m4-71']),t,900)?.tolls.amount,310);
});
test('conflicting ready matrix prices for the same boundaries cannot choose an arbitrary chain',()=>{
 const q=matrixM4Component(boundaries(['m4-62','m4-460']),t,3600);
 assert.equal(q?.tolls,null);assert.match(q.reason,/ambiguous-fare-version/);
});

test('Yandex reviewed northbound cells replace all conflicting variants with one price per profile',()=>{
 for(const [from,weekday,weekend] of [['m4-620',2480,2730],['m4-636',3050,3370]]){
  const p=boundaries([from,'m4-71']);
  assert.equal(matrixM4Component(p,t,3600)?.tolls.amount,weekday);
  assert.equal(matrixM4Component(p,'2026-10-17T20:33:00+03:00',3600)?.tolls.amount,weekend);
  assert.equal(matrixM4Component(p,t,3600)?.priceConfirmation,'unconfirmed');
 }
});
test('northbound Yandex controls cannot silently approve reverse or other unreviewed endpoints',()=>{
 assert.equal(matrixM4Component(boundaries(['m4-71','m4-636']),t,3600)?.tolls,null);
 assert.equal(matrixM4Component(boundaries(['m4-62','m4-460']),t,3600)?.tolls,null);
});
