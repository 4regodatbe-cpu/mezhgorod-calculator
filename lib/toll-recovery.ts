import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import { ROADS, type RecoveryRoad, type RecoverySegment } from "@/lib/toll-recovery-data";

export type RecoveredTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

// Category-I tariffs used by the current 2.0 model. The recovery provider is
// intentionally conservative: it is activated only when the route follows a
// long sequence of one known toll corridor. It never decides toll status from
// one nearby point.
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

function longestRun(indexes: number[]) {
  if (indexes.length === 0) return 0;
  const sorted = [...indexes].sort((a, b) => a - b);
  let best = 1;
  let current = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] - sorted[index - 1] <= 2) current += 1;
    else current = 1;
    best = Math.max(best, current);
  }
  return best;
}

function recoverRoad(route: Coordinate[], road: RecoveryRoad, mapMatched: boolean, routeDifferenceConfirmed: boolean) {
  const matchedIndexes: number[] = [];
  const matched: RecoverySegment[] = [];
  road.segments.forEach((segment, index) => {
    if (matches(route, segment)) {
      matchedIndexes.push(index);
      matched.push(segment);
    }
  });

  const run = longestRun(matchedIndexes);
  const minimumRun = mapMatched ? road.minRunWithMapMatch : road.minRunWithoutMapMatch;
  if (run < minimumRun) return null;
  if (!mapMatched && road.requiresRouteDifference && !routeDifferenceConfirmed) return null;

  return { road, matched, run };
}

export function recoverCorridorTolls(
  route: Coordinate[],
  validation: TollValidation,
  departureAt?: string,
  routeDifferenceConfirmed = false,
): RecoveredTolls | null {
  if (route.length < 3) return null;
  const dense = densify(route);
  const mapMatched = validation.status === "toll";

  const candidates = ROADS
    .map((road) => recoverRoad(dense, road, mapMatched, routeDifferenceConfirmed))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    .sort((a, b) => b.run - a.run || b.matched.length - a.matched.length);

  const selected = candidates[0];
  if (!selected) return null;

  const weekdayAmount = selected.matched.reduce((sum, segment) => sum + segment.weekday, 0);
  const weekendAmount = selected.matched.reduce((sum, segment) => sum + segment.weekend, 0);
  if (weekdayAmount <= 0) return null;

  const date = departureAt ? new Date(departureAt) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = validDate.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  const evidence = mapMatched ? "map matching + геометрия" : "геометрия + сравнение маршрутов";

  return {
    amount: weekend ? weekendAmount : weekdayAmount,
    weekdayAmount,
    weekendAmount,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: [
      `Коридорный расчёт ${selected.road.id}: ${evidence}`,
      ...selected.matched.map((segment) => segment.name),
    ],
    confidence: "matched",
  };
}
