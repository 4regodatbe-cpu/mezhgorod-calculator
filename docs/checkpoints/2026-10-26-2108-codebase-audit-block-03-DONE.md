# Codebase audit block 3 — address request pool/cache/cancellation — DONE — 26.10.2026 21:08 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, source baseline `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`, parent `d58ec5aaae83c8acb921b95c100b2883156a55d0`, PR14 Draft. Reviewed remote `lib/photon-request-pool.ts` (blob `4faabbb5…`), `lib/address-suggestion-cache.ts`, `lib/address-search-service.ts`, `app/v2/components/address-field.tsx` and `scripts/photon-request-pool.test.ts` / cache tests. No tests run.

## Outcome

No cache/pool/cancellation race defect confirmed. Pool is explicitly process-local; concurrency2, queue64, positive LRU128/5min; singleflight keyed by URL; individual subscribers can cancel without aborting peers, and the final subscriber aborts/removes the task. Origin circuit pauses after 3 consecutive HTTP429/503 within 15s, success resets; no retries. Collector's 20s overall deadline includes queue time and wraps non-cooperative injected fetches. Existing unit cases exercise shared cancellation, stale task replacement, cancelled queued requests, queue overflow, cache TTL/LRU/empty results, cooldown reset/isolation, partial positives and caller cancellation. These are code/test inspection only, not a rerun or current-head PASS claim.

The pool comment and deployment model limit are explicit: bounds are per warm process, not global across serverless isolates. Global abuse/rate limiting remains a candidate risk for block13, not a defect in the local pool. Suggestion cache holds only nonempty results, normalizes case/whitespace/ё, TTL5m, LRU128. Cache key content is user query held in process memory; current implementation does not log it. No relevant data leak found.

No source/behavior changes. Block3 complete: 3/18 (16.7%). Next: block4, inspect calculation route request parsing, input and call graph.
