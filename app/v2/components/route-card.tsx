"use client";

import { Check, Clipboard, Clock3, Route, ShieldCheck } from "lucide-react";
import { PriceRows, PricingBreakdown } from "./pricing-fields";
import { clampNumber, duration, distance, money } from "./format";
import type { TollView, Trip, RouteQuality } from "./types";

export function QualityNote({ quality }: { quality?: RouteQuality }) {
  if (!quality) return null;
  const warning = quality.status === "warning";
  const single = quality.status === "single";
  return <p className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${warning ? "text-amber-300" : single ? "text-slate-400" : "text-emerald-300"}`}>
    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/>
    <span>{quality.message}</span>
  </p>;
}

export function RouteCard({ title, accent, trip, toll, manualToll, onManualToll, onCopy, copied }: { title: string; accent: "blue" | "emerald"; trip: Trip; toll?: TollView; manualToll?: string; onManualToll?: (value: string) => void; onCopy: () => void; copied: boolean }) {
  const hasManualToll = manualToll != null && manualToll !== "";
  const tollAmount = manualToll === "" || manualToll == null ? toll?.amount ?? 0 : clampNumber(Number(manualToll), 0, 100000, 0);
  return <article className={`rounded-2xl border bg-slate-900/80 p-4 shadow-xl ${accent === "blue" ? "border-blue-500/45" : "border-emerald-500/40"}`}>
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">{title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent === "blue" ? "bg-blue-500/15 text-blue-300" : "bg-emerald-500/15 text-emerald-300"}`}>{accent === "blue" ? "Маршрут" : "Без оплаты дорог"}</span></div>
    <div className="mt-3 flex gap-5 text-sm"><span className="flex items-center gap-1.5 text-slate-300"><Route className="h-4 w-4"/>{distance(trip.meters)}</span><span className="flex items-center gap-1.5 text-slate-300"><Clock3 className="h-4 w-4"/>{duration(trip.seconds)}</span></div>
    <QualityNote quality={trip.quality}/>
    <PriceRows trip={trip}/>
    <PricingBreakdown trip={trip}/>
    {toll && toll.pricingStatus !== "free" && <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-amber-900 dark:text-amber-100">{toll.pricingStatus === "unknown" ? "Платность / стоимость не подтверждена" : "Платная дорога"}</span>{hasManualToll ? <strong className="text-amber-700 dark:text-amber-300">+ {money(tollAmount)}</strong> : toll.weekdayAmount !== toll.weekendAmount ? <div className="text-right text-xs"><strong className="block text-amber-700 dark:text-amber-300">Пн–Чт: + {money(toll.weekdayAmount ?? 0)}</strong><strong className="mt-0.5 block text-amber-700 dark:text-amber-300">Пт–Вс: + {money(toll.weekendAmount ?? 0)}</strong></div> : <strong className="text-amber-700 dark:text-amber-300">{tollAmount > 0 ? `+ ${money(tollAmount)}` : "Стоимость не определена"}</strong>}</div><p className="mt-1 text-xs text-amber-900/70 dark:text-amber-100/65">{toll.pricingStatus === "unknown" ? "Не удалось полностью подтвердить платность и/или стоимость всего маршрута. Не считайте 0 ₽ подтверждённым отсутствием платных дорог." : tollAmount > 0 ? "Ориентировочно, легковой автомобиль без транспондера. В стоимость поездки не включено." : "Встроенный справочник пока не содержит этот участок. Укажите известную стоимость вручную."}</p>{onManualToll && <label className="mt-2 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">Уточнить вручную:<input type="number" min="0" value={manualToll} placeholder={(toll.amount ?? 0) > 0 ? String(toll.amount) : "Сумма"} onChange={(e) => onManualToll?.(e.target.value === "" ? "" : String(clampNumber(Number(e.target.value), 0, 100000, 0)))} className="h-8 w-24 rounded-lg border border-slate-400 bg-white px-2 text-slate-950 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"/> ₽</label>}</div>}
    <button type="button" onClick={onCopy} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-white transition hover:border-blue-500 hover:bg-slate-900">{copied ? <><Check className="h-4 w-4"/>Скопировано</> : <><Clipboard className="h-4 w-4"/>Скопировать результат</>}</button>
  </article>;
}
