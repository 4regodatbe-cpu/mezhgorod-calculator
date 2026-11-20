# Part 19 — M11 head case 3 source-gated

- Status: DONE for this case only; the 8-case finding remains in progress. Timestamp: 2026-10-16T19:39:58Z (22:39:58 MSK).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Verified source head `e197a7a40ec10ae08ea470f50ca61844a1226bfc`, tree `54b899d424b3da1170af5d7e2871ae2801ad49e8`; workflow run `38951539156` completed/success on that head before this read-only evidence review.
- Case: `max-chain-m12-ckad-m11-zsd-murom-to-sest`; existing saved capture and profiles only. No new live request.

## Evidence reviewed

- Capture `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-murom-to-sest/2026-10-15T23-59-30-619Z-capture.json.gz`, SHA-256 `7f52b3f094508f3782a3b13b1785b39a0e200123c948ad45771bddc82e76def9`. Its selected Valhalla trace is complete (`8/8` chunks), `1052263`m and 6131 route coordinates. The route proves M11 traversal; that alone does not identify the M11 head payment boundary.
- Recomputed distance from the saved route geometry to the operator-identity-linked directed MMK north gates: 26.5m and 41.8m. Neither gate way (`795569815`, `795569816`) is in the validated trace; both distances exceed the existing 25m crossing threshold. The primary payment-time evidence leaves Moscow PVP21 spatial anchor unresolved.
- Saved live + same-date offline replay + 17 Oct weekend replay are complete and reference the exact capture SHA. They all retain `m11-15-58`, CKAD and ZSD as missing/unknown. Duplicate replay files have identical SHA by date and were counted once. M11 58–679, M11 679–684 and M12 remain separate component rows; their presence does not confirm whole-trip fare or operator tariffs.

## Decision and limits

No material exception to cases1–2 was found. Preserve `m11_partial_head_entry_boundary_unresolved` as **blocked by missing reliable boundary evidence** for this case; retain unknown and do not widen the 25m rule or infer zero/free/adjacent price. No code, tariff, route capture or runtime tests changed. This is one bounded case review, not completion of the 8-case cause or tariff coverage.

Plan progress remains **90% (18/20 fully completed parts)**. This case review count is **3/8** for this finding; it does not change the formal plan percentage or represent tariff confirmation.

- Evidence JSON: `docs/checkpoints/evidence/2026-10-16-m11-case3-boundary-review.json`.
- Next single case: `pair-m11-ckad-noginsk-to-spb`; check saved capture and departure profiles for a material exception, then persist before continuing.
