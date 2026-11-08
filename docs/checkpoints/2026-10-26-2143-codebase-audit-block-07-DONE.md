# Codebase audit block 7 — saved V2/V3 evidence — DONE — 26.10.2026 21:43 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `e45dbd3738b79bf41defb53d8f38ec2c1be3eedb`; PR #14 remains Draft. Read pre-existing Eisk/Maykop B10 reports and V3 capture/replay checkpoint only. No artifact download, replay, network, test or code change.

| Case | V2 output | V3 output | Difference |
|---|---|---|---|
| Eisk Thu 22 Oct | 1,271,780m / 59,629s / 4,920₽ | 1,271,781m / 59,629s / 4,340₽ | −1m / 0s / +580₽ |
| Eisk Sat 24 Oct | same route/time / 6,770₽ | same route/time / 5,240₽ | −1m / 0s / +1,530₽ |
| Maykop Thu 22 Oct | 1,404,673m / 65,838s / 5,040₽ | 1,404,674m / 65,838s / 5,040₽ | −1m / 0s / 0₽ |
| Maykop Sat 24 Oct | same route/time / 6,090₽ | same route/time / 6,090₽ | −1m / 0s / 0₽ |

Capture SHA-256: Eisk V2 `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0` (run40354432433, 32 calls); Eisk V3 `425d4622d3851d9f33c94caf8731ce3df439bf8e95eb34c8d70dbfe3889ea27f`; Maykop V2 `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552` (run40369626668, 36 calls); Maykop V3 `97465139af01510b4439ac494d56fb008b78177ce15efd05edb8996b66934366`. Existing report says all offline calls consumed, misses/unused/live=0.

Interpretation: Eisk delta is a project-output discrepancy lead; Maykop output matches. Not independent fare verification; control coords may not be historical UI values. No tariff changes. Done 7/18 (38.9%). Next B8 static shared toll geometry/direction/boundary review.
