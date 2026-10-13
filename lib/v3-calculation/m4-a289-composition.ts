import type { Coordinate } from "../tolls";
import type { ProductionM4Result, ProductionM4Tolls } from "../toll-engine/m4-production";
import { highwayTariffPeriod } from "../toll-engine/tariff-period";
import { priceA289Route } from "../toll-engine/a289-engine";
import { M4 } from "../toll-data/m4";
import { a289Endpoint, a289ShortRoute } from "./a289-short-route";

const BYPASS = "М-4: Дальний западный обход Краснодара";
type MatrixM4 = {tolls: ProductionM4Tolls | null; reason: string} | null;

/** V3 consumes M4-only production data. A289 and the bypass are independently
 * priced on the same selected geometry and added exactly once. */
export function composeSelectedM4A289(route: Coordinate[], production: ProductionM4Result,
  matrix: MatrixM4, legacySegments: string[], departureAt?: string) {
  const confirmedPvps = production.m4PvpPreview?.confirmedPvps ?? [];
  const hasM4Evidence = confirmedPvps.length > 0;
  const localEndpoints = route.length >= 2 && Boolean(a289Endpoint(route[0]) && a289Endpoint(route.at(-1)!));
  const physical = priceA289Route(route, departureAt);
  const local = a289ShortRoute(route, [], departureAt, hasM4Evidence, false);
  // Nearby M4 diagnostic candidates are not a traversed plaza. Keep local
  // A289 trips usable; a confirmed M4 passage can never be dropped by locality.
  const m4Detected = hasM4Evidence || (!localEndpoints && production.candidate);
  const a289Detected = physical.crossedFrames.length > 0
    || legacySegments.some(name => name.startsWith("А-289:"));
  const bypass = legacySegments.includes(BYPASS) ? M4.find(row => row.name === BYPASS) : null;
  if (!m4Detected && !a289Detected && !bypass) return null;
  const unknown = (reason: string) => ({tolls: null, reason});
  const m4 = matrix ? matrix.tolls : production.tolls;
  if (m4Detected && (!m4 || m4.confidence !== "matched" || (!matrix && !production.exact))) {
    return unknown("M-4 selected traversal is not completely priced; A-289 cannot replace it");
  }
  // Reject accidental use of the old mixed production payload instead of
  // subtracting estimated frame prices from an unrelated whole-route tariff.
  if (m4Detected && m4?.segments.some(name => name.startsWith("А-289:"))) {
    return unknown("M-4 input already contains A-289; separate composition required");
  }
  if (a289Detected && !local?.tolls) return unknown(local?.reason ?? "A-289 crossing/exit binding unresolved");
  const values = [...(m4Detected && m4 ? [m4] : []), ...(a289Detected && local?.tolls ? [local.tolls] : [])];
  const period = m4Detected && m4 ? m4.period : physical.period;
  const bypassAmount = highwayTariffPeriod(departureAt).weekend ? bypass?.weekend ?? 0 : bypass?.weekday ?? 0;
  const amount = values.reduce((sum, value) => sum + value.amount, 0) + bypassAmount;
  const weekdayAmount = values.reduce((sum, value) => sum + value.weekdayAmount, 0) + (bypass?.weekday ?? 0);
  const weekendAmount = values.reduce((sum, value) => sum + value.weekendAmount, 0) + (bypass?.weekend ?? 0);
  if (![amount,weekdayAmount,weekendAmount].every(value => Number.isSafeInteger(value) && value >= 0)) return unknown("Invalid M-4/A-289 component amount");
  return {reason:"Selected-route M-4, A-289 and bypass composed as distinct charges",
    tolls:{amount,weekdayAmount,weekendAmount,period,confidence:"matched" as const,
      segments:[...values.flatMap(value => value.segments), ...(bypass ? [`${BYPASS}: ${bypassAmount} ₽ · Стоимость не подтверждена`] : [])]}};
}
