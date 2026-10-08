// Experimental M-4 PVP corridor lookup: no ramp reconstruction and no live integration.
// Inputs must already be matched to the *same* selected route by an independent verifier.
// First/last PVP + exact confirmed intermediate sequence + direction + mixed-zone context.
// No internal plaza summation or tariff inference; no unsupported repeated-entry model.
function validateM4PvpMatrix(matrix){
  if(!matrix || matrix.schemaVersion!==1 || matrix.runtimeEnabled!==false || matrix.systemId!=="m4-don" || matrix.vehicleProfile!=="category-I-no-transponder" || !Array.isArray(matrix.knownPvps) || !Array.isArray(matrix.priceCells)) throw Error("invalid_m4_matrix");
  const known=new Set(matrix.knownPvps);
  if(known.size!==matrix.knownPvps.length || [...known].some(id=>!/^m4-\d+$/.test(id)))throw Error("invalid_known_pvps");
  const versionedKeys=new Map();
  for(const cell of matrix.priceCells){
    if(!cell || !["to_moscow","to_krasnodar"].includes(cell.direction) || !Array.isArray(cell.sequence) || !cell.sequence.length || new Set(cell.sequence).size!==cell.sequence.length || cell.sequence.some(id=>!known.has(id)))throw Error("invalid_cell_sequence");
    const kms=cell.sequence.map(id=>Number(id.slice(3)));
    for(let i=1;i<kms.length;i++)if(cell.direction==="to_moscow" ? kms[i]>=kms[i-1] : kms[i]<=kms[i-1])throw Error("invalid_cell_direction");
    if(!cell.context || !["not_used","within_limit","exceeded_limit"].includes(cell.context.mixed401) || !["not_used","within_limit","exceeded_limit"].includes(cell.context.mixed633))throw Error("invalid_cell_context");
    const a=cell.sequence.some(id=>id==="m4-416"||id==="m4-460"),b=cell.sequence.some(id=>id==="m4-636"||id==="m4-672");
    if(a===(cell.context.mixed401==="not_used") || b===(cell.context.mixed633==="not_used"))throw Error("inconsistent_mixed_context");
    if(!cell.prices || !Number.isSafeInteger(cell.prices.monThu) || !Number.isSafeInteger(cell.prices.friSun) || cell.prices.monThu<0 || cell.prices.friSun<0)throw Error("invalid_cell_prices");
    const src=cell.source;
    if(!src || src.kind!=="official_verified_corridor" || typeof src.url!=="string" || !src.url.startsWith("https://") || !/^\\d{4}-\\d\\d-\\d\\d$/.test(src.effectiveFrom||"") || (src.effectiveTo!==null && !/^\\d{4}-\\d\\d-\\d\\d$/.test(src.effectiveTo||"")) || (src.effectiveTo && src.effectiveTo<src.effectiveFrom))throw Error("invalid_cell_provenance");
    const key=[cell.direction,cell.sequence.join(">"),cell.context.mixed401,cell.context.mixed633].join("|");
    const ranges=versionedKeys.get(key)||[];
    for(const range of ranges){
      const noOverlap=(range.to!==null && range.to<src.effectiveFrom) || (src.effectiveTo!==null && src.effectiveTo<range.from);
      if(!noOverlap)throw Error("overlapping_cell_version");
    }
    ranges.push({from:src.effectiveFrom,to:src.effectiveTo});
    versionedKeys.set(key,ranges);
  }
  return true;
}

function quoteM4ByPvp(matrix,request){
  const unknown=(reason)=>({status:"unknown",amountRub:null,reason,diagnosticOnly:true});
  try{validateM4PvpMatrix(matrix);}catch{return unknown("invalid_tariff_matrix");}
  if(!request || typeof request.routeId!=="string" || !request.routeId || !["to_moscow","to_krasnodar"].includes(request.direction))return unknown("invalid_request");
  if(!["monThu","friSun"].includes(request.profile) || !/^\d{4}-\d\d-\d\d$/.test(request.tariffDate||""))return unknown("unknown_tariff_period");
  const p=request.routeProof;
  if(!p || p.routeId!==request.routeId || p.status!=="complete" || p.sameSelectedGeometry!==true || p.mainlineContinuity!=="verified" || p.reentryStatus!=="not_observed" || p.unknownCandidateCount!==0 || !Number.isSafeInteger(p.candidateCount) || !Number.isSafeInteger(p.checkedCandidateCount) || p.checkedCandidateCount!==p.candidateCount)return unknown("incomplete_or_noncontinuous_route_evidence");
  const events=request.confirmedPvps;
  if(!Array.isArray(events) || !events.length)return unknown("no_confirmed_pvps_not_proof_of_free");
  const known=new Set(matrix.knownPvps),seen=new Set(),sequence=[];
  let priorPosition=-1,priorKm=request.direction==="to_moscow"?Infinity:-Infinity;
  for(const event of events){
    if(!event || event.status!=="confirmed" || event.routeId!==request.routeId || event.direction!==request.direction || !known.has(event.pvpId) || typeof event.osmNodeId!=="string" || !event.osmNodeId || !Number.isSafeInteger(event.routeIndex) || event.routeIndex<=priorPosition || seen.has(event.pvpId))return unknown("unverified_or_repeated_pvp_event");
    const km=Number(event.pvpId.slice(3));
    if(request.direction==="to_moscow" ? km>=priorKm : km<=priorKm)return unknown("pvp_order_contradicts_direction");
    priorPosition=event.routeIndex;priorKm=km;seen.add(event.pvpId);sequence.push(event.pvpId);
  }
  const ctx=request.mixedContext;
  if(!ctx || ctx.routeId!==request.routeId || ctx.verified!==true || !["not_used","within_limit","exceeded_limit"].includes(ctx.mixed401) || !["not_used","within_limit","exceeded_limit"].includes(ctx.mixed633))return unknown("mixed_zone_context_unverified");
  const used401=sequence.some(id=>id==="m4-416"||id==="m4-460"),used633=sequence.some(id=>id==="m4-636"||id==="m4-672");
  if(used401===(ctx.mixed401==="not_used") || used633===(ctx.mixed633==="not_used"))return unknown("mixed_zone_context_inconsistent_with_events");
  const key=sequence.join(">");
  const matching=matrix.priceCells.filter(c=>c.direction===request.direction && c.sequence.join(">")===key && c.context.mixed401===ctx.mixed401 && c.context.mixed633===ctx.mixed633);
  if(matching.length===0)return unknown("no_verified_exact_pvp_corridor_tariff");
  const active=matching.filter(c=>request.tariffDate>=c.source.effectiveFrom && (!c.source.effectiveTo || request.tariffDate<=c.source.effectiveTo));
  if(active.length!==1)return unknown("tariff_not_effective_or_ambiguous_for_date");
  const cell=active[0];
  return {status:"diagnostic_priced",amountRub:cell.prices[request.profile],reason:null,direction:request.direction,
    firstPvp:sequence[0],lastPvp:sequence.at(-1),verifiedSequence:sequence,source:cell.source.url,diagnosticOnly:true};
}

export {validateM4PvpMatrix, quoteM4ByPvp};
