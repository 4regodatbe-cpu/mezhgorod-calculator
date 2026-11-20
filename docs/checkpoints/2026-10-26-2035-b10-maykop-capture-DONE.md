# B10 Maykop hosted capture and V2/V3 comparison — DONE — 26.10.2026 20:35 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`; source `2b2dcc8e43605f4017b1a6197d97d6ce2559397f`; PR #14 remains Draft. Before saving this block, both Actions were completed, branch head was reread, and no run was active.

## Completed and verified

- B10 run [40369626668](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40369626668): SUCCESS, Node24.21.0, Ubuntu24.04; only `maykop-to-moscow`, no Eisk recapture.
- Valhalla/OSRM/BRouter bounded preflight: valid route data, HTTP200 each, response SHA/bytes recorded in [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-b10-maykop-hosted-run-40369626668/README.md).
- Maykop response HTTP200; 36 calls, all HTTP200 (Valhalla34, OSRM1, BRouter1), no validator errors. Raw compressed capture SHA256 `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552`, 573828 bytes.
- Artifact ID `12671872287`, 1,341,356 bytes, ZIP SHA256 `586930587557644424dc6ff36107c48e74f4fdd3df0a22cd4f70e54c9e9f472e`, GitHub retention 90 days. Downloaded/read and verified contents; it contains raw capture/progress/provider preflight, validation, logs-derived metadata, Thu/Sat replay, and comparison JSON.
- Thu/Sat replay: HTTP200 each, 36/36 calls consumed, live requests0, missing0, unused0.
- V2/V3: both days distance 1,404,673m vs 1,404,674m (−1m), time 65,838s vs 65,838s (0s), toll amounts equal (Thu 5,040₽; Sat 6,090₽), both priced/toll. This is not independent tariff confirmation; matrix unchanged.
- Companion special CI run `40369636065` SUCCESS; classifier said `no-route-runtime-change-in-update`; mandatory verify PASS; broad live jobs SKIPPED.
- No production/main/Android/backup/merge changes.

Next: B10 Maykop capture/compare closed. Continue only a new independent B01–B12 task with available evidence; do not repeat Maykop/Eisk captures, provider preflight, or these replays absent a new reason.
