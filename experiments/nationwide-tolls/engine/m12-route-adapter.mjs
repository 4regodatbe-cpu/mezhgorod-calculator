import core from './quote.cjs';
import validity from './fare-validity.cjs';
import {departureTariffContext} from './tariff-window.mjs';
import original from '../source-snapshots/m12-2026-03-02-category1.json' with {type:'json'};
const sectionIndex=new Map(original.sections.map((section,i)=>[section.rvpKm,i]));
export function m12PairFromBoundary(boundary){
 if(boundary?.status!=='proven')return null;
 const first=sectionIndex.get(boundary.firstRvpKm),last=sectionIndex.get(boundary.lastRvpKm);
 if(first===undefined||last===undefined||first===last)return null;
 const forward=first<last;
 if(boundary.direction!==(forward?'forward':'reverse'))return null;
 // March marker832 cannot stand in for the October extension's new exit.
 if(Math.max(first,last)===original.sections.length-1)return null;
 return {from:forward?original.sections[first].from:original.sections[first].to,
  to:forward?original.sections[last].to:original.sections[last].from};
}
function dateAt(instant){
 if(!validity.validInstant(instant))return {status:'unknown'};
 return {status:'resolved',profile:'allDays',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(instant))};
}
/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}|null} */
export function matrixM12Component(production, departureAt, routeSeconds=0){
 if(!production)return null;
 const unknown=reason=>({tolls:null,reason});
 if(production.blockedByMixedRoadEvidence)return unknown('m12_mixed_paid_road_evidence');
 if(!validity.validInstant(departureAt))return unknown('m12_crossing_date_missing');
 const window=departureTariffContext(departureAt,routeSeconds,dateAt);
 if(window.status!=='resolved')return unknown('m12_'+window.reason);
 const pair=m12PairFromBoundary(production.boundary??production.core?.boundary);
 if(!pair)return unknown('m12_current_operator_pair_not_bound');
 const quote=date=>core.quote({routeId:'selected-fast-route',evidenceComplete:true,components:[{routeId:'selected-fast-route',traversalId:'m12',exactTraversal:true,profileResolved:true,road:'m12',...pair,profile:'allDays',localDate:date}]});
 const result=quote(window.begin.date);
 if(result.rub===null)return unknown('m12_missing_current_direct_pair');
 return {reason:'matrix dated selected-route M12 directed endpoint pair',tolls:{amount:result.rub,weekdayAmount:result.rub,weekendAmount:result.rub,period:'все дни',segments:[`М-12: ${pair.from} → ${pair.to} · Стоимость не подтверждена`],confidence:'matched'}};
}
