import core from './quote.cjs';
export function matrixM12Component(production, departureAt){
 if(production?.core?.status!=='priced'||!production.tolls)return null;
 const parsed=new Date(departureAt);if(!Number.isFinite(parsed.getTime()))return {tolls:null,reason:'m12_crossing_date_missing'};
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(parsed);
 const ids=production.core.finalMarkers;
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)return {tolls:null,reason:'m12_exact_vector_missing'};
 const sequence=ids.map(km=>'rvp'+km),key=sequence.join('>');
 const result=core.quote({routeId:'selected-fast-route',evidenceComplete:true,components:[{routeId:'selected-fast-route',traversalId:'m12',exactTraversal:true,profileResolved:true,road:'m12-candidate',from:key,to:key,profile:'allDays',localDate:date}]});
 if(result.rub===null)return {tolls:null,reason:'m12_missing_current_vector_or_expired_shali'};
 return {reason:'matrix dated selected-route M12 vector',tolls:{amount:result.rub,weekdayAmount:result.rub,weekendAmount:result.rub,period:'все дни',segments:[`М-12: ${ids.join(' → ')} · Стоимость не подтверждена`],confidence:'matched'}};
}
