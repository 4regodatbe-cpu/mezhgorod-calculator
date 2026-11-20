import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import test from 'node:test';
const root=new URL('../nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/',import.meta.url);
const rows=[
 ['pair-m11-ckad-noginsk-to-tver','2026-10-16T01-29-30-153Z',36,857,892,-1],
 ['single-m11-tver-to-moscow','2026-10-16T00-21-53-115Z',37,838,874,1],
 ['single-m11-moscow-to-tver','2026-10-16T00-21-05-808Z',36,824,859,-1],
];
for(const [name,id,count,first,last,direction] of rows)test(name+': real locality screen is not a certified tariff cut',()=>{
 const c=JSON.parse(gunzipSync(readFileSync(new URL(name+'/'+id+'-capture.json.gz',root))));
 const a=c.record.route.coordinates;
 const seen=a.flatMap((p,i)=>p[0]>=37.02&&p[0]<=37.10&&p[1]>=56.12&&p[1]<=56.17?[i]:[]);
 assert.equal(seen.length,count);assert.equal(seen[0],first);assert.equal(seen.at(-1),last);
 assert.equal(Math.sign(a[last][0]-a[first][0]),direction);
 assert.equal(c.record.validation.complete,true);
 const traces=c.calls.filter(call=>call.url.includes('trace_attributes'));
 assert.equal(traces.length,2);
 for(const t of traces){const payload=JSON.parse(t.text);assert.equal(Object.hasOwn(payload,'shape'),false);assert.ok(Array.isArray(payload.edges));}
 // No geographic screen is promoted to an operator boundary or priced record.
});
