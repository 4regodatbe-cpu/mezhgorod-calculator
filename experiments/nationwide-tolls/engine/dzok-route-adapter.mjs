import core from './quote.cjs';
import validity from './fare-validity.cjs';
import {stableTariffWindow} from './tariff-window.mjs';
import {m4TariffPeriodAt} from '../../toll-od-matrix/m4-fare-calendar-2026.mjs';

/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}} */
export function matrixDzokComponent(evidence,departureAt,routeSeconds) {
 const unknown=reason=>({tolls:null,reason});
 if(evidence?.boundaryStatus!=='resolved'||!['0>51','51>0'].includes(evidence.from+'>'+evidence.to))return unknown('dzok_payment_boundary_unresolved');
 if(!validity.validInstant(departureAt))return unknown('dzok_crossing_date_missing');
 const window=stableTariffWindow(departureAt,routeSeconds,m4TariffPeriodAt);
 if(window.status!=='resolved')return unknown('dzok_'+window.reason);
 const component={road:'m4-dzok',productId:'krasnodar-west-bypass',from:evidence.from,to:evidence.to,
  routeId:'selected-fast-route',traversalId:'dzok',exactTraversal:true,profileResolved:true,localDate:window.begin.date};
 const quote=(profile,date=component.localDate)=>core.quote({routeId:component.routeId,evidenceComplete:true,components:[{...component,profile,localDate:date}]});
 const actual=quote(window.begin.profile),weekday=quote('monThu'),weekend=quote('friSun');
 if([actual,weekday,weekend].some(q=>q.rub===null))return unknown('dzok_current_exact_pair_missing');
 for(const date of window.dates){
  const day=quote(window.begin.profile,date);
  if(day.rub!==actual.rub||JSON.stringify(day.components.map(c=>c.source))!==JSON.stringify(actual.components.map(c=>c.source)))return unknown('dzok_crossing_fare_version_changes');
 }
 return {reason:'dzok_ready_matrix_pair_unconfirmed_route_binding',tolls:{amount:actual.rub,
  weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:window.begin.profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',
  confidence:'matched',segments:[`М-4: Дальний западный обход Краснодара: ${component.from} → ${component.to}: ${actual.rub} ₽ · Стоимость не подтверждена`]}};
}
