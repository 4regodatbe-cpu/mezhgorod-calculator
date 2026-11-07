# Восстановление compaction regression

Статус: FAILED — focused run 5 PASS / 1 FAIL. Parent79fb00d, PR14, рабочая ветка fix/v3-missing-route-prices-2026-10-15. Remote79fb00d подтверждён git ls-remote; connector tree совпал с локальным. Прямой git push недоступен из-за отсутствия credentials; используется авторизованный GitHub connector, без смены прав.

Восстановлен смысл шестого IO test из журнала: 3000 paid edges, bounded samples, все exact gates и road families, неизменность raw evidence. Это новая реконструкция, byte-identical восстановление d1357b4 не заявляется. Команда: node --test experiments/nationwide-tolls/systemic-audit-io.test.mjs. Полный вывод docs/checkpoints/evidence/2026-10-15-io-recovery.tap.

Тест сгенерировал wayId0, который helper считает отсутствующим (OSM IDs положительные); ожидание uniqueWays1500 получило1499. Тарифный дефект этим не установлен. git diff --check PASS. Полный build не запускался. Следующий шаг: исправить fixture на положительные way IDs и повторить focused run, сохранив исходный failed log. App/lib/тарифы/Production не менялись.
