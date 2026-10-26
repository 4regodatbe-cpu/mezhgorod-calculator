# Технический аудит репозитория «Из А в Б»

Статус IN_PROGRESS; новый план — 18 блоков. Источник: удалённая ветка `fix/v3-missing-route-prices-2026-10-15`; исходный SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Только статический разбор и review ранее сохранённых evidence. Код, бизнес-логика, тарифы и настройки не менялись. Процент — только по этому аудиту.

## План и прогресс

18 блоков: 1 архитектура; 2 address lookup; 3 cache/pool/cancel; 4 API inputs; 5 adapters; 6 selection; 7 saved V2/V3 evidence; 8 geometry/boundaries; 9 pricing composition; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security; 14 performance; 15 dependencies/build; 16 tests; 17 CI; 18 docs/data governance/synthesis. Завершено 8/18 (44.4%). Последний checkpoint: [B8](checkpoints/2026-10-26-2152-codebase-audit-block-08-DONE.md). Не запускались live requests, массовые проверки, тесты/build или браузер.

## Оценка состояния

Проверенные модули показывают несколько fail-closed механизмов: неизвестный component fare блокирует полную сумму, неполная map-match trace не подтверждает отсутствие платного edge, route/coordinate policy rejects missing plan controls. Пока нет подтверждённых P0/P1. Основные P2-кандидаты — deadline/size limits и V2-specific regression coverage; не воспроизводились.

## Saved V2/V3 capture comparison (existing reports only)

| Направление/день | V2 | V3 | V2−V3 |
|---|---|---|---|
| Ейск—Москва Thu 22.10 | 1,271,780 м; 59,629 с; 4,920 ₽ | 1,271,781 м; 59,629 с; 4,340 ₽ | −1 м; 0 с; +580 ₽ |
| Ейск—Москва Sat 24.10 | same route/time; 6,770 ₽ | same route/time; 5,240 ₽ | −1 м; 0 с; +1,530 ₽ |
| Майкоп—Москва Thu 22.10 | 1,404,673 м; 65,838 с; 5,040 ₽ | 1,404,674 м; 65,838 с; 5,040 ₽ | −1 м; 0 с; 0 ₽ |
| Майкоп—Москва Sat 24.10 | same route/time; 6,090 ₽ | same route/time; 6,090 ₽ | −1 м; 0 с; 0 ₽ |

Raw capture SHA and replay evidence are in B7 and linked artifacts. These are proxy/API outputs, not independent tariff evidence; no tariff change follows.

## Findings (preliminary)

### P2 — probable/unverified

- **AUD-GEOCODE-01:** label-only Photon geocode has no local deadline; request may wait until platform timeout. No delay reproduced; recommend bounded adapter and abort regression.
- **AUD-API-01:** no explicit app-level calculate request byte / label length caps. Platform limits and exploitability unverified.
- **AUD-PROVIDER-01:** route adapters parse response JSON without explicit byte cap; upstream limits unverified.
- **AUD-TEST-01:** V3 has explicit route validity guard/regression; equivalent V2 regression not found. Public V2 calls reject missing plan controls, so this is test/defense-in-depth gap, not demonstrated bad price.

### B8 review — no new finding

`lib/tolls.ts` requires >=3 route points for toll matches, checks ordered checkpoints and endpoint/path-distance bounds; a two-point endpoint line yields an empty/no-confidence estimate. `lib/toll-validator.ts` uses bounded route sampling/chunking/concurrency/retry and reports incomplete coverage as incomplete rather than proof of free travel. `special-territory-geometry.ts` rejects malformed coordinates/metrics and resolves crossings with explicit boundary overlap failure; toll composition `route-toll-composition.ts` rejects duplicate/conflicting/partial component totals as unknown. These observations are static; no map-matching or price calculations run. No fresh road audit performed.

## Not checked

Blocks 9–18 remain: aggregate pricing implementation, frontend state, response contracts, security/privacy, perf/memory, dependencies/build, tests, CI, docs/data governance. No test/build/browser/live call was run.

## Next

B9 statically inspect tariff composition and absent/unknown handling; ensure no component can turn unknown into zero or a partial sum into a total. Do not alter tariffs.
