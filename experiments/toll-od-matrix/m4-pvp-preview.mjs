// Cross-route evidence is deliberately NOT fabricated. This module displays route-
 // scoped PVP evidence in the preview; an actual verified continuous-mainline proof
 // and a nonempty officially verified price cell are required before replacement.
import {validateM4PvpMatrix,quoteM4ByPvp} from "./m4-pvp-corridor.mjs";
import {adaptM4PlazaValidation} from "./m4-pvp-evidence-adapter.mjs";

function inspectM4PvpPreview(matrix,validation,options={}) {
 const fail=(reason,base={})=>({status:"unknown",reason,priceRub:null,source:"pvp-first-preview",diagnosticOnly:true,verifiedPriceCells:0,candidateCount:0,confirmedPvps:[],...base});
 let valid;
 try {valid=validateM4PvpMatrix(matrix);} catch {return fail("invalid_verified_price_catalog");}
 void valid;
 const base={verifiedPriceCells:matrix.priceCells.length,candidateCount:validation?.candidateCount??0,checkedCandidateCount:validation?.checkedCandidateCount??0,unknownCandidateCount:validation?.unknownCount??0};
 if(!validation||validation.candidateCount===0)return fail("m4_no_toll_gate_candidates",base);
 if(!Array.isArray(validation.checks))return fail("missing_pvp_checks",base);
 const strict=validation.checks.filter(c=>c.status==="confirmed"&&c.evidence==="map_matching"&&Array.isArray(c.matchedNodeIds)&&c.matchedNodeIds.length>0)
   .sort((a,b)=>(a.routeProgressMeters??0)-(b.routeProgressMeters??0));
 const seen=new Set();
 const confirmedPvps=[];
 for(const check of strict){
  const id="m4-"+check.km;
  if(seen.has(id))return fail("duplicate_confirmed_pvp",base);
  seen.add(id);
  confirmedPvps.push(id);
 }
 const view={...base,confirmedPvps,confirmedByMapMatching:strict.length,legacyConfirmedCount:validation.confirmedCount??0};
 if(validation.complete!==true || validation.unknownCount!==0||validation.candidateCount!==validation.checkedCandidateCount)return fail("incomplete_pvp_validation",view);
 if(validation.confirmedCount!==strict.length)return fail("weak_or_unmatched_gate_evidence",view);
 if(!confirmedPvps.length)return fail("no_confirmed_paid_pvp_not_free",view);
 const km=confirmedPvps.map(id=>+id.slice(3));
 let forward=true,backward=true;
 for(let i=1;i<km.length;i++){forward&&=km[i]>km[i-1];backward&&=km[i]<km[i-1];}
 const direction=forward&&!backward?"to_krasnodar":backward&&!forward?"to_moscow":null;
 if(!direction)return fail("ambiguous_or_single_pvp_direction",view);
 if(matrix.priceCells.length===0)return fail("no_verified_complete_m4_pvp_tariffs",{...view,direction});
 const evidence=adaptM4PlazaValidation({
  routeId:options.routeId??"preview-route",direction,validation,
  // This must originate from a separately verified map-matched full M4 road
  // continuity provider, not just an assumption based on monotonic plaza km.
  continuityEvidence:options.continuityEvidence??null
 });
 if(evidence.status!=="resolved")return fail(evidence.reason,{...view,direction});
 if(!options.tariffContext || !options.tariffDate || !options.profile)return fail("tariff_calendar_or_mixed_context_missing",{...view,direction});
 const priced=quoteM4ByPvp(matrix,{
  ...evidence,routeId:options.routeId??"preview-route",direction,
  profile:options.profile,tariffDate:options.tariffDate,
  mixedContext:options.tariffContext,
 });
 if(priced.status!=="diagnostic_priced")return fail(priced.reason,{...view,direction});
 return {status:"diagnostic_priced",reason:null,priceRub:priced.amountRub,
  source:"pvp-first-preview",diagnosticOnly:true,verifiedPriceCells:matrix.priceCells.length,
  candidateCount:base.candidateCount,checkedCandidateCount:base.checkedCandidateCount,
  unknownCandidateCount:base.unknownCandidateCount,confirmedPvps,direction,matchedSource:priced.source};
}
export {inspectM4PvpPreview};
