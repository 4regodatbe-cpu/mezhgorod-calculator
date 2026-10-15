# Следующий приоритет — зафиксированные Яндекс суммы и точное сопоставление геометрии

- [x] Перепроверить в Яндекс Картах точные городские точки СПб↔Краснодар: теперь текущие быстрейшие суммы ~11 325 ₽ / ~10 240 ₽; обратная карточка показывает М-4, E115, МКАД, М-11 и ЗСД. Сохранены [этап 13](stages/13-yandex-route-refresh-2026-10-15.md) и live JSON. Это оценки именно выбранных маршрутов, не компонентные тарифы.
- [x] Exact-coordinate V3 API compare Краснодар→СПб завершился: 2 061,4 км/1 581 мин, M-4 native unknown; API now returns accepted Yandex route estimate 10 240 ₽. Route estimator binds directed coordinates/date/±5% distance and keeps whole-route scope.
- [x] Verification complete: 3 focused estimate tests PASS; full `pnpm build` 649/649 + quote/API + TypeScript/Next + static16/16 PASS; exact-coordinate API 200/10 240 ₽; targeted ESLint, `tsc --noEmit`, JSON parse, and `git diff --check` PASS.
- [x] Runtime/evidence commit `cac3d72f65e35faa71abf82c955ba798ca7488cf` published in PR14; PR open/draft/mergeable.
- [ ] Check exact-SHA GitHub Actions run `38705180027` for conclusion; do not report completion before it finishes.

- [x] По решению пользователя убраны пользовательские пометки о неподтверждении квитанцией/оператором/провайдером для priced сумм; в V3 API такие labels не передаются. Реальная неизвестная цена по-прежнему обозначается как неизвестная, partial total не выдаётся за полный. Полный локальный build PASS; пользовательский API теперь также очищает receipt-like суффиксы из `segments`. Live V3 comparison опубликован в PR14 commit `bb355fb`; Actions run `38701853395` для предыдущего code SHA `6038bb2` прошёл; exact-SHA run `38703246952` для `bb355fb` сейчас `in_progress`.

- [x] По прямому решению пользователя принять и сохранить суммы, которые Яндекс Карты явно показывают для соответствующего быстрейшего маршрута: ЗСД Благодатная→Приморский ~600 ₽, reverse ~900 ₽, Казань→Москва ~4 400 ₽, СПб→Краснодар ~11 363 ₽, Краснодар→СПб ~10 910 ₽. Подробности: `stages/12-yandex-live-route-estimates-2026-10-15.md` и `source-snapshots/yandex/2026-10-15-live-route-estimates.json`.
- [x] Документы/снимок опубликованы на PR14 commit `0769b4cdbdf481e764bf188509ffc98940107561`; PR open/draft/mergeable. JSON parse, ссылки и `git diff --check` прошли. Actions run `38698595685` (`Special territory geometry and pricing`) ещё `in_progress`; проверять итог по завершении. Runtime исходники не менялись; build не запускался.
- [x] Повторный live V3 comparison с теми же endpoint и departure context завершён; таблица в `source-snapshots/yandex/2026-10-15-v3-route-comparison.json`. Для ЗСД V3 видит unknown zone scope, Казань→Москва имеет другой M-12 маршрут (V3 821.4 км/689 мин/3513 ₽ vs Яндекс ~853.95 км/579 мин/~4400 ₽), long SPb↔Krasnodar детали карты не дают trace.
- [ ] Сопоставить Yandex route totals с выбранной runtime-геометрией V3 и точными toll gates. Переносить сумму только при exact route/scope match; не распределять общий итог по неуказанным продуктам, не зеркалить reverse. Яндекс показывает цену для Казань→Москва, но не показывает её для Москва→Казань; отсутствие цены не означает free.
- [ ] После сопоставления проверить ZSD zone/OD scope, CKAD conditional context and M12↔CKAD product pair, затем диагностировать оставшиеся `unknown-paid-road` detections. Сохранять fail-closed full-total rule.

---

## CURRENT 2026-10-15 — Valhalla throttling fix and fresh reverse chain

- [x] Reduce selected-route toll-trace concurrency 3→2; retry HTTP 429 up to two times with bounded 1s/2s fallback, honor `Retry-After`, keep persistent/unserviceable chunks fail-closed. Capture `Retry-After` in live audit evidence.
- [x] Focused rate-limit tests 4/4; `pnpm build` audit646/646 + quote/API + TS/Next + static16/16 PASS; lint/diffcheck PASS.
- [x] Fresh SPb→Krasnodar via Moscow: 15/15 chunks complete; all trace calls returned 200 in captured run; M-11 tail94; component audit priced; calculated total 10,464 weekday /12,334 weekend. Display remains explicitly unconfirmed. [Stage 11](stages/11-valhalla-rate-limit-and-reverse-chain-2026-10-15.md).
- [x] Runtime/evidence commit `e87b7b5057984efbdd1688d56e5ee69e93997445` published; verify job success, Preview READY, authenticated `/api/version` exact SHA and `/v3` HTTP 200.
- [ ] Wait for live_probe in Actions run `38683370889` to conclude; update the handoff only with its actual result.
- [ ] Audit complete ZSD zone/OD scope and reconcile official fare schedule versions/effective dates before adding further products. Keep unreviewed scope unknown; preserve exclusion history and do not use inferred zone names as money.

---

## CURRENT 2026-10-15 — Preview smoke done; fresh reverse chain localizes remaining blockers

- [x] Latest PR tip `b555be97c722b9eadc74780986edb783789e6c41` is deployed READY; authenticated `/api/version` returns exact SHA and preview environment (HTTP 200); authenticated `/v3` returns 200. [Stage 10](stages/10-preview-smoke-and-fresh-reverse-chain-2026-10-15.md).
- [x] Fresh OSRM SPb→Krasnodar via Moscow confirms M-11 tail = 94 ₽; complete route total correctly remains unknown due to incomplete ZSD trace and `unknown-paid-road` trace. Capture and raw response are hash-recorded.
- [ ] Poll Actions `38682163789` on exact PR tip `b555be9` and runtime run `38681974174`; record conclusions only after completion.
- [ ] Next implementation block: map complete ZSD selected-route scope beyond zone1 against operator gates/tariff evidence and trace; separately diagnose `unknown-paid-road`. Preserve unknown whole-total behavior until each detected product has complete coverage and price.
- [ ] The 94 ₽ M-11 tariff choice is closed; do not reopen without a changed source/order or selected-route scope.

---

## CURRENT 2026-10-15 — решение по хвосту М-11 реализовано

- [x] По прямому правилу пользователя применять 94 ₽ к распознанному выбранному проезду М-11 за ПВП 679 в обоих направлениях. Это заменяет 56/38 для этого продукта; не складывать тарифы.
- [x] Runtime resolver действует только при строгом M-11 tail continuation, проверяет эффективную дату приказа 274 (с 04.09.2026); airport proximity без обнаруженного tail не превращается в charge.
- [x] Focused tests 28/28, полный gate/build 645/645 + quote/API/Next/TypeScript/static16/16 PASS; Krasnodar↔SPb recorded replays дают tail94 в обе стороны, полный итог 10 464 weekday / 12 334 weekend. Kazan↔SPb replays также подтверждают tail94, но total unknown из-за ZSD beyond zone1.
- [x] Runtime checkpoint `019859828de9aa3edbfcbf76b0be1fe7baebbb4e` опубликован в PR14; latest PR tip также содержит docs-only handoff. PR open/draft/mergeable.
- [x] Vercel success для runtime SHA; Vercel pending для latest docs tip. Actions run 38681974174 на runtime SHA in progress при последней проверке.
- [ ] Дождаться Actions для runtime SHA, затем API/Preview smoke; Main/Production/Android не менять.
- [ ] Продолжить независимые gaps: ZSD zone2+, CKAD physical boundaries/context, M12↔CKAD operator pair. Тариф М-11 повторно не обсуждать, если не изменится исходный приказ или scope route detection.

