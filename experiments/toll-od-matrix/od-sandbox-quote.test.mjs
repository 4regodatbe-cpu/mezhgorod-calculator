import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quoteRouteOD} from './od-sandbox-quote.mjs';
const matrix=JSON.parse(readFileSync(new URL('./matrix/m11.json',import.meta.url),'utf8'));
const sys=matrix.source.systemId;
const shape=Array.from({length:5},(_,i)=>[38+i*0.01,51]);
function route(systems=[null,sys,sys,null]){
 return {routeId:'synthetic-route',mapMatchStatus:'complete',terminalPositionsOffToll:true,geometry:shape,
 edges:systems.map((systemId,i)=>({shapeIndex:i,fromNodeId:'n'+i,toNodeId:'n'+(i+1),systemId,direction:'to_moscow',proof:{status:'matched',routeId:'synthetic-route',coverage:'exact',osmWayId:'w'+i}}))};
}
const boundaries=[{systemId:sys,role:'entry',pointId:'p58',osmNodeId:'n1',direction:'to_moscow',coordinate:shape[1],status:'verified_on_off_ramp'},
 {systemId:sys,role:'exit',pointId:'p679',osmNodeId:'n3',direction:'to_moscow',coordinate:shape[3],status:'verified_on_off_ramp'}];
const calc=(options={})=>quoteRouteOD({route:route(),boundaries,matrices:[matrix],profile:'monThu',...options});
test('resolved synthetic profile prices stored directed 58 to 679',()=>{const x=calc();assert.equal(x.status,'diagnostic_priced');assert.equal(x.amountRub,4200);assert.equal(x.tariffEffectiveDateComplete,false);});
test('Friday-Sunday prices from ready matrix cell',()=>assert.equal(calc({profile:'friSun'}).amountRub,4940));
test('unlisted reverse direction unknown',()=>{const c=boundaries.map((x,i)=>({...x,pointId:i===0?'p679':'p58'}));const x=calc({boundaries:c});assert.equal(x.status,'unknown');assert.equal(x.amountRub,null);});
test('missing OD system unknown',()=>assert.equal(calc({matrices:[]}).amountRub,null));
test('missing boundary unknown',()=>assert.equal(calc({boundaries:boundaries.slice(0,1)}).amountRub,null));
test('partial route cannot be priced',()=>{const r=route();r.mapMatchStatus='partial';assert.equal(calc({route:r}).amountRub,null);});
test('empty crossing not free',()=>assert.equal(calc({route:route([null,null,null,null])}).status,'unknown'));
test('independently validated free route gives zero',()=>{const r=route([null,null,null,null]);const x=calc({route:r,freeValidation:{status:'independently_confirmed_free',routeId:r.routeId,coverage:'all_edges',method:'separate_toll_booth_validator'}});assert.equal(x.status,'free');assert.equal(x.amountRub,0)});
test('free evidence from other route cannot be used',()=>{const r=route([null,null,null,null]);assert.equal(calc({route:r,freeValidation:{status:'independently_confirmed_free',routeId:'other',coverage:'all_edges',method:'separate_toll_booth_validator'}}).amountRub,null)});
test('no tariff profile matches unknown',()=>assert.equal(calc({profile:'bad'}).amountRub,null));
test('unverified M4 pair never priced',()=>{const r=route([null,'m4','m4',null]);const b=boundaries.map(x=>({...x,systemId:'m4'}));assert.equal(calc({route:r,boundaries:b}).amountRub,null)});

test('bad tariff matrix fails closed without crashing',()=>{const invalid={source:{systemId:sys},pairs:null};assert.equal(calc({matrices:[invalid]}).amountRub,null);});
test('duplicate road system matrix fails closed',()=>assert.equal(calc({matrices:[matrix,matrix]}).amountRub,null));
