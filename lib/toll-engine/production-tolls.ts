import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import { priceA289Route } from "@/lib/toll-engine/a289-engine";
import { calculateProductionM4 } from "@/lib/toll-engine/m4-production";

export type ProductionExactTolls = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: "понедельник–четверг" | "пятница–воскресенье";
  segments: string[];
  confidence: "matched";
};

export type ProductionExactResult = {
  tolls: ProductionExactTolls | null;
  validation: TollValidation | null;
  exactRoadSystems: string[];
  reason: string;
};

function legacySystem(name: string) {
  if (name.startsWith("М-4")) return "M4";
  if (name.startsWith("А-289")) return "A289";
  return "OTHER";
}

function hasUncoveredLegacySystems(segmentNames: string[]) {
  return segmentNames.some((name) => legacySystem(name) === "OTHER");
}

export async function calculateProductionExactTolls(
  route: Coordinate[],
  departureAt: string | undefined,
  legacySegmentNames: string[],
): Promise<ProductionExactResult> {
  const [m4, a289] = await Promise.all([
    calculateProductionM4(route, departureAt),
    Promise.resolve(priceA289Route(route, departureAt)),
  ]);

  // Segment 1 only promotes an exact composite when M-4 itself is proven exact.
  // This intentionally avoids replacing arbitrary non-M4 routes with a partial
  // A-289-only result before the general road-system composer is complete.
  if (!m4.exact || !m4.tolls) {
    return {
      tolls: null,
      validation: m4.validation,
      exactRoadSystems: [],
      reason: m4.reason,
    };
  }

  if (hasUncoveredLegacySystems(legacySegmentNames)) {
    return {
      tolls: null,
      validation: m4.validation,
      exactRoadSystems: ["M4", ...(a289.status === "priced" ? ["A289"] : [])],
      reason: "Legacy-геометрия обнаружила платную систему, для которой ещё нет точного road-specific engine; точная композиция заблокирована.",
    };
  }

  const weekdayAmount = m4.tolls.weekdayAmount + a289.weekdayAmount;
  const weekendAmount = m4.tolls.weekendAmount + a289.weekendAmount;
  const period = m4.tolls.period;
  const amount = period === "пятница–воскресенье" ? weekendAmount : weekdayAmount;
  const exactRoadSystems = ["M4", ...(a289.status === "priced" ? ["A289"] : [])];

  return {
    tolls: {
      amount,
      weekdayAmount,
      weekendAmount,
      period,
      segments: [
        ...m4.tolls.segments,
        ...a289.segments,
      ],
      confidence: "matched",
    },
    validation: m4.validation,
    exactRoadSystems,
    reason: a289.status === "priced"
      ? `Точный составной расчёт: M-4 + A-289 (${a289.crossedFrames.join(", ")}).`
      : "Точный расчёт M-4; подтверждённые рамки A-289 не пересечены.",
  };
}
