# Архив 3/3 — V3 RC1 до Production

Статус: полный физический архив создан и проверен локально и на GitHub-hosted runner. [Отдельный исторический prerelease](https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/tag/archive-pre-release-v3-source-2026-10-31) содержит [source.tar.gz](https://github.com/4regodatbe-cpu/mezhgorod-calculator/releases/download/archive-pre-release-v3-source-2026-10-31/source.tar.gz). Это не релиз приложения и не Android Release. [Манифест](manifest.json) и [описание архива](RELEASE_NOTES.md) сохранены в рабочем дереве.

Ветка: [archive/v3-rc1-before-production](https://github.com/4regodatbe-cpu/mezhgorod-calculator/tree/archive/v3-rc1-before-production)  
Точный SHA: `cde74243c88cfab313913d8b0435e8d56fae372e` (RC1 с проверками Preview).

Отличие от V1 Release: до выпуска GeoNames ограничивался Preview; в Production были добавлены два явных серверных флага. Снимок пригоден для сравнения и отката разработки, но не заменяет текущий Production.

Никакие тарифы/геометрию/маршруты в этот архив не модифицировать.

`source.tar.gz`: 343 730 585 байт, SHA256 `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`; 14 042 файла сверены по Git blob SHA с исходным tree `c3e6cc8a5a8931952f7a230cc8269d2d41f28bf2`. [Actions run 41241619408](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41241619408) воспроизвёл тот же сжатый файл, загрузил asset и скачал его для побайтового `cmp` и SHA256; GitHub Release API сообщает тот же размер и digest. Локальный исходный экземпляр остаётся в `/workspace/reorg-handoff-2026-10-31/pre-release-v3-source.tar.gz`.
