# DONE — контракт отключаемого поиска населённых пунктов, 24.10.2026 МСК

Parent `497cb4588d29192c2a60ab8f4dece7750f3f3112` / tree `fbcce3ff8631ba099b92388f727c0ec5a14642a0`, ветка `fix/v3-missing-route-prices-2026-10-15`, PR №14 draft. Независимый **read-only** обзор совместимости после GeoNames pilot DNS BLOCKED. Цель — определить безопасную точку будущей интеграции, не активируя непроверенные координаты.

Проверены без исполнения/сети: `lib/address-search-service.ts` blob242f5435ea474a5b460858c2e16f18b0aa4ea8d3, `lib/photon-request-pool.ts` blob4faabbb555cc098d3cbeb0a41726613a51f9452e, `lib/photon-address-search.ts` blob11a13cf6b53dce6c3e47bc702bf6e6cdb4a99cc6, `app/api/suggest/route.ts` blob35af922c31bf2e0af7cd4209751296624a6a6a57, `app/v2/components/types.ts`, `data/toll-feature-switches.json` blobeb1d77c33ed6b45c4334996f0eda3cac08d041da, `lib/address-suggestion-cache.ts` blobee6b70b2538c36a08ba71c68d5b16d6a569a67c6.

Результат: [отдельная спецификация / технические контракты](../../experiments/road-ref-boundaries/SETTLEMENT_FALLBACK_INTEGRATION.md). Подключение на уровне `/api/suggest` только при полной недоступности Photon, опционально и off-by-default, без изменения Photon ranking, с `Suggestion`-типом, geonameid+admin дифференциацией омонимов, fail-closed отсутствующих/некорректных координат, no houses. Модуль **не реализован**, новый switch **не добавлялся**, candidate dataset **не импортировался**.

Checks: 7 точечных file reads, source/type/interface consistency review. Не запускались unit/build/lint/runtime/live, скачиваний0. Последняя source проверка Pilot A DNS blocked; B/C NOT_STARTED. Чужие 887/887 tests из прежнего коммита не объявляются повторёнными.

Сделанные изменения: только этот checkpoint, design spec, handoff, NEXT_STEPS, append-only WORK_LOG (все docs). Причина отдельного шага — не блокировать проект пустым ZIP/Photon503 и не связывать ещё неизвестный источник с runtime. Следующий шаг: только после нового сетевого доступа вернуть Pilot A bounded HEAD; либо независимая задача, не требующая GeoNames, из действующей очереди. Сохранение будет подтверждено remote commit/tree/file blobs.
