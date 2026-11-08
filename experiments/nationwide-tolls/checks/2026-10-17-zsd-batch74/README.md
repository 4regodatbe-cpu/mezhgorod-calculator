# Пакет74 сохранённых случаев ЗСД — результат

74/74 исходных capture прочитаны с проверкой SHA256, 148 component/date проверок. **24 случая: ЗСД600 ₽**, **50 случаев: unknown/null**. Ошибок выполнения0. Все74 trace и booth coverage complete. Новых live/provider requests0, новых full-route replay0. Полные итоги поездок этим пакетом не пересчитывались; source-derived600 не independent operator OD receipt.

До пакета текущая правка была проверена на Гранитном (full replay2даты) и Брянке (component2даты). Вместе **26/76 baseline ZSD-компонентов** теперь проверены как рассчитанные; **50/76** остаются unknown на этой версии. Проверки всех76 выполнены, но они не равны76 исправлениям или подтверждённым полным тарифам.

## Воспроизведение

Source code head `3ae7761fc0cebccc72777f487c5af8ca0b926665`; remote STARTED `7f6e6b8a4488bc3ee0aa4ce760b727b03b57f28b`. Runtime/тарифы между ними не менялись. Полный checkout содержит все capture; в sparse checkout сначала materialize точные input.capture из Git (`git show HEAD:<path>` в файл), сверить input.sha256. Не искать маршруты заново.

`node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/check-zsd-saved-batch.mjs`

Входы — inputs.json. По каждому caseId отдельный cases/*.json, progress.json для продолжения, summary.json с hash каждого результата и точными hashes runtime/readiness. На повторе совпавший runIdentity переиспользует ранее записанный результат; при изменении кода/входов/скрипта откажется смешивать версии. Для чистого повторного исполнения использовать отдельный checkout/output-каталог после сохранения исторических результатов. Скрипт не вызывает route providers и не изменяет captures.

Node syntax PASS, full audit704/704 + quote/API checks PASS, tsc PASS, Next build PASS. Первоначальная ошибка full audit — отсутствующий tracked A289 fixture в sparse checkout; fixture восстановлен из точного Git object и gate повторён. Все исходные/итоговые логи сохранены. Один transport bulk-fetch blob IDs не сработал; git show с4 bounded readers получил все74 capture, SHA проверены. Это транспорт Git, не новые маршрутные проверки.

## Группы физических входов

Это fingerprints paid-way/ordered-booth evidence, **не разрешение тарифа по одному fingerprint**. Каждый рассчитанный случай прошёл реальные guard текущего компонента на собственной полной геометрии. 12групп всего: одна рассчитана,11остаются за границами поддержанного вектора. Первая оставшаяся группа содержит9случаев; следующие действия — точная первичная привязка её направленного законченного проезда, а не9повторных live-запусков.

| Fingerprint | Случаев | Ways | ПВП OSM IDs | ЗСД | Представитель |
|---|---:|---:|---|---|---|
| `5538ef824506` | 24 | 26 | 933974870 | 600 ₽ | `lnr-лисичанск-saint-petersburg-center` |
| `0c0e778a8622` | 9 | 55 | 933974870,1766158781 | unknown | `max-chain-m12-ckad-m11-zsd-arzamas-to-prim` |
| `258ee8abe705` | 7 | 76 | 933974870,1766158812 | unknown | `max-chain-m12-ckad-m11-zsd-kazan-to-sest` |
| `1e954c437e46` | 8 | 67 | 1766158804,933975069 | unknown | `max-chain-m12-ckad-m11-zsd-sest-to-kazan` |
| `3493d8c10e8b` | 5 | 76 | 933974870,1766158809 | unknown | `max-chain-m4-ckad-m11-zsd-krasnodar-to-sest` |
| `3404a9c7bbd6` | 4 | 67 | 5745105499,933975069 | unknown | `max-chain-m4-ckad-m11-zsd-sest-to-krasnodar` |
| `2c00c1cc6c1d` | 7 | 38 | 933975069 | unknown | `pair-m11-ckad-spb-to-domodedovo` |
| `5733fbb44c1c` | 6 | 50 | 1766158781,933975069 | unknown | `pair-m11-zsd-prim-to-moscow` |
| `e9966bcae780` | 1 | 36 | 1766158781 | unknown | `single-zsd-blag-to-prim` |
| `94943ad7caf7` | 1 | 57 | 1766158809 | unknown | `single-zsd-blag-to-sest` |
| `31bded062e92` | 1 | 56 | 933974870,1766158781 | unknown | `single-zsd-peterhof-to-prim` |
| `d3776069805a` | 1 | 51 | 1766158804 | unknown | `single-zsd-sest-to-blag` |

22 unknown случая возвращают zsd_finished_vector_scope_not_reviewed (основной ПВП есть, путь выходит за reviewed26ways);28 — zsd_trip_extends_outside_reviewed_zone1. Это ограничение текущих готовых векторов, не доказательство дефекта геометрии и не разрешение подставить600 всем. Порядок next: один representative для группы9 КАД-юг→Приморский, затем остальные группы по числу затронутых случаев и пользовательскому влиянию; первично подтвердить owner scope и правила связанной оплаты. Неподтверждённые цены не добавлять.
