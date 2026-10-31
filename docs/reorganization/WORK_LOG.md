# Реорганизация V1 Release — журнал

## 31.10.2026 — A STARTED

Решение владельца: одна рабочая ветка, четыре неизменяемых release/archive refs, три физические версии и архив исследований; очистка только после проверенного восстановления. Исходный remote `3fa46ce3c62c73610ca8209ae5070819015e5a61`, PR №14 OPEN/Draft. Старая грязная копия не изменялась. Контрольные refs сверены через `git ls-remote`; текущий checkout чист. Далее построить `INVENTORY.json`, проверить его, сохранить A. Production не затрагивать.

## 31.10.2026 — A DONE

`build-inventory.mjs` получил NUL-разделённый tracked-list через stdin и проанализировал 689 исходных текстов. Результат: 14 055 файлов / 402 106 462 байта, 395 файлов с буквальными ссылками; `experiments` 4 545 файлов / 369 236 448 байт. `app/v3` использует компоненты V2, runtime GeoNames зависит от `data/local-settlements`, `lib/v3-calculation` ссылается на `experiments`, CI и test:audit используют их файлы. Dynamic imports/globs остаются пределом анализа: 0 файлов признаны доказанно неиспользуемыми. Первый `node` запуск получил `spawnSync git EPERM`; скрипт переведён на `git ls-files -z | node ... <HEAD>`, повтор exit0. `node --check`, jq-суммы и `git diff --check` PASS; SHA256 INVENTORY `be18104ee6643f81b2a9378043e6d7d3231a22d71174898b9f0c2512c99be572`. Следующее B: три физические архивные версии.

## 31.10.2026 — сохранение A BLOCKED

Локальный A commit `4059eb6892999cda17d74428180232045d9cf048` чист, blob `INVENTORY.json` совпал при readback (`c25147c522f3709739d69c667c555394a8024001`). Auto-review отклонил команду, содержавшую второй remote push: сочтено, что ранее было разовое разрешение, а новое разрешение неясно. Не повторяли запись через иной транспорт. Remote/PR read-only: `320c50d4...`, OPEN/Draft. Локальный bundle и patch сохранены; этапы B–F не начинались.

## 31.10.2026 — A remote DONE, B STARTED

Владелец явно разрешил многократные обычные fast-forward push. Проверены clean local `264284e3`, ancestry от `320c50d4`, remote/PR/отсутствие активного CI. Обычный push exit0; remote HEAD `264284e3c2bd9626676762d4214a11a51b6cb833`, tree `a5f681db3dc0ae0e530484f244acce5fa7e9aec7`, blob INVENTORY `c25147c522f3709739d69c667c555394a8024001` совпали. Следующее: архивы из точных refs, без изменения release/archive refs. Один недоступный объект legacy V1 будет загружен штатным Git после сетевого разрешения; прочие два доступны локально.
