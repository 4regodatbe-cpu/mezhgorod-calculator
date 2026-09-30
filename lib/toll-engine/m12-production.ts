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

type M12UnknownTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "none";
  toJSON: () => {
    amount: null;
    weekdayAmount: null;
    weekendAmount: null;
    period: string;
    segments: string[];
    confidence: "none";
    pricingStatus: "unknown";
  };
};

export type M12ProductionResult = {
  core: M12RouteResult;
  tolls: M12ProductionTolls | M12UnknownTolls | null;
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

function unknownValidation(core: M12RouteResult): TollValidation {
  return {
    status: "unknown",
    source: "M-12 local RVP core",
    tollEdgeCount: 0,
    checkedEdgeCount: core.directCrossings.length,
    wayIds: [],
    roadNames: ["М-12 Восток"],
    message: core.reason
      ? `Точная стоимость М-12 не подтверждена: ${core.reason}`
      : "Точная стоимость М-12 не подтверждена локальной моделью РВП",
  };
}

function unknownTolls(departureAt?: string): M12UnknownTolls {
  return {
    amount: 0,
    weekdayAmount: 0,
    weekendAmount: 0,
    period: periodFor(departureAt),
    segments: [],
    confidence: "none",
    toJSON() {
      return {
        amount: null,
        weekdayAmount: null,
        weekendAmount: null,
        period: this.period,
        segments: this.segments,
        confidence: "none",
        pricingStatus: "unknown",
      };
    },
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

  if (core.status !== "priced" || core.amountRub == null) {
    // A strict Valhalla M-12 span proves that this route actually enters the
    // M-12 domain. If the local RVP core cannot prove its exact boundaries,
    // keep all legacy/recovery attempts available internally (numeric zero),
    // but serialize an unresolved final result as null rather than exact 0 RUB.
    // The enumerable toJSON method survives the shallow fallback spreads used
    // by the V2 adapter, so an unresolved result cannot silently become zero.
    if (strictM12Span && !blockedByMixedRoadEvidence) {
      return {
        core,
        tolls: unknownTolls(departureAt),
        validation: unknownValidation(core),
        blockedByMixedRoadEvidence: false,
      };
    }
    return {
      core,
      tolls: null,
      validation: null,
      blockedByMixedRoadEvidence,
    };
  }

  if (blockedByMixedRoadEvidence) {
    return {
      core,
      tolls: null,
      validation: null,
      blockedByMixedRoadEvidence: true,
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
