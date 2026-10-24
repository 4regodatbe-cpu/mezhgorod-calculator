# B01–B12 next steps

Актуально на 24.10.2026 21:54 МСК.

1. **B03 READY_FOR_BOUNDED_RUN:** сохранить STARTED и выполнить восемь сценариев из `experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md` в локальном Chromium с exact mocked `/r` и network isolation. Не включать `addressCitySnapshot`.
2. **B01–B02 RESEARCH_IN_PROGRESS:** сверить поздние address checkpoints и новые допустимые первичные источники; не повторять GeoNames downloads/joins.
3. **B04–B09 RESEARCH_IN_PROGRESS:** искать только новые первичные identity/boundary/fare доказательства; при их отсутствии сохранять точный DATA blocker, unknown не превращать в zero.
4. **B10–B12 REVIEW_IN_PROGRESS:** сверить late DONE против исторических STARTED и выбрать точечные проверки без массового аудита.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
