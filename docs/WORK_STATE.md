## CURRENT 2026-10-15 — восстановление после обрыва сессии

DONE: код checkpoint2255a46 закреплён в ветке PR14. Прежний checkout /workspace/scratch/31a127bf701a/mezhgorod-calculator отсутствует; running exec cell78 недоступен, память transport progress очищена. Новый checkout создан в /workspace/scratch/a31a0edde6c0/repo. Точный механизм удаления старого каталога не установлен; это не тарифная ошибка.

RECOVERED: из215 объектов более нового local checkpoint86702c9 в GitHub найдены144;71 не были перенесены. Создан серверный recovery tree675c28083684221a82acc8f25f2e0beccbc29144. Сохранены полные captures27 разных региональных OD-кейсов плюс дополнительный pilot; не найдены13 regional captures (3LNR+10Zaporizhzhia). Оригинальный batch manifest фиксирует40 исполненных случаев, но наличие manifest не заменяет отсутствующую трассу. Счётчики audited из corpus нельзя считать полным сохранённым покрытием до проверки evidence links.

LIMIT: последние дорожные прогоны и часть региональных данных оставались только в исчезнувшем checkout. Не объявлять их восстановленными или заново проверенными. Предыдущий наблюдавшийся отчёт имел105 разных случаев, но его файл не сохранился; точный итог после обрыва неизвестен. Код app/lib/тарифов и Production не менялся. Полный старый build654 PASS лог сохранился; после восстановления source/tests требуется новая проверка.

NEXT: materialize recovery snapshot, проверить все evidence links, восстановить summaries/replays из27 имеющихся raw captures; заново запросить только13 утраченных regional captures. Затем продолжить дорожные группы, сохраняя каждый завершённый блок в GitHub сразу. Подробности: [этап17](../experiments/nationwide-tolls/stages/17-session-recovery-2026-10-15.md), [availability manifest](../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/recovery-manifest.json).

---

## CURRENT 2026-10-15 — systemic audit replay исправлен, запущены партии

IN PROGRESS: продолжение этапа 15. Исправлен дефект audit harness: архив писался до дополнительных запросов тарификации М-4. Новый schemaVersion2 архив сохраняется после pricing; offline replay отмечает недостающие ответы, сохраняет Retry-After и сверяется с live итогом на той же дате. Pilot Гранитное→Москва: четверг unknown `m4_crossing_profile_changes`, субботний replay теперь priced 4 640 ₽ вместо ложного unknown старого неполного архива.

DONE: первая interleaved regional партия40/40, по10 каждого региона (40из160), у всех complete trace/same-date parity. RUNNING: одиночные серии расширены до9групп/90planned cases; M4/A289/M3 по10 прохождений, M11 выполнены10attempts, одна trace502 требует повтора. Exact progress/results: [batch manifests and REPORT](../experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/REPORT.md). До окончания не считать запланированные строки выполненными. Добавлен дорожный корпус 180 planned OD-контролей /18 групп; inventory проверяет 22 registry rows, 10 lower-bound-qualified rows (включает M11 child), 12 count-unresolved. Census и полный аудит не закрыты.

VERIFIED: pilot same-date/weekend replay complete; focused5/5 и targeted ESLint PASS. Промежуточный full build audit653/653 + quote/API/Next/static16/16 PASS; после добавления пятого теста итоговый full build запущен повторно, результат пока не объявлен.

NEXT: завершить две партии, пересобрать REPORT, записать окончательные проверки/commit/remote state, затем оставшиеся regional cases и одиночные дороги. По принятому решению изменения тарифной логики обсуждаются после аудита. [Подробный этап 16](../experiments/nationwide-tolls/stages/16-systemic-audit-replay-integrity-and-batches-2026-10-15.md). App/lib/матрицы/Production не менялись.

---

## CURRENT 2026-10-15 — системный аудит дорог начат

USER-APPROVED SCOPE: одиночные платные дороги (все системы с ≥3 физическими ПВП, включая incomplete price rows) → пары → тройки → максимально длинные цепочки; будни/выходные; 10–20 прогонов на крупный сегмент/пару; минимум 40 реальных маршрутов с началом в каждом из ДНР, ЛНР, Запорожской и Херсонской областей; live provider response + saved trace + offline replay; ordinary-road gaps допустимы. Ожидаемую дорогу засчитывать только при пересечении выбранной геометрией.

IN PROGRESS: создано 160 региональных OD-пар (40/регион) и 16 групп дорожных коридоров; исполнена 1 из 160 региональных пар, дорожные группы ещё требуют прогонов. Live Донецкая область/Гранитное—Москва: Valhalla 1,256.6 км, toll trace complete; итог unknown из-за M4 passage profile. Weekend offline replay этого же ответа также unknown из-за неполной локальной проверки M4. Для длинного Краснодар—Санкт-Петербург через контрольные точки ЦКАД live OSRM 2,267 км, trace complete, плюс 2 offline replay на четверг/субботу. Там CKAD adapter отклоняет arc по `ckad_arc_length_out_of_range`; четверговый replay дополнительно даёт `m4_crossing_profile_changes`. Это находки для дальнейших серий, не исправленные и не обобщённые. [Этап 15 и captures](../experiments/nationwide-tolls/stages/15-systemic-road-route-audit-2026-10-15.md).

DONE: генератор корпуса проверен: DNR/LNR/Zaporizhzhia/Kherson 40 каждый (160 всего); статус live-кейса сохраняется при регенерации. Long-chain source capture и replay на two date windows плюс региональный capture/replay сохранены под `experiments/nationwide-tolls/source-snapshots/`. Product code не менялся; broad build не запускался. Generator and route-case runner targeted ESLint PASS, corpus count/unique-ID checks and `git diff --check` PASS.

NEXT: (1) инвентаризировать и подтвердить все дороги, у которых ≥3 физических ПВП; (2) дополнить route corpus городскими контролями для 10–20 live runs per qualifying road and adjacent pair; (3) выполнить 160 regional pairs дозированными партиями, затем triples/max chains and supplemental airports/important points; (4) собрать и обсудить findings до исправлений. Подробные критерии/decision — [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md), executable list — [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md), полный журнал — [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md).

## CURRENT 2026-10-15 — остаток Яндекс не привязан к М‑4

USER REQUEST: подробно объяснить происхождение 10 240 / 5 424 / 4 816 и не выдавать агрегатный остаток за тариф конкретного участка без установленного состава маршрута.

FINDINGS: 10 240 ₽ — Yandex Maps approximate total for Krasnodar city center → Saint Petersburg city center (38.975313,45.035470 → 30.314494,59.938676), about 2,060 km / 23 h 57 min. Card lists M‑4, E115, MKAD, M‑11 and ZSD, but no exact paid trace/PVP sequence. 5 424 ₽ was independently summed from saved V3 long-chain components: M‑11 15–58 1,130 + M‑11 58–679 3,900 + M‑11 tail 94 + ZSD zone 1 300. Thus 4 816 ₽ is only arithmetic difference, not a Yandex quote for one road or matrix vector. Assigning it to `m4-1223 → m4-71` was an unsupported inference. Existing M‑4 whole-vector matrix values are 5,040 ₽ weekday / 6,090 ₽ weekend, also inconsistent with that residual.

CORRECTION COMPLETE: removed the unsupported 4,816 ₽ runtime override from the M‑4 adapter and its regression tests. The 10,240 ₽ Yandex estimate remains scoped to the exact Krasnodar→Saint Petersburg whole route. Stage 14 records the provenance of all three numbers and why the remainder cannot be identified as one road/vector yet.

VERIFIED: focused M‑4 tests 16/16 PASS; full `pnpm build` audit649/649, quote/API, TypeScript/Next and static16/16 PASS; `tsc --noEmit`, targeted ESLint and `git diff --check` PASS.

REMOTE: correction code commit `c0fbe4a` and audit/docs commit `da5a8b2` published to PR14; PR remains open/draft/mergeable. Exact-head GitHub Actions run `38709409072` is in_progress.

NEXT: record exact-head Actions conclusion. Preserve the whole-route Yandex estimate; do not treat the 4,816 ₽ arithmetic remainder as a component fare without a matched trace and complete vector accounting.

---

## PREVIOUS CURRENT 2026-10-15 — обновлены направленные суммы Яндекс для СПб↔Краснодар

USER DECISION: использовать показанную Яндекс Картами сумму для конкретного выбранного маршрута. Не добавлять пользователю пометки о квитанциях.

YANDEX REFRESH: exact city-center route snapshots обновлены live: СПб→Краснодар ~11 325 ₽ (1 290 mi, 1д1ч3м); Краснодар→СПб ~10 240 ₽ (1 280 mi, 23ч57м). Подробности, road steps и сравнение с прошлым снимком — [этап 13](../experiments/nationwide-tolls/stages/13-yandex-route-refresh-2026-10-15.md) и [JSON capture](../experiments/nationwide-tolls/source-snapshots/yandex/2026-10-15-live-route-refresh-1109.json). Это принятие сумм для указанных map routes; распределение по участкам и runtime V3 замена не подтверждены.

DONE: exact-coordinate V3 API compare Краснодар→СПб завершился HTTP 200: 2 061,4 км / 1 581 мин, toll unknown из-за неполной оценки М-4; Яндекс — ~2 060 км / 23ч57 / ~10 240 ₽. Добавлен runtime fallback для пяти принятых направленных оценок Яндекс по координатам, дате снимка и длине (±5%); сумма отображается как оценка всего маршрута, не разбивается на М-4/М-11/ЗСД.

VERIFIED: focused tests 3/3; `pnpm build` audit649/649, quote/API, TypeScript/Next, static16/16 PASS; `tsc --noEmit`, targeted ESLint, JSON parse and `git diff --check` PASS. Exact V3 API reverse response inspected: HTTP200, `tolls.amount=10240`, status `priced`, source segment identifies full Yandex route. [Этап 13](../experiments/nationwide-tolls/stages/13-yandex-route-refresh-2026-10-15.md).

REMOTE: code/evidence commit `cac3d72f65e35faa71abf82c955ba798ca7488cf` is published in PR14; PR remains open/draft/mergeable. GitHub Actions run `38705180027` (`Special territory geometry and pricing`) for this exact code SHA is `in_progress`.

NEXT: check run `38705180027` to conclusion and record it. Moscow→Kazan has no displayed Yandex amount; unmatched endpoints/date/length do not receive map fallback.

DONE: предыдущий блок удалил публичные предупреждения о квитанциях; API не раскрывает внутренние `priceConfirmation`/`displayLabel` и очищает такие суффиксы из сегментов. Тесты/build и PR14 состояние описаны ниже.

---

## CURRENT 2026-10-15 — принятие Яндекс сумм и удаление пометок о квитанциях

USER DECISIONS: принимать сумму, показанную Яндекс Картами, для соответствующего выбранного маршрута; не показывать пользователю формулировки о неподтверждении тарифа квитанцией/оператором/провайдером. Для М-11 679–684 действует выбранная сумма 94 ₽.

YANDEX EVIDENCE: ЗСД Благодатная→Приморский ~600 ₽ и обратный маршрут ~900 ₽ (геометрия различается); Казань→Москва ~4 400 ₽, Москва→Казань сумма не показана; быстрейшие СПб→Краснодар ~11 363 ₽ и Краснодар→СПб ~10 910 ₽. Все числа сохранены как суммы именно этих картографических маршрутов в [этапе 12](../experiments/nationwide-tolls/stages/12-yandex-live-route-estimates-2026-10-15.md) и [снимке Яндекс](../experiments/nationwide-tolls/source-snapshots/yandex/2026-10-15-live-route-estimates.json).

DONE THIS BLOCK: убраны пользовательские пометки «Стоимость не подтверждена», «не подтверждена оператором/провайдером» и передача `priceConfirmation`/`displayLabel` в V3 API; API также очищает такие суффиксы из строк toll segments. Для ручной цены пишется только, что она введена вручную. Если суммы реально нет или карта не показывает цену, интерфейс говорит, что стоимость неизвестна, не выдавая частичную сумму за полную. Внутренний fail-closed расчёт неизвестных участков сохранён.

LIMIT: Яндекс route totals не распределяются по другим геометриям или отдельным тарифным ячейкам без точного route/gate match. Москва→Казань без показанной суммы остаётся неизвестным. Следующий шаг — сопоставление сохранённых картографических маршрутов и gate scope с V3; затем ЗСД дальше zone1, M-12↔ЦКАД и оставшиеся `unknown-paid-road` события.

VERIFICATION: focused tests 27/27 PASS; `pnpm build` — 646/646 audit, quote/API, TypeScript/Next и static16/16 PASS; targeted ESLint — 0 ошибок, 1 предупреждение `analyticsVersion` в `app/v2/components/use-v2-calculation.ts`; `git diff --check` PASS. Код предыдущей части опубликован в PR14: `6038bb2b81fd2607b63651b8307fbf290a2beb86`. API segment sanitizer и live comparison опубликованы commit `bb355fb7b60a0c48b1629cdf4617dbb0dad2b755`. PR14 открыт/draft/mergeable, PR description обновлён. Actions run `38701853395` для code SHA `6038bb2` завершился success; точный новый run `38703246952` для `bb355fb` — `in_progress`. Локальная ветка синхронизирована; docs-only status refresh следует после этого блока. No merge/main/Production/Android changes.

NEXT: exact-SHA Actions run `38701853395` is still pending on code SHA `6038bb2`; docs-only follow-up is `25b918bba11c4fd9ed1f9097620bfb8e166a0007`. Live V3 comparison is recorded at [route comparison](../experiments/nationwide-tolls/source-snapshots/yandex/2026-10-15-v3-route-comparison.json). Closest possible binding candidates are exact-coordinate ZSD controls (~600/900 ₽), but V3 still detects unknown ZSD and route trace equality is not proven. Next, resolve ZSD route-level binding using exact trace; then exact M12/CKAD and SPb↔Krasnodar map-route matching. Keep genuinely unknown toll amounts fail-closed without receipt language.
---

## CURRENT 2026-10-15 — длинная трасса восстановлена после HTTP 429

DONE: Valhalla toll-trace fanout reduced from 3 to 2; each chunk now retries up to twice with bounded exponential fallback (1s/2s), respecting `Retry-After`. Incomplete/persistent failures still remain unknown. Long-chain capture now records the provider's `Retry-After` header.

VERIFIED: focused retry tests 4/4; `pnpm build` audit 646/646 + quote/API PASS + TypeScript/Next PASS + static16/16 PASS; targeted ESLint and `git diff --check` PASS. Fresh SPb→Krasnodar via Moscow validation completed all 15 chunks; audit priced all detected products, tail component =94 ₽, calculated totals 10 464 ₽ weekday / 12 334 ₽ weekend. Provider pricing confirmation remains `unconfirmed` and the user-facing warning remains; do not call the total independently tariff-confirmed. Prior capture had 1/15 chunks fail after HTTP 429 twice. [Stage 11](../experiments/nationwide-tolls/stages/11-valhalla-rate-limit-and-reverse-chain-2026-10-15.md).

REMOTE: implementation/evidence published in PR14 at code commit `e87b7b5057984efbdd1688d56e5ee69e93997445`; PR remains open/draft/mergeable. GitHub verify job succeeded; live_probe run `38683370889` is still in progress. Vercel deployment READY, authenticated `/api/version` confirms exact SHA and Preview environment, `/v3` returns 200. Local branch is synchronized and clean.

