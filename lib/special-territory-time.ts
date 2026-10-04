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
      const expectedSpecial = expected[i] !== null;
      const opposingMeters = split.pieces.filter(piece => (piece.territory !== null) !== expectedSpecial).reduce((sum, piece) => sum + piece.meters, 0);
      if (opposingMeters > 1) throw new Error("LEG_CROSSES_ZONE");
      seconds += leg.seconds; meters += leg.meters;
      // Count a boundary-jitter leg wholly as special: this is an upper bound, never a proportional estimate.
      if (expectedSpecial || split.pieces.some(piece => piece.territory !== null)) specialSeconds += leg.seconds;
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
    const groups: Array<{ first: GeoPoint; last: GeoPoint; meters: number; territory: SpecialTerritoryId | null }> = [];
    for (const piece of split.pieces) {
      const first = piece.coordinates[0], last = piece.coordinates.at(-1)!;
      const previous = groups.at(-1);
      if (previous && Boolean(previous.territory) === Boolean(piece.territory)) {
        previous.last = last;
        previous.meters += piece.meters;
        previous.territory ??= piece.territory;
      } else groups.push({ first, last, meters: piece.meters, territory: piece.territory });
    }
    // Boundary coordinates can create sub-meter fragments. Fold them into a neighboring request
    // leg and classify the whole leg as special if either side is special, yielding a safe time upper bound.
    for (let i = 0; i < groups.length;) {
      if (groups[i].meters >= 1 || groups.length === 1) { i += 1; continue; }
      const target = i > 0 ? i - 1 : 1;
      const tiny = groups[i], neighbor = groups[target];
      if (target < i) {
        neighbor.last = tiny.last;
      } else {
        neighbor.first = tiny.first;
      }
      neighbor.meters += tiny.meters;
      groups.splice(i, 1);
      if (target < i) i = Math.max(0, i - 1);
    }
    for (const group of groups) {
      if (!positions.length) positions.push({ lng:group.first[0], lat:group.first[1] });
      positions.push({ lng:group.last[0], lat:group.last[1] }); expected.push(group.territory);
    }
  }
  if (!expected.length || positions.length > 48) throw new Error("TIMING_WAYPOINT_LIMIT");
  return { positions, expected };
}

export type TimedCandidate = { corridor:"mainland"|"crimea"; provider:string; fast:{seconds:number;tollValidation?:{status:string};tolls:{pricingStatus:"priced"|"free"|"unknown"}} };
export function selectTimedTerritoryOptions<T extends TimedCandidate>(candidates:T[],preferredCorridor:"mainland"|"crimea"="mainland"){
 const isPaid=(item:T)=>item.fast.tolls.pricingStatus==="priced"||item.fast.tollValidation?.status==="toll";
 const eligible=candidates.filter(item=>item.corridor===preferredCorridor);
 const options=[...eligible].sort((a,b)=>Number(isPaid(b))-Number(isPaid(a))||a.fast.seconds-b.fast.seconds).slice(0,1);
 return {options,preferredCorridor,routePolicy:"geographic-zone" as const};
}
