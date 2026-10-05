"use client";

import { Calculator, LoaderCircle, Percent, Settings2 } from "lucide-react";
import { AddressField } from "./address-field";
import { TariffInputs } from "./pricing-fields";
import { clampNumber } from "./format";
import { defaults } from "./pricing-data";
import type { TollPeriod } from "./quote-presentation";
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
  onSpecialRatesChange: (rates: typeof defaults) => void;
  urgent: boolean;
  onUrgentChange: (enabled: boolean) => void;
  urgentPercent: number;
  onUrgentPercentChange: (percent: number) => void;
  tollPeriod: TollPeriod;
  onTollPeriodChange: (period: TollPeriod) => void;
  loading: boolean;
  error: string;
  onCalculate: () => void;
};

export function CalculatorForm({
  mode, onModeChange, onResetResult,
  from, onFromChange, to, onToChange,
  rates, onRatesChange, specialRates, onSpecialRatesChange,
  urgent, onUrgentChange, urgentPercent, onUrgentPercentChange,
  tollPeriod, onTollPeriodChange,
  loading, error, onCalculate,
}: CalculatorFormProps) {
  const selectedTab = "min-h-11 rounded-xl bg-brand-action px-2 text-sm font-extrabold text-white shadow-sm";
  const idleTab = "min-h-11 rounded-xl px-2 text-sm font-extrabold text-brand-muted transition hover:text-brand-text";
  return (
    <section className="min-w-0 rounded-[1.5rem] border border-brand-border/20 bg-brand-surface p-3 shadow-[0_14px_40px_rgba(16,42,67,.08)] sm:p-5">
      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-brand-subtle p-1">
        <button type="button" onClick={() => { onModeChange("standard"); onResetResult(); }} className={mode === "standard" ? selectedTab : idleTab}>Обычный расчёт</button>
        <button type="button" onClick={() => { onModeChange("dual"); onResetResult(); }} className={mode === "dual" ? selectedTab : idleTab}>Двойная тарификация</button>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <AddressField label="Точка A" value={from} onChange={onFromChange} placeholder="Откуда" />
        <AddressField label="Точка B" value={to} onChange={onToChange} placeholder="Куда" />
      </div>
      <div className="mt-4 border-t border-brand-border/15 pt-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-brand-text"><Settings2 className="h-4 w-4 text-brand-action" />{mode === "standard" ? "Тарифы" : "Обычные тарифы"}</div>
        <TariffInputs rates={rates} setRates={onRatesChange} />
        <p className="mt-2 text-xs leading-relaxed text-brand-muted">Тарифы поездки и платных дорог могут меняться. Проверьте актуальную стоимость перед подтверждением заказа. Ваши ставки сохраняются на этом устройстве.</p>
        <fieldset className="mt-3">
          <legend className="mb-1.5 text-xs font-bold text-brand-text">День поездки для оценки платных дорог</legend>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-subtle p-1">
            <button type="button" aria-pressed={tollPeriod === "weekday"} onClick={() => onTollPeriodChange("weekday")} className={"min-h-10 rounded-xl px-2 text-sm font-bold transition " + (tollPeriod === "weekday" ? "bg-brand-action text-white" : "text-brand-muted hover:text-brand-text")}>Пн–Чт</button>
            <button type="button" aria-pressed={tollPeriod === "weekend"} onClick={() => onTollPeriodChange("weekend")} className={"min-h-10 rounded-xl px-2 text-sm font-bold transition " + (tollPeriod === "weekend" ? "bg-brand-action text-white" : "text-brand-muted hover:text-brand-text")}>Пт–Вс</button>
          </div>
        </fieldset>
        {mode === "dual" && <div className="mt-3"><p className="mb-2 text-sm font-extrabold text-brand-text">Внутри особых тарифных зон</p><TariffInputs rates={specialRates} setRates={onSpecialRatesChange} /><p className="mt-2 text-xs text-brand-muted">Пробег внутри и вне зон определяется по маршруту автоматически.</p></div>}
      </div>
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 rounded-2xl bg-brand-subtle p-3">
        <button type="button" role="switch" aria-label="Срочная поездка" aria-checked={urgent} onClick={() => onUrgentChange(!urgent)} className={"relative h-7 w-12 shrink-0 rounded-full transition " + (urgent ? "bg-brand-accent" : "bg-brand-border/50")}><span className={"absolute top-1 h-5 w-5 rounded-full bg-white transition " + (urgent ? "left-6" : "left-1")} /></button>
        <span className="text-sm font-extrabold text-brand-text">Срочная поездка</span>
        {urgent && <label className="ml-auto flex items-center gap-1 rounded-xl border border-brand-border/20 bg-brand-surface px-2"><Percent className="h-4 w-4 text-brand-accent" /><input aria-label="Наценка за срочность" type="number" min="0" max="500" value={urgentPercent} onChange={(event) => onUrgentPercentChange(clampNumber(Number(event.target.value), 0, 500, 0))} className="h-9 w-14 bg-transparent text-right font-bold text-brand-text outline-none" /><span className="text-sm text-brand-muted">%</span></label>}
      </div>
      <button type="button" onClick={onCalculate} disabled={loading} className={"relative mt-3 flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 font-black shadow-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus " + (loading ? "bg-brand-accent text-brand-text shadow-orange-900/20" : "bg-brand-action text-white hover:brightness-110")}>
        {loading && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 animate-[route-progress_1.2s_ease-in-out_infinite] rounded-full bg-white/25 blur-md motion-reduce:animate-none" />}
        <span className="relative flex items-center gap-2">{loading ? <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Calculator className="h-5 w-5" />}{loading ? "Считаем маршрут…" : "Рассчитать поездку"}</span>
      </button>
      {loading && <div role="status" aria-live="polite" className="mt-3 flex items-center gap-3 rounded-2xl border border-brand-accent/50 bg-brand-accent/10 p-3 text-sm font-bold text-brand-text"><span aria-hidden="true" className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-brand-accent motion-reduce:animate-none" /><span>Проверяем варианты маршрута и тарифы. Обычно расчёт занимает несколько секунд.</span></div>}
      {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
    </section>
  );
}
