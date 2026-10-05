"use client";

import { useRef, useState } from "react";
import { pickOptimal } from "./route-utils";
import { distance, duration, money } from "./format";
import { defaults, tariffNames } from "./pricing-data";
import { buildAlternativeFareCopy, resolveTollAmount, shortPlaceName, totalWithToll, type TollPeriod } from "./quote-presentation";
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
          ...(leg.free ? [{ type: "Альтернатива без пунктов оплаты", trip: leg.free, tolls: null }] : []),
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

  async function copyStandard(key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string, tollPeriod: TollPeriod = "weekday", manualTollOverride?: string, fareOnly = false) {
    void title;
    if (fareOnly) {
      await navigator.clipboard.writeText(buildAlternativeFareCopy(leg.from, leg.to, trip));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);
      return;
    }
    const tollPrice = resolveTollAmount(toll, tollPeriod, manualTollOverride);
    const periodLabel = tollPeriod === "weekday" ? "будни, Пн–Чт" : "выходные, Пт–Вс";
    const lines = ["из А в Б", `${shortPlaceName(leg.from)} → ${shortPlaceName(leg.to)}`, `${distance(trip.meters)} · ${duration(trip.seconds)}`, `День поездки: ${periodLabel}`];
    if (manualTollOverride?.trim()) lines.push("Сумма платных дорог введена вручную и не подтверждена провайдером.");
    else if (tollPrice.amount === null) lines.push("Стоимость платных дорог не подтверждена.");
    for (const rate of Object.keys(defaults) as Array<keyof typeof defaults>) {
      const vehicle = vehicleForRate[rate];
      const baseFare = trip.pricingByVehicle?.[vehicle]?.requiresSplit ? null : trip.pricingByVehicle?.[vehicle]?.totalPrice;
      const total = totalWithToll(baseFare, tollPrice);
      const addition = tollPrice.amount === null ? "платные дороги: сумма неизвестна" : `+ ${money(tollPrice.amount)} ${tollPrice.status === "manual" ? "дороги вручную" : "платные дороги"}`;
      lines.push(`${tariffNames[rate]}: ${baseFare == null ? "тариф не рассчитан" : money(baseFare)} ${addition} = ${total === null ? "итого не рассчитано" : money(total)}`);
    }
    if (warning) lines.push(`Важно: ${warning}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  }

  const clearResult = () => { pending.current?.abort(); pending.current=null; setLoading(false); setResult(null); };
  return { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard };
}
