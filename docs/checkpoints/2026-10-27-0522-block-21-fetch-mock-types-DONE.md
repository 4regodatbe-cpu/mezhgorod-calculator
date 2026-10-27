# Reliability block21 — fetch-mock typing group 1 — DONE — 27.10.2026 05:22 МСК

- Parent branch/readback was confirmed before the group; allowed branch only; PR14 Draft; no active Actions.
- Fixed only `scripts/address-probe-timeout.test.ts`: typed never-resolving fetch as `Promise<Response>`, used a small correctly typed mock helper, normalized optional/null `AbortSignal`, accepted `URL | Request` inputs, and asserted the expected source error exists before reading its name. Runtime scenarios/assertions were not weakened.
- Baseline strict scripts/tests noEmit: 57 diagnostics/24 files. After this group the same strict config reports46 diagnostics/23 files and none in the edited file (11 removed).
- Test `node --import ./scripts/register-ts-paths.mjs --test scripts/address-probe-timeout.test.ts`: 1/1 file PASS. `npx eslint scripts/address-probe-timeout.test.ts` PASS; `git diff --check` PASS.
- Temporary `tsconfig.scripts.json` was removed; it is not being advertised as a ready CI gate. Full scripts/tests typecheck remains BLOCKED_FOR_ADOPTION, not DONE. App behavior is unchanged.
- Overall reliability progress stays21/24 (87.5%). Next: fix one independent strict-type diagnostic group, preserving assertions and checking targeted tests.
