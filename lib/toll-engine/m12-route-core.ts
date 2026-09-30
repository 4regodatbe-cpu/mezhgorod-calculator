import tariffSnapshot from "../../data/tolls/m12-2026-03-02-category1.json" with { type: "json" };
import evidenceSnapshot from "../../data/tolls/m12-rvp-evidence-2026-09-30.json" with { type: "json" };

export type M12Coordinate = [number, number];

export type M12StrictSpan = {
  beginKm: number;
  endKm: number;
};

export type M12Projection = {
  rvpKm: number;
  nearestDistanceKm: number;
  chainageKm: number;
};

export type M12BoundaryCheck = {
  status: "proven" | "unknown";
  direction: "forward" | "reverse" | null;
  firstRvpKm: number | null;
  lastRvpKm: number | null;
  entryOutsideRvpKm: number | null;
  exitOutsideRvpKm: number | null;
  entryRouteGapKm: number | null;
  exitRouteGapKm: number | null;
  entryOfficialGapKm: number | null;
  exitOfficialGapKm: number | null;
  calibrationMarginKm: number;
  reason: string | null;
};

export type M12ContinuityInterval = {
  fromRvpKm: number;
  toRvpKm: number;
  routeDeltaKm: number;
  officialDeltaKm: number;
  errorKm: number;
  toleranceKm: number;
  continuous: boolean;
  inferredMarkers: number[];
};

export type M12RouteResult = {
  status: "priced" | "unknown";
  amountRub: number | null;
  directMarkers: number[];
  inferredMarkers: number[];
  finalMarkers: number[];
  directCrossings: Array<M12Projection & { crossed: true }>;
  continuity: M12ContinuityInterval[];
  boundary: M12BoundaryCheck;
  effectiveFrom: string;
  sourceOrder: string;
  evidenceDate: string;
  reason: string | null;
};

export type M12EvaluationInput = {
  projections: M12Projection[];
  strictM12Span?: M12StrictSpan | null;
};

const DIRECT_CROSSING_RADIUS_KM = evidenceSnapshot.directCrossingRadiusKm;
const CALIBRATION_MARGIN_KM = 2.5;
const MAX_ABSOLUTE_CONTINUITY_ERROR_KM = 3;
const MAX_RELATIVE_CONTINUITY_ERROR = 0.025;

const officialMarkers = tariffSnapshot.sections.map((section) => section.rvpKm).sort((a, b) => a - b);
const amountByMarker = new Map(tariffSnapshot.sections.map((section) => [section.rvpKm, section.category1Rub]));

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

function inferInternalMarkers(direct: Array<M12Projection & { crossed: true }>) {
  const inferred = new Set<number>();
  const intervals: M12ContinuityInterval[] = [];
  let allContinuous = direct.length >= 2;

  for (let index = 1; index < direct.length; index += 1) {
    const from = direct[index - 1];
    const to = direct[index];
    const officialDeltaKm = Math.abs(to.rvpKm - from.rvpKm);
    const routeDeltaKm = to.chainageKm - from.chainageKm;
    const errorKm = Math.abs(routeDeltaKm - officialDeltaKm);
    const toleranceKm = Math.max(
      MAX_ABSOLUTE_CONTINUITY_ERROR_KM,
      officialDeltaKm * MAX_RELATIVE_CONTINUITY_ERROR,
    );
    const direction = Math.sign(to.rvpKm - from.rvpKm);
    const continuous = direction !== 0 && routeDeltaKm > 0 && errorKm <= toleranceKm;
    if (!continuous) allContinuous = false;

    const internal = continuous
      ? officialMarkers.filter((marker) => direction > 0
        ? marker > from.rvpKm && marker < to.rvpKm
        : marker < from.rvpKm && marker > to.rvpKm)
      : [];
    for (const marker of internal) inferred.add(marker);

    intervals.push({
      fromRvpKm: from.rvpKm,
      toRvpKm: to.rvpKm,
      routeDeltaKm: round(routeDeltaKm),
      officialDeltaKm,
      errorKm: round(errorKm),
      toleranceKm: round(toleranceKm),
      continuous,
      inferredMarkers: internal,
    });
  }

  return {
    inferredMarkers: [...inferred].sort((a, b) => a - b),
    intervals,
    allContinuous,
  };
}

