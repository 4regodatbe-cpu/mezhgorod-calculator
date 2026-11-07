# Текущий handoff — FINAL V3 product-evidence gate applied, local gates PASS (07.11.2026)

**DONE LOCAL / HOSTED ACCEPTANCE PENDING.** Изолированный кандидат `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`, стартовый HEAD `0bfb15a96575cec810c0eb5786cf447799c389e9`; GitHub PR #14 по свежему readback `OPEN / Draft`, опубликованный head `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`, локальная история fast-forward continuation. Основная local history из 91 коммита не менялась. Владелец прямо разрешил применять продуктовый доказательный gate к обязательному CI и продолжить release sequence после успешных проверок.

Gate интегрирован в `scripts/check-tariff-freshness.mjs` и `.github/workflows/calculator-final-gate.yml`. Возраст наблюдения/effective-date metadata UNKNOWN выводятся как предупреждения; строгий CLI возвращает результат продуктового assessor. 14 активных продуктов проходят `PASS_WITH_WARNINGS`; отсутствие evidence, неверная/будущая/несовпадающая reviewed edition дата, неправильная категория, M‑1 Cat-I fare mismatch, конфликт и риск двойного начисления блокируют. Unknown physical bindings/runtime amounts не менялись; отдельные экспериментальные записи, не входящие в active evidence set, не добавляются в release scope.

Фактические локальные проверки: `pnpm test:audit` — 1176 PASS / 0 FAIL / 1 SKIP (первый sandbox run имел три subprocess-only failures; повтор с разрешённым выполнением дочерних процессов PASS); обязательный tariff CLI exit 0, 21 warnings / 0 errors; TypeScript PASS; ESLint 0 errors / 9 existing warnings; стандартный `pnpm build` PASS (тот же audit, Next.js 16.3.4 Turbopack compile/typecheck/prerender); benchmark corpus и остальные static/product workflow gates PASS; локальный production-server smoke PASS — API contract 16/16, `/v2` 200, `/v3` 200, `/` 307, `/api/version` 200. Локальный live-provider audit ранее дал 6/6 HTTP 502/network-null; это не Preview/live-route PASS и по явному разрешению не блокирует публикацию, но hosted Preview должен быть проверен.

Tariff runtime/sums/geometry не изменялись. M‑1 evidence имеет caveat: официальный пресс-релиз подтверждает базовую ставку 230 ₽; original Order54 PDF bytes недоступны; Cat-I/payment mapping частично owner-attested. V2, Android, main и Production пока не изменены; Production остаётся SHA `a6bea89dd4b481a1352dc492969004e6cd1e6e38`. Следующий шаг — создать локальный commit/bundle, повторно сверить remote SHA/ancestry, обычный non-force push, точный GitHub Actions и Preview. Production разрешён только при успешных hosted gates/Preview без подтверждённых P0/P1.

Отчёт: [Stage AI checkpoint](checkpoints/2026-11-07-stage-ai-product-gate-applied-DONE-LOCAL.md), [WORK_LOG](WORK_LOG.md), [NEXT_STEPS](NEXT_STEPS.md). Предыдущий handoff ниже отражает историческое состояние до прямого решения владельца и superseded.

## Superseded historical handoff — FINAL V3 integration BLOCKED before publication (07.11.2026)

**BLOCKED / LOCAL ONLY.** Изолированный кандидат `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`, проверенная база remote `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`, перед checkpoint commit HEAD `cf8dde540156ce9bef649ef88453f0195b366bae` (31 commit ahead, ancestor chain validated; основная local history не менялась). Прочитан и проверен handoff 2ГИС `75808f17b87cb0550f0a6c29735f6c7001b13511`: manifest/source-package tests pass; никаких новых API calls. Уже подтверждённые узкие реализации остаются scope-limited; неизвестные тарифы не расширялись.

Результат preflight/checkpoint сохранён локальными коммитами `4edb654b25bb3df1e0c338fcf90d1328fa458798` и `4b82f302a2b77383c0bc44d0447a9368235aca2e`; проверенный инкрементальный bundle доступен по `/workspace/final-v3-release-blocked-2026-11-07-final.bundle` и требует prerequisite `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`.

Финальные локальные проверки кандидата: полный `pnpm build` — offline 1175 PASS / 0 FAIL / 1 SKIP и Next.js 16.3.4 Turbopack build PASS; TypeScript PASS; ESLint 0 errors / 9 warnings; API contract smoke 16/16 PASS; локальный built-UI controlled browser 28/28 PASS (desktop/mobile, результаты с `liveProviders=NOT_RUN`). Реальный live route audit на локальном API — 0/6: все Valhalla/OSRM/BRouter попытки получили общий `network` отказ и HTTP null; шесть расчётов вернули 502. Причина на уровне удалённого провайдера не установлена, этот sandbox run не заменяет hosted CI.

**Обязательный тарифный freshness gate остаётся BLOCKED:** strict `node scripts/check-tariff-freshness.mjs` без предложенного изменения завершился exit 2: две aggregate строки 37d при пороге 30d, три effective-date metadata `UNKNOWN`. Изменение обязательного workflow не применялось: только проверены предложенный продуктовый assessor и отрицательные controls; его применение требует отдельного явного утверждения согласно релизному заданию. Точная proposal: `experiments/tariff-gate-proposal/product-gate-approval.patch`; контрольная регрессия сохраняет BLOCKED при отсутствующих/конфликтующих доказательствах, неверной дате и риске двойной оплаты. Поэтому push/Preview/Production не выполнялись. Remote HEAD повторно read-only сверён: `8fae15c7…`; PR #14 OPEN/Draft; Production остаётся прежним `a6bea89d…`.

Duration formatter остаётся в shared result-компоненте `app/v2`, который используется V3. Day-form применяется только при `showFastestSummary=true` (этот prop передаёт V3 `fastestOnly` branch); V2 не включает этот режим и сохраняет старое `duration()`-отображение, подтверждённое regression. Android-путей/workflow в diff нет. Попытка перенести helper только в app/v3 была отклонена по реальному browser FAIL и не сохраняется.

Отчёт и проверяемые результаты: [Final V3 release BLOCKED checkpoint](checkpoints/2026-11-07-final-v3-release-BLOCKED-LOCAL.md), [журнал](WORK_LOG.md), [следующие действия](NEXT_STEPS.md). Единственный следующий продуктовый шаг — решить strict gate на основании owner-approved продуктовой политики или предоставить независимое доказательство, чтобы текущий обязательный gate прошёл без подмены даты/ослабления защиты; затем повторить непрошедший hosted/Preview gate на exact candidate SHA. До этого публичная готовность не подтверждена.

# Предыдущий handoff — Stage AH M‑1 candidate DONE LOCAL / mandatory CI gate still blocked (07.11.2026)

