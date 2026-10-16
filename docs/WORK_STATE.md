# Калькулятор: автоматическая очередь

2026-10-16T00:47:27.732Z. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Фаза **DONE**. Stage1 **155/155**; Stage2 **16/154**.

Следующий подшаг: **часть11, kherson-новая-збурьевка-saint-petersburg-center**.

[Состояние и точные входы](../experiments/nationwide-tolls/AUTO_QUEUE_STATE.json), [checkpoint](checkpoints/auto-2026-10-16T00-47-27-732Z-done.json), [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json).

Каждый маршрут: durable STARTED → live/same-date/weekend → report/inventory → DONE/FAILED → commit/push/head readback. Не запускать второго writer, пока workflow активен. GitHub Actions пишет только рабочую ветку. При конфликте/ошибке сохранения остановка безforce. Raw и progress в source-snapshots и artifact.

Audited — воспроизводимость, не независимая проверка цены; unknown не ноль, subtotal не итог. Часть19 не выполнена автоматически одним прогоном, часть20 требует итоговых проверок после исправлений. Fullbuild661PASS — прежняя локальная проверка до автоматического runner; свежий gate см.workflow/checkpoint. No main/merge/Production/Android. Междорожныевекторы отложены, тарификация всей поездки по отправлению. Пользователь16.10 02:12 разрешил автоматическое последовательное продолжение всехчастей.

[Протокол](CHECKPOINT_PROTOCOL.md), [журнал](../experiments/nationwide-tolls/WORK_LOG.md), [решения](../experiments/nationwide-tolls/DECISIONS.md).