## CURRENT 2026-10-15 — после MMK/ЗСД zone1

- [x] Export разрешён; PR14 создан, initial16fc7213 CI success. Исторический remote blocker resolved.
- [x] MMK направленные gatebindings; ZSD zone1 cash300, full642/focused29/lint PASS; 10 offline replays и свежий live Краснодар→Москва→СПб.
- [ ] M11 tail: сверить order274 с точными physical mainline boundaries; не переносить56/38/94 без scope proof. Яндекс UI дал detour/no fare tag, это не proof free.
- [ ] Расширить ЗСД только после reviewed way/gate/zone evidence; остальные зоны unknown. Затем CKAD context/endpoints и M12 operatorpair.
- [ ] Fullypriced long chain в обе стороны + profile/diagnostics parity, required full gate. Production/merge только по прямому запросу.

---

## CURRENT 2026-10-15 — после аудита цепочек

- [x] 7 цепочек/8 live/16 replay;38 focused/635fullbuild PASS. [Подробный блок](stages/06-long-chain-route-audit-2026-10-15.md), INDEX.json в source-snapshots/long-chain-2026-10-15.
- [ ] Exactbindings: М11partialhead ЦКАД→58 (ПВП47),tail679–684/airport; ЗСДПВП3/4 no-transponderzonefare; current ЦКАДМ12↔М11/M4↔M11 физические endpoints/context; М12↔ЦКАД operatorpair.
- [ ] Исправитьpaymentevent profilewindow только после егоproof; нынешниеM4profilechanges не маскировать.
- [ ] Минимум1 fullypriced multi-roadchain плюс reverse/profile/diagnostics parity, thenfullgate/Preview. Текущий audit ничего не активирует вProduction.
- [ ] GitHub отправка preparedfix/evidence только после ранее запрошенного explicit разрешения: auto-reviewBLOCKED сохраняется. До этого localGit handoff доступен.

---

## 2026-10-15 — remote сохранение BLOCKED auto-review

- [ ] Получить явное разрешение uploadpreparedcommit972a35a/последующийcheckpoint в4regodatbe-cpu/mezhgorod-calculator; автоматическаяreview отклонилаgitpushкакнеавторизованныйexport. Не обходитьдругимtransport. Послеразрешенияpushfixbranch/draftPR/auditbase/checkexactSHA.
- [x] Code/source/testжурнал сохранены локальнымGitcommit972a35a. Петербургtail/ZSDещёopen; деталиниже.

---

## CURRENT 2026-10-15 — после исправления М4/отображения

- [x] Savednode unnamedM4 + reusecomplete selectedtrace; V3 manual/copy; focused22/full627/buildPASS. [Этап](stages/05-missing-route-prices-2026-10-15.md).
- [ ] Сохранить fixветку/черновойPR относительно auditV3; проверить CI точного SHA. Production/main не менять.
- [ ] Закрыть tailМ11 scope и ЗСД: source PDF no-transponder/даты/category, направленные physical endpoints/рамки/зоны; текущие56/38/94 не включать безproof. ZSDPDF403 сохранён какnegativeevidence.
- [ ] Повторить живые Петербург/Краснодар/Донецк/Волноваха в обе стороны, diagnostics on/off, profile boundary; затем fullgate/Preview. Другие unnamed IDs классифицировать только exactsavedidentity; неизвестное не0.

---

## CURRENT 2026-10-14 — тестовая версия опубликована и доступна для приёмки

- [x] GitHub snapshot37d55f6/source tree match, CI correction afdc2c4; draft PR13 в integration baseline. Preview READY/version SHA; Vercel621/621 PASS; повторный Actions38624425083 build/API smoke PASS, PR verify PASS. [Отчёт](stages/04-preview-and-live-acceptance-2026-10-14.md).
- [x] Живые Анапа off/on620 parity, Ялта800; длинный Москва—СПб unknown/null. Desktop UI и фактическая вставка скопированного текста для priced/unconfirmed и unknown PASS; screenshots/JSON сохранены.
- [ ] Проверить завершившийся optional live_probe38624434385; mobile/desktop, free/live отказ trace, профильные границы, остальные сценарии сводного отчёта. Не приравнивать разные городские координаты/маршруты при сверке Яндекса.
- [ ] Продолжить source/geometry gaps: М11tail/ЗСД, М4/355, новая Шали, ЦКАДcontext/SmallVyazemy, региональные границы/Псков и10дат. Unknown не превращать в0.
- [ ] Официальный выпуск, main merge и Android только после полной приёмки и прямого запроса пользователя.

---

## CURRENT 2026-10-14 — аудит завершён, далее точный Preview и живые проверки

- [x] Проверен активный V3; обязательная trace и неизвестный итог при её неполноте, один согласованный DTO/UI маршрут. Full build 621/621 PASS. [Отчёт](stages/03-consolidated-v3-audit-2026-10-14.md).
- [ ] Сохранить полную audit-ветку на GitHub без изменения main; проверить механизм записи и целостность дерева, затем CI и Preview на точном SHA через `/api/version`. Исторический Preview не считать этой версией.
- [ ] Выполнить приёмочные сценарии из отчёта: реальные API/выбранная геометрия, diagnostics on/off, длинный маршрут/отказ trace/граница профиля, mobile/desktop UI. Сохранить JSON/время/условия/скриншоты. Критерий: нет пропущенной обнаруженной дороги/частичной полной суммы/unknown как 0.
- [ ] Продолжить source/geometry gaps по таблице отчёта: М4/355, М11 ПВП21/p147/head/tail, М12 новая Шали, 16 conditional ЦКАД/Small Vyazemy, регионы/4 Псковские дороги/10 дат. Новый PDF нужен только для конкретного недоказанного факта; не повторять нерабочие 403/404 ссылки.
- [ ] Официальный выпуск и Android `/v2` остаются отдельными этапами после приёмки и прямого запроса пользователя.

---

## CURRENT 2026-10-14 — далее сводный audit активного V3

- [x] ЦКАД geometry-only вместо native money; independent regional IDs/SmallVyazemy; paid evidence completeness bug fixed. Full616/616PASS, [отчёт](stages/03-v3-ckad-regional-identity-and-paid-evidence-2026-10-14.md).
- [ ] Active `route-leg-pricing.ts`/`route-leg.ts`/API/UI audit против ALGORITHM_SPEC: selected geometry,first/last,own ready date/profile,overlap,partial/unknown/free. Составить воспроизводимый список blockers/приёмочных маршрутов; не объявлять готовность по одному тест-count.
- [ ] Проверить возможность этап4/Preview на точном SHA и сохранение всей audit-ветки на GitHub; CLI read доступ есть, write credential исторически отсутствовал, не повторять зависающие blob загрузки без диагностики. Main/Production только прямым запросом.
- [ ] Data/geometry work: regional boundaries/SmallVyazemy, 120minCKAD registration context (не простоETA/boolean), отдельные4Псковдороги/10dates; новаяШали/одноРВПdirection/М12anchors;М11ПВП21/p147/localheads/tail scope. Source gaps не превращатьв0/удалённуюдорогу.

---

## CURRENT 2026-10-14 — далее ЦКАД и региональные продукты

