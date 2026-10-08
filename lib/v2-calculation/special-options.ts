import { valhalla, osrmRoute, type Located, type RouteWithGeometry } from "../route-providers";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../special-territory-boundaries";
import { analyzeRoute, candidatePlans, findPlanLegStretchAnomaly, followsPlan } from "../special-territory-policy";
import { selectGeographicTerritoryOption } from "../special-territory-options";
import { selectLiveRouteCandidates } from "../route-quality";
import { calculateLegTolls } from "./route-leg-pricing";
import { hasPracticalSavings, tollsForApi, withinDetourLimits } from "./free-route-selection";
import { validateTollEdges } from "../toll-validator";

type PricedCandidate = {
  corridor:"mainland"|"crimea";
  provider:string;
  split:ReturnType<typeof analyzeRoute>;
  from:string;
  to:string;
  selectionPreference:number;
  fast:RouteWithGeometry & {
    tolls:ReturnType<typeof tollsForApi>;
    tollValidation:Awaited<ReturnType<typeof calculateLegTolls>>["fastValidation"];
    quality:ReturnType<typeof selectLiveRouteCandidates>["quality"];
  };
  free:null;
  freeCandidate:null;
};

export async function calculateSpecialOptions(from:Located,to:Located,departureAt?:string) {
  const plans=candidatePlans(from.position,to.position,zones);
  const preferredCorridor=plans[0]?.corridor??"mainland";
  const candidates = await Promise.all(plans.map(async plan => {
    const rejectedStretchProviders=new Map<string,number>();
    const responses=await Promise.allSettled([valhalla(from,to,1,plan.positions),osrmRoute(from,to,plan.positions)]);
    const routed=responses.map((response,index) => {
      if(response.status!=="fulfilled")return null;
      try {
        const route:RouteWithGeometry=response.value;
        const providerName=index===0?"Valhalla":"OSRM";
        const stretch=findPlanLegStretchAnomaly(route.coordinates,plan.positions);
        if(stretch){rejectedStretchProviders.set(providerName,stretch.stretchRatio);return null;}
        if(!followsPlan(route.coordinates,plan.positions,plan.corridor,true))return null;
        const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
        return {corridor:plan.corridor,provider:index===0?"Valhalla":"OSRM",split,from:from.label,to:to.label,route,index,fast:{...route,tolls:{pricingStatus:"unknown" as const},tollValidation:undefined},free:null,freeCandidate:null};
      } catch {return null;}
    });
    const validRoutes=routed.filter((item):item is NonNullable<typeof item>=>item!==null);
    if(!validRoutes.length)return [];
    // Choose geometry before pricing. Each M-4 candidate can launch several
    // Valhalla map-match requests; pricing both provider routes in parallel
    // doubled pressure on that service and made complete toll results
    // intermittently degrade to unknown. Keep the existing route ranking and
    // price provider candidates one at a time so toll evidence is complete
    // before the final paid-route preference is applied.
    const routeChoice=selectLiveRouteCandidates(validRoutes.map(item=>({name:item.provider,route:item.fast})));
    const quality=rejectedStretchProviders.size?{
      ...routeChoice.quality,
      status:"warning" as const,
      providers:[...new Set([...routeChoice.quality.providers,...rejectedStretchProviders.keys()])],
      message:`Отклонён маршрут с аномальной длиной контрольного сегмента: ${[...rejectedStretchProviders].map(([name,ratio])=>`${name} (${ratio.toFixed(1)}×)`).join(", ")}. Проверьте оставшийся маршрут перед поездкой`,
    }:routeChoice.quality;
    const rankedRoutes=validRoutes.map(item=>({...item,selectionPreference:item.provider===routeChoice.provider?0:1}))
      .sort((a,b)=>a.selectionPreference-b.selectionPreference||a.fast.seconds-b.fast.seconds);
    const selected:PricedCandidate[]=[];
    for(const item of rankedRoutes){
      const pricing=await calculateLegTolls({routeGeometry:item.route.coordinates,routeSeconds:item.route.seconds,departureAt,selectedFastProvider:item.index===0?"Valhalla":"OSRM",selectedFastRoute:item.route,valhallaEvidence:item.index===0?item.route:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
      const {route,index,...candidate}=item;
      selected.push({...candidate,fast:{...route,tolls:tollsForApi(pricing.tolls,pricing.fastValidation),tollValidation:pricing.fastValidation,quality}});
    }
    const valid=selected;
    if(!valid.length)return [];
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
