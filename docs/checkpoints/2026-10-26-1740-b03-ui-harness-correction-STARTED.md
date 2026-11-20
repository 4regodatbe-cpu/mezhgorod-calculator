# B03 UI harness correction and rerun — STARTED

- Status: STARTED, 26.10.2026 17:40 МСК.
- Allowed branch `fix/v3-missing-route-prices-2026-10-15`; saved base `9210cc6a86a389d96912c68efcb4b6e2f3f67c86`; PR #14 Draft.
- Prior test: [40340623345](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40340623345); detailed result and artifacts: [FAILED checkpoint](2026-10-26-1739-b03-ui-harness-run-FAILED.md), [evidence](../../experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40340623345/README.md).

Fix only harness-caused errors: align result heading selector to the actual `Основной маршрут`; pass dynamic `/r` callbacks through the correct argument and use query-appropriate default records (Donetsk, Krasnodar, Rostov, and ordinary Moscow). Preserve all assertions. Keep app source/flag/data unchanged until the corrected suite can prove an app defect.

The prior artifact observed the swap control absent on mobile (all other mobile checks passed), and source shows the optional `onSwap` prop is not wired from the V2 page. Confirm through corrected desktop and mobile scenarios before implementing a fix.

Before browser execution, read current remote branch head, ensure Actions idle, fetch the snapshot from that exact branch, verify its record-set hash and `Date.now() < expiresAt`. If stale/expired/hash mismatch, record BLOCKED without using the records. Run only the eight controlled UI scenarios in the isolated workflow; retain per-case JSON, stdout/stderr, environment, screenshots/artifact digest and exit code. Save DONE/FAILED and readback before any subsequent block.
