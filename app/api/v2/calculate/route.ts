import { NextRequest, NextResponse } from "next/server";
import { estimateTolls, type Coordinate } from "@/lib/tolls";
import { safeRoutePositions } from "@/lib/safe-route";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { findVerifiedRoute, tollPeriodsForRoute } from "@/lib/verified-routes";

type Point = { label: string; position?: { lat: number; lng: number } };
type Located = { label: string; position: { lat: number; lng: number } };
type RouteSummary = { meters: number; seconds: number };
type RouteWithGeometry = RouteSummary & { coordinates: Coordinate[] };
type RouteQuality = {
  status: "verified" | "single" | "warning";
  providers: string[];
  distanceSpreadPercent: number | null;
  message: string;
};
type KnownRoute = {
  start: Located["position"];
  end: Located["position"];
  radiusKm: number;
  meters: number;
  seconds: number;
};
type ValidatedCandidate = {
  name: string;
  route: RouteWithGeometry;
  validation: TollValidation;
};

type TollEstimate = ReturnType<typeof estimateTolls>;

const MAX_VERIFIED_SPREAD_PERCENT = 7;
const VERIFIED_TOLL_FALLBACK_TOLERANCE_PERCENT = 5;
const MIN_TOLL_VARIANT_DISTANCE_KM = 10;
const MIN_TOLL_VARIANT_DISTANCE_PERCENT = 1;
const MIN_TOLL_VARIANT_TIME_MINUTES = 15;
const MIN_TOLL_VARIANT_TIME_PERCENT = 5;

const KNOWN_FAST_ROUTES: readonly KnownRoute[] = [
  {
    start: { lat: 44.894818, lng: 37.316367 },
    end: { lat: 51.660781, lng: 39.200296 },
    radiusKm: 12,
    meters: 990_000,
    seconds: 39_720,
  },
];

const KNOWN_FREE_ROUTES: readonly KnownRoute[] = [
  {
    start: { lat: 44.894818, lng: 37.316367 },
    end: { lat: 51.660781, lng: 39.200296 },
    radiusKm: 12,
    meters: 1_030_000,
    seconds: 52_380,
  },
  {
    start: { lat: 55.755819, lng: 37.617644 },
    end: { lat: 45.03547, lng: 38.975313 },
    radiusKm: 6,
    meters: 1_450_000,
    seconds: 70_740,
  },
  {
    start: { lat: 55.755819, lng: 37.617644 },
    end: { lat: 43.585472, lng: 39.723098 },
    radiusKm: 6,
    meters: 1_740_000,
    seconds: 95_571,
  },
  {
    start: { lat: 59.938784, lng: 30.314997 },
    end: { lat: 43.585472, lng: 39.723098 },
    radiusKm: 6,
    meters: 2_467_508,
    seconds: 133_720,
  },
];

function distanceKm(a: Located["position"], b: Located["position"]) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function knownRoute(routes: readonly KnownRoute[], from: Located, to: Located): RouteSummary | undefined {
  const match = routes.find((route) =>
    (distanceKm(from.position, route.start) <= route.radiusKm && distanceKm(to.position, route.end) <= route.radiusKm)
    || (distanceKm(from.position, route.end) <= route.radiusKm && distanceKm(to.position, route.start) <= route.radiusKm));
  return match ? { meters: match.meters, seconds: match.seconds } : undefined;
}

function knownFreeRoute(from: Located, to: Located) {
  return knownRoute(KNOWN_FREE_ROUTES, from, to);
}

function knownFastRoute(from: Located, to: Located) {
  return knownRoute(KNOWN_FAST_ROUTES, from, to);
}

function spreadPercent(a: RouteSummary, b: RouteSummary) {
  return Math.round((Math.abs(a.meters - b.meters) / ((a.meters + b.meters) / 2)) * 1000) / 10;
}

