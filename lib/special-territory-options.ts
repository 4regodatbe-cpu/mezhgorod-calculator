export type GeographicRouteCandidate = {
 corridor:"mainland"|"crimea";
 provider:string;
 fast:{
  seconds:number;
  tollValidation?:{status:string};
  tolls:{pricingStatus:"priced"|"free"|"unknown"};
 };
};
/** Select no more than one candidate from the coordinate-selected corridor. */
export function selectGeographicTerritoryOption<T extends GeographicRouteCandidate>(
 candidates:T[],
 preferredCorridor:"mainland"|"crimea",
){
 const isPaid=(item:T)=>item.fast.tolls.pricingStatus==="priced"||item.fast.tollValidation?.status==="toll";
 const eligible=candidates.filter(item=>item.corridor===preferredCorridor);
 const options=[...eligible].sort((a,b)=>Number(isPaid(b))-Number(isPaid(a))||a.fast.seconds-b.fast.seconds).slice(0,1);
 return {options,preferredCorridor,routePolicy:"geographic-zone" as const};
}
