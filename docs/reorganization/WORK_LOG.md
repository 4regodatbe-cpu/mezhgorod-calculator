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

## 31.10.2026 — D BLOCKED: удалять нечего без потери гарантий

C сохранён на remote `dba9cdd39ff5ce31e51fd2d6fd535a4faf04f343`, tree/blob readback PASS. Проверены точные импорты `app/v3/page.tsx`, `app/v3/components/use-v3-calculation.ts` → `app/v2/components` и прямые импорты `lib/v3-calculation` → `experiments/nationwide-tolls`, `toll-estimates`, `toll-od-matrix`; package/CI также ссылаются на experiments. У выбранного архивного набора остались исторические документальные ссылки. Большой V3 source asset не размещён из-за upload HTTP401. Доказанного безопасного кандидата для удаления нет, перенос shared компонентов не приносит установленной пользы; 0 перемещено, 0 удалено, рабочий код не менялся. Отдельные refactor/cleanup не начинать до разбора ссылок и полного удалённого восстановления.

## 31.10.2026 — E STARTED

D remote `3248ee40712056ced320d93f86d870d7f8659155` прочитан обратно; test environment Node24.19.0, pnpm11.25.0; новая чистая рабочая копия не содержит node_modules. Проверить frozen install, полный обязательный offline gate, TypeScript, ESLint, отдельный Next build и ограниченные V2/V3/GeoNames сценарии. При локальном EPERM дочернего Node-процесса применить штатный дополнительный sandbox permission либо точно записать NOT_RUN. Не менять runtime ради среды.

## 31.10.2026 — E обязательные gates PASS, браузер/live NOT_RUN

STARTED remote `57138b61240ab06d2886a0ee683e34c804977e65` readback PASS. Первый frozen install exit254: default pnpm store под недоступным `/home/agent`; тот же frozen lockfile с `--store-dir /workspace/reorg-handoff-2026-10-31/pnpm-store` exit0. `pnpm test:audit` через штатный sandbox escalation для child processes exit0, 1067 PASS/0 FAIL/1 SKIP; `pnpm exec tsc --noEmit` exit0; `pnpm lint` exit0, 0 ошибок/7 прежних warnings; `pnpm exec next build` exit0, Next16.3.4, TypeScript и 16 статических страниц, `/v2` и `/v3` в route list. Временный локальный production server с локальным GeoNames opt-in: HTML GET `/v2` и `/v3` HTTP200; 8 городов через POST `/r` HTTP200/localSource=geonames, Донецк ДНР первый и Ростовский вариант присутствует. Первый smoke exit1 только из-за case-sensitive test assertion «Ростовская область» vs реальная «Ростовская Область»; после исправления теста повтор exit0. Тестовый сервер штатно остановлен. Raw логи сохранены в `docs/reorganization/checks/`; runtime diff относительно Production commit e3ca3783 пуст. Новый desktop/mobile браузер и live route NOT_RUN, исторические доказательства source-equivalent UI можно использовать только с явной пометкой. Никаких тарифов/маршрутов/CI не менялось.

## 31.10.2026 — F PARTIAL: итоговая документация

E удалённо сохранён на `5e86ed3b77fe03e691ef139774c16ef739b3bfa8`, README и каталоги обновлены без изменения runtime. Текущий V1 Release source `e3ca3783` и Vercel deployment `dpl_E3e6gUCSd9izZ8tKHA9tf85fr115` READY; main/release/archive/backup refs сверены и не менялись; PR №14 OPEN/Draft. Полный исходный код V3 архивирован и проверен локально, но публичный GitHub asset отсутствует из-за HTTP401 upload endpoint. Research-архив только 61 файл, оригиналы и исторические ссылки сохранены; очистка 0. Точный список стадий, хешей, проверок и блокеров — `FINAL_STATUS.md`. Новый push только в разрешённую рабочую ветку, затем remote tree/path readback; без второго действия на Production.

## 31.10.2026 — V3 hosted archive upload STARTED

Владелец поручил завершить архив и точечную очистку. Remote/local `3e397b3e90d882b799e8102bcd59761774e63b3a` clean, PR14 OPEN/Draft. Файл 343730585 байт, SHA256 d6b77252… проверен. `gh auth status` без раскрытия токена: logged-in `GH_TOKEN` ghu_; прежний uploads.github.com HTTP401 означает, что тот же CLI upload не повторялся. Исследован CI: prior special run 41227796326 verify/classifier SUCCESS, compare e3ca3783→3e397b3e `ahead`/45 только docs+archive. Новый workflow path не является live runtime изменением; classifier fail-open при недостоверных метаданных остаётся возможным. Готовится штатный GitHub-hosted путь с exact source SHA, manifests/byte verification, minimal contents:write и readback, без нового алгоритма/тарифа.
