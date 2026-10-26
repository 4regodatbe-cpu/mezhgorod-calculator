# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; новый audit — 18 blocks. Source: remote branch fix/v3-missing-route-prices-2026-10-15; baseline f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d. Статический read-only анализ; код/тарифы/CI не изменялись. В этом аудите не запускались тесты, build, браузер, live calls или security probes. Процент — только этого плана.

## Прогресс

1 architecture; 2 address; 3 cache; 4 API inputs; 5 providers; 6 selection; 7 saved comparisons; 8 geometry; 9 pricing; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security; 14 performance; 15 deps/build; 16 tests; 17 CI; 18 governance/synthesis. Done 16/18 (88.9%). [B16 checkpoint](checkpoints/2026-10-26-2317-codebase-audit-block-16-DONE.md).

## Existing V2/V3 proxy outputs

Eisk Thu/Sat V2−V3 toll delta +580/+1,530 ₽, route −1m/0s; Maykop Thu/Sat 0 ₽, route −1m/0s. Historical captures/replays only; not independent tariff evidence. No recapture/replay.

## Findings

Все находки P2; только date/error/status/build observations подтверждены статически как контракт/gap. Runtime wrong fare/security exploit не воспроизведены.

- AUD-GEOCODE-01: direct Photon label geocode has no local deadline; request-hold risk, not reproduced.
- AUD-API-01: no explicit body-bytes/label length cap in calculation API; platform caps unknown.
- AUD-PROVIDER-01: route responses parsed without app-level byte caps; upstream limits unknown.
- AUD-TEST-01: V2 invalid-geometry regression not found; current public flow rejects missing controls.
- AUD-TRACE-RECOVERY-01: incomplete trace with paid edge gets status=toll; recovery uses lower segment-run thresholds (M4 2/4, M12 2/5) and may return matched subset. Potential incomplete total, not reproduced. Add focused fixtures before policy change.
- AUD-UI-01: V2 request hook lacks unmount abort; possible extra server work. V3 includes cleanup.
- AUD-DATE-01: V2 date parser accepts Date-normalized invalid calendar dates/zone-less timestamps while V3 validates. Since date selects fare period, direct malformed V2 API could pick a different period; UI sends ISO. Strict shared validator recommended; low-medium risk.
- AUD-ERROR-01: V2/V3 unknown errors map to 400 rather than 500; monitoring/retry contract weak, generic body safe.
- AUD-SEC-01: public /api/collect parses body before field limits, no visible app-level byte/rate/webhook deadline. Abuse not attempted; confirm edge limits.
- AUD-BUILD-01: tsconfig excludes scripts, so Node-executed TS tests are not typechecked; separate no-emit TS config recommended.

No P0/P1 confirmed. V2 empty geometry P1 hypothesis withdrawn; public paths enforce plan controls.

## B16 test inventory

Remote recursive tree at B16 parent enumerated 145 test-looking files; each matched a declared test:audit glob or explicit quote.test.cjs. Static check only. Existing suite includes address pool/endpoint tests, V3 response/API tests, pricing-composition and trace-rate-limit focused tests, route regressions. No coverage instrumenter configured in package scripts, so repository audit cannot quantify branch coverage. The V3 API audit explicitly asserts invalid calendar days and missing timezones return 400; the V2 special-territory API test has no departureAt cases, leaving AUD-DATE-01 without a V2 regression. No tests executed.

## Positive controls

Unknown toll is serialized as null; partial composition is fail-closed; V3 response schema strict; V3 hook abort cleanup; address suggestion bounded; workflow and dependency audit still pending.

## Осталось

B17 Actions triggers, required checks, secrets/permissions and broad live-audit scope; B18 docs/data governance + final consolidated report and safe remediation plan. No actual build/test/dependency/security scan.

## Следующий шаг

B17 static review workflows relevant to normal PR/push and required checks. Do not trigger Actions; do not edit workflows.
