"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Car, Clock3, LoaderCircle, MapPin, Percent, Route, Settings2, ShieldCheck } from "lucide-react";

type Place = { label: string; position?: { lat: number; lng: number } };
type Suggestion = Place & { id: string; title: string; region: string };
type Trip = { meters: number; seconds: number };
type Leg = { from: string; to: string; fast: Trip & { tolls: { amount: number; period: string; segments: string[] } }; free: Trip | null; freeError?: string };
type Result = { legs: Leg[] };

const defaults = { standard: 25, comfort: 30, comfortPlus: 35, minivan: 50 };
const tariffNames: Record<keyof typeof defaults, string> = { standard: "Стандарт", comfort: "Комфорт", comfortPlus: "Комфорт+", minivan: "Минивэн" };

function money(value: number) { return `${Math.round(value).toLocaleString("ru-RU")} ₽`; }
function distance(meters: number) { return `${(meters / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} км`; }
function duration(seconds: number) { const minutes = Math.round(seconds / 60); return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`; }

function AddressField({ label, value, onChange, placeholder }: { label: string; value: Place; onChange: (place: Place) => void; placeholder: string }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (value.position || value.label.trim().length < 3) return;
    const timer = setTimeout(async () => {
      try { const response = await fetch(`/api/suggest?q=${encodeURIComponent(value.label)}`); const data = await response.json(); setItems(data.items ?? []); setOpen(true); } catch { setItems([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);
  return <label className="relative block min-w-0">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[.14em] text-slate-400">{label}</span>
    <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-400"/><input className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/75 pl-10 pr-3 text-[16px] text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" value={value.label} placeholder={placeholder} autoComplete="off" onChange={(e) => { onChange({ label: e.target.value }); setItems([]); setOpen(true); }} onFocus={() => setOpen(true)}/></div>
    {open && items.length > 0 && <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">{items.map((item) => <button type="button" key={item.id} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-800" onClick={() => { onChange({ label: item.label, position: item.position }); setOpen(false); }}><strong className="block text-sm text-white">{item.title}</strong><span className="block truncate text-xs text-slate-400">{item.label}</span></button>)}</div>}
  </label>;
}

function TariffInputs({ rates, setRates }: { rates: typeof defaults; setRates: (rates: typeof defaults) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <label key={key} className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="block text-xs font-semibold text-slate-300">{tariffNames[key]}</span><span className="mt-1 flex items-center gap-1"><input aria-label={`Цена ${tariffNames[key]}`} type="number" min="1" max="10000" value={rates[key]} onChange={(e) => setRates({ ...rates, [key]: Math.max(1, Number(e.target.value) || 1) })} className="w-full bg-transparent text-lg font-black text-white outline-none"/><span className="text-xs text-slate-500">₽/км</span></span></label>)}</div>;
}

function PriceRows({ meters, rates, multiplier }: { meters: number; rates: typeof defaults; multiplier: number }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <div key={key} className="rounded-xl bg-slate-950/60 px-3 py-2"><span className="block text-xs text-slate-400">{tariffNames[key]}</span><strong className="text-base text-white">{money(meters / 1000 * rates[key] * multiplier)}</strong></div>)}</div>;
}

function RouteCard({ title, accent, trip, rates, multiplier, toll, manualToll, onManualToll }: { title: string; accent: "blue" | "emerald"; trip: Trip; rates: typeof defaults; multiplier: number; toll?: Leg["fast"]["tolls"]; manualToll?: string; onManualToll?: (value: string) => void }) {
  const tollAmount = manualToll === "" || manualToll == null ? toll?.amount ?? 0 : Number(manualToll) || 0;
  return <article className={`rounded-2xl border bg-slate-900/80 p-4 shadow-xl ${accent === "blue" ? "border-blue-500/45" : "border-emerald-500/40"}`}>
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">{title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent === "blue" ? "bg-blue-500/15 text-blue-300" : "bg-emerald-500/15 text-emerald-300"}`}>{accent === "blue" ? "Быстрее" : "Без оплаты дорог"}</span></div>
    <div className="mt-3 flex gap-5 text-sm"><span className="flex items-center gap-1.5 text-slate-300"><Route className="h-4 w-4"/>{distance(trip.meters)}</span><span className="flex items-center gap-1.5 text-slate-300"><Clock3 className="h-4 w-4"/>{duration(trip.seconds)}</span></div>
    <PriceRows meters={trip.meters} rates={rates} multiplier={multiplier}/>
    {toll && <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-amber-100">Платная дорога</span><strong className="text-amber-300">{tollAmount > 0 ? `+ ${money(tollAmount)}` : "Стоимость не определена"}</strong></div><p className="mt-1 text-xs text-amber-100/65">{tollAmount > 0 ? "Ориентировочно, легковой автомобиль без транспондера. В стоимость поездки не включено." : "Встроенный справочник пока не содержит этот участок. Укажите известную стоимость вручную."}</p><label className="mt-2 flex items-center gap-2 text-xs text-slate-300">Уточнить вручную:<input type="number" min="0" value={manualToll} placeholder={toll.amount > 0 ? String(toll.amount) : "Сумма"} onChange={(e) => onManualToll?.(e.target.value)} className="h-8 w-24 rounded-lg border border-slate-600 bg-slate-950 px-2 text-white outline-none"/> ₽</label></div>}
  </article>;
}

