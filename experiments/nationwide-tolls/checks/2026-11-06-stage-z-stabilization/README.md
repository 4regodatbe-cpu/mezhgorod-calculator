# Stage Z stabilization — browser/offline harness and saved-route tariff status

Date: 2026-11-06 UTC. **Local only; publication prohibited.** Worktree `/workspace/stage-z-stabilization`, branch `codex/stage-z-stabilization`; starts at Stage Z commit `40d650a29ee06643ee325402c3c4f7fead302dd9`. Stage Z source worktree and the protected 91-commit worktree were not changed. No HTTP routing/tariff request, 2GIS call, push, Preview, Production, merge, main, Android or V2 change occurred. PR #14 remains Draft.

## Findings and changes

1. **The CKAD fixture was not missing from this checkout.** The two own route/capture records and related source evidence exist under `experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five/` and `experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/`. `validateTollEdges()` now returns a derived `routeSignature`; the historical gzip capture intentionally predates that field. The test now excludes that derived field from the historical deep equality and separately proves that it equals `roadRouteSignature(route.coordinates)`. Capture files were not changed or fabricated. The corrected file passes all 8 direct subtests.

2. **Browser test dependency scope was wrong.** `package.json:test:audit` includes `scripts/*.test.mjs`, while the delayed-hydration test requires a real standalone Playwright module and Chrome. The dedicated `.github/workflows/v3-live-browser-acceptance.yml` installs pinned `playwright@1.56.0` and Chrome and explicitly runs this test with `PLAYWRIGHT_MODULE`/`CHROME_PATH`; the general offline workflow does not. Renamed it from `scripts/v3-live-browser-hydration.test.mjs` to `scripts/v3-live-browser-hydration.browser.mjs`, updated the dedicated workflow path/command and the static contract. This keeps the test mandatory in its browser workflow; it does not skip, stub, weaken, or delete browser assertions. `scripts/v3-live-browser-workflow.test.mjs` passes. Local Playwright is absent, so the browser fixture was not executed in this environment.

3. **The saved Voronezh assertion expected an unsupported final price.** Its prior record marks 7,254 ₽ `priceConfirmation=unconfirmed`; the API-facing Stage Z replay has incomplete M‑4/PVP proof. Of five M‑4 validation requests observed in the current run, only one recorded response exists; four are missing from this historical replay. The corrected regression confirms M‑4 is `missing`, the component amount is `null`, and the API status/value remain `unknown/null`; it also asserts that the four missing responses are recorded as replay misses. This is not a claim that 7,254 ₽ is an operator tariff, and no tariff/runtime data changed. Yalta→Rostov remains an unconfirmed estimate, not a confirmed full-route fare.

## M‑4/V3 scenarios actually exercised

Command:

```sh
node --import ./scripts/register-ts-paths.mjs --test \
  scripts/v3-m4-62-71-saved-route.test.mjs \
  scripts/v3-m4-selected-trace-reuse.test.ts \
  scripts/v3-m4-a289-composition.test.mjs \
  scripts/v3-a289-long-route.test.mjs \
  scripts/a289-short-route.test.mjs
```

Result: **5/5 test files PASS**. The saved-route cases cover directed PVP71 once vs PVP62 exit ramps, routes ending before/starting after PVP71, reverse-direction PVP71 and Order 58 fare profile, proof-of-no-event vs incomplete geography, deduplicated repeated events/multiple plazas, complete vs partial/foreign traces, M‑4/A‑289 composition and no duplicate A‑289 charge, and full-vector guards. The CKAD/V3 saved-route file separately passes **8/8** including two V3 API replays that preserve full-trip `unknown/null` when M‑12 is unresolved and the Voronezh route with incomplete M‑4 evidence.

No evidence supports assigning the historical 7,254 ₽ as a complete current V3 fare. The present API contract correctly declines a full price where the M‑4 trace is incomplete, rather than turning a known subset into an exact total.

## Test and build results

- Direct equivalent of the `test:audit` file globs, excluding the now dedicated `.browser.mjs` test: **191 PASS / 3 FAIL of 194**; complete output is [full-offline-gate.log](full-offline-gate.log). The three failing files were run directly and classified:
  - `audit-child-process.test.mjs`: 1/3 passes (silent-child deadline); two assertions fail because sandbox child-process mediation loses child stdout/stderr and supplies wrapper stderr (`Command failed: …`) instead of the child's `provider failed` text.
  - `automatic-policy-replay-integration.test.mjs`: 0/3 pass; nested mock Node is not launched/writes no `.mock-commits.jsonl`, then the parent hits `ENOENT`. This is a sandbox subprocess restriction, not missing repository fixture.
  - `systemic-audit-report.test.mjs`: `execFileSync` fails at `spawnSync … node EPERM` before the report builder runs.
- The previously reported “missing CKAD fixture” is closed as an incorrect diagnosis; the saved files are available and the corrected test passes.
- `pnpm test:audit` itself did not reach the tests: pnpm 11.25.0's auto-install attempted `mkdir /home/agent/.local/share/pnpm/store` and failed `ENOENT`. No package install/store deletion was attempted. The direct command used the exact package test glob followed by the separate quote/API test.
- `node experiments/nationwide-tolls/scripts/quote.test.cjs`: PASS (quote completeness/null/API adapter contracts).
- `./node_modules/.bin/tsc --noEmit`: PASS (exit 0).
- `./node_modules/.bin/eslint . --ignore-pattern .next`: PASS (exit 0, 0 errors, 9 warnings in existing files).
- `./node_modules/.bin/next build --webpack`: PASS (Next 16.3.4, production compilation and 16 static pages); existing `preferredRegion` deprecation warning only.
- Browser/workflow: static workflow contract 1/1 PASS; Python YAML parse, both renamed/static JS `node --check`, and `git diff --check` PASS. Real Playwright hydration/browser run: **NOT RUN locally** (standalone Playwright absent). The dedicated hosted workflow installs it and must run on the exact candidate SHA.
- `pnpm test:audit`, full `pnpm build`, hosted CI, and real browser execution are not represented as PASS.

## Changed paths and candidate scope

Only these functional/test/workflow paths changed:

- `.github/workflows/v3-live-browser-acceptance.yml`
- `scripts/v3-live-browser-workflow.test.mjs`
- `scripts/v3-live-browser-hydration.browser.mjs` (rename only)
- `scripts/v3-ckad-m11-m12-boundary.test.ts`

No runtime, price matrix, geometry, source capture, route-selection policy, M‑11 data, other-road tariff or Android/V2 code changed. Docs/checkpoints and this result log are the only other changes.

## Exact next hosted verification (requires separate push authorization)

After the owner authorizes publication and the remote head/fast-forward are rechecked, publish only the reviewed candidate SHA through the allowed working branch. On that exact SHA verify:

1. `Special territory geometry and pricing` (`special-territory-policy.yml`): frozen install, `pnpm test:audit`, TypeScript, Next build; inspect its mandatory offline job separately from its continue-on-error live probe.
2. `Calculator final gate` (`calculator-final-gate.yml`) on PR #14 / manual dispatch: all static pricing/composition gates, `pnpm lint`, `pnpm build`, and post-build API/route checks.
3. `V3 live browser acceptance`: pinned Playwright/Chrome fixture plus eight real Production read-only scenarios. Verify the artifact and exact test output; a green workflow summary alone does not replace results inspection.

No push is authorized by this task. If one of these workflows cannot run on the candidate SHA, preserve the failure and stop; do not publish elsewhere or alter `unknown` to make a gate green.
