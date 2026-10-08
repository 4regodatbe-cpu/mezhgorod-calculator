# Задачи интеграции OLD: handoff и журнал работ

**Подготовлено:** 2026-10-04  
**Репозиторий:** `4regodatbe-cpu/mezhgorod-calculator`  
**Ветка для текущей специальной политики:** `feat/special-territory-geometry-policy-2026-10-03`  
**PR:** #10, черновик. На момент подготовки head был `4b84291f97f289e768fa17ffd951913f6f50e0dd`.

> Это реконструкция поставленных задач и принятых решений по чату «Ветка · Интегра OLD» и связанным handoff-документам проекта, а не дословная стенограмма. Исторические сообщения о прошедших тестах приведены как отчёты предыдущих этапов, а не как результат проверки этого коммита. При расхождении приоритет имеют более поздние решения пользователя, текущие документы политики и фактическое состояние кода.

## 1. Кратко: зачем была начата интеграция

Нужно было довести сегментную тарификацию до работающего пользовательского расчёта в V2. Недостаточно было добавить один модуль или вернуть отдельные поля API: данные должны пройти весь путь от геометрии выбранного маршрута через коридор и сегменты до тарифов, итоговой цены и UI.

**Целевая схема:**

`Маршрут → коридор/направление → сегменты геометрии → тариф каждого сегмента → цена поездки`

Плата за ПВП — самостоятельный слой поверх этой цены поездки. Она не должна подмешиваться в тариф за километр.

## 2. Зафиксированные задачи и критерии

### 2.1. Завершить интеграцию цены по сегментам

- Подключить сегментный расчёт к серверному `/api/v2/calculate`; frontend не должен независимо пересчитывать цену по собственной упрощённой формуле.
- Определять обычную и особую части по геометрии фактически выбранного маршрута и утверждённым правилам коридоров. Не определять тариф по названию населённого пункта, тексту адреса или одному общему километражу.
- Формировать результат отдельно для каждого класса машины и тарифа.
- Возвращать сегментные строки с длиной, типом тарифа, ставкой и суммой; цена маршрута — сумма этих строк.
- Сохранять существующие поля ответа и поведение маршрута, добавляя контракт тарификации: `corridor`, `dualTariff`, `pricingSegments`, `totalPrice`. ПВП остаются отдельным полем/компонентом.
- Применять срочность/множитель к цене по согласованной формуле, не меняя фактическую геометрию и расчёт ПВП.
- Обновлять UI так, чтобы карточки, копирование результата и обезличенная телеметрия использовали серверный сегментный расчёт. Не показывать устаревший результат после изменения адреса, тарифа или режима.

**Ставки особой зоны по умолчанию:** Standard — 70 ₽/км, Comfort — 80 ₽/км, Comfort+ — 90 ₽/км, Minivan — 110 ₽/км. Пользовательские значения должны проверяться и сохраняться согласно актуальным правилам калькулятора. Текущая политика специальных территорий в `docs/SPECIAL_TERRITORY_POLICY.md` уточняет географический охват и ручной режим.

### 2.2. Сохранить отдельный toll engine

Сегментная цена поездки не заменяет и не переписывает движки ПВП. При интеграции необходимо сохранять:

- составление ПВП-компонентов для М‑4/А‑289, М‑11, М‑12 и ЦКАД;
- recovery/fallback и валидацию маршрута/платных участков;
- различие `fast`, подтверждённого `free` и непроверенного `freeCandidate`;
- доказательную связь геометрии, выбранного провайдера и toll evidence: нельзя переносить подтверждение одного маршрутизатора на геометрию другого;
- прежние поля API и совместимость потребителей.

**Fail-closed для ПВП:**

- подтверждённые компоненты складываются один раз, без пропусков и двойного начисления;
- если найдено платное плечо, но его полная стоимость не подтверждена, итог ПВП — `unknown`/неразрешённая сумма, а сумма остаётся `null`;
- неполная сумма не выдаётся как полная стоимость маршрута;
- нулевую стоимость показывать только при подтверждённом отсутствии платы;
- отсутствие бесплатного маршрута — не то же самое, что бесплатная поездка; `freeCandidate` нельзя представлять как `free`.

### 2.3. Исправлять класс ошибок, а не отдельный маршрут

Историческая проблема: на длинных маршрутах через несколько платных участков итог мог включать только часть М‑4 или другой неполный набор toll-компонентов. Требовалось проверить составление и передачу всего массива компонентов в route-level композицию, а не добавлять хардкод цены/километража для одного направления.

Условие приёмки: исправление покрывает длинные и смешанные маршруты, сохраняет partial/unknown diagnostics и не занижает цену при неполном покрытии.

### 2.4. Регрессионные маршруты

Использовать набор как regression corpus; конкретный тест должен проверять не только наличие ответа, но и качество маршрута, состав дорожных компонентов, статус/сумму ПВП и корректность сегментной цены.

Минимальный набор, упоминавшийся в handoff и связанных задачах:

- Тверь → Адлер;
- Краснодар → Москва;
- Краснодар → Санкт-Петербург;
- Голубицкая → Санкт-Петербург;
- Витязево → Санкт-Петербург;
- Казань → Ялта;
- Москва → Казань;
- Ейск → Москва;
- Майкоп → Москва;
- Москва → Сочи;
- Москва → Тверь;
- обратные направления и маршруты без М‑11/без платных участков.

Исторические нулевые или неполные ответы Москва—Казань, Ейск—Москва, Майкоп—Москва и длинные южные маршруты должны быть покрыты тестами. Контрольные значения использовать как evidence для сравнения, не как runtime-хардкоды.

### 2.5. Удаление V3 runtime и статус эталонов

Позднее было принято отдельное решение: V3 полностью удалить из runtime и дальнейшую работу по нему не продолжать. Имеющиеся сверенные с Яндексом маршруты сохранить как неизменяемый датированный офлайн-снимок для regression/benchmark-проверок.

- Не использовать benchmark snapshot для live-маршрутизации, подстановки геометрии, toll fallback или установки цены пассажиру.
- Не вызывать старый Calculator 2.0/Yandex live API как скрытый production fallback.
- Live-расчёт должен опираться на действующие маршрутизаторы и подтверждённый toll engine; офлайн-эталон нужен для проверки реализации.
- Новый снимок создавать отдельной датой, не перезаписывать прежний источник и provenance.
- Не возобновлять V3 или runtime-кэш под видом интеграции V2 без отдельного актуального решения. Раннее предложение Verified Route Cache для V2 сверять с текущей архитектурой и более поздними указаниями; benchmark-данные сами по себе не являются разрешённым cache.

### 2.6. Будущие уровни, отложенные до базовой интеграции

В истории перечислялись следующие следующие этапы, которые не следует объявлять выполненными только по наличию отдельных модулей:

1. геометрически надёжные коридоры и segment split;
2. подтверждённый кэш маршрутов, разделяющий срок жизни геометрии/времени и тарифов ПВП;
3. целевая проверка точности маршрута до 3% на пригодном эталонном наборе;
4. коммерческие комиссии, маржа, минимальная цена и срочность;
5. расширение regression corpus и полный production gate.

Начинать их следует после подтверждения корректного сквозного V2-контракта, toll regressions и обратной совместимости. Кэш обязан использовать только разрешённый источник маршрута; обновление тарифа ПВП не должно без причины инвалидировать геометрию, но старую цену нельзя выдавать как актуальную.

## 3. Последовательность выполнения

1. **Инвентаризация:** прочитать handoff и текущие документы; проверить активную ветку, PR, статус изменений; определить существующие route/toll/pricing адаптеры. Не начинать с переписывания рабочего toll engine.
2. **Зафиксировать контракт:** поля старого API, новое сегментное поле, источник каждого значения, семантику `unknown`/free и цену без ПВП.
3. **Подключить расчёт на backend:** геометрия → классификация сегментов → тариф → цена; передавать итоговую структуру в API.
4. **Подключить UI и consumers:** карточки, копирование, выбранный тариф, множитель, сбор обезличенной телеметрии. Исключить самостоятельный клиентский пересчёт, который расходится с backend.
5. **Проверить совместимость:** старые поля и маршруты; `fast/free/freeCandidate`; toll recovery/validation; существующие M4/M11/M12/CKAD тесты.
6. **Добавить regression tests:** набор из раздела 2.4, включая unknown и достоверно бесплатные маршруты.
7. **Прогнать полный gate:** точечные tests, системную композицию ПВП, contract/API tests, lint/typecheck, production build, benchmark integrity и разрешённый live smoke. Не заменять успешную проверку утверждением о наличии workflow.
8. **Зафиксировать результаты:** коммит в рабочую ветку, обновлённый handoff/checkpoint и один итоговый отчёт. Не вливать PR и не публиковать production без отдельного указания владельца.

## 4. Проверки, упоминавшиеся в истории

В предыдущих отчётах заявлялось, что проходили regression по композиции M4/M11/M12/CKAD, fail-closed, free-route truth, route quality, lint, build и отдельный live-аудит. Также сообщалось о едином gate с 61 offline golden route, 32 toll controls и live-маршрутами. Эти результаты — исторические заявления по прежним коммитам; они не подтверждают автоматически head текущей ветки и должны проверяться по конкретным CI run и commit SHA.

Перед выпуском проверить соответствующий workflow, а не только status badge. Если контролируемый публичный endpoint недоступен или browser smoke не запускается, записать это как ограничение, а не объявлять gate полностью завершённым.

## 5. Журнал текущей работы над handoff

### 2026-10-04 — восстановление задач из «Ветка · Интегра OLD»

