"use client";

import { Check, Clipboard, Clock3, Route } from "lucide-react";
import { PriceRows } from "./pricing-fields";
import { duration, distance } from "./format";
import type { Trip } from "./types";

export function AlternativeRouteCard({ trip, onCopy, copied }: {
  trip: Trip;
  onCopy: () => void;
  copied: boolean;
}) {
  return <article className="min-w-0 w-full rounded-[24px] border border-brand-border/25 bg-brand-surface p-3 shadow-[0_12px_28px_rgba(16,42,67,.05)]">
    <h3 className="min-w-0 text-lg font-black text-brand-text">Альтернативный маршрут</h3>
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
      <span className="flex items-center gap-1.5 font-semibold text-brand-text"><Route className="h-4 w-4 text-brand-action" />{distance(trip.meters)}</span>
      <span className="flex items-center gap-1.5 font-semibold text-brand-text"><Clock3 className="h-4 w-4 text-brand-action" />{duration(trip.seconds)}</span>
    </div>
    <PriceRows trip={trip} period="weekday" fareOnly />
    <button type="button" onClick={onCopy} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-border/20 bg-brand-page text-sm font-extrabold text-brand-text transition hover:border-brand-action/50 hover:bg-brand-subtle">{copied ? <><Check className="h-4 w-4" />Скопировано</> : <><Clipboard className="h-4 w-4" />Скопировать</>}</button>
  </article>;
}
