import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { quoteAccepted545Working } from '../experiments/tariff-proof-selection/m4-545-accepted-working.mjs';
const source='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-taman-to-voronezh/2026-10-16T00-10-53-930Z-capture.json.gz';
const bytes=fs.readFileSync(source);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'db7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a');
const original=JSON.parse(zlib.gunzipSync(bytes));
const options=()=>({capture:structuredClone(original),departureAt:'2026-10-15T09:00:00+03:00',alreadyChargedProductKeys:[]});
const edit=(o,fn)=>{const c=JSON.parse(o.capture.calls[10].text);fn(c.edges);o.capture.calls[10].text=JSON.stringify(c);};
test('approved real northbound 73.9km case returns 320, explicitly only two M4 products',()=>{
  const o=options(),before=JSON.stringify(o.capture),q=quoteAccepted545Working(o);
  assert.equal(q.status,'accepted_working_calculation');assert.equal(q.amount,320);
  assert.equal(q.weekendAmount,410);assert.deepEqual(q.coverageKeys,['m4-545-a','m4-545-b']);
  assert.equal(q.isWholeRouteTotal,false);assert.equal(q.receiptVerified,false);
  assert.equal(JSON.stringify(o.capture),before);assert.equal(q.source.tariffOrder,'58');
});
test('Saturday replay uses existing Moscow-time profile and same official cells, not new trip proof',()=>{
  const o=options();o.departureAt='2026-10-17T09:00:00+03:00';
  assert.equal(quoteAccepted545Working(o).amount,410);
});
test('adjacent, reverse or different successor cannot inherit the accepted bundle',()=>{
  for(const mutate of [e=>{e[38].end_node.node_id=9620416636;},e=>{e[36].way_id=467980112;},e=>{e[70].way_id=1;}]){
    const o=options();edit(o,mutate);assert.equal(quoteAccepted545Working(o).amount,null);
  }
});
test('existing charge of either product, missing context and re-entry cannot double charge',()=>{
  for(const key of ['m4-545-a','m4-545-b']){const o=options();o.alreadyChargedProductKeys=[key];assert.equal(quoteAccepted545Working(o).reason,'overlapping_product_coverage');}
  const o=options();delete o.alreadyChargedProductKeys;assert.equal(quoteAccepted545Working(o).amount,null);
  const d=options();edit(d,e=>{e[60].end_node.node_id=5818209495;});assert.equal(quoteAccepted545Working(d).amount,null);
});
test('incomplete trace, wrong category/payment/date remain unknown; no fabricated effective date',()=>{
  const c=options();c.capture.record.validation.complete=false;assert.equal(quoteAccepted545Working(c).amount,null);
  for(const patch of [{operatorCategory:'II'},{payment:'transponder'},{departureAt:'2026-02-30'},{departureAt:'2026-02-01T09:00:00+03:00'}])assert.equal(quoteAccepted545Working({...options(),...patch}).amount,null);
});
test('runtime raw trace requires exact once-only overlap context before replacement is accepted',()=>{
  const chunks=original.calls.filter(c=>String(c.url).includes('/trace_attributes')).map(c=>JSON.parse(c.text).edges);
  const base={traceChunks:chunks,traceComplete:true,traceChunkCount:chunks.length,checkedTraceChunkCount:chunks.length,
    failedTraceChunkCount:0,departureAt:'2026-10-15T12:00:00+03:00',replaceExactlyCoveredProducts:true};
  const accepted=quoteAccepted545Working({...base,alreadyChargedProductKeys:['m4-515','m4-545-a','m4-545-b','m4-620']});
  assert.equal(accepted.status,'accepted_working_calculation');assert.equal(accepted.amount,320);assert.equal(accepted.isWholeRouteTotal,false);
  const partial=quoteAccepted545Working({...base,alreadyChargedProductKeys:['m4-545-a']});
  assert.equal(partial.status,'unknown');assert.equal(partial.reason,'overlapping_product_coverage');
});
