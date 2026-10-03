"use client";

import { Check, Clipboard, Route } from "lucide-react";
import { QualityNote, RouteCard } from "./route-card";
import { UnverifiedRouteCard } from "./unverified-route-card";
import { DualUnverifiedNotice, RouteUnavailable } from "./route-notices";
import { distance, duration, money } from "./format";
import { pickOptimal } from "./route-utils";
import type { Leg, Result, TollView, Trip } from "./types";

type CopyStandard = (key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string) => Promise<void>;
type CopyDual = (key: string, title: string, trips: Trip[], total: number, tollWeekday: number, tollWeekend: number, tollUnknown: boolean) => Promise<void>;
type Props = {
  result: Result | null;
  mode: "standard" | "dual";
  standardLeg?: Leg;
  standardHasTolls: boolean;
  standardOptimal: Trip | null;
  dualHasTolls: boolean;
  dualVariants: Array<"fast" | "free" | "optimal">;
  manualToll: string;
  onManualToll: (value: string) => void;
  copiedKey: string;
  copyStandard: CopyStandard;
  copyDual: CopyDual;
};

export function ResultPanels({ result, mode, standardLeg, standardHasTolls, standardOptimal, dualHasTolls, dualVariants, manualToll, onManualToll, copiedKey, copyStandard, copyDual }: Props) {
  return <>
    {result && mode === "standard" && standardLeg && standardOptimal && <section className={`mt-4 grid gap-3 ${standardHasTolls ? "md:grid-cols-2" : "grid-cols-1"}`}>
      {standardHasTolls ? <>
        <RouteCard title={standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге"} accent="blue" trip={standardLeg.fast} toll={standardLeg.fast.tolls} manualToll={manualToll} onManualToll={onManualToll} onCopy={() => copyStandard("standard-fast", standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге", standardLeg, standardLeg.fast, standardLeg.fast.tolls)} copied={copiedKey === "standard-fast"}/>
        {standardLeg.free
          ? <RouteCard title="Без платных дорог" accent="emerald" trip={standardLeg.free} onCopy={() => copyStandard("standard-free", "Без платных дорог", standardLeg, standardLeg.free!)} copied={copiedKey === "standard-free"}/>
          : standardLeg.freeCandidate
            ? <UnverifiedRouteCard trip={standardLeg.freeCandidate} onCopy={() => copyStandard("standard-candidate", "Альтернативный маршрут", standardLeg, standardLeg.freeCandidate!, undefined, "Платность маршрута не подтверждена. Возможная стоимость платных дорог не включена.")} copied={copiedKey === "standard-candidate"}/>
            : <RouteUnavailable message={standardLeg.freeError}/>}
      </> : <RouteCard title="Оптимальный маршрут" accent="blue" trip={standardOptimal} onCopy={() => copyStandard("standard-optimal", "Оптимальный маршрут", standardLeg, standardOptimal)} copied={copiedKey === "standard-optimal"}/>}
    </section>}
    {result && mode === "dual" && <section className="mt-4 space-y-3">
      <div className={`grid gap-3 ${dualHasTolls ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {dualVariants.map((variant) => {
          const fast = variant === "fast";
          const optimal = variant === "optimal";
          const available = fast || optimal || result.legs.every((leg) => leg.free);
          if (!available) return <RouteUnavailable key={variant} message={result.legs.find((leg) => !leg.free)?.freeError}/>;
          const trips = result.legs.map((leg) => optimal ? pickOptimal(leg.fast, leg.free) : fast ? leg.fast : leg.free!);
          const pricedTotal = trips.reduce((sum, trip) => sum + (trip.pricingByVehicle?.standard.totalPrice ?? 0), 0);
          const total = pricedTotal;
          const tollUnknown = fast && result.legs.some((leg) => leg.fast.tolls.pricingStatus === "unknown");
          const tollWeekday = result.legs.reduce((sum, leg) => sum + (fast ? (leg.fast.tolls.weekdayAmount ?? 0) : 0), 0);
          const tollWeekend = result.legs.reduce((sum, leg) => sum + (fast ? (leg.fast.tolls.weekendAmount ?? 0) : 0), 0);
          const title = optimal ? "Оптимальный маршрут" : fast ? (tollUnknown ? "Быстрый маршрут" : "По платной дороге") : "Без платных дорог";
          return <article key={variant} className={`rounded-2xl border bg-slate-900/80 p-4 ${fast || optimal ? "border-blue-500/45" : "border-emerald-500/40"}`}>
            <div className="flex items-center justify-between"><h3 className="font-black">{title}</h3><Route className={`h-5 w-5 ${fast || optimal ? "text-blue-400" : "text-emerald-400"}`}/></div>
            {result.legs.map((leg, index) => {
              const trip = trips[index];
              const pricing = trip.pricingByVehicle?.standard.pricingSegments[0];
              const tripPrice = trip.pricingByVehicle?.standard.totalPrice;
              return <div key={index} className="mt-3 rounded-xl bg-slate-950/60 p-3">
                <p className="truncate text-xs text-slate-400">Участок {index + 1}: {leg.from} → {leg.to}</p>
                <div className="mt-1 flex items-end justify-between gap-3"><span className="text-sm">{distance(trip.meters)} · {duration(trip.seconds)}{pricing ? <span className="block text-xs text-slate-500">{pricing.type === "special" ? "Специальный" : "Обычный"} тариф · {money(pricing.ratePerKm)}/км</span> : null}</span><strong>{tripPrice == null ? "Укажите границу тарифа" : money(tripPrice)}</strong></div>
                <QualityNote quality={trip.quality}/>
              </div>;
            })}
            <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3"><span className="font-bold">Итого</span><strong className="text-xl text-blue-300">{money(total)}</strong></div>
            {fast && tollUnknown ? <div className="mt-2 text-right text-xs font-semibold text-amber-700 dark:text-amber-300">Стоимость платных дорог не определена</div> : fast && tollWeekday > 0 ? <div className="mt-2 text-right text-xs text-amber-700 dark:text-amber-300">{tollWeekday !== tollWeekend ? <><p>Пн–Чт: + {money(tollWeekday)} платные дороги</p><p>Пт–Вс: + {money(tollWeekend)} платные дороги</p></> : <p>+ {money(tollWeekday)} платные дороги, ориентировочно</p>}</div> : null}
            <button type="button" onClick={() => copyDual(`dual-${variant}`, title, trips, total, tollWeekday, tollWeekend, tollUnknown)} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 text-sm font-bold text-white">{copiedKey === `dual-${variant}` ? <><Check className="h-4 w-4"/>Скопировано</> : <><Clipboard className="h-4 w-4"/>Скопировать результат</>}</button>
          </article>;
        })}
      </div>
      <DualUnverifiedNotice result={result}/>
    </section>}
  </>;
}
