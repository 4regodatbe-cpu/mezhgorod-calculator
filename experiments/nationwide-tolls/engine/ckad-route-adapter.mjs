import core from './quote.cjs';
import validity from './fare-validity.cjs';
import {departureTariffContext} from './tariff-window.mjs';
function dateAt(instant){return validity.validInstant(instant)?{status:'resolved',profile:'allDays',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(instant))}:{status:'unknown'};}
/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}|null} */
export function matrixCkadComponent(production, departureAt, routeSeconds=0) {
  if (production?.exact !== true || !production.traversal) return null;
  if(!validity.validInstant(departureAt))return {tolls:null,reason:'ckad_crossing_date_missing'};
  const window=departureTariffContext(departureAt,routeSeconds,dateAt);
  if(window.status!=='resolved')return {tolls:null,reason:'ckad_'+window.reason};
  const {from,to}=production.traversal;
  const quote=localDate=>core.quote({routeId:'selected-fast-route',evidenceComplete:true,components:[{routeId:'selected-fast-route',traversalId:'ckad',exactTraversal:true,profileResolved:true,road:'ckad',from,to,profile:'allDays',localDate}]});
  const result=quote(window.begin.date);
  if(result.rub===null)return {tolls:null,reason:'ckad_'+result.reason};
  return {reason:'matrix dated selected-route CKAD direct pair',tolls:{amount:result.rub,weekdayAmount:result.rub,weekendAmount:result.rub,period:'все дни',segments:[`ЦКАД: ${from} → ${to} · Стоимость не подтверждена`],confidence:'matched'}};
}
