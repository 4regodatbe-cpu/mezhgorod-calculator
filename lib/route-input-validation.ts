import type { Point } from "./route-providers";

export const MAX_ROUTE_POINT_LABEL_CHARS = 256;

export function validPoint(point: Point | undefined): point is Point {
  if (!point || typeof point.label !== "string" || !point.label.trim()) return false;
  if (Array.from(point.label).length > MAX_ROUTE_POINT_LABEL_CHARS) return false;
  if (!point.position) return true;
  const { lat, lng } = point.position;
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
