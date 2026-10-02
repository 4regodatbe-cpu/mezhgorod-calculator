import { NextRequest, NextResponse } from "next/server";
import { geocode, valhalla, brouterFree, brouterFast, osrmRoute, type Point, type Located, type RouteSummary, type RouteWithGeometry } from "@/lib/route-providers";

function validPoint(point: Point | undefined): point is Point { if (!point || typeof point.label !== "string" || !point.label.trim()) return false; if (!point.position) return true; const { lat, lng } = point.position; return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180; }
import { estimateTolls } from "@/lib/tolls";
import { recoverCorridorTolls } from "@/lib/toll-recovery";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { findVerifiedRoute, goldenRouteReference, tollPeriodsForRoute } from "@/lib/verified-routes";
import { MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, selectLiveRoute, selectLiveRouteCandidates, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";
import { calculateProductionM4 } from "@/lib/toll-engine/m4-production";
import { calculateProductionM11 } from "@/lib/toll-engine/m11-production";
import { calculateM11MoscowToPetersburg } from "@/lib/toll-engine/m11-moscow-production";
import { calculateProductionM12 } from "@/lib/toll-engine/m12-production";
import { calculateProductionCkadM4M11 } from "@/lib/toll-engine/ckad-production";
import { composeRouteTolls, detectedFamiliesFromLegacySegments, type RouteTollComponent, type RouteTollComponentId } from "@/lib/toll-engine/route-toll-composition";
import { calculateRoutePricing, type PricingVehicle } from "@/lib/route-pricing-integration";

type FreeCandidate = { name: string; route: RouteWithGeometry };
type SelectedFree = {
  route: RouteSummary;
  quality: RouteQuality;
  validation: TollValidation;
  truth: "confirmed_free" | "candidate_unverified";
};
type TollEstimate = ReturnType<typeof estimateTolls>;
type ApiTolls = Omit<TollEstimate, "amount" | "weekdayAmount" | "weekendAmount"> & {
  amount: number | null;
  weekdayAmount: number | null;
  weekendAmount: number | null;
  pricingStatus: "priced" | "free" | "unknown";
};

const VERIFIED_TOLL_FALLBACK_TOLERANCE_PERCENT = 5;
const VERIFIED_TOLL_CONTROL_DEVIATION_PERCENT = 12;
const MIN_TOLL_VARIANT_DISTANCE_KM = 10;
const MIN_TOLL_VARIANT_DISTANCE_PERCENT = 1;
const MIN_TOLL_VARIANT_TIME_MINUTES = 15;
const MIN_TOLL_VARIANT_TIME_PERCENT = 5;

function unknownValidation(message: string): TollValidation {
  return {
    status: "unknown",
    source: "Valhalla map matching",
    tollEdgeCount: 0,
    checkedEdgeCount: 0,
    wayIds: [],
    roadNames: [],
    message,
  };
}

function compositionValidation(priced: RouteTollComponentId[], message: string): TollValidation {
  return {
    status: "toll",
    source: "Route toll composition",
    tollEdgeCount: priced.length,
    checkedEdgeCount: priced.length,
    wayIds: [],
    roadNames: priced,
    message,
    complete: true,
  };
}

function tollsForApi(tolls: TollEstimate, validation: TollValidation): ApiTolls {
  const hasPositivePrice = tolls.amount > 0 || tolls.weekdayAmount > 0 || tolls.weekendAmount > 0;
  if (hasPositivePrice) return { ...tolls, pricingStatus: "priced" };
  if (validation.status === "free") return { ...tolls, pricingStatus: "free" };
  return {
    ...tolls,
    amount: null,
    weekdayAmount: null,
    weekendAmount: null,
    pricingStatus: "unknown",
  };
}

function zeroUnknownTolls(base: TollEstimate, segments: string[]): TollEstimate {
  return {
    ...base,
    amount: 0,
    weekdayAmount: 0,
    weekendAmount: 0,
    segments,
    confidence: "none",
  };
}

function spreadPercent(a: RouteSummary, b: RouteSummary) {
  return Math.round((Math.abs(a.meters - b.meters) / ((a.meters + b.meters) / 2)) * 1000) / 10;
}

function routeDifferenceEvidence(fast: RouteSummary, free: RouteSummary) {
  const distanceDeltaKm = (free.meters - fast.meters) / 1000;
  const distancePercent = fast.meters > 0 ? (free.meters - fast.meters) / fast.meters * 100 : 0;
  const timeDeltaMinutes = (free.seconds - fast.seconds) / 60;
  const timePercent = fast.seconds > 0 ? (free.seconds - fast.seconds) / fast.seconds * 100 : 0;
  const distanceDiffers = distanceDeltaKm >= MIN_TOLL_VARIANT_DISTANCE_KM && distancePercent >= MIN_TOLL_VARIANT_DISTANCE_PERCENT;
  const timeDiffers = timeDeltaMinutes >= MIN_TOLL_VARIANT_TIME_MINUTES && timePercent >= MIN_TOLL_VARIANT_TIME_PERCENT;
  return distanceDiffers || timeDiffers;
}

function qualityForCandidate(selected: FreeCandidate, other: FreeCandidate | undefined, validation: TollValidation): RouteQuality {
  const base = selectLiveRoute(
    { name: selected.name, route: selected.route },
    other ? { name: other.name, route: other.route } : undefined,
  ).quality;
  if (validation.status === "free") return base;
  return {
    ...base,
    status: "warning",
    message: validation.message || "Независимая проверка бесплатности не завершена",
  };
}

function selectedCandidate(
  selected: FreeCandidate,
  other: FreeCandidate | undefined,
  validation: TollValidation,
  truth: SelectedFree["truth"],
): SelectedFree {
  return {
    route: selected.route,
    quality: qualityForCandidate(selected, other, validation),
    validation,
    truth,
  };
}

async function validateFreeCandidate(candidate: FreeCandidate, ordinal: "Первый" | "Второй") {
  return candidate.route.coordinates.length > 2
    ? validateTollEdges(candidate.route.coordinates)
    : unknownValidation(`${ordinal} источник не вернул геометрию`);
}

async function selectFreeRoute(
  valhallaFreeResult: PromiseSettledResult<RouteWithGeometry>,
  brouterResult: PromiseSettledResult<RouteWithGeometry>,
  known?: GoldenRouteReference,
): Promise<SelectedFree | null> {
  const candidates: FreeCandidate[] = [];
  if (valhallaFreeResult.status === "fulfilled") candidates.push({ name: "Valhalla", route: valhallaFreeResult.value });
  if (brouterResult.status === "fulfilled") candidates.push({ name: "BRouter", route: brouterResult.value });
  if (candidates.length === 0) return null;

  if (known) {
    const selected = selectLiveRoute(
      candidates[0] ? { name: candidates[0].name, route: candidates[0].route } : undefined,
      candidates[1] ? { name: candidates[1].name, route: candidates[1].route } : undefined,
      known,
    );
    return {
      ...selected,
      validation: unknownValidation("Контрольная база подтверждает длину/время альтернативы, но не отсутствие платных дорог"),
      truth: "candidate_unverified",
    };
  }

  const first = candidates[0];
  const second = candidates[1];
  const firstValidation = await validateFreeCandidate(first, "Первый");

  if (firstValidation.status === "free") {
    return selectedCandidate(first, second, firstValidation, "confirmed_free");
  }

  let secondValidation: TollValidation | null = null;
  if (second) {
    secondValidation = await validateFreeCandidate(second, "Второй");
    if (secondValidation.status === "free") {
      return selectedCandidate(second, first, secondValidation, "confirmed_free");
    }
  }

  const firstUnknown = firstValidation.status === "unknown";
  const secondUnknown = second && secondValidation?.status === "unknown";
  if (!firstUnknown && !secondUnknown) return null;

  if (firstUnknown && !secondUnknown) {
    return selectedCandidate(first, second, firstValidation, "candidate_unverified");
  }
  if (second && secondUnknown && !firstUnknown) {
    return selectedCandidate(second, first, secondValidation!, "candidate_unverified");
  }

  if (second && secondValidation) {
    const selected = spreadPercent(first.route, second.route) > MAX_PROVIDER_DISTANCE_SPREAD_PERCENT
      ? (first.route.meters <= second.route.meters ? first : second)
      : first;
    const validation = selected === first ? firstValidation : secondValidation;
    const other = selected === first ? second : first;
    return selectedCandidate(selected, other, validation, "candidate_unverified");
  }

  return selectedCandidate(first, undefined, firstValidation, "candidate_unverified");
}

function verifiedTollControl(from: Located, to: Located, fast: RouteSummary, departureAt?: string): TollEstimate | null {
  const verified = findVerifiedRoute(from.label, to.label).route;
  if (!verified || verified.tollRub <= 0 || verified.fastKm <= 0) return null;

  const actualKm = fast.meters / 1000;
  const deviationPercent = Math.abs(actualKm - verified.fastKm) / verified.fastKm * 100;
  const tolerancePercent = Math.max(VERIFIED_TOLL_FALLBACK_TOLERANCE_PERCENT, verified.accuracyPercent || 0);
  if (deviationPercent > tolerancePercent) return null;

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
    segments: [`Проверенная контрольная база: ${verified.source}`],
    confidence: "matched",
  };
}

