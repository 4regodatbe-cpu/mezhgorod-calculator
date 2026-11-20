import type { Located, RouteWithGeometry } from "../route-providers";
import { hasReviewedZsdReentry } from "./zsd-reentry-policy";

// A fast ETA is not usable without the geometry and distance of that same trip.
export function isUsableRoute(route: RouteWithGeometry, from: Located, to: Located): boolean {
  if (!route || !Number.isFinite(route.meters) || route.meters <= 0
    || !Number.isFinite(route.seconds) || route.seconds <= 0
    || !Array.isArray(route.coordinates) || route.coordinates.length < 2) return false;
  if (!route.coordinates.every(point => Array.isArray(point) && point.length === 2
    && Number.isFinite(point[0]) && Math.abs(point[0]) <= 180
    && Number.isFinite(point[1]) && Math.abs(point[1]) <= 90)) return false;
  const near = (point: number[], endpoint: Located) => Math.hypot(
    (point[0] - endpoint.position.lng) * Math.cos(endpoint.position.lat * Math.PI / 180),
    point[1] - endpoint.position.lat,
  ) < 0.025; // Same endpoint tolerance as the existing routing-control policy.
  return near(route.coordinates[0], from) && near(route.coordinates.at(-1)!, to)
    && !hasReviewedZsdReentry(route.coordinates);
}
