"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Car, CheckCircle2, Clock3, Database, ExternalLink, LoaderCircle, MapPin, Percent, Route, Send, Settings2, ShieldCheck, X } from "lucide-react";

type Place = { label: string; position?: { lat: number; lng: number } };
type Suggestion = Place & { id: string; title: string; region: string };
type Trip = { meters: number; seconds: number };
type VerifiedLeg = { status: "verified"; from: string; to: string; fast: Trip; free: Trip; tollRub: number; source: string; verifiedAt: string; accuracyPercent: number };
type MissingLeg = { status: "missing"; from: string; to: string; reason: string };
type Leg = VerifiedLeg | MissingLeg;
type Result = { legs: Leg[]; verifiedRouteCount: number; tolerancePercent: number };

const defaults = { standard: 25, comfort: 30, comfortPlus: 35, minivan: 50 };
const tariffNames: Record<keyof typeof defaults, string> = { standard: "Стандарт", comfort: "Комфорт", comfortPlus: "Комфорт+", minivan: "Минивэн" };

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
    <div className="relative"><MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-violet-400"/><input ref={inputRef} className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950/75 pl-10 pr-12 text-[16px] text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" value={value.label} placeholder={placeholder} autoComplete="off" onChange={(event) => { onChange({ label: event.target.value }); setItems([]); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 160)}/>{value.label && <button type="button" aria-label={`Очистить поле «${label}»`} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange({ label: "" }); setItems([]); setOpen(false); requestAnimationFrame(() => inputRef.current?.focus()); }} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-4.5 w-4.5"/></button>}</div>
    {open && items.length > 0 && <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">{items.map((item) => <button type="button" key={item.id} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-800" onMouseDown={() => { onChange({ label: item.label, position: item.position }); setOpen(false); }}><strong className="block text-sm text-white">{item.title}</strong><span className="block truncate text-xs text-slate-400">{item.label}</span></button>)}</div>}
  </label>;
}

function TariffInputs({ rates, setRates }: { rates: typeof defaults; setRates: (rates: typeof defaults) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <label key={key} className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="block text-xs font-semibold text-slate-300">{tariffNames[key]}</span><span className="mt-1 flex items-center gap-1"><input aria-label={`Цена ${tariffNames[key]}`} type="number" min="1" max="10000" value={rates[key]} onChange={(event) => setRates({ ...rates, [key]: Math.max(1, Number(event.target.value) || 1) })} className="w-full bg-transparent text-lg font-black text-white outline-none"/><span className="text-xs text-slate-500">₽/км</span></span></label>)}</div>;
}

function PriceRows({ meters, rates, multiplier }: { meters: number; rates: typeof defaults; multiplier: number }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <div key={key} className="rounded-xl bg-slate-950/60 px-3 py-2"><span className="block text-xs text-slate-400">{tariffNames[key]}</span><strong className="text-base text-white">{money(meters / 1000 * rates[key] * multiplier)}</strong></div>)}</div>;
}

