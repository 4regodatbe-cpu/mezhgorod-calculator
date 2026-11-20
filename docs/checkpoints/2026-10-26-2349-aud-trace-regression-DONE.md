# AUD-TRACE-RECOVERY-01 — V2 trace regression — DONE

- Status: DONE (offline characterization); parent `529fb708bd880f9396b3399f5ec389eea78d7041`; branch `fix/v3-missing-route-prices-2026-10-15`; PR #14 remains Draft.
- Input: saved synthetic M12 geometry from `scripts/v3-unpriced-coverage-audit.test.ts`, departure `2026-10-13T12:00:00+03:00`, and the saved complete/incomplete validation cases described in `docs/codebase-audit/AUD-TRACE-RECOVERY-01.md`.
- Added `scripts/v2-partial-trace-recovery.test.ts`: the two cases are fed through V2 `calculateLegTolls` and `tollsForApi`. Both returned internal amount `995` and public `pricingStatus: "priced"`; incomplete case retained `complete:false` and partial coverage. Network was replaced by a throwing counter and observed calls were 0.
- Check: `node --import ./scripts/register-ts-paths.mjs --test scripts/v2-partial-trace-recovery.test.ts` PASS (both nested cases); `git diff --check` PASS.
- Interpretation: confirms the previously reported serialization risk for this synthetic fixture, not an official tariff or an observed user-route overcharge. Positive amount is not sufficient evidence of a complete route-wide fare; `status:"toll"` alone does not establish trace completeness. No recovery thresholds, tariff values, public status rules, or business behavior were changed.
- Decision needed: user approval is required before changing how incomplete/recovered V2 values are exposed. See the separate proposal checkpoint/doc in the next block.
- Evidence limitation: no live routing, mass route audit, or external service was used. The helper amount `995` is only an output of the existing approximate recovery table for this fixture.
- Durable save is recorded by the following commit and verified remote readback; exact remote SHA is intentionally not self-referenced here.
- Next: save a behavior proposal and pause that policy-change block for approval; continue with independent freshness-gate work.
