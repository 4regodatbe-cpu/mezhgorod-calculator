"use client";

import { distance, duration } from "./format";
import type { Result } from "./types";

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
