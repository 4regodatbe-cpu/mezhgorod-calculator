import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveStrictM12Span, type M12SpanCoordinate } from '../lib/toll-engine/m12-valhalla-span.ts';
import { osrmRoute } from '../lib/route-providers.ts';

const shape: M12SpanCoordinate[] = [[37,55],[37.01,55],[37.02,55],[37.03,55],[37.04,55]];
const maneuver = (begin: number, end: number) => ({street_names:['М-12 Восток'],begin_shape_index:begin,end_shape_index:end});
test('M12 single-span pricing rejects departure and re-entry, both directions', () => {
  for (const coordinates of [shape, [...shape].reverse()]) {
    assert.equal(deriveStrictM12Span([{coordinates,maneuvers:[maneuver(0,1),maneuver(3,4)]}]), null);
    assert.ok(deriveStrictM12Span([{coordinates,maneuvers:[maneuver(0,2),maneuver(2,4)]}]));
  }
});
test('M12 malformed strict evidence cannot disappear behind a valid segment', () => {
  assert.equal(deriveStrictM12Span([{coordinates:shape,maneuvers:[maneuver(0,2),maneuver(4,1)]}]), null);
  assert.equal(deriveStrictM12Span([{coordinates:shape,maneuvers:[maneuver(0,2),maneuver(3,3)]}]), null);
});
test('M12 disconnected legs cannot produce a continuous paid span', () => {
  assert.equal(deriveStrictM12Span([{coordinates:shape,maneuvers:[maneuver(0,4)]},{coordinates:[[38,55],[38.01,55]],maneuvers:[maneuver(0,1)]}]), null);
  assert.ok(deriveStrictM12Span([{coordinates:shape.slice(0,3),maneuvers:[maneuver(0,2)]},{coordinates:shape.slice(2),maneuvers:[maneuver(0,2)]}]));
});
test('OSRM preserves its own strict M11 evidence; destinations remain clues', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({routes:[{distance:1000,duration:100,geometry:{coordinates:shape},legs:[{distance:1000,duration:100,steps:[
    {distance:500,ref:'М-11',geometry:{coordinates:shape.slice(0,3)}},
    {distance:500,name:'local road',destinations:'М-11',geometry:{coordinates:shape.slice(2)}}
  ]}]}]});
  try {
    const route = await osrmRoute({label:'A',position:{lat:55,lng:37}},{label:'B',position:{lat:55,lng:37.04}});
    assert.equal(route.m11RoadEvidence?.provider,'osrm');
    assert.equal(route.m11RoadEvidence?.strictBlocks.length,1);
    assert.equal(route.m11RoadEvidence?.candidateClues.length,1);
    assert.deepEqual(route.m11RoadEvidence?.strictBlocks[0].endCoordinate,shape[2]);
  } finally { globalThis.fetch = original; }
});

test('V3 uses selected OSRM M11 evidence and never borrows competing Valhalla evidence', async () => {
  const {calculateLegTolls} = await import('../lib/v3-calculation/route-leg-pricing.ts');
  const coordinates: M12SpanCoordinate[] = [[31.2534812,59.1976987],[30.8,59.5],[30.3598352,59.7750977]];
  const m11RoadEvidence = {provider:'osrm' as const,malformedStrictCount:0,candidateClues:[],strictBlocks:[{
    provider:'osrm' as const,legIndex:0,sourceStartIndex:0,sourceEndIndex:0,beginKm:0,endKm:100,lengthKm:100,
    beginCoordinate:coordinates[0],endCoordinate:coordinates[2],labels:['М-11'],
  }]};
  const selectedFastRoute={meters:100000,seconds:3600,coordinates,m11RoadEvidence};
  const args={routeGeometry:coordinates,routeSeconds:3600,departureAt:'2026-10-13T12:00:00+03:00',selectedFastProvider:'OSRM',selectedFastRoute,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null};
  const result=await calculateLegTolls(args);
  assert.ok(result.tolls.amount>0);
  assert.ok(result.tolls.segments.some(s=>s.includes('p593 → p679')));
  const disconnected={...m11RoadEvidence,strictBlocks:[{...m11RoadEvidence.strictBlocks[0],endCoordinate:coordinates[1],endKm:50},{...m11RoadEvidence.strictBlocks[0],beginCoordinate:coordinates[1],beginKm:60}]};
  const rejected=await calculateLegTolls({...args,selectedFastRoute:{...selectedFastRoute,m11RoadEvidence:disconnected},valhallaEvidence:selectedFastRoute});
  assert.equal(rejected.tolls.amount,result.tolls.amount);
  assert.ok(rejected.tolls.segments.some(s=>s.includes('p593 → p679')));
});

test('Tver proximity and p58 alone cannot prove the p147 paid boundary', async()=>{
  const {calculateM11MoscowToPetersburg}=await import('../lib/toll-engine/m11-moscow-production.ts');
  const route: M12SpanCoordinate[]=[[35.9176,56.8587],[36.5,56.5],[37.0712818,56.1391684],[37.472,55.8842],[37.6,55.75]];
  assert.equal(calculateM11MoscowToPetersburg(route,7200,'2026-10-13T12:00:00+03:00').tolls,null);
});

test('M11 tail continuation uses the user-approved 94 RUB component after p679', async()=>{
  const {calculateLegTolls}=await import('../lib/v3-calculation/route-leg-pricing.ts');
  const coordinates: M12SpanCoordinate[]=[[37.472,55.8842],[37.0712818,56.1391684],[31.2534812,59.1976987],[30.3598352,59.7750977],[30.3351,59.9343]];
  const selectedFastRoute={meters:700000,seconds:24000,coordinates,m11RoadEvidence:{provider:'valhalla' as const,malformedStrictCount:0,candidateClues:[],strictBlocks:[{
    provider:'valhalla' as const,legIndex:0,sourceStartIndex:0,sourceEndIndex:0,beginKm:0,endKm:700,lengthKm:700,
    beginCoordinate:coordinates[0],endCoordinate:coordinates[4],labels:['М-11'],
  }]}};
  const result=await calculateLegTolls({routeGeometry:coordinates,routeSeconds:24000,departureAt:'2026-10-13T09:00:00+03:00',selectedFastProvider:'Valhalla',selectedFastRoute,valhallaEvidence:selectedFastRoute,confirmedFreeRoute:null,diagnosticFastValidation:null});
  assert.ok(result.tolls.amount>0);
  assert.equal(result.componentAudit.components.find(c=>c.id==='m11-679-684')?.tolls?.amount,94);
  assert.equal(result.componentAudit.status,'priced');
});

test('M11 user single-entry policy does not scan for intermediate return trips', async()=>{
  const {m11TraversalSafety}=await import('../lib/v3-calculation/m11-traversal-safety.ts');
  const p593: M12SpanCoordinate=[31.2534812,59.1976987];
  const p679: M12SpanCoordinate=[30.3598352,59.7750977];
  assert.equal(m11TraversalSafety([p593,p679,p593,p679],null),null);
  assert.equal(m11TraversalSafety([p593,p593,p679],null),null);
});

test('M11 distinct physical plazas sharing p58 are not a repeated traversal',async()=>{
  const {m11TraversalSafety}=await import('../lib/v3-calculation/m11-traversal-safety.ts');
  assert.equal(m11TraversalSafety([[37.0472685,56.138384],[37.06,56.139],[37.0712818,56.1391684]],null),null);
});
