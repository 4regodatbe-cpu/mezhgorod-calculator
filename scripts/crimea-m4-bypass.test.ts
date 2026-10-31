import test from "node:test";
import assert from "node:assert/strict";
import { candidatePlans, followsPlan } from "../lib/special-territory-policy.ts";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { inspectKrasnodarBypass } from "../lib/toll-engine/krasnodar-bypass-evidence.ts";
import type { GeoPoint } from "../lib/special-territory-geometry.ts";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { matrixDzokComponent } from "../experiments/nationwide-tolls/engine/dzok-route-adapter.mjs";
import { priceA289Route } from "../lib/toll-engine/a289-engine.ts";

const yalta={lat:44.4987874,lng:34.1689358};
const rostov={lat:47.2357,lng:39.7015};
const coordinates=(positions:Array<{lat:number;lng:number}>):GeoPoint[]=>positions.map(p=>[p.lng,p.lat]);

test("Crimea to northbound M4 uses the paid west bypass in both driving directions",()=>{
 for(const crimea of [yalta,{lat:44.616,lng:33.525},{lat:45.357,lng:36.468}]) {
  for(const mainland of [rostov,{lat:51.6615,lng:39.2003},{lat:55.7505,lng:37.6175}]) {
   for(const [from,to,expectedFrom] of [[crimea,mainland,"51"],[mainland,crimea,"0"]] as const) {
    const plan=candidatePlans(from,to,zones)[0];
    const route=coordinates(plan.positions);
    const bypass=inspectKrasnodarBypass(route);
    assert.equal(bypass.boundaryStatus,"resolved");
    assert.equal(bypass.from,expectedFrom);
    assert.equal(followsPlan(route,plan.positions,plan.corridor,false),true);
    assert.ok(!plan.positions.some(p=>p.lat===45.045&&p.lng===39.15));
   }
  }
 }
});

test("Krasnodar, Maykop and Kabardino-Balkaria retain the southern city approach",()=>{
 for(const destination of [{lat:45.0355,lng:38.9753},{lat:44.6098,lng:40.1006},{lat:43.4853,lng:43.6071}]) {
  for(const [from,to] of [[yalta,destination],[destination,yalta]]) {
   const plan=candidatePlans(from,to,zones)[0];
   assert.equal(plan.positions.length,4);
   assert.ok(plan.positions.some(p=>p.lat===45.045&&p.lng===39.15));
   assert.equal(inspectKrasnodarBypass(coordinates(plan.positions)).boundaryStatus,"unknown");
  }
 }
});

test("a Crimea M4 route must cross the directional plaza, not just pass within broad control tolerance",()=>{
 const plan=candidatePlans(yalta,rostov,zones)[0];
 const shifted=coordinates(plan.positions).map(([lng,lat])=>lng>38.73&&lng<38.75?[lng+0.003,lat] as GeoPoint:[lng,lat] as GeoPoint);
 assert.equal(followsPlan(shifted,plan.positions,plan.corridor,false),false);
 const wrongDirection=coordinates(plan.positions).toReversed();
 assert.equal(followsPlan(wrongDirection,plan.positions,plan.corridor,false),false);
});

test("recorded own OSRM routes cross the correct bypass plaza and price 410 in either direction",()=>{
 for(const [file,from,to] of [["yalta-rostov",yalta,rostov],["rostov-yalta",rostov,yalta]] as const) {
  const data=JSON.parse(gunzipSync(readFileSync(new URL(`../experiments/crimea-m4-bypass/${file}-osrm-response.json.gz`,import.meta.url))).toString());
  const route=data.routes[0];
  const plan=candidatePlans(from,to,zones)[0];
  assert.equal(followsPlan(route.geometry.coordinates,plan.positions,plan.corridor,false),true);
  const evidence=inspectKrasnodarBypass(route.geometry.coordinates);
  const dzok=matrixDzokComponent(evidence,"2026-10-20T12:00:00+03:00",route.duration).tolls;
  assert.ok(dzok);
  assert.equal(dzok.amount,410);
  assert.equal(priceA289Route(route.geometry.coordinates,"2026-10-20T12:00:00+03:00").amount,800);
 }
});

test("a northern mainland approach to the special Crimea corridor also uses its directional bypass",()=>{
 const kherson={lat:46.6354,lng:32.6169};
 for(const [from,to] of [[rostov,kherson],[kherson,rostov]]) {
  const plan=candidatePlans(from,to,zones)[0];
  assert.equal(plan.corridor,"crimea");
  assert.equal(inspectKrasnodarBypass(coordinates(plan.positions)).boundaryStatus,"resolved");
 }
});
