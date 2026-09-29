import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import { priceM4RoutePlazaValidation } from "@/lib/toll-engine/m4-local-pricing";
import { validateKnownM4Plazas, type M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";

export type ProductionM4Tolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: "понедельник–четверг" | "пятница–воскресенье";
  segments: string[];
  confidence: "matched";
};

export type ProductionM4Result = {
  candidate: boolean;
  exact: boolean;
  tolls: ProductionM4Tolls | null;
  validation: TollValidation | null;
  reason: string;
};

function asTollValidation(validation: M4RoutePlazaValidation): TollValidation {
  const hasConfirmedToll = validation.confirmedCount > 0;
  return {
    status: hasConfirmedToll ? "toll" : "unknown",
    source: "Valhalla map matching",
    tollEdgeCount: validation.confirmedCount,
    checkedEdgeCount: validation.checkedCandidateCount,
    wayIds: [],
    roadNames: hasConfirmedToll ? ["М-4 Дон"] : [],
    tollBoothCount: validation.events.length,
    tollBooths: validation.events,
    chunkCount: validation.candidateCount,
    checkedChunkCount: validation.checkedCandidateCount,
    failedChunkCount: validation.unknownCount,
    complete: validation.complete,
    boothEventCoverage: validation.complete
      ? "complete"
      : validation.checkedCandidateCount > 0
        ? "partial"
        : "none",
    message: `M-4 local PVP validator: ${validation.message}`,
  };
}

function hasOtherLegacyTollSystems(segmentNames: string[]) {
  return segmentNames.some((name) => !name.startsWith("М-4"));
}

export async function calculateProductionM4(
  route: Coordinate[],
  departureAt: string | undefined,
  legacySegmentNames: string[],
): Promise<ProductionM4Result> {
  if (route.length < 2) {
    return {
      candidate: false,
      exact: false,
      tolls: null,
      validation: null,
      reason: "Недостаточно геометрии для M-4 validator",
    };
  }

  const validation = await validateKnownM4Plazas(route);
  if (validation.candidateCount === 0) {
    return {
      candidate: false,
      exact: false,
      tolls: null,
      validation: null,
      reason: "Маршрут не пересекает зоны известных ПВП М-4",
    };
  }

  const responseValidation = asTollValidation(validation);
  const pricing = priceM4RoutePlazaValidation(validation, departureAt);

  if (hasOtherLegacyTollSystems(legacySegmentNames)) {
    return {
      candidate: true,
      exact: false,
      tolls: null,
      validation: responseValidation,
      reason: "На маршруте обнаружены платные системы помимо М-4; точный M-4 итог пока нельзя безопасно подменить без композиции дорожных движков",
    };
  }

  const exact = validation.complete
    && pricing.status === "priced"
    && pricing.amount !== null
    && pricing.unresolved.length === 0
    && (pricing.confidence === "medium" || pricing.confidence === "high");

  if (!exact || pricing.amount === null) {
    return {
      candidate: true,
      exact: false,
      tolls: null,
      validation: responseValidation,
      reason: pricing.message,
    };
  }

  return {
    candidate: true,
    exact: true,
    tolls: {
      amount: pricing.amount,
      weekdayAmount: pricing.weekdayAmount,
      weekendAmount: pricing.weekendAmount,
      period: pricing.period,
      segments: [
        "М-4 Дон: точный расчёт по локально подтверждённым ПВП",
        ...pricing.pricedPlazas.map((item) => `М-4: ПВП/участок ${item.km} км`),
      ],
      confidence: "matched",
    },
    validation: responseValidation,
    reason: pricing.message,
  };
}
