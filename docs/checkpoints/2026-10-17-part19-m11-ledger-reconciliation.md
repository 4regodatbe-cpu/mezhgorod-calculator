# Part 19 — reconcile M11 finding ledger after case 8

- Status: DONE for ledger reconciliation; Part 19 remains IN PROGRESS. Reviewed 2026-10-16T23:31:29Z (2026-10-17 02:31:29 MSK).
- Branch/PR14: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft; source head/tree `3e61db433146a9449576c6c7c51073992d96be28` / `297ded73d27cc0e1b351aa9b97ed4e642cbb4686`.
- Latest branch run #38977636786 was observed completed/success at source head; no active branch jobs before this read-only reconciliation.

## Reason and change
The M11 finding in `experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json` still said 4/8 reviewed with five cases pending, although case5–8 each had a committed checkpoint/evidence and the queue/AUTO_QUEUE_STATE had progressed. This stale handoff could cause duplicate work and undercount completed checks.

Updated the current M11 ledger status to 8/8 and **blocked by missing reliable data**, with references to every case checkpoint/evidence. Previous queue status/note are preserved in an append-only `statusHistory`. Updated the next action to one unresolved cause, `unknown-paid-road:unpriced` (baseline64), with an explicit warning to check overlap with `expected-road-not-proven` (also64); the counts are not asserted to be unique.

The existing cross-cause snapshot remains limited: M4 crossing-profile change not reproduced in 25 current-engine cases; A289 component binding resolved within 57 helper-only and 2 whole-engine cases, not 59 verified route fares; ZSD 76/76 remains source-gated due unbound operator collection span; M4 unpriced 22/22 remains source-gated due unbound collection scope. Historical findings remain needs-diagnosis until individually reviewed.

## Checks and limits
- Parsed updated JSON and checked referenced case checkpoint paths against the branch tree; did not rerun routing, live probes, tests or builds.
- No code or tariff data changed; no fare or full route total was newly confirmed.
- Formal plan remains 18/20 = 90%, not tariff coverage/release readiness.
- Durable-save status when authored: pending commit/ref update/readback.
- Next: diagnose only `unknown-paid-road:unpriced` from saved evidence/current engine, compare overlap with `expected-road-not-proven`, then classify or document a specific data blocker. Do not launch a broad replay without concrete evidence of a material difference.
