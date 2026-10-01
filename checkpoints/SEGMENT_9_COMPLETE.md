# Segment 9 — COMPLETE

Date: 2026-10-01
Branch: `segment9-external-toll-benchmark`
Base: `optimize-calculator-2` @ Segment 8 checkpoint `9678df43`.

## Delivered
- Provider capability audit: HERE Routing API v8 chosen for optional executable benchmark; TollGuru retained as candidate, with no invented unauthenticated observations.
- 32-case corpus across M-4 (10), M-11 (8), M-12 (8), CKAD (6).
- Evidence-gated exact amounts: known controls are populated; unresolved current official amounts stay `null`, never guessed.
- Pure fail-closed benchmark assessment/scoring module separates route compatibility, toll coverage, amount deviation and failure mode.
- Optional HERE live runner requiring `HERE_API_KEY`; key is never committed.
- Deterministic regression checks ensure `tollsDataUnavailable`, unpriced tolls and currency mismatch cannot become a trusted 0 RUB result.
- Production `/api/v2/calculate` deliberately contains no HERE integration.
- Dedicated CI workflow added for deterministic corpus + production build.

## Evidence boundary / result
The external-provider benchmark architecture is complete, but no authenticated HERE/TollGuru credential was available to generate live provider observations in this execution. Therefore there is intentionally NO claim that HERE or TollGuru has passed Russian amount accuracy. The provider remains validator-only and is not promoted to production fallback.

This is the correct fail-closed Segment 9 outcome: capability is implemented and reproducible; trust remains gated on live evidence rather than assumption.

## Production impact
None. `main` untouched. `optimize-calculator-2` untouched until this isolated Segment 9 branch is explicitly merged. No toll pricing behavior changed.
