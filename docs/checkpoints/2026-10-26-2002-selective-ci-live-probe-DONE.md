# Selective PR live-probe CI — DONE

- Status/time: DONE, 26.10.2026 20:02 МСК (Actions run 40364820838 completed at 17:02 UTC).
- Source branch/head before documentation finalization: `fix/v3-missing-route-prices-2026-10-15` / `f2208fdae88983b5efe1ce69c29d3b9da6845c57`.
- PR #14 remains open and Draft. Main, Android, backup and Production were untouched; no merge, force push or Action cancellation.

The existing PR `verify` job still runs project tests, TypeScript and Next build. Existing live probe commands/assertions are unchanged. A classifier compares the current PR head against the latest completed run of this workflow associated with the same PR and allowed head branch. It skips `live_probe`/`calculation_timing` only when previous checks are reliable and GitHub compare returns a complete linear delta without runtime paths. Missing/failed verify, incomplete checks, unavailable baseline, API errors, invalid or diverged comparison, and ≥300 changed files fail open to existing live jobs. Explicit `workflow_dispatch` still runs them. No concurrency/cancellation behavior was introduced.

## Verification

- Local classifier model: `node scripts/special-territory-live-push-classifier.test.mjs` — 10/10 PASS, including diagnostic-only, runtime algorithm, test-only, workflow-only, mixed runtime+test, incomplete compare/baseline, exact output formatting and prior-check reliability.
- Local syntax, YAML/job wiring, `git diff --check`: PASS.
- Hosted [run 40364820838](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40364820838): SUCCESS. `verify` PASS (435 existing project tests + 10 classifier tests, TypeScript and Next build); `classify_live_scope` PASS with `head-already-checked`; `live_probe` and `calculation_timing` SKIPPED. This confirms a follow-up non-runtime update in the cumulative PR does not relaunch broad live jobs.
- First hosted [run 40363211385](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40363211385): classifier computed `head-already-checked` but initially failed because diagnostic JSON went to stdout redirected into `$GITHUB_OUTPUT`. Fail-open activated; run was not cancelled. `verify`, timing and geometry passed; address collector returned Ростов PASS, Красн failed after five HTTP503 plus cooldown, Донецк unavailable after cooldown; 50-settlement/Yandex steps skipped. Artifact `12668374825`. The helper now writes diagnostics to stderr. Do not repeat address audit without a new reason.

The exact readback of workflow, classifier, tests and checkpoint/docs was confirmed at the following branch head; PR remains Draft. This work changes no application/tariff/geometry logic, `addressCitySnapshot`, or unrelated workflow. Next: narrow B10 to Maykop only and run only if classifier confirms live jobs skip.
