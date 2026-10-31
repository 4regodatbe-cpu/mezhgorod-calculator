# Codebase audit block 5 — provider adapters — DONE — 26.10.2026 21:24 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `0084554cd8c031f6c87c50ed32cacc6a6dee89cd`; PR #14 open/Draft. Actions latest completed; no active runs. Remote source read: `lib/route-providers.ts`, V2/V3 calculate handlers. No tests, network, or code changes.

- Valhalla, OSRM and BRouter set 25s abort timeout and 21,600s revalidation; non-OK/empty summary rejected. Response JSON has no application-level byte cap. Platform/upstream limits not measured; this is a risk only.
- Direct label-only Photon `geocode` in `lib/route-providers.ts` has no local deadline. Both current calculate handlers permit label-only points and invoke geocoding concurrently. Unlike suggestion API, this path does not use its bounded service. P2 probable reliability/resource risk, not reproduced. Recommend isolate bounded transport and abort regression; do not change ranking.
- V2 empty geometry path appears unsafe; provisional AUD-ROUTE-01 deferred to B6 cross-check.

Read-only block done: 5/18 (27.8%). docs has no separate WORK_LOG/NEXT_STEPS; tracking is report + WORK_STATE + dated checkpoints. Next: B6 static cross-check.
