# Part 19 — reconcile canonical outcomes for all findings

- Status: DONE for Part 19 cause review and synthesis; 2026-10-17 11:11 МСК (2026-10-17T08:11:16Z).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Pre-step remote head: `2e816d7a744298b5e7a8aa70d33c4b5c6a5de41f`; PR head matched. Branch Actions [#39014574620](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/39014574620) completed successfully on that head; no active branch run was observed. The older PR run #38959170444 is also completed/successful on its recorded older head.

## Synthesis

Reconciled the 13 saved Part 19 cause records in [PART19_FINDINGS_QUEUE.json](../../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) to the user's four canonical outcomes while preserving each prior diagnostic `status`, case IDs, evidence references and history:

- fixed and verified: 1 cause (`a289:unpriced`, component binding only; not 59 whole-route confirmed totals or verified operator fares);
- not reproduced: 1 cause (`m4_crossing_profile_changes`);
- blocked by missing reliable data: 8 causes (including the M11 boundary/facility sequence, M12 pair and Odintsovo PVP binding);
- deferred: 3 aggregate/mixed-scope findings.

The four previously queued M11 cases — `triple-m11-ckad-m12-kazan-to-spb`, `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim`, `max-chain-m12-ckad-m11-zsd-vladimir-to-sest`, `triple-m11-ckad-m12-arzamas-to-spb` — are already included in the saved eight-case exception review for `m11_partial_head_entry_boundary_unresolved`. They share the documented unresolved directed-entry/payment boundary; they were not rerun. M11 remains unknown/null; this is not tariff confirmation.

Baseline case counts in different findings overlap and are not summed as unique route coverage. No new live route run, replay, code change, test, build, or fare value was created in this synthesis. Unknown amounts and incomplete subtotals remain fail-closed.

## Plan and next step

Part 19 is complete as cause analysis, including blocked/deferred dispositions. Formal plan is now 19/20 = 95% per `progressReporting`; this measures formal parts only, not tariff coverage or release readiness. Part 20 remains planned. After this commit's branch Actions result is observed, perform the required Part 20 documentation/link and workflow verification, then hand off. No merge or release action.
