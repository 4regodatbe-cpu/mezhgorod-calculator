"use client";

import { Calculator, LoaderCircle, Percent, Settings2 } from "lucide-react";
import { AddressField } from "./address-field";
import { TariffInputs } from "./pricing-fields";
import { clampNumber } from "./format";
import { defaults } from "./pricing-data";
import type { Place } from "./types";

type CalculatorMode = "standard" | "dual";

type CalculatorFormProps = {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  onResetResult: () => void;
  from: Place;
  onFromChange: (place: Place) => void;
  to: Place;
  onToChange: (place: Place) => void;
  rates: typeof defaults;
  onRatesChange: (rates: typeof defaults) => void;
  specialRates: typeof defaults;
  onSpecialRatesChange: (rates:typeof defaults) => void;
  urgent: boolean;
  onUrgentChange: (enabled: boolean) => void;
  urgentPercent: number;
  onUrgentPercentChange: (percent: number) => void;
  loading: boolean;
  error: string;
  onCalculate: () => void;
};

export function CalculatorForm({
  mode, onModeChange, onResetResult,
  from, onFromChange, to, onToChange,
  rates, onRatesChange, specialRates, onSpecialRatesChange,
  urgent, onUrgentChange, urgentPercent, onUrgentPercentChange,
  loading, error, onCalculate,
}: CalculatorFormProps) {
  return <section className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-3 shadow-2xl backdrop-blur sm:p-5">
    <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-950 p-1">
      <button onClick={() => { onModeChange("standard"); onResetResult(); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "standard" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Обычный расчёт</button>
      <button onClick={() => { onModeChange("dual"); onResetResult(); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "dual" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Двойная тарификация</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <AddressField label="Точка A" value={from} onChange={onFromChange} placeholder="Откуда"/>
      <AddressField label="Точка B" value={to} onChange={onToChange} placeholder="Куда"/>
    </div>
    <div className="mt-4 border-t border-slate-800 pt-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Settings2 className="h-4 w-4 text-blue-400"/>{mode === "standard" ? "Тарифы" : "Обычные тарифы"}</div>
      <TariffInputs rates={rates} setRates={onRatesChange}/>
      {mode === "dual" && <div className="mt-3"><p className="mb-2 text-sm font-bold">Внутри особых тарифных зон</p><TariffInputs rates={specialRates} setRates={onSpecialRatesChange}/><p className="mt-2 text-xs text-slate-400">Пробег внутри и вне зон определяется по маршруту автоматически.</p></div>}
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/65 p-3">
      <button type="button" role="switch" aria-label="Срочная поездка" aria-checked={urgent} onClick={() => onUrgentChange(!urgent)} className={`relative h-7 w-12 rounded-full transition ${urgent ? "bg-orange-500" : "bg-slate-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${urgent ? "left-6" : "left-1"}`}/></button>
      <span className="text-sm font-bold">Срочная поездка</span>
      {urgent && <label className="ml-auto flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2"><Percent className="h-4 w-4 text-orange-400"/><input aria-label="Наценка за срочность" type="number" min="0" max="500" value={urgentPercent} onChange={(e) => onUrgentPercentChange(clampNumber(Number(e.target.value), 0, 500, 0))} className="h-9 w-14 bg-transparent text-right font-bold outline-none"/><span className="text-sm text-slate-400">%</span></label>}
    </div>
    <button onClick={onCalculate} disabled={loading} className="mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-black text-white shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:opacity-60">{loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Calculator className="h-5 w-5"/>}{loading ? "Строим маршруты…" : "Рассчитать поездку"}</button>
    {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
  </section>;
}
