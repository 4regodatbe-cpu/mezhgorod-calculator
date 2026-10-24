# ADDRESS-001: проект отдельного `settlementFallback` (DESIGN ONLY)

Статус: **DESIGN_REVIEW_DONE / IMPLEMENTATION_NOT_STARTED**, 24.10.2026. [Source candidate](../../docs/checkpoints/2026-10-24-address-coordinate-source-intake-DONE.md), [Pilot HEAD DNS BLOCKED](../../docs/checkpoints/2026-10-24-address-geonames-head-DNS-BLOCKED.md). **Никаких импортированных координат сейчас нет**.

## Подтверждённые интерфейсы на commit `497cb4588d29192c2a60ab8f4dece7750f3f3112`

- `app/api/suggest/route.ts`: query length 3…200, `collectAddressFeatures(q,{signal:request.signal})` → `{features, sourceCount, failures, budgetExpired, unavailable}`; при `unavailable` сейчас 502, иначе `{items:rankPhotonFeatures(...)}`. Именно здесь *предлагается* future opt-in fallback, без касания расчётного API.
- `lib/address-search-service.ts`: `ADDRESS_SEARCH_BUDGET_MS=20_000`, `photonSearchUrls`, `pool.get`; существующие provider failures/cancel/partial semantics оставить неизменными.
- `lib/photon-address-search.ts`: ranking Photon/территориальные полигоны; не конвертировать GeoNames в фиктивные Photon/OSM объекты и не менять текущий порядок Photon.
- `app/v2/components/types.ts`: `Suggestion = {id,title,region,label,position?:{lat,lng}}`; совместимый внешний тип результата. `position` для выбора маршрута обязателен по смыслу; name-only запись не становится selectable.
- `data/toll-feature-switches.json`: существующие `roadKilometrage`, `addressRequestPool`, `calculationTiming`; предлагаемый отдельный `settlementFallback: false` может появиться только в отдельной code-implementation checkpoint.

## Будущий контракт, НЕ реализован

`loadVerifiedSettlementSnapshot(): {status:"ready", version, license, generatedAt, records} | {status:"unavailable",reason}`

`searchSettlementFallback(query, {signal, maxItems, budgetMs}): {status:"ready"|"no_match"|"ambiguous"|"unavailable"|"cancelled", suggestions: Suggestion[], source:"geonames_offline" | null, snapshotId?:string, reason?:string}`.

- Снимок: отдельный versioned artifact, manifest с source download URLs/ISO country/code, dump date, SHA-256, import script version, record count, size bytes, `CC BY 4.0` notice и трассировкой фильтров. Не кодировать исходные benchmark точки как настоящий source. Валидатор reject на отсутствие версии/лицензии/контрольной суммы/невалидную WGS84.
- Запись: `geonameid` (стабильный identity), names/ru aliases по подтверждённой `alternateNamesV2`, `featureClass=P`, featureCode, `countryCode`, admin1/admin2, `latitude`/`longitude`, modificationDate. CountryCode не определяет принадлежность к специальной зоне; отображение определяется координатой + проверенным локальным полигоном, причём при неоднозначной границе не делать уверенного override.
- Результат: `id="geonames:<id>"` — отдельное пространство от OSM/Photon; `label` содержит название и достаточный район/область для омонимов, `title` и `region` — локализованные/верифицированные поля, `position` лишь при валидном source-coordinate; `maxItems` и deterministic sorting. Не выбрать геопозицию первого одноимённого без показа кандидатов.
- Семантика: только после `unavailable === true` Photon (полный отказ) **и** `settlementFallback` explicitly enabled с reviewed snapshot; частичный успех Photon и пустой, но успешно отвечающий Photon не меняют текущую выдачу. При snapshot absent/ambiguous/no verified position не выдавать непроверенную подсказку, оставить 502 + диагностическую причину. Пользователю нельзя показывать улицы/дома из поселкового снимка. Успешную выдачу маркировать origin для diagnostics/attribution.
- Отмена и время: respect `request.signal`, без сетевых запросов, ограниченная память/размер индекса, без дополнительных fetch в горячем пути. Локальный budget — часть исходного request budget, не новый плюс20с после таймаута. Без вычисления платных тарифов/маршрутов.
- Отключение: switch `false` → byte-for-byte прежний Photon path и 502 on full source failure. При исходной ошибке/сломанных обязательных gates выключить модуль, а не расслабить checks.
- Атрибуция: GeoNames credit + URL источника, ссылка CC BY4.0 и изменения/дата версии должны отображаться в справочной информации приложения, не только во внутреннем файле.

## Условия перехода к реализации

1. Отдельный уже созданный [Pilot STARTED](../../docs/checkpoints/2026-10-24-address-geonames-pilot-STARTED.md); pilot A DNS-blocked, B/C не начинались.
2. После доступности download — HEAD/size/checksum и выборка действительно сохранённых RU/UA records (с приоритетными полигонами, омонимами и русскими aliases), подготовка manifest, независимая attribution audit. Не внедрять пустую/выдуманную базу.
3. Перед **code implementation** — ещё один подробный STARTED, и только потом feature flag off / focused mocked tests (unavailable, partial, cancel, ambiguous, stale, missing checksum, no houses), regression /api/suggest, existing 887+ full tests, ESLint/TS/webpack/static gate.
4. Сначала code review, долговременное сохранение и readback; включение в live отдельно после доказанной точности/политики и прямого разрешения релиза. До того ADDRESS-AVAILABILITY остаётся BLOCKED_BY_SOURCE/ENVIRONMENT.

Это **не** собственная дорожная сеть, не импорт геометрии дорог, не утверждение исправленного поиска.
