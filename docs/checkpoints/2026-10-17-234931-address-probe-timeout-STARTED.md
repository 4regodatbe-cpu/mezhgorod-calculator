# STARTED — ограничение времени адресной сетевой проверки

17.10.2026 23:49 МСК. Source remote/PR14draft e3c07ac3e09e8be1bbecd482b70974c691681f2b/tree d3e0340c9e352cd858854666c0f225a168f31764. CI39067254489 completed/success фактически проверен; код ЦКАД62path SHA надёжно сохранён, его не повторять. Последние локальные записи readback/CI включаются в этот docs-only checkpoint.

## Ограниченный блок

Причина: scripts/address-search-live-probe.mjs await fetch и response.json без per-request deadline,13 последовательных запросов-городов/два источника каждый; workflow только общий60минутный timeout. Само длительное наблюдение не доказывает зависание конкретного запроса.

План: (1) этот durable STARTED/readback; (2) helper request+body deadline10с, общий budget90с, abort и race против игнорирующего abort источника; запись основного array отчёта и progress после каждого города; явный статус незаконченного набора; (3) offline tests зависших headers/body/ignored abort, budget и сохранения progress, затем обязательный full audit/TS/ESLint/build; один DONE с кодом/логами/фактическими результатами и exact tree/path/head readback. Рабочая область только probe/helper/tests/artifact progress path; app/lib/матрица/цены не меняются. Новых live routes/trace/primary/повтора74/76/309 не запускать.

STARTED docs-only commit использует [skip ci], чтобы не запускать ещё один широкий live-аудит только ради журнала. Содержимое/ссылки/diff check проверяются локально; этот commit не заявляется как прошедший code CI. Документированный механизм GitHub: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs ; final code commit будет БЕЗ skip и запустит обычные проверки. Никакие активные runs не отменяются, workflow/security/required checks не отключаются; main/merge/Production/Android без изменения.

Recovery: если прервано, прочитать этот checkpoint и логи experiments/nationwide-tolls/checks/2026-10-17-address-probe-timeout; продолжать с невыполненной части. Не пересчитывать тарифы и не повторять сохранение ЦКАД. NEXT после DONE — фактический code CI, затем западные рамкиМ-12 и разные выходы по сохранённым inputs.
