"use client";

import { defaults, tariffNames } from "./pricing-data";
import { clampNumber, money } from "./format";
import type { Trip } from "./types";

export function TariffInputs({ rates, setRates }: { rates: typeof defaults; setRates: (rates: typeof defaults) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <label key={key} className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="block text-xs font-semibold text-slate-300">{tariffNames[key]}</span><span className="mt-1 flex items-center gap-1"><input aria-label={`Цена ${tariffNames[key]}`} type="number" min="1" max="10000" value={rates[key]} onChange={(e) => setRates({ ...rates, [key]: clampNumber(Number(e.target.value), 1, 10000, 1) })} className="w-full bg-transparent text-lg font-black text-white outline-none"/><span className="text-xs text-slate-500">₽/км</span></span></label>)}</div>;
}

const vehicleKeys = [
  ["standard", "standard"],
  ["comfort", "comfort"],
  ["comfortPlus", "comfort_plus"],
  ["minivan", "minivan"],
] as const;

export function PriceRows({ trip }: { trip: Trip }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{vehicleKeys.map(([key, vehicle]) => <div key={key} className="rounded-xl bg-slate-950/60 px-3 py-2"><span className="block text-xs text-slate-400">{tariffNames[key]}</span><strong className="text-base text-white">{trip.pricingByVehicle ? money(trip.pricingByVehicle[vehicle].totalPrice) : "Цена не рассчитана"}</strong></div>)}</div>;
}

export function PricingBreakdown({ trip }: { trip: Trip }) {
  const segments = trip.pricingByVehicle?.comfort.pricingSegments;
  if (!segments?.length) return null;
  return <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/45 p-3">
    <p className="mb-2 text-xs font-bold text-slate-300">Расчёт по сегментам · Комфорт</p>
    <div className="space-y-1.5">{segments.map((segment, index) => <div key={`${segment.from}-${segment.to}-${index}`} className="flex items-start justify-between gap-2 text-xs">
      <span className="min-w-0 text-slate-400"><span className="block truncate">{segment.from} → {segment.to}</span><span>{segment.type === "special" ? "Специальный тариф" : "Обычный тариф"} · {segment.distanceKm} км × {money(segment.ratePerKm)}/км</span></span>
      <strong className="shrink-0 text-slate-200">{money(segment.amount)}</strong>
    </div>)}</div>
    {segments.some((segment) => segment.reviewRequired) && <p className="mt-2 text-xs text-amber-300">Для этого коридора требуется дополнительная проверка тарифа.</p>}
  </div>;
}
