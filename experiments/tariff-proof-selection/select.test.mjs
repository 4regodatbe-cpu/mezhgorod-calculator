import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { selectProof } from './select.mjs';

const fixture = (overrides = {}) => ({ id:'synthetic', reviewed:true, source:'synthetic-test-only',
  contextVerified:true, amount:123, covers:['a','b'], method:'operator-pair', ...overrides });
test('saved M4 pending topology supplies no monetary witness', () => {
  const r=JSON.parse(fs.readFileSync(new URL('../nationwide-tolls/M4_GRAPH_ENDPOINT_REGISTER.json',import.meta.url)));
  const p=r.pending.find(p=>p.entry.osmNodeId==='4443232947' && p.exit.osmNodeId==='358467208');
  assert.ok(p); assert.equal(p.rub,null); assert.equal(p.fareSource,null);
  assert.deepEqual(selectProof([p.from+'->'+p.to],[]),
    {pricingStatus:'unknown',amount:null,reason:'no-complete-reviewed-proof'});
});
test('complete directed pair needs no intermediate booth prices',()=>{
  assert.equal(selectProof(['a','b'],[fixture()]).amount,123);
});
test('subtotal and wrong directed obligation never certify full cost',()=>{
  for(const covers of [['a'],['b','a-reversed']])
    assert.equal(selectProof(['a','b'],[fixture({covers})]).amount,null);
});
test('graph chain requires independently reviewed additivity',()=>{
  assert.equal(selectProof(['a','b'],[fixture({method:'additive-chain'})]).amount,null);
  assert.equal(selectProof(['a','b'],[fixture({method:'additive-chain',additivityReviewed:true})]).amount,123);
});
test('conflicting complete amounts remain unknown instead of choosing cheaper quote',()=>{
  assert.equal(selectProof(['a','b'],[fixture(),fixture({id:'other',amount:124})]).amount,null);
});
test('missing source/context and malformed monetary values fail closed',()=>{
  for(const overrides of [{source:null},{contextVerified:false},{reviewed:false},{amount:NaN},{amount:-1},{covers:['a','a']}])
    assert.equal(selectProof(['a','b'],[fixture(overrides)]).amount,null);
});
