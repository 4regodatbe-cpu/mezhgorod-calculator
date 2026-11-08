# Пять собственных OSRM trace ЗСД — STARTED

2026-10-17T17:49:52.255297+03:00. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Source remote/PR/local head `8fecbab5245fed3b7bff644eb0ccce4f2efa2c33`, tree `d202843e79a8e75fc222a8f383f0ef552fd2fcfc`. Source CI39041543624 в начале ещё выполняет широкую live_probe (verify success); до завершения remote update запрещён. Разрешён короткий локальный анализ сохранённых входов и подготовка runner.

## Объём и причина

После устранения повторного заезда изменился выбор провайдера шести исходных случаев. Представитель Приморский→Москва уже проверен в8fecbab5: собственный OSRM trace полный, ЗСД300 по готовому вектору зоны1, четыре компонента5424, полный тариф unconfirmed. Представителя не пересчитывать.

Оставшиеся пять точных case/capture/SHA и geometry/route SHA находятся в `experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five/inputs-plan.json`. Это два M12-chain к Арзамасу/Чебоксарам, два M4-chain к Воронежу и пара к Торжку. У всех собственный обычный OSRM допущен; прежний Valhalla отклонён. Сохранённый BRouter имеет3Dкоординаты и диагностический повторный заезд даже после проекции в2D; нормализация runtime не меняется. Цена не участвует в выборе.

Короткая подготовка без сети/цен дала41 trace request occurrences,19уникальных payload,4точных совпадения с новым собственным OSRM capture представителя,15недостающих уникальных payload. Это подготовленные входы, а не пять завершённых ценовых проверок. Старые trace Valhalla не использовать. Новый routing и повтор74/76/309 запрещены.

## Выполнение после durable readback

Runner `experiments/nationwide-tolls/scripts/trace-zsd-osrm-replacements.mjs` хранит каждый raw request/response, STARTED/progress и отдельный результат случая. Он восстанавливает собственные metadata каждого OSRM только из соответствующего routing response. HTTP200 может быть использован повторно только по точному URL+method+body (включая shape/filters); совпадение ПВП или начала маршрута не достаточно. Первая запись включает runner и inputs-plan, синтаксис runner предварительно проверен; фактическое выполнение и обязательный gate ещё не выполнены.

Команда: `ZSD_DURABLE_STARTED_COMMIT=<verified remote SHA> node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/trace-zsd-osrm-replacements.mjs --live experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five`. Сеть допускается только POST trace_attributes; максимум35 попыток и180с на выполнение пакета, штатные140км chunks/concurrency2/18с остаются. Terminal network/401/403/451 блокирует дальнейшие новые запросы. Пропуски не становятся нулями. Тарификация всех компонентов — по исходной дате отправления, легковой, cash/card без транспондера.

По завершении строгий offline replay пяти новых результатов, проверка raw/source SHA, scope/направления и отрицательных случаев; обязательные audit/quote/API, TS и Next build по AGENTS для нового кода runner. Рассчитанные компоненты и подтверждённые полные тарифы считать отдельно; прежний baseline26/50 не объявлять автоматически пересчитанным.

## Восстановление и итог

До долгой сети и gate этот STARTED должен быть достижим из разрешённой ветки и прочитан обратно с проверкой head/tree/blob/PRdraft. При прерывании читать STARTED/progress/FAILED, не перезаписывать завершённые raw/cases. `--resume` принимает только те же SHA исходников, пропускает сохранённые cases и не перезаписывает оборванные raw; при потерянном ответе незавершённого запроса сеть блокируется, результат остаётся unknown. `--replay` не использует сеть, проверяет точные bodies, все результаты и отсутствие лишних/неиспользованных ответов.

Один итоговый DONE/BLOCKED checkpoint, append WORK_LOG, короткие WORK_STATE/NEXT_STEPS и очередь, один non-force commit/readback. Во время post-STARTED CI можно выполнять локальный пакет; итоговый remote update — после прекращения active/queued CI. Main/merge/Production/Android, сообщений, новых автоматизаций и широких ручных live-проб нет. Исходные группы с отсутствующим owner collection scope остаются отдельными unknown.
