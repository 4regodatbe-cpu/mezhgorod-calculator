# Задание для внешнего исполнителя по блокерам

24.10.2026. [Текст задания](BRIEF.md), content.json и build_brief.py воспроизводят Word-документ. Статус, SHA256 и идентификатор готового файла: verification.json. Исходные материалы заморожены ссылками на c959bc2; новый исполнитель обязан сверить actual current code и поздние checkpoints. Двенадцать пакетов не являются двенадцатью доказанными ошибками кода.

Документ16страниц,62ссылки: architecture, outage, GeoNames data, UI/freshness, M4pair/km, legacyM4, M11/M12/CKAD/ZSD, nationalcoverage/issue2, performance/environment, acceptance/handoff. Исторические группы отмечены отдельно, маршруты не повторялись. Production/switches/runtime неизменны. Проверки документа: exact refs exist, DOCX ZIP/styles/hyperlinks,16page render и визуальная проверка каждой страницы, no clipping bounds, SHA. Fullcode/liveгейты не запускались.

Для воспроизведения использовать Python с python-docx; render_docx.py из навыка documents для QA. Пользовательский итог сохранён отдельно, DOCX не дублируется бинарным blob в git. Содержимое и генератор сохраняются в разрешённой ветке для будущего продолжения.
