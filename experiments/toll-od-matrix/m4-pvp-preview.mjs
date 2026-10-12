// Diagnostic bridge for the isolated M-4 symmetric span lookup.
import {validateM4PvpMatrix,quoteM4BySpan} from "./m4-pvp-corridor.mjs";
import {adaptM4PlazaValidation} from "./m4-pvp-evidence-adapter.mjs";

function inspectM4PvpPreview(matrix,validation,options={}){
 const fail=(reason,base={})=>({status:"unknown",reason,priceRub:null,source:"pvp-span-preview",diagnosticOnly:true,verifiedSpanCells:0,confirmedPvps:[],...base});
 try{validateM4PvpMatrix(matrix);}catch{return fail("invalid_span_catalog");}
 const base={verifiedSpanCells:matrix.spanCells.length,candidateCount:validation?.candidateCount??0,checkedCandidateCount:validation?.checkedCandidateCount??0,unknownCandidateCount:validation?.unknownCount??0};
 if(!validation||validation.candidateCount===0)return fail("m4_no_toll_gate_candidates",base);
 if(!Array.isArray(validation.checks))return fail("missing_pvp_checks",base);
 const strict=validation.checks.filter(c=>c.status==="confirmed"&&c.evidence==="map_matching"&&Array.isArray(c.matchedNodeIds)&&c.matchedNodeIds.length>0);
 const view={...base,confirmedByMapMatching:strict.length,legacyConfirmedCount:validation.confirmedCount??0};
 if(validation.complete!==true||validation.unknownCount!==0||validation.candidateCount!==validation.checkedCandidateCount)return fail("incomplete_pvp_validation",view);
 if(validation.confirmedCount!==strict.length)return fail("weak_or_unmatched_gate_evidence",view);
 if(strict.length<2)return fail("span_requires_two_confirmed_boundaries",view);
 const ordered=[...strict].sort((a,b)=>a.routeProgressMeters-b.routeProgressMeters);
 const kms=ordered.map(x=>x.km);
 const increasing=kms.every((km,i)=>i===0||km>kms[i-1]),decreasing=kms.every((km,i)=>i===0||km<kms[i-1]);
 const direction=increasing&&!decreasing?"to_krasnodar":decreasing&&!increasing?"to_moscow":null;
 if(!direction||options.direction&&options.direction!==direction)return fail("ambiguous_or_conflicting_route_direction",view);
 const evidence=adaptM4PlazaValidation({routeId:options.routeId??"preview-route",direction,validation,continuityEvidence:options.continuityEvidence??null});
 if(evidence.status!=="resolved")return fail(evidence.reason,view);
 const period=options.period??options.profile;
 if(!period||!options.tariffDate)return fail("tariff_period_or_date_missing",{...view,confirmedPvps:evidence.confirmedPvps.map(p=>p.pvpId)});
 const priced=quoteM4BySpan(matrix,{...evidence,routeId:options.routeId??"preview-route",period,tariffDate:options.tariffDate});
 if(priced.status!=="span_priced")return fail(priced.reason,{...view,confirmedPvps:evidence.confirmedPvps.map(p=>p.pvpId),direction,endpoints:evidence.confirmedPvps.length?[evidence.confirmedPvps[0].pvpId,evidence.confirmedPvps.at(-1).pvpId]:[]});
 return {status:"span_priced",reason:null,priceRub:priced.amountRub,source:"pvp-span-preview",diagnosticOnly:true,verifiedSpanCells:base.verifiedSpanCells,candidateCount:base.candidateCount,checkedCandidateCount:base.checkedCandidateCount,unknownCandidateCount:base.unknownCandidateCount,confirmedPvps:evidence.confirmedPvps.map(p=>p.pvpId),direction:options.direction,endpoints:priced.endpoints,matchedSource:priced.source};
}
export {inspectM4PvpPreview};
