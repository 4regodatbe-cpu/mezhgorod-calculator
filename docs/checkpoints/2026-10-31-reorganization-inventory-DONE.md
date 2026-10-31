# Реорганизация A — инвентарь DONE

Дата: 31.10.2026 МСК. Исходный remote `320c50d4a07b4f2b122d2de3f4ee2f6b4134d591`, PR №14 Draft. Файлы: `docs/reorganization/build-inventory.mjs`, `INVENTORY.json`, `WORK_LOG.md`, `NEXT_STEPS.md`, `docs/WORK_STATE.md`.

Команда: `git ls-files --cached -z | node docs/reorganization/build-inventory.mjs 320c50d4a07b4f2b122d2de3f4ee2f6b4134d591` — exit0. Tracked 14 055 файлов / 402 106 462 байта; 689 сканируемых кодовых/CI текстов; 395 точных литеральных целевых файлов. SHA256 `INVENTORY.json`: `be18104ee6643f81b2a9378043e6d7d3231a22d71174898b9f0c2512c99be572`.

Проверки `node --check`, jq равенства сумм категорий/итога и `git diff --check` PASS. Первый запуск через `execFileSync('git')` вернул `spawnSync git EPERM`; скрипт переведён на подачу списка по stdin, без ослабления sandbox. Анализ литеральных путей не доказывает отсутствие динамических зависимостей и glob; все 11 каталогов experiments требуют отдельного review. Кандидатов на удаление пока 0. Тарифы, алгоритмы и runtime не изменялись.

Следующее: B — оценить размер каждого SHA, создать физические архивы и проверить извлечение/сопоставление до любой очистки. Наличие веток не является полноценным физическим архивом.
