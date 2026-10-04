import test from "node:test";
import assert from "node:assert/strict";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { analyzeRoute, candidatePlans, endpointPolicy, followsPlan, inCrimea } from "../lib/special-territory-policy.ts";
import { splitRouteByTerritory, type VerifiedTerritory, type GeoPoint } from "../lib/special-territory-geometry.ts";
import { measureTerritoryLegTimes, territoryTimingPlan } from "../lib/special-territory-time.ts";
import { activeOverride, touchSession, SESSION_IDLE_MS } from "../lib/tariff-session.ts";
const k={lat:45.04,lng:38.98},d={lat:48.0156,lng:37.8029},c={lat:44.95,lng:34.1};
test("real four polygons split transitions, Crimea ordinary, transit excluded",()=>{
  assert.equal(endpointPolicy(k,d,zones).specialEndpoint,true);
  assert.equal(endpointPolicy(k,c,zones).specialEndpoint,false);
  const split=analyzeRoute([[38.98,45.04],[37.8029,48.0156]],500000,30000,k,d,zones);
  assert.ok(split.specialKm>0&&split.ordinaryKm>0);
  assert.ok(Math.abs(split.specialKm+split.ordinaryKm-500)<1e-9);
  assert.throws(()=>analyzeRoute([[38.98,45.04],[37.8029,48.0156],[40,50]],900000,50000,k,{lng:40,lat:50},zones),/SPECIAL_TRANSIT_EXCLUDED/);
  const all=splitRouteByTerritory({coordinates:[[32.6169,46.6354],[35.1396,47.8388],[37.8029,48.0156],[39.3078,48.574]],routedDistanceMeters:800000,routedDurationSeconds:40000,zones});
  for(const id of ["dnr","lnr","zaporizhzhia","kherson"] as const)assert.ok(all.territoryKm[id]>0);
});
test("creates distinct mainland and Crimea requests, reverses controls for reverse travel",()=>{
  const plans=candidatePlans(k,d,zones);assert.equal(plans.length,2);assert.notDeepEqual(plans[0].positions,plans[1].positions);
  assert.deepEqual(candidatePlans(d,k,zones)[0].positions,[...plans[0].positions].reverse());
  assert.equal(inCrimea(c),true);
  const ordinary=candidatePlans(c,k,zones);assert.equal(ordinary.length,1);assert.ok(ordinary[0].positions.some(p=>p.lng===36.7161));
  assert.equal(followsPlan([[k.lng,k.lat],[d.lng,d.lat]],plans[0].positions,"mainland",true),false);
});
const synthetic:VerifiedTerritory[]=(["dnr","lnr","zaporizhzhia","kherson"] as const).map((id,i)=>({id,verified:true,source:{url:"https://example.org",title:"test",checkedAt:"2026-10-03"},geometry:{type:"Polygon",coordinates:[[[i*10,-1],[i*10+2,-1],[i*10+2,1],[i*10,1],[i*10,-1]]]}}));
const legs=[{meters:100000,seconds:900,coordinates:[[-1,0],[0,0]] as GeoPoint[]},{meters:200000,seconds:8000,coordinates:[[0,0],[1,0],[2,0]] as GeoPoint[]},{meters:100000,seconds:1100,coordinates:[[2,0],[3,0]] as GeoPoint[]}];
const route={meters:400000,seconds:10000,coordinates:legs.flatMap(l=>l.coordinates),legs};
test("uses real leg seconds, never proportional route duration",()=>{
  assert.deepEqual(measureTerritoryLegTimes(route,[null,"dnr",null],synthetic),{verified:true,specialSeconds:8000});
  assert.deepEqual(territoryTimingPlan(route,synthetic).expected,[null,"dnr",null]);
  assert.equal(measureTerritoryLegTimes({...route,legs:undefined},[null,"dnr",null],synthetic).verified,false);
  assert.equal(measureTerritoryLegTimes({...route,seconds:20000},[null,"dnr",null],synthetic).verified,false);
  assert.equal(measureTerritoryLegTimes(route,[null,null,null],synthetic).verified,false);
  assert.equal(measureTerritoryLegTimes({...route,coordinates:[[-1,0],[3,0]]},[null,"dnr",null],synthetic).verified,false);
});
test("timing plan merges adjacent special administrative polygons as one tariff class",()=>{
  const touching=synthetic.map(zone=>zone.id==="lnr"?{...zone,geometry:{type:"Polygon" as const,coordinates:[[[2,-1],[4,-1],[4,1],[2,1],[2,-1]] as GeoPoint[]]}}:zone);
  const timedLeg={meters:200000,seconds:700,coordinates:[[1,0],[3,0]] as GeoPoint[]};
  const timedRoute={...timedLeg,legs:[timedLeg]};
  const plan=territoryTimingPlan(timedRoute,touching);
  assert.equal(plan.expected.length,1);
  assert.equal(plan.expected[0]!==null,true);
  assert.deepEqual(measureTerritoryLegTimes(timedRoute,plan.expected,touching),{verified:true,specialSeconds:700});
});
test("sub-meter boundary fragment creates no zero-length leg and counts whole leg conservatively",()=>{
  const sliver=synthetic.map(zone=>zone.id==="dnr"?{...zone,geometry:{type:"Polygon" as const,coordinates:[[[2,-1],[2.000005,-1],[2.000005,1],[2,1],[2,-1]] as GeoPoint[]]}}:zone);
  const timedLeg={meters:600,seconds:900,coordinates:[[1.995,0],[2.00001,0]] as GeoPoint[]};
  const timedRoute={...timedLeg,legs:[timedLeg]};
  const plan=territoryTimingPlan(timedRoute,sliver);
  assert.equal(plan.positions.length,2);
  assert.deepEqual(plan.expected,[null]);
  assert.deepEqual(measureTerritoryLegTimes(timedRoute,plan.expected,sliver),{verified:true,specialSeconds:900});
});
test("manual override survives calculations/activity, expires only after idle/new session",()=>{
  const session={override:"standard" as const,lastActivity:1000};
  assert.equal(activeOverride(session,2000),"standard");
  const busy=touchSession(session,SESSION_IDLE_MS);assert.equal(activeOverride(busy,SESSION_IDLE_MS+1000),"standard");
  assert.equal(activeOverride(session,1000+SESSION_IDLE_MS),null);
  assert.equal(touchSession(session,1000+SESSION_IDLE_MS).override,null);
  assert.equal(activeOverride({override:null,lastActivity:0},1000),null);
});

