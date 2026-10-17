# Part 19 — M11 head-boundary case 2 STARTED

- Status: STARTED. Timestamp: 2026-10-16T18:06:04Z (21:06:04 MSK).
- Branch: `fix/v3-missing-route-prices-2026-10-15`; PR14 open/draft.
- Current source commit/tree: `574f2c5686ad9b3900cedc7ca18663456b409566` / `cafefbb0afc922a4f940fbcda16295f83bfca57b`.
- Previous queue run `38869309675`, job `116869376746`: completed/success; PR head verified at the source commit above. No active workflow writer observed.
- Scope: review only `max-chain-m12-ckad-m11-zsd-kazan-to-sest`, case 2 of 8 for `m11_partial_head_entry_boundary_unresolved`.

## Exact saved inputs

- Frozen selected Valhalla capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-kazan-to-sest/2026-10-15T23-59-05-400Z-capture.json.gz`; SHA-256 `51b8e21059a597bf7797b348f58f2e47ac55ce992d364ef112f7085660e90d90`.
- Live profile, departure `2026-10-15T09:00:00+03:00`: `.../live-2026-10-15T09-00-00-03-00-2026-10-15T23-59-05-480Z.json`; SHA-256 `d245ca51ecc2be4b0713ee1bfe92059fdd0ea4fb2473258a0470e09a4e506855`.
- Offline replay, same departure: `.../replay-2026-10-15T09-00-00-03-00-2026-10-16T11-19-34-045Z.json`; SHA-256 `ef108a4ee36bc1ca470e347334a00f2c38e6e0e334ef840fbda890226986c663`.
- Offline replay, weekend departure `2026-10-17T09:00:00+03:00`: `.../replay-2026-10-17T09-00-00-03-00-2026-10-16T11-19-34-474Z.json`; SHA-256 `69c1df1057978e28760e5f6c9b64d62aef455fe9f11ac90bc428e8b8af25bb45`.
- Both date-profile outputs record complete trace, `1,558,165m`, and selected toll nodes `8087316065`, `4348128722`, `4348128721`, `2492861246`, `933974870`, `1766158812`. M11 15–58 is still null; independently listed M11 58–679 / tail 679–684 and M12 amounts remain components, not the full trip total. CKAD and ZSD are also unknown.

## Review boundary and limits

Compare only the saved capture and these paired outputs with the exact M11 entry/payment-boundary evidence and adapter contract. Do not make another live request, infer a head fare from an adjacent M11 segment or nearby road label, widen geometry tolerance, or treat the component subtotal as a complete trip price. No code, fare matrix, report or source capture is to be changed in this review. The detailed result, including a fail-closed reason if independent boundary binding is absent, belongs in a separate DONE/FAILED checkpoint before case 3.

No tests/build are in scope for this evidence-only STARTED step. Overall progress remains 90% (18/20 complete plan parts), unrelated to fare confirmation. `currentCasesChecked` remains 1/8 until this case is completed.

NEXT: inspect the selected paid-edge sequence in this saved capture against the primary M11 boundary evidence and record the exact case-2 outcome; preserve null where source proof does not bind the selected entry boundary.
