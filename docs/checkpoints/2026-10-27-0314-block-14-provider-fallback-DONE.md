# Reliability block14 — provider fallback and candidate selection — DONE — 27.10.2026 03:14 МСК

- Parent `82dbd8a2e832816f832d20bb428e9910eda518df`; allowed branch only, PR14 Draft; source-head workflow list empty.
- Inspected existing V3 route candidate and pipeline contracts. Added a narrowly scoped regression to `scripts/v3-route-selection-audit.test.ts`: a mocked Valhalla transport rejection (timeout-shaped provider failure) must not discard a valid faster OSRM candidate. It asserts HTTP200, OSRM ETA and route-quality provider identity.
- Existing route-selection cases in the same suite retain evidence for fastest OSRM ownership of its own geometry, malformed Valhalla candidate rejection, invalid special-zone ETA, stable equal-ETA ordering, admitted route geometry and unknown/null price when no complete proof exists. `v3-pipeline-integrity.test.ts` also checks paid trace, unknown/null, and explicit free behavior.
- Checks: `node --import ./scripts/register-ts-paths.mjs --test scripts/v3-route-selection-audit.test.ts scripts/v3-pipeline-integrity.test.ts` — both suites PASS; `npx tsc --noEmit` PASS; scoped ESLint PASS; `git diff --check` PASS. All provider calls are mocked; no external routing request.
- No route policy, candidate ranking, tariff, cache, or runtime behavior changed; one test-only change.
- Next: block15 review provider/geocode cache keys, lifetime and isolation from current code/tests, then test only a proven gap.
