# Текущее состояние калькулятора «Из А в Б»

Обновлено 2026-10-15T21:11:09.420873+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft/open. Последний проверенный remote e8ab595bc6a92e429533d438e718af9373c35e1e. Новый consent на публичный GitHub и routing: [checkpoint](checkpoints/2026-10-15-211109-consent-two-stages.md). После записи подтвердить push/read-back до live запуска.

## DONE

- Восстановлены32полных региональных комплекта из160planned; всего340cases. RawOD33,7изстарых40rawещёутрачены. Лисичанск→Москва имеет offline reconstruction, полноценный новый live открыт.
- Принят [план двух этапов](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.md): этап1=155cases(65regional+90road),этап2=154(64+90). [Точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json).
- Ранее build656/656+quote/API/Next/types/static16PASS; в текущем docs-only шаге не повторён. Пришиб→СПб уже remote403d7a4.

## IN PROGRESS / NEXT

Этап1:1из155 завершён. Пришиб→Казань live+replays/parity PASS, итог unknown. Следующий `zaporizhzhia-гуляйполе-moscow-center`, один batch --case --limit1. [Последний checkpoint](checkpoints/2026-10-15-211410-prishib-kazan-done.md). После live+2replays обновить availability/report, checkpoint/commit/push/read-back, затем следующий assignedcase. Каждый шаг по [CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md). Не запускать несколько несохранённых случаев.

## Ограничения

Unknown не бесплатный; complete replay не означает правильный тариф. Findings М4/time,А289/exits,ЦКАДscope ещёоткрыты. App/lib/тарифы/Production сейчас не меняются. Не merge/Production/Android без запроса. На границе этапов сохранить self-contained handoff и продолжить в новом чате.

[Полный предыдущий журнал состояния](WORK_STATE_HISTORY_2026-10-15_2109.md). [Рабочий журнал](../experiments/nationwide-tolls/WORK_LOG.md). [Решения](../experiments/nationwide-tolls/DECISIONS.md). [Дальнейшие действия](../experiments/nationwide-tolls/NEXT_STEPS.md).
