# Address retry — publication gates and remaining-budget regressions

Status: LOCAL DONE analysis/tests; REMOTE BLOCKED by CI scope. 28.10.2026 MSK.
Remote source: 8fb4d137308450affc984de272adebbfd67d0851. Original local fix commit 8d36296104abe8ae614dbb1c05e023d117942859 remains intact. PR14 Draft, no active Actions at inspection. No publication or workflow changes.

## Exact automatic behavior

Read all workflow event filters as YAML and compared permitted push branch/current PR base with changed paths. A push with lib/photon-fetch.ts and regression files has no matching direct push workflow. The associated PR synchronize event triggers special-territory-policy.yml: verify (including mandatory offline test:audit, TS and build), classify_live_scope, and live_probe/calculation_timing because classifyChangedPaths returns {shouldRunLive:true,reason:route-runtime-changed}. live_probe includes provider geometry, address probe, 50-settlement route audit and six Yandex references. No jobs were executed for this inspection.

PR path filtering uses accumulated PR changes. Connector list_pr_changed_filenames confirms .github/workflows/b03-address-ui-browser.yml and app/v2/components/address-field.tsx are in PR14, so b03-address-ui-browser.yml can also run verify/address-ui on synchronize despite the new delta not changing UI. Calculator final gate and Android PR workflows target main, not current PR base audit/v3-matrix-provenance-2026-10-14. route-quality push targets main; its manual build-only job (Node24/TS/direct build/artifacts) exists but does not suppress an independent PR event and cannot validate an unpublished local commit.

No currently configured ordinary runtime-publication path avoids broad live jobs while retaining normal protections. Do not use skip tokens, event suppression, PR closing/retargeting, alternative writers, job cancellation or classifier bypass. Existing transport limitations are not authorization to evade events.

Concrete permission needed: authorize narrowly scoped CI work to give this exact address-transport change a targeted acceptance path while preserving mandatory offline checks, TypeScript/build and strict routing/tariff/unknown-diff handling. The change must be separately reviewed/tested before runtime publication. Existing mandatory offline test:audit was rejected by automatic review as a wide audit in the previous block; execution of that existing gate also needs explicit scope clarification. Alternative is explicit permission for one normal PR update including its broad jobs. Neither permission is assumed here.

## New checks only

scripts/photon-retry-budget.test.ts: 3/3 PASS on Node24.19.0, mocked timers:
1. First connection consumes19s; retry still alive at19.999s, aborted at20s.
2. Simulated queue consumes17s; collector cancels retry after remaining3s, all7 variants marked budget, all transport signals aborted.
3. Noncooperative late retry response after caller cancellation cannot resolve the rejected request.

Command: node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none scripts/photon-retry-budget.test.ts. New test and prepared browser script passed scoped ESLint; browser script syntax checked; git diff --check passed. No prior successful test suite/build repeated. No application-code change since original fix.

## Prepared UI acceptance (NOT RUN)

experiments/road-ref-boundaries/scripts/address-retry-clear-scenarios.mjs: desktop1280x900/mobile375x812; select Yalta/A and SPb/B, clear/replace A10times with Volnovakha/Donetsk, preserve B; clear/replace B10times, preserve A; controlled first502 and retry; homonym must not auto-select. All address replies and coordinate fixtures are explicitly synthetic; no claim of live geocoding, full calculation or Preview acceptance. Run against an approved locally started app or Preview with ADDRESS_UI_BASE_URL, PLAYWRIGHT_MODULE, optional CHROME_PATH and ADDRESS_UI_OUTPUT_DIR. Browser execution has not occurred. The prior existing B03 scenarios are not re-run or counted as new results.

Full user acceptance still requires an approved Preview: real geocoding, real initial/repeated calculation and mobile interaction. A prepared mocked UI test is not that evidence.

Original portable patch SHA256:47817b99edcc4d7bbcd2c02ef7207da4c106000e533ab9d81db07ac0458bacb0 at /tmp/address-resilience-handoff/0001-fix-address-retry-one-transient-connect-timeout-with.patch. Preserve it and local fix commit. Next: obtain the specific CI scope permission above, then publish non-force with expected-parent and remote tree/readback, inspect actual CI/Preview before declaring the defect fixed.
