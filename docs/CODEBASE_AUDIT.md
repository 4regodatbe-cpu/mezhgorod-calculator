# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; audit has 18 blocks. Source remote branch fix/v3-missing-route-prices-2026-10-15, initial baseline f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d. Только read-only анализ кода/истории. Код, логика, тарифы, CI/Production не менялись. Нет запусков тестов/build/browser/live/probes. Progress относится только к этому аудиту.

## Прогресс

B1 architecture; B2 address; B3 cache; B4 API inputs; B5 providers; B6 route selection; B7 saved V2/V3; B8 geometry; B9 tariff composition; B10 V2 UI; B11 V3 UI; B12 response contracts; B13 security; B14 performance; B15 deps/build; B16 tests; B17 CI; B18 governance/synthesis. Done 17/18 (94.4%). [B17 checkpoint](checkpoints/2026-10-26-2331-codebase-audit-block-17-DONE.md).

## Saved V2/V3 output comparison

Ейск Thu/Sat V2−V3 fare +580/+1,530₽, distance −1m/time 0s; Майкоп Thu/Sat 0₽, −1m/0s. Existing capture/replay outputs only; no independent operator tariff evidence.

## Findings — P2 candidates / contract gaps

1. **AUD-GEOCODE-01:** label-only Photon geocode lacks local deadline; possible held handler; untested. Bounded transport/abort regression.
2. **AUD-API-01:** API body/label caps not explicit; platform caps unknown.
3. **AUD-PROVIDER-01:** no explicit JSON provider response size cap; upstream limits unknown.
4. **AUD-TEST-01:** V2 invalid geometry regression not found; current route controls reject missing geometry; coverage gap only.
5. **AUD-TRACE-RECOVERY-01:** partial trace status=toll can lower corridor recovery geometry threshold (M4 2 of4, M12 2 of5) and may produce matched amount for matched subset. Possible partial-total classification, no repro; add fixtures before policy change.
6. **AUD-UI-01:** V2 hook lacks unmount abort; possible orphan server work. V3 cleanup exists.
7. **AUD-DATE-01 (confirmed input validation mismatch):** V2 route.ts:48 accepts normalized impossible date/zone-less time; V3 strict calendar/timezone validation. Direct API malformed input can select wrong fare period; UI normally sends ISO. Share strict validator + tests.
8. **AUD-ERROR-01 (confirmed status contract weakness):** V2 line97/V3 line132 map unknown internal failures to HTTP400; use typed client/upstream/internal mapping (400/502/500).
9. **AUD-SEC-01:** public /api/collect parses before truncation and has no visible body/rate/webhook deadline controls. Abuse untested; verify platform rate controls.
10. **AUD-BUILD-01 (confirmed typecheck gap):** tsconfig excludes scripts, which test:audit runs via Node; no TS check for those tests. Add no-emit config/check.
11. **AUD-CI-01 (confirmed runtime mismatch):** package engines require Node24.x (package.json), but scheduled .github/workflows/route-quality.yml and .github/workflows/systemic-toll-composition.yml set Node22.13.0. This can cause runs to use unsupported runtime or fail engine/tool behavior; actual failure not reproduced. Align runners to Node24 and verify both workflows in isolated CI; low risk, workflow-local.

All P2; no confirmed P0/P1. The temporary V2 empty-geometry P1 hypothesis was withdrawn after public paths were shown to require ordered plan controls. The saved Eisk price delta is a separate investigation lead, not a confirmed bug.

## CI observations

- special-territory workflow runs verify (selected TS tests, validator test, tsc, Next build); live probe/calculation timing only when changed-file classifier returns true, with fail-open on classifier uncertainty. Live jobs are continue-on-error, so they are diagnostic, while verify is blocking. Do not weaken the classifier/failure-open path.
- calculator-final-gate includes pnpm build (which invokes test:audit), lint and live route checks for code paths on PRs targeting main. Whether this is a required branch-protection check could not be established.
- B03/B10 workflows are narrowly scoped; B10 is manual-on-push workflow-file change only, one allow-listed capture case at a time. No triggers launched by this audit.
- Workflow tokens mostly explicitly contents:read; route monitor alone grants issues:write. Action tags are generally version tags rather than immutable SHA pins; no malicious action finding, but immutable SHA + automated update review is a P3 supply-chain improvement.
- GitHub branch protection endpoint returned 403 to connector; required status checks and dismissal rules remain unverified, not inferred from workflow names.

## Test/build scope

Tree inventory found 145 test-like files and path matching indicates all fit test:audit globs. No coverage tooling/branch coverage report. Strict V3 date tests exist; V2 analog absent. Scripts excluded from TS config. Package is Node24/pnpm11.25 with frozen lock. No dependency vulnerability scan or install performed.

## Remaining / unverified

B18 synthesis: data governance/doc quality, classify all issues into P0–P3, remediation sequence/risk/isolation, things not to change, limitations and status. No security/pentests, performance measurement, external source verification, full build or suite executed. Previously completed route audits not repeated.

## Next

B18 compile evidence into final report sections and safe ordered remediation plan; document unavailable/untested surfaces. No fixes.
