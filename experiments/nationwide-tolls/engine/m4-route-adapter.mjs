import core from './quote.cjs';
import endpoints from '../M4_ACTIVE_ENDPOINT_REGISTER.json' with {type:'json'};
const endpointKey=(from,to,profile)=>JSON.stringify([from,to,profile]);
const endpointConflictKeys=new Set(endpoints.unknown.filter(row=>row.reason==='remaining-fare-conflict').map(row=>row.key));
const excludedEndpointKeys=new Set(endpoints.excludedEndpoints.map(row=>row.key));
// Compiled offline: one directed endpoint/profile row. No runtime sums or
// selection among historical chains. Unknown ramp directions stay absent.
const endpointCore=core.createQuoteEngine({selected:[],provisional:endpoints.rows,history:[]});
import {departureTariffContext} from './tariff-window.mjs';
import {m4TariffPeriodAt} from '../../toll-od-matrix/m4-fare-calendar-2026.mjs';
export function matrixM4Component(production, departureAt, routeSeconds){
 const access=production?.roadBoundaries;
 // A selected road transition is useful even when there are no mapped PVPs
 // or no price row. It selects its own directed physical vector, never the
 // nearest booth or an arbitrary 545-a/b operator scope.
 const roadOnly=production?.candidate===true&&production?.exact!==true&&access?.status==='resolved'
   &&access.entry?.kind==='road-transition'&&access.exit?.kind==='road-transition';
 if(!roadOnly&&(production?.exact!==true||(!production.endpointOnly&&!production.tolls)))return null;
 // A289 must remain its own separately evidenced component, not disappear in an M4 replacement.
 if(production.tolls?.segments?.some(s=>s.startsWith('А-289:')))return null;
 const ids=roadOnly?[access.entry.id,access.exit.id]:production.m4PvpPreview?.confirmedPvps;
 if(!Array.isArray(ids)||ids.length<1||new Set(ids).size!==ids.length)return null;
 let tariffVector;
 const unknown=reason=>({tolls:null,reason,priceConfirmation:'unknown',...(tariffVector?{tariffVector:{...tariffVector,priceStatus:'unknown'}}:{})});
 if(!Number.isFinite(routeSeconds)||routeSeconds<0||!Number.isFinite(new Date(departureAt).getTime()))return unknown('m4_crossing_date_missing');
 const window=departureTariffContext(departureAt,routeSeconds,m4TariffPeriodAt);
 if(window.status!=='resolved')return unknown('m4_'+window.reason);
 const start=window.begin;
 const south=['m4-1046','m4-1093','m4-1184','m4-1223'];
 const positions=ids.map(id=>south.indexOf(id));
 const isSouth=!roadOnly&&(production.endpointOnly ? positions.every(x=>x>=0) : positions.length>1&&positions.every(x=>x>=0)&&positions.every((p,i)=>!i||Math.abs(p-positions[i-1])===1));
 const key=ids.join('>');
 const component={routeId:'selected-fast-route',traversalId:'m4',exactTraversal:true,profileResolved:true,road:isSouth?'m4-south':'m4-candidate',from:isSouth?ids[0].slice(3):production.endpointOnly||roadOnly?ids[0]:key,to:isSouth?ids.at(-1).slice(3):production.endpointOnly||roadOnly?ids.at(-1):key,profile:start.profile,localDate:start.date};
 tariffVector={from:component.from,to:component.to,profile:start.profile,selectionBasis:roadOnly?'selected-road-transitions':'confirmed-payment-boundaries'};
 if(production.endpointOnly&&!isSouth&&excludedEndpointKeys.has(endpointKey(component.from,component.to,component.profile)))return unknown('m4_unsupported_paid_endpoint_pair');
 const request=c=>({routeId:'selected-fast-route',evidenceComplete:true,components:[c]});
 const engine=(production.endpointOnly||roadOnly)&&!isSouth?endpointCore:core;
 const actual=engine.quote(request(component));

 const weekday=engine.quote(request({...component,profile:'monThu'})),weekend=engine.quote(request({...component,profile:'friSun'}));
 if(actual.rub===null||weekday.rub===null||weekend.rub===null){
  const reason=endpointConflictKeys.has(endpointKey(component.from,component.to,component.profile))?'ambiguous-fare-version':actual.reason;
  return roadOnly?unknown('m4_road_vector_price_unknown'):production.endpointOnly?unknown('m4_endpoint_matrix_'+reason):null;
 }
 // Source evidence for the full nationwide trip is still incomplete; present replacement as an estimate.
 return {reason:'matrix exact selected-route M4 vector',priceConfirmation:'unconfirmed',tariffVector:{...tariffVector,priceStatus:'known'},tolls:{amount:actual.rub,weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:start.profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',segments:[`М-4: ${ids.join(' → ')} · Стоимость не подтверждена`],confidence:'matched'}};
}
