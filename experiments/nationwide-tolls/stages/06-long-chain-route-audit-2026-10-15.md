# 2026-10-15 — аудит длинных цепочек платных дорог

## Запрос и исходное состояние
Пользователь предложил построить длинные маршруты через несколько платных дорог: Казань–Санкт-Петербург и Краснодар–Санкт-Петербург через Москву и другие дороги, чтобы найти конкретные места отказа. Работа на fix/v3-missing-route-prices-2026-10-15, parent29a7c4d; предыдущий codecommit972a35a. Сохранение GitHub ранее отклонено автоматической review, разрешение экспорта ещё не получено; повторного push/обхода через connector не было. Все результаты этого блока сохранены в локальном Git.

## Метод и реальная выборка
`scripts/v3-long-chain-audit.mjs` вызывает настоящие Valhalla/OSRM/BRouter, применяет production isUsableRoute/followsPlan/stretch/territory checks и тот же fastest selector. Затем проверяет полную выбранную геометрию через validateTollEdges и вызывает реальный V3 calculateLegTolls. Тестовые routing controls обеспечивают указанную цепочку; это audit harness, а не поддержка пользовательского via в API. Provider/query responses, точная выбранная геометрия, strict spans и trace сохранены gzip; копии ответов не используются в live выборе или ценах.

Выполнены 8 живых прогонов 7 разных цепочек. Все ожидаемые семейства обнаружены. Основная дата2026-10-13T09:00+03:00 выбрана для отдельной проверки географии без немедленного перехода в пятничный профиль. Смена профиля проверена отдельно на той же записанной геометрии2026-10-15T22:30+03:00:16 offline replays (2 на каждый живой снимок), JSON всех16 прочитаны/проверены. Offline replay запрещает внешние запросы без записанного ответа, сохраняет порядок повторных ответов одного requestkey и не подменяет incomplete trace полной.

| Цепочка | Доказанный результат локализации |
|---|---|
| Казань–Москва–СПб | М12 готовая пара3513; headМ11 880 и mainline3900; хвост679–684/ЗСД unknown. Первый live trace incomplete из-за429; повторный live complete, неизвестны толькоtail/ЗСД |
| СПб–Москва–Казань | М11head1130/mainline3900, М12 3513; tail/ЗСД unknown |
| Краснодар–Москва–СПб | М4 5040, М11head1130/mainline3900; unnamedbooths локализованы; после fix неизвестныtail/ЗСД |
| СПб–Москва–Краснодар | Те же семейства, готоваяМ4 5040/mainline3900; первичная trace incomplete, так и сохраняется в replay, несмотря на исправленные идентичности |
| Казань–ЦКАД–СПб | MainlineМ11 после fix3900; partialhead не доказан; ready pairМ12 на въезде/выездеЦКАД не привязана; текущийCKAD adapter поддерживает full eastarcМ4↔М11, не этот северный отрезок |
| Краснодар–ЦКАД–СПб,11controls | MainlineМ11 после fix3900, М4 5040; CKAD arc_length_out_of_range, partialhead/tail/ЗСД unknown |
| Краснодар–ЦКАД–СПб,3outercontrols | Независимый контроль routing artifacts от частых остановок; М4/mainlineМ11 готовые, CKAD east_arc_not_proven и partialhead/tail/ЗСД unknown |

Эти суммы — известные отдельные компоненты/оценки, не полный маршрут и не новая сертификация тарифа. Семь цепочек не гарантируют полный аудит всех платных дорог России. Конкретные точки/пары/reasons и источники: `source-snapshots/long-chain-2026-10-15/INDEX.json`,live.json и timestamped replayJSON в каждом каталоге.

