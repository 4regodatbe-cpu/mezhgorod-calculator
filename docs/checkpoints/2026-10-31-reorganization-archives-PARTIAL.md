# Реорганизация B — архивы PARTIAL

31.10.2026 МСК. Исходный рабочий remote `d50445d02ffd4cbdde26c3eff4b030901c2cbd1f`, PR №14 Draft. Точные архивные refs не изменены.

`git archive --format=tar.gz -9` из фиксированных SHA создал три `source.tar.gz`; каждый извлечён `tar -xzf` в чистый отдельный каталог. `verify-version-archive.mjs` сравнил Git blob SHA-1 и SHA256 содержимого каждого файла, число файлов и отсутствие дополнительных файлов, режим executable. Результат:

| Версия | SHA commit | Tree | Файлов | Архив байт | SHA256 архива | Место |
| --- | --- | --- | ---: | ---: | --- | --- |
| legacy V1 | `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9` | `cf29803849b8bdbd83036f7241a6cdf2af4212b7` | 316 | 350346 | `e398abe654526adbb41fd781dbbe1265396564c3531722d5cd2ec9149af0b69b` | `archive/versions/legacy-v1/source.tar.gz` |
| legacy V2 | `64631d23dc7ca44febafb9ebf1136162c7af9e82` | `e56647733e8bce485b018e80696f9e0946c0b706` | 431 | 1427554 | `a183e99f1aad65511e759bafbe796f5f5f22dbe0d1a406311ceba3505668789a` | `archive/versions/legacy-v2/source.tar.gz` |
| pre-release V3 | `cde74243c88cfab313913d8b0435e8d56fae372e` | `c3e6cc8a5a8931952f7a230cc8269d2d41f28bf2` | 14042 | 343730585 | `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87` | LOCAL `/workspace/reorg-handoff-2026-10-31/pre-release-v3-source.tar.gz` |

Полные манифесты содержат file path, mode, Git blob SHA и SHA256. V1/V2 менее 2 МБ и могут находиться в обычном Git. V3 нельзя класть 343-МБ дубликатом в историю; предназначен для отдельного GitHub Release asset. Автоматическая проверка безопасности сначала отклонила `gh release create ...` до выполнения: требовалось явное разрешение на публичную загрузку. Владелец дал отдельное разрешение. Штатная повторная попытка вернула `HTTP 401 Bad credentials` от `uploads.github.com`, exit1; API release ID 430167493 дал 404, tag ref отсутствует. GitHub URL/asset для V3 пока отсутствует. Альтернативный транспорт не применялся. Архив исследований и очистка ещё не выполнялись.

Проверки: `tar` exit0, 316/431/14042 SHA-сопоставления PASS; имена `.env` в tracked trees — только `.env.example`; ограниченный поиск паттернов секретов 0 совпадений. Полный security audit не заявляется. Следующее: сохранить малые архивы/манифесты remote readback, затем независимо определить безопасные исследовательские кандидаты. Ни одного файла активного дерева не удалять до полной доступности восстановления. Повтор V3 upload допустим только после изменения состояния авторизации GitHub upload endpoint.
