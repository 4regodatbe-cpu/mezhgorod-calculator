import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import {resolveCkadEastArcEvidence} from '../toll-engine/ckad-evidence';
import type {TollValidation} from '../toll-validator';
import {inspectCkadM11ToM12} from './ckad-m11-m12-boundary';

/** Reuse the existing east-arc geography without any old section-money gate.
 * Other CKAD pairs need their own physical boundaries; no price is inferred. */
export function resolveCkadProductBoundaries(route:readonly Coordinate[],evidence:M11RoadEvidence|null|undefined,
 validation:TollValidation|null=null) {
 const boundary=resolveCkadEastArcEvidence(route,evidence);
 if(boundary.status!=='verified') {
  if(inspectCkadM11ToM12(route,evidence,validation))return {candidate:true,exact:true,
   traversal:{from:'М-11 Нева',to:'М-12 Восток'},reason:'ckad_complete_directed_m11_to_m12'};
  return {candidate:boundary.candidate,exact:false,traversal:null,reason:boundary.reason};
 }
 return {candidate:true,exact:true,traversal:boundary.direction==='m4_to_m11'
  ?{from:'М-4 Дон',to:'М-11 Нева'}:{from:'М-11 Нева',to:'М-4 Дон'},
  reason:'ckad_selected_east_arc_boundaries_without_native_money'};
}