- [x] М12 ready pair по outer boundary без native money/continuity. Удалены crimeaM4Total и bypass money в А289helper. Finalbuild606/606PASS; [отчёт](stages/03-v3-m12-outer-boundaries-and-helper-cleanup-2026-10-14.md).
- [ ] ЦКАД: `engine/ckad-route-adapter.mjs`, `lib/toll-engine/ckad-production.ts`, `route-leg-pricing.ts` — проверить independent ring/SmallVyazemy IDs и operator context. Без proof120мин/defaultoperator condition не разблокировать16cells. Критерий: собственная пара каждого продукта, неизвестная часть блокирует сумму.
- [ ] `unpriced-road-coverage.ts`/`route-leg-pricing.ts`: заменить broad regional денежный компонент самостоятельными IDs для распознанных продуктов; неоднозначные Псков/неопознанные toll events остаются unknown, не исчезают. Не активировать опубликованный тариф без географических границ.
- [ ] НоваяШали/неоткалиброванные РВП/одноРВП направление, М11 ПВП21/p147/localheads/tail, regionalbindings/10date rows — сохранять unknown до доказательств.
- [ ] Консолидированный audit активного V3 против ALGORITHM_SPEC/releasecrit, полныйgate. Затем этап4 реальные маршруты/UI/API и Preview с SHA. Main/Production только прямым запросом.

---

## CURRENT 2026-10-14 — М11 реализован; следующий блок М12

- [x] Активный V3: ready matrix head, own profile/exit payment clock, независимые head/mainline/tail; full Moscow mainline first/last в обе стороны без p593. PDF210/210; финальный build601/601PASS. [Отчёт](stages/03-v3-m11-products-and-payment-time-2026-10-14.md).
- [ ] М12: `engine/m12-route-adapter.mjs` и `lib/toll-engine/m12-production.ts` / boundary span — убрать обязательное наличие native priced/tolls и внутреннего vector eligibility при доказанных крайних границах. Критерий: готовая направленная пара и unknown при неизвестной границе, включая старый832/newShali; никакой денежной подстановки/суммы промежуточных РВП.
- [ ] Новая Шали: сохранить первичную географию перед привязкой; старое832 не новыйShali. ЦКАД context/SmallVyazemy и региональные productId/границы — отдельные незавершённые блоки.
- [ ] М11: точный anchor ПВП21 вместо широкого стабильного окна; локальные head endpoints; p147/другие mainline anchors; tail/airport scoped ready pairs. Не выдумывать цену56/94 для неустановленной пары.
- [ ] Проверить/убрать неиспользуемые старые helper деньги crimea/a289 includeBypass=true; final stage3 audit, затем этап4/Preview. Main/Production только по прямому запросу.

---

## CURRENT 2026-10-14 — М4/А289/обход разделены; далее М11

- [x] Активный верхний V3: независимые М4/А289/обход, готовая датированная цена обхода и направленные ПВП 46. Финальный build 592/592 PASS; [отчёт](stages/03-v3-southern-products-2026-10-14.md).
- [ ] В `engine/m11-route-adapter.mjs` заменить native headAmount/headWeekday/headWeekend готовой матричной парой 15–58. Геометрия должна передавать собственные directed endpoints/время головного продукта; не угадывать профиль по mainline времени.
- [ ] Верхний `route-leg-pricing.ts`: независимые М11 head/mainline/tail. Критерий: одно начисление каждого продукта, неизвестный хвост блокирует полную сумму; готовые directed fares без суммы промежуточных ПВП.
- [ ] Завершить bindings новой Шали, полного М11 tail/airport, Small Vyazemy, ЦКАД tariff context и регионов. Существующие источники/история — по WORK_STATE.
- [ ] Отдельно убрать неиспользуемые старые денежные helper-пути `crimeaM4Total` / `a289ShortRoute includeBypass=true` после проверки вызовов и тестов; не заявлять полное удаление заранее.
- [ ] Focused + полный build, журнал/коммит; затем отдельный Preview-блок. Main/Production — только по прямому запросу.

---

## CURRENT 2026-10-14 — следующий блок этапа 3

- [x] Убрать прямые production-подстановки М4/М11/М12/ЦКАД и геометрическую денежную замену в верхнем V3. Проверено 585/585 и сборкой; [отчёт](stages/03-v3-upper-pricing-fallbacks-2026-10-14.md).
- [ ] Разделить М4, А289 и `krasnodar-west-bypass` в `lib/v3-calculation/m4-a289-composition.ts` и `route-leg-pricing.ts`. Для обхода нужны собственные направленные границы на выбранной геометрии, дата/профиль и готовая пара `m4-dzok`; не читать деньги из `lib/toll-data/m4.ts`. Критерий: отдельные компоненты, одно начисление, неизвестный обход блокирует полный итог.
- [ ] Отдельный адаптер головного продукта М11 вместо native head money в `matrixM11GeometryComponent`; далее отдельные mainline/tail, без известной части в качестве полного итога.
- [ ] Продолжить незавершённые геометрические bindings новой Шали, М11 679–684/Пулково, Small Vyazemy и ЦКАД context. Тарифные таблицы сами по себе не доказывают границы.
- [ ] После изменений focused tests + `npm run build -- --webpack`, Git handoff. Preview/Production требуют отдельного блока; main/Production не менять по общему «Дальше».

---

## 2026-10-14 — directpairМ12 и физическоеобнаружениеПулково

- [x] М12готоваяdirectpair безnativeденег/fullvectorlookup;mainpriceguard independentM4/DZOK; ЦКАДconditional28→16;PositivePulkovo detection blocks falsefree.24products,580/580/buildPASS. [Отчёт](stages/03-directed-pairs-and-physical-product-guards-2026-10-14.md).
- [ ] ЗаменитьМ12nativegeometrygate своимouter-boundary/fullpaidspanproof; оперетьсянаselectedgeometry/primaryjunctionevidence, не на citynames. ОктябрьШали остаётсяunbound,832неоживлять.
- [ ] ЗавершитьexactpaidproductscopeМ11tail/airport:2airportgantries подтвержденыOSM/PDF,mainlineframes/scoped56/94 ещёне связаны. Подключать38/56/94 только послеcompleteproof, не подсумму.
- [ ] ВерхнийV3сборщик independentproductId (M4/A289/DZOK,M11head/mainline/tail,M12regions,CKADbypass). Дубликаты/priceunknown не позволятьскрытьполныйитог.
- [ ] ЦКАД120минусловия иSmallVyazemygeometry;10dategapsПсков/Хэйхэ покаunconfirmed. Не повторять запросужеимеющихсяPDF.

## 2026-10-14 — датировка и календарь основного М11 готовы

- [x] 17дат:27→10; Казань actual09.03.2025 23:50:01; свои М11order27401:00/праздники; nativegeometryexit time; а01код перенесён сновойcategoryIbaseline. Полныйgate571/571. [Отчёт](stages/02-dates-and-m11-tariff-calendar-2026-10-14.md).
- [ ] Физически связатьМ11tail679–684/15–58/mainline, М12newShali и ЦКАДcontext/productbypass, затемstage3independentproduct composition. НовыеPDF уже есть, не спрашиватьповторно.
- [ ] Псков8 иХэйхэ2 dates остаютсяunknown/unconfirmed до первичного доказательства; не заполнять по дате приказа/подтверждения пользователя. ВRVPsource/price не считатьgapкакfalse0.
- [ ] При подключении Рязанибесплатнойполосы/МСДtransit передавать только доказанныеverifiedLane/tariffContextResolved. Остальной failclosedсохраняется.

## 2026-10-14 — семь PDF обработаны; запрос документов ЦКАД/М12 закрыт

