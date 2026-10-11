## CURRENT 2026-10-11 — закреплено правило единственного самого быстрого маршрута

- **DONE — решение пользователя записано** в `experiments/nationwide-tolls/DECISIONS.md`: новая версия показывает только маршрут с минимальным временем; анализирует платность и тариф только на его геометрии. Без toll участка — бесплатный маршрут; при неполных/неподтверждённых данных остаётся unknown, а не 0. Более медленная бесплатная альтернатива не заменяет быстрый платный маршрут.
- **IN PROGRESS — реализация ещё не выполнена.** Пока изменена только документация; текущий production selector/UI и тарифы не менялись. Приёмочные сценарии внесены в `experiments/nationwide-tolls/NEXT_STEPS.md`: быстрый платный против медленного бесплатного, единственный результат, tie-break, fail-closed тарификация.
- Полная запись: `experiments/nationwide-tolls/WORK_LOG.md`; тарифные Yandex controls остаются в `RECONCILIATION_2026-10-11.md` как диагностика выбранных путей, не как альтернативная выдача. Docs commits: decision `ad4ccb1`, log `4e719f6`, next steps `e608a84`. Тесты/build/deploy не запускались; production и preview не менялись.
- **NEXT:** реализовать и проверить этот selector contract в новом route pipeline; по-прежнему не выводить неподтверждённый платный тариф как ноль.

---

## CURRENT 2026-10-11 — Yandex route checks expanded

- **DONE — read-only route controls:** Yandex checks now include disputed alternatives Казань—Набережные Челны (~90/278 ₽) and СПб—Кронштадт (~600/300 ₽), plus long controls СПб—Москва (~6 150 ₽), Москва—Казань (~5 250 ₽), Москва↔Краснодар (~5 530/~5 260 ₽). Older M1/M3 checks remain documented. Exact observations, limitations and failed A-289 endpoint resolution are in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`.
- **INTERPRETATION:** these are route estimates for passenger car <2 m/no transponder; they do not certify per-gate tariffs or operator receipts. Route alternatives/direction deltas are unresolved checks, not billing corrections. A-289 not confirmed by the malformed endpoint. No all-network coverage claim.
- **DONE — docs persisted:** reconciliation appended and work log updated; latest audit commit `79b86c99654d072597c438e7027f4037cfb6ca47` (includes reconciliation, work log, next-step priority and this handoff). No code/tariff change. No tests/build/deploy run (docs-only research). Existing branch Preview remains on earlier source SHA; production untouched.
- **NEXT:** resolve each materially divergent route against exact selected geometry, dated operator tariffs and matching official trip calculator/receipt; expand targeted Yandex checks for open network groups listed in `NEXT_STEPS.md`. Never convert estimates directly to live prices.

---

## CURRENT 2026-10-11 — Yandex Maps fare controls observed