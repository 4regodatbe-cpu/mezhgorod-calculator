# Part19 — expected-road-not-proven grouped review

- Status: DONE for this bounded finding classification; overall Part19 remains IN_PROGRESS. Reviewed 2026-10-17 07:35 МСК (2026-10-17T04:35:31Z).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Source head/tree before save: `fec51dab8eddc1919b4e839cc1b59a1c345f3b05` / `0bd121306facb563761e924d54c57ad4aa4487c1`.
- Verification: PR head matched source; run #38999218280 completed success on source head; separate known PR run #38959170444 completed success on older head; no active branch runs before this write.

## Finding and evidence

Reviewed the saved `expected-road-not-proven` baseline finding. All 64 case IDs matched one report result each. All 64 unique live artifact paths exist in the source tree; all rows have raw evidence, complete trace, and same-date parity.

Missing expected-road labels: CKAD 30, M12 11, Khabarovsk 10, Odintsovo 8, ZSD 3, M4 2. Thirty-two cases overlap other existing finding ledgers; 32 are not in those ledgers. Counts are non-additive. See [evidence](evidence/2026-10-17-part19-expected-road-not-proven-deferred.json), source report blob `528163f94cf0092bf58ad5b0be200059d61baff9` (baseline report SHA-256 pinned in queue: `cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e`).

## Cause, impact, status

This is a mixed expected-versus-proven route-label symptom across six unrelated road labels, not one demonstrated defect. A charge could be omitted only if the selected fastest route actually traverses the omitted chargeable segment; the saved report does not establish that. No route was forced onto a planned road and no fare was inferred. Outcome: **deferred** pending a concrete independently evidenced route/toll-boundary exception. Unknown is not zero; no full trip total is confirmed.

The four named M11 boundary cases (review cases 5–8) already have committed DONE checkpoints: Kazan–SPb; Cheboksary–Prim; Vladimir–Sest; Arzamas–SPb. The shared M11 boundary cause remains **blocked by missing reliable data**; amounts remain unknown/null. No route was rerun in this step.

## Checks and next step

No new live request, replay, build, test, code change, or tariff confirmation. Formal plan remains **18/20 = 90%**; this is not product or tariff readiness.

Next: review `m12_current_operator_pair_not_bound` (baseline 4) from saved evidence only; compare overlap and user impact. No replay without a material input/geometry/code distinction or an evidence gap.
