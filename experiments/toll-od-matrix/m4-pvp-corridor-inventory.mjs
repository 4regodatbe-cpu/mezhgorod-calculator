// Offline finite span inventory only; candidate rows are not verified routes or prices.
export function enumerateM4PvpSpans(knownPvps){
 if(!Array.isArray(knownPvps)||knownPvps.length<2)throw Error("insufficient_pvps");
 const items=knownPvps.map(id=>{
  if(typeof id!=="string"||!/^m4-[1-9][0-9]*$/.test(id))throw Error("invalid_pvp");
  return {id,km:Number(id.slice(3))};
 });
 if(new Set(items.map(x=>x.id)).size!==items.length||items.some(x=>!Number.isSafeInteger(x.km)))throw Error("duplicate_pvp");
 items.sort((a,b)=>a.km-b.km);
 const rows=[];
 for(let i=0;i<items.length-1;i++)for(let j=i+1;j<items.length;j++){
  const chain=items.slice(i,j+1).map(x=>x.id),flags=[];
  if(chain.some(x=>x==="m4-416"||x==="m4-460"))flags.push("mixed401_tariff_requires_source_review");
  if(chain.some(x=>x==="m4-636"||x==="m4-672"))flags.push("mixed633_tariff_requires_source_review");
  if(chain.includes("m4-339")&&chain.includes("m4-355"))flags.push("alternative_339_355_chain_requires_route_resolution");
  if(chain.includes("m4-545"))flags.push("545_multiple_rows_require_one_precomputed_span_total");
  rows.push({key:items[i].id+"|"+items[j].id,endpoints:[items[i].id,items[j].id],candidateChain:chain,flags,prices:null,status:"hypothesis_not_verified_span"});
 }
 return rows;
}
export {enumerateM4PvpSpans as enumerateM4PvpSignatures};
