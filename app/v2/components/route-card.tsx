"use client";

import { Check, Clipboard, Clock3, Route, ShieldCheck } from "lucide-react";
import { PriceRows } from "./pricing-fields";
import { clampNumber, duration, distance, money } from "./format";
import { resolveTollAmount, type TollPeriod } from "./quote-presentation";
import type { TollView, Trip, RouteQuality } from "./types";

export function QualityNote({ quality }: { quality?: RouteQuality }) {
  if (!quality) return null;
  const warning = quality.status === "warning";
  const single = quality.status === "single";
  return <p className={"mt-2 flex items-start gap-1.5 text-xs leading-relaxed " + (warning ? "text-amber-800" : single ? "text-brand-muted" : "text-teal-800")}>
    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{quality.message}</span>
  </p>;
}

type RouteCardProps = {
  title: string;
  accent: "blue" | "emerald";
  trip: Trip;
  toll?: TollView;
  tollPeriod: TollPeriod;
  onTollPeriodChange: (period: TollPeriod) => void;
  manualToll?: string;
  onManualToll?: (value: string) => void;
  onCopy: () => void;
  copied: boolean;
};

export function RouteCard({
  title, accent, trip, toll, tollPeriod, onTollPeriodChange,
  manualToll, onManualToll, onCopy, copied,
}: RouteCardProps) {
  const isUnknown = toll?.pricingStatus === "unknown";
  const hasManualToll = manualToll != null && manualToll.trim() !== "";
  const selectedAmount = resolveTollAmount(toll, tollPeriod, manualToll);
  const weekdayAmount = resolveTollAmount(toll, "weekday");
  const weekendAmount = resolveTollAmount(toll, "weekend");
  const tollLabel = (amount: typeof weekdayAmount) => amount.amount === null ? "сумма неизвестна" : "+ " + money(amount.amount);
  return (
    <article className={"min-w-0 w-full rounded-[24px] border bg-brand-surface p-4 shadow-[0_12px_32px_rgba(16,42,67,.07)] " + (accent === "blue" ? "border-brand-action/35" : "border-brand-route/40")}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-black text-brand-text">{title}</h3>
        <span className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold " + (accent === "blue" ? "bg-brand-subtle text-brand-action" : "bg-brand-route/15 text-brand-text")}>{accent === "blue" ? "Маршрут" : "Без оплаты дорог"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-brand-text"><Route className="h-4 w-4 text-brand-action" />{distance(trip.meters)}</span>
        <span className="flex items-center gap-1.5 font-semibold text-brand-text"><Clock3 className="h-4 w-4 text-brand-action" />{duration(trip.seconds)}</span>
      </div>
      <QualityNote quality={trip.quality} />
      <PriceRows trip={trip} toll={toll} period={tollPeriod} manualToll={manualToll} />
      {toll && toll.pricingStatus !== "free" && (
        <div className="mt-3 rounded-2xl border border-brand-route/35 bg-brand-route/10 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-brand-text">День поездки</span>
            {hasManualToll && <span className="text-xs font-bold text-brand-action">В расчёте учтена ручная сумма</span>}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={tollPeriod === "weekday"} onClick={() => onTollPeriodChange("weekday")} className={"min-h-12 rounded-xl border px-2 py-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-brand-focus " + (tollPeriod === "weekday" ? "border-brand-action bg-brand-action text-white" : "border-brand-border/20 bg-brand-surface text-brand-text hover:bg-brand-subtle")}>
              <span className="block text-xs font-bold">Пн–Чт</span><strong className="block text-sm">{tollLabel(weekdayAmount)}</strong>
            </button>
            <button type="button" aria-pressed={tollPeriod === "weekend"} onClick={() => onTollPeriodChange("weekend")} className={"min-h-12 rounded-xl border px-2 py-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-brand-focus " + (tollPeriod === "weekend" ? "border-brand-action bg-brand-action text-white" : "border-brand-border/20 bg-brand-surface text-brand-text hover:bg-brand-subtle")}>
              <span className="block text-xs font-bold">Пт–Вс</span><strong className="block text-sm">{tollLabel(weekendAmount)}</strong>
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-brand-muted">{hasManualToll ? "Используется введённая вручную сумма; она не подтверждена провайдером. Тарифы могут измениться." : isUnknown ? "Платность или полная стоимость маршрута не подтверждена. Итог с дорогами не рассчитан." : "Оценка для легкового автомобиля без транспондера. Тарифы могут измениться, уточняйте перед поездкой."}</p>
          {onManualToll && <label className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-text">Уточнить сумму дорог для этого маршрута:<input aria-label="Стоимость платных дорог вручную" type="number" min="0" step="1" value={manualToll ?? ""} placeholder={selectedAmount.amount === null ? "" : String(selectedAmount.amount)} onChange={(event) => onManualToll(event.target.value === "" ? "" : String(clampNumber(Number(event.target.value), 0, 100000, 0)))} className="h-10 w-32 rounded-xl border border-brand-border/20 bg-brand-surface px-2 text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-focus" /> ₽</label>}
        </div>
      )}
      <button type="button" onClick={onCopy} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand-border/20 bg-brand-page text-sm font-extrabold text-brand-text transition hover:border-brand-action/50 hover:bg-brand-subtle">{copied ? <><Check className="h-4 w-4" />Скопировано</> : <><Clipboard className="h-4 w-4" />Скопировать результат</>}</button>
    </article>
  );
}
