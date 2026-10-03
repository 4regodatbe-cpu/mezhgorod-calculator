import evidenceSnapshot from "../../data/tolls/m12-rvp-evidence-2026-09-30.json" with { type: "json" };
import type { M12Coordinate, M12Projection } from "./m12-route-types.ts";

function round(value: number, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function haversineKm(a: M12Coordinate, b: M12Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function cumulativeKm(route: M12Coordinate[]) {
  const result = [0];
  for (let index = 1; index < route.length; index += 1) {
    result.push(result[index - 1] + haversineKm(route[index - 1], route[index]));
  }
  return result;
}

function projectSegment(point: M12Coordinate, a: M12Coordinate, b: M12Coordinate) {
  const meanLatitude = ((point[1] + a[1] + b[1]) / 3) * Math.PI / 180;
  const xScale = 111.320 * Math.cos(meanLatitude);
  const yScale = 110.574;
  const bx = (b[0] - a[0]) * xScale;
  const by = (b[1] - a[1]) * yScale;
  const px = (point[0] - a[0]) * xScale;
  const py = (point[1] - a[1]) * yScale;
  const denominator = bx * bx + by * by;
  const rawT = denominator > 0 ? (px * bx + py * by) / denominator : 0;
  const t = Math.max(0, Math.min(1, rawT));
  const projected: M12Coordinate = [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  return { t, distanceKm: haversineKm(point, projected) };
}

function projectPointToRoute(route: M12Coordinate[], chain: number[], point: M12Coordinate) {
  let best: { nearestDistanceKm: number; chainageKm: number } | null = null;
  for (let index = 1; index < route.length; index += 1) {
    const hit = projectSegment(point, route[index - 1], route[index]);
    if (!best || hit.distanceKm < best.nearestDistanceKm) {
      const segmentKm = chain[index] - chain[index - 1];
      best = {
        nearestDistanceKm: hit.distanceKm,
        chainageKm: chain[index - 1] + segmentKm * hit.t,
      };
    }
  }
  return best;
}

export function projectM12Evidence(route: M12Coordinate[]): M12Projection[] {
  if (route.length < 2) return [];
  const chain = cumulativeKm(route);
  return evidenceSnapshot.anchors.map((anchor) => {
    const center = anchor.center as M12Coordinate;
    const hit = projectPointToRoute(route, chain, center);
    if (!hit) {
      return { rvpKm: anchor.rvpKm, nearestDistanceKm: Number.POSITIVE_INFINITY, chainageKm: 0 };
    }
    return {
      rvpKm: anchor.rvpKm,
      nearestDistanceKm: round(hit.nearestDistanceKm),
      chainageKm: round(hit.chainageKm),
    };
  });
}

