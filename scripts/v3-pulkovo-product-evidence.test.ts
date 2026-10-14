import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import snapshot from '../experiments/nationwide-tolls/source-snapshots/m11/2026-10-14-pulkovo-physical-gates.json' with {type:'json'};
import {inspectM11PulkovoAccess} from '../lib/toll-engine/m11-pulkovo-evidence.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import type {Coordinate} from '../lib/tolls.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
const gate=snapshot.airportAccessGates[0];
const route:Coordinate[]=[[gate.lon-0.001,gate.lat],[gate.lon+0.001,gate.lat]];
test('Pulkovo airport gantries retain original primary map evidence',()=>{
 const raw=gunzipSync(readFileSync('experiments/nationwide-tolls/'+snapshot.sourceRawArchive));
 assert.equal(createHash('sha256').update(raw).digest('hex'),snapshot.sourceRawSha256);
 assert.equal(snapshot.airportAccessGates.length,2);
 assert.ok(snapshot.airportAccessGates.every(g=>g.tags.highway==='toll_gantry'&&g.tags.name.includes('Пулково')));
});
test('both airport directions become one detected unresolved product, not an invented fare',()=>{
 for(const shape of [route,[...route].reverse()]){
  const evidence=inspectM11PulkovoAccess(shape);
  assert.equal(evidence.candidate,true);assert.equal(evidence.productId,'m11-679-684');
  assert.ok(evidence.matchedGateIds.length);assert.equal('amount' in evidence,false);
 }
 assert.equal(inspectM11PulkovoAccess([[30.2,59.79],[30.21,59.79]]).candidate,false);
});
test('an airport toll gantry blocks a complete zero even when the provider calls the route free',async()=>{
 const result=await calculateLegTolls({routeGeometry:route,routeSeconds:60,departureAt:'2026-10-14T12:00:00+03:00',
  selectedFastProvider:'test',selectedFastRoute:{meters:112,seconds:60,coordinates:route},valhallaEvidence:null,
  confirmedFreeRoute:{meters:112,seconds:60},diagnosticFastValidation:{status:'free',source:'test',tollEdgeCount:0,checkedEdgeCount:0,wayIds:[],roadNames:[],message:'fixture'}});
 const api=tollsForApi(result.tolls,result.fastValidation);
 assert.equal(api.amount,null);
 assert.equal(api.pricingStatus,'unknown');
 assert.match(JSON.stringify(result),/m11_pulkovo_paid_product_scope_unresolved/);
});
