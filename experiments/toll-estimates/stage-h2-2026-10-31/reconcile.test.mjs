import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reconcile} from './reconcile.mjs';

test('H2 six original replays preserve absent head/CKAD and unknown full totals',()=>{
 const r=reconcile();assert.equal(r.oldReplays.length,6);
 for(const row of r.oldReplays){assert.equal(row.whole,null);assert.equal(row.components.find(c=>c.id==='m11-15-58').rub,null);assert.equal(row.components.find(c=>c.id==='ckad').reason,'ckad_east_arc_not_proven');assert.equal(row.numericSubtotal,row.departureAt.startsWith('2026-10-15')?5707:6007);}
});
test('H2 head and distinct working CKAD941 exactly explain both subtotal deltas',()=>{
 const r=reconcile();assert.deepEqual(r.rows.map(x=>x.headRub),[280,320]);
 for(const x of r.rows){assert.equal(x.subtotalAfterHead,x.oldReplaySubtotal+x.headRub);assert.equal(x.assessedSubtotal,x.subtotalAfterHead+x.ckadRub);assert.equal(x.deltaFromOld,x.headRub+941);assert.equal(new Set(x.components.map(c=>c.id)).size,x.components.length);}
 assert.deepEqual(r.rows.map(x=>x.assessedSubtotal),[6928,7268]);
});
test('H2 operator price cell and route-bound working grade are separate evidence',()=>{
 const r=reconcile();assert.equal(r.priceSource.rub,941);assert.equal(r.priceSource.category,'I');assert.equal(r.priceSource.row,'М-7');assert.equal(r.priceSource.column,'М-11');assert.equal(r.priceSource.routeBindingAssurance,'working_estimate');assert.deepEqual(r.routeEvidence.shapeRange,[2952,3547]);assert.equal(r.routeEvidence.strictOldCkadStillUnknown,true);
});
test('H2 assessed subtotal includes M12 and CKAD estimates, never full or wholly confirmed',()=>{
 const r=reconcile();assert.deepEqual(r.rows.map(x=>x.confirmedGradeSubtotal),[4274,4614]);
 for(const x of r.rows){assert.deepEqual(x.estimatedComponents,[{id:'m12',rub:1713},{id:'ckad',rub:941}]);assert.equal(x.assessedSubtotal-x.confirmedGradeSubtotal,2654);assert.equal(x.whole,null);assert.deepEqual(x.missing,['zsd']);}
});
test('H2 conditional2085 is not a ZSD quote and evidence review has no network',()=>{
 const saved=globalThis.fetch;globalThis.fetch=()=>{throw Error('H2 external requests forbidden');};
 try{const r=reconcile();assert.equal(r.externalRequests,0);assert.deepEqual(r.rows.map(x=>x.conditionalExternalMinusAssessed),[2425,2085]);for(const x of r.rows){assert.equal(x.conditionalExternalRemainderIsZsdTariff,false);assert.equal(x.comparableYandexGeometryConfirmed,false);}assert.equal(r.sourceReportAvailable,false);assert.equal(r.arithmeticDefectDemonstrated,false);assert.equal(r.doubleChargingDemonstrated,false);}
 finally{globalThis.fetch=saved;}
});
test('H2 retained reconciliation artifact matches source inputs without app mutations',()=>{
 const r=reconcile(),saved=JSON.parse(fs.readFileSync(new URL('./reconciliation.json',import.meta.url),'utf8'));assert.deepEqual(saved,r);
});