- [x] Исправить210ЦКАДIcells, сохранить380М12directcells(08.10),30датМ3/Тольятти и5originalPDF; проверитьsourcehashes/матрицу/build565/565. [Отчёт](stages/02-uploaded-operator-pdfs-2026-10-14.md).
- [ ] Продолжить27строкбезstartdate:heihe2,kazan4,m1_2,msd1,pskov8,ryazan4,udmurtia6 по первичнымисточникам. Не просить повторно уже полученные7PDF.
- [ ] СвязатьM12newShali сфактическимвыбранныммаршрутом:дваShali определенияPDFнеравныдоказательствуmarker832.380newcellsready,old832expired. Восточныеappendices2–4 сохраненыsource-only, независимыеproducts требуютbindings.
- [ ] ЦКАДfootnote2:28M12endpointcells требуютtariffContextResolved, иначеunknown; SmallVyazemy103 отдельныйproduct требуетadapter.2381арифметическийbenchmarkнеготоваяruntimeпара.
- [ ] М11head/mainline/tail и stage3product runtime; integrationchecka01e2bf, затемreleasegates/Previewпо плану. Productionбезпрямогозапросанепубликовать.

## 2026-10-14 — актуальные ссылки PDF не подтверждены

- [ ] ЦКАД/M12: получать PDF через ссылки самой страницы Автодора; старые165/fe5 адреса не выдавать как сейчас рабочие. Сайт в cloudbrowser требует ручной проверки, tskad502. Подробности в MATRIX_OPEN_ITEMS_AND_DOCUMENTS_2026-10-14.md.
- [x] PDF(2) побайтово повторяетM4rules, новый импорт не нужен. Скриншот404 прочитан, полныйURL скрыт.
- [ ] Независимо продолжить М11 и региональную датировку; дваPDF остаются требуемыми для визуальногоcategory/ODаудита.

## 2026-10-14 — запрос документов и пересмотр категории ЦКАД

- [ ] Получить [ЦКАД/M12 PDF](MATRIX_OPEN_ITEMS_AND_DOCUMENTS_2026-10-14.md); не запрашивать снова М4/355 и имеющийся М11.
- [ ] ЦКАД: перепроверить все210directcells по заголовкам категории/оплаты; прежняя трактовка3189 как Cat-I no-transponder подозрительна (официальный индекс показываетII). Сохранить runtimeApproved=false до проверки. Не просто заменить длинную пару или делить ставки.
- [ ] М12: сверить Marchsource и действующие после08.10 точныеOD/границы; М11 physicalproducts/profile;57undatedrawrows. После изменения данных focused/fullgates.

##2026-10-14 — ПВП355 закрыт по двумPDF

- [x] RulesPDFpages7–8+tariffPDFpage2:355northentry→339receipt; direct220/220compiled,reverse notinvented.
- [x] Исходные428ключей учтены:404canonicalestimates+24excludedfarepairs,0unresolved.728active/668excludedchains/4reviewed/2operator.560/560tests/buildPASS.
- [ ] Продолжить nationwide stage2M11/M12/CKAD,remaining57undatedrows andselectedphysicalcoverage; stage3independentproductruntimeahead.
- [ ] Integrationcheck отдельногоa01e2bf(CKADtimestamp/M11overflow) перед release.

##2026-10-14 — M4PDF columns/start verified

- [x] Preserve/visuallyverify uploaded5-pagePDF, sourcehash,21normalizedI/nontRrows, March2start. Rebuild1492rowsdates;557/557/buildPASS.
- [ ] Read actual355 detailed entry/receipt rulesPDF(e0b/5kq5uo88zxclelibmubucv607fda7cvv.pdf); mapexact paidboundaries with24Yandex controls. Operator rows/date evidence doesnot make allODconfirmed.
- [ ] Remaining57rawrowswithoutstart date andM11/M12/CKAD bindings/sources; stage2stillINPROGRESS.

##2026-10-14 —24 Яндекс controls355 наблюдены

- [x] Cloud browser разрешён пользователем;12directions x2dates,24actual sums recorded. Отчёт stages/02-yandex-355-controls-2026-10-14.md.
- [ ] Подтвердить paidboundary/полосу355 и остальныхПВП поPDF/схеме; whole-Yandex-route estimates с localturns не импортировать как exact355 matrixcells.24unknown остаются.
- [ ] Получить tariffPDF пользователя и сверить дату/категорию/профиль; затем stage2 остальных продуктов.

## 2026-10-14 — активные дубли М4 устранены

- [x] Компилировать одну topology-пригодную estimate на directed endpoint/profile;404/428 восстановлены,24 unknown;668 лишних chains вне runtime;726 unique cells и4 reviewed overrides.554/554/build PASS.
- [ ] Подтвердить restored estimates same-route/operator/Yandex и даты; текущие цены unconfirmed. Исправление топологии не объявлять проверкой всех сумм.
- [ ] Продолжить M11/M12/CKAD coverage и stage2 delivery criteria; runtime product split stage3 впереди.

## 2026-10-14 — этап2: quarantine теперь enforced в общем ядре

- [x] Исключить audit-only строки из общего полного-key quote, а не только endpoint adapter;1096 rows regression,551/551 tests/build PASS.
- [x] Сохранить primary topology evidence672 exit/355 entry-receipt rule; current PDF403, никаких новых подтверждённых цен.
- [ ] Проверить актуальные exact OD/направления для339/355 и636/672; не переносить ramp цену в сквозной вектор.428 conflict keys остаются unknown.

## 2026-10-14 — этап2: структурный аудит готов

- [x] Диагностический отчёт4699 строк/428 conflicts:140(339/355),168(636/672),120(оба),1549 без start date; final549/549/build PASS.
- [ ] Сверить точные directed endpoint/profile/source/date для двух групп вариантов; не выбирать min/max. Продолжить M11 head/mainline/tail, M12 и CKAD.
- [ ] При интеграции проверить отдельно a01e2bf (CKAD timestamp/M11 overflow) из второй локальной audit-копии; данный блок диагностический.
- [ ] Этап2 закрыть только по критериям DELIVERY_PLAN; текущий отчёт stages/02-matrix-and-provenance.md отмечен IN PROGRESS.

## 2026-10-14 — этап 1 завершён, очередь следующей работы

1. [DONE] Единая рабочая ветка `integration/v3-product-baseline-2026-10-14` опубликована, fetch получена и выбрана локально; snapshot `2b756ef`, полный source tree совпал с локальным проверенным заделом. Каталог 23 продуктов, границы, overlap правила и unknown для Пскова сохранены. Отчёт: `stages/01-baseline-and-product-boundaries.md`.
2. [NEXT] Этап 2: разобрать причины 428 конфликтующих М-4 endpoint/profile ключей, проверить operator/version/date/profile для каждой активной строки и явные unknown; сохранить `stages/02-matrix-and-provenance.md`, пересобрать генератор и валидатор, запустить предусмотренные gates. Полная матричная цена для всей сети пока не подтверждена.
3. [PENDING] Этап 3: подключить отдельные `productId` в V3, точную пару каждой дороги, сложение готовых цен и запрет частичной суммы. Общий `m4_a289` пока присутствует в runtime.
4. [PENDING] Этапы 4–6 согласно `DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md`; Production требует отдельного прямого запроса.

## 2026-10-14 — блокер публикации этапа 1

1. [BLOCKED] Пользователь явно разрешает отправку `cf18e8677aa53c30f959c93aff8745d57167ab5d` в новую GitHub ветку `integration/v3-product-baseline-2026-10-14`. Предыдущая попытка отклонена auto-review; обход запрещён. После разрешения push и сверка remote ref; затем этап 1 завершён.
2. [PENDING] Этап 2: тарифные конфликты М-4, версии/источники и валидатор. Ни PR, ни Preview, ни Production в блоке 1 не создано.

## 2026-10-14 — единая интеграционная ветка

1. [IN PROGRESS] Закончить merge `integration/v3-product-baseline-2026-10-14`, отправить новую ветку в GitHub и сверить SHA. Объединённое дерево: `npm run build` PASS (546/546, quote, 16 app routes). Отчёт: `stages/01-baseline-and-product-boundaries.md`.
2. [PENDING] Этап 2: проверить причины 428 конфликтующих направленных endpoint/profile ключей М-4, сверить матрицы и тарифную provenance по оператору; не применять recovery patch без отдельной проверки. Критерий: валидатор, версия матрицы и `stages/02-matrix-and-provenance.md`.
3. [PENDING] Этап 3: отдельные компоненты `m4`, `a289`, обход и другие `productId` в V3, точные пары и простое сложение готовых цен; тесты запрета дублей и partial total. Остальные этапы по `DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md`.

