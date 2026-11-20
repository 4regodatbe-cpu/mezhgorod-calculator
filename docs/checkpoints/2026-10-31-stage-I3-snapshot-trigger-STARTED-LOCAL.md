# Stage I3 — snapshot triggers, исправление и финальные gates STARTED

31.10.2026. Исходный локальный HEAD `7d1007280e0a0b8ca2673a4d52dcea7023fcc8e2`, рабочее дерево было чистым. Предыдущие коммиты, данные и bundle этапа I сохранены. Сохраняется detached HEAD в разрешённой линии истории, без переключения/reset/rebase. Только локально, push запрещён.

Подтверждено отсутствие `data/address-city-snapshot.json` в обоих path filters B03. Сначала добавлены два отдельных regression-теста: штатная команда CI `node scripts/b03-browser-workflow.test.mjs` до исправления — **3 PASS, 2 FAIL / exit 1**, обе ошибки именно на отсутствии пути. Первый вызов через `node --test` в исходном sandbox дал только file-level failure, не содержательный regression result; его отдельный log сохранён, причина не исследовалась повторно. Для проверок используем штатные средства среды и команду workflow.

Минимальное исправление — две строки, по одной в `push.paths` и `pull_request.paths`. В тесте разбор ограничен границей каждого события, чтобы запись в PR не маскировала пропуск в push. После изменения **5 PASS / exit 0**. Побайтовое сравнение workflow после удаления двух новых строк с parent версией — PASS: freshness/SHA256/browser suites/verify/build/permissions/concurrency не изменялись.

По AGENTS после code changes выполняются focused + обязательные full gate/build. План: один `npm run test:audit` (offline), ESLint; прямой Next webpack production build, затем TypeScript последовательно. Новый live/Photon/браузерный аудит не выполняется. Node 24.19.0 и уже установленные зависимости — временный symlink, lockfile не меняется.

Логи/exit codes: `experiments/address-search/stage-i-2026-10-31/checks/i3-snapshot-trigger/`. При прерывании читать готовый exit code и активную сессию, не повторять завершённые gates. После результатов — итоговый checkpoint/WORK_STATE/append-only WORK_LOG/NEXT_STEPS, локальный commit/readback, новый incremental bundle. GitHub/Preview acceptance не заявляется, PR №14/Production/main/Android/backup/матрица/runtime не меняются.
