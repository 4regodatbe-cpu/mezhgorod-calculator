# Реорганизация «Из А в Б»: итоговое состояние на 01.11.2026

**Вердикт: АРХИВИРОВАНИЕ ЗАВЕРШЕНО; ФИЗИЧЕСКАЯ ОЧИСТКА ЧАСТИЧНА И ОТЛОЖЕНА.**

Это актуальная сводка, заменяющая устаревший статус до размещения архива V3. История попытки `HTTP 401`, промежуточные решения и необработанные логи сохранены в Git/checkpoints; **действующего блокера загрузки архива V3 больше нет**.

## 1. Состояние продукта и Git

- Рабочая ветка: `fix/v3-missing-route-prices-2026-10-15`; контрольный HEAD до настоящего документального закрытия: `461e342522a154b5124a7acb09281e3018494257`.
- PR №14: OPEN / Draft, не слит.
- Продуктовое имя стабильной версии: **V1 Release**. Не путать с историческим legacy V1. Неизменяемый снимок: `release/v1-release-2026-10-31` → `e3ca3783a8ba9de3271851959eba213bf7a76868`.
- Публичный Production: [mezhgorod-calculator.vercel.app](https://mezhgorod-calculator.vercel.app); Vercel `dpl_E3e6gUCSd9izZ8tKHA9tf85fr115`, READY, исходный SHA `e3ca3783a8ba9de3271851959eba213bf7a76868` по последней отдельной проверке.
- Main, Android, backup, release и архивные ветки не менялись; merge, force push и Production deploy при архивировании не выполнялись. Рабочая песочница остаётся одна: `fix/v3-missing-route-prices-2026-10-15`.

## 2. Архивы: фактически доступны и проверены

| Архив | Git source SHA | Файлов | Размер сжатого архива | SHA256 | Восстановление | Местонахождение |
| --- | --- | ---: | ---: | --- | --- | --- |
| Legacy V1 | `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9` | 316 | 350 346 Б | `e398abe654526adbb41fd781dbbe1265396564c3531722d5cd2ec9149af0b69b` | 316/316 PASS | [archive/versions/legacy-v1](../../archive/versions/legacy-v1/) в GitHub |
| Legacy V2 | `64631d23dc7ca44febafb9ebf1136162c7af9e82` | 431 | 1 427 554 Б | `a183e99f1aad65511e759bafbe796f5f5f22dbe0d1a406311ceba3505668789a` | 431/431 PASS | [archive/versions/legacy-v2](../../archive/versions/legacy-v2/) в GitHub |
| Pre-release V3 | `cde74243c88cfab313913d8b0435e8d56fae372e` | 14 042 | 343 730 585 Б | `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87` | 14 042/14 042 PASS | [отдельный GitHub prerelease](https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/tag/archive-pre-release-v3-source-2026-10-31) |
| Research-selected (два каталога) | `4c5edd3582ff887b08c39e30a2ded007b336c821` | 61 | 770 737 Б | `2a89b241ae97059d5cd54f2cd9c8ea9a5cedfe49653672fb12ad1ef1d267d411` | 61/61 PASS | [archive/research](../../archive/research/) в GitHub |

Для V3 GitHub Release asset `source.tar.gz` имеет подтверждённый статус `uploaded`, размер **343 730 585 Б**, digest `sha256:d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`. [Actions run 41241619408](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41241619408) SUCCESS: исходные 14 042 Git blobs, загрузка и последующая скачанная побайтовая копия проверены. Штатный `GITHUB_TOKEN` GitHub runner разрешил прежний блокер `uploads.github.com` HTTP 401; новый пользовательский токен и обход защиты не использовались. Файл [можно получить напрямую](https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/download/archive-pre-release-v3-source-2026-10-31/source.tar.gz).

Архив `research-selected` охватывает только `experiments/preview-acceptance` и `experiments/release-candidate-1`; это **не** заявление, что все остальные эксперименты удалены или не используются. Отдельные архивные Git refs сохраняют точные исходные снимки.

## 3. Инвентаризация и безопасная очистка

- Инвентарь A до добавления архивов: **14 055 отслеживаемых файлов, 402 106 462 байта**; исследованы исходники/CI и литеральные ссылки. Это не доказывает отсутствие динамических зависимостей.
- Из активного дерева удалены **ровно 6 исторических metadata-файлов**, суммарно **17 957 байт**:
  `actions-before.json`, `numstat-before.txt`, `paths-before.txt`, `pr-before.json`, `production-before.json`, `remote-before.txt` из `experiments/release-candidate-1/2026-10-31/publication/`.
- Все шесть предварительно восстановлены из `archive/research/source.tar.gz` и побайтово сравнены (6/6 PASS). `preflight.json`, другие 55 файлов архивной подборки и всё используемое приложение сохранены.
- **Другие файлы не удалены и не перемещены**. Остальная очистка намеренно отложена: V3 использует `app/v2/components`, часть `experiments` нужна для runtime, CI и тестов, а исторические документы ссылаются на прежние пути.
- Уменьшение текущего активного дерева от этих шести файлов: **17 957 байт**. Полная Git-история не уменьшилась; новые архивы дополнительно занимают место. Не следует выдавать это за значительную экономию объёма репозитория.
- Не выполнять массовое удаление ради числа файлов: будущий перенос требует новых доказательств отсутствия зависимостей, сохранения ссылок и проверенного восстановления.

## 4. Проверки и пределы доказательств

Проверка исходников реорганизации: Node 24.19.0, pnpm 11.25.0, Next 16.3.4.

- `pnpm install --frozen-lockfile` — PASS с доступным workspace store (первый запуск на недоступном default store завершился ошибкой окружения exit254).
- `pnpm test:audit` — **1067 PASS, 0 FAIL, 1 SKIP**.
- `pnpm exec tsc --noEmit` — PASS.
- `pnpm lint` — exit 0; 7 предупреждений, 0 ошибок.
- `pnpm exec next build` — PASS.
- Локально `/v2` и `/v3` — HTTP 200, восемь городских запросов обработаны GeoNames. Первая локальная smoke-проверка имела ошибку регистрозависимого assertion; исправленная завершилась PASS.
- После публикации узкого архивного workflow: [run 41241626048](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41241626048) и [B03 41241625888](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41241625888) — SUCCESS. Для последнего HEAD `461e342522a154b5124a7acb09281e3018494257` отдельные [Special Territory 41248391619](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41248391619) и [B03 41248391613](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41248391613) — SUCCESS.
- Новый desktop/mobile browser и новые live расчёты маршрутов **NOT_RUN** на этапе реорганизации. `live_probe`/`calculation_timing` в указанном CI-прогоне были SKIPPED. Не приравнивать моковые тесты или сохранённые browser evidence к новой live-проверке.
- Runtime и тарифные файлы не менялись относительно зафиксированного Production source; текущее документальное закрытие не запускало новых тестов, так как не меняет код.

## 5. Закрытие этапа и будущая работа

**Архивирование трёх версий и выбранных исследовательских материалов — DONE.** Проверяемая безопасная очистка шести файлов — DONE. **Массовая очистка — DEFERRED, не DONE.** Это сознательное решение во избежание регрессий, а не потерянная работа.

Дальнейшие улучшения интерфейса вести отдельными задачами в действующей единственной песочнице. Возвращаться к другим перемещениям только при наличии конкретного доказанного неиспользуемого набора файлов либо необходимости архитектурной переработки. Production и release refs не трогать без отдельного разрешения.

Прежний блокер 401 и более старый статус PARTIAL описаны в Git-истории и датированных checkpoints. Не использовать их как текущую рекомендацию повторить загрузку V3.
