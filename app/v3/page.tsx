"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const formRef = useRef<HTMLDivElement>(null);
  const [tollPeriod, setTollPeriod] = useState<TollPeriod>("weekday");
  const [from,setFrom]=useState<Place>({label:""});
  const [to,setTo]=useState<Place>({label:""});
  const {mode,setMode,requestMode,onServerMode}=useTariffMode(from,to);
  const previousModeRef = useRef(mode);
  useEffect(() => {
    const wasDual = previousModeRef.current === "dual";
    previousModeRef.current = mode;
    if (wasDual || mode !== "dual") return;
    const frame = requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLInputElement) return;
      formRef.current?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);
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
  const { result, error, loading, manualToll, setManualToll, copiedKey, clearResult, calculate, copyStandard } = useV3Calculation({ from, to, rates, specialRates, requestMode, onServerMode, multiplier, apiEndpoint: "/api/v3/calculate", analyticsVersion: "3.0" });
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
      <header className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:mb-4">
        <div className="flex min-w-0 items-center">
          <a href="/v3" aria-label="из А в Б — калькулятор" className="shrink-0 rounded-xl p-1"><Image src="/izavb-approved-logo.svg" alt="из А в Б" width={136} height={60} priority className="dark:invert" /></a>
        </div>
        <div className="text-center"><h1 className="sr-only">из А в Б — калькулятор поездок</h1><span className="whitespace-nowrap text-xs font-bold tracking-wide text-brand-muted">V1.01</span></div>
        <div className="flex min-w-0 items-center justify-end gap-1.5"><ThemeToggle /></div>
      </header>
      <div ref={formRef} className="scroll-mt-2"><CalculatorForm
        releaseCopy
        specialOnly={result?.specialOnly === true}
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
        onCalculate={calculate}
      /></div>
      <div ref={resultRef} className="scroll-mt-3">
        <ResultPanels result={result} standardLeg={standardLeg} standardHasTolls={standardHasTolls} standardOptimal={standardOptimal} manualToll={manualToll} onManualToll={setManualToll} copiedKey={copiedKey} copyStandard={copyStandard} tollPeriod={tollPeriod} onTollPeriodChange={setTollPeriod} fastestOnly/>
        {result && mode === "dual" && !result.specialOnly && <p className="mt-3 rounded-xl border border-brand-route/40 bg-brand-route/5 px-3 py-2 text-sm font-semibold leading-relaxed text-brand-text">Границы участков с обычной и специальной тарификацией определяются автоматически по построенному маршруту.</p>}
        {result && <p role="note" className="mt-3 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm font-semibold leading-relaxed text-brand-text">Расчёт носит справочный характер. Фактический маршрут, время в пути и стоимость проезда по платным дорогам могут отличаться от указанных.</p>}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackForm/><DonationCard releaseCopy/></div>
      <footer className="mx-auto mt-3 max-w-3xl pb-3 text-center text-[11px] leading-relaxed text-brand-muted">Данные населённых пунктов: <a href="https://www.geonames.org/" className="underline underline-offset-2">GeoNames</a> · <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2">CC BY 4.0</a>.</footer>
      <div aria-hidden="true" className="h-20 md:hidden" />
    </div>
  </main>;
}
