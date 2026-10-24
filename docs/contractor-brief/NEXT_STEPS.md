# B01–B12 next steps

Актуально на 24.10.2026 21:54 МСК.

1. **B10 IN_PROGRESS:** STARTED recovery сохранён; frozen install + bounded two-case V2 harness/no-network preflight. Live capture только после отдельного durable STARTED; общий regression runner не запускать.
2. **B03 BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME:** Chromium 154 падает до DOM с crashpad `setsockopt: Operation not permitted`, exit133. Восемь сценариев NOT_RUN; повторять только в среде с разрешённым browser runtime.
3. **B01–B02 BLOCKED_BY_SOURCE/DATA:** pool/circuit выполнены; GeoNames downloads/joins не повторять. Нужен новый проверенный источник labels/hierarchy/coordinates.
4. **B04 IDENTITY_DONE / DATA_BLOCKED:** exact coordinates и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
5. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** текущие fail-closed guards сохранять; не повторять завершённые source passes и маршруты.
6. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; browser runtime блокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