- **Что сделал:** запросил сохранённый контекст именно чата по названию, затем отдельно уточнил интеграцию тарификации, toll engine, регрессии, удаление V3 и эталонные маршруты.
- **Зачем:** пользователь попросил не просто продолжить код, а сохранить исходные постановки для следующих разработчиков; требования распределены по нескольким этапам и часть решений позднее изменилась.
- **Как оформил:** разделил продуктовые/технические инварианты, порядок работ, regression-набор, отложенные задачи и исторические отчёты. Не представил исторический зелёный CI как текущую проверку.
- **Сверка с репозиторием:** прочитал `docs/CALCULATOR_HANDOFF.md` и `docs/PROJECT_DECISIONS.md`, просмотрел список файлов `docs/`; текущие решения об офлайн-эталонах и удалении V3 записал как более поздние и приоритетные.
- **Сверка PR:** PR #10 открыт, черновик; head на момент сверки `4b84291f97f289e768fa17ffd951913f6f50e0dd`. Документ сохраняется на этой рабочей ветке.
- **Границы этого изменения:** добавляется документация; код маршрутизации, ценообразования и toll engine не меняется. Production не публикуется и PR не вливается.
- **Проверки:** проверены текст/ссылки и наличие документа после записи; кодовые tests/build не запускаются, потому что это docs-only изменение. CI ветки следует проверить по новому commit после сохранения файла.

## 6. Файлы проекта для чтения перед дальнейшей работой

- `docs/CALCULATOR_HANDOFF.md` — текущие архитектурные инварианты, toll semantics, regression и gate.
- `docs/PROJECT_DECISIONS.md` — граница standalone-калькулятора, benchmark snapshot и актуальные решения по V3.
- `docs/SPECIAL_TERRITORY_POLICY.md` — позднее согласованная политика специальных территорий для текущего PR.
- `lib/route-pricing-integration.ts`, `lib/route-pricing-segments.ts`, `lib/route-corridors.ts` — сегментная цена и коридоры, если присутствуют в выбранном commit.
- `lib/v2-calculation/route-leg-pricing.ts` и `lib/toll-engine/` — сборка toll evidence и композиция ПВП.
- `.github/workflows/` и package scripts — источник истины для доступных regression/full gates.

### Проверка записи — 2026-10-04

- Документ создан в commit `b74f4ad5f2228f53c35ecb343fc5b80e20b1b595` и повторно прочитан из GitHub; размер текста 11 285 символов, раздел журнала присутствует.
- После записи PR #10 остался `open`, `draft=true`, `merged=false`; новый head соответствует docs-коммиту.
- На момент проверки GitHub Actions `Special territory geometry and pricing` run #2 (`37182677971`) выполнялся; Vercel status был `pending`. Это не считается завершённым gate.
- Так как изменение документационное, код не менялся. Локальные typecheck/build не выполнялись; результаты run #2 записать отдельно после завершения.

### Завершение проверки — 2026-10-04

- GitHub Actions run #3 (`37182695123`) для коммита `268241719edf0810ff4e109d9e7677a4ffc24032` завершился `success`: установка зависимостей, тестовый шаг `node --import ./scripts/register-ts-paths.mjs --test scripts/*test.ts`, `tsc --noEmit` и `next build` выполнены job `verify`; отдельный счётчик тестов в этом журнале не снимался.
- Vercel check для того же коммита завершился `success` (preview/check status; не production deploy).
- PR #10 по-прежнему открыт черновиком; слияния не было.
- Вывод: handoff добавлен и прошёл репозиторный CI; продуктовый код этим docs-коммитом не изменялся.


## 7. Продолжение: брендовый UI V2 и тарифные строки — 2026-10-05

### Задача пользователя
Подогнать V2 под утверждённый брендбук «из А в Б», убрать горизонтальное переполнение поиска, показать редактирование ставок с шагом 0,50 ₽/км, подчеркнуть загрузку на долгом расчёте, уплотнить карточки дорог, дать выбрать будний/выходной период, убрать сегментную разбивку, показывать итог по каждому тарифу и сделать компактный текст копирования.

### Что изменено
- Применены утверждённые семантические цвета из design tokens: тёплый ivory #F7F4EE, navy #102A43, teal #0D5C63, mist #DDECF2, signal/deep orange #FF6B35 / #C94C20. Начальная тема светлая; сохранённый dark выбор остаётся рабочим. Логотип не выдумывался: V2 repository logo asset не содержал, использованы существующий знак машины и текстовое написание «из А в Б». Неутверждённый выбор шрифта не менялся.
- Для suggest popover зафиксированы left/right/w-full/max-w-full, горизонтальный overflow закрыт, длинные строки truncation; родительские формы имеют min-w-0.
- Ставки показывают ₽/км рядом с числом и получили ↑/↓ кнопки, каждая прибавляет/вычитает ровно 0,50 ₽/км. Добавлена ясная оговорка, что тарифы меняются; ручной ввод и сохранение настроек оставлены.
- Добавлен общий для формы и результатов period selector Пн–Чт / Пт–Вс. Автоначальное значение выбирается по московскому дню через Europe/Moscow.
- Кнопка расчёта меняет цвет, показывает анимацию полосы/индикатор и live status; уважает reduced-motion. После успешного ответа страница прокручивается к началу карточек результатов.
- Рабочая ширина V2 ограничена max-w-3xl. Card grid/children используют min-width safeguards. «По платной дороге» переименовано в «Основной маршрут», декоративная отдельная toll-разбивка удалена из экранного результата.
- Четыре строки цены строятся из базы тарифа и toll amount выбранного периода. quote-presentation.ts различает priced, подтверждённый free, unknown и manual; unknown не превращается в 0 и не получает ложный total, confirmed-free становится явными 0 ₽. Существующее поле ручной корректировки основного маршрута сохраняется и попадает и в UI, и в clipboard.
- Clipboard включает только «из А в Б», короткие названия мест, километры, время, выбранный период и четыре строки «тариф + дороги = итого». Для неизвестной платы итог явно остаётся нерассчитанным. Компоненты формулы округляются так же, как отображаются, чтобы видимое равенство сходилось.
- Обновлены токены и стили темы/feedback/donation/notices; urgent switch, API и route selection не переписывались.

### Проверки и ограничения
- Добавлен unit test на period/timezone, сокращённые названия, ручной toll override, unknown/free separation и round-to-visible-total.
- node scripts/v2-quote-presentation.test.ts: 6/6 passed.
- Полный suite, tsc, Next build пока не подтверждены: workspace не является git checkout, node_modules/tsc отсутствуют. Исходники получены из актуальной GitHub ветки и правки проверены локально выбранными тестами/ручным просмотром.
- Preview в интерактивном браузере пока не проверен. После создания draft PR посмотреть узкую ширину попапа, мобильное расположение 4 тарифов, day selector, loaded-state и авто-scroll, а также priced/free/unknown карточки.
- Платёжные данные и routing backend не изменены; toll totals остаются справочными и могут меняться.
- **Рабочая база на момент старта:** work/remove-v3-runtime-2026-10-02 / e1ca92e302cf7bfbe188717a91da916abbf8e77c; PR #10 merged в commit ba23668... Новый UI PR должен оставаться draft. Production deployment этой правкой не запускать.


### UI verification update — 2026-10-05

- Created draft PR #11: https://github.com/4regodatbe-cpu/mezhgorod-calculator/pull/11 (head 4add192d4ed5fe32c56ad2e52a0899f20e8bbd77; base work/remove-v3-runtime-2026-10-02). PR #10 is already merged; this work is separate.
- GitHub Actions run #97 (37259520781) passed both jobs: all scripts tests, TypeScript no-emit, Next.js production build, live route/provider, Photon and six-route Yandex audit probes.
- Vercel Preview READY at https://mezhgorod-calculator-bp9rlxgmq-4regodatbe-5310.vercel.app/v2. Protected URL smoke-fetch returned HTTP 200 and server-rendered HTML with the «из А в Б» header and new rate/period controls.
- No interactive browser/chromium is installed in this execution workspace. The Preview has not had mobile visual/E2E verification; the HTTP SSR check does not prove layout sizing, live loader appearance, selection/clipboard interaction, or auto-scroll.
- Production remains unchanged and PR remains draft. Do not merge until a visual browser check and a manual check of known/unknown toll totals are done.


### Ручная плата дорог: уточнение подписи — 2026-10-05

При повторной сверке интерфейса замечено, что введённая вручную сумма позволяла вывести итог для маршрута с unknown toll status, но верхнее предупреждение по-прежнему сообщало, что итог не рассчитан. Исправление явно маркирует добавку и clipboard как ручной ввод, не подтверждённый провайдером. Пустое поле оставляет итог unknown; серверный статус маршрута не меняется.

Это follow-up после полного run #97; docs-only run #98 в момент записи ещё выполнялся. Текущая code-ветка PR #11 остаётся draft, Production не менялся.


### CI syntax regression and correction — 2026-10-05

The follow-up that clarified manually entered tolls accidentally wrote the two literal characters backslash+n into use-v2-calculation.ts instead of an actual newline. GitHub run #87 failed at Next production build; run #99 failed TypeScript parsing at the same source line. Route-quality tests and benchmark integrity steps before the build passed. The source has been corrected to contain a real line break; verify on the next CI head. The matching Vercel Preview was ERROR due to this parse failure, and will be checked again after rebuild.


### Завершение UI-проверок и исправление API smoke — 2026-10-05

