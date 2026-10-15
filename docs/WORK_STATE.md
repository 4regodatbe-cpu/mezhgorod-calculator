# Текущее состояние калькулятора «Из А в Б»

Обновлено 2026-10-16. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft. Последний подтверждённый remote перед этим checkpoint: 5b3cd6b3f17fe5008b219e5ccc6ab541e4d6895b.

## DONE

Полный новый `pnpm build` **PASS/exit0**: **658/658** audit tests, quote/API contracts, Next compile/TypeScript, static16/16. [Точный checkpoint](checkpoints/2026-10-16-build-pass.md), [stdout](checkpoints/evidence/2026-10-16-build.log). Frozen install PASS. Прежний focused59/59 сохранён в истории.

Правило пользователя21:48МСК: все V3 платные компоненты считают по дате/времени отправления; переход суток/часа оплаты не меняет тариф. Геометрия/направление/валидность источника сохраняются. Междорожные векторы отложены полностью.

Пользователь текущего чата16.10 в00:07 прямо разрешил сохранение кода/журналов/evidence в публичную рабочую ветку. CLI credentials отсутствуют, подключённый GitHub connector успешно сохраняет; head/tree проверяются. Исторический approval blocker снят.

## NEXT

1. Targeted ESLint departure-policy файлов + diff check, сохранить отдельный checkpoint.
2. Offline Гуляйполе→Москва по четвергу/субботе с новым trip-departure-v1, не смешивать со старыми ценами.
3. Live dnr-бахмут-kazan-center + same-date/weekend replay, сохранить каждый шаг.

Аудит этап1 **8/155**, этап2 **154** не начат. [Точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json). 40rawOD/39originalcomplete; Лисичанск→Москва original summary утрачен, offline реконструкция не original live. Старые результаты до departure-policy не объявлены повторно проверенными.

[CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md): каждый малый шаг→checkpoint→local commit→GitHub→head/tree readback перед следующим. Unknown не бесплатный, subtotal не полный итог. Не main/merge/Production/Android без запроса.

[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md), [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md), [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). История восстановления/блокера16.10 сохранена в отдельных checkpoint0002/0006/0008/0014; старый handoff находится в Git history, подробная история — WORK_LOG.


2026-10-16 DONE: targeted ESLint18 файлов и diff check exit0. STARTED offline Гуляйполе→Москва четверг/суббота. [Checkpoint](checkpoints/2026-10-16-eslint-pass-replay-started.md).
