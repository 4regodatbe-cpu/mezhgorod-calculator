import type { Coordinate } from "@/lib/tolls";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { inCrimea } from "@/lib/special-territory-policy";
import { M4 } from "@/lib/toll-data/m4";
import { quoteA289SelectedRoute } from "@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs";

const BYPASS = "М-4: Дальний западный обход Краснодара";
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

/** V3 estimate for a selected short A-289 route without a complete M-4 corridor. */
export function a289ShortRoute(route:Coordinate[],legacySegments:string[],departureAt?:string, fullM4 = false) {
  if(route.length<2)return null;
  let start=a289Endpoint(route[0]),end=a289Endpoint(route.at(-1)!);
  // A separately established full M-4 corridor supplies the eastern A-289 side.
  if(fullM4){
    if(start && start!=="Maryanskaya" && !end)end="Maryanskaya";
    if(end && end!=="Maryanskaya" && !start)start="Maryanskaya";
  }
  const physical=priceA289Route(route,departureAt);
  const frames=physical.crossedFrames;
  if(!frames.length)return null;
  const unresolved = (reason: string) => ({tolls: null, reason});
  if(physical.repeatedFrames?.length)return unresolved("A-289 repeated passage is outside the finished OD vector");
  if(!start||!end||start===end)return unresolved("A-289 frames detected but selected-route exits are unresolved");
  const from=start==="AnapaExit"?"Varenikovskaya":start;
  const to=end==="AnapaExit"?"Varenikovskaya":end;
  // Anapa is a provisional exit alias. The exact vector is still checked by
  // the OD adapter, including single-frame trips from intermediate exits.
  const anapa=[start,end].includes("AnapaExit");
  const cityTemryuk=[start,end].includes("Temryuk") && [start,end].includes("Maryanskaya");
  const localDate=departureAt&&!Number.isNaN(new Date(departureAt).getTime())
    ? new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Moscow",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(departureAt)):null;
  const quote=quoteA289SelectedRoute({routeId:"selected-fast-route",selectedRouteId:"selected-fast-route",
    from,to,frames,exitBindingComplete:true,allowTemryukCityEstimate:cityTemryuk,localDate});
  if(quote?.rub==null)return unresolved("A-289 selected frame vector has no applicable finished OD price");
  const bypass=legacySegments.includes(BYPASS)?M4.find(x=>x.name===BYPASS):null;
  const weekdayAmount=quote.rub+(bypass?.weekday??0);
  const weekendAmount=quote.rub+(bypass?.weekend??0);
  const amount=physical.period==="пятница–воскресенье"?weekendAmount:weekdayAmount;
  return {reason:cityTemryuk?"A-289 Temryuk two-frame city estimate; bypass control unverified":anapa?"A-289 Anapa exit inferred from two selected-route frames; estimate":"A-289 selected-route OD vector",
    tolls:{amount,weekdayAmount,weekendAmount,period:physical.period,
      segments:[`А-289: ${start} → ${end}: ${quote.rub} ₽ · Стоимость не подтверждена`,
        ...(bypass?[`${BYPASS}: ${bypass.weekday} ₽ · Стоимость не подтверждена`]:[])],
      confidence:"matched" as const}};
}
