# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; 18-block audit; remote source branch `fix/v3-missing-route-prices-2026-10-15`, reviewed baseline `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Read-only. No code/business/CI changes, no tests/build/browser/live calls. Progress applies only here.

## Прогресс

B1 architecture; B2 address; B3 pool/cache; B4 API; B5 providers; B6 selection; B7 saved V2/V3; B8 geometry; B9 fare composition; B10 V2 UI; B11 V3 UI; B12 response contracts; B13 security; B14 performance; B15 dependencies/build; B16 tests; B17 CI; B18 docs/data governance/synthesis. Complete 14/18 (77.8%); [B14 checkpoint](checkpoints/2026-10-26-2249-codebase-audit-block-14-DONE.md).

## Saved V2/V3 comparison

Ейск V2−V3 Thu/Sat fare +580/+1,530 RUB; Maykop 0/0; both route output −1m/0s. Historical API proxy captures only; no operator tariff confirmation. Details and SHA in B7 checkpoint.

## Findings

### P2 probable, unverified except date/status contract findings

- **AUD-GEOCODE-01:** direct label Photon geocode no local timeout; slow call can hold handler. Not reproduced. Isolated timeout test/adapter.
- **AUD-API-01:** calculate body/label size caps not explicit in app; platform protection unknown.
- **AUD-PROVIDER-01:** JSON response body size cap absent in adapters; upstream bounds unknown.
- **AUD-TEST-01:** V2 invalid geometry regression not located; public route-control checks reject empty geometry. Defense-in-depth gap.
- **AUD-TRACE-RECOVERY-01:** partial trace marked toll can lower corridor recovery thresholds (M4 2 vs4, M12 2 vs5); possible partial result surfaced matched. No repro; requires geometry too. Focused fixtures before change.
- **AUD-UI-01:** V2 calculation hook lacks unmount abort; potential orphan server work, not reproduced. V3 has cleanup.
- **AUD-DATE-01 (confirmed):** V2 at route.ts:48 accepts normalizable invalid dates and timestamps without zone; V3 validates calendar/zone. Since date affects toll period, direct API malformed input can choose wrong day. UI sends ISO. Recommend shared strict validator; low/medium risk.
- **AUD-ERROR-01 (confirmed contract weakness):** V2 line97 and V3 line132 label unexpected exceptions 400 instead of 500; weak diagnostics/retry signals. Use typed error classes, safe body.
- **AUD-SEC-01:** public collect parses request JSON before field caps and has no visible body/rate/deadline controls. Potential webhook/function abuse, not exploited; confirm platform protections then add cap/rate/deadline.

No P0/P1 confirmed. V2 geometry P1 hypothesis withdrawn at B6.

## B14 performance/resource review

- Address pool already caps active work/queue/cache; route providers use parallel fanout (V2 up to five initial candidates), cache revalidation and 25s deadlines.
- Trace sampling is capped at 320 points, chunks at 140km, concurrency2, with per-chunk 18s deadline/retry bound. Chunk count is driven by route length; public API has 120s maxDuration. Actual worst-case total for extreme valid coordinate pairs was not benchmarked. Recommend offline synthetic performance fixtures/measurement rather than broad live audit.
- V3 fastest-only path selects one candidate and traces/prices that route; calculation timing captures stage durations but the 10s target is observational, does not cancel/enforce timeouts. No request timing/profiling done in this audit. No new measured performance issue.

## Not checked

Blocks15–18: deps/build, test gaps, workflow path triggers/check coverage, docs/data governance and report finalization. Runtime, browser, builds and tests not run.

## Next

B15 static dependency/build/supply-chain configuration: package manifests/lockfile/tool versions, TS project excludes and scripts test execution. No install/build.
