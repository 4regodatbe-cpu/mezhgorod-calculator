# Segment 6A1 — M-11 current user-API baseline result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / DIAGNOSTIC ONLY / GREEN
Production `main`: unchanged.

## Purpose

Capture what the unchanged branch currently returns for representative M-11 routes before changing any M-11 pricing logic.

This checkpoint is observational. It does not approve the current M-11 amounts as exact and it does not modify user pricing.

## Execution

Workflow: `Segment 6A1 M11 user API baseline`
Run: `36784653371`
Head: `e01a86a3c5da4c2bd18d1b66d4479a7b115fa6de`
Matrix jobs: `baseline (a)` and `baseline (b)`
Result: both SUCCESS.

Both jobs passed:

1. clean checkout of the branch;
2. dependency installation;
3. unchanged production `pnpm build` and TypeScript gate;
4. local production server startup;
5. user `/api/v2/calculate` baseline calls with `diagnostics=false`;
6. normal cleanup.

Each job remained well below the 20-minute hard bound.

Fixed diagnostic departure time: `2026-10-01T12:00:00+03:00`.

## Observed baseline

| Route | Fast route | Current toll result | Pricing status | Validation observation |
|---|---:|---:|---|---|
| Moscow → Saint Petersburg | 710.3 km / 410 min | 4580 weekday / 4780 weekend | `priced` | validation itself is `unknown`; fixed M-11 city-pair result suppresses full matching |
| Saint Petersburg → Moscow | 718.3 km / 416 min | 4580 / 4780 | `priced` | same fixed result, validation `unknown` |
| Moscow → Tver | 181.4 km / 152 min | null | `unknown` | 2/2 parts unverified |
| Tver → Moscow | 194.2 km / 156 min | null | `unknown` | 2/2 parts unverified |
| Moscow → Solnechnogorsk | 71.3 km / 83 min | 1000 / 1100 | `priced` | validation `unknown`; generic M-11 city-pair/segment result |
| Solnechnogorsk → Moscow | 71.4 km / 85 min | 1000 / 1100 | `priced` | validation `unknown`; generic M-11 city-pair/segment result |
| Tver → Saint Petersburg | 540.0 km / 293 min | null | `unknown` | 4/4 parts unverified |
| Saint Petersburg → Tver | 548.8 km / 298 min | null | `unknown` | 4/4 parts unverified |
| Solnechnogorsk → Saint Petersburg | 642.9 km / 342 min | null | `unknown` | 5/5 parts unverified |
| Saint Petersburg → Solnechnogorsk | 653.0 km / 347 min | null | `unknown` | 5/5 parts unverified |
| Sochi → Saint Petersburg | 2338.4 km / 1832 min | 9620 / 10870 | `priced` | validation proves M-4 toll traversal; the returned fixed total also contains an unproven M-11 component |
| Saint Petersburg → Sochi | 2339.4 km / 1833 min | 9620 / 10870 | `priced` | same mixed-road issue; M-4 PVP evidence does not prove the static M-11 component |

## Free-route truth invariant

All twelve controls returned:

- `free=false`;
- `freeCandidate=true` where an avoid-toll candidate existed;
- warning that independent validation did not confirm absence of paid sections.

Therefore Segment 3 free-route truth remains intact: an avoid-toll candidate was not relabelled as confirmed free.

## Confirmed M-11 failure modes

### A. False precision on selected known pairs

Some routes are returned as `pricingStatus=priced` even though the attached toll validation remains `unknown`.

The strongest examples are:

- Moscow ↔ Saint Petersburg: `4580 / 4780`;
- Moscow ↔ Solnechnogorsk: `1000 / 1100`.

The price is being treated as known because of local generic/full-route data rather than exact current M-11 entry/exit evidence.

### B. Current official 15–58 tariff disagrees with the stored daytime amount

For the diagnostic time — Thursday, 1 October 2026 at 12:00 — the current official Category-I, no-transponder tariff for Moscow ↔ Solnechnogorsk is `1130 RUB` in both directions.

The unchanged branch returns `1000 RUB` for the weekday amount, an underpricing of `130 RUB` on this control.

This proves that the current static first-section estimate is stale/inexact and must not be promoted as an exact M-11 engine.

### C. Full Moscow ↔ Saint Petersburg constant is not compatible with current component tariffs if the route actually traverses the full paid components

Current official component data imply, for a Thursday daytime full traversal that includes both:

- the Moscow/Solnechnogorsk 15–58 component: `1130 RUB`;
- the Avtodor 58–679 component: `3900 RUB`;

subtotal: `5030 RUB` before any separately applicable 679–684/Pulkovo component.

This is intentionally recorded as a conditional inference, not yet as the final exact Moscow↔Saint-Petersburg price: Segment 6A2 still has to prove the actual ordered M-11 entry/exit span(s) used by the current Valhalla route and whether the 679–684/Pulkovo component is traversed.

The current fixed `4580 RUB` therefore cannot be considered a current exact full-route tariff merely from city-pair and distance matching.

### D. Mixed M-4 + M-11 route has a cross-road truth gap

For Sochi ↔ Saint Petersburg, the result is `9620 / 10870` and `pricingStatus=priced`.

The validation message, however, is M-4 local PVP evidence only:

- Sochi → Saint Petersburg: 20 M-4 candidates, 16 confirmed, 4 rejected;
- Saint Petersburg → Sochi: 20 M-4 candidates, 15 confirmed, 5 rejected.

This confirms toll presence on M-4, but it does not independently establish the M-11 component embedded in the fixed mixed-road total.

A future exact M-11 adapter must compose with the already-proven M-4 amount instead of allowing M-4 validation to make an unproven M-11 amount appear exact.

### E. Partial-route coverage gap is currently truthful

Moscow↔Tver, Tver↔Saint Petersburg, and Solnechnogorsk↔Saint Petersburg all return `amount=null` with `pricingStatus=unknown`.

That is incomplete coverage, but it obeys the global truth invariant. These controls must remain unknown until exact entry/exit evidence plus official tariff coverage exist; they must not be filled with interpolated or nearby constants.

## 6A1 conclusion

The current M-11 implementation has two distinct problems:

1. **false precision** for a small set of fixed/generic known routes;
2. **large but truthful unknown gaps** for partial M-11 travel.

The replacement therefore needs a road-specific exact model, not another larger city-pair lookup table.

## No production change

Segment 6A1 changed only diagnostic script/workflow/checkpoint files.

No change was made to:

- `lib/tolls.ts` M-11 prices;
- `lib/verified-routes.ts`;
- `/api/v2/calculate` pricing behavior;
- M-4 or M-12 cores;
- production `main`.

## Next — Segment 6A2

Probe the existing Valhalla `/route` maneuver response and determine whether it supplies sufficient ordered M-11 evidence to identify:

1. M-11 entry and exit positions on the route;
2. separate continuous M-11 spans rather than one min/max envelope;
3. the 15–58 concession section;
4. the 58–679 Avtodor section;
5. the 679–684/Pulkovo approach only when actually traversed;
6. both travel directions;
7. mixed Sochi↔Saint-Petersburg without adding a second full-route request to production.

Do not change M-11 user pricing in 6A2.
