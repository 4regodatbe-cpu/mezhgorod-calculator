# M-12 Segment 5B2D-4D — unknown pricing truth

Date: 2026-09-30
Branch: `optimize-calculator-2`
Starting checkpoint: `fe35d32906527041942a05233af48d88be5db57a`

## Confirmed defect

The green 5B2D-4C user-API diagnostic for Kazan -> Vladimir returned:

- `tollValidation.status = unknown`
- validation message: `5/5` map-matching parts unverified
- `tolls.amount = 0`
- `weekdayAmount = 0`
- `weekendAmount = 0`
- no toll segments

The M-12 route core itself is conservative and returns `amountRub = null` for unknown evidence. The incorrect numeric zero is introduced later by the generic/legacy API output path.

This violates the project invariant: **unknown / incomplete / timeout must never become an exact `0 RUB`.**

## 4D-1 — API truth model

1. Keep all internal `TollEstimate` arithmetic unchanged.
2. At the user API boundary expose an explicit pricing state:
   - `priced` — a positive exact/verified amount is available;
   - `free` — zero is allowed only when the fast route is independently proven free;
   - `unknown` — exact toll price is unavailable.
3. For `unknown`, expose `amount`, `weekdayAmount`, and `weekendAmount` as `null`, never numeric zero.
4. Do not alter the M-12 core, M-4 core, route selection, recovery mathematics, or official tariff snapshots.

## 4D-2 — UI/analytics truth model

1. Update V2 response types for nullable toll amounts and `pricingStatus`.
2. UI must show `Стоимость не определена` for `unknown` and must not format `null` as `0 RUB`.
3. Manual toll input remains available.
4. Copy-to-clipboard must say price is not determined instead of `0 RUB`.
5. Analytics must not write unknown toll price as an asserted zero; omit/null unknown monetary values where the collector contract allows it.
6. Dual/optimal logic must not infer "no tolls" merely from an empty segment list when pricing status is unknown.

## Gates (each <= 20 minutes)

- Kazan -> Vladimir 5B2D-4C control: `pricingStatus=unknown`, all monetary toll fields null, no confirmed-free fast route.
- Existing exact M-12 API controls remain exact (including Moscow -> Kazan = 5847 RUB where already covered by the established gate).
- Existing reverse/partial M-12 regression groups remain green.
- M-4 regression remains green.
- free-truth regression remains green.
- production build passes TypeScript.

## Rollback rule

If nullable API semantics cause unrelated route/pricing regressions, revert only 4D changes and retain the 5B2D-4C diagnostic/checkpoint. Do not weaken the unknown != 0 invariant.
