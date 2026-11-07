import fs from 'node:fs';import assert from 'node:assert/strict';import {validateOwnerApproval,buildRequestBody,reservedPacketUnits,validateLedgerForRun} from '../TOOLS/diagnose-snapshot.mjs';
const root=new URL('../',import.meta.url),read=n=>JSON.parse(fs.readFileSync(new URL(n,root)));
const candidates=read('RUNNER_CANDIDATES.json'),bodies=read('MASS300_REQUESTS.json');assert.equal(candidates.length,293);assert.equal(bodies.length,293);assert.deepEqual(new Set(bodies.map(x=>x.id)),new Set(candidates.map(x=>x.id)));
for(const c of candidates){assert.deepEqual(bodies.find(b=>b.id===c.id).body,buildRequestBody(c));assert.throws(()=>validateOwnerApproval(null,c.id,Date.now()));}
const prior=JSON.parse(fs.readFileSync(new URL('../../SOURCES/prior-history.json',import.meta.url))).attempts;
const mass=fs.readFileSync(new URL('../../REQUEST_RESULTS.jsonl',import.meta.url),'utf8').trim().split('\n').map(s=>{const r=JSON.parse(s);return{id:r.id,status:r.status,expectedUnits:r.reservedUnits};});
assert.equal(reservedPacketUnits([...prior,...mass],candidates[0].id),11);for(const r of mass)assert.throws(()=>validateLedgerForRun({attempts:[...prior,...mass]},r.id));assert.throws(()=>validateLedgerForRun({attempts:prior},'ckad-m11-m12'));
console.log('293 dry-run bodies verified; no active new approvals; original11 and CKAD no-retry reservations preserved; campaign starts at11,not0. No fetch.');
