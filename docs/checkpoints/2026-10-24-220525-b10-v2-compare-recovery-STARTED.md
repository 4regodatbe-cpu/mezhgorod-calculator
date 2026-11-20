# B10 STARTED — recovery незавершённого V2 compare

Статус: STARTED, 24.10.2026 22:05 МСК.

Parent/source: `1ecd27e2c9e4b1e7a54a6646693e255c50cf3590`; ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 draft. Продолжает незавершённый [STARTED от 19.10](2026-10-19-issue2-yeysk-maykop-v2-compare-STARTED.md), не повторяя сохранённые V3 captures/replays.

## Блок A — runtime recovery и bounded harness

1. Установить зависимости один раз: `pnpm install --frozen-lockfile`, Node24/pnpm11.25.0. Это не проверка кода.
2. Найти/подготовить отдельный harness только для двух project proxy controls и `/api/v2/calculate`; не запускать `segment1-user-regression.mjs` или другой широкий runner.
3. До live capture проверить invalid input/no-network path и точные request bodies. Harness должен ограничивать каждый handler вызов 120 секундами, выполнять cases последовательно и атомарно сохранять progress.

## Блок B — только после отдельного durable STARTED

Ровно два завершённых V2 handler capture: Ейск→Москва и Майкоп→Москва, departure `2026-10-22T09:00:00+03:00`, затем offline replay тех же calls на четверг и субботу. Не более одного bounded retry только если первая попытка не дала полного API response и процесс завершён. Сохранить raw requests/API/fetch responses, SHA, live/replay counters.

## Ограничения и recovery

Координаты — project proxy, не доказанные historical UI inputs. Test expectations не операторские тарифы. Код/матрицу/тарифы не менять под ожидаемые суммы. При install/import/runtime blocker сохранить FAILED/BLOCKED и перейти к независимому docs/source блоку. После каждого блока — checkpoint/WORK_LOG/NEXT_STEPS/WORK_STATE, commit, non-force remote readback до следующего.
