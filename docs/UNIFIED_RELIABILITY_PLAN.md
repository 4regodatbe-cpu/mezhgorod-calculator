# Unified reliability and B01–B12 work queue

Latest technical result: 24-block plan DONE10/24 (41.67%):1–6,12,17,19,22. Block6 API integration checks pass across V2/V3 after date, safe-error and corridor-recovery changes; no contract defect reproduced, engines remain separate. Checkpoint2026-10-27-0237-block-6-api-contracts-DONE.md. Block20 remains PARTIAL. Next block7 request-body limits.

2026-10-27. Baseline `396daf20b02c2d56fc49b53174fb923f633fc861`; allowed fix branch, PR14 Draft.

## Counters and missing input

Resolved 2026-10-27: original definitions restored verbatim in [24-block plan](RELIABILITY_24_BLOCK_PLAN.md), including per-block status and B01–B12 crosswalk. Confirmed DONE2/24 (1,17); other blocks receive no automatic credit from static audit. The missing-input note below is historical. Next block12/B01 direct geocode deadline.

Technical plan: **UNKNOWN/24**. The uploaded supplement refers to a prior 24-block assignment, but its numbered definitions are absent from the available request and repository search. Do not manufacture them or count the completed 18-block static audit / 6+4 fix plans as these 24 blocks. Obtain the original numbered plan to establish this counter and exact crosswalk.

Functional directions: 0/12 fully closed against the broad BRIEF acceptance criteria; all 12 have partial evidence or implementation. Current next-action classification: 4 ACTIONABLE, 7 BLOCKED_BY_DATA, 1 BLOCKED_BY_ENVIRONMENT. These counts describe directions, not product readiness. Historical captures and mock tests do not establish operator fares or real-service E2E.

| Direction | Status | Existing result / next acceptance condition |
| --- | --- | --- |
| B01 | ACTIONABLE | Pool/cache/cooldown implemented. Next: AUD-GEOCODE-01 bounded direct label-geocode transport, focused abort test; a general verified outage source remains missing. |
| B02 | BLOCKED_BY_DATA | Saved GeoNames joins exist; 19 collision groups lack independently confirmed admin/coordinate identity. Do not redownload archives or activate uncertain records. |
| B03 | BLOCKED_BY_ENVIRONMENT | Eight hosted mocked scenarios and swap fix DONE; actual B-only live-service E2E still unconfirmed. No repeat of the eight scenarios. |
| B04 | BLOCKED_BY_DATA | Exact M4 directed pair/OSM coordinates DONE; require operator scope, official km and fare for entry4443232947 / exit358467208. |
| B05 | BLOCKED_BY_DATA | Short M4/545 geometry reviews preserved; require independent operator collection-scope and dated tariff proof for the specific unresolved vectors. |
| B06 | BLOCKED_BY_DATA | Existing M11 engines/confirmed pairs retained; unresolved pair needs complete directed operator-boundary sequence and matching tariff evidence. |
| B07 | BLOCKED_BY_DATA | Require exact operator entry/exit correspondence and complete fare evidence; approximate corridor recovery is now diagnostic-only. |
| B08 | BLOCKED_BY_DATA | Golitsyno/A113 requires independent physical-to-tariff boundary identity; no inferred fee. |
| B09 | BLOCKED_BY_DATA | RVP64 is not an independent PVP (closed fact); remaining payment identity needs directed operator cash/card tariff proof. |
| B10 | ACTIONABLE | Eisk and Maykop captures/replays DONE. Next: attribute Eisk delta +580/+1530 using saved outputs only; do not recapture or tune fares to match. |
| B11 | ACTIONABLE | Saved profiles available; choose a measured bottleneck and compare offline before/after on identical inputs. No general SLA claim. |
| B12 | ACTIONABLE | Hosted Node24/Chromium/child-process evidence preserved. Investigate remaining cumulative CI baseline behavior before any new normal commit that might start broad live probes. |

## Execution order and overlap

Update2026-10-27: block12/B01 direct geocode deadline DONE; two offline regressions, TypeScript/scoped ESLint PASS. Technical DONE3/24. B01 remains partially addressed (general outage source unresolved). Next19/B10 saved Eisk attribution.

1. B01 / AUD-GEOCODE-01: direct geocoder deadline and abort regression. Preserve ranking, coordinates and error contract.
2. B10: offline explanation of saved Eisk tariff-component difference. Any tariff/policy change needs independent evidence and separate approval.
3. B12: reconcile actual cumulative CI classifier behavior with its model; reproduce with stored event metadata, not a new broad live run.
4. B11: bounded offline measurement and only then a demonstrated optimization.
5. Resume B02/B04–B09 only when the precise missing primary evidence arrives. Keep physical identity, official km, operator scope and monetary truth separate.

Count an overlapping implementation once in the technical plan after the missing 24 definitions are supplied; link it to all affected B directions. Each implementation is test-first where a defect is reproducible, then minimal change, appropriate checks, checkpoint/log/state, commit and remote readback before the next independent block.

Evidence: `docs/contractor-brief/BRIEF.md`; contractor WORK_LOG; `docs/codebase-audit/NEXT_STEPS.md`; checkpoints `2026-10-26-2035-b10-maykop-capture-DONE.md` and `2026-10-27-0054-aud-trace-recovery-fix-DONE.md`. Static audit 18/18 and prior repairs remain completed; do not repeat them.
