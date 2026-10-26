# B03 hosted UI harness run 40340623345

- Commit: `9210cc6a86a389d96912c68efcb4b6e2f3f67c86` on the allowed branch; PR #14 Draft.
- GitHub Actions: [run 40340623345](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40340623345), job `address-ui`.
- Environment: Ubuntu 24.04.5; Node 24.21.0; Chrome for Testing 156.0.8078.47; Playwright 1.56.0; viewport 1280×900 and 320×720.
- Snapshot `positive-cities-2026-10-24`; expiry rechecked by runner at 2026-10-26T14:35:15.043Z; records hash verified as `98f0b3aff117d77525bcba9d65c4d507b1a29d540e0c9fdf553e5fb9494b2933`.
- Outcome: 1 PASS, 7 FAIL, 0 NOT_RUN, exit code 1. `scenarios.json` is the authoritative per-case result. `runner.stderr.txt` is empty; stdout, next-server log, environment and exit status are preserved beside it.
- Original Actions artifact `b03-address-ui-browser-40340623345`, ID `12657609853`, size 1,622,394 bytes, SHA-256 `5663d8424c49f326863783de88d24958010cdd887bf75bfac005c3dd1beaf7c9`; it contains all 7 diagnostic screenshots. GitHub retention until 2026-11-25T14:36:15Z.

## Interpretation

Case 01 passed: two distinct Donetsk options, no automatic selection, limited-coverage notice and OSM credit were visible. Cases 02–07 are not accepted as application failures because this runner version had test defects: it waited for a nonexistent `Быстрый маршрут` heading (the actual heading is `Основной маршрут`); custom response fixtures were attached as an unused property instead of passed as the callback; the default fixture returned Donetsk for unrelated city queries. The screenshots show calculation content rendered in case 02, so its timeout was specifically the heading locator.

Case 08 passed its preceding viewport, overflow, notice/credit and keyboard-selection assertions, then observed `swapVisible=false` at 320 px. Independent source inspection confirms `CalculatorForm` only renders the A↔B control when `onSwap` is passed, and V2 page does not pass it. This is a concrete UI defect; case 03 did not reach its swap assertions because its result-heading locator was wrong. The corrected harness must reproduce case 08 and reach case 03's swap check before any app fix is claimed.

The exact eight results, per-case request paths/counts, assertion errors, page/route errors, and screenshot hashes are in `scenarios.json`; screenshots are in the linked Actions artifact. No application source, feature flag or snapshot data was changed in this run.