function verifiedTollFallback(from: Located, to: Located, fast: RouteSummary, current: TollEstimate, departureAt?: string): TollEstimate {
  if (current.amount > 0) return current;
  return verifiedTollControl(from, to, fast, departureAt) ?? current;
}

function shouldUseVerifiedControl(current: TollEstimate, verified: TollEstimate | null) {
  if (!verified || verified.amount <= 0) return false;
  if (current.amount <= 0) return true;
  const deviation = Math.abs(current.amount - verified.amount) / verified.amount * 100;
  return deviation > VERIFIED_TOLL_CONTROL_DEVIATION_PERCENT;
}

function mapMatchedTollFallback(current: TollEstimate, validation: TollValidation): TollEstimate {
  if (current.amount > 0 || validation.status !== "toll") return current;
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
  if (!routeDifferenceEvidence(fast, free)) return current;
  return {
    ...current,
    segments: ["Подтверждённый бесплатный маршрут существенно отличается от быстрого варианта"],
    confidence: "none",
  };
}

function familySegments(segments: string[], family: RouteTollComponentId) {
  return segments.filter((segment) => detectedFamiliesFromLegacySegments([segment]).has(family));
}

async function leg(from: Located, to: Located, departureAt?: string, diagnostics = false) {
  const [fastResult, valhallaFreeResult, brouterResult, osrmResult, brouterFastResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    valhalla(from, to, 0),
    brouterFree(from, to),
    osrmRoute(from, to),
    brouterFast(from, to),
  ]);

  const selectedFast = selectLiveRouteCandidates([
    ...(fastResult.status === "fulfilled" ? [{ name: "Valhalla", route: fastResult.value }] : []),
    ...(osrmResult.status === "fulfilled" ? [{ name: "OSRM", route: osrmResult.value }] : []),
    ...(brouterFastResult.status === "fulfilled" ? [{ name: "BRouter", route: brouterFastResult.value }] : []),
  ], goldenRouteReference(from.label, to.label, "fast"));

  const routeGeometry = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
    ? fastResult.value.coordinates
    : selectedFast.provider === "OSRM" && osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
      ? osrmResult.value.coordinates
      : selectedFast.provider === "BRouter" && brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
        ? brouterFastResult.value.coordinates
        : fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
          ? fastResult.value.coordinates
          : osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
            ? osrmResult.value.coordinates
            : brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
              ? brouterFastResult.value.coordinates
              : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];

  const selectedFreePromise = selectFreeRoute(valhallaFreeResult, brouterResult, goldenRouteReference(from.label, to.label, "free"));
  const diagnosticFastValidationPromise: Promise<TollValidation | null> = diagnostics && routeGeometry.length > 2
    ? validateTollEdges(routeGeometry)
    : Promise.resolve(null);
  const [selectedFree, diagnosticFastValidation] = await Promise.all([selectedFreePromise, diagnosticFastValidationPromise]);
  const confirmedFree = selectedFree?.truth === "confirmed_free" ? selectedFree : null;
  const freeCandidate = selectedFree?.truth === "candidate_unverified" ? selectedFree : null;
  const differenceEvidence = confirmedFree ? routeDifferenceEvidence(selectedFast.route, confirmedFree.route) : false;

  const geometricTolls = estimateTolls(routeGeometry, departureAt);
  const legacyFamilies = detectedFamiliesFromLegacySegments(geometricTolls.segments);
  const valhallaEvidence = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" ? fastResult.value : null;

  const productionM4 = await calculateProductionM4(
    routeGeometry,
    departureAt,
    familySegments(geometricTolls.segments, "m4_a289"),
  );
  const productionM11Geometry = calculateM11MoscowToPetersburg(routeGeometry, selectedFast.route.seconds, departureAt);
  const productionM11 = selectedFast.provider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionM11(
        valhallaEvidence.coordinates,
        valhallaEvidence.m11RoadEvidence,
        familySegments(geometricTolls.segments, "m11"),
        departureAt,
      )
    : null;
  const productionM12 = selectedFast.provider === "Valhalla" && valhallaEvidence
    ? calculateProductionM12(
        valhallaEvidence.coordinates,
        valhallaEvidence.m12StrictSpan,
        familySegments(geometricTolls.segments, "m12"),
        departureAt,
      )
    : null;
  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");
  const m11Detected = productionM11Geometry.candidate || legacyFamilies.has("m11") || Boolean(valhallaEvidence?.m11RoadEvidence?.strictBlocks.length);
  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  const productionCkad = calculateProductionCkadM4M11(routeGeometry, valhallaEvidence?.m11RoadEvidence);
  // CKAD is a paid component only when legacy evidence names it or the strict
  // route-level CKAD engine proves a candidate/verified east-arc traversal.
  const ckadDetected = legacyFamilies.has("ckad") || productionCkad.candidate;

  const components: RouteTollComponent[] = [
    { id: "m4_a289", detected: m4Detected, tolls: productionM4.tolls, reason: productionM4.reason },
    { id: "m11", detected: m11Detected, tolls: productionM11Geometry.tolls ?? productionM11?.tolls ?? null, reason: productionM11Geometry.exact ? productionM11Geometry.reason : productionM11?.reason ?? productionM11Geometry.reason },
    { id: "m12", detected: m12Detected, tolls: productionM12?.tolls ?? null, reason: productionM12?.core.reason ?? "m12_not_priced" },
    { id: "ckad", detected: ckadDetected, tolls: productionCkad.tolls, reason: productionCkad.reason },
    { id: "m1", detected: legacyFamilies.has("m1"), tolls: null, reason: "m1_engine_not_yet_composed" },
    { id: "m3", detected: legacyFamilies.has("m3"), tolls: null, reason: "m3_engine_not_yet_composed" },
    { id: "regional", detected: legacyFamilies.has("regional"), tolls: null, reason: "regional_engine_not_yet_composed" },
  ];
  const composition = composeRouteTolls(components);
  const verifiedControl = verifiedTollControl(from, to, selectedFast.route, departureAt);

  let pricedTolls: TollEstimate;
  let fastValidation: TollValidation;
  let routeCompositionBlocked = false;

  if (composition.status === "priced" && composition.tolls) {
    pricedTolls = composition.tolls;
    fastValidation = compositionValidation(composition.priced, `Полный итог составлен из дорожных систем: ${composition.priced.join(", ")}`);
  } else if (composition.status === "unknown") {
    routeCompositionBlocked = true;
    const missingReasons = components
      .filter((component) => composition.missing.includes(component.id))
      .map((component) => `${component.id}: ${component.reason ?? "причина не указана"}`);
    pricedTolls = zeroUnknownTolls(
      geometricTolls,
      [
        `Обнаружены, но не полностью оценены платные системы: ${composition.missing.join(", ")}`,
        ...missingReasons,
      ],
    );
    fastValidation = unknownValidation(
      `Нельзя показывать частичную сумму как итог маршрута. Не оценены: ${missingReasons.join("; ")}`,
    );
  } else {
    pricedTolls = verifiedTollFallback(from, to, selectedFast.route, geometricTolls, departureAt);
    fastValidation = diagnosticFastValidation
      ?? unknownValidation(pricedTolls.amount > 0
        ? "Стоимость получена из проверенного или геометрического источника"
        : "Map matching быстрого маршрута ещё не выполнялся");
  }

  if (!routeCompositionBlocked && shouldUseVerifiedControl(pricedTolls, verifiedControl)) {
    pricedTolls = verifiedControl!;
    fastValidation = compositionValidation(composition.priced.length > 0 ? composition.priced : [...legacyFamilies], "Локальный расчёт существенно расходился с недавно проверенным контрольным маршрутом; использован контрольный итог вместо заведомо неполной суммы.");
  }

  if (!routeCompositionBlocked && pricedTolls.amount <= 0) {
    const conservativeValidation = unknownValidation("Локальный коридорный fallback без доверия к удалённому map matching");
    const localRecovery = recoverCorridorTolls(routeGeometry, conservativeValidation, departureAt, differenceEvidence);
    if (localRecovery) pricedTolls = localRecovery;
  }

  if (!routeCompositionBlocked && pricedTolls.amount <= 0 && routeGeometry.length > 2) {
    if (!diagnosticFastValidation) fastValidation = await validateTollEdges(routeGeometry);
    const matchedTolls = mapMatchedTollFallback(pricedTolls, fastValidation);
    const remoteRecovery = recoverCorridorTolls(routeGeometry, fastValidation, departureAt, differenceEvidence);
    pricedTolls = remoteRecovery ?? matchedTolls;
  }

  const tolls = confirmedFree && !routeCompositionBlocked
    ? routingDifferenceTollFallback(selectedFast.route, confirmedFree.route, pricedTolls)
    : pricedTolls;

  return {
    from: from.label,
    to: to.label,
    fast: { ...selectedFast.route, quality: selectedFast.quality, tolls: tollsForApi(tolls, fastValidation), tollValidation: fastValidation },
    free: confirmedFree ? { ...confirmedFree.route, quality: confirmedFree.quality, tollValidation: confirmedFree.validation } : null,
    freeCandidate: freeCandidate ? { ...freeCandidate.route, quality: freeCandidate.quality, tollValidation: freeCandidate.validation } : null,
    freeError: confirmedFree
      ? undefined
      : freeCandidate
        ? "Найден альтернативный маршрут, но независимая проверка не подтвердила отсутствие платных участков."
        : "Маршрутизаторы не смогли подтвердить полностью бесплатный вариант. Показан только быстрый маршрут.",
  };
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { from?: Point; via?: Point; to?: Point; mode?: "standard" | "dual"; departureAt?: string; diagnostics?: boolean; vehicle?: PricingVehicle };
    if (body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual") return NextResponse.json({ error: "Некорректный режим расчёта" }, { status: 400 });
    if (body.departureAt !== undefined && (typeof body.departureAt !== "string" || Number.isNaN(new Date(body.departureAt).getTime()))) return NextResponse.json({ error: "Некорректная дата поездки" }, { status: 400 });
    if (body.vehicle !== undefined && !["standard", "comfort", "comfort_plus", "minivan"].includes(body.vehicle)) return NextResponse.json({ error: "Некорректный класс автомобиля" }, { status: 400 });
    if (!validPoint(body.from) || !validPoint(body.to) || (body.mode === "dual" && !validPoint(body.via))) return NextResponse.json({ error: "Проверьте точки маршрута" }, { status: 400 });
    const located = await Promise.all([geocode(body.from), ...(body.mode === "dual" && body.via ? [geocode(body.via)] : []), geocode(body.to)]);
    const legs = body.mode === "dual"
      ? await Promise.all([leg(located[0], located[1], body.departureAt, body.diagnostics === true), leg(located[1], located[2], body.departureAt, body.diagnostics === true)])
      : [await leg(located[0], located[1], body.departureAt, body.diagnostics === true)];
    const pricing = calculateRoutePricing({
      from: located[0].label,
      to: located[located.length - 1].label,
      vehicle: body.vehicle,
      legs: legs.map((route, index) => ({
        from: located[index].label,
        to: located[index + 1].label,
        distanceKm: route.fast.meters / 1000,
      })),
    });
    return NextResponse.json({ legs, ...pricing });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = { ADDRESS_NOT_FOUND: "Адрес не найден. Уточните город или населённый пункт.", GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен.", ROUTE_NOT_FOUND: "Не удалось построить автомобильный маршрут.", ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже." };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}