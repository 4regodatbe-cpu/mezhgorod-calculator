import tariff from "@/experiments/nationwide-tolls/source-snapshots/m11/2026-09-04-679-684-category1.json";
import validity from "@/experiments/nationwide-tolls/engine/fare-validity.cjs";

const amount = tariff.fares.pulkovo_access_plus_mainline;
const effectiveFrom = new Date(tariff.effectiveFrom).getTime();

/**
 * User-approved fare selection for the detected 679–684 tail product.
 * Physical route detection remains the caller's responsibility; airport-gate
 * proximity alone does not create a tail traversal.
 */
export function matrixM11TailComponent(detected: boolean, departureAt: string) {
  if (!detected) return null;
  if (!validity.validInstant(departureAt)) {
    return { tolls: null, reason: "m11_tail_payment_time_missing" };
  }

  const departure = new Date(departureAt).getTime();
  if (!Number.isFinite(effectiveFrom) || departure < effectiveFrom) {
    return { tolls: null, reason: "m11_tail_94_fare_not_effective_at_departure" };
  }

  return {
    reason: "user_approved_m11_tail_94_rub_for_both_directions",
    tolls: {
      amount,
      weekdayAmount: amount,
      weekendAmount: amount,
      period: "пн–вс, приказ №274 с 04.09.2026",
      segments: [`М-11: продолжение за ПВП 679, хвост 679–684 · выбранный тариф ${amount} ₽`],
      confidence: "matched" as const,
    },
  };
}
