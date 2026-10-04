"use client";

import { useRef, useState } from "react";
import { pickOptimal } from "./route-utils";
import { distance, duration, money } from "./format";
import { defaults, tariffNames } from "./pricing-data";
import type { Place, Result, Leg, Trip, TollView } from "./types";

type CalculatorMode = "standard" | "dual";
type CalculationInput = {
  from: Place;
  to: Place;
  rates: { standard: number; comfort: number; comfortPlus: number; minivan: number };
  specialRates: typeof defaults;
  requestMode: () => {mode:CalculatorMode;modeOverride:boolean};
  onServerMode:(mode:CalculatorMode)=>void;
  multiplier: number;
};
const vehicleForRate = { standard: "standard", comfort: "comfort", comfortPlus: "comfort_plus", minivan: "minivan" } as const;

export function useV2Calculation({ from, to, rates, specialRates, requestMode, onServerMode, multiplier }: CalculationInput) {
  const pending=useRef<AbortController|null>(null);
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
        const totals = {
            standard: trip.pricingByVehicle?.standard.totalPrice ?? 0,
            comfort: trip.pricingByVehicle?.comfort.totalPrice ?? 0,
            comfortPlus: trip.pricingByVehicle?.comfort_plus.totalPrice ?? 0,
            minivan: trip.pricingByVehicle?.minivan.totalPrice ?? 0,
          };
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
    pending.current?.abort();
    const controller=new AbortController();
    pending.current=controller;
    setError("");
    setResult(null);
    setLoading(true);
    setManualToll("");
    setCopiedKey("");
    try {
      const response = await fetch("/api/v2/calculate", {
        signal:controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestMode(),
          from,
          to,
          departureAt: new Date().toISOString(),
          rates,
          specialRates,
          multiplier,
        }),
      });
      const data = await response.json();
      if(controller.signal.aborted)return;
      if (!response.ok) throw new Error(data.error);
      onServerMode(data.automaticMode);
      setResult(data);
      recordRoutes(data);
    } catch (e) {
      if(controller.signal.aborted)return;
      setError(e instanceof Error ? e.message : "Не удалось выполнить расчёт");
    } finally {
      if(pending.current===controller)setLoading(false);
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
    segments.forEach((segment) => lines.push(`${segment.from} → ${segment.to}: ${Math.round(segment.distanceKm * 10) / 10} км × ${money(segment.ratePerKm)}/км = ${money(segment.amount)}`));
    if (toll) {
      if (toll.pricingStatus === "unknown") lines.push("Платность / стоимость дороги не подтверждена");
      else if (toll.weekdayAmount !== toll.weekendAmount) lines.push(`Платная дорога: Пн–Чт ${money(toll.weekdayAmount ?? 0)}, Пт–Вс ${money(toll.weekendAmount ?? 0)}`);
      else if (toll.pricingStatus === "priced") lines.push(`Платная дорога: ${money(toll.amount ?? 0)}`);
    }
    if (trip.pricingByVehicle?.standard.requiresSplit) lines.push("Геометрия тарифных участков не подтверждена; цена не рассчитана.");
    if (warning) lines.push(`Важно: ${warning}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  }

  const clearResult = () => { pending.current?.abort(); pending.current=null; setLoading(false); setResult(null); };
  return { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard };
}
