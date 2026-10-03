import { A289, CKAD, FULL_ROUTES, M1, M3, M4, M11, M12, REGIONAL } from "./toll-data";
import type { Coordinate, FullRoute, TollSegment } from "./toll-data";

export type { Coordinate } from "./toll-data/types";

const CHECKPOINT_RADIUS_KM = 2;
const COMPLETE_ROUTE_ENDPOINT_RADIUS_KM = 3;
const MAX_GEOMETRY_GAP_KM = 0.75;
const MIN_PATH_TO_DIRECT_RATIO = 0.78;
const MAX_PATH_TO_DIRECT_RATIO = 1.65;
const MODERN_HIGHWAY_INTERIOR_RADIUS_KM = 4;
const GENERAL_INTERIOR_RADIUS_KM = 6;

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function interiorCheckpoints(segment: TollSegment) {
  // Only use a control point when it is an explicitly stored point on the road.
  // Synthetic straight-line points caused false negatives on curved highways.
  return segment.via ? [segment.via] : [];
}

function interiorCheckpointRadius(segment: TollSegment) {
  return segment.name.startsWith("М-11:") || segment.name.startsWith("М-12:")
    ? MODERN_HIGHWAY_INTERIOR_RADIUS_KM
    : GENERAL_INTERIOR_RADIUS_KM;
}

function densifyRoute(route: Coordinate[], maxGapKm = MAX_GEOMETRY_GAP_KM) {
  if (route.length < 2) return route;
  const dense: Coordinate[] = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    const steps = Math.max(1, Math.ceil(distanceKm(from, to) / maxGapKm));
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      dense.push([
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
      ]);
    }
  }
  return dense;
}

function nearestRouteIndex(route: Coordinate[], point: Coordinate, radius = CHECKPOINT_RADIUS_KM) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  route.forEach((coordinate, index) => {
    const value = distanceKm(coordinate, point);
    if (value <= radius && value < bestDistance) {
      bestDistance = value;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function pathDistance(route: Coordinate[], fromIndex: number, toIndex: number) {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  let total = 0;
  for (let index = start + 1; index <= end; index += 1) total += distanceKm(route[index - 1], route[index]);
  return total;
}

function matchesSegment(route: Coordinate[], segment: TollSegment) {
  if (route.length < 3) return false;

  const radius = Math.min(segment.radius ?? CHECKPOINT_RADIUS_KM, CHECKPOINT_RADIUS_KM);
  const startIndex = nearestRouteIndex(route, segment.start, radius);
  const endIndex = nearestRouteIndex(route, segment.end, radius);
  if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return false;

  const direct = distanceKm(segment.start, segment.end);
  const travelled = pathDistance(route, startIndex, endIndex);
  const toleranceKm = radius * 2;
  if (travelled < direct * MIN_PATH_TO_DIRECT_RATIO - toleranceKm) return false;
  if (travelled > direct * MAX_PATH_TO_DIRECT_RATIO + toleranceKm) return false;

  const direction = endIndex > startIndex ? 1 : -1;
  const checkpoints = interiorCheckpoints(segment);
  const orderedCheckpoints = direction > 0 ? checkpoints : [...checkpoints].reverse();
  const checkpointRadius = interiorCheckpointRadius(segment);
  let previousIndex = startIndex;
  for (const checkpoint of orderedCheckpoints) {
    const checkpointIndex = nearestRouteIndex(route, checkpoint, checkpointRadius);
    if (checkpointIndex < 0) return false;
    if ((checkpointIndex - previousIndex) * direction <= 0) return false;
    if ((endIndex - checkpointIndex) * direction <= 0) return false;
    previousIndex = checkpointIndex;
  }

  return true;
}

function matchesRouteEnds(route: Coordinate[], start: Coordinate, end: Coordinate, radius: number) {
  if (route.length < 3) return false;
  const effectiveRadius = Math.min(radius, COMPLETE_ROUTE_ENDPOINT_RADIUS_KM);
  const first = route[0];
  const last = route[route.length - 1];
  return (distanceKm(first, start) <= effectiveRadius && distanceKm(last, end) <= effectiveRadius)
    || (distanceKm(first, end) <= effectiveRadius && distanceKm(last, start) <= effectiveRadius);
}

function routeLengthKm(route: Coordinate[]) {
  return route.length < 2 ? 0 : pathDistance(route, 0, route.length - 1);
}

function matchesFullRoute(route: Coordinate[], matchedSegments: TollSegment[], item: FullRoute) {
  if (!matchesRouteEnds(route, item.start, item.end, item.radius)) return false;

  // For routes that have been checked against the control base, endpoint +
  // total-length agreement is a safer fallback than approximate kilometre
  // markers. A 6% window separates the paid fast route from the longer free
  // alternative on the known M-4 directions.
  if (item.expectedKm) {
    const actualKm = routeLengthKm(route);
    const tolerance = item.distanceTolerancePercent ?? 6;
    const deviation = Math.abs(actualKm - item.expectedKm) / item.expectedKm * 100;
    if (item.strictExpectedKm) {
      if (deviation > tolerance) return false;
      return item.requirements.every((requirement) =>
        matchedSegments.filter((segment) => segment.name.startsWith(requirement.prefix)).length >= requirement.min);
    }
    if (deviation <= tolerance) return true;
  }

  return item.requirements.every((requirement) =>
    matchedSegments.filter((segment) => segment.name.startsWith(requirement.prefix)).length >= requirement.min);
}

function emptyTolls(date: Date) {
  const day = Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  return {
    amount: 0,
    weekdayAmount: 0,
    weekendAmount: 0,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: [] as string[],
    confidence: "none" as const,
  };
}

export function estimateTolls(route: Coordinate[], departureAt?: string) {
  const date = departureAt ? new Date(departureAt) : new Date();

  // A real Valhalla/OSRM geometry contains many points. Two points mean the
  // routing providers did not return geometry and the caller supplied only
  // origin/destination. Never infer toll roads from that straight line.
  if (route.length < 3) return emptyTolls(date);

  const day = Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  const denseRoute = densifyRoute(route);
  const segments = [...M1, ...M3, ...M4, ...M11, ...M12, ...CKAD, ...A289, ...REGIONAL]
    .filter((segment) => matchesSegment(denseRoute, segment));
  const completeRoute = FULL_ROUTES.find((item) => matchesFullRoute(denseRoute, segments, item));
  const weekdayAmount = completeRoute
    ? completeRoute.weekday
    : segments.reduce((sum, segment) => sum + segment.weekday, 0);
  const weekendAmount = completeRoute
    ? completeRoute.weekend
    : segments.reduce((sum, segment) => sum + segment.weekend, 0);
  return {
    amount: weekend ? weekendAmount : weekdayAmount,
    weekdayAmount,
    weekendAmount,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: completeRoute ? [completeRoute.name] : segments.map((segment) => segment.name),
    confidence: completeRoute || segments.length > 0 ? "matched" as const : "none" as const,
  };
}


/**
 * Complete route totals assembled from current operator tariffs are authoritative
 * for that exact corridor. They take precedence over adding local plaza rows,
 * which can overlap at entry/exit systems.
 */
export function isAuthoritativeFullRouteEstimate(estimate: ReturnType<typeof estimateTolls>) {
  if (estimate.confidence !== "matched" || estimate.segments.length !== 1) return false;
  return FULL_ROUTES.some((item) =>
    item.pricingAuthority === "official_operator_aggregate" && item.name === estimate.segments[0],
  );
}
