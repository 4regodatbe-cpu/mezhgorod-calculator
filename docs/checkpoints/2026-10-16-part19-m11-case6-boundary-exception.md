# Part 19 — M11 boundary case 6 exception review

- Status: DONE for this case; shared M11 cause review remains IN_PROGRESS (6/8 cases). Reviewed 2026-10-16T20:39:00Z (2026-10-16 23:39:00 MSK).
- Branch/PR14: `fix/v3-missing-route-prices-2026-10-15`, open draft; source head/tree `0d7a57a2a02e5334e9215480800cac293190c239` / `615a2975a5417f65daa9db213cfffcc54b8ade8b`.
- Case: `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim`. Bounded saved-capture/profile review; no new live request and no broad replay.

## M11 boundary cause
- Capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-cheboksary-to-prim/2026-10-16T01-21-31-631Z-capture.json.gz`; Git blob SHA-1 `fa8c1b70d52138c59fcc5d8055d09e3eb020a297`; capture SHA-256 `ce2577c835f8a5321dcff6be9717084452234bc4512683fd59fb7085b1f6fdcf`. Complete 10/10 chunks, 2,766 checked edges.
- The selected trace does not contain directed M11 boundary ways `795569815`/`795569816`; approximate nearest route-polyline distances to the known gate nodes are 26.47m/41.76m, above the 25m threshold. The PVP21 spatial anchor remains unresolved.
- Live and all four saved same-date/weekend replay profiles bind to the same capture SHA and preserve the selected Valhalla route, 1,380,434m / 53,656s; OSRM is 64,253s. Selection is consistent with fastest-route-only. Replays have no missing recorded responses.

## Material profile difference and limits
- The live and initial replay pair report `unknown-paid-road`. Later same-date and weekend replay pair add exact ZSD booth node `1766158781` as a selected-trace event and no longer report a separate `unknown-paid-road`. Each pair retains the same route, capture SHA and road-coverage status. The output-field diff is limited to the new ZSD passage event and the corresponding redundant unknown-road component/summary fields.
- This matches the previously source-validated exact ZSD identity correction (primary directed topology, same-ledger membership; [proof checkpoint](2026-10-16-zsd-planernaya-identity-proof.md), [evidence](evidence/2026-10-16-zsd-planernaya-identity-proof.json), [corrected replay](2026-10-16-zsd-planernaya-corrected-replay.md)). It is a classification correction, not tariff evidence. ZSD remains unresolved here because this route extends beyond reviewed zone 1.
- Other live/latest replay blockers: expected M12 traversal is not proven; CKAD east arc is not proven; ZSD is outside reviewed zone 1. M11 15–58 remains unknown; route toll amount remains null. Unknown is not zero and no subtotal is a full trip amount.

## Outcome
- For finding `m11_partial_head_entry_boundary_unresolved`: **blocked by missing reliable data**; no material M11-boundary exception.
- For previously known ZSD identity cause: **fixed and verified** in the cited source proof/corrected replay; no fare was activated.
- New live requests: 0. Code changes/tests/builds for this bounded evidence review: none.
- M11 exception checks: 6/8; this is case count, not tariff coverage.
- Formal plan: **90% (18/20 complete parts)**, unchanged and not calculator/tariff readiness.
- Next case: `max-chain-m12-ckad-m11-zsd-vladimir-to-sest`; inspect saved evidence only, then checkpoint/read back before moving on.