- **Цель:** закрыть CI-сигналы после UI-изменений и сохранить причины расхождений для следующего разработчика.
- **Проверка актуального UI-кода:** run #100 (37262493974) на коммите dd051c9f9c24b9db1e533c4fad360d14e8fa9b4b завершился успешно. Тесты, tsc --noEmit, Next.js production build и live probes (геометрия/время провайдеров, Photon, шесть benchmark-маршрутов) прошли.
- **Диагноз независимого smoke failure:** workflow #88 обнаружил, что scripts/api-contract-smoke.mjs ожидал HTTP 400 для запроса mode=dual без via, тогда как endpoint отвечает 200. В app/api/v2/calculate/route.ts нет проверки обязательной via; интерфейс и действующее требование также не делают промежуточную точку обязательной. Значит проверка закрепляла устаревший контракт.
- **Исправление:** коммит 47eadabb6837ed3af608fa24d96edec004fca2bf переименовал smoke case в «dual mode accepts omitted midpoint» и ожидает HTTP 200. Runtime/API расчёт не менялся. Нужно сверить workflow нового head после обновления PR description; до этого новый smoke не считать подтверждённым.
- **Запись в checkpoint:** после изменения smoke обновлён docs/WORK_STATE.md, чтобы новый чат сразу видел успешный run #100, причину run #88, остаток по browser E2E и запрет на production.
- **Остаток проверки UI:** Vercel Preview для UI-кода dd051c9 READY, SSR /v2 вернул 200. Интерактивная проверка мобильного viewport не выполнялась: браузерный runner отсутствует. Поэтому размеры dropdown, анимация загрузки и фактическая авто-прокрутка после запроса ещё нуждаются в проверке в настоящем браузере.
- **Статус PR:** #11 оставить open/draft. Никаких merge/production операций не выполнялось.


### Публикация UI V2 — 2026-10-05

- **Авторизация:** пользователь прямо попросил «Публикуй» после завершения UI-работы. PR и production публикация тем самым разрешены.
- **PR:** #11 переведён из draft в ready и слит squash в `work/remove-v3-runtime-2026-10-02`. Merge SHA: `d47076d24ca2faad57f8e5d5c3512e470e2e0d35`. Исходный head `806a79032f2f079e873302b8bfa30debe7e17d70`; ветка PR `feat/v2-brand-ui-2026-10-05`.
- **CI:** run #103 (`37262843595`) завершился success на актуальном PR head. Полный тестовый набор, `tsc --noEmit`, `next build`, live provider geometry/timing, Photon suggestion probe и аудит шести маршрутов прошли.
- **Preview gate:** deployment `dpl_CCdsnJKsiEUp69XxS5SPEje4d5pi` / `mezhgorod-calculator-97x652ey4-4regodatbe-5310.vercel.app` имел статус READY. `/v2` через Vercel web fetch ответил HTTP 200; SSR содержал шапку «из А в Б», ставки/шаг 0,50, предупреждение, селектор тарифа по дню недели и переработанные блоки результата. Browser E2E изолированно не запускался.
- **Продакшен:** обычный `vercel_request_promote` для READY preview дважды (на предыдущей публикации) и сейчас вернул HTTP 422 `Resource cannot be processed`. Чтобы выполнить явный запрос на публикацию без пересборки артефакта, вызван assign alias для deployment `dpl_CCdsnJKsiEUp69XxS5SPEje4d5pi` на `mezhgorod-calculator.vercel.app`. Операция успешна; ответ сообщил старый deployment `dpl_7ddWRHNaQhJKDDhLgKnbgCbSwg3p`.
- **Post-publish:** production URL `https://mezhgorod-calculator.vercel.app/v2` ответил HTTP 200. SSR вернул страницу калькулятора с актуальными ассетами и изменениями PR #11. Alias также присутствует в alias list нового deployment.
- **Ограничения:** это подтверждает загрузку страницы и SSR разметку, но не фактические тапы/сценарий поиска, live loading и автопрокрутку на мобильном экране. Не считать отсутствие интерактивного прогона доказательством проблем или полного отсутствия ошибок; пользовательская проверка на телефоне остаётся полезна.
- **Остаток по продукту:** CI live probe подтверждает актуальные тестовые прогоны провайдеров, но не закрывает расхождение toll-сумм относительно всех пользовательских скриншотов. Порог/маршруты крымской альтернативы были вне UI-публикации и не объявляются подтверждёнными этим релизом.
- **Дальнейшее действие:** пользователь может проверить production `/v2` на телефоне. Любые найденные дефекты фиксировать с конкретным маршрутом/экраном; исправления делать отдельными коммитами/PR и прогонять CI. Публикация была выполнена только после нового прямого запроса пользователя.


### 2026-10-05 — mobile layout and pricing hierarchy follow-up

#### User observations

The supplied Android screenshots showed the brand header and theme control being cut by the device status area; the rate cards occupied too much vertical space; ₽/km felt detached from its value; stepper arrows were too small; the rate-change notice and trip-day selector were duplicated between the form and result; and the result tariff names, toll addition and final total did not read as a clear formula. The user asked to keep the trip-day selector beside the toll result, remove the passenger-car wording, and make result pricing more compact and legible.

#### Implementation and reasons

- Added `viewport-fit=cover` and CSS safe-area padding to the V2 page wrapper. This gives the layout room to avoid device cutouts/status/navigation bars on supported mobile browsers.
- Removed the duplicate notice and day selector from the input form. The trip period remains in the result card because that is where it changes the shown toll amount.
- Tightened rate fields, brought the unit label closer to the input, and made the increment/decrement controls at least 44×44 CSS px with larger, higher-contrast icons. This improves visibility and mobile hit area while preserving the existing 0.50 ₽ tariff step.
- Reworked result price rows so the tariff name is stronger, the base fare and toll remain separate components, and a new line explicitly labels the result «Итого за поездку». Unknown toll stays unknown and does not gain a fabricated total; manually entered toll remains identified as manual.
- Reduced spacing in toll details/manual entry; removed the passenger-car-without-transponder sentence and kept a short rate-change notice.
- Refined dark theme surface levels and foreground tokens for actions and toll accents. Kept the approved light palette. Color is used with labels and structure rather than carrying meaning alone.
- Design review consulted Material 3 color roles and typography, WCAG 2.2 minimum contrast and target size, and MDN safe-area insets: https://m3.material.io/styles/color/the-color-system ; https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum ; https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env . These references informed concrete usability checks; no broad psychological claims about color were encoded as product facts.

#### Verification and remaining boundary

- GitHub Actions run #104 succeeded for tests, `tsc --noEmit`, `next build`, and the workflow's live provider/address/route probes.
- Vercel Preview for the branch is READY. Protected SSR fetch of `/v2` returned the calculator markup with the safe-area viewport declaration and updated form/results markup. The provider fetch includes Next's serialized not-found boundary template, so verification inspected the actual rendered body markup; calculator UI was present.
- No interactive Android/browser session was available in this task. SSR cannot confirm visible pixel offsets, line wrapping, real tap targets, loading animation, or scroll position. Treat those as awaiting manual mobile verification.
- PR #12 is open and draft on `fix/v2-mobile-layout-2026-10-05`; production is unchanged. Keep it draft pending user review; do not merge/deploy without a separate request.
- This UI work does not reconcile the outstanding toll estimate differences or validate real Crimea-route alternatives. Those remain separate product/runtime limitations.


### 2026-10-05 — unknown платность в альтернативном результате и нейтральная dark palette

- Пользовательская проверка скриншота выявила, что неопределённая платность альтернативного кандидата занимала четыре повторяющиеся длинные строки: базовый тариф, неизвестная плата и «итого не рассчитано» для каждой категории. Также пользователь счёл тёмную сине-зелёную поверхность раздражающей.
- Не меняя данные и backend-статус, введён display quote kind: полный итог, известная базовая сумма без дорог, либо ненайденная базовая цена. Для unknown status UI показывает базовый тариф как «Итого без дорог»; компактная общая строк…9085 tokens truncated… точное имя из name:ru/name_ru/name либо явные пары известных украинских/русских вариантов; имя исходной записи сохраняется для ручного контроля. Задача этого gate — запретить принимать географически попавшую точку другого поселения как искомую.
- Новый run #142 (37432068925) запущен для проверки точного совпадения и повторного живого random matrix. Внести реальные результаты ниже.
- Региональный запрос «Донецкая область» по-прежнему не имеет целевого результата в первых восьми подсказках Photon. Для «Ялта» первым результатом является одноимённый объект ДНР, второй — Крымский; региональный priority policy пока намеренно оставляет оба целевых совпадения перед внешними регионами. Это отдельное решение релевантности выдачи, не ошибка координатного суффикса.
- PR #12 оставлен open/draft; merge/deploy не выполнялись.


### 2026-10-06 — Russian region aliases and route-matrix interpretation

