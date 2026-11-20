# Часть 19C — Раденск → Москва, M4 policy 3/25: DONE

16.10.2026 08:38 МСК. Ветка fix/v3-missing-route-prices-2026-10-15, PR14 open/draft; actual remote/PR head a53bd290ce4738aa01d484e23163e99939c045ff, исходное local/remote tree f280ac8936a2dd33fcf828db5d7b4945fa39673a. Checkout был чист. Workflow38824450386/job116729992063 через GitHub completed/success; не перезапускался. Прочитаны AGENTS, CHECKPOINT_PROTOCOL, WORK_STATE, SMALL_PARTS_PLAN, AUTO_QUEUE_STATE, README и актуальные journal/decisions. ExecutionUnit плана — один маршрут максимум за запуск; выполнен только этот случай. STARTED и recovery были сохранены в предыдущем checkpoint Пришиб/WORK_STATE.

## Входы и реальные результаты

Из corpus.auditEvidence: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/kherson-раденск-moscow-center/2026-10-15T11-56-25-327Z-capture.json.gz`, SHA256 cdb0e406663dd829f29ecb09393468a6fd1e1896665b4aa42f28ae95c1486e5d. Выбранный provider сохранённого маршрута — OSRM,1980035м. Геометрия других кандидатов не подмешивалась, новых сетевых route requests не было.

Существующий runner: `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt>`. Два запуска на2026-10-15T09:00:00+03:00 и2026-10-17T09:00:00+03:00, оба exit0. У обоих replayIntegrity.complete=true, missingResponses=[], audit.status=priced, audit.missing=[]. Trip-departure-v1.basisAt точно равен отправлению, не времени пересечения ПВП.

Новые output в той же папке runs/kherson-раденск-moscow-center/:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T05-38-01-677Z.json`, SHA256 1b0b1542355138709773ecc2e6e1171a3e4129d6a983200a37707bca7f1b7484: **5840 = М-4 5040 + А-289 800**.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T05-38-02-454Z.json`, SHA256 34be4aae197a755d9c07c10c0f787a40a596f3603c0288a8ae565973fa471915: **6890 = М-4 6090 + А-289 800**.

М-4 exact selected vector m4-1223→m4-71; А-289 полный внутренний103→82→23. Старый live был unknown по m4_crossing_profile_changes и unresolvedA289exits; original live/raw/replay не переписаны. Текущая historical M4 ошибка здесь не воспроизводится, дополнительный source fix не нужен. Это проверка corrected-engine offline, не новая parity со старым buggy output, не fresh live и не независимое подтверждение тарифа; priceConfirmation=unconfirmed сохранён. Никаких выдуманных цен или unknown=0.

## Проверки, ошибка чтения, сохранение

Один read-only metadata evaluator первоначально упал SyntaxError из-за лишней закрывающей фигурной скобки; команда исправлена и успешно прочитала plan/corpus до replay. Файлы этим чтением не менялись, это не сбой расчёта. JSON, ссылки и git diff проверены перед сохранением. REPORT SHA256 неизменен: cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e.

Runtime после79df66d8 не менялся; fullgate676/676+quote/API/Next/TypeScript/static16/16, focused23/lint5 остаётся предыдущей проверкой19B, в этом evidence/docs-only шаге не перезапускался. Обновлены отдельный checkpoint, queue/plan, WORK_STATE, append-only WORK_LOG/NEXT_STEPS. Все blob SHA/tree сверяются с локальным commit, GitHub non-force update только с expectedhead и remote readback. Фактический новый SHA проверяется после публикации; здесь записан parent. Main/merge/Production/Android/сообщений людям нет.

## NEXT STARTED — один следующий случай

Historical M4 policy проверено3/25. Следующий ТОЛЬКО `dnr-гранитное-saint-petersburg-center` (4/25): capture взять из corpus.auditEvidence; существующий runner, два профиля15/17октября09:00МСК. Проверить integrity, M4 quote/basisAt, остальные unresolved компоненты не скрывать и не выдавать subtotal за итог. Затем отдельный checkpoint, queue/WORK_STATE/logs, commit/GitHub/head/tree до другого случая. Не запускать весь309корпус повторно. Часть19 in_progress,20 planned; автопродолжение оставить включённым.
