import snapshot from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json' with {type:'json'};
import {nearestSegment,haversineKm} from '../toll-engine/m11-moscow-geometry';
import type {Coordinate} from '../tolls';

/** Exact directed booth lane, independently identified as MMK(A107).
 * Nearby CKAD labels cannot select this tariff point. */
export function inspectM11MmkHeadBoundary(route:readonly Coordinate[]) {
 const point=(node:{lon:number;lat:number}):Coordinate=>[node.lon,node.lat];
 const hits=snapshot.gates.filter(g=>nearestSegment(route,[point(g.gate)]).distanceKm<=0.025);
 const bound=hits.filter(g=>{
  const gate=nearestSegment(route,[point(g.gate)]),before=nearestSegment(route,[point(g.before)]),after=nearestSegment(route,[point(g.after)]);
  const index=Math.floor(gate.index);
  return index>=0 && index<route.length-1 && haversineKm(route[index],route[index+1])<=2
   && before.distanceKm<=0.025 && after.distanceKm<=0.025 && before.index<gate.index && gate.index<after.index;
 });
 const chosen=bound.length===1?bound[0]:null;
 return {candidate:hits.length>0,boundaryStatus:chosen?'resolved' as const:'unknown' as const,
  from:chosen?.from??null,to:chosen?.to??null,
  gateIndex:chosen?nearestSegment(route,[point(chosen.gate)]).index:null,
  matchedGateIds:hits.map(g=>g.gate.id),reason:chosen?'m11_mmk_directed_paid_plaza':'m11_mmk_directional_crossing_unresolved'};
}
