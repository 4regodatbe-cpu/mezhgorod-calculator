import { NextRequest, NextResponse } from "next/server";
import type { Coordinate } from "@/lib/tolls";
import { safeRoutePositions, type RoutePoint } from "@/lib/safe-route";
import { validateKnownM4Plazas } from "@/lib/toll-engine/m4-route-validator";
import { priceM4RoutePlazaValidation } from "@/lib/toll-engine/m4-local-pricing";

export const maxDuration = 50;

type RouteWithGeometry = {
  meters: number;
  seconds: number;
  coordinates: Coordinate[];
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
  const resolvedLabel = [properties.name, properties.city, properties.state].filter(Boolean).join(", ") || label;

  return {
    label: resolvedLabel,
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

  return {
    meters: Math.round(summary.length * 1000),
    seconds: Math.round(summary.time),
    coordinates,
  };
}

export async function GET(request: NextRequest) {
  const fromText = request.nextUrl.searchParams.get("from")?.trim();
  const toText = request.nextUrl.searchParams.get("to")?.trim();
  const departureAt = request.nextUrl.searchParams.get("departureAt")?.trim() || undefined;
  if (!fromText || !toText) {
    return NextResponse.json({ error: "Use ?from=...&to=..." }, { status: 400 });
  }

  const startedAt = Date.now();
  try {
    const [from, to] = await Promise.all([geocode(fromText), geocode(toText)]);
    const route = await fastRoute(from, to);
    const validation = await validateKnownM4Plazas(route.coordinates);
    const pricing = priceM4RoutePlazaValidation(validation, departureAt);

    return NextResponse.json({
      from: from.label,
      to: to.label,
      fastKm: Math.round(route.meters / 100) / 10,
      fastMinutes: Math.round(route.seconds / 60),
      geometryPoints: route.coordinates.length,
      validation,
      pricing,
      totalElapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: message, totalElapsedMs: Date.now() - startedAt }, { status: 502 });
  }
}
