"use client";

import { RouteCard } from "./route-card";
import { AlternativeRouteCard } from "./unverified-route-card";
import { RouteUnavailable } from "./route-notices";
import { confirmedFreeToll, type TollPeriod } from "./quote-presentation";
import { orderRoutesByTravelTime } from "./route-utils";
import type { Leg, Result, TollView, Trip } from "./types";

type CopyStandard = (key: string, title: string, leg: Leg, trip: Trip, toll?: TollView, warning?: string, period?: TollPeriod, manualToll?: string, fareOnly?: boolean) => Promise<void>;
type Props = {
  result: Result | null;
  standardLeg?: Leg;
  standardHasTolls: boolean;
  standardOptimal: Trip | null;
  manualToll: string;
  onManualToll: (value: string) => void;
  copiedKey: string;
  copyStandard: CopyStandard;
  tollPeriod: TollPeriod;
  onTollPeriodChange: (period: TollPeriod) => void;
};

export function ResultPanels({
  result, standardLeg, standardHasTolls, standardOptimal, manualToll,
  onManualToll, copiedKey, copyStandard, tollPeriod, onTollPeriodChange,
}: Props) {
  if (result?.specialEndpoint) return (
    <section className="mt-4 grid min-w-0 grid-cols-1 gap-3">
      {(result.options ?? []).map((leg, index) => index === 0 ? <RouteCard
        key={index}
        title="Основной маршрут"
        accent="blue"
        trip={leg.fast}
        toll={leg.fast.tolls}
        tollPeriod={tollPeriod}
        onTollPeriodChange={onTollPeriodChange}
        onCopy={() => copyStandard("option-0", "Основной маршрут", leg, leg.fast, leg.fast.tolls, undefined, tollPeriod)}
        copied={copiedKey === "option-0"}
      /> : <RouteCard
        key={index}
        title="Альтернативный маршрут"
        accent="emerald"
        trip={leg.fast}
        toll={leg.fast.tolls}
        tollPeriod={tollPeriod}
        onTollPeriodChange={onTollPeriodChange}
        onCopy={() => copyStandard(`option-${index}`, "Альтернативный маршрут", leg, leg.fast, leg.fast.tolls, undefined, tollPeriod)}
        copied={copiedKey === `option-${index}`}
      />)}
    </section>
  );

  return (
    <>
      {result && standardLeg && standardOptimal && <section className={"mt-4 grid min-w-0 grid-cols-1 gap-3 " + (standardHasTolls ? "lg:grid-cols-2" : "")}>
        {standardHasTolls ? <>
          {orderRoutesByTravelTime([
            { kind: "main" as const, trip: standardLeg.fast },
            ...((standardLeg.free ?? standardLeg.freeCandidate)
              ? [{ kind: "alternative" as const, trip: (standardLeg.free ?? standardLeg.freeCandidate)! }]
              : []),
          ]).map((route) => route.kind === "main" ? <RouteCard
            key="standard-fast"
            title="Основной маршрут"
            accent="blue"
            trip={route.trip}
            toll={standardLeg.fast.tolls}
            tollPeriod={tollPeriod}
            onTollPeriodChange={onTollPeriodChange}
            manualToll={manualToll}
            onManualToll={onManualToll}
            onCopy={() => copyStandard("standard-fast", "Основной маршрут", standardLeg, standardLeg.fast, standardLeg.fast.tolls, undefined, tollPeriod, manualToll)}
            copied={copiedKey === "standard-fast"}
          /> : <AlternativeRouteCard
                key="standard-alternative"
                trip={route.trip}
                onCopy={() => copyStandard("standard-alternative", "Альтернативный маршрут", standardLeg, (standardLeg.free ?? standardLeg.freeCandidate)!, confirmedFreeToll, undefined, tollPeriod, undefined, true)}
                copied={copiedKey === "standard-alternative"}
              />)}
          {!(standardLeg.free ?? standardLeg.freeCandidate) && <RouteUnavailable message={standardLeg.freeError} />}
        </> : <RouteCard title="Оптимальный маршрут" accent="blue" trip={standardOptimal} toll={confirmedFreeToll} tollPeriod={tollPeriod} onTollPeriodChange={onTollPeriodChange} onCopy={() => copyStandard("standard-optimal", "Оптимальный маршрут", standardLeg, standardOptimal, confirmedFreeToll, undefined, tollPeriod)} copied={copiedKey === "standard-optimal"} />}
      </section>}
    </>
  );
}
