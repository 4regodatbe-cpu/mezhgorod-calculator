export type GeographicRouteCandidate = {
 corridor:"mainland"|"crimea";
 provider:string;
 fast:{
  seconds:number;
  tollValidation?:{status:string};
  tolls:{pricingStatus:"priced"|"free"|"unknown"};
 };
 selectionPreference?:number;
};
/** Keep the best main route and one distinct alternative in the selected corridor. */
export function selectGeographicTerritoryOption<T extends GeographicRouteCandidate>(
 candidates:T[],
 preferredCorridor:"mainland"|"crimea",
){
 const isPaid=(item:T)=>item.fast.tolls.pricingStatus==="priced"||item.fast.tollValidation?.status==="toll";
 const eligible=candidates.filter(item=>item.corridor===preferredCorridor);
 const ranked=[...eligible].sort((a,b)=>Number(isPaid(b))-Number(isPaid(a))||(a.selectionPreference??0)-(b.selectionPreference??0)||a.fast.seconds-b.fast.seconds);
 const main=ranked[0];
 const alternative=ranked.find(item=>item!==main && Math.abs(item.fast.seconds-main.fast.seconds)>60);
 const options=main?[main,...(alternative?[alternative]:[])]:[];
 return {options,preferredCorridor,routePolicy:"geographic-zone" as const};
}
