"use client";

import { Check, Clipboard, Clock3, Route, ShieldCheck } from "lucide-react";
import { PriceRows } from "./pricing-fields";
import { duration, distance } from "./format";
import { unverifiedToll, type TollPeriod } from "./quote-presentation";
import type { Trip } from "./types";

export function UnverifiedRouteCard({ trip, tollPeriod, onCopy, copied }: {
  trip: Trip;
  tollPeriod: TollPeriod;
  onCopy: () => void;
  copied: boolean;
}) {
  return <article className="min-w-0 w-full rounded-[24px] border border-brand-route/40 bg-brand-surface p-4 shadow-[0_12px_32px_rgba(16,42,67,.07)]">
    <div className="flex min-w-0 items-center justify-between gap-2"><h3 className="font-black text-brand-text">Альтернативный маршрут</h3><span className="shrink-0 rounded-full bg-brand-route/15 px-2.5 py-1 text-xs font-extrabold text-brand-text">Платность не подтверждена</span></div>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span className="flex items-center gap-1.5 font-semibold text-brand-text"><Route className="h-4 w-4 text-brand-action" />{distance(trip.meters)}</span><span className="flex items-center gap-1.5 font-semibold text-brand-text"><Clock3 className="h-4 w-4 text-brand-action" />{duration(trip.seconds)}</span></div>
    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-800"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{trip.tollValidation?.message ?? trip.quality?.message ?? "Независимая проверка не завершена. Маршрут нельзя считать подтверждённо бесплатным."}</span></p>
    <PriceRows trip={trip} toll={unverifiedToll} period={tollPeriod} />
    <p className="mt-2 text-xs text-brand-muted">Возможная стоимость дорог неизвестна и в итог не включена.</p>
    <button type="button" onClick={onCopy} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand-route/40 bg-brand-page text-sm font-extrabold text-brand-text transition hover:bg-brand-subtle">{copied ? <><Check className="h-4 w-4" />Скопировано</> : <><Clipboard className="h-4 w-4" />Скопировать с предупреждением</>}</button>
  </article>;
}