function selectRoute(
  primary: { name: string; route: RouteSummary } | undefined,
  secondary: { name: string; route: RouteSummary } | undefined,
  known?: RouteSummary,
) {
  if (known) {
    const providers = [primary?.name, secondary?.name, "контрольная база"].filter(Boolean) as string[];
    const candidates = [primary, secondary].filter(Boolean) as Array<{ name: string; route: RouteSummary }>;
    const closest = candidates.sort((a, b) => Math.abs(a.route.meters - known.meters) - Math.abs(b.route.meters - known.meters))[0];
    const spread = closest ? spreadPercent(closest.route, known) : null;
    return {
      route: known,
      quality: {
        status: "verified",
        providers,
        distanceSpreadPercent: spread,
        message: "Маршрут сверен с контрольной базой",
      } satisfies RouteQuality,
    };
  }

  if (primary && secondary) {
    const spread = spreadPercent(primary.route, secondary.route);
    return {
      route: primary.route,
      quality: {
        status: spread <= MAX_VERIFIED_SPREAD_PERCENT ? "verified" : "warning",
        providers: [primary.name, secondary.name],
        distanceSpreadPercent: spread,
        message: spread <= MAX_VERIFIED_SPREAD_PERCENT
          ? "Расстояние подтверждено двумя сервисами"
          : `Источники расходятся на ${spread}%. Проверьте маршрут перед поездкой`,
      } satisfies RouteQuality,
    };
  }

  const only = primary ?? secondary;
  if (!only) throw new Error("ROUTE_UNAVAILABLE");
  return {
    route: only.route,
    quality: {
      status: "single",
      providers: [only.name],
      distanceSpreadPercent: null,
      message: "Результат получен от одного сервиса",
    } satisfies RouteQuality,
  };
}

function selectValidatedFreeRoute(candidates: ValidatedCandidate[], known?: RouteSummary) {
  if (known) {
    const selected = selectRoute(
      candidates[0] ? { name: candidates[0].name, route: candidates[0].route } : undefined,
      candidates[1] ? { name: candidates[1].name, route: candidates[1].route } : undefined,
      known,
    );
    const confirmed = candidates.find((candidate) => candidate.validation.status === "free");
    return { ...selected, validation: confirmed?.validation ?? candidates[0]?.validation ?? null };
  }

  const confirmedFree = candidates.filter((candidate) => candidate.validation.status === "free");
  const unknown = candidates.filter((candidate) => candidate.validation.status === "unknown");
  const usable = confirmedFree.length > 0 ? confirmedFree : unknown;
  if (usable.length === 0) return null;

  const selected = selectRoute(
    usable[0] ? { name: usable[0].name, route: usable[0].route } : undefined,
    usable[1] ? { name: usable[1].name, route: usable[1].route } : undefined,
  );
  const validation = usable[0].validation;

  if (confirmedFree.length === 0) {
    return {
      ...selected,
      quality: {
        ...selected.quality,
        status: "warning" as const,
        message: "Маршрут построен без платных дорог, но независимая проверка платности временно недоступна",
      },
      validation,
    };
  }

  return { ...selected, validation };
}

async function geocode(point: Point): Promise<Located> {
  if (point.position) return { label: point.label, position: point.position };
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", point.label);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" } });
  if (!response.ok) throw new Error("GEOCODE_UNAVAILABLE");
  const data = (await response.json()) as { features?: Array<{ geometry?: { coordinates?: Coordinate }; properties?: Record<string, string | undefined> }> };
  const item = data.features?.[0];
  const coordinates = item?.geometry?.coordinates;
  if (!coordinates) throw new Error("ADDRESS_NOT_FOUND");
  const p = item?.properties ?? {};
  return { label: [p.name, p.city, p.state].filter(Boolean).join(", ") || point.label, position: { lng: coordinates[0], lat: coordinates[1] } };
}

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

async function valhalla(from: Located, to: Located, useTolls: 0 | 1): Promise<RouteWithGeometry> {
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  const query = { locations: safeRoutePositions(from, to).map((point) => ({ lat: point.lat, lon: point.lng })), costing: "auto", costing_options: { auto: { use_tolls: useTolls } }, units: "kilometers", directions_type: "none" };
  url.searchParams.set("json", JSON.stringify(query));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as { trip?: { summary?: { length?: number; time?: number }; legs?: Array<{ shape?: string }> } };
  const summary = data.trip?.summary;
  if (!summary?.length || !summary.time) throw new Error("ROUTE_NOT_FOUND");
  const coordinates = (data.trip?.legs ?? []).flatMap((item) => item.shape ? decodePolyline(item.shape) : []);
  return { meters: Math.round(summary.length * 1000), seconds: Math.round(summary.time), coordinates };
}

