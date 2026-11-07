# Реорганизация C — архив исследований STARTED

31.10.2026 МСК. Рабочий remote `36d2cad23f5b547f58cb5a330b5ad379a7d283b5`, PR №14 OPEN/Draft. Файлы V1/V2 tar.gz и три манифеста уже проверены remote blob readback. V3 archive asset остаётся BLOCKED upload endpoint HTTP401; никаких удалений активного дерева не выполнять.

Кандидат C — два исторических набора `experiments/preview-acceptance` и `experiments/release-candidate-1`, 61 tracked файл в сумме. Поиск буквальных ссылок в `app lib scripts data .github package.json next.config.ts` вернул 0; внутренние зависимости и 14 файлов docs со ссылками сохранены. Отсутствие буквальной ссылки не доказывает глобальную неиспользуемость.

План: создать `archive/research/source.tar.gz` только из этих путей на точном рабочем SHA; извлечь в чистый каталог; сверить каждый Git blob, составить manifest и исследовать последствия переноса. Оригиналы не удалять автоматически. При прерывании продолжить с этого commit, не повторять A/B.