## Выполненные исправления
1. `lib/v3-calculation/route-leg-pricing.ts` возвращает внутренний read-only componentAudit: список реально обнаруженных продуктов, готовые суммы, missing и reasons. Копии объектов/segment arrays отделены; audit не участвует в eligibility/price и не добавлен в public API DTO. Известные части видны исследователю даже при неизвестном полном итоге.
2. `m11-product-boundaries.ts`/`engine/m11-route-adapter.mjs`: mainline58↔679 определяется независимо от15км московского head. Для нового headless/partialhead пути требуются strictM11 evidence выбранного провайдера, оба физически близких anchor≤120м, порядок/spans и отсутствие malformed. Московский полный путь сохранён. Выявленный partialhead при въезде сЦКАД добавлен отдельным неизвестным продуктом: entry point не выдумывается, Moscow→Solnechnogorsk не назначается вместо него. Основная пара получает собственный платежный clock/window, headless может обходиться без head, partialhead не даёт полный итог. Разделение заново заставляет увидеть хвост679–684 послеЦКАД, ранее скрытый за общим unresolvedmainline.
3. `unpriced-road-coverage.ts` и source-backed node-identities.json: события7014845616 (М11p679),933974949 (ЗСДПВП4),318102347 (ЗСДПВП3),6257559336 (М4ПВП515) не превращаются в неизвестную «ещё одну дорогу». Все новые идентичности подтверждены primaryOSM object/topology или существующим primary архивом. ЗСД рампы связаны через соседние nodes/ways с namedtollЗСД. Старые OSM fee tags ПВП515 не импортированы как тарифы. Нераспознанные IDs/partialtrace остаютсяunknown.
4. `lib/toll-validator.ts`: HTTP429 может получить ровно1 повтор с Retry-After в пределах прежнего18s бюджета chunk. Более длинное ожидание>5s не игнорируется: остаётсяincomplete. Стойкая429, malformed response и неполнота не дают0/полную сумму. Общая неоднократная retry policy не добавлялась. Последний повторный liveКазань tracecomplete без429; нельзя приписывать его успех исключительноretry. Retry действительно проверен отдельнымиunit cases429→200/persistent429/RetryAfter60.

## Проверки и исправленные промежуточные ошибки
- Originalcomponentaudit focused18/18 PASS.
- После расширения M11 initial34 tests33/34: ошибочный partialhead detect у маршрутаp593→679; причина—сравнение indices безphysicalp58 hit. Исправлено requiringp58/p679≤120м дляpartialhead. Повтор34/34 PASS.
- Новый realfixture source test36/37: test наследовал unrelatedcapturedroadNamesМ12, очищены только unrelatedfixturealiases; runtime не ослаблен. Финальный focused38/38 PASS.
- Final command: `node --import ./scripts/register-ts-paths.mjs --test scripts/v3-chain-boundaries.test.ts scripts/v3-m11-products.test.ts scripts/v3-road-evidence-audit.test.ts scripts/v3-ckad-regional-products.test.ts scripts/toll-trace-rate-limit.test.ts`:38/38 PASS.
- Final `npm run build -- --webpack`:635/635 + quote/API + TypeScript/Next PASS, exit0. Relevant stdout в checks/v3-long-chain-build-2026-10-15.log; focused log рядом.
- Targeted eslint changedTS/runner/tests PASS(exit0),gitdiffcheckPASS.
- 16/16 offline replay records inspected; no missingExpected; logs checks/v3-long-chain-replays-2026-10-15.log. All complete-route totals remained unknown when any required product unresolved. This is expected failclosed, not a claim that full trip fares are fixed.
- Captures and post-fix replays separate; newer replay output timestamped, no completed stage report overwritten.

## Незакрыто и следующий конкретный блок
1. Привязать partialheadМ11 на въезде/выездеЦКАД к собственным `tskad↔solnechnogorsk` directed tariffs и точнымphysicalPVP47; МосковскийПВП21 тоже не объявлен закрытым. Требуется факт выбранного crossing, а не только название города.
2. Привязать mainline tail679–684/airport к собственным рамкам и operator rule56/38/94; ЗСДПВП3/4 nowidentified, но base no-transponder/currentzone tariff и связьштмсд/витебскойразвязки ещёне готовы. Не начислять guessed300/56 или aggregate известныхчастей.
3. General CKAD endpoints:М12↔М11 и реальныеМ4↔М11 физические границы вместо full-arconly heuristic; подтвердить operatorcontext120min/defaultmatrix. На этих двух CKAD сценариях М12 exit/operatorpair остаётся не привязан; проверить exactmarkers/newШали/CKADjunction. М11 mainline patch не закрывает эти независимые gaps.
4. Проверить profile switches по paymentevent каждого продукта. Повторные воспроизводимые dates/replays уже готовы; entiretrip M4profile switch остаётсяunknown согласно нынешней модели, не удалять guardбез correct scopedclock.
5. Повторить liveacceptance после sourcebindings и хотя бы1 полностьюpriced multi-roadchain; затем полныйgate. Текущий этап — успешная локализация/кодовые исправления, а не полный выпуск.

Publication: main/Production/Android не изменены, новогоPR/Preview/CI нет. GitHub export остаётсяBLOCKED по предыдущемуauto-review, новыйpush не пытался. Currentfix commit определяется Git history этого отчёта; parent29a7c4d.