Продолжение от `0e1a1e1d5e08ba1faaf1b0fbef27581f58d14a2c` в isolated `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`. Официальная страница Автодора [141463](https://russianhighways.ru/press/news/141463/) доступна: M‑1 33–66 км / ПВП46, базовый тариф для легковых 230 ₽, отдельная максимальная T‑pass loyalty цена 195,50 ₽, грузовой 500 ₽, действует с 02.03.2026. PDF Order54 снова недоступен (403); его SHA не заявляется. Сохранена структурированная выписка, SHA выписки `01f746e761b4aeb5d62a2bd26e2604f953a5ed23460175537b1b19288c40e74d`; это не хеш исходной страницы/PDF. Категория I и единая базовая колонка cash/card/listed transponders дополнительно опираются на визуальное чтение владельца.

Изолированная коррекция и evidence/test зафиксированы commit `8fc8ff329946c2dd33c5ccdb4f3869624df5d4a8`; финальный bundle/readback последующего docs closeout указан в итоговом handoff.

В изолированной кандидатной копии исправлено M‑1 Cat-I no-transponder 250→230 ₽, обновлены экспериментальный реестр и M‑1 regression expectations; transponder base остаётся 230, лояльностная цена не включена. Это не изменение route geometry или иных тарифных систем. Product gate: 14/14 product PASS, агрегированные `avtodor-other-roads` views PASS, overall `PASS_WITH_WARNINGS`, exit 0/21 warnings: 12 наблюдений требуют перепроверки, 3 aggregate effective dates не установлены, 2 оригинальных байтов веб-источника нет, 4 привязки приняты как owner-attested working mapping. Отдельно неизменённый обязательный freshness gate в strict mode остаётся exit 2: два aggregate snapshot STALE (37d/30d), unknown effective-date metadata 3. Не обновлять `observedAt` задним числом и не ослаблять gate.

Результаты и source caveats: [Stage AH M‑1 follow-up checkpoint](checkpoints/2026-11-07-stage-ah-m1-official-announcement-DONE-LOCAL.md); [source extract](../experiments/tariff-gate-proposal/m1-official-news-extract-2026-11-07.json). Нужно решение владельца по применению продуктового gate и M‑1 correction к обязательному CI/runtime. Push/merge/Production запрещены.

# Предыдущий handoff — Stage AH PARTIAL до официального пресс-релиза (07.11.2026)

Продолжение от `7201d28d410e48d58f1d91bfb4d0b19d50582792`, isolated `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`. Новый product-level evaluator/evidence/test и два review-only patch сохранены в `experiments/tariff-gate-proposal/`. Официальный Order54 PDF URL и web-preview вернули 403; локальных PDF/image bytes нет, SHA не заявляется. Владелец сообщил независимое визуальное чтение: M‑1 PVP46 Cat I–IV = 230/250/320/500 ₽, весь week, одна таблица способов оплаты, effective 02.03.2026. Это делает нынешние M‑1 Cat-I 250 ₽ (no-transponder) вероятной ошибочной привязкой категории, но первичный артефакт не сохранён/не проверен локально.

`m1-category-payment-fix.patch` меняет только кандидат: 250→230 для Cat I no-transponder, не меняет Cat I transponder 230 и сохраняет исторический checkpoint. Patch не применён в этой копии; активный strict pricing/runtime/registry и обязательный gate не менялись. Stage AH product-gate assessment на сохранённых доказательствах завершился ожидаемым strict exit 2: обе агрегированные строки `avtodor-other-roads` остаются BLOCKED из-за M‑1 (нет hash-verifiable Order54/fare/payment mapping; coverage неполна; противоречие и double-charge scope не закрыты). M‑3/CKAD/A‑289/M‑11/M‑12 прошли индивидуально. Old observation и неустановленный агрегированный effective date выводятся как WARNING, не как причина exit2. Никакого временного PASS нельзя переносить в CI.

Проверки/ограничения и следующий шаг: [Stage AH checkpoint](checkpoints/2026-11-07-stage-ah-tariff-gate-final-assessment-PARTIAL.md), [Stage AH product evidence](../experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json), [product gate patch](../experiments/tariff-gate-proposal/product-gate-approval.patch), [M‑1 candidate patch](../experiments/tariff-gate-proposal/m1-category-payment-fix.patch). Нужны оригинальные байты/страница приказа №54 и решение владельца по двух patches до применения к обязательному gate/runtime. Bundle и локальный commit см. checkpoint; push, merge, Production запрещены.

# Предыдущий handoff — Stage AG PARTIAL / proposed gate BLOCKED (07.11.2026)

Изолированная копия `/workspace/stage-ae-gate-proposal`, ветка `codex/stage-ae-gate-proposal`, стартовый HEAD `35b4ae98cedd7ac8f89dd2b1be7de76b10ee0041`. Для М‑11 и М‑12 подготовлены отдельные reviewed записи в [Stage AG supplement](../experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json): Order274 категория I, единая матрица наличные/карта/перечисленные транспондеры, effective 04.09.2026; Order302 категория I, postpay/перечисленные транспондеры, effective 08.10.2026. Матрицы структурно полны по сохранённым метаданным: М‑11 22 узла/462 направленные ячейки на оба профиля; М‑12 20 узлов/380 ячеек.

М‑1 остаётся BLOCKED: официальный PDF Order54 по URL вернул HTTP403 anti-bot, сохранённого PDF в рабочем дереве нет. Пользовательские сведения (PVP46, Cat I–IV 230/250/320/500 ₽, весь недельный период, effective 02.03.2026, cash/card/listed transponders) сохранены только как `NOT_INDEPENDENTLY_VERIFIED`; они расходятся с интерпретацией М‑1 в Stage AF. Не обновлять историю/тарифы без сохранённых байтов оригинала. Обе агрегированные строки `coverageComplete:false`.

Изолированный evaluator проверяет дату тарифа из evidence и блокирует невалидную/будущую дату; `approval.patch` применялся только к временной копии. Интеграция с полным evidence дала ожидаемый strict exit2 только для неполных агрегированных строк; stale — warnings. Tests: AF8/8, AG5/5, combined four-file suites4/4 PASS; ни один из этих результатов не является hosted CI PASS. Runtime, тарифный реестр, mandatory gate и CI не менялись. См. [Stage AG checkpoint](checkpoints/2026-11-07-stage-ag-tariff-gate-evidence-PARTIAL.md), [AF evidence](../experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json), [approval patch](../experiments/tariff-gate-proposal/approval.patch). Push/merge/Production/main запрещены; PR14 без изменений.

Изолированный `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`, продолжение AE от `e2949a98d59651aaaab8e70e3c1802b64dd98a2d`. Для М‑3/ЦКАД/А‑289 сохранены и визуально проверены официальные приложения №53/56/55: категория I, платёжное условие и effective date 02.03.2026; хеши записаны. Для М‑1 отсутствует первичный PDF приказа №54 и исходные байты страницы 01.10.2026. Две агрегированные записи остаются `coverageComplete:false`, суммы и даты не менялись. Возраст наблюдения — warning, не expiry.

Stage AF source/evidence/test commit `273a462e1e1dab156f023432ce445cb2a88b35d0`. Targeted suites3/3 PASS; approval tests8/8; JS syntax, PDF hashes, `git apply --check` PASS. Временная копия с `approval.patch` и prepared evidence завершилась expected strict exit2; также нет evidence для M‑11/M‑12 по схеме всех четырёх registry IDs. Это не CI PASS. Incremental bundle `/workspace/stage-af-273a462.bundle` прошёл `git bundle verify` с prerequisite `8fae15c7…`, но отдельная попытка получить prerequisite из partial/promisor checkout остановилась на отсутствующем promised object `c226258…`; самостоятельное восстановление не подтверждено. Mandatory gate, runtime, registry и workflow не изменялись; no push/merge/Production, PR14 unchanged. См. [checkpoint](checkpoints/2026-11-07-stage-af-tariff-evidence-DONE-LOCAL.md), [evidence](../experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json), [patch](../experiments/tariff-gate-proposal/approval.patch).

# Предыдущий handoff — Stage AE DONE LOCAL / gate patch awaiting approval (07.11.2026)

Изолированный `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`, база AD8d67d215. Подготовлены isolated evaluator, reviewed-evidence schema, regression tests и `experiments/tariff-gate-proposal/approval.patch`. Активный mandatory gate, workflow, суммы, даты и runtime не менялись. Возраст наблюдения предлагается предупреждением; проверенный источник/денежная ячейка, период применения и существенные противоречия — отдельными blockers. Unknown legal effectiveFrom допускает принятую рабочую модель с обоснованием, согласно28октября.

Новые регрессии6/6, три целевых test files3/3, JS syntax/diff check и git apply --check PASS. Patch применён только к временной копии: strict gate без reviewed evidence даёт ожидаемый exit2. Для текущих registry rows assessment не выдуман; применение patch и заполнение его из сохранённых доказательств остаются следующим review-шагом. Нет push/merge/Production. [Checkpoint](checkpoints/2026-11-07-stage-ae-DONE-LOCAL.md), [контракт и patch](../experiments/tariff-gate-proposal/README.md).

# Предыдущий handoff — Stage AD DONE LOCAL / RELEASE BLOCKED (07.11.2026)

Изолированный `/workspace/stage-ad-reliability`, branch `codex/stage-ad-reliability`, база AC `2400f760…`. Итоговый runtime candidate `e4e070c8fb24b6e415029c31f4e4b2827ef010d0`. Введены реальные ограничения ожидания транспорта/тела и общий бюджет V3 90с, сохранён provider timeout25с. Исправлены точный HTTP-статус отклонённой геометрии и отображение дней/часов/минут V3. Тарифный runtime/данные/workflows не менялись; primary91 HEAD86fd19bd и StageAC HEAD2400f760 сохранены.

Финал: offline1157 PASS/0 FAIL/1 SKIP; TypeScript/lint(0errors/9warnings), штатный pnpm Turbopack build, API smoke16/16, benchmark61, workflow contract6 PASS. Реальный локальный built UI с controlled API: desktop14/14 и mobile14/14 PASS; проверка версии в results.json. Живые два маршрута на предшествующем runtime176e1d8e HTTP200 через OSRM; прежние причины502 не восстановлены. Из четырёх live street controls два дали улицы, Донецк/Ялта — только partial settlement fallback. Freshness strict по-прежнему exit2 (stale2); подготовлено изолированное предложение, его применение требует решения владельца. Push/Production/Preview не выполнялись, PR14 не менялся.

Подробно: [Stage AD итог](checkpoints/2026-11-07-stage-ad-DONE-LOCAL.md), [freshness proposal](TARIFF_FRESHNESS_GATE_PROPOSAL.md). Следующий шаг: review кандидата и отдельное решение о freshness release-contract/контролируемом push; не повторять закрытые тесты или четыре live запроса без новой причины.

# Предыдущий handoff — Stage AC PARTIAL LOCAL (07.11.2026)

Изолированный `/workspace/stage-ac-reliability`, branch `codex/stage-ac-reliability`, основан на Stage AB `1f4987f9…`. Runtime diagnostics implementation `f3db8239…`, расширенная provider matrix `1fa76aa8…`. Добавлены safe typed provider errors и request-local routing attempt summary; V3 сохраняет один пригодный маршрут при отказах конкурентов. Legacy error messages shared providers для V2 сохранены. Тарифы/геометрия/политика выбора неизменны. Push/Production запрещены; 91-коммитная копия не менялась.

Offline 1148 PASS/0 FAIL/1 SKIP, targeted final provider matrix PASS, TypeScript/ESLint PASS (9 warnings), Webpack production build PASS, local API smoke 16/16. Стандартный Turbopack build блокируется внешним node_modules symlink. Browser/Preview NOT_RUN. Исторические два 502 не имеют восстановимых per-provider причин. Полная 12-сценарная failure matrix и реальная browser-приёмка остаются открытыми; Stage AC не объявлен полностью завершённым. Детали: [Stage AC checkpoint](checkpoints/2026-11-07-stage-ac-PARTIAL-LOCAL.md). Следующий шаг: завершить временные/corridor failure scenarios и desktop/mobile browser на exact SHA; не повторять городской/тарифный аудит.

# Предыдущий handoff — Stage AB V3 blockers: DONE LOCAL / hosted release gate BLOCKED (2026-11-07)

Локальный изолированный кандидат `/workspace/final-gate-v3`, ветка `codex/final-gate-v3-repair`, HEAD `9ac745c35500e4bfcb04cf3411806be8a4887d44`, от опубликованной базы `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`. PR #14 оставлен Draft. Push/merge/Production/main/Android запрещены. Основная 91-коммитная копия не изменялась.

Stage AB добавил воспроизводимую offline регрессию, что при недоступности всех трёх маршрутных провайдеров V3 возвращает HTTP 502 без синтетического маршрута, и подключил её к final-gate. Реальная причина исторических двух 502 по сохранённым данным неразличима: provider-level статусы/ошибки не записаны. Две ставки общего snapshot Автодора остаются stale (observed 2026-10-01, срок 30 дней); официальный live GET 2026-11-07 получил HTTP 403 DDoS-Guard. Даты/суммы не обновлялись. Кандидат не готов к релизу без свежего официального источника и hosted Actions на точном SHA. Подробности и манифест: [Stage AB DONE-LOCAL](checkpoints/2026-11-07-stage-ab-blocker-closure-DONE-LOCAL.md), [manifest](checkpoints/2026-11-07-stage-ab-manifest.json), [журнал](WORK_LOG.md), [следующие шаги](NEXT_STEPS.md).

---

# Предыдущий handoff — Stage AA V3 final-gate: исправлен локально, release blocked (2026-11-07)

**LOCAL ONLY / PUSH ЗАПРЕЩЁН.** Основа — опубликованный `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; отдельный worktree `/workspace/final-gate-v3`, branch `codex/final-gate-v3-repair`. Код final-gate и отчёты завершены локально; runtime, тарифы и геометрия не менялись. Основная локальная история из 91 коммита не затронута. GitHub branch HEAD проверен: `8fae15c7…`; PR #14 открыт и Draft. Полный отчёт: [Stage AA DONE-LOCAL](checkpoints/2026-11-07-stage-aa-v3-final-gate-DONE-LOCAL.md), краткие журналы: [WORK_LOG](WORK_LOG.md) и [NEXT_STEPS](NEXT_STEPS.md).

**Факты маршрутов:** прежние `segment3-free-truth.mjs`, `live-user-route-audit.mjs`, `route-monitor.mjs` вызывали `/api/v2/calculate`; их 9 ошибочных assertions не являются результатами V3. По сохранённым фактам 7 ожиданий «обязательно показать бесплатную альтернативу» не имели независимого источника; Москва→Казань и Ялта→Краснодар подтверждены как платные/сохранённые расчёты, а требование выдать для Ялта→Краснодар точную цену из `unknown/null` было ошибкой теста. Исправлений runtime V3 по этим данным не доказано и не внесено.

Ограниченная V3-проверка: Ялта→Краснодар HTTP 200, 501.2 км / 416 мин, toll `priced` 800 ₽ по найденному компоненту А‑289; Ялта→Москва HTTP 200, 1817.8 км / 1476.8 мин, 4725 ₽ будний / 5625 ₽ выходной по M‑4 + А‑289; Донецк→Казань HTTP 200, 1534.9 км / 1424.4 мин, toll `unknown/null` (нет прямой доказанной пары М‑12, transfer pricing отдельно); Москва→Казань HTTP 200, 820.2 км / 687.9 мин, toll `unknown/null` по той же причине. Тверь→Адлер и Голубицкая→Санкт-Петербург вернули HTTP 502: геокодирование прошло, три провайдера не выдали маршрут; API не показал provider-level статусы, поэтому точная внешняя причина остаётся неразличимой. Для них нет PASS и исправлений геометрии/тарифа.

**Обновлён final-gate:** workflow теперь проверяет активную V3 и сохраняет отдельные V2 legacy smoke checks; отсутствующие скрипты заменены существующим benchmark integrity и целевыми V3 integrity suites, не заглушками. Workflow запускается на push в единственную рабочую ветку с read-only permissions; PR-триггер учитывает фактическую base ветку. Успешные API smoke-запросы не расходуют провайдерные маршруты. Ограниченный live V3 отчёт не сохраняет геометрию/сырые provider payloads. Strict freshness и live route outcome агрегируются отдельно и дают красный итог при любом отказе.

**Результаты текущего кода:** полный `pnpm build` — 1142 PASS / 0 FAIL / 1 skipped; TypeScript — PASS; ESLint — exit 0 (9 существующих предупреждений); Next стандартная Turbopack production build — PASS, Webpack build — PASS; final-gate harness 6/6; API smoke 16/16; V2/V3 readiness static checks — PASS; route benchmark — 61 записей PASS; YAML/JS syntax и `git diff --check` — PASS. Предыдущий непрямой offline run в обычном sandbox давал 3 `EPERM` subprocess failures; полный build на текущем коде после разрешённого запуска завершился с нулём ошибок тестов. Локальный `/api/version` не имел commit metadata из-за уже запущенного локального сервера, но local routes smoke прошёл.

**Оставшиеся реальные блокеры:** strict tariff freshness сообщает 2 stale snapshots для `avtodor-other-roads-2026-10-01-category1-transponder` и `...no-transponder` (37 дней, предел 30; эффективная дата UNKNOWN); более новый официальный evidence не сохранён. Два V3 маршрута завершились HTTP 502 без provider-level причины. Пока нет hosted run на этом локальном кандидате; push запрещён. См. [следующие действия](NEXT_STEPS.md). Не объявлять продукт готовым к Production.

---

# Previous handoff — Stage Z combined M‑11/M‑4: LOCAL CANDIDATE, GATE BLOCKED (2026-11-07)

**LOCAL ONLY / PUSH FORBIDDEN.** Isolated worktree `/workspace/stage-z-stabilization`, branch `codex/stage-z-stabilization`, final recorded HEAD `7d9310d8a131b1191b0f91d1b6b48e5296af762f`. Original Stage Z worktree remains clean at `40d650a29ee06643ee325402c3c4f7fead302dd9`; protected primary 91-commit worktree remains clean at `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe` (ahead 91/behind 5). PR #14 stays Draft. No merge, push, Preview, Production, main, Android or V2 change.

Fetched remote evidence ref `handoff/2gis-evidence` read-only at `9c625c4cf5ea89625623fb4ead4bb4980b3e03c6`; not merged. Verification complete: manifest matched all 83 file sizes/hashes; `SHA256SUMS` matched 84 listed files; Stage 8 original packet SHA `310d3b70f53e79057e45927beb3edf448f08ca0a17200f782e1eb8f40f223918`. All six source/evidence tests pass (42 directed M‑11 pairs/210 cells; M‑4 PVP545 and M‑12 cases remain unknown). The packet's README historical implementation SHA conflicts with handoff metadata; the cited object is unavailable remotely, so no old patch is applied or claimed verified. No handoff blobs/runtime/data were copied into the candidate. Verification checkpoint: [handoff evidence DONE](checkpoints/2026-11-07-stage-z-handoff-evidence-DONE.md).

M‑11 15–58 has a minimal dated V3 lookup over the preserved April matrix and verified November official matrix. M‑11 58–679 data/logic were not changed. M‑4 tariff data remains the corrected Order 58 edition; Stage W's misread transcription is retained only as historical/audit input, not active runtime pricing. Stage V selected-trace protection remains in the runtime diff. See [Stage Z report](../experiments/nationwide-tolls/checks/2026-11-07-stage-z-m11-m4/README.md), [M‑11 checkpoint](checkpoints/2026-11-07-stage-z-m11-head-DONE.md), and [final gate checkpoint](checkpoints/2026-11-07-stage-z-final-gates-BLOCKED.md).

Targeted gate: source/evidence 6/6, M‑4/M‑11/multi-road 14/14, API/estimate/unknown/render 8/8, M‑11 adapter 6/6, M‑11 boundary 7/7, legacy M‑11/CKAD adapter 2/2, quote/API script PASS. TypeScript PASS; ESLint PASS (9 pre-existing warnings, 0 errors); Next Webpack production build PASS. Full offline equivalent: 192/195 PASS, 3 FAIL due to sandbox subprocess execution/capture (`audit-child-process`, nested `spawnSync`/missing child-generated fixture, `systemic-audit-report` EPERM). `pnpm test:audit` could not start because pnpm attempted to create `/home/agent/.local/share/pnpm/store` outside the writable sandbox. This is not a full-gate PASS; candidate is not ready for release. Exact results and reproducible CI next step are in the final-gate checkpoint and report.

---

# Previous handoff — Stage Z stabilization: fail-closed M‑4/V3, gate limited by sandbox (2026-11-06)

**LOCAL / NOT READY FOR PUBLICATION.** Изолированный worktree `/workspace/stage-z-stabilization`, branch `codex/stage-z-stabilization`, сохранённая основа Stage Z `40d650a29ee06643ee325402c3c4f7fead302dd9`. Предыдущий Stage Z worktree и основная локальная история из 91 коммита не перемещались. No push, merge, Preview, Production, main, Android или изменение PR #14 (он остаётся Draft).

Исправлены два дефекта проверочной инфраструктуры: CKAD regression теперь сравнивает сохранённые исходные поля без нового вычисляемого `routeSignature` и проверяет, что подпись относится к replay-геометрии; browser-only hydration fixture переименован в `.browser.mjs`, остаётся явно запущенным в выделенном V3 browser workflow с pinned Playwright/Chrome и больше не попадает в обычный `test:audit` glob. Найден и исправлен устаревший тестовый контракт сохранённого M‑4/Воронеж маршрута: прежнее ожидание 7 254 ₽ противоречило его же историческому статусу `unconfirmed` и нынешнему неполному trace. В текущем fixture только 1 из 5 ответов проверки ПВП сохранён, четыре отсутствуют; поэтому API обязан вернуть `unknown/null`, а не финальную цену. Runtime, тарифные данные и геометрия не изменялись. Ялта→Ростов не заявляется как подтверждённая полная операторская цена.

Целевые CKAD/V3 saved-route tests: 8/8 PASS; M‑4 saved route, trace reuse, A‑289 composition/long route: 5/5 PASS; browser workflow contract: 1/1 PASS. Прямой эквивалент offline test glob: **191/194 PASS, 3 FAIL**, все три — ограничения запуска subprocess в этой sandbox: потеря stdout/stderr у `execFile`, отсутствие mock child writes после запрета/нестарта nested Node, и точный `spawnSync ... EPERM` у report test. Предыдущая трактовка о недостающем CKAD fixture оказалась неверной: fixture и historical captures присутствуют; исправлена совместимость assertion, исторические байты не менялись. Browser hydration test теперь исключён из offline glob не удалением проверки, а отдельным обязательным workflow; локально Playwright package отсутствует, browser test здесь не запускается. `pnpm test:audit` не стартовал: pnpm auto-install попытался создать store вне sandbox (`/home/agent/.local/share/pnpm/store`). Аналогичный прямой gate реально выполнен. TypeScript PASS; полный ESLint exit 0 (9 warnings, 0 errors); quote/API contract PASS; Next.js Webpack production build PASS; YAML, JavaScript syntax и `git diff --check` PASS. Полный hosted gate ожидается только после отдельного разрешения на push и на точном SHA; пока кандидат не готов к публикации из-за оставшихся 3 sandbox FAIL и незавершённой интеграции Stage 8/M‑11.

Подробный результат и evidence: [Stage Z stabilization report](../experiments/nationwide-tolls/checks/2026-11-06-stage-z-stabilization/README.md), [DONE checkpoint](checkpoints/2026-11-06-stage-z-stabilization-DONE-LOCAL.md), [STARTED checkpoint](checkpoints/2026-11-06-stage-z-stabilization-STARTED.md). Исходный Stage Z report/checkpoint и Stage X/Y/V handoffs ниже сохранены исторически. До release candidate требуется отдельно разрешить и получить полный hosted CI на точном candidate SHA, а также доставить/проверить незавершённый Stage 8/M‑11 evidence; для M‑4 четырёх external-only controls и недатированной поздней таблицы остаётся `unknown`/unconfirmed.

# Предыдущий handoff — Stage W M‑4 current tariff reconciliation (2026-11-06)

**DONE LOCAL / PUSH FORBIDDEN.** В изолированном worktree `/workspace/stage-w-m4-tariffs`, branch `codex/stage-w-m4-tariffs`, опубликованная база `d60e733313860d2412d8be64f4be10ef71f7de28`; Stage V отдельно не переносился. Candidate runtime/data/tests commit `014b3838cd0565b1efb1c64a6370f264ea2a11e7` (parent STARTED `0c9e44efb0e2acf38558fe2e9d83a0832f30ce7c`). Официальная текущая категория I M‑4 таблица содержит 4 колонки и отличается от приказа №58, действующего с 02.03.2026, в 38 из 42 сопоставимых ячеек. Реальный V3 source — `M4_ACTIVE_ENDPOINT_REGISTER.json`/M4 rows `TARIFF_SELECTION_REGISTER.json`, а не только актуальный `m4-data.ts`. Добавлен детерминированный генератор current *estimates*: 722 vector rows + 2 PVP355 receipt rows; 4 external-only rows остаются `unknown`; 32 south + 4 DZOK rows — current-posted estimates с `priceConfirmation=unconfirmed`. Дата вступления в силу в связанном PDF не получена, поэтому суммы не подтверждены как точные тарифы для O-D; детали — в [Stage W report](../experiments/nationwide-tolls/checks/2026-11-06-stage-w-m4-current-tariffs/README.md).

Фокусные проверки Stage W: 71 тест PASS + quote/API script; JS syntax, 4 JSON parse, generation idempotence и `git diff --check` PASS. Полный offline gate не завершён: `pnpm` exit 254 при создании store вне доступного workspace; direct test run блокируется отсутствующими `next`/`typescript`/`eslint` пакетами. TypeScript, ESLint, Next Webpack build фактически не прошли/не запустились (отсутствуют локальные зависимости). Stage V прежние 5 gate failures остаются отдельными: 3 child-process harness/sandbox, CKAD fixture отсутствует в опубликованной базе, Chromium SIGTRAP/EPERM. Самодостаточный bundle заблокирован 26 отсутствующими promisor blobs; после последнего документального commit создан final incremental bundle с prerequisite `d60e733…`. Точный bundle path/SHA приведён в финальном handoff. Все подробности — [DONE checkpoint](checkpoints/2026-11-06-stage-w-m4-current-tariffs-DONE-LOCAL.md); Stage W candidate **не готов к публикации** до PDF/effective-date evidence и прохождения обязательных CI gates. Push/Preview/Production не выполнять.

## Предыдущий handoff — Stage T V3 input-readiness harness (2026-11-06)

**DONE LOCAL / PUSH FORBIDDEN.** The Stage T candidate is locally committed in isolated worktree `/workspace/stage-t-v3-input-readiness`, based on local-only commit `1e30ff192f7d6e1a807e98a04b62814b427b645f` whose parent and published source are `7d5caee6602ae0431906566ab2ec074fd89b8540`. No push occurred; remote was not modified. Stage S run `42116523393` showed no `/r` request and an empty input for Yalta and Donetsk→Melitopol, but did not prove hydration as the cause. Stage T's deterministic local fixture reproduced an early-fill/controlled-state overwrite and showed the observed React-mode handshake preserving later input. This confirms the harness had a readiness race, not that Production caused the original failure. Harness now records readiness milestones, input/event retention and `/r` states, and runs an independent replacement diagnostic apart from the original Yalta chain. Targeted suite: 11/11 PASS when Chromium ran with the required environment permission; default sandbox Chromium invocation failed before tests with SIGTRAP/permission restriction. YAML/permissions/path contract, JS syntax, and `git diff --check` PASS. Scoped ESLint unavailable (no local binary); full app gate intentionally not run because no runtime changed. See [Stage T DONE checkpoint](checkpoints/2026-11-06-102800-stage-t-input-readiness-DONE-LOCAL.md). Remaining: separately authorized fast-forward push, then inspect the actual GitHub Actions artifact/results; no live V3 result is claimed.

## 02.11.2026 — компактная шапка Android/theme LOCAL

[Checkpoint](checkpoints/2026-11-02-compact-download-header-LOCAL.md). V3 download визуально уменьшен и перенесён в правый верхний стек над ThemeToggle; version text и отдельная download-строка убраны. Mode/address area структурно выше, safe-area сохранена; 44px link touch target. V2/APK URL/тарифы прежние. Target2+17+9 PASS, offline1104/0fail/1skip, TS/lint/build PASS; визуальный browser NOT_RUN. Только local, без push/Production.

## 02.11.2026 — подписи выбранного проезда опубликованы

[Checkpoint](checkpoints/2026-11-02-route-heading-production-DONE.md). Production/remote76442adbddcedceea8b9ff2b2ddc846ec861b5e7, deployment dpl_7bL6TnTJBw9sPTBhJQaNzo7e4fcE READY. /api/version и опубликованные JS подтвердили новые подписи. Реальные Donetsk→Volnovakha и Donetsk→Yalta POST HTTP200 дают внутреннюю/материковую подпись по проверенному mapping. Hosted offline1104/0fail/1skip, TS/build/browser PASS; отдельный live_probe прежний Photon503. PR14 Draft, main/Android V2 прежние. Переключатель пока только в отдельном demo, к app не подключён. APK получает обновлённый /v3 после перезагрузки; device check не выполнен. Итоговая запись local.

## 02.11.2026 — честные подписи выбранного проезда V3 LOCAL

[Checkpoint](checkpoints/2026-11-02-route-heading-LOCAL.md). Заголовок и копия V3 различают verified specialOnly, mainland и crimea; без metadata нейтральная подпись, обычные поездки и V2 прежние. Не утверждается проезд через Краснодар по одному имени corridor. Heading2/SSR9 PASS, offline1104 PASS/0FAIL/1SKIP, TS/lint/build PASS. Волгоград: offline plans Донецк/Волноваха mainland без моста, Мелитополь crimea с мостом в обе стороны. Переключатель остаётся отдельным demo до двух реальных рассчитанных вариантов; fake alternative не подключён. No push/Production.

## 02.11.2026 — отдельный стенд переключателя проезда LOCAL

[Checkpoint](checkpoints/2026-11-02-corridor-switch-demo-LOCAL.md). Standalone experiments/rational-corridor/demo-preview.html: две особые тестовые точки включают переключатель direct/external, один результат, разница времени/цены, начальная рекомендация2:1 и ручной выбор. Учебные данные явно обозначены; реальные адреса/провайдеры ещё не подключены. 11 model/comparator tests PASS, scoped lint и syntax checks PASS; mobile Chromium TLS timeout, visual acceptance OPEN. App/Production не менялись, push нет.

## 02.11.2026 — пробный вес особого времени 2:1, LOCAL

[Checkpoint](checkpoints/2026-11-02-rational-corridor-weight-2to1-LOCAL.md). Владелец выбрал 2 часа вне особых территорий = 1 часу внутри. Прототип явно использует ordinary + 2*special (=total+special), на равенстве предпочитает меньшее реальное время. Пограничные регрессии добавлены; runtime/Production не менялись.

## 02.11.2026 — рациональное сравнение коридоров: isolated prototype LOCAL

[Checkpoint](checkpoints/2026-11-02-rational-corridor-prototype-LOCAL.md). Пример радиуса60км не превращён в географический запрет. Изолированный experiments/rational-corridor сравнивает полное время и измеренное время в особых территориях; экспериментальный вес явно обозначен, неполные данные не дают рекомендации. Runtime/Production не менялись. Проверены большой бессмысленный объезд, существенное сокращение пребывания, доминирование и неполные измерения; scoped lint PASS. До интеграции нужны реальные парные маршруты, чувствительность к весу и оценка лишнего километража/стоимости.

## 02.11.2026 — уточнение северных маршрутов: полные суммы подтверждены

[Checkpoint](checkpoints/2026-11-02-crimea-north-policy-RECONCILED.md). Предыдущие unknown в северных controls были получены с bare date, тогда как UI отправляет ISO instant. Реальная Production-проверка с 2026-11-02T12:00:00+03:00: Ялта↔Ростов 2060/2210 ₽, Ялта↔Москва 4725/5625 ₽, все четыре HTTP200/priced. Ростов сохраняет А289800+обход410; Москва идёт через другой съезд А289385, полный800/обход410 ей не назначаются. Ранее сделанный вывод о недостатке тарифных данных для этих конкретных проверок исправлен. Runtime/Production a05fba10 не менялись. Исправлен probe, добавлены 2 PASS regression, TS/lint PASS; исходные исторические evidence сохранены. Новые результаты local.

## 02.11.2026 — Crimea routing P1 опубликован и проверен на Production

[Checkpoint](checkpoints/2026-11-02-crimea-routing-production-DONE.md). Production `a05fba100055787e9351122eaafa1471bffc44ff`, deployment dpl_VdMSM7rCqAvwK4jHAV9pasDXDm8x READY; /api/version подтвердил SHA. Все 14 main-site controls HTTP200: Анапа↔Керчь 133–134 км, Анапа↔Ялта ~388 км, Ялта↔Адлер ~739 км, платность free/0. Дальние Москва/Ростов строятся, неполные тарифы unknown/null; внутренние особые маршруты без регрессий. Hosted offline 1099 PASS/0 FAIL/1 SKIP, TS/build/browser PASS; live_probe отдельно FAILED на прежнем Photon503/cooldown. PR14 Draft, main/Android V2 сохранены. Итоговые результаты после выпуска сохранены локально; source Production a05fba10.

## 02.11.2026 — Crimea routing P1 prepublication PASS

[Checkpoint](checkpoints/2026-11-02-crimea-routing-prepublish.md). Ordinary Crimea plans require bridge only; V3 considers all plans by actual seconds. 14 real bidirectional controls HTTP200, six short Crimea cases free/0 with no A289 frame crossing; Moscow/Rostov incomplete tolls remain unknown. Offline 1093 PASS/0 FAIL/1 SKIP, additional six saved-geometry tests PASS, TS/lint/build PASS. Evidence: experiments/crimea-routing-2026-11-02. Owner authorizes push and Production; awaiting hosted checks and release. Main/Android V2 unchanged.

## 02.11.2026 — Android V1.01 опубликован на Production

[Checkpoint](checkpoints/2026-11-02-android-v101-production-DONE.md). Source/remote `2bba1f4036409ea1a45021fd04c783cce0fc5d4e`; обычный push выполнен. Actions 41352242498/41352242447 SUCCESS: offline 1092 PASS/0 FAIL/1 SKIP, TS/build/browser regressions PASS; live jobs штатно SKIPPED. Production deployment `dpl_7YckGZayaDjZLPQgiSJ6JGws3w5p` READY. Основной /v3 содержит кнопку, браузер подтвердил её ссылку; публичный APK GET HTTP200, 819945 bytes, исходный SHA256 совпал. Production поиск Ростов HTTP200/Ростов-на-Дону первым; полный Донецк→Волноваха HTTP200, 56.678 км, 3414 с, четыре особые суммы и одна группа. Физический Android, обновление старой установки и mobile visual acceptance не проверены. PR14 Draft, main/V2 сохранены. Итоговые документы пока local; Production source 2bba1f40.

## 01.11.2026 — Android V1.01 download button LOCAL/PARTIAL

[Checkpoint](checkpoints/2026-11-01-2324-android-v101-download-LOCAL-PARTIAL.md). Verified 819945-byte APK from Actions artifact 13097107982 with SHA-256 `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a`. GitHub prerelease upload failed at `uploads.github.com` with HTTP401; no release/tag remains. Prepared static Next.js asset `public/downloads/Iz-A-v-B-V1.01-debug.apk` and V3-only download button; V2 unchanged. Targeted tests 2/2, TypeScript, scoped ESLint, direct Next build and local static HTTP200/SHA readback PASS. Local full audit 183/186 test files, three known sandbox child-process failures; Chromium visual check blocked by TLS `net_error -202`. No push or Production deployment; public no-auth link and Preview button **not yet verified**. Local merge preserved remote Android changes and the previous local checkpoint.

## 01.11.2026 — V1.01 special routes / Rostov: опубликовано, hosted acceptance PARTIAL

[Checkpoint](checkpoints/2026-11-01-1849-v101-special-push-preview-PARTIAL.md). Один разрешённый fast-forward push `2c52c814…` → `3f185c7b0fcffc003347f7b35dff32ea1c620851` выполнен; remote tree и blob readback совпали, PR14 Draft. Actions 41337975840 и 41337981188 SUCCESS; 41337981186 overall SUCCESS с offline 1090 PASS/0 FAIL/1 SKIP, TypeScript/Next build PASS и real Donetsk→Moscow HTTP200, но отдельный `live_probe` FAILURE: Донецк `SOURCE_UNAVAILABLE` после Photon HTTP503/cooldown. Preview точного SHA READY, однако Vercel Login и недоступный browser connector блокируют deployed desktop/mobile и требуемые полные контрольные маршруты. Их результаты остаются NOT_VERIFIED, не DONE. Второй push запрещён; эта запись пока только local.

## 01.11.2026 — Android V1.01 APK собран, GitHub Actions PASS (установка на устройстве НЕ ПРОВЕРЕНА)

[Checkpoint](checkpoints/2026-11-01-android-v101-APK-PENDING.md). GitHub Actions [run 41340511993](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41340511993) завершился SUCCESS на `d306f5b8a283f7f192295b2dbc0c5b4f4f085670`. APK `Iz-A-v-B-V1.01-debug.apk` (applicationId `ru.mezhgorod.calculator`, versionCode `5`, versionName `1.01`) присутствует в артефакте `Iz-A-v-B-V1.01-APK` (artifact ID `13097107982`, до 01.12.2026). ZIP integrity, APK `unzip -t`, aapt package metadata, SHA-256 `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a` — PASS. Сборка DEBUG-подписанная; обновление поверх прежней APK зависит от совпадения сертификата и не подтверждено. Старая V2 и Production сайта без изменений; PR №14 Draft. Пользовательское устройство и runtime веб-калькулятора в WebView ещё НЕ ПРОВЕРЕНЫ.

## 01.11.2026 — V1.01 «Ростов-на-Дону» в локальном GeoNames, LOCAL

[Checkpoint](checkpoints/2026-11-01-v101-rostov-geonames-LOCAL.md). В записи GeoNames `501175` алиас «Ростов-на-Дону» уже присутствовал, но выбранный заголовок был «Ростов». Для ровно этого подтверждённого ID/региона/координат отображение использует существующий полный алиас без изменения координат или глобальной замены текста. Поиск «Ростов» ставит его первым; Ярославский Ростов `501183` остаётся отдельным и первым при явном уточнении. Реальный local `/api/suggest` и `/r` при контролируемом полном отказе Photon PASS, внешний вызов 0. Сохранённый snapshot при фиксированной дате также содержит полное имя, но runtime switch выключен. V2 UI/маршрутизация/тарифы не менялись. Без push; Preview не проверен.

## 01.11.2026 — V1.01 internal special-only tariff, LOCAL

[Checkpoint](checkpoints/2026-11-01-v101-internal-special-tariff-LOCAL.md). V3 допускает единую особую группу только когда оба endpoint и каждый измеренный участок подтверждены внутри четырёх зон. Ручной ordinary override не стирает особые километры; маршрут, вышедший за полигон, не выдаётся за внутренний. Четыре суммы, API-контракт, SSR формы/результата и прежняя V2 прошли целевые тесты. Ограниченный реальный OSRM подтвердил геометрии Донецк→Волноваха (56,6782 км) и Донецк→Мелитополь (298,5933 км), обе внутри зон; полный локальный POST вернул 502 до тарификации из-за Node `fetch` `ECONNREFUSED`, тогда как curl через штатный proxy получил OSRM HTTP200. Штатный offline gate: 182/185 файлов PASS, три child-process теста BLOCKED_BY_SANDBOX EPERM; TypeScript/scoped ESLint и `next build --webpack` PASS, штатный Turbopack build EPERM. Локальный Chromium 390×844 не завершился за 18 с из-за повторяющихся TLS `net_error -202`; mobile browser NOT_RUN. Не опубликовано; живой V3/Preview и hosted gate остаются обязательными до заявления о полном исправлении.

## 01.11.2026 — внутренний маршрут особых территорий: прямой routing-план LOCAL

[Checkpoint](checkpoints/2026-11-01-special-internal-routing-LOCAL.md). `candidatePlans()` для двух особых endpoints теперь строит только `[A, Б]` без Крыма/материковых промежуточных точек; для ровно одного особого endpoint действующая политика не менялась. До правки регрессия воспроизводила `crimea`/`CRIMEA_INTERIOR` для Донецк→Мелитополь. После правки 14/14 target PASS, TypeScript/scoped ESLint PASS. Это проверка выбора плана, не живой проезжаемости маршрута. Следующее: V3-only special-only тариф и отображение после подтверждённого split. Только локально, push запрещён.

## 01.11.2026 — V1.01 опубликован в рабочую ветку; CI PASS с отдельным live_probe FAILURE, Preview READY

[Checkpoint](checkpoints/2026-11-01-1840-v101-push-preview-PARTIAL.md). Единственный разрешённый fast-forward push `d54bf5bc…` → `2c52c81425cd59ea6e4ea9f3ca3c47b34d8a83b6`; remote HEAD и пять ключевых Git blobs совпали, PR14 OPEN/Draft. Все четыре Actions overall SUCCESS; hosted offline gate 1082 PASS/0 FAIL/1 SKIP, TypeScript и штатный Next build PASS; B03 browser 10/10 current PASS. В special-territory run 41321914446 отдельный `live_probe` FAILURE: Донецк `SOURCE_UNAVAILABLE`, Photon HTTP503/cooldown. Preview `dpl_46d42SspdWHkqaG4SnB49jCXWS92` READY на точном SHA: https://mezhgorod-calculator-e67gsp7m3-4regodatbe-5310.vercel.app/v3. Защищён Vercel Login; Opera Connector UNAVAILABLE, поэтому реальный browser Preview NOT_RUN. Предыдущий локальный Chromium desktop/mobile light/dark с controlled API остаётся действительным для того же исходного дерева, но не подтверждает Preview. Production не трогали; AUDIT-01 и Photon 503 открыты. Результаты публикации сохранены пока только локально, второй push запрещён.

## 01.11.2026 — V1.01 UI локально готов, штатный build BLOCKED_BY_SANDBOX

[Checkpoint](checkpoints/2026-11-01-1750-v101-ui-LOCAL.md). Шапка `/v3` теперь компактная `V1.01`; V2 и платные дороги удалены только из навигационных ссылок шапки, соответствующие маршруты приложения сохранены. Убрано второе краткое предупреждение в footer, GeoNames/CC BY 4.0 остаётся видимой атрибуцией. Укрупнены кириллические А/Б. Результат имеет один заголовок; стандартные короткие тарифные итоги V1 на мобильном — 2 колонки, детальные суммы — одна. Локальный Chromium desktop/mobile, light/dark, standard/dual с контролируемым API PASS; это не Vercel Preview. Offline gate 1082 PASS/0 FAIL/1 SKIP, TypeScript/scoped ESLint PASS. Штатный Turbopack build exit1 из-за sandbox `creating new process / binding to a port / EPERM`; альтернативный `next build --webpack` exit0, не заменяет обязательный штатный CI. AUDIT-01 и Photon 503 без изменений. Только local commits/bundle; push не выполнялся. Следующее: разрешённый push/hosted CI и защищённый Preview, если владелец решит публиковать.

## 01.11.2026 — второй V1 Release push: CI PASS, Preview READY, browser PARTIAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-second-push-ci-PASS-preview-PARTIAL.md). Remote `d54bf5bc…` readback PASS, PR14 Draft. Actions 41290799596/41290799660 overall SUCCESS: mandatory offline 1082 PASS/0 FAIL/1 SKIP, TypeScript/Next build PASS, B03 controlled browser SUCCESS; локальный full ESLint exit0/7 warnings. Отдельный live_probe job FAILURE на Photon 503/cooldown для Донецка. Vercel Preview точного SHA READY, но защищён Vercel Authentication; реальный Preview browser NOT_RUN без OIDC. Локальный Chromium desktop/mobile light/dark с mock API PASS, не подменяет Preview. Production неизменен, AUDIT-01 PARTIAL. Результаты этого checkpoint пока только local, третьего push нет.

## 01.11.2026 — V1 Release push выполнен, CI/Preview FAILED

[Checkpoint](checkpoints/2026-11-01-ui-v1-push-ci-FAILED-local-followup.md). Единственный разрешённый fast-forward push опубликован как `55aa69ae…`; GitHub remote/readback PASS, PR14 Draft. Четыре Actions завершились FAILURE: два offline clipboard harness assertion после удаления UI-05 state; B03 browser job SUCCESS (current 10/10), timing SUCCESS, live_probe отдельно упал на Photon 503/cooldown для Донецка. Preview точного SHA создан, но ERROR на тех же offline assertions. Локальный узкий test fix 9/9, TS/lint PASS, **не опубликован**; второй push запрещён данным разрешением. Desktop/mobile Preview NOT_RUN, AUDIT-01 PARTIAL, Production прежний.

## 01.11.2026 — V1 Release UI локальная передача PARTIAL

[Матрица](ui-v1-release/ACCEPTANCE_STATUS.md), [checkpoint](checkpoints/2026-11-01-ui-v1-local-handoff-PARTIAL.md). 14/14 UI-пунктов имеют локальные изменения; form16/16, result7/7, TS/scoped lint PASS. Визуальная и hosted CI/Preview приёмка открыта; AUDIT-01 PARTIAL с локальными 502 до pricing. Remote `beb57c80…` read-only подтверждён, PR14 OPEN/Draft, Production не менялся. Push нет.

## 01.11.2026 — UI-04 компактный первый экран LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-first-screen-LOCAL.md). Только V1: вертикальные отступы первого экрана уменьшены без уменьшения текста/44px кнопок и без изменения V2; form SSR16/16, TypeScript/scoped lint/diff PASS. Геометрия mobile, увеличенный системный шрифт и клавиатура NOT_RUN — пользовательская приёмка открыта. 14/14 UI-пунктов имеют локальные изменения, но не все визуально подтверждены; AUDIT-01 PARTIAL. No push.

## 01.11.2026 — AUDIT-01 локальное воспроизведение PARTIAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-audit01-route-reproduction-PARTIAL-LOCAL.md). Два реальных route POST с центрами GeoNames завершились HTTP502 до `response_pricing` (~5.2/5.6 с), leg/геометрия/суммы отсутствуют. Причина 614,2 км и отсутствие четырёх тарифов именно в Preview остаются неустановленными; тарифы/политика не менялись, одинаковые live-запросы не повторять. Нужен исходный успешный Preview response/trace. Только local commit/bundle, no push.

## 01.11.2026 — AUDIT-01 ограниченная проверка STARTED LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-audit01-STARTED-LOCAL.md). Три центра городов подтверждены локальным GeoNames; далее ровно два real route POST для причины отсутствующих/сомнительных сумм. Без смены политики, no push.

## 01.11.2026 — UI-10 прокрутка dual LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-dual-scroll-LOCAL.md). Одноразовая rAF прокрутка при переходе в dual, без реакции на тарифные ставки и активный ввод. Form15/15, TS/scoped lint PASS. Browser keyboard/mobile NOT_RUN, push нет.

## 01.11.2026 — UI-11 мобильная кнопка и 8 тарифов LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-dual-action-LOCAL.md). Fixed mobile calculate остаётся после результата только на V1, 8 dual полей и urgent switch сохранены; SSR14/14, TS/scoped lint PASS. Перекрытия/клавиатура требуют браузера, push нет.

## 01.11.2026 — UI-03 тарифные карточки LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-rate-cards-LOCAL.md). Только V1: рамки контрастнее, padding/иконки меньше при 44px touch targets; V2 сохранён. Form13/13, TS/scoped lint PASS. Визуальная приёмка открыта, push нет.

## 01.11.2026 — UI-13 контраст двойных результатов LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-dual-result-contrast-LOCAL.md). V1 dual карточки усилены border/ring/фоном раскрытия, V2 прежний. Result-render7/7, TS/scoped lint PASS; визуальная приёмка открыта, push нет.

## 01.11.2026 — UI-01 фон логотипа LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-logo-LOCAL.md). Удалена непрозрачная плашка контейнера /v3, тёмная тема инвертирует SVG для контраста; форма логотипа не менялась. Result-render7/7, TS/scoped lint PASS, визуальная приёмка открыта. Push нет.

## 01.11.2026 — UI-14 заголовок результата LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-route-heading-LOCAL.md). Быстрейшая V1 карточка показывает утверждённое сообщение, усиленный значок, строку расстояния/времени; /v2 не изменён. Result-render6/6, TS/scoped lint PASS. Визуальная узкая ширина и hosted gate открыты, push нет.

## 01.11.2026 — UI-12 пояснение зон LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-zones-copy-LOCAL.md). Пояснение перенесено из V1 формы под завершённый dual result; V2 сохранён. Form12/12, result6/6, TS/scoped lint PASS. Push нет, визуальные и hosted gates открыты. Далее независимые UI-пункты/AUDIT-01.

## 01.11.2026 — UI-09 атрибуция LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-attribution-LOCAL.md). Технический текст справочника убран с /v3, GeoNames/CC BY 4.0 attribution сохранена, статистика не менялась. Result-render5/5, TS/scoped lint PASS; push нет. Далее UI-12 и независимые блоки.

## 01.11.2026 — UI-08 справочное предупреждение LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-result-disclaimer-LOCAL.md). Утверждённая строка появляется только после V1 результата; result-render4/4, TS/scoped ESLint PASS. Визуальная dark/mobile приёмка открыта, push нет. Далее UI-09/12.

## 01.11.2026 — UI-02 поля A/B LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-address-fields-LOCAL.md). На /v3 внешние подписи визуально скрыты, A/B внутри полей, MapPin/placeholder/aria/реверс сохранены; /v2 не меняет прежний вид. SSR11/11, TS/scoped ESLint PASS. Browser/mobile пока NOT_RUN, push нет. Далее независимые UI-блоки.

## 01.11.2026 — UI-05 ПВП переключатель удалён из V1 Release LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-pvp-switch-LOCAL.md). На /v3 нет пользовательского ПВП toggle/state/handler; /v2 сохранён. Обязательная серверная тарификация не зависит от no-op диагностического флага. SSR10/10, TS/scoped ESLint PASS. Push не выполнялся; full hosted gate нужен до публикации. Далее UI-02.

## 01.11.2026 — V1/V2 тексты изолированы LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-v2-copy-isolation-LOCAL.md). `releaseCopy` включён только на /v3: UI-06/07 видны в V1 Release, старый /v2 сохранил прежние строки. SSR 9/9 PASS, TypeScript/scoped ESLint PASS. Push не выполнялся; full gate/build ожидают подходящей среды. Далее другие UI-блоки.

## 01.11.2026 — UI-07 поддержка проекта LOCAL

[Checkpoint](checkpoints/2026-11-01-ui-v1-project-support-LOCAL.md). Утверждённый текст карточки поддержки и кнопки внедрён, прежний платёжный URL сохранён; общий компонент /v3 и /v2. SSR regression 7/7 PASS, TypeScript PASS, scoped ESLint exit0. Full gate/build остаются непроверенными в подходящей среде после локального sandbox EPERM; push не разрешён. Следующий блок — AUDIT-01 без смены бизнес-правил.

## 01.11.2026 — UI-06 текст ожидания LOCAL, gate ограничен sandbox

[Checkpoint](checkpoints/2026-11-01-ui-v1-loading-copy-LOCAL.md). Две строки общего `CalculatorForm` обновлены на «Подождите минуту», новый SSR test 6/6 PASS. TypeScript PASS, lint exit0/7 прежних warnings. Локальный `test:audit` остановился на трёх известных child-process failures; Next build — EPERM при создании процесса/порта Turbopack. Не считать полный gate/build пройденными. Только локальный commit/bundle, push не разрешён. Следующее UI-07, затем hosted gate при отдельном разрешении на публикацию.

## 01.11.2026 — UI-01 V1 Release: название на экране DONE

[Требования и список UI-наблюдений](ui-v1-release/README.md), [checkpoint](checkpoints/2026-11-01-ui-v1-release-header-DONE.md). В `app/v3/page.tsx` подпись «Актуальный калькулятор» заменена на «V1 Release» без изменения расположения, логотипа, V2, маршрутов/тарифов/API. Исходный UI commit `f63fb41ce8c06553f8328574258fe41ee00e1131`; GitHub readback PASS. Actions Special Territory 41251210383 и B03 41251210382 SUCCESS. Vercel Preview dpl_ENRgrowFr9Uv6spwpcPngPvek6WN READY на точном commit, HTML /v3 200 и содержит новую подпись; desktop/mobile browser NOT_RUN (Opera UNAVAILABLE). PR14 Draft, Production на e3ca3783 без изменений. UI-02—UI-05 — только наблюдения, не реализованы. Следующее: согласовать приоритет следующих интерфейсных изменений; не менять дизайн по предположению.

## 01.11.2026 — реорганизация: архивы DONE; широкая очистка DEFERRED

[Актуальный итог](reorganization/FINAL_STATUS.md), [контрольная точка](checkpoints/2026-11-01-reorganization-doc-close-DONE.md). Три полных исторических архива размещены и восстановлены; V3 GitHub prerelease 343730585 Б / SHA256 d6b77252… / 14042/14042, Actions 41241619408 SUCCESS. Research-selected 61/61 также сохранён. Ровно шесть historical metadata-файлов (17957 Б) удалены после восстановления/cmp PASS. Остальные файлы оставлены: недостаточно доказательств безопасности массовой очистки; она отложена, а не объявлена выполненной. Старый HTTP401 устранён на runner. По состоянию до документального шага PR14 Draft, рабочий HEAD `461e342522a154b5124a7acb09281e3018494257`, Production релиз e3ca3783 READY и не изменён. Никаких новых runtime/CI/test изменений или запусков в этом документальном шаге. Следующее — интерфейсные задачи в существующей песочнице; к очистке возвращаться только по конкретным доказанным кандидатам.

## 01.11.2026 — точечная очистка исторических metadata

[Checkpoint](checkpoints/2026-10-31-reorganization-metadata-cleanup-PARTIAL.md). Шесть файлов `experiments/release-candidate-1/2026-10-31/publication/*-before.*` (17957 байт) восстановлены из проверенного `archive/research/source.tar.gz` в отдельный каталог и `cmp` PASS; прямых ссылок по именам в app/lib/data/scripts/.github/docs нет. Удалены только эти шесть исторических metadata-файлов; `preflight.json` и все остальные материалы сохранены. Runtime/test/build/dependencies не менялись, полный gate вручную не повторён. Общая очистка PARTIAL из-за остальных исторических ссылок и динамических зависимостей.

## 31.10.2026 — V3 source archive: GitHub asset VERIFIED

[Checkpoint](checkpoints/2026-10-31-v3-source-archive-hosted-VERIFIED.md). Workflow commit `aea6a21c52d54b166da80e2dfc350588cee1a0eb` readback PASS; Actions 41241619408 SUCCESS. GitHub отдельный prerelease asset `source.tar.gz`: 343730585 байт, SHA256 `d6b772521569d61dfed3ee207fe2c1da4d78717a745b7455031c5cf79a100a87`, точно исходный файл; 14042/14042 Git blobs and post-upload download/cmp PASS. PR CI 41241626048 SUCCESS (mandatory verify/TS/build; live jobs SKIPPED), B03 41241625888 SUCCESS. Следующее: точечная очистка только доказанно неиспользуемых исторических файлов.

## 31.10.2026 — V3 source archive: узкий hosted workflow READY к публикации

[Checkpoint](checkpoints/2026-10-31-v3-archive-hosted-workflow-READY.md). В `.github/workflows/v3-source-archive.yml` подготовлен один self-path push job с `contents:write`, source SHA `cde74243…` и ожидаемым tree `c3e6cc8…`. Он сравнивает все файлы с манифестом, создаёт отдельный prerelease, скачивает asset и проверяет байты/размер/SHA256; крупный файл не добавляется в Git. YAML и все bash-блоки прошли локальную проверку; release tag отсутствует. Модель классификатора по фактическому diff `ahead`/46+1 файлов дала `shouldRunLive:false`; предыдущий verify/classifier завершился SUCCESS. Следующий шаг — обычный fast-forward push workflow, remote readback и наблюдение фактического Actions. При неожиданном live job не считать этап закрытым.

## 31.10.2026 — V3 source archive: hosted upload STARTED

[Checkpoint](checkpoints/2026-10-31-v3-archive-hosted-upload-STARTED.md). Remote/local `3e397b3e90d882b799e8102bcd59761774e63b3a`, clean, PR №14 OPEN/Draft. Локальный V3 tar.gz 343730585 байт/SHA256 `d6b77252…` совпал. `gh auth status` по-прежнему использует `GH_TOKEN` типа ghu_; прежний upload endpoint HTTP401 при неизменных условиях не повторён. Проверено: existing special CI baseline verify/classifier SUCCESS, compare от baseline e3ca3783 — ahead/45 docs+archive путей; новая изолированная workflow path не входит в LIVE_PATHS классификатора. Следующее: подготовить push-trigger workflow с минимальным `contents:write`, точным source SHA и byte-верификацией; перед публикацией проверить YAML/скоуп и CI-риск. Production/main/архивные refs не менять.

## 31.10.2026 — реорганизация V1 Release: PARTIAL, рабочий продукт сохранён

[Итог](reorganization/FINAL_STATUS.md), [финальный checkpoint](checkpoints/2026-10-31-reorganization-final-PARTIAL.md). A DONE; B PARTIAL: legacy V1/V2 физически размещены и восстановлены, V3 343 730 585 байт восстановлен локально, GitHub Release upload HTTP401; C PARTIAL: 61 файл research архивирован с восстановлением, оригиналы оставлены; D BLOCKED: 0 перемещено/удалено; E обязательные offline/TS/lint/build и локальный V2/V3/GeoNames smoke PASS, новый browser/live NOT_RUN; F документирован. Runtime равен Production source e3ca3783; V1 Release READY, PR №14 Draft. Следующее: восстановить штатную авторизацию uploads.github.com для уже разрешённого V3 asset, затем решить точные исторические ссылки перед любой очисткой.

## 31.10.2026 — реорганизация E: обязательные gates PASS, текущий browser/live NOT_RUN

[Результаты и логи](reorganization/checks/RESULTS.json), [checkpoint E](checkpoints/2026-10-31-reorganization-verification-PARTIAL.md). Node24.19/pnpm11.25 frozen install PASS после переноса pnpm store в рабочее пространство; test:audit 1067 PASS/0 FAIL/1 SKIP, TS PASS, ESLint exit0/7 warnings, Next16.3.4 build PASS. Локально `/v2` и `/v3` HTML200 и восемь городских GeoNames-запросов200; Донецк ДНР первый, Ростовский одноимённый вариант сохранён. Падение первого smoke было ошибкой теста по регистру метки; исправленный тест PASS, runtime не менялся. Новый desktop/mobile browser и live route расчёт NOT_RUN; прежние браузерные evidence не выдаются за новый запуск. App/lib/data/scripts/package/config/CI идентичны V1 Release source `e3ca3783`. Дальше F — честный итог с B/C/D ограничениями.

## 31.10.2026 — реорганизация E STARTED: обязательная проверка (история)

[Checkpoint E STARTED](checkpoints/2026-10-31-reorganization-verification-STARTED.md). D decision сохранён на remote `3248ee40712056ced320d93f86d870d7f8659155`, без удаления. Проверить Node24/pnpm11 frozen install, offline gate, TypeScript, ESLint, прямой Next production build, V2/V3/GeoNames smoke и восстановимость архивов. Новые результаты не подменять историческими; внешние тарифные аудиты не запускать.

## 31.10.2026 — реорганизация D BLOCKED: безопасной очистки пока нет

[Checkpoint D](checkpoints/2026-10-31-reorganization-cleanup-BLOCKED.md). `app/v3/page.tsx` и hook V3 прямо импортируют `app/v2/components`; `lib/v3-calculation` напрямую импортирует `experiments/nationwide-tolls` и `toll-estimates`, а gate/CI используют fixture-пути. 61 файл исторических опытов архивирован, но старые документы всё ещё ссылаются на оригинальные пути. Полный V3 архив удалённо отсутствует. Доказанного безопасного удаления или пользы от переноса shared V2 сейчас нет: перемещено 0, удалено 0. Следующее — обязательная проверка E на неизменённом runtime.

## 31.10.2026 — реорганизация C PARTIAL: 61 файл архивирован без удаления

[Архив исследований](../archive/research/README.md), [checkpoint C](checkpoints/2026-10-31-reorganization-research-PARTIAL.md). 61 исторический файл из `preview-acceptance` и `release-candidate-1` сохранён в `source.tar.gz` 770 737 байт; распаковка и Git blob SHA 61/61 PASS. Оригиналы не удалены: на пути есть ссылки в 14 исторических документах. Остальные эксперименты требуют runtime/test/CI review; общий архив C и очистка D пока PARTIAL/NOT_DONE.

## 31.10.2026 — реорганизация C STARTED: ограниченный архив исследований (история)

[Checkpoint C STARTED](checkpoints/2026-10-31-reorganization-research-STARTED.md). B сохранён на remote `36d2cad23f5b547f58cb5a330b5ad379a7d283b5`: два малых архива и три манифеста, tree/readback совпали. Исследовательский кандидат: `experiments/preview-acceptance` и `experiments/release-candidate-1`, вместе 61 tracked-файл. В app/lib/scripts/data/workflow нет буквальных ссылок на их пути; внутренние скрипты внутри самих папок и исторические ссылки docs есть. Перед любым удалением нужен проверенный архив и разбор ссылок; пока только создание копии.

## 31.10.2026 — реорганизация B PARTIAL: 2/3 архива в дереве, V3 локально

[Checkpoint B](checkpoints/2026-10-31-reorganization-archives-PARTIAL.md), [манифесты](../archive/versions/README.md). Из точных исторических SHA созданы три `source.tar.gz`; каждый распакован в чистую директорию, все 316/431/14 042 файлов сверены с Git blob SHA. Архивы legacy V1/V2 по 350 346 и 1 427 554 байт готовятся к GitHub в обычном рабочем коммите. Pre-release V3 — 343 730 585 байт, локальный SHA256 `d6b77252…`. Владелец явно разрешил публичный GitHub Release asset; попытка штатного `gh release create` прошла проверку полномочий, но endpoint загрузки `uploads.github.com` ответил HTTP 401 Bad credentials. Release/tag/asset после сбоя отсутствуют. Манифест V3 в дереве не равен размещённому архиву. Очистка запрещена до доступного удалённого восстановления; далее независимая классификация исследований без удаления.

## 31.10.2026 — реорганизация A сохранена; B STARTED (история)

[Checkpoint B STARTED](checkpoints/2026-10-31-reorganization-archives-STARTED.md). Новый владелец явно разрешил многократные обычные fast-forward push в рабочую ветку. Локальный A `264284e3c2bd9626676762d4214a11a51b6cb833` опубликован: remote HEAD, tree `a5f681db3dc0ae0e530484f244acce5fa7e9aec7` и blob инвентаря `c25147c522f3709739d69c667c555394a8024001` совпали. Теперь B: точные SHA трёх версий, предварительный размер, физический архив, манифест и восстановление. C–F ещё не начаты.

## 31.10.2026 — реорганизация: удалённое сохранение A BLOCKED (история, разрешено позже)

[Checkpoint блокировки](checkpoints/2026-10-31-reorganization-A-remote-save-BLOCKED.md). A проверен и закоммичен локально, но auto-review отклонил второй push после опубликованного STARTED: разрешение на новую публикацию сочтено недостаточно явным на фоне прежнего разового разрешения. Remote остаётся `320c50d4a07b4f2b122d2de3f4ee2f6b4134d591`. Переход к B/C/D/E/F приостановлен по CHECKPOINT_PROTOCOL до однозначно разрешённого remote checkpoint; локальные commit, patch и bundle сохранены.

## 31.10.2026 — реорганизация V1 Release: инвентаризация A DONE локально

[Инвентарь](reorganization/INVENTORY.json), [checkpoint A](checkpoints/2026-10-31-reorganization-inventory-DONE.md), [журнал](reorganization/WORK_LOG.md). От 320c50d4: 14 055 tracked-файлов, 402 106 462 байта; 689 исходных текстов проверены на литеральные зависимости, 395 целевых файлов найдены. `experiments` 369 МБ и содержат runtime/test/CI зависимости; пока 0 подтверждённо неиспользуемых файлов. EPERM при дочернем Git из Node устранён передачей вывода штатного Git по stdin. Следующее: B — три физических архива с манифестами и проверенным восстановлением до очистки. PR №14 Draft; Production/main/Android/backup без изменений.

## 31.10.2026 — подготовка V1 Release / три архивные версии / одна песочница

[Каталог версий](../archive/versions/README.md), [единственная песочница](../sandbox/README.md), [checkpoint и точные refs](checkpoints/2026-10-31-archive-restructure-prep.md). По решению владельца опубликованный V3 назван «V1 Release» (продуктовое имя; URL/интерфейс пока не менялись). Созданы и прочитаны обратно 4 safety refs: release→e3ca3783, legacy-V1→636e6801, legacy-V2→64631d23, pre-release-V3→cde74243; все неизменяемые snapshots. Рабочая ветка `fix/v3-missing-route-prices-2026-10-15` пока единственная активная sandbox, Preview GeoNames привязан к ней. **Физический перенос старых версий/исследований, bundle, удаление веток и code cleanup НЕ ВЫПОЛНЕНЫ**: app/v3 использует app/v2/components, test:audit импортирует experiments/scripts, data/local-settlements участвует в production runtime. Следующее — граф зависимостей, проверяемый архив и атомарное поэтапное очищение в sandbox, без вмешательства в Production/main/Android/backup/PR14.

## 31.10.2026 — V3 PRODUCTION RELEASE DONE

[Итог и rollback](checkpoints/2026-10-31-v3-production-release-DONE.md), [разрешение/начало](checkpoints/2026-10-31-v3-production-release-STARTED.md). Владелец принял RC1 на телефоне и разрешил выпуск рабочего V3; интерфейсные улучшения позже. Production Vercel dpl_E3e6gUCSd9izZ8tKHA9tf85fr115 READY, исходный SHA e3ca3783, публичный https://mezhgorod-calculator.vercel.app → V3; V2 сохранён. Для Production GeoNames включён двумя независимыми серверными флагами, default OFF/Preview guards сохранены; исходный код маршрутов/тарифов/UI не изменялся. HTTP V3/V2 и 6 городов (Мелитополь, Мариуполь, Донецк, Волноваха, Краснодар, Анапа) 200/GeoNames; новое Production browser/POST E2E отдельно НЕ запускалось. B03 SUCCESS, Special Territory workflow SUCCESS: mandatory verify 1067PASS/1SKIP; optional live_probe Photon FAILED (Донецк timeout), это НЕ успешная live-проверка. Runtime error/fatal scan 20m по deployment: совпадений нет. Исходный Production rollback dpl_6XMRbMu5V5vqWTzf684oPTMyubju сохранён. PR14 Draft, main/Android/backup/merge не тронуты. Следующее: эксплуатация и отдельные задачи по интерфейсу; Codex перед новой работой сверить remote и локальный checkpoint 06c17540.

## 31.10.2026 — RC1 публикация STARTED: preflight PASS, один push разрешён

[Checkpoint](checkpoints/2026-10-31-v3-RC1-publication-STARTED.md), [preflight](../experiments/release-candidate-1/2026-10-31/publication/preflight.json). Local3b4608a1/remote c0e76ecc/PR14 OPEN Draft/activeCI0; fast-forward/bundle/gates source-equivalence PASS.106 файлов до receipt, core app/lib/матрица/флаги неизменны; reviewed snapshot fresh/OFF, B03 path filters +2 строки. Далее fresh remote lease→один normal push→readback/CI/exact-SHA Preview/доступные desktop/mobile. Post-проверки только локально без второго push. Production baseline051d51ea READY, Protection не отключать; main/Android/backup/merge/force запрещены.

## 31.10.2026 — V3 RC1 LOCAL: готов к контролируемому Preview, не Production

[Сводный отчёт](V3_RELEASE_CANDIDATE_1.md), [checkpoint](checkpoints/2026-10-31-v3-RC1-final-LOCAL.md), [правила поставки](PRODUCT_DELIVERY_ADDENDUM.md), [фактические checks](../experiments/release-candidate-1/2026-10-31/checks/RESULTS.json). Source719d344b: real HTTP11городов/GeoNames/0Photon при controlled outage; live Краснодар→Анапа200/2.281с/166347м/8713с/transfer4159+toll620 (не новая тарифная сертификация). 52targetPASS; offline1063PASS/1SKIP/0FAIL+quote/API, TS/lint/build exit0. Новых доказанных P0/P1 в проверенных сценариях нет, runtime fixes0. I1–I3 сохранены; app/lib/data/CI/матрица не менялись. Current full mobile/browser NOT_VERIFIED (local sandbox helper/Opera UNAVAILABLE), historical input source-equivalent, не новый full PASS. Remote c0e76ecc, PR14 OPEN/Draft подтверждены read-only, no push/Production. Нужны отдельно разрешённые публикация/CI/актуальная Preview browser-приёмка; Production GeoNames activation остаётся отдельной gated политикой. Локальное сохранение: commits/readback/новый bundle, не GitHub persistence.

## 31.10.2026 — V3 RC1 contracts PASS, финальные gates STARTED LOCAL

[Checkpoint](checkpoints/2026-10-31-v3-RC1-contracts-PASS-gates-STARTED-LOCAL.md), [browser evidence](../experiments/release-candidate-1/2026-10-31/checks/browser-evidence.json). 52 targeted offline handler/policy/React SSR/hook tests PASS: reverse/dual/Crimea, fastest/failover, confirmed/estimated/unknown, cancel/reset/copy. Ранее real HTTP 11 городов при Photon outage + один live Краснодар→Анапа2.281с PASS сохранены. Новых доказанных P0/P1 не обнаружено; runtime не меняется. Current full mobile journey BLOCKED: local sandbox helper UID65534, cloud browser UNAVAILABLE30s; старый mobile input baseline source-equivalent в четырёх файлах, не новый full PASS. Идут обязательные финальные offline/lint/build/TS на новом verification code; затем сводный RC1 report и local bundle. Без push/Production.

## 31.10.2026 — V3 RC1 HTTP PASS LOCAL; browser/mobile остаётся непроверенной границей

[Checkpoint](checkpoints/2026-10-31-v3-RC1-http-acceptance-PASS-LOCAL.md), [реальные ответы](../experiments/release-candidate-1/2026-10-31/checks/api-flow.json). 11 POST /r реальный GeoNames с controlled Photon outage, attempts0; координаты/оба Донецка/явные регионы PASS. V3/V2 HTTP SSR200, unsafe tariff400. Один real V3 Краснодар→Анапа200/2.281с/166347м/8713с, transfer4159 при25₽/км, toll620 priced (не новая сертификация). Runtime неизменен; browser helper UID65534 не root, interactive/mobile не PASS. Продолжаются независимые replay/ценовые состояния и финальные gates, без push/Production/массового аудита.

## 31.10.2026 — V3 RC1 HTTP acceptance STARTED LOCAL

[Checkpoint](checkpoints/2026-10-31-v3-RC1-http-acceptance-STARTED-LOCAL.md), [цикл/журнал](../experiments/release-candidate-1/2026-10-31/README.md). Правила поставки сохранены в 21cae380; app/lib/data равны проверенной I3 сборке. Реальный локальный HTTP с GeoNames и контролируемым отказом Photon, 11 городов и один bounded live расчёт Краснодар→Анапа. Browser helper остаётся owned UID65534 вместо root: не ослаблять sandbox, mobile interaction пока BLOCKED_ENVIRONMENT; продолжать API/replay/SSR. Итоги ещё PENDING; без push/Production/нового широкого аудита.

## 31.10.2026 — V3 RC1 STARTED LOCAL: приоритет работающего продукта

[Правила поставки](PRODUCT_DELIVERY_ADDENDUM.md), [checkpoint](checkpoints/2026-10-31-v3-RC1-delivery-rules-STARTED-LOCAL.md), [минимальный продукт/приёмка](../experiments/release-candidate-1/2026-10-31/README.md), [журнал](../experiments/release-candidate-1/2026-10-31/WORK_LOG.md). Старт dbc701fb clean, I1–I3 сохраняются. P0/P1 блокируют выпуск, безопасные P2/P3 откладываются; внутренние блоки не требуют новых согласований. Один цикл UI/API/расчёт/отображение/mobile с минимальными исправлениями; все реальные результаты ещё PENDING. Не повторять закрытые исследования. Сохранение локальное: commits/readback/bundle; push/Production/main/Android/backup/merge/изменение PR14 запрещены.

## 31.10.2026 — I3 B03 snapshot-trigger DONE LOCAL; готово к отдельной контролируемой публикации

[Checkpoint](checkpoints/2026-10-31-stage-I3-snapshot-trigger-DONE-LOCAL.md), [результаты/логи](../experiments/address-search/stage-i-2026-10-31/checks/i3-snapshot-trigger/RESULTS.json). Parent 7d100728 и Stage I bundle сохранены. Snapshot добавлен в оба path filters B03; workflow изменён ровно двумя строками, freshness/SHA256/browser/verify/build неизменны. Два новых regression RED до исправления, после 5/5 PASS. Проверенные исходники 2750861c: полный offline **1063 PASS / 0 FAIL / 1 SKIP**, quote/API PASS, ESLint 0 (7 прежних warnings), Next build 0, затем TypeScript 0 / Node24.19.0. Runtime/snapshot/матрица не менялись, Photon повторно не исследовался, новых CI/browser/live запусков нет. Далее локальный commit/readback/новый bundle, **без push/Production**. Публикация требует отдельного разрешения и свежего remote preflight; внешний Photon503 остаётся отдельным блокером.

## 31.10.2026 — I3 snapshot-trigger fix LOCAL; финальные gates STARTED

[Checkpoint](checkpoints/2026-10-31-stage-I3-snapshot-trigger-STARTED-LOCAL.md). Parent 7d100728 сохранён. Подтверждён дефект path filters B03: два новых теста RED (3 PASS / 2 FAIL), после добавления snapshot в push и PR — 5 PASS / exit 0. Разбор теста ограничен каждым событием отдельно. Workflow изменён ровно двумя path-строками, остальные байты/guards/jobs неизменны. По AGENTS выполняются обязательные offline/lint/build/TypeScript; результаты PENDING. Photon заново не исследуется, push/Production запрещены.

## 31.10.2026 — Stage I FINAL LOCAL: B03 snapshot исправлен; удалённый Photon 503 не объявлен устранённым

[Итоговый checkpoint](checkpoints/2026-10-31-stage-I-final-LOCAL.md), [результаты/логи](../experiments/address-search/stage-i-2026-10-31/checks/RESULTS.json), [503 разбор](../experiments/address-search/stage-i-2026-10-31/PHOTON_503.md), [журнал/следующие действия](../experiments/address-search/stage-i-2026-10-31/NEXT_STEPS.md). Новый реальный reviewed snapshot (4/4 прежних ID/подписи/координаты), expiry 07.11.2026 17:50:17.541 МСК, flag OFF; guard 0, 9 целевых PASS. Четыре новые 503-регрессии PASS; семь вариантов — один origin, удалённая причина HTTP 503 BLOCKED_EXTERNAL_SOURCE без headers/body/backend logs. Проверенные исходники be932d99: полный offline **1061 PASS / 0 FAIL / 1 SKIP**, quote/API PASS, ESLint 0 (7 прежних warnings), Next16.3.4 build 0, последовательный TypeScript 0 / Node24.19.0. Новых Actions/браузерных запусков/Preview-проверок нет. Всё только локально, далее commit/readback/bundle; **второй push не выполнялся**, Production/main/Android/backup/матрица/маршрутизация/CI не изменены. Для проверки нового SHA в Actions/Preview требуется отдельное разрешение на публикацию; upstream503 остаётся независимым внешним блокером.

## 31.10.2026 — Stage I3 STARTED LOCAL: обязательные финальные проверки

[STARTED](checkpoints/2026-10-31-stage-I3-final-gates-STARTED-LOCAL.md). Кодовая база 8fbef652: snapshot review и 13 целевых tests PASS. Выполняются существующий offline gate, lint, прямой Next build, затем TypeScript последовательно. Результаты PENDING, новые CI/браузер/live-запуски не инициируются. Только локальные commits/readback/bundle; push и Production запрещены.

## 31.10.2026 — Stage I2 LOCAL: B03 freshness исправлен; Photon 503 — внешний блокер

[Checkpoint](checkpoints/2026-10-31-stage-I2-photon-503-OFFLINE-LOCAL.md), [разбор](../experiments/address-search/stage-i-2026-10-31/PHOTON_503.md). I1 новый reviewed snapshot до 07.11.2026 17:50:17.541 МСК, flag OFF, 9 target PASS и guard exit 0. I2 четыре новые offline-регрессии PASS: 4×503+3×cooldown воспроизводятся без timeout; семь вариантов одного origin. Удалённая причина HTTP 503 не установлена без headers/body/upstream logs; runtime/CI не ослаблялись. Далее обязательные финальные проверки и локальный bundle; без push/Production/повторного CI. Полное устранение внешнего дефекта не заявлено.

## 31.10.2026 — Stage I1 LOCAL: B03 freshness исправлен новым capture/review, не изменением старого срока

[Checkpoint](checkpoints/2026-10-31-stage-I1-snapshot-reviewed-LOCAL.md), [capture/review/журнал](../experiments/address-search/stage-i-2026-10-31/WORK_LOG.md). Реальные новые ответы GET+Photon: 4/4 прежних ID, подписи и координаты совпали. Новый snapshot до 07.11.2026 17:50:17.541 МСК, provenance/SHA обновлены, старые captures сохранены; флаг OFF, CI/freshness guard неизменны. 9 target PASS, точная workflow guard exit 0; браузер/Actions заново не запускались. Следующее — offline-разбор Photon 503 и финальные обязательные gates. Только локально, без второго push/Production.

## 31.10.2026 — Stage I1 LOCAL: prefix capture недостаточен; snapshot не изменён

[Checkpoint](checkpoints/2026-10-31-stage-I1-prefix-capture-BLOCKED-LOCAL.md), [следующие действия](../experiments/address-search/stage-i-2026-10-31/NEXT_STEPS.md). Донецк HTTP 200 / два ID; «Красн» HTTP 200 без Краснодара (5×503 + cooldown). Capture exit 2, остановлен до Ростова. B03 BLOCKED до полного нового review. Далее один bounded follow-up точных названий двух недостающих городов, затем offline-разбор Photon. Всё только локально; snapshot/expiry/CI/Production не изменены, второй push запрещён.

## 31.10.2026 — Stage I STARTED LOCAL: B03 recapture, затем Photon503

[Checkpoint](checkpoints/2026-10-31-stage-I1-snapshot-recapture-STARTED.md), [журнал](../experiments/address-search/stage-i-2026-10-31/WORK_LOG.md). База223f72e6/clean,remoteпредыдущейпубликацииc0e76ecc,второйpushзапрещён. B03mockrunnersиспользуют4recordsпросроченногоснимка;неослаблятьfreshness/runtimeguard. Готовогоновогоснимкавсохранённыхподходящихcapturesнет;boundedPhotononlyrecapture3querymax/20s,stopпослепервогонеуспеха,статусPENDING. Затемreview/source/hash/testsилиBLOCKED→независимыйPhoton503/cooldownofflineразбор. Snapshotflag/Production/матрица/CIпока неизменны; браузервнеизменнойsandboxсреденеповторять.

## 31.10.2026 — F–H4 PUBLISHED c0e76ecc; CI acceptance PARTIAL; этот posthandoff LOCAL ONLY

[Checkpoint](checkpoints/2026-10-31-FH4-published-CI-PARTIAL-LOCAL-ONLY.md), [журнал](../experiments/toll-estimates/publication-2026-10-31/WORK_LOG.md), [точныйpoststatus](../experiments/toll-estimates/publication-2026-10-31/post-publication.json). Одинnormalpushc2f52ee9→**c0e76eccfda0bf4fd8eeb5ac299c6da1242baa57**,exit0,57commits/508files,remote/tree/508blobSHA+9rawfilesreadbackPASS,PR14Draft. Freshlocaloffline1057PASS1SKIP/67targetPASS/TSfinal0/lint0(7warnings)/Nextbuild0;initialTSraceсохранён. CI:routequality41198662023SUCCESS;B0341198667924FAILURE(expiredsnapshotдоbrowser,verifySUCCESS;expiry11:24:54МСКпредшествовалpush—preflightgap). Special41198667966overallSUCCESS,ноlive_probeFAILURE(Photon503/cooldownДонецк),verify/classify/timingSUCCESS,50/6downstreamSKIPPED. PreviewточногоSHA READY:[V3](https://mezhgorod-calculator-3si892hb9-4regodatbe-5310.vercel.app/v3),защищённыйHTTP/browserнепроверен,share/protectionне меняли. Productionпрежнийdpl_6XMRbMu5V5vqWTzf684oPTMyubju/051d51ea,матрица/main/Android/backupнетронуты,F OFF/Productiondeny. ПолнаяприёмкаНЕPASS. Postзаписилокальноследующимcommit,**невторымpush**:remoteостаётсяc0e76ecc;GitHubWORK_STATEсодержитpreflight. Далееотдельносогласованныеsnapshotcapture/review+Photonразбор+Previewaccess;CIнеослаблять/срокнеменятьмеханически/новыйliveнеинициировать.

## 31.10.2026 — F–H4 preflight PASS; единственный разрешённый push PENDING

[Checkpoint](checkpoints/2026-10-31-FH4-publication-preflight-PASS.md), [журнал/gates](../experiments/toll-estimates/publication-2026-10-31/WORK_LOG.md). Initiala04c3195/tested82b6bf10,remote c2f52ee9/PR14Draft/ancestry/bundlePASS. Весь55commit/467filediffпроверен: D1address+Foverlay+proof,нетmatrix/CI/deployизменений/секретныхпутей; knownsecretpatterns0. Freshoffline1057PASS/0FAIL/1SKIP+contracts,67targetPASS,TSfinal0,ESLint0/7warnings,Next16.3.4build0/Node24.19. InitialTS2(.next/typesconcurrentregeneration)сохранён,последовательныйповтор0безappфикса. F OFF/Productiondeny, strict/unknownnullсохранены. Далееfreshremote+CIlease→одинnormalfast-forwardpush→remote/tree/pathreadback/Actions/newPreview;послепубликациитольколокальныезаписи,невторойpush. Поканеопубликовано;нетProduction/main/Android/backup/merge/force.

## 31.10.2026 — F–H4 publication preflight STARTED, push ещё НЕ выполнен

[Checkpoint](checkpoints/2026-10-31-FH4-publication-STARTED.md), [журнал/план](../experiments/toll-estimates/publication-2026-10-31/WORK_LOG.md). Владелецразрешилодинnormalfast-forwardpushпослеуспешныхпроверок. Sourcea04c3195/remotec2f52ee9/PR14Draft/activeCI0,55pendingcommits/467files,ancestry/bundle0. Нетmatrix/CI/deployconfigизменений; F OFF/Productiondeny/strictnullguardsсохранены. Свежиеtarget/offline/TS/lint/buildPENDING. Дальшеfreshremotelease→одинpush→readback/Actions/Preview; postpushфиксациятольколокально,безвторогопуша. NoProduction/main/Android/backup/merge/force.

## 31.10.2026 — H4 LOCAL DONE: G content RECONSTRUCTED; документальная линия готова к отдельному review

[Итоговыйcheckpoint](checkpoints/2026-10-31-stage-H4-RECONSTRUCTED-final-LOCAL.md), [пакет/сверка/готовность](../experiments/toll-estimates/stage-h4-2026-10-31/README.md), [журнал](../experiments/toll-estimates/stage-h4-2026-10-31/WORK_LOG.md). H4-INPUT-BLOCKED закрыт: ZIPCRC0/5исходныхфайлов/провереныsourceSHA9262482b…af8f76иanalysisSHA. OriginalGкоммит/историяНЕвосстановлены; RECONSTRUCTEDпакет/отчётсохраненыбезредактирования. 4A/B+FgeometrySHA/суммысогласованы, устаревшиеsourceописанияГранитного/Арзамасазафиксированыfinding, неruntimeдефекты. **оценённая часть 6 928/7 268 ₽**,2654оценочных(М121713+ЦКАД941),применимостьЦКАДworking_estimate;ЗСД/fullunknown/null,2085неценаЗСД.8новыхtargetPASS/0FAIL/0SKIP/exit0,compare/syntax/CRC0;нетповторныхH2/H3/sourceaudit/Yandex/build. F→H2→H3→H4 новаядокументальнаялинияготовакотдельнойконтролируемойпубликациипослеявногоразрешения/remoteCIreview; не Production/автоЯндекстарифы, неоригинальнаяF→G→Hистория. F OFF/Productiondeny, runtime/матрица/CIнетронуты,PR14Draft/remote c2f52ee9. No push/merge/main/Production/Android/backup. ИсторическиеBLOCKED/PENDINGнижеостаютсяисторией; недостающиеscreenshots/exactroute/date/payment/ЗСДданныеневыдуманы.

## 31.10.2026 — H4.1 LOCAL: вход RECONSTRUCTED G проверен, сверка PENDING

[Checkpoint](checkpoints/2026-10-31-stage-H4-input-RECONSTRUCTED-LOCAL.md), [пакет/хеши/происхождение](../experiments/toll-estimates/stage-h4-2026-10-31/README.md). НовоеZIPвложениеCRC0/5regularfiles,sourceSHA9262482b…af8f76/analysisSHAсовпали. H4-INPUT-BLOCKED закрыт; ZIP+5файлов сохранены безправок с явным RECONSTRUCTED, не оригинальныйG/dd3e2ff6/егоистория. БазаH3 7a6eb59d сохранена; noGsearch/H2repeat/audit/Yandex/push/runtime/матрица/Productionchange. Далее—сверка сE/F/H2, фиксациянесоответствий и точечныеdataпроверки; совокупнаяготовностьещёPENDING.

## 31.10.2026 — H3 LOCAL: доступные F/H сведены; G и публикационная готовность BLOCKED

[Итоговый checkpoint](checkpoints/2026-10-31-stage-H3-consolidation-LOCAL.md), [поиск/недостающие файлы/план/терминология](../experiments/toll-estimates/stage-h3-2026-10-31/README.md), [журнал](../experiments/toll-estimates/stage-h3-2026-10-31/WORK_LOG.md). Gdd3e2ff6 не найден в доступныхDB/refs/reflog/28bundles иGitHub422; восстановлено0Gфайлов. F4a71c093→H2a158a7f5→H3.1 1de3cc44 сохранены, связь/совместимостьGне установлена. **оценённая часть 6 928/7 268 ₽** включает **оценочные М12—1713 иЦКАД—941, всего2654**; sourceценыЦКАД неравен подтверждениюприменимости(working_estimate). ЗСД/fullunknown/null;2085не тарифЗСД. Толькоdocchecks,безповтораH2/audit/build/Яндекса. F OFF/Productiondeny, runtime/матрица/историческиеevidenceнетронуты. ВсясовокупностьF–G–HкпубликацииНЕготова: нуженGbundle/files+SHA, проверкаparents/tree/совместимости, затемотдельноеразрешение. No push/merge/Production/main/Android/backup.

## 31.10.2026 — H3.1 LOCAL: поиск G завершён, восстановление BLOCKED

[Checkpoint](checkpoints/2026-10-31-stage-H3-search-G-LOCAL.md), [область поиска и план](../experiments/toll-estimates/stage-h3-2026-10-31/README.md). Gdd3e2ff6не найден: точныеlocalobject/ref/reflogпробы,28bundles/24tips,GitHub422;1226unreachableповторнонеперебирали. F→H2сохранена; F–G–H/совместимостьGнеподтверждены,0Gфайловвосстановлено. Нетreset/rebase/cherry-pick/push/измененияruntime/матрицы/Production. PR14Draft/remote c2f52ee9. Далее—уточнение актуальнойтерминологии и docchecks; дляреальногоGнужныисходныеobjects/files+SHA.

## 31.10.2026 — H2 LOCAL:941 имеет источник,6928/7268 — смешанная оценённая часть

[H2checkpoint](checkpoints/2026-10-31-stage-H2-subtotal-reconciliation-LOCAL.md), [разбор/таблица](../experiments/toll-estimates/stage-h2-2026-10-31/README.md), [журнал](../experiments/toll-estimates/stage-h2-2026-10-31/WORK_LOG.md). F4a71c093сохранён/достижим,Fbundleverify0;1226unreachableobjects проверены безreset/prune, релевантныхGpaths нет. Старые6replay5707/6007 +head280/320 +workingCKAD941 =6928/7268. 941вприказе56/27.02.2026стр1IкатМ7↔М11 иE5477e02b; actualroutebindingостаётсяworkinggrade. Изsubtotal2654—оценочныеМ12+ЦКАД,existingconfirmed-grade4274/4614; ЗСДunknown/fullnull. Арифметическийдефект/дубль в проверенномсоставе невыявлены; классификация: версияreplay+добавочныйworkingcomponent+отчётность.6targetPASS/exit0Node24.19,syn0;начальнаяошибкакомандыбезaliasloaderсохранена/командаисправлена. Нетновыхnetwork/audit/build/аппизменений/push. НазванныеGanalysis/manifest/Libraryотчёт недоступны; сравнениеихсодержимогоBLOCKED,9353изсообщенияпользователя/2085условно неценаЗСД. PR14Draft/remote c2f52ee9подтверждены. Далее—сверитьсамGsource/report, не подгонятьтарифы. Fпо-прежнемуOFF/Productiondeny; старые записи ниже — история.

## 30.10.2026 — Этап F: F1–F5 завершены LOCAL, режим OFF

[Итоговый checkpoint](checkpoints/2026-10-30-stage-F5-FINAL-LOCAL-READY.md), [интеграция/контролы/Preview-порядок](../experiments/toll-estimates/INTEGRATION.md), [exits/SHA](../experiments/toll-estimates/checks/2026-10-30-integration/verification.json). V3 добавочный `tollEstimate` + три состояния UI/ручной ввод/подписанная clipboard-оценка готовы; strict/km/dual/fastest не меняются. OFF — старые ответы идентичны; Production hard-deny; Preview только точная ветка+serverflag. Tor5904/6084estimated; Kras10464/12334estimated; GranЗСД600 — **компонент**, весь маршрут9534/11184estimated; Arzfullnull/часть6928/7268. M12/ZSDwarnings сохранены.

53targetPASS; fulloffline **1057PASS/0FAIL/1SKIP**/contractsPASS/exit0; TS0; wholeESLint0/7warnings; Next16.3.4/Node24.19.0 **buildexit0**, source48d685a7 и финальный app/purecore эквивалентны. Initial10VMimportFAIL сохранены; только3testloaders исправлены без ослабления assertions,14targetPASS и fullretryPASS. Нет push/CI/env/Preview/Production; remote c2f52ee9/PR14Draft подтверждены. Нужны отдельное разрешение публикации и реальная Preview-проверка. Открыты независимо: точный ЗСДbundle, M12регистрационные данные, D1street localfix без hostedacceptance, livePhoton/street/mobiletimeoutevidence. F не закрывает всеB01–B12. Старые STARTED/PARTIAL ниже — история.

## 30.10.2026 — F5 loader repair LOCAL PASS / fullgate retry STARTED

[Loader checkpoint](checkpoints/2026-10-30-stage-F5-loaders-LOCAL-retry-STARTED.md):14/14affected render/hook/clipboard testsPASS, same realTSalias loader as sharedhelper; no assertions/application logic changed. Source48d685a7 build0 stillapp-equivalent (diffexit0), no repeatedbuild. Freshmandatoryofflinegateretry+wholelint pending; initial1043PASS/10importFAIL/1SKIP retained, F5NOTDONE. Fourroutecontrols/53targets/TS/oldwholelintPASS; newmodule defaultOFF/Productiondeny. No push/env/deploy/CI; address protectedPreview/livePhoton/mobile gaps andZSDbundle open separately.

## 30.10.2026 — F5 PARTIAL LOCAL: build0, mandatorygate loader failure

[First F5 results](checkpoints/2026-10-30-stage-F5-first-gates-PARTIAL-LOCAL.md).53targetPASS, TS0, wholelint0/7warnings, directNext16.3.4buildNode24.19.0 **actualexit0** at48d685a7. Fullofflinegateexit1/1043PASS/10FAIL/1SKIP: three old customVMloaders cannot resolve new @/lib/toll-estimate-view; existing assertions not reached, app/nativeReact/buildPASS. F5 NOTDONE; next minimal testloaderalias repair +targetedtests +justifiedfullgateretry, no app fix/securityworkaround. FourrouteOFF/ONcontrolsPASS, estimateOFF/Productiondeny/no push/CI/deploy. Addressopen separately: D1localfix not protectedPreview-accepted; live street/Photon resilience/mobile-timeout evidence incomplete. No address work inF.

## 30.10.2026 — F4 контрольные интеграции PASS / F5 gates STARTED LOCAL

[F4/F5 checkpoint](checkpoints/2026-10-30-stage-F4-controls-F5-STARTED-LOCAL.md), [точная таблица](../experiments/toll-estimates/INTEGRATION.md). ActualproducerOFF/ON: Tor5904/6084estimated+M12warning; Kras10464/12334estimated; Arzfullnull/part6928/7268. **Gran600 — компонентЗСД, не целыймаршрут**; фактическая wholeкомпозиция9534/11184estimated и строгие суммы не менялись. Первое ошибочное ожидание600whole сохранено какFAIL, не тарифныйфикс.9targetPASS/TS0/lint0 +actualPOSTstandard/dual/Productiondeny5PASS(CONTROLLEDtransport);0внешнихзапросов. Reverse/longarc/incomplete/duplicate/date guardsPASS. F5onecombined/offlinegate/wholelint/TS/directbuild pending; no push/CI/env/Preview/Production. Addressdefects/ЗСДexactbundle открыты, режимOFF.

## 30.10.2026 — F3 API/UI LOCAL OFF / F4 контролы STARTED

[F3 checkpoint](checkpoints/2026-10-30-stage-F3-api-ui-LOCAL.md), [журнал](../experiments/toll-estimates/INTEGRATION.md). V3optionalfield+three-statecard/M12warning/manualinput/labelledclipboard готовы локально; strict/kmprice/fastestroute/V2 не менялись.8targetPASS/ReactSSR/APIshape, TS0/lint0 (initialTSunion failure сохранён). DefaultOFF/Productiondeny; нет browser/Previewclaim/push/CI/env/deploy. F4newintegrationcause: fourexisting captures ×2departures×OFF/ON, only recordedresponses, strict/geometry equality; затем F5requiredgate/build. Адресные дефекты и операторский ЗСДbundle остаются открытыми.

## 30.10.2026 — F2 адаптер LOCAL / OFF; подключение API/UI следующее

[F2 checkpoint](checkpoints/2026-10-30-stage-F2-adapter-LOCAL.md), [контракт/журналF](../experiments/toll-estimates/INTEGRATION.md). Actualgeometry/per-road component→existing pureestimator, extraCKADM11↔M7 из текущих providersections+M11proof+completeexistingtrace, не fixtureцены. DefaultOFF/Productiondeny/exactPreviewbranch, boundedwork/null/duplicate guards и M12warning.4targetPASS/TS0/lint0; app/API/UI ещё не подключены. Strict/тарифы/геометрия/выбормаршрута неизменны. F3wiring→F4savedfourcases→F5mandatorygates/build; адресные дефекты/ЗСДbundle остаются открытыми. No push/CI/env/deploy.

## 30.10.2026 — Этап F: F1 проверен, локальная интеграция STARTED

[F1 checkpoint](checkpoints/2026-10-30-stage-F1-state-LOCAL.md). Local620abe48clean/remote c2f52ee9/PR14Draft подтверждены. Разрешены F2 отдельный evidenceadapter+defaultOFF/Productiondeny, F3 optionalAPI/UI, F4 fourcase integration+guards, F5 gates/build with exits. Не переносить namedfixtures/суммы вruntime; strict/kmprice/fastestroute неизменны. Никаких push/CI/env/deploy/Production; addressdefects и ЗСДbundle остаются отдельными открытыми задачами. Старые E-проверки не повторяются без новой интеграционной причины.

## 30.10.2026 — Этап E: практическое восстановление сохранено LOCAL

[Итоговый checkpoint](checkpoints/2026-10-30-stage-E-practical-recovery-FINAL-LOCAL.md), [разбор и компоненты](../experiments/toll-estimates/PRACTICAL_RECOVERY.md), [exits/SHA](../experiments/toll-estimates/checks/2026-10-30-recovery/verification.json). **1 новый полный ориентировочный маршрут: Торжок→Казань5904Thu/6084Sat**, strictunknown/null не менялся. Арзамас savedcase фактически доSPbПриморского, неПриморска: CKAD941 добавлен вshadow, часть6928/7268, fullnull(нет ЗСДcollectionbundle). ЗСД600 вshadow estimated, исходный strict600/status/source сохранён.40focusedPASS; обязательныйoffline1047PASS/1SKIP/contractsPASSexit0, TS/lintPASS. Отдельный build Node24.19.0/Next16.3.4 **actualexit0**, source04f100a5; исходникиapp/data/CI/геометрия неизменны. Режим выключен, UI/push/Preview/Production не трогали; remote c2f52ee9/PR14Draft повторно подтверждены. Нужны операторский состав ЗСД и отдельный review/admission liveadapter; namedfixtures не переносить вruntime. Старые промежуточные записи ниже — история, не текущее STARTED.

## 30.10.2026 — E recovery unit gates PASS / directbuild STARTED LOCAL

[Gate/build STARTED](checkpoints/2026-10-30-stage-E-recovery-unit-gates-build-STARTED.md): final40focusedPASS/exit0 after explicit syntheticpresentationfixture repair (initial36/39,3TypeErrors retained), mandatoryoffline1047PASS/1SKIP/contractsPASS exit0, projectTS/scopedTS/lint0. No broadroute/liveaudit. Only optionalfixtures/tests changed, app/matrix/geometry unchanged. Next requested directNextwebpackbuild; actualexit/log pending. One newfullestimatedroute5904/6084, primaryArzamasfullnull. No push/UI/CI/Production.

## 30.10.2026 — E recovery verification STARTED LOCAL

[Verification checkpoint](checkpoints/2026-10-30-stage-E-recovery-verification-STARTED.md):39focusedtests/scopedTS/lint/projectTS, one mandatory existing offlineunitgate after new offlinecode (not route/sourceaudit), one requested directwebpackbuild with immediate persistedexit. Source/review guards pinned; actualresults pending. Prior3blocks saved locally;1new fullshadowroute5904/6084, Arzamasfullnull; no push/UI/app/CI/Production change.

## 30.10.2026 — E recovery3 Torzhok→Kazan LOCAL /1new full estimate

[Torzhok checkpoint](checkpoints/2026-10-30-stage-E-recovery-Torzhok-LOCAL.md): one previouslyunknown M11+CKAD+M12 route now shadowestimated5904Thu/6084Sat. Actual existingresolver proves p214→p58 and southboundhead200/240 (notforward280/320), both oldresidualbooths mapped once; CKADM11→M7 sourcepair941, M12existing3513workingmodel. Strictunknown/null and sourcegeometry/matrix unchanged. SixnewPASS/exit0/lint0;0network/capture/fullreplay/push/UI. ExactZSDbundle/truePrimorsk remainunresolved. Next one directbuild reliableexit + finalfocusedchecks/consolidation.

## 30.10.2026 — E recovery2 Arzamas PARTIAL LOCAL / CKAD941

[Arzamas checkpoint](checkpoints/2026-10-30-stage-E-recovery-Arzamas-LOCAL.md): saved `arzamas-to-prim` actually ends onSPb Primorsky avenue, notPrimorsk. Actual CKADM7→M11 sourcepair941 nowassessed offline; parts6928Thu/7268Sat, fullnull due exactZSD cash/card bundle. Hypothesis900/conditional7828/8168 notadmitted asfare. Five newchecksPASS/exit0+scopedlint0; source/matrix/geometry unchanged/no replay/network/push. New fullunknownunlocks0. Next one different multiroad case, then reliableexit directbuild.

## 30.10.2026 — E recovery1 ZSD600 source grade LOCAL

[ZSD600 checkpoint](checkpoints/2026-10-30-stage-E-recovery-ZSD600-LOCAL.md), [source review](../experiments/toll-estimates/PRACTICAL_RECOVERY.md). Derived300+300 supports working estimate, not independent exactOD confirmation; shadow600 nowestimated, strict priced/confirmed/600 and original matrix/source/status unchanged. Final5focusedPASS/scopedTS/lint exit0; initial null-vs0 assertion failure retained. No new full previouslyunknown result, no push/UI/CI/Production. Next saved Arzamas CKAD/ZSD; separate build exit capture pending.

## 30.10.2026 — Stage E practical recovery STARTED LOCAL

[Recovery STARTED](checkpoints/2026-10-30-1208-stage-E-practical-recovery-STARTED.md): audit ZSD600 evidence grade, resolve saved Arzamas→Primorsk CKAD/ZSD where sources permit, one other previously unknown multiroad case, then one direct build with actual exit code. Source128807fb/remote c2f52ee9/PR14Draft verified; no prior gate or road audit repeat. Strict algorithm/matrix/geometry unchanged, estimate off, no push/UI/Production. New full estimates not yet established.

## 30.10.2026 — Stage E LOCAL PROTOTYPE SAVED / off, no Preview integration

[FinalEcheckpoint](checkpoints/2026-10-30-stage-E-final-LOCAL-PROTOTYPE.md), [results/sums/nextstep](../experiments/toll-estimates/RESULTS.md). E1twochangedmapcontrols timeout, detourcausesunknown/no geometryfix. E2–E4pureoptionalestimate+coverage/source/date/overlapguards+toll-onlyviewmodel/staticexampleimplemented/off; offlinefixturesnotruntime. Real3routes:600confirmed;10464Thu12334Satestimated(existingfullamount); ArzamasPrimnullwithassessed5987/6327notwhole.0newnumericunlocks/prices. Prototype28PASS/scopedTS/lint; existingoffline1047PASS/1SKIP+contracts; fullNextbuildsuccesslog. Originalaudit/buildexitlostinJSONwriter(null), projecttscreverified0/metadatafixed0, no heavyrerun. Verifiedsource86185310/prototypeTS/runtimeunchanged. No app/data/CI/liveflag/push/Preview/Production/otherbranch/PRchange;remote c2f52ee9/PR14Draft. Nextreview+separateliveadapter/Preview-onlyswitch/CItestwiring andpublicationapproval, ornewE1/operator evidence; no32point/auditrepeat.

## 30.10.2026 — E5 local checks complete / gate exit metadata LIMITED

[E5checkpoint](checkpoints/2026-10-30-stage-E5-checks-LOCAL-exit-metadata-LIMITED.md), [exact results](../experiments/toll-estimates/checks/2026-10-30/e5-gate-status.json). Prototype28PASS/scopedTS/lintPASS; oneactualofflinegate1047PASS/1SKIP+contractsPASS, Next16.3.4completecompile/types/static16/traceslog. Post-check JSONwriterfailed, originalindividualaudit/buildexitslost(null), notfabricated0; shortprojecttsc reverifiedexit0, metadatarepaired0. No heavygate/buildrepeat; originalfailure/logsretained. Checkedsource86185310, runtime/sourcee6unchanged/no liveimports. No push/CI/Preview/Production. E1unknown; prototypeoff, finalreport/localrecovery next. Actualsavedroutes1confirmed600/1estimated10464Thu12334Sat/1unknown;0newnumericunlocks.

## 30.10.2026 — E5 prototype28checks LOCAL PASS / mandatory gates STARTED

[E5 gate checkpoint](checkpoints/2026-10-30-stage-E5-prototype-checks-LOCAL-gates-STARTED.md): combined28testsPASS, finalscopedstrictTS/lintPASS after stronger testunionguard; negativeTSlogretained. Newmoduleoff/appbytesunchanged. Next ONEexistingofflinegate/projectTS/directwebpackbuild withsourceSHA andindividualexits, no liveaudit/CIchange/push. Real3routes1confirmed600/1estimated10464Thu12334Sat/1unknown, missingCKAD/ZSDnotguessed. E1mapcausesunknown; notfinalDONEuntilgatesfinish.

## 30.10.2026 — E5 final prototype regressions/gates STARTED LOCAL

[E5STARTED](checkpoints/2026-10-30-stage-E5-final-gates-STARTED.md):5newsource-calendar/reverse/overlap/scopeacceptance tests plus prior23prototypechecks, then one mandatory offlineaudit/projectTS/directbuild for the new calculation prototype. No networkroad audit, CIchange/activation or push. E2/E3/E4locallysaved/off; samples1confirmed600/1estimated10464Thu12334Sat/1unknown(missingCKAD/ZSD), values/geometry unchanged. E1maptimeoutcausesunknown. E5notDONEuntilactualgateoutputsinspected; preservefailures andsourceSHA.

## 30.10.2026 — E4 toll-only viewmodel LOCAL /6checksPASS

[E4checkpoint](checkpoints/2026-10-30-stage-E4-viewmodel-LOCAL.md), [offline example](../experiments/toll-estimates/checks/2026-10-30/e4-demo.html). Three clear toll labels confirmed/ориентировочно/уточняется; unknown subtotal explicitly incomplete and non-additive. No base transfer fare input/relabel, disabled leaves strict display unchanged. Six tests/scopedstrictTS/lintPASS, escaped responsiveHTML only—not browser/Preview verification. E2/E3savedprototype remainsoff; realsample1confirmed/1estimated/1unknown with unchanged values. Next E5source-calendar/reverse/overlap checks +onefinalofflinegate/build, no network road audit/push/Production.

## 30.10.2026 — E3 saved-route projection LOCAL /1confirmed,1estimated,1unknown

[E3checkpoint](checkpoints/2026-10-30-stage-E3-saved-sample-LOCAL.md), [six evaluations of3saved routes](../experiments/toll-estimates/checks/2026-10-30/e3-samples.json). ComplexKrasnodar→SPb10464Thu/12334Sat retained and labelledestimated(M4working), Arzamas→Primorskfullnull despite assessed5987/6327(missingCKAD/ZSD), finishedZSD600confirmed unchanged. Two complex routes, not invented estimates or new numeric unlocks. Currentpurematrix/departurecalendars reused; capture/geometrySHA unchanged,0network/route/trace replay. Five testsPASS; finalscopedTS/lintPASS after local JSconfidence literal normalization, initialtypefailuresretained. AtomicM4/ZSDcoverage plus aggregateguards, strictsnapshots preserved. Next E4toll-only viewmodel→E5finalchecks; prototypeoff/no push/app/CI/Production change.

## 30.10.2026 — E2 disabled estimate prototype LOCAL /12checksPASS

[E2 checkpoint](checkpoints/2026-10-30-stage-E2-prototype-LOCAL.md), [contract/module](../experiments/toll-estimates/README.md). Pure optional shadow returns confirmed/estimated/insufficient and unchanged strict snapshot; max only over documented exhaustive comparable candidates, no invented rate/product. Coverage/overlap/date/profile/zero/overflow guards, bounded work. Final12tests/scopedstrictTS/lintPASS; targeted profileguard negative retained/fixed, not liveappdefect. No app/runtime/data/CI activation/push. E1newcontrols timed out, causesunknown. Next E3small saved multi-road projection→E4toll-only viewmodel→E5onefinalgate/localhandoff, no old road/source audit.

## 30.10.2026 — E1 map placement controls BLOCKED / E2 prototype next

[E1checkpoint](checkpoints/2026-10-30-stage-E1-map-BLOCKED.md), [two exact changed controls](../experiments/toll-estimates/checks/2026-10-30/e1-map-controls.json). Source mainline-before-junction M12 and ramp-interior M11 placements/directions checked; each new Opera navigation timed out30s/UNAVAILABLE, no tabID/UI results. No repeat/screenshot/security workaround, source32point audit not rerun. Both prior detour causes still unknown; no geometry/application defect asserted or changed. Next independent off-by-default E2 estimate/coverage module with source-compatible inputs, then saved-route sample/viewmodel/tests. No push/runtime/CI/Production change; remotec2f52ee9/PR14Draft.

## 30.10.2026 — Stage E STARTED LOCAL / optional estimate prototype, strict runtime unchanged

[E STARTED](checkpoints/2026-10-30-stage-E-STARTED.md): owner permits isolated off-by-default prototype with confirmed/estimated/insufficient toll totals, no guessed tariff or known-subtotal-as-full. E1 two saved map anomalies only→E2contract/module→E3small saved multi-road sample→E4toll-only viewmodel→E5checks/localhandoff. Sourcee6a8a2fe clean, priorA–D preserved; remotec2f52ee9/PR14Draft verified. Root sole writer/atmostone read-only E1 assistant. No push/CI/live activation/Production/app routing/basefare change. Unknown remains where scope/product/comparable evidence is missing; no synthetic result counted as realroute estimate.

## 30.10.2026 — D cartography atlas SAVED LOCAL / no new tariffs, two map conflicts

[Final checkpoint](checkpoints/2026-10-30-stage-D-cartography-final-LOCAL-PARTIAL.md), [report/table](../experiments/junction-atlas/2026-10-30/REPORT.md), [32point atlas](../experiments/junction-atlas/2026-10-30/atlas.json). Six bounded road sets+actualM4southlocal follow-up;6physical entry/exit approaches, not32interchanges or6certifiedcurrentturns. Fifteen focusedchecksPASS;5exactOSM200sources/5inspectedrasterviews/8YandexUI controls, no new routing/geocoder captures or repeated audits. Six short controls, M12motorwayjoin57km andM11CKADentry29.9km remain unresolved. Existing M4north320/410 andZSD600 retained/indexed, newprices/pairs0; virtual58/registration/CKADdomain/extendedZSD bundles still unknown. Runtime/CI/data unchanged; previous D1 fix preserved but unpublished. Remote c2f52ee93cd98a81ecd05efa0358fb38c6704124/PR14Draft verified; no push/Production/otherbranch change. Next specific map-access/snap or operator evidence, not unchanged retries; publication/runtime integration require separate approval.

## 30.10.2026 — D cartography M4 reciprocal selected witness LOCAL / final index next

[M4 south checkpoint](checkpoints/2026-10-30-stage-D-cartography-M4-south-LOCAL.md): one available retained Voronezh→Taman capture, only545local5edge extraction;8/8complete, exactly one3842564088/702218806 passage. Adds actual southbound witness, not reverse-north fixture or new tariff. Updated M4sixchecksPASS/scopedlintPASS; old logs preserved, still15 distinct atlas checks overall. No network/app/runtime/tariff/CI/push changes. All32points and other per-road outputs saved; next final source manifest/report and portable local recovery. Two current Yandex map-detour conflicts remain unknown.

## 30.10.2026 — D cartography extendedZSD LOCAL / final atlas next

[ExtendedZSD checkpoint](checkpoints/2026-10-30-stage-D-cartography-ZSD-extended-LOCAL-PARTIAL.md):3 source-exact points distinguish cash booth1766158781/way355755817 from64E gantry13020687195/пр.Крузенштерна. Missing Planernaya original recovered200; actual retained Arzamas→Prim gate witness indexed, not six-case motif replay. Yandex local172m/1min is local corroboration only; larger origin/product/payment bundle remains unknown, no600/300/zero imported. One atlas checkPASS. All six per-road/source blocks saved locally, no app/runtime/tariff/CI/push/Production change. Next final32point atlas,15 focused metadata checks total, six short controls vs two map-detour conflicts, provenance/recovery handoff.

## 30.10.2026 — D cartography CKAD exact local frame saved / product still unknown

[CKAD checkpoint](checkpoints/2026-10-30-stage-D-cartography-CKAD-LOCAL-PARTIAL.md):3 source-exact points around12443433262/way1080462753, parent/oneway/node order now explicit. Yandex local570m/1min and inspected A113 raster corroborate geography, not free-domain boundary;275/274maplabels not official chainage. General PK5free and OSM fee/toll flags remain distinct; no zero/price invented. One atlas checkPASS. Previous M4/ZSD/M12/M11 saved, two current map-detour conflicts remain explicit. No push/runtime/tariff/CI changes. Next extendedZSD Planernaya/RVP64 then final atlas counts/evidence.

## 30.10.2026 — D cartography M11 LOCAL-PARTIAL / virtual58 and map control unresolved

[M11 checkpoint](checkpoints/2026-10-30-stage-D-cartography-M11-LOCAL-PARTIAL.md):4 exact-source points, retained CKAD47 entry/merge plus recovered primary147exitway200. Gate6588472831/sourceoneway/destinationМ10 corroborated, not a new gate or virtual58. Yandex short-input entry→merge detours29.9km/22min; exact snap unavailable, cause unknown. One atlas checkPASS; p58→p147610/750 retained but selected whole product unbound, existing confirmed M11 untouched. Earlier M12 join conflict remains explicit. No push/runtime/tariff/CI changes; next CKAD then extendedZSD atlas, final source counts.

## 30.10.2026 — D cartography M12 physical points saved / map join UNRESOLVED

[M12 checkpoint](checkpoints/2026-10-30-stage-D-cartography-M12-LOCAL-PARTIAL.md):6 source-exact points incl3 unidentified western frames. Ramp OSMnd order is reverse to actual selected traversal and has no one-way tag. Yandex motorway→22Н-0239 control57km/53min, ramp-interior control165m/1min; cause unknown, not independent direct-exit PASS. Coordinates/physical topology retained, legal/current join and operator registration endpoints unresolved. Two atlas checks/scopedlintPASS; no app/runtime/tariff change or new full route. M4/ZSD finished local atlas blocks preserved. Next M11/CKAD/extendedZSD source points and explicit map conflicts; no push/Production/CI/PR changes.

## 30.10.2026 — D cartography ZSD LOCAL / remaining exact road cases next

[ZSD checkpoint](checkpoints/2026-10-30-stage-D-cartography-ZSD-LOCAL.md), [5point/3segment atlas](../experiments/junction-atlas/2026-10-30/zsd.json): KADsouth entry→northbound OSM PVP5→Ekateringofka exact retained source/trace match. Yandex short exit257m/1min and one inspected OSM raster corroborate С2/набережная geography; operator map maintenance/PVPpage no independent numbering proof. Existing600 finished vector retained, not barrier-counted or extended. Four checksPASS/scopedlintPASS, no new OSM/route call/runtime/price change. M4 prior11points/6checks saved. No push/Production/CI change; next retained M11/M12/CKAD/extendedZSD exact-point cases and final atlas counts, not old full audits.

## 30.10.2026 — D cartography M4 atlas LOCAL / ZSD next

[M4 checkpoint](checkpoints/2026-10-30-stage-D-cartography-M4-LOCAL.md), [atlas/review](../experiments/junction-atlas/2026-10-30/M4_REVIEW.md):11 exact-source points,6 local one-way booth paths, new coordinate+parentway binding for saved R298 exit3057885104. Two OSM raster views inspected; Yandex short controls north880m/south25m constructed, but exact lane snapping unavailable. Opera screenshot timeout/local Chromium SUID blocker retained without disabling security. Six checksPASS, final scopedlintPASS after temporary existing-deps link; no app/runtime/tariff changes or repeated audit. Existing545320/410 working component retained once, not newly priced; full southbound vectors not proved. Remote c2f52ee9/PR14Draft, no push. Next retained ZSD entry/PVP5/exit atlas; prior D1 fix and other operator gaps unchanged.

## 30.10.2026 — Stage D cartographic addition STARTED LOCAL

[Cartography checkpoint](checkpoints/2026-10-30-stage-D-cartography-STARTED.md): owner prioritizes active map/graph crosswalk at M4/PVP545, then retained ZSD and remaining exact road gaps. Opera exposes URL navigation, accessibility and screenshots, not click/drag; no inferred interactions. Build independent junction atlas with separate visual/directed/operator proof levels; reuse existing source/trace first. One read-only ZSD inventory agent, root sole writer. Previous D1 fix/gates and all operator uncertainties retained. Remote c2f52ee9/PR14Draft reverified; no push/Production/runtime/tariff/CI changes. Next exact M4 map locality and north/south separation, local checkpoint then ZSD.

## 30.10.2026 — Stage D LOCAL-PARTIAL / D1 fixed, D2–D3 data gaps, D4 consolidated

[Final D4 checkpoint](checkpoints/2026-10-30-stage-D4-consolidation-LOCAL-PARTIAL.md), [exact section/product/price/source table](../experiments/address-search/STAGE_D_CONSOLIDATION.md), [integrity manifest](../experiments/address-search/2026-10-30-stage-d/final-review.json). One D1 geography defect fixed/gated locally: reported query with retained wrong-Rostov reply returns admitted DNR city/explicitly unconfirmed street, not invented coordinates. Runtimeae5203df:26focused and1047offlinePASS/1SKIP, TS/scopedlint/buildPASS; no later app changes. Five exact operator gaps remain (M4, M11 virtual58, M12 registrations/22Н-0239, CKAD Golitsyno, extended ZSD); known ZSD600 retained. New M11 original200/hash preserved, no new complete binding/price. Eight metadata checksPASS, not new app tests. Remote c2f52ee93cd98a81ecd05efa0358fb38c6704124/PR14Draft re-read unchanged; no push/newCI/Preview/Production. All C/D work local and preserved; next separate publication/authorized Preview approval or specific primary documents, no repeated audit/failed requests.

## 30.10.2026 — D3 bounded source research saved / operator gaps remain

[D3checkpoint](checkpoints/2026-10-30-stage-D3-primary-sources-PARTIAL.md), [source ledger](../experiments/address-search/2026-10-30-stage-d/d3-primary-ledger.json): new M11 scanned operator PDF200/9.57MB/SHA retained; pages5–6 corroborate CKAD47/MMK48/50/Solnechnogorsk58 facilities, not a virtual mainline tariff cut. New M12 PDF403/no primary bytes, CKAD/ZSD targeted leads insufficient; all four exact product bindings remain BLOCKED. No old failed URL retry, route/OSM request or monetary change. D1 verified locally1047PASS/1SKIP/TS/lint/build, unpublished; D2 M4 exact operator crosswalk unknown. Next D4 explicit evidence/missing-document table and local recovery handoff. No push/CI/Production/PR change.

## 30.10.2026 — D2 M4 primary research BLOCKED / D1 localfix saved

[D2checkpoint](checkpoints/2026-10-30-stage-D2-M4-primary-DATA-BLOCKED.md):4newofficial-domainqueriesempty,2primaryopens403/inaccessible,no newprimaryfacts/docdates/SHA claimed. Existing4443232947→358467208graph/coordsretained;officialkm/operatorproduct/pair/pricestillunknown. No oldfailedOSM/1038news/PDFqueryorrouteauditrerun,no guessedneighbour/PVP/zero. D1ae5203dfverified1047PASS/1SKIP/TS/lint/build andsavedlocally;unpublished. NextD3one/twonewprimaryleadsperM11/M12/CKAD/ZSDthenD4evidencetable. No push/CI/Production/otherbranch/PRchange.

## 30.10.2026 — D1 street geography FIXED_AND_VERIFIED_LOCAL / unpublished

[D1PASScheckpoint](checkpoints/2026-10-30-stage-D1-street-context-LOCAL-PASS.md),[exactlocalexample](../experiments/address-search/2026-10-30-stage-d/d1-example.json). Runtimeae5203df:genericnocommacontext+eligiblefeaturefilter+coordinatepriorityconstraint. OwnerquerywithsavedwrongRostovreply→200/Донецк—ДНР/geonames709717/48.023,37.80224,streetunconfirmed;notinventedDNRstreet.8newtests0PASS8FAILbefore;26focused+1047offlinePASS/1SKIP,project/newteststrictTS/scopedlint0errors1oldwarning/webpackPASS. No otherroute/tariff/data/CI/A+Bclientchange. Remote c2f52ee9/PR14Draft,NO push/Preview/Production;hostedfixNOTVERIFIED. NextD2boundednewprimarysourcefindings→D3remainingroads→D4table,oldCresultsretained.

## 30.10.2026 — D1 minimal street-context fix LOCAL / final gates STARTED

[D1codecheckpoint](checkpoints/2026-10-30-stage-D1-fix-LOCAL-gates-STARTED.md):8newregressions0PASS/8FAILbefore;26focusedPASSafter. Threefilesonly:city-firstnocommaprefixextractor,APIrankonlyeligiblefeatures,coordinate-basedexplicitpriorityregionconstraint. Incompatiblestreet→admittedoriginalcityfallback,nomadeupstreetcoords/cityexceptions. Fulloutage/cancel/20sbudgetandordinaryregionoppositeprioritycovered. StrictnewtesttypingPASS;lint0errors/1oldwarning. NextONEmandatoryofflinegate/projectTS/directbuildthenD1finalsave;no push/CI/Preview/Production/sourceaudits. D2readonlysourcebudgetfinished/no bindingyet;D3/D4nextafterD1save. StageC/localhistorypreserved.

## 30.10.2026 — Stage D1 explicit street geography STARTED LOCAL

[D1STARTED](checkpoints/2026-10-30-stage-D1-street-context-STARTED.md),[D1–D4scope](../experiments/address-search/STAGE_D.md). Source210d4669/remote c2f52ee9/PR14Draft,StageCpreserved. Ownerexample `Донецк ДНР улица Артёма` exposes no-comma contextloss and currentAPIrankingallrawfeatures despitecompatiblecandidatechecks. Nextregressionfirst→minimalgenericparser/filter/admittedcityfallback→gates/localcommit. D2sourceagentreadonly/max4queries2opens/mainonlywriter;D3oldoperatorgaps thenD4table. No push/CI/Production/main/Android/backup/Previewshare or newroute/GeoNamesaudit permitted.

## 29.10.2026 — Stage C bounded work LOCAL / C2+C4 material data blockers remain

[FinalC6checkpoint](checkpoints/2026-10-29-stage-C6-final-LOCAL-PARTIAL.md),[C1–C6report](../experiments/road-ref-boundaries/STAGE_C.md),[exacthashes/checks](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/final-review.json). C1/C3/C5/C6scopedDONE;C2M4graphpairconfirmed/operatorcrosswalkunknown;C4M11virtual58,M12registration,CKADPK5,largerZSDscopeBLOCKED. ExistingZSD600andM4/M11/ZSDfull10464retained;othercomboCKAD/ZSDmissing→null,notpartialsubtotal.8newregressions;1039offlinePASS/1SKIP/TS/lint/webpackPASS;finalnonnulltestguardsstrengthened/final8+portabletypesPASS(exactsequenceincheckpoint).0runtimefix/0newcapture/network;allapp/lib/data/CI/A+Bbyteunchanged. CurrentreverseM121713isexistingmodeloutput,notnewoperatorcrosswalkproof. PR14Draft/remotec2f52ee93cd98a81ecd05efa0358fb38c6704124readbackunchanged. No push/Production/main/Android/backup/share/CIchange. Newtest/docs/evidenceLOCALONLY;StageCNOTfullyDONE. Nextidentifiedprimaryoperatorbindingsor separatepublicationapproval,notrepeatsource/captureaudits;A+BPreviewauthacceptanceremainsseparate.

## 29.10.2026 — C5 combinations PASS LOCAL / C6 gates STARTED

[C5checkpoint](checkpoints/2026-10-29-stage-C5-combinations-LOCAL-PASS.md):Krasnodar→SPbexact5040+1130+3900+94+300=10464,16savedtrace/localresponsesneededforM4proof;Arzamas→PrimorskCKAD/ZSDmissing→unknown/null,notpartial5987. Bothgeometryhashesunchanged,duplicate/aggregateguardsPASS,0network. Initialharnesscontext/incorrectM12missingpremiselogspreserved/fixed,noruntimechange. ReverseM121713isexistingmodeloutput,notnewindependentoperatorcrosswalkproof. [C6STARTED](checkpoints/2026-10-29-stage-C6-regressions-STARTED.md):offlinegate/TS/scopedlint/directwebpackbuild,newtestcodeonly;nosource/browser/liveaudits. C2/C4realdata blockersremain;no push/CI/Production/A+Bchange.

## 29.10.2026 — C4 four-road boundedreview saved / ZSD known600 retained LOCAL

[ZSD/C4checkpoint](checkpoints/2026-10-29-stage-C4-ZSD-products-PARTIAL.md), [twoquotes](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-zsd.json). ExistingexactKADsouth→Ekateringofkaproduct600retained;largerPlanernayatripquoteNULL/scope_not_reviewed,notborrowed300/600.RVP64infrastructureNOTautomaticpaymentgate. C4review5retainedrecords/0networkcomplete,realM11/M12/CKAD/largerZSDoperatorbindinggapsremain;latestofficialpricepolicyunchanged. NextC5savedcombinedgeometry/compositionchecks,thenC6gates. No push/runtime/data/A+B/CIchange.

## 29.10.2026 — C4/CKAD Golitsyno continuity retained / precise PK5 crosswalk BLOCKED LOCAL

[CKADcheckpoint](checkpoints/2026-10-29-stage-C4-CKAD-Golitsyno-DATA-BLOCKED.md), [currentquote](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-ckad.json). SavedOSRMroute8contiguoustolltrueedges46–53/nextfree,notreentry. Currenteastarcresolverdoesnotbindwesternpair;unpricedcoveragepreservesckad,quoteNULL. PK5free/generalchainageoverlapnotexactway→freeboundary;donotassignzero. Needgeoreferencedpublisherplan/equivalentboundary;oldblockedYandexlinknotretried. NextZSDfinished+largerunboundcase;no push/runtime/data/A+B/CIchange.

## 29.10.2026 — C4/M12 actual22Н-0239 exit / operator registration BLOCKED LOCAL

[M12checkpoint](checkpoints/2026-10-29-stage-C4-M12-operator-pair-DATA-BLOCKED.md), [currentquote](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-m12.json). OnepinnedOSRMMoscow→Arzamas:1550135076→1550561305→1206479738/22Н-0239,notР158. Currentfirstmarker184cannotexclude174given158.46kmroutegap; boundaryunknown,m12_current_operator_pair_not_bound/null,0network. Missingwestern/exitregisteredIDs+operatorproductcrosswalk,notorder302age. NextCKADGolitsyno→ZSD;M11partial58interfaceblockerretained. No push/runtime/data/A+B/CIchange.

## 29.10.2026 — C4/M11 one partial path reviewed / full product BLOCKED LOCAL

[M11checkpoint](checkpoints/2026-10-29-stage-C4-M11-partial-DATA-BLOCKED.md), [currentquote](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-m11.json). ActualNoginsk→CKAD→M11→M10traceexit6588472831/way1307036920proved;notp58entry/reversebooth. Currentboundarym11_outer_boundaries_unresolved/quoteNULL,0network. Existingp58↔p147money610/750notageblocked; materialgap selectedCKADapproach→virtual58/productdivision,parentpath. No fabricatedphysicalbooth requirement. C4nextM12→CKAD→ZSD; runtime/data/CI/A+Bunchanged,no push.

## 29.10.2026 — C3 scoped boundary invariants 8/8PASS LOCAL / runtime unchanged

[C3checkpoint](checkpoints/2026-10-29-stage-C3-invariants-LOCAL-PASS.md):new8regressions/0network guard complete+foreign+partialtrace,manoeuvreprecision,reentry/chunkambiguity,directedIDs,registeredbothdateamounts,partial/duplicateunknownnull. ScopedlintPASS; peerreviewcommentsaddressed, nonewoperatorpricecertificate or runtime/publicAPI change. C1inventory/C2graphpair donewithoperatorcrosswalkBLOCKED. NextC4M11→M12→CKAD→ZSD1–2savedcasesonly. No push/CI/Production/A+Bsourcechanges.

## 29.10.2026 — C2 one M4 graphpair confirmed / operator crosswalk BLOCKED LOCAL

[C2checkpoint](checkpoints/2026-10-29-stage-C2-M4-graph-pair-DATA-BLOCKED.md), [raw-backed report](../experiments/road-ref-boundaries/checks/2026-10-29-stage-c/m4-evidence.json). Saved13trace+OSM9hashjoinPASS,network0:entry4443232947/447135768→1182567076/47.5105556,39.9708171;exit358467208/1211606940→28835034/48.186303,40.265878. Graphcontinuous/orderresolved;133M4refedges contain2tolltrue/131false,notautomaticoperatorproduct. Bothdatespriceunknown/null,kmunknown,no matcherfixjustified. Missingexactoperatoraccess→chargeproduct/branchscale/partialcollectionrule+matrixcell; no nearestPVP/kmguess/runtimeeligibleoverride. NextC3genericinvariants;no push/CI/Production/A+Bchange.

## 29.10.2026 — Stage C1 inventory DONE LOCAL / C2 one M4 graphpair next

Newlocal-only Ctask;remoteunchangedc2f52ee9/PR14Draft,previousA+Bnotesretained. [C1checkpoint](checkpoints/2026-10-29-stage-C1-state-DONE.md), [C1–C6scope/inventory](../experiments/road-ref-boundaries/STAGE_C.md). Existing selectedtrace/exactgraphboundaries/M4matrix/optionalKm/composition alreadyimplemented; do not rewrite. OSM4443232947→358467208coords+directedways were reviewed24Oct; operatorKm/scope/fare remainunknown. Next one savedGranitnoe→Kazan/rawtrace+B04evidence comparison, no repeatedsixcaseaudit/capture/roadnetworkrequests. No push/CI/Production/A+Bsourcechange permitted; checkpoints/localcommits only.

## 29.10.2026 — A+B published c2f52ee9 / gates PASS / Photon live FAIL / Preview AUTH BLOCKED

ONEffpush/readbackPASS:remotec2f52ee93cd98a81ecd05efa0358fb38c6704124/tree81b4edaee4ffb6a17c3c93308b87ec52fe08d054,PR14Draft. [Final checkpoint](checkpoints/2026-10-29-stage-AB-final-CI-PASS-live-FAIL-auth-BLOCKED.md), [exactevidence](../experiments/preview-acceptance/2026-10-29-ab/final-review.json). All3automaticruns40948464866/40948474945/40948475162 completedSUCCESS overall; mandatoryverify1031PASS/1SKIP/TS/build,controlledB03 18of18PASS,6cancelregressionsPASS. BUT live_probeFAIL:PhotonКрасн6×503→Донецк7×cooldown;50route/YandexstepsSKIPPED. DirectPhotoncollector,notGeoNamesAPI; no secondpush/rerun.4geometrywarnings exactlymatchpriorarchive. ActualGitHubDonetsk→Moscow200/7.109s,notVercel/SLA/tariffcertificate;3artifactSHAverified. Exactnewf0h1q39twPreviewREADY/sourcec2f;browser→VercelLogin,CLIloggedInfalse:realcities/streets/A-B/mobile/route/hostedabortBLOCKED_AUTH,cold/RAMunmeasured. Production051d51ea/dpl_6XMRbMu5V5vqWTzf684oPTMyubju+publicaliases unchanged. A+B functionalacceptance NOTDONE; next exactPreviewauthorizedaccess thenboundedchecks. IndependentCcanbescopedseparately,noclaimblockersclosed. Allfinalnotes/evidenceLOCALONLY;ONEpushconsumed,noadditionalpublicationpermitted.

## 29.10.2026 — exact A+B Preview READY / real acceptance BLOCKED_AUTH

Publishedc2f52ee9 exactPreviewf0h1q39tw READY/correctbranch/source;Next16.3.4/TS/static16PASS. ExistingCLIloggedInfalse; exactREADYbrowser→LoginVercel, no newlogin/share/protectionchange. [Access+CI evidence](checkpoints/2026-10-29-stage-AB-preview-READY-auth-BLOCKED.md). ActualPreviewcities/streets/A-B/desktop/mobile/route/callerdisconnectNOTRUN,cloudcold/RAM/functionsizeUNMEASURED. BothhostedverifySUCCESS1031PASS/1SKIP/TS/build;B03controlled18of18PASS;actualGitHubDonetsk→Moscow200/7.109s (NOTVercelbrowser),2artifactSHAverified. live_probe stillrunning; waitfinaloutcome, no rerun/secondpush. FinalnotesLOCALONLY.

## 29.10.2026 — A+B PUBLISHED c2f52ee9 / exact tree readback PASS

ONE normalffpush20prepared+1preflightcommit; remotec2f52ee93cd98a81ecd05efa0358fb38c6704124/tree81b4edaee4ffb6a17c3c93308b87ec52fe08d054 exactreadbackPASS. [Publication](checkpoints/2026-10-29-stage-AB-PUBLISHED.md). Automatic40948475162/40948474945 started; classifier correctlyroute-runtime-changed, timingSUCCESS,verify/live/UI pending. ExactnewPreviewf0h1q39tw/dpl_HbLBjiztL9wCe4xn22gTho3V2Y4k BUILDING/sourcec2f52ee9; existingCLIloggedInfalse. No newshare/login/CI/protection/Production change; Production baseline051d51ea. Next finalCI/artifacts→exactREADY/access→realacceptance orBLOCKED_AUTH. ONEpushconsumed; thisandlaterfollow-upnotesLOCALONLY.

## 29.10.2026 — A+B single publication STARTED / preflight PASS

Owner authorizes ONE working-branch ffpush + automatic existingCI + exact-sourcePreview acceptance; no secondpush for reports. Prepared eea93512 is20commits/131paths vs remotea1c169d3; dry-runPASS,PR14Draft,oldCIcompleted.98manifest/sourcehashesPASS,changedbytes+4archivepayloadsscan no credential/share hits; no data/tariff/CI/dependency changes. [Recovery/sequence](checkpoints/2026-10-29-stage-AB-publication-STARTED.md), [exactpreflight](../experiments/preview-acceptance/2026-10-29-ab/preflight.json). No new tests rerun; existing1031PASS/1SKIP/TS/lint/build reused at unchanged runtime. Next finalremotecheck→ONEpush/readback→actualCI→exactnewPreview only with authorized access; no share/protection/Production change. This note is STARTED, not publication/hosted success.

## 29.10.2026 — Stage B1–B5 сохранён LOCAL / main V3 cancellation исправлена

[Итог этапа B](../experiments/routing-reliability/STAGE_B.md), [B5checkpoint](checkpoints/2026-10-29-stage-B5-controls-LOCAL-PARTIAL.md). Runtime180e7caa:6cancel regressions,31targeted/1031offlinePASS+1SKIP,TS/scopedlint/webpackPASS. Main geocode/providers/special/trace/429wait получают caller abort с прежними deadlines, безопасный400 вместо stale result; unchanged uncancelled body/requests EXACT. Measured obsolete starts3→1, normal-speedup не заявлен. ONE current realKrasnodar→Moscow200/8.597с/14calls:Valhalla1346445m/64394s — fastest допустимый противOSRM65630s; BRouter400target-island не подавил расчёт. Точный offlineKras→SPb200/19responses/0misses; Donetsk→Moscow200/parity/0misses; Moscow→SPb старый real200 reuse. Yalta→SPb старый502 остаётся BLOCKED_BY_DATA без подмены причины. Trace4.996с — крупнейшая network-inclusive стадия нового sample, не CPU/SLA. Глубокий auxiliary/V2/body-stream/hosted abort не сертифицированы. Stage A и его блокеры сохранены. Все изменения LOCAL ONLY, готовность только к отдельно разрешённой working-branch/CI/Preview проверке; push/Production/main/Android/backup/CI не менялись.

## 29.10.2026 — Stage B5 пять controls STARTED LOCAL

[B5 recovery/limits](checkpoints/2026-10-29-stage-B5-controls-STARTED.md). Точный Krasnodar→SPb archive найден, Donetsk→Moscow replay0miss уже сохранён, Moscow→SPb старый real200 и Yalta→SPb real502 не повторяются. Для недостаточно представленного Krasnodar→Moscow — один pinpoint current-handler real run: GeoNames координаты, departure15Oct09MSK, caller35с/max20upstream, raw capture, без повторов/подмены Домодедовом. Это разрешённое уточнение B5, не широкий аудит/публикация.

## 29.10.2026 — Stage B4 measured waste reduction LOCAL

[B4checkpoint](checkpoints/2026-10-29-stage-B4-cancelled-work-LOCAL.md): единственная выбранная оптимизация — исправленная B2 отмена устаревшей работы; controlled provider starts3→1, два последующих старта предотвращены, первый in-flight abort доставлен. [Числа/sourceSHA](../experiments/routing-reliability/2026-10-29/cancelled-work-summary.json). Не выдано за ускорение нормальной поездки или10сSLA; uncancelled body/requests EXACT MATCH. Runtime180e7caa не менялся, gatesне повторялись. Далее B5 пять saved-controls с честными пробелами, без новых массовых запросов/публикации.

## 29.10.2026 — Stage B3 сохранённые timing разобраны LOCAL

[Сводка с sourceSHA](../experiments/routing-reliability/2026-10-29/timing-summary.json), [checkpoint](checkpoints/2026-10-29-stage-B3-saved-timings-LOCAL.md): historical handler2.225/7.318/4.086с; основные крупные интервалы routing1.1–2.1с и network-inclusive trace0.66–3.27с. Нельзя суммировать перекрывающиеся provider/parent spans или выдавать CPU-профиль заE2E. Geometry/fastest-selection/JSON отдельно UNMEASURED. Старый special-split reuse не повторён; normal-speedup/10сSLA не заявлены. Дальше B4 measured cancelled-work reduction → B5 saved5controls. Только документы/выборки, без новой сети/сборки/push.

## 29.10.2026 — Stage B2: main V3 cancellation исправлена LOCAL / invariants PASS

Доказанный дефект отмены устранён в geocode/ordinary+special routing/selected trace/429wait: caller signal объединяется с прежними25с/18с deadline, отменённый запрос получает безопасный400 без stale success. [Checkpoint и пределы](checkpoints/2026-10-29-stage-B2-cancellation-LOCAL-PASS.md).6новыхtests,31targetedPASS,1031offlinePASS/1SKIP,TS/lint/webpackPASS. Полный savedDonetsk→Moscow before/current replay12responses/0misses/0network, body+request EXACT MATCH. Диагностика после отмены:3starts→1 (первый abort, два новых предотвращены), не speedup нормальной поездки. V2/дальние вспомогательные pricing-I/O/body-stream abort не проверены полностью. Далее B3 сохранённые timings → B4 measured waste → B5 пять сохранённыхконтролей. Всё LOCAL ONLY; Stage A сохранён, push/Preview/Production/CI не менялись.

## 29.10.2026 — Stage B1 причины разобраны LOCAL / исторические пробелы сохранены

Один разрешённый узкий BRouter probe получил400/941ms и точное `no track found at pass=0`; текущий отказ — no-track для данного профиля/входа, не доказанный сетевой или URL-дефект. [Таблица причин B1](../experiments/routing-reliability/STAGE_B.md), [checkpoint](checkpoints/2026-10-29-stage-B1-causes-LOCAL.md). Старый Moscow nativeECONNREFUSED/proxy200 разделён с Yalta502 без per-socket evidence; последняя причина UNKNOWN/BLOCKED_BY_DATA. Код/профили/тарифы не менялись. Далее B2 controlled failover/geometry/corridor/unknown/cancel, затем сохранённые timings; LOCAL ONLY, push/Production/CI не разрешены, Stage A сохранён.

## 29.10.2026 — Stage B routing/resilience/performance STARTED LOCAL

Clean local ca627096 содержит весь Stage A; remote a1c169d3/PR14 Draft проверены, новые правки не опубликованы. [Ограниченный этап B1–B5](checkpoints/2026-10-29-stage-B-routing-STARTED.md): reuse сохранённых ошибок/профилей, один BRouter body-probe по отсутствующему evidence, controlled failover/corridor/unknown проверки, только доказанная локальная оптимизация, пять сохранённых направлений без массового аудита. Все прежние адресные ограничения сохранены; push/Preview/Production/CI не разрешены.

## 29.10.2026 — Stage A улицы: LOCAL acceptance PASS / hosted и DNR-покрытие PARTIAL

Runtime e6142b18:12новых regressions;93targetedPASS/1SKIP,1025offlinePASS/1SKIP/0FAIL,TS/scopedlint/webpackPASS. [Финальный локальный checkpoint](checkpoints/2026-10-29-stage-A-street-acceptance-LOCAL-PARTIAL.md). Новый desktop/mobile street+city-fallback/clearA/B/swap/refocus PASS: реальные city HTTP через GeoNames, уличные ответы явно replay из сохранённых реальных capture; новых livePhoton/route запросов нет. Ранее реальный контроль Москва→СПб200/4.229с переиспользован с проверкой неизменности route/client/data и координаты, не выдан за новый прогон. Исправлены comma-region city intent, street-layer/relevance/territory tie и честный city-only fallback; координаты не выдумываются. ДонецкДНР/Артёма не подтверждён в двух окнах Photon из пяти суммарных source-запросов: возвращается сам ДонецкДНР, не улица Ростовского Донецка. Бесплатный уличный резерв и hosted-проверка нового кода остаются открыты. Готово к ограниченной Preview-публикации только после отдельного разрешения. Все результаты LOCAL ONLY, remote a1c169d3/PR14 Draft прежние; push/Production/CI не менялись. Свой сервер остановлен, временная dependency-ссылка удалена, прежние копии сохранены.

## 29.10.2026 — Stage A город+улица: код LOCAL PASS, покрытие улиц PARTIAL

Устранены доказанные причины: запятая+регион больше не отправляет городской поиск в Photon; уличные совпадения сохраняют региональный tie-priority; явный город+улица без подтверждённой улицы получает честный city-only fallback с исходной координатой; nonnumeric street-запросы используют layer=street в прежних трёх вариантах, без роста fan-out. Уличная точка обозначена ориентировочной, бюджет20с учитывает локальный поиск/отмену. [Код, проверки и ограничения](checkpoints/2026-10-29-stage-A-street-code-LOCAL-PASS.md), [5реальных source captures и replay8входов](../experiments/address-search/2026-10-29-street-scope/README.md).93targetedPASS/1SKIP;1025offlinePASS/1SKIP/0FAIL,TS/scopedESLint/webpackPASS. Реальные источники подтверждают Краснодар/Красную, Москву/Тверскую, Ялту/Кирова; ДонецкДНР/Артёма не доказан в ограниченной выборке и не подменяется Ростовским Донецком. Следующий узкий блок — UI выбора новой улицы/city-fallback и reuse неизменённых A/B/route доказательств. LOCAL ONLY; remote a1c169d3/PR14 Draft прежние, push/Preview/Production не выполняются. Принятое правило домов не переписывалось.

## 29.10.2026 — Stage A: проверка кода город+улица STARTED LOCAL

Фактический чистый local d7cc05f6 продолжает a0e27781; remote a1c169d3/PR14 Draft проверены, публикации новых исправлений нет. [Ограниченный текущий блок](checkpoints/2026-10-29-stage-A-street-scope-STARTED.md): regression-first восемь входов/одноимённые улицы/GeoNames без Photon, только доказанные правки; до четырёх узких street-source запросов, затем приёмка с использованием сохранённых A/B/swap/route доказательств для неизменённого кода. Не повторять корпус/тарифы и не переписывать принятое правило; только local commits, без push/Preview/Production/CI изменений.

## 29.10.2026 — обязательные границы поиска: населённый пункт + необязательная улица

Новое решение владельца имеет приоритет: A1 — GeoNames населённые пункты; A2 — Photon улицы с подтверждённой привязкой к населённому пункту; A3 — независимый бесплатный резерв населённых пунктов и улиц; A4 — приёмка населённого пункта и сочетания город+улица. Дома/корпуса/строения/литеры/квартиры/подъезды не нужны; их отсутствие не дефект и не blocker. Прежний пробел Москва/Тверская1 — OUT_OF_SCOPE, а не подтверждённая проверка улицы. Допустима явно ориентировочная подтверждённая точка улицы внутри выбранного населённого пункта, но не выдуманная координата или заявление о точном доме. Приоритет другого города по одному совпадению названия улицы недопустим.

[Постоянное правило и актуальные критерии A1–A4](../experiments/address-search/ADDRESS_SEARCH_SCOPE.md) закреплены также в AGENTS и решениях поиска. [Checkpoint](checkpoints/2026-10-29-address-search-scope-settlement-street-LOCAL.md). A1 bounded DONE/полное покрытие PARTIAL сохраняется; подтверждения A2 остаются локальными, новые уличные сценарии автоматически не засчитаны; уличный резерв A3 и новая hosted-приёмка не объявлены DONE. Это docs-only изменение, без новых запросов геокодирования/сборки/тестов приложения, без удаления работающих механизмов и без изменения архивных доказательств. Remote a1c169d3/PR14 Draft проверены; push и Production не разрешены. Следующая инженерная проверка — недостающие сочетания город+улица по новым критериям, а не точные дома.

## 29.10.2026 — Stage A local acceptance saved / publication not authorized

[Archive readback](checkpoints/2026-10-29-stage-A4-archive-readback-DONE.md): manifest/source hashes PASS; original raw-log whitespace warnings retained byte-for-byte, not treated as a passed staged whitespace check. Only the stage's own temporary server/symlink were removed; old worktrees/dependencies remain.

A1 bounded rules DONE, full coverage PARTIAL; A2 generic compound-query relevance and safe administrative labels FIXED LOCAL; A3 review DONE but operational free detail reserve BLOCKED. Actual local API puts Krasnodar/Krasnaya100 first; desktop/mobile clear/retype/swap PASS, one Moscow–SPb calculation HTTP200/4.229s. Runtime captures use c962fb73; subsequent 00e9983c guards passed 81 targeted and 1013 offline tests/1 SKIP, TS/scoped ESLint/webpack. [A4 checkpoint and source boundaries](checkpoints/2026-10-29-stage-A4-local-acceptance-PARTIAL.md), [saved evidence/logs](../experiments/address-search/2026-10-29-stage-a4-local/README.md). Exact Moscow/Tverskaya1, corrected-code hosted acceptance, cloud resources and the old mobile-timeout cause remain unconfirmed. Local Ready124ms/RSS197028KiB are not Vercel measurements. Remote a1c169d3/PR14 Draft unchanged; no push or Production change. Next: separate publication authorization, mandatory CI and exact new Preview acceptance; no repeated corpus/route audit. New stage history is checkpoint-first; protected legacy WORK_LOG/NEXT_STEPS remain untouched.

## 29.10.2026 — A4 boundary corrections LOCAL / final gates PASS

Newregression-first guards preserve fullnumericsettlement-name priority and forbid municipal/county values masquerading as city evidence. Genericcode, no cityexceptions/coordinates/tariffs/pool changes.81isolatedtargetedPASS; finaloffline1013PASS/1SKIP,TS/scopedESLint/webpackPASS. [Guard checkpoint](checkpoints/2026-10-29-stage-A4-boundary-guards-LOCAL.md). ActuallocalAPI/UI/controlroute captures exercised precedingc962 corefix; latestguards verified offline/build, not a repeatedlive run. Next preserveA4 evidence and partialPreview/data/reserve status. No push; publisheda1c unchanged.

## 29.10.2026 — Stage A3 free DETAIL reserve review saved / operational reserve BLOCKED

Reused existing official-source review, no new provider requests/accounts/keys. PublicNominatimautocomplete forbidden; Geoapify free candidate has finitequota and existingadapterCITYONLY/off/unreviewed; DaData detailcoverage/precision/provisioning unproved; ownOSMdetail corpus/build not prepared. [A3 evidence/next prerequisites](checkpoints/2026-10-29-stage-A3-detail-reserve-REVIEW.md). No working detailreserve claimed or new idleadapter created; GeoNamescity independence retained. A2localc962fb73 verified; next A4 bounded actuallocalAPI/UI/one route with explicit evidence boundaries. No push/CI/Production changes.

## 29.10.2026 — Stage A2 generic detailed-address fix LOCAL / exact Moscow house unconfirmed

ActualPhoton5boundedrequests: RUКраснодарКрасная100 exists; exactМоскваТверская1 absent from two returnedwindows, not proved absent globally;2global503 preserved without retries. Genericcity/street/house evidence ranking, full detail query preservation, no detail bbox windows, safe source-backed priority-area admin labels implemented LOCAL; no city exceptions or invented addresses.79isolatedtargetedPASS; full offline1011PASS/1SKIP, TS/scopedESLint/webpackPASS. [Evidence/limits](checkpoints/2026-10-29-stage-A2-compound-address-LOCAL.md). GeoNames/20s/pool/route/tariffs unchanged. A1boundedDONE/fullcoveragePARTIAL(ownerPreview evidence); nextA3 free detailed-address reserve assessment then A4. No push; publisheda1c still has old A2 behavior.

## 29.10.2026 — Stage A: A1 bounded DONE/full coverage PARTIAL; A2 STARTED

Owner now reports actual publisheda1c169d3 Preview city/display acceptance; record as owner evidence, not a new agent run. A1 admitted169431/excluded52081 guard unchanged; nationwide semantic/coverage certificationPARTIAL. [Checkpoint and bounded next work](checkpoints/2026-10-29-stage-A1-handoff-A2-STARTED.md). A2 targets compound Photon address ranking/query truncation and safe priority-area administration, with at most4initial+2justifiedfollowup requests. No push/CI/Production or broad audit. Then A3 reuse free-reserve research; A4 distinguish mocks/local API/Preview.

## 29.10.2026 — final publisheda1c169d3 CI PASS / exact Preview READY / acceptance BLOCKED BY ACCESS

Remotea1c169d3c7dce49b7d1d3747b9698e7aee4b581a/tree19793e429d667ff925003cc58570a8010ed2e86d readbackPASS; PR14Draft. Both40881925570/40881925603SUCCESS and all live/verify/UI jobsSUCCESS.1007offlinePASS/1SKIP,18controlledUI PASS,TS/buildPASS;3artifact digests checked/savedLOCAL. [Final evidence/limits](checkpoints/2026-10-29-b05-final-display-CI-PASS-ACCESS-BLOCKED.md). Addresscollector3/3PASSwithoutsourceerrors thisrun; existing2Valhalla rejects/19provider differences persist. Exactnew5liov1bd6PreviewREADY/sourcea1c but redirectsLogin; ownergivenURL forConnectoraccess, no newshare/CLIlogin/oldPreview substitution. New-source real city/labels/desktop/mobile/controlroute and oldmobiletimeout outcome NOT VERIFIED; cloudcold/RAMUNMEASURED. Production051d51ea unchanged. ONEpushused; finalnotesLOCALONLY. Next obtainexactPreviewaccess and completeboundedacceptance before anyProductiondiscussion; no additionalpush permitted.

## 29.10.2026 — final display newPreview READY / real acceptance awaits access

Exacta1c169d3 Preview5liov1bd6/dpl_BLWKSPSNgg4YbB1DLZTXqRkuXWAo READY but redirectsLoginVercel; exactURL sent toowner forConnector access, no loginloop/newshare/oldPreview substitution. [READY evidence](checkpoints/2026-10-29-b05-final-display-preview-READY.md). VerifyNode24.22.1/full1007PASS/1SKIP/TS/buildPASS; B03artifact18/18PASS; calctimingHTTP200/7.58s GitHubhandler, notVercelbrowser proof. livejobstillrunning at checkpoint. Cloudmemory/coldstart unmeasured despite catalogue/runtime-log inspection. Production051d51ea unchanged. Onepushused; notes+2artifactsLOCALONLY. Next finalCI review and realnewPreview onlyafteraccess.

## 29.10.2026 — final display fix publisheda1c169d3 / new CI and Preview pending

ONE normal ffpush7preparedcommits/24files; exactremotea1c169d3c7dce49b7d1d3747b9698e7aee4b581a/tree19793e429d667ff925003cc58570a8010ed2e86d readbackPASS. No secret/sharetoken detected in changedfiles/ZIPpayloads; CI/runtime tariff routing policy unchanged. [Publication checkpoint](checkpoints/2026-10-29-b05-final-display-PUBLISHED.md). Automatic runs40881925570/40881925603 active; calctimingSUCCESS. NewexactPreview5liov1bd6/dpl_BLWKSPSNgg4YbB1DLZTXqRkuXWAo BUILDING; initialbrowsernavtimeout showed buildingpage, not search failure. Production051d51ea unchanged. Next finalCI/newREADY then actualnewPreview acceptance; if protected request owneraccess for exactURL, no loginloop/sharecreation. No secondpush; follow-upnotesLOCALONLY.

## 29.10.2026 — actual protected Preview checked / published defects reproduced / correction LOCAL

Owner-provided temporary access worked; token never persisted, no new link/login/protection change. Real published5558 API5/5HTTP200/geonames, DonetskDNR/Rostov and Sevastopol priorities verified; Донецьке and technical labels reproduced. ONE Moscow→SPb realcalculateHTTP200/4484ms/711430m; desktop clear/retypeA/B after calculationPASS. Fresh mobiletouchcontextPASS5actualsearches; initial reused-page resize/Moscow timeout remains UNKNOWN, not claimed fixed. [Hosted evidence/limits](checkpoints/2026-10-29-b05-real-preview-display-REVIEW.md). Local correctionac61af86:56targetedPASS,1007offlinePASS/1SKIP, TS/ESLint/buildPASS, localdesktop/mobilehumanlabels+bothhomonymsPASS. No full-corpus semantic certificate. No push allowed; oldPreviewstilldefective. Next separate publication permission+exactnewPreview recheck; keep mobile timeout observation open. Reports/evidence LOCAL ONLY.

## 29.10.2026 — actual GeoNames display defects fixed LOCAL / existing Preview still old

Saved source falsely tags Донецьке asru as well asuk; old Cyrillic screen missesцьк. Shared source-name quarantine now applies toGeoNames/Photon; no invented translation/untyped alias promotion. Technical homonym ID/coords replaced by compact ordinal+unverified-district note; original IDs/coords/corpus/ranking retained. 56targetedPASS; final offline1007PASS/0FAIL/1SKIP, TS/scopedESLint/webpackPASS; actual localdesktop/mobile choices+bothhomonymselectionsPASS. [Detailed checkpoint](checkpoints/2026-10-29-b05-display-policy-LOCAL-PASS.md). No whole-corpus linguistic certificate. Existing owner-supplied Preview access worked: old defects reproduced, desktopPASS/controlrouteHTTP200; freshmobilePASS after initial resized-page timeout (cause unproven). Preserve separate hosted evidence next. No push permitted; remote5558ed8b unchanged.

## 29.10.2026 — published5558 CI PASS / exact Preview READY / real acceptance AUTH BLOCKED

Remote5558ed8bdec347361b2b5749c370d6d3c31d83c1 readback unchanged; PR14Draft. Both automatic runs40874451226/40874451210 SUCCESS; all live/verify/UI jobs independentlySUCCESS, offline1005PASS/0FAIL/1SKIP,18controlledUI PASS, TS/buildPASS. Live artifact still records Photon503/cooldown,2Valhalla rejection/19provider disagreements; no claim all providers/tariffs proved. [Final checkpoint](checkpoints/2026-10-29-b05-published-ci-PASS-preview-auth-BLOCKED.md),3downloaded archives/digests retained LOCAL. ExactnewPreviewexz5glade READY/source5558; Protection redirectsLoginVercel. Single replacement official CLI flow ended exit1 without confirmation/success; do not reuse its challenge or start a login loop. Real hosted city/UI/route/cold/RAM NOT verified. Production051d51ea unchanged. ONE push consumed; final notes LOCAL ONLY. Next fresh official device confirmation with owner, then exact Preview acceptance, no new publication.

## 29.10.2026 — exact published5558 Preview READY / real hosted checks AUTH BLOCKED

New Previewdpl_Etho8xWgLCtm9HUxLRARE59C8YVn READY, exact5558ed8b source, targetPreview. GitHub verify1005PASS/0FAIL/1SKIP +TS/build PASS onNode24.22.1; B03run40874451210 PASS18/18controlledUI. calculation_timing artifactHTTP200/7.05s onGitHub runner, NOT hosted-browser proof. live_probe passed geometry/address/50-route steps; Yandex step pending at checkpoint. [Evidence/limitations](checkpoints/2026-10-29-b05-published-preview-READY.md); downloaded2artifacts match digests. New Preview browser redirectsLoginVercel; one official CLI authorization awaits owner confirmation. Hosted searches/route/cold/RAM unverified. Production051d51ea unchanged. NO secondpush; notes/artifacts LOCAL ONLY. Next finish live-job inspection and authorized Preview checks.

## 29.10.2026 — regional fixes published5558ed8b / CI and new Preview pending

Exactly one normal ffpush nine prepared commits; remoteSHA5558ed8bdec347361b2b5749c370d6d3c31d83c1 and tree6265153bfa398923e2f34d2b01b9728d3c818749 match local. [Publication checkpoint](checkpoints/2026-10-29-b05-regional-publication-PUBLISHED.md). Automatic runs40874451226/40874451210; verify/B03 passed, live still pending at checkpoint. New exact-source Previewdpl_Etho8xWgLCtm9HUxLRARE59C8YVn initiallyBUILDING. Production baseline051d51ea unchanged. Old CLI flow ended without auth; one authorized replacement waits confirmation. No secondpush permitted; follow-up notes LOCAL ONLY. Next final CI/artifacts + PreviewREADY + protected real checks after auth.

## 29.10.2026 — built local V3 desktop/mobile PASS / Preview AUTH BLOCKED

Actual local production V3 → POST/r → admitted GeoNames → UI passed1280×900 and390×844: clear/retype A/B, Volnovakha, Donetsk DNR/Rostov, preserve other endpoint; no address mocks, HTTP200/geonames, no page errors. Calculation intentionally intercepted, so no live full-route claim. Evidence/screenshots/runtime hashes saved; [checkpoint](checkpoints/2026-10-29-b05-regional-ui-LOCAL-PASS.md). Source3b08ca23 runtime equals tested build. Existing CLI remains loggedInfalse; exact Preview browser tab still redirects to LoginVercel. No new login link/share/push/CI/Production change. Hosted checks remain UNVERIFIED; published Preview remains d5be, local fixes absent there. Next finish existing official auth, then exact Preview; publication needs separate approval.

## 29.10.2026 — explicit-region ranking LOCAL verified

Generic ordinary-region qualifier now overrides default geographical priority in Photon; coordinate-classified priority areas cannot be overridden by provider state text. Donetsk-specific score bonus removed, namesake IDs/coordinates preserved. All seven requested queries covered in actual GeoNames API tests with Photon fully unavailable. 42 focused +7 actual-data tests PASS; full offline1005PASS/0FAIL/1SKIP; TS/scoped ESLint/webpack exit0. [Checkpoint](checkpoints/2026-10-29-b05-regions-LOCAL.md). No corpus/CI/push/deployment changes. Next built-source local desktop/mobile smoke; existing Preview still d5be and CLI auth false, so hosted checks remain unverified.

## 29.10.2026 — Photon verified-Russian settlement display LOCAL

Coordinate-classified priority settlements require Russian source fields or existing reviewed area-scoped RuWiki names; no raw/unverified fallback or city display dictionary. Aliases, streets/houses, coordinates/IDs unchanged. 39 focused PASS; full offline1002PASS/0FAIL/1SKIP, TS/webpack/scoped ESLint exit0 (one pre-existing warning). [Checkpoint](checkpoints/2026-10-29-b05-photon-russian-LOCAL.md). Possible reduced Photon-only coverage without Russian evidence is intentional, not translated away. Next generic explicit-region tests. Existing CLI login still unconfirmed/loggedInfalse; Preview real checks unverified. No push; Preview remains d5be.

## 29.10.2026 — GeoNames Russian-name guard LOCAL / Photon incomplete

Priority-area GeoNames no longer displays explicitly unverified, Latin or Ukrainian-specific display names; no invented translations or data regeneration. 13 targeted PASS; full offline 999PASS/0FAIL/1SKIP, TypeScript and webpack build exit0. [Checkpoint](checkpoints/2026-10-29-b05-geonames-russian-display-LOCAL.md). Photon unverified-name fallback remains unresolved, so cross-provider Russian-only guarantee is NOT complete. Authorized Vercel device confirmation pending. No push or deployment; Preview remains d5be.

## 29.10.2026 — Crimea-first ranking LOCAL / language and Preview pending

GeoNames tiers and Photon comparable exact settlements now prefer Crimea, then new territories, remaining Russia, others. Regression-first tests reproduced old ordering; 43 targeted PASS, TypeScript/full offline gate/webpack build exit0. No corpus/coordinates/routing/tariff/CI changes or push. [Checkpoint](checkpoints/2026-10-29-b05-crimea-ranking-LOCAL.md). Verified-Russian-only display and generic explicit-region coverage still incomplete. Official authorized Vercel device login pending; existing Preview remains published d5be, not this local change.

## 29.10.2026 — actualCLI checked /loggedInfalse /TrustedSourcesneedsidentity

Barevercelwhoami127 resolved by officialpinnedCLI65.7install; missinglocalglobaldir fixed via standardFSpermission, THENwhoami returnedloggedInfalse/linkedProjectnull/exit1. ProjectinspectNoexistingcredentials, unapprovedautomaticlogin stopped; envrunhelp confirmsdevOIDCpath but no token/envfile/link. No browserlogin request/share/protectionchange/secretread/push. [Exact checks/blocker](../experiments/address-search/CLI_TRUSTED_SOURCES_ACCESS_2026-10-29.md), [checkpoint](checkpoints/2026-10-29-geonames-cli-trusted-sources-auth-BLOCKED.md). Previewd5beREADY; actualUI/API/route/hostedcoldRAM UNVERIFIED. Next deliberate standardCLIauth with existingprojectrights, then vercelcurl+devOIDCoriginheader, no newpublication. NotesLOCALonly.

## 29.10.2026 — secondpush d5be1241 saved /PreviewREADY /realchecks AUTHBLOCKED

ONE authorizednormalffpush/readbackPASS, PR14Draft. ExactnewPreviewdpl_7pAvNNZBoH7UGkNBfUZSEmMaaH8N READY/VercelTurbopack+TS PASS; previous4fixtures fixed. CIverify998PASS/0FAIL/1SKIP, B03mock18/18PASS, live_probe/timingSKIPPED test-only; oldPhoton503 separate. Production051d51ea unchanged, pilotonlyPreviewbranch. ActualbrowserPreview→LoginVercel; CLI/oidc absent, no share/protectionchange. Ownerlogin requested; realcity/UI/mobile/route and hostedRAM/coldstart UNVERIFIED. [Result](../experiments/address-search/SECOND_PUBLICATION_PREVIEW_2026-10-29.md), [checkpoint](checkpoints/2026-10-29-geonames-second-push-READY-auth-BLOCKED.md). Next existingauth then sameREADYPreviewchecks, NO thirdpush. Follow-upnotesLOCALonly.

## 29.10.2026 — GeoNames published8dc4b28; PreviewERROR; fixLOCAL

ONE normalffpush22replayedcommits/readbackentiretreePASS; PR14Draft,Production051d51ea/deployment unchanged. Preview-only exactbranchpilot1 configured. NewPreviewdpl_HRNK245d2NL9behEqKvTy34vhgEZfails4Photon/snapshotfixtures because inheritedpilotON returnsGeoNames; NOTREADY/no realPreviewbrowser/RAM/cold/route proof. AutomaticCIverify/TS/build/B03PASS, live_probeFAILPhoton503/cooldown despite workflowSUCCESS. [Full result](../experiments/address-search/PUBLISHED_PREVIEW_RESULT_2026-10-29.md), [checkpoint](checkpoints/2026-10-29-geonames-published-preview-BLOCKED.md). Currentworktree /workspace/geonames-preview-publish-fc83523; originalsource /workspace/address-resilience-8fb retained. Minimal4fixtureisolationfix LOCAL only, originalassertions unchanged;10targetedPASS + Previewenvfull998PASS/0FAIL/1SKIP. Next separateapprovalforsecondsmallfixpush, then actualPreviewchecks. No share/protectiondisable/CIchange/secondpush.

## 29.10.2026 — GeoNames restricted Preview READY LOCAL /publication not authorized

New gate onlyexactVercelPreviewbranch; Production/defaultOFF. Missingstore→purePhoton,abort nofallback.52081omitted records guarded by namesonly; exactadmittedcities preserved/partialhomonymcoverage, no omittedcoords.7targetedPASS; full offline998PASS/0FAIL/1SKIP (actualdata separatelyPASS); changedsourcewebpackbuild/TS/lintPASS. ActualcurrentcoldHTTP490ms/p95warm19ms/RSS218MiB/NFT26.39MB. Moscow→SPb realAPI200/3.45s with standard Nodeproxyoptin; nativeECONNREFUSED is independenttransport, BRouter400 separate; pricingunknownunchanged. [Final checkpoint/source commits](checkpoints/2026-10-29-geonames-preview-READY-LOCAL.md), [publication handoff](../experiments/address-search/PREVIEW_PUBLICATION_HANDOFF.md). Remote fc83523d/PR14Draft unchanged; histories need ordinary replay from equalbaseTREE, neverforce. No push/Preview/CI/Production. Next separate publication+mandatoryCI+Preview-onlyflag authorization; actualVercelplan/hostedchecks remain pending.

## 29.10.2026 — excluded coverage protected without importing52081records

Coverage-only comparison finds57143omitted aliases/12027shared; hashed name-only guard prevents prefix substitution for omitted exact destinations, preserves admitted exact cities with partialcoverage metadata. Initial Mariupol guard regression fixed without weakening test.7focusedtests/TS PASS. [Checkpoint](checkpoints/2026-10-29-geonames-excluded-coverage-PASS.md). LocalPreviewgate+fallback safety retained; next narrow route transport diagnosis then changed-source build. No push/CI/Production.

## 29.10.2026 — Preview safety gate + local failure fallback fixed

Pilot now restricted to exact VercelPreviewbranch; Production cannot enable even with localtest override. Localproductiontests need GEONAMES_LOCAL_TEST=1. Missing/corruptstore falls back to purePhoton, abort does not invokePhoton.2newtestsPASS. [Checkpoint](checkpoints/2026-10-29-geonames-preview-safety-PASS.md). No push/Preview/CI/Production; next coverage check52081excludedIDs, no full revalidation.

## 29.10.2026 — bundled GeoNames/API/build/browser verified locally

169431point opt-in pilot now bundled in localGit with fullsource/CCBYattribution; visibleV3footerPASS. Newab95345runtimewebpackbuild/TS PASS; actualNFT/r+/suggest each25.49MB inclALL6220assets. FreshNext ready257ms/firstДоне487ms/warmHTTPp9520ms/RSS206MiB. [Final packaging checkpoint](checkpoints/2026-10-29-geonames-package-cold-PASS.md), [full handoff](../experiments/address-search/GEONAMES_V3_LOCAL_INTEGRATION.md). Search desktop/mobilePASS/no address mocks, PhotonoutageAPItest0external. One real route502 remains; actualVercelplan/deployment/fullofflinegate unverified. Four original blocks complete/two partial, no100%claim. DefaultOFF/no push/CI/Production. Next separate publication permission + gates/remotecompatibility, not another oldaudit.

## 29.10.2026 — immutable data packaging STARTED

Continuing independently:169431point data assets now localGit-staged, targetedNext tracing and visibleGeoNamesCCBYfooter added; module stillopt-in/defaultOFF. Package all-shard integrity testPASS, focused3APItestsPASS/TS. [Recovery checkpoint](checkpoints/2026-10-29-geonames-package-STARTED.md). Next newwebpackbuild+NFTinclusion/coldHTTP, not retry routeFAIL. No push/CI/Production.

## 29.10.2026 — GeoNames pilot works locally; one real routeFAIL

169431point opt-in actualV3API and desktop/mobile search/resetPASS; public defaultOFF. One requested realYaltaCrimea→SPb calculation502/5869ms: geocodingPASS,3routeproviders failed; no retry/rootcause speculation. [Full handoff/status4completed+2partial](../experiments/address-search/GEONAMES_V3_LOCAL_INTEGRATION.md), [checkpoint](checkpoints/2026-10-29-geonames-route-FAIL-handoff.md). Next immutable data inclusion/NFT+visibleCCBYattribution/coldHTTP verification; fullroute needs suitable evidence/environment. LOCAL only/no push/CI/Production.

## 29.10.2026 — production webpack build + new real GeoNames browser flow PASS

DirectNext16.3.4webpackbuild/TS PASS onNode24.19.0, standard config unchanged; Turbopack EPERM separately retained. Actual local production V3 desktop/mobile search/reset/preserve-other-field with169431point pilot PASS/no address mocks. Actual35localHTTPrequests p9536.91ms, RSS164MiB/HWM207MiB; code NFT7.46MB+external pilot18.04MB (NOT yet deployable tracing bundle). [Checkpoint](checkpoints/2026-10-29-geonames-webpack-browser-PASS.md). Single real route check pending; no full route success claim. Public pilot off by default/no push/CI/Production. Next inspect one-route result then local evidence handoff.

## 29.10.2026 — realAPI GeoNames local pilot implemented /169431records

Opt-in GEONAMES_LOCAL_PILOT=1 + GEONAMES_LOCAL_PILOT_DIR; default public behavior unchanged. Real GET/suggest+POST/r tested with admitted169431record subset,17cityqueries/0externalcalls including Donetsks/Volnovakha; mixed street query reaches mockedPhoton.3tests/TS/lintPASS; route input/geocode compatibilityPASS, full route/browser not yet checked. Handler profileRSS136MB/p95warm3.19ms (NOT full Next server); corpusdisk18.04MB. [Checkpoint/evidence/next](checkpoints/2026-10-29-geonames-real-api-pilot-PARTIAL.md). Supported webpack build pending; ordinary buildEPERM retained. Everything LOCAL/no push/CI/Production.

## 29.10.2026 —15control road points PASS /build sandbox BLOCKED

15/15new OSRM nearest checksHTTP200/Ok, raw/status/SHA retained, no Photon/toll audit. Source-city point identity comparison retained; nearest points do not certify complete routes. DirectNextbuild under supported require_escalated stillEPERM/exit1; no more unchanged retries. [Checkpoint/next step](checkpoints/2026-10-29-geonames-controls-and-sandbox-PARTIAL.md). Next derive restricted local-pilot corpus and opt-in realAPI integration, not certify all221512points. LOCAL/no push.

## 29.10.2026 — full structural validation DONE /194576candidates

Scanned221512rows; no duplicate IDs/invalid coordinates;194576structural candidates,26505unverified Russian names+431missing admin bindings quarantined by ID.3newtestsPASS. Semantic/roadaccess not certified. [Checkpoint and next step](checkpoints/2026-10-29-geonames-full-validation-DONE.md). LOCAL only/no push. Next15control nearest-point checks then bounded corpus admission/API work.

## 29.10.2026 — source-backed Russian display fix; admission still PARTIAL

Found generic compiler error: ru-tagged Latin alias could precede existing Cyrillic alias. Fixed source selection (no new translations/coordinates); full rebuild improves3048city titles/4701admin-label arrays, flags1462additional unverified names;221512IDs/coordinates/types/provenance unchanged.6Python testsPASS, all-row comparisonPASS. [Checkpoint/next steps](checkpoints/2026-10-29-geonames-display-alias-fix-PARTIAL.md). Corrected catalogSHA64b0af909e526c11e961da65106152ec4ed40511bcbfa8c5d998f759c4428c56; old profile data remains historical. No API activation before remaining data gates; current task LOCAL only/no push.

## 29.10.2026 — bounded GeoNames loader PASS / runtime admission PARTIAL

Reused existing index in immutable gzip shards:221512points, single resident shard/queue16; isolated19query parityPASS/0externalcalls,4loader testsPASS,TSexit0. FirstДоне93ms,Волноваха10ms; observed heap+16.7MB/RSS177MB; disk22.82MB. Fifteen explicit GeoNames-ID→Wikidata links and coordinate differences saved, not independent road-access certification. DirectNextbuild failedEPERM twice (default/network-permitted), not app defect established; no more unchanged retries. [Report/next steps](../experiments/address-search/LOCAL_GAZETTEER_INTEGRATION_REVIEW.md), [checkpoint](checkpoints/2026-10-29-geonames-shards-and-build-PARTIAL.md). Runtime/API and client unchanged; unresolved labels/coordinate-source admission prevent activation. Everything LOCAL/no push/CI/Preview.

## 29.10.2026 — GeoNames quality PARTIAL; integration not activated

Remote fc83523d confirmed, PR14 Draft. New bounded 15-name review finds all requested cities and preserves IDs/priority; 103 exact-name rows,77 unverified admin-label rows (including homonyms). PPL source types are settlements, not ADM centroids, but independent coordinate/road-access admission remains unconfirmed. One independent batch source returned503/curl22, no retry. 3 focused integrity tests/lint PASS. [Evidence and next step](checkpoints/2026-10-29-geonames-quality-PARTIAL.md). Current user authorizes LOCAL commits only; no push/CI/runtime activation. Next: bounded lazy loading/resource profile, then integrate only if data admission is established.

## 28.10.2026 — бесплатный offline-поиск: реальный прототип PASS / publicadmission PARTIAL

Собран универсальный GeoNamesRU+UA индекс221512активныхпунктов/456518aliases, без внешнегоAPI/ключа. Реальные ДонецкДНР→Ростов, Волноваха, Краснодар/Крым/4области находятся; омонимы сохраняютID. JSON42.76MB/gzip7.36MB; init1.80s, heap+207MiB/RSS509MiB, p95search2.54ms.6Node+3Pythontests/lintPASS. Но25043ruимени/31347adminподписей непроверены; корректностьвсехточек/полнота несертифицированы, интеграции нет. [Отчёт/лицензии/обновление](../experiments/address-search/LOCAL_GAZETTEER_PROTOTYPE.md), [checkpoint](checkpoints/2026-10-28-free-local-gazetteer-prototype-PARTIAL.md). Geoapifyнеобязателен/неизменён, платныхподключенийнет. ВсеизмененияLOCAL; remotefc83523d/PR14Draft.

## 28.10.2026 — обязательная бесплатная основа: local gazetteer STARTED

Новое решение: поискгородов не зависит от обязательного paidAPI; Geoapifyнеподключать/неизменять. Выбран исследовательский GeoNamesRU+UA локальныйиндекс; исходные24Octархивы восстановлены из существующихGitHubartifacts сSHAсовпадением, новыескачиванияGeoNames/старый93caseaudit не повторяются. OSMextract — альтернативный offlineисточник/дополнительнаяпроверка, безbulkdownload. [Выбор/лимитыпрототипа](checkpoints/2026-10-28-free-local-gazetteer-selection-STARTED.md). Runtime/publicadmission пока запрещены; далееfull-datasetcompiler/search/замеры. ВсеизмененияLOCAL/no publish.

## 28.10.2026 — B05.7/8: review-only fallback подготовлен, реальная приёмка BLOCKED

Добавлены изолированные fallback-admission-review.mjs/test: общийranker/polygons, честныеgeoapify-ID/непроверенные city-centres, план18+2с внутри20с,4запросаmax/stop429.6/6tests+lintPASS; реальныйdry-runбезключаBLOCKED_NO_CREDENTIALS/0вызовов. app/lib не менялись, e231637 сохранён, ничего не опубликовано. [Checkpoint](checkpoints/2026-10-28-address-fallback-review-prepared-PARTIAL.md), [точная Previewматрица/допуски](../experiments/address-search/B05_SERVER_FAILOVER_ACCEPTANCE.md). Нужны штатный scopedGeoapifyключ, разрешениеfreequota/source-review и позжеотдельная Previewпубликация. Ошибка16×502 и неизвестная инфраструктурная причина не закрыты.

## 28.10.2026 — B05.5/6: один Photon-origin, независимый fallback BLOCKED

Механически7вариантов→1origin, независимых runtime-провайдеров0; числофизическихинстансов неизвестно. Общийcooldown может исключить оставшиесяварианты. Точный инфраструктурный источник503/таймаутов неразличим по сохранённой агрегированнойтелеметрии; Vercel-ban/IPv6 не доказаны. Geoapifyresearch-адаптер есть, но ключа нет в процессе/Previewmetadata; Nominatimtypeahead запрещён, snapshotнеальтернатива. [CheckpointB05.5/6](checkpoints/2026-10-28-address-single-origin-and-fallback-BLOCKED.md). БезновыхPhotonзапросов/аккаунтов/публикаций. Далее review-only нормализация и boundedPreviewacceptance; runtimefallback не включать безреальныхисточников.

## 28.10.2026 — реальный Preview: адресная приёмка FAIL; новая cache-правка LOCAL

Проверен Previewfc83523d без моков: desktop/mobile по одному расчётуHTTP200, затем все16 запросов Донецка/Волновахи после очистки/повтора —502. Логи20002мс/budget:7. Независимые реальные проверки с ЯлтойКрым/СПб подтвердили сохранение второго поля при очисткеA/B на обоихviewport. Одна временная23чссылка отозвана, secretудалён; TLSпроверка не отключалась. Найдено закрепление частичных списков на5мин: подготовлены APIpartialflag+запреткэша partial+UIпередачаflag, локально5тестов/2browser/TS/lint/buildPASS. Ничего повторно не опубликовано, remotefc83523d/PR14Draft. [Полный checkpoint](checkpoints/2026-10-28-real-preview-address-FAIL-local-cache-fix.md). НедоступностьPhoton/503coverage остаются открыты; новая правка не объявлена решением полного отказа.

## 28.10.2026 — retry опубликован fc83523d; acceptance PARTIAL

Однократное разрешение использовано: точные деревья двух локальных коммитов сохранены в remote30c5afe7→fc83523d, readbackPASS/PR14Draft. Actions40740322418 overallSUCCESS: verify991/991+TS/buildPASS, timingPASS7391мс; live_probeFAIL на503/cooldown: ДонецкДНР первый, Ростовский омоним отсутствует вторым. Actions40740322659SUCCESS/18browserPASS. Новый localdesktop/mobile сценарий40заменPASS с моками. Previewfc83523dREADY, но реальная проверкаBLOCKED: auto-review запретил share-link без отдельного разрешения; обходов нет. Полный отказPhoton/503coverage не устранены. [Итоговый checkpoint](checkpoints/2026-10-28-address-retry-published-CI-PARTIAL.md). Эта итоговая запись пока LOCAL: дополнительная публикация не выполнена во избежание второго CI-обновления.

## 28.10.2026 — retry budget/CI: LOCAL PASS, публикация запрещена до согласования CI

Новые3/3 регрессии подтверждают остаток20с с учётом19с соединения/17с очереди и подавление позднего ответа после отмены. Подготовлен НЕ ЗАПУЩЕННЫЙ desktop/mobile сценарий20замен A/B. Точный разбор workflows: special-territory PR включает broad jobs; ручной build-only не предотвращает PR-событие. Старый локальный коммит8d362961 иpatch сохранены, remote8fb4d137 не менялся. Нужна отдельная узкая авторизация CI либо один обычный PR-run с broad jobs. [Checkpoint](checkpoints/2026-10-28-address-publication-gates-and-budget.md).

## 28.10.2026 — адресный connect-retry: LOCAL PASS / REMOTE PENDING

Подготовлен один повтор только UND_ERR_CONNECT_TIMEOUT в исходном20с deadline; отмена/HTTP/пустой ответ не повторяются.10/10 fetch и1/1 новой endpoint-регрессии PASS; TS/ESLint/directNextbuild PASS. Полный test:audit отклонён auto-review до исполнения. Публикация runtime запускает запрещённые без отдельного согласования broad live jobs; CI не менялся. Независимый провайдер, mobile/Preview и полный отказ Photon остаются открыты. [Checkpoint](checkpoints/2026-10-28-address-connect-retry-local-PASS.md). Это локальная запись, не заявление о remote-сохранении.

## 28.10.2026 — B01: реальный серверный отказ воспроизведён, FIX NOT DONE

Сеть Codex восстановлена штатным network.enabled=true. Публичные POST /r для Волновахи и Донецка успешны; промежуточный «Доне» дал 502 за20.38с. Vercel log подтверждает connect_timeout:2 + budget:5 при7 вариантах/20с. Это реальный серверный отказ соединения с Photon, не отсутствие города. 3/3 целевых тестовых файла PASS; UI/mobile/Preview и устойчивый независимый fallback ещё не проверены. [Evidence и следующий шаг](checkpoints/2026-10-28-b01-network-restored-live-reproduction.md). Runtime-код/Production не изменены; широкие live-проверки не запускались.

## 28.10.2026 — B01/V3 адреса: новая статическая диагностика, ИСПРАВЛЕНИЕ ЕЩЁ НЕ ВЫПОЛНЕНО

Пользователь воспроизвёл в публичной V3: Ялта→СПб (расчёт OK) → очистка A → Волноваха/Донецк ДНР (UI «Сервис поиска временно недоступен»), B сохранена. Восстановлена точная цепочка `AddressField → /r → api/suggest → collectAddressFeatures → Photon`. 7 URL на поиск, пул допускает только 2 одновременных, общий лимит20с; отдельный runtime-probe имеет тот же лимит20с. Подтверждена возможность тайм-аутов/частичной потери результатов при медленном провайдере; **конкретный публичный сетевой отказ пока не установлен**. Snapshot содержит Донецк, но нет Волновахи и отключён. B03 UI исправление уже присутствует. Доступ к GitHub Connector работает без git fetch через proxy. Все подробности, путь возобновления, известные ограничения CI и честный перечень непройденных проверок: [checkpoint B01 static trace](checkpoints/2026-10-28-b01-v3-user-address-failure-static-trace-DONE.md). Участок `lib/**` или тесты могут инициировать широкие live jobs в CI; не менять классификатор/не обходить его без разрешения. **Никаких app/lib/tests изменений или новой Preview; Production/main/PR14Draft сохранены. Следующий шаг — ограниченный offline reproduction/минимальный backend patch и допустимый штатный CI/Preview, затем реальный мобильный тест.**

## 28.10.2026 — безопасное восстановление 38/40 файлов ЗАВЕРШЕНО

В проверенную рабочую ветку опубликовано **38 из 40 файлов** восстановленного исходного Codex patch (37 текстовых? учитывать точное число: 36 текстовых + 2 двоичных). Коммит бинарных доказательств `7508ab852b5b8ad9452592f36e74fa57111e19e4` добавил `local-full-offline.log.gz` и `local-next-build.log.gz`, Git blob SHA точно совпали с исходным patch. Оба CI этого коммита `40677526634` и `40677526770` — SUCCESS; широкие live-проверки SKIPPED. **Два единственных непереданных файла:** `experiments/address-search/NEXT_STEPS.md` и `experiments/address-search/WORK_LOG.md` (предыдущий отказ защиты при передаче полного исторического содержимого); они не менялись и не обходились. Их новые сведения уже доступны в опубликованных независимых checkpoint и LOCAL_CONTINUATION_RESULT. Новый статус и дальнейшие действия: [полная сводка восстановления](checkpoints/2026-10-28-restored-codex-publication-STATUS.md).

## RESTORED TO GITHUB — 28.10.2026 (read this first)

Published safe portions of Codex local patch from checksum `2e4b3ddf01ddcb4167620d3c5e1435efaf649423aecc4b2d108fbd1a95220604` to **only** `fix/v3-missing-route-prices-2026-10-15` with verified source blob hashes and CI. Successful commits: `61f736eb4a111a9176bf00499ce646457bd64129` (B05 module + tests), `375baa6bb99db909d9fd10a594300f4d54a04481` (strict B11 CI + API parity tests), `c59fc7096f8bf3e34886be6f0f8883338639fbf6` (exact three-line B11 runtime optimization), `88cee7851c730fc09502b571427236137b96367e` (B01 metadata security fix, B06 M11 and B07/CKAD tests). Associated CI runs for these source commits verified SUCCESS; broad live jobs SKIPPED. **B11 working API branch updated, not Production**; B05 remains a nonintegrated working quote module (320/410RUB for approved M4 case, not a full trip); B01 still disabled without Geoapify key; B06–B09 product/physical gaps remain. Historical PRE-PUBLICATION local checkpoints below intentionally retain the original timestamps/status; they do not override this fresh state.

Two *previously security-denied* old historical files `experiments/address-search/NEXT_STEPS.md` and `experiments/address-search/WORK_LOG.md` were **not retransmitted/modified**, while the two binary `.log.gz` evidence files were subsequently published in commit `7508ab852b5b8ad9452592f36e74fa57111e19e4`. Do not bypass the prior denial or claim full 40/40 transfer. New independent checkpoint: [restoration summary](checkpoints/2026-10-28-restored-codex-publication-STATUS.md). PR14 stays draft, main/Production/Android/backup untouched. Next Codex: inspect actual HEAD and CI, verify B11 impact, safely design B05 integration with directional witness + product-level replacement (not additive +320), retain B01 external key blocker and exact B06–B09 outstanding facts. No repeated audits of 22 M4 routes/GeoNames/old snapshots.

## LOCAL continuation / security review BLOCKED —28.10.2026

B06 M11 component composition also verified locally: exactly one head plus one mainline component, with unresolved head blocking the combined amount; 4/4 focused tests pass. [Checkpoint](checkpoints/2026-10-28-b06-m11-composition-local-PASS.md). Physical 15–58 product binding remains partial.

B07 targeted context guard additionally verified locally: the16 matrix pairs requiring M12/CKAD registration context remain unknown in the runtime adapter. [Checkpoint](checkpoints/2026-10-28-b07-context-gate-regression-local-PASS.md). 6/6 focused subtests pass; B07 actual route allocation remains partial pending registration history.

LOCALfinalgate976/976+quotePASS/TS/scopedESLint0warnings/directNext16pagesPASS; Node24.19/source3de8469. [Resultmatrix](../experiments/address-search/LOCAL_CONTINUATION_RESULT.md), [gatecheckpoint](checkpoints/2026-10-28-local-continuation-gate-PASS.md). Noapp/lib/data/Androidchange/B11application/B05runtimeintegration/GitHubsave. Securitydispositionrequired; retainlocalpatches, noalternatewriter. ActualOperaB06–B09used; B07originalrecovered/0newpairs. B01metadatafix10PASS/no realkey.

B01localexperimentalmetadata-keyecho defect RED→FIXED10/10tests; safesourcefieldsretained. LiveGeoapifyBLOCKED_BY_EXTERNAL_CREDENTIAL/keyabsent, fallbackdisabled. [Checkpoint+mandatorygateSTARTED](checkpoints/2026-10-28-b01-metadata-local-PASS-gate-STARTED.md). Nextonefulloffline/TS/scopedlint/directNextbuild, no broadliveorAPIpatchpublication.

B09Operaoperatorpagesread; exactmapexplicitlytemporarilyunavailable/technicalworks. [Localreview](../experiments/tariff-proof-selection/B09_OPERA_LOCAL_2026-10-28.md). No cash/cardcalculatorselection/transponderpriceimport/newpairs; actualzone2/3entry/receiptconditions remainmaterial. NextB01adapter/key.

B08oneboundedsearch+actualOperaofficialCKADmapread: noexactGolitsynoway/chainagemapping. [Localreview](../experiments/tariff-proof-selection/B08_OPERA_LOCAL_2026-10-28.md). PublisherblockedplanNOTretried, nofreezero/newpairclaim. NextB09operatorzonebundle.

B07Operarecoveredprevious403originalAppendix3: directfirst/lastframe rule and120minuteM12/CKADproductallocationconditions retained. [Review](../experiments/tariff-proof-selection/B07_OPERA_LOCAL_2026-10-28.md). No originalbinarySHA/newframeIDs/fares; actual22Н-0239notР158. PARTIALforregistrationidentity/time, notdocumentage. NextB08boundedlead.

B06Operaactuallyused: officialM11labelsCKAD48/M1058/Tver149read; defaulttransponderpriceexcluded. [Localreview](../experiments/tariff-proof-selection/B06_OPERA_LOCAL_2026-10-28.md). Fullcash/cardcompositionstillmissing48→58headcharge/149exitcrosswalk, notcash-lanecertification.0newpairs. NextB07targetedofficialrules, nooldreplays.

B05approvedworkingcomponent implementedLOCALLY: northboundreviewed73.9kmcase320RUBThursday/410Saturdayreplay,5testsPASS+scopedlintclean. [Contract](../experiments/tariff-proof-selection/B05_ACCEPTED_WORKING_LOCAL.md), [checkpoint](checkpoints/2026-10-28-b05-accepted-working-local-PASS.md). Noapp/libintegration/wholetrippricedclaim; preserveotherroadsunknown and replace545coverage, neverappend320toaggregate. Oldarchivesunchanged. NextboundednewOperaB06–B09leads.

B11localfullAPIvariants3/3PASS aftercorrectingspecialtestfixtureYalta→DNR+branchassertion. SavedDonetsk12exactmockrequests/run/0misses/0network/bodyparity; singlehandlerpair3100→2015ms, notE2ESLA. [Checkpoint](checkpoints/2026-10-28-b11-api-variants-local-PASS.md). APIstillunchanged; noGitHubsave/CIforpreparation. NextB05acceptedworkingcase locally.

Freshremote702fcopy restored prior technicalCIpatch; originalAPIunchanged. Securityrefusalnotresolved/nopublicationretry. Ownerexplicitlyallowslocalindependentblocks, eachlocalcheckpoint/patch; noGitHubsavedclaim. [Recovery/sequence](checkpoints/2026-10-28-resume-security-BLOCKED-local-STARTED.md). New28Octworkingtruth+B05specific320RUBdecision accepted. NextB11fullAPIvarianttests, thenB05localmodule, boundedB06–B09/B01.

## B05 operator rule carry-forward / 517-km exit cross-check — 28.10.2026

**Официальное правило от26.12.2016 принято по решению владельца до новой редакции.** Прямой HTML прочитан через Opera. На север29,2 или73,9км по фактическому пути; сохранённая Тамань→Воронеж через5818209495 продолжает обход до развязки рядом с517км (OSM3057885096/5104; официальный узел517+808 не привязан напрямую к OSM). **73,9 км — сильный рабочий кандидат**, 320₽ Пн–чт /410₽ Пт–вс по приказу58 — **только условные суммы двух продуктов**, не real-priced-positive. B05 PARTIAL: ещё нужен операторский gate→bundle и точное terminal cut. `unknown/null` и runtime не менялись. [Полный разбор](../experiments/tariff-proof-selection/B05_2016_RULE_517_EXIT_REVIEW.md), [checkpoint](checkpoints/2026-10-28-b05-opera-rule-exit-DONE.md). Не повторять старый аудит.

## Experiment11 B01/B11 —28.10.2026

B11 duplicate territory analysis confirmed; isolated saved9046-point prototype1749→869ms median,3parity/faretestsPASS,0network. [Report/evidence](../experiments/address-search/EXPERIMENT11_B11.md), [checkpoint](checkpoints/2026-10-28-experiment11-b11-profile-patch-PARTIAL.md). Three-line patch saved only: publishing targetAPIfile would require prohibited broadliveCI, classifierconfirmed; no new exception authorized. Application unchanged/B11PARTIAL. B01 adapter9syntheticPASS, no provider credential/real coverage admission; no new functional closure. ParentCI40657065108/40657065144SUCCESS/widesSKIPPED.

B01: three providers reviewed; Nominatim autocomplete prohibited, Geoapify/DaData not operationally admitted. Default-off isolated Geoapify research adapter +9 synthetic tests, no public fallback/coordinates activated. [Review](../experiments/address-search/EXPERIMENT11_SOURCES.md), [checkpoint](checkpoints/2026-10-28-experiment11-b01-source-adapter.md). B01 PARTIAL; next B11 saved-stage review, no repeated B03/GeoNames/captures.

## B03 swap/refocus FIXED / hosted verified —28.10.2026

B01nexttask: actualproxy-awarelocalAnapa200→clear→DonetskRostov200flowPASS, selectedcoordinatesverifiedagainstclientPOST; partial503/cooldownpositivesretained. [Raw/status/limits](../experiments/address-search/checks/2026-10-28-proxy-live-flow/REVIEW.md), [checkpoint](checkpoints/2026-10-28-b01-proxy-live-flow-result.md). No backendcode/Production/fulloutageresilience/DNRcoverageorold502causalclosureclaim; B01stillPARTIALpendingindependentfallback. No furthersamequeryretests; B03remainspublished/CIgreen, snapshotfalse/expiryunchanged.

B01transportprobeactual200/20features/1128ms underNodeproxyopt-in, rawSHAretained; notold502causalprooforoutagefix. [Review](../experiments/address-search/checks/2026-10-28-proxy-transport/REVIEW.md). Next boundedactualAnapa→clear→Donetsk/rflowwithproxy-awarelocalserver, noappchanges; [STARTEDbudget/recovery](checkpoints/2026-10-28-b01-proxy-200-live-flow-STARTED.md). Classification/analyticsmocksseparate, newcoordinatesnotadmitted.

B01newindependenttransportSTARTED: one12sGETwithNode--use-env-proxy throughunchangedinheritedproxy; previousenvironmenthadproxyvarsbutopt-infalse. [Budget/recovery](checkpoints/2026-10-28-b01-node-proxy-STARTED.md). Notapp/outagefix, no sourceactivation or prior502closure; savebeforecall.

Publishedexact3linepatch; testedhead32038ec595ffacf2fe04b10c27f378c1579f1660. AllcurrentrunsSUCCESS, speciallive/timingSKIPPED;964/964offline+quote/TS/productionbuildPASS, legacy8+current10browserPASSincluding07. GreenZIPdownloaded/SHAverified/sourceSHA/exitcodesparsed. [DONEcheckpoint](checkpoints/2026-10-28-b03-ci-and-fix-DONE.md), [B12acceptancehandoff](contractor-brief/B03_B12_ACCEPTANCE_2026-10-28.md). OnlyAddressFieldruntimechanged; strictCIandNodecontractcorrected, no othercomponent/tariffs/Production. B01external502remainsseparate. Next boundedNodeproxyopt-intransportcheck underchangedcondition, no unchangednetworkretry.

PublishedAddressFieldfix hostedB03push+PRSUCCESS, specialSUCCESS/widesSKIPPED. UnexpectednormalofflineRoutequalityrun failedlatentNodecontract(1expectedvs2existingNode24jobs), NOTliveaudit; reproducedwithoutappchange. Strictcount/every-version/negativecontroltestfix nowprepared, B03verifyaddsactuallyfailedofflinegate beforeTS/build. [Checkpoint](checkpoints/2026-10-28-b03-unrelated-offline-gate-contract.md). RequireallnewCIgreenbeforedone; no othercomponents/routeworkflowchanged, B01external502untouched.

Stage1CI VERIFIED: specialverify/classifierSUCCESS+widesSKIPPED, B03push/PRofflineverifySUCCESS and actualnew07REDonoldcomponent. Exact3lineAddressFieldpatch nowappliedalone, sourceSHA5ece9b65matchespriorverifiedfix. [Stage2checkpoint](checkpoints/2026-10-28-b03-patch-published-STARTED.md), [stage1proof](../experiments/road-ref-boundaries/checks/2026-10-28-b03-ci/stage1-verified.json). Next remoteappreadback+actualhostedGREEN(current10incl07/legacy8/mandatoryverify), notyetclaimed. B01external502notfixed.

Actualhostedstage1new07RED confirmed(run40643922713, artifactSHAverified/archiveparsed); appstillunchanged. PushtransportdidnotemitPRspecialverify, so B03workflow nowmirrorsunchangedmandatoryofflineverify inownjob; originalworkflowunchanged. [Correction/evidence](checkpoints/2026-10-28-b03-ci-stage1-red-verify-gap.md). NeedverifyPASS+actualnewbrowserREDbeforeappPatch; no widejobsorB01closureclaim.

ExactAddressField exception+mixed/fail-open tests14PASS, B03PRheadbrowserworkflow now runslegacy8+new10including07swap/refocus; mandatoryspecialverify/TS/buildunchanged. ApppatchNOTyetapplied. [Stage1checkpoint/recovery](checkpoints/2026-10-28-b03-ci-exception-stage1.md). Firsthostednew07expectedRED onoldsource; inspectactualjobs/wideskips beforestage2patch. B01external502remainsseparate.

Latest B03/B01: actualcoldAnapa/r502, UIerror+retryvisible,7network_error/onePhotonorigin, DonetskNOT_RUN afterfirstfailure; no claimHTTP503/globaloutage. [Liveevidence+B01assessment](../experiments/road-ref-boundaries/checks/2026-10-28-b03-runtime/B01_LIVE_RESULT.md), [checkpoint](checkpoints/2026-10-28-b03-b01-live-result.md). B01noadditionalprovedruntimebug;0B01changes, independentapprovedsourcemissing. B03local3linefix10/10browser+TS/ESLint/NextbuildPASS, patchdurable but **remoteappunchanged**. Need ownerapproveexactAddressField-onlyCIexception before runtimepublish; no wideaudit/CIchange authorized. Newtariffpolicyconfirmed; snapshotdisabled/expiryunchanged.

Bounded liveaddresscheck STARTED: atmostАнапа→clear→Донецк throughactual/r+Photon,30s/query,no retry/routes; classification/analyticsmocked. [Recovery/budget](checkpoints/2026-10-28-b03-b01-live-address-STARTED.md). LocalB03patch savedandtested, runtimepublication stillneeds narrowCIpermission.

B03 LOCAL_FIX_VERIFIED / PATCH_SAVED pendingCIpermission:3line selected-stateclear fixes proven swap/refocus; newmockedbrowser10/10PASS, TS+targetESLintPASS, directNextproductionbuildPASS on modifiedlocalSHA. **Remoteappunchanged** because app/v2pushtriggersforbiddenbroadlive. [Patch/results/proposal](../experiments/road-ref-boundaries/checks/2026-10-28-b03-runtime/LOCAL_FIX_REVIEW.md), [checkpoint](checkpoints/2026-10-28-b03-local-fix-verified-patch-saved.md). OriginalexternalB-onlyincidentnotclaimedfixed. Next boundedliveaddresses/B01offline, not broadserveraudit.

B03 swap/focus defect REPRODUCED: currentmockedChromium suite6PASS/1FAIL/3NOT_RUN. SwappedB shows correctnewvalue/coords but refocus reopensoldAnapa dropdown. OriginalAnapa→clear→DonetskPASS with mocks, externalincidentnotclaimedfixed. [Checkpoint](checkpoints/2026-10-28-b03-swap-focus-reproduced.md), [baseline](../experiments/road-ref-boundaries/checks/2026-10-28-b03-runtime/baseline.json). Next localminimalfix/regression+portablepatch; runtimepushblocked by confirmedapp/v2→broadliveCI conflict, no unauthorizedCIweakening.

Browser RECOVERED under changed standard commandnetworkgrant: Chromium154page+DOMPASS, previousdefaultEPERM preserved. [Checkpoint](checkpoints/2026-10-28-b03-browser-grant-recovery.md), [evidence](../experiments/road-ref-boundaries/checks/2026-10-28-b03-runtime/browser-grant-recovery.json). Next currentmockedB03suite. Publishing app/v2 or lib fixes currently triggers prohibited broadliveCI; do not weakenCI or publishruntimeblindly.

Local preflight BLOCKED: Chromium154/Playwright1.57process started then CrashpadsetsockoptEPERM/SIGTRAP beforepage;0currentbrowsercases,0externalcalls, noNextstartup. [Evidence](../experiments/road-ref-boundaries/checks/2026-10-28-b03-runtime/preflight.json), [checkpoint](checkpoints/2026-10-28-b03-browser-preflight-BLOCKED.md). No unchanged retry/app workaround. Next narrow hosted-ready newcases + B01offline; swap/focus suspicion remainsunconfirmed.

Clean verified75d55b8a checkout; PR14Draft/CI40585215716SUCCESS. [Browser plan/recovery](checkpoints/2026-10-28-b03-browser-STARTED.md): one Chromium preflight, new current UI cases including swap/focus and503/429, then minimal proven fixes and independentB01. Previous eightfallback UItests/experiments1–9 not repeated. New tariff carry-forward policy read/accepted; B05product-binding stillunknown.

## B05 — цены из последнего доступного документа приняты, границы начисления всё ещё PARTIAL

[Применение решения к реальным данным](../experiments/tariff-proof-selection/B05_PRICE_BASIS_REVIEW.md) · [машиночитаемые ячейки](../experiments/tariff-proof-selection/B05_ACCEPTED_PRICE_BASIS.json). Приказ М4 №58, категория I, 517–544: 140/160 ₽; 544–589: 180/250 ₽. Эти цены **считаются принятой последней редакцией**, без дополнительного ожидания обновления. По Тамань→Воронеж через5818209495 неизвестен **набор реально оплачиваемых продуктов**, а не их опубликованные суммы. Полная цена всё ещё `unknown/null`; ничего не внедрено. Далее B03 QA.

## Решение владельца 27.10.2026 — последнее тарифное свидетельство принимается до замены

**УТВЕРЖДЕНО / DOCUMENTED:** [политика источников цен](TARIFF_SOURCE_POLICY.md) и [checkpoint](checkpoints/2026-10-27-tariff-source-carry-forward-DONE.md). Последняя доступная официальная редакция тарифа применяется вперёд без искусственного срока истечения, пока не обнаружена более новая. Не считать цену `unknown` лишь из-за возраста приказа. Не переносить новую редакцию на даты до вступления в силу. Физические тарифные концы и правила выбора одного/двух продуктов остаются обязательными.

**B05:** приказ М4 №58 — принят как последняя имеющаяся денежная основа; проблема поездки Тамань→Воронеж пока в **идентификации оплачиваемого набора продуктов/учёте повторной оплаты**, а не в «истекшей свежести цен». Эксперимент №9 и его тесты не изменены, публичная сумма всё ещё `unknown/null`. Никакого live-кода/матриц/Production не изменялось.

# Unified reliability queue — 27.10.2026

Experiment9 research complete / B05 PARTIAL: historical route-conditioned545collection supported; one realTaman→Voronezh history+9testsPASS,0new fulltariffpairs/prices. [Result/10answers](../experiments/tariff-proof-selection/EXPERIMENT9_RESULT.md), [NOT_SENT operator question+scheme](../experiments/tariff-proof-selection/M4_545_OPERATOR_REQUEST_DRAFT.md), [checkpoint](checkpoints/2026-10-27-experiment9-result-operator-draft.md). Missing dated collection/physicalendpoint/priorpayment rule cannot be manufactured from OSMtoll or another router. Next owner-reviewed operator request/newdocument; no tariff/app changes.

Experiment9 realcase9 history DONE / B05 PARTIAL: saved Тамань→Воронеж sourceSHAverified; lastchunk35–42 proves arrival/gate5818209495,43–71 bypass-side continuation→Р298. Isolated evidence inspector9/9testsPASS; no fullcurrent product/price admitted. [Review](../experiments/tariff-proof-selection/M4_545_REAL_ROUTE_HISTORY.md), [checkpoint](checkpoints/2026-10-27-experiment9-real-route-history.md). Missing dated operator collection/endpoint/no-double-payment proof; matchedshapeindices notOSRMindices. Next NOT_SENT operator question, no router calls.

Experiment9 operator review DONE: historical2016text supports route-conditioned545 one/two-product choice; Moscow wording is less exhaustive. October2026collection rule UNKNOWN. Origin403/partialtimeout, indexed official texts explicitly distinguished. [Sources/limits](../experiments/tariff-proof-selection/M4_545_ROUTE_COLLECTION_SOURCES.md), [checkpoint](checkpoints/2026-10-27-experiment9-operator-sources.md). Next one saved5818209495 route before/after, no captures/oldtests.

Experiment9 STARTED: new2016operator explanation + TPassindex, then one retained target545 route history. [Budget/recovery](checkpoints/2026-10-27-experiment9-STARTED.md). No new tariff admission; experiment8geometry reused, not repeated.

Experiment8 directed545 review DONE / B05 PARTIAL: main241–244 and alternative86–87 read; target5818209495 is northbound southern bypass-side cash branch, distinct from northern3504914294 and old-road9620416636. One document-supported geometry cross-reference,0new full tariff pairs/prices. Lane→517–544/544–589 collection bundle,589endpoint and current-date fare remain BLOCKED_BY_DATA. [Evidence](../experiments/tariff-proof-selection/M4_545_ENGINEERING_CROSSWALK.md), [checkpoint](checkpoints/2026-10-27-experiment8-directed-545-review.md);5/5geometry testsPASS, no runtime changes. Next operator lane/product rule, not downloads/22route replay.

Experiment8 ORIGINALS ACQUIRED HTTP200: main38525744bytes/245pages, alternative11840573bytes/87pages; SHA/cover/integrity in [manifest](../experiments/tariff-proof-selection/M4_PODD_ACQUISITION.json), [checkpoint](checkpoints/2026-10-27-experiment8-originals-acquired.md). Locally/tmp/m4-podd-exp8.FSZfcc, originalsunchanged/notuploaded. Nextimmediatevisualmain242–245/alternativeend; noC/Dyet, 2023planisnot2026tarifffreshness. Appunchanged.

Experiment8 inventory DONE/download STARTED: targetsnotfound in inspectedprojectpaths/reachablePDFhistory/Driveexactnames; two oldM4PDFs verifiedas tariff/rules, notplans. [Inventory/limits](../experiments/tariff-proof-selection/EXPERIMENT8_INVENTORY.md), [download checkpoint](checkpoints/2026-10-27-experiment8-inventory-download-STARTED.md). Nextordinaryproxieddownload2officialoriginals, bounded; ifsuccess immediatelyselected545leaves. No app/tariffchanges.

Experiment7 PARTIAL: actualM12reversebranchdocumented, suppliedМ7chainnotР158, westernframes0/3operatorIDs;0newC/D/prices. B05newofficialPODDindex+2exactoriginalleads found, leafinspectionblockedbyreader38.5MBlimit/timeout/browserreauth (no bypass). [Result](../experiments/tariff-proof-selection/EXPERIMENT7_RESULT.md), [manifest](../experiments/tariff-proof-selection/M4_PODD_SOURCE_MANIFEST.json), [outcome](checkpoints/2026-10-27-experiment7-m4-podd-outcome.md). Nextexact545leaveswithworkingordinaryviewer/ownerextract, not repeatedsearch. Appunchanged.

Experiment7 B05STARTED: new officialPODDcategory separates mainline464–546 and alternative517–544 plans, dated13.03.2025. [Recovery/budget](checkpoints/2026-10-27-experiment7-m4-podd-STARTED.md). Next bounded originalplanleaf inspection after save; no C/Dorprice yet. No app/tariff changes.

Experiment7 M12directionreview: actualreverseentry uses1550561306via22Н-0226, not reversalofforwardexit1550561305. Three westernframesstill0/3operatorIDs; indexedfreeflowrulesfirst/lastregistrationlead, originals403. [Evidence](../experiments/tariff-proof-selection/M12_DIRECTIONAL_REGISTRATION_REVIEW.md), [checkpoint](checkpoints/2026-10-27-experiment7-m12-direction-registration.md). NoC/Dornewprice; nextB05directed545source. Prioroverpreciselegalrowsequenceexpresslywithdrawn.

Experiment7: two legal originals inspected,421row omitted in2624-р but no physicalclosure proved;442Р-158retained. Supplied972809728chain actuallyМ-7, notР-158. [Comparison](../experiments/tariff-proof-selection/M12_2624_SOURCE_COMPARISON.md), [checkpoint](checkpoints/2026-10-27-experiment7-m12-government-identity.md). No newC/Dpair or price; next actualР-158savedtrace/freeflow operator mapping.

Experiment6 PARTIAL: M11draftNOT_SENT; ZSDcollection constraints/access naming refined but64Epayment bundle unproved; B08bounded new-source lead no exact plan. [Result/counters](../experiments/tariff-proof-selection/EXPERIMENT6_RESULT.md), [checkpoint](checkpoints/2026-10-27-experiment6-b08-source-lead-result.md). New fullpairs/usableamounts/functionalclosures0;1new municipal notice,0new original tariffPDFs. Next new ownerZSDbundle or B07framecrosswalk; B07/B05not re-audited. App unchanged.

Experiment6 ZSD PARTIAL: retained2026rules and new focused no-double-payment exception reviewed; new municipal notice distinguishes Макарова/Намывная approaches. Exact64E→933975069 payable-zone bundle still missing,0new priced pairs. [Review](../experiments/tariff-proof-selection/ZSD_EXPERIMENT6_SOURCE_REVIEW.md), [checkpoint](checkpoints/2026-10-27-experiment6-zsd-cash-card-scope.md). Next independent B08primary boundary lead; no app changes.

Experiment6: M11temporarily DEFERRED; [operator request draft](../experiments/tariff-proof-selection/M11_OPERATOR_REQUEST_DRAFT.md) prepared, NOT_SENT. Official ОССП contacts and СЗКК/M11 form verified; Avtodor contact access failed, no guessed address. [Checkpoint](checkpoints/2026-10-27-experiment6-m11-operator-draft.md). Next priority ZSD/B09 existing geometry + new/current primary rules; no58km repeat.

Experiment5 PARTIAL: virtual interface documentary existence confirmed; all3routes screened, no certified directed cut or eligible new fare. Independent M3lead exhausted4new searches without primary evidence; retained-status checks PASS. [Result/8answers](../experiments/tariff-proof-selection/EXPERIMENT5_RESULT.md), [checkpoint](checkpoints/2026-10-27-experiment5-result-m3-lead.md). New located boundaries/fullpairs/components0; app unchanged. Need dated operator interface plan or independently named alternate-exit record; no repeat of completed source checks.

Experiment5 route/method analysis: all3saved routes pass58km locality in correct directions, but no official graph cut is located. Earlier CKAD entry does not exclude a virtual58→147 component. No detector or fare admitted; methodsB/C need certified section partition. [Evidence](../experiments/tariff-proof-selection/M11_VIRTUAL_ROUTE_REVIEW.md), [checkpoint](checkpoints/2026-10-27-experiment5-three-route-methods.md). Next independent M3 primary-source lead; app unchanged.

Experiment5: operator2024/2022rules confirm virtual15–58↔Section1 interface;2024explains absence of physical mainline boundary plazas. Exact directed position remains unproved; inventory already knew this interface, new located boundaries0. [Comparison](../experiments/tariff-proof-selection/M11_VIRTUAL_BOUNDARY_RULES.md), [checkpoint](checkpoints/2026-10-27-experiment5-virtual-rules.md). Next saved directed path and method comparison; no runtime change.

Experiment4 reciprocal control: observed6588472832 is M10→M11 entry; prior6588472831 is exit. Moscow→Тверь actually uses unidentified12007034961, so city labels are not reciprocal tariff proof. [Evidence](../experiments/tariff-proof-selection/M11_DIRECTION_CONTROLS.md), [checkpoint](checkpoints/2026-10-27-m11-reciprocal-route-control.md). Total2 new directed cross-references /0new full tariff pairs;58km mainline boundary proof still missing. Runtime unchanged.

Experiment4 M4 PARTIAL: exact452-point saved vector excludes both retained1093 booths. New operator page confirms1091.6–1119.5 scope and undated150/150, not an eligible October fare. Official chainage/charging link for Platov→Р-260 still missing. [Evidence](../experiments/tariff-proof-selection/M4_PHYSICAL_SCOPE.md), [checkpoint](checkpoints/2026-10-27-m4-vector-scope-exclusion.md). No newly priced component; next saved full M11 traversal.

Experiment4 M11 PARTIAL: retained trace binds booth6588472831/way1307036920 to M11→M10 exit; full Пешки→Тверь remains blocked by directed58km entry proof. Current saved order274 cells610/750 differ from lower-priority overview750/770. [Crosswalk](../experiments/tariff-proof-selection/M11_PHYSICAL_CROSSWALK.md), [checkpoint](checkpoints/2026-10-27-m11-directed-exit-crosswalk.md), [next](../experiments/tariff-proof-selection/NEXT_STEPS.md). No runtime or tariff change.

Experiment3: requested M11 PDF already retained; hash and visual original confirmed. Five selected real monetary rows M11/M4 revalidated, zero new complete physical pairs. M4 original1093 reads150/150;545 split starts544. [Evidence](../experiments/tariff-proof-selection/real-document-review.json), [checkpoint](checkpoints/2026-10-27-real-tariff-originals.md). Incomplete mappings remain unknown; no tariff edits.

Experiment2 official-source follow-up: six URLs reviewed for M4 pending pair,545 scope and M11 Пешки–Тверь lead. Separate M11 tariff authorities confirmed; Road Invest page does not cover Aksay and1093 extracted rows conflict. Zero new admissible pairs/amounts. [Source review](../experiments/tariff-proof-selection/operator-source-review.json), [checkpoint](checkpoints/2026-10-27-composition-operator-sources.md). Need original dated tariff attachment and endpoint crosswalk.

Experiment2 composition: immutable admitted registry/policy and bounded exact-cover prototype; ten named synthetic cases, one test-file aggregate PASS. No real fares admitted. [Analysis](../experiments/tariff-proof-selection/COMPOSITION.md), [checkpoint](checkpoints/2026-10-27-tariff-independent-composition.md). Next official-document research M4/M11; public algorithm untouched.

Experimental B04/B10: isolated tariff-proof selector compares full operator pair versus additive-chain witnesses and rejects partial/conflicting coverage. Saved M4 pending vector remains unknown. Focused tests PASS; no app integration. [Experiment](../experiments/tariff-proof-selection/README.md), [checkpoint](checkpoints/2026-10-27-tariff-proof-selection.md). Next: cross-road composition with immutable source/context proofs.

B02 second batch: eight more IDs in Chernihiv/Sumy/Kharkiv investigated; two KATOTTG locality pages read but no independent coordinate/GeoNames linkage. Total15 AMBIGUOUS, zero new runtime entries. [Batch02](../experiments/road-ref-boundaries/checks/2026-10-27-independent-settlements/batch-02.json), [checkpoint](checkpoints/2026-10-27-settlements-batch-02.md). Thirteen collision groups remain unprocessed.

B01–B02 functional continuation: first seven requested GeoNames IDs researched; seven AMBIGUOUS pending independent coordinate/ID proof. New municipal source and legal-source access failures recorded in [batch01](../experiments/road-ref-boundaries/checks/2026-10-27-independent-settlements/batch-01.json). [Checkpoint](checkpoints/2026-10-27-settlements-batch-01.md). No active fallback or tariff changes.

Latest validation: block23 DONE on Actions run40479628024, source SHA `ea80282643f67886bd6486610a291ca8cffc05ce`, tree `2102cb20b95af94cbe1f986bfe9d2c012faeb79e`. Node24.21.0, Next16.3.4, 458+10+4 tests, TypeScript and production build PASS. Classifier selected no live scope; `live_probe` and `calculation_timing` SKIPPED. [Checkpoint](checkpoints/2026-10-27-1245-block-23-hosted-build-DONE.md). Technical plan24/24 (100%); functional B01–B12 data blockers remain separate. [Final report](RELIABILITY_24_BLOCK_FINAL_REPORT.md).

Latest block20 DONE for bounded offline profiling: both saved Eisk/Maykop provider JSON responses were profiled through route parse/decode/validation/evidence derivation (0 network), matching saved geometry SHA/count. Four computation-stage result hashes also match across saved route profiles. Microbenchmark and scope limitations recorded. [Checkpoint](checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md). Progress22/24 (91.67%).

Historical block18 DONE: three scoped offline composition/route-boundary test files PASS for M4/A289, M11, M12 and CKAD unknown/duplicate/direction/date boundaries; mocked provider fetch only, no live route claims. [Checkpoint](checkpoints/2026-10-27-0430-block-18-road-composition-DONE.md). See the current 24/24 technical-plan status above; later blocks21–24 were completed in subsequent entries.

Block21 DONE: corrected temporary strict config reports zero diagnostics across `scripts/**/*.ts` and `lib/**/*.test.ts`; app `tsc --noEmit`, targeted tests, scoped ESLint and diff checks PASS. The initial three `RequestInit.next` findings were config-only and removed by including Next ambient declarations. No CI gate added. [Final checkpoint](checkpoints/2026-10-27-1130-block-21-scripts-typecheck-DONE.md) · [initial evidence](checkpoints/2026-10-27-0352-block-21-typecheck-BLOCKED.md). Progress22/24 (91.67%).

Unexpected hosted run on the prior readback SHA: run40469828321 overall SUCCESS (`verify`, `calculation_timing` PASS), but tolerated `live_probe` failure. Geometry probe PASS; address collector Ростов/Красн PASS and Донецк SOURCE_UNAVAILABLE (HTTP503/cooldown, 0 features); 50-settlement/Yandex steps SKIPPED. Artifact12718511135. Do not rerun without a new reason.

Latest block16 DONE: audited app-side diagnostics and corrected a production V2 error boundary that exposed raw exception/digest despite “test-only” label. Production hides details; browser console gets only structured digest. Development retains troubleshooting copy. Focused test-first render2/2, TypeScript, scoped ESLint and diff PASS. [Checkpoint](checkpoints/2026-10-27-0340-block-16-diagnostics-privacy-DONE.md). Technical19/24 (79.17%):1–17,19,22. Next block21 scripts/tests typecheck review; blocks18/20 remain open/partial.

Latest block15 DONE: route fetch cache URLs vary by coordinates/provider options, TTL21600s. Photon uses exact-URL singleflight/cache, positive-only5min LRU128, per-origin cooldown and subscriber-safe cancellation; address cache normalizes query with5min LRU128. Three mocked cache/fetch suites PASS; no defect or code change. [Checkpoint](checkpoints/2026-10-27-0322-block-15-cache-review-DONE.md). Technical18/24 (75%):1–15,17,19,22. Next block16 structured diagnostics/privacy review. Block20 remains PARTIAL.

Latest block14 DONE: a mocked Valhalla transport timeout does not suppress a valid faster OSRM route; asserts selected ETA/provider. Existing cases cover invalid candidates, equal ETA, unknown pricing and incomplete geometry. Route-selection + pipeline suites, TypeScript, scoped ESLint and diff PASS; no network. [Checkpoint](checkpoints/2026-10-27-0314-block-14-provider-fallback-DONE.md). Technical17/24 (70.83%):1–14,17,19,22. Next block15 cache key/TTL/isolation review. Block20 remains PARTIAL.

Latest block13 DONE: current V2 source plus saved B10 fetch logs show no unnecessary exact duplicate requests: Eisk32/32 and Maykop36/36 unique `(method,URL,body)` keys; candidate routing fan-out and conditional Valhalla fallback are intentional. No code changed or network rerun. [Checkpoint](checkpoints/2026-10-27-0301-block-13-provider-request-counts-DONE.md). Technical16/24 (66.67%):1–13,17,19,22. Next block14 fallback/candidate correctness with existing mocks. Block20 remains PARTIAL.

Latest block11 DONE: Valhalla/OSRM/BRouter responses are streamed and capped at8MiB; empty, malformed, interrupted, or oversized bodies fail as sanitized upstream errors. Empty/invalid route geometry is rejected. Cap is >12x largest retained B10 body (652,899 bytes). New focused tests, API error mapping, tsc, scoped ESLint and diff PASS. No live calls. [Checkpoint](checkpoints/2026-10-27-0252-block-11-provider-response-bounds-DONE.md). Technical15/24 (62.5%):1–12,17,19,22. Next block20 offline profiling follow-up; it remains PARTIAL.

Latest block10 DONE: `/api/collect` webhook POST has an8s abort deadline and no retry. Mocked timeout confirms one call, abort, safe502 message and no provider details. Webhook/bounds suite3/3, tsc, ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0245-block-10-webhook-deadline-DONE.md). Technical14/24 (58.33%):1–10,12,17,19,22. Next11 router response size handling; real response evidence only.

