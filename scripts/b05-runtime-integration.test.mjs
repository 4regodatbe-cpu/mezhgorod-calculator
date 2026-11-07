import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {validateTollEdges,getPrivateTollTraceChunks} from '../lib/toll-validator.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';

const capturePath='../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-taman-to-voronezh/2026-10-16T00-10-53-930Z-capture.json.gz';

test('saved Taman→Voronezh trace integrates 545 exactly once while the incomplete M4/API total stays unknown',async()=>{
  const capture=JSON.parse(gunzipSync(readFileSync(new URL(capturePath,import.meta.url))));
  const chunks=capture.calls.filter(c=>String(c.url).includes('/trace_attributes')).map(c=>JSON.parse(c.text).edges);
  const originalFetch=globalThis.fetch;let call=0;
  globalThis.fetch=async url=>{
    assert.match(String(url),/\/trace_attributes/u,'the test must not issue unrelated network requests');
    const edges=chunks[call++];assert.ok(edges,'unexpected extra trace request');
    return new Response(JSON.stringify({edges}),{status:200,headers:{'content-type':'application/json'}});
  };
  try {
    const route=capture.record.route;
    const validation=await validateTollEdges(route.coordinates);
    assert.equal(call,chunks.length);assert.equal(validation.complete,true);
    const privateChunks=getPrivateTollTraceChunks(validation,route.coordinates);
    assert.equal(privateChunks?.length,chunks.length);
    assert.equal(getPrivateTollTraceChunks(validation,route.coordinates.slice(1)),null,
      'private trace evidence is bound to its exact route geometry');
    assert.equal(Object.keys(validation).some(key=>/traceChunks|rawEdges/u.test(key)),false);
    const selected={...route,m4RoadBoundaries:capture.record.validation.m4RoadBoundaries,
      m11RoadEvidence:route.m11RoadEvidence};
    const result=await calculateLegTolls({routeGeometry:route.coordinates,routeSeconds:route.seconds,
      departureAt:'2026-10-15T09:00:00+03:00',selectedFastProvider:capture.record.provider,
      selectedFastRoute:selected,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation});
    const pvp=result.componentAudit.components.find(component=>component.id==='m4-545');
    const m4=result.componentAudit.components.find(component=>component.id==='m4');
    assert.equal(pvp?.tolls?.amount,320);assert.equal(pvp?.tolls?.weekendAmount,410);
    assert.equal(m4?.tolls,null,'other M4 tariff coverage is not inferred from the 545 witness');
    assert.equal(result.componentAudit.status,'unknown');
    const api=tollsForApi(result.tolls,result.fastValidation);
    assert.equal(api.amount,null);assert.equal(api.pricingStatus,'unknown');
  } finally { globalThis.fetch=originalFetch; }
});
