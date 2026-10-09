// National paid-road fare core. Never infer gate passage from OSM proximity,
// a road name, or stored source price. The caller must provide independent
// same-route, complete evidence. This module is offline/shadow until every
// road has an audited map-matching adapter and tariff-effective version.
function validateCatalog(catalog) {
 if(!catalog || catalog.schemaVersion!==1 || !Array.isArray(catalog.networks) || !catalog.operatorFares)throw Error("bad_national_catalog");
 const ids=catalog.networks.map(x=>x.id);
 if(ids.some(x=>typeof x!=="string"||!x)||new Set(ids).size!==ids.length)throw Error("bad_network_registry");
 for(const [id,fare] of Object.entries(catalog.operatorFares)){
   if(!ids.includes(id)||!fare||typeof fare.source!=="string"||!fare.source.startsWith("https://"))throw Error("bad_fare_provenance");
 }
 return true;
}
function quoteNationalRoad(catalog,request){
 const fail=reason=>({status:"unknown",amountRub:null,reason,roadId:request?.roadId??null,source:null,diagnosticOnly:true});
 try{validateCatalog(catalog)}catch{return fail("invalid_catalog")}
 if(!request||!catalog.networks.some(n=>n.id===request.roadId))return fail("road_not_in_registry");
 if(request.vehicleCategory!=="I"||request.payment!=="noTransponder")return fail("unverified_vehicle_or_payment_class");
 if(typeof request.tariffDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(request.tariffDate))return fail("tariff_date_missing_or_invalid");
 const parsedDate=new Date(request.tariffDate+"T12:00:00Z");
 if(!Number.isFinite(parsedDate.getTime())||parsedDate.toISOString().slice(0,10)!==request.tariffDate)return fail("tariff_date_missing_or_invalid");
 // An undated current public tariff page cannot prove prices for arbitrary
 // historical or future departure days. Use only the observed audit date.
 if(request.tariffDate>catalog.asOf)return fail("future_tariff_unverified");
 const proof=request.proof;
 // Exact matched PVP/camera identification is required; a road label alone is forbidden.
 if(!proof||proof.status!=="verified"||proof.routeId!==request.routeId||typeof proof.routeId!=="string"||!proof.routeId||
 proof.source!=="independent_paid_edge_or_operator_camera"||proof.complete!==true||
 proof.edgeToll!==true||!Array.isArray(proof.passageIds)||proof.passageIds.length===0||
 proof.passageIds.some(id=>typeof id!=="string"||!id)||new Set(proof.passageIds).size!==proof.passageIds.length)return fail("incomplete_or_nonmatching_passage_proof");
 const fare=catalog.operatorFares[request.roadId];if(!fare)return fail("official_tariff_not_imported");
 if(!fare.effectiveFrom&&request.tariffDate!==catalog.asOf)return fail("tariff_effective_date_unverified");
 if(fare.effectiveFrom && request.tariffDate<fare.effectiveFrom)return fail("tariff_not_effective");
 if(fare.effectiveTo && request.tariffDate>fare.effectiveTo)return fail("tariff_expired");
 const s=request.scenario??{};
 let amount=null;
 if(fare.kind==="flat"){
   const knownCamera=request.roadId==="ufa-east"?"ufa-east-pvp":"bagration-camera-6.6";
   if(proof.passageIds.length!==1||proof.passageIds[0]!==knownCamera)return fail("wrong_operator_camera_or_reentry");
   amount=fare.amountRub;
 }else if(fare.kind==="exclusive_zone"){
   // Exclusive official zone prices, do not charge "both" PLUS each bridge.
   if(proof.passageIds.length!==1 || !Object.prototype.hasOwnProperty.call(fare.prices,proof.passageIds[0]))return fail("exclusive_travel_zone_unverified");
   amount=fare.prices[proof.passageIds[0]];
 }else if(fare.kind==="weekday_peak"){
   if(proof.passageIds.length!==1||proof.passageIds[0]!=="voznesensky-rvp")return fail("kazan_gate_unverified");
   if(!["verified_workday","verified_weekend_or_holiday"].includes(s.dayClass) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.moscowPassageTime||"") || s.timeSource!=="same_route_estimated_passage")return fail("kazan_date_time_or_holiday_unverified");
   const [hh,mm]=s.moscowPassageTime.split(":").map(Number), t=hh*60+mm;
   const peak=(t>=390&&t<540)||(t>=1020&&t<1170);
   amount=s.dayClass==="verified_workday" && peak?fare.workdayPeakRub:fare.offPeakRub;
 }else if(fare.kind==="section_matrix"){
   if(s.operatorProfile!=="all"&&s.operatorProfile!=="monThu"&&s.operatorProfile!=="friSun")return fail("road_operator_calendar_unverified");
   if(s.calendarSource!=="verified_operator_schedule")return fail("road_operator_calendar_unverified");
   let sum=0;
   for(const id of proof.passageIds){
     const row=fare.rows[id], v=row?.[s.operatorProfile]??(s.operatorProfile==="all"?row?.all:null);
     if(!Number.isSafeInteger(v)||v<0)return fail("official_section_or_calendar_missing");
     sum+=v;
   }
   amount=sum;
 }else if(fare.kind==="time_and_transit"){
   if(s.msdMode==="city"){
     // Paid only when entry AND exit occur in rush hour; potentially exempt
     // taxis must be verified by the operator. Northern sections had changes in 2026.
     if(s.exemptionVerified!=="not_exempt"||s.currentScheduleVerified!==true||s.allSegmentsMatched!==true||!["verified_workday","verified_weekend_or_holiday"].includes(s.dayClass))return fail("msd_exemption_or_schedule_unverified");
     if(proof.passageIds.length>fare.maxCitySections || proof.passageIds.some(id=>!/^msd-section-[1-9]$/.test(id)))return fail("msd_sections_unverified");
     if(!Array.isArray(s.sectionTimes)||s.sectionTimes.length!==proof.passageIds.length)return fail("msd_entry_exit_times_missing");
     // Caller cannot assume a section is free without exact entry/exit times.
     // Local Moscow timestamps: YYYY-MM-DDTHH:mm, backed by selected route.
     const paidWindow=time=>{const m=/^\d{4}-\d\d-\d\dT([01]\d|2[0-3]):([0-5]\d)$/.exec(time??"");if(!m)return null;const t=Number(m[1])*60+Number(m[2]);return t>=420&&t<660||t>=960&&t<1200;};
     let paid=0;
     for(let i=0;i<proof.passageIds.length;i++){
       const x=s.sectionTimes[i];if(x?.sectionId!==proof.passageIds[i]||x?.source!=="same_route_operator_verified"||x?.holidayVerified!==true)return fail("msd_section_identity_or_calendar_unknown");
       const a=paidWindow(x.entryLocal),b=paidWindow(x.exitLocal);
       if(a===null||b===null||x.entryLocal.slice(0,10)!==request.tariffDate||x.exitLocal.slice(0,10)!==request.tariffDate||x.entryLocal>x.exitLocal)return fail("msd_passage_time_unknown");
       if(s.dayClass==="verified_workday"&&a&&b)paid+=1;
     }
     // A truly free set of *observed* passes is valid only with all checks.
     amount=paid*fare.citySectionRub;
   }else if(s.msdMode==="transit"){
     if(proof.passageIds.length!==1||proof.passageIds[0]!=="msd-transit-ckad-ckad" || s.twoCkadCrossingsVerified!==true || s.ckadCrossingTimeProof!==true || !Number.isFinite(s.ckadBoundaryMinutes)||s.ckadBoundaryMinutes<0||s.ckadBoundaryMinutes>1440 || s.tripMinutes>120||!Number.isFinite(s.tripMinutes)||s.tripMinutes<0||s.plateRegion!=="non_moscow"||s.exemptionVerified!=="not_exempt")return fail("msd_transit_conditions_unverified");
     amount=fare.transitTripRub;
   }else return fail("msd_charging_model_missing");
 }else return fail("unsupported_fare_model");
 if(!Number.isSafeInteger(amount)||amount<0)return fail("tariff_price_invalid");
 return {status:"diagnostic_priced",amountRub:amount,reason:null,roadId:request.roadId,source:fare.source,diagnosticOnly:true};
}
export {validateCatalog,quoteNationalRoad};

