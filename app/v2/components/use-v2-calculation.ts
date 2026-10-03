"use client";

import { useState } from "react";
import { pickOptimal } from "./route-utils";
import { distance, duration, money } from "./format";
import { defaults, tariffNames } from "./pricing-data";
import type { Place, Result, Leg, Trip, TollView } from "./types";

type CalculatorMode = "standard" | "dual";
type CalculationInput = {
  mode: CalculatorMode;
  from: Place;
  via: Place;
  to: Place;
  rates: { standard: number; comfort: number; comfortPlus: number; minivan: number };
  rate1: number;
  rate2: number;
  multiplier: number;
};
const vehicleForRate = { standard: "standard", comfort: "comfort", comfortPlus: "comfort_plus", minivan: "minivan" } as const;

export function useV2Calculation({ mode, from, via, to, rates, rate1, rate2, multiplier }: CalculationInput) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualToll, setManualToll] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  function recordRoutes(data: Result) {
    data.legs.forEach((leg, legIndex) => {
      const variants: Array<{ type: string; trip: Trip; tolls: TollView | null }> = leg.fast.tolls.pricingStatus !== "free"
        ? [
          { type: leg.fast.tolls.pricingStatus === "unknown" ? "Быстрый, цена дороги не подтверждена" : "Платный", trip: leg.fast, tolls: leg.fast.tolls },
          ...(leg.free ? [{ type: "Бесплатный", trip: leg.free, tolls: null }] : []),
        ]
        : [{ type: "Оптимальный", trip: pickOptimal(leg.fast, leg.free), tolls: null }];
      variants.forEach(({ type, trip, tolls }) => {
        if (trip.pricingByVehicle?.standard.requiresSplit) return;
        const totals = mode === "standard"
          ? {
            standard: trip.pricingByVehicle?.standard.totalPrice ?? 0,
            comfort: trip.pricingByVehicle?.comfort.totalPrice ?? 0,
            comfortPlus: trip.pricingByVehicle?.comfort_plus.totalPrice ?? 0,
            minivan: trip.pricingByVehicle?.minivan.totalPrice ?? 0,
          }
          : { standard: trip.pricingByVehicle?.standard.totalPrice ?? 0, comfort: 0, comfortPlus: 0, minivan: 0 };
        void fetch("/api/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "route_v2",
            fromRegion: leg.from,
            toRegion: leg.to,
            distanceKm: Math.round(trip.meters / 100) / 10,
            durationMin: Math.round(trip.seconds / 60),
            routeType: type,
            totals,
            tollWeekday: tolls?.pricingStatus === "unknown" ? null : tolls ? tolls.weekdayAmount : 0,
            tollWeekend: tolls?.pricingStatus === "unknown" ? null : tolls ? tolls.weekendAmount : 0,
            tollPricingStatus: tolls?.pricingStatus ?? "free",
            legIndex,
          }),
        }).catch(() => undefined);
      });
    });
  }

  async function calculate() {
    setError("");
    setResult(null);
    setLoading(true);
    setManualToll("");
    setCopiedKey("");
    try {
      const response = await fetch("/api/v2/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          from,
          via,
          to,
          departureAt: new Date().toISOString(),
          rates,
          manualRates: mode === "dual" ? [rate1, rate2] : undefined,
          multiplier,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
      recordRoutes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось выполнить расчёт");
    } finally {
      setLoading(false);
    }
  }

  async function copyStandard(key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string) {
    const lines = ["Калькулятор межгород", `${title}: ${leg.from} → ${leg.to}`, `${distance(trip.meters)} · ${duration(trip.seconds)}`];
    for (const rate of Object.keys(defaults) as Array<keyof typeof defaults>) {
      const vehicle = vehicleForRate[rate];
      const amount = trip.pricingByVehicle?.[vehicle]?.totalPrice;
      lines.push(`${tariffNames[rate]}: ${amount == null ? "цена не рассчитана" : money(amount)}`);
    }
    const segments = trip.pricingByVehicle?.comfort.pricingSegments ?? [];
    segments.forEach((segment) => lines.push(`${segment.from} → ${segment.to}: ${segment.distanceKm} км × ${money(segment.ratePerKm)}/км = ${money(segment.amount)}`));
    if (toll) {
      if (toll.pricingStatus === "unknown") lines.push("Платность / стоимость дороги не подтверждена");
      else if (toll.weekdayAmount !== toll.weekendAmount) lines.push(`Платная дорога: Пн–Чт ${money(toll.weekdayAmount ?? 0)}, Пт–Вс ${money(toll.weekendAmount ?? 0)}`);
      else if (toll.pricingStatus === "priced") lines.push(`Платная дорога: ${money(toll.amount ?? 0)}`);
    }
    if (trip.pricingByVehicle?.standard.requiresSplit) lines.push("Укажите промежуточную точку в режиме двойной тарификации, чтобы рассчитать цену.");
    if (warning) lines.push(`Важно: ${warning}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  }

  async function copyDual(key: string, title: string, trips: Trip[], total: number, tollWeekday: number, tollWeekend: number, tollUnknown: boolean) {
    const lines = ["Калькулятор межгород", title, ...result!.legs.map((leg, index) => {
      const amount = trips[index].pricingByVehicle?.standard.totalPrice;
      return `Участок ${index + 1}: ${leg.from} → ${leg.to} · ${distance(trips[index].meters)} · ${duration(trips[index].seconds)} · ${amount == null ? "цена не рассчитана" : money(amount)}`;
    }), `Итого: ${money(total)}`];
    if (tollUnknown) lines.push("Платность / стоимость дороги не подтверждена");
    else if (tollWeekday > 0) lines.push(tollWeekday !== tollWeekend ? `Платная дорога: Пн–Чт ${money(tollWeekday)}, Пт–Вс ${money(tollWeekend)}` : `Платная дорога: ${money(tollWeekday)}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  }

  const clearResult = () => setResult(null);
  return { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard, copyDual };
}
