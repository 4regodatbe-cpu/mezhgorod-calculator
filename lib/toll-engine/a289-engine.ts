import type { Coordinate } from "@/lib/tolls";

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
  segments: string[];
  confidence: "matched" | "none";
};

// Official category-I tariffs WITHOUT a transponder, snapshot observed 2026-10-01.
// Source: data/tolls/2026-10-01-avtodor-other-roads-category1.json
// A-289 uses free-flow charging. Each physical charging frame is counted once,
// regardless of how many OSM nodes/anchors represent its carriageways.
// Current no-transponder section amounts are 555 + 278 + 270 = 1103 RUB for
// the full Марьянская → Темрюк traversal. This deliberately matches the UI's
// declared "без транспондера" mode and replaces the older 800 RUB composition.
const A289_FRAMES: readonly A289Frame[] = [
  {
    id: "23",
    label: "РВП 23 км — Марьянская / Славянск-на-Кубани",
    tariff: 555,
    anchors: [
      { lat: 45.171408, lon: 38.5327744, osmNodeId: "13022464435" },
      { lat: 45.1713281, lon: 38.5326562, osmNodeId: "13022464436" },
    ],
  },
  {
    id: "82",
    label: "РВП 82 км — Славянск-на-Кубани / Варениковская",
    tariff: 278,
    anchors: [
      { lat: 45.1961096, lon: 37.8330177, osmNodeId: "12439881648" },
      { lat: 45.1955326, lon: 37.8066089, osmNodeId: "12787972033" },
    ],
  },
  {
    id: "103",
    label: "РВП 103 км — Варениковская / Темрюк",
    tariff: 270,
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
  if (lengthSquared <= 1e-12) return Math.hypot(ax, ay);
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function nearestSegment(route: Coordinate[], frame: A289Frame) {
  let distanceKm = Number.POSITIVE_INFINITY;
  let segmentIndex = -1;
  let matchedNodeId: string | null = null;

  for (const anchor of frame.anchors) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const candidate = pointToSegmentKm(anchor, route[index], route[index + 1]);
      if (candidate < distanceKm) {
        distanceKm = candidate;
        segmentIndex = index;
        matchedNodeId = anchor.osmNodeId;
      }
    }
  }

  return { distanceKm, segmentIndex, matchedNodeId };
}

function tariffPeriod(departureAt?: string): A289PricingResult["period"] {
  const date = departureAt ? new Date(departureAt) : new Date();
  const valid = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = valid.getDay();
  return day === 0 || day === 5 || day === 6 ? "пятница–воскресенье" : "понедельник–четверг";
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
      segments: [],
      confidence: "none",
    };
  }

  const crossed = A289_FRAMES
    .map((frame) => ({ frame, ...nearestSegment(route, frame) }))
    .filter((item) => item.segmentIndex >= 0 && item.distanceKm <= CROSSING_RADIUS_KM)
    .sort((a, b) => a.segmentIndex - b.segmentIndex);

  if (crossed.length === 0) {
    return {
      status: "none",
      amount: 0,
      weekdayAmount: 0,
      weekendAmount: 0,
      period,
      crossedFrames: [],
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
    segments: crossed.map((item) => `А-289: ${item.frame.label} — ${item.frame.tariff} ₽ без транспондера`),
    confidence: "matched",
  };
}
