import type { TollBoothEvent, TollValidation } from "@/lib/toll-validator";
import { M4_DATA } from "@/lib/toll-engine/m4-data";
import { M4_NODE_TO_PLAZA, type M4PlazaNodeGroup, type PlazaNodeVerification } from "@/lib/toll-engine/m4-plaza-nodes";

import type { PricingConfidence, PricingStatus, M4PricedPlaza, M4UnresolvedItem, M4PricingResult } from "./m4-engine-types.ts";
export type { PricingConfidence, PricingStatus, M4PricedPlaza, M4UnresolvedItem, M4PricingResult } from "./m4-engine-types.ts";

type MatchedGroup = {
  plaza: M4PlazaNodeGroup;
  events: TollBoothEvent[];
};

function currentPeriod(departureAt?: string) {
  const parsed = departureAt ? new Date(departureAt) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = date.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  return {
    weekend,
    period: weekend ? "пятница–воскресенье" as const : "понедельник–четверг" as const,
  };
}

function verificationRank(value: PlazaNodeVerification) {
  if (value === "exact_name") return 3;
  if (value === "operator_local") return 2;
  return 1;
}

function groupEvents(events: TollBoothEvent[]) {
  const grouped = new Map<number, MatchedGroup>();
  let recognizedEventCount = 0;
  let unrecognizedEventCount = 0;

  for (const event of events) {
    if (!event.osmNodeId) {
      unrecognizedEventCount += 1;
      continue;
    }
    const plaza = M4_NODE_TO_PLAZA.get(event.osmNodeId);
    if (!plaza) {
      unrecognizedEventCount += 1;
      continue;
    }
    recognizedEventCount += 1;
    const existing = grouped.get(plaza.km);
    if (existing) existing.events.push(event);
    else grouped.set(plaza.km, { plaza, events: [event] });
  }

  return { grouped, recognizedEventCount, unrecognizedEventCount };
}

function tariffForKm(km: number) {
  return M4_DATA.plazas.filter((plaza) => plaza.km === km && plaza.model === "open" && plaza.tariff);
}

function pricedPlaza(group: MatchedGroup): M4PricedPlaza | null {
  const tariffs = tariffForKm(group.plaza.km);
  if (tariffs.length !== 1) return null;
  const tariff = tariffs[0].tariff;
  if (!tariff) return null;
  return {
    km: group.plaza.km,
    weekday: tariff.weekday,
    weekend: tariff.weekend,
    verification: group.plaza.verification,
    matchedNodeIds: [...new Set(group.events.map((event) => event.osmNodeId).filter((value): value is string => Boolean(value)))],
    source: group.plaza.source,
  };
}

function confidenceFor(priced: M4PricedPlaza[], unresolved: M4UnresolvedItem[]): PricingConfidence {
  if (priced.length === 0) return unresolved.length > 0 ? "low" : "none";
  const weakest = Math.min(...priced.map((item) => verificationRank(item.verification)));
  if (unresolved.length > 0) return "low";
  if (weakest >= 3) return "high";
  if (weakest >= 2) return "medium";
  return "low";
}

