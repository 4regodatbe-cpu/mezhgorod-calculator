import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import {inspectSaved545History} from './m4-545-route-history.mjs';
const path='../nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-taman-to-voronezh/2026-10-16T00-10-53-930Z-capture.json.gz';
const bytes=readFileSync(new URL(path,import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'db7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a');
const original=JSON.parse(gunzipSync(bytes));
const copy=()=>structuredClone(original);
const edit=(c,fn)=>{const j=JSON.parse(c.calls[10].text);fn(j.edges);c.calls[10].text=JSON.stringify(j);};
test('real saved Taman→Voronezh case proves observed history, not a full priced pair',()=>{
  const r=inspectSaved545History(original);
  assert.equal(r.historyStatus,'observed_reviewed_case');
  assert.equal(r.traceCallIndex,10);assert.equal(r.gateEdgeIndex,38);assert.equal(r.connectorEdgeIndex,70);
  assert.equal(r.observedGateCount,1);assert.equal(r.rub,null);assert.equal(r.pricingStatus,'unknown');
  assert.deepEqual(r.confirmedProducts,[]);
});
test('incomplete trace does not admit history',()=>{
  const c=copy();c.record.validation.complete=false;
  assert.equal(inspectSaved545History(c).reason,'incomplete_trace');
});
test('opposite direction is not the reviewed northbound path',()=>{
  const c=copy();edit(c,e=>{e[36].way_id=467980112;});
  assert.equal(inspectSaved545History(c).reason,'unproved_directed_cash_path');
});
test('adjacent old-road booth cannot stand in for target booth',()=>{
  const c=copy();edit(c,e=>{e[38].way_id=467980114;e[38].end_node.node_id=9620416636;});
  assert.equal(inspectSaved545History(c).reason,'target_event_not_unique');
});
test('unknown predecessor and a shape-index gap both fail closed',()=>{
  const c=copy();edit(c,e=>{e[35].end_node.node_id=1;});
  assert.equal(inspectSaved545History(c).reason,'unproved_directed_cash_path');
  const d=copy();edit(d,e=>{e[37].begin_shape_index++;});
  assert.equal(inspectSaved545History(d).reason,'shape_index_gap');
});
test('re-entry/duplicate registration is not collapsed to one charge',()=>{
  const c=copy();edit(c,e=>{e[60].end_node.node_id=5818209495;});
  assert.equal(inspectSaved545History(c).reason,'target_event_not_unique');
});
test('different subsequent exit is not the reviewed route',()=>{
  const c=copy();edit(c,e=>{e[70].way_id=1;});
  assert.equal(inspectSaved545History(c).reason,'unproved_onward_R298_exit');
});
test('city labels and a plausible subtotal cannot supply missing product/date evidence',()=>{
  const c=copy();c.record.spec.to.label='Москва';c.record.approximateSubtotal=320;
  assert.deepEqual(inspectSaved545History(c),inspectSaved545History(original));
  assert.equal(inspectSaved545History(c).rub,null);
});
test('same later exit reached via an unreviewed intervening path is not enough',()=>{
  const c=copy();edit(c,e=>{e[50].way_id=1;});
  assert.equal(inspectSaved545History(c).reason,'unproved_onward_R298_exit');
});
