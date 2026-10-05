import type { TollView } from "./types";

export type TollPeriod = "weekday" | "weekend";
export type TollAmount = {
  status: "priced" | "free" | "unknown" | "manual";
  amount: number | null;
};

export const confirmedFreeToll: TollView = {
  amount: 0,
  weekdayAmount: 0,
  weekendAmount: 0,
  period: "confirmed-free",
  segments: [],
  confidence: "none",
  pricingStatus: "free",
};

export const unverifiedToll: TollView = {
  amount: null,
  weekdayAmount: null,
  weekendAmount: null,
  period: "unknown",
  segments: [],
  confidence: "none",
  pricingStatus: "unknown",
};

export function currentTollPeriod(at: Date = new Date()): TollPeriod {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Moscow",
  }).format(at);
  return day === "Fri" || day === "Sat" || day === "Sun" ? "weekend" : "weekday";
}

export function shortPlaceName(label: string): string {
  const first = label.split(",")[0].trim();
  const city = first.replace(/^г[.]?\s+/i, "").replace(/^город\s+/i, "").trim();
  return city || first || label.trim();
}

export function resolveTollAmount(
  toll: TollView | undefined,
  period: TollPeriod,
  manualToll?: string,
): TollAmount {
  if (manualToll !== undefined && manualToll.trim() !== "") {
    const manualAmount = Number(manualToll);
    if (Number.isFinite(manualAmount) && manualAmount >= 0) {
      return { status: "manual", amount: manualAmount };
    }
    return { status: "unknown", amount: null };
  }

  if (!toll) return { status: "unknown", amount: null };
  if (toll.pricingStatus === "free") return { status: "free", amount: 0 };
  if (toll.pricingStatus !== "priced") return { status: "unknown", amount: null };

  const scheduledAmount = period === "weekday" ? toll.weekdayAmount : toll.weekendAmount;
  if (typeof scheduledAmount === "number" && Number.isFinite(scheduledAmount) && scheduledAmount >= 0) {
    return { status: "priced", amount: scheduledAmount };
  }

  if (
    typeof toll.weekdayAmount === "number" &&
    typeof toll.weekendAmount === "number" &&
    toll.weekdayAmount === toll.weekendAmount &&
    Number.isFinite(toll.weekdayAmount) &&
    toll.weekdayAmount >= 0
  ) {
    return { status: "priced", amount: toll.weekdayAmount };
  }

  const detailPeriod = toll.period.toLowerCase();
  const matchesSelectedPeriod =
    period === "weekday"
      ? detailPeriod.includes("weekday") || detailPeriod.includes("будн") || detailPeriod.includes("понедельник")
      : detailPeriod.includes("weekend") || detailPeriod.includes("выход") || detailPeriod.includes("пятница");
  if (matchesSelectedPeriod && typeof toll.amount === "number" && Number.isFinite(toll.amount) && toll.amount >= 0) {
    return { status: "priced", amount: toll.amount };
  }

  return { status: "unknown", amount: null };
}

export function totalWithToll(baseFare: number | null | undefined, toll: TollAmount): number | null {
  if (typeof baseFare !== "number" || !Number.isFinite(baseFare) || toll.amount === null) return null;
  // The UI and copied quote display whole rubles. Sum those visible components
  // so the printed equation remains arithmetically consistent.
  return Math.round(baseFare) + Math.round(toll.amount);
}


export type DisplayQuote =
  | { kind: "complete"; label: "Итого за поездку"; amount: number }
  | { kind: "base-only"; label: "Итого без дорог"; amount: number }
  | { kind: "unavailable"; label: "Цена тарифа не рассчитана"; amount: null };

/** Shows a base fare without claiming an unknown toll amount is zero. */
export function displayQuote(baseFare: number | null | undefined, toll: TollAmount): DisplayQuote {
  if (typeof baseFare !== "number" || !Number.isFinite(baseFare)) {
    return { kind: "unavailable", label: "Цена тарифа не рассчитана", amount: null };
  }
  if (toll.status === "unknown" || toll.amount === null) {
    return { kind: "base-only", label: "Итого без дорог", amount: Math.round(baseFare) };
  }
  const total = totalWithToll(baseFare, toll);
  if (total === null) {
    return { kind: "base-only", label: "Итого без дорог", amount: Math.round(baseFare) };
  }
  return { kind: "complete", label: "Итого за поездку", amount: total };
}
