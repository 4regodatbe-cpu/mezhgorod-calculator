import type { Coordinate } from "@/lib/tolls";
import type { ProductionM4Result } from "@/lib/toll-engine/m4-production";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { a289Endpoint, a289ShortRoute } from "./a289-short-route";

const FULL_M4 = "М-4 Дон: полный коридор Москва—Краснодар";

/** Compose the separately established full M-4 tariff with A-289 for Crimea,
 * Anapa, Taman and other supported western endpoints. Never drop A-289 when
 * the native full-corridor tariff replaces its diagnostic frame sum. */
export function crimeaM4Total(route: Coordinate[], production: ProductionM4Result,
  legacySegments: string[], departureAt?: string) {
  if (!production.tolls?.segments[0]?.startsWith(FULL_M4)) return null;
  const hasWesternEndpoint = [route[0], route.at(-1)].some(point => {
    const endpoint = point && a289Endpoint(point);
    return endpoint && endpoint !== "Maryanskaya";
  });
  if (!hasWesternEndpoint && priceA289Route(route, departureAt).crossedFrames.length === 0) return null;
  if (production.exact !== true) return { tolls: null, reason: "M-4 full traversal not established" };
  const additional = a289ShortRoute(route, legacySegments, departureAt, true);
  if (!additional?.tolls) return { tolls: null, reason: "A-289 selected vector price unresolved" };
  const weekdayAmount = production.tolls.weekdayAmount + additional.tolls.weekdayAmount;
  const weekendAmount = production.tolls.weekendAmount + additional.tolls.weekendAmount;
  const period = production.tolls.period;
  return { reason: `M-4 whole corridor plus distinct local roads: ${additional.reason}`,
    tolls: { ...production.tolls,
      amount: period === "пятница–воскресенье" ? weekendAmount : weekdayAmount,
      weekdayAmount, weekendAmount,
      segments: [production.tolls.segments[0], ...additional.tolls.segments],
      confidence: "matched" as const },
  };
}
