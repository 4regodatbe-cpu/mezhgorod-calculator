# Codebase audit block 18 — governance and synthesis — DONE — 26.10.2026 21:39 МСК

Branch fix/v3-missing-route-prices-2026-10-15; parent 66a98948108e35379ef7b06c79319783e4087f16; PR #14 open/Draft, base audit/v3-matrix-provenance-2026-10-14; Actions idle before save. This closes the new 18-block static audit only; it does not indicate release readiness.

Data governance review: feature switches show addressCitySnapshot=false. Tariff freshness source registry has4 entries; mechanical calculation at 2026-10-26 gives stale=0 using observedAt thresholds, but3 entries have effectiveFrom=null. calculator-final-gate pins TARIFF_AS_OF=2026-10-02; strict script fails only on stale entries, not unknown effective date. Record AUD-DATA-01; no tariff values/source claims changed.

Final report docs/CODEBASE_AUDIT.md includes P0-P3, evidence/confidence, risk/benefit/isolation, saved Eisk/Maykop outputs and strict non-change list. Current findings: no proven P0/P1; P2 API date/error status, Node mismatch, tariff freshness metadata/gate, scripts typecheck gap, public collection limits, incomplete-trace recovery concern, V2 unmount cleanup, direct geocode timeout, API body/provider response limits, focused test gaps. P3 architecture coupling and action reference hardening.

No test/build/browser/security scan/benchmark/network request executed during audit. 145 tests statically matched test:audit patterns; no coverage report. Branch protection check 403, required contexts unknown. No app/tariff/CI behavior changed.

Timestamp correction: B7–B17 filename/header sequence timestamps were assigned without checking the live clock and exceed actual session time. Exact individual completion time is unknown; this note supersedes those time claims. Content, completion order and durable commits/readbacks remain valid.

Done 18/18 blocks (100% of this static audit). Next project step: choose an independently authorized finding and perform small focused fix/test; do not change tariffs or routing logic from this report alone.
