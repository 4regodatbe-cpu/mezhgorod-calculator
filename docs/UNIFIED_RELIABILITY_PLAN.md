# Unified reliability and B01–B12 work queue

Block23 DONE: Actions run40479628024 verified exact current source tree `2102cb20b95af94cbe1f986bfe9d2c012faeb79e`, Node24.21.0, 458+10+4 tests, TypeScript and Next16.3.4 production build. Classifier reported `no-route-runtime-change-in-update`; live jobs skipped. See `docs/checkpoints/2026-10-27-1245-block-23-hosted-build-DONE.md`.

Block20 DONE for bounded offline profiling: saved Eisk/Maykop geometry and Valhalla parse/decode/validation/evidence stages profiled with 0 network; deterministic geometry/result hashes match. Not an E2E/SLA benchmark; no separate multi-road/missing-tariff fixture. [Checkpoint](docs/checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md); progress22/24 (91.67%).

Block18 DONE: three targeted offline suites cover component partial/unknown and duplicate boundaries, M4/A289 overlap, M12 direction/span, and M11 departure-date fare; no live calls. Bounded acceptance only, not a live route through all facilities. [Checkpoint](docs/checkpoints/2026-10-27-0430-block-18-road-composition-DONE.md). Progress22/24 (91.67%).

Block21 DONE: corrected standalone strict scripts/tests noEmit configuration passes with zero diagnostics after54 real type errors were resolved; three initial Next ambient omissions were config-only. Root app TypeScript and focused suites pass; temporary config removed, CI gate not adopted. [Checkpoint](docs/checkpoints/2026-10-27-1130-block-21-scripts-typecheck-DONE.md). Progress22/24 (91.67%).

Block24 DONE: final outcomes and remaining functional/data blockers consolidated in `docs/RELIABILITY_24_BLOCK_FINAL_REPORT.md`. Technical plan24/24 (100%); this does not imply all functional B01–B12 blockers are closed.

Latest technical result: 24-block plan DONE19/24 (79.17%):1–17,19,22. Block16 fixed confirmed V2 production error-boundary exception disclosure; raw details are now development-only, production console output contains digest only. App-side suggestion/timing logs otherwise carry bounded metadata, not addresses. Test2/2, tsc/ESLint/diff PASS. Checkpoint2026-10-27-0340-block-16-diagnostics-privacy-DONE.md. Next block21 scripts/tests TypeScript review; blocks18 and20 remain.

Latest technical result: 24-block plan DONE18/24 (75%):1–15,17,19,22. Block15 cache review found route-cache URL dimensions include route controls/provider options; Photon uses exact URL key, positive-only5min LRU128, and subscriber-safe cancel. Three mocked cache/fetch suites PASS; no defect/code change. Checkpoint2026-10-27-0322-block-15-cache-review-DONE.md. Next block16 diagnostics/privacy; block20 profile remains PARTIAL.

Latest technical result: 24-block plan DONE17/24 (70.83%):1–14,17,19,22. Block14 adds a mocked transport rejection while Valhalla is unavailable; successful faster OSRM remains selected with its own ETA/geometry. Existing route-selection/pipeline suites, TypeScript, scoped ESLint and diff PASS; no live service. Checkpoint2026-10-27-0314-block-14-provider-fallback-DONE.md. Next block15 cache review; block20 profiling remains PARTIAL.

Latest technical result: 24-block plan DONE16/24 (66.67%):1–13,17,19,22. Block13 offline review found no exact duplicate provider requests in saved Eisk/Maykop captures (32/32 and36/36 unique method+URL+body); current fan-out is needed for three Valhalla penalty candidates, OSRM/BRouter comparison, conditional bypass, and separate trace chunks. No code change. Checkpoint2026-10-27-0301-block-13-provider-request-counts-DONE.md. Next block14 existing-mock fallback review; block20 profiling remains PARTIAL.

Latest technical result: 24-block plan DONE15/24 (62.5%):1–12,17,19,22. Block11 caps streamed Valhalla/OSRM/BRouter JSON at8MiB (>12x retained max652,899 B) and rejects malformed or incomplete route geometry; retained artifacts only, 68/68 HTTP200. Focused tests, API error mapping, tsc/ESLint/diff PASS. Checkpoint2026-10-27-0252-block-11-provider-response-bounds-DONE.md. Next block20 offline profile follow-up (PARTIAL).

Latest technical result: 24-block plan DONE14/24 (58.33%):1–10,12,17,19,22. Block10 adds an8s abortable collection webhook deadline; mocked timeout returns sanitized502 after one call, with no retry. Checkpoint2026-10-27-0245-block-10-webhook-deadline-DONE.md. Block20 remains PARTIAL. Next block11 router response bounds.

Latest technical result: 24-block plan DONE13/24 (54.17%):1–9,12,17,19,22. Block9 adds streamed size/object validation and fixes the Cyrillic address-detail filter leaking street names to the collection webhook; privacy and unknown-toll tests pass. Checkpoint2026-10-27-0244-block-9-collect-DONE.md. Block20 remains PARTIAL. Next block10 webhook deadline.

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
