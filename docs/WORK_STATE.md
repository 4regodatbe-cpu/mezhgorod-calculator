# Калькулятор «Из А в Б»: текущее состояние

16.10.2026. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, draftPR14. Проверенный исходный remote `b9baeb096248e8006915cef9e564e1f11e8d124e`, tree `0df91d6d52feaf55823b58d4eaf14bcf3f3b8ebc` совпадает с локальным. Checkout `calculator-resume`. Local/connector commitSHA могут различаться; сравнивать точные trees и remotehead после каждого сохранения.

## Прогресс

**90% по согласованному плану:18/20частей полностью завершены.** Часть19 IN_PROGRESS,20 PLANNED. Формула/смысл в [плане](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Это доля этапов, а не доля подтверждённых тарифов. Пользователь просит указывать процент в каждом отчёте.

Части1–18:155/155+154/154, frozenREPORT340/340.19A/B:57A289helper-only+2wholecases (не59полныхтарифов).19C:25/25policyDONE,20wholeofflinequotes/5unknownZSD. Эти очереди не перезапускать.

19D M4review22/22:5wholeunconfirmedestimates/3pricedM4componentswithotherunknowns/8physical545scopegates/6shortM4scopegates. Эти14sourcegates открыты, unknown≠0. [M4/очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

**ZSDreview26/76**: каждыйcase отдельно воспроизведён в2offlineprofiles сcomplete/SHA/head/tree. Различные направления/съезды разобраны отдельно; совпадениеwayset+boothsequence разрешает повторное использование диагноза, не тарифа. Итоги остаютсяunknown приотсутствииполногоfinishedcollectionscope. Подробности/ссылки всех26 вочереди. [Итогблока/автопродолжение](checkpoints/2026-10-16-zsd-26case-handoff-and-auto-reporting.md).

Исправление exactnode1766158781→ZSD валидировано: первичная направленная топология иselectedledger подтвердилиПВППланерная; redundantunknownpaidroad устранён, M11head/CKAD/ZSDблокеры сохранены. [Replay](checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md).

**Последняяполнаяпроверка691/691+quote/API+Nextwebpack/TypeScript/static16/16PASS**, focused8/8/eslintnewtestexit0. [Fullgate](checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md). Втекущемблокекоднеизменялся/новаясборканезапускалась. ОшибкаCRнормализацииодноголога исправлена, rawbytesсохранены/exacttreeподтверждён.

## NEXT STARTED

**Case27 `pair-m11-zsd-moscow-to-prim`**: взять exactauditEvidence.capture изcorpus.json/road-cases.json; offline15/17Oct09:00MSK; затем точечно сравнить selectedZSDways/orderedbooths/geometry. Новыйscope разобратьпередследующимcase; новуюнеизвестнуюкассунезависимоидентифицироватьпередисправлением. Сохранятькаждыйcase/тест/изменение+checkpoint/log/plan/state/commit/remotehead/exacttree. Не запускать309live/22M4/25policyзаново.

Автопродолжениевключено; требованиепроцентадобавленовегоотчёты, readbackпроверен. Это не утверждение обactivejob. Одинисполнитель: приactive/queuedjobилиизменившемсяremoteheadнеписатьвветку. Тарифпоотправлению, unknownне0, subtotalнеитог, benchmarkснимкинеliveвыбор. Никакихmain/merge/Production/Android/messages.

[AGENTS](../AGENTS.md) · [Protocol](CHECKPOINT_PROTOCOL.md) · [Plan](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json) · [Queue](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md) · [NEXT](../experiments/nationwide-tolls/NEXT_STEPS.md). Все прежние checkpoints/history сохранены.

16.10.2026 16:54MSK scratch-pruning recovery DONE, exactclonehead/tree verified; no routeprogress lost. NEXT frozen dependencies/repository-owned ZSDsinglecaseutility, then case27. checkpoints/2026-10-16-1654-resume-after-scratch-pruning.md Plan90%.
