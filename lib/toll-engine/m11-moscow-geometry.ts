import spatialSnapshot from "../../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json" with { type: "json" };

export type Coordinate = [number, number];
type Facility = { tariffPointId: string; anchors: Array<{ lat: number; lon: number }> };

export const MOSCOW_M11_ENTRY: Coordinate = [37.472, 55.8842];
export const ENTRY_MAX_DISTANCE_KM = 1.5;
export const FACILITY_MAX_DISTANCE_KM = 0.8;
const facilities = spatialSnapshot.facilities as Facility[];

export function haversineKm(a: Coordinate, b: Coordinate) {
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

export function nearestSegment(route: readonly Coordinate[], anchors: readonly Coordinate[]) {
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

export function facilityAnchors(pointId: string): Coordinate[] {
  const facility = facilities.find((item) => item.tariffPointId === pointId);
  return facility?.anchors.map((anchor) => [anchor.lon, anchor.lat] as Coordinate) ?? [];
}

function cumulativeDistance(route: readonly Coordinate[]) {
  const result = [0];
  for (let index = 1; index < route.length; index += 1) result.push(result[index - 1] + haversineKm(route[index - 1], route[index]));
  return result;
}

export function crossingAt(start: Date, route: readonly Coordinate[], segmentIndex: number, routeSeconds: number) {
  const cumulative = cumulativeDistance(route);
  const total = cumulative.at(-1) ?? 0;
  const ratio = total > 0 ? Math.max(0, Math.min(1, cumulative[Math.max(0, segmentIndex)] / total)) : 0;
  return new Date(start.getTime() + routeSeconds * ratio * 1000);
}


export function countStrictFacilityHits(route: readonly Coordinate[]) {
  return facilities.filter((facility) =>
    nearestSegment(route, facility.anchors.map((anchor) => [anchor.lon, anchor.lat] as Coordinate)).distanceKm <= FACILITY_MAX_DISTANCE_KM
  ).length;
}
