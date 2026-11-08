import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const raw=p=>readFileSync(new URL(p,root));
const read=road=>JSON.parse(raw(`experiments/junction-atlas/2026-10-30/${road}.json`));
function integrity(a){for(const s of a.sources)assert.equal(createHash('sha256').update(raw(s.path)).digest('hex'),s.sha256,s.path);for(const p of a.points){assert.ok(Number.isFinite(p.position.lat)&&Math.abs(p.position.lat)<=90);assert.ok(Number.isFinite(p.position.lon)&&Math.abs(p.position.lon)<=180);assert.equal(p.tariffPair,null);assert.equal(p.priceRub,null);}assert.equal(a.newTariffBindings,0);assert.equal(a.appRuntimeChanged,false);}
test('M12 atlas: reverse nd traversal is explicit; three physical frames are not operator endpoints',()=>{
 const a=read('m12');integrity(a);assert.equal(a.points.length,6);assert.deepEqual(a.directedRamp.selectedTraversalNodeOrder,[...a.directedRamp.osmNodeOrder].reverse());assert.equal(a.directedRamp.onewayTag,null);assert.deepEqual(a.points[0].position,{lat:55.5006404,lon:43.5669594});assert.deepEqual(a.points[2].position,{lat:55.4981795,lon:43.5658384});for(const p of a.points.slice(3))assert.equal(p.operatorRegistrationId,null);
});
test('M12 atlas: motorway join detour is unresolved while interior165m is a bounded positive, not full-ramp certification',()=>{
 const a=read('m12');assert.equal(a.mapControls[0].status,'UNRESOLVED_DETOUR');assert.equal(a.mapControls[0].meters,57000);assert.equal(a.mapControls[1].meters,165);assert.match(a.geographyStatus,/routability unresolved/u);assert.match(a.operatorGap,/not automatically/u);
});
test('M11 atlas:47entry and147exit never manufacture virtual58 or hide current map disagreement',()=>{
 const a=read('m11');integrity(a);assert.equal(a.points.length,4);assert.equal(a.points[0].osm.nodeId,'8087316065');assert.equal(a.points[2].osm.nodeId,'6588472831');assert.equal(a.virtual58.position,null);assert.equal(a.virtual58.operatorPartition,null);assert.equal(a.mapControl.status,'UNRESOLVED_DETOUR');assert.equal(a.mapControl.meters,29900);assert.equal(a.exitGateWay.tags['destination:ref'],'М-10');assert.ok(a.exitGateWay.nodeOrder.includes('6588472831'));
});
test('CKAD atlas: gantry and one-way OSM fee tags do not imply a price or certified free PK5',()=>{
 const a=read('ckad');integrity(a);assert.equal(a.points.length,3);assert.equal(a.points[1].osm.nodeId,'12443433262');assert.deepEqual(a.points[1].position,{lat:55.6254417,lon:37.0099022});assert.equal(a.directedWay.tags.oneway,'yes');assert.equal(a.directedWay.tags.toll,'yes');assert.equal(a.mapControl.meters,570);assert.equal(a.mapControl.operatorChainageCertified,false);assert.ok(a.points.every(p=>p.kind==='technical'));
});
test('ZSD extended atlas: actual Planernaya booth differs from registration64E and does not inherit600',()=>{
 const a=read('zsd-extended');integrity(a);assert.equal(a.points.length,3);assert.equal(a.points[1].osm.nodeId,'1766158781');assert.equal(a.points[1].kind,'plaza');assert.equal(a.points[2].osm.nodeId,'13020687195');assert.equal(a.points[2].kind,'technical');assert.equal(a.rvp64.tags['ref:rutoll'],'64E');assert.equal(a.selectedPlanernayaWitness.caseId,'max-chain-m12-ckad-m11-zsd-arzamas-to-prim');assert.equal(a.selectedPlanernayaWitness.gateEdgeIndex,109);assert.equal(a.mapControl.meters,172);assert.match(a.operatorGap,/still unknown/u);
});
