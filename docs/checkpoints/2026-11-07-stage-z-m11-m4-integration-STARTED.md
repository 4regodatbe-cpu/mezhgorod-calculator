# Stage Z combined M‑11/M‑4 integration — STARTED

Date: 2026-11-07 UTC. Worktree: `/workspace/stage-z-stabilization`, branch `codex/stage-z-stabilization`; verified starting HEAD `0dc9560450128f73590c6ca521ef5f176bb62db1`, parent `ab2534bf50242afd8dd0cae0327071ca4a0a1db7`, Stage Z base `40d650a29ee06643ee325402c3c4f7fead302dd9`. The original Stage Z worktree is still at its base; the 91-commit primary worktree remains at `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe`. Existing branch status was clean before this checkpoint.

## Scope

Inspect the published `handoff/2gis-evidence` branch read-only at expected SHA `9c625c4cf5ea89625623fb4ead4bb4980b3e03c6`. Verify its manifest/checksums, original Stage 8 archive/history correction and six source/evidence tests. Do not merge/copy the research subtree or apply historical runtime/data overlays blindly. Then adapt only the independently sourced M‑11 15–58 matrix to the current V3 architecture while preserving Stage Z M‑4 trace/data guards; no M‑12/M4‑545 price is added absent an exact operator product binding. No push, merge, Preview, Production, main, Android or PR #14 state change.

## Known source-handoff facts (not yet independently reverified)

- Current M‑11 Appendix 3 states 42 directed pairs / 210 Category I no-transponder cells, effective at `2026-11-02T01:00:00+03:00`; April 24 edition and November 3/4 special profiles are retained.
- Operator terms select tariff at exit-PVP passage; current calculator freezes a trip estimate at departure. There is no verified per-PVP arrival-time prediction contract yet. Do not claim exact billed time tariff when a trip crosses the 01:00 edition or daily profile boundary.
- Historical Stage 8 runtime patch SHA is reported corrected to `136a5a72f76076188b3768897951a2b700a3d728`; its old file layout is not the current calculator layout. The `main`-targeted overlay is for another commit and must not be applied mechanically.
- Hand-off M‑4 PVP545 cases and four M‑12 physical↔tariff crosswalks remain explicit UNKNOWN; CKAD outcome is unknown/no-replay. These are guard-test inputs, not authorization to invent prices.

## Sequence and recovery

1. Read the handoff docs/license and confirm every path/hash in the manifest, archive SHA, historical commit availability and the six data/source tests without merging its branch.
2. Inspect current M‑11 model, date/profile semantics, M‑4 composition and APIs; design a minimal independent versioned M‑11 15–58 tariff lookup. Keep 58–679 separate and retain unknown on unresolved geometry, boundary or date/profile ambiguity.
3. Add targeted adapter/API regressions and explicit around-boundary/Nov. 3/4 controls. Keep M‑4/PVP62/71 and unknown/partial/free/priced invariants green.
4. Run affected tests, six source/evidence tests, full offline gate, TS, ESLint, Webpack build; classify the three known subprocess sandbox failures without weakening them. Do not rerun Production browser acceptance.
5. Save a local commit, update work state/log/next steps, diff manifest and bundle; verify clean readback. Push remains forbidden.

No implementation or source archive is accepted yet. If a checksum/source mismatch or missing exit-time evidence changes eligibility, preserve the evidence and leave affected output `unknown/null`; continue independent M‑11 model work where facts suffice.
