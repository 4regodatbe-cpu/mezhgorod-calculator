import {m4TariffPeriodAt} from "../toll-od-matrix/m4-fare-calendar-2026.mjs";
import {quoteNationalRoad} from "./national-price.mjs";

// M-3 three-gate observed corridor only; not an all-Russia toll total.
// Calculate in shadow mode once same-route Valhalla paid gate IDs are
// independently mapped and the same operator date/profile holds through trip.
function quoteM3ThreeGateShadow(catalog,gateAudit,departureAt,routeSeconds){
 const unknown=reason=>({status:"unknown",reason,amountRub:null,diagnosticOnly:true,roadId:"m3"});
 if(!gateAudit||gateAudit.status!=="physical_gate_nodes_matched"||
   gateAudit.unmappedPaidNodes?.length!==0||!Array.isArray(gateAudit.verifiedGates)||
   gateAudit.verifiedGates.length!==3||typeof gateAudit.routeId!=="string"||!gateAudit.routeId)
  return unknown("m3_full_three_gate_proof_incomplete");
 const gates=gateAudit.verifiedGates;
 if(gates.some(g=>g.roadId!=="m3"||!g.edgeToll||!g.osmNodeId||!g.fareRowId))return unknown("m3_gate_id_missing");
 const indices=gates.map(g=>g.km),ids=gates.map(g=>g.id);
 const forward=indices.join(",")==="86,136,168",reverse=indices.join(",")==="168,136,86";
 if(!forward&&!reverse || new Set(ids).size!==3)return unknown("m3_gate_order_or_duplicate_invalid");
 if(typeof departureAt!=="string"||!Number.isFinite(routeSeconds)||routeSeconds<0||routeSeconds>24*3600)return unknown("m3_departure_or_duration_invalid");
 const start=Date.parse(departureAt);if(!Number.isFinite(start)||!/(?:Z|[+-]\d\d:\d\d)$/.test(departureAt))return unknown("m3_departure_timezone_missing");
 const end=new Date(start+Math.ceil(routeSeconds)*1000).toISOString();
 const a=m4TariffPeriodAt(departureAt),b=m4TariffPeriodAt(end);
 if(a.status!=="resolved"||b.status!=="resolved"||a.date!==b.date||a.profile!==b.profile)return unknown("m3_gate_tariff_date_changes_during_trip");
 const m3Source=catalog?.operatorFares?.m3;
 if(!m3Source?.effectiveFrom || !m3Source?.verifiedThrough || a.date<m3Source.effectiveFrom || a.date>m3Source.verifiedThrough)
   return unknown("m3_source_effective_day_not_verified");
 const quote=quoteNationalRoad(catalog,{
  roadId:"m3",vehicleCategory:"I",payment:"noTransponder",routeId:gateAudit.routeId,tariffDate:a.date,
  proof:{status:"verified",source:"independent_paid_edge_or_operator_camera",routeId:gateAudit.routeId,
   complete:true,edgeToll:true,passageIds:gates.map(g=>g.fareRowId)},
  scenario:{operatorProfile:a.profile,calendarSource:"verified_operator_schedule"}
 });
 if(quote.status!=="diagnostic_priced")return unknown(quote.reason);
 return {...quote,kind:"m3_full_three_gate_component_only",passageIds:ids,operatorProfile:a.profile,tariffDate:a.date,
   diagnosticOnly:true,warning:"Not a full all-road itinerary toll total. Source tariff effectiveness and all other paid roads require verification; value is NOT injected into customer fare."};
}

/** PVP46 on M1, independently physically matched, shadow category-I only.
 * Unresolved M1 booth inventory currently intentionally produces UNKNOWN.
 * This does not certify a complete Moscow-area intercity toll itinerary.
 */
function quoteM1SingleGateShadow(catalog,gateAudit,departureAt,routeSeconds){
 const unknown=reason=>({status:"unknown",reason,amountRub:null,roadId:"m1",diagnosticOnly:true});
 if(!gateAudit||gateAudit.status!=="physical_gate_nodes_matched"||
  !Array.isArray(gateAudit.verifiedGates)||gateAudit.verifiedGates.length!==1||
  !Array.isArray(gateAudit.unmappedPaidNodes)||gateAudit.unmappedPaidNodes.length!==0||
  typeof gateAudit.routeId!=="string"||!gateAudit.routeId)return unknown("m1_exact_gate_proof_not_verified");
 const gate=gateAudit.verifiedGates[0];
 if(gate.id!=="m1-pvp-46"||gate.roadId!=="m1"||gate.km!==46||gate.fareRowId!=="m1-33-66"||
  gate.edgeToll!==true||typeof gate.osmNodeId!=="string"||!/^\d+$/.test(gate.osmNodeId))
  return unknown("m1_physical_operator_booth_mismatch");
 if(typeof departureAt!=="string"||!Number.isFinite(routeSeconds)||routeSeconds<0||routeSeconds>86400)return unknown("m1_departure_or_duration_invalid");
 const start=Date.parse(departureAt);
 if(!Number.isFinite(start)||!/(?:Z|[+-]\d\d:\d\d)$/.test(departureAt))return unknown("m1_departure_timezone_invalid");
 const a=m4TariffPeriodAt(departureAt),b=m4TariffPeriodAt(new Date(start+Math.ceil(routeSeconds)*1000).toISOString());
 if(a.status!=="resolved"||b.status!=="resolved"||a.date!==b.date)return unknown("m1_tariff_date_changes_during_trip");
 const fare=catalog?.operatorFares?.m1;
 if(!fare?.effectiveFrom||!fare?.verifiedThrough||a.date<fare.effectiveFrom||a.date>fare.verifiedThrough)
  return unknown("m1_operator_tariff_version_not_verified");
 const q=quoteNationalRoad(catalog,{
   roadId:"m1",vehicleCategory:"I",payment:"noTransponder",routeId:gateAudit.routeId,tariffDate:a.date,
   proof:{status:"verified",source:"independent_paid_edge_or_operator_camera",routeId:gateAudit.routeId,
    complete:true,edgeToll:true,passageIds:["m1-33-66"]},
   scenario:{operatorProfile:"all",calendarSource:"verified_operator_schedule"}
 });
 return q.status!=="diagnostic_priced"?unknown(q.reason):{...q,kind:"m1_exact_one_gate_component_only",
  osmNodeId:gate.osmNodeId,tariffDate:a.date,diagnosticOnly:true,
  warning:"Physical PVP46 plus source tariff is not evidence that other paid roads on the route are free; no customer fare cutover."};
}

export {quoteM3ThreeGateShadow,quoteM1SingleGateShadow};
