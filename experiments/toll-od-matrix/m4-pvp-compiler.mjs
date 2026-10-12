import {validateM4PvpMatrix} from "./m4-pvp-corridor.mjs";

// OFFLINE ONLY: aggregate verified PVP tariff rows into one stored fare pair per continuous span.
// Customer-time quote never executes this summation.
function compileVerifiedM4Tariffs(template,input){
 const error=s=>{throw Error("M4_SPAN_COMPILE:"+s)};
 const iso=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+"T00:00:00Z").toISOString().startsWith(s);
 const amount=n=>Number.isSafeInteger(n)&&n>=0;
 const key=pair=>[...pair].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3))).join("|");
 if(!template||template.schemaVersion!==2||template.systemId!=="m4-don"||template.runtimeEnabled!==false||!Array.isArray(template.knownPvps)||!Array.isArray(template.spanCells)||template.spanCells.length)error("template_not_empty_or_wrong_schema");
 if(!input||input.schemaVersion!==2||input.systemId!=="m4-don"||!Array.isArray(input.records))error("bad_input");
 const known=new Set(template.knownPvps),recordIds=new Set(),groups=new Map();
 for(const rec of input.records){
  if(!rec||typeof rec.id!=="string"||recordIds.has(rec.id))error("record_id");recordIds.add(rec.id);
  const endpoints=rec.endpoints;
  if(!Array.isArray(endpoints)||endpoints.length!==2||endpoints.some(id=>!known.has(id))||key(endpoints)!==endpoints.join("|"))error("span_endpoints");
  if(!Array.isArray(rec.chains)||!rec.chains.length)error("missing_chains");
  const proof=rec.proof;
  if(!proof||typeof rec.routeId!=="string"||proof.routeId!==rec.routeId||proof.sameSelectedGeometry!==true||proof.completePvpCoverage!==true||proof.continuousMainline!==true||proof.reentryStatus!=="not_observed"||proof.reviewedBy!=="manual_checked"||!iso(proof.reviewedAt))error("route_proof");
  const src=rec.source;
  if(!src||src.category!=="I"||src.payment!=="no_transponder"||!iso(src.effectiveFrom)||(src.effectiveTo!==null&&(!iso(src.effectiveTo)||src.effectiveTo<src.effectiveFrom))||!iso(src.capturedAt)||!src.documentId||typeof src.url!=="string"||!/^https:\/\/(?:www\.)?(?:avtodor-tr\.ru|avtodor-tpass\.ru)(?:\/|$)/.test(src.url))error("official_tariff_source");
  const chainTotals=[];
  const seenChains=new Set();
  for(const item of rec.chains){
   const sequence=item?.sequence;
   if(!Array.isArray(sequence)||sequence.length<2||sequence.some(id=>!known.has(id))||new Set(sequence).size!==sequence.length)error("chain");
   const sorted=[...known].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3)));
   const completeSpan=sorted.filter(id=>Number(id.slice(3))>=Number(endpoints[0].slice(3))&&Number(id.slice(3))<=Number(endpoints[1].slice(3)));
   if(sequence[0]!==endpoints[0]||sequence.at(-1)!==endpoints[1]||sequence.join("|")!==completeSpan.join("|"))error("chain_order_or_endpoints_or_missing_intermediate_pvp");
   const chainKey=sequence.join(">");
   if(seenChains.has(chainKey))error("duplicate_chain");seenChains.add(chainKey);
   if(!Array.isArray(item.charges)||item.charges.length!==sequence.length||item.charges.some((c,i)=>c?.pvpId!==sequence[i]||!Array.isArray(c.parts)||!c.parts.length))error("charge_chain_mismatch");
   let monThu=0,friSun=0;
   for(const charge of item.charges){
    const partIds=new Set();
    for(const part of charge.parts){
     if(!part||typeof part.sourceRowId!=="string"||!part.sourceRowId||partIds.has(part.sourceRowId)||!amount(part.monThu)||!amount(part.friSun))error("invalid_charge_part");
     partIds.add(part.sourceRowId);monThu+=part.monThu;friSun+=part.friSun;
     if(!amount(monThu)||!amount(friSun))error("amount_overflow");
    }
   }
   chainTotals.push({sequence,monThu,friSun});
  }
  if(chainTotals.some(x=>x.monThu!==chainTotals[0].monThu||x.friSun!==chainTotals[0].friSun))error("different_chain_cost_for_same_span");
  // An independently published/observed whole-route figure is a useful control, not a prerequisite or runtime fare.
  if(rec.routeControl&&(!amount(rec.routeControl.monThu)||!amount(rec.routeControl.friSun)))error("invalid_optional_route_control");
  if(rec.routeControl&&(rec.routeControl.monThu!==chainTotals[0].monThu||rec.routeControl.friSun!==chainTotals[0].friSun))error("route_control_mismatch");
  const groupKey=[key(endpoints),src.effectiveFrom,src.effectiveTo??"open"].join("|");
  const cell={endpoints:[...endpoints],acceptedChains:chainTotals.map(x=>x.sequence),prices:{monThu:chainTotals[0].monThu,friSun:chainTotals[0].friSun},source:{kind:"verified_span_tariff",url:src.url,effectiveFrom:src.effectiveFrom,effectiveTo:src.effectiveTo,documentId:src.documentId,capturedAt:src.capturedAt}};
  if(groups.has(groupKey)){
   const prior=groups.get(groupKey);
   if(prior.prices.monThu!==cell.prices.monThu||prior.prices.friSun!==cell.prices.friSun)error("different_price_for_same_span");
   prior.acceptedChains.push(...cell.acceptedChains);
  }else groups.set(groupKey,cell);
 }
 const spanCells=[...groups.values()];
 for(const cell of spanCells)if(new Set(cell.acceptedChains.map(c=>c.join(">"))).size!==cell.acceptedChains.length)error("duplicate_chain_across_records");
 const result={...template,spanCells,readiness:spanCells.length?"offline_source_compiled_not_live":"no_verified_m4_span_prices"};
 try{validateM4PvpMatrix(result);}catch(e){error("compiled_matrix_conflict:"+String(e));}
 return result;
}
export {compileVerifiedM4Tariffs};
