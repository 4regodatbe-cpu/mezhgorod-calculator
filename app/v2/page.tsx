"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Car, Download, ShieldCheck } from "lucide-react";
import { FeedbackForm } from "./components/feedback-form";
import { DonationCard } from "./components/donation-card";
import { CalculatorForm } from "./components/calculator-form";
import { ResultPanels } from "./components/result-panels";
import { useV2Calculation } from "./components/use-v2-calculation";
import { defaults } from "./components/pricing-data";
import { clampNumber } from "./components/format";
import { pickOptimal } from "./components/route-utils";
import type { Place } from "./components/types";





function storedNumber(key: string, min: number, max: number, fallback: number) { if (typeof window === "undefined") return fallback; const saved = localStorage.getItem(key); return saved === null ? fallback : clampNumber(Number(saved), min, max, fallback); }

export default function V2Page() {
  const [mode, setMode] = useState<"standard" | "dual">("standard");
  const [from, setFrom] = useState<Place>({ label: "" }); const [via, setVia] = useState<Place>({ label: "" }); const [to, setTo] = useState<Place>({ label: "" });
  const [rates, setRates] = useState(() => { if (typeof window === "undefined") return defaults; try { const saved = localStorage.getItem("mezhgorod-v2-rates"); if (!saved) return defaults; const parsed = JSON.parse(saved) as Partial<typeof defaults>; return Object.fromEntries((Object.keys(defaults) as Array<keyof typeof defaults>).map((key) => [key, clampNumber(Number(parsed[key]), 1, 10000, defaults[key])])) as typeof defaults; } catch { return defaults; } }); const [rate1, setRate1] = useState(() => storedNumber("mezhgorod-v2-rate1", 1, 10000, 25)); const [rate2, setRate2] = useState(() => storedNumber("mezhgorod-v2-rate2", 1, 10000, 35));
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(() => storedNumber("mezhgorod-v2-urgent-percent", 0, 500, 20));
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  useEffect(() => { localStorage.setItem("mezhgorod-v2-rates", JSON.stringify(rates)); }, [rates]);
  useEffect(() => { localStorage.setItem("mezhgorod-v2-rate1", String(rate1)); localStorage.setItem("mezhgorod-v2-rate2", String(rate2)); }, [rate1, rate2]);
  useEffect(() => { localStorage.setItem("mezhgorod-v2-urgent-percent", String(urgentPercent)); }, [urgentPercent]);
  useEffect(() => { setIsAndroidApp(navigator.userAgent.includes("MezhgorodAndroid")); }, []);
  useEffect(() => { let visitorId = localStorage.getItem("mezhgorod-anonymous-visitor-id"); if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("mezhgorod-anonymous-visitor-id", visitorId); } if (sessionStorage.getItem("mezhgorod-visit-sent")) return; void fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "visit", visitorId, version: "2.0" }) }).then((response) => { if (response.ok) sessionStorage.setItem("mezhgorod-visit-sent", "1"); }).catch(() => undefined); }, []);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard, copyDual } = useV2Calculation({ mode, from, via, to, rates, rate1, rate2, multiplier });
  const standardLeg = result?.legs[0];
  const standardHasTolls = standardLeg ? standardLeg.fast.tolls.pricingStatus !== "free" : false;
  const standardOptimal = standardLeg ? pickOptimal(standardLeg.fast, standardLeg.free) : null;
  const dualHasTolls = result?.legs.some((leg) => leg.fast.tolls.pricingStatus !== "free") ?? false;
  const dualVariants: Array<"fast" | "free" | "optimal"> = dualHasTolls ? ["fast", "free"] : ["optimal"];
  return <main className="calculator-modern min-h-screen bg-slate-100 text-slate-950 dark:bg-[#070b14] dark:text-slate-100">
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-4 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-900/30"><Car className="h-5 w-5"/></div><h1 className="text-base font-black leading-tight sm:text-2xl">Калькулятор межгород</h1></div><div className="flex shrink-0 items-center gap-1.5"><ThemeToggle />{!isAndroidApp && <a href="https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/download/android-latest/Mezhgorod-Calc-2.apk" download="Mezhgorod-Calc-2.apk" aria-label="Скачать для Android" className="flex h-10 items-center gap-1 rounded-xl bg-blue-600 px-2 text-[11px] font-bold text-white shadow-md transition hover:bg-blue-700 sm:px-3 sm:text-xs"><Download className="h-4 w-4 shrink-0"/>Скачать для Android</a>}</div></header>
      <CalculatorForm
        mode={mode}
        onModeChange={setMode}
        onResetResult={clearResult}
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



      <ResultPanels result={result} mode={mode} standardLeg={standardLeg} standardHasTolls={standardHasTolls} standardOptimal={standardOptimal} dualHasTolls={dualHasTolls} dualVariants={dualVariants} manualToll={manualToll} onManualToll={setManualToll} copiedKey={copiedKey} copyStandard={copyStandard} copyDual={copyDual}/>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackForm/><DonationCard/></div>
      <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-slate-500"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>Расчёт справочный. Фактический маршрут и тарифы операторов дорог могут измениться.</p></footer>
    </div>
  </main>;
}