NEXT: wait for Actions live_probe conclusion. Afterwards reconcile remaining ZSD scope and fare-source effective dates before any runtime extension; keep current unknown behavior outside reviewed zone1.

---

## CURRENT 2026-10-15 — smoke exact Preview and fresh reverse chain

DONE: latest PR head `b555be97c722b9eadc74780986edb783789e6c41` deploy READY; authenticated Preview `/api/version` returned HTTP 200 with exact head SHA/environment `preview`; `/v3` returned HTTP 200. Fresh OSRM reverse chain SPb→Krasnodar via Moscow confirms `m11-679-684`=94 ₽, while full total correctly stays unknown because ZSD trace is incomplete and `unknown-paid-road` remains. Raw live response/capture hashes and path are retained in [stage 10](../experiments/nationwide-tolls/stages/10-preview-smoke-and-fresh-reverse-chain-2026-10-15.md).

CI: Actions run `38682163789` for latest docs tip and `38681974174` for runtime SHA were still `in_progress` at last poll; no hosted CI success claimed. The unauthenticated curl attempt hit Vercel protection (302), then authenticated Vercel fetch succeeded; do not treat 302 as API pass.

NEXT: await exact-tip Actions; investigate/resolve missing ZSD zone(s) and unknown paid-road trace without weakening fail-closed total. The 94 ₽ tariff decision is closed. PR14 remains open/draft/mergeable; no main merge, Production, or Android change.

---

## CURRENT 2026-10-15 — хвост М-11: 94 ₽ утверждены и внедрены

USER DECISION: для участка М-11 679–684 применять категорию I по 94 ₽ во всех направлениях; это выбранная строка вместо 56/38, не сумма и не 94+56. Правило действует для выбранного маршрута, когда существующая строгая M-11 геометрия подтверждает продолжение за ПВП 679. Устаревшая дата до 04.09.2026 и нераспознанная граница остаются unknown. Решение: [DECISIONS.md](../experiments/nationwide-tolls/DECISIONS.md).

DONE: добавлен `matrixM11TailComponent`; интегрирован как отдельный `m11-679-684`; обновлены тесты fail-closed/даты/обе стороны; тарифный snapshot помечен как runtime-approved по явному решению пользователя. Близость airport gate сама по себе не начисляет плату, направление аэропортовых рамок остаётся неоднозначным.

VERIFIED: focused M-11/road suites 28/28; `pnpm build` — audit 645/645, quote/API PASS, TypeScript/Next build PASS, static generation 16/16; targeted ESLint и `git diff --check` PASS. Оба Krasnodar↔SPb записанных live captures повторно рассчитаны offline: M-11 tail = 94 ₽, итог 10 464 ₽ weekday / 12 334 ₽ weekend, полный audit priced. В обеих Kazan↔SPb трассах tail также =94 ₽ в обоих направлениях; общий итог остаётся unknown из-за отдельного ZSD beyond zone1.

SCOPE LIMIT: при аэропортовом proximity без доказанного строгого продолжения tail resolver денег не добавляет; маршрут без границы основной М-11 пары не получает полный результат только из-за 94 ₽. Это ограничение детекции пути, не открытый вопрос тарифа. [Этап 09](../experiments/nationwide-tolls/stages/09-m11-tail-evidence-audit-2026-10-15.md).

REMOTE: runtime/evidence commit `019859828de9aa3edbfcbf76b0be1fe7baebbb4e` is published in PR14; the current PR tip also includes the docs-only handoff refresh. PR open/draft/mergeable. Vercel is success for runtime commit 0198598; Vercel is pending for latest docs-only tip; Actions run 38681974174 remains in progress for the runtime commit. Branch `fix/v3-missing-route-prices-2026-10-15`. No merge/main/Production/Android changes. NEXT: await exact runtime Action completion, then fresh long-chain/API acceptance. Other independent blockers: additional ZSD zones, CKAD endpoints/context and M12↔CKAD pair.

---

## CURRENT 2026-10-15 — MMK М11 и первая зона ЗСД привязаны

DONE: пользователь явно разрешил отправку кода и evidence («Разрешаю. продолжай»). Предыдущий remote blocker resolved: точный tree опубликован commit16fc7213, draft [PR14](https://github.com/4regodatbe-cpu/mezhgorod-calculator/pull/14), Actions38644084416 success; Vercel status success. Новая работа в той же fix ветке: направленные MMK north gates дают head280 север/200 юг на контрольной дате; первая зона ЗСД даёт300 по официальной таблице владельца, только при полном подтверждённом охвате.

VERIFIED: focused29/29, full642/642 + quote/API + Next/TypeScript PASS; lint/diffcheck PASS. 10 записанных цепочек повторены offline; новый live Краснодар→Москва→СПб блокируется только tailМ11 679–684. Live Волноваха→Краснодар comfort22907/roads850. [Этап07](../experiments/nationwide-tolls/stages/07-publication-and-mmk-2026-10-15.md), [этап08](../experiments/nationwide-tolls/stages/08-zsd-zone1-2026-10-15.md).

OPEN: tail679–684/airport, другие зоны ЗСД, ЦКАД context/endpoints и М12↔ЦКАД. Unknown не0; частичная сумма не полная. NEXT: доказать физические границы tail и оплату, затем fullypriced chain/reverse/parity. Main/Production/Android не менялись. Исторические BLOCKED записи ниже superseded явным разрешением и публикацией.

---

## CURRENT 2026-10-15 — длинные цепочки проверены, сбои локализованы

DONE: 8 живых прогонов 7 цепочек Казань/Краснодар↔СПб через Москву, Казань/Краснодар→СПб через ЦКАД;16 offline replays тех же ответов с обычной/переходной датой. Внутренний componentAudit показывает точный блокирующий продукт. Исправлены unnamed М4/М11/ЗСД IDs, независимый mainlineМ11 послеЦКАД и пропуск partialhead, bounded429retry. [Подробный этап](../experiments/nationwide-tolls/stages/06-long-chain-route-audit-2026-10-15.md).

VERIFIED: focused38/38, finalfull635/635+quote/API+Next/TS PASS(exit0),targetedlint/diffcheckPASS. Каждый expectedroad найден. Повтор liveКазань→Москва→СПб tracecomplete; итог всё ещёunknown из-заtail/ЗСД. Source index/captures/logs сохранены в samefixbranch,parent29a7c4d.

OPEN/NEXT: partialheadМ11 ЦКАД/ПВП47, tail679–684/airport, ЗСДoperatorzonefare, generalЦКАД boundaries/context и М12↔ЦКАД pair;profilepaymentclocks. Ни одна partialсумма не выдана full. Все дорогиРоссии/полныйСПб итог не объявленыготовыми. Next: exactsourcebindings этих стыков и fullypricedmulti-roadchain, затемlive/fullgate.

REMOTE BLOCKED: прежнийgitpush отклонёнauto-review; explicitexportauthorization ещёне получена, повторногоpush/обхода нет. Код/evidence сохранены локально. Main/Production/Androidне изменены.

---

## CHECKPOINT 2026-10-15 — LOCAL DONE / REMOTE PUSH BLOCKED

Code/evidence commit972a35a на fix/v3-missing-route-prices-2026-10-15. Full627/focused22/build/targetedlint PASS. [Подробный этап](../experiments/nationwide-tolls/stages/05-missing-route-prices-2026-10-15.md).

BLOCKED: gitpushoriginfixветки автоматически отклонён review: destinationunverifiedGitHubremote и userfixrequest не сочтён явным разрешением экспорта кода/routeevidence. Обход через connector не выполнялся; PR/Preview/CI дляfix не созданы. Требуется явное подтверждение отправки подготовленного коммита в4regodatbe-cpu/mezhgorod-calculator. LocalGit writable, сохранениевпроекте выполнено; remote persistence не заявлена.

NEXT после подтверждения: pushfixbranch/create draft PRagainst audit/v3-matrix-provenance-2026-10-14, verifyHEAD/CI. Дальнейшая sourceработа Петербургtail/ЗСД остаётся INPROGRESS по этапу05. Production/main/Androidнеизменены.

---

## CURRENT 2026-10-15 — ложные блокировки М4 исправлены, Петербург частично открыт

DONE: точные savednodeIDs распознают unnamedМ4 booths; положительная полная trace выбранной геометрии повторно используется для крайнихМ4границ; V3 ручная сумма дорог экран/copy восстановлена, copy сохраняет base при неизвестных дорогах. Live Донецк→Краснодар20995+850, Волноваха→Москва55299+3050, Волноваха→Краснодар22907+850 (comfort; roadsunconfirmed). [Подробный блок](../experiments/nationwide-tolls/stages/05-missing-route-prices-2026-10-15.md).

VERIFIED: focused22/22; finalfull627/627+quote/API+Next/TS PASS(exit0),targetedeslint/diffcheckPASS. Branchfix/v3-missing-route-prices-2026-10-15,parentc1421f8/PR13headverified. Source/evidence/checklog в репозитории. Нового hostedPreview/CI ещёнет.

OPEN/NEXT: полный Петербургский итог unknown: М11tailphysicalscope/ЗСДoperatorPDF+zones; другие unnamedbooths и М4profilechanges. База поездки отображается/копируется; partialдорогнеfull. ИсточникМ11 есть, ЗСДPDF403; ценынеугадывались. Следующийблок — точные готовые пары tail/ZSD и реальная Петербургприёмка. Main/Production/Android не изменены.

---

## CURRENT 2026-10-14 — GitHub/Preview опубликованы, основные CI и живые проверки PASS

DONE: snapshot37d55f6/tree943b7806 точно совпал с проверенным3b675df; CI correction afdc2c4 опубликован. Draft PR13 → integration baseline, без merge. Оба Preview READY/version SHA подтверждён. Vercel621/621+Next/TS PASS. Actions38624425083 build/API smoke PASS; PR verify job116059876836 PASS. Live Анапа620 diagnostics parity, Ялта800 с предупреждением; Москва—СПб unknown/null без частичного полного итога. Desktop UI и фактическое копирование обеих форм результата проверены. [Подробный отчёт](../experiments/nationwide-tolls/stages/04-preview-and-live-acceptance-2026-10-14.md).

IN PROGRESS: расширенная приёмка; optional PR live_probe ещё выполнялся при наблюдении. Локальная рабочая audit/v3-published-checkpoint-2026-10-14 отслеживает GitHub audit/v3-matrix-provenance-2026-10-14. Исходная локальная Git-история сохранена в archive-ветках, GitHub содержит все source/PDF/журналы итогового дерева.

OPEN/NEXT: mobile, free/live отказ trace/профильные границы/остальные дороги; source/geometry gaps включая М11tail/ЗСД. Матрица5076/10undated, каталог24 не менялись. Полное покрытие и официальный release не заявлены. Main/Production/Android не изменены.

---

## CURRENT 2026-10-14 — сводный аудит V3 и обязательная проверка платных событий

DONE: цена больше не зависит от diagnostics. Обычный и специальный V3 проверяют платные события выбранной геометрии; неполная trace блокирует полную сумму (unknown/null). UI принимает один согласованный маршрут. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-consolidated-v3-audit-2026-10-14.md).

VERIFIED: focused 27/27, новые API tests 5/5; полный build 621/621 + quote/API + TypeScript/Next PASS. Исходный HEAD a662b78, ветка audit/v3-matrix-provenance-2026-10-14. Матрица 5076/10 undated и каталог 24 не менялись. Локальный HTTP smoke не завершён из-за среды; нет нового CI/Preview/Production.

OPEN/NEXT: сохранить audit-ветку на GitHub, проверить Preview SHA и живые API/UI/задержки обязательной trace. Источники/география М4, М11, новая Шали, ЦКАД context/Small Vyazemy, регионы/Псков и 10 дат остаются открытыми. Этап 3 не закрыт; полное покрытие России не заявлено.

---

## CURRENT 2026-10-14 — ЦКАД/региональные продукты и paid completeness guard

DONE:13 распознанных региональных product IDs вместо broad денежногоregional; Псков/неопознанноеpaidсобытие явноunknown. Матched М4/М11/М12/ЦКАД теперь не пропускаются при известнойцене другойдороги (исправленpartial620 bug). Aliasesодногоbooth не создаютдополнительнуюдорогу. SmallVyazemy отдельноunknown. ВерхнийЦКАД geometry-only безnativeденег+readyquote/window;16conditionalcellsнеразблокированы. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-v3-ckad-regional-identity-and-paid-evidence-2026-10-14.md).

VERIFIED: finaltargeted20/20,new10/10,full616/616+quote/API+TypeScript/NextPASS(exit0),diffcheckPASS. PDF56pages2/3scope/hashreview сохранён. Branch audit/v3-matrix-provenance-2026-10-14,parentdf9120a;remoteintegration свежийa5c892e67af4b050f53bf2211b62feac34d6df6c. Матрица5076/10undated,каталог24 unchanged. Нетpush/CI/PR/Preview/Production.

OPEN/NEXT: консолидированныйaudit активногоV3/releasecriteria и blockers, thenstage4 API/UI/реальныемаршруты. 120minоператорскийконтекстЦКАД,Small/region physicalboundaries,4Псковдороги,10dates,новаяШали/М12anchors иМ11ПВП21/p147/localheads/tail ещёopen. Этап3 не закрыт автоматически616тестами; полноепокрытиеРФ не заявлять.

---

## CURRENT 2026-10-14 — М12 outer boundaries и cleanup V3 завершены

DONE: активный V3 М12 получает ready pair по крайним калиброванным границам, без native priced/tolls и промежуточной continuity/inferred суммы. Date/version window проверяется; старый832 не подменяет новуюШали. Dead crimeaM4Total и hidden bypass money А289 удалены; А289 только own price/allDays/strictdate. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-v3-m12-outer-boundaries-and-helper-cleanup-2026-10-14.md).

VERIFIED: focused29/29,new8/8,finalfocused30/30; finalfull606/606+quote/API+TypeScript/NextPASS(exit0),diffcheckPASS. First cleanup reason/TypeScript проблемы исправлены, описаны. Branch audit/v3-matrix-provenance-2026-10-14,parent10bc704; remoteintegration повторно a5c892e67af4b050f53bf2211b62feac34d6df6c. Матрица5076/10undated unchanged. Нет push/CI/PR/Preview/Production.

OPEN/NEXT: ЦКАД conditional context/SmallVyazemy, самостоятельные regional productIds/география; затем finalactiveV3 audit и этап4. М12 geography частична/новаяШали unbound, М11 ПВП21/локальные endpoints/p147/tail scope open. Этап3 не завершён, fullRussia coverage не заявлено.

---

## CURRENT 2026-10-14 — М11: head/mainline/tail разделены в активном V3

DONE: готовый направленный head quote вместо native денег; собственный календарь/01:00/06:00 и время оплаты на выезде. Северный/южный полный московский mainline использует крайние p58/p679 без p593 prerequisite. На юг ПВП21 ещё без координат — стабильное окно оплаты, при смене профиля unknown. Верхний V3 добавляет head/mainline/tail отдельно; неоценённый хвост блокирует итог в обоих направлениях, включая mainline-only поездки. 210 head ячеек заново совпали с official PDF. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-v3-m11-products-and-payment-time-2026-10-14.md).

VERIFIED: final focused25/25, полный build601/601 + quote/API + TypeScript/Next PASS(exit0), PDF210/210, diffcheckPASS. Branch audit/v3-matrix-provenance-2026-10-14,parent7d3427f; remoteintegration повторно a5c892e67af4b050f53bf2211b62feac34d6df6c. Два primaryPDF+SHA сохранены. Нет push/CI/PR/Preview/Production. NativeV2 production не менялся.

