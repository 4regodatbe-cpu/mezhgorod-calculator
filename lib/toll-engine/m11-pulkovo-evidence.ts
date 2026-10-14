import snapshot from '../../experiments/nationwide-tolls/source-snapshots/m11/2026-10-14-pulkovo-physical-gates.json' with {type:'json'};
import {nearestSegment} from './m11-moscow-geometry';
import type {Coordinate} from './m11-moscow-geometry';

/** Positive detection only: neither missing map tags nor a nearby road proves free travel. */
export function inspectM11PulkovoAccess(route:readonly Coordinate[]){
 const matched=snapshot.airportAccessGates.filter(gate=>
  nearestSegment(route,[[gate.lon,gate.lat]]).distanceKm<=0.025);
 return {candidate:matched.length>0,productId:'m11-679-684',
  matchedGateIds:matched.map(gate=>gate.id),
  reason:matched.length?'m11_pulkovo_paid_product_scope_unresolved':null};
}