## PRIORITY 2026-10-13 — delivery plan through official release

The [six-stage delivery plan](DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md) is the current execution order. This entry is a plan, not completed implementation. The historical backlog below remains evidence but must not override the latest accepted product rules.

- [ ] **Stage 1 — baseline/product boundaries:** compare the live GitHub V3 HEAD and the local `audit/matrix-endpoint-conflicts-2026-10-13` commits; create one reproducible working branch and unique toll-product catalog. Deliver `stages/01-baseline-and-product-boundaries.md` and regression examples for separate M4/A289/bypass products.
- [ ] **Stage 2 — exact matrix/source:** resolve M4 endpoint conflicts by cause, complete operator/Yandex row provenance/date/profile, M11/M12/CKAD and regional coverage; regenerate and validate the matrix. Deliver `stages/02-matrix-and-source-audit.md` with priced/unknown counts and reasons.
- [ ] **Stage 3 — V3 composition:** route ID/selected geometry → product-specific first/last boundaries → one exact ready fare each → simple sum. Remove money-producing legacy fallback and duplicate grouping, connect uncovered families; regression for one/two/three roads and unknown. Deliver `stages/03-v3-integration.md`.
- [ ] **Stage 4 — full gate/live/browser:** focused tests, matrix validator, `npm run test:audit`, `pnpm lint`, `pnpm build`, GitHub final gate; update old V2-only release checks in sync with actual V3 cutover; live route/Yandex and mobile/desktop controls. Deliver `stages/04-end-to-end-verification.md`.
- [ ] **Stage 5 — Preview:** publish reviewed working branch, prepare release PR, verify exact-SHA Vercel Preview via UI/API and user control routes; fix and repeat final gate. Deliver `stages/05-preview-acceptance.md` and a link for user testing.
- [ ] **Stage 6 — official release:** after a direct release request, switch root/CI on verified SHA, deploy to Production with saved rollback point, test live domain; address Android `/v2` WebView in separate APK gate. Deliver `stages/06-official-release-and-monitoring.md`.

## PRIORITY 2026-10-13 — rule reconciliation before next algorithm stage

- [x] Consolidate rules found in the current project handoff/history and available conversation search extracts; preserve earlier decisions as history instead of deleting them.
- [x] Record the user's latest rule: per independent toll road, resolve its own entry/exit pair, read one ready matrix fare, and sum the ready fares across separate roads with no additional formula.
- [x] Record the permanent append-only stage-journal requirement in root `AGENTS.md`.
- [ ] Review the tariff-product catalog boundary in `RULES_RECONCILIATION_DRAFT_2026-10-13.md`; exact unrepresented route endpoints and truly disjoint passages already fail closed as unknown until a matrix key exists.
- [x] Set safe operating defaults for equal ETA (stable candidate order), directional rows (use only explicit matrix evidence), intraday/holiday rules (exact applicable matrix schedule or unknown), and conflicting Yandex controls (unresolved key remains unknown).
- [ ] After resolving the boundaries, update the normative contract/tests once, so the implementation uses one coherent rule set. Do not reopen settled choices: fastest route only, selected geometry only, one endpoint pair per separate road, no intermediate exits/reentry, ready matrix fare per road, add road fares, unknown is not zero/partial.
- [ ] Continue the outstanding source/currentness audit only after the relevant tariff-product boundaries are clear. Preserve unknown where exact pair or current fare is missing/conflicting.

See `RULES_RECONCILIATION_DRAFT_2026-10-13.md`, `DECISIONS.md`, and root `AGENTS.md`.

## 2026-10-13 — тарифная актуальность M-12/ЦКАД

- [x] Проверить опубликованную цену M-12 Сокуры→Шали 99 ₽ с 08.10.2026 и сохранить точный scope/effective date.
- [x] Исправить legacy Москва—Казань 5 909→5 847 ₽ по официальной ячейке P239 и покрыть двунаправленным regression; строка Казань—Шали 62 ₽ остаётся только для отдельно открытого старого тарифа.
- [x] Сопоставить operator CKAD OD М-10→ПК-5 3 189 ₽ и holding-company whole-road 2 381 ₽; зафиксировать конфликт scope, сохранить runtime disabled.
- [ ] Получить точную новую OD-пару для поездки до/через Шали и физически подтвердить сопоставление входа Сокуры с трассой; не считать 62 ₽ или московский total актуальными после 08.10.
- [ ] Разрешить CKAD 2 381/3 189 конфликт по точным РВП/калькулятору оператора; не объединять whole-road контроль и OD ячейку без доказательства.

См. `TARIFF_AUDIT_CURRENTNESS_2026-10-13.md`.

## 2026-10-13 — tariff source re-audit

- [x] M1/M3 category and payment-column reconciliation: M1 no-transponder250; M3 category-I 480/520 by operator profile. Withdraw old M3 shadow800, which used higher vehicle classes.
- [x] Fix M1 no-transponder in active data, national registry, generator; rebuild/validate matrix. Correct legacy Tolyatti full-road tariff650→320 and test both directions.
- [ ] Continue full audit across M4/M11/M12/CKAD, regional/full-route overrides and source effective dates; preserve unknown when endpoint, vehicle class, date or selected-route coverage is not established.
- [ ] Re-run matrix/full builds after remaining tariff blocks; no publish/merge/Production without separate explicit authorization.

See `M1_M3_TARIFF_REAUDIT_2026-10-13.md`. The sections below preserve older task history and may describe issues now resolved above.

## 2026-10-13 — Yandex endpoint conflict cleanup

- [x] North620→71 and636→71: actual UI weekdays/weekend controls, four unique active reviewed cells;542tests/build PASS.
- [x] Generator/runtime quarantine: classify ordered endpoint/profile candidates; conflicting prices remain audit-only, unique cells are runtime eligible, reverse direction evaluated independently. Rebuilt4699-row matrix;428 conflicts/360 unique endpoint keys; full75-test + Next/TS build PASS. See `M4_ENDPOINT_CONFLICT_AUDIT_2026-10-13.md`.
- [ ] Repeat real endpoint controls for remaining conflict pairs, both periods/directions. Do not mirror reverse until its actual paid boundaries are established; controls may bypass a boundary.
- [ ] Resolve source conflicts where Yandex agrees with neither old candidate. Preserve observation URL/vehicle/date/profile/amount, no min/max selection.
- [ ] Finish M11/M12/CKAD missing product bindings. Stage10/full nationwide still IN PROGRESS.

---

## PRIORITY 2026-10-13 20:05 MSK — границы вместо полного обхода ПВП

- [x] Переработать новый M4/M11 pricing согласно последней записи DECISIONS.md: первый/последний тарифные участки → готовая ячейка. Не проверять промежуточные съезды/reentry и не требовать сетевого подтверждения всех промежуточных ПВП. Убрать старое суммирование ПВП из пути нового алгоритма. Подтверждено отчётом `ENDPOINT_ONLY_IMPLEMENTATION_2026-10-13.md`.
- [ ] Проверить оба направления, короткий/длинный вектор, один участок, неизвестную ячейку, разные платные продукты. Тест должен подтверждать отсутствие промежуточных сетевых запросов и отсутствие блокировки из-за их таймаутов.
- [ ] Сохранить отдельный текущий задел исправлений доступности; полный аудит этап10 остаётся IN PROGRESS.


---

## 2026-10-13 — stage9

