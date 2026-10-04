import { valhalla, osrmRoute, type Located, type RouteWithGeometry } from "../route-providers";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../special-territory-boundaries";
import { analyzeRoute, candidatePlans, followsPlan } from "../special-territory-policy";
import { selectTimedTerritoryOptions } from "../special-territory-time";
import { calculateLegTolls } from "./route-leg-pricing";
import { tollsForApi } from "./free-route-selection";

export async function calculateSpecialOptions(from:Located,to:Located,departureAt?:string) {
  const plans=candidatePlans(from.position,to.position,zones);
  const preferredCorridor=plans[0]?.corridor??"mainland";
  const candidates = await Promise.all(plans.map(async plan => {
    const responses=await Promise.allSettled([valhalla(from,to,1,plan.positions),osrmRoute(from,to,plan.positions)]);
    const priced=await Promise.all(responses.map(async (response,index) => {
      if(response.status!=="fulfilled")return null;
      try {
        let route:RouteWithGeometry=response.value;
        if(!followsPlan(route.coordinates,plan.positions,plan.corridor,true))return null;
        analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
        const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
        const priced=await calculateLegTolls({routeGeometry:route.coordinates,routeSeconds:route.seconds,departureAt,selectedFastProvider:index===0?"Valhalla":"OSRM",selectedFastRoute:route,valhallaEvidence:index===0?route:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
        return {corridor:plan.corridor,provider:index===0?"Valhalla":"OSRM",split,from:from.label,to:to.label,fast:{...route,tolls:tollsForApi(priced.tolls,priced.fastValidation),tollValidation:priced.fastValidation},free:null,freeCandidate:null};
      } catch {return null;}
    }));
    return priced.filter(item=>item!==null);
  }));
  const selection=selectTimedTerritoryOptions(candidates.flat(),preferredCorridor);
  if(!selection.options.length)throw new Error("MAINLAND_UNAVAILABLE");
  return selection;
}
