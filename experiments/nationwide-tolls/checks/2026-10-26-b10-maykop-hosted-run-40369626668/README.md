# B10 Майкоп → Москва: hosted capture и офлайн V2/V3 — результаты

Дата capture: 2026-10-26T17:33:50.323Z (UTC). Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`; source commit `2b2dcc8e43605f4017b1a6197d97d6ce2559397f`; PR #14 Draft.

## Hosted execution and raw evidence

GitHub Actions run [40369626668](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40369626668) completed SUCCESS on ubuntu-24.04, Node `v24.21.0`, linux x64. The allow-listed case was only `maykop-to-moscow`; Eisk was not requested or recaptured. The one-time provider preflight yielded valid route data and HTTP 200 for each:
- Valhalla `valhalla1.openstreetmap.de`: 87,736 response bytes, SHA-256 `a62a95b590ef7025552a1aae754b652782b6c7d310d6b8660ff9dae43f6b9fe1`.
- OSRM `router.project-osrm.org`: 617 bytes, SHA-256 `d7a1c8b141fe7c4126ca4184f3236bc184b8c50d416c089ef0c0a5ded6303345`.
- BRouter `brouter.de`: 611,544 bytes, SHA-256 `83d5b7562f6fa93ac13c4fd659725c500590897aaf0f5ba0a192c6f5e9b12211`.

Validated capture response: HTTP 200; 36 calls (Valhalla 34, OSRM 1, BRouter 1); 36/36 stored call statuses HTTP 200; no validation errors. Raw compressed capture: `experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/v2-hosted-40369626668/maykop-to-moscow/capture.json.gz`, 573,828 bytes, SHA-256 `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552`. The gzip contains every request URL/method/status/content type and raw request/response text/body. Provider preflight raw responses and hashes are also included.

GitHub artifact [b10-v2-issue2-40369626668.zip]( https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40369626668/artifacts/12671872287 ) (artifact ID `12671872287`): 1,341,356 bytes; ZIP SHA-256 `586930587557644424dc6ff36107c48e74f4fdd3df0a22cd4f70e54c9e9f472e`; GitHub reports 90-day retention. Downloaded once and inspected: it contains the raw gzip capture, progress, per-provider preflight, capture validation, execution metadata, both replay JSON outputs, and comparison JSON. Run logs confirm statuses/phase results and artifact digest. The artifact remains the authoritative storage for raw bodies; this repository report records immutable hashes and link.

## Offline Thu/Sat replay

Run script reported `COMPLETE_CONTROL_COMPARISON`. Both saved departure replays returned HTTP 200, consumed all 36 captured calls, made 0 live network requests, had 0 missing responses and 0 unused responses.

## V2/V3 comparison (same exact Maykop/Moscow coordinates)

V2 capture SHA: `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552`. Existing V3 source: `experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19/maykop-to-moscow.json.gz`, SHA `97465139af01510b4439ac494d56fb008b78177ce15efd05edb8996b66934366`; comparison also validated the saved V3 replay SHA `580f2c6d6c77462b79049c14e2d10162a265b7c0f96c4f22018bec067887edf3`.

| Departure | V2 vs V3 distance | V2 vs V3 time | V2 vs V3 toll result |
| --- | --- | --- | --- |
| Thu 2026-10-22 09:00 +03 | 1,404,673 m vs 1,404,674 m (V2 −1 m) | 65,838 s vs 65,838 s (0 s) | 5,040 ₽ vs 5,040 ₽ (0 ₽); both `priced`, `toll` |
| Sat 2026-10-24 09:00 +03 | 1,404,673 m vs 1,404,674 m (V2 −1 m) | 65,838 s vs 65,838 s (0 s) | 6,090 ₽ vs 6,090 ₽ (0 ₽); both `priced`, `toll` |

These are controlled project-proxy/API comparisons, not independent operator tariff verification. No tariff matrix update is justified or made.

## CI verification and limits

Companion special-territory run [40369636065](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40369636065): overall SUCCESS, required verify SUCCESS, classifier SUCCESS with `no-route-runtime-change-in-update`, broad `live_probe` and `calculation_timing` SKIPPED. Thus the one permitted Maykop capture did not repeat the nationwide live audit. No production, main, Android, backup, or merge action occurred.

Checkpoint: [B10 Maykop hosted capture DONE](../../../../docs/checkpoints/2026-10-26-2035-b10-maykop-capture-DONE.md).
