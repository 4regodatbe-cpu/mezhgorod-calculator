"use client";

import { defaults, tariffNames } from "./pricing-data";
import { clampNumber, money } from "./format";

export function TariffInputs({ rates, setRates }: { rates: typeof defaults; setRates: (rates: typeof defaults) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <label key={key} className="rounded-xl border border-slate-700 bg-slate-950/55 p-2.5"><span className="block text-xs font-semibold text-slate-300">{tariffNames[key]}</span><span className="mt-1 flex items-center gap-1"><input aria-label={`Цена ${tariffNames[key]}`} type="number" min="1" max="10000" value={rates[key]} onChange={(e) => setRates({ ...rates, [key]: clampNumber(Number(e.target.value), 1, 10000, 1) })} className="w-full bg-transparent text-lg font-black text-white outline-none"/><span className="text-xs text-slate-500">₽/км</span></span></label>)}</div>;
}

export function PriceRows({ meters, rates, multiplier }: { meters: number; rates: typeof defaults; multiplier: number }) {
  return <div className="mt-3 grid grid-cols-2 gap-2">{(Object.keys(rates) as Array<keyof typeof rates>).map((key) => <div key={key} className="rounded-xl bg-slate-950/60 px-3 py-2"><span className="block text-xs text-slate-400">{tariffNames[key]}</span><strong className="text-base text-white">{money(meters / 1000 * rates[key] * multiplier)}</strong></div>)}</div>;
}
