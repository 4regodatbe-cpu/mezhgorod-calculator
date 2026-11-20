# B03 hosted UI harness run 40342429468

- Commit: `97fca61d595e49531139641d89004fde35ebe7f0`; allowed branch; PR #14 Draft.
- GitHub Actions: [run 40342429468](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40342429468).
- Environment: Ubuntu 24.04.5, Node 24.21.0, Chrome for Testing 156.0.8078.47, Playwright 1.56.0; 1280×900 / 320×720.
- Snapshot freshness rechecked at 2026-10-26T14:45:15Z, before app startup; records hash verified, expiration `2026-10-31T08:24:54Z`.
- Result: 5 PASS, 3 FAIL, 0 NOT_RUN; exit 1. No non-local browser requests, page errors or route errors. `scenarios.json` is the authoritative per-case result; stdout/stderr and app-server log are preserved here.
- Actions artifact ID `12658779947`, size 665,064 bytes, SHA-256 `717eab487c8dfdef3a71018b3d124543ef93328021fcbf39620413c06e2922a2`; expires 2026-11-25T14:45:42Z and contains screenshots for failed cases.

## Case interpretation

PASS: 01 Donetsk disambiguation; 02 selecting both fallback records preserved labels, exact positions, `reviewed_city_snapshot` source and both notices; 04 clearing/replacing B with Rostov made a fresh request and selected it; 05 delayed old response did not restore Donetsk over Krasnodar; 07 repeated fallback queried fresh while ordinary Moscow result used positive cache.

03 reproduced the UI defect: after a successful calculation, `resultVisibleBeforeSwap=1` but `swapButtonCount=0`. `CalculatorForm` renders the optional control, but the V2 page does not pass its callback. Scenario 08 timed out before `/r` and screenshot shows the untouched placeholder; because navigation waited only for DOMContentLoaded/visible input and not React's first effect, treat that mobile case as inconclusive test startup timing, not a product failure. A prior run got through mobile keyboard/attribution assertions and observed the same missing swap control.

06's failure was a test assertion issue: `buttonsFor()` also counts the `Повторить` control in the 502 UI. The code already clears items on error; the corrected assertion will specifically count suggestion `<strong>` elements and preserve retry availability. No live geocoder was used, the snapshot flag remains off, and this mocked run does not establish that the original external B-only failure is fixed.