export function priceM4TollEvents(events: TollBoothEvent[], departureAt?: string): M4PricingResult {
  const { weekend, period } = currentPeriod(departureAt);
  const { grouped, recognizedEventCount, unrecognizedEventCount } = groupEvents(events);
  const unresolved: M4UnresolvedItem[] = [];
  const priced: M4PricedPlaza[] = [];

  const mixedKms = [...grouped.values()]
    .filter((group) => group.plaza.model === "mixed_entry_exit")
    .map((group) => group.plaza.km)
    .sort((a, b) => a - b);
  if (mixedKms.some((km) => km === 416 || km === 460)) {
    unresolved.push({
      code: "mixed_zone",
      kms: mixedKms.filter((km) => km === 416 || km === 460),
      message: "Участок М-4 401–464 км использует смешанную entry/exit-систему; фиксированная цена одного ПВП здесь недопустима.",
    });
  }
  if (mixedKms.some((km) => km === 636 || km === 672)) {
    unresolved.push({
      code: "mixed_zone",
      kms: mixedKms.filter((km) => km === 636 || km === 672),
      message: "Участок М-4 633–741 км использует смешанную entry/exit-систему; требуется матрица вход/выход.",
    });
  }

  const has339 = grouped.has(339);
  const has355 = grouped.has(355);
  if (has339 && has355) {
    unresolved.push({
      code: "alternative_corridor",
      kms: [339, 355],
      message: "Одновременно обнаружены ПВП 339 и 355 одного официального коридора 322–401 км. Двойное начисление запрещено до уточнения последовательности проезда.",
    });
  }

  if (grouped.has(545)) {
    unresolved.push({
      code: "ambiguous_545",
      kms: [545],
      message: "ПВП 545 км обслуживает две тарифные строки. Одного события пересечения недостаточно, чтобы безопасно определить начисление.",
    });
  }

  for (const [km, group] of grouped) {
    if (group.plaza.model !== "open") continue;
    if (km === 545) continue;
    if ((km === 339 || km === 355) && has339 && has355) continue;

    const item = pricedPlaza(group);
    if (!item) {
      unresolved.push({
        code: "missing_tariff",
        kms: [km],
        message: `ПВП ${km} км распознан, но для него нет однозначной open-system тарифной строки.`,
      });
      continue;
    }
    priced.push(item);
  }

  priced.sort((a, b) => a.km - b.km);
  const weekdayAmount = priced.reduce((sum, item) => sum + item.weekday, 0);
  const weekendAmount = priced.reduce((sum, item) => sum + item.weekend, 0);

  let status: PricingStatus;
  if (priced.length === 0 && unresolved.length === 0) status = "none";
  else if (priced.length === 0) status = "unresolved";
  else if (unresolved.length > 0) status = "partial";
  else status = "priced";

  const amount = status === "priced" ? (weekend ? weekendAmount : weekdayAmount) : null;
  const confidence = confidenceFor(priced, unresolved);

  const message = status === "priced"
    ? `М-4 рассчитана по ${priced.length} фактически пересечённым ПВП.`
    : status === "partial"
      ? `Распознано и оценено ${priced.length} ПВП, но ${unresolved.length} участок(а) требуют дополнительной логики; итоговая сумма пока не выдаётся.`
      : status === "unresolved"
        ? "Платные события М-4 обнаружены, но безопасно определить итоговую сумму пока нельзя."
        : "Подтверждённые ПВП М-4 в событиях map matching не найдены.";

  return {
    road: "М-4 Дон",
    status,
    confidence,
    amount,
    weekdayAmount,
    weekendAmount,
    period,
    pricedPlazas: priced,
    unresolved,
    recognizedEventCount,
    unrecognizedEventCount,
    evidence: "osm_toll_booth_node",
    inputComplete: null,
    checkedChunkCount: null,
    chunkCount: null,
    message,
  };
}

export function priceM4TollValidation(validation: TollValidation, departureAt?: string): M4PricingResult {
  const result = priceM4TollEvents(validation.tollBooths ?? [], departureAt);
  const chunkCount = validation.chunkCount ?? null;
  const checkedChunkCount = validation.checkedChunkCount ?? null;
  // Missing coverage metadata belongs to an older/fallback validation object.
  // It is intentionally treated as incomplete rather than guessed complete.
  const inputComplete = validation.complete === true && chunkCount !== null && checkedChunkCount === chunkCount;
  const base: M4PricingResult = {
    ...result,
    inputComplete,
    checkedChunkCount,
    chunkCount,
  };

  if (inputComplete) return base;

  const checkedText = checkedChunkCount === null ? "неизвестно" : String(checkedChunkCount);
  const totalText = chunkCount === null ? "неизвестно" : String(chunkCount);
  const unresolved = [
    ...result.unresolved,
    {
      code: "incomplete_validation" as const,
      kms: [],
      message: `Map matching проверил ${checkedText} из ${totalText} частей маршрута; найденный набор ПВП может быть неполным.`,
    },
  ];

  return {
    ...base,
    status: result.pricedPlazas.length > 0 ? "partial" : "unresolved",
    confidence: result.pricedPlazas.length > 0 ? "low" : "none",
    amount: null,
    unresolved,
    message: result.pricedPlazas.length > 0
      ? `Распознано ${result.pricedPlazas.length} ПВП, но полнота проверки маршрута не подтверждена (${checkedText} из ${totalText}). Итоговая точная сумма заблокирована.`
      : `Полнота проверки маршрута не подтверждена (${checkedText} из ${totalText}); безопасно определить точную сумму М-4 нельзя.`,
  };
}
