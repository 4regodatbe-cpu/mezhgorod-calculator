import type { Coordinate } from "../tolls";
import type { TollValidation } from "../toll-validator";
import { calculateM12FromRoute, type M12RouteResult, type M12StrictSpan } from "./m12-route-core";

export type M12ProductionTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

export type M12ProductionResult = {
  core: M12RouteResult;
  tolls: M12ProductionTolls | null;
  validation: TollValidation | null;
  blockedByMixedRoadEvidence: boolean;
};

function periodFor(departureAt?: string) {
  const parsed = departureAt ? new Date(departureAt) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = date.getDay();
  return day === 0 || day === 5 || day === 6
    ? "пятница–воскресенье"
    : "понедельник–четверг";
}

function isLegacyM12Segment(segment: string) {
  return segment.startsWith("М-12:") || segment.startsWith("M-12:");
}

function exactValidation(core: M12RouteResult): TollValidation {
  return {
    status: "toll",
    source: "M-12 local RVP core",
    tollEdgeCount: core.finalMarkers.length,
    checkedEdgeCount: core.finalMarkers.length,
    wayIds: [],
    roadNames: ["М-12 Восток"],
    message: `Стоимость подтверждена локальной моделью РВП М-12: ${core.finalMarkers.join(", ")} км`,
  };
}

export function calculateProductionM12(
  route: Coordinate[],
  strictM12Span: M12StrictSpan | null | undefined,
  geometricSegments: string[],
  departureAt?: string,
): M12ProductionResult {
  const core = calculateM12FromRoute(route, strictM12Span ?? null);
  const blockedByMixedRoadEvidence = geometricSegments.some((segment) => !isLegacyM12Segment(segment));

  if (core.status !== "priced" || core.amountRub == null || blockedByMixedRoadEvidence) {
    return {
      core,
      tolls: null,
      validation: null,
      blockedByMixedRoadEvidence,
    };
  }

  const amount = core.amountRub;
  return {
    core,
    tolls: {
      amount,
      weekdayAmount: amount,
      weekendAmount: amount,
      period: periodFor(departureAt),
      segments: [`М-12: подтверждённые РВП ${core.finalMarkers.join("–")} км`],
      confidence: "matched",
    },
    validation: exactValidation(core),
    blockedByMixedRoadEvidence: false,
  };
}
