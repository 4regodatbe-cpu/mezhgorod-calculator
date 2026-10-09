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
  onSpecialRatesChange: (rates: typeof defaults) => void;
  urgent: boolean;
  onUrgentChange: (enabled: boolean) => void;
  urgentPercent: number;
  onUrgentPercentChange: (percent: number) => void;
  loading: boolean;
  hasResult: boolean;
  error: string;
  onCalculate: () => void;
};

export function CalculatorForm({
  mode, onModeChange, onResetResult,
  from, onFromChange, to, onToChange,
  rates, onRatesChange, specialRates, onSpecialRatesChange,
  urgent, onUrgentChange, urgentPercent, onUrgentPercentChange,
  loading, hasResult, error, onCalculate,
}: CalculatorFormProps) {
  const selectedTab = "min-h-11 rounded-xl bg-brand-action px-2 text-sm font-extrabold text-brand-action-foreground shadow-sm";
  const idleTab = "min-h-11 rounded-xl px-2 text-sm font-extrabold text-brand-muted transition hover:text-brand-text";
  return (
    <section translate="no" className="notranslate min-w-0 rounded-[1.5rem] border border-brand-border/20 bg-brand-surface p-3 shadow-[0_14px_40px_rgba(16,42,67,.08)] sm:p-5">
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
        <div className={mode === "dual" ? "rounded-2xl border border-brand-border/25 bg-brand-subtle/30 p-2 sm:p-3" : ""}>
          {mode === "dual" && <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-muted">Обычная часть маршрута</p>}
          <TariffInputs rates={rates} setRates={onRatesChange} compact={mode === "dual"} />
        </div>
        {mode === "dual" && <div className="mt-2 rounded-2xl border border-brand-route/30 bg-brand-route/5 p-2 sm:mt-3 sm:p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-route">Внутри особых тарифных зон</p><TariffInputs rates={specialRates} setRates={onSpecialRatesChange} compact idPrefix="special-rate" /><p className="mt-1.5 text-[11px] leading-snug text-brand-muted">Пробег внутри и вне зон определяется по маршруту автоматически.</p></div>}
      </div>
      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 rounded-2xl bg-brand-subtle p-3">
        <button type="button" role="switch" aria-label="Срочная поездка" aria-checked={urgent} onClick={() => onUrgentChange(!urgent)} className={"relative h-7 w-12 shrink-0 rounded-full transition " + (urgent ? "bg-brand-accent" : "bg-brand-border/50")}><span className={"absolute top-1 h-5 w-5 rounded-full bg-brand-surface transition " + (urgent ? "left-6" : "left-1")} /></button>
        <span className="text-sm font-extrabold text-brand-text">Срочная поездка</span>
        {urgent && <label className="ml-auto flex items-center gap-1 rounded-xl border border-brand-border/20 bg-brand-surface px-2"><Percent className="h-4 w-4 text-brand-accent" /><input aria-label="Наценка за срочность" type="number" min="0" max="500" value={urgentPercent} onChange={(event) => onUrgentPercentChange(clampNumber(Number(event.target.value), 0, 500, 0))} className="h-9 w-14 bg-transparent text-right font-bold text-brand-text outline-none" /><span className="text-sm text-brand-muted">%</span></label>}
      </div>
      <div className="hidden md:block"><button type="button" onClick={onCalculate} disabled={loading} className={"relative mt-3 flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 font-black shadow-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus " + (loading ? "bg-brand-accent text-brand-accent-foreground shadow-orange-900/20" : "bg-brand-action text-brand-action-foreground hover:brightness-110")}>
        {loading && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 animate-[route-progress_1.2s_ease-in-out_infinite] rounded-full bg-white/25 blur-md motion-reduce:animate-none" />}
        <span translate="no" className="notranslate relative flex items-center gap-2"><span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center">{loading ? <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Calculator className="h-5 w-5" />}</span><span className="inline-block" suppressHydrationWarning>{loading ? "Считаем маршрут…" : "Рассчитать поездку"}</span></span>
      </button>
      {loading && <div role="status" aria-live="polite" className="mt-2 flex items-center gap-2 rounded-2xl border border-brand-accent/50 bg-brand-accent/10 p-2 text-xs font-bold text-brand-text"><span aria-hidden="true" className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-brand-accent motion-reduce:animate-none" /><span>Подождите пару минут, пока загружается маршрут.</span></div>}</div>
      {!hasResult && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border/30 bg-brand-page/95 px-3 pt-2 backdrop-blur-xl md:hidden" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}>
        {loading && <div role="status" aria-live="polite" className="mx-auto mb-2 flex max-w-3xl items-center justify-center gap-2 rounded-xl border border-brand-accent/50 bg-brand-accent/10 px-3 py-2 text-xs font-bold text-brand-text shadow-lg"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-brand-accent motion-reduce:animate-none" /><span>Подождите пару минут, пока загружается маршрут.</span></div>}
        <button type="button" onClick={onCalculate} disabled={loading} className={"relative mx-auto flex min-h-14 w-full max-w-3xl items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 font-black shadow-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus " + (loading ? "bg-brand-accent text-brand-accent-foreground" : "bg-brand-action text-brand-action-foreground")}>
          {loading && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 animate-[route-progress_1.2s_ease-in-out_infinite] rounded-full bg-white/25 blur-md motion-reduce:animate-none" />}
          <span translate="no" className="notranslate relative flex items-center gap-2"><span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center">{loading ? <LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Calculator className="h-5 w-5" />}</span><span className="inline-block" suppressHydrationWarning>{loading ? "Считаем маршрут…" : "Рассчитать поездку"}</span></span>
        </button>
      </div>}
      {!hasResult && <div aria-hidden="true" className="h-20 md:hidden" />}
      {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
    </section>
  );
}
