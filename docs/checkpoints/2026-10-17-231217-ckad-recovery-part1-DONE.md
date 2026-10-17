# DONE локальной проверки — восстановление ЦКАД, часть 1

Запрос продолжения: 17.10.2026 23:12 МСК. Ветка fix/v3-missing-route-prices-2026-10-15, PR14 open/draft; проверенный remote head5102b44ef5d52865ed36a31302c5b22cd88ace56. Подготовленный исходный commit a9f2bf98106bc798cc3536a7c920cd2c4dbd10a2; parent a666fb4887ea54a328a29fb3bfc2dfa5102e5499.

## Выполнено

Одна ограниченная проверка готовности переноса без нового аудита: git diff --name-only -z parent pending, git cat-file blob и побайтовое сравнение каждого из60 файлов с рабочим каталогом. Для каждого проверены Git blob SHA1 и SHA256; всего1306375 байт. Шесть currentRuntimeHashes совпали; проверены13 frozen source hashes (три исторических исходника прочитаны из sourceCommit, а не из текущего runtime),12 primary OSM raw hashes/status200 и два case file со subtotal5475/fullTrip null/missingm12. Полный перечень путей/blob/SHA256 и результаты — [verification.json](../../experiments/nationwide-tolls/checks/2026-10-17-ckad-save-recovery/verification.json).

Прочитаны сохранённые gzip логи и required-checks.json: записанные focused8/8, audit736/736 и quote/API PASS; tsc/ESLint/build exit0. Это подтверждение наличия прежних результатов, НЕ новые тестовые запуски. Новые tests/routing/trace/primary0. Runtime и тарифы не менялись. Первое утверждение проверочного скрипта ожидало только TAP '# pass'; реальный Node reporter использует 'ℹ pass'. Исправлен только парсер проверки лога, затем верификация PASS. Один probe blob по точному a40cd3ba6757b7704fb8fbe4a858650ad90c3e5e вернул404: его наличие в GitHub не подтверждено, исходный локальный blob доступен и проверен. Предшествующий ошибочный lookup с неполным SHA не используется как evidence.

## Ограничение сохранения

CI39065562352: verify success, live_probe in_progress при подготовке. По WORKFLOW_RULES ветку до terminal run не обновлять и не запускать второго writer; исходный checkout не изменён. Этот checkpoint и manifest готовятся к одному docs-only commit; DONE означает завершение локальной проверки, remote durable устанавливается только non-force commit/readback. Новый post-save CI отдельно. Prepared code a9f2bf всё ещё НЕ сохранён в разрешённой GitHub-ветке.

## Следующая часть

После durable readback этой части: перенести60 готовых файлов поверх актуального remote, сохранив новые правила и обе recovery-записи; отдельно согласовать WORK_STATE/NEXT_STEPS/WORK_LOG, остальное переносить exact blobs. Сохранить per-file progress передачи. Не повторять аудит или pricing replay. Перед записью кода проверить terminal CI и expected head, exact tree/blobs; code CI после сохранения отдельно. Полные тарифы двух поездок остаются unknown из-за М-12.

## Переносимая копия prepared commit

В той же единице восстановления создан pending-ckad.bundle (82729байт): git bundle create PATH fix/v3-missing-route-prices-2026-10-15 ^a666fb4887ea54a328a29fb3bfc2dfa5102e5499; git bundle list-heads и git bundle verify — exit0, head a9f2bf…, prerequisite a666fb48…. SHA256 записан в verification.json. Bundle сохраняет исходный commit,60изменённых файлов и необходимые новые объекты, не включая runtime в текущее рабочее дерево/удалённый calculator. Для восстановления из актуального checkout: git bundle verify PATH; git bundle unbundle PATH (добавляет объекты, не переключает ветку); затем проверить diff a666fb48… a9f2bf… и согласовать перенос поверх текущего head. Не использовать reset/force и не перезаписывать новые правила/журналы. После durable readback архив будет доступен из GitHub и не зависит от прежнего scratch. До readback не считать архив сохранённым.
