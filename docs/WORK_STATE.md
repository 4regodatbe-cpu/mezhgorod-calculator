# Калькулятор «Из А в Б»: текущее состояние

16.10.2026. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR14. Проверенный source head для правил `e197a7a40ec10ae08ea470f50ca61844a1226bfc`, tree `54b899d424b3da1170af5d7e2871ae2801ad49e8`; case3 reviewed from this tree, see latest checkpoint. Из него создан отдельный чистый checkout `calculator-rules`; старый расходящийся `calculator-run` сохранён. Пользователь утвердил [правила разбора по причинам и отчётности](WORKFLOW_RULES.md); они включены в AGENTS и автоматическое продолжение. [Checkpoint правил и Git auth](checkpoints/2026-10-16-215327-workflow-efficiency-rules.md).

Наблюдаемый run `38951539156` для `e197a7a…`: completed/success. CLI Git auth не настроен; продолжаем сохранять через GitHub connector. PR14 открыт/draft.

## Прогресс

**90% по согласованному плану:18/20частей полностью завершены.** Часть19 IN_PROGRESS,20 PLANNED. Формула/смысл в [плане](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Это доля этапов, а не доля подтверждённых тарифов. Пользователь просит указывать процент в каждом отчёте.

Части1–18:155/155+154/154, frozenREPORT340/340.19A/B:57A289helper-only+2wholecases (не59полныхтарифов).19C:25/25policyDONE,20wholeofflinequotes/5unknownZSD. Эти очереди не перезапускать.

19D M4review22/22:5wholeunconfirmedestimates/3pricedM4componentswithotherunknowns/8physical545scopegates/6shortM4scopegates. Эти14sourcegates открыты, unknown≠0. [M4/очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

**ZSDreview76/76**: каждыйcase отдельно воспроизведён в2offlineprofiles; collection span остаётся source-gated. [Классификация](checkpoints/2026-10-16-zsd-classification-76-cases.md). **M4:unpriced22/22** классифицированы по saved evidence: 5 whole-route estimates без подтверждённого тарифа, 3 M4 components с другими неизвестными продуктами, 8 физических545 и 6 short-route scope gates. Тарифы/бесплатность не выведены. [Классификация M4](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Числоcases не есть покрытие тарифов.

Исправление exactnode1766158781→ZSD валидировано: первичная направленная топология иselectedledger подтвердилиПВППланерная; redundantunknownpaidroad устранён, M11head/CKAD/ZSDблокеры сохранены. [Replay](checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md).

**Последняя полная проверка 696/696+quote/API+Nextwebpack/TypeScript/static16/16 PASS**, focused8/8/eslintnewtestexit0. [Fullgate](checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md). В audit-only classification код не менялся и новая сборка не запускалась. Не трактовать прежний full gate как тест текущей классификации.

## NEXT — одна причина и её исключения

**Общая причина `m11_partial_head_entry_boundary_unresolved` проверена по исключениям в cases1–7 из 8. Case7 подтверждает ту же M11 границу; route-specific M12 expected-road, CKAD/ZSD остаются отдельно незакрытыми.**

ZSD review **76/76** and M4 finding **22/22** classified source-gated because exact collection spans are not independently bound. [M4 checkpoint](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Overall plan **90% (18/20 completed parts)**; neither case count nor percent is tariff coverage. Latest fullgate/readiness references above remain prior checks, not rerun for audit-only changes.

Подробный разбор M11 и исключения сохранены для 7/8 случаев; один случай остаётся. M11 15–58 не подтверждён; case7 не доказывает ожидаемый M12 traversal, CKAD east arc и ZSD zone-1 scope. Полный итог маршрута остаётся unknown.

NEXT: case7 `max-chain-m12-ckad-m11-zsd-vladimir-to-sest` DONE/source-gated: та же M11 boundary-причина, исключения нет. Live/same-date/weekend profiles совпадают по capture и маршруту; M12 expected traversal не доказан, CKAD east arc и ZSD вне reviewed zone1 остаются unresolved. Следующий только case8 `triple-m11-ckad-m12-arzamas-to-spb`, bounded saved-evidence review. [Case7 checkpoint](checkpoints/2026-10-17-part19-m11-case7-boundary-source-gated.md). Плановые 90% не означают готовность калькулятора или тарифов. No main/merge/Production/Android; automation remains enabled.


2026-10-16 23:00 MSK: Case4 reviewed from parent `8819f8175edf616ed2229536cdf8abde5ef40a68` / tree `8b99cebadb42786e8e95e2b24b504bf713dbda2f`; result source-gated with no material exception. 3 saved profiles, 1 exact capture, 0 new live requests; M11 finding 4/8; formal plan90% (18/20), no new tariff confirmation. [Checkpoint](checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-16-m11-case4-boundary-review.json).

2026-10-16 23:19:47 MSK: Case5 `triple-m11-ckad-m12-kazan-to-spb` reviewed offline from saved evidence at parent `7ce720c381265524189b198902f70b3c97009ab5`. Capture complete 11/11, 2,106 edges; live + same-date/weekend replay bind to capture SHA-256 `b4e49dba…cafe00`. M11 gate ways absent; approximate nearest gate-node distances 26.47m/41.76m (>25m). Fastest saved candidate Valhalla 61,507s vs OSRM 70,869s. No material exception to M11 boundary cause; CKAD east-arc and ZSD zone-1 scope remain separately unresolved; amounts unknown, route total null. No new live/code/tests. Cause check 5/8; plan 18/20=90% only. [Checkpoint](checkpoints/2026-10-16-part19-m11-case5-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-16-m11-case5-boundary-review.json).


2026-10-16 23:39:00 MSK: Case6 `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim` reviewed from saved evidence only. M11 gate ways absent and approximate nearest node distances 26.47m/41.76m (>25m); the shared M11 boundary cause remains blocked. Five complete profiles (live, early same-date/weekend, later same-date/weekend) bind capture SHA-256 ce2577c8…b1f6fdcf and preserve 1,380,434m/53,656s, but later replay adds exact ZSD node 1766158781 proof and removes prior redundant unknown-paid-road label. Expected M12 remains not proven, CKAD east arc not proven, ZSD beyond reviewed zone1. No new live/code/tests/tariff. Check6/8; plan18/20=90%. [Checkpoint](checkpoints/2026-10-16-part19-m11-case6-boundary-exception.md); [evidence](checkpoints/evidence/2026-10-16-m11-case6-boundary-exception.json).


2026-10-17 00:16:00 MSK: Case7 `max-chain-m12-ckad-m11-zsd-vladimir-to-sest` reviewed from saved evidence. Complete 7/7 trace (1,690 edges); live + same-date/weekend replay share capture SHA-256 5e895d67…f52eb6f and route 921,380m/31,886s. M11 directed gate ways absent; approximate nearest gate distances 26.47m/41.76m >25m. Fastest saved Valhalla 31,886s vs OSRM 40,158s. No M11 exception; expected M12 traversal unproven, CKAD east arc and ZSD beyond reviewed zone1 unresolved, full amount unknown. No new live/code/tests. Review count7/8; plan18/20=90%. [Checkpoint](checkpoints/2026-10-17-part19-m11-case7-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-17-m11-case7-boundary-source-gated.json).
