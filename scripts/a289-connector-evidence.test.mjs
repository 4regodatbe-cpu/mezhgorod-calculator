import test from 'node:test';
import assert from 'node:assert/strict';
import { a289SlavyanskConnector } from '../lib/toll-engine/a289-connector-evidence.ts';
const entry=[[38.295164,45.207196],[38.293165,45.206594],[38.290048,45.206306]];
const exit=[[38.289318,45.20618],[38.292057,45.206371],[38.295398,45.206445]];
test('connector requires correct directed controls',()=>{
  assert.equal(a289SlavyanskConnector(entry),'entry');
  assert.equal(a289SlavyanskConnector(exit),'exit');
  assert.equal(a289SlavyanskConnector([entry[0],entry[2],entry[1]]),null);
  assert.equal(a289SlavyanskConnector([entry[0],entry[1]]),null);
});
test('parallel path, sparse chords, repeated returns and invalid points are not connector proof',()=>{
  for(const route of [entry.map(([x,y])=>[x,y+0.001]),
    [[38.31,45.211],[38.27,45.201],[38.26,45.2]],
    [...entry,...exit,...entry], [...entry,[NaN,45]], [...entry,[200,45]]]){
    assert.equal(a289SlavyanskConnector(route),null);
  }
});
