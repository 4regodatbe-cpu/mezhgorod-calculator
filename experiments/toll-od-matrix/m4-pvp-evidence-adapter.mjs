// Bridge from existing isolated M-4 validation diagnostic to single-pass PVP evidence.
// Full strict crossing proof is required; spatial fallback alone never yields a paid PVP.
// Actual route-continuity/identity evidence must be supplied independently.
function adaptM4PlazaValidation({routeId,direction,validation,continuityEvidence}){
 const fail=reason=>({status:"unknown",reason,routeProof:null,confirmedPvps:[],diagnosticOnly:true});
 if(typeof routeId!=="string" || !routeId || !["to_moscow","to_krasnodar"].includes(direction))return fail("missing_route_identity_or_direction");
 if(!continuityEvidence || continuityEvidence.routeId!==routeId || continuityEvidence.sameSelectedGeometry!==true || continuityEvidence.mainlineContinuity!=="verified" || continuityEvidence.reentryStatus!=="not_observed")return fail("route_continuity_not_verified");
 if(!validation || validation.complete!==true || !Array.isArray(validation.checks) || !Array.isArray(validation.events) || !Number.isSafeInteger(validation.candidateCount) || !Number.isSafeInteger(validation.checkedCandidateCount) || validation.candidateCount!==validation.checkedCandidateCount || validation.candidateCount!==validation.checks.length || validation.unknownCount!==0 || validation.confirmedCount+validation.rejectedCount!==validation.candidateCount)return fail("plaza_validation_incomplete");
 const validatedNodes=new Set(validation.events.filter(e=>e && e.edgeToll===true && e.osmNodeId).map(e=>String(e.osmNodeId)));
 const confirmed=validation.checks.filter(c=>c?.status==="confirmed");
 const seen=new Set(),result=[];
 for(const check of confirmed){
  if(!Number.isFinite(check.routeProgressMeters) || check.routeProgressMeters<0 || !Number.isInteger(check.km) || !Array.isArray(check.matchedNodeIds) || check.matchedNodeIds.length===0 || check.evidence!=="map_matching" || !Array.isArray(check.expectedNodeIds))return fail("unverified_confirmed_plaza");
  const pvpId="m4-"+check.km;
  if(seen.has(pvpId))return fail("duplicate_confirmed_pvp");
  const ids=check.matchedNodeIds.map(String).filter(id=>check.expectedNodeIds.map(String).includes(id) && validatedNodes.has(id));
  if(ids.length===0)return fail("plaza_not_in_independent_matched_events");
  result.push({pvpId,routeId,direction,status:"confirmed",position:check.routeProgressMeters,osmNodeId:ids[0]});
  seen.add(pvpId);
 }
 result.sort((a,b)=>a.position-b.position);
 for(let i=1;i<result.length;i++){
  if(result[i].position<=result[i-1].position)return fail("ambiguous_plaza_progress");
  const kmA=Number(result[i-1].pvpId.slice(3)),kmB=Number(result[i].pvpId.slice(3));
  if(direction==="to_moscow" ? kmB>=kmA : kmB<=kmA)return fail("nonmonotonic_plaza_order");
 }
 const confirmedPvps=result.map((e,i)=>({pvpId:e.pvpId,routeId:e.routeId,direction:e.direction,status:"confirmed",routeIndex:i+1,osmNodeId:e.osmNodeId}));
 return {status:"resolved",reason:null,confirmedPvps,diagnosticOnly:true,
  routeProof:{routeId,status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:validation.candidateCount,checkedCandidateCount:validation.checkedCandidateCount}};
}
export {adaptM4PlazaValidation};
