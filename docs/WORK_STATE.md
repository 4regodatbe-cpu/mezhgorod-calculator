# Текущее состояние калькулятора «Из А в Б»

Обновлено 2026-10-16. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft. Последний подтверждённый remote перед этим checkpoint: d7dae8d232a3be3c12fcd103ad2dc7091fa34b29.

## DONE

Полный новый `pnpm build` **PASS/exit0**: **658/658** audit tests, quote/API contracts, Next compile/TypeScript, static16/16. [Точный checkpoint](checkpoints/2026-10-16-build-pass.md), [stdout](checkpoints/evidence/2026-10-16-build.log). Frozen install PASS. Прежний focused59/59 сохранён в истории.

Правило пользователя21:48МСК: все V3 платные компоненты считают по дате/времени отправления; переход суток/часа оплаты не меняет тариф. Геометрия/направление/валидность источника сохраняются. Междорожные векторы отложены полностью.

Пользователь текущего чата16.10 в00:07 прямо разрешил сохранение кода/журналов/evidence в публичную рабочую ветку. CLI credentials отсутствуют, подключённый GitHub connector успешно сохраняет; head/tree проверяются. Исторический approval blocker снят.

## NEXT

1. DONE: targeted ESLint18файлов + diff check exit0.
2. DONE: offline Гуляйполе→Москва четверг3810₽/суббота4640₽, оба replay complete.
3. BLOCKED: live dnr-бахмут-kazan-center — автоматическая проверка требует прямое разрешение на маршрутные координаты/параметры в Valhalla/OSRM/BRouter в текущем чате. [Точная причина и следующий шаг](checkpoints/2026-10-16-routing-approval-blocked.md). После разрешения live→save→same-date/weekend replay→save→batch/report/inventory.

Аудит этап1 **8/155**, этап2 **154** не начат. [Точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json). 40rawOD/39originalcomplete; Лисичанск→Москва original summary утрачен, offline реконструкция не original live. Старые результаты до departure-policy не объявлены повторно проверенными.

[CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md): каждый малый шаг→checkpoint→local commit→GitHub→head/tree readback перед следующим. Unknown не бесплатный, subtotal не полный итог. Не main/merge/Production/Android без запроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md), [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md), [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). История восстановления/блокера16.10 сохранена в отдельных checkpoint0002/0006/0008/0014; старый handoff находится в Git history, подробная история — WORK_LOG.


2026-10-16 DONE: targeted ESLint18 файлов и diff check exit0. STARTED offline Гуляйполе→Москва четверг/суббота. [Checkpoint](checkpoints/2026-10-16-eslint-pass-replay-started.md).


2026-10-16 DONE: Гуляйполе→Москва offline3810₽(четверг)/4640₽(суббота), оба replay complete/exit0. STARTED live Бахмут→Казань. [Checkpoint](checkpoints/2026-10-16-huliaipole-replay-pass.md).


Последний checkpoint: [routing approval blocker](checkpoints/2026-10-16-routing-approval-blocked.md). Тесты/сборка/replay завершены; live Бахмут не получен.


2026-10-16 01:17 МСК: прямое разрешение передачи координат/маршрутных параметров Valhalla/OSRM/BRouter получено в текущем чате («Разрешаю доступ»). Approval blocker снят. STARTED live Бахмут→Казань. [Checkpoint](checkpoints/2026-10-16-0117-routing-authorized-started.md).
