# B01–B12 next steps

Актуально на 24.10.2026 21:54 МСК.

1. **B04 IN_PROGRESS:** STARTED сохранён; получить ровно 2 nodes + 4 ways, raw/SHA/ODbL, проверить directed membership; `km:null`, scope/price unknown, runtime inactive.
2. **B03 BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME:** Chromium 154 падает до DOM с crashpad `setsockopt: Operation not permitted`, exit133. Восемь сценариев NOT_RUN; повторять только в среде с разрешённым browser runtime.
3. **B01–B02 BLOCKED_BY_SOURCE/DATA:** pool/circuit выполнены; GeoNames downloads/joins не повторять. Нужен новый проверенный источник labels/hierarchy/coordinates.
4. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** текущие fail-closed guards сохранять; не повторять завершённые source passes и маршруты.
5. **B10 IN_PROGRESS; B11 DIAGNOSTICS_DONE; B12 BLOCKED:** V2 Ейск/Майкоп compare не завершён; нового performance bottleneck нет; browser runtime блокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
