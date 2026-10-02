"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Clipboard, Clock3, HeartHandshake, MapPin, MessageSquareText, Route, Send, ShieldCheck, X } from "lucide-react";

type Place = { label: string; position?: { lat: number; lng: number } };
type Suggestion = Place & { id: string; title: string; region: string };
type RouteQuality = { status: "verified" | "single" | "warning"; providers: string[]; distanceSpreadPercent: number | null; message: string };
type TollValidationView = { status: "toll" | "free" | "unknown"; message?: string };
type Trip = { meters: number; seconds: number; quality?: RouteQuality; tollValidation?: TollValidationView };
type TollView = { amount: number | null; weekdayAmount: number | null; weekendAmount: number | null; period: string; segments: string[]; confidence: "matched" | "none"; pricingStatus: "priced" | "free" | "unknown" };
type Leg = {
  from: string;
  to: string;
  fast: Trip & { tolls: TollView };
  free: Trip | null;
  freeCandidate?: Trip | null;
  freeError?: string;
};
type Result = { legs: Leg[] };

const defaults = { standard: 25, comfort: 30, comfortPlus: 35, minivan: 50 };
const tariffNames: Record<keyof typeof defaults, string> = { standard: "Стандарт", comfort: "Комфорт", comfortPlus: "Комфорт+", minivan: "Минивэн" };

function clampNumber(value: number, min: number, max: number, fallback: number) { return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback; }
function money(value: number) { return `${Math.round(value).toLocaleString("ru-RU")} ₽`; }
function distance(meters: number) { return `${(meters / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} км`; }
function duration(seconds: number) { const minutes = Math.round(seconds / 60); return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`; }

function AddressField({ label, value, onChange, placeholder }: { label: string; value: Place; onChange: (place: Place) => void; placeholder: string }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (value.position || value.label.trim().length < 3) return;
    const timer = setTimeout(async () => {
      try { const response = await fetch(`/api/suggest?q=${encodeURIComponent(value.label)}`); const data = await response.json(); setItems(data.items ?? []); setOpen(true); } catch { setItems([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);
  return <label className="relative block min-w-0">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[.14em] text-slate-400">{label}</span>
    <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-400"/><input ref={inputRef} maxLength={200} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/75 pl-10 pr-12 text-[16px] text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={value.label} placeholder={placeholder} autoComplete="off" onChange={(e) => { onChange({ label: e.target.value }); setItems([]); setOpen(true); }} onFocus={() => setOpen(true)}/>{value.label && <button type="button" aria-label={`Очистить поле «${label}»`} onClick={() => { onChange({ label: "" }); setItems([]); setOpen(false); requestAnimationFrame(() => inputRef.current?.focus()); }} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-4.5 w-4.5"/></button>}</div>
    {open && items.length > 0 && <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">{items.map((item) => <button type="button" key={item.id} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-800" onClick={() => { onChange({ label: item.label, position: item.position }); setOpen(false); }}><strong className="block text-sm text-white">{item.title}</strong><span className="block truncate text-xs text-slate-400">{item.label}</span></button>)}</div>}
  </label>;
}

export function TariffInputs({ rates, setRates }: { rates: typeof defaults; setRates: (rates: typeof defaults) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <label key={key} className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="block text-xs font-semibold text-slate-300">{tariffNames[key]}</span><span className="mt-1 flex items-center gap-1"><input aria-label={`Цена ${tariffNames[key]}`} type="number" min="1" max="10000" value={rates[key]} onChange={(e) => setRates({ ...rates, [key]: clampNumber(Number(e.target.value), 1, 10000, 1) })} className="w-full bg-transparent text-lg font-black text-white outline-none"/><span className="text-xs text-slate-500">₽/км</span></span></label>)}</div>;
}

export function PriceRows({ meters, rates, multiplier }: { meters: number; rates: typeof defaults; multiplier: number }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <div key={key} className="rounded-xl bg-slate-950/60 px-3 py-2"><span className="block text-xs text-slate-400">{tariffNames[key]}</span><strong className="text-base text-white">{money(meters / 1000 * rates[key] * multiplier)}</strong></div>)}</div>;
}

export function QualityNote({ quality }: { quality?: RouteQuality }) {
  if (!quality) return null;
  const warning = quality.status === "warning";
  const single = quality.status === "single";
  return <p className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${warning ? "text-amber-300" : single ? "text-slate-400" : "text-emerald-300"}`}>
    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/>
    <span>{quality.message}</span>
  </p>;
}

