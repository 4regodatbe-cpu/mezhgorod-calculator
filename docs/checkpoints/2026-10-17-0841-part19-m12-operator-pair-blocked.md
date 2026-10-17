# Part19 — M12 operator-pair cause review

- Status: DONE for this cause assessment; overall Part19 remains IN_PROGRESS. Reviewed 2026-10-17 08:41 МСК (2026-10-17T05:41:17Z).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Source head/tree before save: `8582031d0565ebcb6ecd4982a12bfa389ec411ba` / `7fb29e51a6ce5dac755b502684278894034e868c`.
- At review start, run #39003295081 was completed/success on this source head; no branch run was active.

## Cause and checks

The current finding covers four route cases: Arzamas–Domodedovo, Domodedovo–Arzamas, Arzamas–Moscow, and Moscow–Arzamas. Reviewed 8 date profiles and 12 saved evidence occurrences: one live/capture, one same-date replay, and one weekend replay per case. Every evidence and capture path exists in the branch tree.

All four report `m12_current_operator_pair_not_bound`, `pricingStatus=unknown`, and `amount=null`. Route traces contain M12 spans, but no toll-node/operator entry/exit pair is safely bound. The M12 traversal snapshot `data/tolls/m12-rvp-evidence-2026-09-30.json` is explicitly `CALIBRATED_PARTIAL_RVP_EVIDENCE`, has 9 calibrated anchors, and warns it is not a complete RVP inventory. Existing M12 core only prices when supported calibrated RVP crossings and boundaries are proven.

Two mixed M12+CKAD routes also report `ckad_east_arc_not_proven`; do not conflate or add these overlapping findings. The precise per-case paths and blob SHAs are in [evidence](evidence/2026-10-17-part19-m12-operator-pair-blocked.json).

## Outcome and user impact

**Outcome: blocked by missing reliable data.** The route captures demonstrate M12 traversal, but saved evidence does not identify the authoritative operator chargeable entry/exit pair for these spans. A price/full trip total cannot be safely shown; unknown is not zero. This step does not establish a code regression or confirm any fare, so no amount was added and no code change was made.

## Verification and next step

No new route runs, live requests, replay, tests, builds, tariff confirmation, or product changes. Existing output is fail-closed. Formal plan remains **18/20 = 90%** only; this is not calculator or tariff readiness.

Next: review `engine_not_yet_composed` (baseline13) by root cause and user impact, from saved evidence only; compare overlaps before any new run.