function RouteUnavailable({ message }: { message?: string }) {
  return <article className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-4 shadow-xl">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">Без платных дорог</h3><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Нет данных</span></div>
    <p className="mt-3 text-sm leading-relaxed text-slate-300">{message ?? "Маршрут временно недоступен. Повторите расчёт позже."}</p>
    <p className="mt-2 text-xs text-slate-500">Расчёт по платной дороге выше остаётся действительным.</p>
  </article>;
}

export default function V2Page() {
  const [mode, setMode] = useState<"standard" | "dual">("standard");
  const [from, setFrom] = useState<Place>({ label: "" }); const [via, setVia] = useState<Place>({ label: "" }); const [to, setTo] = useState<Place>({ label: "" });
  const [rates, setRates] = useState(() => { if (typeof window === "undefined") return defaults; try { const saved = localStorage.getItem("mezhgorod-v2-rates"); return saved ? { ...defaults, ...JSON.parse(saved) } : defaults; } catch { return defaults; } }); const [rate1, setRate1] = useState(25); const [rate2, setRate2] = useState(35);
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(20);
  const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [manualToll, setManualToll] = useState("");
  useEffect(() => { localStorage.setItem("mezhgorod-v2-rates", JSON.stringify(rates)); }, [rates]);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const dualTotals = useMemo(() => result?.legs.map((leg) => ({ fast: leg.fast.meters / 1000, free: leg.free ? leg.free.meters / 1000 : null })) ?? [], [result]);
  async function calculate() { setError(""); setResult(null); setLoading(true); setManualToll(""); try { const response = await fetch("/api/v2/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, from, via, to, departureAt: new Date().toISOString() }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); } catch (e) { setError(e instanceof Error ? e.message : "Не удалось выполнить расчёт"); } finally { setLoading(false); } }

  return <main className="min-h-screen bg-[#070b14] text-slate-100">
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-4 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-900/30"><Car className="h-6 w-6"/></div><div><h1 className="text-xl font-black sm:text-2xl">Межгород Calc <span className="text-blue-400">2.0</span></h1><p className="text-xs text-slate-400">Честный расчёт двух вариантов маршрута</p></div></header>
      <section className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-3 shadow-2xl backdrop-blur sm:p-5">
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-950 p-1"><button onClick={() => { setMode("standard"); setResult(null); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "standard" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Обычный расчёт</button><button onClick={() => { setMode("dual"); setResult(null); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "dual" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Двойная тарификация</button></div>
        <div className={`grid gap-3 ${mode === "dual" ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}><AddressField label="Точка A" value={from} onChange={setFrom} placeholder="Откуда"/>{mode === "dual" && <AddressField label="Промежуточная точка" value={via} onChange={setVia} placeholder="Граница тарифа"/>}<AddressField label="Точка B" value={to} onChange={setTo} placeholder="Куда"/></div>
        <div className="mt-4 border-t border-slate-800 pt-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><Settings2 className="h-4 w-4 text-blue-400"/>{mode === "standard" ? "Тарифы" : "Тарифы участков"}</div>{mode === "standard" ? <TariffInputs rates={rates} setRates={setRates}/> : <div className="grid grid-cols-2 gap-2"><label className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="text-xs text-slate-400">A → промежуточная</span><span className="mt-1 flex"><input type="number" value={rate1} onChange={(e) => setRate1(Number(e.target.value) || 1)} className="w-full bg-transparent text-lg font-black outline-none"/><small>₽/км</small></span></label><label className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="text-xs text-slate-400">Промежуточная → B</span><span className="mt-1 flex"><input type="number" value={rate2} onChange={(e) => setRate2(Number(e.target.value) || 1)} className="w-full bg-transparent text-lg font-black outline-none"/><small>₽/км</small></span></label></div>}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/65 p-3"><button type="button" role="switch" aria-checked={urgent} onClick={() => setUrgent(!urgent)} className={`relative h-7 w-12 rounded-full transition ${urgent ? "bg-orange-500" : "bg-slate-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${urgent ? "left-6" : "left-1"}`}/></button><span className="text-sm font-bold">Срочная поездка</span>{urgent && <label className="ml-auto flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2"><Percent className="h-4 w-4 text-orange-400"/><input aria-label="Наценка за срочность" type="number" min="0" max="500" value={urgentPercent} onChange={(e) => setUrgentPercent(Number(e.target.value) || 0)} className="h-9 w-14 bg-transparent text-right font-bold outline-none"/><span className="text-sm text-slate-400">%</span></label>}</div>
        <button onClick={calculate} disabled={loading} className="mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-black text-white shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:opacity-60">{loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Calculator className="h-5 w-5"/>}{loading ? "Строим два маршрута…" : "Рассчитать поездку"}</button>
        {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      </section>

      {result && mode === "standard" && <section className="mt-4 grid gap-3 md:grid-cols-2"><RouteCard title="По платной дороге" accent="blue" trip={result.legs[0].fast} rates={rates} multiplier={multiplier} toll={result.legs[0].fast.tolls} manualToll={manualToll} onManualToll={setManualToll}/>{result.legs[0].free ? <RouteCard title="Без платных дорог" accent="emerald" trip={result.legs[0].free} rates={rates} multiplier={multiplier}/> : <RouteUnavailable message={result.legs[0].freeError}/>}</section>}
      {result && mode === "dual" && <section className="mt-4 space-y-3"><div className="grid gap-3 md:grid-cols-2">{(["fast", "free"] as const).map((variant) => { const fast = variant === "fast"; const available = fast || result.legs.every((leg) => leg.free); if (!available) return <RouteUnavailable key={variant} message={result.legs.find((leg) => !leg.free)?.freeError}/>; const first = dualTotals[0]?.[variant] ?? 0; const second = dualTotals[1]?.[variant] ?? 0; const total = (first * rate1 + second * rate2) * multiplier; const toll = result.legs.reduce((sum, leg) => sum + (fast ? leg.fast.tolls.amount : 0), 0); return <article key={variant} className={`rounded-2xl border bg-slate-900/80 p-4 ${fast ? "border-blue-500/45" : "border-emerald-500/40"}`}><div className="flex items-center justify-between"><h3 className="font-black">{fast ? "По платной дороге" : "Без платных дорог"}</h3><Route className={`h-5 w-5 ${fast ? "text-blue-400" : "text-emerald-400"}`}/></div>{result.legs.map((leg, index) => { const trip = fast ? leg.fast : leg.free!; const rate = index === 0 ? rate1 : rate2; return <div key={index} className="mt-3 rounded-xl bg-slate-950/60 p-3"><p className="truncate text-xs text-slate-400">Участок {index + 1}: {leg.from} → {leg.to}</p><div className="mt-1 flex items-end justify-between gap-3"><span className="text-sm">{distance(trip.meters)} · {duration(trip.seconds)}</span><strong>{money(trip.meters / 1000 * rate * multiplier)}</strong></div></div>})}<div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3"><span className="font-bold">Итого</span><strong className="text-xl text-blue-300">{money(total)}</strong></div>{fast && toll > 0 && <p className="mt-1 text-right text-xs text-amber-300">+ {money(toll)} платная дорога, ориентировочно</p>}</article> })}</div></section>}
      <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-slate-500"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>Расчёт справочный. Фактический маршрут и тарифы операторов дорог могут измениться.</p></footer>
    </div>
  </main>;
}
