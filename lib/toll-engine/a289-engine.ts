import type { Coordinate } from "@/lib/tolls";
import { highwayTariffPeriod } from "@/lib/toll-engine/tariff-period";

export type A289Frame = {
  id: "23" | "82" | "103";
  label: string;
  tariff: number;
  anchors: Array<{ lat: number; lon: number; osmNodeId: string }>;
};

export type A289PricingResult = {
  status: "none" | "priced";
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: "понедельник–четверг" | "пятница–воскресенье";
  crossedFrames: string[];
  repeatedFrames: string[];
  segments: string[];
  confidence: "matched" | "none";
};

// Category-I base rates, no transponder discount; current from 02.03.2026.
// Corrected 13.10.2026: the old 555/278/270 were vehicle category II,
// mistakenly interpreted as no-transponder columns. Primary table:
// https://avtodor-tr.ru/road/tariffs/ ; class-I full vector is 800 RUB.
// Crossing detection remains independent of vehicle/payment price columns.
const A289_FRAMES: readonly A289Frame[] = [
  {
    id: "23",
    label: "РВП 23 км — Марьянская / Славянск-на-Кубани",
    tariff: 415,
    anchors: [
      { lat: 45.171408, lon: 38.5327744, osmNodeId: "13022464435" },
      { lat: 45.1713281, lon: 38.5326562, osmNodeId: "13022464436" },
    ],
  },
  {
    id: "82",
    label: "РВП 82 км — Славянск-на-Кубани / Варениковская",
    tariff: 205,
    anchors: [
      { lat: 45.1961096, lon: 37.8330177, osmNodeId: "12439881648" },
      { lat: 45.1955326, lon: 37.8066089, osmNodeId: "12787972033" },
    ],
  },
  {
    id: "103",
    label: "РВП 103 км — Варениковская / Темрюк",
    tariff: 180,
    anchors: [
      { lat: 45.168457, lon: 37.5878131, osmNodeId: "12439892927" },
      { lat: 45.1683514, lon: 37.5877882, osmNodeId: "12806246303" },
    ],
  },
] as const;

const CROSSING_RADIUS_KM = 0.08;

function pointToSegmentKm(anchor: { lat: number; lon: number }, a: Coordinate, b: Coordinate) {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(anchor.lat * Math.PI / 180);
  const ax = (a[0] - anchor.lon) * lonScale;
  const ay = (a[1] - anchor.lat) * latScale;
  const bx = (b[0] - anchor.lon) * lonScale;
  const by = (b[1] - anchor.lat) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 1e-12) return { distanceKm: Math.hypot(ax, ay), fraction: 0 };
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return { distanceKm: Math.hypot(ax + t * dx, ay + t * dy), fraction: t };
}

function nearestSegment(route: Coordinate[], frame: A289Frame, distances: number[]) {
  let distanceKm = Number.POSITIVE_INFINITY;
  let segmentIndex = -1;
  let matchedNodeId: string | null = null;
  let passagePosition = Number.POSITIVE_INFINITY;
  let repeated = false;

  for (const anchor of frame.anchors) {
    let previousPassage: number | null = null;
    for (let index = 0; index < route.length - 1; index += 1) {
      const candidate = pointToSegmentKm(anchor, route[index], route[index + 1]);
      if (candidate.distanceKm < distanceKm) {
        distanceKm = candidate.distanceKm;
        segmentIndex = index;
        matchedNodeId = anchor.osmNodeId;
      }
      if (candidate.distanceKm <= CROSSING_RADIUS_KM) {
        const station = distances[index] + candidate.fraction * (distances[index + 1] - distances[index]);
        // Adjacent shape segments may touch the same camera. A return after
        // leaving its vicinity is a second passage, not a duplicate OSM node.
        if (previousPassage !== null && station - previousPassage > 0.5) repeated = true;
        previousPassage = station;
        passagePosition = Math.min(passagePosition, index + candidate.fraction);
      }
    }
  }

  return { distanceKm, segmentIndex, matchedNodeId, passagePosition, repeated };
}

function tariffPeriod(departureAt?: string): A289PricingResult["period"] {
  return highwayTariffPeriod(departureAt).period;
}

export function priceA289Route(route: Coordinate[], departureAt?: string): A289PricingResult {
  const period = tariffPeriod(departureAt);
  if (route.length < 2) {
    return {
      status: "none",
      amount: 0,
      weekdayAmount: 0,
      weekendAmount: 0,
      period,
      crossedFrames: [],
      repeatedFrames: [],
      segments: [],
      confidence: "none",
    };
  }

  const distances = [0];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    const km = Math.hypot((b[0] - a[0]) * 111.320 * Math.cos((a[1] + b[1]) * Math.PI / 360), (b[1] - a[1]) * 110.574);
    distances.push(distances[i - 1] + km);
  }
  const crossed = A289_FRAMES
    .map((frame) => ({ frame, ...nearestSegment(route, frame, distances) }))
    .filter((item) => item.segmentIndex >= 0 && item.distanceKm <= CROSSING_RADIUS_KM)
    .sort((a, b) => a.passagePosition - b.passagePosition);

  if (crossed.length === 0) {
    return {
      status: "none",
      amount: 0,
      weekdayAmount: 0,
      weekendAmount: 0,
      period,
      crossedFrames: [],
      repeatedFrames: [],
      segments: [],
      confidence: "none",
    };
  }

  const amount = crossed.reduce((sum, item) => sum + item.frame.tariff, 0);
  return {
    status: "priced",
    amount,
    weekdayAmount: amount,
    weekendAmount: amount,
    period,
    crossedFrames: crossed.map((item) => item.frame.id),
    repeatedFrames: crossed.filter((item) => item.repeated).map((item) => item.frame.id),
    segments: crossed.map((item) => `А-289: ${item.frame.label} — ${item.frame.tariff} ₽ без транспондера`),
    confidence: "matched",
  };
}
