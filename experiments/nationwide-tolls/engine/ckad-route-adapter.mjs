import core from './quote.cjs';
export function matrixCkadComponent(production, departureAt) {
  if (production?.exact !== true || !production.traversal) return null;
  const date=new Date(departureAt);
  if (!Number.isFinite(date.getTime())) return {tolls:null,reason:'ckad_crossing_date_missing'};
  const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  const {from,to}=production.traversal;
  const result=core.quote({routeId:'selected-fast-route',evidenceComplete:true,components:[{routeId:'selected-fast-route',traversalId:'ckad',exactTraversal:true,profileResolved:true,road:'ckad',from,to,profile:'allDays',localDate}]});
  if(result.rub===null)return {tolls:null,reason:'ckad_current_exact_pair_missing'};
  return {reason:'matrix dated selected-route CKAD direct pair',tolls:{amount:result.rub,weekdayAmount:result.rub,weekendAmount:result.rub,period:'все дни',segments:[`ЦКАД: ${from} → ${to} · Стоимость не подтверждена`],confidence:'matched'}};
}
