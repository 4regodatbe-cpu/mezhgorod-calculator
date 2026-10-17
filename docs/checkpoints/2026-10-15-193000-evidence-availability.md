# Наличие evidence после обрыва

Статус DONE. Parent eca105e5377442c8c86399f668c51aac88c2edc9 подтверждён remote read-back; PR14 draft, fix/v3-missing-route-prices-2026-10-15.

Добавлен воспроизводимый read-only inventory scripts/audit-evidence-availability.py и EVIDENCE_AVAILABILITY.json/.md в systemic-road-audit-2026-10-15. Команда python experiments/nationwide-tolls/scripts/audit-evidence-availability.py проверяет все160 corpus routes, batch references, raw gzip/JSON, SHA256 и совпадение blobSHA с recovery manifest.

Результат: DNR10 raw/10 полных комплектов, Kherson10/10, LNR7/6, Zaporizhzhia0/0. Всего29raw файлов в27каталогах OD (включая повторные captures); повреждённых0. В исторически исполненных40региональных случаях отсутствует13raw. Найдено55уникальных отсутствующих referenced files. Эти числа описывают наличие, не новую проверку parity/тарифа; corpus historical statuses не перезаписаны. Полный список точных путей/SHA в JSON. git diff --check PASS. Live calls и pricing replay этим шагом не запускались.

Следующий шаг: сводный report должен переживать отсутствующий файл и отдельно учитывать evidence availability, не переносить старые audited counters в подтверждённое покрытие. Затем восстановление missing summary/replay из существующих raw по одному случаю с отдельным сохранением; missing13raw повторить live. App/lib/тарифы/Production не менялись.
