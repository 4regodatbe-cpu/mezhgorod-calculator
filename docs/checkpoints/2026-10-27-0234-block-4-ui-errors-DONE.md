Status: DONE — 27.10.2026 02:34 МСК.

Task: reliability plan block4, V2/V3 request error handling. Parent `a6f30e7ada3f760c770577e52bba6e639a195d0b`; allowed branch only; PR14 remains Draft.

Test-first verification reproduced a leak in both hooks: an unexpected network rejection message such as `provider.internal.example/private-token` was copied into the visible error state. HTTP 400/500/502/504 safe API messages were already preserved.

Added `app/v2/components/request-errors.ts` with a tagged `UserFacingCalculationError`. Both hooks tag only known API messages and the existing malformed-route message; untagged exceptions now receive a generic Russian message with retry guidance. Abort still returns silently. No automatic retries, pricing, route selection or API status behavior changed.

Checks PASS:

- `node scripts/v2-hook-unmount-abort.test.mjs` — 5/5.
- `node scripts/v3-hook-race-audit.test.mjs` — 8/8.
- `node --import ./scripts/register-ts-paths.mjs --test scripts/special-territory-api.test.ts` — PASS.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — 0 errors; one existing warning for unused `analyticsVersion` in `use-v2-calculation.ts`.
- `git diff --check` — PASS.

No browser, external network, full build or broad Actions run. Technical progress 8/24 (33.33%): blocks1–4,12,17,19,22. Next block5 cancellation/races; do not repeat the eight hosted B03 cases.
