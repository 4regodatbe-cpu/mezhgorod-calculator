import type { M11Coordinate, M11EvidenceProvider, M11RoadBlock, M11CandidateClue, M11RoadEvidence, M11ValhallaManeuver, M11ValhallaLeg, M11OsrmStep, M11OsrmLeg } from "./m11-road-evidence-types.ts";
export type { M11Coordinate, M11EvidenceProvider, M11RoadBlock, M11CandidateClue, M11RoadEvidence, M11ValhallaManeuver, M11ValhallaLeg, M11OsrmStep, M11OsrmLeg } from "./m11-road-evidence-types.ts";

const M11_NAME = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*11(?:[^0-9]|$)/iu;
const NEVA_NAME = /нева/iu;

function roundKm(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalized(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim()))];
}

function isM11Label(value: string) {
  return M11_NAME.test(value);
}

function haversineKm(a: M11Coordinate, b: M11Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function cumulativeShapeKm(shape: M11Coordinate[]) {
  const result = shape.length > 0 ? [0] : [];
  for (let index = 1; index < shape.length; index += 1) {
    result.push(result[index - 1] + haversineKm(shape[index - 1], shape[index]));
  }
  return result;
}

function strictValhallaLabels(maneuver: M11ValhallaManeuver) {
  return normalized([...(maneuver.street_names ?? []), ...(maneuver.begin_street_names ?? [])]);
}

type StrictItem = {
  provider: M11EvidenceProvider;
  legIndex: number;
  sourceIndex: number;
  beginKm: number | null;
  endKm: number | null;
  beginCoordinate: M11Coordinate;
  endCoordinate: M11Coordinate;
  labels: string[];
};

function blocksFromStrict(items: StrictItem[]): M11RoadBlock[] {
  const blocks: M11RoadBlock[] = [];

  for (const item of items) {
    const previous = blocks.at(-1);
    const canExtend = previous
      && previous.provider === item.provider
      && previous.legIndex === item.legIndex
      && item.sourceIndex === previous.sourceEndIndex + 1;

    if (!canExtend) {
      blocks.push({
        provider: item.provider,
        legIndex: item.legIndex,
        sourceStartIndex: item.sourceIndex,
        sourceEndIndex: item.sourceIndex,
        beginKm: item.beginKm,
        endKm: item.endKm,
        lengthKm: item.beginKm !== null && item.endKm !== null ? roundKm(item.endKm - item.beginKm) : null,
        beginCoordinate: item.beginCoordinate,
        endCoordinate: item.endCoordinate,
        labels: [...item.labels],
      });
      continue;
    }

    previous.sourceEndIndex = item.sourceIndex;
    previous.endKm = item.endKm;
    previous.endCoordinate = item.endCoordinate;
    previous.labels = [...new Set([...previous.labels, ...item.labels])];
    previous.lengthKm = previous.beginKm !== null && previous.endKm !== null
      ? roundKm(previous.endKm - previous.beginKm)
      : null;
  }

  return blocks;
}

export function deriveM11EvidenceFromValhalla(legs: M11ValhallaLeg[]): M11RoadEvidence {
  const strictItems: StrictItem[] = [];
  let malformedStrictCount = 0;
  let routeOffsetKm = 0;

  for (let legIndex = 0; legIndex < legs.length; legIndex += 1) {
    const leg = legs[legIndex];
    const shape = leg.coordinates ?? [];
    const chain = cumulativeShapeKm(shape);
    const maneuvers = leg.maneuvers ?? [];

    for (let sourceIndex = 0; sourceIndex < maneuvers.length; sourceIndex += 1) {
      const maneuver = maneuvers[sourceIndex];
      const labels = strictValhallaLabels(maneuver);
      if (!labels.some(isM11Label)) continue;

      const begin = maneuver.begin_shape_index;
      const end = maneuver.end_shape_index;
      const valid = Number.isInteger(begin)
        && Number.isInteger(end)
        && (begin as number) >= 0
        && (end as number) >= (begin as number)
        && (end as number) < shape.length;

      if (!valid) {
        malformedStrictCount += 1;
        continue;
      }

      const beginIndex = begin as number;
      const endIndex = end as number;
      strictItems.push({
        provider: "valhalla",
        legIndex,
        sourceIndex,
        beginKm: roundKm(routeOffsetKm + chain[beginIndex]),
        endKm: roundKm(routeOffsetKm + chain[endIndex]),
        beginCoordinate: shape[beginIndex],
        endCoordinate: shape[endIndex],
        labels,
      });
    }

    routeOffsetKm += chain.at(-1) ?? 0;
  }

  return {
    provider: "valhalla",
    strictBlocks: blocksFromStrict(strictItems),
    candidateClues: [],
    malformedStrictCount,
  };
}

function osrmStrictLabels(step: M11OsrmStep) {
  return normalized([step.name, step.ref]);
}

function osrmAllClueLabels(step: M11OsrmStep) {
  return normalized([step.name, step.ref, step.destinations]);
}

function osrmBoundaryCoordinates(step: M11OsrmStep): { begin: M11Coordinate | null; end: M11Coordinate | null } {
  const geometry = step.geometry?.coordinates ?? [];
  const fallback = step.maneuver?.location ?? null;
  return {
    begin: geometry[0] ?? fallback,
    end: geometry.at(-1) ?? fallback,
  };
}

export function deriveM11EvidenceFromOsrm(legs: M11OsrmLeg[]): M11RoadEvidence {
  const strictItems: StrictItem[] = [];
  const candidateClues: M11CandidateClue[] = [];
  let malformedStrictCount = 0;
  let routeKm = 0;
  let distanceReliable = true;

  for (let legIndex = 0; legIndex < legs.length; legIndex += 1) {
    const steps = legs[legIndex].steps ?? [];

    for (let sourceIndex = 0; sourceIndex < steps.length; sourceIndex += 1) {
      const step = steps[sourceIndex];
      const distanceMeters = Number(step.distance);
      const validDistance = Number.isFinite(distanceMeters) && distanceMeters >= 0;
      const beginKm = distanceReliable ? roundKm(routeKm) : null;
      const endKm = distanceReliable && validDistance ? roundKm(routeKm + distanceMeters / 1000) : null;
      const boundaries = osrmBoundaryCoordinates(step);
      const strictLabels = osrmStrictLabels(step);
      const strict = strictLabels.some(isM11Label);

      if (strict) {
        if (!validDistance || !boundaries.begin || !boundaries.end) {
          malformedStrictCount += 1;
        } else {
          strictItems.push({
            provider: "osrm",
            legIndex,
            sourceIndex,
            beginKm,
            endKm,
            beginCoordinate: boundaries.begin,
            endCoordinate: boundaries.end,
            labels: strictLabels,
          });
        }
      } else {
        const reasons: M11CandidateClue["reasons"] = [];
        if (typeof step.destinations === "string" && isM11Label(step.destinations)) reasons.push("destination_m11");
        if (osrmAllClueLabels(step).some((value) => NEVA_NAME.test(value))) reasons.push("neva_without_strict_ref");
        if (reasons.length > 0) {
          candidateClues.push({
            provider: "osrm",
            legIndex,
            sourceIndex,
            reasons: [...new Set(reasons)],
            beginKm,
            endKm,
            beginCoordinate: boundaries.begin,
            endCoordinate: boundaries.end,
            labels: osrmAllClueLabels(step),
          });
        }
      }

      if (validDistance && distanceReliable) routeKm += distanceMeters / 1000;
      else if (!validDistance) distanceReliable = false;
    }
  }

  return {
    provider: "osrm",
    strictBlocks: blocksFromStrict(strictItems),
    candidateClues,
    malformedStrictCount,
  };
}
