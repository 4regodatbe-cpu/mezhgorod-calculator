# Текущее состояние калькулятора «Из А в Б»

2026-10-16. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft. Последний проверенный remote до этого checkpoint `0d35069719a0a54130ef88c24b1bab54d5b1b42e`.

## DONE

Новый fullbuild exit0:658/658tests,quote/API,Next/TypeScript/static16/16; ESLint18файлов/diffcheck exit0. [Сборка](checkpoints/2026-10-16-build-pass.md).

Departure policy реализована: вся поездка по дате/времени отправления, без смены профиля в пути. Offline Гуляйполе→Москва3810/4640,оба complete. Новый live Бахмут→Казань1452.489км OSRM fastest,850/850,trace/parity/replays complete. [Case](checkpoints/2026-10-16-bakhmut-kazan-replay-pass.md).

Stage1 **9/155**,stage2 **154** не начат. Availability43raw/41OD/40полных комплектов,0повреждений; original Лисичанск→Москва summary утрачен. REPORT40audited, findings большинства старых случаев относятся к прежней time-policy и не являются новыми проверками. [Сводка](checkpoints/2026-10-16-report-inventory-bakhmut-kazan.md).

## IN PROGRESS / NEXT

STARTED single-case batch `dnr-бахмут-kerch-center`,limit1; после одного route+replays report/inventory/checkpoint/commit/GitHub/readback. Далее `dnr-бахмут-moscow-center`,затем СПб; [точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json).

Прямые разрешения текущего чата действуют: публичныйGitHub(00:07),Valhalla/OSRM/BRouter маршрутные координаты/параметры(01:16). Старые approval blockers сняты. CLI credentials отсутствуют, connector blob/tree/commit/ref с точной SHA-проверкой работает. Не спрашивать повторно.

Каждый небольшой шаг/route сохранять по [CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md). Unknown не бесплатно,subtotal не полный итог. Междорожные векторы отложены. Не main/merge/Production/Android без прямого запроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). Старые handoff статусы superseded этим файлом; history/checkpoints сохраняют все действия.
