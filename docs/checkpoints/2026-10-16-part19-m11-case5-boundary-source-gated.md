# Part 19 — M11 boundary case 5 source-gated

- Status: DONE for this case only; the shared M11 boundary cause remains IN_PROGRESS across the 8-case review. Reviewed: 2026-10-16T20:19:47Z (2026-10-16 23:19:47 MSK).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open draft. Source head/tree: `7ce720c381265524189b198902f70b3c97009ab5` / `df7d751d76a3819ab68ec9f14d0bd4a81438e5bc`.
- Case: `triple-m11-ckad-m12-kazan-to-spb`. Bounded exception check over saved capture and saved departure profiles only; no new live request, code edit, or broad replay.

## Evidence checked

- Capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/triple-m11-ckad-m12-kazan-to-spb/2026-10-16T00-32-28-847Z-capture.json.gz`; Git blob SHA-1 `60c9bc47506932b4741441506baec735bf138e4a`; capture SHA-256 `b4e49dba2d15497de15fb898e007ec1153335884d21d6300c5d475604acafe00`. Capture is complete (11/11 chunks; 2,106 checked edges).
- Live profile, same-date replay (15 Oct) and weekend replay (17 Oct) all bind to that same capture SHA-256 and preserve selected route length/time (1,524,816 m / 61,507 s). The replay files are complete and have no missing recorded responses. Expected M11/CKAD/M12 roads are proven in coverage; the evidence also detects ZSD.
- Saved provider candidates: Valhalla 61,507 s versus OSRM 70,869 s; BRouter was rejected by route-quality validation. The selected Valhalla candidate is the fastest saved candidate and consistent with the user-approved fastest-route-only rule. The separate payment-point-avoidance diagnostic is not route-selection evidence.
- Directed MMK gate source: `experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json`. Directed gate ways `795569815` / `795569816` are absent from the selected trace. Approximate nearest polyline distances to gate nodes `3499155981` / `3499155978` are 26.47 m / 41.76 m, both above the configured 25 m match threshold. PVP21 spatial anchor remains unresolved.
- Case-specific saved component audit: M11 15–58 remains unknown because the head-entry boundary is unbound; CKAD east arc is not proven; ZSD extends outside the already reviewed zone-1 scope. M12 traversal is proven. Any priced components remain components only; the route amount is null.

## Cause and user impact

No material exception to the established M11 boundary-evidence cause is demonstrated. A calculator user cannot be shown a complete toll amount for this route from these records: keep M11 15–58, CKAD and ZSD unknown and the route total null. This outcome is **blocked by missing reliable data**, not “fixed,” not a zero fare, and not operator confirmation.

- M11 boundary cause checked: 5/8 cases; three remain. This is a count of saved-evidence case checks, not tariff coverage.
- New live requests: 0. Code changes: none. Tests/build: none; this is an offline evidence-only review.
- Formal plan progress: **90% (18/20 fully completed parts)**, unchanged and not calculator/tariff readiness.
- Next single case: `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim`; inspect only its saved capture/live/same-date/weekend profiles for a material exception, then save and read back before proceeding.
