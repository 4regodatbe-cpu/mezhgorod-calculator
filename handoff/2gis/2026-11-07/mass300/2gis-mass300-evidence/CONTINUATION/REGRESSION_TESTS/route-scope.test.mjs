import test from 'node:test';import assert from 'node:assert/strict';import {summarizeRouteScope,summarizeResponse} from '../TOOLS/diagnose-snapshot.mjs';
const source=[[0,0],[.001,0],[.002,0]];
const route=s=>({maneuvers:[{outcoming_path:{geometry:[{selection:s}]}}]});
test('ordered source corridor supported without preserving geometry',()=>{const x=summarizeRouteScope(route('LINESTRING(0 0,0.001 0,0.002 0)'),source,223);assert.equal(x.status,'SOURCE_CORRIDOR_SUPPORTED');assert.equal(x.rawGeometryRetained,false);assert.equal(x.laneIdentityCertified,false);assert(!JSON.stringify(x).includes('LINESTRING'));});
test('reversed geometry fails direction despite every witness being on route',()=>{const x=summarizeRouteScope(route('LINESTRING(0.002 0,0.001 0,0 0)'),source,223);assert.notEqual(x.status,'SOURCE_CORRIDOR_SUPPORTED');assert(x.backtrackViolations>0);});
test('all nearby source witnesses do not make long extra route comparable',()=>{const x=summarizeRouteScope(route('LINESTRING(0 0,0.001 0,0.002 0,0.1 0,0.002 0)'),source,22000);assert.equal(x.status,'ROUTE_SCOPE_MISMATCH');});
test('parallel wrong road rejected even when total length is similar',()=>{const x=summarizeRouteScope(route('LINESTRING(0 0.0003,0.001 0.0003,0.002 0.0003)'),source,223);assert.equal(x.status,'ROUTE_SCOPE_MISMATCH');});
test('missing geometry stays inconclusive, not free or a tariff result',()=>assert.equal(summarizeRouteScope({},source,223).status,'INCONCLUSIVE'));

test('overlong response is flagged without assigning a PVP fare or repeating request',()=>{const s=summarizeResponse(200,{result:[{status:'OK',total_distance:51000}]},{maxKm:10});assert.equal(s.demoDistanceLimitExceeded,true);assert.equal(s.windowDistanceLimitExceeded,true);assert.equal(s.perPvpPrice,null);});
