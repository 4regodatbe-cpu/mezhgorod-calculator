import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
const root=new URL('../nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/',import.meta.url);
const load=(p,hash)=>{const b=readFileSync(new URL(p,root));assert.equal(createHash('sha256').update(b).digest('hex'),hash);const c=JSON.parse(gunzipSync(b));assert.equal(c.record.validation.complete,true);return c;};
test('selected eastbound exit really joins22N0239, not R158',()=>{
 const c=load('single-m12-moscow-to-arzamas/2026-10-16T01-59-35-968Z-capture.json.gz','5f4671a2236dcd45e4c49a8f6c9ca260e8f9aefaa92c9c33901c2f6535348aec');
 const e=JSON.parse(c.calls[5].text).edges;
 assert.deepEqual(e.slice(77,80).map(x=>x.way_id),[1550135076,1550561305,1206479738]);
 assert.equal(e[77].end_node.node_id,14102954884);assert.equal(e[78].end_node.node_id,10090995838);
 assert.ok(e[79].names.includes('22Н-0239'));
});
test('selected reverse entrance uses independently observed different ramp',()=>{
 const c=load('single-m12-arzamas-to-moscow/2026-10-16T01-57-41-594Z-capture.json.gz','62f6c8398474b2df246790418b453bdad386b2758daed86605c80f55bdc5ebe2');
 const e=JSON.parse(c.calls[3].text).edges;
 assert.deepEqual(e.slice(127,134).map(x=>x.way_id),[1102734144,1102734141,1102734142,1102734143,256897416,1550561306,1550135078]);
 assert.ok(e[130].names.includes('22Н-0226'));assert.equal(e[132].end_node.node_id,14102954886);
 assert.ok(e[133].names.includes('М-12'));assert.notEqual(e[132].way_id,1550561305);
});
