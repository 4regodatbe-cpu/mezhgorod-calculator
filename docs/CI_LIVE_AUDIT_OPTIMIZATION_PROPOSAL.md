# Предложение: отделить быстрый CI от широкого live-аудита

Статус: ограниченная первая реализация выполнена в `special-territory-policy.yml`; дальнейшее разделение live-наборов остаётся предложением.

## Наблюдение

`special-territory-policy.yml` запускает `verify`, `live_probe` (включая аудит 50 поселений и сравнение шести скриншотных маршрутов) и `calculation_timing` при `pull_request`, если diff PR затрагивает один из путей `app/api/v2/**`, `app/v2/**`, `lib/**`, `scripts/**`. Фильтр оценивает общий diff открытого PR, поэтому последующий docs-only или независимый тестовый коммит в том же PR повторно запускает широкие live jobs. Это наблюдалось на docs-only сохранениях.

## Предлагаемое разделение

1. Оставить на обычный PR `verify`: локальные unit/contract checks, TypeScript и build; запускать по релевантным runtime/test paths. Документация и несвязанные тестовые пакеты не должны включать live endpoints.
2. Вынести live provider probes и массовые route audits в отдельный workflow с явным ручным запуском, выбором малой группы сценариев и фиксированным лимитом запросов. Полный nationwide audit запускать только отдельным решением владельца.
3. Для `special-territory-policy` сохранить PR-задачу проверки изменённого route-кода, но разделить узкий case smoke от фиксированного 50-case аудита. Для PR-синхронизации определять, изменились ли именно runtime-файлы в последнем коммите, чтобы docs-only follow-up в долгоживущем PR не повторял широкий job.
4. Выделить routing `Valhalla`, `OSRM`, `BRouter`, геокодинг и toll-map probes в независимые jobs/cases с явным списком endpoint, per-provider timeout, нулём retries по умолчанию и артефактами raw response/status/SHA. Один блокер не должен автоматически запускать остальные несвязанные наборы.
5. Оставить `concurrency` только для предотвращения одновременных одинаковых live jobs; не отменять уже идущий диагностический run (`cancel-in-progress: false`). Обычные проверки могут иметь отдельную concurrency group.

## Ограничения rollout

- Это только предложение для отдельного review/approval; сейчас PR #14 Draft, main и существующий workflow не изменены.
- GitHub `workflow_dispatch` требует workflow в default branch. Изолированный push-trigger на рабочей ветке полезен для ограниченного эксперимента, но сам по себе не даёт безопасный постоянный dispatch UX.
- Перед реализацией нужно согласовать required status checks и не скрывать ошибки runtime-кода; перенос широкого live job из PR не должен ослаблять обязательные offline проверки.

## Реализованный ограниченный этап — 26.10.2026

Для открытого PR #14 добавлен PR-head delta classifier. Он ищет последний завершённый run этого workflow, связанный именно с PR и разрешённой веткой; требует успешный `verify` и подтверждённые завершённые live/classifier jobs; сравнивает exact linked PR head с текущим PR head. `live_probe` и `calculation_timing` пропускаются только при полном линейном сравнении без runtime paths. API failure, отсутствующий baseline, незавершённый verify/live, diverged/invalid comparison или лимит ≥300 файлов сохраняет fail-open запуск широких jobs. `workflow_dispatch` по-прежнему запускает их явно. Проверки `verify` (тесты, TypeScript, Next build) и содержимое live probes не ослаблены; concurrency и отмена существующих runs не менялись.

Модель: 10 focused Node cases PASS. Hosted run [40364820838](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40364820838) SUCCESS на Node24: verify PASS (435 проектных тестов + 10 classifier cases, TypeScript/build), classifier `head-already-checked`, оба live jobs SKIPPED. Первый hosted run [40363211385](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40363211385) выявил вывод JSON в `$GITHUB_OUTPUT`; fail-open включился как задумано. После фикса stderr формат валиден. Run403632 также подтвердил, что повторный address live probe нестабилен: Ростов PASS; Красн 5×503+cooldown; Донецк 7 cooldown; массовые дальнейшие шаги не выполнялись. Эти отказавшие endpoint-проверки не повторять без новой причины.

Дополнительная проверка: run40366544254 показал `head-already-checked` при независимом compare f220→f63 со статусом ahead/16 commits; прежняя логика опиралась на PR-linked head, которая может быть динамической. Ужесточено: для delta использовать только immutable `workflow_run.head_sha`, PR link нужен только для привязки run к PR14; любая missing/invalid/uncertain history запускает live. Hosted run [40367512131](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40367512131) подтвердил `no-route-runtime-change-in-update`, verify PASS (435 project + 10 classifier + 4 selector tests, TypeScript/build), live jobs SKIPPED. Изменение workflow на run403675 само ещё не запускало B10 capture.
