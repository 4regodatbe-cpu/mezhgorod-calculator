# Part 19 — M11 boundary case 4 source-gated

- Status: DONE for this case only; the 8-case finding remains IN_PROGRESS. Timestamp: 2026-10-16T20:00:50.463Z (2026-10-16T23:00:50.463+03:00).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Verified source head/tree: `8819f8175edf616ed2229536cdf8abde5ef40a68` / `8b99cebadb42786e8e95e2b24b504bf713dbda2f`.
- Case: `pair-m11-ckad-noginsk-to-spb`. Saved-evidence exception check only; no new live request, code edit, or broad replay.

## Evidence checked

- Capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-noginsk-to-spb/2026-10-16T00-04-08-712Z-capture.json.gz`; Git blob SHA-1 `7bf36b92145eb4cfec0d1bff8e6b9d06ce6e733c`; capture SHA-256 bound by all profiles `738c29e0773a4ac17fa4b56ea324cf060a62533b843560f3ca0413ea9b7234e`. Valhalla trace is complete (6/6 chunks, 0 failed; 1,172 checked edges), 772,549 m / 3,546 route coordinates. Map matching recorded 900 paid edges and an M11 booth event `2492861246`.
- Live 15 Oct, same-date replay and weekend 17 Oct replay all bind to that same capture SHA and have the same selected Valhalla route (772,549 m, 25,413 s). Both replay integrity records are complete with no missing responses. For the same-date profile the known M11 58–679 component remains 3,900 ₽; for the weekend profile it changes to 4,200 ₽. The 679–684 component remains 94 ₽. These are components, not a complete trip total.
- The route candidates saved in the live profile show Valhalla at 25,413 s versus OSRM at 32,301 s; BRouter was unavailable. This saved selection is consistent with the agreed fastest-route-only rule. The payment-point-avoiding probe from the separate workflow is not used as route selection evidence.
- The directed MMK north-gate source is `experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json` (Git blob SHA-1 `943f898eedef055fbb841431abe2bccd554c56cc`). Gate ways `795569815` / `795569816` are absent from the validated selected trace. Approximate nearest route-polyline distances to gate nodes `3499155981` / `3499155978` are 26.61 m / 41.98 m, both above the configured 25 m match threshold. The existing payment-time source still leaves the Moscow PVP21 spatial anchor unresolved.

## Finding and limits

No material exception to the same missing-boundary-evidence cause was demonstrated for this case. Keep M11 15–58, CKAD and ZSD unknown; overall route amount remains null. This is **blocked by missing reliable boundary/tariff evidence**, not a zero fare and not an operator-price confirmation. No tests were run because this was a read-only evidence review.

- Cause review count: 4/8; this is the fourth checked case, not 4/8 tariff confirmation.
- Formal plan progress: **90% (18/20 fully completed parts)**; unchanged.
- Next single case: `triple-m11-ckad-m12-kazan-to-spb`; inspect its saved capture and departure profiles for a material exception, then checkpoint before moving on.
