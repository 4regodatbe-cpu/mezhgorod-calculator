# Reliability block18 — road combination boundaries — DONE — 27.10.2026 04:30 МСК

- Parent remote `a0827a5a4d2e7d0b3b33bb4424ce8604c61013ad`; allowed branch only; PR14 Draft; no active CI on parent.
- Bounded offline checks only; no broad route audit and no tariff/route/business-rule edits.
- Command: `node --import ./scripts/register-ts-paths.mjs --test scripts/systemic-toll-composition-test.ts scripts/v3-m4-a289-composition.test.mjs scripts/v3-road-availability-audit.test.ts` — 3/3 files PASS, 0 failed.
- Coverage: complete M4/A289+M11/CKAD totals and unknown when a detected component (including CKAD or M11) is missing; partial M4 cannot be hidden by known A289; duplicate/legacy mixed M4+A289 cannot double charge; M12 exact chosen-geometry span in both directions and rejection/unknown boundaries; saved M4 geometry path checks both directions with bounded mocked fetches; M11 fare remains departure-day through elapsed overnight/week/weekend.
- Source/fixtures: `scripts/systemic-toll-composition-test.ts`, `scripts/v3-m4-a289-composition.test.mjs` (saved bypass gate snapshot), `scripts/v3-road-availability-audit.test.ts` (saved Volnovakha→Moscow capture). All provider fetches in the selected tests are mocked; no network was used.
- No failure reproduced and no source/tariff values changed. This verifies component and boundary contracts, not one live route crossing all five facilities or current provider data.
- Block18 DONE for its bounded offline acceptance. Technical plan progress becomes20/24 (83.33%): blocks1–19 except20 plus22. Block20 remains PARTIAL;21 is not adopted;23 partial;24 not started.
- Next: resolve block20's remaining stage/fixture gap from stored evidence if possible; otherwise continue another independent offline block. Do not rerun mass audit or provider requests.
