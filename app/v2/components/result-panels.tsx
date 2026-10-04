"use client";

import { RouteCard } from "./route-card";
import { UnverifiedRouteCard } from "./unverified-route-card";
import { RouteUnavailable } from "./route-notices";
import type { Leg, Result, TollView, Trip } from "./types";

type CopyStandard = (key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string) => Promise<void>;
type Props = {
  result: Result | null;
  standardLeg?: Leg;
  standardHasTolls: boolean;
  standardOptimal: Trip | null;
  manualToll: string;
  onManualToll: (value: string) => void;
  copiedKey: string;
  copyStandard: CopyStandard;
};

export function ResultPanels({ result, standardLeg, standardHasTolls, standardOptimal, manualToll, onManualToll, copiedKey, copyStandard }: Props) {
  if(result?.specialEndpoint) return <section className="mt-4 grid gap-3 md:grid-cols-2">
    {(result.options ?? []).map((leg,index)=><RouteCard key={index} title={index===0?"Основной маршрут":"Альтернативный маршрут"} accent="blue" trip={leg.fast} toll={leg.fast.tolls} onCopy={()=>copyStandard(`option-${index}`,index===0?"Основной маршрут":"Альтернативный маршрут",leg,leg.fast,leg.fast.tolls)} copied={copiedKey===`option-${index}`}/>)}
  </section>;
  return <>
    {result && standardLeg && standardOptimal && <section className={`mt-4 grid gap-3 ${standardHasTolls ? "md:grid-cols-2" : "grid-cols-1"}`}>
      {standardHasTolls ? <>
        <RouteCard title={standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге"} accent="blue" trip={standardLeg.fast} toll={standardLeg.fast.tolls} manualToll={manualToll} onManualToll={onManualToll} onCopy={() => copyStandard("standard-fast", standardLeg.fast.tolls.pricingStatus === "unknown" ? "Быстрый маршрут" : "По платной дороге", standardLeg, standardLeg.fast, standardLeg.fast.tolls)} copied={copiedKey === "standard-fast"}/>
        {standardLeg.free
          ? <RouteCard title="Без платных дорог" accent="emerald" trip={standardLeg.free} onCopy={() => copyStandard("standard-free", "Без платных дорог", standardLeg, standardLeg.free!)} copied={copiedKey === "standard-free"}/>
          : standardLeg.freeCandidate
            ? <UnverifiedRouteCard trip={standardLeg.freeCandidate} onCopy={() => copyStandard("standard-candidate", "Альтернативный маршрут", standardLeg, standardLeg.freeCandidate!, undefined, "Платность маршрута не подтверждена. Возможная стоимость платных дорог не включена.")} copied={copiedKey === "standard-candidate"}/>
            : <RouteUnavailable message={standardLeg.freeError}/>}
      </> : <RouteCard title="Оптимальный маршрут" accent="blue" trip={standardOptimal} onCopy={() => copyStandard("standard-optimal", "Оптимальный маршрут", standardLeg, standardOptimal)} copied={copiedKey === "standard-optimal"}/>}
    </section>}
  </>;
}