test("selects no more than two directions, binds comparison to the paid candidate and preserves unknown",async()=>{
  const {selectTimedTerritoryOptions}=await import("../lib/special-territory-time.ts");
  const candidate=(corridor:"mainland"|"crimea",specialSeconds:number,pricingStatus:"priced"|"free"|"unknown",verified=true)=>({corridor,time:{specialSeconds,verified},fast:{seconds:20000,tolls:{pricingStatus}}});
  const main=candidate("mainland",10000,"priced"), crimea=candidate("crimea",5000,"priced");
  assert.equal(selectTimedTerritoryOptions([main,crimea]).options.length,2);
  const lowSpecialMain={...candidate("mainland",1000,"priced"),fast:{seconds:20000,tolls:{pricingStatus:"priced" as const}}};
  assert.equal(selectTimedTerritoryOptions([lowSpecialMain,candidate("crimea",9000,"priced")]).options.length,2);
  assert.equal(selectTimedTerritoryOptions([lowSpecialMain,candidate("crimea",10001,"priced")]).options.length,1);
  assert.equal(selectTimedTerritoryOptions([main,{...crimea,time:{verified:true,specialSeconds:10001}}]).options.length,1);
  assert.equal(selectTimedTerritoryOptions([main,candidate("crimea",100,"priced",false)]).options.length,1);
  assert.equal(selectTimedTerritoryOptions([crimea]).options.length,0);
  const free=candidate("mainland",20000,"free");
  assert.equal(selectTimedTerritoryOptions([free,main,candidate("crimea",6000,"priced")]).options.length,2);
  assert.equal(selectTimedTerritoryOptions([main,candidate("crimea",4000,"free")]).options.length,1);
  assert.equal(selectTimedTerritoryOptions([main,candidate("crimea",4000,"unknown")]).options[1].fast.tolls.pricingStatus,"unknown");
});
