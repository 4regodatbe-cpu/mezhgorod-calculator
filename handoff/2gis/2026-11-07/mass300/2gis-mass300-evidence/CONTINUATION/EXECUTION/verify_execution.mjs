// Offline preflight only. This module does not import or invoke a network client.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {validateOwnerApproval, validateLedgerForRun, reservedPacketUnits, buildRequestBody} from '../TOOLS/diagnose-snapshot.mjs';
const here=new URL('./',import.meta.url),base=new URL('../',here);
const read=(root,name)=>JSON.parse(fs.readFileSync(new URL(name,root)));
const auth=read(here,'OWNER_AUTHORIZATION.json'),records=read(here,'OWNER_APPROVALS.json');
const manifest=read(base,'MASS300_APPROVAL_MANIFEST.json');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('MASS300_APPROVAL_MANIFEST.json',base))).digest('hex'),auth.manifestSha256);
const candidates=read(base,'RUNNER_CANDIDATES.json'),bodies=read(base,'MASS300_REQUESTS.json');
assert.equal(records.length,293); assert.equal(new Set(records.map(r=>r.ownerApproval.windowIds[0])).size,293);
assert.equal(manifest.primaryQueueIds.length,289);assert.equal(manifest.reserveIds.length,4);assert.equal(auth.maximumNewUnits,289);
const history=read(new URL('../../SOURCES/',here),'prior-history.json').attempts;
const previous=fs.readFileSync(new URL('../../REQUEST_RESULTS.jsonl',here),'utf8').trim().split('\n').map(s=>{let r=JSON.parse(s);return{id:r.id,status:r.status,expectedUnits:r.reservedUnits};});
const at=Date.parse(auth.registeredAt); assert(at<=Date.now());
for(const window of manifest.windows){
 const record=records.find(x=>x.ownerApproval.windowIds[0]===window.id);assert(record);
 validateOwnerApproval(record,window.id,at);
 assert.throws(()=>validateOwnerApproval(record,'UNAPPROVED-WINDOW',at));
 assert.throws(()=>validateOwnerApproval(record,window.id,at+24*60*60*1000+1));
 const c=candidates.find(x=>x.id===window.id);assert.deepEqual(c.from,window.from);assert.deepEqual(c.to,window.to);
 assert.deepEqual(buildRequestBody(c),bodies.find(x=>x.id===window.id).body);
 assert.deepEqual(buildRequestBody(c).points.map(p=>[p.lon,p.lat]),[window.from,window.to]);
 validateLedgerForRun({attempts:[...history,...previous]},window.id);
 assert.equal(reservedPacketUnits([...history,...previous],window.id),11);
}
for(const r of previous) assert.throws(()=>validateLedgerForRun({attempts:[...history,...previous]},r.id));
assert.throws(()=>validateLedgerForRun({attempts:history},'ckad-m11-m12'));
const state=read(here,'PREFLIGHT_RESULT.json');assert.equal(state.currentFreeRemaining,null);assert.equal(state.routingRequestsThisRun,0);assert.equal(state.newReservedUnits,0);assert.equal(state.status,'BLOCKED_BY_PLATFORM_MANAGER');
console.log('PASS:293 registered exact approvals accepted at actual registration time; scope/24h expiry/dry-run bodies/history/CKAD guards preserved. No API calls; PM gate remains closed.');
