# Selective PR live-probe CI — DONE

- Status/time: DONE, 26.10.2026 20:02 МСК (timestamp corrected; this draft path's `2130` suffix was wrong and is retained without deleting history).
- Accurate checkpoint path: [2026-10-26-2002-selective-ci-live-probe-DONE.md](2026-10-26-2002-selective-ci-live-probe-DONE.md).
- Source branch/head before this checkpoint: `fix/v3-missing-route-prices-2026-10-15` / `f2208fdae88983b5efe1ce69c29d3b9da6845c57`.
- PR #14 remains open and Draft. `main`, Android, backup, Production, merge, and force push untouched.
- Files changed for this bounded block: `.github/workflows/special-territory-policy.yml`, `scripts/classify-special-territory-live-push.mjs`, `scripts/special-territory-live-push-classifier.test.mjs`, proposal/status/log/checkpoint docs.

## Behavior

The existing PR `verify` job still runs project tests, TypeScript and Next build. The existing live probe commands and assertions are unchanged. A new classifier compares the current PR head against the latest completed run of this workflow associated with the same PR and allowed head branch. It skips `live_probe`/`calculation_timing` only when prior checks are reliable and GitHub compare returns a complete linear delta with no runtime paths. Missing/failed verify, incomplete checks, unavailable baseline, API errors, invalid or diverged comparison, and ≥300 changed files fail open to the existing live jobs. Explicit `workflow_dispatch` still runs them. No concurrency/cancellation behavior was introduced.

## Verification

- Local model: `node scripts/special-territory-live-push-classifier.test.mjs` — 10/10 PASS, including diagnostic-only, runtime algorithm, test-only, workflow-only, mixed runtime+test, incomplete compare/baseline, exact output formatting and prior-check reliability.
- Local syntax/YAML/job-wiring/`git diff --check`: PASS.
- Hosted run [40364820838](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40364820838): SUCCESS. `verify` PASS (435 existing project tests + 10 classifier tests, TypeScript and Next build); `classify_live_scope` PASS with `head-already-checked`; `live_probe` and `calculation_timing` SKIPPED. This confirms a follow-up non-runtime update in the cumulative PR does not relaunch the broad live jobs.
- First hosted run [40363211385](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40363211385): classifier correctly computed `head-already-checked` but initially failed because diagnostic JSON went to stdout redirected into `$GITHUB_OUTPUT`. Fail-open activated; run was not cancelled. `verify`, timing and geometry passed; address collector returned Ростов PASS, Красн failed after five HTTP503 plus cooldown, Донецк unavailable after cooldown; later 50-settlement/Yandex steps were skipped. Artifact `12668374825`. The helper now writes diagnostics to stderr and tests both output values. Do not repeat the address audit without a new reason.

## Limits and next step

The change does not alter application algorithms, tariff/geometric logic, `addressCitySnapshot`, Production, or the other workflows. Hosted Actions run timestamp is 2026-10-26 17:02 UTC = 20:02 МСК. Remote PR head was read back as `f2208fdae88983b5efe1ce69c29d3b9da6845c57` before docs finalization. Next: inspect the already-prepared B10 workflow and capture harness for Maykop-only scope, confirm the expected current-update classifier result will be non-runtime, then make at most one narrow Maykop capture with raw provider responses/status/hash and offline replay/V3 comparison. Do not recapture Eisk. If safe skip cannot be proven, do not launch B10 automatically.
