import test from 'node:test';import assert from 'node:assert/strict';import {reservedPacketUnits,validateQuotaBudget,validateLedgerForRun,validateOwnerApproval} from './diagnose.mjs';
test('campaign cap includes old MASS reservations and unknown outcomes, keeps prior independent pilot history',()=>{
 const attempts=[{id:'ckad-m11-m12',status:'outcome_unknown',expectedUnits:1},{id:'m11-15-58',expectedUnits:1},...Array.from({length:11},(_,i)=>({id:'MASS-'+i,status:i===0?'outcome_unknown':'response_received',expectedUnits:1}))];
 assert.equal(reservedPacketUnits(attempts,'MASS-CONT-new'),11);assert.equal(reservedPacketUnits(attempts,'other'),13);assert.throws(()=>validateLedgerForRun({attempts},'ckad-m11-m12'));assert.throws(()=>validateLedgerForRun({attempts},'MASS-0'));
});
test('299 plus one allowed; 300 plus one rejected, approval remains independent',()=>{
 assert.doesNotThrow(()=>validateQuotaBudget({packetUnits:299,recentUnits:0,expectedUnits:1,remainingUnits:974}));assert.throws(()=>validateQuotaBudget({packetUnits:300,recentUnits:0,expectedUnits:1,remainingUnits:974}));assert.throws(()=>validateOwnerApproval(null,'MASS-CONT-new',Date.now()));
});
