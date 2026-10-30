import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const raw=p=>readFileSync(new URL(p,root));
const atlas=JSON.parse(raw('experiments/junction-atlas/2026-10-30/zsd.json'));
const ready=JSON.parse(raw('experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json'));
test('ZSD atlas: five source-backed points retain coordinates and separate map from operator proof',()=>{
 assert.equal(atlas.points.length,5);
 const source=[...ready.entry.witnesses,...ready.exit.witnesses,ready.gate.gate];
 for(const p of atlas.points){const n=source.find(n=>n.id===p.osm.nodeId);assert.ok(n);assert.deepEqual(p.position,{lat:n.lat,lon:n.lon});assert.equal(p.tariffPair,null);}
 assert.equal(atlas.pvp5Name.independentlyOperatorConfirmed,false);
});
test('ZSD atlas: exact directed entry gate exit and selected witness remain distinct',()=>{
 assert.deepEqual(atlas.segments.map(s=>s.wayId),['1122966006','381576632','183902370']);assert.ok(atlas.segments.every(s=>s.oneway));assert.deepEqual(atlas.segments[1].nodeOrder,['3847689344','933974870','3847689346']);assert.equal(atlas.selectedTraceWitnesses.length,3);
 assert.deepEqual(atlas.selectedTraceWitnesses[2].orderedWayIds,['435710010','183902370','119176972']);assert.equal(atlas.mapControl.fromLabel,'ЗСД, съезд С2');assert.equal(atlas.mapControl.meters,257);assert.equal(atlas.mapControl.exactPolylineOrSnapRetrieved,false);
});
test('ZSD atlas:600 retained only for the existing complete KADsouth Ekateringofka product, not barrier counting',()=>{
 assert.equal(atlas.tariffBindings.length,1);const t=atlas.tariffBindings[0];assert.equal(t.amount,600);assert.deepEqual(t.zones,['zone-1','zone-2']);assert.equal(t.from,'kad-south');assert.equal(t.to,'ekateringofka');assert.equal(t.introducedByAtlas,false);assert.equal(atlas.summary.newTariffBindings,0);assert.match(t.ruleLimit,/not a universal/u);
});
test('ZSD atlas: all source bytes match and no new full route or geocoder capture was made',()=>{
 for(const s of atlas.sources)assert.equal(createHash('sha256').update(raw(s.path)).digest('hex'),s.sha256,s.path);
 const capture=atlas.sources.find(s=>s.path.includes('capture.json.gz'));assert.equal(capture.sha256,'0493305d255cfc779f4d2b7f15e5c4fb7161b80857f3af75a4c57567a6df3cb1');
 assert.equal(atlas.summary.newOsmRequests,0);assert.equal(atlas.summary.newRouteProviderCalls,0);assert.equal(atlas.summary.directedEntryExits,2);
});
