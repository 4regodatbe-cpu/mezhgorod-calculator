import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { digest, admitRegistry, admitPolicy, compose } from './compose.mjs';
const review=JSON.parse(fs.readFileSync(new URL('./real-document-review.json',import.meta.url)));
test('retained original PDF bytes match reviewed SHA256',()=>{
 for(const doc of review.documents)assert.equal(digest(fs.readFileSync(new URL('../../'+doc.path,import.meta.url))),doc.sha256);
});
test('directional real M11 values agree with saved extracted tariff IDs',()=>{
 const table=JSON.parse(fs.readFileSync(new URL('../../data/tolls/m11/2026-04-24-15-58-category1.json',import.meta.url)));
 for(const row of review.rows.filter(r=>r.document==='m11'))assert.deepEqual(table.tariffs[row.from][row.to],row.values);
 assert.equal(table.effectiveFrom,review.documents[0].effectiveFrom);
});
test('real monetary rows without geographic entry/exit cannot enter route registry',()=>{
 for(const row of review.rows){
  const doc=review.documents.find(d=>d.id===row.document), bytes=fs.readFileSync(new URL('../../'+doc.path,import.meta.url));
  const candidate={...row,id:row.id,document:doc.id,documentHash:doc.sha256};
  assert.throws(()=>admitRegistry([candidate],{[doc.id]:bytes},[{id:row.id,recordHash:digest(JSON.stringify(candidate)),reviewer:'document-only-review',reviewRef:doc.path}]));
 }
 const bytes=Buffer.from('empty-policy-no-independence-claims');
 const p={source:'test-only-empty-policy',documentHash:digest(bytes),additiveDomains:[],independentPairs:[]};
 const policy=admitPolicy(p,bytes,{reviewer:'test',reviewRef:'empty-only',recordHash:digest(JSON.stringify(p))});
 assert.equal(compose(['unmapped-real-traversal'],[],admitRegistry([],{},[]),{date:'2026-10-27',vehicle:'group1',payment:'cash',traversals:[]},policy).amount,null);
});
