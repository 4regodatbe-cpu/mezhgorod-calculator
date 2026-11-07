# Часть2: full build FAILED, восстановление окружения STARTED

16.10.2026. Parent37d3235; рабочая ветка/PR14draft. Команда pnpm build exit1. Лог evidence/2026-10-16-small-parts-02-build.log. Turbopack: Symlink [project]/node_modules is invalid, it points out of the filesystem root. Это ошибка выбранного локального расположения зависимостей, не установленная ошибка расчёта. Full build не пройден. Предшествующий focused3/3 PASS.

Следующее STARTED: заменить только временный symlink node_modules на локальную копию тех же установленных зависимостей, без изменения package/lockfile; повторить pnpm build в отдельный лог evidence/2026-10-16-small-parts-02-build-retry.log. Исходники не откатывать, source checkout другого чата не изменять. После выполнения записать результат и сохранить до следующего шага.
