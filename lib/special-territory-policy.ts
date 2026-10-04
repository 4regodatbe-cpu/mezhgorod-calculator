import { classifyTerritory, splitRouteByTerritory, type Position, type VerifiedTerritory, type GeoPoint } from "./special-territory-geometry.ts";
export const BRIDGE: Position = { lat:45.2117, lng:36.7161 };
const KRASNODAR: Position = { lat:45.045, lng:39.15 };
const M4: Position = { lat:47.12, lng:39.86 };
const EAST: Position = { lat:47.28, lng:38.94 };
const NORTH_EAST: Position = { lat:48.32, lng:40.26 };
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
  const endZone=reverse?endpoints.fromTerritory:endpoints.toTerritory;
  const approach=endZone==="lnr"?NORTH_EAST:EAST;
  const mainland=endpoints.fromTerritory && endpoints.toTerritory ? [from,to] : [start,...(inCrimea(start)?[BRIDGE,KRASNODAR]:[]),...(endZone==="lnr"?[]:[M4]),approach,end];
  const crimea=endpoints.fromTerritory && endpoints.toTerritory ? [from,CRIMEA_INTERIOR,to] : [start,...(inCrimea(start)?[]:[KRASNODAR,BRIDGE]),CRIMEA_INTERIOR,end];
  return [{ corridor:"mainland" as const,positions:reverse?mainland.reverse():mainland },{ corridor:"crimea" as const,positions:reverse?crimea.reverse():crimea }];
}
export function analyzeRoute(coordinates: GeoPoint[], meters:number,seconds:number,from:Position,to:Position,zones:VerifiedTerritory[]) {
  const split=splitRouteByTerritory({coordinates,routedDistanceMeters:meters,routedDurationSeconds:seconds,zones});
  if(!endpointPolicy(from,to,zones).specialEndpoint && split.specialKm>0) throw new Error("SPECIAL_TRANSIT_EXCLUDED");
  return split;
}
export function followsPlan(coordinates: GeoPoint[], positions:Position[], corridor:"mainland"|"crimea", specialEndpoint:boolean) {
  // Verify ordered passage near each hidden control; rejected router responses cannot inherit a direction label.
  let index=0;
  for(const p of positions) {
    let found=false;
    for(;index<coordinates.length;index++) if(Math.hypot((coordinates[index][0]-p.lng)*Math.cos(p.lat*Math.PI/180),coordinates[index][1]-p.lat)<0.025) {found=true;break;}
    if(!found)return false;
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
