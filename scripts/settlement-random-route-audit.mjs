import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { classifyTerritory } from "../lib/special-territory-geometry.ts";
import { inCrimea, candidatePlans, findPlanLegStretchAnomaly, followsPlan, analyzeRoute } from "../lib/special-territory-policy.ts";
import { valhalla, osrmRoute } from "../lib/route-providers.ts";

const fixture = JSON.parse(await readFile(new URL("../data/settlement-route-benchmark-20261006.json", import.meta.url), "utf8"));
const seed = fixture.source.seed;
const resolvedByArea = fixture.areas;
const russian = fixture.russianEndpoint;
assert.ok(!classifyTerritory(russian.position,zones) && !inCrimea(russian.position),"Russian endpoint must be outside special zones and Crimea");
for (const [area,result] of Object.entries(resolvedByArea)) {
  assert.equal(result.selected.length,10,`Fixture must include ten settlements for ${area}`);
  for (const place of result.selected) {
    const territory=classifyTerritory(place.position,zones);
    const matches=area==="crimea" ? !territory && inCrimea(place.position) : territory===area;
    assert.ok(matches,`Fixture coordinate for ${place.label} is outside ${area}`);
  }
}
async function mapLimit(values,limit,fn) {
  const output=new Array(values.length); let cursor=0;
  await Promise.all(Array.from({length:Math.min(limit,values.length)},async()=>{
    while(true){const index=cursor++;if(index>=values.length)return;output[index]=await fn(values[index],index);}
  }));
  return output;
}
const providers=[
  {name:"Valhalla",get:(from,to,positions)=>valhalla(from,to,1,positions)},
  {name:"OSRM",get:(from,to,positions)=>osrmRoute(from,to,positions)},
];
const samples=Object.entries(resolvedByArea).flatMap(([area,result])=>result.selected.map((place)=>({area,place})));
const routeResults=await mapLimit(samples,3,async(sample,index)=>{
  const fromSpecial=index%2===0;
  const from=fromSpecial?sample.place:{label:russian.name,position:russian.position};
  const to=fromSpecial?{label:russian.name,position:russian.position}:sample.place;
  const plan=candidatePlans(from.position,to.position,zones)[0];
  const row={area:sample.area,settlement:sample.place.label,requested:sample.place.requested,osmType:sample.place.osmType,group:sample.place.group,direction:fromSpecial?"special-to-RF":"RF-to-special",russianEndpoint:russian.name,preferredCorridor:plan?.corridor ?? null,planPositions:plan?.positions ?? [],providers:{}};
  if(!plan){row.error="NO_ROUTE_PLAN";return row;}
  const providerResults=await Promise.all(providers.map(async(provider)=>{
    const item={status:"error"};
    try{
      const route=await provider.get(from,to,plan.positions);
      const legBreakdown=(route.legs??[]).map((leg,legIndex)=>({index:legIndex,fromControl:plan.positions[legIndex]??null,toControl:plan.positions[legIndex+1]??null,distanceKm:Number.isFinite(leg.meters)?Math.round(leg.meters/100)/10:null,durationMinutes:Number.isFinite(leg.seconds)?Math.round(leg.seconds/60):null}));
      const stretch=findPlanLegStretchAnomaly(route.coordinates,plan.positions);
      if(stretch){
        Object.assign(item,{error:`ROUTING_PLAN_LEG_STRETCH_${stretch.legIndex+1}_${stretch.stretchRatio.toFixed(1)}X`,distanceKm:Math.round(route.meters/100)/10,durationMinutes:Math.round(route.seconds/60),legBreakdown});
        return item;
      }
      if(!followsPlan(route.coordinates,plan.positions,plan.corridor,true)) throw new Error("ROUTING_PLAN_MISMATCH");
      const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
      const kilometerCheck=Math.abs(split.ordinaryKm+split.specialKm-route.meters/1000);
      if(kilometerCheck>0.05) throw new Error(`DISTANCE_SPLIT_MISMATCH_${kilometerCheck.toFixed(3)}_KM`);
      Object.assign(item,{status:"ok",distanceKm:Math.round(route.meters/100)/10,durationMinutes:Math.round(route.seconds/60),ordinaryKm:Math.round(split.ordinaryKm*10)/10,specialKm:Math.round(split.specialKm*10)/10,territoryKm:split.territoryKm,geometryPoints:route.coordinates.length,legCount:route.legs?.length ?? null,legBreakdown,geometryCoordinates:route.coordinates});
    }catch(error){item.error=error instanceof Error?error.message:String(error);}
    return item;
  }));
  providers.forEach((provider,i)=>row.providers[provider.name]=providerResults[i]);
  const distances=providerResults.filter((item)=>item.status==="ok").map((item)=>item.distanceKm);
  row.providerDistanceDifferenceKm=distances.length===2?Math.round(Math.abs(distances[0]-distances[1])*10)/10:null;
  row.providerDistanceDifferencePercent=distances.length===2 && Math.max(...distances)>0
    ? Math.round((Math.abs(distances[0]-distances[1])/Math.max(...distances))*1000)/10 : null;
  return row;
});
const providerDisagreements=routeResults.filter((row)=>row.providerDistanceDifferenceKm!==null && (row.providerDistanceDifferenceKm>30 || (row.providerDistanceDifferencePercent??0)>5)).map((row)=>({area:row.area,settlement:row.settlement,differenceKm:row.providerDistanceDifferenceKm,differencePercent:row.providerDistanceDifferencePercent}));
const topGeometryRows=routeResults
  .filter((row)=>row.providerDistanceDifferenceKm!==null && (row.providerDistanceDifferenceKm>30 || (row.providerDistanceDifferencePercent??0)>5))
  .sort((a,b)=>(b.providerDistanceDifferencePercent??0)-(a.providerDistanceDifferencePercent??0))
  .slice(0,5);
