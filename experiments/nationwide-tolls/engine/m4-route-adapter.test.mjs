import assert from 'node:assert/strict';import {test} from 'node:test';import {matrixM4Component} from './m4-route-adapter.mjs';
const production=ids=>({exact:true,tolls:{segments:[]},m4PvpPreview:{confirmedPvps:ids}});
const t='2026-10-13T09:00:00+03:00';
test('strict south vector uses finished matrix price',()=>assert.equal(matrixM4Component(production(['m4-1046','m4-1093','m4-1184','m4-1223']),t,3600).tolls.amount,1230));
test('reverse south vector same fare',()=>assert.equal(matrixM4Component(production(['m4-1223','m4-1184','m4-1093']),t,3600).tolls.amount,850));
test('Yandex residual is attached to the exact Krasnodar→Moscow M4 vector',()=>{
 const q=matrixM4Component(production(['m4-1223','m4-71']),'2026-10-15T11:09:00+03:00',20*3600);
 assert.equal(q.tolls.amount,4816);assert.equal(q.tolls.weekdayAmount,4816);assert.equal(q.tolls.weekendAmount,4816);
 assert.match(q.tolls.segments[0],/m4-1223 → m4-71 · 4.?816 ₽/);
});
test('Yandex residual is directional and does not price the reverse vector',()=>{
 const q=matrixM4Component(production(['m4-71','m4-1223']),'2026-10-15T11:09:00+03:00',20*3600);
 assert.notEqual(q?.tolls?.amount,4816);
});
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
test('mainline endpoints use the canonical chain excluding intermediate entry tariff',()=>{
 const q=matrixM4Component(boundaries(['m4-62','m4-460']),t,3600);
 assert.equal(q?.tolls.amount,1740);assert.equal(q.priceConfirmation,'unconfirmed');
});

test('Yandex reviewed northbound cells replace all conflicting variants with one price per profile',()=>{
 for(const [from,weekday,weekend] of [['m4-620',2480,2730],['m4-636',3050,3370]]){
  const p=boundaries([from,'m4-71']);
  assert.equal(matrixM4Component(p,t,3600)?.tolls.amount,weekday);
  assert.equal(matrixM4Component(p,'2026-10-17T20:33:00+03:00',3600)?.tolls.amount,weekend);
  assert.equal(matrixM4Component(p,t,3600)?.priceConfirmation,'unconfirmed');
 }
});
test('reviewed northbound fare does not get mirrored; reverse uses its own canonical estimate',()=>{
 const reverse=matrixM4Component(boundaries(['m4-71','m4-636']),t,3600);assert.ok(reverse.tolls.amount>0);assert.equal(reverse.priceConfirmation,'unconfirmed');
 assert.equal(matrixM4Component(boundaries(['m4-62','m4-460']),t,3600)?.tolls.amount,1740);
});
test('published355 northbound receipt pair is charged220 once in both profiles',()=>{
 for(const date of [t,'2026-10-17T10:00:00+03:00']){
  const q=matrixM4Component(boundaries(['m4-355','m4-339']),date,900);
  assert.equal(q.tolls.amount,220);assert.equal(q.tolls.weekdayAmount,220);assert.equal(q.tolls.weekendAmount,220);
 }
 assert.equal(matrixM4Component(boundaries(['m4-339','m4-355']),t,900).tolls,null);
});
test('355 southward artificial fare boundaries stay unknown with a specific reason',()=>{
 for(const other of ['m4-803','m4-911','m4-1046','m4-1093','m4-1184','m4-1223'])
 for(const pair of [['m4-355',other],[other,'m4-355']])
 for(const date of [t,'2026-10-17T10:00:00+03:00']){
  const q=matrixM4Component(boundaries(pair),date,900);
  assert.equal(q.tolls,null);assert.equal(q.reason,'m4_unsupported_paid_endpoint_pair');
 }
});
