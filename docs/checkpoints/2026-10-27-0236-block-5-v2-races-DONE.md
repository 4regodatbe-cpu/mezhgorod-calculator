Status: DONE — 27.10.2026 02:36 МСК.

Task: reliability plan block5, request cancellation/races. Parent `37024801dd3c0f2795fdd6dedb181bb9b0700ffa`; allowed branch only; PR14 remains Draft. B03 browser scenarios were not repeated.

Test-first failures showed that V2 `clearResult()` left a previous request error in state and a pending clipboard write could mark the cleared route copied when it completed later. The V2 hook also allowed clipboard rejection to escape uncaught.

Updated `app/v2/components/use-v2-calculation.ts` to clear error/manual/copy state and detach+abort the active request on reset; ignore clipboard completion when the route controller changed or aborted; report clipboard permission failure safely; and cancel copy indicator timers on reset, new calculation and unmount. Existing calculate cancellation behavior and route/business logic remain unchanged.

Checks PASS:

- `node scripts/v2-hook-unmount-abort.test.mjs` — 9/9.
- `node scripts/v3-hook-race-audit.test.mjs` — 8/8.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — 0 errors; one existing warning for unused `analyticsVersion` in V2 hook.
- `git diff --check` — PASS.

No browser, external network, full build or broad Actions. Technical progress 9/24 (37.5%): blocks1–5,12,17,19,22. Next block6: API request/response contracts.
