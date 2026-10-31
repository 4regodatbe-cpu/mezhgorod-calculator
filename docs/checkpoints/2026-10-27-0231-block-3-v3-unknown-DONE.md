Status: DONE — 27.10.2026 02:31 МСК.

Task: reliability plan block3, V3 unknown/null response and display contract. Parent `a5ee1c1f6785d5cd421d80de2c3eb3d1f4c56e4b`; allowed branch `fix/v3-missing-route-prices-2026-10-15`; PR14 remains Draft.

Verified existing `validV3Response`, V3 copy path, and the shared fastest-route UI used by `app/v3/page.tsx`. `unknown` is accepted with `amount`, `weekdayAmount`, and `weekendAmount` all null; any contradictory zero value is rejected. Explicit `free` with three zero amounts remains valid. The rendered unknown quote displays only the base fare, not a complete trip total. Existing copied-quote test preserves the unknown label. No runtime defect reproduced.

Added two regression cases: response-state distinction in `scripts/v3-response-copy-audit.test.ts`, and actual shared result-card rendering in `scripts/v3-result-render-audit.test.mjs`. No runtime code, fare data or route policy changed.

Checks PASS:

- `node scripts/v3-result-render-audit.test.mjs` — 3/3.
- `node --import ./scripts/register-ts-paths.mjs --test scripts/v3-response-copy-audit.test.ts scripts/v3-hook-race-audit.test.mjs` — PASS.
- `npx tsc --noEmit` — exit0.
- `npx eslint scripts/v3-response-copy-audit.test.ts scripts/v3-result-render-audit.test.mjs` — exit0.
- `git diff --check` — PASS.

No browser, network, full build or broad CI was run. Technical progress 7/24 (29.17%): 1,2,3,12,17,19,22. Next block4: UI error cases.