Latest block9 DONE: `/api/collect` now shares a16KiB bounded streamed object parser and returns400/413 before webhook on bad input. Fixed Cyrillic street/house filter that leaked street names into webhook regions; coarse city/region retained. Unknown toll accepted only as null and never forwarded as a tariff. Privacy/API tests2/2, body-limit tests2/2, tsc/lint/diff PASS. [Checkpoint](checkpoints/2026-10-27-0244-block-9-collect-DONE.md). Technical13/24 (54.17%):1–9,12,17,19,22. Next10 webhook deadline. Webhook timeout not yet changed.

Latest block8 DONE: shared V2/V3 endpoint validation caps route labels at256 Unicode code points. Oversized label returns400 before any provider request; exact256 including emoji boundary passes. Focused label/API tests, tsc, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0242-block-8-label-bounds-DONE.md). Technical12/24 (50%):1–8,12,17,19,22. Next9 `/api/collect` bounds. No route/business semantics or normalization changed.

Latest block7 DONE: V2/V3 request body parsing capped at16KiB using streamed byte counting (not only `Content-Length`). Oversized declared/actual bodies return413 before provider calls; malformed JSON and non-object JSON return400. Focused body tests2/2; V2/V3 API, safe error and trace integration suites PASS; tsc, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0240-block-7-request-size-DONE.md). Technical11/24 (45.83%):1–7,12,17,19,22. Next8 string bounds. No broad audit/build/Actions.

