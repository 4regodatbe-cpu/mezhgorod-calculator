import {matrixM11HeadComponent} from './m11-head-route-adapter.mjs';
import core from './quote.cjs';
import {departureTariffContext} from './tariff-window.mjs';
import validity from './fare-validity.cjs';
import schedule from '../source-snapshots/m11/order274-calendar-2026-verified.json' with {type:'json'};

// Mainline rules are read from its own order274, independently of the head.
const specialDates=new Set(schedule.friSunDates2026);
export function m11MainlineTariffAt(instant){
 if(!validity.validInstant(instant))return {status:'unknown'};
 const parsed=new Date(instant);
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
 const date=formatter.format(parsed);
 if(!date.startsWith('2026-'))return {status:'unknown'};
 // Each tariff day starts at01:00 Moscow under order274 footnotes3/4.
 const tariffDay=formatter.format(new Date(parsed.getTime()-60*60*1000));
 const day=new Date(tariffDay+'T12:00:00Z').getUTCDay();
 const profile=[0,5,6].includes(day)||specialDates.has(tariffDay)?'friSun':'monThu';
 return {status:'resolved',date,profile};
}

// The native boundary resolver supplies physical directed OD, independently of
// whether its older partial tariff table contains that cell.
/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}|null} */
export function matrixM11Component(production, departureAt, routeSeconds) {
  if (production?.boundaryStatus !== 'resolved' || !production.traversal) return null;
  const fail = reason => ({tolls:null, reason});
  if (production.blockedByMixedRoadEvidence) return fail('m11_mixed_paid_road_evidence');
  if(!validity.validInstant(departureAt))return fail('m11_crossing_time_missing');
  const start = new Date(departureAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(routeSeconds) || routeSeconds < 0) return fail('m11_crossing_date_missing');
  const window=departureTariffContext(departureAt,routeSeconds,m11MainlineTariffAt);
  if(window.status!=='resolved')return fail('m11_'+window.reason);
  const begin=window.begin,profile=begin.profile;
  const {entryPointId:from,exitPointId:to} = production.traversal;
  const component = {routeId:'selected-fast-route',traversalId:'m11',exactTraversal:true,profileResolved:true,road:'m11-58-679',from,to,profile,localDate:begin.date};
  const quote = profile => core.quote({routeId:component.routeId,evidenceComplete:true,components:[{...component,profile}]});
  const actual=quote(profile),weekday=quote('monThu'),weekend=quote('friSun');
  if ([actual,weekday,weekend].some(q=>q.rub===null)) return fail('m11_current_exact_pair_missing');
  return {reason:'matrix dated selected-route M11 direct pair',tolls:{amount:actual.rub,weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',segments:[`М-11: ${from} → ${to} · Стоимость не подтверждена`],confidence:'matched'}};
}

/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null,components:import("../../../lib/toll-engine/route-toll-composition").RouteTollComponent[]}|null} */
export function matrixM11GeometryComponent(production, departureAt = production?.parts?.departureAt ?? production?.parts?.mainlineAt) {
  if (production?.exact !== true || !production.parts) return null;
  const parts = production.parts;
  const tariffAt = departureAt;
  const mainline = matrixM11Component({boundaryStatus:'resolved',traversal:{entryPointId:parts.from,exitPointId:parts.to}},tariffAt,parts.mainlineWindowSeconds??0);
  const head = matrixM11HeadComponent({...parts.head,boundaryStatus:parts.head?'resolved':'unknown'},tariffAt);
  const headDetected=parts.headDetected!==false;
  const components=[
    {id:/** @type {'m11-15-58'} */('m11-15-58'),detected:headDetected,tolls:head.tolls,reason:parts.head?head.reason:'m11_partial_head_entry_boundary_unresolved'},
    {id:/** @type {'m11-58-679'} */('m11-58-679'),detected:true,tolls:mainline?.tolls??null,reason:mainline?.reason??'m11_geometry_pair_missing'},
  ];
  if (!mainline?.tolls || headDetected && !head.tolls) return {tolls:null,components,reason:headDetected&&!head.tolls?head.reason:mainline?.reason??'m11_geometry_pair_missing'};
  const amount=mainline.tolls.amount+(headDetected?head.tolls.amount:0);
  const weekdayAmount=mainline.tolls.weekdayAmount+(headDetected?head.tolls.weekdayAmount:0);
  const weekendAmount=mainline.tolls.weekendAmount+(headDetected?head.tolls.weekendAmount:0);
  if (![amount,weekdayAmount,weekendAmount].every(Number.isSafeInteger)) return {tolls:null,components,reason:'m11_total_amount_invalid'};
  return {components,reason:'matrix M11 distinct head and mainline ready pairs',tolls:{...(headDetected?head.tolls:mainline.tolls),
    amount,weekdayAmount,weekendAmount,segments:[...(headDetected?head.tolls.segments:[]),...mainline.tolls.segments]}};
}
