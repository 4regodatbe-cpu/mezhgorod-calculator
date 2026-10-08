import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractODTraversals } from './od-geometry.mjs';
const shape = Array.from({length:7},(_,i)=>[38+i*0.01,51]);
function route(systems=[null,'m4','m4',null,null,null], dirs={}, options={}){
 return {routeId:'r1',mapMatchStatus:'complete',terminalPositionsOffToll:true,geometry:shape,
  edges:systems.map((systemId,i)=>({shapeIndex:i,fromNodeId:'n'+i,toNodeId:'n'+(i+1),systemId,direction:dirs[i]||'to_moscow',proof:{status:'matched',routeId:'r1',coverage:'exact',osmWayId:'way-'+i}})),...options};
}
function b(systemId, role, nodeIndex, pointId, direction='to_moscow',override={}){
 return {systemId,role,osmNodeId:'n'+nodeIndex,pointId,direction,coordinate:shape[nodeIndex],status:'verified_on_off_ramp',...override};
}
const catalog=[b('m4','entry',1,'pA'),b('m4','exit',3,'pB')];
const calc=(r,c=catalog)=>extractODTraversals(r,c);
test('resolves one continuous OD span',()=>{const x=calc(route());assert.equal(x.status,'resolved');assert.deepEqual(x.traversals.map(t=>[t.entry,t.exit,t.entryShapeIndex,t.exitShapeIndex]),[['pA','pB',1,3]]);});
test('does not split a continuous multi-edge paid span',()=>assert.equal(calc(route()).traversals.length,1));
test('direction is part of gate identity',()=>assert.equal(calc(route([null,'m4','m4',null,null,null],{1:'to_krasnodar',2:'to_krasnodar'})).status,'unknown'));
test('rejects false nearby untraversed access node',()=>assert.equal(calc(route(),[b('m4','entry',1,'pA','to_moscow',{osmNodeId:'not-visited'}),catalog[1]]).status,'unknown'));
test('rejects wrong gate coordinate even with matching node id',()=>assert.equal(calc(route(),[b('m4','entry',1,'pA','to_moscow',{coordinate:[38.1,51]}),catalog[1]]).status,'unknown'));
test('rejects incomplete matching',()=>assert.equal(calc(route(undefined,{}, {mapMatchStatus:'partial'})).status,'unknown'));
test('rejects missing edges',()=>{const r=route();r.edges.pop();assert.equal(calc(r).status,'unknown')});
test('rejects route graph discontinuity',()=>{const r=route();r.edges[2].fromNodeId='wrong';assert.equal(calc(r).status,'unknown')});
test('rejects wrong route evidence',()=>{const r=route();r.edges[1].proof.routeId='r2';assert.equal(calc(r).status,'unknown')});
test('rejects duplicate catalog boundary',()=>assert.equal(calc(route(),[...catalog,catalog[0]]).status,'unknown'));
test('rejects partial unverified boundary',()=>assert.equal(calc(route(),[ {...catalog[0],status:'candidate'},catalog[1]]).status,'unknown'));
test('paid start is unknown',()=>assert.equal(calc(route(['m4','m4','m4',null,null,null])).status,'unknown'));
test('paid end is unknown',()=>assert.equal(calc(route([null,null,null,'m4','m4','m4'])).status,'unknown'));
test('free labeling requires separate validation',()=>{const x=calc(route([null,null,null,null,null,null]));assert.equal(x.status,'no_paid_spans');});
test('rejects reversed direction inside same system',()=>assert.equal(calc(route([null,'m4','m4',null,null,null],{2:'to_krasnodar'})).status,'unknown'));
test('rejects one edge without exact proof',()=>{const r=route();r.edges[2].proof.coverage='partial';assert.equal(calc(r).status,'unknown')});
test('rejects missing end ramp',()=>assert.equal(calc(route(),[catalog[0]]).status,'unknown'));
test('rejects insufficient geometry',()=>{const r=route();r.geometry=[];assert.equal(calc(r).status,'unknown')});
test('two separate entries are two distinct charges not one',()=>{const s=[null,'m4',null,'m4',null,null];const c=[b('m4','entry',1,'A'),b('m4','exit',2,'B'),b('m4','entry',3,'C'),b('m4','exit',4,'D')]; const x=calc(route(s),c);assert.equal(x.status,'resolved');assert.deepEqual(x.traversals.map(t=>[t.entry,t.exit]),[['A','B'],['C','D']]);});
test('unknown second crossing fails whole extraction',()=>{const s=[null,'m4',null,'m4',null,null];const c=[b('m4','entry',1,'A'),b('m4','exit',2,'B'),b('m4','entry',3,'C')];const x=calc(route(s),c);assert.equal(x.status,'unknown');assert.equal(x.traversals.length,0);});
test('two road families are separate if both gated',()=>{const s=[null,'m4',null,'m11',null,null];const c=[b('m4','entry',1,'A'),b('m4','exit',2,'B'),b('m11','entry',3,'C'),b('m11','exit',4,'D')];const x=calc(route(s),c);assert.equal(x.status,'resolved');assert.deepEqual(x.traversals.map(t=>t.systemId),['m4','m11']);});
test('direct transfer between priced networks requires both gate records',()=>{const s=[null,'m4','m11',null,null,null];const c=[b('m4','entry',1,'A'),b('m4','exit',2,'B'),b('m11','entry',2,'C'),b('m11','exit',3,'D')];const x=calc(route(s),c);assert.equal(x.status,'resolved');assert.equal(x.traversals.length,2);});
