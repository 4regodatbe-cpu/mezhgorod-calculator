import core from './quote.cjs';
import validity from './fare-validity.cjs';
import snapshot from '../source-snapshots/2026-04-24-15-58-category1.json' with {type:'json'};
import {departureTariffContext} from './tariff-window.mjs';

const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
const timeFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Moscow',hour:'2-digit',hourCycle:'h23'});
/** This concession's own 01:00–06:00 night / 06:00–01:00 day schedule. */
export function m11HeadTariffAt(instant) {
 if(!validity.validInstant(instant))return {status:'unknown'};
 const at=new Date(instant),date=dateFormat.format(at);
 if(!date.startsWith('2026-'))return {status:'unknown'};
 const hour=Number(timeFormat.format(at));
 if(hour>=1&&hour<6)return {status:'resolved',date,profile:'night'};
 const tariffDate=dateFormat.format(new Date(at.getTime()-(hour<1?3600000:0)));
 const day=new Date(tariffDate+'T12:00:00Z').getUTCDay();
 const profile=snapshot.holidayProfileOverrides2026[tariffDate]??(['sun','monThu','monThu','monThu','monThu','fri','sat'][day]);
 return {status:'resolved',date,profile};
}

/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}} */
export function matrixM11HeadComponent(boundary, departureAt = boundary?.paymentAt) {
 const fail=reason=>({tolls:null,reason});
 if(boundary?.boundaryStatus!=='resolved'||!boundary.from||!boundary.to||boundary.from===boundary.to)return fail('m11_head_boundary_unresolved');
 if(!validity.validInstant(departureAt))return fail('m11_head_payment_time_missing');
 const window=departureTariffContext(departureAt,boundary.paymentWindowSeconds,m11HeadTariffAt);
 if(window.status!=='resolved')return fail('m11_head_'+window.reason);
 const component={road:'m11-15-58',productId:'m11-15-58',from:boundary.from,to:boundary.to,
  routeId:'selected-fast-route',traversalId:'m11-head',exactTraversal:true,profileResolved:true};
 const quote=(profile,date=window.begin.date)=>core.quote({routeId:component.routeId,evidenceComplete:true,components:[{...component,profile,localDate:date}]});
 const actual=quote(window.begin.profile),weekday=quote('monThu'),weekends=['fri','sat','sun'].map(p=>quote(p));
 if([actual,weekday,...weekends].some(q=>q.rub===null))return fail('m11_head_current_direct_pair_missing');
 return {reason:'m11_head_ready_direct_pair_at_departure',tolls:{amount:actual.rub,
  weekdayAmount:weekday.rub,weekendAmount:Math.max(...weekends.map(q=>q.rub)),
  period:`по тарифу отправления М-11 15–58 (${window.begin.profile})`,confidence:'matched',
  segments:[`М-11 15–58: ${boundary.from} → ${boundary.to}: ${actual.rub} ₽ · Стоимость не подтверждена`]}};
}
