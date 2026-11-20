# Stage W M‑4 tariff reconciliation — STARTED LOCAL

- Status: STARTED; 2026-11-06 UTC.
- Source/branch: `d60e733313860d2412d8be64f4be10ef71f7de28` → `codex/stage-w-m4-tariffs`; PR #14 stays Draft.
- Scope: full category-I M‑4 source table and V3 data path; diagnose five known full-gate failures. Exclude Stage V trace-fix; no push or deployment.
- Initial findings: Order 58 is an official historical schedule effective 2026-03-02. `lib/toll-engine/m4-data.ts` records a later official-table verification 2026-09-29. The current official tariff page (retrieved via official-domain web search 2026-11-06) displays four columns for category I (Mon–Thu transponder/no transponder; Fri–Sun transponder/no transponder); its no-transponder cells match `m4-data.ts`, not Order 58. The posted page says tariff effective date is in the detailed PDF, but direct access to page/PDF returns 403; the later legal effective date is not confirmed.
- V3 path: `lib/v3-calculation/route-leg-pricing.ts` calls `matrixM4Component`; `experiments/nationwide-tolls/engine/m4-route-adapter.mjs` quotes runtime-eligible rows from `experiments/nationwide-tolls/M4_ACTIVE_ENDPOINT_REGISTER.json`. Those rows mostly cite March Order 58 and are not sourced from current `M4_DATA`. Thus the current source file may be correct while V3 matrix estimates are stale. All matrix outputs are unconfirmed at the route-application level.
- Relevant code and evidence preserved in `experiments/nationwide-tolls/checks/2026-11-06-stage-w-m4-current-tariffs/README.md`.
- Next: implement a deterministic current-rate matrix transformation only where selected product vectors are supported; otherwise fail closed to unknown. Add both-profile regressions before further pricing changes.
