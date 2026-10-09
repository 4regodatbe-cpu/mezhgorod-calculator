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
            { kind: "main" as const, trip: standardLeg.fast, seconds: standardLeg.fast.seconds },
            ...((standardLeg.free ?? standardLeg.freeCandidate)
              ? [{ kind: "alternative" as const, trip: (standardLeg.free ?? standardLeg.freeCandidate)!, seconds: (standardLeg.free ?? standardLeg.freeCandidate)!.seconds }]
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
      {result && standardLeg?.fast.nationalTollCoverage && (
        <details className="mt-3 rounded-2xl border border-brand-border/25 bg-brand-surface p-3 text-sm text-brand-text">
          <summary className="cursor-pointer font-semibold">Платные дороги России · проверка покрытия</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-brand-muted">
            <p>В справочнике {standardLeg.fast.nationalTollCoverage.catalogNetworkCount} дорожные системы;
              для {standardLeg.fast.nationalTollCoverage.catalogWithReferenceFares} есть часть операторских тарифов.</p>
            <p>Возможные системы на выбранной геометрии: {standardLeg.fast.nationalTollCoverage.candidateNetworks.length
               ? standardLeg.fast.nationalTollCoverage.candidateNetworks.map(x => x.name).join("; ")
               : "геометрические признаки не найдены — это не доказывает бесплатный проезд"}.</p>
            <p>Это предварительные геометрические признаки, а не доказанные пересечения пунктов оплаты.
              Новые справочные цены не включены в итог без независимой проверки.</p>
            {standardLeg.fast.nationalTollCoverage.m1m3GateAudit && (
              <p>М-1/М-3 · физические ПВП: {standardLeg.fast.nationalTollCoverage.m1m3GateAudit.status === "unknown"
                ? "строгая проверка узлов на этой поездке ещё недоступна"
                : `подтверждённых OSM-узлов: ${standardLeg.fast.nationalTollCoverage.m1m3GateAudit.verifiedGates.length}, неопознанных платных событий: ${standardLeg.fast.nationalTollCoverage.m1m3GateAudit.unmappedPaidNodes.length}`}.
                Операторские ПВП известны (М-1: 46 км; М-3: 86, 136, 168 км), но точные OSM-идентификаторы полос ещё требуют сверки.</p>
              {standardLeg.fast.nationalTollCoverage.m1m3GateAudit.unmappedPaidNodes.length > 0 && (
                <p className="break-all">OSM-кандидаты (не утверждены как ПВП):
                  {standardLeg.fast.nationalTollCoverage.m1m3GateAudit.unmappedPaidNodes.map(node => ` ${node.roadId}: ${node.osmNodeId ?? "ID отсутствует"}`).join("; ")}
                </p>
              )}
            )}
            <a href="/v2/toll-roads" className="inline-block font-semibold underline underline-offset-4">Каталог платных дорог и статус расчёта</a>
          </div>
        </details>
      )}
      {result && standardLeg?.fast.m4PvpPreview && standardLeg.fast.m4PvpPreview.candidateCount > 0 && (
        <details className="mt-3 rounded-2xl border border-brand-border bg-brand-card p-3 text-sm text-brand-text">
          <summary className="cursor-pointer font-semibold">М-4 · экспериментальная проверка пунктов оплаты</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-brand-muted">
            <p>Найдено пунктов для проверки: {standardLeg.fast.m4PvpPreview.candidateCount}.
            Подтверждено строгим сопоставлением: {standardLeg.fast.m4PvpPreview.confirmedPvps.length}.</p>
            <p>Последовательность ПВП: {standardLeg.fast.m4PvpPreview.confirmedPvps.join(" → ") || "не подтверждена"}.</p>
            <p>Подтверждённых полных тарифов в новой базе: {standardLeg.fast.m4PvpPreview.verifiedPriceCells}.</p>
            <p>Состояние: {standardLeg.fast.m4PvpPreview.priceRub === null
              ? "точная стоимость по новой матрице пока не подтверждена; основной расчёт использует прежний алгоритм."
              : "проверенный тариф по новой матрице найден (диагностика)."}</p>
            <p className="break-all opacity-70">Код проверки: {standardLeg.fast.m4PvpPreview.reason ?? "priced"}</p>
          </div>
        </details>
      )}
    </>
  );
}
