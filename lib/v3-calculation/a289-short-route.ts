import type { Coordinate } from "@/lib/tolls";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { inCrimea } from "@/lib/special-territory-policy";
import { M4 } from "@/lib/toll-data/m4";
import { quoteA289SelectedRoute } from "@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs";

const BYPASS = "М-4: Дальний западный обход Краснодара";
function near([lng,lat]:Coordinate, lon:number, latitude:number, radiusKm:number) {
  return Math.hypot((lng-lon)*111*Math.cos(latitude*Math.PI/180),(lat-latitude)*111)<=radiusKm;
}
function endpoint(point:Coordinate) {
  if(inCrimea({lng:point[0],lat:point[1]}))return "TamanBridge";
  if(near(point,38.98,45.04,35))return "Maryanskaya";
  if(near(point,37.32,44.90,28))return "AnapaExit";
  if(near(point,37.38,45.27,20))return "Temryuk";
  if(near(point,38.13,45.25,18))return "Slavyansk";
  if(near(point,36.72,45.21,25))return "TamanBridge";
  return null;
}

/** V3 estimate for a selected short A-289 route without a complete M-4 corridor. */
export function a289ShortRoute(route:Coordinate[],legacySegments:string[],departureAt?:string) {
  if(route.length<2)return null;
  const start=endpoint(route[0]),end=endpoint(route.at(-1)!);
  if(!start||!end||start===end||!([start,end].includes("Maryanskaya")))return null;
  const physical=priceA289Route(route,departureAt);
  const frames=physical.crossedFrames;
  if(!frames.length)return null;
  const from=start==="AnapaExit"?"Varenikovskaya":start;
  const to=end==="AnapaExit"?"Varenikovskaya":end;
  // Anapa is a provisional exit alias only for an actual two-frame selected crossing.
  const anapa=[start,end].includes("AnapaExit");
  if(anapa && frames.join(">")!==([start,end].indexOf("Maryanskaya")===0?"23>82":"82>23"))return null;
  const cityTemryuk=[start,end].includes("Temryuk");
  const localDate=departureAt&&!Number.isNaN(new Date(departureAt).getTime())
    ? new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Moscow",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(departureAt)):null;
  const quote=quoteA289SelectedRoute({routeId:"selected-fast-route",selectedRouteId:"selected-fast-route",
    from,to,frames,exitBindingComplete:true,temryukFastestControlMatched:cityTemryuk,localDate});
  if(quote?.rub==null)return null;
  const bypass=legacySegments.includes(BYPASS)?M4.find(x=>x.name===BYPASS):null;
  const amount=quote.rub+(bypass?.weekday??0);
  return {reason:anapa?"A-289 Anapa exit inferred from two selected-route frames; estimate":"A-289 selected-route OD vector",
    tolls:{amount,weekdayAmount:amount,weekendAmount:amount,period:physical.period,
      segments:[`А-289: ${start} → ${end}: ${quote.rub} ₽ · Стоимость не подтверждена`,
        ...(bypass?[`${BYPASS}: ${bypass.weekday} ₽ · Стоимость не подтверждена`]:[])],
      confidence:"matched" as const}};
}
