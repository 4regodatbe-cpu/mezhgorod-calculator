// Sandbox M-4 tariff lookup by a continuous span between endpoint PVPs.
// Direction-independent fare cell: exact route PVP chain proves the span; it is not priced at runtime.
const kmOf=id=>Number(String(id).slice(3));
const validDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+"T00:00:00Z").toISOString().startsWith(s);
const canonicalEndpoints=pair=>[...pair].sort((a,b)=>kmOf(a)-kmOf(b));
const spanKey=pair=>canonicalEndpoints(pair).join("|");
const canonicalChain=chain=>kmOf(chain[0])<kmOf(chain.at(-1))?[...chain]:[...chain].reverse();

function validateM4PvpMatrix(matrix){
  if(!matrix||matrix.schemaVersion!==2||matrix.runtimeEnabled!==false||matrix.systemId!=="m4-don"||matrix.vehicleProfile!=="category-I-no-transponder"||!Array.isArray(matrix.knownPvps)||!Array.isArray(matrix.spanCells))throw Error("invalid_m4_matrix");
  const known=new Set(matrix.knownPvps);
  if(known.size!==matrix.knownPvps.length||[...known].some(id=>!/^m4-\d+$/.test(id)))throw Error("invalid_known_pvps");
  const versions=new Map();
  for(const cell of matrix.spanCells){
    if(!cell||!Array.isArray(cell.endpoints)||cell.endpoints.length!==2||cell.endpoints.some(id=>!known.has(id))||new Set(cell.endpoints).size!==2)throw Error("invalid_span_endpoints");
    const endpoints=canonicalEndpoints(cell.endpoints);
    if(endpoints.some((id,i)=>id!==cell.endpoints[i]))throw Error("noncanonical_span_endpoints");
    if(!Array.isArray(cell.acceptedChains)||!cell.acceptedChains.length)throw Error("missing_span_chains");
    for(const chain of cell.acceptedChains){
      if(!Array.isArray(chain)||chain.length<2||chain.some(id=>!known.has(id))||new Set(chain).size!==chain.length)throw Error("invalid_span_chain");
      const canonical=canonicalChain(chain);
      if(canonical[0]!==endpoints[0]||canonical.at(-1)!==endpoints[1])throw Error("chain_endpoint_mismatch");
      const kms=canonical.map(kmOf);
      for(let i=1;i<kms.length;i++)if(kms[i]<=kms[i-1])throw Error("nonmonotonic_span_chain");
      if(canonical.some((id,i)=>id!==chain[i])&&canonical.some((id,i)=>id!==[...chain].reverse()[i]))throw Error("invalid_span_chain_orientation");
    }
    const chains=cell.acceptedChains.map(canonicalChain);
    if(new Set(chains.map(c=>c.join(">"))).size!==chains.length)throw Error("duplicate_span_chain");
    if(!cell.prices||!Number.isSafeInteger(cell.prices.monThu)||!Number.isSafeInteger(cell.prices.friSun)||cell.prices.monThu<0||cell.prices.friSun<0)throw Error("invalid_span_prices");
    const src=cell.source;
    if(!src||typeof src.url!=="string"||!src.url.startsWith("https://")||!validDate(src.effectiveFrom)||(src.effectiveTo!==null&&!validDate(src.effectiveTo))||(src.effectiveTo&&src.effectiveTo<src.effectiveFrom))throw Error("invalid_span_provenance");
    const key=spanKey(endpoints),ranges=versions.get(key)||[];
    for(const range of ranges){
      const nonoverlap=(range.to!==null&&range.to<src.effectiveFrom)||(src.effectiveTo!==null&&src.effectiveTo<range.from);
      if(!nonoverlap)throw Error("overlapping_span_version");
      if(range.chains!==chains.map(c=>c.join(">")).sort().join(","))throw Error("span_chain_changed_between_versions");
    }
    ranges.push({from:src.effectiveFrom,to:src.effectiveTo,chains:chains.map(c=>c.join(">")).sort().join(",")});
    versions.set(key,ranges);
  }
  return true;
}

function quoteM4BySpan(matrix,request){
  const unknown=reason=>({status:"unknown",amountRub:null,reason,diagnosticOnly:true});
  try{validateM4PvpMatrix(matrix);}catch{return unknown("invalid_span_tariff_matrix");}
  if(!request||typeof request.routeId!=="string"||!request.routeId)return unknown("invalid_request");
  const period=request.period??request.profile;
  if(!["monThu","friSun"].includes(period)||!validDate(request.tariffDate))return unknown("unknown_tariff_period");
  const proof=request.routeProof;
  if(!proof||proof.routeId!==request.routeId||proof.status!=="complete"||proof.sameSelectedGeometry!==true||proof.mainlineContinuity!=="verified"||proof.reentryStatus!=="not_observed"||proof.unknownCandidateCount!==0||!Number.isSafeInteger(proof.candidateCount)||!Number.isSafeInteger(proof.checkedCandidateCount)||proof.checkedCandidateCount!==proof.candidateCount)return unknown("incomplete_or_noncontinuous_route_evidence");
  const events=request.confirmedPvps;
  if(!Array.isArray(events)||events.length<2)return unknown("span_requires_two_confirmed_boundaries");
  const sequence=[],seen=new Set();let priorPosition=-1;
  for(const event of events){
    if(!event||event.status!=="confirmed"||event.routeId!==request.routeId||!matrix.knownPvps.includes(event.pvpId)||typeof event.osmNodeId!=="string"||!event.osmNodeId||!Number.isSafeInteger(event.routeIndex)||event.routeIndex<=priorPosition||seen.has(event.pvpId))return unknown("unverified_or_repeated_pvp_event");
    priorPosition=event.routeIndex;seen.add(event.pvpId);sequence.push(event.pvpId);
  }
  const canonical=canonicalChain(sequence),endpoints=[canonical[0],canonical.at(-1)];
  if(sequence.some((id,i)=>i>0&&((kmOf(sequence[0])<kmOf(sequence.at(-1))&&kmOf(id)<=kmOf(sequence[i-1]))||(kmOf(sequence[0])>kmOf(sequence.at(-1))&&kmOf(id)>=kmOf(sequence[i-1])))))return unknown("nonmonotonic_route_pvp_chain");
  const key=spanKey(endpoints);
  const matching=matrix.spanCells.filter(c=>spanKey(c.endpoints)===key&&c.acceptedChains.some(chain=>canonicalChain(chain).join(">")===canonical.join(">")));
  if(matching.length===0)return unknown("no_exact_verified_span_price");
  const active=matching.filter(c=>request.tariffDate>=c.source.effectiveFrom&&(!c.source.effectiveTo||request.tariffDate<=c.source.effectiveTo));
  if(active.length!==1)return unknown("span_tariff_not_effective_or_ambiguous");
  const cell=active[0];
  return {status:"span_priced",amountRub:cell.prices[period],reason:null,endpoints:cell.endpoints,verifiedChain:sequence,period,source:cell.source.url,diagnosticOnly:true};
}

const quoteM4ByPvp=quoteM4BySpan;
export {validateM4PvpMatrix,quoteM4BySpan,quoteM4ByPvp};
