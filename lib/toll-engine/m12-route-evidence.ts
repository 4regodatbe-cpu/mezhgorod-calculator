import tariffSnapshot from "../../data/tolls/m12-2026-03-02-category1.json" with { type: "json" };
import evidenceSnapshot from "../../data/tolls/m12-rvp-evidence-2026-09-30.json" with { type: "json" };
import type { M12BoundaryCheck, M12ContinuityInterval, M12Projection, M12StrictSpan } from "./m12-route-types";

export const DIRECT_CROSSING_RADIUS_KM = evidenceSnapshot.directCrossingRadiusKm;
export const CALIBRATION_MARGIN_KM = 2.5;
export const MAX_ABSOLUTE_CONTINUITY_ERROR_KM = 3;
export const MAX_RELATIVE_CONTINUITY_ERROR = 0.025;

const officialMarkers = tariffSnapshot.sections.map((section) => section.rvpKm).sort((a, b) => a - b);
const amountByMarker = new Map(tariffSnapshot.sections.map((section) => [section.rvpKm, section.category1Rub]));

export function inferInternalMarkers(direct: Array<M12Projection & { crossed: true }>) {
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

export function proveBoundaries(
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
