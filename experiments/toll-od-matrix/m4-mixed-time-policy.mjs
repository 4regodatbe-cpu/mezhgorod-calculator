// Diagnostic mixed-zone context only: use timestamps on SAME validated selected route.
// Operator pages disagree on 633-672 grace limit (60 vs 120 mins) as of 2026-10-09.
// Only values on which both published rules agree are classified.
function deriveM4MixedStatus(confirmedPvps,pvpPassageTimes,routeId,direction){
 const unknown=reason=>({status:"unknown",reason,mixedContext:null});
 if(!Array.isArray(confirmedPvps)||!Array.isArray(pvpPassageTimes)||confirmedPvps.length!==pvpPassageTimes.length||!routeId||!["to_moscow","to_krasnodar"].includes(direction))return unknown("missing_same_route_events");
 const times=new Map();
 let previous=-Infinity;
 for(let i=0;i<confirmedPvps.length;i++){
  const e=confirmedPvps[i],t=pvpPassageTimes[i];
  if(!e||!t||e.routeId!==routeId||t.routeId!==routeId||e.direction!==direction||t.pvpId!==e.pvpId||!e.pvpId||times.has(e.pvpId))return unknown("unmatched_or_duplicate_pvp_event");
  const when=t.at;
  if(typeof when!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(when))return unknown("timestamp_missing_offset");
  const ms=Date.parse(when);
  if(!Number.isFinite(ms)||ms<=previous)return unknown("nonmonotonic_actual_crossing_times");
  previous=ms;times.set(e.pvpId,ms);
 }
 function zone(a,b,limits){
  const hasA=times.has(a),hasB=times.has(b);
  if(!hasA&&!hasB)return {value:"not_used"};
  if(!hasA||!hasB)return {reason:"unpaired_mixed_zone_gate"};
  const idxA=confirmedPvps.findIndex(x=>x.pvpId===a),idxB=confirmedPvps.findIndex(x=>x.pvpId===b);
  if(direction==="to_moscow" ? idxA<idxB : idxA>idxB)return {reason:"mixed_zone_direction_mismatch"};
  const minutes=Math.abs(times.get(a)-times.get(b))/60000;
  if(minutes<=limits.safeWithin)return {value:"within_limit"};
  if(minutes>limits.sureExceed)return {value:"exceeded_limit"};
  return {reason:"conflicting_official_mixed_633_limit_60_vs_120"};
 }
 // 401–464: 12-hour grace window agreed in operator rules.
 const a=zone("m4-416","m4-460",{safeWithin:720,sureExceed:720});
 if(a.reason)return unknown(a.reason);
 // 633–672: official operator pages conflict (60 vs 120 minutes). Only
 // classify a time when BOTH published limits imply the same outcome.
 const b=zone("m4-636","m4-672",{safeWithin:60,sureExceed:120});
 if(b.reason)return unknown(b.reason);
 return {status:"resolved",reason:null,mixedContext:{routeId,verified:true,mixed401:a.value,mixed633:b.value}};
}
export {deriveM4MixedStatus};
