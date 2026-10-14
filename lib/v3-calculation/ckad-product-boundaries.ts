import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import {resolveCkadEastArcEvidence} from '../toll-engine/ckad-evidence';

/** Reuse the existing east-arc geography without any old section-money gate.
 * Other CKAD pairs need their own physical boundaries; no price is inferred. */
export function resolveCkadProductBoundaries(route:readonly Coordinate[],evidence:M11RoadEvidence|null|undefined) {
 const boundary=resolveCkadEastArcEvidence(route,evidence);
 if(boundary.status!=='verified')return {candidate:boundary.candidate,exact:false,traversal:null,reason:boundary.reason};
 return {candidate:true,exact:true,traversal:boundary.direction==='m4_to_m11'
  ?{from:'М-4 Дон',to:'М-11 Нева'}:{from:'М-11 Нева',to:'М-4 Дон'},
  reason:'ckad_selected_east_arc_boundaries_without_native_money'};
}
