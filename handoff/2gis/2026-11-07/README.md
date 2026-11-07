# Final 2GIS evidence handoff — 2026-11-07

Status: **MASS-300 CLOSED_PARTIAL**. Research calls are closed. Never repeat the prior 11 requests, the unknown CKAD attempt, or the MASS request that returned HTTP 429.

## Start here

- [Integration instructions for the main Codex](MAIN_CODEX_HANDOFF.md)
- [Evidence review v2](evidence-next-v2/README.md) and its [integration memo](evidence-next-v2/MAIN_CODEX_INTEGRATION.md)
- [Accepted calculations](evidence-next-v2/ACCEPTED_WORKING_CALCULATIONS.json)
- [Unresolved tariff bindings](evidence-next-v2/UNKNOWN_BINDINGS.json)
- [MASS-300 final report](mass300/2gis-mass300-evidence/CONTINUATION/EXECUTION/RESULTS_FINAL.md)
- [MASS per-request ledger](mass300/2gis-mass300-evidence/CONTINUATION/EXECUTION/REQUEST_LEDGER.csv)
- [Geometry/payment control pairs](mass300/2gis-mass300-evidence/CONTINUATION/EXECUTION/CROSS_CONTROL_COMPARISONS.json)
- [Offline live-result verifier](mass300/2gis-mass300-evidence/CONTINUATION/EXECUTION/verify_live_results.py)

## Final campaign result

The 289-unit continuation stopped after 44 unique new attempts: 43 HTTP 200 and one HTTP 429. No call followed the 429. Thirty-five geometries supported their prepared directed corridor, eight did not, and one had no usable route. Eight paired controls show the same aggregate payment where the selected source boundary is crossed and where it is outside the returned route. Aggregates are not individual-PVP prices. No new tariff binding or V3 defect was established.

The last Platform Manager snapshot was 65/1000 used, 935 displayed free, 930 conservative. Fifty-five units remained reserved across the campaign, 50 observed as counter usage, and five unreconciled. Preserve that conservative balance. The 232 primary windows remain unattempted, 13 CKAD candidates were excluded after long provider detours, and four reserves remain unused. Key status was Demo/Active with a 2026-12-03 block date at the last read. The key is potentially exposed; it is not included here. The cause of the 429 remains unproved because the saved response has no headers or error body. Current Platform Manager later displayed Routing API as blocked in subscription; that is a plausible service blocker, not proof of the exact historical 429 cause.

## Accepted working calculations

The v2 registry contains four accepted directional calculations:

- M-4 B05 Taman→Voronezh: 320 ₽ Monday–Thursday; 410 ₽ Friday–Sunday/holidays.
- Full named CKAD M11→M12: 981 ₽, applied once to the proven full OD.
- Pulkovo standalone access M11→airport: 38 ₽.
- Pulkovo standalone access airport→M11: 38 ₽.

They are scoped estimates supported by official tariff rules and directed geometry; receipts are not claimed. These values are not expanded to adjacent routes. Keep material attribution gaps unknown.

## Contents and verification

`evidence-next-v2/` is the complete reviewed package with official-source extracts, source documents, OSM geometry, tariff crosswalks, regression inputs and its original nested manifest/checksums. `mass300/` contains the final 44-attempt evidence, protected no-retry ledger, source-directed preflight materials, last quota snapshot, checkpoints and offline verifier. Raw 2GIS WKT and raw HTTP responses are absent. OSM attribution and original nested licensing notes are retained.

Run from this directory:

```sh
python3 evidence-next-v2/REGRESSION_TESTS/verify_package.py
python3 evidence-next-v2/REGRESSION_TESTS/policy_review_test.py
python3 mass300/2gis-mass300-evidence/CONTINUATION/REGRESSION_TESTS/verify_continuation.py
python3 mass300/2gis-mass300-evidence/CONTINUATION/EXECUTION/verify_live_results.py
```

The top-level manifest and SHA256SUMS cover all published files. Each source package also retains its original manifest and checksum list.
