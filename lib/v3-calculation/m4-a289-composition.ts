import type { Coordinate } from "../tolls";
import type { ProductionM4Result, ProductionM4Tolls } from "../toll-engine/m4-production";
import { priceA289Route } from "../toll-engine/a289-engine";
import { inspectKrasnodarBypass } from "../toll-engine/krasnodar-bypass-evidence";
import { composeRouteTolls, type RouteTollComponent } from "../toll-engine/route-toll-composition";
import { matrixDzokComponent } from "@/experiments/nationwide-tolls/engine/dzok-route-adapter.mjs";
import { a289Endpoint, a289ShortRoute } from "./a289-short-route";

const BYPASS = "М-4: Дальний западный обход Краснодара";
type MatrixM4 = {tolls: ProductionM4Tolls | null; reason: string} | null;

/** Independent products for the upper V3 composer. The combined value remains
 * a compatibility view; callers must never add it alongside these components. */
export function composeSelectedM4A289(route: Coordinate[], production: ProductionM4Result,
  matrix: MatrixM4, legacySegments: string[], departureAt?: string, routeSeconds = 0) {
  const hasM4Evidence = (production.m4PvpPreview?.confirmedPvps?.length ?? 0) > 0;
  const localEndpoints = route.length >= 2 && Boolean(a289Endpoint(route[0]) && a289Endpoint(route.at(-1)!));
  const physical = priceA289Route(route, departureAt);
  const local = a289ShortRoute(route, [], departureAt, hasM4Evidence);
  const m4Detected = hasM4Evidence || (!localEndpoints && production.candidate);
  const a289Detected = physical.crossedFrames.length > 0
    || legacySegments.some(name => name.startsWith("А-289:"));
  const bypassEvidence = inspectKrasnodarBypass(route);
  const bypassDetected = bypassEvidence.candidate || legacySegments.includes(BYPASS);
  if (!m4Detected && !a289Detected && !bypassDetected) return null;
  let m4 = matrix?.tolls ?? null;
  let m4Reason = `M-4 selected traversal is not completely priced; A-289 cannot replace it: ${matrix?.reason ?? production.reason}`;
  if (m4?.segments.some(name => name.startsWith("А-289:") || name.startsWith(BYPASS))) {
    m4 = null;
    m4Reason = "M-4 input already contains A-289 or bypass; separate composition required";
  }
  const bypass = bypassDetected ? matrixDzokComponent(bypassEvidence, departureAt, routeSeconds) : null;
  const components: RouteTollComponent[] = [
    {id:"m4",detected:m4Detected,tolls:m4,reason:m4?.confidence === "matched" ? matrix?.reason : m4Reason},
    {id:"a289",detected:a289Detected,tolls:local?.tolls ?? null,reason:local?.reason ?? "A-289 crossing/exit binding unresolved"},
    {id:"krasnodar-west-bypass",detected:bypassDetected,tolls:bypass?.tolls ?? null,reason:bypass?.reason ?? bypassEvidence.reason},
  ];
  const composition = composeRouteTolls(components);
  const reason = composition.status === "priced"
    ? "Selected-route M-4, A-289 and bypass composed as distinct products"
    : components.filter(c=>composition.missing.includes(c.id)).map(c=>c.reason).join("; ");
  return {components,tolls:composition.tolls,reason};
}
