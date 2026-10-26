# B01–B12 next steps

Актуально на 26.10.2026 17:40 МСК. B03 run 40340623345 запустил Chrome и 8 cases; кейс 1 PASS, кейсы 2–7 имеют подтверждённые дефекты harness, кейс 8 выявил отсутствующий swap control при прошедших мобильных/клавиатурных проверках. Artifact/evidence сохранены и проверяемы: [FAILED](../checkpoints/2026-10-26-1739-b03-ui-harness-run-FAILED.md). Точечная коррекция harness и STARTED для rerun: [STARTED](../checkpoints/2026-10-26-1740-b03-ui-harness-correction-STARTED.md). Snapshot expires 31.10.2026 11:24:54 МСК.

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 IN_PROGRESS / BLOCKED_BY_NETWORK:** V2 capture harness завершён; следующий полезный блок — точное сравнение Ейска/Майкопа при доступных provider captures. Сейчас Valhalla/OSRM/BRouter недоступны; без изменения доступности не повторять.
3. **B03 UI scenarios IN_PROGRESS:** Chrome run succeeded but harness errors invalidated cases 02–07; case08 verified mobile/keyboard behavior and observed missing swap control. Correct harness, fresh-check snapshot and rerun before any app change. Do not repeat local Codex Chromium.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
