import type { Coordinate } from "@/lib/tolls";
import { M4_PLAZA_NODES, type M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";
import { evaluateM4RouteTraversal, type M4RouteTraversalEvidence } from "@/lib/toll-engine/m4-route-traversal";

export const CANDIDATE_RADIUS_KM = 1.5;
export const WINDOW_HALF_KM = 4;
const MAX_WINDOW_POINTS = 120;

export type Candidate = {
  plaza: M4PlazaNodeGroup;
  nearestDistanceKm: number;
  segmentIndex: number;
  window: Coordinate[];
  traversal: M4RouteTraversalEvidence;
};

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function pointToSegmentKm(anchor: { lat: number; lon: number }, a: Coordinate, b: Coordinate) {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(anchor.lat * Math.PI / 180);
  const ax = (a[0] - anchor.lon) * lonScale;
  const ay = (a[1] - anchor.lat) * latScale;
  const bx = (b[0] - anchor.lon) * lonScale;
  const by = (b[1] - anchor.lat) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 1e-12) return Math.hypot(ax, ay);
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function nearestSegment(route: Coordinate[], plaza: M4PlazaNodeGroup) {
  let nearestDistanceKm = Number.POSITIVE_INFINITY;
  let segmentIndex = -1;

  for (const anchor of plaza.anchors) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const candidateDistance = pointToSegmentKm(anchor, route[index], route[index + 1]);
      if (candidateDistance < nearestDistanceKm) {
        nearestDistanceKm = candidateDistance;
        segmentIndex = index;
      }
    }
  }

  return { nearestDistanceKm, segmentIndex };
}

function sampleWindow(points: Coordinate[]) {
  if (points.length <= MAX_WINDOW_POINTS) return points;
  const step = (points.length - 1) / (MAX_WINDOW_POINTS - 1);
  const sampled: Coordinate[] = [];
  for (let index = 0; index < MAX_WINDOW_POINTS; index += 1) {
    sampled.push(points[Math.min(points.length - 1, Math.round(index * step))]);
  }
  sampled[sampled.length - 1] = points[points.length - 1];
  return sampled;
}

function localWindow(route: Coordinate[], segmentIndex: number) {
  let start = Math.max(0, segmentIndex);
  let end = Math.min(route.length - 1, segmentIndex + 1);
  let backwardKm = 0;
  let forwardKm = 0;

  while (start > 0 && backwardKm < WINDOW_HALF_KM) {
    backwardKm += distanceKm(route[start], route[start - 1]);
    start -= 1;
  }
  while (end < route.length - 1 && forwardKm < WINDOW_HALF_KM) {
    forwardKm += distanceKm(route[end], route[end + 1]);
    end += 1;
  }

  return sampleWindow(route.slice(start, end + 1));
}

export function candidatesForRoute(route: Coordinate[]): Candidate[] {
  if (route.length < 2) return [];
  const candidates: Candidate[] = [];

  for (const plaza of M4_PLAZA_NODES) {
    const nearest = nearestSegment(route, plaza);
    if (nearest.segmentIndex < 0 || nearest.nearestDistanceKm > CANDIDATE_RADIUS_KM) continue;
    candidates.push({
      plaza,
      nearestDistanceKm: nearest.nearestDistanceKm,
      segmentIndex: nearest.segmentIndex,
      window: localWindow(route, nearest.segmentIndex),
      traversal: evaluateM4RouteTraversal(route, plaza),
    });
  }

  candidates.sort((a, b) => a.segmentIndex - b.segmentIndex || a.plaza.km - b.plaza.km);
  return candidates;
}
