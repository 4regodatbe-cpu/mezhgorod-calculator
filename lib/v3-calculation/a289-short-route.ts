import type { Coordinate } from "@/lib/tolls";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { inCrimea } from "@/lib/special-territory-policy";
import {validInstant} from "@/experiments/nationwide-tolls/engine/fare-validity.cjs";
import { quoteA289SelectedRoute } from "@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs";

function near([lng,lat]:Coordinate, lon:number, latitude:number, radiusKm:number) {
  return Math.hypot((lng-lon)*111*Math.cos(latitude*Math.PI/180),(lat-latitude)*111)<=radiusKm;
}
export function a289Endpoint(point:Coordinate) {
  if(inCrimea({lng:point[0],lat:point[1]}))return "TamanBridge";
  if(near(point,38.98,45.04,35))return "Maryanskaya";
  if(near(point,37.32,44.90,28))return "AnapaExit";
  if(near(point,37.38,45.27,20))return "Temryuk";
  if(near(point,38.13,45.25,18))return "Slavyansk";
  if(near(point,36.72,45.21,25))return "TamanBridge";
  return null;
}

/** A289 product only. M4 and the bypass are composed independently upstream. */
export function a289ShortRoute(route:Coordinate[],legacySegments:string[],departureAt?:string, easternM4Traversal = false) {
  void legacySegments; // Compatibility argument; never supplies money or another product.
  if(route.length<2)return null;
  let start=a289Endpoint(route[0]),end=a289Endpoint(route.at(-1)!);
  // A separately evidenced M-4 traversal supplies the eastern A-289 side.
  if(easternM4Traversal){
    if(start && start!=="Maryanskaya" && !end)end="Maryanskaya";
    if(end && end!=="Maryanskaya" && !start)start="Maryanskaya";
  }
  const physical=priceA289Route(route,departureAt);
  const frames=physical.crossedFrames;
  if(!frames.length)return null;
  const unresolved = (reason: string) => ({tolls: null, reason});
  if(physical.repeatedFrames?.length)return unresolved("A-289 repeated passage is outside the finished OD vector");
  if(!start||!end||start===end)return unresolved("A-289 frames detected but selected-route exits are unresolved");
  let from=start==="AnapaExit"?"Varenikovskaya":start;
  let to=end==="AnapaExit"?"Varenikovskaya":end;
  // Anapa is a provisional exit alias. The exact vector is still checked by
  // the OD adapter, including single-frame trips from intermediate exits.
  const anapa=[start,end].includes("AnapaExit");
  const cityTemryuk=[start,end].includes("Temryuk") && [start,end].includes("Maryanskaya") && frames.length===2;
  if(cityTemryuk){
    if(from==="Temryuk")from="TemryukCity";
    if(to==="Temryuk")to="TemryukCity";
  }
  const localDate=typeof departureAt==="string" && validInstant(departureAt)
    ? new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Moscow",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(departureAt)):null;
  const quote=quoteA289SelectedRoute({routeId:"selected-fast-route",selectedRouteId:"selected-fast-route",
    from,to,frames,exitBindingComplete:true,allowTemryukCityEstimate:cityTemryuk,localDate});
  if(quote?.rub==null)return unresolved("A-289 selected frame vector has no applicable finished OD price");
  const weekdayAmount=quote.rub;
  const weekendAmount=quote.rub;
  const amount=quote.rub;
  return {reason:cityTemryuk?"A-289 Temryuk two-frame city estimate; exit binding unverified":anapa?"A-289 Anapa exit inferred from two selected-route frames; estimate":"A-289 selected-route OD vector",
    tolls:{amount,weekdayAmount,weekendAmount,period:"все дни",
      segments:[`А-289: ${start} → ${end}: ${quote.rub} ₽`],
      confidence:"matched" as const}};
}
