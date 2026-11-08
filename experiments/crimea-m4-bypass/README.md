# Крым ↔ северная М4: обход Краснодара

Причина: прежняя восточная контрольная точка направляла мимо ДЗОК. Новые controls задают действующий ПВП своей проезжей части. Подробности, ограничения и проверки — WORK_LOG.md; решение пользователя — DECISIONS.md; продолжение — NEXT_STEPS.md.

Собственные raw OSRM ответы сохранены gzip; хеши — capture-manifest.json. Probe JSON содержит точные запросы, расстояния и результаты followsPlan/ПВП. M4 retry trace1/2 — собственные ответы локальных окон той же геометрии; первый partial attempt сохранён отдельно. Полный offline replay имеет2consumed/misses0 и итог2060/2210; это не новая официальная тарифная публикация.

Проверка без сети: node --import ./scripts/register-ts-paths.mjs --test scripts/crimea-m4-bypass.test.ts scripts/crimea-m4-bypass-replay.test.ts scripts/v3-m4-a289-composition.test.mjs
