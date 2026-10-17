# Калькулятор «Из А в Б»: актуальное состояние

## Handoff — 2026-10-17T09:39:11Z (17.10.2026 12:39 МСК)

- Прямое новое поручение пользователя: перейти к поиску решений по итогам аудита. PR14 open/draft; рабочая ветка `fix/v3-missing-route-prices-2026-10-15`; исходный verified head `69e7933257f5ac0d2ee42dd0bfbd258fcb1eb74f`.
- Финальный Actions #39019024457 success на этом head. Старое автопродолжение завершённого 20-пунктного плана отключено. Формальная готовность остаётся **20/20=100%**, это не процент всей новой работы или тарифного покрытия.
- Сохранён [разбор конкретных решений](../experiments/nationwide-tolls/POST_AUDIT_SOLUTIONS_2026-10-17.md). Первый объект — законченный cash/card вектор ЗСД по сохранённому КАД-юг→Екатерингофка; правило связанных ПВП по чеку (п.6.2.17) обязательно, слепая сумма шлагбаумов неверна. Адаптер пока ограничен зоной1; общая таблица цен не доказывает полный вектор.
- Новых маршрутных проверок/повторов/цен/изменений кода нет. ЗСД и другие unresolved тарифы остаются unknown/null. Свежие страницы операторов вернули 502/403; готовый тариф не заявлен.
- [Checkpoint](checkpoints/2026-10-17-123911-post-audit-solutions.md) · [evidence](checkpoints/evidence/2026-10-17-post-audit-solutions.json).

## NEXT
Найти первичную схему привязки ПВП5 к законченному cash/card проезду КАД-юг→Екатерингофка; сверить с сохранённой геометрией и исключениями. Не повторять 76 прогонов. Перед следующей записью проверить текущий head/PR и новый CI; только разрешённая ветка, без main/merge/Production/Android.

## Предыдущие handoff и история

## Handoff — 2026-10-17T08:51:29Z (2026-10-17 11:51 МСК)

