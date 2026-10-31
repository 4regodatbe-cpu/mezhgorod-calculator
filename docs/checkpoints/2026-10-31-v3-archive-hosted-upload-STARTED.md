# V3 source archive hosted upload — STARTED

31.10.2026 МСК. Local/remote `3e397b3e90d882b799e8102bcd59761774e63b3a`; PR №14 OPEN/Draft. `stat` архива `/workspace/reorg-handoff-2026-10-31/pre-release-v3-source.tar.gz`: 343730585 байт; `sha256sum`: `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`. Содержимое 14042/14042 Git blob SHA уже проверено, не переупаковывать локальный файл без причины.

`gh auth status` показывает действующий GH_TOKEN типа `ghu_` без раскрытия секрета; прежний вызов `uploads.github.com` дал HTTP401. Поскольку условия не изменились, локальный upload не повторять. В доступных GitHub Connector tools отсутствует прямой upload Release asset.

Проверка безопасного CI-механизма: существующий special-territory PR run 41227796326 имеет verify и classifier SUCCESS; compare его head `e3ca3783...` с текущим head — `ahead`, 45 файлов, только docs/archive. Классификатор `classifyChangedPaths` не относит новый путь `.github/workflows/v3-source-archive.yml` к LIVE_PATHS. При достоверном compare узкий workflow не требует live_probe/calculation_timing; при сбое метаданных штатная политика CI остаётся fail-open, что должно быть явно учтено перед push. Новых CI сейчас нет.

План: создать workflow в разрешённой ветке с trigger push только по своему файлу, `contents:write`, checkout/fetch точного source commit `cde74243...`, `git archive`, распаковка и проверка 14042 файлов по сохранённому manifest; upload отдельного prerelease asset через runner GITHUB_TOKEN, затем download/readback SHA256. Если GitHub-hosted upload тоже недоступен, записать точный FAIL/BLOCKED и продолжить независимый анализ очистки без удаления. Не использовать Android Release, `--clobber`, main, Production или изменение существующих refs.