OPEN/NEXT: М12 старый priced eligibility/outer geometry, новая Шали; ЦКАД context/SmallVyazemy, региональные product bindings,10 строк без даты. М11 ПВП21 точные координаты, локальные head endpoints,p147/mainline geography,tail/airport scope ещё открыты. Этап3 не завершён; next М12 без денежных/промежуточных native prerequisite.

---

## CURRENT 2026-10-14 — М4, А289 и обход: самостоятельные компоненты V3

DONE: активный верхний V3 передаёт `m4`, `a289`, `krasnodar-west-bypass` вместо денежного `m4_a289`. Обход использует собственную матрицу, направленные OSM ПВП 46 и дату/профиль; старое широкое совпадение без пересечения не даёт цену. Дубли/старый агрегат вместе с новыми продуктами блокируются. Архив и SHA источника сохранены. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-v3-southern-products-2026-10-14.md).

VERIFIED: focused 21/21, новые 7/7, финальный полный build 592/592 + quote/API + TypeScript/Next PASS, exit0. Первые ошибки VM-теста/JS типа исправлены и описаны. Branch audit/v3-matrix-provenance-2026-10-14, parent 1d09027; integration remote повторно проверен a5c892e67af4b050f53bf2211b62feac34d6df6c. Нет push/CI/Preview/Production. Цены обхода остаются оценками с предупреждением.

OPEN/NEXT: отдельный готовый тариф головного М11 вместо native head money, независимые head/mainline/tail. Этап 3 не завершён. Новая Шали, М11 tail/airport scope, ЦКАД context, Small Vyazemy, региональные bindings и 10 строк без даты открыты. Старые совместимые helper-ы не используются в активном денежном пути обхода, но не удалены.

---

## CURRENT 2026-10-14 — V3: удалены прямые денежные подстановки

DONE: верхний расчёт М4/М11/М12/ЦКАД не заменяет отсутствующую матрицу production-суммой; композитор М4/А289 также требует матричный М4. Геометрическая оценка остаётся диагностикой. Неполная бесплатная диагностика не даёт 0; неизвестная цена сериализуется в null. Общий сборщик защищён от дробных/небезопасных сумм и переполнения. [Подробный отчёт](../experiments/nationwide-tolls/stages/03-v3-upper-pricing-fallbacks-2026-10-14.md).

VERIFIED: focused 30/30, новые 4/4, полный build 585/585 + quote/API + TypeScript/Next PASS, exit 0. Branch `audit/v3-matrix-provenance-2026-10-14`, parent `4e7ff40`; remote integration повторно проверен: `a5c892e67af4b050f53bf2211b62feac34d6df6c`. Нет push/CI/Preview/Production.

OPEN/NEXT: этап 3 продолжается. Разделить агрегированные ID М4/А289/обхода; привязать границы обхода и заменить старую цену `M4`. Затем собственная матричная цена головного участка М11 и раздельные mainline/tail. Новая Шали, ЦКАД context, Small Vyazemy, региональные bindings и 10 строк без доказанной даты остаются открытыми. Полное устранение старых денежных зависимостей не заявлено.

---

## CURRENT 2026-10-14 — М12 directpair, независимыепродукты и Пулковоguard

DONE: adapterМ12 получаетготовуюнаправленнуюоператорскуюпару изprovedboundary вместоfullRVPvector и игнорируетnativemoney; старыйgeometryeligibilitygate сохраняется. Общийquote различаетM4 иотдельныйDZOK, не допускаетдвойныепредставленияоднойдороги/несогласованныйproductId. ЦКАДconditionalguard уточнён28→16;12неотносящихсяM12north-sidepairs разблокированы. OSMAPI:2реальныеairportgantries Пулково найдены/архивированы(hash). V3 положительнодетектируетих какнеоценённыйпродукт: APIunknown/null,дажеприproviderfree; числовые38/56/94 не активированы. SmallVyazemy добавлен отдельнымproduct; каталог24. [Подробныйотчёт](../experiments/nationwide-tolls/stages/03-directed-pairs-and-physical-product-guards-2026-10-14.md).

VERIFIED:builders/validator5076PASS; новыеfocused17/17 и9/9; final580/580+quote/API+NextTypeScript16pagesPASS(exit0),diffcheckPASS. Перваягеометрическаяпроверка14/15: testошибочнопроверялinternal0вместоAPIserializer/null, исправлен scopeassertion. Branch audit/v3-matrix-provenance-2026-10-14,parent806e4b8;remoteintegrationa5c892e...свежимlsremote. Нетpush/CI/Preview/Production.

OPEN/NEXT: новаяШали геометрическине связана;М12nativeгеометрияещёсканируетвнутреннююнепрерывность;М11mainlinetail/airportscope,ЦКАДcontext,SmallVyazemybinding иверхнийV3сборщикindependentproducts остаютсяopen. OSMpartialresponseнеполучениевсехкамер.10undatedrowsнеизменны. Не заявлятьполноеэтап3/Russia coverage.

---

## CURRENT 2026-10-14 — даты27→10, календарьМ11 и проверкиусловий исправлены

DONE:17строк получили доказанные даты:М1(2),Рязань(4),Кама/Буй(6),Казань(4),МСДтранзит(1). Казань начинает09.03.2025 23:50:01, а не06.03. М11order274визуально перечитан: переключение01:00 и собственные праздники2026; проверка временного окна больше не использует полдень вне поездки. СеверныйmainlineAt теперь расчётныйвыезд679. Перенесены кодовые исправленияa01:строгийtimezone/dateЦКАД и безопасныйсуммарныйМ11. Рязанскийночной0 требуетполосу;МСД950 требуетконтекст. [Подробныйотчёт](../experiments/nationwide-tolls/stages/02-dates-and-m11-tariff-calendar-2026-10-14.md).

VERIFIED:5076matrixunique/builders/auditPASS,focused30/30,full571/571+quote/API+Next/TypeScript16pagesPASS(exit0),diffcheckPASS. RemoteintegrationHEADсвежимls-remote=a5c892e67af4b050f53bf2211b62feac34d6df6c. Branch audit/v3-matrix-provenance-2026-10-14,parent4d004ac;безpush/CI/Preview/Production.

OPEN/NEXT:10undatedrows=pskov8+heihe2 остаютсяunconfirmed, даты не придуманы. ГеометрическиеbindingsМ11tail/М12newShali/ЦКАДусловий не объявлены закрытыми. Далее самостоятельныеproductId/готоваяпара вV3, unknownне0/partialнеfull. Подробная история сохранена ниже и вWORK_LOG.

---

## CURRENT 2026-10-14 — PDF-блок закрыт; ЦКАД исправлен, текущая матрица М12 сохранена

DONE: обработаны7PDF,5новых сохранены сSHA,2дубликата М4/М11 reused. Исправлены210ЦКАДdirectcells: прежняяCatIIтаблица ошибочно считаласьCatI. М10–ПК5=2278,М4–М11=1800. Добавлены380directcells М12(order302,08.10):Москва–Шали5946,Р239–Шали99.28ЦКАДcells сendpointМ12 требуют отдельно доказанного tariffcontext; безнегоunknown. М3/Тольятти даты добавлены30строкам, undated57→27. А28912operatorcells visuallyverified,amountsunchanged. Raw5076,selected2477/history777/provisional1822;М4active728 unchanged. [Полный отчёт](../experiments/nationwide-tolls/stages/02-uploaded-operator-pdfs-2026-10-14.md).

VERIFIED: builders/validator/auditPASS;focused26/26, дополнительныйстарыйtest1/1; финальныйbuild565/565,quote/API,TypeScript/Next16pagesPASS(exit0). Первоначальныйbuild1FAIL из-заожиданиястаройCatIIцены161≠227, исправлен и повторён. Веткаaudit/v3-matrix-provenance-2026-10-14,parent77ca608; нетpush/CI/Preview/Production.

IN PROGRESS/NEXT: PDFЦКАД/М12 повторноне нужны. ГеометрияактуальныхМ12границ/сноскаЦКАД/М11products и27региональных дат остаются; новаяМ12таблица не оживляет expiredРВП832. Stage2nationwide незавершён, затемstage3 независимыеproductId. Не заявлятьполноеРоссийскоепокрытиеилиподтверждениевсех404М4estimates.

---

## CURRENT 2026-10-14 — прислан повторный M4rules; актуальныеPDFURL не получены

DONE: новый PDF(2) hash совпадает с уже сохранёнными13-page М1/М3/М4rules; новых ЦКАД/M12тарифов нет. Пользовательский screenshot показывает404, полныйURL обрезан — не приписывать404 конкретному файлу. Старые прямыеPDFlinks только индексированы, не подтверждены как рабочие. BLOCKED: liveАвтодор tariffs в cloudbrowser требует manualrobotcheck после1reload; CAPTCHA не решалась. tskad альтернативныйURL502connectionrefused. [Подробности и путь скачивания через сайт](../experiments/nationwide-tolls/MATRIX_OPEN_ITEMS_AND_DOCUMENTS_2026-10-14.md).

NEXT: пользователь может скачать2PDF собственными ссылками страницы тарифов; не просить повторноM4rules. М11/region source work независимо продолжается. Docs-only на parent5fb60cd; никакие цены/код не менялись, новыхtests/build/CI/deploy нет.

---

## CURRENT 2026-10-14 — матрица не закрыта; нужны ЦКАД/М12 PDF

DONE: сверено состояние d66b1d4 и оставшиеся вопросы. М4:428=404canonical unconfirmed+24excluded,728active; документы355 закрыты. IN PROGRESS: ЦКАД210cells требуют category re-audit: индекс официальной страницы показывает42/2278 дляI против60/3189 дляII, сохранённая Cat-I таблица содержит последние; runtimeApproved=false. Никакие цены ещё не исправлены по индексному тексту. М12 MarchPDF+Octoberboundary/OD остаются; М11 PDFmainline уже есть, head/rules доступны, пользователь повторно не нужен;57rawrows без startdate. [Подробный статус и два PDF](../experiments/nationwide-tolls/MATRIX_OPEN_ITEMS_AND_DOCUMENTS_2026-10-14.md).

NEXT: получить ЦКАД/M12 первичныеPDF и проверить категории/даты/OD, затем физические привязки и тесты. Docs/source-status only; tests/build не запускались, предыдущие560/560/buildPASS не выдаются за новый прогон. Нетpush/CI/Preview/Production; parentd66b1d4.

---

## CURRENT2026-10-14 — ПВП355 разбор закрыт,24ключа исключены

DONE: пользователь прислал13-page rulesPDF5kq5uo88zxclelibmubucv607fda7cvv.pdf; текст/визуальнаяпроверкастр7–8 подтверждаетnorthbound entry355→339receipt(no secondcharge). OriginalPDF+SHA/source snapshot сохранены.2026tariffPDFrow355220/220+правило дают2directoperatorcells355→339 в M4_OPERATOR_ENDPOINT_CELLS.json. Невозможнаяfareмодель355as southbound entry/artificialexit исключена:64keys всего,24изисходных428конфликтов. Не заявлено,чтоphysicaljourneyкточке355невозможен.

ACTIVE:728uniqueendpointkeys,404canonicalestimates(originalconflicts),24excluded(originalconflicts),0unresolvedoriginalconflicts;668internalrampchains внеlookup;4reviewedcells preserved. Archivedsource4699rows/428oldconflicts сохраняется. Runtimeexcluded pair=>unknown(m4_unsupported_paid_endpoint_pair),не0;355→339=220once,bothprofiles,reverse not manufactured. Routephysicalconfidence/ODconfirmation still unconfirmed as before.

VERIFIED:focused23/23;fullnpm run build -- --webpack560/560tests,quote/APIcontracts,TypeScript/NextPASS(exit0),diffcheckPASS. Branchaudit/v3-matrix-provenance-2026-10-14,parent3e29988;безpush/CI/Preview/Production. NEXT nationwide stage2M11/M12/CKAD/date57rawgaps,thenruntimeproductsplitstage3.355documentblock closed;no further355PDFrequested. Existing standalonea01e2bfCKAD/M11fixes insecondcheckout stillneedintegrationcheck.

---

## CURRENT2026-10-14 — uploadedM4 PDF source verification applied

DONE: user PDF9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf,5scannedpages rendered/read. Operator order58, stated effective start2026-03-02T00:00:00+03:00(page5). CategoryI cash/card rows match all21 normalized saved entries.355 explicitly towardsMoscow; slash636/672 discount220/270 applies APD-transponder-only partial route, not no-transponder. Original sourcePDF preserved and hash-linked in source-documents/m4-order58-effective-2026-03-02.pdf; transcription source-snapshots/m4-order58-2026-03-02-category1-verified.json.

IMPLEMENTED: generator checks source values against verified transcription;1492 M4 rows(candidates1456,south32,DZOK4) gain verified start/source status. MissingStartDate1549→57 across raw4699. No amounts changed. Compiler/adapters preserve unconfirmed exactOD status and4reviewed overrides;404 priorconflicts restored estimates,24unknown unchanged. BeforeMarch2 fares blocked.

VERIFIED: all builders/matrixvalidator, focused3/3, finalnpm run build -- --webpack557/557+quote/APIcontracts+TypeScript/NextPASS(exit0),diffcheckPASS. Branchaudit/v3-matrix-provenance-2026-10-14,parente106d02. Notpush/CI/Preview/Production. NEXT user may supply rulesPDF e0b/5kq5uo88zxclelibmubucv607fda7cvv.pdf for detailed355 entry/receipt semantics; tariffPDF does not alone certify geometry/wholefare/current no-amendment. ContinueM11/M12/CKADstage2.

---

## CURRENT2026-10-14 —24 Яндекс контроля355 выполнены, импорт цен0

DONE: пользователь явно разрешил cloud browser fallback. Реально построены12 направленных пар355↔803/911/1046/1093/1184/1223 x2даты(15/17окт10:00Москва);24/24 сумм видны. [Отчёт](../experiments/nationwide-tolls/stages/02-yandex-355-controls-2026-10-14.md); compact DOM-derived evidence live-controls/2026-10-14-yandex-355-results.json.

FOUND: карточка ПВП355 имеет адрес357-йкм рядом сrepoanchor; это не ошибочная точка только из-за номера. Маршруты к точке существуют, но около355 есть въезды/выезды/разворот, exact continuous paid355 boundary не доказана.355→8033530/4090,803→3551450/1830 — whole-route approximate observations, не матричные тарифы.24 unknown cells не активированы,0 runtime imports. Не объявлять directions impossible и не зеркалить.

CHECKS: savedJSON24unique/24amounts/0imports, diffcheckPASS; browser actual route/UI dates/vehicle/both directions observed. Docs/evidence-only, новыеtests/build/CI/Preview/Production не запускались. BRANCH audit/v3-matrix-provenance-2026-10-14,parent49a836b. NEXT получитьPDF пользователя, подтвердить точные направленные paidboundaries355 и стороны остальныхПВП, then same-route fare binding; stage2nationwideIN PROGRESS.

---

## CURRENT 2026-10-14 — запрос PDF и24 Яндекс controls: BLOCKED до запуска

