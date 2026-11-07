# Прямое routing разрешение; Бахмут→Казань STARTED

2026-10-16 01:17 МСК. Пользователь ответил «Разрешаю доступ» на точный запрос передачи координат городов/контрольных точек и параметров маршрутов Valhalla, OSRM и BRouter для продолжения текущего аудита. Предыдущий automatic approval blocker снят этим прямым разрешением. GitHub save consent текущего чата также действует.

Parent remote ccb728a67c09525e2467b03c06ed6db7836a3a69. Ветка fix/v3-missing-route-prices-2026-10-15, PR14draft. Продолжение с последнего checkpoint, тесты/build заново без изменений исходников не требуются: предыдущие658/658 и full build PASS сохранены.

STARTED live dnr-бахмут-kazan-center: node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --live dnr-бахмут-kazan-center 2026-10-15T09:00:00+03:00. Stdout evidence/2026-10-16-0117-bakhmut-kazan-live.log с EXIT_CODE. Raw/result в source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-бахмут-kazan-center. После live сохранить capture+checkpoint в GitHub/readback; затем same-date/weekend replay, отдельный checkpoint, затем batch/report/inventory. Unknown не ноль. Main/merge/Production/Android не разрешены.
