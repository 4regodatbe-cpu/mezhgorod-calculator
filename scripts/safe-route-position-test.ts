import { CRIMEA_SAFE_GATEWAY, safeRoutePositions, type RoutePoint } from "../lib/safe-route.ts";

function point(label: string, lat: number, lng: number): RoutePoint {
  return { label, position: { lat, lng } };
}

function includesGateway(positions: Array<{lat: number; lng: number}>) {
  return positions.some((position) =>
    Math.abs(position.lat - CRIMEA_SAFE_GATEWAY.lat) < 0.00001 &&
    Math.abs(position.lng - CRIMEA_SAFE_GATEWAY.lng) < 0.00001
  );
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Safe-route regression failed: ${message}`);
}

assert(
  includesGateway(safeRoutePositions(point("Краснодар", 45.0, 39.0), point("Ялта", 44.5, 34.2))),
  "Crimea-to-mainland routes must retain the existing bridge gateway",
);
assert(
  includesGateway(safeRoutePositions(point("Сочи", 43.6, 39.7), point("Чонгар", 46.1, 34.5))),
  "southern-coast routes to the approved southwest corridor must retain the bridge gateway",
);
assert(
  includesGateway(safeRoutePositions(point("Керчь", 45.3, 36.5), point("Мариуполь", 47.1, 37.5))),
  "Crimea-to-eastern-special routes must retain the bridge gateway",
);
assert(
  !includesGateway(safeRoutePositions(point("Краснодар", 45.0, 39.0), point("Москва", 55.7, 37.6))),
  "ordinary routes must not gain the Crimea waypoint",
);
assert(
  !includesGateway(safeRoutePositions(point("Краснодар", 45.0, 39.0), point("Донецк", 48.0, 37.8))),
  "M4 special routes must not gain an unverified static corridor anchor",
);

console.log("Safe-route position tests GREEN");
