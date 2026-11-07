Status: DONE — 27.10.2026 02:45 МСК.

Task: reliability plan block10, webhook timeout/cancellation/errors. Parent `3b60bd138d6ed9a76dbd870ed0892d72ea0d3c28`; allowed branch only; PR14 remains Draft.

Test-first mocked transport confirmed the collection webhook POST had no abort signal/deadline. Added an8,000ms `AbortSignal.timeout` to the single outbound request. Timeout/transport errors use the existing generic502 message; no retry was added. Unknown provider response text is not exposed. No webhook was contacted.

Checks PASS:

- `node --import ./scripts/register-ts-paths.mjs scripts/collect-webhook-deadline.test.ts` — timeout signal, abort, exactly one fetch, generic502.
- `node --import ./scripts/register-ts-paths.mjs scripts/collect-api-bounds.test.ts` — body/validation/privacy cases PASS.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — exit0.
- `git diff --check` — PASS.

Technical progress14/24 (58.33%): blocks1–10,12,17,19,22. Next block11: bound Valhalla/OSRM/BRouter response bytes using retained real response sizes; no recapture without need.