- [x] Client code/render audit: actual API price/card-copy binding, strict response validator, stale/abort/reset/unmount/copy lifecycle, browser storage/SSR/analytics and presentation overflow.527 tests/build PASS.
- [x] Experiment402a1b2a saved;16 hashes match. Preview7u2o9rrzb READY exact source,527 remote tests/TS/build PASS; protected GET200.
- [ ] Stage10: complete chosen-route/provider/Yandex/browser/performance checks and consolidated open source/physical/calendar coverage. Provider geometry cache21600s unchanged; no final price cache. Retain M1/M3/M11/CKAD/M12/Rostov unresolved issues.

---

## 2026-10-13 — stage8

- [x] Version/zone/rounding code audit: date/ISO boundaries, aliases/intraday ambiguity, exact-row confirmation, undated warnings, single total rounding and consistent parts, split/money bounds.516 tests/build PASS.
- [x] Experiment5d222c77 saved;10 hashes match. Previewe7f9g7iwb READY exact source,516 remote tests/TS/build PASS; protected GET200.
- [ ] Stage9: UI/copy/cache/failures, integer part/total and unknown warnings in actual flows.
- [ ] Stage10: full physical/provider/Yandex/time performance checks; retain M1 raw250 vs generated230 conflict (official403), M3 series/dates, independent M11 calendar/seasonal succession and existing Rostov/road exits. No new unverified prices.

---

## 2026-10-13 — stage7

- [x] Existing temporal code audit: Moscow timezone, M12 allDays, M4 midnight/unverified-calendar null preserved, invalid date normalization, M11 missing hour/independent calendar ambiguity and wording fixed.508 tests/build PASS.
- [x] Experiment988a2a0b saved;17 hashes match. Previewh1hah9yrn READY exact source,508 remote tests/TS/build PASS; authenticated GET200.
- [ ] Stage8: fares/version intervals/zones/rounding; dated M1/M3/source conflict; independently sourced M11 mainline special/transferred days and head seasonal succession; no invented payment-time policy.
- [ ] Stage9 UI/cache/failures; stage10 full physical/time/provider/Yandex integration, existing regional/M11/M12/Rostov gaps.

---

## 2026-10-13 — stage6

- [x] Audit existing M1/M3/regional composition: lost candidate/trace coverage, late recovery, road ref boundaries/CKAD endpoints, gate identity and trace count contracts fixed.502 tests/build PASS; live local Kaluga2 M3 booths unknown, Odintsovo exact route0 confirmed.
- [x] Experiment8df67458 saved;16 hashes match. Preview2hq1o2uiy READY exact source,502 remote tests/TS/build PASS; authenticated GET200.
- [ ] Stage7: per-road dates, timezone, holidays, midnight/crossing-time.
- [ ] Stage8: generated M1/M3 missing effective-from vs dated source series; current M3 snapshot conflict and partial OD. Do not activate undated/wrong traversal money.
- [ ] Stage10: M1/region physical nodes, full provider step/coverage and Yandex equality, existing M11/CKAD/M12 and Slavyansk→Rostov gaps.

---

## 2026-10-13 — stage5 checkpoint

- [x] Existing M11/M12/CKAD code/calculation audit: selected OSRM M11 metadata, direct M11/CKAD matrix adapters, separated M11 head, physical p147/fractional positions, disjoint/repeat guards, missing679–684 blocks full price.491 tests/build PASS.
- [x] Saved experiment1506a862;21 hashes match. Preview oy89ta0xy READY exact source,491 remote tests/build PASS.
- [ ] Stage6: M1/M3/regional composition and source coverage.
- [ ] Stage7: independent per-road holiday/profile/crossing-time/seasonal calendars.
- [ ] Stage10: physical M11 partial/head/reverse/679–684 and CKAD gates; OSRM M12 strict metadata and Sokury–Shali; Slavyansk–Rostov fastest-route gap. Final live Moscow→Petersburg and Tver→Moscow remain unknown, not certified prices.

---

## 2026-10-13 — user price correction + stage4

- [x] Correct A289 vehicle-category import; Anapa620 / Slavyansk415 confirmed by actual API and live Yandex representative controls.
- [x] Stage4 calculation: separate M4-only + A289 OD + bypass, no lost/double components;478 tests/build PASS.
- [x] Persisted code4b27032,39 hash matches; Preview4ncn2cwjo READY at exact SHA,478 Vercel tests/build PASS; /v3 GET200.
- [ ] Stage5: M11/M12/CKAD adapter composition.
- [ ] Stage10 live gap: Slavyansk–Rostov OSRM vs Yandex different route/ETA; no Yandex total, do not declare same-route price check complete. Preserve exact bypass binding / source/holiday limitations.

---

## 2026-10-13 — аудит: части1–3 завершены

- [x] Части1–3: календарный вход API, fastest provider geometry, промежуточные A289 OD/frame ordering/unknown/repeat guard. Gate472 и build PASS.
- [x] Audit baseline и части1–3 сохранены в experiment code93c0c5d,35 files SHA match; Preview READY exact code SHA,472 tests/build PASS; GET /v3 200.
- [ ] Часть4: M4 partial/full plus A289, no dropped/double charged components.
- [ ] Части5–10 по AUDIT_PLAN_10_PARTS_2026-10-13.md; live bindings/browser остаются открытыми.

---

## 2026-10-13 — аудит: часть 2 завершена

- [x] Часть2: V3 fastest candidate validity/geometry/provider identity, equal ETA, no fake freeError; 466 tests/full build PASS.
- [ ] Часть3: A289 intermediate OD pairs and physical frame ordering; resolved/unknown boundary.
- [ ] Сохранить локальные части1–3 и исходный аудит8556e57 в удалённой экспериментальной ветке после проверки текущего head.

---

## 2026-10-13 — текущий порядок аудита

- [x] Часть 1: исходное состояние, общий gate, календарная валидация API.
- [ ] Часть 2: fastest selector / equal ETA / provider geometry-evidence.
- [ ] Части 3–10 по [плану](AUDIT_PLAN_10_PARTS_2026-10-13.md).
- [ ] Перенести локальный аудит после `d0dc2227` в экспериментальную удалённую ветку с повторной сверкой head; текущий Preview старее исправлений. Не смешивать с V2 PR #12.

---

## Audit follow-up — 2026-10-13

- [x] Code/calculation audit fixes and62-file regression gate; see AUDIT_2026-10-13.md.
- [ ] Persist audit + exact Preview and record SHA/availability.
- [ ] Live V3 selected-route controls Yalta/Anapa/Taman/Temryuk↔Krasnodar/Moscow; inspect frame sequence and bypass, not just page HTTP200.
- [ ] Unify holiday/midnight tariff handling across M4 native/matrix/API/UI without applying one road's calendar to all roads.
- [ ] Resolve exact local exit/bypass geometry and complete M1/M3/regional matrix-to-route composition.

---

## CURRENT 2026-10-13 — Yalta and Anapa short-route regression

- [x] Wire V3 short A-289 selected route to finished OD lookup and conditional bypass, with synthetic Yalta/Anapa↔Krasnodar direction checks; a provisional two-frame Anapa exit estimate is visible as unconfirmed.
- [ ] Capture real `/api/v3/calculate` responses for the user's exact Yalta/Anapa↔Krasnodar endpoints on Preview. Inspect selected geometry and crossed physical frames; if the router chooses a different road, fix the route classifier instead of forcing the 800/833 estimate.
- [ ] Verify whether Anapa's exact interchange maps to the saved Varenikovskaya OD and reconcile 833 ₽ with the user's actual no-transponder route card. Keep missing candidate quote unknown until observed.

---

## 2026-10-13 — A-289 exit pairs

