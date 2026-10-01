# Segment 6A — M-11 diagnostic baseline plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DIAGNOSTIC ONLY
Production `main`: unchanged.

## Goal

Document the current M-11 user-API behavior, route evidence, tariff ownership boundaries, and failure modes before changing any M-11 monetary result.

The replacement must eventually calculate the actually traversed M-11 entry/exit path from versioned official tariffs. It must not promote one static Moscow↔Saint-Petersburg amount or five approximate corridor chunks as exact pricing.

## Confirmed current implementation risks

### 1. M-11 is still inside the generic geometry estimator

`lib/tolls.ts` models M-11 as five broad approximate `TollSegment` chunks. The source itself states that the first concession section has a time-dependent tariff and that the stored values are conservative daytime estimates.

There is no M-11-specific production engine comparable to M-4 or M-12.

### 2. Full-route fixed override can supersede segment evidence

`FULL_ROUTES` contains a Moscow↔Saint-Petersburg M-11 override of `4580 / 4780 RUB` with `expectedKm=708` and 6% distance tolerance.

`matchesFullRoute()` accepts the full-route override from endpoint + route-length agreement before checking the stored M-11 segment-count requirements. Therefore a route close to 708 km can receive the fixed amount even when detailed M-11 entry/exit evidence is not established.

### 3. Current verified-route sources are internally inconsistent

`data/verified-routes.json` currently stores Moscow→Saint-Petersburg with:

- `fastKm=708`;
- `tollRub=4760`;
- source `Яндекс Карты`, verified 2026-09-28.

But `lib/verified-routes.ts` separately overrides this pair to:

- weekday `4580`;
- weekend `4780`.

The production fallback can therefore expose a number different from the raw verified-route record.

### 4. Existing recovery layer does not own M-11

`lib/toll-recovery.ts` currently contains only M-4 and M-12 recovery roads. M-11 has no road-specific conservative recovery/evidence model.

## Official tariff truth model to preserve

M-11 is not one homogeneous static weekday/weekend tariff.

### Section 15–58 km — separate concession tariff system

Current official operator documentation lists tariffs effective from 24 April 2026. Category-I pricing is dependent on:

- exact entry/exit pair;
- direction;
- time of day;
- weekday / Friday / Saturday / Sunday tariff day;
- holiday/pre-holiday exceptions defined by the operator;
- payment method/transponder rules where applicable.

For example, the same Moscow→Solnechnogorsk traversal is not one constant price across the week/day.

### Section 58–679 km — Avtodor tariff matrix

This part must be represented as an entry/exit matrix (or an equivalent exact ordered-point model), not as broad approximate geographic chunks.

The current category-I official matrix effective in 2026 distinguishes at least Mon–Thu from Fri–Sun and provides exact amounts for every supported entry/exit pair.

### Section 679–684 / Pulkovo approach

Treat separately. Do not assume it is always traversed merely because destination is Saint Petersburg. Price it only when route evidence proves the corresponding M-11 section/entry-exit.

### Composition rule

A full M-11 trip may cross tariff systems owned by different operators/sections. Exact total is the sum of exact traversed components only after their entry/exit evidence is established.

`unknown` in any required component must not become an exact zero and must not silently yield a complete total.

## 6A1 — current user-API baseline

Run the current branch unchanged and capture both directions where applicable:

1. Moscow ↔ Saint Petersburg;
2. Moscow ↔ Tver;
3. Tver ↔ Saint Petersburg;
4. Moscow ↔ Solnechnogorsk;
5. Solnechnogorsk ↔ Saint Petersburg;
6. Sochi ↔ Saint Petersburg as an M-4 + M-11 mixed-route protection control.

For every control record:

- fast distance/time;
- current toll amount/weekday/weekend/status;
- returned toll segments/source labels;
- free vs freeCandidate truth;
- whether a fixed full-route override, generic M-11 segments, verified-route fallback, or other source produced the number.

Start with normal user API (`diagnostics=false`) so the baseline does not unnecessarily invoke expensive full-route map matching.

## 6A2 — strict route-evidence probe

Reuse the same existing fast Valhalla `/route` response with maneuvers. Do not add a second full-route request merely to identify M-11.

Diagnostic goals:

- derive the ordered M-11 maneuver span(s);
- detect exit/re-entry rather than assuming one continuous M-11 traversal;
- identify route-relative official tariff entry/exit points;
- distinguish the 15–58 concession section, 58–679 Avtodor section, and 679–684/Pulkovo section;
- test both directions.

A maneuver name or proximity alone is candidate evidence; exact pricing needs ordered boundary evidence sufficient to choose an official tariff pair.

## 6A3 — versioned official tariff data

Persist official tariff data separately from routing logic.

Required metadata:

- road/system id;
- operator/section;
- vehicle category;
- effective-from date;
- source document/page or official URL;
- tariff points / entry-exit matrix;
- day/time/direction rules where applicable;
- explicit handling of holiday/pre-holiday exceptions;
- whether transponder discounts are excluded from the default cash/card/no-passenger model.

No exact monetary constant may be introduced without a source/effective date.

## 6A4 — pure M-11 pricing core design

Only after 6A1–6A3 evidence is captured:

- input: ordered proven M-11 traversal boundaries + departure date/time + direction + versioned tariff snapshot;
- output: `priced | unknown` per required M-11 component, with exact component amounts when proven;
- mixed M-4/M-11 composition must preserve independently proven M-4 amounts;
- partial routes must price only the actually traversed M-11 pair(s);
- no full-route city-pair substitution as the primary pricing rule.

## Gates

1. Segment 6A is diagnostic-only; user pricing does not change.
2. `pnpm build` remains green for any diagnostic helper/workflow additions.
3. Existing M-4 and M-12 production regressions remain unchanged.
4. No provider failure or unresolved M-11 evidence becomes `0 RUB`.
5. No unverified avoid-toll candidate is labelled confirmed free.
6. Every workflow/job is hard-bounded to <=20 minutes.
7. Split expensive map-matching diagnostics across small route groups instead of one long job.

## Stop / rollback conditions

- If exact M-11 identification requires a second full-route route request, stop and first determine whether the existing Valhalla maneuver response can expose the needed span, as it did for M-12.
- If official entry/exit mapping for a traversed component is ambiguous, return/retain `unknown`; do not interpolate or substitute a nearby tariff pair.
- If a change affects M-4/M-12 pricing before M-11 diagnostic proof is complete, revert the M-11 experiment only.
- Do not modify production `main` during Segment 6A.

## Official source set for the diagnostic stage

- ООО «Северо-Западная концессионная компания» / M11-Neva, section 15–58 km: current tariff documentation effective 24.04.2026.
- ГК «Автодор», M-11 section 58–679 km: 2026 category-I tariff matrices effective from 02.03.2026.
- Separate official schedule for km 679–684 / Pulkovo approach where applicable.

## Next action

Create a bounded 6A1 user-API baseline workflow using the unchanged branch implementation. Capture current behavior first; do not alter `lib/tolls.ts`, `verified-routes.ts`, or user pricing in 6A1.
