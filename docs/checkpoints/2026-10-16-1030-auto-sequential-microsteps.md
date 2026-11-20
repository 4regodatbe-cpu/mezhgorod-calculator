# Автоматическая последовательность микрошагов — DONE / NEXT STARTED

16.10.2026, уточнение пользователя10:27МСК: «Продолжай ... Запускай следующий этап теста автоматически». Parent53904731a5a48aa2d2dd7d7612829ff220c256bd, working branch/PR14draft проверены; queuejob116729992063 completed/success, другого queuewriter нет. Code/evidence не менялись.

Убирается прежний административный лимит «один маршрут максимум за запуск», который требовал нового захода после каждого случая. Новый executionUnit: **один маршрут на сохраняемый микрошаг**, после его commit/push/head/tree проверки сразу следующий, без команды пользователя. Между случаями checkpoint обязателен, параллельных writer нет; большое накопление результатов до общего commit по-прежнему запрещено. Это исполнение прямого уточнения пользователя, не отмена протокола сохранения.

Изменены SMALL_PARTS_PLAN.executionUnit и короткий handoff; решение добавлено в DECISIONS, журналы append-only. Для docs-only проверить diff/JSON/links, full build не нужен. История не стёрта. Main/merge/Production/Android/рассылка не разрешены.

NEXT STARTED: следующийcase zaporizhzhia-пришиб-saint-petersburg-center6/25, existing corpus.auditEvidence.capture, offline15/17Oct09:00МСК; integrity/M4quote/basisAt/otherunknown, новые timestampedoutputs+отдельныйcheckpoint+queue/logs/state, localcommit/GitHub expectedhead/no-force/tree readback. Затем СРАЗУcase7 и далее поочерёдно, каждый со своим сохранением. При новом фактическом дефекте остановить расширение, сохранитьFAILED и устранить одну причину; при границе контекста сохранитьточныйNEXT, дальнейшее автопродолжение остаётся разрешённым. Part19ongoing/20planned.
