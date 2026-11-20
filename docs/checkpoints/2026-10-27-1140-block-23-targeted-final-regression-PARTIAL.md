# Reliability block23 — targeted final regression — PARTIAL — 27.10.2026 11:40 МСК

- Parent `4d63cd585399736d2d8be48ef1428e0c5bb30229` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Focused aggregate for17 modified test files:17/17 PASS. Standalone CKAD production regression PASS (east-arc result1800 ₽); M11 boundary fixture gate PASS (8 controls, unsupported cases remain unresolved). No provider capture, network route audit, or broad test corpus was run.
- Application `npx tsc --noEmit`, scoped ESLint across modified source/tests, and `git diff --check` PASS. Strict scripts/tests typecheck PASS per [block21 checkpoint](2026-10-27-1130-block-21-scripts-typecheck-DONE.md).
- Full current-head build/final hosted gate is not verified. `npm run build` invokes `test:audit`; repeating it locally would revisit the known Codex `spawnSync` limitation. The prior hosted run40469828321 passed verify/build on an earlier SHA but unexpectedly ran live probes; its address job ended SOURCE_UNAVAILABLE after HTTP503, artifact12718511135. No rerun was started.
- Block23 remains PARTIAL; overall completed progress22/24 (91.67%). No current-head build or full CI success is claimed.
