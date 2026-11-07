# B10 hosted V2 capture — Ейск complete, Майкоп not run

- Branch commit: `46e8da7f7700ab3819c3859d427ecfb601afebed`; PR #14 remained Draft.
- Narrow Actions run [40354432433](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40354432433) ended `failure` because the harness incorrectly required exactly five fetch calls. Provider/network calls and the single Eisk API capture themselves all returned HTTP 200. The failure did not indicate a network outage.
- Hosted environment: Ubuntu 24.04 runner image `20261012.334.1`, Node 24.21.0, pnpm 11.25.0.
- One bounded preflight request per router, Eisk coordinates only, all valid HTTP 200:

| Endpoint | Status | Body bytes | Body SHA-256 |
|---|---:|---:|---|
| `https://valhalla1.openstreetmap.de/route` | 200 | 93,724 | `50d5c1b305adaae8b0f9b78e2ea810e043543c35bf5af07575e726f72de8f0ae` |
| `https://router.project-osrm.org/route/v1/driving/...` | 200 | 617 | `50ad0db283ce1dff4c36fc5d14e87cd1929f434aa39c104cf719acb9720c945a` |
| `https://brouter.de/brouter` | 200 | 652,899 | `2f5c5c95aac9881101e4844e99d657d162817889de4964a1ed50cb10892cf851` |

## Ейск—Москва V2 capture and comparison

Exactly one V2 `/api/v2/calculate` request, departure `2026-10-22T09:00:00+03:00`. API status 200, raw response present. The full capture contains 32 recorded fetches: Valhalla `/route` GET ×4 (toll penalties 0, 900, 1,200, and 43,200); Valhalla `/trace_attributes` POST ×26; OSRM route GET ×1; BRouter GET ×1. All 32 have status 200, response bodies, no fetch errors. This is one route capture, not a nationwide audit.

- Capture: 560,417 bytes, SHA-256 `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0`.
- Thu replay and Sat replay each consumed all 32 responses exactly once; misses 0, unused 0, live network requests 0.
- V2 Thu: 1,271,780 m / 59,629 s; provider quality `verified`; displayed calculation output 4,920 ₽.
- V2 Sat: same geometry/time; displayed calculation output 6,770 ₽.
- Saved V3 control values: Thu 1,271,781 m / 59,629 s / 4,340 ₽; Sat same geometry/time / 5,240 ₽. V2−V3: −1 m, 0 s, +580 ₽ Thu and +1,530 ₽ Sat.

Amounts are application outputs for project proxy controls, not verified operator tariffs. No fare numbers or application behavior were changed.

## Artifact, automatic gate defect, and limits

Artifact [12666050121](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40354432433/artifacts/12666050121): 1,310,819 bytes; ZIP SHA-256 `69e8c2afb18f789cbc20451f0b45ccdea34e3ce258bca3a19e294a2cdf2de3a2`; retained 90 days. It includes provider preflight bodies, capture/progress gzip files, raw API and provider responses, HTTP statuses, per-response hashes, and the automatic validation report.

The automatic validator's assumption of exactly five V2 fetches was wrong: Valhalla route scoring and toll-trace collection produced 32 calls. Offline artifact review confirms a complete Eisk capture, and the corrected validator passed against that saved capture offline. The workflow stopped before Maykop, as intended by its fail-closed gate.

The one approved accompanying `special-territory-policy` run [40354448205](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40354448205) is complete: `verify` and `calculation_timing` succeeded. Existing `live_probe` failed at address search after Ростов PASS, Красн encountered four HTTP 503 responses and one cooldown result, and Донецк timed out at the configured 20-second per-query budget (summary elapsed 24,525 ms, exit 1). The 50-settlement and six-route live audit steps were skipped. Its artifacts are retained as IDs `12665552834` (24,510 bytes; SHA-256 `b7729c491fb33896bf021013ea5d3e4eda74a2d75da663a0228eb3bd75ee3bdf`) and `12665472116` (2,841 bytes; SHA-256 `478b344ea0805277fefab5eb3910986ddd0bb3837f876f41b4c464fee84c8930`). This single authorized broad run will not be repeated.

Overall B10 remains incomplete until Maykop capture and comparison; no further capture was attempted because the current trigger would launch another broad PR workflow. No application behavior or CI configuration was changed for optimization. The separate optimization document is a proposal only.
