# Технический аудит репозитория «Из А в Б»

Статус IN_PROGRESS; новый план — 18 блоков. Источник — remote branch `fix/v3-missing-route-prices-2026-10-15`, исходный SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Анализ исходников и ранее сохранённых evidence; код, бизнес-логика и тарифы не менялись. Процент относится только к этому аудиту.

## План и прогресс

18 блоков: 1 архитектура; 2 адресный поиск; 3 кэш/очередь/отмена; 4 API inputs; 5 provider adapters; 6 candidate selection; 7 saved V2/V3 evidence; 8 geometry/boundaries без повтора аудита дорог; 9 tariff composition; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security; 14 performance; 15 dependencies/build; 16 tests; 17 CI; 18 docs/data governance/synthesis. Завершено 7/18 (38.9%); [B7 checkpoint](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md). В этом аудите не выполнялись тесты/build/browser/live calls.

## Текущая оценка

Есть bounded address pool и deadlines у Valhalla/OSRM/BRouter adapters. Подтверждённых P0/P1 пока нет. Предварительные P2: прямой label geocode без deadline; отсутствуют явные app-level limits на body/labels; нет явного provider response byte cap; в просмотренных тестах не найден V2 аналог V3 invalid-route regression. Runtime-дефектов этими наблюдениями не доказано.

## Saved V2/V3 captures: offline report review only

| Направление/день | V2 | V3 | V2−V3 |
|---|---|---|---|
| Ейск—Москва Thu 22.10 | 1,271,780 м; 59,629 с; 4,920 ₽ | 1,271,781 м; 59,629 с; 4,340 ₽ | −1 м; 0 с; +580 ₽ |
| Ейск—Москва Sat 24.10 | те же расстояние/время; 6,770 ₽ | те же расстояние/время; 5,240 ₽ | −1 м; 0 с; +1,530 ₽ |
| Майкоп—Москва Thu 22.10 | 1,404,673 м; 65,838 с; 5,040 ₽ | 1,404,674 м; 65,838 с; 5,040 ₽ | −1 м; 0 с; 0 ₽ |
| Майкоп—Москва Sat 24.10 | те же расстояние/время; 6,090 ₽ | те же расстояние/время; 6,090 ₽ | −1 м; 0 с; 0 ₽ |

Evidence references: Eisk V2 capture SHA-256 `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0` (run40354432433; 32 responses); Eisk V3 `425d4622d3851d9f33c94caf8731ce3df439bf8e95eb34c8d70dbfe3889ea27f`; Maykop V2 `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552` (run40369626668; 36 responses); Maykop V3 `97465139af01510b4439ac494d56fb008b78177ce15efd05edb8996b66934366`. Existing reports state weekday/weekend replays consumed all calls with zero misses/unused/live requests. No replay repeated.

Eisk fare delta is only a project proxy discrepancy lead. Maykop outputs match. The V3 evidence warns the proxy controls may not equal historical UI controls. None is independent operator tariff evidence; no tariff update is justified.

## Findings (current)

### P2 — probable/unverified

- **AUD-GEOCODE-01:** direct label Photon geocode has no local timeout; calculate APIs accept label-only points. Risk: request may wait until platform timeout; not reproduced. Recommend bounded transport + abort regression, no ranking change. [B5](checkpoints/2026-10-26-2124-codebase-audit-block-05-DONE.md).
- **AUD-API-01:** no explicit calculate request-byte/label-length cap; platform caps/exploitation unknown. Recommend shared API validator.
- **AUD-PROVIDER-01:** route JSON parsed without explicit app byte cap; upstream limits unknown. Risk only pending evidence.
- **AUD-TEST-01:** V3 has explicit route validity gate and empty-geometry regression; no equivalent V2 test located in reviewed sources. Public V2 paths reject empty geometry through routing control checks, so this is a defense-in-depth/test gap, not demonstrated wrong pricing.

The provisional P1 claim that V2 prices empty geometry as a straight line was withdrawn after B6: public V2 paths pass controls to `followsPlan`, which fails when required control coordinates are absent. Static-only; no test executed.

## Непроверено

Блоки 8–18 remain: shared toll geometry, pricing aggregation, V2/V3 UI, API error contracts, security/privacy, performance, dependencies/build, test quality, CI and data governance. No tests/build/live/browser run; no tariff/road audit.

## Следующий шаг

B8 inspect shared toll geometry/direction/boundary contracts statically only; do not repeat route/fare audits or infer fare from proxy differences.
