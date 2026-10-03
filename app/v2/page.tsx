"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Car, Download, ShieldCheck } from "lucide-react";
import { FeedbackForm } from "./components/feedback-form";
import { DonationCard } from "./components/donation-card";
import { CalculatorForm } from "./components/calculator-form";
import { ResultPanels } from "./components/result-panels";
import { defaults, tariffNames } from "./components/pricing-data";
import { clampNumber, distance, duration, money } from "./components/format";
import { pickOptimal } from "./components/route-utils";
import type { Place, Result, Leg, Trip, TollView } from "./components/types";





function storedNumber(key: string, min: number, max: number, fallback: number) { if (typeof window === "undefined") return fallback; const saved = localStorage.getItem(key); return saved === null ? fallback : clampNumber(Number(saved), min, max, fallback); }

export default function V2Page() {
  const [mode, setMode] = useState<"standard" | "dual">("standard");
  const [from, setFrom] = useState<Place>({ label: "" }); const [via, setVia] = useState<Place>({ label: "" }); const [to, setTo] = useState<Place>({ label: "" });
  const [rates, setRates] = useState(() => { if (typeof window === "undefined") return defaults; try { const saved = localStorage.getItem("mezhgorod-v2-rates"); if (!saved) return defaults; const parsed = JSON.parse(saved) as Partial<typeof defaults>; return Object.fromEntries((Object.keys(defaults) as Array<keyof typeof defaults>).map((key) => [key, clampNumber(Number(parsed[key]), 1, 10000, defaults[key])])) as typeof defaults; } catch { return defaults; } }); const [rate1, setRate1] = useState(() => storedNumber("mezhgorod-v2-rate1", 1, 10000, 25)); const [rate2, setRate2] = useState(() => storedNumber("mezhgorod-v2-rate2", 1, 10000, 35));
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(() => storedNumber("mezhgorod-v2-urgent-percent", 0, 500, 20));
  const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [manualToll, setManualToll] = useState(""); const [isAndroidApp, setIsAndroidApp] = useState(false); const [copiedKey, setCopiedKey] = useState("");
  useEffect(() => { localStorage.setItem("mezhgorod-v2-rates", JSON.stringify(rates)); }, [rates]);
  useEffect(() => { localStorage.setItem("mezhgorod-v2-rate1", String(rate1)); localStorage.setItem("mezhgorod-v2-rate2", String(rate2)); }, [rate1, rate2]);
  useEffect(() => { localStorage.setItem("mezhgorod-v2-urgent-percent", String(urgentPercent)); }, [urgentPercent]);
  useEffect(() => { setIsAndroidApp(navigator.userAgent.includes("MezhgorodAndroid")); }, []);
  useEffect(() => { let visitorId = localStorage.getItem("mezhgorod-anonymous-visitor-id"); if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("mezhgorod-anonymous-visitor-id", visitorId); } if (sessionStorage.getItem("mezhgorod-visit-sent")) return; void fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "visit", visitorId, version: "2.0" }) }).then((response) => { if (response.ok) sessionStorage.setItem("mezhgorod-visit-sent", "1"); }).catch(() => undefined); }, []);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const standardLeg = result?.legs[0];
  const standardHasTolls = standardLeg ? standardLeg.fast.tolls.pricingStatus !== "free" : false;
  const standardOptimal = standardLeg ? pickOptimal(standardLeg.fast, standardLeg.free) : null;
  const dualHasTolls = result?.legs.some((leg) => leg.fast.tolls.pricingStatus !== "free") ?? false;
  const dualVariants: Array<"fast" | "free" | "optimal"> = dualHasTolls ? ["fast", "free"] : ["optimal"];
  function recordRoutes(data: Result) { data.legs.forEach((leg) => { const variants = leg.fast.tolls.pricingStatus !== "free" ? [{ type: leg.fast.tolls.pricingStatus === "unknown" ? "Быстрый, цена дорог ?" : "Платный", trip: leg.fast, tolls: leg.fast.tolls }, ...(leg.free ? [{ type: "Бесплатный", trip: leg.free, tolls: null }] : [])] : [{ type: "Оптимальный", trip: pickOptimal(leg.fast, leg.free), tolls: null }]; variants.forEach(({ type, trip, tolls }) => { const totals = mode === "standard" ? Object.fromEntries((Object.keys(rates) as Array<keyof typeof rates>).map((key) => [key, Math.round(trip.meters / 1000 * rates[key] * multiplier)])) : { standard: Math.round(trip.meters / 1000 * (leg === data.legs[0] ? rate1 : rate2) * multiplier), comfort: 0, comfortPlus: 0, minivan: 0 }; void fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "route_v2", fromRegion: leg.from, toRegion: leg.to, distanceKm: Math.round(trip.meters / 100) / 10, durationMin: Math.round(trip.seconds / 60), routeType: type, totals, tollWeekday: tolls?.pricingStatus === "unknown" ? null : tolls ? tolls.weekdayAmount : 0, tollWeekend: tolls?.pricingStatus === "unknown" ? null : tolls ? tolls.weekendAmount : 0, tollPricingStatus: tolls?.pricingStatus ?? "free" }) }).catch(() => undefined); }); }); }
  async function calculate() { setError(""); setResult(null); setLoading(true); setManualToll(""); setCopiedKey(""); try { const response = await fetch("/api/v2/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, from, via, to, departureAt: new Date().toISOString() }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); recordRoutes(data); } catch (e) { setError(e instanceof Error ? e.message : "Не удалось выполнить расчёт"); } finally { setLoading(false); } }
  async function copyStandard(key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string) { const lines = [`Калькулятор межгород`, `${title}: ${leg.from} → ${leg.to}`, `${distance(trip.meters)} · ${duration(trip.seconds)}`, ...((Object.keys(defaults) as Array<keyof typeof defaults>).map((rate) => `${tariffNames[rate]}: ${money(trip.meters / 1000 * rates[rate] * multiplier)}`))]; if (toll) { if (toll.pricingStatus === "unknown") lines.push("Платность / стоимость дороги не подтверждена"); else if (toll.weekdayAmount !== toll.weekendAmount) lines.push(`Платная дорога: Пн–Чт ${money(toll.weekdayAmount ?? 0)}, Пт–Вс ${money(toll.weekendAmount ?? 0)}`); else if (toll.pricingStatus === "priced") lines.push(`Платная дорога: ${money(toll.amount ?? 0)}`); } if (warning) lines.push(`Важно: ${warning}`); await navigator.clipboard.writeText(lines.join("\n")); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1800); }
  async function copyDual(key: string, title: string, trips: Trip[], total: number, tollWeekday: number, tollWeekend: number, tollUnknown: boolean) { const lines = [`Калькулятор межгород`, title, ...result!.legs.map((leg, index) => `Участок ${index + 1}: ${leg.from} → ${leg.to} · ${distance(trips[index].meters)} · ${duration(trips[index].seconds)} · ${money(trips[index].meters / 1000 * (index === 0 ? rate1 : rate2) * multiplier)}`), `Итого: ${money(total)}`]; if (tollUnknown) lines.push("Платность / стоимость дороги не подтверждена"); else if (tollWeekday > 0) lines.push(tollWeekday !== tollWeekend ? `Платная дорога: Пн–Чт ${money(tollWeekday)}, Пт–Вс ${money(tollWeekend)}` : `Платная дорога: ${money(tollWeekday)}`); await navigator.clipboard.writeText(lines.join("\n")); setCopiedKey(key); setTimeout(() => setCopiedKey(""), 1800); }

  return <main className="calculator-modern min-h-screen bg-slate-100 text-slate-950 dark:bg-[#070b14] dark:text-slate-100">
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-4 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-900/30"><Car className="h-5 w-5"/></div><h1 className="text-base font-black leading-tight sm:text-2xl">Калькулятор межгород</h1></div><div className="flex shrink-0 items-center gap-1.5"><ThemeToggle />{!isAndroidApp && <a href="https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/download/android-latest/Mezhgorod-Calc-2.apk" download="Mezhgorod-Calc-2.apk" aria-label="Скачать для Android" className="flex h-10 items-center gap-1 rounded-xl bg-blue-600 px-2 text-[11px] font-bold text-white shadow-md transition hover:bg-blue-700 sm:px-3 sm:text-xs"><Download className="h-4 w-4 shrink-0"/>Скачать для Android</a>}</div></header>
      <CalculatorForm
        mode={mode}
        onModeChange={setMode}
        onResetResult={() => setResult(null)}
        from={from}
        onFromChange={setFrom}
        via={via}
        onViaChange={setVia}
        to={to}
        onToChange={setTo}
        rates={rates}
        onRatesChange={setRates}
        rate1={rate1}
        onRate1Change={setRate1}
        rate2={rate2}
        onRate2Change={setRate2}
        urgent={urgent}
        onUrgentChange={setUrgent}
        urgentPercent={urgentPercent}
        onUrgentPercentChange={setUrgentPercent}
        loading={loading}
        error={error}
        onCalculate={calculate}
      />



      <ResultPanels result={result} mode={mode} standardLeg={standardLeg} standardHasTolls={standardHasTolls} standardOptimal={standardOptimal} dualHasTolls={dualHasTolls} dualVariants={dualVariants} rates={rates} multiplier={multiplier} manualToll={manualToll} onManualToll={setManualToll} copiedKey={copiedKey} rate1={rate1} rate2={rate2} copyStandard={copyStandard} copyDual={copyDual}/>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackForm/><DonationCard/></div>
      <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-slate-500"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>Расчёт справочный. Фактический маршрут и тарифы операторов дорог могут измениться.</p></footer>
    </div>
  </main>;
}
