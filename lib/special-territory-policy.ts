import { classifyTerritory, splitRouteByTerritory, type Position, type VerifiedTerritory, type GeoPoint, type TerritorySplit } from "./special-territory-geometry.ts";
import { inCrimea } from "./crimea-geography.ts";
import { inCrimeaApproachZone } from "./special-territory-approach-zone.ts";
import { inspectKrasnodarBypass, krasnodarBypassControls } from "./toll-engine/krasnodar-bypass-evidence.ts";
export const BRIDGE: Position = { lat:45.2117, lng:36.7161 };
const KRASNODAR: Position = { lat:45.045, lng:39.15 };
const M4: Position = { lat:47.12, lng:39.86 };
const CRIMEA_INTERIOR: Position = { lat:45.708, lng:34.395 };
const BYPASS_NORTH = krasnodarBypassControls(true);
const BYPASS_SOUTH = krasnodarBypassControls(false);
function withCrimeaM4Bypass(positions:Position[]) {
  const bridge=positions.indexOf(BRIDGE),m4=positions.indexOf(M4);
  if(bridge<0 || m4<0)return positions;
  const controls=bridge<m4?BYPASS_NORTH:BYPASS_SOUTH;
  return positions.flatMap(p=>p===KRASNODAR?controls:[p]);
}
// Routing controls only, not declarations of road access or border crossing status.
export { inCrimea } from "./crimea-geography.ts";

export function endpointPolicy(from: Position,to: Position,zones: VerifiedTerritory[]) {
  const a=classifyTerritory(from,zones), b=classifyTerritory(to,zones);
  return { fromTerritory:a,toTerritory:b,specialEndpoint:a!==null||b!==null };
}
/** Both endpoints and every measured piece must have verified special-zone coverage. */
export function isInternalSpecialRoute(from: Position, to: Position, split: TerritorySplit, zones: VerifiedTerritory[]) {
  const endpoints = endpointPolicy(from, to, zones);
  return Boolean(endpoints.fromTerritory && endpoints.toTerritory && split.verified &&
    split.pieces.length > 0 && split.pieces.every(piece => piece.territory !== null && piece.meters > 0) &&
    split.ordinaryKm === 0 && split.specialKm > 0);
}
export function candidatePlans(from: Position,to: Position,zones: VerifiedTerritory[]) {
  const endpoints=endpointPolicy(from,to,zones);
  // A trip wholly between the four special territories has no approach corridor.
  // Let the providers find the fastest usable direct route; its geometry is
  // checked separately before any territory split or tariff is accepted.
  if(endpoints.fromTerritory && endpoints.toTerritory)
    return [{corridor:"mainland" as const,positions:[from,to]}];
  if(!endpoints.specialEndpoint) {
    // The bridge is the geographic constraint. Mainland roads (including
    // Krasnodar/M4 on long trips) are chosen by actual provider travel time.
    const via = inCrimea(from)!==inCrimea(to) ? [BRIDGE] : [];
    return [{ corridor:"mainland" as const,positions:[from,...via,to] }];
  }
  // Orient the controls toward the special endpoint, including reverse trips.
  const reverse = endpoints.fromTerritory!==null && endpoints.toTerritory===null;
  const start=reverse?to:from,end=reverse?from:to;
  // On the mainland, these are routing constraints, not a prescribed road:
  // let the router choose the road between endpoints and reject Crimea transit below.
  // Keep Bridge → Krasnodar → M-4 controls only when one endpoint is in Crimea.
  const mainland=[start,...(inCrimea(start)?[BRIDGE,KRASNODAR,M4]:[]),end];
  const crimea=[start,...(inCrimea(start)?[]:[...(start.lat>46.5?[M4]:[]),KRASNODAR,BRIDGE]),CRIMEA_INTERIOR,end];
  // Geographic policy selects one corridor; the former timing threshold no longer applies.
  // This approach rule applies only when exactly one endpoint is special.
  const specialPoint=endpoints.toTerritory?to:from;
  const corridor=inCrimeaApproachZone(specialPoint)?"crimea" as const:"mainland" as const;
  const positions=corridor==="crimea"?crimea:mainland;
  return [{corridor,positions:withCrimeaM4Bypass(reverse?[...positions].reverse():positions)}];
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
  // Ordinary control tolerance is kilometres wide. A Crimea→M4 plan must prove
  // the actual directional plaza crossing, not merely pass near Krasnodar.
  const samePoint=(a:Position,b:Position)=>a.lat===b.lat&&a.lng===b.lng;
  const north=positions.some(p=>samePoint(p,BYPASS_NORTH[1]));
  const south=positions.some(p=>samePoint(p,BYPASS_SOUTH[1]));
  if(north||south) {
    const bypass=inspectKrasnodarBypass(coordinates);
    if(north===south || bypass.boundaryStatus!=="resolved" || bypass.from!==(north?"51":"0"))return false;
  }
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
