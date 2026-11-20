"use client";
import { validV3Response } from "./response-validation";

import { useEffect, useRef, useState } from "react";
import { pickOptimal } from "../../v2/components/route-utils";
import { buildV3Copy } from "./v3-copy";
import { defaults } from "../../v2/components/pricing-data";
import { type TollPeriod } from "../../v2/components/quote-presentation";
import { UserFacingCalculationError, userFacingCalculationErrorMessage } from "../../v2/components/request-errors";
import type { Place, Result, Leg, Trip, TollView } from "../../v2/components/types";

type CalculatorMode = "standard" | "dual";
type CalculationInput = {
  from: Place;
  to: Place;
  rates: { standard: number; comfort: number; comfortPlus: number; minivan: number };
  specialRates: typeof defaults;
  requestMode: () => {mode:CalculatorMode;modeOverride:boolean};
  onServerMode:(mode:CalculatorMode)=>void;
  multiplier: number;
  apiEndpoint?: string;
  analyticsVersion?: string;
};

export function useV3Calculation({ from, to, rates, specialRates, requestMode, onServerMode, multiplier, apiEndpoint = "/api/v3/calculate", analyticsVersion = "3.0" }: CalculationInput) {
  const pending=useRef<AbortController|null>(null);
  const copiedTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{pending.current?.abort();pending.current=null;if(copiedTimer.current)clearTimeout(copiedTimer.current);},[]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualToll, setManualToll] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  function recordRoutes(data: Result) {
    data.legs.forEach((leg, legIndex) => {
      const variants: Array<{ type: string; trip: Trip; tolls: TollView | null }> = leg.fast.tolls.pricingStatus !== "free"
        ? [
          { type: leg.fast.tolls.pricingStatus === "unknown" ? "Быстрый, цена дороги неизвестна" : "Платный", trip: leg.fast, tolls: leg.fast.tolls },
          ...(leg.free ? [{ type: "Альтернатива без пунктов оплаты", trip: leg.free, tolls: null }] : []),
        ]
        : [{ type: "Оптимальный", trip: pickOptimal(leg.fast, leg.free), tolls: null }];
      variants.forEach(({ type, trip, tolls }) => {
        const totals = {
            standard: trip.pricingByVehicle?.standard?.requiresSplit ? null : trip.pricingByVehicle?.standard?.totalPrice ?? null,
            comfort: trip.pricingByVehicle?.comfort?.requiresSplit ? null : trip.pricingByVehicle?.comfort?.totalPrice ?? null,
            comfortPlus: trip.pricingByVehicle?.comfort_plus?.requiresSplit ? null : trip.pricingByVehicle?.comfort_plus?.totalPrice ?? null,
            minivan: trip.pricingByVehicle?.minivan?.requiresSplit ? null : trip.pricingByVehicle?.minivan?.totalPrice ?? null,
          };
        void fetch("/api/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "route_v2",
            version: analyticsVersion,
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
      const response = await fetch(apiEndpoint, {
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
      const data = await response.json().catch(() => null);
      if(controller.signal.aborted||pending.current!==controller)return;
      if (!response.ok) throw new UserFacingCalculationError(typeof data?.error === "string" && data.error.trim() ? data.error : "Сервис маршрутов временно недоступен. Повторите расчёт.");
      // A gateway/transport failure may return malformed success JSON. Never
      // commit such a payload to React state and crash the entire calculator.
      const valid = validV3Response(data);
      if(!valid) throw new UserFacingCalculationError("Маршрут получен не полностью. Повторите расчёт.");
      if(data.automaticMode === "standard" || data.automaticMode === "dual") onServerMode(data.automaticMode);
      setResult(data as Result);
      // Telemetry is best-effort and must never break a successful route.
      try { recordRoutes(data as Result); } catch { /* do not abort quote for analytics */ }
    } catch (e) {
      if(controller.signal.aborted||pending.current!==controller)return;
      setError(userFacingCalculationErrorMessage(e, "Не удалось выполнить расчёт. Проверьте соединение и повторите попытку."));
    } finally {
      if(pending.current===controller)setLoading(false);
    }
  }

  async function copyStandard(key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string, tollPeriod: TollPeriod = "weekday", manualTollOverride?: string, fareOnly = false) {
    const copyRequest=pending.current;
    try {
    void title;
    void warning;
    await navigator.clipboard.writeText(buildV3Copy(leg, trip, fareOnly ? undefined : toll, tollPeriod, manualTollOverride, fareOnly));
    if(pending.current!==copyRequest||copyRequest?.signal.aborted)return;
    setCopiedKey(key);
    if(copiedTimer.current)clearTimeout(copiedTimer.current);
    copiedTimer.current=setTimeout(() => setCopiedKey(""), 1800);
    } catch { if(pending.current!==copyRequest||copyRequest?.signal.aborted)return;setCopiedKey("");setError("Не удалось скопировать результат. Разрешите доступ к буферу обмена и повторите попытку."); }
  }

  const clearResult = () => { pending.current?.abort(); pending.current=null; setLoading(false); setResult(null); setError(""); setManualToll(""); setCopiedKey(""); if(copiedTimer.current)clearTimeout(copiedTimer.current); };
  return { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard };
}
