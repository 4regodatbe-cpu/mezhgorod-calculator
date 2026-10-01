import section15Snapshot from "../../data/tolls/m11/2026-04-24-section15-58-category1-no-transponder.json" with { type: "json" };
import spatialSnapshot from "../../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json" with { type: "json" };
import { priceM11CurrentPartialCategory1 } from "./m11-current-tariffs.ts";

type Coordinate = [number, number];

export type M11MoscowProductionTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

export type M11MoscowProductionResult = {
  candidate: boolean;
  exact: boolean;
  tolls: M11MoscowProductionTolls | null;
  reason: string;
  evidence: {
    entryDistanceKm: number | null;
    p58DistanceKm: number | null;
    p593DistanceKm: number | null;
    p679DistanceKm: number | null;
    entryAt: string | null;
    p58At: string | null;
  };
};

type Facility = { tariffPointId: string; anchors: Array<{ lat: number; lon: number }> };
type Section15Profile = "monThu" | "friday" | "saturday" | "sunday";

const MOSCOW_M11_ENTRY: Coordinate = [37.472, 55.8842];
const ENTRY_MAX_DISTANCE_KM = 1.5;
const FACILITY_MAX_DISTANCE_KM = 0.8;
const facilities = spatialSnapshot.facilities as Facility[];

function haversineKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function pointToSegmentKm(point: Coordinate, a: Coordinate, b: Coordinate) {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(point[1] * Math.PI / 180);
  const ax = (a[0] - point[0]) * lonScale;
  const ay = (a[1] - point[1]) * latScale;
  const bx = (b[0] - point[0]) * lonScale;
  const by = (b[1] - point[1]) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 1e-12) return Math.hypot(ax, ay);
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function nearestSegment(route: readonly Coordinate[], anchors: readonly Coordinate[]) {
  let index = -1;
  let distanceKm = Number.POSITIVE_INFINITY;
  for (const anchor of anchors) {
    for (let current = 0; current < route.length - 1; current += 1) {
      const distance = pointToSegmentKm(anchor, route[current], route[current + 1]);
      if (distance < distanceKm) { distanceKm = distance; index = current; }
    }
  }
  return { index, distanceKm };
}

function facilityAnchors(pointId: string): Coordinate[] {
  const facility = facilities.find((item) => item.tariffPointId === pointId);
  return facility?.anchors.map((anchor) => [anchor.lon, anchor.lat] as Coordinate) ?? [];
}

function cumulativeDistance(route: readonly Coordinate[]) {
  const result = [0];
  for (let index = 1; index < route.length; index += 1) result.push(result[index - 1] + haversineKm(route[index - 1], route[index]));
  return result;
}

function crossingAt(start: Date, route: readonly Coordinate[], segmentIndex: number, routeSeconds: number) {
  const cumulative = cumulativeDistance(route);
  const total = cumulative.at(-1) ?? 0;
  const ratio = total > 0 ? Math.max(0, Math.min(1, cumulative[Math.max(0, segmentIndex)] / total)) : 0;
  return new Date(start.getTime() + routeSeconds * ratio * 1000);
}

function moscowParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { dateKey: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday, hour: Number(parts.hour) };
}

function section15Profile(date: Date): Section15Profile {
  const parts = moscowParts(date);
  const special = (section15Snapshot.specialDayProfiles2026 as Record<string, Section15Profile>)[parts.dateKey];
  if (special) return special;
  if (parts.weekday === "Fri") return "friday";
  if (parts.weekday === "Sat") return "saturday";
  if (parts.weekday === "Sun") return "sunday";
  return "monThu";
}

