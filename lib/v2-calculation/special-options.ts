import { valhalla, osrmRoute, type Located, type RouteWithGeometry } from "../route-providers";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../special-territory-boundaries";
import { analyzeRoute, candidatePlans, findPlanLegStretchAnomaly, followsPlan } from "../special-territory-policy";
import { selectGeographicTerritoryOption } from "../special-territory-options";
import { selectLiveRouteCandidates } from "../route-quality";
import { calculateLegTolls } from "./route-leg-pricing";
import { hasPracticalSavings, tollsForApi, withinDetourLimits } from "./free-route-selection";
import { validateTollEdges } from "../toll-validator";

export async function calculateSpecialOptions(from:Located,to:Located,departureAt?:string) {
  const plans=candidatePlans(from.position,to.position,zones);
  const preferredCorridor=plans[0]?.corridor??"mainland";
  const candidates = await Promise.all(plans.map(async plan => {
    const rejectedStretchProviders=new Map<string,number>();
    const responses=await Promise.allSettled([valhalla(from,to,1,plan.positions),osrmRoute(from,to,plan.positions)]);
    const priced=await Promise.all(responses.map(async (response,index) => {
      if(response.status!=="fulfilled")return null;
      try {
        const route:RouteWithGeometry=response.value;
        const providerName=index===0?"Valhalla":"OSRM";
        const stretch=findPlanLegStretchAnomaly(route.coordinates,plan.positions);
        if(stretch){rejectedStretchProviders.set(providerName,stretch.stretchRatio);return null;}
        if(!followsPlan(route.coordinates,plan.positions,plan.corridor,true))return null;
        const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
        const pricing=await calculateLegTolls({routeGeometry:route.coordinates,routeSeconds:route.seconds,departureAt,selectedFastProvider:index===0?"Valhalla":"OSRM",selectedFastRoute:route,valhallaEvidence:index===0?route:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
        return {corridor:plan.corridor,provider:index===0?"Valhalla":"OSRM",split,from:from.label,to:to.label,fast:{...route,tolls:tollsForApi(pricing.tolls,pricing.fastValidation),tollValidation:pricing.fastValidation},free:null,freeCandidate:null};
      } catch {return null;}
    }));
    const valid=priced.filter((item):item is NonNullable<typeof item>=>item!==null);
    if(!valid.length)return [];
    const routeChoice=selectLiveRouteCandidates(valid.map(item=>({name:item.provider,route:item.fast})));
    const quality=rejectedStretchProviders.size?{
      ...routeChoice.quality,
      status:"warning" as const,
      providers:[...new Set([...routeChoice.quality.providers,...rejectedStretchProviders.keys()])],
      message:`Отклонён маршрут с аномальной длиной контрольного сегмента: ${[...rejectedStretchProviders].map(([name,ratio])=>`${name} (${ratio.toFixed(1)}×)`).join(", ")}. Проверьте оставшийся маршрут перед поездкой`,
    }:routeChoice.quality;
    const selected=valid.map(item=>({
      ...item,
      selectionPreference:item.provider===routeChoice.provider?0:1,
      fast:{...item.fast,quality},
    }));
    // If independent providers returned only one usable path, ask Valhalla for
    // a payment-point-avoiding path through the exact same geographic controls.
    // Keep it only after geometry, corridor and detour checks pass.
    const main=selected.find(item=>item.selectionPreference===0)??selected[0];
    if(selected.length<2){
      for(const penalty of [900,1800]){
        try{
          const route=await valhalla(from,to,1,plan.positions,penalty);
          if(!withinDetourLimits(main.fast,route)||!hasPracticalSavings(main.fast,route)||!followsPlan(route.coordinates,plan.positions,plan.corridor,true))continue;
          if(route.coordinates.length<3)continue;
          const validation=await validateTollEdges(route.coordinates);
          if(validation.complete!==true||(validation.tollBoothCount??0)!==0)continue;
          const duplicate=selected.some(item=>Math.abs(item.fast.meters-route.meters)<3000&&Math.abs(item.fast.seconds-route.seconds)<120);
          if(duplicate)continue;
          const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
          const tolls=await calculateLegTolls({routeGeometry:route.coordinates,routeSeconds:route.seconds,departureAt,selectedFastProvider:"Valhalla",selectedFastRoute:route,valhallaEvidence:route,confirmedFreeRoute:null,diagnosticFastValidation:validation});
          selected.push({corridor:plan.corridor,provider:"Valhalla payment-point bypass",split,from:from.label,to:to.label,fast:{...route,tolls:tollsForApi(tolls.tolls,tolls.fastValidation),tollValidation:validation,quality:{...quality,status:"single" as const,message:"Альтернативный маршрут с объездом пунктов оплаты; проверен по геометрии маршрута"}},free:null,freeCandidate:null,selectionPreference:2});
          break;
        }catch{/* A failed bypass probe must not hide the main route. */}
      }
    }
    return selected;
  }));
  const selection=selectGeographicTerritoryOption(candidates.flat(),preferredCorridor);
  if(!selection.options.length)throw new Error("PREFERRED_ROUTE_UNAVAILABLE");
  const options=selection.options.map((option)=>{
    const publicOption={...option};
    Reflect.deleteProperty(publicOption,"selectionPreference");
    return publicOption;
  });
  return {...selection,options};
}
