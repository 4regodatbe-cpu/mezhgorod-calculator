Status: DONE — 27.10.2026 02:40 МСК.

Task: reliability plan block7, calculation request body limits. Parent `fff8197ef0a9d7d579ed18b6eed75a360209d8ca`; allowed branch only; PR14 remains Draft.

Test-first evidence showed no size cap before V2/V3 `request.json()`: an oversized request was parsed and continued to provider work; malformed JSON became an internal500 response.

Added shared `lib/limited-json-body.ts` for a16KiB streamed JSON-object cap. A declared `Content-Length` over the limit is rejected and the stream cancelled before reading; actual bytes are counted so missing or understated lengths cannot bypass the cap. Invalid UTF-8/JSON and top-level null/array return400; oversized input returns413. Both calculation APIs now use the same reader while preserving V3 request timing.

Checks PASS:

- `node --import ./scripts/register-ts-paths.mjs scripts/calculation-request-body-limit.test.ts` — 2/2, including false `Content-Length`; provider calls0 for oversized bodies.
- V2 `special-territory-api`, V3 `v3-pipeline-integrity`, `calculate-api-error-mapping`, and `v2-partial-trace-recovery` focused suites — PASS after parser integration.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — exit0.
- `git diff --check` — PASS.

No live service, broad audit, full build or Actions. Technical progress11/24 (45.83%): blocks1–7,12,17,19,22. Next block8: request string bounds.
