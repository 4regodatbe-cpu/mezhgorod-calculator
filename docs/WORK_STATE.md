# Калькулятор: автоматическая очередь

2026-10-16T02:20:21.259Z. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Фаза **AUDIT_QUEUE_DONE**. Stage1 **155/155**; Stage2 **154/154**.

Часть19 **IN PROGRESS**: [checkpoint](checkpoints/2026-10-16-part19-started.md). Первый подшаг — A289 full three-frame traversal на длинных маршрутах; ещё не исправлен. Workflow завершён SUCCESS, другого writer нет. Часть20 не начата.

[Состояние и точные входы](../experiments/nationwide-tolls/AUTO_QUEUE_STATE.json), [checkpoint](checkpoints/auto-2026-10-16T02-20-21-259Z-audit_queue_done.json), [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json).

Каждый маршрут: durable STARTED → live/same-date/weekend → report/inventory → DONE/FAILED → commit/push/head readback. Не запускать второго writer, пока workflow активен. GitHub Actions пишет только рабочую ветку. При конфликте/ошибке сохранения остановка безforce. Raw и progress в source-snapshots и artifact.

Audited — воспроизводимость, не независимая проверка цены; unknown не ноль, subtotal не итог. Часть19 не выполнена автоматически одним прогоном, часть20 требует итоговых проверок после исправлений. Fullbuild661PASS — прежняя локальная проверка до автоматического runner; свежий gate см.workflow/checkpoint. No main/merge/Production/Android. Междорожныевекторы отложены, тарификация всей поездки по отправлению. Пользователь16.10 02:12 разрешил автоматическое последовательное продолжение всехчастей.

[Протокол](CHECKPOINT_PROTOCOL.md), [журнал](../experiments/nationwide-tolls/WORK_LOG.md), [решения](../experiments/nationwide-tolls/DECISIONS.md).

Часть19/A289: realcapture regression RED (1expected fail,2PASS), baseline не менялся. [Checkpoint](checkpoints/2026-10-16-part19-a289-regression-red.md). STARTED minimal full-frame binding через существующий datedadapter.

16.10.2026: A289fullvector code внедрён, первыйfocused FAILED15PASS/1testfilefailed наVMJSONloader. Следующее nativeimport composition вновомтесте. checkpoints/2026-10-16-part19-a289-focused-loader-failed.md. Новоеполноеисправление ещёнепроверено.

16.10.2026: A289fullinterior vector focused20/20PASS; fullbuildSTARTED, затемlint/replay. checkpoints/2026-10-16-part19-a289-focused-pass.md. Часть19ещёINPROGRESS.
