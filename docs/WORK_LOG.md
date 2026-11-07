# Work log

Append-only summary of substantial project work. Detailed evidence remains in stage checkpoints.

## 2026-11-07 — Stage AA: V3 final-gate and route diagnosis

- Base/published head: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; isolated branch `codex/final-gate-v3-repair`.
- Implemented and locally committed final-gate/harness corrections at `da4e362013ddbe2e2fb7ed9e3ed44d1ea4f3ab2f`.
- Old “nine failures” were V2 calls and unsupported expectations; no V3 runtime defect established. Four of six bounded V3 routes returned HTTP 200; Tver→Adler and Golubitskaya→SPB returned HTTP 502 after all three route providers failed, with no finer status exposed. Two M‑12 full toll results remain `unknown/null` because the direct tariff pair/boundary is unproven.
- Replaced deleted workflow script references with current executable checks and added a V3-only bounded live diagnostic without persisting provider geometry/raw payloads. V2 remains explicitly covered.
- Full build: 1142 passed, 0 failed, 1 skipped; TypeScript PASS; ESLint exit 0 (9 warnings); webpack build PASS; final-gate harness 6/6; API smoke 16/16; route benchmark 61 PASS. Standard Next/Turbopack build passed. Strict tariff freshness remains blocked by two October 1 snapshots at 37 days vs 30-day threshold, with effective dates unknown.
- No runtime/pricing/geometry edits. No push or publication. PR #14 remains Draft.
- Detailed results: [Stage AA checkpoint](checkpoints/2026-11-07-stage-aa-v3-final-gate-DONE-LOCAL.md).
