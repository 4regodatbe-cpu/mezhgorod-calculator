# Калькулятор «Из А в Б»: текущее состояние

16.10.2026. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Последний проверенный remote PR head `bc600a9eb2ef75dbedd22e7cd8e1ac3ad3e5edce`, tree `850f16287a9bdd4cea86fac46c250d11be8ad927`; M11 diagnosis started there. Первый case `max-chain-m12-ckad-m11-zsd-arzamas-to-prim` reviewed from complete saved capture and paired profiles; M11 15–58 entry boundary remains unbound and unknown is retained. Seven cases remain. Checkout `calculator-run`; сверять exact tree/path SHA при публикации.

## Прогресс

**90% по согласованному плану:18/20частей полностью завершены.** Часть19 IN_PROGRESS,20 PLANNED. Формула/смысл в [плане](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Это доля этапов, а не доля подтверждённых тарифов. Пользователь просит указывать процент в каждом отчёте.

Части1–18:155/155+154/154, frozenREPORT340/340.19A/B:57A289helper-only+2wholecases (не59полныхтарифов).19C:25/25policyDONE,20wholeofflinequotes/5unknownZSD. Эти очереди не перезапускать.

19D M4review22/22:5wholeunconfirmedestimates/3pricedM4componentswithotherunknowns/8physical545scopegates/6shortM4scopegates. Эти14sourcegates открыты, unknown≠0. [M4/очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

**ZSDreview76/76**: каждыйcase отдельно воспроизведён в2offlineprofiles; collection span остаётся source-gated. [Классификация](checkpoints/2026-10-16-zsd-classification-76-cases.md). **M4:unpriced22/22** классифицированы по saved evidence: 5 whole-route estimates без подтверждённого тарифа, 3 M4 components с другими неизвестными продуктами, 8 физических545 и 6 short-route scope gates. Тарифы/бесплатность не выведены. [Классификация M4](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Числоcases не есть покрытие тарифов.

Исправление exactnode1766158781→ZSD валидировано: первичная направленная топология иselectedledger подтвердилиПВППланерная; redundantunknownpaidroad устранён, M11head/CKAD/ZSDблокеры сохранены. [Replay](checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md).

**Последняя полная проверка 696/696+quote/API+Nextwebpack/TypeScript/static16/16 PASS**, focused8/8/eslintnewtestexit0. [Fullgate](checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md). В audit-only classification код не менялся и новая сборка не запускалась. Не трактовать прежний full gate как тест текущей классификации.

## NEXT STARTED

**Review finding `m11_partial_head_entry_boundary_unresolved`: inspect saved evidence, source-gate unknown unless exact directed entry-boundary evidence closes it**

ZSD review **76/76** and M4 finding **22/22** classified source-gated because exact collection spans are not independently bound. [M4 checkpoint](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Overall plan **90% (18/20 completed parts)**; neither case count nor percent is tariff coverage. Latest fullgate/readiness references above remain prior checks, not rerun for audit-only changes.

NEXT: inspect only saved capture and paired profiles for `max-chain-m12-ckad-m11-zsd-kazan-to-sest` (case2/8) against the exact primary M11 boundary. Case1 is source-gated; [checkpoint](checkpoints/2026-10-16-part19-m11-case1-boundary-source-gated.md). Do not infer 15–58 toll from adjacent 58–679 component. No main/merge/Production; automation remains enabled.
