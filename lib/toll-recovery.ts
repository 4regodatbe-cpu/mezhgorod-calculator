import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";

type RecoverySegment = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  weekday: number;
  weekend: number;
};

export type RecoveredTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

// Recovery data uses the same 2026 category-I tariffs as the main toll table.
// It is deliberately used only after map matching has independently confirmed
// that the route contains toll-tagged road edges.
const M4_RECOVERY: RecoverySegment[] = [
  { name: "М-4: 21–93 км", start: [37.72, 55.55], end: [38.08, 54.99], weekday: 210, weekend: 270 },
  { name: "М-4: 93–211 км", start: [38.08, 54.99], end: [38.16, 53.98], weekday: 320, weekend: 410 },
  { name: "М-4: 211–260 км", start: [38.16, 53.98], end: [38.0, 53.56], weekday: 190, weekend: 220 },
  { name: "М-4: 260–322 км", start: [38.0, 53.56], end: [38.12, 53.15], weekday: 160, weekend: 190 },
  { name: "М-4: 322–401 км", start: [38.12, 53.15], end: [38.5, 52.62], weekday: 300, weekend: 360 },
  { name: "М-4: 401–464 км", start: [38.5, 52.62], end: [39.16, 52.22], weekday: 290, weekend: 370 },
  { name: "М-4: 492–517 км", start: [39.19, 51.82], end: [39.21, 51.51], weekday: 140, weekend: 150 },
  { name: "М-4: 517–544 км", start: [39.21, 51.51], end: [39.18, 51.39], weekday: 140, weekend: 150 },
  { name: "М-4: 544–589 км", start: [39.18, 51.39], end: [39.75, 51.08], weekday: 170, weekend: 220 },
  { name: "М-4: 589–633 км", start: [39.75, 51.08], end: [40.2, 50.73], weekday: 140, weekend: 150 },
  { name: "М-4: 633–741 км", start: [40.2, 50.73], end: [40.55, 49.94], weekday: 250, weekend: 290 },
  { name: "М-4: 741–893 км", start: [40.55, 49.94], end: [40.27, 48.32], weekday: 370, weekend: 430 },
  { name: "М-4: 893–933 км", start: [40.27, 48.32], end: [40.1, 48.18], weekday: 200, weekend: 250 },
  { name: "М-4: 1024–1091 км", start: [39.9, 47.5], end: [39.75, 46.9], weekday: 450, weekend: 500 },
  { name: "М-4: 1091–1119 км", start: [39.75, 46.9], end: [39.73, 46.51], weekday: 220, weekend: 250 },
  { name: "М-4: 1119–1195 км", start: [39.73, 46.51], end: [39.79, 46.13], weekday: 320, weekend: 370 },
  { name: "М-4: 1195–1319 км", start: [39.79, 46.13], end: [39.03, 45.07], weekday: 600, weekend: 760 },
];

const RECOVERY_RADIUS_KM = 10;
const MAX_ROUTE_GAP_KM = 1.5;

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function densify(route: Coordinate[]) {
  if (route.length < 2) return route;
  const result: Coordinate[] = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    const steps = Math.max(1, Math.ceil(distanceKm(from, to) / MAX_ROUTE_GAP_KM));
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      result.push([
        from[0] + (to[0] - from[0]) * ratio,
        from[1] + (to[1] - from[1]) * ratio,
      ]);
    }
  }
  return result;
}

function nearestIndex(route: Coordinate[], point: Coordinate) {
  let index = -1;
  let best = Number.POSITIVE_INFINITY;
  route.forEach((coordinate, candidateIndex) => {
    const distance = distanceKm(coordinate, point);
    if (distance <= RECOVERY_RADIUS_KM && distance < best) {
      best = distance;
      index = candidateIndex;
    }
  });
  return index;
}

function pathDistance(route: Coordinate[], fromIndex: number, toIndex: number) {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  let total = 0;
  for (let index = start + 1; index <= end; index += 1) total += distanceKm(route[index - 1], route[index]);
  return total;
}

function matches(route: Coordinate[], segment: RecoverySegment) {
  const startIndex = nearestIndex(route, segment.start);
  const endIndex = nearestIndex(route, segment.end);
  if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return false;

  const direct = distanceKm(segment.start, segment.end);
  const travelled = pathDistance(route, startIndex, endIndex);
  return travelled >= direct * 0.68 - 12 && travelled <= direct * 1.75 + 12;
}

function likelyM4(validation: TollValidation, matchedCount: number) {
  const names = validation.roadNames.join(" ").toLocaleLowerCase("ru-RU");
  const namedM4 = /(^|\s)(м-?4|m-?4)(\s|$)|дон/.test(names);
  return namedM4 || matchedCount >= 2;
}

export function recoverM4Tolls(route: Coordinate[], validation: TollValidation, departureAt?: string): RecoveredTolls | null {
  if (validation.status !== "toll" || route.length < 3) return null;

  const dense = densify(route);
  const matched = M4_RECOVERY.filter((segment) => matches(dense, segment));
  if (matched.length === 0 || !likelyM4(validation, matched.length)) return null;

  const weekdayAmount = matched.reduce((sum, segment) => sum + segment.weekday, 0);
  const weekendAmount = matched.reduce((sum, segment) => sum + segment.weekend, 0);
  if (weekdayAmount <= 0) return null;

  const date = departureAt ? new Date(departureAt) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = validDate.getDay();
  const weekend = day === 0 || day === 5 || day === 6;

  return {
    amount: weekend ? weekendAmount : weekdayAmount,
    weekdayAmount,
    weekendAmount,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: matched.map((segment) => `Коридорный расчёт ${segment.name}`),
    confidence: "matched",
  };
}
