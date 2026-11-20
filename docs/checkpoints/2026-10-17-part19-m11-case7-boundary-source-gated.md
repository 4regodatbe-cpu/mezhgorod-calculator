# Part 19 — M11 boundary case 7 source-gated

- Status: DONE for this case only; shared M11 cause review remains IN_PROGRESS (7/8). Reviewed 2026-10-16T21:16:00Z (2026-10-17 00:16:00 MSK).
- Branch/PR14: `fix/v3-missing-route-prices-2026-10-15`, open draft; source head/tree `b0d4c5cdb67ea6ba5d390fd4ac67299b61c11208` / `88fd83819e14705d15a9f0bd489876f52e2434b6`.
- Case: `max-chain-m12-ckad-m11-zsd-vladimir-to-sest`; bounded saved-evidence review only.

## Evidence checked
- Capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-vladimir-to-sest/2026-10-16T01-24-11-271Z-capture.json.gz`; Git blob SHA-1 `80bf282afa92f210adc7d141bc204ebb48d326df`; capture SHA-256 `5e895d6785df78dafd9a016706e733fd3da66502001fbb5611ff34d33f52eb6f`. Trace complete: 7/7 chunks, 1,690 checked edges.
- Live, same-date 15 Oct replay and weekend 17 Oct replay all bind to that SHA and preserve 921,380m / 31,886s. Replays complete with no missing responses; duplicate replay blobs were not counted as extra profiles.
- Fastest-route-only is respected: Valhalla 31,886s versus OSRM 40,158s.
- Directed M11 gate ways `795569815`/`795569816` are absent. Approximate nearest route distances to gate nodes `3499155981`/`3499155978`: 26.47m / 41.76m, greater than the 25m threshold; PVP21 anchor is unresolved.
- Expected road coverage: M11/CKAD/ZSD proven; the planned M12 traversal is not proven. CKAD east arc is not proven, and the ZSD trip extends beyond reviewed zone 1.

## Outcome and user impact
No material exception to the shared M11 boundary cause. M11 15–58 remains unknown; CKAD and ZSD scope also remain unknown; expected M12 route coverage is unproven. No full trip toll amount can be shown from this evidence. Status for the M11 cause: **blocked by missing reliable data**. Unknown is not zero; component rows are not a full trip total.

- New live requests: 0. Code changes/tests/builds: none; this is an offline saved-evidence check.
- M11 exception checks: 7/8; the count is not tariff coverage.
- Formal plan progress: **90% (18/20 completed parts)**, not calculator/tariff/release readiness.
- Next: `triple-m11-ckad-m12-arzamas-to-spb`; inspect saved evidence only and persist/read back before advancing.
