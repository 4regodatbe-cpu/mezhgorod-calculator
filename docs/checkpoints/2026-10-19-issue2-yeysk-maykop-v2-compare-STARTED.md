# STARTED — bounded V2 comparison для Ейск/Майкоп proxy-controls

Дата: 19.10.2026. Основание: завершённый V3 proxy capture/replay checkpoint `2026-10-19-issue2-yeysk-maykop-v3-capture-replay-DONE.md`. PR #14 остаётся draft.

`segment1-user-regression.mjs` содержит те же координаты и ожидаемые weekday/weekend bands, но выполняет запрос к `/api/v2/calculate`. V3 результаты уже сохранены; сравнение разных endpoint напрямую невалидно. Цель блока — изолированно зафиксировать фактический V2 ответ для двух project proxy cases без запуска широкого runner.

## Inputs и предел

Ровно один own V2 `POST /api/v2/calculate` на Ейск→Москва `(46.711524,38.276451)→(55.755819,37.617644)` и Майкоп→Москва `(44.609826,40.100653)→(55.755819,37.617644)`; `mode=standard`, `departureAt=2026-10-22T09:00:00+03:00`. Сохранить полные requests, raw API responses и все реальные HTTP fetch responses. Не больше двух завершённых API вызовов, sequential, без toll-avoid alternatives и широких regressions.

После capture отдельным блоком сделать offline replay этих же calls на четверг и субботу `2026-10-24T09:00:00+03:00`; live network=0, replay misses=0, unused responses=0. Старые assertions сравнивать только с фактическим V2 результатом и всё ещё считать тестовыми ожиданиями, не операторскими tariffs. Не менять код, матрицу или тарифные числа. Если capture/replay заблокирован — сохранить точный статус и перейти к следующему безопасному пункту.
