import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
const root=new URL('../../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/',import.meta.url);
const read=(path,hash)=>{const b=readFileSync(new URL(path,root));assert.equal(createHash('sha256').update(b).digest('hex'),hash);return JSON.parse(gunzipSync(b));};
const p58Nodes=new Set([4215723025,4215723024,4215723028,4215723029,3283566523,5170196700,5170196701,5170196702,5170196703,3243217928,3243217926,5170196693,5170196692,5170196691,3283566519]);
function noP58Event(c){for(const call of c.calls){let payload;try{payload=JSON.parse(call.text);}catch{continue;}assert.ok(!(payload.edges??[]).some(e=>p58Nodes.has(e.end_node?.node_id)));}}
test('actual reciprocal journey proves distinct entry, not reversed exit inference',()=>{
 const c=read('single-m11-tver-to-moscow/2026-10-16T00-21-53-115Z-capture.json.gz','0c65966fffb33ef1e3afd404e485db07b11ccff9a06736c34db79525c20d1d52');
 const e=JSON.parse(c.calls[3].text).edges;
 assert.equal(c.record.validation.complete,true);
 assert.ok(e[221].names.includes('М-10'));
 assert.equal(e[226].way_id,900434354);
 assert.equal(e[226].end_node.node_id,6588472832);
 assert.ok(e[234].names.includes('М-11'));
 assert.ok(!c.record.validation.tollBooths.some(b=>b.osmNodeId==='6588472831'));
 noP58Event(c);
});
test('opposite city-to-city capture uses a different unidentified exit',()=>{
 const c=read('single-m11-moscow-to-tver/2026-10-16T00-21-05-808Z-capture.json.gz','fdabe3231a0504f174a1b478b2eefbc1b940bb13ee74ed0bef163f0d447f3031');
 const e=JSON.parse(c.calls[4].text).edges;
 assert.ok(e[30].names.includes('М-11'));
 assert.equal(e[33].end_node.node_id,12007034961);
 assert.equal(e[33].way_id,1220146782);
 assert.ok(!c.record.validation.tollBooths.some(b=>['6588472831','6588472832'].includes(b.osmNodeId)));
 noP58Event(c);
});
