# Part 19 — classify M4 unpriced finding (22 saved evaluations)

- Status: DONE; evidence classification only. Timestamp: 2026-10-16T17:48:58Z (20:48:58 MSK).
- Parent branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 remains draft. Verified remote parent: `21977a2c43eb5a9c08c0dd7fbda239b7c4f71758`, tree `21852c6529ddbeaa5f1213621668bf9aa57c1ef9`.
- Task: classify the existing `m4:unpriced` finding from its 22 saved evaluations; do not re-run other queues or infer a tariff/zero.

## Result

All 22 evaluations have durable offline replay evidence. They divide into exactly four evidence classes: five whole-route estimates without operator fare confirmation; three routes with an M4 component amount but another product still unknown; eight physical M4-545 boundary cases where the finished tariff span is unresolved; and six short M4 cases where the general open-collection rule is not enough to bind an exact selected-way scope. This is 22/22 case-evaluation classification, **not fare coverage**. None of these classes proves that the remaining route is free or proves an operator fare for all selected ways.

The saved operator document states the general open-collection rule, but its M4-355 capture has `effectiveFrom: null` and does not independently bind the finished collection span for these exact M4 ways. For the 545 boundary, the two finished variants (1223→545-a and 1223→545-b) have different amounts and included rows; crossing physical node 545 alone cannot select one. For short routes, map/route completeness and absence of mapped booths do not independently prove collection scope. Therefore the M4 finding is classified `source_gated_collection_scope_unbound`; no runtime-code change or fare assignment is justified by this evidence.

## Case classes

- Whole-route estimates, operator-confirmation absent (5): `single-m4-voronezh-to-moscow`, `dnr-краматорск-moscow-center`, `dnr-бахмут-moscow-center`, `lnr-рубежное-moscow-center`, `lnr-лисичанск-moscow-center`.
- M4 component recovered, another product remains unknown (3): `triple-m4-m11-zsd-voronezh-to-prim`, `pair-m4-m11-voronezh-to-spb`, `max-chain-m4-ckad-m11-zsd-voronezh-to-prim`.
- Physical-545 scope unresolved (8): `single-m4-voronezh-to-rostov`, `single-m4-rostov-to-voronezh`, `pair-m4-a289-voronezh-to-anapa`, `pair-m4-a289-anapa-to-voronezh`, `single-m4-voronezh-to-krasnodar`, `single-m4-krasnodar-to-voronezh`, `pair-m4-a289-voronezh-to-taman`, `pair-m4-a289-taman-to-voronezh`.
- Short/open-collection scope unresolved (6): `zaporizhzhia-розовка-kazan-center`, `dnr-талаковка-kazan-center`, `dnr-новоазовск-kazan-center`, `zaporizhzhia-гуляйполе-kazan-center`, `dnr-широкино-kazan-center`, `dnr-гранитное-kazan-center`.

The row-by-row IDs, replay outcomes, and evidence paths remain in `experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json`; grouped machine-readable evidence is `docs/checkpoints/evidence/2026-10-16-m4-22-case-classification.json`.

## Evidence and limitations

- `experiments/nationwide-tolls/source-snapshots/m4-355-receipt-rule-verified-2026-10-14.json`, SHA-256 `82929c13f8eab841722c191afe2c7b6d7bd22c0e784387d7eaf35c4aa3f4f421`: general rule record, `effectiveFrom` null; this alone does not bind the exact current M4 collection span.
- `docs/checkpoints/2026-10-16-1358-short-m4-proof-review.md`, SHA-256 `cf0fb1e472001789bdb1f8a4bbd5577b71c18e68d5c9784311d8ab95d0ecd2d7`: short M4 scope review; unknown retained.
- `docs/checkpoints/2026-10-16-part19d-case9-545-scope-diagnosis.md`, SHA-256 `772efff837e6b910c1e2e565d5a58122ba459e0344a622f56afae1648e792e7f`, plus `docs/checkpoints/evidence/2026-10-16-m4-1223-545-scope-gap.json`, SHA-256 `b2c2ca1737a32a2b23d42aa9cf2d432aaf3099a25ebf2f78e66a12c88d451927`: physical 545 ambiguity and existing different finished variants.
- `docs/checkpoints/2026-10-16-part19d-granitnoe-kazan-unknown-reproduced.md`, SHA-256 `83df33d978b06394c51ad2cd2b86f6b25f2a2cc9e1275871b356613afe37768d`: one short selected-route scope remains source-gated.

No code, toll values, frozen report, raw capture, or live selection was changed. No test/build was run in this audit-only step; the previously observed full gate is historical and was not rerun. Part 19 remains in progress; Part 20 remains planned. Overall agreed-plan progress remains **90% = 18/20**, not a statement of tariff verification.

## Durable save and next action

The checkpoint, grouped evidence, queue classification, progress handoff, and append-only log were saved to the authorized branch as commit `21977a2c43eb5a9c08c0dd7fbda239b7c4f71758`; GitHub branch head and tree readback matched the uploaded blob SHAs. No active workflow writer was observed; previous queue run `38869309675` / job `116869376746` was completed successfully before this documentation-only step.

NEXT: review only the next Part 19 finding `m11_partial_head_entry_boundary_unresolved`, using its saved evidence; diagnose one cause, preserve unknowns, checkpoint, publish, and verify branch head/tree before proceeding.
