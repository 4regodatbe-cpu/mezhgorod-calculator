# B03 first hosted UI suite — FAILED (harness defects; one UI defect observed)

- Status: FAILED for harness quality; 8 cases executed, but 02–07 are invalid as product judgments because of verified harness defects. 26.10.2026 17:39 МСК.
- Branch `fix/v3-missing-route-prices-2026-10-15`, remote/run SHA `9210cc6a86a389d96912c68efcb4b6e2f3f67c86`; PR #14 remained Draft.
- Run: [40340623345](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40340623345), result artifact ID `12657609853`.

## Environment and freshness

GitHub-hosted Ubuntu 24.04.5, Node 24.21.0, Chrome for Testing 156.0.8078.47, Playwright 1.56.0. The workflow rechecked the source immediately before app startup at `2026-10-26T14:35:15.043Z`; snapshot `positive-cities-2026-10-24` expires `2026-10-31T08:24:54Z`, records SHA verified as `98f0b3aff117d77525bcba9d65c4d507b1a29d540e0c9fdf553e5fb9494b2933`. Eight browser cases ran, zero non-local browser requests, no page or route errors. Runner exit code 1; stderr empty.

Artifact ZIP size 1,622,394 bytes, SHA-256 `5663d8424c49f326863783de88d24958010cdd887bf75bfac005c3dd1beaf7c9`; retained on the Actions run until 2026-11-25. Extracted `environment-runner.txt`, `environment.json`, `exit-code.txt`, `next-server.log`, `runner.stdout.txt`, `runner.stderr.txt`, `scenarios.json`, and `summary.json` to [evidence directory](../../experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40340623345/). The eight case-level results and screenshots/hashes are fully represented in the JSON/artifact.

## Observations

| Case | Recorded result | Interpretation |
| --- | --- | --- |
| 01 Donetsk disambiguation | PASS | 2 distinct options, query stayed unselected, limited-coverage notice and exact OSM href visible. |
| 02 select A and B | FAIL: 10 s waiting for heading `Быстрый маршрут` | Harness locator wrong: actual rendered result heading is `Основной маршрут`; screenshot shows calculation result present. |
| 03 swap and reset | Same heading timeout | Harness did not reach swap assertions. |
| 04 clear/replace B | FAIL: expected Krasnodar item absent | Default mock returned Donetsk for every query; invalid product judgment. |
| 05 stale response race | FAIL: showed two Donetsk items for Краснодар | Callback stored as unused property; route handler invoked default callback. Harness defect; race not yet classified. |
| 06 normal/empty/502/retry | FAIL: no matching `/r` event for first search | Same unused callback wrapper pattern; inspect after callback correction. No classification yet. |
| 07 cache distinction | FAIL: extra request and Donetsk items for Moscow | Same unused callback wrapper pattern; invalid product judgment. |
| 08 narrow/keyboard | FAIL only at final swap assertion | Earlier viewport 320×720, no horizontal overflow, menu/credit/clear fit, keyboard selection and notice passed; actual `swapVisible=false`. |

Case 08's absent A↔B control is independently supported by code: `CalculatorForm` renders it only when optional `onSwap` is supplied; `app/v2/page.tsx` does not pass that prop. This is the only concrete application issue observed so far, but must be rechecked after fixing the harness. Do not claim the original B-only behavior fixed. `addressCitySnapshot` remains false.

## Repair and next step

Corrected harness locally: use the rendered heading label `Основной маршрут`; route query-specific fallback fixtures through the callback parameter, with city-specific default responses; do not alter application assertions. Next, save this failed-run evidence and corrected harness plus a fresh STARTED checkpoint using a non-force update only when Actions are idle. Re-fetch and validate the remote snapshot immediately before the next run. Then run once and preserve a fresh artifact/readback before deciding whether a narrow V2 swap implementation is warranted.
