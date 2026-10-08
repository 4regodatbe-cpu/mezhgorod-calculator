// Sandboxed OD lookup only. Not imported into production calculator.
function validateMatrix(m){
 if(m?.schemaVersion!==1||m.runtimeEnabled!==false||!Array.isArray(m.pairs)||!Array.isArray(m.points))throw Error("invalid_catalog");
 const points=new Set(m.points),keys=new Set();
 if(points.size!==m.points.length)throw Error("duplicate_points");
 for(const p of m.pairs){
  if(!points.has(p.entry)||!points.has(p.exit)||p.entry===p.exit)throw Error("invalid_endpoints");
  if(p.systemId!==m.source.systemId||p.category!=="I"||p.currency!=="RUB"||p.evidence!=="official_direct_pair")throw Error("invalid_provenance");
  const key=[p.systemId,p.entry,p.exit].join("|");
  if(keys.has(key))throw Error("duplicate_direction");
  keys.add(key);
  for(const profile of m.profiles)if(!Number.isSafeInteger(p.prices?.[profile])||p.prices[profile]<0)throw Error("invalid_price");
 }
 return true;
}

function calculateOD(m,request){
 validateMatrix(m);
 const fail=(reason,parts=[])=>({status:"unknown",amountRub:null,reason,parts,diagnosticOnly:true});
 const {routeId,profile,traversals,independentlyVerifiedFree}=request??{};
 if(!m.profiles.includes(profile))return fail("invalid_profile");
 if(typeof routeId!=="string"||!routeId)return fail("missing_route_id");
 if(!Array.isArray(traversals))return fail("missing_traversal_inventory");
 if(!traversals.length)return independentlyVerifiedFree===true?{status:"free",amountRub:0,reason:null,parts:[],diagnosticOnly:true}:fail("no_crossings_not_proof_of_free");
 let sum=0;const ids=new Set(),parts=[];
 for(const x of traversals){
  if(typeof x?.id!=="string"||!x.id||ids.has(x.id))return fail("missing_or_duplicate_traversal_id",parts);
  ids.add(x.id);
  if(x.proof?.status!=="confirmed"||x.proof?.routeId!==routeId||x.proof?.geometryComplete!==true||x.proof?.entryExitVerified!==true)return fail("cross_route_or_unverified_boundaries",parts);
  if(x.entry===x.exit)return fail("same_point_unverified",parts);
  const hits=m.pairs.filter(p=>p.systemId===x.systemId&&p.entry===x.entry&&p.exit===x.exit);
  if(hits.length!==1)return fail("directed_pair_not_verified",parts);
  const value=hits[0].prices[profile];if(!Number.isSafeInteger(value)||value<0)return fail("invalid_price",parts);
  sum+=value;if(!Number.isSafeInteger(sum))return fail("amount_overflow",parts);
  parts.push({id:x.id,systemId:x.systemId,entry:x.entry,exit:x.exit,amountRub:value});
 }
 return {status:"priced",amountRub:sum,reason:null,parts,diagnosticOnly:true};
}

export {validateMatrix, calculateOD};
