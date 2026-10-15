# Текущее состояние калькулятора «Из А в Б»

2026-10-16T01:58:29.418256+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft. Parent remote перед этим checkpoint `0bb3b672b4dac43acdde507da0a999a9099356b6`.

## DONE

Fullbuild658/658+quote/API/Next/TypeScript/static16/16 PASS, ESLint18/diffcheck PASS, исходный код с тех пор не менялся. [Build](checkpoints/2026-10-16-build-pass.md).

Departurepolicy реализована: вся поездка по дате/времени старта; геометрия/направление/даты источника проверяются. Междорожные векторы отложены. OfflineГуляйполе→Москва3810/4640 complete.

Stage1 **23/155** по реально доступным raw/live/replays; stage2 **154** не начат. Последний случай dnr-краматорск-moscow-center: audited. [Checkpoint](checkpoints/2026-10-16-015829-dnr-краматорск-moscow-center-audit.md). [Последние actual результаты и next](checkpoints/evidence/2026-10-15T22-38-01-683Z-dnr-краматорск-moscow-center-batch-verified.json). REPORT/EVIDENCE_AVAILABILITY обновлены. Original Лисичанск→Москва summary утрачен, offline reconstruction не original live. Старые цены до trip-departure-v1 не выдавать за новые повторы.

## Новый порядок: 20 небольших частей

Часть **1/20 DONE**: [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.md), [точная очередь](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json), [checkpoint](checkpoints/2026-10-16-small-parts-01.md). Один подшаг за запуск; группы не выполнять целиком. Следующая **часть 2**: тайм-ауты/вывод runner и сверка расхождения счётчика (handoff23, corpus28 внутри stage1; не повышать без evidence). Затем один маршрут kherson-аскания-нова-kazan-center. Исторический NEXT ниже подчинён этому порядку.

## NEXT

kherson-аскания-нова-kazan-center по [замороженной очереди](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json). Каждый один маршрут: STARTED→single-case batch→report/inventory→checkpoint→localcommit→GitHub→head/tree readback→следующий. Unknown не бесплатно; subtotal не полный итог.

Прямые разрешения текущего чата: публичныйGitHub16.10 00:07; координаты/контрольные точки/маршрутные параметры Valhalla/OSRM/BRouter16.10 01:16. Не спрашивать повторно. CLI без credentials, connector с точной проверкой blob/tree/head работает. Не main/merge/Production/Android без запроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md),[CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md).
