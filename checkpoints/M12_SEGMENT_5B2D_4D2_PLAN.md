# Segment 5B2D-4D2 — UI and analytics pricing truth

Date: 2026-09-30
Branch: `optimize-calculator-2`
Starting API checkpoint: `465b9c8b35a5cc478adc5d1e80145f314f13a22f`
4D-1 regression runs: `36775715331`, `36775927558` — SUCCESS.

## Goal

Preserve the API `priced | free | unknown` truth model all the way through the V2 UI, clipboard output, dual-route presentation, and anonymous route analytics.

## 4D-2A — client truth

1. `TollView.amount`, `weekdayAmount`, and `weekendAmount` become `number | null`.
2. `TollView.pricingStatus` is required: `priced | free | unknown`.
3. A fast route needs toll attention whenever pricing status is not `free`; empty `segments` alone must never imply a free/optimal route.
4. Unknown price displays `Стоимость не определена` and preserves manual toll entry.
5. Clipboard output writes `Платная дорога: стоимость не определена` for unknown automatic pricing instead of formatting null as 0 RUB.
6. Dual mode treats any unknown leg as unresolved toll pricing; it must not present an aggregate toll sum as complete.
7. Known positive prices and independently proven free routes keep their current behavior.

## 4D-2B — analytics truth

1. `route_v2` analytics accepts nullable `tollWeekday` / `tollWeekend`.
2. Add `tollPricingStatus` to the event.
3. `unknown` must send null monetary toll values, never asserted zeros.
4. `free` may send exact zeros.
5. `priced` must send finite non-negative numeric values.
6. Keep backward compatibility for older route_v2 clients that send numeric toll values without the new status.

## Gates

- `pnpm build` / TypeScript.
- Source-level truth assertions for UI and analytics semantics.
- Existing 4D-1 unknown API assertion stays green.
- No changes to M-4/M-12 pricing cores or route selection.
- Each CI job <= 20 minutes.

## Rollback

If client/analytics changes break build or violate truth assertions, roll back only 4D-2. Keep the accepted 4D-1 API boundary unchanged.
