# Part 19 — CKAD east-arc cause review

- Status: DONE; cause outcome: **blocked by missing reliable data**.
- Recorded: 2026-10-17T06:32:46 (Moscow).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft.
- Source head/tree: `6df92a4bf60ba64e0a3ac8ca2d5e856248de7c9b` / `dc4c2b12a326ab4316e364d2779d2d6c606c0869`.
- Formal plan: 18/20 = 90%; this is not tariff coverage.

## User impact and cause

The frozen systemic audit report records the same `ckad_east_arc_not_proven` reason in all 102 finding occurrences for 34 route cases. These cases have 68 distinct weekday/weekend profiles (2026-10-15 and 2026-10-17); all 34 report rows say evidence/raw/trace complete and same-date parity true, while both amounts remain null. All saved live/replay file references are unique and present in the source tree. The report's selected provider is Valhalla for all 34 cases.

At the broader road layer, 22/34 rows say expected-road traversal is proven; 12/34 say `expected-road-not-proven`. This is a material distinction, but not an exception to the narrower CKAD east-arc result: none proves that exact arc/billing scope. The current conservative resolver requires nine broad geographic anchors in order and within distance/arc-length bounds, plus M11 continuation where applicable. The baseline finding does not establish the chargeable east-arc boundary or a complete operator billing event. Changing the geometry threshold or inferring a tariff from road name/distance would be unsafe.

The full trip toll amount therefore stays unknown/null, not zero or a partial subtotal. The finding is **blocked by missing reliable data**, not fixed, not an established code defect, and not evidence that the route is free. Needed evidence: an operator/source-backed mapping from the selected fastest route to the exact CKAD east-arc paid boundary/event or charging scope.

## Exception and overlap review

- 34 distinct cases; 68 date profiles; 102 evidence occurrences (34 live + 68 replay); 102 unique referenced files present.
- Every occurrence has the same reason; all rows have complete evidence, raw availability, complete trace, same-date parity, and null weekday/weekend amounts.
- Counts overlap and are not additive: ZSD unpriced 16; M11 head boundary 8; M11 58–679 unpriced 14; unknown-paid-road aggregate 18; expected-road-not-proven 12; M12 operator pair unbound 2.
- No new live calls, replay, builds, tests, or tariff confirmation. Exact data is in [evidence](evidence/2026-10-17-part19-arc-not-proven-blocked.json); source report Git blob `528163f94cf0092bf58ad5b0be200059d61baff9`, frozen report SHA-256 `cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e`.

## Scope correction from the observed CI run

The previous workflow run [#38994773498](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/38994773498) succeeded on the source head, but its `live_probe` job also executed the payment-point-avoiding Moscow–Krasnodar alternative (step 7, success). That is outside the user's fastest-route-only decision and was not counted as a case in this review. The PR workflow was amended to remove that step and artifact path; its behavior on the new commit is not yet verified.

## Durable state and next

Updated the Part19 cause queue, AUTO_QUEUE_STATE, WORK_STATE, NEXT_STEPS, and append-only WORK_LOG in this commit. After ref update, verify exact branch/PR/tree/path SHAs and inspect any newly triggered Actions run before proceeding.

NEXT: review `expected-road-not-proven` (baseline 64) by root cause, impact, and overlap using saved evidence only. No live/replay unless a material exception or evidence gap is found.
