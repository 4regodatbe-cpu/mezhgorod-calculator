# Текущее состояние калькулятора «Из А в Б»

2026-10-16T01:29:28.936436+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft. Parent remote перед этим checkpoint `dc4b4f37e890d12f04f1318848c6037fb429dcfa`.

## DONE

Fullbuild658/658+quote/API/Next/TypeScript/static16/16 PASS, ESLint18/diffcheck PASS, исходный код с тех пор не менялся. [Build](checkpoints/2026-10-16-build-pass.md).

Departurepolicy реализована: вся поездка по дате/времени старта; геометрия/направление/даты источника проверяются. Междорожные векторы отложены. OfflineГуляйполе→Москва3810/4640 complete.

Stage1 **15/155** по реально доступным raw/live/replays; stage2 **154** не начат. Последний случай dnr-волноваха-moscow-center: audited. [Checkpoint](checkpoints/2026-10-16-012928-dnr-волноваха-moscow-center-audit.md). [Последние actual результаты и next](checkpoints/evidence/2026-10-15T22-29-02-225Z-dnr-волноваха-moscow-center-batch-verified.json). REPORT/EVIDENCE_AVAILABILITY обновлены. Original Лисичанск→Москва summary утрачен, offline reconstruction не original live. Старые цены до trip-departure-v1 не выдавать за новые повторы.

## NEXT

dnr-волноваха-saint-petersburg-center по [замороженной очереди](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json). Каждый один маршрут: STARTED→single-case batch→report/inventory→checkpoint→localcommit→GitHub→head/tree readback→следующий. Unknown не бесплатно; subtotal не полный итог.

Прямые разрешения текущего чата: публичныйGitHub16.10 00:07; координаты/контрольные точки/маршрутные параметры Valhalla/OSRM/BRouter16.10 01:16. Не спрашивать повторно. CLI без credentials, connector с точной проверкой blob/tree/head работает. Не main/merge/Production/Android без запроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md),[CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md).
