# Часть19C — Гранитное→Санкт-Петербург: M4 policy4/25 DONE, total UNKNOWN

16.10.2026 09:36 МСК. Только fix/v3-missing-route-prices-2026-10-15, PR14 open/draft. Remote/PR head9565897cd2f718483d86ce3ed2c0ceac5a9b7db4 и local/remote tree14f9dc1d4cec3dfd8421f5c9a03d6e178f06a98c проверены, checkout был чист. GitHub workflow38824450386/job116729992063 completed/success, не перезапускался. AGENTS/CHECKPOINT_PROTOCOL/WORK_STATE/SMALL_PARTS_PLAN/AUTO_QUEUE_STATE и релевантные README/DECISIONS/журналы прочитаны. ExecutionUnit: один маршрут максимум, только dnr-гранитное-saint-petersburg-center. STARTED/recovery уже сохранён в предыдущем Раденск checkpoint/WORK_STATE.

## Вход / команда

Существующий corpus.auditEvidence.capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-гранитное-saint-petersburg-center/2026-10-15T11-56-56-059Z-capture.json.gz`, SHA2560493305d255cfc779f4d2b7f15e5c4fb7161b80857f3af75a4c57567a6df3cb1. Selected Valhalla1972786м; не подмешивать другие provider geometry.

`node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt>` выполнен для2026-10-15T09:00:00+03:00 и2026-10-17T09:00:00+03:00. Оба exit0, replayIntegrity.complete=true/missingResponses=[], tariffPolicy=trip-departure-v1/basisAt=departureAt. Это полнота воспроизведения, НЕ полнота тарифа.

## Результаты

| Компонент | 15 октября,09:00МСК | 17 октября,09:00МСК |
| --- | ---: | ---: |
| М-4 m4-911→m4-71 | 3810 | 4640 |
| М-11 15–58 | 1130 | 1650 |
| М-11 58–679 | 3900 | 4200 |
| М-11 679–684 | 94 | 94 |
| ЗСД | unknown | unknown |
| Полный итог | unknown | unknown |

М-4 больше не возвращает m4_crossing_profile_changes: existing exact selected-route vector рассчитывается по отправлению. Audit missing=[zsd],status=unknown. Причина ЗСД `zsd_trip_extends_outside_reviewed_zone1` сохранена; неизвестная цена не стала0 и известные компоненты не выданы за полный итог. Старый live missing=[m4,zsd], его результаты сохранены. Нового source fix для M4 здесь не понадобилось. Текущее исследование не исправляет/не закрывает ZSDfinding и не является overall blocker всего проекта.

Новые output в той же папке runs/dnr-гранитное-saint-petersburg-center/:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T06-36-21-107Z.json`, SHA25639c2478e41f67fc00e4bb754055109437b9fb79461033042a3e281ec423b6f8d.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T06-36-22-168Z.json`, SHA2565efe351da9722baae2432d288a488e4022144a8b57cbcb0f85f10c6cd995149d.

Не fresh live/не независимое подтверждение тарифа/не новая parity с историческим buggy live. Original raw/live/replay/REPORT не переписаны. REPORT SHA256cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e неизменен.

## Проверки / сохранение / NEXT

Runtime после79df66d8 не менялся. Fullgate676/676+quote/API/Next/TS/static16/16, focused23/lint5 — предыдущая19B проверка, не rerun здесь. Для этого docs/evidence-only шага проверяются JSON/links/diff, целевые capture/output hashes, счётчик и unique evaluations. Ошибок команд/replay в текущем шаге не было. Новые файлы+checkpoint+queue/plan/WORK_STATE и append WORK_LOG/NEXT_STEPS сохраняются local commit, GitHub non-force lease, точные blob/tree и remote head readback. Main/merge/Production/Android/сообщений людям нет.

Historical M4 policy проверено4/25, но полные цены только у первых3/4; текущий маршрут остаётся unknownЗСД. NEXT STARTED после durable save: ТОЛЬКО `lnr-брянка-saint-petersburg-center`5/25, capture из corpus.auditEvidence, offline два профиля15/17Oct09:00МСК; inspect integrity/basisAt/M4, не скрывать другие unknown. Затем отдельный checkpoint/commit/head/tree до следующего case. Часть19 in_progress,20 planned; автопродолжение не отключать. Другие категории находок разбирать позже отдельными микрошагами.
