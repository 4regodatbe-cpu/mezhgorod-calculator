import { priceM4TollEvents, type M4PricedPlaza, type M4PricingResult, type M4UnresolvedItem } from "@/lib/toll-engine/m4-engine";
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

function contextVerification(validation: M4RoutePlazaValidation, kms: number[]): M4PricedPlaza["verification"] {
  const wanted = new Set(kms);
  return validation.checks.some((item) => item.status === "confirmed" && wanted.has(item.km) && item.evidence === "route_traversal")
    ? "route_traversal"
    : "exact_name";
}

function resolvedContextPlazas(validation: M4RoutePlazaValidation) {
  const sequence = confirmedKms(validation);
  const resolved: M4PricedPlaza[] = [];
  let resolved322to401 = false;
  let resolved401to464 = false;
  let resolved633to741 = false;
  let resolved545 = false;

  // The 355-km plaza is an entry PVP for traffic towards Moscow. Official
  // Avtodor rules require the receipt issued at km 355 to be presented at
  // km 339 to avoid double payment. Therefore a route that geometrically
  // crosses both physical plaza anchors must be charged exactly once:
  // 355 -> 339 (towards Moscow) uses the 355 tariff; the reverse traversal
  // uses the 339 tariff.
  const index339 = sequence.indexOf(339);
  const index355 = sequence.indexOf(355);
  if (index339 >= 0 && index355 >= 0 && index339 !== index355) {
    const chargedKm = index355 < index339 ? 355 : 339;
    const row = M4_DATA.plazas.find((plaza) => plaza.km === chargedKm && plaza.model === "open" && plaza.tariff);
    if (row?.tariff) {
      resolved.push({
        km: chargedKm,
        weekday: row.tariff.weekday,
        weekend: row.tariff.weekend,
        verification: contextVerification(validation, [339, 355]),
        matchedNodeIds: nodeIdsFor(validation, [chargedKm]),
        source: "Avtodor km 355→339 receipt rule + ordered route traversal",
      });
      resolved322to401 = true;
    }
  }

  // Full traversal of the 401-464 mixed section is established by both
  // section gates plus confirmed M-4 plazas on opposite sides of the zone.
  // Do not depend on one specific northern plaza: live routes can legitimately
  // use different alignments in the 322-401 corridor while still traversing
  // the complete 401-464 section.
  const northFlanks401 = sequence.filter((km) => km < 401);
  const southFlanks401 = sequence.filter((km) => km > 464);
  // A continuous sequence of independently confirmed M-4 plazas on opposite
  // sides of the closed section proves through-traversal. Do not require a
  // particular neighbouring plaza: routing geometries can miss one physical
  // anchor while still remaining on the M-4 mainline.
  const through401to464 = northFlanks401.some((northKm) =>
    southFlanks401.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const zone401to464 = mixedZone(401, 464);
  if (through401to464 && zone401to464) {
    resolved.push({
      km: 416,
      weekday: zone401to464.fullSectionTariff.weekday,
      weekend: zone401to464.fullSectionTariff.weekend,
      verification: contextVerification(validation, [515, 460, 416, 339, 355]),
      matchedNodeIds: nodeIdsFor(validation, [416, 460]),
      source: "Avtodor mixed zone 401–464 + ordered PVP traversal",
    });
    resolved401to464 = true;
  }

  // A route flanked by PVP 620 on the north and PVP 803 on the south has
  // traversed the complete official 633-741 km mixed section. Crossing the
  // auxiliary 672-km gate on that same through route does not create a second
  // charge: Avtodor's current rules zero-rate the exit when the section has
  // already been paid within the allowed transit window.
  const northFlanks633 = sequence.filter((km) => km < 633);
  const southFlanks633 = sequence.filter((km) => km > 741);
  const through633to741 = northFlanks633.some((northKm) =>
    southFlanks633.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const zone633to741 = mixedZone(633, 741);
  if (through633to741 && zone633to741) {
    resolved.push({
      km: 636,
      weekday: zone633to741.fullSectionTariff.weekday,
      weekend: zone633to741.fullSectionTariff.weekend,
      verification: contextVerification(validation, [803, 636, 620]),
      matchedNodeIds: nodeIdsFor(validation, [636]),
      source: "Avtodor mixed zone 633–741 + mainline route context",
    });
    resolved633to741 = true;
  }

  // If only the 672 gate of the 633-741 mixed system is traversed and the
  // route continues to the southern flank (PVP 803), price the official
  // 633-672 partial section instead of blocking the whole M-4 component.
  const has636 = validation.checks.some((item) => item.km === 636 && item.status === "confirmed");
  const has672 = validation.checks.some((item) => item.km === 672 && item.status === "confirmed");
  const partial672 = zone633to741?.partialGateTariffs?.find((item) => item.km === 672);
  const throughPartial672 = !resolved633to741 && !has636 && has672 && (
    containsOrdered(sequence, [803, 672])
    || containsOrdered(sequence, [672, 803])
  );
  if (throughPartial672 && partial672) {
    resolved.push({
      km: 672,
      weekday: partial672.tariff.weekday,
      weekend: partial672.tariff.weekend,
      verification: contextVerification(validation, [672, 803]),
      matchedNodeIds: nodeIdsFor(validation, [672]),
      source: "Avtodor official M-4 633-672 partial mixed-zone tariff + ordered route context",
    });
    resolved633to741 = true;
  }

  // PVP 545 represents two adjacent official tariff rows. Confirmed M-4
  // evidence on both sides of 517-589 proves both rows were traversed even
  // when one neighbouring plaza anchor is absent from the selected geometry.
  const northFlanks545 = sequence.filter((km) => km < 517);
  const southFlanks545 = sequence.filter((km) => km > 589);
  const through545 = northFlanks545.some((northKm) =>
    southFlanks545.some((southKm) =>
      containsOrdered(sequence, [southKm, northKm])
      || containsOrdered(sequence, [northKm, southKm])));
  const tariff545 = full545Tariff();
  if (through545 && tariff545) {
    resolved.push({
      km: 545,
      weekday: tariff545.weekday,
      weekend: tariff545.weekend,
      verification: contextVerification(validation, [620, 545, 515]),
      matchedNodeIds: nodeIdsFor(validation, [545]),
      source: "Avtodor sections 517–544 + 545–589 + ordered flanking PVPs",
    });
    resolved545 = true;
  }

  return { resolved, resolved322to401, resolved401to464, resolved633to741, resolved545 };
}

function traversalPricedPlazas(validation: M4RoutePlazaValidation) {
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
      km: check.km,
      weekday: rows[0].tariff.weekday,
      weekend: rows[0].tariff.weekend,
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
  const directPricedPlazas = [...result.pricedPlazas, ...traversalPricedPlazas(validation)]
    .filter((item) => !alternativeConflict || (item.km !== 339 && item.km !== 355));
  const pricedPlazas = [...directPricedPlazas, ...context.resolved]
    .filter((item, index, all) => all.findIndex((candidate) => candidate.km === item.km) === index)
    .sort((a, b) => a.km - b.km);
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