/**
 * Compose nationwide charges for a fully checked selected trip.
 * This layer is offline until independent end-to-end facility extraction can
 * certify **every** paid facility, including roads outside our 22 networks.
 * Null always wins over a partial known amount.
 */
function quoteNationwideTrip(catalog,trip){
 const fail=(reason,components=[])=>({status:"unknown",amountRub:null,reason,components,diagnosticOnly:true});
 try{validateCatalog(catalog)}catch{return fail("invalid_catalog")}
 if(!trip || typeof trip.routeId!=="string" || !trip.routeId||
 trip.allPaidFacilitiesInspected!==true || trip.sameSelectedGeometry!==true ||
 trip.hasUnregisteredPaidSystem!==false || trip.evidenceSource!=="complete_independent_route_matching"||
 !Array.isArray(trip.events))return fail("national_route_coverage_incomplete");
 if(trip.events.length===0){
   // No detected paid gates is not evidence of a truly free entire route:
   // require a second independent no-toll edge proof.
   if(trip.independentlyVerifiedNoTollEdges!==true)return fail("empty_paid_events_not_proof_of_free");
   return {status:"verified_free",amountRub:0,reason:null,components:[],diagnosticOnly:true};
 }
 const seen=new Set(),results=[];
 for(const [index,event]of trip.events.entries()){
   if(!event || !event.traversalId || seen.has(event.traversalId))return fail("repeated_or_missing_traversal_identity",results);
   seen.add(event.traversalId);
   const item=quoteNationalRoad(catalog,{...event,routeId:trip.routeId});
   results.push({...item,traversalId:event.traversalId,sequenceIndex:index});
   if(item.status!=="diagnostic_priced")return fail("national_component_unpriced:"+item.roadId+":"+item.reason,results);
 }
 return {status:"diagnostic_priced",amountRub:results.reduce((sum,item)=>sum+item.amountRub,0),reason:null,components:results,diagnosticOnly:true};
}
export {quoteNationwideTrip};