Latest block6 DONE: focused mocked V2/V3 integration suites confirm input/output contracts, V2 special/ordinary route shapes, V3 single-fast-route schema, sanitized 400/502/500 mapping, and partial-trace unknown/null propagation. Four suites PASS; no contract defect reproduced and engines remain separate. [Checkpoint](checkpoints/2026-10-27-0237-block-6-api-contracts-DONE.md). Technical10/24 (41.67%):1–6,12,17,19,22. Next7 body-size bounds. No broad audit/network/build/Actions.

Latest block5 DONE: V2 reset now clears errors and manual input; late route response/copy completions cannot overwrite newer/reset state, and clipboard rejection is handled safely. V2 lifecycle suite9/9, V3 hook suite8/8, TypeScript PASS; ESLint0 errors/1 existing warning. [Checkpoint](checkpoints/2026-10-27-0236-block-5-v2-races-DONE.md). Technical9/24 (37.5%):1–5,12,17,19,22. Next6 API request/response contracts. No hosted B03 rerun, full build or Actions.

Latest block4 DONE: V2/V3 request UIs no longer show arbitrary network/internal exception strings. New shared tagged error helper preserves safe HTTP 400/500/502/504 and invalid-response messages; unexpected errors use a generic retry message. Mocked retry, malformed JSON, abort/unmount and stale response checks pass. V2 hook5/5; V3 hook8/8; API contract suite, tsc, scoped ESLint (0 errors, 1 existing `analyticsVersion` warning) and diff check pass. [Checkpoint](checkpoints/2026-10-27-0234-block-4-ui-errors-DONE.md). Technical8/24 (33.33%):1–4,12,17,19,22. Next block5 cancellation/races. No full build/Actions.

