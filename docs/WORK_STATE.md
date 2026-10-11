## CURRENT 2026-10-11 — Yandex route checks expanded

- **DONE — read-only route controls:** Yandex checks now include disputed alternatives Казань—Набережные Челны (~90/278 ₽) and СПб—Кронштадт (~600/300 ₽), plus long controls СПб—Москва (~6 150 ₽), Москва—Казань (~5 250 ₽), Москва↔Краснодар (~5 530/~5 260 ₽). Older M1/M3 checks remain documented. Exact observations, limitations and failed A-289 endpoint resolution are in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`.
- **INTERPRETATION:** these are route estimates for passenger car <2 m/no transponder; they do not certify per-gate tariffs or operator receipts. Route alternatives/direction deltas are unresolved checks, not billing corrections. A-289 not confirmed by the malformed endpoint. No all-network coverage claim.
- **DONE — docs persisted:** reconciliation appended and work log updated; commit `2b378c9b969b8c7190abfb8ae040b2c974c04bbc`. No code/tariff change. No tests/build/deploy run (docs-only research). Existing branch Preview remains on earlier source SHA; production untouched.
- **NEXT:** resolve each materially divergent route against exact selected geometry, dated operator tariffs and matching official trip calculator/receipt; expand targeted Yandex checks for open network groups listed in `NEXT_STEPS.md`. Never convert estimates directly to live prices.

---

## CURRENT 2026-10-11 — Yandex Maps fare controls observed

- New read-only route checks recorded in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`: M3 selected alternatives Калуга↔Москва estimate ~290 RUB both directions; M1 Одинцово→Голицыно estimate ~50 RUB on a selected route including M-1. Yandex labels amounts approximate for car under 2 m without transponder. These are route-level benchmarks, not gate-isolated full-road tariffs.
- Official indexed Avtodor tariff snapshot shows M1 full paid section 33–66 km / PVP46 = 250 RUB no transponder, but direct tariff page returned 403; effective date remains unverified. M3 800 vs 520 component conflict remains open. No fare cutover; unknown remains unknown.
- Preview release status above remains READY for source SHA `3d86e02`; later commits only update experiment documentation. See `WORK_LOG.md` dated 2026-10-11 for verified Preview and Yandex checks. No unit tests/build deployed for this research-only addition.
- **NEXT:** match exact paid gates/entry-exits for control routes; obtain applicable dated official tariff or same-time operator calculator quote; then extend validation to remaining systems. No production change.

---
