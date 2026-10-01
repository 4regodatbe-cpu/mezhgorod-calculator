# Segment 10 — UX truthfulness and final regression / production readiness

Date: 2026-10-01
Base: `optimize-calculator-2` after Segment 9.

## Required gates
1. User-facing V2 must distinguish `priced`, confirmed `free`, detected/possible toll with unknown price, and unverified free alternative.
2. No UI path may render unknown toll money as `0 ₽`.
3. Obsolete copy implying Yandex directly supplies exact toll money must be removed/reworded.
4. Attribution must reflect actual route stack, not claim OSRM alone.
5. Build and lint must pass.
6. `/api/v2/calculate` user regression must pass.
7. Targeted Segment 3/4/5/6/7/8/9 road-engine gates must pass where deterministic/offline; network probes remain diagnostics, not release truth.
8. Production-readiness report must list remaining source-data limitations.
9. No changes to `main`; work remains isolated until Segment 10 PR is reviewed/merged into optimization branch.
