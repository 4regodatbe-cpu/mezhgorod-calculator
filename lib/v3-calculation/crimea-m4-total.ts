import type { Coordinate } from "@/lib/tolls";
import type { ProductionM4Result } from "@/lib/toll-engine/m4-production";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { inCrimea } from "@/lib/special-territory-policy";
import { M4 } from "@/lib/toll-data/m4";
import { quoteA289SelectedRoute } from "@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs";

const FULL_M4 = "М-4 Дон: полный коридор Москва—Краснодар";
const WEST_BYPASS = "М-4: Дальний западный обход Краснодара";

/** Add distinct paid roads only when the selected geometry supplies their evidence. */
export function crimeaM4Total(route: Coordinate[], production: ProductionM4Result,
  legacySegments: string[], departureAt?: string) {
  const endpointInCrimea = [route[0], route.at(-1)].some(point => point && inCrimea({ lng: point[0], lat: point[1] }));
  if (!endpointInCrimea || !production.tolls?.segments[0]?.startsWith(FULL_M4)) return null;
  const a289 = priceA289Route(route, departureAt);
  // A partial frame set cannot establish the price of this chosen A-289 traversal.
  if (production.exact !== true || a289.crossedFrames.length !== 3 ||
      new Set(a289.crossedFrames).size !== 3) return { tolls: null, reason: "A-289 full traversal not established" };
  const localDate = departureAt && !Number.isNaN(new Date(departureAt).getTime())
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(departureAt))
    : null;
  const startInCrimea = Boolean(route[0] && inCrimea({ lng: route[0][0], lat: route[0][1] }));
  const a289Quote = quoteA289SelectedRoute({routeId:"selected-fast-route",selectedRouteId:"selected-fast-route",
    from:startInCrimea?"TamanBridge":"Maryanskaya",to:startInCrimea?"Maryanskaya":"TamanBridge",
    frames:a289.crossedFrames,exitBindingComplete:true,localDate});
  if (a289Quote?.rub === null || !a289Quote) return { tolls: null, reason: "A-289 selected vector price unresolved" };
  const bypass = legacySegments.includes(WEST_BYPASS) ? M4.find(item => item.name === WEST_BYPASS) : null;
  const weekdayAmount = 5040 + a289Quote.rub + (bypass?.weekday ?? 0);
  const weekendAmount = 6090 + a289Quote.rub + (bypass?.weekend ?? 0);
  const period = production.tolls.period;
  return { reason: "M-4 whole corridor plus distinct A-289 and selected Krasnodar bypass",
    tolls: { ...production.tolls,
      amount: period === "пятница–воскресенье" ? weekendAmount : weekdayAmount,
      weekdayAmount, weekendAmount,
      segments: [production.tolls.segments[0], `А-289: полный проезд к Крымскому мосту — ${a289Quote.rub} ₽ · Стоимость не подтверждена`,
        ...(bypass ? [`${WEST_BYPASS}: ${bypass.weekday} ₽ · Стоимость не подтверждена`] : [])],
      confidence: "matched" as const },
  };
}
