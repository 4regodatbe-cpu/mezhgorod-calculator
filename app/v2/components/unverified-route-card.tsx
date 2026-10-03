"use client";

import { Check, Clipboard, Clock3, Route, ShieldCheck } from "lucide-react";
import { PriceRows } from "./pricing-fields";
import { defaults } from "./pricing-data";
import { duration, distance } from "./format";
import type { Trip } from "./types";

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
