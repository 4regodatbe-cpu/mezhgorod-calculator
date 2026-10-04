# Межгород Calc — текущее состояние и точка продолжения

**Обновлено:** 2026-10-04  
**Ветка:** feat/special-territory-geometry-policy-2026-10-03  
**PR #10:** открыт, draft; base work/remove-v3-runtime-2026-10-02.  
**Последний проверенный code/test head:** 6d0148b15361653de054fe4766b1f851e601b9fc (CI run #23 success). Журнал обновлён после этого commit; актуальный PR head всегда сверять в GitHub.

> В новом чате сначала сверить настоящий PR head и удалённую ветку. SHA выше — контрольная запись, не замена проверке GitHub.

## Назначение

Standalone-калькулятор межгорода; основной интерфейс — V2 (/v2). Текущая работа PR #10 — политика особых тарифных территорий в существующем V2 маршруте и отдельном toll engine.

Основные правила: полные ADM1-полигоны четырёх особых областей; классификация endpoints по координатам; Крым тарифицируется обычно; расчёт по фактической геометрии; особый транзит для обычных endpoints запрещён; неизвестная платность не становится бесплатной; направление при особом endpoint выбирается отдельной routing-зоной красного контура (внутри — Крым, вне — материк). Проверка 50% отменена 2026-10-04. Полный источник — [SPECIAL_TERRITORY_POLICY.md](SPECIAL_TERRITORY_POLICY.md).

## Состояние кода

По исходной реализации commit 4b84291 и последующим исправлениям тайминга (сверять актуальный PR head) реализованы:

- четыре геометрии OCHA/HDX COD-AB v05 с атрибуцией, координатная классификация и API /api/v2/classify;
- split маршрута на обычные/особые километры и ставки 70/80/90/110 ₽/км;
- отдельные mainland/crimea кандидаты, скрытые точки, запрет особого транзита для обычных endpoints;
- Valhalla/OSRM per-leg время и геометрия; смежные special ADM1 участки сводятся в один класс тарифа, субметровые пограничные фрагменты не создают нулевой leg; смешанный до 1 м leg учитывается целиком как special-время (консервативная верхняя граница, не пропорциональная оценка). Проверка остается fail-closed при большей неоднозначности;
- Сравнение времени для допуска Crimea-варианта отменено решением пользователя от 2026-10-04; направление теперь задаёт красная routing-зона.
- хранение ручного режима и ставок, сброс устаревшего результата;
- тесты и workflow .github/workflows/special-territory-policy.yml; в нём добавлен optional live probe Valhalla/OSRM с downloadable JSON artifact. Приложение probe не меняет.

Из handoff для этого кодового commit: заявлено 39 прошедших тестов, tsc --noEmit и next build. Live Краснодар—Донецк: 518.043 км всего, 93.985 км внутри особых полигонов; время для Crimea-кандидата не подтвердилось, вариант скрыт. Это историческая проверка, не новый прогон текущей рабочей копии.

## Следующие действия

1. Расширить live regression по городским парам, регионам и обратным направлениям; Valhalla Крым пока возвращает LEG_CROSSES_ZONE, OSRM прошёл критерий только для одного из двух маршрутов.
2. Проверить end-to-end, что реально выбранный по toll/status OSRM кандидат для Симферополь—Донецк отображается как Crimea-вариант, а Краснодар—Донецк через Крым скрывается.
3. Повторить UI/browser проверку: в прошлом локальный runner не запускался, установка Chromium вернула повреждённый архив; Vercel preview был закрыт 403/login.
4. Сверить стоимость и карточки toll для фактически выбранных кандидатов; проверить регрессии M‑4/A‑289, M‑11, M‑12, ЦКАД и не превращать unknown в free.
5. Продолжить геометрические тесты для пограничных endpoint, разрывов, snap и fallback. Не показывать крымскую альтернативу, когда сравнение любого нужного кандидата не подтверждено.

Последний workflow run #23 (37187265292) для code head 6d0148b15361653de054fe4766b1f851e601b9fc завершился success: 41 tests, TypeScript, Next build и live probe job. Старые run refs ниже остаются историей. Для docs-head 921518c workflow run 37182774170 и Vercel preview check были успешными; Vercel status не означает production публикацию.

## Инварианты и запреты

- Не вливать PR #10, не менять main, не публиковать production без отдельного прямого разрешения пользователя.
- Сохранять toll engine отдельным от цены поездки. Unknown — не 0; неполную сумму нельзя выдавать как полную; freeCandidate — не подтверждённый free.
- V3 runtime удалён по более позднему решению. Сверенные Yandex snapshots — только offline benchmark; запрещены для live fallback, маршрута или passenger price.
- Не использовать адресный текст для выбора тарифной зоны и не показывать «коридоры» как продуктовую подпись.
- Таймаут, сбой, отсутствие данных и незапустившийся тест не являются успешной проверкой.

## Документы по приоритету

1. Этот файл — текущий статус, незакрытые пункты и следующий шаг.
2. [AGENTS.md](../AGENTS.md) — правила продолжения и ведения handoff.
3. [CALCULATOR_HANDOFF.md](CALCULATOR_HANDOFF.md) — API, toll, free-route, регрессии и release gate.
4. [SPECIAL_TERRITORY_POLICY.md](SPECIAL_TERRITORY_POLICY.md) — продуктовые правила PR #10.
5. [PROJECT_DECISIONS.md](PROJECT_DECISIONS.md) — граница V2, V3 removal, offline benchmark.
6. [INTEGRATION_OLD_TASKS_AND_WORK_LOG.md](INTEGRATION_OLD_TASKS_AND_WORK_LOG.md) — подробная OLD-постановка и журнал.

PROJECT_PROGRESS.md датирован 2026-09-29, OPTIMIZATION_MASTER_PLAN.md указывает другую ветку и старый план. Это исторические материалы, не текущий next-step source. Сверять их с этим файлом, фактическим PR head и checkpoint-файлами; не повторять старое «следующее действие» автоматически.

## Журнал изменений состояния

### 2026-10-04 — убираем повторное восстановление контекста

- **Проблема:** рабочие решения и результаты были распределены между чатами, handoff, историческими планами и checkpoints; новые чаты заново искали требования, из-за чего теряли время и могли дублировать/отменять работу.
- **Проверка:** сверены PR/ветка, README, CALCULATOR_HANDOFF, PROJECT_DECISIONS, PROJECT_PROGRESS, OPTIMIZATION_MASTER_PLAN и checkpoints. README направлял только на общий handoff; часть планов датирована раньше и относится к другим веткам.
- **Решение:** этот файл — единственная текущая точка входа. Исторические источники не удалять; читать только по ссылкам и после сверки актуальности. Детальный журнал OLD оставить отдельно.
- **Порядок:** проверить GitHub head → открыть этот файл → прочитать относящиеся к задаче источники → выполнить крупный блок → обновить этот статус и профильный checkpoint вместе с точными проверками → указать один следующий шаг.
- **Критерий:** следующий чат может возобновить работу без старых чатов, отличает выполненное от плана и находит доказательства проверок по ссылкам.


### Результат создания единой точки входа — 2026-10-04

- В одном commit `8844286cc00a7891fb6ba8aca6174f364f4973b4` добавлены корневой `AGENTS.md`, этот файл `docs/WORK_STATE.md` и ссылка с README.
- GitHub Actions run #6 (`37183190982`) для commit `8844286cc00a7891fb6ba8aca6174f364f4973b4` завершился success; Vercel preview check также success.
- Все три файла повторно прочитаны из ветки; README ведёт в WORK_STATE, а карта handoff содержит ссылки на текущую политику, архитектурный handoff, решения и подробный OLD log.
- Код приложения не менялся. Изменение устраняет необходимость заново искать старые чаты при каждом переходе в новый чат.

### 2026-10-04 — аудит следующего этапа: per-leg time rescan

- **Сверка источника истины:** PR #10 открыт, draft, не слит. Перед записью head оставался `035651d3ac72f75a62c9cdf1349d1d9bd806584b`; GitHub Actions `Special territory geometry and pricing`, run #7 (`37183261928`) завершился success.
- **Что просмотрено:** `lib/v2-calculation/special-options.ts`, `lib/special-territory-time.ts`, `lib/special-territory-policy.ts`, `lib/route-providers.ts`, `scripts/special-territory-policy.test.ts`.
- **Подтверждённые проверки реализации:** повторный запрос формирует плечи по фактическим геометрическим долям; проверяются число плеч, непрерывность и совпадение их геометрии с полной геометрией ответа провайдера, чистота каждой плечевой тарифной зоны, положительные сводки, сумма времени/дистанции и прохождение направляющих точек. Неуспех закрывает подтверждение сравнения; пропорциональная оценка времени не применяется.
- **Оставшаяся гипотеза, требующая доказательства:** API-ответ не сравнивает конец каждого плеча с соответствующей скрытой точкой разреза, переданной повторному запросу. Проверка зон может уже отбрасывать перескоки через границу; пока не получен пример, где такой ответ проходит проверку и меняет решение по 50%, это не записывается как подтверждённый дефект.
- **Ограничение этого сеанса:** доступная локальная папка не содержит checkout (нет Git-репозитория); `git ls-remote` не смог подключиться к сетевому прокси. Vercel preview вернул 403 из-за отсутствия разрешения коннектора на проект/команду, а браузер перенаправил на экран входа. Поэтому в этом сеансе исходники не менялись, локальные тесты/сборка и живой запрос не выполнялись.
- **Следующее действие:** получить доступный локальный checkout актуального PR head либо разрешённый доступ к preview; повторить для Valhalla и OSRM реальные запросы с граничными breakpoints; записать входные точки, фактические окончания плеч, зоны, суммы и результат допуска. Затем добавить регрессию только на воспроизводимый ложноположительный случай; при отсутствии такого случая оставить проверку fail-closed и перейти к аудиту платных/бесплатных вариантов и наследуемого toll engine.
- **Статус крымского кандидата:** успешной живой проверки порога 50% по-прежнему нет; работоспособность не заявляется.

### 2026-10-04 — UI, режим и toll статический аудит при недоступности live endpoints

- **Что просмотрено:** `app/v2/components/use-tariff-mode.ts`, `use-v2-calculation.ts`, `result-panels.tsx`, `route-card.tsx`, `lib/v2-calculation/route-leg-pricing.ts`, `free-route-selection.ts`, API/tests special-territory.
- **Результат:** автоматический режим и `modeOverride` передаются отдельно; серверная геометрия остаётся источником состава обычных/особых километров. Для special endpoint UI показывает только выбранные `options` (до двух), а `unknown` toll сохраняется как `null` с предупреждением; карточки `free`/`freeCandidate` там не создаются. Обычный путь по-прежнему проходит через прежний `calculateLeg`/toll engine, новый pricing добавляется поверх его route summary.
- **Проверка незакрытой гипотезы геометрии:** статически не найдено доказательство, что одно лишь отсутствие сравнения повторной геометрии с исходным кандидатом создаёт ложный допуск: суммируются фактические секунды ответных плеч, каждое плечо должно лежать в единственной ожидаемой зоне, геометрия плеч сшивается с геометрией самого ответа, а итоги сверяются. Сценарий остаётся неподтверждённым без реального ответа провайдера.
- **Live-попытки:** отдельное открытие API Valhalla и OSRM в браузере завершилось `ERR_BLOCKED_BY_CLIENT`; Vercel preview ранее возвращал экран входа, connector — 403. Маршрутные ответы в этом проходе не получены.
- **Вывод:** подтверждённого исправления кода пока нет, поэтому код не менялся. CI run #8 на head `e998801d300dceaad203a00c422abfba3d95a13e` завершился success. Следующее действие — получить один доверенный канал live-доступа (локальный checkout с исходящим доступом или разрешённый CI diagnostic run) и измерить реальное поведение обоих провайдеров; не добавлять строгую proximity-проверку без доказанного ложноположительного сценария.
- **Безопасность продукта:** допуск крымского варианта остаётся неподтверждённым; его работоспособность не заявляется.


### 2026-10-04 — живой аудит per-leg breakpoints и rescan

- Источник истины: PR #10 проверен через GitHub; открыт, draft, unmerged. Head перед итоговым журналом — 216a3e3d7a67bf0f99bf79e1a391d48a891f9bc4. Workspace не содержит клона репозитория, поэтому файлы ветки сверялись и обновлялись через GitHub; локальную чистоту/синхронизацию проверить невозможно.
- Инфраструктура диагностики: добавлен optional job live_probe с continue-on-error: true и script scripts/special-territory-live-probe.mjs. Запросы выполняются к Valhalla и OSRM на Краснодар—Донецк и Симферополь—Донецк, для материкового и крымского кандидатов; artifact содержит исходные/повторные summary, per-leg breakdown, смещения endpoints и причины отказа. Script не включён в пользовательский путь расчёта.
- Точная live-проверка: run #10 (37186261853) выполнил 8 кандидатных/provider случаев. Материковые маршруты обоих провайдеров и крымские OSRM ответы достигли ожидаемых контрольных координат (смещения концов плеч 0 м, кроме одной точки 4 м), геометрии и суммы расстояния/времени согласованы. Но начальное число provider legs меньше ожидаемого (LEG_COUNT); один повторный запрос дал геометрически смешанное плечо (LEG_CROSSES_ZONE). Крымский Valhalla ответ остановился на TERRITORY_BOUNDARY_AMBIGUOUS. Ни один случай не подтвердил сравнение special-времени.
- Уточнение геометрии: run #11 (37186372643) добавил разбор зон каждого плеча: обнаружены смены тарифа на переходе route leg (ordinary↔DNR; на крымском OSRM — ordinary↔Kherson и смены между соседними special-polygons). Это объясняет безопасный отказ, но не даёт основания присвоить всё плечо одной зоне.
- Проверка итеративного rescan: run #12 (37186451667) был невалиден как эксперимент повторного запроса: в диагностическом скрипте была неизменяемая переменная; обнаружено и исправлено перед следующим запуском. Run #13 (37186525684) с исправленным скриптом показал, что повторный план добавляет нулевые плечи, и провайдер возвращает LEG_SUMMARY; при маршруте через Крым OSRM пересекает несколько зон. Итерацию убрали из диагностического probe, продуктовую логику не меняли.
- Финальный probe и CI: run #14 (37186649371) — test suite, tsc --noEmit, next build и live probe прошли. Артефакт зафиксировал вырожденные точки плана: minimum control spacing 0.054 м на материковых примерах и 0.003 м для крымского OSRM, с 1 и 3 почти нулевыми отрезками соответственно. Все восемь случаев остались unverified; крымская альтернатива не допускается.
- Вывод и граница доказательств: CI зелёный означает, что сборка и диагностический probe выполнились; optional probe job специально не делает live-провайдерный отказ падением обязательной проверки. Исправление приложения не выпускалось. Главный оставшийся дефект — формирование ожидаемых временных плеч около границ и нулевых участков; порог 50% на реальных маршрутах не подтверждён. Нельзя объявлять крымский вариант работающим.
- Commits в этом блоке: 2b4ef74 добавил probe/workflow; d999d1b — детализацию per-leg зон; 4ad4cd7, b95ccd6 — эксперимент с refinement и его исправление; 216a3e3 — финальная измерительная диагностика. Изменения приложения отсутствуют.
- Релизные ограничения: PR #10 оставлен open draft; merge, production и публикация не выполнялись.


### 2026-10-04 — исправление временных breakpoints и порога 50%

- **Причина из живых ответов:** run #14 выявил ожидаемые/provider leg count mismatch, смешанные плечи у границ и планы с control spacing 0.003–0.054 м. Простое повторение запроса создавало нулевые provider legs. Начальный тестовый фикс поглотил короткую special-вставку в обычное плечо с неверным ожидаемым классом; CI это поймал, тест и группировка скорректированы до прохождения.
- **Изменение кода:** timing plan теперь сводит смежные административные полигоны к тарифным классам ordinary/special и сливает фрагменты <1 м, сохраняя контрольные точки исходных provider legs. При проверке до 1 м геометрии противоположного класса плечо принимается только как conservative upper bound: всё его время считается special. Никакого деления времени пропорционально километрам нет; больший пересекающийся фрагмент отклоняется. Геометрия и километры для цены не менялись.
- **Исправлен порог продукта:** Crimea special seconds сравниваются с половиной полного времени материкового кандидата. Ранее ошибочно использовалась половина материковых special seconds, что неверно ограничивало допустимый вариант. Добавлены тесты выше/ниже 50% относительно полной длительности и toll filtering.
- **Живое подтверждение после изменения:** run #23, artifact с 8 маршрутами/провайдерами, запросы Valhalla/OSRM:
  - Симферополь—Донецк, OSRM mainland: 52 148 с всего; OSRM Crimea special upper bound: 25 037.8 с; threshold: 26 074 с; 48.0%, допускает Crimea-кандидат по измеренному критерию.
  - Краснодар—Донецк, OSRM mainland: 29 056 с; Crimea special upper bound: 25 037.8 с; threshold: 14 528 с; не допускает.
  - Для обоих маршрутов Valhalla Crimea остался unverified с LEG_CROSSES_ZONE; он не может заменить проверенный OSRM автоматически, если выбран именно Valhalla.
  - Итого, имеется один успешный live пример порога ≤50% (Simferopol—Donetsk через OSRM). Это единичное подтверждение конкретного маршрута/провайдера, не общая гарантия для Crimea routes.
- **Полный CI:** run #23 (37187265292) прошёл. Тесты, включая две regression на соседние special polygons и субметровый фрагмент, TypeScript, Next build и новый live probe — success. Предшествующие неуспешные runs #17/#21/#22 были тестовыми стадиями разработки и исправлены; итоговый run зелёный.
- **Текущий code head:** 6d0148b15361653de054fe4766b1f851e601b9fc. Это код/test head, на котором прошёл run #23; журнал/PR body могут иметь более поздний документационный head.
- **Остаётся:** UI/browser end-to-end закрыт входом Vercel/отсутствием локального checkout; общий live coverage ограничен двумя маршрутами, Valhalla Crimea не прошёл. Проверить end-to-end toll-based выбор именно допустимого OSRM кандидата и скрытие route выше порога.
- **Релизные ограничения:** PR #10 open draft; merge и production не выполнялись.


### 2026-10-04 — same-provider time comparison and expanded live verification

- **Source-of-truth check:** GitHub branch `feat/special-territory-geometry-policy-2026-10-03` and PR #10 head both resolve to `8e3b2fe72c9b1a4b6850883b7458452a70496e09`; PR is open, draft, and unmerged. Base is `work/remove-v3-runtime-2026-10-02`. No local checkout is present in this workspace, so local cleanliness cannot be asserted; the GitHub ref is the verified source.
- **Risk found and fixed:** candidate selection could compare a Crimea duration from one router with mainland duration from another. `TimedCandidate` now carries provider identity; the 50% comparison is formed only from mainland/Crimea candidates returned by the same provider. The winning pair is returned together, so the UI cannot receive a mixed-provider comparison. If no same-provider pair is fully verified, the result stays mainland-only. Added regressions for a rejected Valhalla pair alongside an accepted OSRM pair and for provider mismatch.
- **CI run #29:** [run 37189584038](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/37189584038), tested PR head `8e3b2fe72c9b1a4b6850883b7458452a70496e09`; required `verify` and optional live probe both succeeded. Verify logs report 41 tests, `tsc --noEmit`, and `next build` success. Vercel's preview check is also success and says no unresolved feedback.
- **Expanded live probe:** six endpoint pairs (both directions for Krasnodar—Donetsk and Simferopol—Donetsk, plus both ordinary Crimea—mainland directions), tested against Valhalla and OSRM. All four ordinary Simferopol↔Krasnodar routes were verified with 0 special seconds. Mainland route timing was verified for both providers in both directions for the special destinations. OSRM Crimea candidates for both city pairs and directions were verified. Krasnodar↔Donetsk is rejected: special-zone upper-bound time is 25,037.8 / 25,025.8 seconds against half of mainland time 14,528 / 14,532 seconds; this is 86.2% / 86.1% of the full mainland duration, above the 50% limit. Simferopol↔Donetsk passes for OSRM in both directions: 25,037.8 / 25,025.8 seconds against 26,074 / 26,081 seconds (96.0% / 96.0% of threshold). These are four route-direction observations from one provider, not a general guarantee for all Crimea trips.
- **Valhalla limit:** all four Crimea candidate measurements remain unverified with `LEG_CROSSES_ZONE`, because provider legs traverse multiple zones/boundaries. Fail-closed selection does not expose those candidates. No claim is made that Valhalla can currently verify a Crimea option.
- **Boundary data:** the current branch contains the restored JSON blob (GitHub blob SHA `e0cc0af1d0a69cd52dcce81c6ea66f329c3ebd0b`); CI imports and exercises all four polygon IDs, and the attribution document retains OCHA/HDX COD-AB v05, validity 2025-09-01, CRS84 and CC BY 4.0. No truncation marker is present in the test-loaded geometry.
- **Browser/UI verification:** Vercel created a Ready preview for this head, but opening its URL in the available browser redirects to Vercel login. The connected Vercel protected-preview fetch returned `INVALID_ARGUMENT`; therefore no browser-level interaction against the rendered UI was verified in this pass. Static inspection confirms special endpoint responses expose only the selected options (up to two), no free cards are emitted, unknown toll pricing remains unknown, and regular endpoints retain the existing free-route selection and toll composition path.
- **Release assessment:** automated code checks and live route-policy checks are green, but production readiness is not declared until the protected preview can be exercised through UI or an equivalent authenticated E2E test. Wider routes/areas and Valhalla's boundary-crossing time verification remain limited. PR #10 remains open draft; no merge or production publication occurred.
- **Next chat starting point:** re-fetch PR #10 head and this file, then compare the current source and run refs with this checkpoint. Continue with authenticated UI end-to-end checks when preview access is available; add only evidence-backed regressions. Keep the PR draft; do not publish to production.


### 2026-10-04 — Ялта и Феодосия: живые маршруты и поправка классификации Крыма

- **Запрос пользователя:** проверить Феодосия—Мариуполь и Ялта—Донецк по актуальной политике выбора материкового/крымского кандидата.
- **Сверка источника:** перед изменениями PR #10 был open draft, head `4265082b2e047074dc11828b5f48765a414a7e4b`; ветка указывала на `4265082b2e047074dc11828b5f48765a414a7e4b`.
- **Проверка геокодирования:** свободный Photon-запрос с названиями и регионом неожиданно вернул одноимённый Мариуполь в Смоленской области и Донецк в Ростовской области. Эти результаты отвергнуты. Для route-probe использованы явные городские координаты: Феодосия 45.033669, 35.3753628; Мариуполь 47.1, 37.55; Ялта 44.4987874, 34.1689358; Донецк 48.0156, 37.8029. Координата Мариуполя 47.1 N, 37.55 E сверена с записью UNGEGN (источник координат — NGA GEOnet Names Server). Результат моделирует выбор нужного города в геокодере, но не адрес конкретного дома.
- **Подтверждённый дефект:** исходный приближённый полигон `inCrimea()` ошибочно классифицировал Ялту как находящуюся вне Крыма. Поэтому материковый план не включал мост и Краснодар; оба провайдера отклоняли его как `INITIAL_PLAN_MISMATCH`, из-за чего запрос «Ялта—Донецк» завершался без маршрута.
- **Исправление:** южная кромка routing-only полигона Крыма расширена так, чтобы включить Ялту. Добавлен regression-тест, который подтверждает `inCrimea(Yalta)` и обязательную последовательность материковых контролей: Bridge → Krasnodar → M4 → EAST. Тарифная геометрия особых зон не менялась.
- **CI/live evidence:** run #37 [37191961297](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/37191961297) завершился success: 41 тест, TypeScript, Next build, live probe. Текущий код/test head на момент проверки: `4265082b2e047074dc11828b5f48765a414a7e4b`.
- **Феодосия—Мариуполь:** OSRM mainland 831.1 км / 44,143 с; особые зоны на нём 3,155.7 с. OSRM Crimea candidate 485.4 км / 25,762 с; измеренное время во всех особых зонах 18,394.7 с. Лимит — 22,071.5 с; крымский кандидат проходит с запасом 3,676.8 с и отношением 41.7% к полному времени материкового маршрута. Временная политика допускает обе OSRM-кандидатуры; материковый идёт первым. Последующий toll-фильтр может убрать подтверждённо бесплатную карточку при наличии платного варианта; платность этот route-only probe не измерял. Valhalla mainland geometry/time verified, но Crimea rescan остался unverified (`LEG_CROSSES_ZONE`).
- **Ялта—Донецк:** после исправления OSRM mainland 1,035.7 км / 55,493 с; OSRM Crimea candidate 634.1 км / 34,325 с. Измеренное Crimea-время в особых зонах — 25,037.8 с при лимите 27,746.5 с: проходит на 45.1% материкового времени (запас 2,708.7 с). Временная политика допускает обе OSRM-кандидатуры; материковый идёт первым. Последующий toll-фильтр может убрать подтверждённо бесплатную карточку при наличии платного варианта; платность этот route-only probe не измерял. Valhalla mainland verified, Crimea timing остаётся unverified (`LEG_CROSSES_ZONE`).
- **Граница результата:** геометрии и секунды взяты из живых OSRM/Valhalla ответов для указанных городских точек. В этом route-only probe не рассчитывались итоговые рублёвые цены и платные дороги. Прогон подтверждает эти четыре направления-кандидата, а не любые адреса в городах и не проезжаемость/безопасность.
- **Следующее действие:** сверить новый PR head и обязательные статусы после документационного обновления; далее оценить неоднозначный text-only geocoding отдельно от route policy. Не заявлять, что все Crimean/Valhalla варианты уже проверяются; сохранить fail-closed правило. PR оставить draft; без merge и production публикации.


### 2026-10-04 — Отмена порога 50% и выбор направления по красной геозоне

- **Решение:** населённые пункты внутри красного контура на пользовательском изображении направляются через Крым; населённые пункты вне контура — через материковую часть. Порог 50% отменён.
- **Сверка:** перед правкой ветка и PR #10 совпадали на `7e0024f91fb147db1bac950c102287fb2b1fb37b`; PR открыт, draft и не слит. Локального git checkout в этой рабочей среде нет.
- **Геометрия:** контур со скриншота вручную оцифрован в отдельный routing-only полигон `lib/special-territory-approach-zone.ts`. Геометрия предварительная и приближённая, не официальный слой. Четыре тарифных полигона не менялись. Точка непосредственно на красной границе считается внутри.
- **Код:** особая точка выбирается по координатам: B, если B — особый endpoint, иначе A; если оба особые, используется B. Код генерирует только один кандидат по геозоне и не переключается на другой при неудаче. Из вызовов выбора удалён запрос повторных per-leg времён; тарифное время не влияет на выбор направления. Выбор платной карточки и неизвестный toll остаются прежними по смыслу.
- **Проверки:** локальные тесты/TypeScript/Next build здесь недоступны из-за отсутствия checkout и зависимостей; CI на новом commit должен проверить тесты направления, сборку и live probe.
- **Ограничение:** точность полигона ограничена качеством картинки и ручной оцифровкой. Перед production его нужно заменить или сверить по точному векторному контуру. PR оставить черновым; merge и production не выполнять.

- **Follow-up after first CI start:** removed a duplicate route geometry analysis and made the no-route error direction-neutral, since the preferred candidate can now be either Crimea or mainland. The API message no longer incorrectly calls every failure a mainland failure.

- **CI regression fix:** initial run #38 (`37194754058`) correctly exposed an outdated API test that still expected the removed dual-candidate policy for a Donetsk destination. Updated the test to require exactly one mainland option and verify no bridge waypoint request. 40/41 tests had passed before this fixture was corrected; TypeScript/build were skipped by the failing test gate.

- **Устранение устаревших 50%-helper’ов:** CI на промежуточном head подтвердил тесты и TypeScript; аудит показал, что геометрический модуль всё ещё экспортировал неиспользуемые `qualifiesCrimeaAlternative`/`selectSpecialTerritoryOptions`, а тесты утверждали их порог. Удалил эти API и заменил тесты явным выбором направления, перенёс production-селектор в `lib/special-territory-options.ts`. Добавлены случаи Херсон внутри зоны, Мариуполь вне зоны, включение граничной точки и тест прежнего направления для Феодосия—Мариуполь.

- **CI regression fix:** run #42 (`37195001135`) passed API policy, geometry, and 40 of 41 tests but caught one stale dynamic import of the renamed geographic selector in its selector test. Corrected the import/reference; TypeScript and build had not yet run in that failed attempt.


- **Итоговая проверка кода:** run #43 [37195053298](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/37195053298) прошёл на code/test head `a5f73bc7b8045eff26fc35c8371b21e8d4298430`: 41/41 тестов, TypeScript, Next build, live probe.
- **Живое следствие нового правила:** Феодосия—Мариуполь и Ялта—Донецк обе выбрали материковое направление, так как конечный особый endpoint геометрически вне оцифрованной красной зоны. На обоих примерах Valhalla и OSRM подтвердили маршрут и per-leg геометрию: Феодосия—Мариуполь — Valhalla 859.6 км / 51,035 с, OSRM 831.1 км / 44,143 с; Ялта—Донецк — Valhalla 1,063.7 км / 64,176 с, OSRM 1,035.7 км / 55,493 с.
- **Граница доказательства:** live probe подтверждает выбранное направление и согласованность геометрии для этих координатных точек. Он не измерял цену платных дорог, доступность дорог или отображение карточки через UI. Это тест центров городов, не конкретных адресов. Геометрия красного контура остаётся приближённой.


### 2026-10-04 — Regression pass after keeping routing contour unchanged

- **User direction:** retain the approximate screenshot-traced routing contour exactly as it is; finish the remaining checks. No routing or tariff geometry was edited in this block.
- **Source check:** branch and PR #10 were open, draft, and synced before the test commit. Current tested code/test head: `d8ab5e1d1ad81b77fc1f6359ffe155a00becf4c7`. This workspace has no local Git checkout, so the authoritative source and execution were GitHub branch and Actions.
- **Coverage gap found:** the existing 41-test suite covered representative inside/outside towns and one-special-endpoint route directions, but did not pin down point-inclusion immediately along the red contour or the behavior when both endpoints are in tariff polygons and lie on opposite sides of the routing contour.
- **Test-only change:** `scripts/special-territory-policy.test.ts` now checks a point on the traced contour and points immediately on either side; it also checks Kherson↔Donetsk both ways. With two special endpoints, the destination endpoint determines the preferred corridor: Kherson→Donetsk selects mainland, Donetsk→Kherson selects Crimea. This follows the current documented endpoint rule; it does not change the polygon or routing code.
- **Test fixture correction:** first CI run #45 (`37198031278`, head `314a73778f606455e29c9c7ffb308e57a7739e35`) caught that the test’s proposed “outside” coordinate was still inside the polygon. Replaced it with points around the lower-left boundary segment. No product code was changed in response.
- **Final CI:** run #46 [`37198087343`](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/37198087343) passed on head `d8ab5e1d1ad81b77fc1f6359ffe155a00becf4c7`: 41/41 tests, TypeScript, Next build, and live provider probe. Existing regressions also passed for CKAD production pricing, M11 Moscow, strict M4 route traversal, M1/M3/CKAD/A289 tariff snapshots and evidence contracts, and systemic toll composition.
- **Live route probe:** both providers returned verified route geometry and per-leg timing for the checked examples. Feodosia—Mariupol preferred mainland (Valhalla 859.6 km / 51,035 s; OSRM 831.1 km / 44,143 s); Yalta—Donetsk preferred mainland (Valhalla 1,063.7 km / 64,176 s; OSRM 1,035.7 km / 55,493 s). These are city-center coordinate probes; they do not verify toll totals, road accessibility, or every address. Direction samples in the live probe again selected mainland for the named special endpoints; special-special routing-zone edge behavior is covered by the new deterministic unit test, not by provider live calls.
- **UI status:** the Ready Vercel Preview redirects to Vercel login. Preview interaction could not be tested in this session; no authentication bypass was attempted.
- **Release state:** PR #10 remains open and draft. No merge or production publication occurred. The routing contour remains an approximate hand trace accepted by the user for this release; later city/zone adjustments remain possible.
- **Next step:** obtain an authorized way to exercise the protected Preview UI, then review any remaining release gate without changing the contour unless explicitly requested.


### 2026-10-04 — Production release attempt for V2

- **User authorization:** the user explicitly requested publishing the current result to the working V2 so users can test it. This supersedes the earlier “do not publish without a separate request” hold for this release.
- **V2 target verified:** the public V2 route is `https://mezhgorod-calculator.vercel.app/v2`; it opened without login and displayed the current calculator. Vercel project: `mezhgorod-calculator` (`prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie`). Current production deployment is `dpl_C7ee5VpPpYBsfNrxTGVr63AMA1hx` from `main` SHA `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9`.
- **Release artifact prepared:** ready Git preview `dpl_HDLbQ4Py6oZujosd1XEyB5HVZ6uq` is built from branch `feat/special-territory-geometry-policy-2026-10-03`, SHA `781e36e23d48051479a873fcc5a1ee22ca312f9c`; run #47 passed on this exact SHA (41 tests, TypeScript, Next build, live probe). It is the artifact intended for V2 production promotion.
- **Attempt and blocker:** `vercel_request_promote` first returned 422 without a deployment scope. Supplying the project team scope `team_UFuw0UGXjMqBV2hJBxsWGAMS` and then its slug returned 403: the connected Vercel token is not authorized under scope `4regodatbe-5310` and must re-authenticate to that scope or use a token with access. The promotion did not occur; current production remains on SHA `636e6801...`. No GitHub branch or production setting was changed to work around this access block.
- **PR state:** PR #10 remains open and draft; it is not merged. The branch is still ready for the next attempt after the Vercel connection is re-authorized.
- **Resume action:** after Vercel access to scope `4regodatbe-5310` is restored, re-check latest branch/PR head, verify the matching preview deployment is READY and run #47 (or newer) is green, promote that exact deployment to production, then test `/v2` and a route calculation. Do not substitute the current `main` deployment.


- **Authorization retry after user reconnect (2026-10-04):** verified PR/branch head `3c8c62fbc6969ae7f279b92653eb5e3202917180`, ready Preview `dpl_5t9PzydornM27fRSbCSSVmgRQHFb`, and green CI run #48 (`37199757895`: verify + live_probe success). Retrying promotion with both team ID and slug still returns HTTP 403 for scope `4regodatbe-5310`. Production is unchanged. The Vercel connection in this execution still lacks promotion permission despite the user’s reconnect; next available route is manual promotion from Vercel Dashboard by an account with that permission, or another Vercel connection/token with deployment promotion access. Do not ask the user to share a token in chat.

### 2026-10-04 — повторная проверка доступа Vercel и публикации

- **Сверка GitHub:** PR #10 остаётся open/draft/unmerged; актуальный head ветки — `e52de2889eef9db74c9c86eb9baeed28aa1593b8`. GitHub Actions run #49 (`37199988094`) завершился success. Vercel check на этом коммите тоже success.
- **Готовый Preview:** Vercel API без явного scope прочитал deployment `dpl_GACo8fXJX1g3E2H5F85Zg2o9jM47`, READY, branch указан верно, SHA совпадает с head PR.
- **Попытка Promote:** вызов без team scope вернул HTTP 422 `Resource cannot be processed`; повтор с team ID `team_UFuw0UGXjMqBV2hJBxsWGAMS` вернул HTTP 403, Vercel сообщает, что соединение не авторизовано для scope `4regodatbe-5310`. Следовательно, чтение доступно, но promotion этим подключением не разрешён.
- **Проверка production после неуспешной попытки:** alias `mezhgorod-calculator.vercel.app` всё ещё указывает на READY deployment `dpl_C7ee5VpPpYBsfNrxTGVr63AMA1hx`, ветка `main`, SHA `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9`. Новая версия не опубликована.
- **Возобновление:** в Vercel Dashboard выберите проект `mezhgorod-calculator` в команде `4regodatbe-5310`, найдите deployment `GACo8fXJX1g3E2H5F85Zg2o9jM47` (SHA `e52de288...`) и нажмите **Promote to Production** аккаунтом с правом управления deployments. После этого проверить production alias и `/v2`. Токены и пароли не отправлять в чат.
