# Stage AB — close remaining V3 blockers (STARTED)

- Date: 2026-11-07 UTC.
- Base/local state: Stage AA final docs HEAD `ccfacff95ad58d3f39dac192421298988dfcefeb`.
- Worktree/branch: `/workspace/final-gate-v3`, `codex/final-gate-v3-repair`.
- Remote at last verification: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; PR #14 OPEN/Draft.
- No push, merge, Production, main, Android, or tariff/runtime change authorized.

## Entry findings

1. Both stale registry entries reference the shared `data/tolls/2026-10-01-avtodor-other-roads-category1.json` snapshot. It contains M‑1 (1 row), M‑3 (3), CKAD (16), A‑289 (6), with transponder/no-transponder fields. Runtime lookup `priceOtherRoadVerifiedSections` is currently called only from `lib/toll-engine/ckad-production.ts`; there it prices the 10 identified east-arc CKAD sections using `noTransponder`/`allDays`. The stale strict-gate metadata covers both modes of the shared snapshot, not independently downloaded tariff files.
2. A live GET of `https://avtodor-tr.ru/road/tariffs/` was blocked with final HTTP/2 403 by DDoS-Guard (proxy CONNECT was initially unavailable; the supported escalated retry reached the destination proxy and received 403). The search index exposes a page crawled about two months ago and some indexed values, but that is not a current recheck. Do not update `observedAt`, `effectiveFrom`, amounts or freshness threshold on that basis.
3. Existing Stage AA bounded V3 records: Yalta→Krasnodar 200/501.2 km/416 min/priced A‑289 component 800 ₽; Yalta→Moscow 200/1817.8 km/1476.8 min/weekday 4725 and weekend 5625; Donetsk→Kazan 200/1534.9 km/1424.4 min/`unknown/null`; Moscow→Kazan 200/820.2 km/687.9 min/`unknown/null`; Tver→Adler and Golubitskaya→SPB both 502. Do not repeat them unless implementation evidence requires a new capture.
4. Saved summary shows each provider stage had one error, but provider-level HTTP status/error classification was not recorded. Source-path inspection confirms three concurrent route candidates (Valhalla, OSRM, BRouter), each with a 25 s provider signal; no standard fallback provider exists after these three return no usable candidate. The V3 API converts `ROUTE_UNAVAILABLE` to generic 502. The exact rejection category (non-2xx, transport/timeout, parse/geometry) cannot be recovered from existing timing counters. No fake route was returned.

## Bounded plan

- Check whether the existing offline suite proves the all-route-providers-unavailable V3 contract. Add only a focused deterministic regression if missing.
- Verify final-gate YAML/workflow contracts and existing sanitized route summaries without running another live route batch.
- Reuse exact-SHA Stage AA full-build, type, lint, API-smoke and benchmark results where relevant; rerun required tests only if the code/test surface changes.
- Update source assessment, final six-route table, blocker list, WORK_STATE, logs and terminal checkpoint; commit locally and refresh/verify incremental bundle. No remote write.