function adjacentOutsideMarker(rvpKm: number, direction: number, side: "entry" | "exit") {
  const index = officialMarkers.indexOf(rvpKm);
  if (index < 0 || direction === 0) return null;
  const step = side === "entry" ? -direction : direction;
  return officialMarkers[index + step] ?? null;
}

function proveBoundaries(
  direct: Array<M12Projection & { crossed: true }>,
  strictM12Span?: M12StrictSpan | null,
): M12BoundaryCheck {
  const base: Omit<M12BoundaryCheck, "status" | "reason"> = {
    direction: null,
    firstRvpKm: direct[0]?.rvpKm ?? null,
    lastRvpKm: direct.at(-1)?.rvpKm ?? null,
    entryOutsideRvpKm: null,
    exitOutsideRvpKm: null,
    entryRouteGapKm: null,
    exitRouteGapKm: null,
    entryOfficialGapKm: null,
    exitOfficialGapKm: null,
    calibrationMarginKm: CALIBRATION_MARGIN_KM,
  };

  if (!strictM12Span || !Number.isFinite(strictM12Span.beginKm) || !Number.isFinite(strictM12Span.endKm)) {
    return { ...base, status: "unknown", reason: "Strict M-12 road span is unavailable" };
  }
  if (direct.length < 2) {
    return { ...base, status: "unknown", reason: "At least two direct calibrated RVP crossings are required" };
  }
  if (strictM12Span.endKm <= strictM12Span.beginKm) {
    return { ...base, status: "unknown", reason: "Strict M-12 road span is malformed" };
  }

  const first = direct[0];
  const last = direct.at(-1)!;
  const direction = Math.sign(last.rvpKm - first.rvpKm);
  if (direction === 0) {
    return { ...base, status: "unknown", reason: "RVP travel direction cannot be established" };
  }

  const entryRouteGapKm = first.chainageKm - strictM12Span.beginKm;
  const exitRouteGapKm = strictM12Span.endKm - last.chainageKm;
  const entryOutsideRvpKm = adjacentOutsideMarker(first.rvpKm, direction, "entry");
  const exitOutsideRvpKm = adjacentOutsideMarker(last.rvpKm, direction, "exit");
  const entryOfficialGapKm = entryOutsideRvpKm == null ? null : Math.abs(first.rvpKm - entryOutsideRvpKm);
  const exitOfficialGapKm = exitOutsideRvpKm == null ? null : Math.abs(exitOutsideRvpKm - last.rvpKm);

  const details: Omit<M12BoundaryCheck, "status" | "reason"> = {
    direction: direction > 0 ? "forward" : "reverse",
    firstRvpKm: first.rvpKm,
    lastRvpKm: last.rvpKm,
    entryOutsideRvpKm,
    exitOutsideRvpKm,
    entryRouteGapKm: round(entryRouteGapKm),
    exitRouteGapKm: round(exitRouteGapKm),
    entryOfficialGapKm,
    exitOfficialGapKm,
    calibrationMarginKm: CALIBRATION_MARGIN_KM,
  };

  if (entryRouteGapKm < 0 || exitRouteGapKm < 0) {
    return { ...details, status: "unknown", reason: "Direct RVP evidence falls outside the strict M-12 span" };
  }

  if (entryOfficialGapKm != null) {
    const permittedEntryGapKm = entryOfficialGapKm - CALIBRATION_MARGIN_KM;
    if (permittedEntryGapKm < 0 || entryRouteGapKm > permittedEntryGapKm) {
      return { ...details, status: "unknown", reason: "Entry boundary does not exclude the previous official RVP" };
    }
  }

  if (exitOfficialGapKm != null) {
    const permittedExitGapKm = exitOfficialGapKm - CALIBRATION_MARGIN_KM;
    if (permittedExitGapKm < 0 || exitRouteGapKm > permittedExitGapKm) {
      return { ...details, status: "unknown", reason: "Exit boundary does not exclude the next official RVP" };
    }
  }

  return { ...details, status: "proven", reason: null };
}