export function RouteCard({ title, accent, trip, rates, multiplier, toll, manualToll, onManualToll, onCopy, copied }: { title: string; accent: "blue" | "emerald"; trip: Trip; rates: typeof defaults; multiplier: number; toll?: TollView; manualToll?: string; onManualToll?: (value: string) => void; onCopy: () => void; copied: boolean }) {
  const tollAmount = manualToll === "" || manualToll == null ? toll?.amount ?? 0 : clampNumber(Number(manualToll), 0, 100000, 0);
  return <article className={`rounded-2xl border bg-slate-900/80 p-4 shadow-xl ${accent === "blue" ? "border-blue-500/45" : "border-emerald-500/40"}`}>
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">{title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent === "blue" ? "bg-blue-500/15 text-blue-300" : "bg-emerald-500/15 text-emerald-300"}`}>{accent === "blue" ? "Быстрее" : "Без оплаты дорог"}</span></div>
    <div className="mt-3 flex gap-5 text-sm"><span className="flex items-center gap-1.5 text-slate-300"><Route className="h-4 w-4"/>{distance(trip.meters)}</span><span className="flex items-center gap-1.5 text-slate-300"><Clock3 className="h-4 w-4"/>{duration(trip.seconds)}</span></div>
    <QualityNote quality={trip.quality}/>
    <PriceRows meters={trip.meters} rates={rates} multiplier={multiplier}/>
    {toll && <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-amber-900 dark:text-amber-100">{toll.pricingStatus === "unknown" ? "Платность / стоимость не подтверждена" : "Платная дорога"}</span>{manualToll !== "" ? <strong className="text-amber-700 dark:text-amber-300">+ {money(tollAmount)}</strong> : toll.weekdayAmount !== toll.weekendAmount ? <div className="text-right text-xs"><strong className="block text-amber-700 dark:text-amber-300">Пн–Чт: + {money(toll.weekdayAmount ?? 0)}</strong><strong className="mt-0.5 block text-amber-700 dark:text-amber-300">Пт–Вс: + {money(toll.weekendAmount ?? 0)}</strong></div> : <strong className="text-amber-700 dark:text-amber-300">{tollAmount > 0 ? `+ ${money(tollAmount)}` : "Стоимость не определена"}</strong>}</div><p className="mt-1 text-xs text-amber-900/70 dark:text-amber-100/65">{toll.pricingStatus === "unknown" ? "Не удалось полностью подтвердить платность и/или стоимость всего маршрута. Не считайте 0 ₽ подтверждённым отсутствием платных дорог." : tollAmount > 0 ? "Ориентировочно, легковой автомобиль без транспондера. В стоимость поездки не включено." : "Встроенный справочник пока не содержит этот участок. Укажите известную стоимость вручную."}</p><label className="mt-2 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">Уточнить вручную:<input type="number" min="0" value={manualToll} placeholder={(toll.amount ?? 0) > 0 ? String(toll.amount) : "Сумма"} onChange={(e) => onManualToll?.(e.target.value === "" ? "" : String(clampNumber(Number(e.target.value), 0, 100000, 0)))} className="h-8 w-24 rounded-lg border border-slate-400 bg-white px-2 text-slate-950 outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-white"/> ₽</label></div>}
    <button type="button" onClick={onCopy} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-white transition hover:border-blue-500 hover:bg-slate-900">{copied ? <><Check className="h-4 w-4"/>Скопировано</> : <><Clipboard className="h-4 w-4"/>Скопировать результат</>}</button>
  </article>;
}

export function UnverifiedRouteCard({ trip, rates, multiplier, onCopy, copied }: { trip: Trip; rates: typeof defaults; multiplier: number; onCopy: () => void; copied: boolean }) {
  return <article className="rounded-2xl border border-amber-500/40 bg-slate-900/80 p-4 shadow-xl">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">Альтернативный маршрут</h3><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Платность не подтверждена</span></div>
    <div className="mt-3 flex gap-5 text-sm"><span className="flex items-center gap-1.5 text-slate-300"><Route className="h-4 w-4"/>{distance(trip.meters)}</span><span className="flex items-center gap-1.5 text-slate-300"><Clock3 className="h-4 w-4"/>{duration(trip.seconds)}</span></div>
    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-300"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span>{trip.tollValidation?.message ?? trip.quality?.message ?? "Независимая проверка не завершена. Маршрут нельзя считать подтверждённо бесплатным."}</span></p>
    <PriceRows meters={trip.meters} rates={rates} multiplier={multiplier}/>
    <p className="mt-2 text-xs text-slate-500">Расчёт тарифа показан только по расстоянию. Возможная стоимость платных дорог не включена и требует отдельной проверки.</p>
    <button type="button" onClick={onCopy} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-slate-950/70 text-sm font-bold text-white transition hover:bg-slate-900">{copied ? <><Check className="h-4 w-4"/>Скопировано</> : <><Clipboard className="h-4 w-4"/>Скопировать с предупреждением</>}</button>
  </article>;
}

export function FeedbackForm() {
  const [category, setCategory] = useState("Улучшение калькулятора");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); if (message.trim().length < 10) { setStatus("error"); return; } setStatus("sending"); try { const response = await fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feedback", category: `[2.0] ${category}`, message, website: "" }) }); if (!response.ok) throw new Error(); setMessage(""); setStatus("sent"); } catch { setStatus("error"); } }
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4"><MessageSquareText className="h-5 w-5 text-blue-400"/><h2 className="mt-3 text-lg font-black text-white">Предложить улучшение</h2><p className="mt-1 text-sm text-slate-400">Напишите, чего не хватает калькулятору.</p><form onSubmit={submit} className="mt-4 space-y-3"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"><option>Улучшение калькулятора</option><option>Новая функция</option><option>Сообщить об ошибке</option><option>Другое</option></select><textarea value={message} onChange={(e) => { setMessage(e.target.value); setStatus("idle"); }} minLength={10} maxLength={1000} required rows={4} placeholder="Ваше предложение…" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 text-[16px] text-white outline-none focus:border-blue-500"/>{status === "sent" && <p className="text-sm font-bold text-emerald-400">Спасибо! Предложение сохранено.</p>}{status === "error" && <p className="text-sm font-bold text-red-400">Введите не менее 10 символов или попробуйте позже.</p>}<button disabled={status === "sending"} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white"><Send className="h-4 w-4"/>{status === "sending" ? "Отправляем…" : "Отправить идею"}</button></form></section>;
}

export function DonationCard() {
  return <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/35 p-4"><HeartHandshake className="h-5 w-5 text-emerald-400"/><h2 className="mt-3 text-lg font-black text-white">Сбор на API Яндекс Карт</h2><p className="mt-1 text-sm leading-relaxed text-slate-300">Подключение API Яндекс Карт позволит дополнительно сверять геометрию и расстояния маршрутов и повышать точность расчётов. Стоимость платных дорог по-прежнему требует проверки по действующим тарифам и контрольным маршрутам.</p><a href="https://t.tb.ru/pm_short/4YCKLToUeM6" target="_blank" rel="noopener noreferrer" className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-black text-emerald-950 transition hover:bg-emerald-400"><HeartHandshake className="h-4 w-4"/>Поддержать подключение</a><p className="mt-2 text-center text-xs text-slate-500">Перевод откроется на защищённой странице Т‑Банка.</p></section>;
}

export function RouteUnavailable({ message }: { message?: string }) {
  return <article className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">Маршрут без платных дорог</h3><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Не подтверждён</span></div>
    <p className="mt-3 text-sm leading-relaxed text-slate-300">{message ?? "Маршрут временно недоступен. Повторите расчёт позже."}</p>
    <p className="mt-2 text-xs text-slate-500">Расчёт по быстрому маршруту выше остаётся действительным.</p>
  </article>;
}

export function DualUnverifiedNotice({ result }: { result: Result }) {
  const candidates = result.legs.map((leg, index) => ({ leg, index, candidate: leg.freeCandidate })).filter((item) => Boolean(item.candidate));
  if (candidates.length === 0) return null;
  return <article className="rounded-2xl border border-amber-500/35 bg-amber-500/5 p-4">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">Непроверенные альтернативы</h3><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Не входят в итог</span></div>
    <p className="mt-2 text-sm text-slate-300">По этим участкам маршрутизатор предложил обход, но независимая проверка не доказала отсутствие платных дорог.</p>
    <div className="mt-3 space-y-2">{candidates.map(({ leg, index, candidate }) => <div key={index} className="rounded-xl bg-slate-950/55 p-3"><p className="text-xs text-slate-400">Участок {index + 1}: {leg.from} → {leg.to}</p><p className="mt-1 text-sm text-white">{distance(candidate!.meters)} · {duration(candidate!.seconds)}</p><p className="mt-1 text-xs text-amber-300">{candidate!.tollValidation?.message ?? "Платность не подтверждена"}</p></div>)}</div>
  </article>;
}

