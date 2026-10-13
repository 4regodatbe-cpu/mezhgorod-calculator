import core from './quote.cjs';
import {m4TariffPeriodAt} from '../../toll-od-matrix/m4-fare-calendar-2026.mjs';
export function matrixM4Component(production, departureAt, routeSeconds){
 if(production?.exact!==true||!production.tolls)return null;
 // A289 must remain its own separately evidenced component, not disappear in an M4 replacement.
 if(production.tolls.segments?.some(s=>s.startsWith('А-289:')))return null;
 const ids=production.m4PvpPreview?.confirmedPvps;
 if(!Array.isArray(ids)||ids.length<1||new Set(ids).size!==ids.length)return null;
 if(!Number.isFinite(routeSeconds)||routeSeconds<0||!Number.isFinite(new Date(departureAt).getTime()))return null;
 const start=m4TariffPeriodAt(departureAt),end=m4TariffPeriodAt(new Date(new Date(departureAt).getTime()+routeSeconds*1000).toISOString());
 if(start.status!=='resolved'||end.status!=='resolved'||start.profile!==end.profile||start.date!==end.date)return null;
 const south=['m4-1046','m4-1093','m4-1184','m4-1223'];
 const positions=ids.map(id=>south.indexOf(id));
 const isSouth=positions.length>1&&positions.every(x=>x>=0)&&positions.every((p,i)=>!i||Math.abs(p-positions[i-1])===1);
 const key=ids.join('>');
 const component={routeId:'selected-fast-route',traversalId:'m4',exactTraversal:true,profileResolved:true,road:isSouth?'m4-south':'m4-candidate',from:isSouth?ids[0].slice(3):key,to:isSouth?ids.at(-1).slice(3):key,profile:start.profile,localDate:start.date};
 const request=c=>({routeId:'selected-fast-route',evidenceComplete:true,components:[c]});
 const actual=core.quote(request(component));
 const weekday=core.quote(request({...component,profile:'monThu'})),weekend=core.quote(request({...component,profile:'friSun'}));
 if(actual.rub===null||weekday.rub===null||weekend.rub===null)return null;
 // Source evidence for the full nationwide trip is still incomplete; present replacement as an estimate.
 return {reason:'matrix exact selected-route M4 vector',priceConfirmation:'unconfirmed',tolls:{amount:actual.rub,weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:start.profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',segments:[`М-4: ${ids.join(' → ')} · Стоимость не подтверждена`],confidence:'matched'}};
}