function section15Amount(date: Date) {
  const parts = moscowParts(date);
  const night = parts.hour >= 1 && parts.hour < 6;
  if (night) return { amount: section15Snapshot.tariffs.night0100to0600, profile: "night" };
  const profile = section15Profile(date);
  const amount = profile === "monThu"
    ? section15Snapshot.tariffs.monThuDay0600to0100
    : profile === "friday"
      ? section15Snapshot.tariffs.fridayDay0600to0100
      : profile === "saturday"
        ? section15Snapshot.tariffs.saturdayDay0600to0100
        : section15Snapshot.tariffs.sundayDay0600to0100;
  return { amount, profile };
}

function p58Profile(date: Date) {
  const profile = section15Profile(date);
  return profile === "monThu" ? "monThu" : "friSun";
}

function startDate(departureAt?: string) {
  const parsed = departureAt ? new Date(departureAt) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function calculateM11MoscowToPetersburg(
  route: readonly Coordinate[],
  routeSeconds: number,
  departureAt?: string,
): M11MoscowProductionResult {
  const emptyEvidence = { entryDistanceKm: null, p58DistanceKm: null, p593DistanceKm: null, p679DistanceKm: null, entryAt: null, p58At: null };
  if (route.length < 3 || !(routeSeconds > 0)) return { candidate: false, exact: false, tolls: null, reason: "route_geometry_missing", evidence: emptyEvidence };

  const entry = nearestSegment(route, [MOSCOW_M11_ENTRY]);
  const p58 = nearestSegment(route, facilityAnchors("p58"));
  const p147 = nearestSegment(route, facilityAnchors("p147"));
  const p593 = nearestSegment(route, facilityAnchors("p593"));
  const p679 = nearestSegment(route, facilityAnchors("p679"));
  const evidenceBase = {
    entryDistanceKm: Number.isFinite(entry.distanceKm) ? Math.round(entry.distanceKm * 1000) / 1000 : null,
    p58DistanceKm: Number.isFinite(p58.distanceKm) ? Math.round(p58.distanceKm * 1000) / 1000 : null,
    p593DistanceKm: Number.isFinite(p593.distanceKm) ? Math.round(p593.distanceKm * 1000) / 1000 : null,
    p679DistanceKm: Number.isFinite(p679.distanceKm) ? Math.round(p679.distanceKm * 1000) / 1000 : null,
  };

  // Do not mark M-11 merely because a route passes within 10 km of one
  // facility (notably around Tver/M-10). That created a false paid-system
  // candidate and blocked otherwise complete M-4 routes. Geometry-only
  // detection requires the actual Moscow entry or at least two independent
  // M-11 tariff facilities at strict crossing distance.
  const strictFacilityHits = facilities.filter((facility) =>
    nearestSegment(route, facility.anchors.map((anchor) => [anchor.lon, anchor.lat] as Coordinate)).distanceKm <= FACILITY_MAX_DISTANCE_KM
  ).length;
  const candidate = entry.distanceKm <= ENTRY_MAX_DISTANCE_KM || strictFacilityHits >= 2;
  if (entry.distanceKm > ENTRY_MAX_DISTANCE_KM) return { candidate, exact: false, tolls: null, reason: candidate ? "moscow_m11_entry_not_proven" : "m11_geometry_not_proven", evidence: { ...evidenceBase, entryAt: null, p58At: null } };

  // Southbound Tver→Moscow traversal: the route crosses the independently
  // anchored p147 and p58 tariff boundaries and then the 15-km Moscow entry.
  // The official category-I matrix (order 53, 22.02.2026) directly verifies
  // p58↔p147 as 610 RUB Mon-Thu and 750 RUB Fri-Sun. This is an explicit
  // matrix cell, not a subtraction/derived tariff.
  const southboundTver = p147.distanceKm <= ENTRY_MAX_DISTANCE_KM
    && p58.distanceKm <= FACILITY_MAX_DISTANCE_KM
    && entry.distanceKm <= ENTRY_MAX_DISTANCE_KM
    && p147.index < p58.index
    && p58.index < entry.index;
  if (southboundTver) {
    const start = startDate(departureAt);
    const p58At = crossingAt(start, route, p58.index, routeSeconds);
    const entryAt = crossingAt(start, route, entry.index, routeSeconds);
    const p58to147 = p58Profile(p58At) === "monThu" ? 610 : 750;
    const section15 = section15Amount(entryAt);
    const weekdayAmount = 610 + section15Snapshot.tariffs.monThuDay0600to0100;
    const weekendAmount = 750 + Math.max(
      section15Snapshot.tariffs.fridayDay0600to0100,
      section15Snapshot.tariffs.saturdayDay0600to0100,
      section15Snapshot.tariffs.sundayDay0600to0100,
    );
    return {
      candidate: true,
      exact: true,
      tolls: {
        amount: p58to147 + section15.amount,
        weekdayAmount,
        weekendAmount,
        period: `по времени фактического проезда М-11 (${section15.profile})`,
        segments: [
          `М-11 147–58: Тверь→Солнечногорск ${p58to147} ₽`,
          `М-11 58–15: Солнечногорск→Москва ${section15.amount} ₽`,
        ],
        confidence: "matched",
      },
      reason: "m11_tver_p147_p58_moscow_entry_sequence_verified",
      evidence: { ...evidenceBase, entryAt: entryAt.toISOString(), p58At: p58At.toISOString() },
    };
  }

  if ([p58, p593, p679].some((item) => item.distanceKm > FACILITY_MAX_DISTANCE_KM)) {
    return { candidate: true, exact: false, tolls: null, reason: "m11_58_679_facility_sequence_incomplete", evidence: { ...evidenceBase, entryAt: null, p58At: null } };
  }
  if (!(entry.index < p58.index && p58.index < p593.index && p593.index < p679.index)) {
    return { candidate: true, exact: false, tolls: null, reason: "m11_northbound_sequence_not_proven", evidence: { ...evidenceBase, entryAt: null, p58At: null } };
  }

  const start = startDate(departureAt);
  const entryAt = crossingAt(start, route, entry.index, routeSeconds);
  const p58At = crossingAt(start, route, p58.index, routeSeconds);
  const entryTariff = section15Amount(entryAt);
  const p58Tariff = priceM11CurrentPartialCategory1("p58", "p679", p58Profile(p58At));
  const weekday58 = priceM11CurrentPartialCategory1("p58", "p679", "monThu");
  const weekend58 = priceM11CurrentPartialCategory1("p58", "p679", "friSun");
  if (p58Tariff.status !== "priced" || weekday58.status !== "priced" || weekend58.status !== "priced" || p58Tariff.amountRub == null || weekday58.amountRub == null || weekend58.amountRub == null) {
    return { candidate: true, exact: false, tolls: null, reason: "m11_58_679_current_tariff_unavailable", evidence: { ...evidenceBase, entryAt: entryAt.toISOString(), p58At: p58At.toISOString() } };
  }

  const weekdayAmount = section15Snapshot.tariffs.monThuDay0600to0100 + weekday58.amountRub;
  const weekendAmount = Math.max(section15Snapshot.tariffs.fridayDay0600to0100, section15Snapshot.tariffs.saturdayDay0600to0100, section15Snapshot.tariffs.sundayDay0600to0100) + weekend58.amountRub;
  return {
    candidate: true,
    exact: true,
    tolls: {
      amount: entryTariff.amount + p58Tariff.amountRub,
      weekdayAmount,
      weekendAmount,
      period: `по времени фактического въезда на М-11 (${entryTariff.profile})`,
      segments: [
        `М-11 15–58: Москва→Солнечногорск ${entryTariff.amount} ₽`,
        `М-11 58–679: p58→p679 ${p58Tariff.amountRub} ₽`,
      ],
      confidence: "matched",
    },
    reason: "m11_moscow_entry_p58_p593_p679_sequence_verified",
    evidence: { ...evidenceBase, entryAt: entryAt.toISOString(), p58At: p58At.toISOString() },
  };
}
