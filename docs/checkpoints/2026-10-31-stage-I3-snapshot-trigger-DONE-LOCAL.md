# Stage I3 — B03 snapshot path filters, DONE LOCAL

31.10.2026, 18:20 МСК. Исходный HEAD `7d1007280e0a0b8ca2673a4d52dcea7023fcc8e2`; исправление и проверенные исходники `2750861c68a8182645d35126a251056ad665c89d`. Прежняя история Stage I сохранена, parent достижим, предыдущий final bundle SHA256 проверен без изменения. Push запрещён и не выполнялся.

## Исправлено

Фактический workflow не содержал `data/address-city-snapshot.json` ни в `push.paths`, ни в `pull_request.paths`. Сначала regression на оба события: **3 PASS / 2 FAIL / exit 1** штатной командой `node scripts/b03-browser-workflow.test.mjs`. Затем добавлены ровно две path-строки. После — **5 PASS / 0 FAIL / exit 0**.

Разбор event-секции в тесте ограничен следующим sibling event/top-level key: присутствие пути только в PR больше не сможет скрыть его отсутствие в push. Существующие проверки AddressField, обеих browser suites, swap/refocus и обязательного verify сохранены. После удаления двух новых строк весь workflow побайтово совпадает с parent: jobs, freshness, SHA256/browser runners, commands, permissions и concurrency не изменены. App/lib/data/матрица/маршрутизация не затронуты, snapshot и выключенные флаги Stage I сохранены.

## Реальные проверки

[Сводка и команды](../../experiments/address-search/stage-i-2026-10-31/checks/i3-snapshot-trigger/RESULTS.json), рядом полные логи, exit codes и SHA256SUMS.

- По AGENTS для изменённого test code выполнены обязательные full gate/build, не повторный live-аудит: `npm run test:audit` — **1063 PASS / 0 FAIL / 1 SKIP**, дополнительные quote/API contracts PASS, exit 0.
- ESLint: exit 0, семь прежних предупреждений, без ошибок.
- Прямой Next.js 16.3.4 production build: exit 0; сохранено прежнее предупреждение preferredRegion. Node 24.19.0.
- После build последовательный TypeScript `--noEmit`: exit 0.
- Initial `node --test` в base sandbox дал только file-level failure. Этот отдельный результат сохранён, не выдан за содержательный RED. Direct-команда CI дала два конкретных assertion failure до правки; полный gate с штатными дополнительными разрешениями прошёл. Настройки безопасности не менялись.
- Новых Actions, браузерных запусков, Photon-запросов и расследования Photon не выполнялось.

## Сохранение и готовность

WORK_STATE/NEXT_STEPS обновлены, журнал дополнен без удаления прежних записей. Далее выполняются локальный commit, точный файловый readback и новый incremental bundle с опубликованным `c0e76eccfda0bf4fd8eeb5ac299c6da1242baa57` как prerequisite. Bundle прежнего Stage I не заменяется. Финальный SHA и bundle hash получаются после commit; самоссылочного SHA в этом документе нет.

**Локально готово к контролируемой публикации**, не к Production. Нужны отдельное разрешение и свежий remote/ancestry/CI preflight; новых GitHub/Preview PASS не заявляем. Известный внешний Photon 503 остаётся отдельным ограничением без повторного аудита. PR №14/main/Production/Android/backup не изменялись. Никакого push/merge/force.
