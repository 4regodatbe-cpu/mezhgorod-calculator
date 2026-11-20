# Part 19 — M11 boundary case 8 source-gated

- Status: DONE for this case only; shared M11 cause review COMPLETE (8/8), outcome remains BLOCKED. Reviewed 2026-10-16T22:45:16Z (2026-10-17 01:45:16 MSK).
- Branch/PR14: `fix/v3-missing-route-prices-2026-10-15`, open draft; source head/tree `5cb2b80a0b69202af606badaf226b0fb5642feb4` / `4982f25e29b7d44d6a5a8d2830724e13888d95f9`.
- Case: `triple-m11-ckad-m12-arzamas-to-spb`; bounded review of already saved capture and route profiles only.
- Relevant GitHub run before this docs-only save: #38968234101, completed/success at source head. No active branch runs at review start.

## Evidence checked
- Capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/triple-m11-ckad-m12-arzamas-to-spb/2026-10-16T02-13-09-138Z-capture.json.gz`; Git blob SHA-1 `b95d07d9614e5b72621a0cfd264f0936658d55f4`; capture SHA-256 `b47f5207bc108a91b0121614d3184d5c7fe9339db341cd44102acfba191ea61b`.
- Three unique complete route profiles bind that capture: live SHA-1 `16e4ef502b056e5ebc762b53d9d658f12349809a`; same-date replay SHA-1 `95cbf6a051a79e6d7a7999ea5c32676842133a7a`; weekend replay SHA-1 `24baa858421db255277adf04c5da6bed93017307`. Duplicate replay filenames have identical Git blob SHAs and were not counted as extra profiles.
- Each unique profile preserves Valhalla’s selected fastest route, 1,149,643m / 43,716s; OSRM candidate is 1,135,171m / 51,485s. Selection remains time-based, not distance-based.
- All expected road traversals M11/CKAD/M12 appear in the saved road-coverage summary; ZSD is also detected. The profile still marks M11 15–58 as `m11_partial_head_entry_boundary_unresolved`; M11 58–679 and the 679–684 tail are separate detected components.
- The selected passage evidence contains M11 paid-edge/booth evidence but not the directed north-gate way IDs `795569815` / `795569816` from `experiments/nationwide-tolls/source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json`. This bounded review did not recompute nearest-polyline distances from the compressed capture; no new distance measurement is claimed.

## Outcome and user impact
No material exception to the shared M11 head-entry boundary cause was found in the saved capture-bound live/same-date/weekend profiles. The M11 15–58 component remains unknown because reliable boundary evidence is absent. CKAD east-arc scope and ZSD beyond reviewed zone 1 remain unresolved. M12 traversal is represented in this profile, but the displayed matrix component is not independent fare confirmation. The overall toll amount is null/unknown; no full-route total is supported. Unknown is not zero and component subtotals are not a full trip price.

- Cause status: **blocked by missing reliable data**; not fixed and not reproduced as a software bug.
- Unique route profiles reviewed: 3; duplicate profile blobs not counted twice. New live requests: 0; new replay runs: 0; code changes/tests/builds: none; tariffs confirmed by this review: no.
- M11 exception checks: 8/8. Formal plan progress remains **90% (18/20)** and is not tariff coverage or release readiness.
- Durable save status at checkpoint authoring: pending this commit and remote readback.
- Next: use the current Part 19 findings queue for cross-cause synthesis; then perform Part 20 required gates/handoff. Do not repeat the completed M11 exception checks absent new evidence or a material difference.
