import type { Coordinate } from "@/lib/tolls";
import type { M11RoadEvidence } from "@/lib/toll-engine/m11-road-evidence";
import { priceOtherRoadVerifiedSections } from "@/lib/toll-engine/other-road-current-tariffs";

export type CkadProductionResult = {
  candidate: boolean;
  exact: boolean;
  tolls: {
    amount: number;
    weekdayAmount: number;
    weekendAmount: number;
    period: "все дни";
    segments: string[];
    confidence: "matched";
  } | null;
  reason: string;
};

// Physical corridor controls for the eastern CKAD arc from M-4 to the northern
// M-11/A-107 side. These are route-shape evidence only; money always comes from
// the current official Avtodor snapshot in other-road-current-tariffs.ts.
const EAST_ARC_ANCHORS: readonly Coordinate[] = [
  [37.75, 55.32], // M-4
  [37.80, 55.35], // Domodedovo
  [38.05, 55.39], // M-5
  [38.34, 55.53], // Egoryevskoye sh.
  [38.35, 55.65], // Nosovikhinskoye sh.
  [38.46, 55.72], // M-12
  [38.50, 55.90], // M-7
  [37.92, 56.13], // M-8
  [37.55, 56.18], // A-104 / Dmitrovskoye sh.
] as const;

const EAST_ARC_SECTION_IDS = [
  "ckad-dom-m4",
  "ckad-m5-dom",
  "ckad-egor-m5",
  "ckad-nosov-egor",
  "ckad-m12-nosov",
  "ckad-m7-m12",
  "ckad-m8-m7",
  "ckad-a104-m8",
  "ckad-a107-a104",
  "ckad-m11-a107",
] as const;

const MAX_ANCHOR_DISTANCE_KM = 5;
const MIN_ARC_ROUTE_KM = 135;
const MAX_ARC_ROUTE_KM = 230;

function haversineKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestIndex(route: readonly Coordinate[], anchor: Coordinate) {
  let index = -1;
  let distanceKm = Number.POSITIVE_INFINITY;
  for (let current = 0; current < route.length; current += 1) {
    const distance = haversineKm(route[current], anchor);
    if (distance < distanceKm) {
      distanceKm = distance;
      index = current;
    }
  }
  return { index, distanceKm };
}

function routeDistanceBetween(route: readonly Coordinate[], fromIndex: number, toIndex: number) {
  const from = Math.min(fromIndex, toIndex);
  const to = Math.max(fromIndex, toIndex);
  let total = 0;
  for (let index = from + 1; index <= to; index += 1) total += haversineKm(route[index - 1], route[index]);
  return total;
}

function orderedAnchorIndices(route: readonly Coordinate[]) {
  const matches = EAST_ARC_ANCHORS.map((anchor) => nearestIndex(route, anchor));
  if (matches.some((item) => item.index < 0 || item.distanceKm > MAX_ANCHOR_DISTANCE_KM)) return null;
  const indices = matches.map((item) => item.index);
  const forward = indices.every((value, index) => index === 0 || value > indices[index - 1]);
  const reverse = indices.every((value, index) => index === 0 || value < indices[index - 1]);
  if (!forward && !reverse) return null;
  const arcKm = routeDistanceBetween(route, indices[0], indices.at(-1)!);
  if (arcKm < MIN_ARC_ROUTE_KM || arcKm > MAX_ARC_ROUTE_KM) return null;
  return { indices, direction: forward ? "m4_to_m11" as const : "m11_to_m4" as const, arcKm };
}

function hasStrictM11Continuation(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined, direction: "m4_to_m11" | "m11_to_m4", a104Index: number) {
  if (!evidence || evidence.malformedStrictCount > 0 || evidence.strictBlocks.length === 0) return false;
  const boundaryCoordinates = evidence.strictBlocks.flatMap((block) => [block.beginCoordinate, block.endCoordinate]);
  const indices = boundaryCoordinates.map((coordinate) => nearestIndex(route, coordinate)).filter((item) => item.distanceKm <= 2).map((item) => item.index);
  if (indices.length === 0) return false;
  return direction === "m4_to_m11"
    ? indices.some((index) => index > a104Index)
    : indices.some((index) => index < a104Index);
}

export function calculateProductionCkadM4M11(
  route: readonly Coordinate[],
  m11Evidence: M11RoadEvidence | null | undefined,
): CkadProductionResult {
  if (route.length < 3) return { candidate: false, exact: false, tolls: null, reason: "route_geometry_missing" };
  const arc = orderedAnchorIndices(route);
  if (!arc) return { candidate: false, exact: false, tolls: null, reason: "ckad_east_arc_not_proven" };
  const a104Index = arc.indices.at(-1)!;
  if (!hasStrictM11Continuation(route, m11Evidence, arc.direction, a104Index)) {
    return { candidate: true, exact: false, tolls: null, reason: "m11_continuation_after_ckad_not_proven" };
  }

  const priced = priceOtherRoadVerifiedSections(
    { status: "verified", roadId: "ckad", sectionIds: EAST_ARC_SECTION_IDS },
    "noTransponder",
    "allDays",
  );
  if (priced.status !== "priced") return { candidate: true, exact: false, tolls: null, reason: priced.reason };

  return {
    candidate: true,
    exact: true,
    tolls: {
      amount: priced.amountRub,
      weekdayAmount: priced.amountRub,
      weekendAmount: priced.amountRub,
      period: "все дни",
      segments: [`ЦКАД: подтверждён восточный коридор М-4→М-11 (${EAST_ARC_SECTION_IDS.length} официальных участков)`],
      confidence: "matched",
    },
    reason: `ckad_east_arc_verified:${Math.round(arc.arcKm)}km`,
  };
}

export const CKAD_M4_M11_NO_TRANSPONDER_SECTION_IDS = EAST_ARC_SECTION_IDS;
