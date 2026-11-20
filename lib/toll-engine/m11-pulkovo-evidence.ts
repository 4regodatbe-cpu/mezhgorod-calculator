import snapshot from '../../experiments/nationwide-tolls/source-snapshots/m11/2026-10-14-pulkovo-physical-gates.json' with {type:'json'};
import {nearestSegment} from './m11-moscow-geometry';
import type {Coordinate} from './m11-moscow-geometry';

const AIRPORT_GATE_MAX_DISTANCE_KM = 0.025;

/**
 * Positive, direction-sensitive evidence only. An airport gantry is not proof
 * of a mainline tariff, and proximity alone is not a verified traversal.
 * The complete tail tariff remains unknown until an independent paid-edge
 * trace and operator product mapping establish its scope.
 */
export function inspectM11PulkovoAccess(route:readonly Coordinate[]){
 const candidates=snapshot.airportAccessGates.map(gate=>({
  gate,
  match:nearestSegment(route,[[gate.lon,gate.lat]]),
 })).filter(({match})=>Number.isFinite(match.distanceKm)
  && match.distanceKm<=AIRPORT_GATE_MAX_DISTANCE_KM);
 const matched=candidates.map(({gate})=>gate);
 const ambiguous=matched.length>1;
 return {
  candidate:matched.length>0,
  productId:'m11-679-684',
  matchedGateIds:matched.map(gate=>gate.id),
  direction:matched.length===1&&!ambiguous
   ?matched[0].id==='13377945035'?'m11_to_airport':'airport_to_m11'
   :null,
  evidenceStatus:ambiguous?'ambiguous_nearby_gates':matched.length?'candidate_only':'not_detected',
  reason:matched.length
   ?ambiguous?'m11_pulkovo_direction_ambiguous':'m11_pulkovo_paid_product_scope_unresolved'
   :null,
 };
}
