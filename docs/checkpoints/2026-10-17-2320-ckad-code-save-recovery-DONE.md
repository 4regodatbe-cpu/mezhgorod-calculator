# Восстановление сохранения готового кода ЦКАД

Ветка fix/v3-missing-route-prices-2026-10-15, PR14draft. Expected parent fe5f1fc8bd0986e222cb49a4e906a12005513c65; prepared source a9f2bf98106bc798cc3536a7c920cd2c4dbd10a2/base a666fb48…. Source bundle и60-file manifest durable в fe5f1fc8…;6файлов readback совпали, source CI39065562352 completed/success.

## Перенос

57из60файлов исходного diff перенесены побайтово без изменения;3журнала WORK_STATE/NEXT_STEPS/WORK_LOG согласованы с текущими recovery-записями. Новые AGENTS/WORKFLOW_RULES/CHECKPOINT_PROTOCOL/DECISIONS и checkpoint первой части сохраняются. Исходный DONE21:20 отчёт добавлен как история; его прошлый expected parent a666fb48 не является текущей инструкцией записи. Все runtime-файлы и тарифные данные соответствуют ранее проверенному prepared commit; новый алгоритм не разрабатывался.

Восстановлен directed adapter ЦКАД М-11→М-12 с полным named trace/non-toll connections и49physical witnesses. Два сохранённых выбранных маршрута: компонент ЦКАД981 каждый, subtotal5475 каждый; fullTrip null/missingm12. Цены всей поездки и независимые тарифы не подтверждены. Подробности, случаи и прежние test logs — checks/2026-10-17-ckad-m11-m12; исходный checkpoint docs/checkpoints/2026-10-17-212016-ckad-m11-m12-DONE.md.

## Проверки

Recovery часть1 проверила60exact Git/SHA256,6runtime,13frozen sources,12primary raw и наличие прежних focused8/8, audit736/736,quote/API,TS,ESLint,build exit0. В этой части сверить57exact blob IDs, сохранность правил, отсутствие изменений матрицы/тарифов, ссылки новых checkpoint и git diff --check. Новых live/routing/trace/primary/pricing replay0. Старые тесты не объявлять новыми: новый code CI проверять после non-force сохранения и точного tree/blob/head readback.

## Сохранение и следующий шаг

При подготовке CI39066237658 активен; не обновлять remote до его terminal status. Подготовка и upload blobs могут продолжаться без перемещения branch ref. Поштучный progress сохранять в checks/2026-10-17-ckad-save-recovery/transfer-progress.json. Это одна атомарная единица восстановления сохранения исходного блока: отдельно опубликованные объекты не считаются сохранением кода. После terminal CI/повторного head check один non-force commit на fe5f1fc8… с exact tree/path/head readback. Главную ветку/merge/Production/Android не менять.

NEXT после durable code readback: фактический code CI, затем ограниченная первичная привязка западных рамок М-12 и двух разных выходов по saved nodes10782165529/11214930528/11157985901;2952/1239 без доказательства не назначать. Не повторять74/76/309 и старый аудит ЦКАД.

Фактические проверки переноса:57original exact blobs совпали; новые правила побайтово совпадают с исходным tree fe5f1fc8…. Initial git diff --check обнаружил две лишние пустые строки EOF в согласованных журналах; исправлено только форматирование этих двух документов.58exact payloads (57исходных+новый recovery checkpoint) переданы с проверкой возвращённых Git SHA; per-file append-only journal сохранён по мере ответов. Обновлённый checkpoint и итоговый manifest передаются отдельно; до branch readback код не считается durable.
