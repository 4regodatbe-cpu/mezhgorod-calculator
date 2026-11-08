# DONE — восстановление и проверка CI, 24.10.2026 МСК

Запрос: «Ты завис продолжай по правилу проекта». Последний durable source: f2abc85b8132260e7503c978a4ad1f93501a9938, tree cc86ed02c62687fd58f793ec42195bd7be152c76, PR14 open/draft, рабочая ветка fix/v3-missing-route-prices-2026-10-15. Локальный detached checkout совпадает; tracked изменений нет, только существующий untracked node_modules symlink. Другие dirty worktrees не изменены.

Остановка произошла после сохранения реализации, на проверке удалённого CI. Код, шесть captures/12 профилей и локальные 840 tests/build уже готовы; повторять их без новой причины не требуется.

## Оставшаяся работа восстановления

1. DONE: один PR readback и чтение завершённого run39997833752/jobs/logs. Выход — [ci-status.json](../../experiments/road-ref-boundaries/checks/2026-10-24-recovery/ci-status.json). Новых route/provider запросов и тестовых запусков нет. Критерий — известны head и реальные результаты каждого job.
2. DONE локально, durable подтверждается readback после commit: сохранить этот checkpoint, handoff, журнал и NEXT_STEPS. Только docs/evidence, nonforce lease на f2abc85; при сбое продолжать передачу, не повторять расчёты. Критерий — exact remote tree/head совпадают с переданными файлами.
3. Остаётся отдельная причина: диагностика устойчивости внешнего поиска. Вход — сохранённые CI ответы и действующие lib/photon-address-search.ts, app/api/suggest/route.ts, scripts/address-search-live-probe.mjs. Сначала ограниченный offline анализ числа запросов/повторов и существующего fallback; не перезапускать весь маршрутный корпус. Перед длительным probe/изменением сохранить STARTED с лимитами. Признак завершения — установлена проверяемая причина/исправление либо точно назван недостающий источник. Не смешивать с отсутствующими тарифами.

## Фактический CI

Run39997833752 completed/success, но live_probe completed/failure: workflow явно содержит continue-on-error:true. Verify (тесты, tsc, Next build) success; live geometry/time probe success. Photon probe: HTTP503, затем request/body timeouts, 90-second BUDGET_EXHAUSTED, completed12/planned13, failedSources94. Донецк дал120 features, Макеевка20; последующие Ялта/Краснодар/Москва и другие запросы не дали features в этом запуске. Проверки 50 поселений и шести Яндекс-маршрутов SKIPPED, не PASS. Artifact12520473376 был загружен CI; SHA ZIP записан в evidence, ZIP в этой операции не скачивался. Источник логов — GitHub job120565880364, не новая живая съёмка.

Вывод: недоступность внешнего Photon наблюдалась; связь с конкретным полем A/B, причина503 и состояние сервиса сейчас этим запуском не доказаны. Итог причины — IN_PROGRESS, исправление поиска не заявляется. Успешный общий run не означает успешный live поиск.

Реализация graph boundary остаётся DONE по предыдущему checkpoint; тарифный scope/цены одной pending пары неизвестны, активных новых цен0. Backup c7048e0 сохранён ранее; заново в этом коротком шаге не проверялся. Production/main/merge/Android не изменены. Новый docs-only commit может запустить CI; его статус сообщать отдельно от проверенного source run, без бесконечного commit ради собственного CI.

Проверки этой операции: Git status/head, PR head/draft, workflow/job status и точечные logs; проверка diff/link/JSON до commit. Новые тесты/build не запускались, код не менялся. Следующий конкретный шаг — ограниченный offline разбор Photon fan-out/fallback по указанным файлам после durable readback.
