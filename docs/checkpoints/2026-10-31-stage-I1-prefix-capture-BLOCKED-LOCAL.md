# Stage I1 — prefix capture BLOCKED, локальное сохранение

31.10.2026, 17:50 МСК. Source `5600384e90d632f3f3bd0bf3e465013bb4fb87f9`; линия разрешённой ветки, PR №14 Draft. Только локально, push запрещён.

Команда: `NODE_USE_ENV_PROXY=1 GEONAMES_LOCAL_PILOT=0 node --import ./scripts/register-ts-paths.mjs experiments/address-search/stage-i-2026-10-31/capture-snapshot.mjs <sourceSHA>` с штатным дополнительным разрешением сети; exit **2**.

Донецк: HTTP 200, 1848 мс, оба исходных ID и координаты присутствуют; один Photon 503. «Красн»: HTTP 200, 814 мс, Краснодар отсутствует; пять 503 и один cooldown. Ответы частичные. Третий запрос не запускался. Exact body/status/time/sourceSHA и SHA256: [review](../../experiments/address-search/stage-i-2026-10-31/capture-review.json), рядом отдельные capture JSON. Это реальные ответы локального GET handler + Photon, **не Preview** и не моки. Старый snapshot, срок, CI и runtime-флаг не изменены.

Следующий шаг STARTED: один ограниченный follow-up **других, точных запросов** «Краснодар» и «Ростов-на-Дону» вместо префиксов. Причина — неполная prefix-выдача не доказывает недоступность точного города. Максимум два по 20 секунд, остановка при первой неудаче, отдельные файлы и защита от повторного запуска. Это не массовый аудит. При неудаче B03 остаётся BLOCKED; далее offline-разбор Photon.

Сохранение — локальный commit/readback/bundle; новые результаты не в GitHub.
