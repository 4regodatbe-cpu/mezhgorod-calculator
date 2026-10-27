# Reliability plan — final consolidation

Date: 27.10.2026. Branch: `fix/v3-missing-route-prices-2026-10-15`. PR #14 remains Draft.

## Outcome

23 of24 blocks are DONE; block23 is PARTIAL. This is not a24/24 acceptance: a full current-head build/final hosted gate remains unverified. Block24 is DONE as a truthful consolidation of evidence and blockers.

## Completed and verified

- Blocks1–22 are recorded DONE in the plan. In this session block21 completed: corrected temporary strict TypeScript check for `scripts/**/*.ts` and `lib/**/*.test.ts` returned zero diagnostics. Initial57 diagnostics included three `RequestInit.next` errors from missing Next ambient types; the remaining54 actual type errors were corrected in small groups without weakening assertions. App `npx tsc --noEmit` passes. No strict CI gate was added.
- Block20's bounded offline Eisk/Maykop profile remains saved: provider response and route geometry/result hashes match with zero network requests. This is not an E2E/SLA or upstream latency benchmark.
- Current-head block23 regression:17 affected test files PASS; two standalone CKAD/M11 scripts PASS. Scoped ESLint and `git diff --check` PASS. The earlier 18/18 focused regression checkpoint remains historical evidence.
- No fare values, route-selection behavior, toll geometry, Production, Android, main, or backup branch were changed in this continuation.

## CI and environment evidence

Actions run [40469828321](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40469828321) on an earlier SHA completed overall SUCCESS: `verify` (including TypeScript and Next build) and `calculation_timing` passed. The tolerated `live_probe` job failed on the address collector: Ростов and Красн passed; Донецк was SOURCE_UNAVAILABLE after HTTP503/cooldown. The 50-settlement and Yandex steps were skipped. Artifact [12718511135](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40469828321/artifacts/12718511135) is retained. This is not a full-build claim for the current SHA.

A current-head full build was not run. `npm run build` invokes broad `test:audit`; local nationwide child-process checks have a known Codex `spawnSync` EPERM. The prior hosted verify unexpectedly activated live probes because pending changes were classified against an older baseline. Neither another broad route audit nor another uncontrolled live probe is justified. No run was cancelled or initiated during this consolidation.

## Remaining risks and blocked scope

- Block23 remains PARTIAL until a safe current-head build/final gate can run without activating unrelated live probes. No assertion was relaxed.
- Historical BLOCKED_BY_DATA items B02 and B04–B09 remain unchanged; they need new primary sources or provider availability. No tariff or `effectiveFrom` value was inferred.
- Block20 performance results are bounded offline CPU measurements only; they do not establish end-to-end latency, upstream performance, allocation peaks, or multi-road missing-tariff behavior.
- The address-source failure in run404698 is an environment/service observation, not proof of a calculator regression. Do not repeat it without changed conditions or a new reason.

## Recommended next step

If a final current-head build is required, first authorize a narrowly isolated GitHub-hosted verify/build path that cannot schedule `live_probe`, or correct and verify the pending-update CI classifier in a separate scoped change. Keep PR #14 Draft until that gate is explicitly resolved. Until then, retain block23 PARTIAL; do not report24/24.

## References

- [Block21 strict typecheck](checkpoints/2026-10-27-1130-block-21-scripts-typecheck-DONE.md)
- [Block23 targeted regression](checkpoints/2026-10-27-1140-block-23-targeted-final-regression-PARTIAL.md)
- [Block20 offline profile](checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md)
- [Current state](WORK_STATE.md) · [work log](codebase-audit/WORK_LOG.md) · [next steps](codebase-audit/NEXT_STEPS.md)
