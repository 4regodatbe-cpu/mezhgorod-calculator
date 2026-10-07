import test from "node:test";
import assert from "node:assert/strict";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { analyzeRoute, candidatePlans, endpointPolicy, findPlanLegStretchAnomaly, followsPlan, inCrimea } from "../lib/special-territory-policy.ts";
import { splitRouteByTerritory, type VerifiedTerritory, type GeoPoint } from "../lib/special-territory-geometry.ts";
import { measureTerritoryLegTimes, territoryTimingPlan } from "../lib/special-territory-time.ts";
import { selectGeographicTerritoryOption } from "../lib/special-territory-options.ts";
import { inCrimeaApproachZone } from "../lib/special-territory-approach-zone.ts";
import { selectLiveRouteCandidates } from "../lib/route-quality.ts";
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
test("rejects an anomalously long leg between required route controls",()=>{
 const start={lat:47.71671,lng:35.20981},interior={lat:45.708,lng:34.395};
 const detour:GeoPoint[]=[[start.lng,start.lat],[40,56],[50,60],[60,55],[50,45],[interior.lng,interior.lat]];
 const anomaly=findPlanLegStretchAnomaly(detour,[start,interior]);
 assert.ok(anomaly);assert.equal(anomaly.legIndex,0);assert.ok(anomaly.stretchRatio>10);
 assert.equal(followsPlan(detour,[start,interior],"crimea",true),false);
 const plausible:GeoPoint[]=[[start.lng,start.lat],[36,47],[interior.lng,interior.lat]];
 assert.equal(findPlanLegStretchAnomaly(plausible,[start,interior]),null);
});
test("geographic route zone selects one corridor without forcing a mainland detour",()=>{
 const melitopol={lat:46.848,lng:35.365},plans=candidatePlans(k,melitopol,zones);
 assert.equal(plans.length,1);assert.equal(plans[0].corridor,"crimea");assert.equal(inCrimeaApproachZone(melitopol),true);
 const donetskPlans=candidatePlans(k,d,zones);assert.equal(donetskPlans.length,1);assert.equal(donetskPlans[0].corridor,"mainland");assert.equal(inCrimeaApproachZone(d),false);
 const reverse=candidatePlans(melitopol,k,zones);assert.equal(reverse.length,1);assert.equal(reverse[0].corridor,"crimea");assert.deepEqual(reverse[0].positions,[...plans[0].positions].reverse());
 const yalta={lat:44.4987874,lng:34.1689358};assert.equal(inCrimea(yalta),true);
 const yaltaToDonetsk=candidatePlans(yalta,d,zones)[0];
 assert.deepEqual(yaltaToDonetsk.positions,[yalta,{lat:45.2117,lng:36.7161},{lat:45.045,lng:39.15},{lat:47.12,lng:39.86},d]);
 assert.deepEqual(candidatePlans(d,yalta,zones)[0].positions,[...yaltaToDonetsk.positions].reverse());
 const volnovakha={lat:47.6019,lng:37.4968};
 const yaltaToVolnovakha=candidatePlans(yalta,volnovakha,zones)[0];
 assert.equal(yaltaToVolnovakha.corridor,"mainland","Yalta–Volnovakha stays on the agreed bridge/Krasnodar/M-4 mainland corridor");
 assert.deepEqual(yaltaToVolnovakha.positions,[yalta,{lat:45.2117,lng:36.7161},{lat:45.045,lng:39.15},{lat:47.12,lng:39.86},volnovakha]);
 assert.deepEqual(candidatePlans(volnovakha,yalta,zones)[0].positions,[...yaltaToVolnovakha.positions].reverse());
 const namedPairs=[
  {name:"Волноваха",position:volnovakha,corridor:"mainland" as const},
  {name:"Токмак",position:{lat:47.255,lng:35.706},corridor:"crimea" as const},
  {name:"Бердянск",position:{lat:46.755,lng:36.788},corridor:"crimea" as const},
  {name:"Херсон",position:{lat:46.6354,lng:32.6169},corridor:"crimea" as const},
 ];
 for(const pair of namedPairs){
  const forward=candidatePlans(yalta,pair.position,zones)[0];
  assert.equal(forward.corridor,pair.corridor,`Yalta–${pair.name} follows the current approach-zone policy`);
  assert.deepEqual(candidatePlans(pair.position,yalta,zones)[0].positions,[...forward.positions].reverse(),`${pair.name}–Yalta reverses controls`);
 }
 const moscow={lat:55.7505412,lng:37.6174782};
 assert.deepEqual(candidatePlans(moscow,d,zones)[0].positions,[moscow,d],"mainland destination does not force M-4/EAST waypoints");
 assert.deepEqual(candidatePlans(d,moscow,zones)[0].positions,[d,moscow],"reverse mainland route uses the same direct controls");
 const ordinary=candidatePlans(c,k,zones);assert.equal(ordinary.length,1);assert.ok(ordinary[0].positions.some(p=>p.lng===36.7161));
 assert.equal(followsPlan([[k.lng,k.lat],[d.lng,d.lat]],donetskPlans[0].positions,"mainland",true),true,"direct mainland route is accepted");
 assert.equal(followsPlan([[k.lng,k.lat],[34.1689,44.4988],[d.lng,d.lat]],donetskPlans[0].positions,"mainland",true),false,"mainland route crossing Crimea is still rejected");
 const kherson={lat:46.6354,lng:32.6169};
 assert.equal(candidatePlans(kherson,d,zones)[0].corridor,"mainland","special destination outside the routing zone selects mainland");
 assert.equal(candidatePlans(d,kherson,zones)[0].corridor,"crimea","reversed trip uses its special destination inside the routing zone");
 assert.equal(candidatePlans(kherson,d,zones).length,1);
 const edgeMidpoint={lng:31.16,lat:46.39};
 assert.equal(inCrimeaApproachZone(edgeMidpoint),true,"a point exactly on the screenshot-traced contour is included");
 assert.equal(inCrimeaApproachZone({lng:31.16,lat:46.389}),false,"a point just outside the contour remains outside");
 assert.equal(inCrimeaApproachZone({lng:31.16,lat:46.391}),true,"a point just inside the contour remains inside");
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

test("special route providers surface material distance disagreement",()=>{
 const result=selectLiveRouteCandidates([
  {name:"Valhalla",route:{meters:1213600,seconds:58921}},
  {name:"OSRM",route:{meters:1123100,seconds:58334}},
 ]);
 assert.equal(result.provider,"Valhalla");
 assert.equal(result.quality.status,"warning");
 assert.equal(result.quality.distanceSpreadPercent,7.7);
});
test("geographic selector prefers route-quality selection before faster outliers",()=>{
 const candidate=(preference:number,seconds:number,pricingStatus:"priced"|"unknown"="priced")=>({
  corridor:"mainland" as const,
  provider:preference===0?"Valhalla":"OSRM",
  selectionPreference:preference,
  fast:{seconds,tolls:{pricingStatus}},
 });
 const selected=selectGeographicTerritoryOption([candidate(1,58000),candidate(0,59000)],"mainland");
 assert.equal(selected.options[0].provider,"Valhalla");
});
test("geographic selector ignores elapsed-time evidence and preserves toll uncertainty",()=>{
 const candidate=(corridor:"mainland"|"crimea",pricingStatus:"priced"|"free"|"unknown",seconds=20000,provider="OSRM")=>({corridor,provider,fast:{seconds,tolls:{pricingStatus}}});
 const mainland=candidate("mainland","priced"),crimea=candidate("crimea","unknown",100);
 const selectedCrimea=selectGeographicTerritoryOption([mainland,crimea],"crimea");
 assert.equal(selectedCrimea.options.length,1);assert.equal(selectedCrimea.options[0].corridor,"crimea");assert.equal(selectedCrimea.routePolicy,"geographic-zone");
 const selectedMainland=selectGeographicTerritoryOption([mainland,crimea],"mainland");assert.equal(selectedMainland.options.length,1);assert.equal(selectedMainland.options[0].corridor,"mainland");
 assert.equal(selectGeographicTerritoryOption([crimea],"mainland").options.length,0);
 assert.equal(selectGeographicTerritoryOption([candidate("crimea","free"),candidate("crimea","priced",25000)],"crimea").options[0].fast.tolls.pricingStatus,"priced");
 assert.equal(selectGeographicTerritoryOption([candidate("crimea","unknown")],"crimea").options[0].fast.tolls.pricingStatus,"unknown");
});

test("geographic selector returns main and distinct alternative only from preferred corridor",()=>{
 const candidate=(corridor:"mainland"|"crimea",provider:string,seconds:number)=>({corridor,provider,fast:{seconds,tolls:{pricingStatus:"unknown" as const}}});
 const main=candidate("mainland","Valhalla",50000),alt=candidate("mainland","OSRM",52000),wrong=candidate("crimea","Other",30000);
 const selected=selectGeographicTerritoryOption([main,alt,wrong],"mainland");
 assert.deepEqual(selected.options.map(item=>item.provider),["Valhalla","OSRM"]);
 assert.deepEqual(selectGeographicTerritoryOption([main,candidate("mainland","Duplicate",50030)],"mainland").options.map(item=>item.provider),["Valhalla"]);
});
