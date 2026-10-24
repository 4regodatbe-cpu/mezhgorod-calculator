# Часть 2: наблюдаемость runner и сверка evidence

DONE: правка runner и focused tests. 16.10.2026. Parent 1fbbb068; PR14 draft, текущая рабочая ветка.

Добавлен scripts/audit-child-process.mjs: вывод stdout/stderr поступает немедленно, WAIT каждые15с, ошибки stderr ограничены32KiB, timeout300s сохранён. Batch default limit8→1, метки PHASE live/replay. Тарифная логика не менялась. Проверки 3/3 PASS: progress/heartbeat до завершения, уничтожение зависшего child по timeout80ms, stderr+exit7. Лог: evidence/2026-10-16-small-parts-02-child-tests.log. diffcheck PASS.

Сверка всех frozen case ID по latest batch, читаемости raw/live/same/weekend, parity и replayIntegrity: stage1=23/155, stage2=0/154. В corpus status=audited было28/4, но это не итог доказанных запусков. Из latest batches23/1; у одного stage2 отсутствует полный комплект. evidence/2026-10-16-stage-reconciliation.json. Старый handoff23 корректен. Не засчитывать status без evidence. Независимое подтверждение операторской цены этим не установлено.

Следующее STARTED: полный pnpm build (после изменения исполняемого runner требуется full gate), затем ESLint изменённых JS и diffcheck. stdout сохранить в evidence/2026-10-16-small-parts-02-build.log. В случае обрыва прочитать лог и status, не запускать повтор при ещё работающем процессе. После PASS часть2 DONE, перейти к первому незавершённому case из плана. Не main/merge/Production.
