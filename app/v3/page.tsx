"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { FeedbackForm } from "../v2/components/feedback-form";
import { DonationCard } from "../v2/components/donation-card";
import { CalculatorForm } from "../v2/components/calculator-form";
import { ResultPanels } from "../v2/components/result-panels";
import { useV3Calculation } from "./components/use-v3-calculation";
import { useTariffMode } from "../v2/components/use-tariff-mode";
import { defaults } from "../v2/components/pricing-data";
import { clampNumber } from "../v2/components/format";
import { pickOptimal } from "../v2/components/route-utils";
import { currentTollPeriod, type TollPeriod } from "../v2/components/quote-presentation";
import type { Place } from "../v2/components/types";





function storedNumber(key: string, min: number, max: number, fallback: number) { if (typeof window === "undefined") return fallback; try {const saved = localStorage.getItem(key); return saved === null ? fallback : clampNumber(Number(saved), min, max, fallback);}catch{return fallback;} }

export default function V3Page() {
  const resultRef = useRef<HTMLDivElement>(null);
  const [tollPeriod, setTollPeriod] = useState<TollPeriod>("weekday");
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
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(20);
  useEffect(() => { if(ratesLoaded)try {localStorage.setItem("mezhgorod-v2-rates",JSON.stringify(rates));localStorage.setItem("mezhgorod-v2-special-rates",JSON.stringify(specialRates));}catch{} }, [rates,specialRates,ratesLoaded]);

  useEffect(()=>{setUrgentPercent(storedNumber("mezhgorod-v2-urgent-percent",0,500,20));},[]);
  useEffect(() => { if(ratesLoaded)try{localStorage.setItem("mezhgorod-v2-urgent-percent", String(urgentPercent));}catch{} }, [urgentPercent,ratesLoaded]);
  useEffect(() => { setTollPeriod(currentTollPeriod()); }, []);
  useEffect(() => { try {let visitorId = localStorage.getItem("mezhgorod-anonymous-visitor-id"); if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("mezhgorod-anonymous-visitor-id", visitorId); } if (sessionStorage.getItem("mezhgorod-visit-sent")) return; void fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "visit", visitorId, version: "3.0" }) }).then((response) => { if (response.ok) sessionStorage.setItem("mezhgorod-visit-sent", "1"); }).catch(() => undefined);}catch{} }, []);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const { result, error, loading, deepTollDiagnostics, setDeepTollDiagnostics, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard } = useV3Calculation({ from, to, rates, specialRates, requestMode, onServerMode, multiplier, apiEndpoint: "/api/v3/calculate", analyticsVersion: "3.0" });
  useEffect(() => {
    if (!result) return;
    const frame = requestAnimationFrame(() => resultRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    }));
    return () => cancelAnimationFrame(frame);
  }, [result]);
  const standardLeg = result?.legs[0];
  const standardHasTolls = standardLeg ? standardLeg.fast.tolls.pricingStatus !== "free" : false;
  const standardOptimal = standardLeg ? pickOptimal(standardLeg.fast, standardLeg.free) : null;
  return <main translate="no" className="notranslate calculator-modern min-h-screen bg-brand-page pb-[env(safe-area-inset-bottom)] text-brand-text">
    <div className="v2-page-inset mx-auto w-full max-w-3xl px-3 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <a href="/v3" aria-label="из А в Б — калькулятор" className="shrink-0 rounded-xl bg-[#F7F4EE] p-1"><Image src="/izavb-approved-logo.svg" alt="из А в Б" width={136} height={60} priority /></a>
          <div className="min-w-0"><h1 className="sr-only">из А в Б — калькулятор поездок</h1><p className="text-xs font-semibold text-brand-muted">Актуальный калькулятор · один самый быстрый маршрут</p><a href="/v2" className="mt-0.5 block text-[11px] font-semibold text-brand-muted underline underline-offset-2">V2 · старый алгоритм</a><a href="/v2/toll-roads" className="mt-0.5 block text-[11px] font-semibold text-brand-action underline underline-offset-2">Платные дороги России</a></div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5"><ThemeToggle /></div>
      </header>
      <CalculatorForm
        mode={mode}
        onModeChange={setMode}
        onResetResult={clearResult}
        from={from}
        onFromChange={(value)=>{setFrom(value);clearResult();}}
        to={to}
        onToChange={(value)=>{setTo(value);clearResult();}}
        onSwap={() => { setFrom(to); setTo(from); clearResult(); }}
        rates={rates}
        onRatesChange={(value)=>{setRates(value);clearResult();}}
        specialRates={specialRates}
        onSpecialRatesChange={(value)=>{setSpecialRates(value);clearResult();}}
        urgent={urgent}
        onUrgentChange={(enabled)=>{setUrgent(enabled);clearResult();}}
        urgentPercent={urgentPercent}
        onUrgentPercentChange={(percent)=>{setUrgentPercent(percent);clearResult();}}
        loading={loading}
        hasResult={Boolean(result)}
        error={error}
        deepTollDiagnostics={deepTollDiagnostics}
        onDeepTollDiagnosticsChange={(enabled) => { setDeepTollDiagnostics(enabled); clearResult(); }}
        onCalculate={calculate}
      />
      <div ref={resultRef} className="scroll-mt-3">
        <ResultPanels result={result} standardLeg={standardLeg} standardHasTolls={standardHasTolls} standardOptimal={standardOptimal} manualToll={manualToll} onManualToll={setManualToll} copiedKey={copiedKey} copyStandard={copyStandard} tollPeriod={tollPeriod} onTollPeriodChange={setTollPeriod} fastestOnly/>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackForm/><DonationCard/></div>
      <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-brand-muted"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>Расчёт справочный. Фактический маршрут и тарифы операторов дорог могут измениться.</p><p className="mt-2">Локальный справочник населённых пунктов: <a href="https://www.geonames.org/" className="underline">GeoNames</a>, <a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>. Снимок 24.10.2026; данные отфильтрованы и проиндексированы. Координаты населённых пунктов не являются точными адресами.</p></footer>
    </div>
  </main>;
}
