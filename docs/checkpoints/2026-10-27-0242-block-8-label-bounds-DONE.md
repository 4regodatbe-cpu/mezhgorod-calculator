Status: DONE — 27.10.2026 02:42 МСК.

Task: reliability plan block8, address/locality label bounds. Parent `e12ffd2f880413efe5a906b2996d82cf2f38d01b`; allowed branch only; PR14 remains Draft.

Test-first endpoint evidence showed that a257-character route label passed both V2/V3 point validation and proceeded to mocked provider requests, ultimately returning502 from the mock providers. No maximum label length existed.

Added shared `lib/route-input-validation.ts` with a256-Unicode-code-point maximum. Both V2/V3 endpoints use the same validator. It preserves the supplied label without normalization and retains prior non-empty and coordinate-range checks; labels over the bound return400 before geocoding/routing. Exact256-character Cyrillic and256 supplementary emoji code points pass;257 fails.

Checks PASS:

- `node --import ./scripts/register-ts-paths.mjs scripts/calculation-point-label-limit.test.ts` — 2/2, oversized values cause0 provider requests.
- V2 `special-territory-api` and V3 `v3-pipeline-integrity` focused API suites — PASS.
- `npx tsc --noEmit` — exit0.
- Scoped ESLint — exit0.
- `git diff --check` — PASS.

No live calls; query text, label normalization/ranking, route policy and tariff rules unchanged. Technical progress12/24 (50%): blocks1–8,12,17,19,22. Next block9: `/api/collect` resource bounds.
