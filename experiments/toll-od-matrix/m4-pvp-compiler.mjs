import {validateM4PvpMatrix} from "./m4-pvp-corridor.mjs";

// OFFLINE ONLY. A valid operator URL and an asserted review do not independently authenticate data.
// Actual corpus is empty until human-verifiable signed/source-backed route totals exist.
function compileVerifiedM4Tariffs(template,input){
  const error=s=>{throw Error("M4_COMPILE:"+s)};
  const iso=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !isNaN(d.getTime())&&d.toISOString().startsWith(s)};
  const amount=v=>Number.isSafeInteger(v)&&v>=0;
  if(!template||template.systemId!=="m4-don"||template.runtimeEnabled!==false||!Array.isArray(template.knownPvps)||!Array.isArray(template.priceCells)||template.priceCells.length)error("template_not_empty");
  if(!input||input.schemaVersion!==1||input.systemId!=="m4-don"||!Array.isArray(input.records))error("bad_input");
  const known=new Set(template.knownPvps),ids=new Set(),cells=[];
  for(const rec of input.records){
    if(!rec||!rec.id||ids.has(rec.id))error("record_id");ids.add(rec.id);
    const sq=rec.sequence;
    if(!Array.isArray(sq)||!sq.length||new Set(sq).size!==sq.length||sq.some(id=>!known.has(id))||!["to_moscow","to_krasnodar"].includes(rec.direction))error("sequence");
    const km=sq.map(id=>+id.slice(3));
    for(let i=1;i<km.length;i++)if(rec.direction==="to_moscow"?km[i]>=km[i-1]:km[i]<=km[i-1])error("direction_order");
    const ctx=rec.context;
    if(!ctx||!["not_used","within_limit","exceeded_limit"].includes(ctx.mixed401)||!["not_used","within_limit","exceeded_limit"].includes(ctx.mixed633))error("mixed_context");
    const is401=sq.some(x=>x==="m4-416"||x==="m4-460"),is633=sq.some(x=>x==="m4-636"||x==="m4-672");
    if(is401===(ctx.mixed401==="not_used")||is633===(ctx.mixed633==="not_used"))error("mixed_context_contradiction");
    const proof=rec.proof;
    if(!proof||!rec.routeId||proof.routeId!==rec.routeId||proof.sameSelectedGeometry!==true||proof.completePvpCoverage!==true||proof.continuousMainline!==true||proof.officialTotalIndependentlyVerified!==true||proof.reviewedBy!=="manual_checked"||!iso(proof.reviewedAt))error("unverified_geometry_or_total");
    const src=rec.source;
    if(!src||src.kind!=="official_verified_corridor"||src.category!=="I"||src.payment!=="no_transponder"||!iso(src.effectiveFrom)||(src.effectiveTo!==null&&(!iso(src.effectiveTo)||src.effectiveTo<src.effectiveFrom))||!iso(src.capturedAt)||!src.documentId||typeof src.url!=="string"||!/^https:\/\/(?:www\.)?(?:avtodor-tr\.ru|avtodor-tpass\.ru)(?:\/|$)/.test(src.url))error("unverified_operator_document");
    const ev=rec.events;
    if(!Array.isArray(ev)||ev.length!==sq.length||ev.some((x,i)=>x?.pvpId!==sq[i]))error("event_sequence_mismatch");
    let monThu=0,friSun=0;
    for(const e of ev){
      if(!["paid","receipt_covered","mixed_exit_no_extra"].includes(e.disposition)||!Array.isArray(e.parts)||e.parts.length<1||e.parts.length>(e.pvpId==="m4-545"?2:1))error("charge_parts");
      const rowIds=new Set();
      for(const p of e.parts){
        if(!p||!p.officialRowId||rowIds.has(p.officialRowId)||!amount(p.monThu)||!amount(p.friSun))error("invalid_part");
        rowIds.add(p.officialRowId);monThu+=p.monThu;friSun+=p.friSun;
        if(!amount(monThu)||!amount(friSun))error("amount_overflow");
      }
      if(e.disposition!=="paid"&&(e.parts.length!==1||e.parts[0].monThu!==0||e.parts[0].friSun!==0))error("zero_charge_not_proven");
    }
    const d339=ev.find(x=>x.pvpId==="m4-339"),d355=ev.find(x=>x.pvpId==="m4-355");
    if(d339&&d355){
      if(rec.direction==="to_moscow"?(d355.disposition!=="paid"||d339.disposition!=="receipt_covered"):(d339.disposition!=="paid"||d355.disposition!=="receipt_covered"))error("339_355_double_charge");
    }
    for(const [contextKey,pvpIds] of [["mixed401",["m4-416","m4-460"]],["mixed633",["m4-636","m4-672"]]]){
      const found=ev.filter(x=>pvpIds.includes(x.pvpId));
      if(found.length===2){
        const nPaid=found.filter(x=>x.disposition==="paid").length;
        if(ctx[contextKey]==="within_limit"&&nPaid!==1)error("mixed_window_double_charge");
        if(ctx[contextKey]==="exceeded_limit"&&nPaid!==2)error("mixed_extra_charge_unverified");
      }
    }
    if(!rec.operatorTotal||rec.operatorTotal.monThu!==monThu||rec.operatorTotal.friSun!==friSun)error("independent_total_mismatch");
    cells.push({direction:rec.direction,sequence:[...sq],context:{...ctx},prices:{monThu,friSun},source:{kind:"official_verified_corridor",url:src.url,effectiveFrom:src.effectiveFrom,effectiveTo:src.effectiveTo,documentId:src.documentId,reviewedAt:proof.reviewedAt}});
  }
  const result={...template,priceCells:cells,readiness:cells.length?"offline_source_compiled_not_live":"no_confirmed_end_to_end_m4_tariff_cells"};
  // Shared validator guards duplicate price signatures and overlapping tariff periods.
  try { validateM4PvpMatrix(result); } catch (e) { error("compiled_matrix_conflict:"+String(e)); }
  return result;
}
export {compileVerifiedM4Tariffs};
