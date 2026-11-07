import validity from './fare-validity.cjs';
import april from '../source-snapshots/2026-04-24-15-58-category1.json' with {type:'json'};
import november from '../../../data/tolls/m11/2026-11-02-15-58-category1-no-transponder.json' with {type:'json'};
import {departureTariffContext} from './tariff-window.mjs';

const EDITIONS = [april, november].sort((a,b)=>Date.parse(a.effectiveFrom)-Date.parse(b.effectiveFrom));
const MOSCOW_PARTS = new Intl.DateTimeFormat('en-CA', {
 timeZone:'Europe/Moscow', year:'numeric', month:'2-digit', day:'2-digit', weekday:'short', hour:'2-digit', hourCycle:'h23',
});

function partsAt(instant) {
 const parts=Object.fromEntries(MOSCOW_PARTS.formatToParts(new Date(instant)).map(p=>[p.type,p.value]));
 return {date:`${parts.year}-${parts.month}-${parts.day}`,weekday:parts.weekday,hour:Number(parts.hour)};
}

function editionAt(instant) {
 if (!validity.validInstant(instant)) return null;
 if (!partsAt(instant).date.startsWith('2026-')) return null;
 const timestamp=Date.parse(instant);
 if (timestamp < Date.parse(EDITIONS[0].effectiveFrom)) return null;
 return EDITIONS.findLast(edition=>timestamp>=Date.parse(edition.effectiveFrom)) ?? null;
}

function tariffProfile(edition, instant) {
 const {date,weekday,hour}=partsAt(instant);
 if (hour>=1 && hour<6) return {date,profile:'night'};
 // The operator's tariff day runs from 01:00 through 01:00 next day.
 const tariffDate=hour<1
  ? new Date(Date.parse(`${date}T00:00:00Z`)-86_400_000).toISOString().slice(0,10)
  : date;
 const weekdayForTariffDay=hour<1
  ? new Intl.DateTimeFormat('en-US',{timeZone:'UTC',weekday:'short'}).format(new Date(`${tariffDate}T12:00:00Z`))
  : weekday;
 const override=edition.holidayProfileOverrides2026?.[tariffDate];
 const profile=override ?? (weekdayForTariffDay==='Fri'?'fri':weekdayForTariffDay==='Sat'?'sat':weekdayForTariffDay==='Sun'?'sun':'monThu');
 return {date:tariffDate,profile};
}

function validMatrix(edition) {
 return edition?.systemId==='m11-15-58-ossp' && edition.vehicleCategory?.id==='group1'
  && edition.paymentModel==='without_transponder' && edition.currency==='RUB'
  && edition.extraction?.directional===true && edition.extraction?.routePairCount===42;
}

/** Resolves the official edition and calendar profile at the estimator's timestamp.
 * V3 currently freezes the estimate at departure; the operator selects at exit-PVP passage. */
export function m11HeadTariffAt(instant) {
 const edition=editionAt(instant);
 if (!edition || !validMatrix(edition)) return {status:'unknown'};
 const {date,profile}=tariffProfile(edition,instant);
 return {status:'resolved',date,profile,editionEffectiveFrom:edition.effectiveFrom,systemId:edition.systemId};
}

function directAmount(edition,from,to,profile) {
 if (!validMatrix(edition) || !Object.hasOwn(edition.points ?? {},from) || !Object.hasOwn(edition.points ?? {},to) || from===to) return null;
 const amount=edition.tariffs?.[from]?.[to]?.[profile];
 return Number.isSafeInteger(amount) && amount>=0 ? amount : null;
}

/** @returns {{reason:string,tolls:import("../../../lib/toll-engine/route-toll-composition").RouteTollValue|null}} */
export function matrixM11HeadComponent(boundary, departureAt = boundary?.paymentAt) {
 const fail=reason=>({tolls:null,reason});
 if(boundary?.boundaryStatus!=='resolved'||typeof boundary.from!=='string'||typeof boundary.to!=='string'||boundary.from===boundary.to)return fail('m11_head_boundary_unresolved');
 if(!validity.validInstant(departureAt)||!Number.isFinite(boundary.paymentWindowSeconds??0)||(boundary.paymentWindowSeconds??0)<0)return fail('m11_head_payment_time_missing');
 const window=departureTariffContext(departureAt,boundary.paymentWindowSeconds??0,m11HeadTariffAt);
 if(window.status!=='resolved')return fail(`m11_head_${window.reason}`);
 const edition=editionAt(departureAt);
 if(!edition)return fail('m11_head_tariff_edition_unknown');
 const {from,to}=boundary, profile=window.begin.profile;
 const actual=directAmount(edition,from,to,profile);
 const weekday=directAmount(edition,from,to,'monThu');
 const weekends=['fri','sat','sun'].map(p=>directAmount(edition,from,to,p));
 if(actual===null||weekday===null||weekends.some(v=>v===null))return fail('m11_head_current_direct_pair_missing');
 return {reason:'m11_head_exact_directed_pair_departure_time_estimate',tolls:{
  amount:actual,weekdayAmount:weekday,weekendAmount:Math.max(...weekends),
  period:`оценка по времени отправления М‑11 15–58 (${profile}); оператор применяет тариф при выезде с ПВП`,
  confidence:'matched',
  segments:[`М‑11 15–58: ${from} → ${to}: ${actual} ₽ · по тарифу времени отправления; фактическая ставка зависит от времени выезда с ПВП`],
 }};
}
