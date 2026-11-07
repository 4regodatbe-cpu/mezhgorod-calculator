import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {priceA289Route} from '../lib/toll-engine/a289-engine.ts';
import {candidatePlans,followsPlan} from '../lib/special-territory-policy.ts';
import {SPECIAL_TERRITORY_BOUNDARIES as zones} from '../lib/special-territory-boundaries.ts';
for(const id of ['anapa-kerch','kerch-anapa','anapa-yalta','yalta-anapa','yalta-adler','adler-yalta'])test(`recorded ${id} uses the bridge and has no A289 payment crossing`,()=>{
 const root=new URL('../experiments/crimea-routing-2026-11-02/',import.meta.url);
 const result=JSON.parse(readFileSync(new URL(id+'.json',root),'utf8'));
 const captures=JSON.parse(gunzipSync(readFileSync(new URL(id+'.providers.json.gz',root))).toString());
 const route=captures.flatMap((x:{body:{routes?:{distance:number;geometry:{coordinates:[number,number][]}}[]}})=>x.body.routes??[]).find((x:{distance:number})=>Math.round(x.distance)===result.summary.meters);
 assert.ok(route);
 const plan=candidatePlans(result.from.position,result.to.position,zones)[0];
 assert.equal(followsPlan(route.geometry.coordinates,plan.positions,plan.corridor,false),true);
 assert.deepEqual(priceA289Route(route.geometry.coordinates,'2026-11-02').crossedFrames,[]);
 assert.equal(result.summary.tolls.pricingStatus,'free');
 assert.equal(result.summary.tolls.amount,0);
});
