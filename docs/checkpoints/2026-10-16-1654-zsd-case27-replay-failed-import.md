# ZSD case 27 replay — FAILED / import path

Статус: FAILED, 16.10.2026 16:54 МСК. Ветка `fix/v3-missing-route-prices-2026-10-15`, draft PR 14, исходный remote/head `76f06b2207b2d73d95b865513a11cb32ed6e93e3`.

Для `pair-m11-zsd-moscow-to-prim` начат первый из двух offline replay сохранённого capture `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-zsd-moscow-to-prim/2026-10-16T00-05-39-475Z-capture.json.gz` на `2026-10-15T09:00:00+03:00`. Процесс завершился до чтения capture с exit 1: указан ошибочный import `./experiments/nationwide-tolls/scripts/register-ts-paths.mjs`; фактический файл находится в `./scripts/register-ts-paths.mjs`. Новый replay/evidence не создан, тарифный результат не менялся.

Следующий шаг: повторить ровно этот случай с правильным `node --import ./scripts/register-ts-paths.mjs`, затем профиль `2026-10-17T09:00:00+03:00`; сохранить оба результата и сравнить полный набор ZSD ways и упорядоченные booth IDs. Общий прогресс остаётся 90% = 18/20 полностью завершённых частей; это не покрытие тарифов. ZSD review остаётся 26/76.
