# B04 STARTED — exact OSM coordinate/topology intake

Статус: STARTED, 24.10.2026 21:59 МСК.

Parent/source: `c8b4402086535dad483b2df0ae38be909d4c84ca`; ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 draft.

## Ограниченный вход

Получить ровно шесть текущих primary OSM API объектов для уже доказанной pending-пары М-4:

- nodes `4443232947`, `358467208`;
- ways `447135768`, `1182567076`, `1211606940`, `28835034`.

Один GET на объект, без retries сверх транспортного `--retry 1`, общий timeout каждого запроса 20 секунд. Сохранить raw JSON, response headers/status, UTC capture time и SHA-256. Источник: `https://api.openstreetmap.org/api/0.6/{node|way}/{id}.json`, лицензия ODbL/OSM attribution.

## Ожидаемый выход и запреты

- Подтвердить exact coordinates двух nodes и направленное членство каждой границы в паре ways.
- Reviewed manifest хранит `officialKilometre:null`, `operatorScope:null`, `fare:null`, `runtimeEligible:false`.
- Не менять live pricing, `data/road-kilometrage.json`, runtime boundary register или feature switches.
- Не выполнять route replay, массовый аудит или запросы к маршрутизаторам.

## Проверка и восстановление

Focused offline verifier должен проверить IDs, node membership/order, требуемые road refs/toll tags и fail-closed поля. При частичном HTTP/source failure сохранить полученные raw и статус BLOCKED, не угадывать пропуски и не повторять всю серию. После результата: DONE/BLOCKED checkpoint, WORK_LOG/NEXT_STEPS/WORK_STATE, commit, non-force remote update и exact readback.
