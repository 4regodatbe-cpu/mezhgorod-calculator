# B04 DONE — exact OSM coordinate/topology intake

Статус: DONE для OSM identity/topology; `BLOCKED_BY_DATA` для official km/operator scope/fare. 24.10.2026 22:01 МСК.

STARTED: [2026-10-24-215900](2026-10-24-215900-b04-osm-coordinate-intake-STARTED.md). Source/parent: `7d3f84d4f27e12fe18bbee8623f27c637aeae0e0`; ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 draft.

## Результат

Ровно шесть primary OSM API GET завершились HTTP 200. Сохранены raw JSON, response metadata, ODbL attribution, reviewed manifest и SHA-256:

- entry node `4443232947`: `47.5105556, 39.9708171`; incoming way `447135768` заканчивается этим node (index17/18), outgoing way `1182567076` начинается им (index0/3), `ref=М-4`, `toll=yes`;
- exit node `358467208`: `48.1863030, 40.2658780`; incoming way `1211606940` заканчивается этим node (index4/5), outgoing way `28835034` начинается им (index0/10), переход `М-4 → Р-260`.

Evidence: [README](../../experiments/road-ref-boundaries/checks/2026-10-24-b04-osm-coordinate-intake/README.md) · [capture metadata](../../experiments/road-ref-boundaries/checks/2026-10-24-b04-osm-coordinate-intake/capture-metadata.json) · [reviewed identity](../../experiments/road-ref-boundaries/checks/2026-10-24-b04-osm-coordinate-intake/reviewed-identity.json) · [verification](../../experiments/road-ref-boundaries/checks/2026-10-24-b04-osm-coordinate-intake/verification.json).

## Проверка и границы вывода

Focused offline verifier: PASS, 15 assertions, 0 live requests. Проверены exact IDs/coordinates, directed end→start membership, road refs/toll tag и fail-closed поля `runtimeEligible:false`, `officialKilometre:null`, `operatorScope:null`, `fare:null`.

Route replay, full audit, router requests, build и runtime/tariff mutation checks — NOT_RUN, поскольку runtime code/data не менялись. OSM identity не является официальным километром или операторским tariff crosswalk. Никакая цена/zero не назначена; `data/road-kilometrage.json`, runtime boundary register и switches не менялись.

Следующий шаг: независимый B10 bounded recovery незавершённого V2 compare Ейск/Майкоп только по сохранённому STARTED и тем же контрольным входам; сначала установить/проверить минимальные зависимости и точный runner без общего regression audit. B05–B09 остаются data-blocked до новых первичных документов.
