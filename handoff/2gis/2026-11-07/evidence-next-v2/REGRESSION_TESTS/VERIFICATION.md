# Проверки 07.11.2026

- Новый policy overlay:11/11 PASS. Различает working и receipt,unknown, неполноту, чужую ветвь, повторное начисление, историческую дату и scope CKAD/Pulkovo.
- Неизменный исторический M4 route-history:11/11 PASS. Исторический null остаётся историей, policy overlay добавляется отдельно.
- Неизменный M12 mapping verifier:PASS.
- Все файлы HISTORICAL_V1 побайтно совпадают с v1:PASS.
- SHA PDF Order56 совпал с binding-proof:839488fed07f8e611b5304498f22d49626ff0dc7529df67734a2052a49bea3e7.
- SHA PDF Order274 совпал с source record:6b52ca130ee7e8a7948c2b39982c00d82174e4e45ec5dcd3983355238c403b91.

Это offline evidence checks, не тест действующего runtime и не подтверждение списаний. API запросов0; новый внешний источник не загружался. Manifest/архив проверяются отдельно скриптом verify_package.py.