- [x] Preserve three physical frames and seven directly sourced/user-approved OD pairs (14 directions); persist explicit unknown Anapa/Taman partial pairs in `A289_OD_MATRIX_2026-10-13.json`; rebuild/validate complete matrix and quote adapter.
- [ ] Bind Anapa exit and Taman continuation to precise route geometry/maneuver evidence. Then test the remaining Slavyansk→Taman, Varenikovskaya→Taman, Temryuk→Taman, and every Anapa pair with a current direct operator/Yandex fastest control; fill only actual observed OD fares. The 620 city route requires its exit/re-entry control.
- [ ] Drive representative real routes in both directions through V3: Krasnodar↔Slavyansk, Temryuk, Anapa and Crimea, plus Slavyansk↔Temryuk/Taman. Inspect selected geometry, frames, exit node, fare and warning, then create exact-commit Preview.
- [x] Persisted as code `f9c092a`, exact Preview `dpl_7CfgeSqL2jfpziGSYFDcFM8nhzPN` READY; authenticated `/v3` GET200. Real route POST remains open.

---

## 2026-10-13 — Crimea Yalta route regression

- [x] In V3, add the full A-289 bridge vector to the complete M-4 corridor and add the west bypass only when its selected-route geometry matches. Incomplete A-289 evidence must produce unknown, not a partial 5,040 ₽ trip total. See `lib/v3-calculation/crimea-m4-total.ts` and dated `WORK_LOG.md`.
- [ ] Verify the actual fastest Ялта — Крым → Москва and reverse V3 API response on Preview, including coordinates, three A-289 frames, bypass crossing, and price/label. The protected Preview browser was previously redirected to login; do not claim a live route test from build alone.
- [ ] Check the current west-bypass tariff and route scope against operator/Yandex evidence: 410 ₽ is inherited from `lib/toll-data/m4.ts`, while the user recalled roughly 300+ ₽. Reconcile before treating 6,250 ₽ as validated.
- [x] Persist fix as experimental remote commit `8b8442c` and create exact-code READY Preview `dpl_EMmxvx7w6ZELCuKag9upow8Kh2Q4`; authenticated page GET 200. No merge or Production release.

---

## 2026-10-12 — phased completion plan

See `IMPLEMENTATION_PLAN_2026-10-12.md` for the nine-block execution plan and per-block acceptance criteria. Current first large block: reconcile the canonical algorithm/specification and establish a current complete paid-road registry and dated operator tariff tables. Immediate specific conflict: re-fetch the primary Avtodor M3 category-I no-transponder table and compare it with the archived Oct 1 snapshot before updating any price data. Then proceed to selected-route evidence, per-system adapters, Yandex/operator route benchmarks, full build and Preview E2E. No Production publication without explicit release decision.

---

# Nationwide paid-road calculator — next engineering blocks
**As of:** 2026-10-11. Product decision: show only the minimum-time route and price only that selected geometry; see `DECISIONS.md` 2026-10-11. No alternative-route UI. Preview remains verified on source head `3d86e02`; latest docs-only Yandex controls are recorded in `RECONCILIATION_2026-10-11.md` and `WORK_LOG.md` (commits `015a9f9`, `2b378c9`, `812628d`). Preview only; no production release. **Safety:** experiments and preview only. The requirement is not fulfilled merely by a register or reference fare list.

- [x] **Inventory and operator map (SCOPE COVERED; not tariff complete)**: 22 groups representing major federal, municipal, regional and international toll road systems. `national-registry.json`, `SOURCE_AUDIT_2026-10-09.md`. Refresh with newly opened toll roads instead of claiming a permanent authoritative census.
- [x] **Versioned conditional offline fare core (CODE IMPLEMENTED, not live)**: 8 selected operator fare groups for M1/M3/Ufa/Tolyatti/Bagration/MSD/Kazan/Udmurt bridges, zero inference from mere geometry, accurate exclusive corridors, working-day peaks, plate/taxi exception preconditions, null incomplete.
- [x] **Strict national multi-operator composer (CODE IMPLEMENTED)**: `quoteNationwideTrip` requires all paid facilities checked, rejects missing/repeated/cross-route/unregistered, partial sums never returned as totals. No live route data adapter yet.
- [x] **V2 Preview catalog + candidate coverage UI (IMPLEMENTED)**: `/v2/toll-roads` and route results diagnostics; user can see exactly which road groups require work. No price cutover.
- [x] **P0 — native combined tests and browser smoke on latest code (VERIFIED)**: Vercel build deployment `dpl_DEWDeg7fWdkM8Lcr8fK88eycsDb4` from code `6917191f`: **235/235 PASS**, Next+TypeScript+14/14 pages; actual browser run `4227d920-4a18-4992-940b-d520ca07cbcd` Moscow→Voronezh shows M4 national candidate, 7 strict PVPs, no new amounts. See `WORK_LOG.md` phase B.
- [x] **P0 — second-road M3 physical PVP E2E BOTH DIRECTIONS (DONE at selected-route matching + source sample, NOT MONEY CUTOVER)**: Real M3 three-PVP 86/136/168 both directions: all six lane OSM IDs verified via OSM API + actual same-route Valhalla, E2E Москва→Калуга and reverse, corrected 520 ₽ category-I component on the Friday audit date, never included in actual fare. **Not done:** independent operator receipt/calculator for the exact selected route and full fare cutover. See M1_M3_EVIDENCE_2026-10-09.md.
- [ ] **P0 — implement fastest-route-only selector policy in new route pipeline:** enumerate valid candidates internally, select minimum travel time deterministically, expose exactly one route, and price only its geometry. Add regressions: fastest paid vs slower free, no alternative shown, tie-break determinism, incomplete toll evidence remains unknown. Scope: new version; keep current production untouched until acceptance gates pass.\n- [ ] **P0 — resolve disputed Yandex controls before any tariff change:** exact selected geometries and gates for Kazan—Naberezhnye Chelny (90/278), SPb—Kronstadt (600/300), and directional M4 Moscow—Krasnodar (5530/5260); match date/time, then compare dated operator calculator/receipt. Treat A-289 test as unresolved because Yandex geocoded destination incorrectly. See `RECONCILIATION_2026-10-11.md`.\n- [ ] **P0 — M1 PVP46 exact OSM mapping and reverse E2E (NEXT; still open after 2026-10-11 Preview verification):** Operator marks 33–66 paid km and PVP46, but both direction OSM IDs still unknown. Try full selected-route Valhalla Moscow↔Mozhaysk/Kubinka, collect toll edge end_osm_node_id, independently verify OSM barrier/name/coords; reject bare geographic proximity.
- [ ] **P0 — M3 exact-route full receipt (OPEN)**: Category-I direct rates 480/520 ₽ and their date-bounded operator source are reconciled; verify an operator complete-trip quote/receipt and all other selected-route tolls. A 520 ₽ M3-only component does not certify an arbitrary journey or "all roads".
- [ ] **P1 — unverified non-M3 paid operator families (OPEN)**: expand true paid-edge graph proof/OD prices in ZSD, SHMSD, Mytishchi, Pskov, Khabarovsk and regional sectors.
- [ ] **P0 — official complete tariff matrices for remaining 14 groups**: prioritize ZSD, Odintsovo, Khabarovsk, Mytishchi, Ryazan, Pskov 4 sections, SHMSD/Vitebsk, Amur border bridge. Operator source links in SOURCE_AUDIT; record date, direction, all gates, category I/no transponder, historical version and holiday exceptions. Do not mistake concession operator partial table or legal maxima for exact customer fare.
- [ ] **P0 — automatic same-route nationwide paid-facility verifier**: model strictly matched OSM `toll_booth`/free-flow camera physical IDs for **all networks**, structured entry/exit/timestamp/paid edge and detected unknowns. Map matching must use the *selected* live geometry; candidate corridor proximity is NOT enough.
- [ ] **P0 — complete paid-road coverage detector**: prevent unregistered road/facility families from being classified as free. Bind urban networks (MSD/ZSD/Bagration, Mytishchi) separately from federal M1/M3/M11/M12 and regions. Account for overlapping networks (ShMSD and ZSD).
- [ ] **P1 — vehicle and transponder UX**: road-operator vehicle class based on physical dimensions/axles; user-provided Comfort/Comfort+ is a driver service class, NOT I/II/III/IV. Allow verified individual operator's native transponder plan only after tariff lookup supports it.
- [ ] **P1 — operator calendar/time integration**: timezone by road, actual passage times (not just departure), true holiday checks, weekend rules, MSD short-lived section closure changes and transit exemptions.
- [ ] **P1 — road benchmark suite**: 2+ operator-confirmed directed cases per network, full road + partial road + no-toll road, cross-network total, time boundary, same endpoint different ramps, plate/taxi exemption; compare with official journey calculator and ticket/receipt.
- [ ] **P1 — activated payment cutover**: only where all above verified, feature flag per road with previous legacy fallback only if independently justified; don't silently substitute old geometry estimate for unknown.
- [ ] **P1 — field E2E Android/desktop & Vercel Preview**: real routes in many regions; confirm no React DOM crashes, alt routes and minimum travel time sort, unknown displayed without invented zero.
- [ ] **P2 — continuous operator data maintenance**: dated snapshots, sources, change alerts and audit acceptance protocol. Deactivate stale rows instead of silently assuming valid.