Latest block3 DONE: V3 unknown/null. Added contracts: `unknown` requires null amounts; contradictions such as `pricingStatus: unknown` with a zero amount are rejected; explicitly free remains separate. Shared fastest-route SSR stays base-only and copied quote preserves unknown status. No application defect reproduced. Focused response/copy/render tests, TypeScript, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0231-block-3-v3-unknown-DONE.md). Technical7/24 (29.17%):1,2,3,12,17,19,22. Next block4 UI errors. Block20 profile PARTIAL. No full build/Actions.

Latest block2 DONE: V2 unknown/null SSR and helper checks. Manual toll with unknown provider amount now displays the calculated manually labeled total without the contradictory “full total not calculated” notice; provider status remains explicitly unknown. Focused render2/2, presentation+unmount suites PASS; `npx tsc --noEmit`, scoped ESLint, `git diff --check` PASS. [Checkpoint](checkpoints/2026-10-27-0228-block-2-v2-unknown-DONE.md). Technical6/24 (25%):1,2,12,17,19,22. Next block3 V3 contract. Block20 profile still PARTIAL. No full build/Actions.

Latest practical sprint result: call-local recovery endpoint cache, long-fixture median30.72→17.17ms; all16 measured operation hashes unchanged, positive/partial recovery regression files+tsc+ESLint PASS. Checkpoint2026-10-27-recovery-endpoint-cache-DONE.md. Block20 profiling remains PARTIAL (missing stage/fixture coverage), technical5/24. Next2/V2 unknown presentation; then3/V3, UI errors/API guards. No broad CI/build run.

