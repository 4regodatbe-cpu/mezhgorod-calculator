# Codebase audit block 14 — performance and resource flow — DONE — 26.10.2026 22:49 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `435c52a57eee285d0bf9f7e9264f6933cdd53761`; PR14 Draft; Actions idle. Static review only: address pool/cache limits, route provider fanout, toll trace splitting/concurrency, V2/V3 selection, calculation timing. No benchmark, test, live request or build.

- Address pool limits active work2, queue64, positive cache128. Route candidates use fanout; V2 ordinary leg starts up to 5 candidates (three Valhalla variants + OSRM + BRouter). V3 fastest-only still starts ordinary main Valhalla, OSRM and BRouter; bypasses are skipped. Route adapters each have 25s timeout/cache revalidation.
- Trace validator samples at most320 points, splits by 140km, concurrency2, request deadline18s, up to two bounded 429 retries. Number of chunks still scales with route length; global calculate maxDuration is120s. Extreme-distance total execution wasn't measured. Do not infer SLA from this static review.
- `calculationTiming` measures stage duration and labels 10s target but explicitly observes only; it does not cancel or enforce a deadline. Existing prior Actions timing data wasn't reanalyzed here. No new measured performance defect.

No source changes. B14 done 14/18 (77.8%). Next B15 static package/dependency/build configuration only.
