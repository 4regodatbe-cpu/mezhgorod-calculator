# B01–B12 next steps

Актуально на 26.10.2026 18:52 МСК. B03 remains DONE 8/8; do not repeat. B10 V2 capture is STARTED from base `769d462fe11a07b4ac887ba0b9292dbe0589d320`; run40345807008 shows Valhalla/OSRM data on hosted runner, while BRouter remains unverified. [STARTED](../checkpoints/2026-10-26-1852-b10-v2-hosted-capture-STARTED.md). One isolated workflow checks one request/provider, then Eisk → conditional Maykop → offline comparison; a single accompanying special-territory run is authorized. Next: verify one narrow workflow event and artifact; no retries if trigger absent or any required provider/capture is incomplete. PR #14 Draft; tariffs unchanged.

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 IN_PROGRESS:** V2 harness ready; provider availability is being tested on GitHub Actions because prior Codex network failures do not establish hosted-runner availability. Required provider failure blocks both captures/comparison; do not retry unchanged conditions.
3. **B03 UI scenarios DONE (mocked):** all 8/8 pass on hosted Chrome; swap callback and result reset verified. Original external B-only issue remains unverified; `addressCitySnapshot` remains off. Hosted artifact is retained through 2026-11-25T14:54:08Z.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
