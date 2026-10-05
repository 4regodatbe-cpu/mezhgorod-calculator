"use client";

import { distance, duration } from "./format";
import type { Result } from "./types";

export function RouteUnavailable({ message }: { message?: string }) {
  return <article className="min-w-0 rounded-[24px] border border-brand-border/20 bg-brand-surface p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-brand-text">Маршрут без платных дорог</h3><span className="rounded-full bg-brand-route/15 px-2.5 py-1 text-xs font-bold text-brand-text">Не подтверждён</span></div>
    <p className="mt-3 text-sm leading-relaxed text-brand-text">{message ?? "Маршрут временно недоступен. Повторите расчёт позже."}</p>
    <p className="mt-2 text-xs text-brand-muted">Расчёт по основному маршруту выше остаётся действительным.</p>
  </article>;
}

export function DualUnverifiedNotice({ result }: { result: Result }) {
  const candidates = result.legs.map((leg, index) => ({ leg, index, candidate: leg.freeCandidate })).filter((item) => Boolean(item.candidate));
  if (candidates.length === 0) return null;
  return <article className="min-w-0 rounded-[24px] border border-brand-route/35 bg-brand-route/5 p-4">
    <div className="flex items-center justify-between gap-3"><h3 className="font-black text-brand-text">Непроверенные альтернативы</h3><span className="rounded-full bg-brand-route/15 px-2.5 py-1 text-xs font-bold text-brand-text">Не входят в итог</span></div>
    <p className="mt-2 text-sm text-brand-muted">По этим участкам маршрутизатор предложил обход, но независимая проверка не доказала отсутствие платных дорог.</p>
    <div className="mt-3 space-y-2">{candidates.map(({ leg, index, candidate }) => <div key={index} className="rounded-xl bg-brand-surface p-3"><p className="text-xs text-brand-muted">Участок {index + 1}: {leg.from} → {leg.to}</p><p className="mt-1 text-sm font-semibold text-brand-text">{distance(candidate!.meters)} · {duration(candidate!.seconds)}</p><p className="mt-1 text-xs text-amber-800">{candidate!.tollValidation?.message ?? "Платность не подтверждена"}</p></div>)}</div>
  </article>;
}
