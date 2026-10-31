# Реорганизация V1 Release — журнал

## 31.10.2026 — A STARTED

Решение владельца: одна рабочая ветка, четыре неизменяемых release/archive refs, три физические версии и архив исследований; очистка только после проверенного восстановления. Исходный remote `3fa46ce3c62c73610ca8209ae5070819015e5a61`, PR №14 OPEN/Draft. Старая грязная копия не изменялась. Контрольные refs сверены через `git ls-remote`; текущий checkout чист. Далее построить `INVENTORY.json`, проверить его, сохранить A. Production не затрагивать.

## 31.10.2026 — A DONE

`build-inventory.mjs` получил NUL-разделённый tracked-list через stdin и проанализировал 689 исходных текстов. Результат: 14 055 файлов / 402 106 462 байта, 395 файлов с буквальными ссылками; `experiments` 4 545 файлов / 369 236 448 байт. `app/v3` использует компоненты V2, runtime GeoNames зависит от `data/local-settlements`, `lib/v3-calculation` ссылается на `experiments`, CI и test:audit используют их файлы. Dynamic imports/globs остаются пределом анализа: 0 файлов признаны доказанно неиспользуемыми. Первый `node` запуск получил `spawnSync git EPERM`; скрипт переведён на `git ls-files -z | node ... <HEAD>`, повтор exit0. `node --check`, jq-суммы и `git diff --check` PASS; SHA256 INVENTORY `be18104ee6643f81b2a9378043e6d7d3231a22d71174898b9f0c2512c99be572`. Следующее B: три физические архивные версии.

## 31.10.2026 — сохранение A BLOCKED

Локальный A commit `4059eb6892999cda17d74428180232045d9cf048` чист, blob `INVENTORY.json` совпал при readback (`c25147c522f3709739d69c667c555394a8024001`). Auto-review отклонил команду, содержавшую второй remote push: сочтено, что ранее было разовое разрешение, а новое разрешение неясно. Не повторяли запись через иной транспорт. Remote/PR read-only: `320c50d4...`, OPEN/Draft. Локальный bundle и patch сохранены; этапы B–F не начинались.

## 31.10.2026 — A remote DONE, B STARTED

Владелец явно разрешил многократные обычные fast-forward push. Проверены clean local `264284e3`, ancestry от `320c50d4`, remote/PR/отсутствие активного CI. Обычный push exit0; remote HEAD `264284e3c2bd9626676762d4214a11a51b6cb833`, tree `a5f681db3dc0ae0e530484f244acce5fa7e9aec7`, blob INVENTORY `c25147c522f3709739d69c667c555394a8024001` совпали. Следующее: архивы из точных refs, без изменения release/archive refs. Один недоступный объект legacy V1 будет загружен штатным Git после сетевого разрешения; прочие два доступны локально.

## 31.10.2026 — B PARTIAL: три локальных восстановимых архива

Штатный `git fetch --filter=blob:none` загрузил отсутствующий точный legacy V1 commit, без изменения remote archive ref. `git archive --format=tar.gz -9` создал три физические дерева; `tar -xzf` в чистые каталоги и `verify-version-archive.mjs` сравнили каждый файл с Git blob SHA и проверили отсутствие посторонних файлов. Legacy V1: 316 файлов, 350 346 байт, SHA256 `e398abe654526adbb41fd781dbbe1265396564c3531722d5cd2ec9149af0b69b`; V2: 431, 1 427 554, `a183e99f1aad65511e759bafbe796f5f5f22dbe0d1a406311ceba3505668789a`; V3: 14 042, 343 730 585, `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`. Манифесты включают SHA256 каждого файла. Скан имён .env: только `.env.example`; поиск известных токеновых паттернов в извлечённом V3 не нашёл совпадений (это не полный секретный аудит). Автоматическая проверка безопасности отклонила создание публичного GitHub prerelease asset 343 МБ, указав недостаточно явное разрешение на публикацию/видимость полного архива; альтернативный транспорт не использовался, запрошено отдельное решение владельца. Малые V1/V2 и все манифесты сохраняются в ветке; крупный V3 остаётся только локальным до решения.

Владелец ответил отдельным явным разрешением. Повторная штатная попытка `gh release create` не была отклонена auto-review, но upload endpoint вернул `HTTP 401: Bad credentials (https://uploads.github.com/.../releases/430167493/assets)`, exit1. `gh release view` и GitHub releases API подтвердили отсутствие release/asset, `git ls-remote --tags` — отсутствие нового тега: частичной публикации не осталось. Не повторять тот же upload с неизменной авторизацией и не переносить 343-МБ архив в обычную Git-историю.

## 31.10.2026 — B remote readback PASS; C STARTED

Обычный push B на `36d2cad23f5b547f58cb5a330b5ad379a7d283b5` exit0. Remote tree `07a7945f9cf2141eb00c2d3f4afe76adfabb5ae9`; GitHub blob SHA двух tar.gz и трёх manifest.json совпали с локальным Git. PR №14 OPEN/Draft. Для C ограничены исторические папки `experiments/preview-acceptance` и `experiments/release-candidate-1` (61 файл): `rg` по app/lib/scripts/data/.github/package/next.config не нашёл буквальных ссылок, но в docs есть 14 ссылающихся файлов, а внутри кандидатов есть скрипты. Поэтому сейчас только физический архив/манифест и восстановление, удаление требует отдельного доказательства сохранения ссылок.

## 31.10.2026 — C PARTIAL: исследовательский архив создан и восстановлен

`git archive --format=tar.gz -9 -o archive/research/source.tar.gz HEAD experiments/preview-acceptance experiments/release-candidate-1` на HEAD `4c5edd35`; `tar -xzf` в чистую директорию и проверка 61 Git blob SHA PASS. Архив 770 737 байт, SHA256 `2a89b241ae97059d5cd54f2cd9c8ea9a5cedfe49653672fb12ad1ef1d267d411`, исходные файлы 2 380 251 байт. Manifest содержит индивидуальные SHA256 и byte size. Оригиналы оставлены: ссылки из 14 исторических документов сохраняют текущие пути. Это ограниченный архив, не все 4 545 файлов `experiments` и не завершённая очистка.
