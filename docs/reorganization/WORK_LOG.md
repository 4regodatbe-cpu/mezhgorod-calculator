# Реорганизация V1 Release — журнал

## 31.10.2026 — A STARTED

Решение владельца: одна рабочая ветка, четыре неизменяемых release/archive refs, три физические версии и архив исследований; очистка только после проверенного восстановления. Исходный remote `3fa46ce3c62c73610ca8209ae5070819015e5a61`, PR №14 OPEN/Draft. Старая грязная копия не изменялась. Контрольные refs сверены через `git ls-remote`; текущий checkout чист. Далее построить `INVENTORY.json`, проверить его, сохранить A. Production не затрагивать.

## 31.10.2026 — A DONE

`build-inventory.mjs` получил NUL-разделённый tracked-list через stdin и проанализировал 689 исходных текстов. Результат: 14 055 файлов / 402 106 462 байта, 395 файлов с буквальными ссылками; `experiments` 4 545 файлов / 369 236 448 байт. `app/v3` использует компоненты V2, runtime GeoNames зависит от `data/local-settlements`, `lib/v3-calculation` ссылается на `experiments`, CI и test:audit используют их файлы. Dynamic imports/globs остаются пределом анализа: 0 файлов признаны доказанно неиспользуемыми. Первый `node` запуск получил `spawnSync git EPERM`; скрипт переведён на `git ls-files -z | node ... <HEAD>`, повтор exit0. `node --check`, jq-суммы и `git diff --check` PASS; SHA256 INVENTORY `be18104ee6643f81b2a9378043e6d7d3231a22d71174898b9f0c2512c99be572`. Следующее B: три физические архивные версии.
