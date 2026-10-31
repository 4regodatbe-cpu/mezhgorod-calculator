# Реорганизация V1 Release — итог 31.10.2026

**Статус: PARTIAL.** Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`, PR №14 OPEN/Draft. V1 Release Production остаётся на `e3ca3783a8ba9de3271851959eba213bf7a76868`, deployment `dpl_E3e6gUCSd9izZ8tKHA9tf85fr115` READY. Main, Android, backup, release и три archive refs не изменены. Merge/force/deploy не выполнялись.

## Реально построено

| Раздел | Источник | Файлов | source.tar.gz | SHA256 | Восстановление | Размещение |
| --- | --- | ---: | ---: | --- | --- | --- |
| legacy V1 | `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9` | 316 | 350346 Б | `e398abe654526adbb41fd781dbbe1265396564c3531722d5cd2ec9149af0b69b` | 316/316 Git blobs PASS | GitHub рабочая ветка |
| legacy V2 | `64631d23dc7ca44febafb9ebf1136162c7af9e82` | 431 | 1427554 Б | `a183e99f1aad65511e759bafbe796f5f5f22dbe0d1a406311ceba3505668789a` | 431/431 PASS | GitHub рабочая ветка |
| pre-release V3 | `cde74243c88cfab313913d8b0435e8d56fae372e` | 14042 | 343730585 Б | `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87` | 14042/14042 PASS | **Локально; GitHub asset BLOCKED** |
| research-selected | рабочий SHA `4c5edd3582ff887b08c39e30a2ded007b336c821` | 61 | 770737 Б | `2a89b241ae97059d5cd54f2cd9c8ea9a5cedfe49653672fb12ad1ef1d267d411` | 61/61 PASS | GitHub рабочая ветка |

Все исходники экспортированы из отслеживаемого Git-дерева. Распаковка каждого выполнена в чистый отдельный каталог; `verify-version-archive.mjs` проверил байты против точных Git blob SHA, режимы файлов и отсутствие лишних файлов. Манифесты содержат SHA256 каждого файла. Архив V3 локально: `/workspace/reorg-handoff-2026-10-31/pre-release-v3-source.tar.gz`. Пользователь отдельно разрешил публичный GitHub Release asset; `gh release create` получил `HTTP 401 Bad credentials` от `uploads.github.com`. Сбой не оставил release, tag или asset. Повтор с неизменной авторизацией не выполнялся, большой архив не помещался в обычную Git-историю.

Инвентарь A: 14 055 отслеживаемых файлов / 402 106 462 байта, 689 просмотренных кодовых/CI текстов, 395 целевых файлов с литеральными ссылками. Он не доказывает отсутствие всех динамических зависимостей. Исследовательский архив охватывает только две исторические папки: `experiments/preview-acceptance` и `experiments/release-candidate-1`; остальные experiments включают runtime, CI и тестовые зависимости. Из активного дерева перемещено **0** файлов и удалено **0**; уменьшение размера **0 байт**. Ссылки 14 исторических документов и неполный удалённый V3 архив не дают честно объявить очистку завершённой. Дополнительные копии увеличили размер репозитория; историю Git не переписывали.

## Проверки текущей версии

[Машинная сводка](checks/RESULTS.json) и raw логи лежат в `checks/`. Node 24.19.0, pnpm 11.25.0, Next 16.3.4. Frozen install exit0 с доступным workspace store (первый запуск с default `/home/agent` получил exit254). `pnpm test:audit`: **1067 PASS, 0 FAIL, 1 SKIP**, exit0. `pnpm exec tsc --noEmit`: exit0. `pnpm lint`: exit0, 0 errors/7 warnings. `pnpm exec next build`: exit0. Локальная production-сборка вернула HTML200 для `/v2` и `/v3`, а `/r` — HTTP200/GeoNames для восьми городских запросов с подтверждённой первичной выдачей Донецка ДНР. Первый smoke assertion упал из-за регистра написания региона в самом тесте; исправленный тест exit0. Новый desktop/mobile браузер и live расчёт маршрута в этом этапе **NOT_RUN**; прежние browser-evidence соответствуют неизменённому UI, но не считаются новым запуском. Runtime пути `app`, `components`, `lib`, `data`, `scripts`, конфигурация и CI без diff относительно утверждённого Production source SHA.

Raw build-лог содержит обычный deprecation `preferredRegion`. Сохранённые без редакции stdout имеют пробельные окончания строк; поэтому `git diff --check` для commit с логами выдаёт предупреждения на raw evidence. Это не ошибка приложения и не было объявлено PASS проверки whitespace. Секреты не обнаружены ограниченным поиском известных токеновых шаблонов; это не полный секретный аудит.

## Следующие конкретные условия

1. Исправить авторизацию GitHub Release upload endpoint `uploads.github.com` (CLI API-доступ и обычный push работают, asset upload — HTTP401), затем разместить **тот же проверенный** V3 архив как prerelease asset и проверить размер/хеш скачанного файла. Нельзя заменять GitHub URL локальным файлом или Git-веткой.
2. Для дополнительных исследований составить точные доказательства неиспользуемости и план сохранения исторических ссылок. Только после удалённого архивного восстановления удалить конкретные файлы и повторить gates. При отсутствии доказанных лишних файлов оставить их на месте.
3. Production/main/Android/backup/release/archive refs не менять. Песочница остаётся одна — разрешённая рабочая ветка.
