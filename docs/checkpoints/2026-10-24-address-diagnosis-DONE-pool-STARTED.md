# DONE diagnosis / STARTED request-pool — 24.10.2026 МСК

Продолжение по текущему NEXT_STEPS, source deed213c738a6744496841a1ed59e135a48b06fd/tree77aebac07211c115ebb830758cb097ec84c7ffbb, PR14open/draft. Remote head совпал с clean tracked checkout, untracked node_modules сохранён. AGENTS/WORKFLOW/CHECKPOINT и актуальный handoff прочитаны. Километраж/тарифы/готовые captures не пересчитывались.

## Блок1 — диагноз DONE

app/api/suggest/route.ts запускает Promise.allSettled над всеми variant URLs одновременно. lib/photon-address-search.ts возвращает7 запросов для Донецк/Краснодар/Москва/Ростов/Ялта,12 для Макеевка/Изюм/Харьков,13 для Тарасовка; все обращаются к одному origin photon.komoot.io. Это варианты поиска в одном сервисе, а не независимые резервные провайдеры. Исходный timeout каждой fetch20с, ответ ждёт всех. Общего server concurrency limit/single-flight/cache/circuit нет. Next revalidate300 и client positive cache128/5мин уже есть, они не ограничивают всплески уникальных префиксов. Исходные counts с live0: [diagnosis.json](../../experiments/road-ref-boundaries/checks/2026-10-24-address-pool/diagnosis.json).

AddressField один для A/B, debounce350мс и abort при изменении/очистке уже реализованы; proxy /r передаёт caller signal. Отдельный детерминированный defect «только полеБ» не установлен. Сбои503/timeouts наблюдались в прежних сохранённых CI и остаются отдельным фактом. Избыточный fan-out увеличивает нагрузку и ожидание; не утверждать, что это доказанная единственная причина503/бана.

Официальный README https://github.com/komoot/photon/blob/master/README.md (web24.10): public demo ограничивает интенсивное использование и не гарантирует доступность. Новые live Photon запросы в этом разборе0. Будущий local pool — смягчение, не обещание исправить внешний сервис.

## Блок2 — STARTED, ограниченный модуль

Отдельный lib/photon-request-pool.ts: не больше2 одновременных запросов на тёплый server process, ограниченная очередь, positive-only LRU cache128/5мин, single-flight по точному URL. Caller cancellation отсоединяет только своего подписчика; последний отменяет общий запрос/очередь.503/429 вызывают короткую origin cooldown15с, а не повторный fan-out. Cache доступен при cooldown. Нет новых геокодеров/платных сервисов/придуманных координат и общих глобальных guarantees между serverless replicas.

Отдельный coordinator lib/address-search-service.ts: прежние URLs и rankPhotonFeatures сохраняются; общий budget20с, включая очередь, без продления прежнего worst-case. Сохранять успешно завершённые источники при частичной ошибке. Все failures остаются502, не «адрес не существует». Пустые/ошибочные ответы не кэшировать. Один switch addressRequestPool в data/toll-feature-switches.json и одна интеграция endpoint. Labels/приоритеты/фильтрация/координаты не менять. Старый20сdeadline сохраняет проверенный slow prefix11.3с;10сE2E маршрута этим этапом не обещается.

Часть блока2 включает focused contracts: bounded concurrency, shared cancellation, queue cancellation, cold503/429 breaker, positive cache/TTL, partial success, total budget, отменённый старый префикс и последующий новый запрос. Исправить низкоуровневый pre-aborted вызов, если контракт подтвердит ненужный fetch. Перед сохранением focused tests/ESLint/обязательные full gate/build, structured diagnostics без query/URL/raw error в логах. Raw city counts публичные тестовые примеры.

## Блок3 — следующий после durable блока2

Проверить endpoint /api/suggest и POST/r на сценарии Анапа→Краснодар→Ростов→очистка→Донецк с deterministic provider mocks и отменой устаревшего запроса, плюс оба поля/общие same-URL subscribers на service contract. Это не live/mobile/browser proof. При устойчивом полном gate сохранить итог/limitation; не запускать прежний весь live route corpus. Разбить только незаконченный остаток при сбое; никакой перекладки ошибок в успешные тесты.

Сохранение блока1 и STARTED — docs/evidence-only commit с [skip ci], чтобы не повторять весь неизменившийся live аудит ради документации; source CI сначала дождаться completed, не отменять/не дублировать. Фактический head/tree/readback проверяются после update. Следующий code commit запускает обычный CI. Если persistence не прошёл — не развивать следующий блок.

Незакрытые причины: availability источника/состояние real phone UNVERIFIED; ADDRESS-001 не закрыт одним count. Нет Production/main/merge/Android, backup не изменяется. Новые module errors/stops и ограничения — experiments/road-ref-boundaries/BLOCKERS.md. Текущий запрос разрешает последовательные этапы этого исправления без очередной команды пользователя.