async function brouterFree(from: Located, to: Located): Promise<RouteWithGeometry> {
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", safeRoutePositions(from, to).map((point) => `${point.lng},${point.lat}`).join("|"));
  url.searchParams.set("profile", "car-vario");
  url.searchParams.set("profile:avoid_toll", "1");
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");
  const response = await fetch(url, {
    headers: { Accept: "application/geo+json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as {
    features?: Array<{
      properties?: { "track-length"?: string | number; "total-time"?: string | number };
      geometry?: { coordinates?: Coordinate[] };
    }>;
  };
  const feature = data.features?.[0];
  const properties = feature?.properties;
  const meters = Number(properties?.["track-length"]);
  const seconds = Number(properties?.["total-time"]);
  if (!Number.isFinite(meters) || !Number.isFinite(seconds) || meters <= 0 || seconds <= 0) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(meters), seconds: Math.round(seconds), coordinates: feature?.geometry?.coordinates ?? [] };
}

async function osrmRoute(from: Located, to: Located): Promise<RouteWithGeometry> {
  const path = safeRoutePositions(from, to).map((point) => `${point.lng},${point.lat}`).join(";");
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${path}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as { routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: Coordinate[] } }> };
  const route = data.routes?.[0];
  if (!route?.distance || !route.duration) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(route.distance), seconds: Math.round(route.duration), coordinates: route.geometry?.coordinates ?? [] as Coordinate[] };
}

function verifiedTollFallback(from: Located, to: Located, fast: RouteSummary, current: TollEstimate, departureAt?: string): TollEstimate {
  if (current.segments.length > 0) return current;

  const verified = findVerifiedRoute(from.label, to.label).route;
  if (!verified || verified.tollRub <= 0 || verified.fastKm <= 0) return current;

  const actualKm = fast.meters / 1000;
  const deviationPercent = Math.abs(actualKm - verified.fastKm) / verified.fastKm * 100;
  const tolerancePercent = Math.max(VERIFIED_TOLL_FALLBACK_TOLERANCE_PERCENT, verified.accuracyPercent || 0);
  if (deviationPercent > tolerancePercent) return current;

  const periods = tollPeriodsForRoute(verified);
  const date = departureAt ? new Date(departureAt) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = validDate.getDay();
  const weekend = day === 0 || day === 5 || day === 6;

  return {
    amount: weekend ? periods.weekend : periods.weekday,
    weekdayAmount: periods.weekday,
    weekendAmount: periods.weekend,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: [`Проверенная база: ${verified.source}`],
    confidence: "matched",
  };
}

function mapMatchedTollFallback(current: TollEstimate, validation: TollValidation): TollEstimate {
  if (current.segments.length > 0 || validation.status !== "toll") return current;
  return {
    ...current,
    segments: [validation.roadNames.length > 0
      ? `Map matching: ${validation.roadNames.slice(0, 3).join(", ")}`
      : "Map matching: подтверждены платные дорожные рёбра"],
    confidence: "matched",
  };
}

function routingDifferenceTollFallback(fast: RouteSummary, free: RouteSummary, current: TollEstimate): TollEstimate {
  if (current.segments.length > 0) return current;

  const distanceDeltaKm = (free.meters - fast.meters) / 1000;
  const distancePercent = fast.meters > 0 ? (free.meters - fast.meters) / fast.meters * 100 : 0;
  const timeDeltaMinutes = (free.seconds - fast.seconds) / 60;
  const timePercent = fast.seconds > 0 ? (free.seconds - fast.seconds) / fast.seconds * 100 : 0;
  const distanceDiffers = distanceDeltaKm >= MIN_TOLL_VARIANT_DISTANCE_KM && distancePercent >= MIN_TOLL_VARIANT_DISTANCE_PERCENT;
  const timeDiffers = timeDeltaMinutes >= MIN_TOLL_VARIANT_TIME_MINUTES && timePercent >= MIN_TOLL_VARIANT_TIME_PERCENT;

  if (!distanceDiffers && !timeDiffers) return current;

  return {
    ...current,
    segments: ["Маршрут без платных дорог отличается от быстрого варианта"],
    confidence: "none",
  };
}

