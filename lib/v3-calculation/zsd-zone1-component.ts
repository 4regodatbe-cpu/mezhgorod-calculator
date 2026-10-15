import snapshot from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json' with {type:'json'};
import quoteCore from '@/experiments/nationwide-tolls/engine/quote.cjs';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import {nearestSegment,haversineKm} from '../toll-engine/m11-moscow-geometry';
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import type {RouteTollValue} from '../toll-engine/route-toll-composition';
const engine=quoteCore.createQuoteEngine({selected:snapshot.rows,history:[],provisional:[]});
const reviewed=new Set(snapshot.ways.map(w=>w.id));
const nodes=new Set(snapshot.boothNodeIds);
const zsd=/(?:^|[^а-яa-z0-9])зсд(?=$|[^а-яa-z0-9])|западный скоростной диаметр/iu;
const named=(names:readonly string[])=>names.some(name=>name.trim().toUpperCase()==='ЗСД'||zsd.test(name));

/** One ready zonal tariff, never a known-zone subtotal of a larger ZSD trip. */
export function matrixZsdZone1Component(route:readonly Coordinate[],validation:TollValidation|null,date:string,seconds:number):{tolls:RouteTollValue|null;reason:string} {
 const fail=(reason:string)=>({tolls:null,reason});
 if(validation?.complete!==true||validation.boothEventCoverage!=='complete')return fail('zsd_complete_selected_trace_missing');
 if(!validation.paidRoadEdges)return fail('zsd_paid_way_scope_missing');
 const edges=validation.paidRoadEdges.filter(edge=>named(edge.roadNames));
 if(!edges.length)return fail('zsd_named_paid_way_scope_missing');
 if(edges.some(edge=>!edge.wayId||!reviewed.has(edge.wayId)))return fail('zsd_trip_extends_outside_reviewed_zone1');
 const booths=(validation.tollBooths??[]).filter(b=>nodes.has(b.osmNodeId??''));
 const unique=new Set(booths.map(b=>b.osmNodeId));
 if(unique.size!==1||booths.some(b=>b.edgeToll!==true))return fail('zsd_zone1_directional_paid_booth_missing');
 if((validation.tollBooths??[]).some(b=>named(b.roadNames)&&!nodes.has(b.osmNodeId??'')))return fail('zsd_additional_unbound_paid_booth');
 const g=snapshot.gates.find(g=>g.gate.id===[...unique][0])!;
 const point=(n:{lon:number;lat:number}):Coordinate=>[n.lon,n.lat];
 const gate=nearestSegment(route,[point(g.gate)]),before=nearestSegment(route,[point(g.before)]),after=nearestSegment(route,[point(g.after)]);
 const index=Math.floor(gate.index);
 if(index<0||index>=route.length-1||haversineKm(route[index],route[index+1])>2
  ||gate.distanceKm>0.025||before.distanceKm>0.025||after.distanceKm>0.025
  ||!(before.index<gate.index&&gate.index<after.index))return fail('zsd_zone1_directional_geometry_unresolved');
 if(!validity.validInstant(date)||!Number.isFinite(seconds)||seconds<=0)return fail('zsd_zone1_payment_time_missing');
 // The trip departure date is the tariff date, even when this gate is reached later.
 const at=new Date(date);
 const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
 const result=engine.quote({routeId:'selected-fast-route',evidenceComplete:true,components:[{
  routeId:'selected-fast-route',traversalId:'zsd-zone1',road:'zsd',productId:'zsd',from:'zone-1',to:'zone-1',
  profile:'allDays',localDate,exactTraversal:true,profileResolved:true}]});
 if(result.rub===null)return fail('zsd_zone1_current_base_fare_missing');
 return {reason:'zsd_zone1_complete_directed_base_tariff',tolls:{amount:result.rub,weekdayAmount:result.rub,weekendAmount:result.rub,
  period:'все дни, без транспондера',confidence:'matched',segments:['ЗСД: тарифная зона 1 · '+result.rub+' ₽']}};
}
