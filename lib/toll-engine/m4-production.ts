import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { calculateM4Core } from "@/lib/toll-engine/m4-core";

export type ProductionM4Tolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: "понедельник–четверг" | "пятница–воскресенье";
  segments: string[];
  confidence: "matched" | "partial";
};

export type ProductionM4Result = {
  candidate: boolean;
  exact: boolean;
  tolls: ProductionM4Tolls | null;
  validation: TollValidation | null;
  reason: string;
};

function isSupportedLegacyComponent(name: string) {
  return name.startsWith("М-4:") || name.startsWith("А-289:");
}

function hasOtherLegacyTollSystems(segmentNames: string[]) {
  return segmentNames.some((name) => !isSupportedLegacyComponent(name));
}

function partialTolls(core: Awaited<ReturnType<typeof calculateM4Core>>): ProductionM4Tolls | null {
  const { pricing } = core;
  if (pricing.pricedPlazas.length === 0 || (pricing.weekdayAmount <= 0 && pricing.weekendAmount <= 0)) return null;
  const amount = pricing.period === "пятница–воскресенье" ? pricing.weekendAmount : pricing.weekdayAmount;
  return {
    amount,
    weekdayAmount: pricing.weekdayAmount,
    weekendAmount: pricing.weekendAmount,
    period: pricing.period,
    segments: [
      "М-4 Дон: частично подтверждённый расчёт",
      ...pricing.pricedPlazas.map((item) => `М-4: ПВП/участок ${item.km} км`),
    ],
    confidence: "partial",
  };
}

export async function calculateProductionM4(
  route: Coordinate[],
  departureAt?: string,
  legacySegmentNames: string[] = [],
): Promise<ProductionM4Result> {
  if (route.length < 2) {
    return { candidate: false, exact: false, tolls: null, validation: null, reason: "Недостаточно геометрии для M-4 validator" };
  }

  const core = await calculateM4Core(route, departureAt);
  const { validation, pricing, tollValidation: responseValidation, exact } = core;

  if (validation.candidateCount === 0) {
    return { candidate: false, exact: false, tolls: null, validation: null, reason: "Маршрут не пересекает зоны известных ПВП М-4" };
  }

  if (!exact || pricing.amount === null) {
    return {
      candidate: true,
      exact: false,
      tolls: partialTolls(core),
      validation: responseValidation,
      reason: pricing.message,
    };
  }

  if (hasOtherLegacyTollSystems(legacySegmentNames)) {
    return {
      candidate: true,
      exact: false,
      tolls: null,
      validation: responseValidation,
      reason: "Legacy-геометрия обнаружила платную систему вне M-4/A-289; точный составной итог заблокирован.",
    };
  }

  const a289 = priceA289Route(route, departureAt);
  const weekdayAmount = pricing.weekdayAmount + a289.weekdayAmount;
  const weekendAmount = pricing.weekendAmount + a289.weekendAmount;
  const amount = pricing.period === "пятница–воскресенье" ? weekendAmount : weekdayAmount;

  return {
    candidate: true,
    exact: true,
    tolls: {
      amount,
      weekdayAmount,
      weekendAmount,
      period: pricing.period,
      segments: [
        "М-4 Дон: точный расчёт по локально подтверждённым ПВП",
        ...pricing.pricedPlazas.map((item) => `М-4: ПВП/участок ${item.km} км`),
        ...a289.segments,
      ],
      confidence: "matched",
    },
    validation: responseValidation,
    reason: a289.status === "priced"
      ? `${pricing.message} Дополнительно подтверждены рамки A-289: ${a289.crossedFrames.join(", ")}.`
      : pricing.message,
  };
}