#### What the live audit established
The seeded settlement audit (run #142, seed 20261006) sampled ten polygon-validated, exact-name place features per area: DNR, LNR, Zaporizhzhia Oblast, Kherson Oblast and Crimea. A random Russian endpoint was Tikhoretsk. The test issued routes for all 50 pairs through Valhalla and OSRM. Valhalla returned 49/50 and OSRM 49/50; there were 20 pairwise distance warnings above 30 km or 5%, including a 3,502.2 km spread for Kushugum. One OSRM fetch and one Valhalla routing-plan mismatch failed. Thus, matching geocoding points to polygons and obtaining plausible geometry splits do not establish that the chosen route is correct. Keep these results diagnostic and do not claim that the route matrix confirms pricing accuracy. Only ten exact Photon candidates were available in LNR; the selected ten contained no rural locality.

#### Address search correction
The run #142 Photon artifact showed the explicit Donetsk ordering worked: the DNR city first, Rostov Oblast namesake second, without duplicate cards. It also showed the region query was incomplete: Photon supplied “Донецька область” for the Russian query “Донецкая область”; the matcher only considered the Russian query and locality aliases, so the relevant administrative feature was not marked exact. Updated `rankPhotonFeatures` to include the same explicit aliases used to query Photon in its exact-name matching. Added a test using the Ukrainian administrative name and Russian request. Coordinate polygons still decide the suffix and territory; name aliases only associate a response with the requested region and cannot assign a territory by text.

#### Live-probe repair and verification
Run #148's verification job passed, but the live job stopped at a syntax error: the source had a literal backslash-n between the final write and console logging statements. Rewrote the script ending with a real line break and kept live ranking checks diagnostic so an unexpected provider result is captured in the artifact rather than hiding the whole search report. The fix was run through CI again. On source head `2983dea6f5b5c257ab87422e20c2e61f1c5e138d`, run #151 completed verification successfully: 87 tests passed, `tsc --noEmit` passed and `next build` compiled successfully. Live address and routing probes are still running; their artifact is required before considering the search correction live-confirmed.

#### Remaining limitations
- Photon may not contain every settlement, and live results vary with its data and language handling. The supported area label is derived from coordinates only after a feature is returned.
- Inter-provider route differences are large enough to alter mileage splits and prices. A route-provider consensus or independent route reference is still needed for those pairs.
- The random matrix validates sampled endpoints, not all towns and villages or every possible Russian destination.
- PR #12 remains open/draft; merge and production release were not performed.


## 2026-10-06 — A0 сверка PR #12 и исправление run-status handoff

- По GitHub API заново прочитаны PR #12, его head/base и workflow run #153. Фактические значения: open/draft; head `fix/v2-mobile-layout-2026-10-05` @ `49c10fcef0ebadeca0e2e97f564a435a36679fcc`; base `work/remove-v3-runtime-2026-10-02`; run #153 завершён `cancelled`.
- Проверены jobs/steps run #153: verify — success (unit tests, TypeScript, Next build); live_probe — cancelled. Успели provider geometry/time, payment-point avoidance, Photon. Шаг случайной матрицы на 50 поселений cancelled; Yandex route comparison skipped. Preview deployment Ready, production status не менялся.
- Исправлен PR body: удалено неверное утверждение, что live job выполняет матрицу и что run #153 дал итог матрицы. Зафиксирована отмена и отсутствие подтверждённого артефакта; результаты run #142 отделены как диагностика другого SHA.
- Обновлены `docs/WORK_STATE.md` и этот журнал в рабочей PR-ветке.
- Команды: `git rev-parse`/локальные файлы недоступны, поскольку рабочий каталог не содержит repository checkout; использованы GitHub read APIs для PR, commit checks, workflow run jobs и версионированных документов.
- Проверки: GitHub verify job #153 success; 87 tests + TypeScript + Next build. Live run #153 incomplete/cancelled.
- Branch/SHA/PR: `fix/v2-mobile-layout-2026-10-05` / `49c10fcef0ebadeca0e2e97f564a435a36679fcc` / PR #12 open draft.
- Ограничения: локально нельзя запускать браузер/пакетные тесты; Photon полнота, route outliers, toll accuracy требуют дальнейшей проверки.
- Следующий шаг: открыть новый workflow run на текущем документном SHA, дождаться/сохранить audit artifact; затем A1/A2 triage по крупным provider outliers.


## 2026-10-06 — live audit follow-up, A1/A5

- Runs #154 (`37443721189`) and #155 (`37445722866`) failed the live audit step; run #156 (`37445845048`) repeated on the longer 60-minute timeout and also failed the audit. Verify jobs passed on all three (87 tests, TypeScript no-emit, Next build). #156 did not fail from timeout.
- Artifact #156: Photon returned HTTP 400 for all 325 requests across five target areas; zero features, zero accepted settlements, zero routes. Artifact #154's fixed probe similarly returned no features for all 10 queries. The audit's assertion expected 10 settlements and failed; Yandex screenshot comparison did not run. No routing quality conclusion is possible from this artifact. Exact 400 response body is not currently collected.
- Implemented A5 secondary-route card correction in commit `df80430e570f9b82de7d2304dbe0469881647a5d`: special-area primary route remains a full RouteCard; alternatives render AlternativeRouteCard fare-only; clipboard behavior also marks fare-only. Run #155 verify passed.
- Extended live job timeout from 25 to 60 minutes in commit `fd28837faaf6a48024a975c19801d5046a6ece85`; latest audit still failed at geocoder resolution, not timeout.
- Updated WORK_STATE and this log in follow-up commits. Browser QA of Vercel preview remains unconfirmed because preview access hit a credential prompt and the user declined password entry. No visual QA success claimed.
- Next: instrument Photon failures with response body and minimal request metadata, diagnose HTTP 400, select a proven fallback if needed, rerun the deterministic 50-place matrix, and continue unresolved distance/toll benchmarks before release review. No merge or production deployment.


## 2026-10-06 — Photon default-language fix and route audit findings

### 2026-10-06 — A1 root cause/fix, A6 seeded audit, A2/A3 triage

- **Current code head at audit:** `6af8f2e4d3c6fad8278ca1059e5c15754828187a`; run #162 (`37452856442`) verify and full live job both succeeded. Verify passed 87 tests, TypeScript no-emit and Next build; live provider geometry, payment-point avoidance, address probe, 50-route audit and seven Yandex screenshot comparisons all completed.
- **Photon root cause confirmed from #160 artifact:** the hosted Photon service rejected `lang=ru` with HTTP 400, explicitly listing accepted languages `default, de, en, fr`. Removed unsupported language parameter from app and live audit URLs; changed retry behavior to fail fast on 4xx and retain a short response-body diagnostic. Added URL regression asserting the default language. Run #161 (`ca204bd9f1fed59f34f281d34e76b58ea49a41b0`) verify/live jobs passed; all 10 fixed address queries returned features with 0 failed sources. Донецк ranked “Донецк — ДНР” first and Ростовский Донецк second; Макеевка DNR match present.
- **A1 ranking refinement:** live query “Донецкая область” initially showed a partial locality “Донецкая” ahead of the exact oblast. Tightened prefix matching so partial locality names are not considered exact for a region query; added a regression test. In run #162 live output exact “Донецкая область” is now first. The four other region queries/city aliases also returned results. A Crimea-name ranking case (“Ялта” first showed a DNR namesake) remains a potential policy decision to review against the product’s locality ranking rule.
- **A6 seeded audit, seed 20261006:** selected exactly 10 in-polygon settlements from each of DNR, LNR, Zaporizhzhia, Kherson and Crimea (50 total). Valhalla routed 49/50; OSRM 47/50; 20 of 50 pairs exceeded 30 km or 5%. Provider failures: 4. Largest distance gap remained Kushugum—Tikhoretsk: Valhalla 4,481.2 km vs OSRM 979 km (3,502.2 km / 78.2%); territory-distance composition suggests an unexpected DNR/LNR excursion on the Valhalla route, but per-leg route geometry was not retained, so exact cause is unproven. This is a successful audit run, not a route-correctness pass.
- **A2:** live territory timing geometry probes passed after route rescan. However route comparison remains open: Valhalla and OSRM disagree on 20 sampled pairs; investigate per-leg distance/control passage for Kushugum, and other flagged outliers, before accepting a selected distance. Do not substitute a provider automatically without validating path geometry.
- **A3 seven Yandex screenshot checks:** only OSRM returned for six of seven routes; both providers returned for Donetsk—Moscow. Zaporizhzhia—Omsk OSRM 4,048.8 km vs screenshot ~3,500 (+15.7%), toll 2,553/3,303 ₽ vs screenshot ~2,940 ₽; Murmansk—Astrakhan distance close (3,344.3 vs 3,400 km, −1.6%) but duration +332 min and toll remains unknown vs screenshot paid amounts; Surgut—Kharkiv had no route (Valhalla unavailable, OSRM rejected special-territory transit); Perm—Makhachkala 2,478.4 vs 2,790 km (−11.2%), toll unknown; Belgorod—Arkhangelsk 1,901 vs 1,890 km (+0.6%) but +205 min; Tomsk—Chernomorskoe 4,732.3 vs 4,700 km (+0.7%), toll 2,553/3,303 ₽; Donetsk—Moscow Valhalla 1,214.4 km (+0.4%) / 982 min (+82) / 4,640/6,200 ₽ vs screenshot 1,210 km / 900 min / ~3,810 ₽. Toll/route composition remains unreconciled.
- **A5:** special-endpoint alternatives render as fare-only `AlternativeRouteCard` (code commit `df80430e570f9b82de7d2304dbe0469881647a5d`); primary route still includes detailed toll. Verify passed. Browser preview visual QA remains unconfirmed because protected preview authentication required credentials that the user declined to enter.
- **Status:** PR #12 remains open/draft; no merge or production deployment. A4 session settings and A7 versioned API handoff are not yet audited. Do not mark overall release-ready until outlier routes, toll benchmarks, A4/API review, and preview QA are closed.


## 2026-10-06 — control-leg audit and official M-4 fare reference

### 2026-10-06 — A2 first-leg outlier pinpointed; A3 tariff source checked

- Run #164 (`37454871357`) on code head `1d171066608b94aa6d23867f9c622d0d6e57bea5` passed verify and live jobs. It adds control-leg distance/duration diagnostics to every seeded route pair. Run #163 also passed, but overlapped the same live providers; its output is superseded by the instrumented #164 artifact for A2.
- Kuschugum—Tikhoretsk (Crimea corridor) outlier is now isolated to control leg 0, Кушугум → Crimea interior. Valhalla reports 3,842.5 km / 3,058 min for that one leg, followed by 246.1 / 240.2 / 152.5 km. OSRM reports 362.5 / 246.2 / 217.6 / 152.7 km for the same four plan legs. The second–fourth legs agree closely; essentially the entire 3,502.2 km total gap occurs on leg 0. The outputs pass endpoint/control checks, so current validation does not reject the anomalously long but control-following leg. This proves where the outlier occurs, while the provider-side route graph cause remains unresolved.
- In the concurrent #164 run, Valhalla succeeded 49/50 and OSRM 34/50; 18 pairs were over the 30 km or 5% diagnostic threshold. OSRM availability was materially lower than run #162 (47/50), so live provider capacity/results vary; do not call failed fetches valid no-route evidence.
- **A3 official rate evidence:** the state-owned Avtodor highway company’s announcement effective 02.03.2026 lists Moscow—Krasnodar M-4 for passenger cars at 5,040 ₽ Monday–Thursday and 6,090 ₽ Friday–Sunday, before optional T-pass discount: https://russianhighways.ru/press/news/141463/ . This is the complete M-4 route figure, not a substitute for tolling Donetsk—Moscow or a different geometry. The #162 engine’s Donetsk—Moscow composition remains 4,640/6,200 ₽; screenshot ~3,810 ₽. Compare identical route section and individual toll plazas before altering rates. The source confirms the 2026 full-route baseline; it does not resolve the screenshot mismatch.
- PR #12 remains open/draft. No merge, production deployment, or visual preview sign-off. A2/A3 outlier pricing still open; A4 and A7 remain unreviewed.


### 2026-10-06 — A2 control-leg guard and A4 stale-quote correction

- Run #171 (commit `fd92e3a6f162c119431c3fc52e01aa44bfa70a06`) completed successfully: 90 tests, TypeScript, Next build, live provider probes, address search, seeded 50-place audit, and screenshot-route comparison.
- The seed picked 50 in-polygon settlements (10 per area). Valhalla returned 48 routes; OSRM returned 49. The previous Kushugum—Tikhoretsk outlier is now safely rejected for Valhalla with `ROUTING_PLAN_LEG_STRETCH_1_16.5X`; the remaining OSRM route is 979 km. The raw Valhalla diagnostic still shows 4,481.2 km, with 3,842.5 km on the Kushugum→Crimea-interior control leg. The guard marks the surviving result with a warning in the API; the abnormal provider path remains an external routing issue, while its distance no longer silently enters the selected answer.
- One other Valhalla route, Kherson, also exceeded the 10× control-leg stretch threshold (16.4×) and was rejected. There are still 20 provider-distance disagreements above the existing 30 km/5% diagnostic threshold, so broader A2 route agreement remains open. The audit records 1 transient OSRM fetch failure; successful workflow completion does not imply every provider responded.
- A4 code review found that changing the urgency toggle or urgency percentage left an old result visible even though the multiplier had changed. Both controls now clear the result and abort an in-flight calculation, matching the existing address/rate invalidation behavior. Run #172 will verify this change.
- A5 visual browser QA still has no screenshot sign-off. The protected Vercel preview requires credentials the user declined to enter; no login or access-control bypass was used. Use an independent local/CI-rendered QA path if visual evidence is needed.
- A3 still has unresolved route/toll screenshot mismatches. A6 is not release-ready while these discrepancies and route disagreements remain. A7 contract/handoff is intentionally pending the A6 gate; no portal integration is authorized by this status.
- PR #12 remains open/draft. No merge or production deployment.


### 2026-10-06 — итог runs #172–#173 и следующий порядок закрытия блокеров

- Runs #172 (commit `2b8607303d04715e1f11ff5827407433d5c971e3`) и #173 (head `70873ef87aca285fb333bf00fb9fc18aef8c9bcb`) прошли verify и полный live workflow. В verify прошли 90 тестов, TypeScript и Next build. Артефакты #173: `special-territory-live-probe-37460946070` и связанные JSON отчёты.
- **A2:** seeded matrix — 50 поселений; Valhalla 48/50, OSRM 48/50; 19 межпровайдерских расхождений выше порога. Максимум: Донецк—Тихорецк 86,2 км / 18,7%; далее Токмак 64,6 км / 7,2%, Чулаківка 59,2 км / 6,6%. Две Valhalla геометрии (Кушугум 16,5×; Херсон 16,4×) отклонены проверкой контрольного плеча; два OSRM `fetch failed` — это сбой доступности, а не доказательство отсутствия дороги. Не усреднять расстояния провайдеров; для каждого конфликта надо сравнить контрольные точки/геометрию и сохранять предупреждение, а для временных ошибок — повторять один раз с ограничением по времени.
- **A1:** в live autocomplete запрос «Ялта» ставит «Ялта — ДНР» выше «Ялта — Крым». Результаты имеют точные совпадения, но для голого запроса порядок семантически плох. Следующий фикс: общий exact-name ранг с приоритетом крупного/канонического населённого пункта; региональный qualifier сохраняет первое место за явно указанной зоной. Зафиксировать оба поведения тестами и повторить Photon live probe.
- **A3:** run #173 подтвердил непогашенные отличия на семи Yandex-сравнениях. Запорожье—Омск: +15,7% по длине и 2 553/3 303 ₽ против ~2 940 ₽; Пермь—Махачкала: −11,2% и unknown toll; Мурманск—Астрахань: −1,6% по длине, +332 минуты, unknown toll; Томск—Черноморское: +0,7%, +72 минуты и 2 553/3 303 ₽ против ~2 180 ₽; Донецк—Москва: Valhalla +0,4% по длине, +82 минуты и 4 640/6 200 ₽ против ~3 810 ₽, OSRM −7,2%. Скриншоты не дают геометрии и точной даты тарифа, поэтому сравнение не подтверждает, что совпадают участки.
- **A3 предлагаемое закрытие:** получить для этих эталонов выбранный путь/ссылку с геометрией, дату поездки и вариант маршрута; если геометрии нет — сравнивать только грубый коридор, не менять цены по одному скриншоту. Повторно построить тарифный breakdown на одной и той же геометрии; сверить каждый ПВП/рамку, направление, класс ТС, будний/выходной тариф, транспондер и дату действия с первичными опубликованными тарифами. Не заменять сумму hardcode-итогом. Для полного маршрута М-4 Москва—Краснодар официальный baseline не равен тарифу конкретного участка Донецк—Москва.
- В Moscow—Krasnodar альтернативе штраф 900 с дал кандидат 1 524,5 км с 4 ПВП и был правильно отклонён; при 1 200 с кандидат 1 631,2 км с 7 платными дорожными рёбрами и 0 ПВП прошёл проверку. Это подтверждает механизм на этой паре, не на всех направлениях.
- **A4:** изменение срочности теперь сбрасывает старую цену/результат и отменяет активный запрос. Verify обоих прогонов #172–#173 прошёл; отдельный live расчет не нужен для проверки client-side invalidation.
- **A5:** preview-auth не использовался. Следующий независимый путь к визуальным evidence — локальный/CI Playwright прогон без Vercel preview: снимки mobile/desktop до расчёта, после результата, для загрузки и ошибки; затем проверить геометрию карточек и доступность текста. Пока это план, визуального sign-off нет.
- **A6/A7:** release gate остаётся закрыт из-за 19 расхождений и неотлаженных toll-сравнений. Не готовить integration API как стабильный контракт до решения A6; после него контракт должен фиксировать schema, версию, unknown toll (amount=null), владельца тарифов, ошибки и fixtures.
- PR #12 открыт/draft; production не менялся. Следующий конкретный блок: исправить ranking «Ялта», добавить regression-тесты и отдельный live check; затем адресно triage top-A2 расхождений и выполнить геометрически идентичное A3 сравнение.


## 2026-10-06 — Работа только с текущими маршрутными провайдерами

По решению пользователя собственный routing stack/сервер отложен. Развитие продолжается на имеющихся Valhalla, OSRM, BRouter, Photon и тарифном каталоге. Цель — не абсолютное совпадение ETA и каждого рубля, а устранение системных ошибок при максимально коротком обычном расчёте. Сохранение неизвестной toll-цены как unknown и запрет маршрутизации через неподходящие территории остаются жёсткими условиями.

Коммит `78bf6b439187b908e849c7c21eb070745ec462ff` делает причину отклонения аномально растянутого контрольного плеча видимой и для обычного маршрута: оставшийся провайдерский кандидат помечается предупреждением, а не выглядит безусловно проверенным. Регрессия добавлена в `scripts/special-territory-api.test.ts`.

Коммит `8dbe01a47377ad757e8a42d5653ce57eff9d184c` переносит запрос Valhalla с full-detour penalty 43 200 секунд за проверку более дешёвых вариантов. В успешном типовом случае этот тяжёлый запрос исключён из параллельного критического пути. Fallback сохраняется и вызывается, если локальный, частичный, OSRM и BRouter варианты не дали полностью подтверждённого объезда пунктов оплаты. Измерение выигрыша по задержке ещё не выполнено.

Run #180 verify на HEAD прошёл: 90 тестов, TypeScript no-emit, Next build. Live job ещё выполняется. Run #177 подтвердил все live ranking checks для Ялты, но seeded route audit завершился на недостающих LNR выборках: 8/10 найдено из 20 имён; полный live gate не прошёл. Это выявляет хрупкость повторного набора точек через Photon. Следующий шаг — сохранить фиксированный regression corpus координат и отделить его от живого geocoding smoke test, затем замерить задержку этапов до дальнейшей оптимизации.

HEAD при записи: `8dbe01a47377ad757e8a42d5653ce57eff9d184c`. PR #12 open/draft; merge/production deploy не выполнялись.



### 2026-10-06 — Fixed coordinate corpus and repeatable A2 audit

- **Why:** live audit #177 failed because Photon found only 8 of the required 10 LNR settlements from the available names. The route-quality workflow should distinguish geocoder availability from route-provider behavior.
- **Evidence source:** successful full live audit #181, artifact `special-territory-live-probe-37477264095`, seed `20261006`. Its 50 selected in-polygon coordinates and Russian endpoint Tikhoretsk were copied as a dated immutable fixture in `data/settlement-route-benchmark-20261006.json`. The fixture is offline test data only, never runtime geometry or a route cache.
- **Code:** `scripts/settlement-random-route-audit.mjs` now loads that fixture, validates every coordinate against its target area, and runs the same 50 routes every time. Photon remains checked in the separate address-search probe; the route matrix no longer geocodes a fresh sample on every run. Workflow label updated to “Audit the fixed 50-settlement route corpus.”
- **Test iteration:** run #184 failed at the new audit because the extraction also removed the bounded `mapLimit` helper. Added the helper back in `af235e23590b81d96f9799c0271edc7e714e79e1`. Run #185 (`37491779623`) then completed verify and the entire live workflow successfully, including the fixed-coordinate matrix and all seven Yandex screenshot route comparisons. No result is recorded as passed until the workflow step was observed completed.
- **Results:** 50 routes; Valhalla 48/50, OSRM 49/50; 19 pairs exceed 30 km or 5%. Two failures are expected Valhalla stretched-leg rejections (Kushugum and Kherson); one OSRM fetch failure remains. These are diagnostic availability/quality counts, not proof that one provider is universally correct.
- **A2 triage from leg/territory breakdown:** Donetsk—Tikhoretsk is 460.2 km Valhalla vs 374.0 km OSRM (86.2 km / 18.7%). Valhalla’s path includes 116.4 km in LNR, while OSRM includes none; the shared plan has only the two endpoints. This is a concrete lead for checking provider geometry and crossings. It does not yet prove which path is preferred or invalid. Tokmak—Tikhoretsk differs by 64.6 km (7.2%); its second control leg Krasnodar-region → Crimea interior is 258.7 km Valhalla vs 216.7 km OSRM, while the later Crimea → Tokmak leg differs by 22.5 km. Kerch—Tikhoretsk differs by 42.1 km (9.2%) almost wholly in the second leg (258.7 vs 216.7 km). This suggests a repeatable provider choice on the Krasnodar-to-Crimea leg, and makes that shared leg a better first diagnostic target than separate destination-specific fixes.
- **Interpretation boundary:** per-leg distances localize where provider outputs diverge; they do not reveal the roads themselves because route geometries are not persisted in this artifact. Do not switch providers or hardcode distances based on this alone.
- **Preview:** Vercel deployment for code head `af235e23590b81d96f9799c0271edc7e714e79e1` is READY at https://mezhgorod-calculator-5sedqk2yr-4regodatbe-5310.vercel.app; preview remains behind normal SSO. This task did not merge PR #12 or touch Production.
- **Next concrete block:** add optional compact geometry diagnostics for the top disagreements (or per-leg encoded route sample behind an audit-only flag), compare shape/corridor changes, and encode only demonstrated systemic invalid-route conditions. Measure algorithm timing separately against this now-stable corpus.


### 2026-10-06 — Geometry evidence for the largest provider disagreements

- **Change:** extended the fixed settlement route audit to retain full Valhalla and OSRM coordinates for only the five largest provider disagreements. All 50 routes still run and retain compact summary metrics. Geometry appears only in the diagnostic workflow artifact; no user-facing route selection or fare calculation changed.
- **Verification:** run #188 (37493261424), commit 90c1bab9e48d51882a9ddd5895eee7562add2bbb, completed verify and live_probe successfully. The live job included provider geometry/time, payment-point avoidance, Photon address smoke, fixed 50-route audit and seven Yandex route comparisons. Valhalla 48/50, OSRM 48/50, 19 provider pairs above the 30 km / 5% diagnostic threshold. Artifact: special-territory-live-probe-37493261424.
- **Geometry analysis method:** each full polyline was downsampled every 15 vertices, projected locally to kilometres, and compared by nearest sampled point in both directions. This is a quick corridor-shape diagnostic, not a road-surface distance or map-matched quality score.
- **Finding 1 — Donetsk–Tikhoretsk:** Valhalla 460.2 km vs OSRM 374.0 km, gap 86.2 km / 18.7%. Their geometries differ substantially: median sampled-point separation 19.3 km and only 36.9% of points fall within 10 km. Territory-distance breakdown showed Valhalla uses 116.4 km in LNR and OSRM 0 km. This is the first route for path/control policy review; the data does not by itself establish which route is correct.
- **Finding 2 — Kerch–Tikhoretsk:** 458.5 vs 416.4 km, gap 42.1 km / 9.2%, while 92.8% of sampled points are within 10 km and median separation is 0 km. The routes share most of their broad path; focus on per-leg length differences rather than a whole-route corridor rewrite.
- **Finding 3 — Tokmak–Tikhoretsk:** 899.3 vs 834.7 km, gap 64.6 km / 7.2%, with 86.3% of sampled points within 1 km. Most visible segment gap is on the Krasnodar-region→Crimea-interior control leg (258.7 vs 216.7 km). Again, this points to leg-level length / route graph choice, not a different overall route corridor.
- **Conclusion boundary:** a smaller distance is not inherently more correct; do not switch provider, average lengths, or alter toll rates from this evidence. Use these geometries to identify concrete invalid routing (wrong control, forbidden passage, stretched leg) and otherwise keep a warning when providers genuinely disagree.
- **Preview:** route-code head 90c1bab9e48d51882a9ddd5895eee7562add2bbb is READY at https://mezhgorod-calculator-9ju3i4978-4regodatbe-5310.vercel.app (normal SSO). PR #12 remains open/draft; no merge or Production publish.
- **Next:** review route shape/corridor policy for Donetsk–Tikhoretsk; compare exact leg metrics for Kerch/Tokmak; then measure the lazy full-detour optimization against the fixed corpus with stage-level latency.


### 2026-10-06 — Wikipedia settlement lists and Yalta–Volnovakha audit

User supplied the Russian Wikipedia list of Kherson settlements and proposed the same source for each priority region, with checks for Ukrainian spelling. Reviewed all four list articles. They report 1,118 rural places in Donetsk, 787 in Luhansk, 918 in Zaporizhzhia, 658 in Kherson; lists are organized by raion. The articles are useful as a broad names corpus, but not authoritative coordinate data: census numbers are stated as 2001, there are repeated locality names, and listed articles were last updated at different times. Sources: https://ru.wikipedia.org/wiki/Населённые_пункты_Донецкой_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Луганской_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Запорожской_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Херсонской_области .

CI #199 (`37505598437`) at head `259fb7a1bba7868a59afae243fec5b114d30fd1c` passed verify: 93 tests, TypeScript no-emit, Next build; full live workflow passed, including Photon and fixed 50-settlement audit. Artifact `special-territory-live-probe-37505598437`.

The new live route case Yalta–Volnovakha used representative city-centre coordinates (Volnovakha: 47.6014517, 37.4934079) and screenshot references 991 km, ~2,060 ₽ weekday, 2,533 ₽ weekend. Both provider routes verified on the same mainland corridor and five tariff-time controls. Valhalla: 1,067.7 km; OSRM: 1,053.1 km. Deviations are +7.7% and +6.3%. The route probe validates corridor/control requirements, but did not compute geometry-to-Yandex overlap; exact distance cause is open.

Both Valhalla and OSRM toll probe results: 2,103 ₽ weekday, 2,533 ₽ weekend. Weekend equals screenshot; weekday is +43 ₽. The priced components include M-4 checkpoints plus A-289 ramps 103 km (270 ₽), 82 km (278 ₽), 23 km (555 ₽); need identify which M-4 interval/checkpoint creates weekday delta before updating a rate. Do not hardcode total.

Live Photon: unqualified Yalta now passes new rule (DNR result precedes Crimea; explicit Crimea qualifier still returns Crimea). For Izyum, the Ukrainian city in Kharkiv oblast is found, but no in-polygon priority-territory result was geocoded, so Kazakhstan and other homonyms remain in the first eight. Bbox requests by themselves do not provide a complete gazetteer. Next step is to import the complete four Wikipedia locality tables as a versioned search vocabulary, verify Ukrainian forms as counterpart aliases, query candidates with exact region context, and accept coordinates/priority labels only after point-in-polygon validation. Add data count/duplicates/source revision checks and regressions; don't fabricate coordinates for unmatched names.

Current PR #12 is open/draft; no merge/production action.

## 2026-10-07 — Шесть пунктов доработки по текущей ветке

- Обход пунктов оплаты оставляет платные дорожные рёбра допустимыми только при полной геометрической проверке и нуле пунктов оплаты; тестами подтверждены платное ребро без ПВП, найденный ПВП, неполная проверка и отсутствие геометрии.
- Исправлен критерий полезности альтернативы: теперь требуется заметная экономия времени или расстояния. Ухудшение обоих параметров не предлагается и не запускает затратный map matching. Тот же критерий используется для диагностики тарифного fallback.
- Географический выбор коридора не менялся; добавлена проверка Ялта—Волноваха в обоих направлениях с утверждёнными контрольными точками.
- Тарифная сумма не корректировалась без идентичной геометрии Яндекса: по имеющимся скриншотам известно расхождение 43 ₽ только в будний день; сумма выходного дня совпадает.
- Добавлены проверки целостности четырёх production-полигонов и фикстуры RuWiki-only: ровно четыре источника ru.ruwiki.ru, >2,000 записей без координат. Справочник неполон согласно отмеченным ограничениям экспортов; свежие данные здесь не добавлялись.
- Целевые тесты прошли: address search 33, toll alternatives 9, boundary 5, route policy 10, route pricing 4; systemic composition и corridor policy также прошли. Полный набор остановился только на недостающем `next`; установка зависимостей не удалась из-за запрета сетевого доступа. TypeScript/build/live probes не выполнялись.

## 2026-10-07 — Дополнительная оптимизация без новых эталонов

- Объезд ПВП теперь ограничен сверху: не более +25% по расстоянию и +50% по времени к основному маршруту; выход за любой предел отсекается до map matching. Это защитные пороги, пока не откалиброванные на эталонной статистике. Дальний fallback Valhalla не отключал: данных для безопасного отказа от него недостаточно.
- Внутреннее состояние переименовано в `confirmed_payment_point_avoiding`, чтобы подтверждённый объезд пункта оплаты не означал «дорога полностью бесплатна». Если в геометрии есть toll-tagged рёбра, quality содержит предупреждение.
- В детализацию М-4 добавлены стабильные ID участков, км, направление (unknown без доказательства), границы смешанных участков, будний/выходной тариф и выбранная сумма. Обновлены live/Yandex диагностические JSON. Цены не менялись.
- Добавлены регрессионные географические пары Ялта—Волноваха/Токмак/Бердянск/Херсон и обратные направления. Это тесты текущего правила, а не новая оценка его географической правильности.
- Проверки целевого блока прошли: 59 тестов в пяти наборах, плюс pricing integration, systemic composition, strict M-4 traversal, other-road tariff/evidence. Полный набор: 28/29 test-файлов, единственный блокер — пакет `next`; tsc/build/live-прогоны не запускались.

## 2026-10-07 — Consolidated regression audit after combining changes

- **Sources reconciled:** `AGENTS.md`, `docs/WORK_STATE.md`, this detailed log, uploaded `upload/Iz_A_v_B_full_status_and_handoff_2026-10-06(1).docx`, current branch history/diff, and prior-chat retrieval. The latest route rule is explicit: a payment-point bypass may still use toll-tagged road edges, but it is worth selecting only when it materially saves distance or time. Toll unknown stays distinct from free/zero. The prior chat also records a Production alias to deployment commit `8857f` around 08:56 MSK; this is the last recorded state, not live-verified in this session.
- **Confirmed regression:** commits `8350649` and `1e9ac3b` replaced the prior savings check with only a maximum detour ceiling (+25% distance / +50% time). Consequently, a candidate with no savings could be accepted and map-matched; special-route code could also make additional payment-point-bypass calls without a benefit. Fixed in `lib/v2-calculation/free-route-selection.ts` and `lib/v2-calculation/special-options.ts`: retain the ceiling and additionally require either >=10 km and >=1% distance savings, or >=15 minutes and >=5% time savings. The shared criterion also controls route-difference toll fallback. Regression tests now assert that a no-savings candidate is rejected before the expensive map-matching call.
- **Confirmed UI defect:** `app/v2/components/address-field.tsx` silently cleared suggestions on HTTP/network failure, making a geocoder outage look like “city not found”. It now distinguishes loading, empty results, and service errors, clears stale status on query edits, and has a retry action.
- **Files that hold the combined changes:** route selection/pricing: `lib/v2-calculation/free-route-selection.ts`, `special-options.ts`, `route-leg-pricing.ts`, `lib/toll-engine/m4-*`; address and display: `lib/photon-address-search.ts`, `app/v2/components/address-field.tsx`, `result-panels.tsx`, `route-card.tsx`; focused regression suites: `scripts/v2-toll-booth-alternative.test.ts`, `address-search.test.ts`, `special-territory-policy.test.ts`, `m4-plaza-breakdown-test.ts`. Product decisions and current state are in `docs/WORK_STATE.md`; the earlier transfer document is in `upload/`.
- **Unresolved, kept separate from the confirmed regression:** user reports Production no longer shows toll prices on even known routes. The code path safely returns `pricingStatus=unknown` and null totals when a detected road family cannot be fully priced. No captured Production API response was available to identify the missing family or failed toll validation, so this audit does not label that as fixed. The local Photon probe also failed from this restricted environment for all queries; that is not evidence of a Production provider outage.
- **Verification:** before the final one-line API-option cleanup, all 29 `scripts/*test.ts` files passed. After the cleanup, focused `special-territory-api`, `special-territory-policy`, and `v2-toll-booth-alternative` suites passed (3/3); `tsc --noEmit`, targeted ESLint (no errors/warnings), and `git diff --check` passed. `next build` was attempted but Next/Turbopack rejected dependencies symlinked outside this workspace before compilation; build status is therefore unverified. `scripts/segment10-production-readiness.mjs` is also not runnable as-is because it references absent `app/api/v3/calculate/route.ts`.
- **Repository/release state:** branch `fix/v2-mobile-layout-2026-10-05`, HEAD `1e9ac3b`, two commits ahead of local `origin` ref `bc6d540`; twelve tracked files are uncommitted. PR #12 is last recorded open/draft. Current work has not been merged or deployed. Next step is a full CI/build from a checkout with dependencies physically inside its project root, followed by inspection of the actual Production route payload and deployment SHA. No release action was taken.


### 2026-10-07 — preview publication and Izyum ranking regression

- PR #12 branch updated to `aad7d328c05c7ff36a870e43350f09e6634933ce`; Vercel Preview `dpl_Gu8fS3TcWwaoZGxAU19myBDVKbx7` reached READY. SSR `/v2`, CSS, and address suggestions for Izyum/Krasnodar returned HTTP 200.
- Live Izyum results showed the Russian-country tier could be bypassed by exact matches where Photon omitted the place subtype. Tightened ranking so any exact Russia namesake remains above other countries, while special-territory boosts still require settlement/administrative classification. Added regression for Russian non-place subtype versus Kazakhstan city.
- Local verification of this ranking fix: address-search suite 35/35, TypeScript no-emit, and diff check passed. Latest ranking fix is not yet on the remote branch; production was not promoted. Next run remote Vercel build and repeat preview search checks before production promotion.


### 2026-10-07 — production release completed

- After the preview regression fix passed 35/35 address-search tests and remote Vercel build, deployed source commit `cd08bc7e79d0507e0d77d3d58212e1e253a79795` to Production as `dpl_4kVEexEXd13aTWhRoUPfLAiRvrcR` (`READY`, target `production`). Direct promotion of the preview was rejected by Vercel with 422, so the same verified Git source was built with production target.
- Live Production smoke checks: `/v2` returned HTTP 200; `/api/suggest?q=Изюм` returned HTTP 200 with Russian namesakes first; `/api/suggest?q=Краснодар` returned HTTP 200 with Краснодар (Краснодарский край) first. PR #12 remains open/draft; not merged.


### 2026-10-07 — M-4 full Moscow—Krasnodar overcharge

- User reported that Krasnodar—Moscow showed 6,130 ₽ weekdays / 8,470 ₽ weekends. Reproduced the systemic cause in code: production M-4 summed prices of individual plaza and mixed-section records for a full-corridor route, while its existing calibrated full-route record was only used by the legacy estimate path.
- The State Company Russian Highways' announcement effective 02.03.2026 gives the full M-4 Moscow—Krasnodar category-I price as 5,040 ₽ Mon–Thu and 6,090 ₽ Fri–Sun: https://russianhighways.ru/press/news/141463/ (table lines 112–124).
- Added a conservative full-route override: use the shared `FULL_ROUTES` tariff only when complete M-4 validation confirms the northern 62/71-km gate, southern 1223-km gate, and at least eight confirmed PVPs spanning the corridor. Works both directions; individual PVP breakdown remains diagnostic. Partial routes retain component pricing.
- Updated the live regression for Krasnodar—Moscow and reverse. Added tests for both directions, weekday/weekend, and rejection of partial routes.
- Local release checks passed: 30/30 test files, TypeScript no-emit, and `git diff --check`. Remote build, live API regression, and Production smoke checks are the remaining release gates.
- User's standing release decision: publish each completed change immediately after verification. PR #12 remains open and unmerged.
- Release completed: PR branch head `b6220a3a52c23df2f566bb3526a03deb703211ef`; GitHub run #212 verify passed full tests, TypeScript, and Next production build. Vercel Production deployment `dpl_GSnRXDXUF7QyXArkEZHHbFrbV9fS` reached READY; `/v2` and `/api/version` returned HTTP 200 and the latter reported the expected commit. The live-probe job was still running at the time of this entry; no claim is made that its route API regression completed.

### 2026-10-07 — M-4 false charge on toll-booth bypass edges

- Compared Volnovakha–Moscow's displayed 4,680/6,270 ₽ with the saved Donetsk–Moscow Yandex control. The live audit had summed 13 confirmed M-4 plazas/sections to 4,640/6,200 ₽ for Donetsk–Moscow while the saved Yandex selected-route observation is about 3,810 ₽. Do not treat these endpoints/geometries as identical; they identify the same suspicious calculation pattern, not an exact fare oracle.
- Root cause: the local M-4 validator recognized `node.type === "toll_booth"` but did not require the traced edge's `toll` attribute to be true. The offline strict-anchor fallback also converted proximity plus a straight-through heading into a charge without lane-level evidence. This contradicted the user's rule allowing a paid road with free booth bypasses.
- Fix: only toll-tagged matched edges become charge events; explicit `toll: false` booth edges are rejected and missing edge flags remain unknown. Geometry-only fallback cannot create a paid charge. The pricing engine independently ignores non-toll events. A successful trace that contains no expected booth node is treated as a verified near miss, not an unknown toll.
- Added tests for paid/free/unknown edge evidence, geometry-only fallback, a no-node near miss, and a multi-plaza total where the free second booth must not add its tariff. Added Volnovakha–Moscow to the live route probe and exposed plaza-level edge evidence for diagnostics.
- CI run #215 passed all tests, TypeScript, and Next build on `dc0f8637dbeba98019f290cbf4a78e3a7a546b52`. The provider geometry/per-leg-time live-probe step completed; later checks and artifact upload are still running, so the post-fix pair totals are not yet captured in the artifact.
- Production deployment `dpl_APHxyqimAyzi1kcYEizAL5sefxKx` reached READY on commit `dc0f8637dbeba98019f290cbf4a78e3a7a546b52`; `/v2` and `/api/version` returned HTTP 200 and the version endpoint reports the deployed commit. The earlier revision `dpl_Acn939YBrtkQFSmAF2oDCJm8U94b` is superseded. PR #12 stays open/draft and unmerged.


### 2026-10-07 — M-4 mixed-zone entry/exit pricing follow-up

- Corrected the prior run-status note: workflow #215 completed successfully and its artifact is available. On the reproducible Valhalla Volnovakha—Moscow route (1,276.3 km / 17 h 31 min), post-paid-edge calculation is 4,320 ₽ Mon–Thu / 5,730 ₽ Fri–Sun. This is 360/540 ₽ below the earlier calculator screenshot (4,680/6,270 ₽) on a route matching its displayed distance/time; no Yandex geometry or receipt exists to treat the residual as an exact-fare comparison. OSRM's different 1,182.6-km route remains unknown in the old logic because PVP 636 was confirmed without a complete mixed-section context.
- Official Avtodor rules distinguish the mixed M-4 entry and exit gates and apply a 12-hour window to 401–464 km and a 120-minute window to the relevant 633–672 km part. Previously the implementation priced the first gate without checking estimated gate-to-gate transit, or required distant open-system flanking PVPs to price an otherwise confirmed gate.
- Changed `m4-route-validator` to retain each candidate's route-progress distance and the selected route ETA. `m4-route-context` now charges only confirmed paid gates, chooses the first gate's published tariff by travel order, applies a second exit tariff if ETA proportional to route distance exceeds the operator's transit window, and leaves a paired-gate case unresolved if ETA is unavailable. Open-system flanks alone do not create mixed-zone charges. Passed route ETA through the M-4 production, API diagnostic, and live-audit paths.
- Added regressions for both gate orders/tariffs, one-gate cases, free gate bypasses, missing ETA, and exit fees after the time window; preserved the 401–464 one-charge rule for ordinary through travel.
- Focused validation: five M-4 suites pass, syntax checks pass, `git diff --check` passes. Local full suite cannot load absent `next`; local TypeScript and Next binaries are also absent. Remote CI/live probe and production deployment are pending for this follow-up. The proportional ETA is an estimate from whole-route ETA and route progress, not an observed passage timestamp.


### 2026-10-08 — Волноваха/Скадовск/Мариуполь → Москва: платная дорога пропадает в полном расчёте

- Production reproduction: Волноваха—Москва returned 1,182.6 km / 17 h 09 min, marked toll price unconfirmed, and showed base fare only.
- Direct route pricing is not the source by itself: live artifact from GitHub run #217 on source `28562ef` priced the same OSRM distance/time at 3,050 ₽ weekdays / 3,890 ₽ weekends. This narrows the defect to the full special-route orchestration/provider interaction; it does not establish an exact Yandex fare.
- Code inspection found that the special-route path priced Valhalla and OSRM geometries concurrently. Each M-4 pricing call can issue four `trace_attributes` requests at once, doubling the burst and increasing the chance of incomplete validation; incomplete M-4 evidence correctly suppresses the entire total under the fail-closed rule.
- Changed `calculateSpecialOptions` to rank route geometries first and perform each provider candidate's toll validation sequentially, retaining route selection and paid-route preference. Added a deterministic end-to-end test over a DNR—Moscow M-4 route that checks both distinct route options retain priced tolls and peak map-match concurrency is four rather than eight.
- Added a full-flow live-probe artifact for the three user-reported pairs: Волноваха—Москва, Скадовск—Москва, Мариуполь—Москва. The CI live probe will record price status, weekday/weekend amount, validation evidence, and elapsed time.
- Local verification: the new serialization regression passes; other locally runnable tests pass, but the all-tests command cannot import the absent `next` package. Remote CI/typecheck/build and exact full-flow live results are pending. Production has not yet been changed for this fix; publish after successful required verification. PR #12 remains open/draft and unmerged.

### 2026-10-08 — Самый быстрый маршрут первым в выдаче

- **Требование:** первый отображаемый вариант должен иметь минимальное время среди допустимых вариантов маршрута.
- **Изменено:** `lib/special-territory-options.ts` теперь сначала оставляет только маршруты выбранного географической политикой коридора, отбрасывает длительность, если она невалидна, и сортирует допустимые варианты по возрастанию времени. Статус платности и предпочтение качества источника используются лишь при равном времени; коридор и геометрические ограничения сохранены.
- **Интерфейс обычного расчёта:** `app/v2/components/route-utils.ts` добавляет стабильный helper сортировки; `app/v2/components/result-panels.tsx` отображает основной/альтернативный маршрут в порядке длительности. Сам расчёт, цена, платность и названия вариантов не менялись.
- **Регрессии:** `scripts/special-territory-policy.test.ts` проверяет быстрее/медленнее при разном предпочтении источника и платности, равное время, отбрасывание некорректной длительности, сортировку UI без мутации исходного массива и прежнюю фильтрацию коридора.
- **Проверки:** локально focused route-policy suite и `git diff --check` прошли. CI run #221: 123/123 теста прошли, но TypeScript сначала выявил ошибку — для карточек не передавалось отдельное поле `seconds`; это исправлено в коммите `82fdbf1`. CI run #222 после исправления прошёл все 123 теста, TypeScript и Next production build. Дополнительный route-quality run #144 также прошёл production build. Live-probe job run #222 впоследствии завершился success; это диагностика с `continue-on-error`, не результат интерактивного UI теста.
- **Публикация:** PR #12 остаётся открытым/draft, без merge. Production Vercel deployment `dpl_4N96Q6nYKGKYVv5XyTNLE2MWxvfD` READY на коммите `82fdbf14096a25bb0c4a7251094b317db5cb1e80`; `/api/version` и `/v2` ответили HTTP 200, версия API совпала с коммитом. Интерактивный расчёт маршрута в браузере не прогонялся.
- **Открыто:** дождаться/зафиксировать оставшийся live audit, если он завершится; далее собирать пользовательские замечания по фактическому порядку вариантов.


### 2026-10-08 — Исправлено переключение дневного/тёмного режима

- Пользователь сообщил, что в приложении не включается дневной режим.
- Причина в порядке действий переключателя: он сначала записывал выбор в `localStorage`, и только потом применял тему. Если хранилище недоступно/переполнено (например, в ограниченной среде браузера), исключение прерывало обработчик, и визуальный режим не менялся.
- Исправлено: тема применяется немедленно; чтение и запись `localStorage` выполняются с безопасной обработкой ошибок. Текущее состояние при нажатии определяется по классу `dark` на корневом элементе, чтобы избежать переключения по устаревшему React state при гидратации.
- Регрессии: переключение в обе стороны, fallback при ошибке чтения, применение темы даже при ошибке записи.
- CI run #227: все 123 теста, TypeScript no-emit и Next production build прошли. `git diff --check` прошёл.
- Production deployment `dpl_2Gw1PPa45qm7xmvzG3cfp5vduq9J` READY на коммите `c0a89efd80d9b08b4d7321fbe5ed80dc35136d57`; `/api/version` вернул HTTP 200 и ожидаемый коммит.
- Интерактивно проверено в Production: переключение в тёмный режим, затем обратно в дневной; доступные подписи кнопки сменились ожидаемо.
- PR #12 остаётся open/draft, не слит.


### 2026-10-08 — Светлая тема и Android/Chrome Auto Dark

- Пользователь сообщил, что опубликованное оформление не соответствует актуальному дизайну. На приложенном мобильном кадре кнопка темы показывала действие «включить тёмную тему» (то есть была выбрана светлая тема), но фон и поля выглядели затемнёнными, а акцент оставался цветом светлой палитры.
- Причина: браузер/Android WebView мог повторно алгоритмически затемнять страницу поверх вручную выбранной светлой темы приложения. Так смешивались тёмные поверхности системы и светлые бирюзовые контролы.
- Изменения в PR #12: `app/layout.tsx` объявляет поддержку light/dark и устанавливает `color-scheme: only light` до гидратации для светлой темы; `components/theme-toggle.tsx` применяет тот же режим при переключении; `app/globals.css` явно задаёт цветовую схему для обеих тем; `lib/theme-toggle.ts` содержит соответствующее преобразование с регрессией в `scripts/theme-toggle.test.ts`.
- Проверки: `node --import ./scripts/register-ts-paths.mjs --test scripts/theme-toggle.test.ts` прошёл; `git diff --check` прошёл. Локальный полный TypeScript/build не запускался: зависимости в checkout отсутствуют. Vercel Preview `dpl_EG928Y6FfCEr4L2CEXPfb8jq4g2p` READY на source `01cfe20f71879c9360e427d2d7aab8aecba0bccb`; API version и SSR `/v2` ответили 200, в HTML присутствуют `meta color-scheme=light dark` и pre-hydration `only light` для светлого режима. GitHub Actions run для последнего коммита не обнаружен.
- Production не обновлялся; интерактивный preview защищён Vercel sign-in. Текущая инструкция пользователя: не публиковать на Production без прямого запроса. PR #12 остаётся открытым/draft.
