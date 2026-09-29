import { priceM4TollEvents, type M4PricedPlaza, type M4PricingResult } from "@/lib/toll-engine/m4-engine";
import { M4_DATA } from "@/lib/toll-engine/m4-data";
import type { M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";

function confirmedKms(validation: M4RoutePlazaValidation) {
  return validation.checks
    .filter((item) => item.status === "confirmed")
    .map((item) => item.km);
}

function containsOrdered(sequence: number[], expected: number[]) {
  if (expected.length === 0) return true;
  let position = 0;
  for (const value of sequence) {
    if (value !== expected[position]) continue;
    position += 1;
    if (position === expected.length) return true;
  }
  return false;
}

function nodeIdsFor(validation: M4RoutePlazaValidation, kms: number[]) {
  const wanted = new Set(kms);
  return [...new Set(
    validation.checks
      .filter((item) => item.status === "confirmed" && wanted.has(item.km))
      .flatMap((item) => item.matchedNodeIds),
  )];
}

function mixedZone(fromKm: number, toKm: number) {
  return M4_DATA.mixedZones.find((zone) => zone.sectionFromKm === fromKm && zone.sectionToKm === toKm);
}

function full545Tariff() {
  const rows = M4_DATA.plazas.filter((plaza) => plaza.km === 545 && plaza.tariff);
  if (rows.length !== 2 || rows.some((row) => !row.tariff)) return null;
  return {
    weekday: rows.reduce((sum, row) => sum + (row.tariff?.weekday ?? 0), 0),
    weekend: rows.reduce((sum, row) => sum + (row.tariff?.weekend ?? 0), 0),
  };
}

function resolvedContextPlazas(validation: M4RoutePlazaValidation) {
  const sequence = confirmedKms(validation);
  const resolved: M4PricedPlaza[] = [];
  let resolved401to464 = false;
  let resolved633to741 = false;
  let resolved545 = false;

  // Full through traversal of the 401–464 mixed system. Requiring confirmed
  // PVPs on both sides prevents a single gate event from being mistaken for
  // a full-section journey. The official system charges the section once.
  const through401to464 = containsOrdered(sequence, [515, 460, 416, 339])
    || containsOrdered(sequence, [339, 416, 460, 515]);
  const zone401to464 = mixedZone(401, 464);
  if (through401to464 && zone401to464) {
    resolved.push({
      km: 416,
      weekday: zone401to464.fullSectionTariff.weekday,
      weekend: zone401to464.fullSectionTariff.weekend,
      verification: "exact_name",
      matchedNodeIds: nodeIdsFor(validation, [416, 460]),
      source: "Avtodor mixed zone 401–464 + ordered PVP traversal",
    });
    resolved401to464 = true;
  }

  // Mainline through traversal of 633–741. PVP 672 is an alternate
  // entry/exit branch; on the tested mainline it is deliberately rejected.
  // Confirmed PVPs beyond both ends (803 and 620) prove that the route crossed
  // the whole zone rather than starting or ending inside it.
  const hasConfirmed672 = validation.checks.some((item) => item.km === 672 && item.status === "confirmed");
  const through633to741 = !hasConfirmed672 && (
    containsOrdered(sequence, [803, 636, 620])
    || containsOrdered(sequence, [620, 636, 803])
  );
  const zone633to741 = mixedZone(633, 741);
  if (through633to741 && zone633to741) {
    resolved.push({
      km: 636,
      weekday: zone633to741.fullSectionTariff.weekday,
      weekend: zone633to741.fullSectionTariff.weekend,
      verification: "exact_name",
      matchedNodeIds: nodeIdsFor(validation, [636]),
      source: "Avtodor mixed zone 633–741 + mainline route context",
    });
    resolved633to741 = true;
  }

  // PVP 545 physically collects two consecutive official tariff sections.
  // Only sum both rows when exact route order proves travel on both sides of
  // the plaza (515 and 620). Short trips touching only one side stay unresolved.
  const through545 = containsOrdered(sequence, [620, 545, 515])
    || containsOrdered(sequence, [515, 545, 620]);
  const tariff545 = full545Tariff();
  if (through545 && tariff545) {
    resolved.push({
      km: 545,
      weekday: tariff545.weekday,
      weekend: tariff545.weekend,
      verification: "exact_name",
      matchedNodeIds: nodeIdsFor(validation, [545]),
      source: "Avtodor sections 517–544 + 545–589 + ordered flanking PVPs",
    });
    resolved545 = true;
  }

  return { resolved, resolved401to464, resolved633to741, resolved545 };
}

function verificationRank(value: M4PricedPlaza["verification"]) {
  if (value === "exact_name") return 3;
  if (value === "operator_local") return 2;
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

  const unresolved = result.unresolved.filter((item) => {
    if (item.code === "mixed_zone" && item.kms.some((km) => km === 416 || km === 460)) {
      return !context.resolved401to464;
    }
    if (item.code === "mixed_zone" && item.kms.some((km) => km === 636 || km === 672)) {
      return !context.resolved633to741;
    }
    if (item.code === "ambiguous_545") return !context.resolved545;
    return true;
  });

  const pricedPlazas = [...result.pricedPlazas, ...context.resolved]
    .sort((a, b) => a.km - b.km);
  const weekdayAmount = pricedPlazas.reduce((sum, item) => sum + item.weekday, 0);
  const weekendAmount = pricedPlazas.reduce((sum, item) => sum + item.weekend, 0);

  if (!validation.complete) {
    const incomplete = {
      code: "incomplete_validation" as const,
      kms: validation.checks.filter((item) => item.status === "unknown").map((item) => item.km),
      message: `Локально проверено ${validation.checkedCandidateCount} из ${validation.candidateCount} кандидатов ПВП М-4; точный итог запрещён до полного покрытия.`,
    };
    const finalUnresolved = [...unresolved, incomplete];
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
        ? `Оценено ${pricedPlazas.length} ПВП/участков, но ${unresolved.length} контекстный случай остаётся нерешённым; итоговая сумма не выдаётся.`
        : status === "unresolved"
          ? "Платные события М-4 обнаружены, но их контекста недостаточно для безопасного итогового расчёта."
          : "Подтверждённые платные ПВП М-4 не обнаружены.",
  };
}
