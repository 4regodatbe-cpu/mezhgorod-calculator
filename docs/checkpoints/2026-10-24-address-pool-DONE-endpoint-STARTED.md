# DONE block2 / STARTED endpoint regression — 24.10.2026 МСК

Продолжение [плана](2026-10-24-address-diagnosis-DONE-pool-STARTED.md), source43d4813b906bd2bcd3d3f7fa246f476f8320ad4b/tree0b51fd610b63bdf8e8bdbfb4099d51d561e4bbdb; exact remote head/tree проверен перед кодом, PR14draft. Диагноз блока1 сохранён; новый live/audit route replay не запускался. Parent исходного docs блока deed213 имеетCI40073027371completed/overall success; отдельные live job результаты этим этапом не пересматривались.

## Блок2 DONE

Реализованы отдельный pool/coordinator/switch и одна integration suggest endpoint. Подробные пути/инварианты/удаление — [ADDRESS_REQUEST_POOL.md](../../experiments/road-ref-boundaries/ADDRESS_REQUEST_POOL.md). Два активных fetch/process, queue64, singleflight одногоURL, независимые subscriber cancellations и abort последнего, positiveLRU128/5мин, origin503/429cooldown15с, общий20сbudget включая queue/body, partial positives и bounded failures. Успешный cache может работать при cooldown. Новый запрос после очистки не наследует abandoned task. Pre-aborted low-level caller больше не вызывает fetch. Ранжирование/URLs/региональные правила/клиентский компонент/цены не менялись.

Переключение addressRequestPool:false отключает pool/cache/circuit; общий конечный budget остаётся. Structured summaries partial/unavailable без query/URL/raw error. Никакой случайный503 не считается доказанным ban. Модуль process-local, а не distributed/global. Полный поиск при outage может по-прежнему дать502; доказывается снижение нагрузки и сохранение пригодных ответов, не излечение внешнего источника.

## Фактические проверки

checks/2026-10-24-address-pool:focused.log54/54PASS (pool12 новых contracts, старые fetch/ranking/proxy), full-audit.log863/863PASS,0fail/skip; quote/API contractsPASS; ESLint5changedfiles exit0; Next webpack build/TypeScript/static16/16 exit0. Все long commands сохраняли output сразу в файлы. Локальный network Photon0, deterministic features из tests. Обновление partial diagnostic log и slow11.3s budget regression потребовало повторного focused/fullgate/build; финальные логи соответствуют финальному коду. Counts исходного полного gate851→863, тарифные snapshots не менялись.

Проверены: sharedA/B abort; active/queued cancellation; immediate retype; queue cap; cache TTL/LRU/nonempty/cooldown; HTTP503/429 stops; sameorigin и другойorigin; invalid limit guard; partialsuccess; totalbudget/noncooperative fetch; slowprefix11.3s. Время полного10сE2E/живойmobile scenario не измерялось. SHA256 исходников и evidence — verification.json.

## Уточнение сохранения серии

Первоначальный план говорил обычныйCI после первого codecommit. Чтобы не запускать один и тот же длинный live корпус между каждой малой частью, промежуточное сохранение блока2 использует [skip ci], после полноценного локального обязательного gate/build. Это сообщено пользователю до сохранения. Финальный commit блока3 запускает обычныйCI по итоговому коду+regression. Обязательные локальные gates не пропускались, workflow source/permissions не менялись; CI, который работал на исходном head, не отменялся и завершён до записи в ветку. Не заявлять промежуточный remoteCI какPASS.

## Блок3 STARTED, следующий в этом же сеансе

После durable readback блока2 добавить scripts/address-search-endpoint.test.ts: напрямую POST/r иGET/api/suggest с мокированным существующим provider. Проверить последовательность Анапа→Краснодар→Ростов→очистка/отмена→Донецк, повтор того же адреса из cache безfetch, корректную выдачу DonetskDNR/Ростов и отсутствие потери нового запроса при отмене старого. Providercalls/peakконкуренции сохранить в deterministic evidence/логах; не live/browser/mobile proof. Не добавлять новый геокодер. Запустить focused/fullgate и обязательную проверку сборки для новой test-only части, сохранить отдельный DONE и обычныйCI, verify exact remote. Повторно long route corpus не запускать вручную. При ошибке зафиксировать input/error и исправить этот контракт либо оставитьявныйblocker, независимые цены/км не трогать.

Следующий шаг: только этот endpoint regression, без повторного запроса пользователю. Backup/main/Production/Android не изменены. KM-001/002, TARIFF-001 и10сE2E остаются отдельно в BLOCKERS.md. Состояние durable подтверждается последующим readback, selfSHA не встраивается.
