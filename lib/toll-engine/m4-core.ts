import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import type { M4PricingResult } from "@/lib/toll-engine/m4-engine";
import { priceM4RoutePlazaValidation } from "@/lib/toll-engine/m4-local-pricing";
import { validateKnownM4Plazas, type M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";

export type M4CoreResult = {
  validation: M4RoutePlazaValidation;
  pricing: M4PricingResult;
  tollValidation: TollValidation;
  exact: boolean;
};

export function m4AsTollValidation(validation: M4RoutePlazaValidation): TollValidation {
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

export function isExactM4Result(validation: M4RoutePlazaValidation, pricing: M4PricingResult) {
  return validation.complete
    && pricing.status === "priced"
    && pricing.amount !== null
    && pricing.unresolved.length === 0
    && (pricing.confidence === "medium" || pricing.confidence === "high");
}

export async function calculateM4Core(route: Coordinate[], departureAt?: string, routeDurationSeconds?: number): Promise<M4CoreResult> {
  const validation = await validateKnownM4Plazas(route, routeDurationSeconds);
  const pricing = priceM4RoutePlazaValidation(validation, departureAt);
  return {
    validation,
    pricing,
    tollValidation: m4AsTollValidation(validation),
    exact: isExactM4Result(validation, pricing),
  };
}