- PR14 открыт/draft; ветка `fix/v3-missing-route-prices-2026-10-15`. Перед Part20 PR и ветка совпадали на `cfb442401a3cde9b6311026675d39484df394182`.
- Part19 завершена: 13 причин классифицированы — 1 исправлена и проверена (только A‑289 component binding), 1 не воспроизвелась, 8 заблокированы надёжными данными, 3 отложены. Пересекающиеся baseline case counts не складываются.
- Part20 проверки завершены на source commit `cfb442401a3cde9b6311026675d39484df394182`: Actions #39016525904 success; тесты, TypeScript, Next build, live probes, аудит фиксированного набора из 50 settlement routes и 6 сравнений с Yandex screenshots прошли. Проверены JSON статусы и относительные ссылки handoff.
- Формальный план: **20/20 = 100%** по `progressReporting`. Это только выполнение 20-пунктного route-audit плана, не готовность всего калькулятора и не подтверждённость тарифов.
- Четыре названных M11 cases входят в сохранённую проверку 8 исключений общей причины; повторных прогонов не делал. M11 и другие source-gated amounts остаются unknown/null; полные тарифы не подтверждены.
- [Checkpoint](checkpoints/2026-10-17-115129-part20-final-verification.md) · [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json) · [очередь причин](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

## NEXT
После сохранения этой handoff-записи проверить новый Actions run и точный PR/branch head. Если он успешен, отключить именно это автопродолжение: все 20 пунктов формального плана завершены. Не сливать PR и не публиковать приложение; дальнейшую работу над общей задачей начинать отдельно по прямому запросу.

## Предыдущие handoff и история

- PR14 открытый draft; разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`. Перед синтезом remote head/PR head совпадали: `2e816d7a744298b5e7a8aa70d33c4b5c6a5de41f`; branch Actions #39014574620 завершился success на этом head. Проверить workflow уже сохранённого синтеза перед Part20.
- Part19 завершена: все 13 сохранённых findings получили канонический исход с сохранением старых статусов/истории: 1 fixed and verified (только A-289 component binding, не полные тарифы), 1 not reproduced, 8 blocked by missing reliable data, 3 deferred. Кейсы между findings перекрываются.
- Четыре ранее ожидавших M11 случаев уже включены в сохранённую восьмикейсную проверку общей причины; новых прогонов не запускал. M11 tariff remains unknown/null.
- Новых live/replay, тестов, сборок, кодовых/тарифных изменений нет. Полные тарифные итоги не подтверждены.
- Формальный план: **19/20 = 95%** (`progressReporting`); это не процент готовности тарифа или релиза.
- [Checkpoint](checkpoints/2026-10-17-111116-part19-outcome-synthesis.md) · [очередь причин](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [Part19 findings](../experiments/nationwide-tolls/NEXT_STEPS.md).

## NEXT
После успешного запуска Actions для коммита синтеза выполнить Part20: проверки содержания и ссылок по docs-only gate, зафиксировать результат и handoff. Не сливать PR и не менять main/Production/Android.

## Предыдущие handoff и история

## Handoff — 2026-10-17T07:41:10Z (2026-10-17 10:41 МСК)

- PR14 открыт/draft; рабочая ветка `fix/v3-missing-route-prices-2026-10-15`. Проверенный source head/tree: `bdf620e441d2cbe287a348bd388d28e188106341` / `2deefbad4cf1b3038576cabbbe77745643f2a818`; branch и PR head совпадали. Actions #39010035622 завершился success на source head; post-save запуск проверяется после нового коммита.
- Формальный план: **18/20 = 90%**; Part19 IN_PROGRESS (cause queue рассмотрена, итоговая сверка статусов ещё нужна), Part20 PLANNED. Это процент формального плана, не подтверждённость тарифов.
- `odintsovo:unpriced` (2 случая) проверен по сохранённым данным: 2 маршрута / 4 уникальных профиля дат / 6 evidence-файлов; все пути и SHA сохранены. Проезд по Северному обходу доказан на обоих выбранных маршрутах, но точная направленная пара ПВП не привязана к проверенному тарифному вектору. Официальная таблица категории I есть как candidate; отчёт выбора тарифов указывает `runtimeApproved=false` и integration pending. M1 и `unknown-paid-road` также не закрыты, поэтому полный итог остаётся null. Причина **blocked by missing reliable data**; тариф/сумма не подтверждены.
- Сверена запись `arc_not_proven`: 34 случая уже имели сохранённый blocked outcome, но верхний status был устаревшим `needs_diagnosis`; он приведён в соответствие с сохранённым разбором.
- Новых live-запросов, replay, тестов, сборок, изменений кода или тарифных значений нет. Unknown остаётся null.
- [Checkpoint](checkpoints/2026-10-17-1041-part19-odintsovo-unpriced-blocked.md) · [evidence](checkpoints/evidence/2026-10-17-part19-odintsovo-unpriced-blocked.json) · [очередь Part19](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [следующие шаги](../experiments/nationwide-tolls/NEXT_STEPS.md).

## NEXT
После завершения post-save CI синтезировать/сверить outcome для записей Part19; затем выполнить обязательные проверки Part20 по AGENTS.md и передать handoff.

## Предыдущие handoff и история


### Предыдущий handoff — 2026-10-17T04:35:31Z (2026-10-17 07:35 МСК)
## Handoff — 2026-10-17T04:35:31Z (2026-10-17 07:35 МСК)

- PR14 открыт/draft; разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`. Перед шагом remote head/tree: `fec51dab8eddc1919b4e839cc1b59a1c345f3b05` / `0bd121306facb563761e924d54c57ad4aa4487c1`; PR head совпадает. Run #38999218280 завершён success на этом head; отдельный PR run #38959170444 также completed/success (старый head `7ce720c381265524189b198902f70b3c97009ab5`). Активных branch runs нет.
- Формальный план: **18/20 = 90%**; Part19 IN_PROGRESS, Part20 PLANNED. Это только процент формального плана, не готовность продукта, покрытия тарифов или релиза.
- M11 boundary cases **5–8 уже DONE** в сохранённых checkpoints (four named cases). Общая причина остаётся **blocked by missing reliable data**; тарифы unknown/null. В этом запуске эти маршруты не запускались повторно.
- `expected-road-not-proven`: 64/64 сохранённых строк проанализированы по report; все 64 raw/live-ссылки присутствуют, trace complete, same-date parity true. Метки отсутствующих expected roads: CKAD30, M12 11, Khabarovsk10, Odintsovo8, ZSD3, M4 2. 32 случая перекрываются уже рассмотренными findings, 32 не находятся в этих ledgers; счётчики не складываются. Это несколько независимых road labels, а не доказанная одна причина. Outcome **deferred**: отсутствующая метка сама по себе не доказывает, что fastest selected route проезжал chargeable сегмент; тариф не добавляли, full quote не подтверждён.
- Нет новых live/replay/build/test запусков и новых тарифов. [Checkpoint](../docs/checkpoints/2026-10-17-0735-part19-expected-road-not-proven-deferred.md) · [evidence](../docs/checkpoints/evidence/2026-10-17-part19-expected-road-not-proven-deferred.json).
- NEXT: `m12_current_operator_pair_not_bound` (4 baseline cases), saved evidence only; check overlap and user impact before any replay.

## Предыдущие handoff и история

### Предыдущий handoff — 2026-10-17T06:32:46 МСК
## Handoff — 2026-10-17T06:32:46 МСК

- PR14 открыт/draft; разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`. Источник шага: head `6df92a4bf60ba64e0a3ac8ca2d5e856248de7c9b`, tree `dc4c2b12a326ab4316e364d2779d2d6c606c0869`; ветка и PR совпали до записи.
- Последний проверенный Actions run до этой записи: [#38994773498](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/38994773498), success на исходном head. Он также выполнил успешный non-fastest toll-avoidance probe; этот лишний шаг удалён из PR workflow в текущем commit по уже принятому fastest-route-only правилу. Новый run нужно проверить отдельно.
- Формальный план: **18/20 = 90%**; Part19 IN_PROGRESS, Part20 PLANNED. Это не готовность калькулятора или тарифное покрытие.
- M11 58–679: **41/41** маршрутов по сохранённым данным, 82 уникальных weekday/weekend профиля; outcome blocked by missing reliable data. Тарифы M11 остаются unknown/null.
- CKAD `arc_not_proven`: **34/34 случаев**, 68 профилей, 102 уникальных live/replay evidence файла. Все occurrences имеют `ckad_east_arc_not_proven`; все строки evidence/raw/trace/same-date complete, суммы weekday/weekend null. Широкий CKAD traversal proven в 22 строках и not proven в 12, но exact east-arc billing scope не подтверждён. Outcome **blocked_by_missing_reliable_data**; тариф/полный итог неизвестен.
- Перекрытия не суммируются: ZSD16, M11 head8, M11 58–67914, unknown-paid-road18, expected-road-not-proven12, M12 pair2. Новых live/replay/build/tests и подтверждённых тарифов нет.
- [Checkpoint](../docs/checkpoints/2026-10-17-0632-part19-arc-not-proven-blocked.md) · [evidence](../docs/checkpoints/evidence/2026-10-17-part19-arc-not-proven-blocked.json).
- NEXT: `expected-road-not-proven` (baseline64), root cause/impact/exceptions from saved data only; no new probe absent material difference/evidence gap.

## Предыдущая handoff-сводка (оставлена как история, не источник текущего состояния)

16.10.2026. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Проверенный source head для правил `e197a7a40ec10ae08ea470f50ca61844a1226bfc`, tree `54b899d424b3da1170af5d7e2871ae2801ad49e8`; case3 reviewed from this tree, see latest checkpoint. Из него создан отдельный чистый checkout `calculator-rules`; старый расходящийся `calculator-run` сохранён. Пользователь утвердил [правила разбора по причинам и отчётности](WORKFLOW_RULES.md); они включены в AGENTS и автоматическое продолжение. [Checkpoint правил и Git auth](checkpoints/2026-10-16-215327-workflow-efficiency-rules.md).

Наблюдаемый run `38951539156` для `e197a7a…`: completed/success. CLI Git auth не настроен; продолжаем сохранять через GitHub connector. PR14 открыт/draft.

## Прогресс

**90% по согласованному плану:18/20частей полностью завершены.** Часть19 IN_PROGRESS,20 PLANNED. Формула/смысл в [плане](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Это доля этапов, а не доля подтверждённых тарифов. Пользователь просит указывать процент в каждом отчёте.

Части1–18:155/155+154/154, frozenREPORT340/340.19A/B:57A289helper-only+2wholecases (не59полныхтарифов).19C:25/25policyDONE,20wholeofflinequotes/5unknownZSD. Эти очереди не перезапускать.

19D M4review22/22:5wholeunconfirmedestimates/3pricedM4componentswithotherunknowns/8physical545scopegates/6shortM4scopegates. Эти14sourcegates открыты, unknown≠0. [M4/очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

**ZSDreview76/76**: каждыйcase отдельно воспроизведён в2offlineprofiles; collection span остаётся source-gated. [Классификация](checkpoints/2026-10-16-zsd-classification-76-cases.md). **M4:unpriced22/22** классифицированы по saved evidence: 5 whole-route estimates без подтверждённого тарифа, 3 M4 components с другими неизвестными продуктами, 8 физических545 и 6 short-route scope gates. Тарифы/бесплатность не выведены. [Классификация M4](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Числоcases не есть покрытие тарифов.

Исправление exactnode1766158781→ZSD валидировано: первичная направленная топология иselectedledger подтвердилиПВППланерная; redundantunknownpaidroad устранён, M11head/CKAD/ZSDблокеры сохранены. [Replay](checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md).

**Последняя полная проверка 696/696+quote/API+Nextwebpack/TypeScript/static16/16 PASS**, focused8/8/eslintnewtestexit0. [Fullgate](checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md). В audit-only classification код не менялся и новая сборка не запускалась. Не трактовать прежний full gate как тест текущей классификации.

## NEXT — Part 19, one unresolved cause at a time

M11 `m11_partial_head_entry_boundary_unresolved`: 8/8 saved cases reviewed; final outcome blocked by missing reliable data, no material exception. CKAD `arc_not_proven`: 34/34 cases and 68 weekday/weekend profiles reviewed from the frozen report, with 102 saved evidence files present; all occurrences remain `ckad_east_arc_not_proven`, outcome blocked by missing reliable data. 22/34 broader CKAD road traversals are proven and 12/34 are not; exact east-arc chargeable scope is unproven in both groups. Full toll totals remain unknown.

**NEXT:** `expected-road-not-proven` (baseline64): compare common causes and exceptions against existing findings using saved evidence only. Counts overlap. No new live/replay unless evidence is incomplete or a material input/geometry/product/code difference is demonstrated. Formal plan stays **90% (18/20)**; Part19 remains IN_PROGRESS and Part20 PLANNED.

The previous live workflow run executed a non-fastest toll-avoidance alternative; its step has been removed from the PR workflow in this commit to honor fastest-route-only scope. Observe the workflow triggered by this commit before the next independent step.

[Part19 queue](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [checkpoint](../docs/checkpoints/2026-10-17-0632-part19-arc-not-proven-blocked.md) · [evidence](../docs/checkpoints/evidence/2026-10-17-part19-arc-not-proven-blocked.json)

2026-10-16 23:00 MSK: Case4 reviewed from parent `8819f8175edf616ed2229536cdf8abde5ef40a68` / tree `8b99cebadb42786e8e95e2b24b504bf713dbda2f`; result source-gated with no material exception. 3 saved profiles, 1 exact capture, 0 new live requests; M11 finding 4/8; formal plan90% (18/20), no new tariff confirmation. [Checkpoint](checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-16-m11-case4-boundary-review.json).

2026-10-16 23:19:47 MSK: Case5 `triple-m11-ckad-m12-kazan-to-spb` reviewed offline from saved evidence at parent `7ce720c381265524189b198902f70b3c97009ab5`. Capture complete 11/11, 2,106 edges; live + same-date/weekend replay bind to capture SHA-256 `b4e49dba…cafe00`. M11 gate ways absent; approximate nearest gate-node distances 26.47m/41.76m (>25m). Fastest saved candidate Valhalla 61,507s vs OSRM 70,869s. No material exception to M11 boundary cause; CKAD east-arc and ZSD zone-1 scope remain separately unresolved; amounts unknown, route total null. No new live/code/tests. Cause check 5/8; plan 18/20=90% only. [Checkpoint](checkpoints/2026-10-16-part19-m11-case5-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-16-m11-case5-boundary-review.json).


2026-10-16 23:39:00 MSK: Case6 `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim` reviewed from saved evidence only. M11 gate ways absent and approximate nearest node distances 26.47m/41.76m (>25m); the shared M11 boundary cause remains blocked. Five complete profiles (live, early same-date/weekend, later same-date/weekend) bind capture SHA-256 ce2577c8…b1f6fdcf and preserve 1,380,434m/53,656s, but later replay adds exact ZSD node 1766158781 proof and removes prior redundant unknown-paid-road label. Expected M12 remains not proven, CKAD east arc not proven, ZSD beyond reviewed zone1. No new live/code/tests/tariff. Check6/8; plan18/20=90%. [Checkpoint](checkpoints/2026-10-16-part19-m11-case6-boundary-exception.md); [evidence](checkpoints/evidence/2026-10-16-m11-case6-boundary-exception.json).


2026-10-17 00:16:00 MSK: Case7 `max-chain-m12-ckad-m11-zsd-vladimir-to-sest` reviewed from saved evidence. Complete 7/7 trace (1,690 edges); live + same-date/weekend replay share capture SHA-256 5e895d67…f52eb6f and route 921,380m/31,886s. M11 directed gate ways absent; approximate nearest gate distances 26.47m/41.76m >25m. Fastest saved Valhalla 31,886s vs OSRM 40,158s. No M11 exception; expected M12 traversal unproven, CKAD east arc and ZSD beyond reviewed zone1 unresolved, full amount unknown. No new live/code/tests. Review count7/8; plan18/20=90%. [Checkpoint](checkpoints/2026-10-17-part19-m11-case7-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-17-m11-case7-boundary-source-gated.json).


2026-10-17 01:45:16 MSK: Case8 `triple-m11-ckad-m12-arzamas-to-spb` DONE from saved capture/profile artifacts only. Three unique live/same-date/weekend profile blobs bind capture SHA-256 b47f5207…91ea61b; each preserves Valhalla fastest route 1,149,643m/43,716s. Duplicate replay blobs are not extra profiles. M11 head remains unresolved; M12 traversal represented, CKAD east arc and ZSD zone scope remain unresolved; full amount null. No new live/replay/code/tests or tariff confirmation. Cause exception review complete 8/8; outcome blocked by missing reliable data. Formal plan 18/20=90%. [Checkpoint](checkpoints/2026-10-17-part19-m11-case8-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-17-m11-case8-boundary-source-gated.json).


2026-10-17 02:31:29 MSK: Reconciled Part19 findings queue after M11 case8. Corrected stale M11 row from 4/8 to 8/8 and recorded blocked-by-missing-reliable-data outcome; linked all eight case checkpoints/evidence. This is a state-ledger reconciliation, not new route testing or tariff confirmation. Latest CI #38977636786 succeeded at parent head. Next: diagnose `unknown-paid-road:unpriced` from saved evidence/current engine, comparing overlap with expected-road-not-proven; no replay/live without a material distinction.
