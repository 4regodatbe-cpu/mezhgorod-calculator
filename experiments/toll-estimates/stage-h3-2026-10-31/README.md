# H3 — поиск G и сведение F–H, LOCAL

31.10.2026 МСК. Исходный HEAD H2 `a158a7f5b1bfa0a578607b74469c214c33f9ec71`, parentF `4a71c09302055d1a5f34a72e81f4f86b0d16c411`. Рабочее дерево до H3 чистое. Известный G: `dd3e2ff6ab6ffc7ec10b9630f2d064b32058ca29`.

## H3.1 — поиск завершён, G НЕ НАЙДЕН в доступной области

- Проверен точный SHA в текущей shared object DB и отдельных Git-хранилищах `/workspace/mezhgorod-calculator`, `/workspace/mezhgorod-calculator-fix`, `/workspace/izavb-platform`: отсутствует. Связанные worktrees перечислены, их refs не изменялись. Старые dirtyкопии не редактировались.
- В refs/reflog текущего хранилища и reflog двух старых calculatorкопий нет указанногоSHA или записей StageG/yandex-estimation. Общий перебор1226unreachablecommits H2 **не повторялся**.
- Найдены28локальныхbundleфайлов/24уникальных advertisedtips.23tips уже доступны в текущей objectDB, где G отсутствует. Единственный недоступный tip `a9f2bf98106bc798cc3536a7c920cd2c4dbd10a2` импортирован **только в отдельное временное bareхранилище** `/workspace/stage-H3-handoff-gJZPzy/inspect.git`. Это ЦКАДкоммит17.10.2026, не G; точный G отсутствует и после чтения его pack. Исходные bundles/refs/worktrees не менялись. Первая попытка не имела prerequisite `a666fb4887ea54a328a29fb3bfc2dfa5102e5499`; он найден в старой копии и предоставлен временной проверке через read-only alternates. Последующий unbundleexit0. Ни checkout, ни применение файлов bundle не выполнялись.
- Поиск соответствующих файлов/checkpoints в workspace не дал Gкаталога. Библиотечный отчёт ChatGPT тоже не доступен локально; это не доказательство его отсутствия в библиотеке/другой среде.
- Read-only GitHub lookup известного G вернул **422, No commit found for SHA**. PR14open/Draft, remote c2f52ee93cd98a81ecd05efa0358fb38c6704124. Нет push/merge/CI/deploy.

Полные списки bundles/tips, ответGitHub и логи временного чтения сохранены во внешнем recoveryкаталоге `/workspace/stage-H3-handoff-gJZPzy/`; [search-evidence.json](search-evidence.json) фиксирует их хеши. Область поиска ограничена доступными хранилищами/файлами; доступ к чужой среде или всем объектам GitHub не утверждается.

## Отсутствующие материалы и минимальное восстановление

1. Сам commitG, его parent(s), tree и diff относительно предков.
2. `experiments/nationwide-tolls/yandex-estimation-2026-10-31/component-analysis.json`.
3. `experiments/nationwide-tolls/yandex-estimation-2026-10-31/evidence-manifest.json`.
4. README и тесты G: каталог указан выше, точный полный список/имена должны быть получены из дереваG, не придуманы.
5. Изменение WORK_STATE именно вG (сохранить patch/контекст, не заменять им текущий handoff).
6. Исходный `YANDEX_PAID_ROADS_REPORT_2026-10-31.md`, ссылки/скриншоты/время/координаты/профиль оплаты, на которые G ссылается, если их нет внутри bundle.

Минимальный путь: из среды, где SHA существует, передать Gitbundle с ref, достигающим G, и всеми необходимыми предками/prerequisites; либо точные файлы+manifestсSHA и metadataкоммита. Не реконструировать G по сообщениям чата. Bundle сначала `verify`/objectinspection в отдельной копии без изменения текущих refs; подтвердить G SHA/tree/parents и все хеши файлов.

Затем read-only `merge-base`/ancestry и сравнение trees F/G/H2: установить, содержит ли G F, является ли sibling или другой линией; проверить app/lib/data/CI на любые неожиданные изменения и все тарифные grades. Только после этого выбрать интеграцию: descendant — сохранить последующие Hкоммиты; sibling — отдельное reviewedсведение с сохранением обоих родителей/истории; файлы безGitистории — явно обозначенное восстановление файлов с provenance, не поддельный Gcommit. Никаких blindreset/rebase/cherry-pick или утверждения непрерывности F–G–H до этой проверки.

### Статус после первого сохранения

H3.1 DONE_LOCAL как ограниченный поиск; восстановленных файлов G **0**. F→H2 ancestry подтверждена. Gсвязи сF/H2 и совместимость содержимого **BLOCKED_MISSING_G_OBJECTS**. Полное сведение F–G–H и публикационная готовность совокупности не подтверждены. H3.2–H3.4: доступная часть — актуальные формулировки и план, без повторения H2; следующие дополнения датировать отдельно.
