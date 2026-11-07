import assert from 'node:assert/strict';import fs from 'node:fs';import {validateOwnerApproval,validateLedgerForRun} from '../SOURCES/diagnose.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../APPROVAL_MANIFEST.json',import.meta.url)));
assert.throws(()=>validateOwnerApproval({ownerApproval:{approved:true,reference:'synthetic campaign-level approval shape',windowIds:m.windows.map(w=>w.id),approvedAt:new Date().toISOString()}},m.windows[0].id,Date.now()));
assert.throws(()=>validateOwnerApproval({ownerApproval:{approved:true,reference:'synthetic previous final-sprint scope',windowIds:['sprint-m4-545-northbound-approach-exit'],approvedAt:new Date().toISOString()}},m.windows[0].id,Date.now()));
console.log('GATE_PASS: current unchanged validator rejects campaign-shaped approval and old foreign window scope. No live approval invented.');

const approvals=JSON.parse(fs.readFileSync(new URL('../OWNER_APPROVALS.json',import.meta.url)));
for(const x of approvals)validateOwnerApproval(x,x.ownerApproval.windowIds[0],Date.parse(x.ownerApproval.approvedAt));
console.log('EXACT_APPROVAL_PASS: all11 recorded singleton approvals accepted at their actual recorded authorization time.');

const prior=JSON.parse(fs.readFileSync(new URL('../SOURCES/prior-history.json',import.meta.url)));
const actual=fs.readFileSync(new URL('../REQUEST_RESULTS.jsonl',import.meta.url),'utf8').trim().split('\n').map(s=>JSON.parse(s));
const restored={attempts:[...prior.attempts,...actual.map(r=>({id:r.id,status:r.status,expectedUnits:r.reservedUnits,requestParameters:r.requestParameters,startedAt:r.startedAt,completedAt:r.completedAt}))]};
for(const r of actual)assert.throws(()=>validateLedgerForRun(restored,r.id));
assert.throws(()=>validateLedgerForRun(restored,'ckad-m11-m12'));
console.log('RESTORE_PASS: prior history + eleven durable records restore no-retry reservations; CKAD remains blocked.');
