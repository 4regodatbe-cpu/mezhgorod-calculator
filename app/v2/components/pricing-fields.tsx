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
          <div key={key} className="min-w-0 rounded-[20px] border border-brand-border/15 bg-brand-surface p-2.5 shadow-sm">
            <label htmlFor={"rate-" + key} className="block truncate text-xs font-bold text-brand-text">{name}</label>
            <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
              <div className="flex min-w-0 items-baseline gap-1">
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
                  className="rate-stepper-input min-w-0 w-full bg-transparent text-lg font-black leading-none text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-focus"
                />
                <span className="shrink-0 whitespace-nowrap text-[11px] font-bold text-brand-action">₽/км</span>
              </div>
              <div className="flex flex-col -my-2">
                <button
                  type="button"
                  aria-label={"Увеличить тариф " + name + " на 0,50 ₽/км"}
                  onClick={() => updateRate(0.5)}
                  className="grid h-11 w-11 place-items-center rounded-lg text-brand-action transition hover:bg-brand-subtle active:bg-brand-route/30 focus-visible:outline-2 focus-visible:outline-brand-focus"
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={"Уменьшить тариф " + name + " на 0,50 ₽/км"}
                  onClick={() => updateRate(-0.5)}
                  className="grid h-11 w-11 place-items-center rounded-lg text-brand-action transition hover:bg-brand-subtle active:bg-brand-route/30 focus-visible:outline-2 focus-visible:outline-brand-focus"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
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
      {vehicleKeys.map(([key, vehicle]) => {
        const price = trip.pricingByVehicle?.[vehicle];
        const baseFare = price && !price.requiresSplit ? price.totalPrice : null;
        const total = totalWithToll(baseFare, tollPrice);
        return (
          <div key={key} className="min-w-0 rounded-[18px] border border-brand-border/15 bg-brand-surface px-3 py-2.5">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-brand-text">{tariffNames[key]}</span>
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
              {baseFare === null ? (
                <span className="text-brand-text/70">Цена тарифа не рассчитана</span>
              ) : (
                <>
                  <span className="font-semibold text-brand-text">{money(baseFare)}</span>
                  <span aria-hidden="true" className="font-bold text-brand-text/60">+</span>
                  {tollPrice.amount === null ? (
                    <span className="font-bold text-amber-800">стоимость платных дорог не подтверждена</span>
                  ) : (
                    <span className="font-bold text-brand-route">{money(tollPrice.amount)} {tollPrice.status === "manual" ? "дороги (вручную)" : "платные дороги"}</span>
                  )}
                  <span aria-hidden="true" className="font-bold text-brand-text/60">=</span>
                  <strong className="font-black text-brand-action">
                    {total === null ? "итого не рассчитано" : money(total)}
                  </strong>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
