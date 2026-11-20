# V3 ЗСД: защита от повторного заезда — DONE локально

17.10.2026, 16:38 МСК. Причина `zsd:selected-route-reentry`: **исправлена и проверена в точной области шести сохранённых случаев**. Итоговый remote commit ещё требует записи и readback после прекращения активного CI.

Source head: `0cc2c469d5ef0385fe8446983103233ef73606a2`. Durable STARTED: `80a15c47087199bab3d96783559fc486946b52be`, tree `f7980a092d1146f6f561c452c182b7961c0cf080`. Единственная ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 открыт/draft.

## Что изменено и почему

Добавлен `lib/v3-calculation/zsd-reentry-policy.ts`. Он проверяет конкретную доказанную последовательность: северное ЗСД → съезд через Планерную/Богатырский → городской разворот → новый въезд на южное ЗСД. Требуются восемь упорядоченных физических свидетелей, расстояние до собственной геометрии ≤15 м, плотность каждого местного сегмента ≤500 м и местная длина ≤4 км. Одного ПВП, конечного пункта или названия дороги недостаточно.

Небольшой runtime asset: `experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json`. Capture SHA, индексы исходной геометрии, шесть случаев и четыре независимых контроля вынесены в source-manifest.json. Runtime не читает OD/ETA/ценовой benchmark.

Общий V3 `lib/v3-calculation/route-candidate.ts:isUsableRoute` исключает такой кандидат **до сравнения времени**; эта функция уже используется ordinary и special pipeline. Из оставшихся обычных ответов провайдеров выбирается один с минимальным временем. Цена и наличие тарифа не влияют на выбор. Новые бесплатные/bypass-запросы не добавлялись. Если допустимых кандидатов нет, возвращается существующая ошибка маршрутизации.

На каждом из шести собственных capture прежний более быстрый Valhalla нарушает no-reentry и отклонён; собственный обычный OSRM допустим и выбирается среди оставшихся ответов. Это исправление известного мотива, **не общий детектор всех повторных заездов России**. V2, тарифные источники, API-контракт и правило тарификации по отправлению не менялись.

## Проверки

`lib/v3-calculation/zsd-reentry-policy.test.ts`: шесть bad/шесть обычных OSRM, четыре непрерывных negative controls, source hashes, обратный порядок, соседний путь, chord, разрыв и отсутствие допустимого кандидата.

`scripts/v3-route-selection-audit.test.ts`: ordinary API выбирает OSRM и проверяет только его собственные точки; special API применяет тот же допуск; единственный запрещённый кандидат даёт502 без тарификации. Все три API-регрессии ожидаемо падают при отключении только guard через внешний тестовый loader. Production-файлы для mutation не изменялись.

`experiments/nationwide-tolls/scripts/check-zsd-no-reentry.mjs`: воспроизводимый пакет шести candidate checks с отдельными JSON, progress и SHA summary, плюс четыре контроля; без запросов routing/tracing/fare.

Фактические результаты:

- Focused24/24 PASS; mutation: exit1/fail3 ожидаемо, проверка существенности регрессий PASS.
- Full audit721/721 PASS; quote/API checks PASS.
- TypeScript exit0; targeted ESLint exit0.
- Next build exit0: compile/TS PASS, static16/16.
- Candidate batch:6/6 случаев, шесть отклонённых reentry-геометрий, шесть допущенных собственных OSRM, четыре неотклонённых непрерывных контроля.

Первый full audit:715 pass и1 module fail из716 из-за ENOENT старой A289-фикстуры в sparse checkout. Восстановлены три точных tracked capture из Git objects, blob SHA совпали; повтор прошёл721/721. Initial failure, recovery и оба лога сохранены. Первый focused log пуст при exit0; явный reporter24/24 и full audit проверены. После STARTED первый PR readback ещё видел прежний head при уже обновлённой ветке; повтор подтвердил80a15c…/draft/tree/шесть blob, повторный writer не запускался.

Зависимости скопированы из имеющегося локального node_modules в собственный checkout без install/network и изменения lockfile. Итоговые JSON/hash/link/diff-проверки — validation.json.

## Счётчики и ограничения

Шесть уникальных исходных случаев;12 проверенных candidate-геометрий; четыре самостоятельных negative controls. Новых live provider requests и full-trip replay0. Новых рассчитанных тарифных компонентов и подтверждённых полных тарифов0. Mock HTTP в тестах не является live-данными.

Полные цены для новых OSRM-геометрий не пересчитывались. Старый trace Valhalla нельзя переносить на новый OSRM: mocked API подтверждает запрос только собственных точек выбранного OSRM и unknown при недоступном новом trace. Исторический baseline26 priced/50unknown не является пересчитанным покрытием новых выбранных геометрий.

## CI и сохранение

Исходный run39035926910 completed/success перед STARTED. Post-STARTED run39036931767: verify completed/success; необязательная широкая live_probe ещё активна при подготовке этого checkpoint. Отмена не выполнялась: в connector нет cancel-команды; пользователь уведомлён. CLI credentials и browser fallback не пробовали. Дождаться фактического прекращения перед remote update. Новый code CI не выдавать за успешный по локальным проверкам.

Обновлены append-only WORK_LOG, короткие WORK_STATE/NEXT_STEPS и geometry finding в очереди. Пути результатов: `experiments/nationwide-tolls/checks/2026-10-17-zsd-no-reentry/`. Перед записью проверить head/PR/active writers; перенос одним non-force connector commit с expected parent80a15c… и точными tree/blob/head readback. При изменении head сначала readback/reconcile. Main, merge, Production, Android, сообщений и автоматизаций нет.

NEXT: после сохранения проверить CI нового кода. При продолжении pricing получить собственный selected OSRM trace одного представителя, поскольку геометрия действительно изменилась. Source collection gaps остаются unknown. Не повторять74/76/309 и26 siblings без общего решения.

Финальная проверка перед записью 2026-10-17T16:46:26.789689+03:00: run39036931767 завершил verify иlive_probe completed/success. Отмена не выполнялась. Активныхзаданий исходногозапуска больше нет; разрешена итоговаязапись сexpectedparent80a15c…. Новыйpost-saveCI проверятьотдельно.

При финальном staged diff --check обнаружены только trailing whitespace/CR в исходных build/mutation логах. Точные исходные байты сохранены в build.raw.log.gz и mutation-expected-failure.raw.log.gz (SHA и обратная распаковка проверены); печатные .log нормализованы по пробелам/концу файла, validation обновлён. Код не менялся, тесты не перезапускались. Полный staged diff к STARTED проверяется повторно перед единственным итоговым remote commit.
