import { classifyTerritory, splitRouteByTerritory, type Position, type VerifiedTerritory, type GeoPoint } from "./special-territory-geometry.ts";
import { inCrimeaApproachZone } from "./special-territory-approach-zone.ts";
export const BRIDGE: Position = { lat:45.2117, lng:36.7161 };
const KRASNODAR: Position = { lat:45.045, lng:39.15 };
const M4: Position = { lat:47.12, lng:39.86 };
const CRIMEA_INTERIOR: Position = { lat:45.708, lng:34.395 };
// Routing controls only, not declarations of road access or border crossing status.
export function inCrimea(p: Position) {
  const ring: GeoPoint[] = [[32.45,45.35],[33.6,44.35],[34.1,44.3],[34.9,44.7],[36.65,45.15],[36.65,45.55],[35.7,45.8],[35.02,46.18],[34.55,46.0],[33.6,46.23],[32.45,45.9]];
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) { const a=ring[i],b=ring[j]; if((a[1]>p.lat)!==(b[1]>p.lat) && p.lng<(b[0]-a[0])*(p.lat-a[1])/(b[1]-a[1])+a[0]) inside=!inside; }
  return inside;
}
export function endpointPolicy(from: Position,to: Position,zones: VerifiedTerritory[]) {
  const a=classifyTerritory(from,zones), b=classifyTerritory(to,zones);
  return { fromTerritory:a,toTerritory:b,specialEndpoint:a!==null||b!==null };
}
export function candidatePlans(from: Position,to: Position,zones: VerifiedTerritory[]) {
  const endpoints=endpointPolicy(from,to,zones);
  if(!endpoints.specialEndpoint) {
    const via = inCrimea(from)!==inCrimea(to) ? (inCrimea(from) ? [BRIDGE,KRASNODAR,...(to.lat>46.5?[M4]:[])] : [...(from.lat>46.5?[M4]:[]),KRASNODAR,BRIDGE]) : [];
    return [{ corridor:"mainland" as const,positions:[from,...via,to] }];
  }
  // Orient the controls toward the special endpoint, including reverse trips.
  const reverse = endpoints.fromTerritory!==null && endpoints.toTerritory===null;
  const start=reverse?to:from,end=reverse?from:to;
  // On the mainland, these are routing constraints, not a prescribed road:
  // let the router choose the road between endpoints and reject Crimea transit below.
  // Keep Bridge → Krasnodar → M-4 controls only when one endpoint is in Crimea.
  const mainland=endpoints.fromTerritory && endpoints.toTerritory
    ? [from,to]
    : [start,...(inCrimea(start)?[BRIDGE,KRASNODAR,M4]:[]),end];
  const crimea=endpoints.fromTerritory && endpoints.toTerritory ? [from,CRIMEA_INTERIOR,to] : [start,...(inCrimea(start)?[]:[KRASNODAR,BRIDGE]),CRIMEA_INTERIOR,end];
  // Geographic policy selects one corridor; the former timing threshold no longer applies.
  // If both endpoints are special, endpoint B determines the approach.
  const specialPoint=endpoints.toTerritory?to:from;
  const corridor=inCrimeaApproachZone(specialPoint)?"crimea" as const:"mainland" as const;
  const positions=corridor==="crimea"?crimea:mainland;
  return [{corridor,positions:reverse?[...positions].reverse():positions}];
}
export function analyzeRoute(coordinates: GeoPoint[], meters:number,seconds:number,from:Position,to:Position,zones:VerifiedTerritory[]) {
  const split=splitRouteByTerritory({coordinates,routedDistanceMeters:meters,routedDurationSeconds:seconds,zones});
  if(!endpointPolicy(from,to,zones).specialEndpoint && split.specialKm>0) throw new Error("SPECIAL_TRANSIT_EXCLUDED");
  return split;
}
const MAX_PLAN_LEG_STRETCH=10;
export type PlanLegStretchAnomaly={legIndex:number;routeKm:number;directKm:number;stretchRatio:number};
function coordinateDistanceKm(a:GeoPoint,b:GeoPoint) {
  const radians=Math.PI/180,lat1=a[1]*radians,lat2=b[1]*radians,dLat=(b[1]-a[1])*radians,dLng=(b[0]-a[0])*radians;
  const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 6371*2*Math.asin(Math.sqrt(h));
}
function orderedPlanControlIndexes(coordinates:GeoPoint[],positions:Position[]) {
  const indexes:number[]=[];let index=0;
  for(const p of positions) {
    let found=false;
    for(;index<coordinates.length;index++) if(Math.hypot((coordinates[index][0]-p.lng)*Math.cos(p.lat*Math.PI/180),coordinates[index][1]-p.lat)<0.025) {indexes.push(index);found=true;break;}
    if(!found)return null;
  }
  return indexes;
}
function stretchAnomalyFromIndexes(coordinates:GeoPoint[],positions:Position[],indexes:number[]):PlanLegStretchAnomaly|null {
  for(let legIndex=0;legIndex<positions.length-1;legIndex++) {
    const directKm=coordinateDistanceKm([positions[legIndex].lng,positions[legIndex].lat],[positions[legIndex+1].lng,positions[legIndex+1].lat]);
    if(directKm<20)continue;
    let routeKm=0;
    for(let i=indexes[legIndex]+1;i<=indexes[legIndex+1];i++)routeKm+=coordinateDistanceKm(coordinates[i-1],coordinates[i]);
    const stretchRatio=routeKm/directKm;
    if(stretchRatio>MAX_PLAN_LEG_STRETCH)return {legIndex,routeKm,directKm,stretchRatio};
  }
  return null;
}
/** Detect a routed control leg over ten times its straight-line lower bound. */
export function findPlanLegStretchAnomaly(coordinates:GeoPoint[],positions:Position[]):PlanLegStretchAnomaly|null {
  const indexes=orderedPlanControlIndexes(coordinates,positions);
  return indexes?stretchAnomalyFromIndexes(coordinates,positions,indexes):null;
}
export function followsPlan(coordinates: GeoPoint[], positions:Position[], corridor:"mainland"|"crimea", specialEndpoint:boolean) {
  // Verify ordered passage near each hidden control; rejected router responses cannot inherit a direction label.
  const indexes=orderedPlanControlIndexes(coordinates,positions);
  if(!indexes)return false;
  if(stretchAnomalyFromIndexes(coordinates,positions,indexes))return false;
  if(specialEndpoint && corridor==="mainland" && !inCrimea(positions[0]) && !inCrimea(positions.at(-1)!)) {
    if(coordinates.some(([lng,lat])=>inCrimea({lng,lat})))return false;
  }
  if(specialEndpoint && corridor==="crimea") {
    const interiorIndex=coordinates.findIndex(([lng,lat])=>Math.hypot((lng-CRIMEA_INTERIOR.lng)*0.7,lat-CRIMEA_INTERIOR.lat)<0.025);
    if(interiorIndex<0)return false;
    const bridgeIndices=coordinates.flatMap(([lng,lat],i)=>Math.hypot((lng-BRIDGE.lng)*0.7,lat-BRIDGE.lat)<0.025?[i]:[]);
    const bridgeControl=positions.findIndex(p=>p===BRIDGE || (p.lat===BRIDGE.lat&&p.lng===BRIDGE.lng));
    const interiorControl=positions.findIndex(p=>p.lat===CRIMEA_INTERIOR.lat&&p.lng===CRIMEA_INTERIOR.lng);
    // A Crimea candidate must continue by land, not turn back across the bridge.
    if(bridgeControl<0 && bridgeIndices.length)return false;
    if(bridgeControl>=0 && bridgeControl<interiorControl && bridgeIndices.some(i=>i>interiorIndex))return false;
    if(bridgeControl>interiorControl && bridgeIndices.some(i=>i<interiorIndex))return false;
  }
  return true;
}
