# Лисичанск → Москва: offline recovery

DONE. Parent fbd53425e69e5e8fb57ae15e43d338f0ec66b85f remote read-back подтверждён, local/remote tree совпадают. PR14draft, ветка fix/v3-missing-route-prices-2026-10-15.

Source: raw2026-10-15T12-03-20-913Z-capture.json.gz, SHA25654f90ef278e0bca47313503419ccba018eb3362c8ae6dc25a51d0a1e6e4d51d9. Команда node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt> выполнена на2026-10-15T09:00:00+03:00 и2026-10-17T09:00:00+03:00 в рамках восстановления одного route case. Обе exit0, replayIntegrity.complete=true, missingResponses=[], traceComplete=true, OSRM937773m.

Обе tolls structures точно совпали с historic batch weekday/weekend: amountnull, причина m4_endpoint_matrix_missing-current-exact-fare. Это воспроизводимый unknown, не бесплатный маршрут и не подтверждённый тариф. Сохранены2replayJSON,2stdout и recovery-summary.json сSHA. Raw не менялся. Исходный live summary утрачен; восстановленный offline summary не подменяет его и не повышает audited26 до27. Оригинальные missing ссылки и исторические manifests не переписаны.

До этого build656/656+quote/API/Next/types/static16PASS; после этого code не менялся, build повторно не запускался. git diff --checkPASS. При публикации build log checksum выявил CR/LF нормализацию текстовым чтением; передача заменена чтением binary/base64, blob/treeSHA после переноса совпали, remote commit fbd5342проверен. Неверный blob к ветке не привязывался.

Следующий шаг: отдельным STARTED checkpoint выбрать первый из13утраченныхraw по availability, выполнить один live route +same-date/weekend replay и немедленно закрепить в GitHub до следующего маршрута. Не запускать массовый runner без remote checkpoint между случаями. Продолжать audit findings до обсуждения цен; app/lib/тарифы/Production не менялись.
