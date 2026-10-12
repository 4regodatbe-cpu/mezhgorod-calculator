import assert from 'node:assert/strict';import {test} from 'node:test';import {matrixM4Component} from './m4-route-adapter.mjs';
const production=ids=>({exact:true,tolls:{segments:[]},m4PvpPreview:{confirmedPvps:ids}});
const t='2026-10-13T09:00:00+03:00';
test('strict south vector uses finished matrix price',()=>assert.equal(matrixM4Component(production(['m4-1046','m4-1093','m4-1184','m4-1223']),t,3600).tolls.amount,1230));
test('reverse south vector same fare',()=>assert.equal(matrixM4Component(production(['m4-1223','m4-1184','m4-1093']),t,3600).tolls.amount,850));
test('current candidate exact vector carries warning',()=>{const q=matrixM4Component(production(['m4-71','m4-133']),t,3600);assert.equal(q.tolls.amount,710);assert.equal(q.priceConfirmation,'unconfirmed');});
test('partial gate evidence does not replace fare',()=>assert.equal(matrixM4Component({...production(['m4-1184','m4-1223']),exact:false},t,3600),null));
test('missing date and midnight profile changes do not choose arbitrary price',()=>{assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),undefined,3600),null);assert.equal(matrixM4Component(production(['m4-1184','m4-1223']),'2026-10-15T23:30:00+03:00',3600),null);});
test('A289 component cannot vanish in M4 replacement',()=>{const p=production(['m4-1184','m4-1223']);p.tolls.segments=['А-289: fee'];assert.equal(matrixM4Component(p,t,3600),null);});
