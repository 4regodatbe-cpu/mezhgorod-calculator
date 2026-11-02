import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {a289ShortRoute} from '../lib/v3-calculation/a289-short-route.ts';
import {inspectKrasnodarBypass} from '../lib/toll-engine/krasnodar-bypass-evidence.ts';
for(const id of ['yalta-rostov','rostov-yalta'])test(`${id} still crosses the bypass and prices full A289 with a UI-format instant`,()=>{
 const root=new URL('../experiments/crimea-routing-2026-11-02/',import.meta.url);
 const s=JSON.parse(readFileSync(new URL(id+'.json',root),'utf8')).summary;
 const captures=JSON.parse(gunzipSync(readFileSync(new URL(id+'.providers.json.gz',root))).toString());
 const route=captures.flatMap((x:{body:{routes?:{distance:number;geometry:{coordinates:[number,number][]}}[]}})=>x.body.routes??[]).find((r:{distance:number})=>Math.round(r.distance)===s.meters);
 assert.ok(route);
 assert.equal(inspectKrasnodarBypass(route.geometry.coordinates).boundaryStatus,'resolved');
 assert.equal(a289ShortRoute(route.geometry.coordinates,[],'2026-11-02T12:00:00+03:00',true)?.tolls?.amount,800);
 assert.equal(a289ShortRoute(route.geometry.coordinates,[],'2026-11-02',true)?.tolls,null);
});
