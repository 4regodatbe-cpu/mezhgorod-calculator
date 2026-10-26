# B01–B12 next steps

Актуально на 26.10.2026 18:01 МСК. B03 mocked browser scenarios DONE 8/8; V2 swap callback fix and reset verified; existing Actions verification completed (focused tests, TypeScript, Next build; workflow overall success). [DONE](../checkpoints/2026-10-26-1755-b03-v2-swap-fix-DONE.md); [per-case evidence](../../experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40343852094/README.md). PR #14 Draft; original real-service B-only incident remains unverified; snapshot flag false. Next: resume B10's prepared V2 comparison only if a new provider capture appears; otherwise choose an offline B01–B12 task. Do not repeat B03 absent a change.

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 IN_PROGRESS / BLOCKED_BY_NETWORK:** V2 capture harness завершён; следующий полезный блок — точное сравнение Ейска/Майкопа при доступных provider captures. Сейчас Valhalla/OSRM/BRouter недоступны; без изменения доступности не повторять.
3. **B03 UI scenarios DONE (mocked):** all 8/8 pass on hosted Chrome; swap callback and result reset verified. Original external B-only issue remains unverified; `addressCitySnapshot` remains off. Hosted artifact is retained through 2026-11-25T14:54:08Z.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