Sprint block20 PARTIAL: reproducible offline profile and baseline saved (scripts/offline-computation-profile.mjs, docs/codebase-audit/computation-baseline.json). Technical remains5/24. Saved9433point route: recognition median61.28ms,recovery30.72ms. Next test call-local recovery endpoint memoization with output parity; coverage gaps explicit in baseline/checkpoint.

Latest technical5/24 (20.83%): block22 selective-CI review saved, classifier10/10 PASS. Cumulative runtime changes since last checked baseline explain docs-triggered live jobs; pending-runtime accounting remains necessary before safely narrowing this further. No CI config changed, no live run started. Next20 offline profiling.

Latest DONE4/24 (16.67%):1,12,17,19. Eisk delta explained exactly by13-PVP sum4920/6770 versus V3 endpoint-cell4340/5240; no tariff changes. Evidence docs/codebase-audit/EISK_COMPONENT_ANALYSIS.md. Next22 CI saved metadata.

Latest: technical DONE3/24 (1,12,17). Block12 geocode deadline25s implemented; timeout maps to GEOCODE_UNAVAILABLE, first-feature selection and supplied coordinates preserved. Two mocked tests, TypeScript/scoped ESLint PASS. [Checkpoint](checkpoints/2026-10-27-geocode-deadline-DONE.md). Next19/B10 saved Eisk component attribution. B01 remains partial.

