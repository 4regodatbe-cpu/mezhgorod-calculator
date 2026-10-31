# Архив 3/3 — V3 RC1 до Production

Статус: полный физический архив создан и проверен **локально**, но GitHub Release asset пока BLOCKED ответом `uploads.github.com` HTTP 401 Bad credentials. Владелец явно разрешил публичную загрузку; `gh release create` не сохранил release/tag/asset. [Манифест](manifest.json) и [описание подготовленного архива](RELEASE_NOTES.md) сохранены в рабочем дереве; ссылку на удалённый архив добавлять только после фактической загрузки и readback.

Ветка: [archive/v3-rc1-before-production](https://github.com/4regodatbe-cpu/mezhgorod-calculator/tree/archive/v3-rc1-before-production)  
Точный SHA: `cde74243c88cfab313913d8b0435e8d56fae372e` (RC1 с проверками Preview).

Отличие от V1 Release: до выпуска GeoNames ограничивался Preview; в Production были добавлены два явных серверных флага. Снимок пригоден для сравнения и отката разработки, но не заменяет текущий Production.

Никакие тарифы/геометрию/маршруты в этот архив не модифицировать.

Локальный `source.tar.gz`: 343 730 585 байт, SHA256 `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`; 14 042 файла сверены по Git blob SHA с исходным tree `c3e6cc8a5a8931952f7a230cc8269d2d41f28bf2`. Локальное расположение: `/workspace/reorg-handoff-2026-10-31/pre-release-v3-source.tar.gz`. Это расположение не является постоянным GitHub-хранилищем.
