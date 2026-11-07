# Часть 19C — Пришиб → Москва, проверка М-4 2/25: DONE

16.10.2026 07:38 МСК. Только fix/v3-missing-route-prices-2026-10-15, PR14 open/draft, head7aa114acec35d285ca8377814b763da9bbaa16fa проверен через Git и GitHub get_pr_info. Локальное дерево27a7287d397bdde961a0ac8909becabb4f2838c8 совпадает с сохранённым remote tree; checkout чистый до шага. GitHub workflow38824450386/job116729992063 completed/success; очередь не перезапускалась. AGENTS, CHECKPOINT_PROTOCOL, WORK_STATE, SMALL_PARTS_PLAN, AUTO_QUEUE_STATE и релевантные журнал/решения прочитаны. Единственная маршрутная единица этого запуска — zaporizhzhia-пришиб-moscow-center согласно executionUnit плана; следующий случай ещё не запускался.

## Вход и воспроизведение

Existing corpus.auditEvidence.capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/zaporizhzhia-пришиб-moscow-center/2026-10-15T17-05-15-066Z-capture.json.gz`, SHA256ed2ee4dbc7bc60dade32ef6eb26f7a431aaa09028c132bfe829a96729c323564. STARTED и способ восстановления уже сохранены в предыдущем checkpoint part19c-granitnoe и WORK_STATE. Сохранённый выбранный provider — **OSRM**, 2018186м; не Valhalla и не геометрия другого кандидата.

Дважды выполнена команда `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt>` для2026-10-15T09:00:00+03:00 и2026-10-17T09:00:00+03:00. Оба exit0, replayIntegrity.complete=true, missingResponses=[], audit.status=priced, audit.missing=[]. TariffPolicy trip-departure-v1.basisAt в обоих случаях равен моменту отправления.

Новые файлы в той же папке runs/zaporizhzhia-пришиб-moscow-center/:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T04-38-03-560Z.json`, SHA25628243b19f1a128bea5a770b06167bca033d10f2508422e29c6f6193bd4151403: **5840=М-4 5040+А-289 800**.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T04-38-04-372Z.json`, SHA256cfaa8569146f007bc1308899a392bba7613fdb6766fb60da136b8485868293df: **6890=М-4 6090+А-289 800**.

М-4: exact selected vector m4-1223→m4-71; А-289: точные рамки103→82→23, full interior binding19A. Старый live давал unknown по М-4 (m4_crossing_profile_changes) и А-289 (unresolved exits); он сохранён без изменений. Текущая historicalM4 ошибка в этом случае не воспроизводится, дополнительного изменения кода не потребовалось. Это whole-engine offline проверка уже исправленного кода, НЕ fresh live, НЕ новая same-date parity со старым buggy live, НЕ независимое подтверждение оператора; priceConfirmation=unconfirmed сохранён.

## Проверки и ограничения

Расчётный код не менялся: последняя его полная проверка676/676+quote/API/Next/TS/static16/16, focused23/scopedlint5 относится к19B, заново в этом docs/evidence-only шаге не запускалась. Проверены новые JSON/links, SHA и diff. FrozenREPORT SHA256 по-прежнему cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e. Ничего не удалено, старые raw/live/replay/REPORT не перезаписаны. Main/merge/Production/Android/сообщений людям нет.

GitHub fetch_pr с полным diff дважды вернул Transport closed; безопасная metadata-only get_pr_info сработала и подтвердила точный draft/head. Это временная ошибка чтения большой PR, не permission blocker; далее использовать get_pr_info, не загружать diff целиком. Временный helper сохранения восстановлен через apply_patch; все пути передаются NUL-safe, новые blob SHA и tree должны совпасть с local Git, non-force update с expected head и readback обязательны. Фактический commit этой записи проверяется после публикации, не самоссылкой.

## NEXT STARTED — один случай

Historical M4 policy проверено2/25. Следующий ТОЛЬКО `kherson-раденск-moscow-center` (3/25): найти existing capture в corpus.auditEvidence, существующим runner выполнить два departure profiles15/17Oct09:00MSK; проверить integrity/basisAt/actualM4, неизвестные другие компоненты не скрывать. Затем новый checkpoint, append WORK_LOG/NEXT_STEPS, queue/WORK_STATE, commit/GitHub/head/tree до следующего случая. Не запускать весь309 корпус и не расширять другие классы в том же шаге. Часть19 продолжается,20 не начата; автопродолжение оставить включённым.
