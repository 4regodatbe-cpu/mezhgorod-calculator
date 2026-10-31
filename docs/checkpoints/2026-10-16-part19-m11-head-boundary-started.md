# Part 19 — M11 15–58 head-boundary diagnosis STARTED

- Status: STARTED. Timestamp: 2026-10-16T17:55:31Z (20:55:31 MSK).
- Branch: `fix/v3-missing-route-prices-2026-10-15`; PR14 open/draft.
- Verified parent commit/tree: `afd103e6c89a69a66f362edbf1b566ff8b44aabb` / `0a09a230558dd88fa280a5ccc6247b53f3def0d4`.
- Previous queue run `38869309675`, job `116869376746`: completed/success; no active writer observed.

## Scope and inputs

Review only the Part 19 finding `m11_partial_head_entry_boundary_unresolved` (8 historical case IDs, 24 baseline occurrences). Begin with `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`, whose saved capture is `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz`, SHA-256 `e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0`; the current source queue identifies paired departure profiles 2026-10-15 and 2026-10-17 at 09:00 MSK.

Inputs: frozen `source-snapshots/systemic-road-audit-2026-10-15/REPORT.json`; per-case capture/live/replay JSONs; `engine/m11-route-adapter.mjs`; `engine/m11-head-route-adapter.mjs`; M11 source snapshot `source-snapshots/m11/2026-10-14-head-payment-time-proof.json`; and current M11 head-tariff cells. Baseline occurrences say `m11-15-58: m11_partial_head_entry_boundary_unresolved`; current engine replays continue to report `m11-15-58` as missing while separately returning M11 58–679, 679–684 and M12 components. The whole route therefore remains unknown. This is not yet a confirmed runtime defect.

## Planned microstep

Inspect the exact first-case selected paid-edge/entry sequence from the existing compressed capture and its two saved departure-profile replay outputs; compare only against the saved primary M11 payment boundary and current adapter contract. Do not make a new live request, infer an M11 15–58 pair from the M11 58–679 component, select a tariff by endpoint proximity, or substitute a partial sum for the whole trip. If exact independent entry/exit evidence is absent, classify as source-gated and preserve null. Save DONE/FAILED and evidence before proceeding to the next finding.

No source code, fare matrix, report, capture or selected-live route was changed in this STARTED record. No tests/build run. Overall 20-part completion remains 90% (18/20), unrelated to tariff coverage. This STARTED checkpoint is durable on the authorized PR branch; continue from this parent and verify head/tree after publication.
