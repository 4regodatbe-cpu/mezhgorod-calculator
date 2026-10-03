import tariffSnapshot from "../../data/tolls/m12-2026-03-02-category1.json" with { type: "json" };
import evidenceSnapshot from "../../data/tolls/m12-rvp-evidence-2026-09-30.json" with { type: "json" };
import { amountByMarker } from "@/lib/toll-engine/m12-tariffs";
import {
  CALIBRATION_MARGIN_KM,
  DIRECT_CROSSING_RADIUS_KM,
  MAX_ABSOLUTE_CONTINUITY_ERROR_KM,
  MAX_RELATIVE_CONTINUITY_ERROR,
  inferInternalMarkers,
  projectM12Evidence,
  proveBoundaries,
} from "./m12-route-evidence";
import type { M12BoundaryCheck, M12ContinuityInterval, M12Coordinate, M12EvaluationInput, M12Projection, M12RouteResult, M12StrictSpan } from "./m12-route-types";
export { projectM12Evidence } from "./m12-route-evidence";
export type { M12BoundaryCheck, M12ContinuityInterval, M12Coordinate, M12EvaluationInput, M12Projection, M12RouteResult, M12StrictSpan } from "./m12-route-types";

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
