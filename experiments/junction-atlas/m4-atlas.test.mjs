import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(bytes(p));
const atlas=json('experiments/junction-atlas/2026-10-30/m4.json');
const osm=json('experiments/tariff-proof-selection/m4-545-directed-osm.json');
const full=json('experiments/junction-atlas/2026-10-30/raw/m4-r298-way301694367-full.json');
const nodes=new Map([...osm.nodes,...full.elements.filter(x=>x.type==='node').map(x=>({...x,id:String(x.id)}))].map(n=>[n.id,n]));
const ways=new Map(osm.ways.map(w=>[w.id,w]));
function validatePath(ids){
 const path=ids.map(id=>{const w=ways.get(id);assert.ok(w);assert.equal(w.tags.oneway,'yes');return w;});
 for(let i=1;i<path.length;i++)assert.equal(path[i-1].nodes.at(-1),path[i].nodes[0]);
 return path;
}
test('M4 atlas: every point uses exact source node coordinates, not a map centre',()=>{
 assert.equal(atlas.points.length,11);
 for(const p of atlas.points){const n=nodes.get(p.osm.nodeId);assert.ok(n);assert.deepEqual(p.position,{lat:n.lat,lon:n.lon});assert.equal(p.evidence.operatorBoundary,'not established by this point alone');}
});
test('M4 atlas: three northbound paths remain connected, distinct and reject reversed/missing-link alternatives',()=>{
 const north=atlas.connections.filter(x=>x.direction==='northbound');assert.equal(north.length,3);
 for(const c of north){const p=validatePath(c.wayIds);assert.ok(p.some(w=>w.nodes.includes(c.gateNode)));assert.throws(()=>validatePath([...c.wayIds].reverse()));assert.throws(()=>validatePath(c.wayIds.filter((_,i)=>i!==1)));}
 assert.equal(north[0].toNode,north[1].toNode);assert.notEqual(north[0].toNode,north[2].toNode);
 assert.equal(new Set(north.map(c=>c.gateNode)).size,3);
});
test('M4 atlas: local opposite-direction gates are southbound, not reverse northbound tariff vectors',()=>{
 const south=atlas.connections.filter(x=>x.direction==='southbound');assert.equal(south.length,3);
 for(const c of south){validatePath(c.wayIds);assert.ok(nodes.get(c.toNode).lat<nodes.get(c.fromNode).lat);assert.equal(c.selectedRouteWitness,null);assert.equal(c.completeOperatorProduct,false);assert.equal(c.priceRub,null);}
});
test('M4 atlas: newly located R298 connector matches the existing directed end-node witness',()=>{
 const way=full.elements.find(x=>x.type==='way');assert.equal(way.id,301694367);assert.equal(way.tags['destination:ref'],'Р-298');assert.equal(way.tags.oneway,'yes');assert.equal(String(way.nodes[0]),atlas.r298Exit.fromNode);assert.equal(String(way.nodes.at(-1)),atlas.r298Exit.toNode);
 const old=json('experiments/tariff-proof-selection/m4-545-route-history-review.json');assert.ok(old.reviewedFinalChunk.onwardWayAndEndNodes.some(x=>x.wayId==='301694367'&&x.endNodeId==='3057885104'));assert.equal(atlas.r298Exit.officialKm,null);
 const exit=atlas.points.find(p=>p.osm.nodeId==='3057885104');assert.equal(exit.operatorScheme,null);assert.match(exit.evidence.visual,/not independently viewed/u);
});
test('M4 atlas: existing two-product320/410 working component is retained once, never per physical booth',()=>{
 assert.equal(atlas.tariffBindings.length,1);const t=atlas.tariffBindings[0];assert.deepEqual(t.products,['m4-545-a','m4-545-b']);assert.equal(t.weekdayAmount,320);assert.equal(t.weekendAmount,410);assert.equal(t.physicalObservedPlazaEvents,1);assert.equal(t.introducedByAtlas,false);assert.equal(atlas.summary.newOperatorTariffBindings,0);
 for(const p of atlas.points)assert.equal(p.tariffPair,null,'single point must not become a whole-product charge');
});
test('M4 atlas: primary/source/map records retain exact integrity and bounded counts',()=>{
 for(const s of atlas.sources)assert.equal(createHash('sha256').update(bytes(s.path)).digest('hex'),s.sha256,s.path);
 assert.equal(atlas.summary.newOsmRequests,2);assert.equal(atlas.summary.standardOsmTileViews,2);assert.equal(atlas.summary.newRouteProviderCalls,0);assert.equal(atlas.mapControls.length,2);assert.ok(atlas.mapControls.every(c=>c.constructed&&!c.exactViaSnapOrLaneVerified));
});
