# Собственный trace выбранного OSRM — STARTED

2026-10-17T17:21:48.258949+03:00. Source remote/PR head `a49470b7b9ebf4065c44890bc5e516a74dbe0166`, tree `37d436220a8504dee38b361a83ead85c7c706b23`. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. CI39038119987 фактически completed/success; три последних запуска завершены. Локальная ветка совпала, дерево чистое.

## Ограниченный вход и причина новой сети

Один представитель `pair-m11-zsd-prim-to-moscow`: после исправления no-reentry выбран собственный обычный OSRM-кандидат из сохранённого capture, 715622м/30963с. Старый Valhalla-кандидат отклонён; его trace нельзя переносить. Исходный capture: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-zsd-prim-to-moscow/2026-10-16T00-06-25-425Z-capture.json.gz`, SHA256 `24a24fda86b252ba77c3765a24b8ee58f05c742b84af6ed7445540368fd0eb61`.

Восстановить OSRM route и собственные derived metadata только из его записанного ответа через строгий offline fetch. Затем один ограниченный live map-matching выбранной геометрии через текущий validateTollEdges (140км chunks, concurrency2,18с/chunk). Новых routing-запросов, широких live probes, 74/76/309 replay и переноса чужих trace не выполнять. Перед сетью STARTED должен быть в remote и проверен readback. Неполные/недоступные ответы означают unknown; не расширять поиск бесконечно.

## Выход и восстановление

Каталог `experiments/nationwide-tolls/checks/2026-10-17-zsd-selected-osrm-trace/`: выбранный route SHA, raw ответы каждого запроса, per-request/progress, validation и результат одного случая. Проверить тарифные компоненты только по собственной новой проверке; при недостаточности первичной collection scope сохранить точный blocker. Дата всей поездки по отправлению, легковой, cash/card без транспондера. Не считать subtotal полным итогом. Отдельные счётчики случаев/компонентов/полных тарифов.

При прерывании прочитать progress и SHA; законченные raw не терять. Если сеть недоступна, один доказанный отказ и fail-closed результат достаточны, повторять все шесть не нужно. По завершении один DONE/BLOCKED checkpoint, append WORK_LOG, короткие WORK_STATE/NEXT_STEPS, очередь; exact tree/blob/head readback. Во время нового CI не обновлять ветку; анализ/запуск этой одной локальной операции после STARTED разрешён. Runtime в этом блоке не меняется; исходные721/TS/build не повторять без новой причины. No main/merge/Production/Android/сообщений/автоматизаций.
