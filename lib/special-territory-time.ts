import { splitRouteByTerritory, type GeoPoint, type Position, type SpecialTerritoryId, type VerifiedTerritory } from "./special-territory-geometry.ts";
type TimedLeg = { meters: number; seconds: number; coordinates: GeoPoint[] };
type TimedRoute = TimedLeg & { legs?: TimedLeg[] };
export type TerritoryTime = { verified: boolean; specialSeconds: number | null; reason?: string };
const close = (a: GeoPoint, b: GeoPoint) => Math.hypot(a[0]-b[0], a[1]-b[1]) < 0.00002;
export function measureTerritoryLegTimes(route: TimedRoute, expected: Array<SpecialTerritoryId | null>, zones: VerifiedTerritory[]): TerritoryTime {
  try {
    if (!route.legs?.length || route.legs.length !== expected.length) throw new Error("LEG_COUNT");
    const dedupe = (points:GeoPoint[]) => points.filter((p,i)=>i===0||!close(p,points[i-1]));
    const full=dedupe(route.coordinates), joined=dedupe(route.legs.flatMap(leg=>leg.coordinates));
    if(full.length!==joined.length || full.some((p,i)=>!close(p,joined[i])))throw new Error("LEG_GEOMETRY_MISMATCH");
    let seconds = 0, meters = 0, specialSeconds = 0;
    for (const [i, leg] of route.legs.entries()) {
      if (!(Number.isFinite(leg.seconds) && leg.seconds > 0 && Number.isFinite(leg.meters) && leg.meters > 0)) throw new Error("LEG_SUMMARY");
      if (i && !close(route.legs[i-1].coordinates.at(-1)!, leg.coordinates[0])) throw new Error("LEG_DISCONTINUITY");
      const split = splitRouteByTerritory({ coordinates: leg.coordinates, routedDistanceMeters: leg.meters, routedDurationSeconds: leg.seconds, zones });
      if (split.pieces.some(piece => piece.territory !== expected[i])) throw new Error("LEG_CROSSES_ZONE");
      seconds += leg.seconds; meters += leg.meters;
      if (expected[i] !== null) specialSeconds += leg.seconds;
    }
    if (Math.abs(seconds-route.seconds) > 2 || Math.abs(meters-route.meters) > 2) throw new Error("LEG_TOTAL_MISMATCH");
    if (!close(route.coordinates[0],route.legs[0].coordinates[0]) || !close(route.coordinates.at(-1)!,route.legs.at(-1)!.coordinates.at(-1)!)) throw new Error("ENDPOINT_MISMATCH");
    return { verified:true, specialSeconds };
  } catch (error) { return { verified:false, specialSeconds:null, reason:error instanceof Error ? error.message : "UNVERIFIED" }; }
}
export function territoryTimingPlan(route: TimedRoute, zones: VerifiedTerritory[]) {
  const positions: Position[] = []; const expected: Array<SpecialTerritoryId | null> = [];
  // Keep existing routing controls: splitting the full shape alone could discard the bridge.
  for (const leg of route.legs?.length ? route.legs : [route]) {
    const split = splitRouteByTerritory({ coordinates:leg.coordinates, routedDistanceMeters:leg.meters, routedDurationSeconds:leg.seconds, zones });
    for (const piece of split.pieces) {
      const first = piece.coordinates[0], last = piece.coordinates.at(-1)!;
      if (!positions.length) positions.push({ lng:first[0], lat:first[1] });
      positions.push({ lng:last[0], lat:last[1] }); expected.push(piece.territory);
    }
  }
  if (!expected.length || positions.length > 48) throw new Error("TIMING_WAYPOINT_LIMIT");
  return { positions, expected };
}

export type TimedCandidate = { corridor:"mainland"|"crimea"; time:TerritoryTime; fast:{seconds:number;tollValidation?:{status:string};tolls:{pricingStatus:"priced"|"free"|"unknown"}} };
export function selectTimedTerritoryOptions<T extends TimedCandidate>(candidates:T[]) {
  const isPaid=(item:T)=>item.fast.tolls.pricingStatus==="priced"||item.fast.tollValidation?.status==="toll";
  const choose=(direction:T["corridor"])=>{
    const routes=candidates.filter(item=>item.corridor===direction).sort((a,b)=>a.fast.seconds-b.fast.seconds);
    return routes.find(isPaid)??routes[0];
  };
  const mainland=choose("mainland"),crimea=choose("crimea");
  if(!mainland)return {options:[] as T[],crimeaComparisonVerified:false,crimeaAccepted:false};
  const verified=!!crimea&&mainland.time.verified&&crimea.time.verified;
  const a=mainland.time.specialSeconds,b=crimea?.time.specialSeconds;
  const accepted=verified&&Number.isFinite(a)&&Number.isFinite(b)&&a!>0&&b!>=0&&b!<=a!*0.5;
  const options=accepted?[mainland,crimea!]:[mainland];
  const paid=options.some(isPaid);
  return {options:options.filter(item=>!paid||item.fast.tolls.pricingStatus!=="free"),crimeaComparisonVerified:verified,crimeaAccepted:accepted};
}