DONE prep: найден прямой подробный M4 PDF a2d/9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf (direct403) и отдельный355 rulePDF e0b/5kq5uo88zxclelibmubucv607fda7cvv.pdf. Пользователь предложил скачать/передатьPDF. Подготовлены24 exact boundary/profile URLs (355↔803/911/1046/1093/1184/1223,12 directions x2date profiles) в live-controls/2026-10-14-yandex-355-pending.json.

BLOCKED actual UI: Opera list_tabs Browser not connected; TinyFish run did not start(wallet_out_of_funds,-0.221166 USD), no runID/no observations. No retry/no fabricated route/price/no runtime changes. NEXT восстановить авторизованный browser-access, выполнить24 controls с проверкой фактического crossing355/route snapping; получитьPDF от пользователя. Docs/preparation-only, tests/build not rerun. Branch audit/v3-matrix-provenance-2026-10-14 parent3839a0c.

---

## CURRENT 2026-10-14 — М4 endpoint очистка внедрена локально

DONE: отдельный M4_ACTIVE_ENDPOINT_REGISTER.json + offline compiler + rebuild-hook в build-release-register.cjs; V3 endpoint adapter использует726 уникальных готовых estimates.668 ошибочных внутренних ramp-вариантов исключены из активного lookup; source matrix сохранена. Из прежних428 keys404 имеют одну topology-пригодную оценку,24 unsupported355-direction остаются unknown.4 reviewed exact overrides сохранены. Активных конфликтных цен0. Все новые восстановленные цены unconfirmed; официальная дата/источник не сертифицированы.62→460=1740/2120 (candidate), не1590/1940.

VERIFIED: focused17/17; final npm run build -- --webpack554/554, quote/API contracts, TypeScript/Next PASS(exit0); register generator, matrix validator PASS; diffcheck PASS. BRANCH audit/v3-matrix-provenance-2026-10-14 parent e1f465f; без push/CI/Preview/Production. [Полный отчёт этапа2](../experiments/nationwide-tolls/stages/02-matrix-and-provenance.md). Старые428 conflicts в исходной4699-row матрице — архивный источник, не активный runtime.

NEXT: независимые same-boundary/profile operator/Yandex controls для restored estimates и source/date проверка; unsupported355 remains unknown. Далее M11/M12/CKAD по DELIVERY_PLAN. Stage2 nationwide IN PROGRESS, корректность всех тарифов России не заявлена.

---

## CURRENT 2026-10-14 — этап2: audit-only защита общего ядра

DONE: quote.cjs больше не возвращает runtimeEligible:false даже по точному полному ключу цепочки; unknown audit-only-fare-row сохраняется в общем итоге с другими дорогами. Регрессия проверяет все1096 quarantined строк. Первичные topology сведения672(съезд) и355(въезд/чек339) записаны отдельно с ограничениями; актуальный PDF/страница вернули403, новые цены не импортированы. [Отчёт этапа2](../experiments/nationwide-tolls/stages/02-matrix-and-provenance.md).

VERIFIED: focused2/2; npm run build -- --webpack551/551 tests, quote/API contracts, TypeScript/Next PASS(exit0); diffcheck PASS. BRANCH audit/v3-matrix-provenance-2026-10-14, parent ebcea80; локально, без push/CI/Preview/Production. Этап2 IN PROGRESS:428 конфликтов остаются unknown. NEXT: актуальное направленное соответствие строк355/672 и mainline; exact-pair/date/profile проверки до активации; затем M11/M12/CKAD. Не выдавать структурную причину за подтверждение цены.

---

## CURRENT 2026-10-14 — этап 2, структурный аудит матрицы

DONE: воспроизводимый диагностический аудит4699 строк и всех428 конфликтных М4 ключей. Причины по различающимся вариантам:339/355=140,636/672=168,обе=120. Все конфликтные исходные строки quarantined;1549 строк без даты начала. Наличие source не объявляется подтверждением. [Отчёт этапа2](../experiments/nationwide-tolls/stages/02-matrix-and-provenance.md).

BRANCH: audit/v3-matrix-provenance-2026-10-14 от сверенного/fetch GitHub integration head a5c892e67af4b050f53bf2211b62feac34d6df6c. Самостоятельные runtime fixes a01e2bf в другой локальной копии не переносились в этом диагностическом блоке; сверить отдельно при интеграции.

VERIFIED: focused3/3; итоговый npm run build -- --webpack549/549, quote/API contracts, TypeScript/Next PASS(exit0); diffcheck PASS. Тарифы/runtime не менялись. Новая рабочая ветка локальная, не push/Preview/CI/Production. Этап2 IN PROGRESS. NEXT: проверить source/date/profile и exact boundaries для двух групп конфликтов; продолжить M11/M12/CKAD по плану, не выбирать сумму произвольно.

---

## CURRENT 2026-10-14 — DONE: этап 1, единая рабочая ветка опубликована

DONE: новая GitHub ветка `integration/v3-product-baseline-2026-10-14`, source snapshot `2b756ef73c793d1ee03ad66e4c0587578582b8a2` на базе `1642c76`. Git tree `4f0574609ffe5fb7dec55ddb405b3069352e9688` точно совпадает с проверенным локальным `c6d3843`; `git diff --exit-code` PASS. Ветка fetch получена и выбрана локально с upstream `github/integration/v3-product-baseline-2026-10-14`. Исходная локальная merge-история сохранена в `archive/v3-local-audit-merged-2026-10-14`. Каталог 23 продуктов и явный unresolved Псков: [tariff-products.json](../experiments/nationwide-tolls/tariff-products.json). [Полный отчёт этапа 1](../experiments/nationwide-tolls/stages/01-baseline-and-product-boundaries.md).

CHECKS: опубликованы 39 изменённых файлов; их Git blobs и полное дерево сверены. Проверенный source tree ранее прошёл `npm run build`: 546/546 tests, quote contracts, Turbopack 16 app routes. Это не подтверждение всех тарифов России; V3 runtime пока сохраняет объединённый `m4_a289` до этапа 3. Новые итоговые изменения касаются только четырёх handoff/docs файлов, дополнительные тесты к ним не запускались. Критерии этапа 1 выполнены. Main/Production не менялись; PR/Preview не являются результатом этого этапа и не проверялись.

NEXT: этап 2 — аудит 428 конфликтующих направленных endpoint/profile ключей М-4, матриц/версий/профилей/источников, отдельный `stages/02-matrix-and-provenance.md`. Не применять recovery patch без отдельной проверки. Для публикации новых коммитов использовать подключённый GitHub: CLI HTTPS credentials отсутствуют. При крупной передаче фиксировать blobs/tree/commit/ref отдельными короткими шагами и сохранять прогресс; не повторять уже подтверждённые blobs.

## CURRENT 2026-10-14 — этап 1, разрешение получено; отправка проверенного дерева через GitHub

IN PROGRESS: пользователь ответил «Продолжай» на конкретный запрос публикации новой интеграционной ветки. Повторный CLI push завершился `could not read Username`, поэтому отправка через Git невозможна без учётных данных. Подключённый GitHub используется для новой ветки на базе `1642c76`: переносится точное проверенное дерево локального состояния, после чего SHA дерева будет сверён, ветка fetch получена и выбрана как единая рабочая. Полная локальная merge-история сохраняется отдельной веткой. Сборка ранее PASS 546/546, quote и 16 app routes. Main/Production не менялись.

## CURRENT 2026-10-14 — этап 1, локально готов; GitHub push заблокирован auto-review

DONE local: merge `cf18e8677aa53c30f959c93aff8745d57167ab5d` с двумя родителями: локальный audit `06e072d` и GitHub experimental `1642c76`; создан каталог 23 тарифных продуктов, Псков явно unresolved. `npm run build` PASS: 546/546 tests, quote contracts, Turbopack 16 app routes. Worktree чист после merge. [Подробный отчёт](../experiments/nationwide-tolls/stages/01-baseline-and-product-boundaries.md).

BLOCKED: auto-review отклонил `git push github HEAD:refs/heads/integration/v3-product-baseline-2026-10-14` как потенциальную передачу полного локального коммита без достаточно явного разрешения. GitHub поиск не нашёл новой ветки. Не повторять через обходной канал; требуется явное разрешение пользователя на публикацию этого SHA. Этап 1 нельзя назвать завершённым на 100%, PR/Preview/Production отсутствуют. NEXT после разрешения: push, read-only проверка remote SHA, затем этап 2.

## CURRENT 2026-10-14 — этап 1, интеграция удалённого и локального аудита

IN PROGRESS: удалённый V3 HEAD `1642c76` получен настоящим `git fetch`, общий предок `1a63018`, различие 49/439 коммитов. На ветке `integration/v3-product-baseline-2026-10-14` выполнено разрешение merge: локальный проверенный тарифный аудит, три удалённых recovery файла и оба родителя истории. Подробности: [этап 1](../experiments/nationwide-tolls/stages/01-baseline-and-product-boundaries.md). Обычная сборка и публикация новой экспериментальной ветки проверяются. V3 runtime ещё не подключён к каталогу. Main/Production не менялись.

NEXT: закончить build, merge commit, push и сверить remote SHA; затем этап 2 — тарифная матрица и 428 конфликтующих ключей М-4.

## CURRENT 2026-10-13 23:54 MSK — шестиступенчатый план до официального выпуска

DONE: составлен конкретный [план реализации и публикации V3](../experiments/nationwide-tolls/DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md): (1) единая ветка/границы тарифных продуктов; (2) матрица и источники; (3) V3 расчёт пары каждой дороги и итоговое сложение; (4) полная/реальная проверка и обновление релизного CI; (5) Preview и приёмка; (6) официальный веб-выпуск, отдельная Android-оболочка и мониторинг. Каждый этап имеет пути, артефакт, проверки и критерий выхода. Это план, код и тарифы в этом блоке не менялись.

EVIDENCE: локальная audit-ветка HEAD `22bffe7` до этого плана, впереди только локального scratch-origin на 4 коммита; GitHub-поиск не нашёл её как опубликованную ветку. Открытые PR №12/9/6 относятся к другим задачам. Последний просмотренный Preview READY на экспериментальной ветке — `1642c76`; последний просмотренный Production READY — V2 commit `64631d23`. Текущий официальный корень/Android WebView и статический final gate направлены на `/v2`. V3 пока смешивает некоторые платные продукты и оставляет часть семейств без полного денежного расчёта. Эти факты записаны в плане, а не выданы за новые тесты.

NEXT: этап 1 — сверить актуальный GitHub V3 HEAD с локальными четырьмя коммитами, составить уникальный каталог тарифных продуктов/границ и одну воспроизводимую рабочую ветку. Прямой запрос потребуется только на финальную публикацию/слияние после проверки релиз-кандидата; текущая просьба касается плана. Подробный блок: `experiments/nationwide-tolls/WORK_LOG.md`.

## CURRENT 2026-10-13 22:26 MSK — свод правил нового алгоритма и матрицы

DONE: просмотрены проектные handoff/решения/журналы и найденные выдержки из связанных чатов 9–13 октября. Новое прямое правило пользователя записано: для каждой самостоятельной платной дороги найти свою пару крайних пунктов оплаты, взять готовую цену из её матрицы, затем просто сложить готовые цены разных дорог. Внесено в `experiments/nationwide-tolls/DECISIONS.md` и алгоритмический контракт; старое runtime-требование полного промежуточного вектора ПВП помечено superseded. Постоянное подробное append-only журналирование каждого существенного этапа добавлено в `AGENTS.md`.

IN PROGRESS: `experiments/nationwide-tolls/RULES_RECONCILIATION_DRAFT_2026-10-13.md` объединяет найденные правила, источники/приоритеты и 7 редких случаев с безопасными defaults. Главная граница для совместного разбора — как каталогом отделять самостоятельные платные тарифные продукты; поездка с endpoint внутри платной сети при отсутствии exact matrix pair остаётся unknown. Поиск чатов вернул выдержки, не полный экспорт всех переписок; сводка не утверждает обратное. Техническая реализация, тарифное покрытие и аудит матрицы продолжаются отдельно; Production/V2 не менялись.

NEXT: совместно закрыть 7 вопросов из сводки, особенно границы самостоятельного тарифного продукта и маршруты, начинающиеся/заканчивающиеся внутри платной дороги; затем сверить приоритетный контракт и определить следующий кодовый этап. Текущее состояние ветки и проверки записаны в последнем блоке `experiments/nationwide-tolls/WORK_LOG.md`.

## CURRENT 2026-10-13 — тарифный аудит продолжается; M-12/ЦКАД имеют открытые границы

DONE: исправлены M1 без транспондера **250 ₽**, M3 категория I **480/520 ₽**, legacy full Tolyatti **320 ₽**. Повторный source/currentness audit сверил М-12, ЦКАД, Багратион и Удмуртию. Подтверждено: Сокуры→Шали **99 ₽** с 08.10.2026; старые P239→Шали 62 ₽ и legacy Moscow→Kazan 5 909 ₽ не имеют доказанного актуального соответствия новой границе; legacy Moscow→Kazan исправлен на прямую матричную ячейку P239 **5 847 ₽** и покрыт двунаправленной геометрической регрессией. Также операторская длинная ячейка ЦКАД М-10→ПК-5 **3 189 ₽** расходится с отдельно опубликованным whole-road тарифом **2 381 ₽**; однозначного соответствия рамок нет. Эти конфликтные значения не исправлены наугад и не разрешены для нового runtime. Подробности: [аудит актуальности М-12/ЦКАД](../experiments/nationwide-tolls/TARIFF_AUDIT_CURRENTNESS_2026-10-13.md) и [M1/M3/Тольятти](../experiments/nationwide-tolls/M1_M3_TARIFF_REAUDIT_2026-10-13.md).

VERIFIED: повторный `npm run build -- --webpack`: после M12-правки **77/77 тестовых файлов**, quote/API contracts, Next.js/TypeScript и 16/16 страниц PASS; focused M12 regression 1/1 PASS. Использованы существующие локальные exact-version dependencies; lock-файл не менялся. Отчёт и исправление сохранены в commit `fb50f8f` ветки `audit/matrix-endpoint-conflicts-2026-10-13` (локально, branch ahead of origin by one); не push/deploy/merge/Production.

IN PROGRESS: полный охват не достигнут. NEXT: добавить новую цену Sokury→Shali только в точную границу после проверки выбранной геометрии; затем разрешить CKAD whole-road vs OD конфликт по точным РВП и продолжить M4/M11/региональные тарифы и датировки.

## CURRENT 2026-10-13 — writable matrix audit copy; endpoint conflicts quarantined

DONE in local branch `audit/matrix-endpoint-conflicts-2026-10-13` (based on `8cc7cf4`): generated M4 candidate rows now get endpoint/profile uniqueness, conflicting cells are audit-only, and V3 endpoint lookup accepts only explicitly eligible rows. Reverse-direction rows are assessed separately; no reverse fee is manufactured. Matrix rebuilt: 4,699 rows, 428 directed/profile conflicts retained for audit, 360 unique runtime endpoint keys; four previously Yandex-reviewed cells remain explicit overrides. [Audit report](../experiments/nationwide-tolls/M4_ENDPOINT_CONFLICT_AUDIT_2026-10-13.md).

VERIFIED: matrix builder, release-register builder, matrix validator, quote contracts PASS; full `npm run build -- --webpack`: 75/75 tests and Next webpack/TypeScript build PASS. Working copy is `/workspace/scratch/806dbc1ef74b/matrix-audit-work`; original mount stays read-only. This work is not pushed, deployed, merged, or in Production. Full nationwide price/Yandex coverage remains IN PROGRESS; conflict quarantine does not certify any fare.

