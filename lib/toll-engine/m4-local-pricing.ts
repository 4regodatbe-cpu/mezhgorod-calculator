import { priceM4TollEvents, type M4PricedPlaza, type M4PricingResult, type M4UnresolvedItem } from "@/lib/toll-engine/m4-engine";
import { M4_DATA } from "@/lib/toll-engine/m4-data";
import type { M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";
import { confirmedKms, resolvedContextPlazas } from "@/lib/toll-engine/m4-route-context";
import { highwayTariffPeriod } from "@/lib/toll-engine/tariff-period";

function traversalPricedPlazas(validation: M4RoutePlazaValidation, departureAt?: string) {
  const weekend = highwayTariffPeriod(departureAt).weekend;
  const confirmed = validation.checks.filter((item) => item.status === "confirmed");
  const has339 = confirmed.some((item) => item.km === 339);
  const has355 = confirmed.some((item) => item.km === 355);
  const priced: M4PricedPlaza[] = [];

  for (const check of confirmed) {
    if (check.evidence !== "route_traversal" || check.model !== "open" || check.km === 545) continue;
    if ((check.km === 339 || check.km === 355) && has339 && has355) continue;
    const rows = M4_DATA.plazas.filter((plaza) => plaza.km === check.km && plaza.model === "open" && plaza.tariff);
    if (rows.length !== 1 || !rows[0].tariff) continue;
    priced.push({
      id: rows[0].id,
      km: check.km,
      direction: "unknown",
      weekday: rows[0].tariff.weekday,
      weekend: rows[0].tariff.weekend,
      selectedAmount: weekend ? rows[0].tariff.weekend : rows[0].tariff.weekday,
      verification: "route_traversal",
      matchedNodeIds: [],
      source: `${M4_DATA.source} + strict saved-anchor route traversal`,
    });
  }

  return priced;
}

function traversalUnresolved(validation: M4RoutePlazaValidation): M4UnresolvedItem[] {
  const confirmed = validation.checks.filter((item) => item.status === "confirmed");
  const kms = new Set(confirmed.map((item) => item.km));
  const unresolved: M4UnresolvedItem[] = [];

  const zone401 = [416, 460].filter((km) => kms.has(km));
  if (zone401.length > 0) {
    unresolved.push({
      code: "mixed_zone",
      kms: zone401,
      message: "Участок М-4 401–464 км использует смешанную entry/exit-систему; требуется полный route-context.",
    });
  }

  const zone633 = [636, 672].filter((km) => kms.has(km));
  if (zone633.length > 0) {
    unresolved.push({
      code: "mixed_zone",
      kms: zone633,
      message: "Участок М-4 633–741 км использует смешанную entry/exit-систему; требуется полный route-context.",
    });
  }

  if (kms.has(545)) {
    unresolved.push({
      code: "ambiguous_545",
      kms: [545],
      message: "ПВП 545 км обслуживает две тарифные строки; начисление разрешается только по подтверждённым фланговым ПВП.",
    });
  }

  if (kms.has(339) && kms.has(355)) {
    unresolved.push({
      code: "alternative_corridor",
      kms: [339, 355],
      message: "Одновременно подтверждены ПВП 339 и 355 одного официального коридора; двойное начисление заблокировано.",
    });
  }

  return unresolved;
}

function mergeUnresolved(items: M4UnresolvedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.code}:${[...item.kms].sort((a, b) => a - b).join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function verificationRank(value: M4PricedPlaza["verification"]) {
  if (value === "exact_name") return 3;
  if (value === "operator_local" || value === "route_traversal") return 2;
  return 1;
}

function confidenceFor(priced: M4PricedPlaza[], unresolvedCount: number): M4PricingResult["confidence"] {
  if (priced.length === 0) return unresolvedCount > 0 ? "low" : "none";
  if (unresolvedCount > 0) return "low";
  const weakest = Math.min(...priced.map((item) => verificationRank(item.verification)));
  if (weakest >= 3) return "high";
  if (weakest >= 2) return "medium";
  return "low";
}

export function priceM4RoutePlazaValidation(
  validation: M4RoutePlazaValidation,
  departureAt?: string,
): M4PricingResult {
  const result = priceM4TollEvents(validation.events, departureAt);
  const context = resolvedContextPlazas(validation);
  const weekend = highwayTariffPeriod(departureAt).weekend;
  const syntheticUnresolved = traversalUnresolved(validation);

  const unresolved = mergeUnresolved([...result.unresolved, ...syntheticUnresolved]).filter((item) => {
    if (item.code === "mixed_zone" && item.kms.some((km) => km === 416 || km === 460)) {
      return !context.resolved401to464;
    }
    if (item.code === "mixed_zone" && item.kms.some((km) => km === 636 || km === 672)) {
      return !context.resolved633to741;
    }
    if (item.code === "ambiguous_545") return !context.resolved545;
    if (item.code === "alternative_corridor" && item.kms.includes(339) && item.kms.includes(355)) {
      return !context.resolved322to401;
    }
    return true;
  });

  const confirmed = new Set(confirmedKms(validation));
  const alternativeConflict = confirmed.has(339) && confirmed.has(355);
  const directPricedPlazas = [...result.pricedPlazas, ...traversalPricedPlazas(validation, departureAt)]
    .filter((item) => !alternativeConflict || (item.km !== 339 && item.km !== 355));
  const pricedPlazas = [...directPricedPlazas, ...context.resolved]
    .filter((item, index, all) => all.findIndex((candidate) => candidate.km === item.km) === index)
    .sort((a, b) => a.km - b.km);
  for (const item of pricedPlazas) item.selectedAmount = weekend ? item.weekend : item.weekday;
  const weekdayAmount = pricedPlazas.reduce((sum, item) => sum + item.weekday, 0);
  const weekendAmount = pricedPlazas.reduce((sum, item) => sum + item.weekend, 0);

  if (!validation.complete) {
    const incomplete = {
      code: "incomplete_validation" as const,
      kms: validation.checks.filter((item) => item.status === "unknown").map((item) => item.km),
      message: `Локально проверено ${validation.checkedCandidateCount} из ${validation.candidateCount} кандидатов ПВП М-4; точный итог запрещён до полного покрытия.`,
    };
    const finalUnresolved = mergeUnresolved([...unresolved, incomplete]);
    return {
      ...result,
      status: pricedPlazas.length > 0 ? "partial" : "unresolved",
      confidence: pricedPlazas.length > 0 ? "low" : "none",
      amount: null,
      weekdayAmount,
      weekendAmount,
      pricedPlazas,
      unresolved: finalUnresolved,
      inputComplete: false,
      checkedChunkCount: validation.checkedCandidateCount,
      chunkCount: validation.candidateCount,
      message: pricedPlazas.length > 0
        ? `Распознано и оценено ${pricedPlazas.length} платных событий/участков, но локальная проверка неполна (${validation.checkedCandidateCount} из ${validation.candidateCount}). Точная сумма заблокирована.`
        : `Локальная проверка ПВП М-4 неполна (${validation.checkedCandidateCount} из ${validation.candidateCount}); точная сумма не выдаётся.`,
    };
  }

  let status: M4PricingResult["status"];
  if (pricedPlazas.length === 0 && unresolved.length === 0) status = "none";
  else if (pricedPlazas.length === 0) status = "unresolved";
  else if (unresolved.length > 0) status = "partial";
  else status = "priced";

  const amount = status === "priced"
    ? (result.period === "пятница–воскресенье" ? weekendAmount : weekdayAmount)
    : null;
  const confidence = confidenceFor(pricedPlazas, unresolved.length);

  return {
    ...result,
    status,
    confidence,
    amount,
    weekdayAmount,
    weekendAmount,
    pricedPlazas,
    unresolved,
    inputComplete: true,
    checkedChunkCount: validation.checkedCandidateCount,
    chunkCount: validation.candidateCount,
    message: status === "priced"
      ? `М-4 рассчитана по ${pricedPlazas.length} подтверждённым ПВП/участкам с учётом route-context mixed-зон.`
      : status === "partial"
        ? `Оценено ${pricedPlazas.length} ПВП/участков, но ${unresolved.length} контекстный случай остаётся нерешённым: ${unresolved.map((item) => `${item.code}[${item.kms.join(",")}]`).join("; ")}; итоговая сумма не выдаётся.`
        : status === "unresolved"
          ? "Платные события М-4 обнаружены, но их контекста недостаточно для безопасного итогового расчёта."
          : "Подтверждённые платные ПВП М-4 не обнаружены.",
  };
}
