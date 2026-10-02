import currentPoints from "../../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json" with { type: "json" };
import spatialSnapshot from "../../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json" with { type: "json" };
import type { Coordinate } from "../tolls";
import type { TollValidation } from "../toll-validator";
import type { M11RoadEvidence } from "./m11-road-evidence";
import { buildM11FacilitySpatialEvidence } from "./m11-spatial-anchors";
import { resolveM11Boundaries } from "./m11-boundary-resolver";
import { selectM11CurrentCategory1Tariff } from "./m11-current-selection";

export type M11ProductionTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

export type M11ProductionResult = {
  tolls: M11ProductionTolls | null;
  validation: TollValidation | null;
  boundaryStatus: "resolved" | "unresolved";
  pricingStatus: "priced" | "unknown";
  blockedByMixedRoadEvidence: boolean;
  reason: string | null;
};

const facilities = buildM11FacilitySpatialEvidence(currentPoints, spatialSnapshot);

function isLegacyM11Segment(segment: string) {
  return segment.startsWith("М-11:") || segment.startsWith("M-11:");
}

function profileFor(departureAt?: string) {
  const parsed = departureAt ? new Date(departureAt) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = date.getDay();
  return day === 0 || day === 5 || day === 6 ? "friSun" : "monThu";
}

function selectionReason(value: ReturnType<typeof selectM11CurrentCategory1Tariff>) {
  return value.status === "unknown" ? value.reason : null;
}

export function calculateProductionM11(
  route: Coordinate[],
  roadEvidence: M11RoadEvidence | null | undefined,
  geometricSegments: string[],
  departureAt?: string,
): M11ProductionResult {
  if (!roadEvidence) return { tolls: null, validation: null, boundaryStatus: "unresolved", pricingStatus: "unknown", blockedByMixedRoadEvidence: false, reason: "m11_road_evidence_missing" };
  const blockedByMixedRoadEvidence = geometricSegments.some((segment) => !isLegacyM11Segment(segment));
  const resolution = resolveM11Boundaries({ evidence: roadEvidence, routeGeometry: route, spatialFacilities: facilities });
  if (resolution.status !== "resolved") return { tolls: null, validation: null, boundaryStatus: "unresolved", pricingStatus: "unknown", blockedByMixedRoadEvidence, reason: resolution.unresolvedReasons.join(",") || "boundary_unresolved" };

  const weekday = selectM11CurrentCategory1Tariff(resolution, "monThu");
  const weekend = selectM11CurrentCategory1Tariff(resolution, "friSun");
  const selected = selectM11CurrentCategory1Tariff(resolution, profileFor(departureAt));
  if (blockedByMixedRoadEvidence || weekday.status !== "priced" || weekend.status !== "priced" || selected.status !== "priced" || weekday.amountRub == null || weekend.amountRub == null || selected.amountRub == null) {
    return {
      tolls: null,
      validation: null,
      boundaryStatus: "resolved",
      pricingStatus: "unknown",
      blockedByMixedRoadEvidence,
      reason: blockedByMixedRoadEvidence ? "mixed_paid_road_evidence" : selectionReason(selected) ?? "current_tariff_not_verified",
    };
  }

  const pair = `${resolution.entryPointId}→${resolution.exitPointId}`;
  const validation: TollValidation = {
    status: "toll",
    source: "M-11 current boundary + tariff core",
    tollEdgeCount: resolution.crossings.length,
    checkedEdgeCount: resolution.crossings.length,
    wayIds: [],
    roadNames: ["М-11 Нева"],
    message: `Стоимость подтверждена текущей моделью М-11 для ${pair}`,
  };
  return {
    tolls: {
      amount: selected.amountRub,
      weekdayAmount: weekday.amountRub,
      weekendAmount: weekend.amountRub,
      period: profileFor(departureAt) === "friSun" ? "пятница–воскресенье" : "понедельник–четверг",
      segments: [`М-11: подтверждённые текущие границы ${pair}`],
      confidence: "matched",
    },
    validation,
    boundaryStatus: "resolved",
    pricingStatus: "priced",
    blockedByMixedRoadEvidence: false,
    reason: null,
  };
}
