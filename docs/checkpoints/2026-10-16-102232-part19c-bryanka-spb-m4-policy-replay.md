# Часть19C — Брянка→СПб, M4 policy5/25: DONE; full total UNKNOWN

16.10.2026 10:22МСК. Только рабочая ветка fix/v3-missing-route-prices-2026-10-15/PR14 open/draft. Remote/PR head6fa74b45e6d8db6059556b2daadab003b551ccde проверен Git+get_pr_info, исходный local/remote tree d6f6b901deaf54fa66abd40b2d3e681c73a6929f совпадал, checkout чист. Job116729992063/run38824450386 completed/success через GitHub; очередь не перезапускалась. AGENTS, WORK_STATE, CHECKPOINT_PROTOCOL, plan/state и релевантные journals/decisions прочитаны. STARTED/recovery уже в предыдущем checkpoint и WORK_STATE. По executionUnit выполнен один маршрут, не группа.

## Вход / команда / результат

Existing corpus.auditEvidence.capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/lnr-брянка-saint-petersburg-center/2026-10-15T11-57-59-642Z-capture.json.gz`, SHA256 bb720239367689bf2c68a22c3c2277cf3c34cd48a80a3d8052464c1f68a71815. Selected Valhalla1827396m; без подмешивания других provider геометрий.

`node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt>` выполнен с2026-10-15T09:00:00+03:00 и2026-10-17T09:00:00+03:00. Оба exit0, replayIntegrity.complete=true/missingResponses=[], trip-departure-v1.basisAt=departureAt.

| Компонент | 15 октября09:00МСК | 17 октября09:00МСК |
| --- | ---: | ---: |
| М-4 m4-911→m4-71 | 3810 | 4640 |
| М-11 15–58 | 1130 | 1650 |
| М-11 58–679 | 3900 | 4200 |
| М-11 679–684 | 94 | 94 |
| ЗСД / полный итог | unknown | unknown |

Audit missing=[zsd],status=unknown, причина zsd_trip_extends_outside_reviewed_zone1. Исторический live missing=[m4,zsd] с m4_crossing_profile_changes. Текущая M4 ошибка не воспроизвелась, нового source fix не нужно; неизвестнаяЗСД не стала0, известные компоненты не выдавались за полный итог. Полнота replay не означает подтверждённый/полный тариф. НепровереннаяЗСД — следующий отдельный класс находок, не глобальная остановка всей работы.

Новые output в той же папке runs/lnr-брянка-saint-petersburg-center/:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T07-22-31-054Z.json`, SHA256 da6ecaffcb5e994f44f514fbee7ef016d26dab043040b086eb4d11643ba5aa23.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T07-22-32-866Z.json`, SHA256 4c12724b78840e9a8b7cbe0ce7027832c357ba859b76219b13b8b882a0b694f5.

Raw/live/старыеreplays/REPORT сохранены. REPORT SHA256 cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e неизменен. Не fresh live, не новая parity с историческим buggy output, не независимая проверка тарифов; priceConfirmation=unconfirmed.

## Проверки / ограничения / сохранение

Расчётный код после79df66d8 не менялся; full676+quote/API/Next/TS/static16/16, focused23/lint5 — предыдущая проверка19B, не rerun здесь. Текущий шаг docs/evidence-only: JSON, links, counts/unique evaluations, diff и hashes проверяются. После успешных replay/инспекции вспомогательный вызов tools.clock__curr_time вернул TypeError:not a function (tool недоступен в текущем наборе); на файлы/расчёт не повлиял. Время записи взято из timestamp новых outputs, ручной повтор расчёта не нужен.

Новый checkpoint/queue/plan/WORK_STATE, append WORK_LOG/NEXT_STEPS и оба новыхreplay сохраняются localcommit+GitHub non-force lease, exactblob/tree и remote headreadback. Новый SHA проверяется после публикации, здесь указан parent. Main/merge/Production/Android/сообщений людям нет.

## NEXT STARTED

Historical M4policy5/25checked: первые3 — полные offline quotes,2СПб — unknownЗСД при исправнойМ4. ТОЛЬКО `zaporizhzhia-пришиб-saint-petersburg-center`6/25: existing capture из corpus.auditEvidence, offline15/17Oct09:00МСК, проверить integrity/M4/basis и не скрывать другиеunknown; отдельный checkpoint/commit/head/tree до следующегоcase. Не запускать309корпус заново. Part19in_progress/20planned, автопродолжение оставить включённым.
