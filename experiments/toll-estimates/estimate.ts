import validity from '../nationwide-tolls/engine/fare-validity.cjs';

export const TOLL_ESTIMATES_DEFAULT = false;
export const ESTIMATE_LIMITS = {components:64,coverageKeys:512,alternatives:32} as const;
export type Conditions = Readonly<{road:string; operator:string; product:string; direction:string; category:string; payment:string; profile:string}>;
export type StrictSnapshot = Readonly<{pricingStatus:string; amount:number|null; priceConfirmation:string}>;
export type TariffQuote = Readonly<{
 conditions:Conditions; routeId:string; geometrySha256:string; departureAt:string;
 rub:number; profile:string; validity:'resolved'|'unknown'; source:string;
 assurance:'confirmed'|'working_estimate'; zeroFareConfirmed?:boolean;
}>;
export type EstimateComponent = Readonly<{
 id:string; conditions:Conditions; entry:string|null; exit:string|null;
 family:string; aggregate:boolean; coverageKeys:readonly string[];
 scope:Readonly<{proven:boolean; reference:string; routeId:string; geometrySha256:string}>;
 quote?:TariffQuote;
 alternatives?:Readonly<{exhaustive:boolean; reference:string; quotes:readonly TariffQuote[]}>;
 stopReason?:string;
}>;
export type EstimateInput = Readonly<{
 routeId:string; geometrySha256:string; departureAt:string;
 coverageComplete:boolean; requiredCoverage:readonly string[];
 confirmedNoPaidCrossing?:boolean; components:readonly EstimateComponent[];
 strict:StrictSnapshot;
}>;
export type Assessment = Readonly<{
 id:string; conditions:Conditions; entry:string|null; exit:string|null; coverageKeys:readonly string[];
 status:'confirmed'|'estimated'|'unknown'; rub:number|null;
 range:Readonly<{min:number;max:number}>|null;
 method:'direct_quote'|'retained_working_quote'|'comparable_upper_bound'|null;
 sources:readonly string[]; reason:string;
}>;
export type EstimateResult = Readonly<{
 status:'disabled'|'confirmed'|'estimated'|'insufficient'; totalRub:number|null;
 confirmedSubtotalRub:number|null; assessedSubtotalRub:number|null;
 missingCoverage:readonly string[]; components:readonly Assessment[];
 reasons:readonly string[]; strict:StrictSnapshot;
}>;

const nonempty=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
const hash=(value:string)=>/^[a-f0-9]{64}$/u.test(value);
const money=(value:number)=>Number.isSafeInteger(value)&&value>=0;
const conditionKeys=['road','operator','product','direction','category','payment','profile'] as const;
function validQuote(q:TariffQuote,c:EstimateComponent,input:EstimateInput):boolean {
 return conditionKeys.every(k=>nonempty(q.conditions[k])&&q.conditions[k]===c.conditions[k])&&
  q.routeId===input.routeId&&q.geometrySha256===input.geometrySha256&&
  validity.validInstant(q.departureAt)&&new Date(q.departureAt).getTime()===new Date(input.departureAt).getTime()&&
  q.validity==='resolved'&&nonempty(q.profile)&&q.profile===c.conditions.profile&&nonempty(q.source)&&money(q.rub)&&
  (q.rub!==0||q.zeroFareConfirmed===true);
}
function assess(c:EstimateComponent,input:EstimateInput):Assessment {
 const base={id:c.id,conditions:c.conditions,entry:c.entry,exit:c.exit,coverageKeys:c.coverageKeys};
 const unknown=(reason:string):Assessment=>({...base,status:'unknown',rub:null,range:null,method:null,sources:[],reason});
 if(c.stopReason)return unknown(c.stopReason);
 if(!c.scope.proven||!nonempty(c.scope.reference)||c.scope.routeId!==input.routeId||c.scope.geometrySha256!==input.geometrySha256)
  return unknown('route_or_product_scope_not_proven');
 if(!nonempty(c.id)||!nonempty(c.family)||!c.coverageKeys.length||c.coverageKeys.some(k=>!nonempty(k))||
  new Set(c.coverageKeys).size!==c.coverageKeys.length)return unknown('invalid_component_identity_or_coverage');
 if(c.quote&&c.alternatives)return unknown('multiple_competing_estimation_methods');
 if(c.quote){
  const q=c.quote;if(!validQuote(q,c,input))return unknown('incompatible_or_unresolved_quote');
  const confirmed=q.assurance==='confirmed';
  return {...base,status:confirmed?'confirmed':'estimated',rub:q.rub,range:{min:q.rub,max:q.rub},
   method:confirmed?'direct_quote':'retained_working_quote',sources:[q.source,c.scope.reference],
   reason:confirmed?'source_bound_quote_at_departure':'existing_numeric_working_quote_not_promoted_to_confirmation'};
 }
 const a=c.alternatives;
 if(!a?.exhaustive||!nonempty(a.reference)||!a.quotes.length||a.quotes.length>ESTIMATE_LIMITS.alternatives)return unknown('no_complete_bounded_comparable_alternatives');
 if(a.quotes.some(q=>!validQuote(q,c,input)||q.assurance!=='confirmed')||new Set(a.quotes.map(q=>q.profile)).size!==1)
  return unknown('incompatible_alternatives_do_not_bound_this_product');
 const amounts=a.quotes.map(q=>q.rub),min=Math.min(...amounts),max=Math.max(...amounts);
 return {...base,status:'estimated',rub:max,range:{min,max},method:'comparable_upper_bound',
  sources:[...new Set([...a.quotes.map(q=>q.source),a.reference,c.scope.reference])],
  reason:'conservative_upper_bound_of_exhaustive_same_product_direction_profile_conditions'};
}

