import validity from './fare-validity.cjs';

/** User policy (2026-10-15): freeze the whole estimate at departure.
 * Road calendars and fare validity still apply at that instant. Arrival,
 * payment clocks and later profile/version changes do not reprice the trip. */
export function departureTariffContext(departureAt, routeSeconds, resolve) {
 const fail=reason=>({status:'unknown',reason});
 if(!validity.validInstant(departureAt)||!Number.isFinite(routeSeconds)||routeSeconds<0)return fail('crossing_date_missing');
 // Reject an impossible duration without inspecting later tariff profiles.
 if(!Number.isFinite(new Date(new Date(departureAt).getTime()+routeSeconds*1000).getTime()))return fail('crossing_date_invalid');
 const begin=resolve(departureAt);
 if(begin.status!=='resolved')return fail('crossing_calendar_unresolved');
 return {status:'resolved',begin};
}
