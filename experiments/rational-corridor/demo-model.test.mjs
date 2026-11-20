import test from 'node:test';
import assert from 'node:assert/strict';
import {makeView} from './demo-model.mjs';
const base={from:'a',to:'b'};
test('control is offered only for two different populated special endpoints',()=>{
 for(const pair of [{from:'',to:'b'},{from:'a',to:'a'},{from:'a',to:'ordinary'}])assert.equal(makeView(pair).showSwitch,false);
 assert.equal(makeView(base).showSwitch,true);
});
test('2:1 recommendation chooses direct near trip and external far trip',()=>{
 assert.equal(makeView(base).selected,'direct');
 assert.equal(makeView({...base,scenario:'far'}).selected,'external');
});
test('user choice overrides recommendation and recomputes one selected total',()=>{
 const external=makeView({...base,scenario:'far',selected:'external'});
 const direct=makeView({...base,scenario:'far',selected:'direct'});
 assert.equal(direct.selected,'direct');assert.equal(direct.recommended,'external');
 assert.equal(direct.total-external.total,direct.deltaPrice);
 assert.equal(direct.deltaSeconds,-external.deltaSeconds);
 assert.equal(direct.transfer,450*70);
 assert.equal(external.transfer,510*25+140*70);
});
test('unknown tolls never become zero or a complete trip price',()=>{
 const result=makeView({...base,selected:'external'});
 assert.equal(result.total,null);assert.equal(result.deltaPrice,null);assert.ok(result.transfer>0);
});
test('failed alternative remains explicitly unavailable, without relabelling direct',()=>{
 assert.equal(makeView({...base,scenario:'unavailable',selected:'external'}).status,'unavailable');
 assert.equal(makeView({...base,scenario:'unavailable'}).selected,'direct');
});
