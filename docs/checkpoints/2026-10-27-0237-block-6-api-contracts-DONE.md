Status: DONE — 27.10.2026 02:37 МСК.

Task: reliability plan block6, V2/V3 API contract compatibility following strict date validation, safe API error mapping, and corridor-recovery unknown/null behavior. Parent `ca1704e4d234a281980b09c0216e546bceb19304`; allowed branch only; PR14 remains Draft.

No runtime changes. Four existing isolated mocked suites covered:

- `scripts/special-territory-api.test.ts`: V2 ordinary/special request and response forms, dates and unknown toll state.
- `scripts/v3-pipeline-integrity.test.ts`: V3 single-fast-route response and guard; priced, unknown and free states.
- `scripts/calculate-api-error-mapping.test.ts`: user input/upstream/internal safe status and response message mapping for both APIs.
- `scripts/v2-partial-trace-recovery.test.ts`: partial recovery diagnostic retained while public totals remain unknown/null.

All four commands passed with mock-only routing. No contract defect reproduced; V2 and V3 policies remain separate. Payload limits and input string bounds remain for blocks7–8.

Technical progress 10/24 (41.67%): blocks1–6,12,17,19,22. Next block7: request body size limits.
