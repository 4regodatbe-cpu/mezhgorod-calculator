# Part 19 — M11 head case 1 source-gated

- Status: DONE for this case only; the 8-case finding remains in progress. Timestamp: 2026-10-16T18:01:25Z (21:01:25 MSK).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Verified parent `bc600a9eb2ef75dbedd22e7cd8e1ac3ad3e5edce`, tree `850f16287a9bdd4cea86fac46c250d11be8ad927`.
- Case: `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`; offline replay only, no new live request.

## Exact evidence reviewed

- Saved selected Valhalla capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz`, SHA-256 `e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0`. It records a complete 9/9 trace chunks, 1,158,570m route, and six toll-booth events.
- Current replay for 2026-10-15 09:00 MSK: SHA-256 `afaa79b5aea88dd66060fd118d75b4d970480f92d7acb8bf83a2b51869cf54ef`; complete integrity, `traceComplete:true`; route status unknown, missing `m11-15-58`, `ckad`, `zsd`.
- Current replay for 2026-10-17 09:00 MSK: SHA-256 `5196480c4c9aadb4123699c98ad6f497a1fe61249a5beec46c208f5f01684987`; complete integrity, `traceComplete:true`; same missing components.
- The two outputs preserve M11 `58–679` at 3,900 RUB weekday / 4,200 RUB weekend and the approved 679–684 component at 94 RUB; neither is a whole-trip total nor evidence that the missing 15–58 section is zero.
- The capture’s M11 booth node IDs are `4348128722`, `4348128721`, `2492861246`. The official-identity-linked directed MMK(A107) north-gate record (`source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json`, SHA-256 `6639a6800c7dde8fefffda56427f94fa914c17a7a87136d36400b575c4b7a77c`) identifies physical gate nodes `3499155981` / `3499155978` and their directional flanks. Neither gate way ID (`795569815` / `795569816`) is present in the selected trace’s 844 way IDs. Recomputing nearest-segment distances against the selected route gives 26.5m and 41.8m at the two gate nodes, both outside the configured 25m gate-match threshold; no gate crossing is established.
- The M11 payment-time evidence record (`source-snapshots/m11/2026-10-14-head-payment-time-proof.json`, SHA-256 `ba5b553230d306e9a922901a407c1c4d1a32d65e74521f351e2d0d4f74d28faa`) says collection is tied to the exit payment plaza and explicitly records the Moscow PVP21 spatial anchor as unresolved. It does not let this case infer its exact entry point from a nearby road label or the later p58 event.

## Diagnosis

The replay is reproducible, but evidence does not independently bind the selected route’s M11 head entry/payment boundary to an operator tariff point. The route being complete and M11 paid ways being present proves traversal, not which M11 15–58 origin/finished span applies. Do not widen the 25m geometry threshold based solely on an approximate OSM gate point, do not infer PVP21 identity from an unverified node, and do not price a head component from the adjacent 58–679 pair. Classify this case as `source_gated_m11_head_entry_boundary_unbound`; retain the full route unknown because CKAD and ZSD also remain unresolved.

No code or tariff matrix changed. This is existing offline evidence review, not an operator tariff confirmation. No test/build was run. Overall agreed plan remains 90% (18/20), not toll coverage. The 7 remaining historical cases are not credited by this case’s review.

NEXT: inspect only `max-chain-m12-ckad-m11-zsd-kazan-to-sest` saved capture plus its two saved profiles, then checkpoint/publish/read back before continuing.
