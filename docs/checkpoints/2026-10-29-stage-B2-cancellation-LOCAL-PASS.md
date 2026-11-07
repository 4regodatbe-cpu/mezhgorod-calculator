# B2 — provider failover PASS; main V3 cancellation fixed LOCAL

29.10.2026 MSK; parent d9c66ea1. Stage A preserved, remote a1c169d3/PR14 Draft not updated. No routing-choice/tariff/matrix/CI/Production change. Optional trailing cancellation parameters preserve old callers; only V3 forwards its actual request signal. All new work LOCAL ONLY.

## Reproduction and correction

Before: actual API diagnostic with controlled transport aborts the caller inside the first provider fetch, yet all3providers are still invoked with nonaborted independent signals; returns502. First3regression tests fail: pre-aborted work starts upstream, pending-route abort not propagated, selected trace not aborted.

After: existing25s provider and18s trace deadlines are composed with caller cancellation (not increased/replaced). V3 forwards signal through geocode, ordinary route and special corridors, selected trace chunks and429backoff; checks cancellation before subsequent pricing/response stages. Cancelled requests return safe400 `Расчёт отменён`, not a stale successful route or a partial tariff. Already-cancelled request makes0calls. Mid-flight test aborts all3pending provider signals, starts0trace; selected trace and429wait cancellation are covered separately. Special corridors never switch on cancellation. In the matched diagnostic, total starts3→1: the first already-started call receives abort, the two subsequent starts disappear. This is avoided stale work, not a measured speed gain for normal trips.

Paths: `lib/route-providers.ts`, `lib/toll-validator.ts`, `lib/v3-calculation/route-leg.ts`, `lib/v3-calculation/special-options.ts`, `app/api/v3/calculate/route.ts`; six new tests in `scripts/routing-cancellation.test.ts`. No bypass of allSettled/geometry/fastest/corridor/unknown logic for a noncancelled calculation. No new provider, retry, network budget or driving-profile change.

## Checks actually executed

- Initial existing failover/geometry/selected-trace/timing suite20PASS; final6new+related existing/error/rate-limit suite31PASS/0FAIL. Command: `node --import ./scripts/register-ts-paths.mjs --test scripts/routing-cancellation.test.ts scripts/v3-route-selection-audit.test.ts scripts/calculation-timing.test.ts scripts/provider-route-geometry.test.ts scripts/v3-m4-selected-trace-reuse.test.ts scripts/toll-trace-rate-limit.test.ts scripts/calculate-api-error-mapping.test.ts`.
- `npm run test:audit`:1031PASS/0FAIL/1SKIP, quote/API checksPASS, exit0. Skip is the existing opt-in corpus test, not a routing skip.
- `node_modules/.bin/tsc --noEmit`, scoped ESLint five runtime files+new test/diagnostic, `node_modules/.bin/next build --webpack`:all exit0. Next16.3.4/Node24.19.0; existing preferredRegion warning. No pnpm-build duplicate test gate or live audit.
- Actual before/current API on retained full Donetsk→Moscow capture,12storedresponses each/0misses/0network: full parsedbody and every outbound URL/body EXACT MATCH. Baseline API source is pinned from d9c66ea1; new adapters receive no caller signal for baseline, nonaborted signal for current. This checks opt-in cancellation compatibility, not a full binary reconstruction of every previous module. Captured source SHA8b168610a9b6e899b6ca4074e64cfbea2f52bc6ccafddc09f63c28716df2f630. Scripts/report/source under experiments/routing-reliability. Paired2688.89/2358.65ms are different warm executions, NOT evidence of a normal-request optimization or new network SLA.

Full outputs and negative evidence in `experiments/routing-reliability/2026-10-29/logs/`; cancel-before/after and parity JSON preserve the exact findings. Source scripts: cancel-diagnostic.mjs and uncancelled-parity.mjs. Raw log whitespace is retained verbatim. Authored source/doc diff checks pass.

## Limits / next

Main V3 geocode/routing/selected trace/backoff cancellation is fixed and tested. Legacy V2 has not been rewired. Auxiliary pricing/evidence lookups deeper than the supplied selected trace and cancellation while reading a request body are not independently verified for active I/O abort; do not claim universal cancellation coverage. API stage checks prevent a cancelled final success after those awaited stages complete. CPU work is not interruptible mid synchronous call. No10s guarantee.

Next B3 summarize existing timing by nested boundary; B4 preserve the measured stale-work reduction as this stage's one bounded optimization rather than manufacture a normal-latency improvement. B5 inspect the five retained controls, replay only where exact source/trace inputs are complete, and mark missing data honestly. No publication authorized.
