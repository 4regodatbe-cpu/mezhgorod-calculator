# Калькулятор «Из А в Б»: актуальное состояние

## Handoff — 2026-10-17T05:41:17Z (2026-10-17 08:41 МСК)

- PR14 открыт/draft; разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`. До этого шага remote head/tree: `8582031d0565ebcb6ecd4982a12bfa389ec411ba` / `7fb29e51a6ce5dac755b502684278894034e868c`; PR head совпал. Workflow run #39003295081 completed/success на этом head; активных branch runs нет.
- Формальный план: **18/20 = 90%**; Part19 IN_PROGRESS, Part20 PLANNED. Это не готовность калькулятора и не подтверждённость тарифов.
- M11 boundary cases 5–8 уже имеют отдельные DONE checkpoints; общая причина остаётся **blocked by missing reliable data**, суммы unknown/null.
- M12 `m12_current_operator_pair_not_bound`: проверены 4 сохранённых маршрутных случая, 8 профилей и 12 evidence occurrences (live/capture, same-date, weekend); все файлы доступны. Во всех M12 сумма null/unknown; 9-anchor RVP dataset явно partial, поэтому точный тарифный операторский entry/exit pair не привязан. Outcome **blocked by missing reliable data**. В 2 случаях отдельно остаётся CKAD unknown. Никакой полный итог не подтверждён.
- Новых маршрутов, live/replay, тестов, сборки и тарифов в этом шаге нет. [Checkpoint](../docs/checkpoints/2026-10-17-0841-part19-m12-operator-pair-blocked.md) · [evidence](../docs/checkpoints/evidence/2026-10-17-part19-m12-operator-pair-blocked.json).
- NEXT: `engine_not_yet_composed` (baseline13), только сохранённые доказательства и overlap analysis.


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