function unknownResult(
  direct: Array<M12Projection & { crossed: true }>,
  continuity: M12ContinuityInterval[],
  inferredMarkers: number[],
  boundary: M12BoundaryCheck,
  reason: string,
): M12RouteResult {
  return {
    status: "unknown",
    amountRub: null,
    directMarkers: direct.map((item) => item.rvpKm),
    inferredMarkers,
    finalMarkers: [],
    directCrossings: direct,
    continuity,
    boundary,
    effectiveFrom: tariffSnapshot.order.effectiveFrom,
    sourceOrder: `${tariffSnapshot.order.number} / ${tariffSnapshot.order.date}`,
    evidenceDate: evidenceSnapshot.evidenceDate,
    reason,
  };
}

export function evaluateM12Evidence(input: M12EvaluationInput): M12RouteResult {
  const direct = input.projections
    .filter((item) => Number.isFinite(item.nearestDistanceKm)
      && Number.isFinite(item.chainageKm)
      && item.nearestDistanceKm <= DIRECT_CROSSING_RADIUS_KM)
    .map((item) => ({ ...item, crossed: true as const }))
    .sort((a, b) => a.chainageKm - b.chainageKm);

  const continuity = inferInternalMarkers(direct);
  const boundary = proveBoundaries(direct, input.strictM12Span);

  if (direct.length === 0) {
    return unknownResult(direct, continuity.intervals, continuity.inferredMarkers, boundary, "No supported calibrated M-12 RVP crossing was proven");
  }
  if (direct.length < 2) {
    return unknownResult(direct, continuity.intervals, continuity.inferredMarkers, boundary, "Only one supported calibrated M-12 RVP crossing was proven");
  }
  if (!continuity.allContinuous) {
    return unknownResult(direct, continuity.intervals, continuity.inferredMarkers, boundary, "Official-kilometre continuity between direct RVP crossings is incomplete");
  }
  if (boundary.status !== "proven") {
    return unknownResult(direct, continuity.intervals, continuity.inferredMarkers, boundary, boundary.reason ?? "M-12 entry/exit boundaries are unproven");
  }

  const finalMarkers = [...new Set([
    ...direct.map((item) => item.rvpKm),
    ...continuity.inferredMarkers,
  ])].sort((a, b) => a - b);

  let amountRub = 0;
  for (const marker of finalMarkers) {
    const amount = amountByMarker.get(marker);
    if (amount == null || !Number.isFinite(amount) || amount < 0) {
      return unknownResult(direct, continuity.intervals, continuity.inferredMarkers, boundary, `Official tariff is unavailable for RVP ${marker}`);
    }
    amountRub += amount;
  }

  return {
    status: "priced",
    amountRub,
    directMarkers: direct.map((item) => item.rvpKm),
    inferredMarkers: continuity.inferredMarkers,
    finalMarkers,
    directCrossings: direct,
    continuity: continuity.intervals,
    boundary,
    effectiveFrom: tariffSnapshot.order.effectiveFrom,
    sourceOrder: `${tariffSnapshot.order.number} / ${tariffSnapshot.order.date}`,
    evidenceDate: evidenceSnapshot.evidenceDate,
    reason: null,
  };
}

export function calculateM12FromRoute(route: M12Coordinate[], strictM12Span?: M12StrictSpan | null) {
  return evaluateM12Evidence({
    projections: projectM12Evidence(route),
    strictM12Span,
  });
}

export function m12RouteCoreMetadata() {
  return {
    directCrossingRadiusKm: DIRECT_CROSSING_RADIUS_KM,
    calibrationMarginKm: CALIBRATION_MARGIN_KM,
    maxAbsoluteContinuityErrorKm: MAX_ABSOLUTE_CONTINUITY_ERROR_KM,
    maxRelativeContinuityError: MAX_RELATIVE_CONTINUITY_ERROR,
    evidenceDate: evidenceSnapshot.evidenceDate,
    tariffEffectiveFrom: tariffSnapshot.order.effectiveFrom,
  };
}
