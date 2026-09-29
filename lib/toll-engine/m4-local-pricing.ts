import { priceM4TollEvents, type M4PricingResult } from "@/lib/toll-engine/m4-engine";
import type { M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";

export function priceM4RoutePlazaValidation(
  validation: M4RoutePlazaValidation,
  departureAt?: string,
): M4PricingResult {
  const result = priceM4TollEvents(validation.events, departureAt);
  const base: M4PricingResult = {
    ...result,
    inputComplete: validation.complete,
    checkedChunkCount: validation.checkedCandidateCount,
    chunkCount: validation.candidateCount,
  };

  if (validation.complete) return base;

  return {
    ...base,
    status: result.pricedPlazas.length > 0 ? "partial" : "unresolved",
    confidence: result.pricedPlazas.length > 0 ? "low" : "none",
    amount: null,
    unresolved: [
      ...result.unresolved,
      {
        code: "incomplete_validation",
        kms: validation.checks.filter((item) => item.status === "unknown").map((item) => item.km),
        message: `Локально проверено ${validation.checkedCandidateCount} из ${validation.candidateCount} кандидатов ПВП М-4; точный итог запрещён до полного покрытия.`,
      },
    ],
    message: result.pricedPlazas.length > 0
      ? `Распознано ${result.pricedPlazas.length} ПВП, но локальная проверка неполна (${validation.checkedCandidateCount} из ${validation.candidateCount}). Точная сумма заблокирована.`
      : `Локальная проверка ПВП М-4 неполна (${validation.checkedCandidateCount} из ${validation.candidateCount}); точная сумма не выдаётся.`,
  };
}
