// This is road-family *candidate* coverage, not exact physical gate proof.
 // Legacy route checkpoint heuristics are too weak to authorize toll prices.
const candidates=[
 [/^М\s*[-–—]?\s*1\s*:/iu,"m1"],
 [/^М\s*[-–—]?\s*3\s*:/iu,"m3"],
 [/^М\s*[-–—]?\s*4\s*:/iu,"m4"],
 [/^М\s*[-–—]?\s*11\s*:/iu,"m11"],
 [/^М\s*[-–—]?\s*12\s*:/iu,"m12"],
 [/^А\s*[-–—]?\s*289\s*:/iu,"a289"],
 [/цкад/iu,"ckad"],[/восточный выезд/iu,"ufa-east"],[/обход тольятти/iu,"tolyatti"],
 [/северный обход одинцова/iu,"odintsovo"],[/проспект багратиона/iu,"bagration"],
 [/вознесенский тракт/iu,"voznesensky"],[/обход хабаровска/iu,"khabarovsk"],
 [/зсд/iu,"zsd"],[/шмсд/iu,"shmsd"],[/московский скоростной диаметр/iu,"msd"]
];
function inspectNationwideCandidates(catalog,segments,signals={}){
 const names=Array.isArray(segments)?segments.filter(n=>typeof n==="string"):[];
 const found=new Set();
 for(const raw of names){for(const [pattern,id] of candidates)if(pattern.test(raw))found.add(id);}
 // Prefer actual same-route engine evidence when legacy checkpoint-based
 // segment estimates miss a physically crossed toll road altogether.
 const keys=[["m4","m4StrictPvpCount"],["m11","m11Candidate"],["m12","m12Candidate"],["ckad","ckadCandidate"]];
 for(const [id,key] of keys)if(key==="m4StrictPvpCount" ? Number.isSafeInteger(signals[key])&&signals[key]>0 : signals[key]===true)found.add(id);
 const matched=catalog.networks.filter(n=>found.has(n.id)).map(n=>({
  id:n.id,name:n.name,status:n.id==="m4"&&signals.m4StrictPvpCount>0?"strict_pvp_found_full_price_unverified":"candidate_unverified",
  hasReferenceFare:Object.prototype.hasOwnProperty.call(catalog.operatorFares,n.id),
  operator:n.operator
 }));
 return {catalogNetworkCount:catalog.networks.length,candidateNetworks:matched,
  catalogWithReferenceFares:Object.keys(catalog.operatorFares).length,
  exactCrossingVerified:false,newFareApplied:false,
  reason:"geometry_candidate_is_not_map_matched_paid_passage"};
}
export {inspectNationwideCandidates};
