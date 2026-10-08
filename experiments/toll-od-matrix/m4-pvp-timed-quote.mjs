import {m4TariffPeriodAt} from "./m4-fare-calendar-2026.mjs";
import {quoteM4ByPvp} from "./m4-pvp-corridor.mjs";
import {deriveM4MixedStatus} from "./m4-mixed-time-policy.mjs";

// An M4 single corridor may span midnight. A static single calendar period is unsafe
// if any verified PVP crossing belongs to another tariff profile or tariff version.
function quoteM4TimedCorridor(matrix,request,quoteFunction){
 const unknown=reason=>({status:"unknown",amountRub:null,reason,diagnosticOnly:true});
 if(!request||!Array.isArray(request.confirmedPvps)||!request.confirmedPvps.length||!Array.isArray(request.pvpPassageTimes)||request.pvpPassageTimes.length!==request.confirmedPvps.length)return unknown("missing_each_pvp_passage_time");
 if(typeof request.routeId!=="string"||!request.routeId||typeof quoteFunction!=="function")return unknown("invalid_quote_context");
 const days=[],observedProfiles=new Set();
 for(let i=0;i<request.confirmedPvps.length;i++){
  const a=request.confirmedPvps[i],b=request.pvpPassageTimes[i];
  if(!a||!b||b.pvpId!==a.pvpId||b.routeId!==request.routeId)return unknown("time_not_bound_to_same_verified_pvp");
  const c=m4TariffPeriodAt(b.at);
  if(c.status!=="resolved")return unknown("tariff_calendar:"+c.reason);
  observedProfiles.add(c.profile);days.push(c.date);
 }
 if(observedProfiles.size!==1)return unknown("mixed_tariff_profiles_across_overnight_trip");
 const profile=[...observedProfiles][0],firstDate=days[0];
 const computed=deriveM4MixedStatus(request.confirmedPvps,request.pvpPassageTimes,request.routeId,request.direction);
 if(computed.status!=="resolved")return unknown("mixed_zone:"+computed.reason);
 const ctx=computed.mixedContext;
 // If a caller also supplied a mixed-state assertion it must agree with crossed times.
 if(request.mixedContext && (request.mixedContext.routeId!==request.routeId || request.mixedContext.mixed401!==ctx.mixed401 || request.mixedContext.mixed633!==ctx.mixed633))return unknown("provided_mixed_zone_status_disagrees_with_event_times");
 const r=quoteFunction(matrix,{...request,mixedContext:ctx,profile,tariffDate:firstDate});
 if(!r||r.status!=="diagnostic_priced"||!Number.isSafeInteger(r.amountRub))return r??unknown("quote_failed");
 const matching=(matrix?.priceCells??[]).filter(c=>c.direction===request.direction && Array.isArray(c.sequence) && c.sequence.join(">")===r.verifiedSequence.join(">") && c.context?.mixed401===ctx.mixed401 && c.context?.mixed633===ctx.mixed633 && c.source?.effectiveFrom<=firstDate && (c.source.effectiveTo===null||c.source.effectiveTo>=firstDate));
 if(matching.length!==1)return unknown("no_unique_tariff_version_for_trip");
 const source=matching[0].source;
 if(days.some(d=>d<source.effectiveFrom||(source.effectiveTo!==null&&d>source.effectiveTo)))return unknown("tariff_version_changes_during_trip");
 return {...r,profile,tariffDates:days,timezone:"Europe/Moscow"};
}

function quoteM4WithEventTimes(matrix,request){
  return quoteM4TimedCorridor(matrix,request,quoteM4ByPvp);
}
export {quoteM4WithEventTimes};
