export type TollRoad = "M4" | "M11" | "M12" | "CKAD";
export type BenchmarkCase = { id:string; road:TollRoad; from:string; to:string; expectedTollRub:number|null; controlSource:string; expectToll:boolean };
export type ProviderObservation = { caseId:string; provider:string; routeCompatible:boolean|null; tollDetected:boolean|null; amountRub:number|null; currency:string|null; failure:string|null; observedAt:string };
export type CaseAssessment = { caseId:string; usable:boolean; coverage:"hit"|"miss"|"unknown"; amountDeviationPercent:number|null; failure:string|null };

export function assessExternalToll(caseDef: BenchmarkCase, obs: ProviderObservation): CaseAssessment {
  if (obs.failure) return {caseId:caseDef.id,usable:false,coverage:"unknown",amountDeviationPercent:null,failure:obs.failure};
  if (obs.routeCompatible === false) return {caseId:caseDef.id,usable:false,coverage:"unknown",amountDeviationPercent:null,failure:"route-incompatible"};
  if (obs.tollDetected == null) return {caseId:caseDef.id,usable:false,coverage:"unknown",amountDeviationPercent:null,failure:"toll-coverage-unknown"};
  const coverage = caseDef.expectToll ? (obs.tollDetected ? "hit" : "miss") : (!obs.tollDetected ? "hit" : "miss");
  if (obs.amountRub != null && obs.currency !== "RUB") return {caseId:caseDef.id,usable:false,coverage,amountDeviationPercent:null,failure:"currency-mismatch"};
  if (caseDef.expectToll && obs.tollDetected && obs.amountRub == null) return {caseId:caseDef.id,usable:false,coverage,amountDeviationPercent:null,failure:"toll-detected-unpriced"};
  let amountDeviationPercent:null|number=null;
  if (caseDef.expectedTollRub != null && obs.amountRub != null) {
    if (caseDef.expectedTollRub === 0) amountDeviationPercent = obs.amountRub === 0 ? 0 : 100;
    else amountDeviationPercent=Math.round(Math.abs(obs.amountRub-caseDef.expectedTollRub)/caseDef.expectedTollRub*1000)/10;
  }
  return {caseId:caseDef.id,usable:coverage==="hit",coverage,amountDeviationPercent,failure:null};
}

export function summarizeBenchmark(cases: BenchmarkCase[], observations: ProviderObservation[]) {
  const byId=new Map(observations.map(o=>[o.caseId,o]));
  const assessments=cases.map(c=>byId.has(c.id)?assessExternalToll(c,byId.get(c.id)!):({caseId:c.id,usable:false,coverage:"unknown",amountDeviationPercent:null,failure:"not-observed"} as CaseAssessment));
  const observed=assessments.filter(a=>a.failure!=="not-observed");
  const coverageKnown=observed.filter(a=>a.coverage!=="unknown");
  const amountScored=observed.filter(a=>a.amountDeviationPercent!=null);
  const perRoad=Object.fromEntries((["M4","M11","M12","CKAD"] as TollRoad[]).map(road=>{
    const ids=new Set(cases.filter(c=>c.road===road).map(c=>c.id)); const rows=assessments.filter(a=>ids.has(a.caseId));
    return [road,{cases:rows.length,observed:rows.filter(a=>a.failure!=="not-observed").length,coverageHits:rows.filter(a=>a.coverage==="hit").length,coverageMisses:rows.filter(a=>a.coverage==="miss").length}];
  }));
  return {cases:cases.length,observed:observed.length,coverageAccuracyPercent:coverageKnown.length?Math.round(coverageKnown.filter(a=>a.coverage==="hit").length/coverageKnown.length*1000)/10:null,amountCases:amountScored.length,meanAmountDeviationPercent:amountScored.length?Math.round(amountScored.reduce((s,a)=>s+(a.amountDeviationPercent??0),0)/amountScored.length*10)/10:null,perRoad,assessments};
}