Original 24 definitions restored: [plan](RELIABILITY_24_BLOCK_PLAN.md), DONE2/24 (1,17); exact B crosswalk recorded. Missing-plan blocker resolved. Next block12/B01 deadline. Earlier UNKNOWN/24 notes below are historical.

[Unified work order](UNIFIED_RELIABILITY_PLAN.md): B01–B12 reconciled with completed fixes; 4 actionable directions, 7 data blockers, 1 environment blocker, 0 broadly fully closed directions. The original numbered 24 technical blocks are absent from available context/repository; technical count UNKNOWN/24, awaiting source definitions. Next concrete work: B01/AUD-GEOCODE-01 direct geocoder deadline. [Checkpoint](checkpoints/2026-10-27-unified-plan-reconciliation-DONE.md). Previous completed stages below remain historical evidence.

# CODEBASE AUDIT FIXES — FOLLOW-UP DONE — 27.10.2026 00:54 МСК

Follow-up 4/4 complete. По одобрению пользователя исправлен V2 corridor recovery: приблизительный subtotal больше не публикуется как полная стоимость; без независимого route-wide тарифа итог `null`/`unknown`, recovery subtotal и участки доступны в `fast.tollDiagnostics.corridorRecovery` при diagnostics mode. Неполная trace не получает мягкие matched thresholds; числовые M4/M12 пороги не менялись. Независимо составленная полная route price остаётся `priced` при partial trace. Подтверждённые продуктовые расчёты, тарифные значения, геометрия и выбор быстрейшего маршрута не менялись. Focused tests (5 файлов), TypeScript, scoped ESLint и diff check PASS. Полный build/массовый audit и hosted CI не запускались по узкой задаче/ограничению не повторять аудит. Три effectiveFrom остаются UNKNOWN до первичных документов: [перечень](codebase-audit/AUD-DATA-01-UNKNOWN-EFFECTIVE-DATES.md). [Решение](codebase-audit/AUD-TRACE-RECOVERY-DECISION.md), [checkpoint](checkpoints/2026-10-27-0054-aud-trace-recovery-fix-DONE.md), [WORK_LOG](codebase-audit/WORK_LOG.md), [NEXT_STEPS](codebase-audit/NEXT_STEPS.md). Branch fix/v3-missing-route-prices-2026-10-15, PR14 Draft; проверять exact remote readback после commit.

