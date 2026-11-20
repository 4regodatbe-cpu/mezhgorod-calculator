# Реорганизация — следующие шаги

1. A DONE: `INVENTORY.json` и проверка счётчиков сохранены.
2. DONE: разрешение уточнено, A опубликован и прочитан обратно на `264284e3c2bd9626676762d4214a11a51b6cb833`.
3. B DONE: три архива восстановлены и размещены. V3 — отдельный [GitHub prerelease asset](https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/tag/archive-pre-release-v3-source-2026-10-31), 343730585 байт/SHA256 `d6b77252…`, 14042/14042 Git blobs и download/cmp PASS в Actions 41241619408.
4. C PARTIAL: ограниченный исследовательский архив 61 файла сохранён и восстановлен; шесть исторических metadata-файлов можно убрать после индивидуальной проверки, остальные исходные пути оставить из-за ссылок и скриптов. Остальные experiments связаны с runtime/tests/CI.
5. D PARTIAL: точечная очистка только шести восстановимых metadata-файлов. Не переносить весь исторический каталог без сохранения 14 ссылок; не перемещать общие V2-компоненты без доказанной пользы.
6. E: обязательные offline/TS/lint/build и локальные V2/V3/GeoNames smoke PASS; новый desktop/mobile browser и live маршрут NOT_RUN, не считать их новым PASS.
7. F: итоговый `FINAL_STATUS.md`, README, checkpoint, remote readback. Общий статус PARTIAL из-за ограниченной C/D, хотя B завершён.

Критерий DONE каждого пункта — фактические артефакты/проверки, а не наличие README или Git-ссылки.
