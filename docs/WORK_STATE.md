# Калькулятор «Из А в Б»: актуальное состояние

16.10.2026. Только ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft/open. Последний проверенный remote commit перед этой записью: `6fa74b45e6d8db6059556b2daadab003b551ccde`, tree `d6f6b901deaf54fa66abd40b2d3e681c73a6929f`. Main, merge, Production и Android не трогались.

## DONE

- Части 1–18: stage1 **155/155**, stage2 **154/154**. Workflow `38824450386`, job `116729992063` — SUCCESS; не запускать завершённую очередь повторно. Frozen REPORT: 340/340 с 31 ранним контролем, 0 повреждённых ссылок. Audited означает воспроизводимость, не подтверждение тарифа.
- **19A:** полный внутренний вектор А-289 из трёх упорядоченных рамок, без повторов, теперь привязывается независимо от городов начала/конца длинной поездки. Существующая dated-матрица, не выдуманная цена. [Результат и impact 57/59](checkpoints/2026-10-16-part19-a289-impact-done.md).
- **19B:** оставшиеся Москва ↔ Тамань проходят направленный съезд у Славянска, а не полный восточный участок. Строгие три геометрических контроля, порядок, радиус 25 м, запрет длинных хорд/повторов; только точный partial-вектор с доказательством съезда. Существующая матрица даёт А-289 385 ₽. [Диагноз](checkpoints/2026-10-16-part19b-a289-connector-diagnosed.md), [реализация](checkpoints/2026-10-16-part19b-a289-connector-focused.md).
- Обе стороны отдельно воспроизведены: **4725 ₽ на 15.10.2026 / 5625 ₽ на 17.10.2026**, отправление 09:00 МСК, complete 2/2 на каждую сторону, missingResponses=[]; priceConfirmation остаётся unconfirmed. [Москва→Тамань](checkpoints/2026-10-16-part19b-moscow-taman-replay.md), [Тамань→Москва](checkpoints/2026-10-16-part19b-taman-moscow-replay.md).
- Последняя проверка runtime `79df66d86b20cb339c2f96d377fed5a5277a2d01`: **676/676 tests**, quote/API/Next/TypeScript/static 16/16 PASS; focused 23/23, scoped ESLint 5 файлов/diff PASS. После неё расчётный код не менялся. [Gate](checkpoints/2026-10-16-part19b-a289-build-pass.md).

Все 59 исторических A289:unpriced имеют доказательство восстановления привязки компонента: 57 — helper-only impact, 2 — whole-engine replay в двух профилях. Это **не 59 полных или подтверждённых цен поездок**. Original raw/live/replays/REPORT не переписывались; новые результаты — offline corrected-engine, не fresh live или независимый операторский эталон.

## IN PROGRESS — часть 19

Разобрать остальные категории [PART19_FINDINGS_QUEUE.json](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) по одному случаю; [план 20 частей](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Часть 20 ещё не начата.

**19C, историческая M4 crossing-policy: проверено 5/25.** У всех5 current-engine offline complete2/2, trip-departure-v1; историческая M4 ошибка не воспроизвелась, нового source fix не требовалось. Первые3 Москва — полные quotes (Гранитное3810/4640₽, Пришиб/Раденск5840/6890₽ каждый). **Гранитное→СПб и Брянка→СПб остаются unknown из-за ЗСД вне reviewed zone1**, хотя М-4=3810/4640 и М-11 компоненты рассчитаны. Не subtotal=итог. [Первые4/источники](checkpoints/2026-10-16-093623-part19c-granitnoe-spb-m4-policy-replay.md), [Брянка/SHA/NEXT](checkpoints/2026-10-16-102232-part19c-bryanka-spb-m4-policy-replay.md). Полная очередь/evaluations в PART19_FINDINGS_QUEUE. Старые unknown сохранены, это не fresh live/подтверждение тарифа.

## NEXT — один сохраняемый микрошаг

Automatic policy runner **focused8/8 + scopedlint3/diff PASS**, включая isolated percaseGit/push/failure integration. **Fullgate STARTED, пока не подтверждён**; workflow ещё не включён. [Checkpoint/recovery](checkpoints/2026-10-16-part19-policy-runner-integration-pass.md).

Automatic policy runner implemented, **focused5/5/lint2/diff PASS**, workflow not enabled yet. Next: raw/report guards + isolated per-case persistence integration tests, then fullgate before workflow edit. [Checkpoint](checkpoints/2026-10-16-part19-policy-runner-focused.md).

**STARTED автоматическая очередь оставшихся20/25 policy replays** в существующем GitHubworkflow: сначалаrunner/tests/fullgate, потомworkflowpush и наблюдаемыйrun. Case6 пока не запущен. [Recovery](checkpoints/2026-10-16-part19-automatic-policy-queue-started.md). После каждого durable save сразу следующийcase, по прямому уточнению пользователя10:27МСК.

**Только `zaporizhzhia-пришиб-saint-petersburg-center`, историческая M4 policy 6/25.** Получить existing capture из corpus.auditEvidence; existing runner `run-systemic-route-case.mjs --replay` на 15/17 октября 09:00 МСК. Проверить integrity, фактический M4 quote и trip-departure basis; unrelated unknown не скрывать, subtotal не выдавать за итог. Сохранить новые timestamped outputs, checkpoint, WORK_LOG/NEXT_STEPS и оценку в queue; commit, GitHub branch head и exact tree readback **до следующего случая**. При кириллице — NUL-safe Git paths. Для PR использовать metadata-only get_pr_info: fetch_pr с огромным diff возвращал Transport closed.

Автоматически продолжать без команды «дальше»: **после каждого durable save сразу следующий случай**, не останавливаться после одного маршрута за заход. Прямое уточнение пользователя16.10.2026 10:27МСК, [checkpoint](checkpoints/2026-10-16-1030-auto-sequential-microsteps.md). Один маршрут на микрошаг, один writer. Перед записью проверить отсутствие другого writer. STARTED до долгой операции, DONE/FAILED и durable save после каждого микрошaга. Если сохранение не прошло — остановить расширение, сообщить blocker. Не считать старую same-date parity проверкой исправленного кода.

## Постоянные ограничения и журнал

Unknown ≠ 0, subtotal ≠ полный итог; вся поездка тарифицируется по моменту отправления; междорожные векторы отложены. GitHub/routing consent уже дан, повторно не спрашивать. Не merge/main/Production/Android без нового прямого запроса, никому не отправлять сообщения.

[Checkpoint protocol](CHECKPOINT_PROTOCOL.md) · [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md) · [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md) · [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). Исторические записи сохранены в журнале, отдельных checkpoints и Git; эта страница — только текущий короткий handoff.