NEXT: inspect remaining conflict pairs against operator/Yandex evidence and preserve unknown where not resolved; complete M11/M12/CKAD bindings. See experiment `NEXT_STEPS.md`.

---

## CURRENT 2026-10-13 — Яндекс endpoint selection, IN PROGRESS

DONE actual Yandex UI checks: north620→71=2480/2730 and636→71=3050/3370 (MonThu/FriSun), four unique active reviewed cells; conflicting legacy variants excluded for these exact keys. Approved unconfirmed label retained. [Report](../experiments/nationwide-tolls/YANDEX_ENDPOINT_SELECTION_2026-10-13.md).

VERIFIED542/pass542/fail0, contracts/TS/Next16/16, scopedlint/diffcheck PASS. Reverse unchecked pairs remain open; Yandex reverse control bypassed71 and cannot authorize mirroring. Whole Yandex Volnovakha route3810 is different from selectedOSRM and not reused. Full geometry equivalence not claimed. Actual fresh local V3 handler Volnovakha→Moscow3050/unconfirmed, weekday3050/weekend3370,1182425m/61701s/33949ms. NEXT continue remaining endpoint conflicts and full M11/M12/CKAD. Full cleanup/stage10 NOT finished. Local750fa58 baseline; remote34b9a0ca verified. PERSISTED localf93ec71 → remoteca8d317f138a2727f0399de9dd6751c0b6115429;9 changed hashes match. Auto Preview dpl_D2pZpBEFmaN5JEW94TJymCvujcx5 last BUILDING exactca8d317, target=null, no availability claim. Index audit472→468 conflicting directed/profile keys; only4 resolved. No main/merge/Production.

---

## CURRENT 2026-10-13 — endpoint-only code implemented, tariff coverage IN PROGRESS

DONE V3 M4 boundary-only search + ready endpoint matrix, no native per-PVP sum; M11 intermediate gap/reentry checks removed; M12 endpoint span used by V3. Prior offline recovery runtime restored. [Detailed report](../experiments/nationwide-tolls/ENDPOINT_ONLY_IMPLEMENTATION_2026-10-13.md).

VERIFIED540/pass540/fail0, contracts/TypeScript/Next16/16, scopedlint/diffcheck PASS. Actual external-provider local handler Volnovakha→Moscow1182425m/61701s: boundary resolution succeeded, fare remains unknown because endpoint matrix has conflicting ready prices. Prior3050 was legacy sum, not evidence of new endpoint price. No browser/hostedPOST/new Preview claim.

NEXT resolve endpoint tariff conflicts from direct source and complete M11/M12/CKAD products. Full algorithm/source coverage and stage10 IN PROGRESS. Local integration branch; remote parent49e1da08 verified. No main/merge/Production. Earlier environment BLOCKED entries below are historical; runtime restored.

---

## CURRENT 2026-10-13 20:05 MSK — пользователь уточнил модель двух границ

DONE: записано обязательное правило в [DECISIONS.md](../experiments/nationwide-tolls/DECISIONS.md): один проезд по платной дороге непрерывен; промежуточные съезды/объезды/reentry не рассматриваются. Первый и последний тарифные участки определяют готовую ячейку матрицы. Полный сетевой обход промежуточных ПВП не является условием расчёта.

IN PROGRESS: код пока не приведён к этому правилу. Ранее предложенная проверка непрерывности/повторных въездов отменена пользовательским уточнением. NEXT: переработать границы/lookup M4/M11 и удалить обязательный промежуточный обход и старое суммирование из нового пути; см. NEXT_STEPS.md. Runtime восстановился, локальный незакоммиченный задел доступности сохранён; эта запись не означает публикацию или новые проверки.


---

## CURRENT 2026-10-13 — BLOCKED: runtime disconnected during fare-fix persistence

Locally implemented and VERIFIED536/pass536/fail0 + contracts/TS/Next16/16, scopedlint/diffcheck: M4 proof starvation worker/budget fix, M4/M11 unchanged-profile overnight handling, selected OSRM M12 evidence/completeness, selected special diagnostics. Fresh API+external traces restored Volnovakha→Moscow3050 RUB and Moscow→Voronezh2300 RUB (both unconfirmed). Ufa→Petersburg full price still OPEN (disjoint M12, M11/tail, CKAD M7→M11).

Execution environment disconnected409 environment_offline during docs/git save; local final commit/save not confirmed. Runtime source NOT published: remote runtime still baselinead9a8b06, latest prior verified UI Previewir6hc5hpg/sourcea38c50e3/530 tests. This checkpoint stores recovery artifacts only, not applied code.

[Historical recovery archive and patch paths mentioned in the original checkpoint are absent from this checkout; do not assume those files are available or apply a missing patch. Current endpoint-only implementation findings are in [the tracked implementation report](../experiments/nationwide-tolls/ENDPOINT_ONLY_IMPLEMENTATION_2026-10-13.md), and current code/history should be recovered from this branch. Stage10 remains IN PROGRESS; nationwide audit is not complete. No main/merge/Production.]

---

## CURRENT 2026-10-13 — stage10 UI/user-route block, IN PROGRESS

DONE requested V3 logo from approved portal SVG, A/B swap preserving positions/reset, larger centred rate units, circular stepper controls, blank-label CTA gating, shorter fastest note, prominent unknown full-total note. Fixed proven V3 partial corridor recovery995→null instead of false complete fare. Speculative A289 changes removed; existing620/415 intact.

VERIFIED full530/pass530/fail0, quote/API contracts/TS/Next16/16, scopedlint/diffcheck PASS. Fresh actual external-provider API-handler checks for Ufa→Moscow, Petersburg→Moscow/Sevastopol; final Ufa unknown retained. [Report](../experiments/nationwide-tolls/STAGE10_UI_USER_ROUTES_AUDIT_2026-10-13.md). Browser blocked: installed Playwright lacks Chromium; no visual/E2E claim. Three requested full road fees still OPEN, not recovered; M11 southbound/full679–684 and M12 exact coverage required. Durations not equivalent to Yandex.

PERSISTED localfeafa14 → remotea38c50e3fb19dbbb461104f5483a400ca1da986d;16 changed blobs match,0 mismatches. Preview dpl_DyQNDZRP7MEn6F1L1ryATYhhc7rZ READY exact sourcea38c50e3, target=null; https://mezhgorod-calculator-ir6hc5hpg-4regodatbe-5310.vercel.app/v3 . Remote530/pass530/fail0, contracts/TS/Next16/16 PASS. Protected page/logo GET200, availability only. PRs12/9/6 unchanged. No main/merge/Production. NEXT full M11/M12 bindings/browser/stage10 coverage.

---

## CURRENT 2026-10-13 — stage9 UI/copy/state

DONE existing client code/render audit: V3 actual API toll amount/period on card and copy, card-bound unconfirmed note, nested payload/money guard, stale/reset/unmount/clipboard handling, optional storage/SSR/analytics and presentation sum bounds.527/pass527/fail0 + contracts, TS/Next16/16, scopedlint/diff-check PASS. Actual React static render + controlled real-hook lifecycle tests; [report](../experiments/nationwide-tolls/STAGE9_UI_COPY_FAILURE_AUDIT_2026-10-13.md).

LIMITS: no new live provider/browser/system clipboard/hosted POST; provider21600s geometry cache unchanged, no final price cache. Source/physical/calendar gaps (M1/M3/M11/679–684/Rostov etc) remain explicitly open. V2 reference period selector unchanged; fastest V3 uses actual calculated amount.

PERSISTED locald0fcdfa → remote402a1b2a15dbbde22fa20ac7d328a9329ebd45c4 (parent72fcdbd7);16 changed files hashmatch,0 mismatches. Preview dpl_4uHeVRXK2J3GcKENFYrqddQ6BNKw READY exact source402a1b2a, target=null; https://mezhgorod-calculator-7u2o9rrzb-4regodatbe-5310.vercel.app/v3 . Remote527/pass527/fail0, contracts/TS/Next16/16 PASS; protected GET200, availability only.7 saved real API payloads pass new validator, not new live route runs. Unrelated PRs12/9/6 unchanged. NEXT finalstage10 chosen-route/live/browser/provider/cache/performance and consolidated source/coverage report. No main/merge/Production.

---

## CURRENT 2026-10-13 — stage8 versions/zones/rounding

DONE existing code audit: date/ISO Moscow boundaries and intraday unknown; aliases/conflicting versions; confirmation belongs to selected row, undated prices unconfirmed; commercial total rounded once with consistent integer parts, split/money/overflow bounds.516/pass516/fail0 + contracts, TS/Next16/16, scopedlint/diff-check PASS. [Detailed report](../experiments/nationwide-tolls/STAGE8_VERSION_ZONE_ROUNDING_AUDIT_2026-10-13.md).

OPEN source data: M1 matrix230 vs raw noTransponder250, official queryempty/page403; M3 source/dates, mainline M11 independent calendar/seasonal succession. No source values or4699 rows altered, no new M1/M3/regional customer fee enabled. No new live provider/browser/hosted POST; existing A289 corrections and Rostov/physical gaps retained.

PERSISTED local8993d81 → remote5d222c7727b9e911800c985e15f8c5f4f7016277 (parent6eeb8bde);10 changed file hashes match,0 mismatches. Preview dpl_EXRpmoF43j4Y43XAS9aq1seZVtN9 READY exact source5d222c77, target=null; https://mezhgorod-calculator-e7f9g7iwb-4regodatbe-5310.vercel.app/v3 . Remote516/pass516/fail0, contracts/TS/Next16/16 PASS; protected GET200, availability only. Unrelated PRs12/9/6 rechecked unchanged. NEXT stage9UI/copy/cache/failures, stage10E2E/performance/source/physical completion. No main/merge/Production.

---

## CURRENT 2026-10-13 — stage7 temporal/calendar

DONE existing temporal code audit: Moscow timezone in legacy/native M11, M12 allDays label, M4 midnight/calendar null retained through native/composition fallback, impossible original dates, M11 missing hour/unknown year/special-day ambiguity guard. Calculated crossing time labelled accurately.508/pass508/fail0 + contracts, scopedlint, TS/Next webpack16/16 PASS. [Detailed report](../experiments/nationwide-tolls/STAGE7_TIME_CALENDAR_AUDIT_2026-10-13.md).

OPEN source/physical coverage: mainline M11 special/transferred-day calendar, seasonal head succession, exact pay/entry/exit policy and per-gate ETA/version timing. Potential special-day flags block unknown, never borrow another road's fee. No new live routing/browser/hosted POST or tariff research in stage7. Existing A289 correction, stage6 live controls and Rostov/physical gaps retained.

PERSISTED local99fbcf4 → remote988a2a0b6f20518c368ea1239bbd2f10a3250e57 (parentc48b18e2);17 changed hashes match,0 mismatches. Preview dpl_Fvjo1poQfyvkPkbsVSDiEEP29UDB READY exact source988a2a0b, target=null; https://mezhgorod-calculator-h1hah9yrn-4regodatbe-5310.vercel.app/v3 . Remote508/pass508/fail0, contracts/TS/Next16/16 PASS; protected GET200, availability only. Unrelated PRs12/9/6 rechecked unchanged. NEXT stage8 fares/version/zones/rounding and remaining independent calendar source; stage9UI/cache; stage10E2E. No main/merge/Production.

---

## CURRENT 2026-10-13 — stage6 M1/M3/regional

DONE existing code/calculation audit: selected-route M1/M3 and regional candidate/paid-event coverage now blocks partial totals, including late trace fallback. Malformed/empty HTTP200 trace and booth-without-toll false-free cases rejected. Exact road refs/CKAD intersection identity and gate road/km/fare + integer trace-count validation fixed.502/502 tests + quote/API contracts, Next TS/webpack16/16, scoped ESLint/diff-check PASS. [Detailed report](../experiments/nationwide-tolls/STAGE6_M1_M3_REGIONAL_AUDIT_2026-10-13.md).

LIVE actual local V3 POST/external providers/trace: Moscow→Kaluga OSRM184.817km/10636s unknown, only physical M3 86/136; Moscow→Odintsovo OSRM26.172km/1937s free0 on exact complete trace269edges/0paid/0booths. No hosted POST/browser/Yandex/all-network verification. M1/M3 tariff series/date and regional exact exits remain unresolved; no new numeric fees invented. Existing A289 correction and Rostov discrepancy retained.

PERSISTED local0260915 → remote8df6745822c6e521a1009b6aecb4645a0c3aca1a (via6a230c9d);16 changed files hashmatch,0 mismatches. Preview dpl_87VMJRdHd9ToEbjV8QMURTrjwAjB READY exact source8df67458, target=null; https://mezhgorod-calculator-2hq1o2uiy-4regodatbe-5310.vercel.app/v3 . Vercel502/pass502/fail0, contracts/TS/Next16/16 PASS; authenticated GET200, availability only. Open unrelated PRs12/9/6 inspected, unchanged. NEXT stage7 calendar; stage8 dated M1/M3/source conflicts; stage10 full physical/provider coverage. No main/merge/Production.

---

## CURRENT 2026-10-13 — stage5 M11/M12/CKAD

DONE code/calculation audit of existing integration: OSRM M11 metadata retained on selected route; V3 uses Order274 directed mainline pairs and separate Moscow head, CKAD dated direct M4↔M11 pair; p147 passage/fractional boundary ordering, malformed/disjoint/repeated-anchor guards and M12 single-span continuity fixed. Unknown matrix/null preserved. Tests491/491 + quote/API contracts, scoped ESLint, TS/Next webpack16/16 PASS. Detailed report: [STAGE5_M11_M12_CKAD_AUDIT_2026-10-13.md](../experiments/nationwide-tolls/STAGE5_M11_M12_CKAD_AUDIT_2026-10-13.md).

LIVE actual local API handler with external providers: Moscow→Petersburg710.317km/24636s Valhalla unknown due separate679–684; Tver→Moscow179.202km/8889s OSRM unknown incomplete physical OD. An intermediate5030 subset caught and blocked before publication. No hosted Preview POST/browser/Yandex/CKAD/M12 live validation. Existing A289620/415 fix stands; Slavyansk→Rostov provider mismatch remains open.

PERSISTED implementation538c8ac → remote1506a8623cd9780930de75a346fb96133dc5f93c (via6f68c957);21 changed hashes match,0 mismatches. Preview dpl_BCRWYuDsaxfZMvL72C66EyMbfHWe READY exact source1506a862, target=null; https://mezhgorod-calculator-oy89ta0xy-4regodatbe-5310.vercel.app/v3 . Remote491/pass491/fail0, contracts/TypeScript/Next16/16 PASS; authenticated GET /v3 HTTP200 (availability only). No main/merge/Production. NEXT stage6 M1/M3/regional; stage7 calendar; stage10 physical gates/provider alignment.

---

## CURRENT 2026-10-13 — А289 category fix + этап4 композиции

DONE locally: user rejected Anapa833 vs whole800. Primary operator indexed table proves class-I/II columns were misread as transponder/noTransponder. Corrected A289 to415/205/620/180/800/385, preserved mistaken rows in correction metadata, rebuilt4699 matrix rows and class1 guard. Real external API + cloud Yandex UI agree Anapa→Krasnodar620 and Slavyansk→Krasnodar415.

