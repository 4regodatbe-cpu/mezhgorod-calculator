import { NextRequest, NextResponse } from "next/server";
import type { Coordinate } from "@/lib/tolls";
import { safeRoutePositions, type RoutePoint } from "@/lib/safe-route";

export const maxDuration = 40;

type RouteWithGeometry = {
  meters: number;
  seconds: number;
  coordinates: Coordinate[];
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: {
    type?: string;
    node_id?: string | number;
  };
};

function decodePolyline(encoded: string, precision = 6): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

async function geocode(label: string): Promise<RoutePoint> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", label);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`GEOCODE_HTTP_${response.status}`);

  const data = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: Coordinate };
      properties?: { name?: string; city?: string; state?: string; country?: string };
    }>;
  };
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates) throw new Error("ADDRESS_NOT_FOUND");
  const properties = feature?.properties ?? {};
  return {
    label: [properties.name, properties.city, properties.state].filter(Boolean).join(", ") || label,
    region: properties.state,
    position: { lng: coordinates[0], lat: coordinates[1] },
  };
}

async function fastRoute(from: RoutePoint, to: RoutePoint): Promise<RouteWithGeometry> {
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  const query = {
    locations: safeRoutePositions(from, to).map((point) => ({ lat: point.lat, lon: point.lng })),
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    directions_type: "none",
  };
  url.searchParams.set("json", JSON.stringify(query));

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    signal: AbortSignal.timeout(18_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`ROUTE_HTTP_${response.status}`);

  const data = (await response.json()) as {
    trip?: {
      summary?: { length?: number; time?: number };
      legs?: Array<{ shape?: string }>;
    };
  };
  const summary = data.trip?.summary;
  if (!summary?.length || !summary.time) throw new Error("ROUTE_NOT_FOUND");
  const coordinates = (data.trip?.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
  if (coordinates.length < 2) throw new Error("ROUTE_GEOMETRY_MISSING");
  return { meters: Math.round(summary.length * 1000), seconds: Math.round(summary.time), coordinates };
}

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

function nearestSegment(route: Coordinate[], anchor: { lat: number; lon: number }) {
  let nearestDistanceKm = Number.POSITIVE_INFINITY;
  let segmentIndex = -1;
  for (let index = 0; index < route.length - 1; index += 1) {
    const candidate = pointToSegmentKm(anchor, route[index], route[index + 1]);
    if (candidate < nearestDistanceKm) {
      nearestDistanceKm = candidate;
      segmentIndex = index;
    }
  }
  return { nearestDistanceKm, segmentIndex };
}

function localWindow(route: Coordinate[], segmentIndex: number, halfKm = 6) {
  let start = Math.max(0, segmentIndex);
  let end = Math.min(route.length - 1, segmentIndex + 1);
  let backwardKm = 0;
  let forwardKm = 0;
  while (start > 0 && backwardKm < halfKm) {
    backwardKm += distanceKm(route[start], route[start - 1]);
    start -= 1;
  }
  while (end < route.length - 1 && forwardKm < halfKm) {
    forwardKm += distanceKm(route[end], route[end + 1]);
    end += 1;
  }
  const points = route.slice(start, end + 1);
  if (points.length <= 160) return points;
  const step = (points.length - 1) / 159;
  return Array.from({ length: 160 }, (_, index) => points[Math.min(points.length - 1, Math.round(index * step))]);
}

async function trace(window: Coordinate[]) {
  const response = await fetch("https://valhalla1.openstreetmap.de/trace_attributes", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "MezhgorodCalc/2.0",
    },
    body: JSON.stringify({
      shape: window.map(([lon, lat]) => ({ lat, lon })),
      costing: "auto",
      shape_match: "walk_or_snap",
      trace_options: {
        search_radius: 45,
        gps_accuracy: 8,
        breakage_distance: 1500,
        interpolation_distance: 40,
      },
      filters: {
        action: "include",
        attributes: [
          "edge.toll",
          "edge.way_id",
          "edge.names",
          "edge.begin_shape_index",
          "edge.end_shape_index",
          "edge.end_osm_node_id",
          "node.type",
        ],
      },
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`TRACE_HTTP_${response.status}`);
  const data = (await response.json()) as { edges?: TraceEdge[] };
  const edges = data.edges ?? [];
  return {
    edgeCount: edges.length,
    tollEdgeCount: edges.filter((edge) => edge.toll === true).length,
    tollBooths: edges.flatMap((edge, edgeIndex) => {
      if (edge.end_node?.type !== "toll_booth") return [];
      return [{
        nodeId: edge.end_node.node_id === undefined ? null : String(edge.end_node.node_id),
        edgeIndex,
        wayId: edge.way_id === undefined ? null : String(edge.way_id),
        roadNames: edge.names ?? [],
        edgeToll: edge.toll === true,
        beginShapeIndex: edge.begin_shape_index,
        endShapeIndex: edge.end_shape_index,
      }];
    }),
  };
}

export async function GET(request: NextRequest) {
  const fromText = request.nextUrl.searchParams.get("from")?.trim();
  const toText = request.nextUrl.searchParams.get("to")?.trim();
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));
  if (!fromText || !toText || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Use ?from=...&to=...&lat=...&lon=..." }, { status: 400 });
  }

  const startedAt = Date.now();
  try {
    const [from, to] = await Promise.all([geocode(fromText), geocode(toText)]);
    const route = await fastRoute(from, to);
    const anchor = { lat, lon };
    const nearest = nearestSegment(route.coordinates, anchor);
    if (nearest.segmentIndex < 0) throw new Error("ANCHOR_NOT_NEAR_ROUTE");
    const window = localWindow(route.coordinates, nearest.segmentIndex);
    const traced = await trace(window);
    return NextResponse.json({
      from: from.label,
      to: to.label,
      anchor,
      nearestDistanceKm: Math.round(nearest.nearestDistanceKm * 1000) / 1000,
      fastKm: Math.round(route.meters / 100) / 10,
      windowPointCount: window.length,
      ...traced,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: message, elapsedMs: Date.now() - startedAt }, { status: 502 });
  }
}
