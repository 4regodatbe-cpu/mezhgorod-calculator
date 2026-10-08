// Safe offline calendar profile lookup for M4. Does not infer tariff on an undocumented date.
// Operator 2026 listed deviations from normal weekday tariff + fixed Russian national holidays.
// Do not use for other years without separately verified official schedules.
function m4TariffPeriodAt(instant){
  const unknown=reason=>({status:"unknown",reason,date:null,profile:null,timezone:"Europe/Moscow"});
  if(typeof instant!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(instant))return unknown("timestamp_missing_explicit_utc_offset");
  const parsed=new Date(instant);
  if(!Number.isFinite(parsed.getTime()))return unknown("invalid_timestamp");
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Moscow",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(parsed);
  const piece=k=>parts.find(p=>p.type===k)?.value;
  const date=[piece("year"),piece("month"),piece("day")].join("-");
  if(!/^2026-\d\d-\d\d$/.test(date))return unknown("calendar_year_not_verified");
  const day=new Date(date+"T12:00:00Z").getUTCDay();
  if(!Number.isInteger(day))return unknown("date_invalid");
  const month=Number(date.slice(5,7)),monthDay=date.slice(5);
  const fixed=(month===1&&Number(date.slice(8))<=8)||["02-23","03-08","05-01","05-09","06-12","11-04"].includes(monthDay);
  const operatorExceptions=new Set(["2026-03-09","2026-04-30","2026-05-11","2026-06-11","2026-11-03","2026-12-30","2026-12-31"]);
  const profile=day===0||day===5||day===6||fixed||operatorExceptions.has(date)?"friSun":"monThu";
  return {status:"resolved",reason:null,date,profile,timezone:"Europe/Moscow",calendarSource:"avtodor_tr_tariff_page_2026"};
}
export {m4TariffPeriodAt};
