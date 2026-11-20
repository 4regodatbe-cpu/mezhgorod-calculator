# Diff manifest

Candidate base: `40d650a29ee06643ee325402c3c4f7fead302dd9` (Stage Z). Worktree/branch: `/workspace/stage-z-stabilization` / `codex/stage-z-stabilization`. This list covers the Stage Z stabilization diff, including local records; it excludes the previously committed STARTED checkpoint whose commit is in the candidate ancestry.

| Status | Path | Purpose |
|---|---|---|
| M | `.github/workflows/v3-live-browser-acceptance.yml` | Rename dedicated Playwright fixture path, preserve explicit execution |
| M | `scripts/v3-live-browser-workflow.test.mjs` | Static contract tracks dedicated browser-only fixture |
| R100 | `scripts/v3-live-browser-hydration.test.mjs` → `scripts/v3-live-browser-hydration.browser.mjs` | Keep browser regression out of the offline `*.test.mjs` glob without dropping it |
| M | `scripts/v3-ckad-m11-m12-boundary.test.ts` | Compare derived signature separately; require fail-closed unknown for incomplete M‑4 replay |
| M | `docs/WORK_STATE.md` | Current handoff/status |
| M | `experiments/nationwide-tolls/WORK_LOG.md` | Dated result |
| M | `experiments/nationwide-tolls/NEXT_STEPS.md` | Exact gates/evidence still required |
| A | `docs/checkpoints/2026-11-06-stage-z-stabilization-DONE-LOCAL.md` | Detailed checkpoint |
| A | `experiments/nationwide-tolls/checks/2026-11-06-stage-z-stabilization/README.md` | Report and verified future workflow sequence |
| A | `experiments/nationwide-tolls/checks/2026-11-06-stage-z-stabilization/full-offline-gate.log` | Exact full direct offline run |
| A | `experiments/nationwide-tolls/checks/2026-11-06-stage-z-stabilization/DIFF-MANIFEST.md` | This bounded path manifest |

No runtime/source/tariff/geometry/route-selection/Android/V2 files are changed.
