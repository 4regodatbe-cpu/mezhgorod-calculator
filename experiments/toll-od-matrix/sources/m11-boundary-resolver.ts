import type { M11Coordinate, M11RoadEvidence } from "./m11-road-evidence";
import type { M11FacilitySpatialEvidence } from "./m11-spatial-anchors";

export type M11ResolvedCrossing = {
  tariffPointId: string;
  facilityId: string;
  routeIndex: number;
  distanceMeters: number;
  anchorId: string;
  anchorCoordinate: M11Coordinate;
};

export type M11BoundaryResolution =
  | { status: "resolved"; entryPointId: string; exitPointId: string; crossings: readonly M11ResolvedCrossing[]; confidence: "independently_verified_spatial"; unresolvedReasons: readonly [] }
  | { status: "unresolved"; entryPointId: null; exitPointId: null; crossings: readonly M11ResolvedCrossing[]; confidence: "insufficient"; unresolvedReasons: readonly string[] };

function haversineMeters(a: M11Coordinate, b: M11Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestVertex(shape: readonly M11Coordinate[], coordinate: M11Coordinate) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < shape.length; index += 1) {
    const distance = haversineMeters(shape[index], coordinate);
    if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
  }
  return { index: bestIndex, distanceMeters: bestDistance };
}

function strictIntervals(evidence: M11RoadEvidence, shape: readonly M11Coordinate[]) {
  return evidence.strictBlocks.map((block) => {
    const begin = nearestVertex(shape, block.beginCoordinate).index;
    const end = nearestVertex(shape, block.endCoordinate).index;
    return { from: Math.min(begin, end), to: Math.max(begin, end) };
  });
}

function insideAny(index: number, intervals: readonly { from: number; to: number }[]) {
  return intervals.some((interval) => index >= interval.from && index <= interval.to);
}

export function resolveM11Boundaries(args: {
  evidence: M11RoadEvidence;
  routeGeometry: readonly M11Coordinate[];
  spatialFacilities: readonly M11FacilitySpatialEvidence[];
  maxAnchorDistanceMeters?: number;
  maxEndpointDistanceMeters?: number;
}): M11BoundaryResolution {
  const maxDistance = args.maxAnchorDistanceMeters ?? 120;
  const maxEndpointDistance = args.maxEndpointDistanceMeters ?? 500;
  const reasons: string[] = [];
  if (args.routeGeometry.length < 2) reasons.push("route_geometry_missing_or_too_short");
  if (args.evidence.strictBlocks.length === 0) reasons.push("no_strict_m11_road_evidence");
  if (args.evidence.malformedStrictCount > 0) reasons.push("malformed_strict_m11_evidence");
  if (reasons.length > 0) return { status: "unresolved", entryPointId: null, exitPointId: null, crossings: [], confidence: "insufficient", unresolvedReasons: reasons };

  const intervals = strictIntervals(args.evidence, args.routeGeometry);
  const hits: M11ResolvedCrossing[] = [];
  for (const facility of args.spatialFacilities) {
    let best: M11ResolvedCrossing | null = null;
    for (const anchor of facility.anchors) {
      const anchorCoordinate: M11Coordinate = [anchor.coordinate.lon, anchor.coordinate.lat];
      const nearest = nearestVertex(args.routeGeometry, anchorCoordinate);
      if (nearest.distanceMeters > maxDistance || !insideAny(nearest.index, intervals)) continue;
      const hit: M11ResolvedCrossing = { tariffPointId: facility.tariffPointId, facilityId: facility.facilityId, routeIndex: nearest.index, distanceMeters: Math.round(nearest.distanceMeters * 10) / 10, anchorId: anchor.anchorId, anchorCoordinate };
      if (!best || hit.routeIndex < best.routeIndex || (hit.routeIndex === best.routeIndex && hit.distanceMeters < best.distanceMeters)) best = hit;
    }
    if (best) hits.push(best);
  }

  hits.sort((a, b) => a.routeIndex - b.routeIndex || a.distanceMeters - b.distanceMeters || a.tariffPointId.localeCompare(b.tariffPointId));
  const byPoint = new Map<string, M11ResolvedCrossing>();
  for (const hit of hits) if (!byPoint.has(hit.tariffPointId)) byPoint.set(hit.tariffPointId, hit);
  const crossings = [...byPoint.values()].sort((a, b) => a.routeIndex - b.routeIndex || a.distanceMeters - b.distanceMeters);

  if (crossings.length < 2) return { status: "unresolved", entryPointId: null, exitPointId: null, crossings, confidence: "insufficient", unresolvedReasons: [crossings.length === 0 ? "no_verified_boundary_crossing" : "only_one_verified_boundary_crossing"] };
  for (let index = 1; index < crossings.length; index += 1) {
    if (crossings[index - 1].routeIndex === crossings[index].routeIndex && crossings[index - 1].tariffPointId !== crossings[index].tariffPointId) {
      return { status: "unresolved", entryPointId: null, exitPointId: null, crossings, confidence: "insufficient", unresolvedReasons: ["ambiguous_boundary_crossing"] };
    }
  }

  const firstBlock = args.evidence.strictBlocks[0];
  const lastBlock = args.evidence.strictBlocks.at(-1)!;
  const entry = crossings[0];
  const exit = crossings.at(-1)!;
  const endpointReasons: string[] = [];
  if (haversineMeters(firstBlock.beginCoordinate, entry.anchorCoordinate) > maxEndpointDistance) endpointReasons.push("entry_not_proven_at_strict_m11_start");
  if (haversineMeters(lastBlock.endCoordinate, exit.anchorCoordinate) > maxEndpointDistance) endpointReasons.push("exit_not_proven_at_strict_m11_end");
  if (endpointReasons.length > 0) return { status: "unresolved", entryPointId: null, exitPointId: null, crossings, confidence: "insufficient", unresolvedReasons: endpointReasons };
  if (entry.tariffPointId === exit.tariffPointId) return { status: "unresolved", entryPointId: null, exitPointId: null, crossings, confidence: "insufficient", unresolvedReasons: ["same_boundary_only"] };

  return { status: "resolved", entryPointId: entry.tariffPointId, exitPointId: exit.tariffPointId, crossings, confidence: "independently_verified_spatial", unresolvedReasons: [] };
}
