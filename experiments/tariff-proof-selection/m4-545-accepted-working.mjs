// Owner-approved working interpretation, 28Oct2026. Component only; not a trip total.
// No app integration, live fetch, route-name matching or benchmark lookup.
import basis from './B05_ACCEPTED_PRICE_BASIS.json' with { type: 'json' };
import { inspectSaved545History } from './m4-545-route-history.mjs';
import { highwayTariffPeriod } from '../../lib/toll-engine/tariff-period.ts';
const keys = ['m4-545-a','m4-545-b'];
function validDate(value) {
  if(typeof value!=='string')return false;
  const m=/^(\d{4}-\d{2}-\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/.exec(value);
  if(!m)return false;
  const date=new Date(`${m[1]}T00:00:00Z`);
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===m[1]&&Number.isFinite(new Date(value).getTime());
}
export function quoteAccepted545Working({ capture, departureAt, alreadyChargedProductKeys,
  operatorCategory='I', payment='cash/card' }={}) {
  const stop=reason=>({status:'unknown',reason,amount:null,isWholeRouteTotal:false});
  if(operatorCategory!=='I'||payment!=='cash/card')return stop('unsupported_vehicle_or_payment');
  if(!validDate(departureAt)||new Date(departureAt)<new Date(basis.source.effectiveFrom))return stop('unsupported_departure');
  if(!Array.isArray(alreadyChargedProductKeys)||alreadyChargedProductKeys.some(k=>typeof k!=='string'))return stop('payment_coverage_context_required');
  if(keys.some(k=>alreadyChargedProductKeys.includes(k)))return stop('overlapping_product_coverage');
  // Existing reviewed directional witness; no city label or amount can replace it.
  const history=inspectSaved545History(capture);
  if(history.historyStatus!=='observed_reviewed_case')return stop(history.reason);
  const rows=keys.map(k=>basis.products.find(p=>p.tariffKey===k));
  if(rows.some(p=>!p||p.operatorCategory!=='I'||![p.rub.monThu,p.rub.friSun].every(n=>Number.isSafeInteger(n)&&n>0)))return stop('missing_tariff_cell');
  const weekdayAmount=rows.reduce((s,p)=>s+p.rub.monThu,0),weekendAmount=rows.reduce((s,p)=>s+p.rub.friSun,0);
  const period=highwayTariffPeriod(departureAt);
  return {status:'accepted_working_calculation',amount:period.weekend?weekendAmount:weekdayAmount,
    weekdayAmount,weekendAmount,period:period.period,coverageKeys:[...keys],isWholeRouteTotal:false,
    operatorCategory,payment,receiptVerified:false,ruleKm:73.9,direction:'northbound',
    source:{rule:'https://avtodor-tr.ru/press-center/news/rezhim-platnosti-vveden-na-uchastke-avtomobilnoy-dorogi-m-4-don-v-obkhod-sela-novaya-usman-i-sela-ro/',
      ruleDate:'2016-12-26',tariffOrder:basis.source.orderNumber,effectiveFrom:basis.source.effectiveFrom,
      tariffSha256:basis.source.sourceSha256,decision:'docs/checkpoints/2026-10-28-owner-best-available-working-truth-APPROVED.md'},
    witness:{gate:'5818209495',exit:'301694367→3057885104→Р-298',traceCallIndex:history.traceCallIndex},
    limitation:'Accepted working component under owner policy; not a receipt or all-road total. Existing Moscow-time weekday/weekend policy preserved; no new holiday-calendar certification.'};
}
