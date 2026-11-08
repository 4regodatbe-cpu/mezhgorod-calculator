# 2026-10-31 — подготовка архивирования версий

Статус: SAFE SNAPSHOTS / CATALOG DONE; CLEANUP NOT STARTED.

Решение владельца: работающий V3 получает продуктовое имя «V1 Release»; исходный старый алгоритм и ещё две исторические линии должны быть сохранены отдельно. Требуется одна песочница для развития и очистка активного дерева от неиспользуемых разработок после резервного копирования.

Исходный рабочий HEAD: `4eb1d8c28e75028e4ba78eabea1a57ad57638250`; Production код `e3ca3783a8ba9de3271851959eba213bf7a76868`; Production deployment `dpl_E3e6gUCSd9izZ8tKHA9tf85fr115` READY.
GitHub refs созданы без удаления/перезаписи и проверены readback:
- `release/v1-release-2026-10-31` → `e3ca3783a8ba9de3271851959eba213bf7a76868`
- `archive/legacy-v1-before-v2` → `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9`
- `archive/legacy-v2-old-algorithm` → `64631d23dc7ca44febafb9ebf1136162c7af9e82`
- `archive/v3-rc1-before-production` → `cde74243c88cfab313913d8b0435e8d56fae372e`

Инвентаризация: корень репозитория 30 entries; `scripts` 204 файла, `.github/workflows` 73, `experiments` 11 подкаталогов, `lib` 38 файлов и 4 подкаталога, `data` содержит runtime local-settlements. `app/v3/page.tsx` напрямую импортирует компоненты `app/v2/components`; root `app/page.tsx` редиректит на `/v3`. `package.json` test:audit запускает множество `scripts`/`experiments`; `next.config.ts` трассирует `data/local-settlements`. Поэтому перед массовым переносом нужен dependency graph.

Созданы `archive/versions` (индексы и ссылки, а НЕ физически перемещённое дерево) и `sandbox/README.md`. Main/Android/backup/архивные ветки/Production не изменялись. Текущая песочница — старый рабочий branch, GeoNames Preview привязан к нему. Очистка, git bundle и новый полный gate пока NOT RUN. Штатное release/restore/rollback доступно через зафиксированные Git SHA. Перед следующим изменением кода сверить updated remote и возможный локальный Codex checkpoint `06c17540` (не опубликован).

Следующее: в одной комплексной операции в отдельном checkout песочницы построить dependency graph, пакетный архив с проверенным восстановлением, выполнить перенос старого V2 и ненужных экспериментов без изменения публичного API; прогнать обязательные тесты; только затем отдельно обсудить удаление устаревших веток и дальнейшее упрощение истории.
