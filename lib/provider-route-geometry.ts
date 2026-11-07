import type { Coordinate } from "./tolls";

export function hasValidProviderRouteGeometry(value: unknown): value is Coordinate[] {
  return Array.isArray(value)
    && value.length >= 2
    && value.every((point) => Array.isArray(point)
      && point.length >= 2
      && typeof point[0] === "number"
      && Number.isFinite(point[0])
      && point[0] >= -180
      && point[0] <= 180
      && typeof point[1] === "number"
      && Number.isFinite(point[1])
      && point[1] >= -90
      && point[1] <= 90);
}

export function requireProviderRouteGeometry(value: unknown): asserts value is Coordinate[] {
  if (!hasValidProviderRouteGeometry(value)) throw new Error("ROUTE_UNAVAILABLE");
}