Все четыре P2 code-fix блока завершены (4/4, 100% нового плана исправлений); обе evidence-проверки завершены (2/2). AUD-DATA-01 остаётся BLOCKED_BY_DATA по датам тарифов; AUD-TRACE-RECOVERY-01 выявил риск V2 при неполной trace, но recovery/business rules не менялись. Неплановые run40394972858 и40396491540 из-за stale cumulative CI baseline запускали live geometry/address checks; address probe завершился SOURCE_UNAVAILABLE, 50-settlement/Yandex jobs skipped. Не повторять. [Trace evidence](codebase-audit/AUD-TRACE-RECOVERY-01.md). Не менялись суммы/effectiveFrom или правила восстановления. PR14 Draft. Последний checkpoint [AUD-TRACE-RECOVERY-01](checkpoints/2026-10-26-233224-aud-trace-recovery-01-DONE.md); журнал [WORK_LOG](codebase-audit/WORK_LOG.md), план [NEXT_STEPS](codebase-audit/NEXT_STEPS.md).

# CODEBASE AUDIT — DONE — 26.10.2026 21:39 МСК

**New audit plan: 18/18 blocks (100%).** This is completion of the bounded static audit only, not project readiness. No application/business/tariff/CI code changed; no tests/build/browser/live calls run. Final audit report: [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md). Final checkpoint: [B18](checkpoints/2026-10-26-2139-codebase-audit-block-18-DONE.md). [Timestamp correction](checkpoints/2026-10-26-2139-codebase-audit-timestamp-correction.md) clarifies B7–B17 timestamps; exact individual completion times were not captured. PR14 remains Draft; required branch-protection checks unverified (GitHub connector 403).

## Historical state log (superseded by the current summary above)

The following append-only entries describe earlier progress and are retained for context; they predate the completed Maykop capture in run40369626668.

# B10 hosted V2 capture — partial — 26.10.2026 19:10 МСК

Valhalla, OSRM, and BRouter each passed one bounded hosted probe HTTP200. Eisk→Moscow V2 API captured successfully: 32/32 raw fetch responses HTTP200; SHA `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0`. Thu/Sat offline replay integrity PASS; V2/V3 differences are recorded, not authoritative tariffs. Run40354432433 stopped before Maykop because an initial exact-five-call gate rejected valid Valhalla trace evidence; the corrected bounded validator passed offline against the retained artifact. Maykop remains NOT_RUN. Evidence: [capture report](../experiments/nationwide-tolls/checks/2026-10-26-b10-v2-hosted-run-40354432433/README.md), [checkpoint](checkpoints/2026-10-26-1902-b10-eisk-capture-PARTIAL.md). The single authorized special-territory run40354448205 completed: verify and calculation_timing passed; live_probe failed on address runtime query timeout after four HTTP503 and one cooldown result; broad route-audit steps were skipped. Do not repeat it. [CI optimization proposal](CI_LIVE_AUDIT_OPTIMIZATION_PROPOSAL.md) is proposal only; no workflow changes.

# B10 bounded hosted V2 capture — STARTED — 26.10.2026 18:52 МСК

Base `769d462fe11a07b4ac887ba0b9292dbe0589d320`; PR #14 Draft. Run40345807008 proves Valhalla/OSRM returned route data on GitHub-hosted runner; BRouter remains untested. Single isolated workflow limits probes to one/provider, then sequential Eisk and Maykop V2 captures only if all required responses are complete; followed only by offline Thu/Sat replay and saved V3 comparison. Existing failed Codex capture remains preserved; new output root is run-specific. One companion existing special-territory workflow is authorized. [STARTED checkpoint](checkpoints/2026-10-26-1852-b10-v2-hosted-capture-STARTED.md).

# B03 hosted UI suite + V2 swap fix — DONE 8/8 — 26.10.2026 17:55 МСК

Chrome smoke DONE: run 40336150199. B03 hosted UI suite run [40343852094](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40343852094) passed 8/8 on Chrome156/Node24; app swap callback now exchanges full Place metadata and resets the result. Scenario/per-case logs and artifact digest are recorded [here](../experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40343852094/README.md); [DONE checkpoint](checkpoints/2026-10-26-1755-b03-v2-swap-fix-DONE.md). Run40343863068 completed successfully, including focused tests, TypeScript, Next build, and live_probe. Actions were idle before this save. `addressCitySnapshot=false`; original real-service B-only failure is not proven fixed.

# B01–B12 — 26.10.2026 16:51 МСК

Разрешённая ветка и PR #14 подтверждены на `2907a409305834c4cb9b25bc717978f049bb22f9`; PR остаётся Draft. Nationwide test environment diagnosis DONE: GitHub Actions run 40332405721, Node 24.21.0, 7/7 PASS. Сохранены stdout/stderr/exit codes и ZIP артефакт с SHA256; локальный `spawnSync ... EPERM` классифицирован как ограничение Codex sandbox. Тесты не повторять без новой причины. См. [checkpoint](checkpoints/2026-10-26-1651-nationwide-three-tests-CODEX-ENVIRONMENT-DIAGNOSIS-DONE.md), [evidence](../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md), [WORK_LOG](contractor-brief/WORK_LOG.md), [NEXT_STEPS](contractor-brief/NEXT_STEPS.md).

# B01–B12 IN PROGRESS — 24.10.2026 21:54 МСК

По прямому поручению владельца автономная работа начата из отдельной чистой копии exact remote/PR head `70ab6b840862fa40f090b960ee650b058e83b768`; исходная локальная ветка `work` не изменялась. Четыре исполнителя выполняют только read-only исследование, writer один. Recovery: [DONE](checkpoints/2026-10-24-215401-b01-b12-autonomous-recovery-DONE.md) · [WORK_LOG](contractor-brief/WORK_LOG.md) · [NEXT_STEPS](contractor-brief/NEXT_STEPS.md).

Первый технический блок B03 завершён статусом [BLOCKED](checkpoints/2026-10-24-215649-b03-browser-runtime-BLOCKED.md): Chromium154 существует, но bounded headless smoke падает до DOM (`setsockopt: Operation not permitted`, exit133). Восемь browser-сценариев NOT_RUN, зависимости не устанавливались, SSR/API не повторялись, snapshot остаётся false.

B04 exact OSM identity/topology [DONE](checkpoints/2026-10-24-220143-b04-osm-coordinate-intake-DONE.md): 2 nodes + 4 ways HTTP200/raw/SHA/ODbL, directed entry/exit и координаты подтверждены; focused verifier PASS15/15, live0. Официальный km/operator scope/fare остаются null, runtime inactive, никакая цена/zero не назначена.

B10 V2 compare recovery начат отдельным [STARTED](checkpoints/2026-10-24-220525-b10-v2-compare-recovery-STARTED.md): frozen install и bounded two-case harness/no-network preflight; сохранённые V3 captures не повторять, live V2 только после следующего STARTED. Production/main/merge/Android/backup запрещены.

# Production DONE — 24.10.2026 МСК


Исторический выпуск выполнялся по отдельному прямому поручению владельца; подробности и первичные доказательства сохранены без изменений в [release checkpoint](checkpoints/2026-10-24-production-release-DONE.md) и [evidence](../experiments/road-ref-boundaries/checks/2026-10-24-production-release/result.json). Эта краткая ссылка заменяет повторение операционных deployment-метаданных в текущей сводке.
## Задание для внешнего исполнителя готово

[Текст и воспроизведение Word](contractor-brief/README.md) · [DONE](checkpoints/2026-10-24-external-blocker-brief-DONE.md).16страниц/12пакетов/62ссылки, sourcec959bc2. Отдельно описаны актуальные blockers и исторические data gaps, роли/материалы/критерии приёмки. Алгоритм и Production этим документом не менялись.

# Калькулятор «Из А в Б» — текущее состояние, 24.10.2026 МСК

Источник истины — код и checkpoints в этой ветке. Репозиторий `4regodatbe-cpu/mezhgorod-calculator`; разрешена только `fix/v3-missing-route-prices-2026-10-15`. PR №14 — draft, без merge. Не менять main, Android, backup/algorithm-before-road-ref-2026-10-23 (backup c7048e0a7c0fc6b471c333292f01bcfa213abad4).

Исторический parent компактного handoff: `be8720a244fdc246e52554ac766be81a5c9455ac`, tree `e8ebe05715d868bff9f1222005013eb8b049383a`. После сохранения этого документа сверять actual ref/PR, не считать записанный parent текущим head. CI перед записью completed; не писать при active/queued и не отменять jobs.

## Выполнено

- M4 crossings: exact OSM node + directed way pair полного выбранного trace. Шесть сохранённых маршрутов новых территорий → Казань связаны с одной физической pending-парой: въезд node4443232947 way447135768→1182567076; съезд node358467208 way1211606940→28835034 (М4→Р260). Цена неизвестна, активных новых строк0/pending1.
- Отключаемые модули: [реестр](OPTIONAL_MODULES.md). RoadKilometrage имеет14групп/81узел inventory, но проверенных km pending-пары и дополнительных sections нет. Address pool: concurrency2/process, queue64, singleflight/independent cancel, positive128URL/5мин, budget20с; cooldown3отказа503/429за15с без success, success reset. Timing диагностирует обычную и special ветки без изменения маршрута/цены.
- Ограниченный [addressCitySnapshot](../experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md) реализован, **addressCitySnapshot:false**. Четыре точные реальные Photon Suggestion (два Донецка, Краснодар, Ростов-на-Дону), полный outage only, budget/cancel/hash/provenance/7day expiry. Это не общий каталог и не улицы/дома; GeoNames в runtime не включён. Истекает31.10.2026 11:24:54МСК; не продлевать дату без нового capture/review.
- [GeoNames pilot](../experiments/road-ref-boundaries/SETTLEMENT_PILOT_ACCEPTANCE.md): country+alias ZIP доставлены/структурно проверены;237006P/93кандидата, ru92/93city. Exact admin joins выполнены, 19label-collision groups остаются. Повтор скачиваний/joins не нужен.
- LINT-001 закрыт: scopedCommonJS и const tuple, исполняемые CJS тела сохранены; [checkpoint](checkpoints/2026-10-24-eslint-baseline-DONE.md). [SSR-контракт](checkpoints/2026-10-24-city-snapshot-render-DONE.md) проверяет notice/credit и selected/swap-props/clear-props, не браузерные события.

## Реально выполненные проверки

Последний полный локальный gate: **898/898**, quote/API PASS, ESLint0ошибок/5прежнихwarnings, webpack/TypeScript/static16/16 PASS. [Raw/команды/SHA](../experiments/road-ref-boundaries/checks/2026-10-24-city-snapshot-render/verification.json). Последующие изменения — документы; эти проверки не объявляются browser E2E.

Последний обычный CI40094656564 предшествует новым snapshot/SSR правкам: verify/geometry/timing PASS, address FAIL из-за503,50-settlement/Yandex SKIPPED. Overall success не равен всем live PASS. Новые skip-ci commits не имеют нового ordinary CI proof.

Сохранённые одиночные real-network handler замеры: Анапа→Краснодар165.009км/620₽/2.225с; Донецк→Москва special/dual/mainland/fastestOSRM1123.25км/3050₽/7.318с. Второй тариф — существующая матрица, отдельно с оператором не пересверен. Это CI-host POST handler, не браузер/Vercel E2E и не общий SLA10с. [Обычный](../experiments/road-ref-boundaries/checks/2026-10-24-calculation-runtime-live/) · [special](../experiments/road-ref-boundaries/checks/2026-10-24-special-runtime-live/). Не расширять однотипный performance-корпус.

## Нерешённое и следующий шаг

1. **Browser UI BLOCKED_BY_ENVIRONMENT_BROWSER.** Playwright есть, Chromium отсутствует; сервер/браузер не запускались. [8сценариев приёмки](../experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md) готовы, NOT_RUN. При доступном браузере: отдельный STARTED, локальный UI с exact mocked/r и network isolation, evidence по каждому сценарию. Не искать снова бинарник/не повторять SSR при прежней среде. Исходный phone B-only дефект не доказан исправленным. Preview auth также отдельный blocker; не повторять login/извлечение credentials.
2. **Широкий city fallback BLOCKED_BY_DATA.** Нужен иной первичный источник точных ru admin labels для19групп и независимое подтверждение координат будущих selectable ID; Крым/полнота UNKNOWN. Не выдавать диапазон WGS84/alias join за точность, не активировать сомнительные точки. Имена-only RuWiki и offline benchmark не геокодер. Новый source intake — bounded, со свежей причиной/источником; не повтор прежних запросов.
3. **KM-001/KM-002/TARIFF-001 BLOCKED_BY_DATA.** Для exact pending graph pair нужны операторские scope/цена/даты и exact node км/калиброванная section.1038км другой развязки не присваивать. Новый надёжный источник можно разбирать независимо; unknown не0. Полную собственную roadnetwork не строить.

Доступные без новой среды/источника code-блоки этой серии завершены. Не создавать повторные тесты/документальные этапы ради счётчика. При неизменных предпосылках сообщить конкретный blocker; при новом доступном входе выполнить следующий ограниченный блок, сохранить и продолжить независимые части.

## Продолжение и история

Сначала [AGENTS](../AGENTS.md), [правила](WORKFLOW_RULES.md), [checkpoint protocol](CHECKPOINT_PROTOCOL.md), [решения](PROJECT_DECISIONS.md), [road-ref NEXT](../experiments/road-ref-boundaries/NEXT_STEPS.md), [блокеры](../experiments/road-ref-boundaries/BLOCKERS.md). Не повторять выполненный route audit. Только самый быстрый допустимый маршрут, unknown не free/0, partial не полный итог, обязательные toll checks не сокращать ради скорости.

Git push CLI без авторизации: использовать существующий GitHub connector, non-force expected_sha и exact tree readback. Секреты/credentials не извлекать. Для UTF-8 log tree entries читать bytes.decode, не read_text (CR/CRLF); workflow вне sparse — git add --sparse, exact path/blob check. Сохранять каждый малый завершённый блок до следующего; STARTED перед долгим run; не требовать «дальше» после каждого блока.

[Предыдущий handoff целиком, точные исходные байты](WORK_STATE_HISTORY_2026-10-24.md) — история, не текущие NEXT. [Подробный append-only журнал](../experiments/road-ref-boundaries/WORK_LOG.md). [Сверка статусов](checkpoints/2026-10-24-settlement-status-reconciliation-DONE.md).
