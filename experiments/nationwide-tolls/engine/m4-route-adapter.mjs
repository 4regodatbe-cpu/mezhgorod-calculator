import core from './quote.cjs';
import register from '../TARIFF_SELECTION_REGISTER.json' with {type:'json'};
import reviewed from '../M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json' with {type:'json'};

// Re-index already stored finished prices by outer boundaries. Never add fees
// here. Conflicting endpoint cells remain ambiguous rather than choosing one.
function endpointRegister(input){
 const out={selected:[],provisional:[],history:[]};
 for(const group of Object.keys(out)){
  const seen=new Set();
  for(const row of input[group]){
   if(row.road!=='m4-candidate')continue;
   const vector=row.sectionVector?.flatMap(id=>id.split('+'));
   if(!vector?.length)continue;
   for(const [from,to] of [[vector[0],vector.at(-1)],[vector.at(-1),vector[0]]]){
    const cell={...row,from,to};
    const key=JSON.stringify([from,to,row.profile,row.rub,row.source,row.effectiveFrom,row.effectiveTo,row.validFrom,row.validUntil]);
    if(!seen.has(key)){seen.add(key);out[group].push(cell);}
   }
  }
 }
 const reviewedKeys=new Set();
 for(const cell of reviewed.rows){
  const key=JSON.stringify([cell.road,cell.from,cell.to,cell.profile]);
  if(cell.road!=='m4-candidate'||!['monThu','friSun'].includes(cell.profile)||!Number.isSafeInteger(cell.rub)||cell.rub<0||!cell.source||!cell.observationId||reviewedKeys.has(key))throw Error('invalid_reviewed_m4_endpoint_cell');
  reviewedKeys.add(key);
 }
 for(const group of Object.keys(out))out[group]=out[group].filter(cell=>!reviewedKeys.has(JSON.stringify([cell.road,cell.from,cell.to,cell.profile])));
 out.provisional.push(...reviewed.rows);
 return out;
}
const endpointCore=core.createQuoteEngine(endpointRegister(register));
import {stableTariffWindow} from './tariff-window.mjs';
import {m4TariffPeriodAt} from '../../toll-od-matrix/m4-fare-calendar-2026.mjs';
export function matrixM4Component(production, departureAt, routeSeconds){
 if(production?.exact!==true||(!production.endpointOnly&&!production.tolls))return null;
 // A289 must remain its own separately evidenced component, not disappear in an M4 replacement.
 if(production.tolls?.segments?.some(s=>s.startsWith('А-289:')))return null;
 const ids=production.m4PvpPreview?.confirmedPvps;
 if(!Array.isArray(ids)||ids.length<1||new Set(ids).size!==ids.length)return null;
 const unknown=reason=>({tolls:null,reason,priceConfirmation:'unknown'});
 if(!Number.isFinite(routeSeconds)||routeSeconds<0||!Number.isFinite(new Date(departureAt).getTime()))return unknown('m4_crossing_date_missing');
 const window=stableTariffWindow(departureAt,routeSeconds,m4TariffPeriodAt);
 if(window.status!=='resolved')return unknown('m4_'+window.reason);
 const start=window.begin;
 const south=['m4-1046','m4-1093','m4-1184','m4-1223'];
 const positions=ids.map(id=>south.indexOf(id));
 const isSouth=production.endpointOnly ? positions.every(x=>x>=0) : positions.length>1&&positions.every(x=>x>=0)&&positions.every((p,i)=>!i||Math.abs(p-positions[i-1])===1);
 const key=ids.join('>');
 const component={routeId:'selected-fast-route',traversalId:'m4',exactTraversal:true,profileResolved:true,road:isSouth?'m4-south':'m4-candidate',from:isSouth?ids[0].slice(3):production.endpointOnly?ids[0]:key,to:isSouth?ids.at(-1).slice(3):production.endpointOnly?ids.at(-1):key,profile:start.profile,localDate:start.date};
 const request=c=>({routeId:'selected-fast-route',evidenceComplete:true,components:[c]});
 const engine=production.endpointOnly&&!isSouth?endpointCore:core;
 const actual=engine.quote(request(component));
 // Every crossed date must select the same applicable fare/source. A version
 // expiry/change cannot revive a native departure-date fallback.
 if(actual.rub!==null)for(const date of window.dates){
  const day=engine.quote(request({...component,localDate:date}));
  if(day.rub!==actual.rub||JSON.stringify(day.components.map(c=>c.source))!==JSON.stringify(actual.components.map(c=>c.source)))return unknown('m4_crossing_fare_version_changes');
 }

 const weekday=engine.quote(request({...component,profile:'monThu'})),weekend=engine.quote(request({...component,profile:'friSun'}));
 if(actual.rub===null||weekday.rub===null||weekend.rub===null)return production.endpointOnly?unknown('m4_endpoint_matrix_'+actual.reason):null;
 // Source evidence for the full nationwide trip is still incomplete; present replacement as an estimate.
 return {reason:'matrix exact selected-route M4 vector',priceConfirmation:'unconfirmed',tolls:{amount:actual.rub,weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:start.profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',segments:[`М-4: ${ids.join(' → ')} · Стоимость не подтверждена`],confidence:'matched'}};
}
