import snapshot from '../../experiments/nationwide-tolls/source-snapshots/dzok/2026-10-14-pvp46-physical-gates.json' with {type:'json'};
import {haversineKm, nearestSegment} from './m11-moscow-geometry';
import type {Coordinate} from '../tolls';

/** Directional routing controls on the paid carriageway, not a city-centre via. */
export function krasnodarBypassControls(towardsM4:boolean) {
 const gate=snapshot.gates.find(g=>g.from===(towardsM4?'51':'0') && g.to===(towardsM4?'0':'51'))!;
 return [gate.before,gate.gate,gate.after].map(p=>({lat:p.lat,lng:p.lon}));
}

/** One open-system plaza, charged once. Long straight chords and a city/road
 * label alone cannot prove crossing its directional carriageway. */
export function inspectKrasnodarBypass(route:readonly Coordinate[]) {
 const point=(node:{lon:number;lat:number}):Coordinate=>[node.lon,node.lat];
 const hits=snapshot.gates.filter(g=>nearestSegment(route,[point(g.gate)]).distanceKm<=0.025);
 const bound=hits.filter(g=>{
  const gate=nearestSegment(route,[point(g.gate)]);
  const before=nearestSegment(route,[point(g.before)]),after=nearestSegment(route,[point(g.after)]);
  const index=Math.min(Math.floor(gate.index),route.length-2);
  return index>=0 && haversineKm(route[index],route[index+1])<=2
   && before.distanceKm<=0.025 && after.distanceKm<=0.025
   && before.index<gate.index && gate.index<after.index;
 });
 const unique=new Map(bound.map(g=>[g.from+'>'+g.to,g]));
 const chosen=unique.size===1?[...unique.values()][0]:null;
 return {candidate:hits.length>0,matchedGateIds:hits.map(g=>g.gate.id),
  boundaryStatus:chosen?'resolved' as const:'unknown' as const,
  from:chosen?.from??null,to:chosen?.to??null,
  reason:chosen?'dzok_directional_plaza_crossing':hits.length?'dzok_directional_crossing_unresolved':'dzok_no_physical_crossing'};
}
