# B01–B12 next steps

Актуально на 26.10.2026 17:22 МСК; B03 Chrome smoke DONE: run 40336150199 passed, Chrome 156.0.8078.47 и DOM подтверждены, artifact сохранён. Восемь mocked `/r` сценариев подготовлены в изолированном workflow, browser run ещё не состоялся. Свежесть удалённого снимка и hash проверены непосредственно перед конфигурацией; срок 31.10.2026 11:24:54 МСК. [checkpoint](../checkpoints/2026-10-26-1711-b03-address-ui-STARTED.md).

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 IN_PROGRESS / BLOCKED_BY_NETWORK:** V2 capture harness завершён; следующий полезный блок — точное сравнение Ейска/Майкопа при доступных provider captures. Сейчас Valhalla/OSRM/BRouter недоступны; без изменения доступности не повторять.
3. **B03 UI scenarios IN_PROGRESS:** hosted Chrome 156 DOM smoke passed; isolated eight-case workflow/script prepared, not run yet. Check snapshot freshness immediately before hosted run. Local Codex Chromium remains blocked; do not repeat there.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
