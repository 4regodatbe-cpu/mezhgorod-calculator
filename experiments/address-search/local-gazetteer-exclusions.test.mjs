import test from 'node:test';import assert from 'node:assert/strict';
import {buildExclusionGuard} from './local-gazetteer-exclusions.mjs';
test('excluded homonyms become coverage metadata, never lookup records',()=>{
 const r=buildExclusionGuard({records:[[1,'Пункт',['Пункт']],[2,'Пункт',['Пункт','Старое имя']],[3,'Другой',['Другой']]]},[1,3]);
 assert.equal(r.excludedRecords,1);assert.deepEqual(r.sharedExactNames,['пункт']);assert.deepEqual(r.names,['пункт','старое имя']);assert.equal('records' in r,false);
});
