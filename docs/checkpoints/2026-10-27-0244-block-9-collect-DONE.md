Status: DONE — 27.10.2026 02:44 МСК.

Task: reliability plan block9, `/api/collect` resource bounds, validation and privacy. Parent `e5c4d89c29fe1539d3b07b1002e3f5edaee18132`; allowed branch only; PR14 remains Draft.

Test-first evidence found two defects: a body larger than16KiB reached the configured webhook, and coarse-region filtering sent Cyrillic street labels `ул. Секретная` / `ул. Частная` because JavaScript `\b` only treats ASCII word characters as word boundaries.

`/api/collect` now uses the shared streamed JSON-object reader with a16KiB limit. Oversized input returns413; malformed/non-object input returns400; none reaches the webhook. Unicode-aware token boundaries now remove street and house parts but retain city/region text. Existing privacy transformation and route statistics schema remain. Unknown toll accepts only null weekday/weekend amounts; output is transformed to the legacy aggregate route row without tariff fields.

Checks PASS:

- `node --import ./scripts/register-ts-paths.mjs scripts/collect-api-bounds.test.ts` — 2/2, including Cyrillic address privacy and unknown/null values.
- `node --import ./scripts/register-ts-paths.mjs scripts/calculation-request-body-limit.test.ts` — 2/2 after shared-reader parameterization.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — exit0.
- `git diff --check` — PASS.

Webhook was mocked; no external call was made. Technical progress13/24 (54.17%): blocks1–9,12,17,19,22. Next block10: webhook timeout/cancellation.