DONE part4 code/calculation: V3 consumes M4-only production, separately adds A289 exact OD and bypass once; applies to full and partial M4. Unknown/partial component blocks complete price. Tests478/478 + quote/API contracts, TS, scoped ESLint, Next16/16 PASS. Details: [A289_CLASS1_AND_M4_COMPOSITION_AUDIT_2026-10-13.md](../experiments/nationwide-tolls/A289_CLASS1_AND_M4_COMPOSITION_AUDIT_2026-10-13.md). All numeric API estimates visibly unconfirmed.

OPEN: Slavyansk→Rostov same-date routes differ: OSRM316.724km/4h43/noA289/M4-1093 gives150; Yandex218mi/4h viaA289+M4, no amount shown. Do not certify150 as Yandex route price or force415 onto noncrossing OSRM geometry. Diagnostic approximate western control yields360.335km/5h18/1265 and is not promoted. Live provider/geometry records in live-controls/2026-10-13-*.json. Exact bypass physical gate and full fastest-route agreement remain open.

PERSISTED: experiment/toll-od-matrix-2026-10-08 code4b27032ff430308b46163c876f35b8cf9dcc12b2, parent8cc29824;39 changed file hashes verified,0 mismatches. Preview dpl_CAK7URaKJrP8oNhs6ZhY2svN1VCy READY, exact code4b27032, target=null; https://mezhgorod-calculator-4ncn2cwjo-4regodatbe-5310.vercel.app/v3 . Vercel log478/pass478/fail0, contracts/Next16/16 PASS; authenticated GET /v3 HTTP200. This is page availability, not a Preview browser trip. Actual live API function/provider controls described above. Local implementation b9a4983; subsequent checkpoint edits clarify source notes only, fees unchanged. NEXT: stage5 M11/M12/CKAD, retain live-routing discrepancy for stage10; stage7 holidays/midnight. No merge/main/Production.

---

## CURRENT 2026-10-13 — аудит: части 1–2 завершены локально

DONE: часть 2 добавила проверку длины/времени/координат/конечных точек V3, выбор точного победителя special-options и устранение ложного freeError. Focused 6/6, gate 466/466 + quote/API contracts, TypeScript, scoped ESLint и Next webpack16/16 PASS. Подробности/10 частей: [AUDIT_PLAN_10_PARTS_2026-10-13.md](../experiments/nationwide-tolls/AUDIT_PLAN_10_PARTS_2026-10-13.md). Часть1 commit ef0da4c, baseline8556e57.

IN PROGRESS: часть 3, А-289. Выявлены неподключённые промежуточные пары и риск неверного порядка двух рамок на одном сегменте геометрии. Исправления части3 ещё не выполнены.

REMOTE: experiment/toll-od-matrix-2026-10-08 повторно подтверждён d0dc2227; локальная integration/matrix-estimates-2026-10-13. Изменения ещё не отправлены, Preview старее. Реальные маршрутные/браузерные тесты не выполнялись. NEXT: часть3, затем сохранение проверенного задела в экспериментальную удалённую ветку.

---

## CURRENT 2026-10-13 — аудит по 10 частям, часть 1

DONE locally: восстановлен задел `8556e57`, повторён gate 458/458; исправлена нормализация невозможных дат на входе V3 API, регрессия 460/460 + quote/API contracts PASS. План и критерии: [AUDIT_PLAN_10_PARTS_2026-10-13.md](../experiments/nationwide-tolls/AUDIT_PLAN_10_PARTS_2026-10-13.md).

REMOTE: `experiment/toll-od-matrix-2026-10-08` проверена через GitHub API: `d0dc2227d75862c58b1fc880c96a9440049ceef7`. Локальная ветка `integration/matrix-estimates-2026-10-13`; предыдущий аудит и новые правки ещё не отправлены. Preview/Production не обновлялись.

NEXT: часть 2 — fastest selector, равный ETA, геометрия/evidence одного выбранного провайдера и special-options. Части 2–10 остаются планом, live-контроли не пройдены.

---

## CURRENT 2026-10-13 — V3 code/calculation audit

DONE locally: audited all4693 matrix rows, V3 API/composition and trip pricing; fixed omitted A289 on Anapa/Taman full-M4 trips, stale hardcoded totals, weekend bypass amount, falsely confirmed Temryuk control, single-PVP exclusion, absent departure date, invalid calendar/components/money, duplicate charges, invalid distance totals, response labels and V3 defaults/analytics. Build now includes62 test files plus quote/API contracts. TS, webpack16 pages and scoped ESLint PASS. Detailed findings, tests and open issues: [AUDIT_2026-10-13.md](../experiments/nationwide-tolls/AUDIT_2026-10-13.md).

IN PROGRESS: persist audit and deploy exact experimental Preview. Still open: live router/browser controls, exact Anapa/Temryuk/bypass bindings, holiday/midnight calendar consistency and incomplete M1/M3/regional integration. Do not claim full nationwide live validation.

---

## CURRENT 2026-10-13 — Yalta/Anapa → Krasnodar short A-289 V3 pricing

DONE: the previous V3 adapter priced A-289 only with a complete Moscow–Krasnodar M-4 corridor, so short trips could remain unknown despite crossing its physical frames. `lib/v3-calculation/a289-short-route.ts` now recognizes a selected Crimea/Yalta↔Krasnodar three-frame vector as 800 ₽ and an Anapa↔Krasnodar two-frame vector as the 833 ₽ Maryanskaya–Varenikovskaya operator candidate estimate; a geometrically matched western bypass adds its separate 410 ₽. Also handles reverse directions and Slavyansk/Temryuk endpoints with exact matrix lookup. Anapa's exit alias is provisional and all numeric V3 fares retain «Стоимость не подтверждена». No gate evidence returns unknown. The short OD quote takes priority for a matching local route even if the native M-4 plaza detector has a partial candidate; a complete Crimea–Moscow composite retains its own priority.

Focused synthetic selected-frame regression2/2 PASS in both directions, native experiment files22/22 PASS, TypeScript PASS, Next webpack build16/16 PASS. Experimental commit `ed34c4c18ba74fe292042be4ea2ec985269eb1f7`, Preview `dpl_CUGKzMqTn6D8H4cjoDTDpkNtD3z5` READY (target=null), authenticated GET https://mezhgorod-calculator-hdfcnxpp8-4regodatbe-5310.vercel.app/v3 HTTP200. Real routed API response for the user's exact addresses is not yet observed, so these expected figures are conditional on the chosen geometry. Full history: `experiments/nationwide-tolls/WORK_LOG.md`.

---

## 2026-10-13 — A-289 directed OD matrix expanded

DONE locally: `experiments/nationwide-tolls/A289_OD_MATRIX_2026-10-13.json` distinguishes three physical charging frames (23/82/103), operator endpoints Maryanskaya/Slavyansk/Varenikovskaya/Temryuk, the unbound Anapa exit, and the full Taman/Crimean-Bridge continuation. Seven distinct priced OD pairs are stored bidirectionally (14 rows): five saved operator direct no-transponder rates, user route controls Maryanskaya→Temryuk620 and full bridge800. Eight undirected remaining pairs are explicitly unresolved with no invented fare. The full Crimea route V3 now reads the 800 vector via the same exact OD registry and selected-route frame order; partial vectors remain unknown. Other OD quotes require exact exit binding; the 620 city bypass requires its specific route control. Generator was missing `TARIFF_MATRIX_CANDIDATES_2026-10-12.json` from the recovered remote snapshot; copied the previous experiment's source to make rebuilding reproducible.

Verification: generator4693, register2086 selected/1830 provisional/777 history; validator PASS, quote/API contract PASS, focused A289 2/2 and Crimea helper2/2 PASS, native 21 test files PASS, TypeScript/Next webpack build16/16 PASS. No live selected-route API test or exact Anapa junction binding. Details: `experiments/nationwide-tolls/WORK_LOG.md`.

PERSISTED: remote code `f9c092a0a492cf15c472b488ff71c64ef2c2d1e6` on experiment/toll-od-matrix-2026-10-08 (parent7afb510), Preview `dpl_7CfgeSqL2jfpziGSYFDcFM8nhzPN` READY, target=null. Authenticated GET https://mezhgorod-calculator-bussghy8p-4regodatbe-5310.vercel.app/v3 returned HTTP200/title. This is deployment availability, not a real A-289 route calculation. No main/Production.

---

## 2026-10-13 — Crimea → Moscow missing A-289 price fix

DONE locally: V3 composes full Moscow–Krasnodar M-4 (5,040/6,090), full A-289 bridge-approach vector (800), and the Krasnodar west bypass tariff (410) only when its selected-route segment is detected. For a proven weekday crossing of all three, the estimate is 6,250 ₽; without west-bypass evidence, 5,840 ₽. If only part of A-289 is detected, the route toll remains unknown instead of showing the incomplete 5,040 ₽. The number 410 comes from the existing local segment table and still needs route/operator verification. The different Donetsk-area Yalta is a real locality; its search result is explicitly labeled «Ялта — ДНР» and remains separate from «Ялта — Крым».

PERSISTED: remote experimental code commit `8b8442ceb2efe9e18382efc08d1d91e274952459` (parent010cf2d), Preview `dpl_EMmxvx7w6ZELCuKag9upow8Kh2Q4` READY, target=null, exact source SHA. Protected URL https://mezhgorod-calculator-7k62l9tcq-4regodatbe-5310.vercel.app/v3 fetched via authenticated connector HTTP200. No live route POST/browser E2E established.

Checks: focused combination tests 2/2, TypeScript noEmit PASS, experiment native tests 21 files PASS, Next webpack build16/16 PASS after switching the build's TypeScript check to its compiler API (the inherited CLI runner produced empty --showConfig output in this environment). Live chosen route/API and Preview deployment remain unverified for this fix. Current experimental Git branch; remote head at start010cf2d. No main/Production change. Details in `experiments/nationwide-tolls/WORK_LOG.md`.

---

## 2026-10-13 — published V3 matrix-estimate checkpoint

DONE: code10276acf786c9ceb60ae19b8f85f7938bd84a9f0 persisted in experiment/toll-od-matrix-2026-10-08. Preview dpl_8rCSYEHPBRZ3DYVzsst2kqstoE1j READY at exact code SHA, target=null. URL https://mezhgorod-calculator-a3d3ijrcm-4regodatbe-5310.vercel.app/v3 .

V3 ordinary/special routes use M4/M12 finished matrix vectors when route evidence resolves. Current candidates permitted with visible «Стоимость не подтверждена» in result/copy. Expired Shali cannot reuse stale money. Native305/305, adapter10/10, TS/build16/16 and React/localHTTP checks PASS.

BLOCKED verification: cloud-browser Preview navigation redirected to Vercel login even with temporary share; no live route/browser E2E completed. Authenticated connector can check page availability. IN PROGRESS: remaining M11/CKAD/regional matrix adapters and full route/CI verification. Next: extend those adapters from current source; use caller-authenticated Preview for driving-route E2E. Logs: experiments/nationwide-tolls/WORK_LOG.md. No merge/Production.

---

## CURRENT 2026-10-13 — V3 API/UI wiring complete for M4/M12

DONE: V3 ordinary and special-zone routes both use isolated V3 pricing modules; exact M4/M12 vectors use matrix estimates, stale Shali is blocked. Numeric V3 totals carry visible «Стоимость не подтверждена» in result/copy. Native305/305 and adapters10/10, TypeScript/build16/16 PASS; React warning render and local HTTP contracts PASS.

Remote last persisted code8d00f0a (before final special-options import). Its Preview dpl_BSAkHN4rvU8yLgDGBTsKYMuQ7tqY READY; protected /v3HTTP200. Final special-route follow-up locally verified; persist and build exact follow-up Preview next. Other road matrix adapters/live routes/browser/full CI gate remain incomplete. No Production/merge. Logs: experiments/nationwide-tolls/WORK_LOG.md.

---

## CURRENT 2026-10-13 — M4/M12 V3 matrix adapters

DONE: remote base integration bd77b6f on experiment/toll-od-matrix-2026-10-08. Follow-up M12 dated vector adapter blocks expired Shali prices and permits current candidates with visible warning. Local TypeScript/build PASS, adapter10/10 PASS, native305/305 PASS. V3 UI/copy warn on numeric estimates.

IN PROGRESS: persist M12 follow-up and create Preview at its exact commit; first Preview dpl_6pdqTza1rSL8Cce7MJWAdN7bUBFy belongs to superseded bd77b6f. Live route/browser E2E and remaining road matrix adapters not complete. Full detailed log: experiments/nationwide-tolls/WORK_LOG.md.

---

## CURRENT 2026-10-13 — V3 candidate-price integration

DONE locally on recovered remote source440ce6b2: V3 API uses its own route-pricing module, exact M4 vectors read finished candidate/known table; numeric V3 tolls carry «Стоимость не подтверждена» in UI and copy. Tests305/305 + adapter6/6, TypeScript and Next build16/16 PASS; local page200 / invalid API400 PASS. Logs: experiments/nationwide-tolls/WORK_LOG.md.

IN PROGRESS: persist reviewed changes to experimental branch and inspect Preview; live route/browser E2E not run. Other-road full matrix adapters not yet connected. No Production or merge.

---

## CURRENT 2026-10-12 — M-11 15–58 km full tariff matrix captured

- **DONE:** official operator PDF transcribed into `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`: 42 directed origin/destination cells across 7 toll nodes; exact no-section-transponder Group 1 passenger-car scope; five time/day bands; effective 2026-01-12 01:00. Raw values are retained without flattening Friday/Saturday/Sunday and overnight periods.
- **DONE:** JSON was read back and checked: 42 cells, seven origin nodes, five bands, all tariff amounts integral/non-null. Data commit `c6e544edf501937410c2e04ba083632ccba7d8cb`; log commit `9704effe53c146f38a5d0166743dc9fb69bab19f`.
- **IN PROGRESS:** convert all official tariff schedules into per-operator native matrices and enumerate full M-4 span cells; expand beyond Avtodor and M-11.
- **OPEN:** M-11 transition-time tariff selection (route crossing tariff time boundaries) requires operator rules before engine integration. Candidate tables from Avtodor still need PDF profile/date mapping. Main 58–679 M-11 and non-Avtodor toll systems remain open.
- Detailed source/decision history: `experiments/nationwide-tolls/WORK_LOG.md`; consolidated raw tariff intake: `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`.
- `runtimeEnabled=false`; V2/main/Production unchanged; no tests/build run (data-only).

---

## CURRENT 2026-10-12 — Avtodor raw tariff schedules bulk-captured

- **DONE:** `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` now preserves official tariff-page raw rows: M-4 21, M-1 1, M-3 3, M-12 25 mainline, ЦКАД 16 nodes/full-loop, А-289 6 OD/ramp fares, Togliatti bypass 3 OD fares. Amount sequences kept exactly as displayed; candidate profile/date interpretation remains explicit.
- **DONE:** directly dated official PDF rates captured for M-12 km 1148–1211 (Cat I 325 ₽; effective 2026-03-02) and M-11 St Petersburg km 679–684 (Cat I 56 ₽; effective 2026-03-02). Three M-4 vectors match saved Yandex totals but remain candidate pending PDF date/header confirmation and route-chain proof.
- **Latest data commit:** `5559ee2012f3dd7f55c7d557878658f6dd3f257a`; bulk-capture log `cb7262ddbe61415794fa4f9726b11abe0158231f`. Full provenance and next steps in `experiments/nationwide-tolls/WORK_LOG.md`.
- **IN PROGRESS:** obtain/read detailed tariff PDFs; map raw arrays to category-I/no-transponder and effective periods; continue sourcing toll operators outside the Avtodor schedule.
- **OPEN:** raw capture is broad but not yet a normalized/complete route-span fare matrix; exact mapping, effective dates, PVP vectors and most non-Avtodor operators remain unverified. M-4 accepted matrix still 2 cells.
- **Safety/status:** `runtimeEnabled=false`; V2/main/Production untouched; no tests/build run (data-only commits).

