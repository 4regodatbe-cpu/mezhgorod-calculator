# B01–B12 next steps

Актуально на 25.10.2026 07:46 МСК.

1. **B10 / infrastructure diagnostic PENDING:** локально три теста не дошли до assertion из-за общего `spawnSync ... EPERM`; дождаться узкого Node 24 workflow и прочитать stdout/stderr/exit-code artifacts. Не повторять локальный запуск при неизменном sandbox.

2. **B10 IN_PROGRESS:** V2 capture harness завершён, live capture заблокирован недоступностью Valhalla/OSRM/BRouter; не повторять без изменения доступности.
3. **B03 BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME:** Chromium падает до DOM с crashpad `setsockopt: Operation not permitted`, exit 133; восемь UI сценариев NOT_RUN. Повторять только в другой browser runtime.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
