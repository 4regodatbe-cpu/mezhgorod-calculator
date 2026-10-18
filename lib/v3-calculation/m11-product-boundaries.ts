import type {Coordinate} from '../tolls';
import {crossingAt,facilityAnchors,nearestSegment,haversineKm,MOSCOW_M11_ENTRY,
 ENTRY_MAX_DISTANCE_KM,FACILITY_MAX_DISTANCE_KM} from '../toll-engine/m11-moscow-geometry';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import {inspectM11MmkHeadBoundary} from './m11-mmk-head-boundary';
import {inspectM11SouthboundMoscowHead} from './m11-southbound-moscow-head';
import {inspectM11P214Entry} from './m11-p214-entry-boundary';
import {inspectM11P258Exit} from './m11-p258-exit-boundary';
import {inspectM11CkadHeadEntry} from './m11-ckad-head-entry';
import type {TollValidation} from '../toll-validator';

/** Each product has its own outer boundaries. A CKAD entry need not cross
 * Moscow's15-km boundary in order to prove the mainline58→679 pair. */
export function resolveM11ProductBoundaries(route:readonly Coordinate[],routeSeconds:number,departureAt:string,evidence?:M11RoadEvidence|null,validation:TollValidation|null=null) {
 const entry=nearestSegment(route,[MOSCOW_M11_ENTRY]);
 const p58=nearestSegment(route,facilityAnchors('p58'));
 const p679=nearestSegment(route,facilityAnchors('p679'));
 const fullHead=entry.distanceKm<=ENTRY_MAX_DISTANCE_KM;
 const north=p58.index<p679.index;
 const south=p679.index<p58.index;
 const first=evidence?.strictBlocks[0],last=evidence?.strictBlocks.at(-1);
 const start=first?nearestSegment(route,[first.beginCoordinate]):null;
 const end=last?nearestSegment(route,[last.endCoordinate]):null;
 const coversMainline=Boolean(start && end && start.distanceKm<=0.025 && end.distanceKm<=0.025
  && start.index<=Math.min(p58.index,p679.index) && end.index>=Math.max(p58.index,p679.index)
  && !evidence?.malformedStrictCount);
 const partialHead=Boolean(coversMainline && p58.distanceKm<=0.12 && p679.distanceKm<=0.12 && !fullHead && (
  north && first && facilityAnchors('p58').every(anchor=>haversineKm(anchor,first.beginCoordinate)>0.5)
  || south && last && facilityAnchors('p58').every(anchor=>haversineKm(anchor,last.endCoordinate)>0.5)));
 const headDetected=fullHead||partialHead;
 const fullGeometry=fullHead && p58.distanceKm<=FACILITY_MAX_DISTANCE_KM
  && p679.distanceKm<=FACILITY_MAX_DISTANCE_KM
  && (north && entry.index<p58.index || south && p58.index<entry.index);
 // Headless/partial-head entry requires selected-provider strict road evidence
 // plus tighter physical anchors. A long chord or nearby unnamed road cannot
 // authorize this newly supported mainline pair.
 const strictGeometry=!fullHead && coversMainline && p58.distanceKm<=0.12 && p679.distanceKm<=0.12
  && (north||south);
 const geometryResolved=fullGeometry||strictGeometry;
 const mmk=inspectM11MmkHeadBoundary(route);
 const mmkResolved=partialHead && strictGeometry && mmk.boundaryStatus==='resolved' && mmk.gateIndex!==null
  && (north && mmk.from==='mmk_a107' && mmk.gateIndex<p58.index
   || south && mmk.to==='mmk_a107' && mmk.gateIndex>p58.index);
 const ckad=inspectM11CkadHeadEntry(route,validation);
 const ckadResolved=partialHead&&strictGeometry&&north&&ckad.resolved&&ckad.gateIndex!==null&&ckad.gateIndex<p58.index;
 const timeResolved=validity.validInstant(departureAt) && Number.isFinite(routeSeconds) && routeSeconds>0;
 if(!geometryResolved && timeResolved && inspectM11P214Entry(route,evidence,validation)) {
  const moscowHead=inspectM11SouthboundMoscowHead(route,evidence,validation);
  return {
  candidate:true,headDetected:true,resolved:true as const,reason:moscowHead?'m11_p214_p58_and_southbound_moscow_head_proved':'m11_p214_p58_directed_paid_entry_proved',parts:{
   from:'p214',to:'p58',departureAt,mainlineAt:departureAt,mainlineWindowSeconds:0,headDetected:true,
   head:moscowHead?{from:'solnechnogorsk',to:'moscow',paymentAt:departureAt,paymentWindowSeconds:0,timeBasis:'strict_southbound_head_at_departure'}:null,
  },
 };
 }
 if(!geometryResolved && timeResolved && inspectM11P258Exit(route,evidence,validation))return {
  candidate:true,headDetected:false,resolved:true as const,reason:'m11_p679_p258_directed_paid_exit_proved',parts:{
   from:'p679',to:'p258',departureAt,mainlineAt:departureAt,mainlineWindowSeconds:0,headDetected:false,head:null,
  },
 };
 const unresolved={candidate:headDetected||strictGeometry,headDetected,resolved:false as const,parts:null,
  reason:geometryResolved?'m11_exit_payment_time_missing':'m11_outer_boundaries_unresolved'};
 if(!geometryResolved || !timeResolved)return unresolved;
 const departure=new Date(departureAt);
 const p58At=crossingAt(departure,route,p58.index,routeSeconds);
 const p679At=crossingAt(departure,route,p679.index,routeSeconds);
 const exitAt=crossingAt(departure,route,fullHead?entry.index:mmkResolved?mmk.gateIndex!:end?.index??p58.index,routeSeconds);
 const paymentAt=north?p679At:mmkResolved?exitAt:p58At;
 const paymentWindowSeconds=north||mmkResolved?0:Math.max(0,(exitAt.getTime()-p58At.getTime())/1000);
 return {candidate:true,headDetected,resolved:true as const,
  reason:fullHead?'m11_direct_outer_boundaries_with_final_payment_clock':'m11_mainline_outer_pair_independent_of_head_entry',parts:{
   from:north?'p58':'p679',to:north?'p679':'p58',departureAt,mainlineAt:paymentAt.toISOString(),
   mainlineWindowSeconds:paymentWindowSeconds,headDetected,
   head:fullHead||mmkResolved||ckadResolved?{from:fullHead?(north?'moscow':'solnechnogorsk'):ckadResolved?'tskad':mmk.from!,to:fullHead?(north?'solnechnogorsk':'moscow'):ckadResolved?'solnechnogorsk':mmk.to!,
    paymentAt:paymentAt.toISOString(),paymentWindowSeconds,
    timeBasis:north?'adjacent_sections_common_final_p679_exit':mmkResolved?'mmk_north_physical_final_payment_plaza':'moscow_pvp21_exit_within_p58_to_moscow_window'}:null,
  }};
}
