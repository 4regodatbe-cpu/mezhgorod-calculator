# Reliability plan — final consolidation

Date: 27.10.2026. Branch: `fix/v3-missing-route-prices-2026-10-15`. PR #14 remains Draft.

## Outcome

All24 technical-plan blocks are DONE (100%). This means the defined 24-block engineering plan met its bounded acceptance criteria; it does not close all functional B01–B12 issues or data blockers. Block24 consolidates verified results and remaining limitations.

## Completed and verified

- Blocks1–22 are recorded DONE in the plan. In this session block21 completed: corrected temporary strict TypeScript check for `scripts/**/*.ts` and `lib/**/*.test.ts` returned zero diagnostics. Initial57 diagnostics included three `RequestInit.next` errors from missing Next ambient types; the remaining54 actual type errors were corrected in small groups without weakening assertions. App `npx tsc --noEmit` passes. No strict CI gate was added.
- Block20's bounded offline Eisk/Maykop profile remains saved: provider response and route geometry/result hashes match with zero network requests. This is not an E2E/SLA or upstream latency benchmark.
- Block23 final hosted verification: Actions run [40479628024](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40479628024) passed on source SHA `ea80282643f67886bd6486610a291ca8cffc05ce` / tree `2102cb20b95af94cbe1f986bfe9d2c012faeb79e`. Its synthetic PR merge checkout `1f255de30eae69474d4c801ed62377d8802de700` has the exact same tree. Node24.21.0, Next16.3.4, 458/458 primary tests,10/10 classifier tests,4/4 capture-selector tests, TypeScript `--noEmit`, and direct production `next build` all PASS (`Compiled successfully in5.1s`). The workflow classifier reported `no-route-runtime-change-in-update`; `live_probe` and `calculation_timing` were SKIPPED. Full Actions logs are retained in the run; a separate build-only artifact is not required for this acceptance evidence. The local sandbox EPERM is not an app defect.
- No fare values, route-selection behavior, toll geometry, Production, Android, main, or backup branch were changed in this continuation.

## CI and environment evidence

Historical Actions run [40469828321](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40469828321) on an earlier SHA had a tolerated live-probe address-source failure; it remains historical environment evidence and was not repeated. Current-source build evidence is run40479628024 above.

No `pnpm build`, mass `test:audit`, route audit, provider capture, or uncontrolled live probe was run for final acceptance. Current PR verification used direct `next build` after TypeScript and focused tests; live jobs were skipped by the classifier. The dedicated `route-quality` build-only mode is configured, but a separate dispatch/artifact was unnecessary because this run supplied sufficient source-matched logs and results.

## Remaining risks and blocked scope

- Historical functional B01–B12 BLOCKED_BY_DATA items B02 and B04–B09 remain unchanged; they need new primary sources or provider availability. No tariff or `effectiveFrom` value was inferred.
- Block20 performance results are bounded offline CPU measurements only; they do not establish end-to-end latency, upstream performance, allocation peaks, or multi-road missing-tariff behavior.
- The address-source failure in run404698 is an environment/service observation, not proof of a calculator regression. Do not repeat it without changed conditions or a new reason.

## Recommended next step

Continue only separate functional/data-blocked B01–B12 items when new reliable inputs become available. Do not reopen completed technical block23 without a new cause. Keep PR #14 Draft and do not infer tariffs from missing evidence.

## References

- [Block21 strict typecheck](checkpoints/2026-10-27-1130-block-21-scripts-typecheck-DONE.md)
- [Block23 targeted regression](checkpoints/2026-10-27-1140-block-23-targeted-final-regression-PARTIAL.md)
- [Block23 hosted build acceptance](checkpoints/2026-10-27-1245-block-23-hosted-build-DONE.md)
- [Block20 offline profile](checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md)
- [Current state](WORK_STATE.md) · [work log](codebase-audit/WORK_LOG.md) · [next steps](codebase-audit/NEXT_STEPS.md)
