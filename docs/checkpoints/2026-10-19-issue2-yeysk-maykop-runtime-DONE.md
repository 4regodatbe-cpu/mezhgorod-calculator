# DONE — восстановлен audit runtime, найдены regression controls для issue #2

Дата: 19.10.2026. Ветка `fix/v3-missing-route-prices-2026-10-15`. Исходный head `48e296dc4675cac6a708b28b5eff6e63eb39f966`, tree `4ff77c995a45ed4a60d5ab23a853f75fe9765b73`. PR #14 остаётся open/draft. Actions run `39240195036` для этого head завершён успешно: `verify=success`, `live_probe=success`.

## Восстановление окружения

Расширен sparse checkout каталогами `scripts/`, `lib/`, `app/`, `components/`, `public/`, `data/`; исходное `experiments/nationwide-tolls/` сохранено. `pnpm install --frozen-lockfile` выполнен успешно: lockfile актуален, установлено 429 пакетов; локально Node `v24.19.0`, pnpm `11.25.0`. Tracked working tree чистый, tree по-прежнему `4ff77c995a45ed4a60d5ab23a853f75fe9765b73`. Локальные тесты/build после восстановления не запускались.

## Что найдено по двум OD

- `scripts/segment1-user-regression.mjs` содержит сохранённые regression endpoint controls: Ейск `(46.711524, 38.276451)`, Майкоп `(44.609826, 40.100653)`, Москва `(55.755819, 37.617644)`. В тесте также указаны weekday/weekend ожидания 5 240/7 240 ₽ для Ейск—Москва и 6 090/8 400 ₽ для Майкоп—Москва. Это expectations теста, не независимо подтверждённые полные тарифы.
- `scripts/live-user-route-audit.mjs` содержит те же OD, но короче округляет координаты, фиксирует дату `2026-10-01T12:00:00+03:00` и делает девять запросов. `segment1-user-regression.mjs` также проверяет широкую группу OD и может ждать удалённый preview. Оба runner целиком не запускались: это вызвало бы лишние случаи/трафик.
- В дереве нет сохранённых capture/output JSON для этих двух случаев (по именам файлов и текстовому поиску идентификаторов в JSON под `experiments/`). Найденные regression coordinates являются проектными test controls, но их совпадение с историческими UI-точками issue #2 не доказано.

Новых ручных route/provider запросов, capture или replay в этом блоке — 0. Успешный live probe CI — стандартный workflow run, не специальная проверка Ейск/Майкоп. Матрица, код расчёта и тарифы не менялись.

## Следующий шаг

Подготовить отдельный изолированный runner ровно для двух directed cases по координатам из `segment1-user-regression.mjs`, сохраняя полный вход и raw API response; явно маркировать их project regression controls, а не точным воспроизведением исторического issue. Перед запуском сохранить отдельный STARTED checkpoint. После одного bounded capture на каждое направление выполнить только offline same-date weekday/weekend replay. Не запускать широкие `live-user-route-audit.mjs`, `segment1-user-regression.mjs` или `segment4-m4-geometry-probe.mjs`.
