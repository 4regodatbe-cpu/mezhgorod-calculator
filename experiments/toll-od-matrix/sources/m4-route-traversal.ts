import type { M4PlazaNodeGroup } from "./m4-plaza-nodes.ts";

export type M4TraversalCoordinate = [number, number];

export type M4RouteTraversalEvidence = {
  confirmed: boolean;
  nearestDistanceKm: number;
  routeKmBefore: number;
  routeKmAfter: number;
  straightThrough: boolean;
  reason: string;
};

const MAX_TRAVERSAL_DISTANCE_KM = 0.2;
const MIN_ROUTE_FLANK_KM = 0.75;
const MIN_LOCAL_HEADING_COSINE = 0.15;
const SAMPLE_OFFSET_KM = 0.5;

type Projection = {
  segmentIndex: number;
  t: number;
  distanceKm: number;
  point: M4TraversalCoordinate;
};

function haversineKm(a: M4TraversalCoordinate, b: M4TraversalCoordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function projectToSegment(
  anchor: { lat: number; lon: number },
  a: M4TraversalCoordinate,
  b: M4TraversalCoordinate,
): Omit<Projection, "segmentIndex"> {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(anchor.lat * Math.PI / 180);
  const ax = (a[0] - anchor.lon) * lonScale;
  const ay = (a[1] - anchor.lat) * latScale;
  const bx = (b[0] - anchor.lon) * lonScale;
  const by = (b[1] - anchor.lat) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared <= 1e-12
    ? 0
    : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  const px = ax + t * dx;
  const py = ay + t * dy;
  return {
    t,
    distanceKm: Math.hypot(px, py),
    point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
  };
}

function nearestProjection(route: readonly M4TraversalCoordinate[], plaza: M4PlazaNodeGroup): Projection | null {
  let nearest: Projection | null = null;
  for (const anchor of plaza.anchors) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const projected = projectToSegment(anchor, route[index], route[index + 1]);
      if (!nearest || projected.distanceKm < nearest.distanceKm) {
        nearest = { segmentIndex: index, ...projected };
      }
    }
  }
  return nearest;
}

function cumulativeDistances(route: readonly M4TraversalCoordinate[]) {
  const cumulative = [0];
  for (let index = 1; index < route.length; index += 1) {
    cumulative.push(cumulative[index - 1] + haversineKm(route[index - 1], route[index]));
  }
  return cumulative;
}

function pointAtDistance(
  route: readonly M4TraversalCoordinate[],
  cumulative: readonly number[],
  targetKm: number,
): M4TraversalCoordinate {
  const total = cumulative.at(-1) ?? 0;
  const target = Math.max(0, Math.min(total, targetKm));
  for (let index = 0; index < route.length - 1; index += 1) {
    if (cumulative[index + 1] < target) continue;
    const span = cumulative[index + 1] - cumulative[index];
    const t = span > 1e-9 ? (target - cumulative[index]) / span : 0;
    return [
      route[index][0] + (route[index + 1][0] - route[index][0]) * t,
      route[index][1] + (route[index + 1][1] - route[index][1]) * t,
    ];
  }
  return route[route.length - 1];
}

function localVector(origin: M4TraversalCoordinate, target: M4TraversalCoordinate) {
  const lat = (origin[1] + target[1]) / 2;
  const lonScale = 111.320 * Math.cos(lat * Math.PI / 180);
  return [
    (target[0] - origin[0]) * lonScale,
    (target[1] - origin[1]) * 110.574,
  ] as const;
}

function headingCosine(
  before: M4TraversalCoordinate,
  crossing: M4TraversalCoordinate,
  after: M4TraversalCoordinate,
) {
  const inbound = localVector(before, crossing);
  const outbound = localVector(crossing, after);
  const inboundLength = Math.hypot(inbound[0], inbound[1]);
  const outboundLength = Math.hypot(outbound[0], outbound[1]);
  if (inboundLength < 0.05 || outboundLength < 0.05) return -1;
  return (inbound[0] * outbound[0] + inbound[1] * outbound[1]) / (inboundLength * outboundLength);
}

export function evaluateM4RouteTraversal(
  route: readonly M4TraversalCoordinate[],
  plaza: M4PlazaNodeGroup,
): M4RouteTraversalEvidence {
  const rejected = (reason: string, nearestDistanceKm = Number.POSITIVE_INFINITY, routeKmBefore = 0, routeKmAfter = 0, straightThrough = false): M4RouteTraversalEvidence => ({
    confirmed: false,
    nearestDistanceKm,
    routeKmBefore,
    routeKmAfter,
    straightThrough,
    reason,
  });

  if (route.length < 3) return rejected("route_geometry_too_short");
  if (plaza.verification === "spatial_local") return rejected("plaza_evidence_too_weak");

  const projection = nearestProjection(route, plaza);
  if (!projection) return rejected("no_route_projection");

  const cumulative = cumulativeDistances(route);
  const segmentLength = haversineKm(route[projection.segmentIndex], route[projection.segmentIndex + 1]);
  const crossingKm = cumulative[projection.segmentIndex] + segmentLength * projection.t;
  const totalKm = cumulative.at(-1) ?? 0;
  const routeKmBefore = crossingKm;
  const routeKmAfter = Math.max(0, totalKm - crossingKm);

  if (projection.distanceKm > MAX_TRAVERSAL_DISTANCE_KM) {
    return rejected("outside_strict_traversal_radius", projection.distanceKm, routeKmBefore, routeKmAfter);
  }
  if (routeKmBefore < MIN_ROUTE_FLANK_KM || routeKmAfter < MIN_ROUTE_FLANK_KM) {
    return rejected("insufficient_route_flanks", projection.distanceKm, routeKmBefore, routeKmAfter);
  }

  const before = pointAtDistance(route, cumulative, crossingKm - SAMPLE_OFFSET_KM);
  const after = pointAtDistance(route, cumulative, crossingKm + SAMPLE_OFFSET_KM);
  const cosine = headingCosine(before, projection.point, after);
  const straightThrough = cosine >= MIN_LOCAL_HEADING_COSINE;
  if (!straightThrough) {
    return rejected("local_u_turn_or_sharp_reversal", projection.distanceKm, routeKmBefore, routeKmAfter, false);
  }

  return {
    confirmed: true,
    nearestDistanceKm: projection.distanceKm,
    routeKmBefore,
    routeKmAfter,
    straightThrough: true,
    reason: "strict_anchor_crossing_with_bidirectional_route_flanks",
  };
}

export const M4_ROUTE_TRAVERSAL_LIMITS = Object.freeze({
  maxDistanceKm: MAX_TRAVERSAL_DISTANCE_KM,
  minRouteFlankKm: MIN_ROUTE_FLANK_KM,
  minLocalHeadingCosine: MIN_LOCAL_HEADING_COSINE,
  sampleOffsetKm: SAMPLE_OFFSET_KM,
});
