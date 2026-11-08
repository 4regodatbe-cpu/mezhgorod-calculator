# p214 orphan исправлен и проверен: собственный Торжок → Москва получает полный estimate

18.10.2026. Parent `2ce7b121d83538db67560f5f3c1cd91c44bb96e6`, tree `1d5cf846f6ecf682a3a1351a3a0b3ea3b4699dd5`. Durable STARTED/readback подтверждены, PR14 открыт/draft. Предыдущий codeCI39122753013 завершён: verify/live_probe оба success; ожидание всех jobs соблюдено до записи STARTED. Подробный job snapshot сохранён.

## Причина и изменение

Безымянный event5286168661/way766468434 на своём выбранном маршруте создавал дополнительный `unknown-paid-road`, хотя его directed physical принадлежность М11 уже доказана первичными источниками и использовалась строгим p214 matcher. Южная именованная рамка классифицировалась правильно; другая физическая платная система на этом собственном маршруте не обнаружена.

В `m11-p214-entry-boundary.ts` экспортированы exact node/way из уже сохранённого physical snapshot. В `unpriced-road-coverage.ts` только их точное сочетание получает идентичность M11. Ставки/таблицы/выбор маршрута/дистанционные пороги не менялись. Идентичность дороги не определяет тариф или бесплатность; entry/head/дата/полнота trace продолжают проверяться отдельными строгими алгоритмами. Соседние nodes, wrong/missing ways, дополнительный неизвестный booth и неполныйtrace сохраняют блокировку.

## Фактический результат

`single-m11-torzhok-to-moscow`, собственный retained selected Valhalla captureSHA11c1ccb9…72b798: Thu09:00/Thu23:59 —2380₽, Fri—2650₽, Sat—2890₽, Sun—3040₽; missing=[] во всех пяти профилях. Это новые проверенные полные расчётные оценки одного маршрута, не независимые подтверждённые операторские ODтарифы: `priceConfirmation=unconfirmed`, подтверждённых полных тарифов0. В отличие от предыдущих компонентов, сейчас quote/верхний API не имеет оставшихся unknown для этого собственного случая.

Публичный POST `/api/v3/calculate` на собственных сохранённых ответах провайдеров/trace вернул2380₽ и `pricingStatus=priced`, с точными собственными meters/seconds и Valhalla. При недоступномtrace returnedamountnull/statusunknown. Replay соответствует request keys и не имеет misses; реальной сети0. В API по существующей политике confirmationmetadata не выводится; никакая новая гарантия цен не добавлена. Другие p214выходы не получили Moscowhead.

## Проверки

- Focused28/28PASS: exact identity, wrong/missing node/way, extra orphan, incomplete/failedchunks, missing/duplicate entry, отсутствие строгого evidence; актуализирован ownheadtest на полную не подтверждённую оценку; legacy unknown/regional/free/Planernaya controls сохранены.
- `npm run build` под timeout300s: exit0, audit771/771, quote/API contractsPASS, Next/TypeScript/static16/16PASS.
- `tsc --noEmit`, targeted ESLint, `git diff --check` — exit0. Точные команды/codes в statusJSON, gzлоги/SHA и итоговые профили в `checks/2026-10-18-m11-p214-orphan/result.json`.
- Новых sourceGET/routing/trace запросов0. Готовые364inventory/physicalsourcepasses/общие41/15аудиты не повторялись. Существующие regression cases выполнены из-за изменения классификатора и ожидаемого публичного поведения, не как новый широкий routeaudit.

## Сохранение и следующий шаг

После записи: exact remote head/tree/PRreadback и отдельный новый codeCI; пока он active, второго writer не запускать. Не объявлять этот новый CI успешным до фактического завершения. Main/merge/Production/Android не менялись.

NEXT после codeCI: короткий offlineразбор собственного `pair-m11-ckad-torzhok-to-ramenskoe` — остаточный head58→ЦКАД и exact southbound gate8087316064/way1270188041 по уже retained `2026-10-18-ckad47-entry/entry-local-map.osm`. Сначала проверить направленные source definitions и собственный strict end/exit, не переносить северный въезд8087316065 или Москву на иной продукт. Только при конкретном evidencegap отдельный bounded sourceSTARTED/GET. Готовые4p214mainlinecases и их источники не повторять. Другие общие причины и operatorblocks остаются открыты; этим одним полным estimate они не закрываются.