function RouteCard({ title, accent, trip, rates, multiplier, tollRub, source, accuracyPercent }: { title: string; accent: "violet" | "emerald"; trip: Trip; rates: typeof defaults; multiplier: number; tollRub?: number; source: string; accuracyPercent: number }) {
  return <article className={`rounded-2xl border bg-slate-900/80 p-4 shadow-xl ${accent === "violet" ? "border-violet-500/45" : "border-emerald-500/40"}`}>
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">{title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent === "violet" ? "bg-violet-500/15 text-violet-300" : "bg-emerald-500/15 text-emerald-300"}`}>{accent === "violet" ? "Быстрее" : "Без оплаты дорог"}</span></div>
    <div className="mt-3 flex gap-5 text-sm"><span className="flex items-center gap-1.5 text-slate-300"><Route className="h-4 w-4"/>{distance(trip.meters)}</span><span className="flex items-center gap-1.5 text-slate-300"><Clock3 className="h-4 w-4"/>{duration(trip.seconds)}</span></div>
    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-emerald-300"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0"/><span>Сверено: {source}. Отклонение не более {Math.max(accuracyPercent, 3)}%</span></p>
    <PriceRows meters={trip.meters} rates={rates} multiplier={multiplier}/>
    {tollRub != null && <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm"><span className="text-amber-100">Платная дорога отдельно</span><strong className="text-amber-300">+ {money(tollRub)}</strong></div>}
  </article>;
}

function CorrectionForm({ leg }: { leg: MissingLeg }) {
  const [fastKm, setFastKm] = useState(""); const [fastTime, setFastTime] = useState(""); const [freeKm, setFreeKm] = useState(""); const [freeTime, setFreeTime] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const yandexUrl = `https://yandex.ru/maps/?rtext=${encodeURIComponent(leg.from)}~${encodeURIComponent(leg.to)}&rtt=auto`;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setStatus("sending");
    const message = [`Маршрут 3.0: ${leg.from} → ${leg.to}`, `Быстрый: ${fastKm || "—"} км, ${fastTime || "—"} мин`, `Без платных дорог: ${freeKm || "—"} км, ${freeTime || "—"} мин`].join("\n");
    try { const response = await fetch("/api/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "feedback", category: "Проверка маршрута 3.0", message }) }); if (!response.ok) throw new Error(); setStatus("sent"); } catch { setStatus("error"); }
  }
  return <article className="rounded-2xl border border-amber-500/35 bg-amber-500/8 p-4">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-white">{leg.from} → {leg.to}</h3><p className="mt-1 text-sm text-amber-100/80">{leg.reason}</p></div><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Нужна сверка</span></div>
    <a href={yandexUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-400/45 bg-violet-500/10 px-3 text-sm font-bold text-violet-200 transition hover:bg-violet-500/20">Сверить в Яндекс Картах<ExternalLink className="h-4 w-4"/></a>
    <details className="mt-3 rounded-xl bg-slate-950/55 p-3"><summary className="cursor-pointer text-sm font-bold text-white">Предложить правильные значения</summary><form onSubmit={submit} className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs text-slate-400">Быстрый, км<input required inputMode="decimal" value={fastKm} onChange={(event) => setFastKm(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white outline-none"/></label><label className="text-xs text-slate-400">Время, минут<input required inputMode="numeric" value={fastTime} onChange={(event) => setFastTime(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white outline-none"/></label><label className="text-xs text-slate-400">Без платных, км<input required inputMode="decimal" value={freeKm} onChange={(event) => setFreeKm(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white outline-none"/></label><label className="text-xs text-slate-400">Время, минут<input required inputMode="numeric" value={freeTime} onChange={(event) => setFreeTime(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white outline-none"/></label><button disabled={status === "sending" || status === "sent"} className="col-span-2 mt-1 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-black text-white disabled:opacity-60">{status === "sent" ? <><CheckCircle2 className="h-4 w-4"/>Отправлено на проверку</> : <><Send className="h-4 w-4"/>{status === "sending" ? "Отправляем…" : "Отправить значения"}</>}</button>{status === "error" && <p className="col-span-2 text-xs font-semibold text-red-300">Не удалось отправить. Сохраните значения и попробуйте позже.</p>}</form></details>
  </article>;
}

export default function V3Page() {
  const [mode, setMode] = useState<"standard" | "dual">("standard");
  const [from, setFrom] = useState<Place>({ label: "" }); const [via, setVia] = useState<Place>({ label: "" }); const [to, setTo] = useState<Place>({ label: "" });
  const [rates, setRates] = useState(defaults); const [rate1, setRate1] = useState(25); const [rate2, setRate2] = useState(35);
  const [urgent, setUrgent] = useState(false); const [urgentPercent, setUrgentPercent] = useState(20);
  const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem("mezhgorod-v3-rates"); if (saved) setRates({ ...defaults, ...JSON.parse(saved) }); } catch {} }, []);
  useEffect(() => { localStorage.setItem("mezhgorod-v3-rates", JSON.stringify(rates)); }, [rates]);
  const multiplier = urgent ? 1 + Math.max(0, urgentPercent) / 100 : 1;
  const verified = useMemo(() => result?.legs.filter((leg): leg is VerifiedLeg => leg.status === "verified") ?? [], [result]);
  const missing = useMemo(() => result?.legs.filter((leg): leg is MissingLeg => leg.status === "missing") ?? [], [result]);
  async function calculate() {
    setError(""); setResult(null); setLoading(true);
    try { const response = await fetch("/api/v3/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, from, via, to }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); setTimeout(() => document.getElementById("v3-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось выполнить расчёт"); } finally { setLoading(false); }
  }
  const dualTotal = (variant: "fast" | "free") => verified.reduce((sum, leg, index) => sum + leg[variant].meters / 1000 * (index === 0 ? rate1 : rate2) * multiplier, 0);

  return <main className="min-h-screen bg-[#070b14] text-slate-100"><div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
    <header className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-700 shadow-lg shadow-violet-900/30"><Car className="h-6 w-6"/></div><div><h1 className="text-xl font-black sm:text-2xl">Межгород Calc <span className="text-violet-400">3.0</span></h1><p className="text-xs text-slate-400">Проверенная база маршрутов</p></div></div>{result && <span className="hidden items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 sm:flex"><Database className="h-3.5 w-3.5"/>{result.verifiedRouteCount} маршрута</span>}</header>
    <section className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-3 shadow-2xl backdrop-blur sm:p-5">
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-950 p-1"><button onClick={() => { setMode("standard"); setResult(null); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "standard" ? "bg-violet-600 text-white" : "text-slate-400"}`}>Обычный расчёт</button><button onClick={() => { setMode("dual"); setResult(null); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${mode === "dual" ? "bg-violet-600 text-white" : "text-slate-400"}`}>Двойная тарификация</button></div>
      <div className={`grid gap-3 ${mode === "dual" ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}><AddressField label="Точка A" value={from} onChange={setFrom} placeholder="Город или адрес"/>{mode === "dual" && <AddressField label="Промежуточная точка" value={via} onChange={setVia} placeholder="Граница тарифа"/>}<AddressField label="Точка B" value={to} onChange={setTo} placeholder="Город или адрес"/></div>
      <div className="mt-4 border-t border-slate-800 pt-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><Settings2 className="h-4 w-4 text-violet-400"/>{mode === "standard" ? "Тарифы" : "Тарифы участков"}</div>{mode === "standard" ? <TariffInputs rates={rates} setRates={setRates}/> : <div className="grid grid-cols-2 gap-2"><label className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="text-xs text-slate-400">Первый участок</span><span className="mt-1 flex"><input type="number" value={rate1} onChange={(event) => setRate1(Number(event.target.value) || 1)} className="w-full bg-transparent text-lg font-black outline-none"/><small>₽/км</small></span></label><label className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="text-xs text-slate-400">Второй участок</span><span className="mt-1 flex"><input type="number" value={rate2} onChange={(event) => setRate2(Number(event.target.value) || 1)} className="w-full bg-transparent text-lg font-black outline-none"/><small>₽/км</small></span></label></div>}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/65 p-3"><button type="button" role="switch" aria-checked={urgent} onClick={() => setUrgent(!urgent)} className={`relative h-7 w-12 rounded-full transition ${urgent ? "bg-orange-500" : "bg-slate-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${urgent ? "left-6" : "left-1"}`}/></button><span className="text-sm font-bold">Срочная поездка</span>{urgent && <label className="ml-auto flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2"><Percent className="h-4 w-4 text-orange-400"/><input aria-label="Наценка за срочность" type="number" min="0" max="500" value={urgentPercent} onChange={(event) => setUrgentPercent(Number(event.target.value) || 0)} className="h-9 w-14 bg-transparent text-right font-bold outline-none"/><span className="text-sm text-slate-400">%</span></label>}</div>
      <button onClick={calculate} disabled={loading} className="mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 font-black text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:opacity-60">{loading ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Calculator className="h-5 w-5"/>}{loading ? "Проверяем базу…" : "Рассчитать поездку"}</button>{error && <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    </section>

    {result && <section id="v3-result" className="mt-4 scroll-mt-4 space-y-3">
      {mode === "standard" && verified[0] && <div className="grid gap-3 md:grid-cols-2"><RouteCard title="По платной дороге" accent="violet" trip={verified[0].fast} rates={rates} multiplier={multiplier} tollRub={verified[0].tollRub} source={verified[0].source} accuracyPercent={verified[0].accuracyPercent}/><RouteCard title="Без платных дорог" accent="emerald" trip={verified[0].free} rates={rates} multiplier={multiplier} source={verified[0].source} accuracyPercent={verified[0].accuracyPercent}/></div>}
      {mode === "dual" && verified.length === 2 && <div className="grid gap-3 md:grid-cols-2">{(["fast", "free"] as const).map((variant) => <article key={variant} className={`rounded-2xl border bg-slate-900/80 p-4 ${variant === "fast" ? "border-violet-500/45" : "border-emerald-500/40"}`}><div className="flex items-center justify-between"><h3 className="font-black">{variant === "fast" ? "По платной дороге" : "Без платных дорог"}</h3><Route className={`h-5 w-5 ${variant === "fast" ? "text-violet-400" : "text-emerald-400"}`}/></div>{verified.map((leg, index) => <div key={`${leg.from}-${leg.to}`} className="mt-3 rounded-xl bg-slate-950/60 p-3"><p className="truncate text-xs text-slate-400">Участок {index + 1}: {leg.from} → {leg.to}</p><div className="mt-1 flex items-end justify-between gap-3"><span className="text-sm">{distance(leg[variant].meters)} · {duration(leg[variant].seconds)}</span><strong>{money(leg[variant].meters / 1000 * (index === 0 ? rate1 : rate2) * multiplier)}</strong></div></div>)}<div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3"><span className="font-bold">Итого</span><strong className="text-xl text-violet-300">{money(dualTotal(variant))}</strong></div>{variant === "fast" && <p className="mt-1 text-right text-xs text-amber-300">+ {money(verified.reduce((sum, leg) => sum + leg.tollRub, 0))} платные дороги отдельно</p>}</article>)}</div>}
      {missing.map((leg) => <CorrectionForm key={`${leg.from}-${leg.to}`} leg={leg}/>)}
    </section>}
    <footer className="mx-auto mt-6 max-w-3xl pb-5 text-center text-xs leading-relaxed text-slate-500"><p className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4"/>В расчёт попадают только маршруты, прошедшие проверку с допуском до 3%.</p></footer>
  </div></main>;
}
