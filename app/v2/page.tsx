"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Car, Download, ShieldCheck } from "lucide-react";
import { FeedbackForm } from "./components/feedback-form";
import { DonationCard } from "./components/donation-card";
import { CalculatorForm } from "./components/calculator-form";
import { ResultPanels } from "./components/result-panels";
import { useV2Calculation } from "./components/use-v2-calculation";
import { useTariffMode } from "./components/use-tariff-mode";
import { defaults } from "./components/pricing-data";
import { clampNumber } from "./components/format";
import { pickOptimal } from "./components/route-utils";
import type { Place } from "./components/types";





function storedNumber(key: string, min: number, max: number, fallback: number) { if (typeof window === "undefined") return fallback; const saved = localStorage.getItem(key); return saved === null ? fallback : clampNumber(Number(saved), min, max, fallback); }

export default function V2Page() {
  const [from,setFrom]=useState<Place>({label:""});
  const [to,setTo]=useState<Place>({label:""});
  const {mode,setMode,requestMode,onServerMode}=useTariffMode(from,to);
  const [rates,setRates]=useState(defaults);
  const [specialRates,setSpecialRates]=useState({standard:70,comfort:80,comfortPlus:90,minivan:110});
  const [ratesLoaded,setRatesLoaded]=useState(false);
  useEffect(()=>{
    const read=(key:string,fallback:typeof defaults)=>{try {const parsed=JSON.parse(localStorage.getItem(key)??"null");if(!parsed)return fallback;return Object.fromEntries(Object.keys(fallback).map(key=>[key,clampNumber(Number(parsed[key]),1,10000,fallback[key as keyof typeof fallback])])) as typeof defaults;}catch{return fallback;}};
    setRates(read("mezhgorod-v2-rates",defaults));setSpecialRates(read("mezhgorod-v2-special-rates",{standard:70,comfort:80,comfortPlus:90,minivan:110}));setRatesLoaded(true);
  },[]);
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(() => storedNumber("mezhgorod-v2-urgent-percent", 0, 500, 20));
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  useEffect(() => { if(ratesLoaded)try {localStorage.setItem("mezhgorod-v2-rates",JSON.stringify(rates));localStorage.setItem("mezhgorod-v2-special-rates",JSON.stringify(specialRates));}catch{} }, [rates,specialRates,ratesLoaded]);

  useEffect(() => { localStorage.setItem("mezhgorod-v2-urgent-percent", String(urgentPercent)); }, [urgentPercent]);
  useEffect(() => { setIsAndroidApp(navigator.userAgent.includes("MezhgorodAndroid")); }, []);
  useEffect(() => { let visitorId = localStorage.getItem("mezhgorod-anonymous-visitor-id"); if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("mezhgorod-anonymous-visitor-id", visitorId); } if (sessionStorage.getItem("mezhgorod-visit-sent")) return; void fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "visit", visitorId, version: "2.0" }) }).then((response) => { if (response.ok) sessionStorage.setItem("mezhgorod-visit-sent", "1"); }).catch(() => undefined); }, []);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard } = useV2Calculation({ from, to, rates, specialRates, requestMode, onServerMode, multiplier });
  const standardLeg = result?.legs[0];
  const standardHasTolls = standardLeg ? standardLeg.fast.tolls.pricingStatus !== "free" : false;
  const standardOptimal = standardLeg ? pickOptimal(standardLeg.fast, standardLeg.free) : null;
  return <main className="calculator-modern min-h-screen bg-slate-100 text-slate-950 dark:bg-[#070b14] dark:text-slate-100">
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-4 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-900/30"><Car className="h-5 w-5"/></div><h1 className="text-base font-black leading-tight sm:text-2xl">Калькулятор межгород</h1></div><div className="flex shrink-0 items-center gap-1.5"><ThemeToggle />{!isAndroidApp && <a href="https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/download/android-latest/Mezhgorod-Calc-2.apk" download="Mezhgorod-Calc-2.apk" aria-label="Скачать для Android" className="flex h-10 items-center gap-1 rounded-xl bg-blue-600 px-2 text-[11px] font-bold text-white shadow-md transition hover:bg-blue-700 sm:px-3 sm:text-xs"><Download className="h-4 w-4 shrink-0"/>Скачать для Android</a>}</div></header>
      <CalculatorForm
        mode={mode}
        onModeChange={setMode}
        onResetResult={clearResult}
        from={from}
        onFromChange={(value)=>{setFrom(value);clearResult();}}
        to={to}
        onToChange={(value)=>{setTo(value);clearResult();}}
        rates={rates}
        onRatesChange={(value)=>{setRates(value);clearResult();}}
        specialRates={specialRates}
        onSpecialRatesChange={(value)=>{setSpecialRates(value);clearResult();}}
        urgent={urgent}
        onUrgentChange={setUrgent}
        urgentPercent={urgentPercent}
        onUrgentPercentChange={setUrgentPercent}
        loading={loading}
        error={error}
        onCalculate={calculate}
      />



      <ResultPanels result={result} standardLeg={standardLeg} standardHasTolls={standardHasTolls} standardOptimal={standardOptimal} manualToll={manualToll} onManualToll={setManualToll} copiedKey={copiedKey} copyStandard={copyStandard}/>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackForm/><DonationCard/></div>
      <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-slate-500"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>Расчёт справочный. Фактический маршрут и тарифы операторов дорог могут измениться.</p></footer>
    </div>
  </main>;
}
