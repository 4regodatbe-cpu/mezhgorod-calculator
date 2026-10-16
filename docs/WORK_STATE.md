# Калькулятор «Из А в Б»: текущее состояние

16.10.2026. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Перед case72 проверенный PR head `1e0f8c1a49e636e0e243c3ba1e6194fa2dbec7c9`, tree `811a5258a8267f662905b68b0e2b239367ce0b1b` совпадал с локальным. Checkout `calculator-run`. Local/connector commit SHA могут различаться; сравнивать точные trees и remote head после каждого сохранения.

## Прогресс

**90% по согласованному плану:18/20частей полностью завершены.** Часть19 IN_PROGRESS,20 PLANNED. Формула/смысл в [плане](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Это доля этапов, а не доля подтверждённых тарифов. Пользователь просит указывать процент в каждом отчёте.

Части1–18:155/155+154/154, frozenREPORT340/340.19A/B:57A289helper-only+2wholecases (не59полныхтарифов).19C:25/25policyDONE,20wholeofflinequotes/5unknownZSD. Эти очереди не перезапускать.

19D M4review22/22:5wholeunconfirmedestimates/3pricedM4componentswithotherunknowns/8physical545scopegates/6shortM4scopegates. Эти14sourcegates открыты, unknown≠0. [M4/очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

**ZSDreview72/76**: каждыйcase отдельно воспроизведён в2offlineprofiles сcomplete/SHA/head/tree. Различные направления/съезды разобраны отдельно; совпадениеwayset+boothsequence разрешает повторное использование диагноза, не тарифа. Итоги остаютсяunknown приотсутствииполногоfinishedcollectionscope. Подробности/ссылки всех26 вочереди. [Итогблока/автопродолжение](checkpoints/2026-10-16-zsd-26case-handoff-and-auto-reporting.md).

Исправление exactnode1766158781→ZSD валидировано: первичная направленная топология иselectedledger подтвердилиПВППланерная; redundantunknownpaidroad устранён, M11head/CKAD/ZSDблокеры сохранены. [Replay](checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md).

**Последняя полная проверка 696/696+quote/API+Nextwebpack/TypeScript/static16/16 PASS**, focused8/8/eslintnewtestexit0. [Fullgate](checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md). Втекущемблокекоднеизменялся/новаясборканезапускалась. ОшибкаCRнормализацииодноголога исправлена, rawbytesсохранены/exacttreeподтверждён.

## NEXT STARTED

**ZSD nextcase triple-m4-m11-zsd-domodedovo-to-sest; --next; savedcapture twoofflineprofiles**

ZSD review **72/76**. [Latest checkpoint](checkpoints/zsd-2026-10-16T17-28-40-814Z.md). Overall plan **90% (18/20 completed parts)**; not tariff coverage. Latest fullgate/readiness references above remain prior checks, not rerun for audit-only changes.

Repository-owned utility: `node experiments/nationwide-tolls/scripts/review-zsd-finding-case.mjs --next` (or `--diagnose` after a new scope). One step only; caller commits/publishes/exacthead-tree before continuing. Do not rerun completed M4/policy/live queues. No main/merge/Production. Autocontinuation remains enabled.
