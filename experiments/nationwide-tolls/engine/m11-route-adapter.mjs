import core from './quote.cjs';

// These dates are flagged by existing 2026 operator/calendar snapshots. They
// are ambiguity guards, not a borrowed tariff schedule for M11 mainline.
const potentialSpecialDates = new Set(['2026-01-01','2026-01-02','2026-01-03','2026-01-04','2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-02-23','2026-03-08','2026-03-09','2026-04-30','2026-05-01','2026-05-09','2026-05-10','2026-05-11','2026-06-11','2026-06-12','2026-11-03','2026-11-04','2026-12-30','2026-12-31']);

// The native boundary resolver supplies physical directed OD, independently of
// whether its older partial tariff table contains that cell.
export function matrixM11Component(production, departureAt, routeSeconds) {
  if (production?.boundaryStatus !== 'resolved' || !production.traversal) return null;
  const fail = reason => ({tolls:null, reason});
  if (production.blockedByMixedRoadEvidence) return fail('m11_mixed_paid_road_evidence');
  if(typeof departureAt!=='string'||!/(?:Z|[+-]\d\d:\d\d)$/.test(departureAt))return fail('m11_crossing_time_missing');
  const start = new Date(departureAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(routeSeconds) || routeSeconds < 0) return fail('m11_crossing_date_missing');
  const local = date => ({
    date:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(date),
    day:new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Moscow',weekday:'short'}).format(date),
  });
  const finish = new Date(start.getTime()+routeSeconds*1000);
  if (!Number.isFinite(finish.getTime())) return fail("m11_crossing_date_invalid");
  const begin = local(start), end = local(finish);
  // Crossing time/holiday refinement belongs to the calendar audit. Do not use
  // a departure profile for a route spanning different local dates.
  if (begin.date !== end.date) return fail('m11_crossing_date_ambiguous');
  if(!begin.date.startsWith('2026-'))return fail('m11_calendar_year_not_verified');
  const profile = ['Fri','Sat','Sun'].includes(begin.day) ? 'friSun' : 'monThu';
  if(profile==='monThu'&&potentialSpecialDates.has(begin.date))return fail('m11_mainline_special_day_schedule_not_verified');
  const {entryPointId:from,exitPointId:to} = production.traversal;
  const component = {routeId:'selected-fast-route',traversalId:'m11',exactTraversal:true,profileResolved:true,road:'m11-58-679',from,to,profile,localDate:begin.date};
  const quote = profile => core.quote({routeId:component.routeId,evidenceComplete:true,components:[{...component,profile}]});
  const actual=quote(profile),weekday=quote('monThu'),weekend=quote('friSun');
  if ([actual,weekday,weekend].some(q=>q.rub===null)) return fail('m11_current_exact_pair_missing');
  return {reason:'matrix dated selected-route M11 direct pair',tolls:{amount:actual.rub,weekdayAmount:weekday.rub,weekendAmount:weekend.rub,period:profile==='monThu'?'понедельник–четверг':'пятница–воскресенье',segments:[`М-11: ${from} → ${to} · Стоимость не подтверждена`],confidence:'matched'}};
}

export function matrixM11GeometryComponent(production) {
  if (production?.exact !== true || !production.parts) return null;
  const parts = production.parts;
  const mainline = matrixM11Component({boundaryStatus:'resolved',traversal:{entryPointId:parts.from,exitPointId:parts.to}},parts.mainlineAt,0);
  if (!mainline?.tolls) return {tolls:null,reason:mainline?.reason ?? 'm11_geometry_pair_missing'};
  if (![parts.headAmount,parts.headWeekday,parts.headWeekend].every(x=>Number.isSafeInteger(x)&&x>=0)) return {tolls:null,reason:'m11_head_amount_invalid'};
  return {reason:'matrix M11 direct mainline pair plus separately proven 15–58 head',tolls:{...mainline.tolls,
    amount:mainline.tolls.amount+parts.headAmount,weekdayAmount:mainline.tolls.weekdayAmount+parts.headWeekday,
    weekendAmount:mainline.tolls.weekendAmount+parts.headWeekend,
    segments:[`М-11 15–58: ${parts.headAmount} ₽ · Стоимость не подтверждена`,...mainline.tolls.segments]}};
}
