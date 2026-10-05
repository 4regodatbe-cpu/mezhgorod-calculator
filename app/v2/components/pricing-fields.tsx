"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { defaults, tariffNames } from "./pricing-data";
import { clampNumber, money } from "./format";
import { resolveTollAmount, totalWithToll, type TollPeriod } from "./quote-presentation";
import type { TollView, Trip } from "./types";

export function TariffInputs({
  rates,
  setRates,
}: {
  rates: typeof defaults;
  setRates: (rates: typeof defaults) => void;
}) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {(Object.keys(rates) as Array<keyof typeof rates>).map((key) => {
        const name = tariffNames[key];
        const updateRate = (delta: number) => {
          const next = Math.round((rates[key] + delta) * 2) / 2;
          setRates({ ...rates, [key]: clampNumber(next, 1, 10000, 1) });
        };
        return (
          <div key={key} className="min-w-0 rounded-[18px] border border-brand-border/25 bg-brand-surface p-2 shadow-sm">
            <label htmlFor={"rate-" + key} className="block truncate text-sm font-extrabold text-brand-text">{name}</label>
            <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
              <div className="flex min-w-0 items-baseline gap-0.5">
                <input
                  id={"rate-" + key}
                  aria-label={"Цена за км: " + name}
                  type="number"
                  min="1"
                  max="10000"
                  step="0.5"
                  value={rates[key]}
                  onChange={(event) =>
                    setRates({
                      ...rates,
                      [key]: clampNumber(Number(event.target.value), 1, 10000, 1),
                    })
                  }
                  className="rate-stepper-input w-[6ch] max-w-full shrink bg-transparent text-lg font-black leading-none text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-focus"
                />
                <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-brand-action">₽/км</span>
              </div>
              <div className="flex flex-col -my-2">
                <button
                  type="button"
                  aria-label={"Увеличить тариф " + name + " на 0,50 ₽/км"}
                  onClick={() => updateRate(0.5)}
                  className="grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-xl border border-brand-border/25 bg-brand-subtle/65 text-brand-action transition hover:bg-brand-subtle active:bg-brand-route/20 focus-visible:outline-2 focus-visible:outline-brand-focus"
                >
                  <ChevronUp className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={"Уменьшить тариф " + name + " на 0,50 ₽/км"}
                  onClick={() => updateRate(-0.5)}
                  className="grid h-11 w-11 place-items-center rounded-lg text-brand-action transition hover:bg-brand-subtle active:bg-brand-route/30 focus-visible:outline-2 focus-visible:outline-brand-focus"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const vehicleKeys = [
  ["standard", "standard"],
  ["comfort", "comfort"],
  ["comfortPlus", "comfort_plus"],
  ["minivan", "minivan"],
] as const;

export function PriceRows({
  trip,
  toll,
  period,
  manualToll,
}: {
  trip: Trip;
  toll?: TollView;
  period: TollPeriod;
  manualToll?: string;
}) {
  const tollPrice = resolveTollAmount(toll, period, manualToll);
  return (
    <div className="mt-3 grid min-w-0 grid-cols-1 gap-2">
      {vehicleKeys.map(([key, vehicle], index) => {
        const price = trip.pricingByVehicle?.[vehicle];
        const baseFare = price && !price.requiresSplit ? price.totalPrice : null;
        const total = totalWithToll(baseFare, tollPrice);
        return (
          <article key={key} className="min-w-0 rounded-[18px] border border-brand-border/25 bg-brand-surface px-3 py-2.5 shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-subtle text-[11px] font-black text-brand-action">{index + 1}</span>
              <h4 className="truncate text-base font-black text-brand-text">{tariffNames[key]}</h4>
            </div>
            {baseFare === null ? (
              <p className="mt-2 text-sm text-brand-muted">Цена тарифа не рассчитана</p>
            ) : (
              <>
                <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
                  <span className="font-semibold text-brand-text">{money(baseFare)}</span>
                  <span aria-hidden="true" className="font-bold text-brand-muted">+</span>
                  {tollPrice.amount === null ? (
                    <span className="font-bold text-brand-muted">платные дороги: сумма не подтверждена</span>
                  ) : (
                    <span className="font-bold text-brand-route">{money(tollPrice.amount)} {tollPrice.status === "manual" ? "дороги (вручную)" : "платные дороги"}</span>
                  )}
                </div>
                <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 border-t border-brand-border/20 pt-1.5">
                  <span aria-hidden="true" className="font-black text-brand-muted">=</span>
                  <span className="text-sm font-extrabold text-brand-text">Итого за поездку</span>
                  <strong className="ml-auto text-lg font-black text-brand-action">{total === null ? "не рассчитано" : money(total)}</strong>
                </div>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
