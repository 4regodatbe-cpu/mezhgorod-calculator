import type {Coordinate} from '../tolls';
import {crossingAt,facilityAnchors,nearestSegment,MOSCOW_M11_ENTRY,
 ENTRY_MAX_DISTANCE_KM,FACILITY_MAX_DISTANCE_KM} from '../toll-engine/m11-moscow-geometry';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';

/** V3 uses the two outer mainline boundaries. No intermediate p593 check or
 * old native fare is a prerequisite. All times remain route ETA estimates. */
export function resolveM11ProductBoundaries(route:readonly Coordinate[],routeSeconds:number,departureAt:string) {
 const entry=nearestSegment(route,[MOSCOW_M11_ENTRY]);
 const p58=nearestSegment(route,facilityAnchors('p58'));
 const p679=nearestSegment(route,facilityAnchors('p679'));
 const headDetected=entry.distanceKm<=ENTRY_MAX_DISTANCE_KM;
 const north=entry.index<p58.index && p58.index<p679.index;
 const south=p679.index<p58.index && p58.index<entry.index;
 const geometryResolved=headDetected && p58.distanceKm<=FACILITY_MAX_DISTANCE_KM
  && p679.distanceKm<=FACILITY_MAX_DISTANCE_KM && (north || south);
 const timeResolved=validity.validInstant(departureAt) && Number.isFinite(routeSeconds) && routeSeconds>0;
 const unresolved={candidate:headDetected,headDetected,resolved:false as const,parts:null,
  reason:geometryResolved?'m11_exit_payment_time_missing':'m11_outer_boundaries_unresolved'};
 if(!geometryResolved || !timeResolved)return unresolved;
 const start=new Date(departureAt);
 const p58At=crossingAt(start,route,p58.index,routeSeconds);
 const p679At=crossingAt(start,route,p679.index,routeSeconds);
 const entryAt=crossingAt(start,route,entry.index,routeSeconds);
 // The rules use a common final payment exit for adjacent sections. North:
 // known p679 exit. South: Moscow PVP21 lies between p58 and the 15-km end;
 // until its exact anchor is bound, every possible payment time must agree.
 const paymentAt=north?p679At:p58At;
 const paymentWindowSeconds=north?0:(entryAt.getTime()-p58At.getTime())/1000;
 return {candidate:true,headDetected:true,resolved:true as const,
  reason:'m11_direct_outer_boundaries_with_final_payment_clock',parts:{
   from:north?'p58':'p679',to:north?'p679':'p58',mainlineAt:paymentAt.toISOString(),
   mainlineWindowSeconds:paymentWindowSeconds,
   head:{from:north?'moscow':'solnechnogorsk',to:north?'solnechnogorsk':'moscow',
    paymentAt:paymentAt.toISOString(),paymentWindowSeconds,
    timeBasis:north?'adjacent_sections_common_final_p679_exit':'moscow_pvp21_exit_within_p58_to_moscow_window'},
  }};
}
