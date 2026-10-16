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

**Свести M11 `m11_partial_head_entry_boundary_unresolved` к общей причине; cases1–2 имеют подробный source-gated разбор. Для остальных шести сначала проверить исключения по сохранённым данным.**

ZSD review **76/76** and M4 finding **22/22** classified source-gated because exact collection spans are not independently bound. [M4 checkpoint](checkpoints/2026-10-16-part19-m4-unpriced-classification.md). Overall plan **90% (18/20 completed parts)**; neither case count nor percent is tariff coverage. Latest fullgate/readiness references above remain prior checks, not rerun for audit-only changes.

Подробный разбор M11 и ограниченные исключения сохранены для 3/8 случаев; пять оставшихся проверяются по сохранённым данным, новые live/replay в case3 не делались. Case2: [DONE checkpoint](checkpoints/2026-10-16-part19-m11-case2-boundary-source-gated.md). Тариф M11 15–58 неизвестен; CKAD/ZSD также блокируют полный итог. Общий дедуплицированный список нерешённых причин ещё не сведен, поэтому его количество не объявляется.

NEXT: case4 `pair-m11-ckad-noginsk-to-spb` DONE/source-gated, без материального исключения; M11 boundary finding проверен4/8, четыре случая остаются. Следующий только case5 `triple-m11-ckad-m12-kazan-to-spb`: сравнить сохранённые capture/live/same-date/weekend профили на существенное исключение; новый live/full replay только при конкретном отличии или неполных данных. [Case4 checkpoint](checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md). Обе очереди155/154 уже завершены; 90% относится к 20-частному аудиту, полнота исходного широкого аудита матрицы этим не установлена. No main/merge/Production/Android; automation remains enabled.


2026-10-16 23:00 MSK: Case4 reviewed from parent `8819f8175edf616ed2229536cdf8abde5ef40a68` / tree `8b99cebadb42786e8e95e2b24b504bf713dbda2f`; result source-gated with no material exception. 3 saved profiles, 1 exact capture, 0 new live requests; M11 finding 4/8; formal plan90% (18/20), no new tariff confirmation. [Checkpoint](checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md); [evidence](checkpoints/evidence/2026-10-16-m11-case4-boundary-review.json).