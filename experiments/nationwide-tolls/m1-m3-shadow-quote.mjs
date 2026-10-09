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
 if(a.date!==catalog?.asOf)return unknown("m3_source_effective_day_not_verified");
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
export {quoteM3ThreeGateShadow};
