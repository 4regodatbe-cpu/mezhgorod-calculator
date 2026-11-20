import test from 'node:test';
import assert from 'node:assert/strict';
import {candidatePlans,BRIDGE} from '../lib/special-territory-policy.ts';
import {SPECIAL_TERRITORY_BOUNDARIES as zones} from '../lib/special-territory-boundaries.ts';
test('ordinary Crimea trips retain the bridge without forcing Krasnodar or M4, both directions',()=>{
 const crimea=[{lat:45.356,lng:36.468},{lat:44.4988,lng:34.1689}];
 const mainland=[{lat:44.895,lng:37.316},{lat:43.428,lng:39.923},{lat:55.756,lng:37.617},{lat:47.22,lng:39.71}];
 for(const a of crimea)for(const b of mainland){
  assert.deepEqual(candidatePlans(a,b,zones),[{corridor:'mainland',positions:[a,BRIDGE,b]}]);
  assert.deepEqual(candidatePlans(b,a,zones),[{corridor:'mainland',positions:[b,BRIDGE,a]}]);
 }
});