---

## CURRENT 2026-10-12 — tariff candidate intake expanded

- **DONE:** candidate catalog `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` now contains 21 Avtodor M-4 row transcriptions plus three M-4 span candidates reconciled with saved Yandex controls; additionally captured two directly dated official tariff records: M-12 I-category 325 ₽ for km 1148–1211 bypass package and M-11 St Petersburg km 679–684 I-category 56 ₽, both effective 2026-03-02.
- **DONE:** provenance/decisions/next steps appended to `experiments/nationwide-tolls/WORK_LOG.md` (latest log commit `53712074c1a64c07e3e1c400c42c5d61f5450123`). Data commits: `11f63bdf2f59ca4fbc545461960c14665f7c5db0`, `3363fcdbb0829e9a79e99979b8315a5183bff389`, `ab915c42e4ef420aea086af7963ad1c755770643`.
- **IN PROGRESS:** candidate-first expansion of tariff inputs for remaining toll products; capture full official PDFs and raw schedule values operator by operator.
- **OPEN:** M-4 candidate row column interpretation and current effective date need PDF confirmation for every row; route-to-PVP chains remain unproven for most OD controls. M-12 and M-11 entries cover only named sections, not their entire operator matrix.
- **Status:** actual isolated M-4 span matrix still has 2 accepted Yandex cells; other candidate rows are kept separate from runtime. `runtimeEnabled=false`; V2/main/Production untouched. No tests/build were run because changes are data/log only.
- **Next:** extract M-12 main route toll schedule and date; then transcribe dated full M-1/M-3/M-11/ЦКАД/A-289 and regional operator tables into the same candidate catalog, keeping source date and payment/category evidence.

---

## CURRENT 2026-10-12 — M-4 tariff candidate intake and Yandex reconciliation

- **DONE:** saved 21 official Avtodor M-4 tariff table rows, original displayed amounts, candidate class-I/no-transponder Mon–Thu/Fri–Sun interpretation, source provenance and caveats in `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`.
- **DONE:** appended detailed why/source/status/next-step entry to `experiments/nationwide-tolls/WORK_LOG.md`. Candidate route-span cross-checks now include [1223,1184,1093] = 850/1000 ₽ and [1223,1184,1093,1046] = 1230/1450 ₽; each exactly matches its existing Yandex route control. [416,460] = 230/360 ₽ matches official combined row and Lipetsk—Voronezh Yandex route amount, while its exact route chain is not displayed.
- **IN PROGRESS:** rapidly transcribe official candidate tariff tables for the remaining operators, preserving raw values and candidate status; then build matrix rows and route-vector evidence.
- **OPEN:** confirm effective dates and tariff-column meanings from detailed official PDFs; identify exact PVP chain for each Yandex OD; resolve the PVP 62/71 and 339/355 parallel/overlap semantics. Do not treat candidate rows as verified production fares.
- **Latest commits:** data intake `11f63bdf2f59ca4fbc545461960c14665f7c5db0`; Yandex reconciliation `3363fcdbb0829e9a79e99979b8315a5183bff389`; work log `11d874478b0b7a2eb82cb8af722ecebd9e2df78f`. Branch `experiment/toll-od-matrix-2026-10-08`.
- **Status:** actual sandbox M-4 matrix still has only 2 accepted Yandex cells; candidate dataset is separate. `runtimeEnabled=false`; no V2/main/Production edits; data/docs only, no tests/build run.
- Product decisions: `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md`, `experiments/toll-od-matrix/DECISIONS.md`; complete dated entries in `experiments/nationwide-tolls/WORK_LOG.md`.

---

## CURRENT 2026-10-12 — M-4 tariff candidate intake persisted

- **DONE (candidate capture):** official Avtodor M-4 tariff page transcribed into `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` (21 tariff rows, raw displayed amounts, candidate Category-I/no-transponder weekday/weekend interpretation, per-row readiness, source, Yandex control links). Values intentionally remain candidates pending official PDF/header/effective-date confirmation and route-to-PVP proof.
- **DONE:** append-only reasoned entry added to `experiments/nationwide-tolls/WORK_LOG.md`. Data commit `11f63bdf2f59ca4fbc545461960c14665f7c5db0`; log commit `545508b2f5f88382b4746e0868d63dd8ba6cca48`.
- **IN PROGRESS:** aggressively collect operator tariff candidate tables and fill each operator-specific data matrix; begin with downloadable Avtodor tariff PDF and other indexed official tables. Then map M-4 rates into complete symmetric PVP spans.
- **UNVERIFIED:** page-level effective date and exact column mapping were not established for every M-4 row; Yandex totals for Lipetsk—Voronezh and Domodedovo—Kashira match candidate rows but do not reveal exact PVP chain. Candidate capture is not final verified coverage.
- **Safety/status:** M-4 experiment matrix still has 2 Yandex cells; this candidate intake has not altered it. `runtimeEnabled=false`; V2, main and Production unchanged. Data-only change; no tests/build run.
- Detailed append-only provenance and decisions: `experiments/nationwide-tolls/WORK_LOG.md`; product rules: `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md` and `experiments/toll-od-matrix/DECISIONS.md`.

---

## CURRENT 2026-10-12 — benchmark plan updated

- Block 6 in `experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md` now records the seven dated OD pairs, fare/no-fare results, slow-alternative exclusion for Kronstadt, mixed M11 and ferry caveats, and fact that only two M4 chain cells are currently seeded. Plan update commit `92f748f`.
- Current-route observations and links remain in `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; control index in `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`; append-only logs in `WORK_LOG.md`.
- Not 100%: majority of Russian toll groups, M4 PVP spans and all operator-specific full tariff evidence/receipts remain unverified. All new routes are diagnostic-only; no new amounts activated in runtime. Branch: `experiment/toll-od-matrix-2026-10-08`; no tests/build run because this batch changed documentation only.

---

## CURRENT 2026-10-12 — ранний М‑4 OD контроль добавлен

- Домодедово (ул. Каширское шоссе, 32) → Кашира (Советская ул.): Яндекс fastest ~310 ₽ / 1:04 / 50 mi во вторник и ~400 ₽ / 1:15 / 50 mi в субботу, выезд 12:14. Подробная карточка выходного: легковое авто <2 м, без транспондера; route details показывают E115 → Каширское шоссе.
- UI не показывает ПВП vector, поэтому это только контроль всей OD пары, не M4 vector cell. Results `b24c728`, matrix `350e9b1`, log `da4c3b2`.
- Итого собрано больше датированных route pairs, но база остаётся неполной: M4 exact span table держит 2 cells, остальные M4 control fares ждут map-to-PVP evidence; большинство других групп TBD. Runtime false; не запускались кодовые проверки в этом doc-only блоке.

---

## CURRENT 2026-10-12 — локальная пара М-4 Липецк—Воронеж проверена

- Встроенный Yandex Maps дал для выбранного быстрого маршрута Липецк (площадь Ленина-Соборная) → Воронеж (площадь Ленина): 13.10 = ~230 ₽; 17.10 = ~360 ₽; оба 2 ч 1 мин / 78 mi. В деталях подтверждены автомобиль <2 м, без транспондера, цена на момент выезда; указан платный обход Задонска и Хлевного.
- UI не раскрыл крайние/промежуточные ПВП. Цены сохранены как контроль OD, но не добавлены в M4 span lookup до точного vector proof. Results `cb43927`, matrix `af7c4ed`, work log `709cf02`.
- База всё ещё не 100%; Yandex whole-route controls не заполняют автоматически все M4 endpoint pairs и сети/операторы. Runtime remains false; no tests/build run.

---

## CURRENT 2026-10-12 — новые датированные дальние контрольные пары

- Дополнительно проверены Cloud Chrome/Яндекс Карты для Москва→Краснодар: fastest whole-route estimate ~5 040 ₽ (13.10, будни) и ~6 090 ₽ (17.10, выходные); значения не раскладываются на M4 spans. Два endpoints/date snapshots теперь записаны и требуют сверки с прошлыми маршрутными значениями.
- Москва→Казань: fastest 8:48 и 8:37; Яндекс помечает «Паромная переправа» и «Платная дорога», сумму не показывает. Это не чистая M12 price evidence; остаётся unknown.
- Новые данные: `experiments/nationwide-tolls/YANDEX_DATE_TEST_RESULTS_2026-10-12.md`, matrix и log. Commits: results `13d2ea5`, matrix `82000fd`, log `6d09865`.
- Объём незакрытого: большинство национальных тарифных продуктов и M4 span combinations без заполненных проверенных price cells; M4 runtime выключен. Яндекс тест-пары не закрывают dated operator tariff tables, route detector, adapters или full Preview E2E. Следующий шаг: продолжить парные проверки маршрутами, которые пересекают конкретный продукт; разрешить расхождение полных M4 маршрутов по точным точкам и отрезкам; загрузить оставшиеся сроки/тарифы из первичных таблиц.

---

## CURRENT 2026-10-12 — расширены датированные Yandex route controls

- Через встроенный Cloud Chrome выполнены и зафиксированы пары датированных маршрутов: M4 Sochi→Rostov (~850/~1,000 ₽) и Sochi→Shakhty (~1,230/~1,450 ₽); Казань→Набережные Челны (fastest ETA 3:19/3:18, сумма в датированных карточках не показана); СПб→Кронштадт (fastest 1:01/1:05, цена не показана; более медленная альтернатива ~300 ₽ исключена из расчёта); Москва→СПб дальний контроль (~4,760/~5,550 ₽, whole-trip оценка нескольких М-11 продуктов).
- Казань и Кронштадт «сумма не показана» означает unknown, не бесплатный тариф. Для Москва→СПб не распределять whole-trip оценку по операторам/секциям без раскрытого Yandex breakdown.
- Источники наблюдений, даты/время и URL: `experiments/nationwide-tolls/YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; индекс всех контрольных пар: `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`; журнал: `WORK_LOG.md`.
- Последние commits этой серии: results `4e17a30`, matrix `e116cc2`, log `5db6456`. Все записи сделаны в изолированной ветке `experiment/toll-od-matrix-2026-10-08`.
- Национальная база **не 100%**: текущая матрица по-прежнему содержит TBD для большинства тарифных продуктов; две M4 векторные ячейки остаются единственными заполненными Yandex-ценами в runtime-format, `runtimeEnabled=false`. Не заявлять готовность всех дорог. Нужны локальные route controls по каждой сети/вектору, полные актуальные первичные тарифы, M-4 span комбинации, адаптеры, unit/build и Preview E2E. Следующий шаг: продолжить систематически собирать Yandex пары для конкретных продуктов и отдельно сохранять непоказанные суммы как unknown; затем сверять операторские тарифы.

---

## CURRENT 2026-10-12 — встроенный браузер восстановил работу Yandex benchmark

- Исправлено предыдущее предположение: встроенный Cloud Chrome доступен в текущей сессии с мобильного клиента. Яндекс Карты открыты внутри; пользователь может видеть вкладку.
- Датированные UI проверки (легковое авто, дата/время отправления 12:14, «избегать платных дорог» выключено): Sochi→Rostov, Tue 2026-10-13 = 8h08 / ~850 RUB, Sat 2026-10-17 = 7h53 / ~1,000 RUB; Sochi→Shakhty = 9h21 / ~1,230 RUB и 9h13 / ~1,450 RUB. Москва→Краснодар показывает платную дорогу без суммы.
- По пользовательскому указанию суммы карточек Яндекса принимаются как подтверждённые values для точного OD/vector/date/time контрольного прогона. M4 matrix получила 2 sandbox cells: [1223,1184,1093] 850/1,000; [1223,1184,1093,1046] 1,230/1,450. Обе ссылки/метаданные и лимит snapshot до 2026-10-17 находятся в cells. Matrix по-прежнему `runtimeEnabled=false`; Production не затронут.
- Артефакты: `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`, обновлённая `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`, `experiments/toll-od-matrix/matrix/m4-pvp-corridors.json`. Решение и журнал обновлены.
- Проверка после записи: JSON корректен; две ячейки проходят структурные инварианты (known PVP, canonical endpoint chain, safe integer amounts, valid dates, HTTPS source). Unit tests/CI/build/API E2E не запускались. Статус остальных тарифных продуктов и маршрутов — TBD/unknown.
- Commits: benchmark results `09469fc`; M4 span cells `1681ea5`; decision `a7d2bee`; matrix `2d020fc`; plan `fabe69a`; nationwide log `ac34ce3`.

## CURRENT 2026-10-12 — phased nationwide toll algorithm plan

- **Plan persisted:** [`experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md`](../experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md), commit `d1c996b1d779979f79449fdfd3ac327f469d8aaa`. Nine substantial blocks cover spec, legal/road inventory, dated operator tariffs, selected-route paid-edge evidence, adapters, Yandex/operator benchmarks, full build, Preview E2E and announcement acceptance.
- **Current product rule:** exactly one fastest-time route is displayed and priced only against its own geometry; base comparison is category I passenger car without transponder; unknown toll/price is not treated as free. M-4 uses a pre-priced symmetric span cell, with full PVP chain proof and two periods only.
- **DONE:** start catalogue of 22 tariff groups, limited offline fare samples and strict composer, some M3 PVP physical checks, saved Yandex controls, M-4 span lookup/compiler with empty real-price matrix, and 2026-10-12 tariff-model nomenclature.
- **IN PROGRESS / NOT COMPLETE:** legal completeness of the Russian toll-road list; current complete operator tables (notably conflicting M3 snapshots); nationwide selected-route toll-geometry coverage; per-operator adapters and current fare rows; same-route operator quote/receipt controls; latest-code E2E and green full build. A Vercel M-4 build at prior SHA failed in old timed-quote tests. Some V3 geometry fixes have not had a full user route E2E.
- **NEXT LARGE BLOCK:** reconcile the spec/handoff and assemble primary dated tariff sources, starting with the M3 conflict, then execute route evidence and tariff adapters system-by-system. Full priorities and accept criteria: nationwide `NEXT_STEPS.md` and plan.
- **Release boundary:** no Production or default-branch change in this work. A tested Preview is a gate; merge/Production/public announcement require a later explicit user decision after all claimed-scope checks pass.

---

## CURRENT 2026-10-11 — M-4 symmetric span tariff table clarified

- **LATEST PRODUCT RULE:** Map the selected fastest route's confirmed PVP chain to a continuous M-4 span bounded by first/last PVP. Price key is the canonical unordered endpoint pair; reverse direction reuses the same cell. Each span stores only Mon–Thu and Fri–Sun prices. Runtime picks one cell; no per-PVP sum and no exit/re-entry flow. Intermediate PVP chain verifies span. See latest decision in `experiments/toll-od-matrix/DECISIONS.md`.
- **SUPERSEDES:** earlier notes treating direction-specific ordered PVP sequences as separate fare keys. Evidence adapter remains useful, but matrix/compiler/quote tests must change to symmetric endpoint spans. Backlog order is updated in `experiments/toll-od-matrix/NEXT_STEPS.md`; audit addendum in `REASSESSMENT_2026-10-11.md`.
- **STATUS:** clarification/docs only; no runtime code, tests/build, route checks or deployment. The branch's matrix has zero price cells and its current V3 result still uses additive per-PVP money. Keep V2/Main/Production untouched.
- **Latest commits:** product decision `7110f3520075d617635473a0b9193d2fa061f0c5`; backlog `b14783625d859825a7fae68ebbbd93e3ea7e0185`; audit `f4964154bf53d624fe54c78fa0b387767107d70e`; log `f4f2f297afff360df684e306e1ce934b5feda6aa`.
- **NEXT:** redesign isolated matrix/compiler/tests around symmetric span endpoints; resolve reported fare/source differences; populate finite table; wire V3 sandbox exact lookup; verify both directions and gate span on same fastest geometry.

