# Part 19 — M11 head case 2 source-gated

- Status: DONE for this case only; the 8-case finding remains in progress. Timestamp: 2026-10-16T18:08:14Z (21:08:14 MSK).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Verified source commit/tree before review: `574f2c5686ad9b3900cedc7ca18663456b409566` / `cafefbb0afc922a4f940fbcda16295f83bfca57b`.
- Case: `max-chain-m12-ckad-m11-zsd-kazan-to-sest`; saved evidence only, no new live request.

## Exact evidence reviewed

- Complete selected Valhalla capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/max-chain-m12-ckad-m11-zsd-kazan-to-sest/2026-10-15T23-59-05-400Z-capture.json.gz`, SHA-256 `51b8e21059a597bf7797b348f58f2e47ac55ce992d364ef112f7085660e90d90`. It contains 15 recorded calls, a 9,081-point route geometry and a validated 1,558,165m trace; selected toll nodes include M11 events `4348128722`, `4348128721`, `2492861246`.
- Live 2026-10-15 09:00 MSK profile SHA-256 `d245ca51ecc2be4b0713ee1bfe92059fdd0ea4fb2473258a0470e09a4e506855`; replay of the same departure SHA-256 `ef108a4ee36bc1ca470e347334a00f2c38e6e0e334ef840fbda890226986c663`. Both are complete, report M11 15–58 missing/unknown, and separately list M11 58–679, 679–684 and M12 components; CKAD and ZSD are also missing.
- Weekend 2026-10-17 09:00 MSK replay SHA-256 `69c1df1057978e28760e5f6c9b64d62aef455fe9f11ac90bc428e8b8af25bb45`; complete trace, same missing M11 head / CKAD / ZSD. The M11 58–679 pair changes to the saved weekend profile; the M11 tail and M12 remain separate components. None of these outputs is a whole-trip fare or independently confirmed operator price.
- Primary directed MMK north-gate source `source-snapshots/m11/2026-10-15-mmk-bindings/directed-mmk-north-gates.json`, SHA-256 `6639a6800c7dde8fefffda56427f94fa914c17a7a87136d36400b575c4b7a77c`; operator identity PDF SHA-256 `c4c86c9fd92faddaaa4ab4628542185f48e6ea25ed2dff460960650ab48b9f5a`, page 5. The two directed toll-way IDs are `795569815` and `795569816`, with physical gate nodes `3499155981` and `3499155978`.
- Recomputed closest-segment distances from this selected capture geometry to those gate nodes: 26.5m and 41.8m, respectively; neither directed gate way ID is in the selected capture’s validated way IDs. Both distances exceed the configured 25m gate-match tolerance, and directional flanks do not match. The stored payment-time evidence `source-snapshots/m11/2026-10-14-head-payment-time-proof.json`, SHA-256 `ba5b553230d306e9a922901a407c1c4d1a32d65e74521f351e2d0d4f74d28faa`, leaves the Moscow PVP21 spatial anchor unresolved.

## Diagnosis

The complete selected trace and later M11 booth events prove that this route traverses M11, but the saved primary evidence does not bind its M11 head entry/payment boundary. Therefore retain `m11-15-58` as unknown. Do not relax the 25m gate rule, select a boundary from a nearby label, or derive a price from the adjacent 58–679 tariff. CKAD and ZSD independently keep the full route unpriced; the known M11/M12 component values are not a subtotal to present as a total.

No code, tariff matrix, or capture changed. No tests/build were run because this is an evidence-only case classification. The previous full gate is not a validation of this review. Case 2 is source-gated, not fixed and not tariff-confirmed. Overall agreed plan remains 90% (18/20); only 2/8 cases of this finding are now reviewed, which is not tariff coverage.

NEXT: inspect only `max-chain-m12-ckad-m11-zsd-murom-to-sest` saved capture and its paired 2026-10-15/17 09:00 MSK profiles against the same exact M11 boundary, then save and verify the case result before case 4.
