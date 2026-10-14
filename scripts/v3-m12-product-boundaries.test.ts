import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../data/fixtures/m12-route-projections-2026-09-30.json' with {type:'json'};
import anchors from '../data/tolls/m12-rvp-evidence-2026-09-30.json' with {type:'json'};
import {evaluateM12Evidence,calculateM12FromRoute} from '../lib/toll-engine/m12-route-core.ts';
import {evaluateM12ProductBoundaries,resolveM12ProductBoundaries} from '../lib/v3-calculation/m12-product-boundaries.ts';
import {matrixM12Component} from '../experiments/nationwide-tolls/engine/m12-route-adapter.mjs';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {haversineKm} from '../lib/toll-engine/m11-moscow-geometry.ts';
import type {Coordinate} from '../lib/tolls.ts';
const at='2026-10-14T12:00:00+03:00';

test('recorded selected-route outer boundaries work both directions without inferred marker charges',()=>{
 for(const id of ['moscow->kazan','kazan->moscow']) {
  const recorded=fixture.routes.find(r=>r.id===id)!;
  const result=evaluateM12ProductBoundaries(recorded);
  assert.equal(result.boundary.status,'proven');
  assert.equal(matrixM12Component(result,at,3600)?.tolls?.amount,3513);
  assert.equal('amountRub' in result,false);assert.equal('continuity' in result,false);
  const direct=recorded.projections.filter(p=>[184,764].includes(p.rvpKm));
  const outer=evaluateM12ProductBoundaries({...recorded,projections:direct});
  assert.equal(matrixM12Component(outer,at)?.tolls?.amount,3513);
 }
});

test('internal chainage failure in the old engine cannot block a proven outer pair',()=>{
 const recorded=fixture.routes.find(r=>r.id==='moscow->kazan')!;
 const changed={...recorded,projections:recorded.projections.map(p=>p.rvpKm===392?{...p,chainageKm:p.chainageKm+20}:p)};
 const native=evaluateM12Evidence(changed);
 assert.equal(native.status,'unknown');assert.equal(native.boundary.status,'proven');
 const outer=evaluateM12ProductBoundaries(changed);
 assert.equal(outer.boundary.status,'proven');
 assert.equal(matrixM12Component(outer,at)?.tolls?.amount,3513);
 assert.equal(matrixM12Component({core:native,tolls:null},at)?.tolls?.amount,3513);
});

test('bad outer span or evidence never becomes a fare',()=>{
 const recorded=fixture.routes.find(r=>r.id==='moscow->kazan')!;
 for(const span of [null,{beginKm:800,endKm:900},{beginKm:100,endKm:900},{beginKm:170,endKm:170}]){
  const result=evaluateM12ProductBoundaries({...recorded,strictM12Span:span});
  assert.equal(result.boundary.status,'unknown');assert.equal(matrixM12Component(result,at)?.tolls,null);
 }
 const bad=evaluateM12ProductBoundaries({...recorded,projections:[...recorded.projections,{rvpKm:9999,nearestDistanceKm:0,chainageKm:200}]});
 assert.equal(bad.boundary.status,'unknown');
});

const route:Coordinate[]=anchors.anchors.filter(g=>[184,281].includes(g.rvpKm)).map(g=>g.center as Coordinate);
const km=haversineKm(route[0],route[1]);

test('actual calibrated anchors can price an outer pair where native distance continuity cannot',()=>{
 for(const directed of [route,route.toReversed()]){
  const span={beginKm:0,endKm:km};
  assert.equal(calculateM12FromRoute(directed,span).status,'unknown');
  const result=resolveM12ProductBoundaries(directed,span);
  assert.equal(result.boundary.status,'proven');
  assert.equal(matrixM12Component(result,at)?.tolls?.amount,687);
 }
});

test('geometry, unsupported single-boundary traversal and unbound October Shali stay unknown',()=>{
 for(const directed of [[],[[NaN,56],[41,56]],[[200,56],[41,56]]] as Coordinate[][])assert.equal(resolveM12ProductBoundaries(directed,{beginKm:0,endKm:20}).boundary.status,'unknown');
 assert.equal(resolveM12ProductBoundaries(route,{beginKm:0,endKm:km+10}).boundary.status,'unknown');
 const unsupported={boundary:{status:'proven',direction:'forward',firstRvpKm:184,lastRvpKm:832}};
 assert.equal(matrixM12Component(unsupported,at)?.tolls,null);
 assert.equal(matrixM12Component({boundary:{...unsupported.boundary,lastRvpKm:184}},at)?.tolls,null);
});

test('M12 prices cannot cross an unknown version change or use invalid route duration',()=>{
 const recorded=fixture.routes.find(r=>r.id==='moscow->kazan')!;
 const result=evaluateM12ProductBoundaries(recorded);
 assert.equal(matrixM12Component(result,'2026-10-07T23:30:00+03:00',3600)?.tolls,null);
 assert.equal(matrixM12Component(result,'2026-10-14T23:30:00+03:00',3600)?.tolls?.amount,3513);
 for(const seconds of [NaN,-1,Infinity])assert.equal(matrixM12Component(result,at,seconds)?.tolls,null);
});

async function upper(directed:Coordinate[],span:{beginKm:number;endKm:number}) {
 return calculateLegTolls({routeGeometry:directed,routeSeconds:3600,departureAt:at,
  selectedFastProvider:'OSRM',selectedFastRoute:{coordinates:directed,meters:km*1000,seconds:3600,m12EndpointSpan:span},
  valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
}

test('upper V3 uses the new boundary proof and ready matrix in both directions',async()=>{
 for(const directed of [route,route.toReversed()]){
  const result=await upper(directed,{beginKm:0,endKm:km});
  assert.equal(result.tolls.amount,687);
  assert.equal(tollsForApi(result.tolls,result.fastValidation).pricingStatus,'priced');
 }
});

test('missing outer evidence blocks the whole upper result rather than reviving old money',async()=>{
 const result=await upper(route,{beginKm:0,endKm:km+20});
 const api=tollsForApi(result.tolls,result.fastValidation);
 assert.equal(api.pricingStatus,'unknown');assert.equal(api.amount,null);
});