/** Separate disabled-by-default shadow result; strict object and route selection are never mutated. */
export function estimateRouteTolls(input:EstimateInput,options:Readonly<{enabled?:boolean}>={}):EstimateResult {
 const disabled:EstimateResult={status:'disabled',totalRub:null,confirmedSubtotalRub:null,assessedSubtotalRub:null,
  missingCoverage:[],components:[],reasons:['estimate_module_disabled'],strict:input.strict};
 if(options.enabled!==true)return disabled;
 const stop=(reason:string,components:readonly Assessment[]=[]):EstimateResult=>({...disabled,status:'insufficient',components,
  missingCoverage:[...input.requiredCoverage],reasons:[reason]});
 if(!nonempty(input.routeId)||!hash(input.geometrySha256)||!validity.validInstant(input.departureAt))return stop('invalid_route_or_calendar_date');
 if(input.components.length>ESTIMATE_LIMITS.components||input.requiredCoverage.length>ESTIMATE_LIMITS.coverageKeys||input.components.some(c=>c.coverageKeys.length>ESTIMATE_LIMITS.coverageKeys))return stop('local_estimate_work_limit');
 if(input.requiredCoverage.some(k=>!nonempty(k))||new Set(input.requiredCoverage).size!==input.requiredCoverage.length)
  return stop('invalid_required_coverage_inventory');
 if(input.components.some(c=>c.coverageKeys.some(k=>!input.requiredCoverage.includes(k))))return stop('unexpected_product_outside_inventory');
 if(new Set(input.components.map(c=>c.id)).size!==input.components.length)return stop('duplicate_component_id');
 for(let i=0;i<input.components.length;i++)for(let j=i+1;j<input.components.length;j++){
  const a=input.components[i],b=input.components[j];
  if(a.coverageKeys.some(k=>b.coverageKeys.includes(k))||(a.family===b.family&&(a.aggregate||b.aggregate)))
   return stop('overlapping_product_or_aggregate_coverage');
 }
 const parts=input.components.map(c=>assess(c,input));
 const confirmed=parts.filter(c=>c.status==='confirmed'),valued=parts.filter(c=>c.rub!==null);
 const sum=(values:readonly Assessment[])=>values.reduce((total,c)=>total+c.rub!,0);
 const known=sum(confirmed),assessed=sum(valued);
 if(!money(known)||!money(assessed))return stop('unsafe_monetary_total',parts);
 const covered=new Set(valued.flatMap(c=>[...c.coverageKeys]));
 const missing=input.requiredCoverage.filter(k=>!covered.has(k));
 const complete=input.coverageComplete&&missing.length===0&&parts.every(c=>c.status!=='unknown')&&
  (input.requiredCoverage.length>0||input.confirmedNoPaidCrossing===true);
 if(input.strict.pricingStatus==='priced'&&input.strict.priceConfirmation==='confirmed'&&complete&&input.strict.amount!==assessed)
  return stop('confirmed_strict_total_conflict',parts);
 return {status:complete?(parts.some(c=>c.status==='estimated')?'estimated':'confirmed'):'insufficient',
  totalRub:complete?assessed:null,confirmedSubtotalRub:confirmed.length?known:null,assessedSubtotalRub:valued.length?assessed:null,
  missingCoverage:missing,components:parts,strict:input.strict,
  reasons:complete?[]:[...(!input.coverageComplete?['paid_coverage_inventory_incomplete']:[]),
   ...(missing.length?['unassessed_required_products']:[]),
   ...(!input.requiredCoverage.length&&!input.confirmedNoPaidCrossing?['free_route_not_confirmed']:[]),
   ...parts.filter(c=>c.status==='unknown').map(c=>`${c.id}:${c.reason}`)]};
}
