# B01–B12 next steps

Актуально на 26.10.2026 17:27 МСК. B03 Chrome smoke DONE (run 40336150199). Первый восьмисценарный workflow run 40339480704 упал до запуска браузера: setup-node не нашёл pnpm из-за порядка шагов; сценарии NOT_RUN. Исправление и отдельный retry STARTED подготовлены, но ещё не сохранены: [FAILED](../checkpoints/2026-10-26-1726-b03-ui-runner-bootstrap-FAILED.md), [STARTED](../checkpoints/2026-10-26-1727-b03-address-ui-retry-STARTED.md). Snapshot expires 31.10.2026 11:24:54 МСК.

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 IN_PROGRESS / BLOCKED_BY_NETWORK:** V2 capture harness завершён; следующий полезный блок — точное сравнение Ейска/Майкопа при доступных provider captures. Сейчас Valhalla/OSRM/BRouter недоступны; без изменения доступности не повторять.
3. **B03 UI scenarios IN_PROGRESS:** isolated run failed before browser startup (`setup-node` could not find pnpm); no scenarios executed. Fix step order, then one retry after Actions idle and fresh snapshot validation. Do not repeat local Codex Chromium.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
