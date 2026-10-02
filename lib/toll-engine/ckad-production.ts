import type { Coordinate } from "../tolls.ts";
import type { M11RoadEvidence } from "./m11-road-evidence.ts";
import { resolveCkadEastArcEvidence } from "./ckad-evidence.ts";
import { priceOtherRoadVerifiedSections } from "./other-road-current-tariffs.ts";

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

export function calculateProductionCkadM4M11(
  route: readonly Coordinate[],
  m11Evidence: M11RoadEvidence | null | undefined,
): CkadProductionResult {
  const evidence = resolveCkadEastArcEvidence(route, m11Evidence);
  if (evidence.status !== "verified") {
    return { candidate: evidence.candidate, exact: false, tolls: null, reason: evidence.reason };
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
    reason: `ckad_east_arc_verified:${Math.round(evidence.arcKm)}km`,
  };
}

export const CKAD_M4_M11_NO_TRANSPONDER_SECTION_IDS = EAST_ARC_SECTION_IDS;
