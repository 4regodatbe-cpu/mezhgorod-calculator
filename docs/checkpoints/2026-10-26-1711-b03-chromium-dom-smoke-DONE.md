# B03 Chromium hosted smoke — DONE

26.10.2026 17:11 МСК. Branch `fix/v3-missing-route-prices-2026-10-15`, source/test head `0895948e294b9f17efa00cb8a9a52c14bf9eef27`; PR #14 remains Draft.

## Result

GitHub Actions run [40336150199](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40336150199) completed SUCCESS. GitHub-hosted Linux/Ubuntu 24.04 runner used Node `v22.23.3` and stable Chrome `156.0.8078.47`. All five workflow steps passed, including browser setup, one launch, and artifact upload.

The only browser action was headless `about:blank` with a 30-second timeout. It exited `0`; captured DOM is exactly `<html><head></head><body></body></html>` and the `<html>` criterion passed. Browser stderr includes D-Bus/UPower environment warnings/errors, non-fatal for this blank page; there were no address or app requests. No app checkout, project dependency installation, `/r` intercept, or B03 UI scenario ran in this block.

The artifact was downloaded, enumerated, and retained at [`checks/2026-10-26-b03-chromium-dom-smoke`](../../experiments/road-ref-boundaries/checks/2026-10-26-b03-chromium-dom-smoke/README.md). Artifact ID `12656264139`, SHA-256 `3645c3441239a8bd16a57c5abe5b8fba7b67ff95732bd1d788ecdb27acb5dd8e`; local ZIP hash matches GitHub's artifact digest. Run/job logs were fetched. A separate existing PR workflow was also automatically triggered: run `40336163360` completed overall SUCCESS; its `verify` and `calculation_timing` jobs passed while `live_probe` ended failure under its `continue-on-error` configuration. That live probe was not re-investigated or retried.

## Next block: eight mocked UI scenarios

Smoke removes the browser-runtime blocker, so a separate B03 UI block is now STARTED. Use the actual V2 page, Chromium `156.0.8078.47`, controlled `/r` responses with the exact reviewed snapshot items, and block all non-local browser traffic. Record per-case result, viewport, request count, browser/runtime versions, stderr and screenshots/evidence. Never call Photon or another external address/routing provider.

Required cases, from `ADDRESS_CITY_SNAPSHOT.md` and contractor brief B03:

1. Search `Донецк` in A: two exact distinct reviewed items, no auto-selection, limited-coverage notice, OSM/ODbL href and credit.
2. Select one result in A and another in B; retain the exact label/position/source notice for each selected fallback.
3. Swap A↔B; values and source metadata move together and prior result is reset.
4. Clear B and search a different city; stale items/position/source disappear and the new request remains selectable.
5. Delay an old `/r`, then edit/clear; stale response cannot restore old data/notice or overwrite the new value; no unhandled abort error.
6. Exercise normal items without fallback, successful empty results, then 502/error and retry; old results are not selectable.
7. Repeat a fallback query in the same browser: issue a new `/r` request (not legacy-LRU fallback); separately verify ordinary positive cache remains effective.
8. At narrow viewport, verify readable notice/credit, usable dropdown, clear/swap and keyboard selection; save viewport screenshot.

Before loading any snapshot item in the scenario runner, re-read `data/address-city-snapshot.json` from the current branch and require `now < expiresAt`. At this checkpoint the source expiry is `2026-10-31T08:24:54Z` (31.10.2026 11:24:54 МСК), so it is currently fresh. If expired at scenario execution time, do not use these items; wait for new capture/review. Keep `addressCitySnapshot=false`; no Production release or B-only fix claim follows from UI mocks.

## Verification and limits

- Smoke workflow YAML parsed before persistence; remote readback of workflow/STARTED state matched the source bytes.
- Smoke result/artifact checked from GitHub; local artifact digest matched remote.
- No application/test code was modified by the smoke block.
- Eight UI scenarios remain NOT_RUN until the separately started run; they will be saved as individual results.
