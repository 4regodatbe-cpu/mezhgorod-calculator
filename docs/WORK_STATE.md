# Калькулятор «Из А в Б»: актуальное состояние

16.10.2026. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft/open. Последний проверенный remote parent020ff944; head этого checkpoint проверяется после сохранения.

## DONE

Части1–3 завершены: план20частей; runner default1, PHASE/stream/WAIT15s; focused3/3; fullbuild661/661 + quote/API/Next/TypeScript/static16/16 PASS; ESLint3/diff PASS. [Часть2](checkpoints/2026-10-16-small-parts-02-runner.md), [build](checkpoints/2026-10-16-small-parts-02-build-pass.md).

[Сверка evidence](checkpoints/evidence/2026-10-16-stage-reconciliation.json): stage1 **23/155**,stage2 **0/154**. Corpus statuses28/4 не подтверждают полноту. Часть3=19/19 ранее проверенных, часть4=4/19. Audited означает воспроизводимость, не подтверждение цены. Старые результаты до trip-departure-v1 не выдавать за новые.

## IN PROGRESS / NEXT

Часть4: STARTED **kherson-аскания-нова-kazan-center**, single-case batch --limit1. [Входы/команда/recovery](checkpoints/2026-10-16-small-parts-02-done-04-started.md). Лог checkpoints/evidence/2026-10-16-askania-kazan-batch.log. Сначала результат и durable checkpoint; затем следующий pending ID из [JSON плана](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json).

Пользователь16.10 02:12 поручил автоматически пройти все части, без запроса «дальше». Каждый малый шаг отдельно сохранять в GitHub, проверять head/tree перед следующим; STARTED перед долгим запуском. При провале сохранения остановить расширение. [CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md).

Политика: самый быстрый маршрут; тариф всей поездки по дате отправления; unknown не бесплатно, subtotal не полный итог. Междорожные векторы отложены. Не main/merge/Production/Android без прямого запроса. GitHub/routing разрешения пользователя действуют, не спрашивать повторно.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md), [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md), [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md), [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.md).