---

## CURRENT 2026-10-11 — reassessment: M-4 vector prices, sandbox only

- **DONE — design audit saved:** `experiments/toll-od-matrix/REASSESSMENT_2026-10-11.md`. The experimental exact ordered-PVP lookup and offline sum compiler align with the original concept, but the price matrix is empty and V3 still gets its displayed M-4 amount from the per-PVP additive path. Thus the algorithm exists as a partial isolated prototype, not a complete working tariff route.
- **CONFLICT TO RESOLVE:** saved rows yield `[1223,1184]` 850/1,160 ₽ and `[1223,1184,1093]` 1,000/1,430 ₽, while user-reported Yandex controls are 700/850 ₽ and 850/1,000 ₽. Do not seed either as a verified fare until same-date/profile/vector source is reconciled. Extra PVP 1046 requires its own geometry-confirmed vector and price.
- **SCOPE:** user says develop in separate sandbox and leave V2 untouched. This branch has a historic V2 diagnostic-shadow UI/API integration; review/remove or isolate it before reuse. No V2/Main/Production change was made in this review block.
- **Docs commits:** concept clarification `ab5533a1903a5bb4b5fe38c2be315ef4e8449935`; reassessment `4a38407cba54061aef3f8e071948167ac773f3ad`; reprioritized backlog `183f67633642285b770c13e09713e412856db370`; work-log audit `b0f142d2e59843bc30bb560de6e48c83b2eb7d36`. No tests/build/route recalculation/operator audit were run for these doc-only changes; earlier 165/165 does not cover them.
- **NEXT:** prove exact fastest-route PVP vectors for Sochi→Rostov, Sochi→Volnovakha, and longer control; reconcile official rows vs user/Yandex profile; populate vector cells, test unknown/extra-gate behavior, then replace V3 per-PVP money with vector lookup inside the sandbox. See `experiments/toll-od-matrix/NEXT_STEPS.md`.

---

## CURRENT 2026-10-11 — clarified M-4 PVP-vector tariffs

- **DONE — decision persisted:** fare for one continuous selected M-4 route is looked up by its complete ordered, geometry-confirmed PVP vector + calendar period; no general entry/exit interchange table or runtime sum of individual PVP amounts is needed for this product case. Decision in `experiments/toll-od-matrix/DECISIONS.md`; append-only record in `experiments/toll-od-matrix/WORK_LOG.md`.
- **USER-REPORTED references only (not independently tariff-verified):** `[1223,1184]` = 700 RUB Mon–Thu / 850 RUB Fri–Sun; `[1223,1184,1093]` = 850 / 1,000 RUB. If selected geometry continues across PVP 1046, use a separate exact vector and price cell. Missing or incomplete vector/cell => unknown/null, never a partial sum.
- **Scope/status:** docs only on `experiment/toll-od-matrix-2026-10-08`. Decision commit `ab5533a1903a5bb4b5fe38c2be315ef4e8449935`; work-log commit `d455da32027b9239c7190efbcd09a731287df525`. No runtime code/tariffs changed, no tests/build/route smoke/deployment run, Production untouched. Experimental M4 price matrix still has zero independently verified price cells.
- **NEXT:** implement vector-key lookup in the isolated experiment engine with two-/three-/four+ PVP, direction, period and unknown-cell regression cases; reconcile every user-provided vector price with a dated official tariff and same fastest-route geometry before any runtime cutover.

---

## CURRENT 2026-10-11 — профиль Яндекс-проверки и V3 fast-only Preview

- **ПРАВИЛО ПРОФИЛЯ ЗАКРЕПЛЕНО:** день недели/дата и ожидаемое время проезда; легковой автомобиль (категория I там, где совпадает с правилами оператора); основной тариф без транспондера и льгот; только заезд/съезд/направление выбранной быстрой геометрии Яндекса. Пользователю — единственный самый быстрый маршрут, без альтернатив. Подробности: `experiments/nationwide-tolls/DECISIONS.md`, журнал: `WORK_LOG.md`.
- **КОД FAST-ONLY РЕАЛИЗОВАН В ИЗОЛИРОВАННОМ V3 PREVIEW:** selector/UI выбирают и показывают один маршрут, тарификация вызывается по выбранному пути; V2 и Production остаются отдельными. Preview `https://mezhgorod-calculator-53y0sp8p5-4regodatbe-5310.vercel.app/v3`; deployment `dpl_27xe2AARTyLMRZswQBxdKoGvGPQF`, код SHA `62192398f343fcbf4a3c47f32c9585762c28839c`, READY; сборка скомпилирована, статические страницы 16/16. Страница отвечает HTTP 200.
- **ИСПРАВЛЕНИЕ ЗАПИСАНО В ВЕТКУ:** commit `53fda104234b491026116d833267c28afe0db53a` обновляет `route-leg.ts`: выбранный объект кандидата теперь источник routeGeometry и Valhalla evidence; названия Valhalla-кандидатов нормализуются для production M11/M12 tariff engines. Vercel build для последующей docs commit `43fadfb...` будет проверяться; кодовый SHA fix `53fda104...` сам по себе пока не отмечен как собранный.
- **ЦЕНЫ НЕ ЗАКРЫТЫ:** Yandex amounts остаются наблюдениями для того же профиля/геометрии, когда API показывает оценку. Чтобы утверждать операторский точный тариф, сопоставить ту же дату/время, класс I, без транспондера, направление и точные въезды/съезды с действующей официальной строкой тарифа/калькулятором или чеком. Разногласия и неизвестные сети перечислены в `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`; не переносить оценку на другой маршрут и не помечать unknown как 0.
- **Последняя запись правила:** решение commit `bf2427651e24e64f3ef51e4f834cbccf9176fa00`, work log commit `58c537d4d79eaceaf9a9f68288586500cfad1328`; code fix `53fda104234b491026116d833267c28afe0db53a`. Production не менялся.
- **NEXT:** дождаться Vercel deployment именно code SHA `53fda104...` (последующий Vercel Preview `dpl_8rqTVbayowCjjqma4xzj93RixE4w` строится с ветки после fix и docs commit; получить его git source SHA/logs, затем если сборка успешна); если сборка успешна — POST на `/api/v3/calculate` по контрольным OD, убедиться в одном результате и соответствии validation geometry; затем сверить выбранные тарифы с датированными операторскими правилами и актуальными Yandex route values. Production не выпускать до завершения проверок.

---

## CURRENT 2026-10-11 — Yandex route checks expanded

- **DONE — read-only route controls:** Yandex checks now include disputed alternatives Казань—Набережные Челны (~90/278 ₽) and СПб—Кронштадт (~600/300 ₽), plus long controls СПб—Москва (~6 150 ₽), Москва—Казань (~5 250 ₽), Москва↔Краснодар (~5 530/~5 260 ₽). Older M1/M3 checks remain documented. Exact observations, limitations and failed A-289 endpoint resolution are in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`.
- **INTERPRETATION:** these are route estimates for passenger car <2 m/no transponder; they do not certify per-gate tariffs or operator receipts. Route alternatives/direction deltas are unresolved checks, not billing corrections. A-289 not confirmed by the malformed endpoint. No all-network coverage claim.
- **DONE — docs persisted:** reconciliation appended and work log updated; latest audit commit `79b86c99654d072597c438e7027f4037cfb6ca47` (includes reconciliation, work log, next-step priority and this handoff). No code/tariff change. No tests/build/deploy run (docs-only research). Existing branch Preview remains on earlier source SHA; production untouched.
- **NEXT:** resolve each materially divergent route against exact selected geometry, dated operator tariffs and matching official trip calculator/receipt; expand targeted Yandex checks for open network groups listed in `NEXT_STEPS.md`. Never convert estimates directly to live prices.

---

## CURRENT 2026-10-11 — Yandex Maps fare controls observed

## M-4 symmetric span implementation checkpoint — 2026-10-12

- Sandbox branch: `experiment/toll-od-matrix-2026-10-08`; latest implementation commits: `032c6cca9ca6124a9abd88147c28837afa7bc2bb` (compiler now rejects any missing intermediate known PVP) and `3e12d7ede4299d7aeb4441a0b6f1372cea32759a` (regression test).
- New runtime span lookup/compiler/inventory/preview code uses one direction-independent endpoint pair and exactly two fare values (Mon–Thu, Fri–Sun). Runtime does not sum PVP rows. Matrix remains empty; no real tariff rows were inserted.
- Local Node test result: 4 focused new-schema suites pass (corridor, preview, inventory, compiler; compiler 15/15). This is not a full repository build.
- Vercel branch build at prior HEAD `739b586973827d744c48583f9299e2d8785c1640` failed in legacy timed-quote tests expecting the superseded `priceCells` and mixed-zone contract. This build issue remains open and must be fixed before calling the branch build green.
- V2/Main/Production were not modified or published. Real Yandex/official tariff verification and route-control E2E remain outstanding.


## Nationwide tariff-nomenclature checkpoint — 2026-10-12

- Added [`experiments/nationwide-tolls/TARIFF_NOMENCLATURE_2026-10-12.md`](../experiments/nationwide-tolls/TARIFF_NOMENCLATURE_2026-10-12.md), commit `9789fdfaa051eaf51cfcc0ccafdc91aa42afe596`. It maps the current 22 registry groups to tariff models, required exact-route inputs, official sources, and what can/cannot be considered a confirmed price. This is not yet a complete legal census or complete priced tariff database.
- Current official Avtodor tariff-page search excerpt surfaced newer M3 numbers than the archived snapshot: PVP 86 100/200 ₽, PVP 136 190/320 ₽, PVP 168 230/280 ₽ (Mon–Thu/Fri–Sun, category I no transponder as interpreted from table labels). Do not update runtime rows until primary document, column labels, effective date and Yandex same-route controls are reconciled.
- Nationwide operator sources expose materially different price structures: exact OD (ZSD, M11), per-section/free-flow (Mytishchi, Bagration), barrier PVP sequence (Khabarovsk), date/time windows (Kazan/MSD), exclusive corridors (Tolyatti/Udmurt) and cross-border eligibility (Amur). See nomenclature for all entries.
- No code pricing changes, tests, full build or deployment performed in this research/documentation block. Existing Yandex controls remain approximate route-level observations. No Production publication.
- Next concrete block: extract complete dated primary tariff files and reconcile the M3 conflict; then enter only supported per-operator rows and verify representative fastest-route controls in Yandex Maps. Full list and priorities in nationwide `NEXT_STEPS.md`.


## CURRENT 2026-10-12 — blocks 1–3 executed in sandbox

- **Canonical spec:** `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md` defines exactly one minimum-ETA route; price only that same route geometry; category I passenger car when operator classification matches; no transponder/privileges; tariff date and local passage-event time; complete evidence or unknown; distinct operator product models; M4 as full continuous PVP vector with a pre-entered symmetric price cell for Mon–Thu and Fri–Sun, no runtime per-PVP sum.
- **Scope:** `national-registry.json` retains 22 parent groups and now adds 16 child Avtodor tariff products (10 M4, 4 M11, 2 M3). Official source: https://russianhighways.ru/for_drivers/pay-sites.php . This is an expanded but partial inventory, not an exhaustive Russian legal census. Four Pskov roads remain unsplit.
- **Tariff audit:** M3 conflict is unresolved. Official tariff page is indexed but direct retrieval returned HTTP 403; snapshot/current indexed excerpt does not unambiguously establish effective date and class-I cash/no-transponder column. Existing rates were not overwritten. No new amount is marked verified.
- **Status:** block 1 specification complete (equal-ETA tie-break still needs code rule/tests); block 2 partial; block 3 partial/source audit only. Details: `IMPLEMENTATION_PLAN_2026-10-12.md`, `TARIFF_NOMENCLATURE_2026-10-12.md`, `WORK_LOG.md`, `NEXT_STEPS.md`.
- **Commits in this step:** `801750e` spec, `47ae694` registry, `2cec76e` decisions, `33f7c85` tariff nomenclature, `ad090b6` plan, `63789d2` work log, `4e2ba6b` next steps. Production/default branch untouched. Docs/registry-only work; JSON parsed before write; no tests, build or route E2E run.
- **Next:** obtain readable current primary tariff artifacts (starting M3), split Pskov into four separately sourced products, finish operator and legal object census. Proceed to blocks 4–6 after tariff/source coverage advances. Do not publish prices with unresolved sources.


## CURRENT 2026-10-12 — Yandex dated route tests blocked

- Prepared `experiments/nationwide-tolls/YANDEX_DATE_TEST_MATRIX_2026-10-12.md` for weekday Tue 2026-10-13 and weekend Sat 2026-10-17, with both dates/one local departure time, fastest-only, passenger car and route geometry/ETA/amount evidence capture. Matrix covers 16 detailed Avtodor products and selected route controls.
- No fresh Yandex route was calculated: Opera connector reports Browser not connected; TinyFish did not start due wallet balance -0.221166 USD (`wallet_out_of_funds`). No new UI observations, dates, sums, geometry or screenshots exist. Existing route estimates remain historic controls only; not marked as newly re-confirmed. No fare data/runtime changed.
- Next action: resume matrix via connected Opera Yandex Maps UI or TinyFish after wallet access is restored; record real output verbatim before marking any test. Do not claim the tests complete or seed fare cells until evidence is captured.
- Work log entry in `experiments/nationwide-tolls/WORK_LOG.md` dated 2026-10-12; matrix commit `a2bfaf4`, work log `67efc22`. Production unchanged.
## CURRENT 2026-10-13 — реализация плана, этап 1 частично

IN PROGRESS: создан [каталог тарифных продуктов](../experiments/nationwide-tolls/tariff-products.json) с отдельными ID М-4, А-289, западного обхода, частей М-11 и других систем; `pskov` явно помечен как неразделённый агрегат. Действующий V3 пока использует общий `m4_a289` и не читает каталог. Подробности и ограничения: [отчёт этапа 1](../experiments/nationwide-tolls/stages/01-baseline-and-product-boundaries.md). GitHub экспериментальная ветка подтверждена API на `1642c76cc479c8790c18351f1496ecc2949eeb52`, но прямой Git fetch недоступен, сравнение и перенос с локальной audit-веткой открыты. Production, main и Preview не менялись. Каталог прошёл отдельную проверку; полный build повторяется с доступными зависимостями, итог в отчёте.

CHECKS: 78/78 audit tests и quote contracts PASS с временным набором зависимостей, `next build --webpack` PASS (16 app routes). Обычный Turbopack build заблокирован внешним симлинком `node_modules`; см. отчёт. NEXT: закончить сравнение GitHub дерева с локальными коммитами, выбрать одну удалённую ветку, затем аудит 428 конфликтов М-4 и тарифных строк этапа 2. Итог маршрута unknown при любом непроверенном компоненте.
