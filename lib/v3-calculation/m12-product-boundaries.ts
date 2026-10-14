import snapshot from '../../data/tolls/m12-2026-03-02-category1.json' with {type:'json'};
import {DIRECT_CROSSING_RADIUS_KM,proveBoundaries} from '../toll-engine/m12-route-evidence';
import {projectM12Evidence} from '../toll-engine/m12-route-projection';
import {haversineKm} from '../toll-engine/m11-moscow-geometry';
import type {M12BoundaryCheck,M12EvaluationInput,M12StrictSpan} from '../toll-engine/m12-route-types';
import type {Coordinate} from '../tolls';

const knownMarkers=new Set(snapshot.sections.map(s=>s.rvpKm));
export type M12ProductBoundaryResult={boundary:M12BoundaryCheck;reason:string;directMarkers:number[]};

/** Outer-boundary proof only: no intermediate continuity, inferred markers or
 * money. The route provider's endpoint span is for this selected geometry. */
export function evaluateM12ProductBoundaries(input:M12EvaluationInput):M12ProductBoundaryResult {
 const invalid= input.projections.some(p=>!knownMarkers.has(p.rvpKm)
  || !Number.isFinite(p.chainageKm) || p.chainageKm<0
  || !Number.isFinite(p.nearestDistanceKm) || p.nearestDistanceKm<0);
 const direct=invalid?[]:input.projections
  .filter(p=>p.nearestDistanceKm<=DIRECT_CROSSING_RADIUS_KM)
  .map(p=>({...p,crossed:true as const}))
  .sort((a,b)=>a.chainageKm-b.chainageKm);
 const outer=direct.length>=2?[direct[0],direct.at(-1)!]:direct;
 const boundary=proveBoundaries(outer,input.strictM12Span);
 return {boundary,directMarkers:direct.map(p=>p.rvpKm),
  reason:invalid?'m12_invalid_projected_boundary_evidence':boundary.status==='proven'
   ?'m12_direct_outer_boundaries_without_native_money':boundary.reason??'m12_outer_boundaries_unresolved'};
}

export function resolveM12ProductBoundaries(route:Coordinate[],span:M12StrictSpan|null|undefined):M12ProductBoundaryResult {
 const unknown=(reason:string)=>({...evaluateM12ProductBoundaries({projections:[],strictM12Span:null}),reason});
 if(route.length<2 || route.some(p=>p.length!==2 || !p.every(Number.isFinite)
  || Math.abs(p[0])>180 || Math.abs(p[1])>90))return unknown('m12_route_geometry_invalid');
 const routeKm=route.slice(1).reduce((sum,p,i)=>sum+haversineKm(route[i],p),0);
 if(!Number.isFinite(routeKm) || !span || !Number.isFinite(span.beginKm) || !Number.isFinite(span.endKm)
  || span.beginKm<0 || span.endKm<=span.beginKm || span.endKm>routeKm+0.005)return unknown('m12_selected_endpoint_span_invalid');
 return evaluateM12ProductBoundaries({projections:projectM12Evidence(route),strictM12Span:span});
}
