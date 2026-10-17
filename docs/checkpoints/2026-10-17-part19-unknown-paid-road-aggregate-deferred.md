# Part 19 — defer aggregate unknown-paid-road label

- Status: DONE; outcome for this aggregate finding: **deferred**.
- Recorded: 2026-10-17T03:15:54+03:00 (Moscow).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open draft.
- Source head/tree: `1f6b47f4c297779307fe9e59e69571e5bc1100ab` / `67b4ef630a5145852b3e2ec7d067b67dd0162d7e`.
- Source queue blob: `f1f8e4b23d68fed30ad2dadeef2afd0c98a4ddb9`.
- Current composition source blob: `a24aca29a47560cc5aa6e38c28ec598ae30121a6`.

## Decision

The historical `unknown-paid-road:unpriced` row groups 64 baseline case IDs but is not one independently actionable user-facing cause. The IDs overlap other finding categories: 41 overlap `m11-58-679:unpriced`, 15 overlap `m11_58_679_facility_sequence_incomplete` (all within that M11 set), and 19 overlap `expected-road-not-proven`. These are memberships, not additive unique-route counts.

Current `composeRouteTolls` explicitly excludes `unknown-paid-road` from valid priced components (lines 58–59); unresolved detected components produce `status: "unknown"` and `tolls: null` (lines 71–77). That is the required fail-closed behavior. The aggregate label alone does not establish an implementation defect, nor prove route detection or any tariff. Therefore this aggregate is **deferred**, while the narrower facility-sequence cause remains eligible for diagnosis.

## Checks and limits

- Inspected all 64 saved case IDs in the queue row and the current composer logic.
- Current route cases checked: **0**; route profiles: **0**; new live calls/replays: **0**; tests/build: **not run**.
- No code or fare data changed. Unknown remains unknown; no zero or partial subtotal is presented as a full trip total.
- Parent verification: Actions run [#38981909036](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/38981909036) completed successfully for the parent head (`verify` and `live_probe` both passed). No active branch runs were present before saving this checkpoint.

## Durable record

Updated the Part19 queue classification and short handoffs; detailed overlap/source evidence is in [JSON evidence](evidence/2026-10-17-part19-unknown-paid-road-aggregate-deferred.json). After the commit, verify exact remote head/tree/path SHAs and inspect any newly triggered workflow before another write.

## Next

Review `m11_58_679_facility_sequence_incomplete` (baseline 15) against `m11-58-679:unpriced` using saved captures/profiles and current code. Only investigate material differences; do not run a broad replay/live pass.
