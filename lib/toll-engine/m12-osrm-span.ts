import {deriveStrictM12Span, type M12SpanCoordinate} from './m12-valhalla-span';
import type {M11OsrmLeg} from './m11-road-evidence-types';
const ref = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*12(?:[^0-9A-ZА-Я]|$)/iu;
const same = (a:M12SpanCoordinate,b:M12SpanCoordinate) => a[0]===b[0]&&a[1]===b[1];
const normalize = (points:M12SpanCoordinate[]) => points.filter((p,i)=>!i||!same(p,points[i-1]));
/** OSRM step geometry must reproduce the exact selected overview geometry.
 * Destinations are deliberately excluded; disjoint traversals stay unresolved. */
export function deriveM12FromOsrm(legs:M11OsrmLeg[],overview:M12SpanCoordinate[]) {
 const candidate=legs.some(l=>l.steps?.some(s=>ref.test(s.ref?.trim() || s.name || '')));
 const fail=(reason:string)=>({candidate,span:null,endpointSpan:null,reason});
 if(!candidate)return {candidate:false,span:null,endpointSpan:null,reason:null};
 const shape:M12SpanCoordinate[]=[],maneuvers:Array<{street_names:string[];begin_shape_index:number;end_shape_index:number}>=[];
 for(const leg of legs)for(const step of leg.steps??[]){
  const points=step.geometry?.coordinates;
  if(!Array.isArray(points)||!points.length||points.some(p=>p.length!==2||!p.every(Number.isFinite)))return fail('m12_osrm_step_geometry_invalid');
  const coordinates=normalize(points);
  if(shape.length&&!same(shape.at(-1)!,coordinates[0]))return fail('m12_osrm_steps_disconnected');
  const begin=shape.length?shape.length-1:0;
  shape.push(...(shape.length?coordinates.slice(1):coordinates));
  const label=step.ref?.trim() || step.name || '';
  if(ref.test(label))maneuvers.push({street_names:[label],begin_shape_index:begin,end_shape_index:shape.length-1});
 }
 const exact=normalize(overview);
 if(exact.length!==shape.length||shape.some((p,i)=>!same(p,exact[i])))return fail('m12_osrm_overview_not_bound_to_steps');
 const span=deriveStrictM12Span([{coordinates:shape,maneuvers}]);
 return {candidate,span,endpointSpan:deriveStrictM12Span([{coordinates:shape,maneuvers}],true),reason:span?null:'m12_disconnected_or_malformed_strict_span'};
}
