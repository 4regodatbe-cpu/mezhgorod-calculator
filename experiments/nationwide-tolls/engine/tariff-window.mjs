/** Check every Moscow civil day, not just the endpoints of a trip.
 * Midnight is not a tariff change when profile and applicable source stay the same. */
export function stableTariffWindow(departureAt, routeSeconds, resolve) {
 const fail=reason=>({status:'unknown',reason});
 const beginMs=new Date(departureAt).getTime();
 if(!Number.isFinite(beginMs)||!Number.isFinite(routeSeconds)||routeSeconds<0)return fail('crossing_date_missing');
 const endMs=beginMs+routeSeconds*1000;
 if(!Number.isFinite(new Date(endMs).getTime()))return fail('crossing_date_invalid');
 const begin=resolve(departureAt),end=resolve(new Date(endMs).toISOString());
 if(begin.status!=='resolved'||end.status!=='resolved')return fail('crossing_calendar_unresolved');
 const dates=[];
 const first=new Date(begin.date+'T12:00:00Z').getTime(),last=new Date(end.date+'T12:00:00Z').getTime();
 if(!Number.isFinite(first)||!Number.isFinite(last)||last<first||last-first>366*86400000)return fail('crossing_calendar_unresolved');
 for(let ms=first;ms<=last;ms+=86400000){
  const date=new Date(ms).toISOString().slice(0,10);
  const day=resolve(date+'T12:00:00+03:00');
  if(day.status!=='resolved'||day.profile!==begin.profile)return fail('crossing_profile_changes');
  dates.push(date);
 }
 return {status:'resolved',begin,end,dates};
}