async function leg(from: Located, to: Located, departureAt?: string) {
  const [fastResult, valhallaFreeResult, brouterResult, osrmResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    valhalla(from, to, 0),
    brouterFree(from, to),
    osrmRoute(from, to),
  ]);

  const selectedFast = selectRoute(
    fastResult.status === "fulfilled" ? { name: "Valhalla", route: fastResult.value } : undefined,
    osrmResult.status === "fulfilled" ? { name: "OSRM", route: osrmResult.value } : undefined,
    knownFastRoute(from, to),
  );

  const routeGeometry = fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
    ? fastResult.value.coordinates
    : osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
      ? osrmResult.value.coordinates
      : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];

  const [fastValidation, valhallaFreeValidation, brouterValidation] = await Promise.all([
    validateTollEdges(routeGeometry),
    valhallaFreeResult.status === "fulfilled" && valhallaFreeResult.value.coordinates.length > 0
      ? validateTollEdges(valhallaFreeResult.value.coordinates)
      : Promise.resolve(null),
    brouterResult.status === "fulfilled" && brouterResult.value.coordinates.length > 0
      ? validateTollEdges(brouterResult.value.coordinates)
      : Promise.resolve(null),
  ]);

  const freeCandidates: ValidatedCandidate[] = [];
  if (valhallaFreeResult.status === "fulfilled" && valhallaFreeValidation) {
    freeCandidates.push({ name: "Valhalla", route: valhallaFreeResult.value, validation: valhallaFreeValidation });
  }
  if (brouterResult.status === "fulfilled" && brouterValidation) {
    freeCandidates.push({ name: "BRouter", route: brouterResult.value, validation: brouterValidation });
  }

  const selectedFree = (() => {
    try {
      return selectValidatedFreeRoute(freeCandidates, knownFreeRoute(from, to));
    } catch {
      return null;
    }
  })();

  const geometricTolls = estimateTolls(routeGeometry, departureAt);
  const verifiedTolls = verifiedTollFallback(from, to, selectedFast.route, geometricTolls, departureAt);
  const matchedTolls = mapMatchedTollFallback(verifiedTolls, fastValidation);
  const tolls = selectedFree && fastValidation.status === "unknown"
    ? routingDifferenceTollFallback(selectedFast.route, selectedFree.route, matchedTolls)
    : matchedTolls;

  const hadFreeCandidates = freeCandidates.length > 0;
  const allFreeCandidatesPaid = hadFreeCandidates && freeCandidates.every((candidate) => candidate.validation.status === "toll");

  return {
    from: from.label,
    to: to.label,
    fast: { ...selectedFast.route, quality: selectedFast.quality, tolls, tollValidation: fastValidation },
    free: selectedFree ? { ...selectedFree.route, quality: selectedFree.quality, tollValidation: selectedFree.validation } : null,
    freeError: selectedFree
      ? undefined
      : allFreeCandidatesPaid
        ? "Маршрутизаторы предложили варианты с платными участками. Полностью бесплатный маршрут не подтверждён."
        : "Маршрут без платных дорог временно недоступен. Повторите расчёт позже.",
  };
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { from?: Point; via?: Point; to?: Point; mode?: "standard" | "dual"; departureAt?: string };
    if (!body.from?.label.trim() || !body.to?.label.trim() || (body.mode === "dual" && !body.via?.label.trim())) return NextResponse.json({ error: "Заполните все точки маршрута" }, { status: 400 });
    const located = await Promise.all([geocode(body.from), ...(body.mode === "dual" && body.via ? [geocode(body.via)] : []), geocode(body.to)]);
    const legs = body.mode === "dual"
      ? await Promise.all([leg(located[0], located[1], body.departureAt), leg(located[1], located[2], body.departureAt)])
      : [await leg(located[0], located[1], body.departureAt)];
    return NextResponse.json({ legs });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = { ADDRESS_NOT_FOUND: "Адрес не найден. Уточните город или населённый пункт.", GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен.", ROUTE_NOT_FOUND: "Не удалось построить автомобильный маршрут.", ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже." };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}