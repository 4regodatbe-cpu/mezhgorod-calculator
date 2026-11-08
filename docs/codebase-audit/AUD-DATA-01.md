# AUD-DATA-01 — freshness/provenance evidence and recommendation

Status: INVESTIGATED; exact effective-date provenance remains `BLOCKED_BY_DATA`. Evidence source snapshot: allowed branch commit `7769f0b0840962ac7289acdb04f08e57e9a6e8a8`. No external requests, fare changes, or metadata edits.

## Facts

- `.github/workflows/calculator-final-gate.yml:55-59` sets `TARIFF_AS_OF: '2026-10-02'` with `TARIFF_STALE_STRICT: '1'`.
- `scripts/check-tariff-freshness.mjs:3` defaults to current UTC date only when the environment override is absent. It computes staleness from `observedAt` and `staleAfterDays` (`:12-14`); missing `effectiveFrom` only increments/logs `incomplete` (`:15-18`). Strict exit2 is triggered only by stale rows (`:19`), not by unknown effective dates.
- `lib/toll-engine/tariff-registry.ts` snapshot blob `1cf2b718eee06e823d70304dbf96d2bb689c2815`: rows `m11-58-679-2026-10-01-a1-current` (`:11-14`) and both `avtodor-other-roads` products (`:17-26`) explicitly say exact effective-from is not independently established and set `effectiveFrom:null`. The M12 row has an explicit date (`:5-8`).

## Offline reproduction

- `node scripts/check-tariff-freshness.mjs` at the current runner date 2026-10-26: 4 snapshots, 0 stale, 3 unknown effective dates; observation ages 24/25 days.
- `TARIFF_AS_OF=2026-10-02 node scripts/check-tariff-freshness.mjs`: 0 stale, 3 unknown dates; ages appear as 0/1 day because the workflow fixes the baseline to its observation period.
- `TARIFF_AS_OF=2026-11-20 TARIFF_STALE_STRICT=1 node scripts/check-tariff-freshness.mjs`: 4 stale, 3 unknown dates, exit2. This is a deterministic future-date simulation only, not a claim about future tariff validity.

## Assessment and recommendation

The confirmed defect is in freshness-gate time semantics: the workflow's fixed date prevents aging observations from becoming stale in future runs. Separately, the registry preserves unknown legal effective dates without failing the freshness gate. This evidence does **not** establish that any current fare sum is inaccurate or that a tariff is inapplicable.

Recommended follow-up: base age on the actual UTC CI run date, retain an explicit test override for reproducibility, and report `effectiveFrom: UNKNOWN` separately as unresolved legal provenance. Retrieve and review the applicable operator primary orders/annexes before populating effective dates or changing numeric fares. Until then, preserve null/unknown; do not infer zero or invent dates.

No production code, tariff amount, `effectiveFrom`, or workflow was changed in this investigation.
