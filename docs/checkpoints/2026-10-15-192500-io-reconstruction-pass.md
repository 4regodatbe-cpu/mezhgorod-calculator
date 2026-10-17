# Compaction regression — положительные OSM IDs

Статус DONE. Parent b1bfbedbfc36fcbe693da9e0dba2b3f98aee6e44 подтверждён remote read-back. PR14, ветка fix/v3-missing-route-prices-2026-10-15.

Исправлен только fixture wayId i → i+1; production helper не менялся. Проверяются 3000 paid edges, все exact gate records, сохранение road coverage, bounded samples и неизменность raw input. Это смысловое восстановление, не исходный SHA потерянного теста.

node --test experiments/nationwide-tolls/systemic-audit-io.test.mjs: 6/6 PASS. Вывод docs/checkpoints/evidence/2026-10-15-io-recovery-positive-ids.tap. Предыдущий failed log сохранён. git diff --check PASS. Полный build не запускался: отсутствуют установленные зависимости, gate остаётся открытым; unit PASS не доказывает тарифную правильность.

STARTED следующий шаг: построить availability index по corpus/batch manifest, проверить существование, gzip/JSON и SHA raw captures и ссылки summary/replay. Только чтение исходных captures, вывод отдельным JSON/MD; отсутствующие файлы не засчитывать. Повтор безопасен; сетевые маршруты пока не запрашивать. После этого чинить отчёт/ссылки и восстанавливать summary/replay по одному.