## 2026-10-12 — tariff nomenclature and source refresh

- [x] Created `TARIFF_NOMENCLATURE_2026-10-12.md`: current 22-group registry mapped to tariff products/models, required route/class/payment/time inputs, known source signals and evidence state. It explicitly does not claim that 22 groups are an exhaustive national legal inventory.
- [x] **P0 — reconcile current Avtodor M3 matrix (category-I rates)**: 100/100, 190/190, 190/230 ₽; full-road example 480/520 ₽. The old 200/320/280 interpretation was higher vehicle classes. See `M1_M3_TARIFF_REAUDIT_2026-10-13.md`. Exact-route receipt and runtime route binding remain open as separate tasks.
- [ ] **P0 — finish exact current fare tables across all 22 groups:** prioritize multi-OD/conditional operators and newly changed schedules (Odintsovo from 2026-01-15; Mytishchi 1 February notice; Ryazan from 2026-10-01; ZSD; Pskov's four independent roads; Khabarovsk route matrix). Store source dates, category I and base/no-transponder profile.
- [ ] **P0 — route controls:** for each proposed live row, use only one fastest Yandex route with fixed endpoints/date/time and passenger car under 2 m/no transponder; retain full geometry and estimate as a control, then reconcile to operator's exact entrance/exit/section tariff or receipt.
- No price row is accepted from a search snippet, legal maximum, ambiguous image/table column or route-level estimate alone.


## CURRENT 2026-10-12 — blocks 1–3 progress

Completed in isolated branch:
1. Canonical algorithm contract: `ALGORITHM_SPEC_2026-10-12.md`. Open: tie-break for equal ETA and code-level conformance.
2. Scope expansion: registry now retains 22 parent networks and includes 16 individual Avtodor products (M4/M11/M3). This remains partial; split Pskov into four IDs and continue official census of regional/concession roads.
3. Tariff source audit: M3 current official page is indexed but returned HTTP 403 to direct fetch; conflicting published snapshot rows remain unresolved. Do not change stored fares or call them verified until the live dated class-I no-transponder row can be read. Most operator tariff products still lack dated complete tables.

Next execution: get primary artifacts for Avtodor current M3 and all section tariffs; identify four Pskov road contracts/decision rows; capture operator tariff versions for Odintsovo, Bagration, ZSD/SHMSD, Khabarovsk, Mytishchi, Ryazan and remaining groups. For every amount preserve category, payment mode, effective date, periods, directions/OD and source artifact. Only after block 3 expands materially, proceed with blocks 4–6 on geometry evidence and route benchmarks.


# Local recovery updates through 13.10.2026

# Следующие действия

1. Получить актуальный head/source tree experiment/toll-od-matrix-2026-10-08; чтение AGENTS/docsWORK_STATE уже выполнено connector. Прямая git-сеть не авторизована; локальная audit-ветка не равна актуальной экспериментальной.
2. Прочитать текущие V3 route/API/result types и экспериментальные адаптеры; подключить engine/quote.cjs через точные routeId, traversalId, локальные passage date и тарифный профиль.
3. Отобразить displayLabel в UI/API/деталях/копировании. Не позволять нескольким перекрывающимся представлениям одной платной группы начисляться одновременно.
4. Запустить quote.test.cjs, матричный валидатор, требуемый full gate/build актуальной ветки и API/browser проверки.
5. Сохранить изменения и handoff в целевую ветку; выпуск тестового preview после проверок.

Current: V3 API/UI/copy wired, native305/305 + M4adapter6/6 + TS/build/local HTTP PASS. Next: remote persistence/Preview, live route verification; extend other-road matrix adapters. Do not call full nationwide matrix-to-route integration complete.

M12 dated-vector adapter now implemented; expired Shali blocks stale native fallback. Next: exact follow-up Preview, then remaining M11/CKAD/other-road adapters and live route/browser verification.

Yalta/Anapa → Krasnodar short-route fix: experimental commit ed34c4c, Preview dpl_CUGKzMqTn6D8H4cjoDTDpkNtD3z5 READY/GET200. Next verify actual selected route POST and exact Anapa exit; no main/Production.


## 2026-10-13 stage10 current priority
Publish/test exact UI+recovery Preview. Then implement full directed M11 southbound head/mainline/tail and complete M12 selected-route coverage for Ufa with authoritative versions; screenshot amounts only comparisons. Run browser when Chromium available, same-route Yandex duration/fare controls, consolidated final audit. See STAGE10_UI_USER_ROUTES_AUDIT_2026-10-13.md. Full three numeric fees OPEN.

Preview UI/recovery published and verified: a38c50e3, dpl_DyQNDZRP7MEn6F1L1ryATYhhc7rZ READY,530 tests/build/GET200. Publication task complete; next full directed M11/M12 and working browser. Three screenshot fares still OPEN.


## Historical blocker note 2026-10-13 — recovery artifacts unavailable in this checkout
The old checkpoint named `recovery/road-availability-patch.json` and `ROAD_AVAILABILITY_RECOVERY_2026-10-13.md`, but neither path exists in this checkout. Do not assume those artifacts can be applied. For endpoint-only implementation findings use `ENDPOINT_ONLY_IMPLEMENTATION_2026-10-13.md` and the tracked branch source/history. This historical note does not claim the recovery artifacts were reconstructed. Ufa/Petersburg full toll totals remain OPEN; no Production.
## 2026-10-13 — исполнение шестиступенчатого плана

1. [IN PROGRESS] Этап 1: каталог `tariff-products.json`, отчёт `stages/01-baseline-and-product-boundaries.md`; сверить GitHub HEAD `1642c76` с локальной веткой по дереву/SHA при доступном Git, выбрать единую удалённую ветку. Проверить тест каталога и полный `npm run build` на итоговом SHA.
2. [PENDING] Этап 2: разложить 428 изолированных М-4 конфликтов по первопричинам, установить операторские точные пары/даты/профили; валидатор матрицы и `stages/02-matrix-and-provenance.md`.
3. [PENDING] Этап 3: заменить объединённый `m4_a289` и общий `regional` на независимые `productId`, исключить legacy денежный fallback; контроль М-4 + А-289 + обход, unknown и дублей; `stages/03-v3-composition.md`.
4. [PENDING] Этапы 4–6: полный gate и реальные маршруты, Preview на проверенном SHA, затем только после прямого запроса официальный выпуск. Критерии и пути — `DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md`.