const geometryDiagnostics=topGeometryRows.map((row)=>({
  area:row.area,settlement:row.settlement,direction:row.direction,russianEndpoint:row.russianEndpoint,
  preferredCorridor:row.preferredCorridor,planPositions:row.planPositions,
  providerDistanceDifferenceKm:row.providerDistanceDifferenceKm,
  providerDistanceDifferencePercent:row.providerDistanceDifferencePercent,
  providers:Object.fromEntries(Object.entries(row.providers).map(([name,result])=>[name,{
    distanceKm:result.distanceKm??null,
    geometryPoints:result.geometryPoints??null,
    coordinates:result.geometryCoordinates??null
  }]))
}));
for(const row of routeResults) for(const result of Object.values(row.providers)) delete result.geometryCoordinates;
const providerFailures=routeResults.flatMap((row)=>Object.entries(row.providers).filter(([,result])=>result.status!=="ok").map(([provider,result])=>({area:row.area,settlement:row.settlement,provider,error:result.error})));
const summary={seed,generatedAt:new Date().toISOString(),source:fixture.source,nameMatching:"Fixed coordinate snapshot resolved through Photon in the recorded source run; this route audit does not depend on live geocoding.",providerDistanceDisagreementThreshold:{absoluteKm:30,relativePercent:5},providerDisagreements,geometryDiagnostics,providerFailures,selectionMethod:"Fixed date-stamped coordinate corpus; the same 50 endpoints and one Russian endpoint are reused on every run. This is an offline regression fixture, not a runtime routing cache.",russianEndpoint:russian,areas:Object.fromEntries(Object.entries(resolvedByArea).map(([area,result])=>[area,{availableCount:result.availableCount,ruralAvailable:result.ruralAvailable,urbanAvailable:result.urbanAvailable,selectedCount:result.selected.length}])),routeCount:routeResults.length,providerSuccesses:Object.fromEntries(providers.map((provider)=>[provider.name,routeResults.filter((row)=>row.providers[provider.name]?.status==="ok").length])),routeResults};
await writeFile("settlement-random-route-audit.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({seed,areas:summary.areas,russianEndpoint:russian.name,routeCount:summary.routeCount,providerSuccesses:summary.providerSuccesses}));
for(const [area,result] of Object.entries(resolvedByArea)) assert.equal(result.selected.length,10,`Need 10 resolved settlements in ${area}; found ${result.selected.length}`);
assert.equal(routeResults.length,50,"Expected ten sampled settlements in each of five areas");
