
## 2026-10-18 — bounded mapped-fare candidate index

Read only the current handoff, CKAD tariff row names/values and the relevant product-boundary exports. The saved table contains CKAD М-11→А-107 = 119 ₽, but the reviewed handoff does not establish a separate exact boundary for a new route using that pair. Existing M-11→Егорьевское and M-11→М-12 geometry matchers are already connected. No code, fare matrix, runtime, source requests, route replay or build changed. [Checkpoint](../../docs/checkpoints/2026-10-18-mapped-fare-index-DONE.md).
# Текущий рабочий журнал

Полная прежняя история без изменения содержания: [WORK_LOG_HISTORY_2026-10-15_2228.md](WORK_LOG_HISTORY_2026-10-15_2228.md). Новые записи добавляются ниже; подробности каждого малого шага — в docs/checkpoints/.

# Восстановление среды после прерывания сохранения

STARTED 2026-10-15T22:29:12.186127+03:00. Execcell36недоступен, прежняярабочаякопияисчезла. Созданновыйclone рабочейветки fix/v3-missing-route-prices-2026-10-15 изGitHub. Remote/local97386e0ca063792f5c85e44dace2794964ed00f1,tree91d27d96a86735c7668926bb7d9709863142a325 сверены. Основнойкодdeparturepolicy сохранён. Последнийlocalc2acfe6/59PASSне дошёлдоremote: осталасьстараяassertnullдляизвестнойМ4+А289суммы1265; новыйauditmarkerтакженесохранён. Необъявлятьпрежний59PASSвосстановленнымбезновогозапуска.

Каталогиnode_modules другихстарыхкопий не содержатдоступногоnext; нужнызависимости. NEXT: pnpm install --frozen-lockfile,stdout docs/checkpoints/evidence/2026-10-15-resume-departure-install.log; затемсохранитьрезультат. Послеinstall восстановитьдваизвестныхмалыхизменения иfocused59,отдельныйcheckpoint; потомfullbuild/replay/liveБахмут→Казань.

Дляуменьшенияобъёмакаждогосохранения большойWORK_LOGиNEXT_STEPSперенесеныбезизменениябайтовв*_HISTORY_2026-10-15_2228.md. Новыеиндексысодержатпрямыессылки; историянеудалена/непереписана, дальнейшиезаписиappendвкороткийWORK_LOG. Этоустраняетповторнуюпередачусотентысячбайтовприкаждомcheckpoint. Артефакты/кодпрежнихшаговостаютсядостижимымивGitHub.

Новыхтестов/buildещёнет; Production/Android/mergeнет. Аудит8/155,40rawOD/39originalcomplete, тарифыдосменыполитикиисторические. Междорожныевекторыотложены; новоеdeparturepolicy21:48 действует.


# Зависимости восстановлены

DONE 2026-10-15T22:30:22.511770+03:00, remote5d2dcf1f0b092231f6d223586842e5eb134ac434/tree4c1437636a4b0ae48488d13d60114ecf6778c94a подтверждены. pnpm install --frozen-lockfile exit0; stdout docs/checkpoints/evidence/2026-10-15-resume-departure-install.log. Lockfileнеизменён, новыхruntimeтестовещёнет.

NEXT/STARTED: восстановитьнезакреплённыепоследниеправкиassert1265+missingM4guardиauditmarkertrip-departure-v1; выполнитьexpandedfocused8файлов заново,сохранитьлог/результат. Затемfullbuild/ESLint,offlineконтроль,продолжениеаудита. Старый59PASSневосстановленизсырогологаи незасчитывается заново. Матричныеданные/Production/Androidбезизменений.


# Восстановленная проверка59/59PASS, полныйbuildSTARTED

DONE 2026-10-15T22:31:01.629582+03:00, parentremote740156474625283083b4e16f101af2be182a56d4. Восстановлены2потерянныхизменения: составнаяМ4+А289цена1265иотдельныйmissingM4guard вv3-time-calendar-audit.test.ts; tariffPolicy trip-departure-v1/basisAt вновыхauditoutputs. Повторnode --import ./scripts/register-ts-paths.mjs --test8файлов(М4/datecalendar/М11ЦКАД/М11products/ЗСД/timecalendar/southern/availability) exit0,59/59PASS. Новыйточныйstdout docs/checkpoints/evidence/2026-10-15-departure-policy-focused-resumed.log. Этотновыйрезультатсохранён,прежнийутраченныйлогневыдаётсязавосстановленный.

STARTED: pnpm build→docs/checkpoints/evidence/2026-10-15-departure-policy-build-resumed.log; targetedESLintchangedfiles→2026-10-15-departure-policy-eslint-resumed.log. Послефактическогорезультатаотдельныйcheckpoint/remote; затемofflineГуляйполе→Москва,liveБахмут→Казань. Production/Android/mergeнет.


2026-10-16 00:02 МСК — STARTED: [восстановление и полный gate](../../docs/checkpoints/2026-10-16-0002-resume-build.md). Исходный remote 87419cc; нового результата сборки ещё нет.


BLOCKED: автоматическая проверка отклонила обе попытки push. Существующий remote DECISIONS проверен, но разрешение внутри репозитория не принято проверкой. Подробности: [checkpoint](../../docs/checkpoints/2026-10-16-0006-github-save-blocked.md). Новых тестов/build нет; локальные изменения не опубликованы.


2026-10-16 00:08 МСК: прямое разрешение пользователя в текущем чате получено, approval blocker снят. CLI push не имеет credentials (exit128). STARTED connector save/readback, затем frozen install/full build. [Checkpoint](../../docs/checkpoints/2026-10-16-0008-save-authorized.md).


2026-10-16: frozen install PASS/exit0; полный build STARTED. [Checkpoint](../../docs/checkpoints/2026-10-16-0014-install-pass-build-started.md).


2026-10-16 DONE: новый полный pnpm build exit0, 658/658 tests, quote/API/Next/TypeScript/static16/16 PASS. [Checkpoint](../../docs/checkpoints/2026-10-16-build-pass.md). NEXT targeted ESLint/diff, затем offline Гуляйполе.


2026-10-16 DONE: targeted ESLint18 файлов и diff check exit0. STARTED offline Гуляйполе→Москва четверг/суббота. [Checkpoint](../../docs/checkpoints/2026-10-16-eslint-pass-replay-started.md).


2026-10-16 DONE: Гуляйполе→Москва offline3810₽(четверг)/4640₽(суббота), оба replay complete/exit0. STARTED live Бахмут→Казань. [Checkpoint](../../docs/checkpoints/2026-10-16-huliaipole-replay-pass.md).


2026-10-16 BLOCKED: live Бахмут→Казань отклонён автоматической проверкой — разрешение на маршрутные данные в Valhalla/OSRM/BRouter требуется прямо в текущем чате; сведения о consent внутри репозитория не приняты. Live capture отсутствует, case planned,8/155 не меняется. [Подробности](../../docs/checkpoints/2026-10-16-routing-approval-blocked.md). Не повторять передачу до ответа пользователя.


2026-10-16 01:17 МСК: прямое разрешение передачи координат/маршрутных параметров Valhalla/OSRM/BRouter получено в текущем чате («Разрешаю доступ»). Approval blocker снят. STARTED live Бахмут→Казань. [Checkpoint](../../docs/checkpoints/2026-10-16-0117-routing-authorized-started.md).


2026-10-16 01:18МСК DONE: live Бахмут→Казань OSRM1452.489км/83339с, traceComplete, М12=850₽. Corpus live-captured; STARTED same-date/weekend replay. [Checkpoint](../../docs/checkpoints/2026-10-16-bakhmut-kazan-live-pass.md).


2026-10-16 DONE: Бахмут→Казань audited, same-date parity/оба replay complete,850/850₽; stage1=9/155. STARTED report/inventory. [Checkpoint](../../docs/checkpoints/2026-10-16-bakhmut-kazan-replay-pass.md).


2026-10-16: report/inventory exit0,raw43/41OD/40полных/0повреждений; stage1=9/155. STARTED single-case batch Бахмут→Керчь. [Подробности](../../docs/checkpoints/2026-10-16-report-inventory-bakhmut-kazan.md).


2026-10-16T01:22:32.681800+03:00: dnr-бахмут-kerch-center audited, commandexit0,stage1=10/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012232-dnr-бахмут-kerch-center-audit.md). NEXT dnr-бахмут-moscow-center.


2026-10-16T01:24:52.444807+03:00: dnr-бахмут-moscow-center audited, commandexit0,stage1=11/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012452-dnr-бахмут-moscow-center-audit.md). NEXT dnr-бахмут-saint-petersburg-center.


2026-10-16T01:26:09.407653+03:00: dnr-бахмут-saint-petersburg-center audited, commandexit0,stage1=12/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012609-dnr-бахмут-saint-petersburg-center-audit.md). NEXT dnr-волноваха-kazan-center.


2026-10-16T01:27:23.331643+03:00: dnr-волноваха-kazan-center audited, commandexit0,stage1=13/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012723-dnr-волноваха-kazan-center-audit.md). NEXT dnr-волноваха-kerch-center.


2026-10-16T01:28:30.254638+03:00: dnr-волноваха-kerch-center audited, commandexit0,stage1=14/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012830-dnr-волноваха-kerch-center-audit.md). NEXT dnr-волноваха-moscow-center.


2026-10-16T01:29:28.936436+03:00: dnr-волноваха-moscow-center audited, commandexit0,stage1=15/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-012928-dnr-волноваха-moscow-center-audit.md). NEXT dnr-волноваха-saint-petersburg-center.


2026-10-16T01:30:38.557711+03:00: dnr-волноваха-saint-petersburg-center audited, commandexit0,stage1=16/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013038-dnr-волноваха-saint-petersburg-center-audit.md). NEXT dnr-донецк-kazan-center.


2026-10-16T01:31:43.598269+03:00: dnr-донецк-kazan-center audited, commandexit0,stage1=17/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013143-dnr-донецк-kazan-center-audit.md). NEXT dnr-донецк-kerch-center.


2026-10-16T01:32:48.956437+03:00: dnr-донецк-kerch-center audited, commandexit0,stage1=18/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013248-dnr-донецк-kerch-center-audit.md). NEXT dnr-донецк-moscow-center.


2026-10-16T01:34:07.515381+03:00: dnr-донецк-moscow-center audited, commandexit0,stage1=19/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013407-dnr-донецк-moscow-center-audit.md). NEXT dnr-донецк-saint-petersburg-center.


2026-10-16T01:35:10.037288+03:00: dnr-донецк-saint-petersburg-center audited, commandexit0,stage1=20/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013510-dnr-донецк-saint-petersburg-center-audit.md). NEXT dnr-краматорск-kazan-center.


2026-10-16T01:36:22.441996+03:00: dnr-краматорск-kazan-center audited, commandexit0,stage1=21/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013622-dnr-краматорск-kazan-center-audit.md). NEXT dnr-краматорск-kerch-center.


2026-10-16T01:37:29.321891+03:00: dnr-краматорск-kerch-center audited, commandexit0,stage1=22/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-013729-dnr-краматорск-kerch-center-audit.md). NEXT dnr-краматорск-moscow-center.


2026-10-16T01:58:29.418256+03:00: dnr-краматорск-moscow-center audited, commandexit0,stage1=23/155. Report/inventory exit0. [Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-16-015829-dnr-краматорск-moscow-center-audit.md). NEXT kherson-аскания-нова-kazan-center.


2026-10-16T02:09:14.454441+03:00: пользователь изменил порядок на 20 небольших частей с отдельными запусками. Часть1 DONE; часть2 NEXT. [План](SMALL_PARTS_PLAN.md), [checkpoint](../../docs/checkpoints/2026-10-16-small-parts-01.md). Счётчик не повышен, новые маршруты/сборка не запускались.


16.10.2026 02:12 МСК: пользователь поручил автоматическое последовательное выполнение всех частей без ожидания команды «дальше». Часть2 STARTED: [checkpoint](../../docs/checkpoints/2026-10-16-small-parts-02-started.md). Переходить дальше после проверенного сохранения каждого малого подшага.

16.10.2026: часть2 runner progress/heartbeat15s, default1; 3/3 tests PASS. Strict evidence stage1=23/155,stage2=0/154. Fullbuild STARTED. [Checkpoint](../../docs/checkpoints/2026-10-16-small-parts-02-runner.md).

16.10.2026: часть2 build FAILED(exit1): Turbopack отверг внешний symlink node_modules. STARTED локальная копия зависимостей и повтор build. ../../docs/checkpoints/2026-10-16-small-parts-02-build-failed.md.

16.10.2026: часть2 full build retry PASS661/661 + quote/API + Next/TypeScript/static16/16. Lint/diff STARTED. ../../docs/checkpoints/2026-10-16-small-parts-02-build-pass.md.

16.10.2026: ESLint3/diff PASS; часть2 DONE. Часть3=19/19 по существующему evidence, DONE без повторов. Часть4=4/19, STARTED Аскания-Нова→Казань. [Checkpoint](../../docs/checkpoints/2026-10-16-small-parts-02-done-04-started.md). Автоматически далее по JSON после durable-сохранения.

16.10.2026: часть4 Аскания-Нова→Казань audited, stage1=24/155. Итогunknown: A289 exits unresolved; report/inventory exit0. NEXT STARTED Аскания-Нова→Керчь single-case. [Checkpoint](../../docs/checkpoints/2026-10-16-small-parts-04-askania-kazan.md).

2026-10-16T02:22:11.743397+03:00: часть4,case=kherson-аскания-нова-kerch-center,audited,batch exit0,report/inventory[0, 0],stage=[25, 0]. Parenta2363425b89d5b10b004cb38dba99ae891ebc452; [checkpoint](../../docs/checkpoints/2026-10-15T23-21-53-548Z-part4.md). NEXTSTARTED часть4: kherson-аскания-нова-moscow-center. No merge/Production.

2026-10-16T02:25:46.348218+03:00: часть4,case=kherson-аскания-нова-moscow-center,audited,batch exit0,report/inventory[0, 0],stage=[26, 0]. Parent5cbf1fdf9123ac17badb90fd484c6ea82f8ad4fb; [checkpoint](../../docs/checkpoints/2026-10-15T23-24-38-167Z-part4.md). NEXTSTARTED часть4: kherson-аскания-нова-saint-petersburg-center. No merge/Production.

2026-10-16T02:27:39.685785+03:00: часть4,case=kherson-аскания-нова-saint-petersburg-center,audited,batch exit0,report/inventory[0, 0],stage=[27, 0]. Parent7af4d8eb507ac5cfb8d644dc0642346ff04ac7a8; [checkpoint](../../docs/checkpoints/2026-10-15T23-26-39-527Z-part4.md). NEXTSTARTED часть4: kherson-геническ-kazan-center. No merge/Production.

16.10.2026 STARTED: автономное последовательное исполнение через GitHubActions, по1case с durable STARTED/DONE. Входы/ограничения: ../../docs/checkpoints/2026-10-16-automatic-queue-started.md. Сначала tests/build/lint; далее возвращение к части4.

16.10.2026: autonomous runner/progress checkpoint implemented, focused14/14PASS. Workflow не включён. Fullbuild STARTED, лог evidence/2026-10-16-auto-queue-build.log. ../../docs/checkpoints/2026-10-16-automatic-queue-focused-pass.md.

16.10.2026: automaticqueue fullbuild666/666+quote/API+Next/TypeScript/static16/16PASS; lint/YAML STARTED. ../../docs/checkpoints/2026-10-16-automatic-queue-build-pass.md.

16.10.2026: automaticqueue workflow enabled after focused14/full666/lint4/YAML/diffPASS. Следующее проверить actualrun черезGitHubAPI, затем не писатьприactivejob. [Checkpoint](../../docs/checkpoints/2026-10-16-automatic-queue-enabled.md). Baseline27/155,0/154; части19–20 не выполнены.

16.10.2026: Actions первыйjob failed доcase из-за trailingwhitespaceвновомlogformatter; GitHubgate666PASS. STARTED formatterfix/fullgate/rerun. Hourlycontinuationpausedдоисправления. ../../docs/checkpoints/2026-10-16-automatic-queue-first-job-failed.md.

16.10.2026: checkpointformatter исправлен, focused15/15PASS; fullgate STARTED, затем lint/rerunjob. ../../docs/checkpoints/2026-10-16-automatic-queue-log-fix.md.

16.10.2026: formatterfix fullgate667/667PASS; lint2/diff STARTED. ../../docs/checkpoints/2026-10-16-automatic-queue-log-fix-build-pass.md.

16.10.2026: lint2/diffPASS; full667PASS; STARTED rerunjob116728494584, latestbranch. Послестарта не писатьпараллельно. [Checkpoint](../../docs/checkpoints/2026-10-16-automatic-queue-log-fix-ready.md).

2026-10-15T23:40:33.905Z: automatic queue STARTED; 27/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-40-33-905Z-started.json). kherson-геническ-kazan-center

2026-10-15T23:41:04.596Z: automatic queue DONE; 28/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-04-596Z-done.json). kherson-геническ-kazan-center

2026-10-15T23:41:07.612Z: automatic queue STARTED; 28/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-07-612Z-started.json). kherson-геническ-kerch-center

2026-10-15T23:41:19.772Z: automatic queue DONE; 29/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-19-772Z-done.json). kherson-геническ-kerch-center

2026-10-15T23:41:22.289Z: automatic queue STARTED; 29/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-22-289Z-started.json). kherson-геническ-moscow-center

2026-10-15T23:41:46.556Z: automatic queue DONE; 30/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-46-556Z-done.json). kherson-геническ-moscow-center

2026-10-15T23:41:49.369Z: automatic queue STARTED; 30/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-41-49-369Z-started.json). kherson-геническ-saint-petersburg-center

2026-10-15T23:42:23.746Z: automatic queue DONE; 31/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-42-23-746Z-done.json). kherson-геническ-saint-petersburg-center

2026-10-15T23:42:26.758Z: automatic queue STARTED; 31/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-42-26-758Z-started.json). kherson-каховка-kazan-center

2026-10-15T23:42:58.137Z: automatic queue DONE; 32/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-42-58-137Z-done.json). kherson-каховка-kazan-center

2026-10-15T23:43:01.052Z: automatic queue STARTED; 32/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-43-01-052Z-started.json). kherson-каховка-kerch-center

2026-10-15T23:43:13.981Z: automatic queue DONE; 33/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-43-13-981Z-done.json). kherson-каховка-kerch-center

2026-10-15T23:43:16.487Z: automatic queue STARTED; 33/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-43-16-487Z-started.json). kherson-каховка-moscow-center

2026-10-15T23:43:42.217Z: automatic queue DONE; 34/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-43-42-217Z-done.json). kherson-каховка-moscow-center

2026-10-15T23:43:45.038Z: automatic queue STARTED; 34/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-43-45-038Z-started.json). kherson-каховка-saint-petersburg-center

2026-10-15T23:44:20.843Z: automatic queue DONE; 35/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-44-20-843Z-done.json). kherson-каховка-saint-petersburg-center

2026-10-15T23:44:23.831Z: automatic queue STARTED; 35/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-44-23-831Z-started.json). kherson-новая-збурьевка-kazan-center

2026-10-15T23:44:55.819Z: automatic queue DONE; 36/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-44-55-819Z-done.json). kherson-новая-збурьевка-kazan-center

2026-10-15T23:44:59.259Z: automatic queue STARTED; 36/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-44-59-259Z-started.json). kherson-новая-збурьевка-kerch-center

2026-10-15T23:45:12.468Z: automatic queue DONE; 37/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-45-12-468Z-done.json). kherson-новая-збурьевка-kerch-center

2026-10-15T23:45:15.365Z: automatic queue STARTED; 37/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-45-15-365Z-started.json). kherson-новая-збурьевка-moscow-center

2026-10-15T23:45:41.811Z: automatic queue DONE; 38/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-45-41-811Z-done.json). kherson-новая-збурьевка-moscow-center

2026-10-15T23:45:44.855Z: automatic queue STARTED; 38/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-45-44-855Z-started.json). lnr-алчевск-kazan-center

2026-10-15T23:46:08.515Z: automatic queue DONE; 39/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-08-515Z-done.json). lnr-алчевск-kazan-center

2026-10-15T23:46:11.469Z: automatic queue STARTED; 39/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-11-469Z-started.json). lnr-алчевск-kerch-center

2026-10-15T23:46:26.805Z: automatic queue DONE; 40/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-26-805Z-done.json). lnr-алчевск-kerch-center

2026-10-15T23:46:29.515Z: automatic queue STARTED; 40/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-29-515Z-started.json). lnr-алчевск-moscow-center

2026-10-15T23:46:48.189Z: automatic queue DONE; 41/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-48-189Z-done.json). lnr-алчевск-moscow-center

2026-10-15T23:46:51.166Z: automatic queue STARTED; 41/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-46-51-166Z-started.json). lnr-алчевск-saint-petersburg-center

2026-10-15T23:47:21.506Z: automatic queue DONE; 42/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-47-21-506Z-done.json). lnr-алчевск-saint-petersburg-center

2026-10-15T23:47:24.743Z: automatic queue STARTED; 42/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-47-24-743Z-started.json). lnr-антрацит-kazan-center

2026-10-15T23:47:49.399Z: automatic queue DONE; 43/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-47-49-399Z-done.json). lnr-антрацит-kazan-center

2026-10-15T23:47:52.449Z: automatic queue STARTED; 43/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-47-52-449Z-started.json). lnr-антрацит-kerch-center

2026-10-15T23:48:07.967Z: automatic queue DONE; 44/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-48-07-967Z-done.json). lnr-антрацит-kerch-center

2026-10-15T23:48:10.725Z: automatic queue STARTED; 44/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-48-10-725Z-started.json). lnr-антрацит-moscow-center

2026-10-15T23:48:29.934Z: automatic queue DONE; 45/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-48-29-934Z-done.json). lnr-антрацит-moscow-center

2026-10-15T23:48:32.972Z: automatic queue STARTED; 45/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-48-32-972Z-started.json). lnr-антрацит-saint-petersburg-center

2026-10-15T23:49:02.941Z: automatic queue DONE; 46/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-02-941Z-done.json). lnr-антрацит-saint-petersburg-center

2026-10-15T23:49:06.684Z: automatic queue STARTED; 46/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-06-684Z-started.json). lnr-довжанск-kazan-center

2026-10-15T23:49:30.303Z: automatic queue DONE; 47/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-30-303Z-done.json). lnr-довжанск-kazan-center

2026-10-15T23:49:33.379Z: automatic queue STARTED; 47/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-33-379Z-started.json). lnr-довжанск-kerch-center

2026-10-15T23:49:48.761Z: automatic queue DONE; 48/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-48-761Z-done.json). lnr-довжанск-kerch-center

2026-10-15T23:49:51.662Z: automatic queue STARTED; 48/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-49-51-662Z-started.json). lnr-довжанск-moscow-center

2026-10-15T23:50:11.104Z: automatic queue DONE; 49/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-50-11-104Z-done.json). lnr-довжанск-moscow-center

2026-10-15T23:50:14.101Z: automatic queue STARTED; 49/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-50-14-101Z-started.json). lnr-довжанск-saint-petersburg-center

2026-10-15T23:50:43.650Z: automatic queue DONE; 50/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-50-43-650Z-done.json). lnr-довжанск-saint-petersburg-center

2026-10-15T23:50:46.902Z: automatic queue STARTED; 50/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-50-46-902Z-started.json). lnr-марковка-kazan-center

2026-10-15T23:51:09.610Z: automatic queue DONE; 51/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-09-610Z-done.json). lnr-марковка-kazan-center

2026-10-15T23:51:12.775Z: automatic queue STARTED; 51/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-12-775Z-started.json). lnr-марковка-kerch-center

2026-10-15T23:51:29.650Z: automatic queue DONE; 52/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-29-650Z-done.json). lnr-марковка-kerch-center

2026-10-15T23:51:32.507Z: automatic queue STARTED; 52/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-32-507Z-started.json). lnr-марковка-moscow-center

2026-10-15T23:51:50.024Z: automatic queue DONE; 53/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-50-024Z-done.json). lnr-марковка-moscow-center

2026-10-15T23:51:53.065Z: automatic queue STARTED; 53/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-51-53-065Z-started.json). lnr-марковка-saint-petersburg-center

2026-10-15T23:52:20.470Z: automatic queue DONE; 54/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-52-20-470Z-done.json). lnr-марковка-saint-petersburg-center

2026-10-15T23:52:23.549Z: automatic queue STARTED; 54/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-52-23-549Z-started.json). zaporizhzhia-бердянск-kazan-center

2026-10-15T23:52:57.567Z: automatic queue DONE; 55/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-52-57-567Z-done.json). zaporizhzhia-бердянск-kazan-center

2026-10-15T23:53:01.004Z: automatic queue STARTED; 55/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-53-01-004Z-started.json). zaporizhzhia-бердянск-kerch-center

2026-10-15T23:53:17.071Z: automatic queue DONE; 56/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-53-17-071Z-done.json). zaporizhzhia-бердянск-kerch-center

2026-10-15T23:53:19.996Z: automatic queue STARTED; 56/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-53-19-996Z-started.json). zaporizhzhia-бердянск-moscow-center

2026-10-15T23:53:48.804Z: automatic queue DONE; 57/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-53-48-804Z-done.json). zaporizhzhia-бердянск-moscow-center

2026-10-15T23:53:52.239Z: automatic queue STARTED; 57/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-53-52-239Z-started.json). zaporizhzhia-бердянск-saint-petersburg-center

2026-10-15T23:54:30.887Z: automatic queue DONE; 58/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-54-30-887Z-done.json). zaporizhzhia-бердянск-saint-petersburg-center

2026-10-15T23:54:34.353Z: automatic queue STARTED; 58/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-54-34-353Z-started.json). zaporizhzhia-васильевка-kazan-center

2026-10-15T23:55:08.986Z: automatic queue DONE; 59/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-55-08-986Z-done.json). zaporizhzhia-васильевка-kazan-center

2026-10-15T23:55:12.345Z: automatic queue STARTED; 59/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-55-12-345Z-started.json). zaporizhzhia-васильевка-kerch-center

2026-10-15T23:55:28.580Z: automatic queue DONE; 60/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-55-28-580Z-done.json). zaporizhzhia-васильевка-kerch-center

2026-10-15T23:55:31.606Z: automatic queue STARTED; 60/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-55-31-606Z-started.json). zaporizhzhia-васильевка-moscow-center

2026-10-15T23:56:00.813Z: automatic queue DONE; 61/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-56-00-813Z-done.json). zaporizhzhia-васильевка-moscow-center

2026-10-15T23:56:04.416Z: automatic queue STARTED; 61/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-56-04-416Z-started.json). zaporizhzhia-васильевка-saint-petersburg-center

2026-10-15T23:56:43.745Z: automatic queue DONE; 62/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-56-43-745Z-done.json). zaporizhzhia-васильевка-saint-petersburg-center

2026-10-15T23:56:47.333Z: automatic queue STARTED; 62/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-56-47-333Z-started.json). zaporizhzhia-гуляйполе-kazan-center

2026-10-15T23:57:18.299Z: automatic queue DONE; 63/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-57-18-299Z-done.json). zaporizhzhia-гуляйполе-kazan-center

2026-10-15T23:57:21.660Z: automatic queue STARTED; 63/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-57-21-660Z-started.json). zaporizhzhia-гуляйполе-kerch-center

2026-10-15T23:57:40.220Z: automatic queue DONE; 64/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-57-40-220Z-done.json). zaporizhzhia-гуляйполе-kerch-center

2026-10-15T23:57:43.287Z: automatic queue STARTED; 64/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-57-43-287Z-started.json). zaporizhzhia-кушугум-kazan-center

2026-10-15T23:58:20.131Z: automatic queue DONE; 65/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-58-20-131Z-done.json). zaporizhzhia-кушугум-kazan-center

2026-10-15T23:58:23.588Z: automatic queue STARTED; 65/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-58-23-588Z-started.json). max-chain-m12-ckad-m11-zsd-arzamas-to-prim

2026-10-15T23:58:46.375Z: automatic queue DONE; 66/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-58-46-375Z-done.json). max-chain-m12-ckad-m11-zsd-arzamas-to-prim

2026-10-15T23:58:49.671Z: automatic queue STARTED; 66/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-58-49-671Z-started.json). max-chain-m12-ckad-m11-zsd-kazan-to-sest

2026-10-15T23:59:18.896Z: automatic queue DONE; 67/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-59-18-896Z-done.json). max-chain-m12-ckad-m11-zsd-kazan-to-sest

2026-10-15T23:59:22.000Z: automatic queue STARTED; 67/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-59-22-000Z-started.json). max-chain-m12-ckad-m11-zsd-murom-to-sest

2026-10-15T23:59:43.943Z: automatic queue DONE; 68/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-59-43-943Z-done.json). max-chain-m12-ckad-m11-zsd-murom-to-sest

2026-10-15T23:59:47.109Z: automatic queue STARTED; 68/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-15T23-59-47-109Z-started.json). max-chain-m12-ckad-m11-zsd-sest-to-kazan

2026-10-16T00:00:16.443Z: automatic queue DONE; 69/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-00-16-443Z-done.json). max-chain-m12-ckad-m11-zsd-sest-to-kazan

2026-10-16T00:00:19.716Z: automatic queue STARTED; 69/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-00-19-716Z-started.json). max-chain-m12-ckad-m11-zsd-sest-to-murom

2026-10-16T00:00:41.241Z: automatic queue DONE; 70/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-00-41-241Z-done.json). max-chain-m12-ckad-m11-zsd-sest-to-murom

2026-10-16T00:00:44.484Z: automatic queue STARTED; 70/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-00-44-484Z-started.json). max-chain-m4-ckad-m11-zsd-krasnodar-to-sest

2026-10-16T00:01:18.964Z: automatic queue DONE; 71/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-01-18-964Z-done.json). max-chain-m4-ckad-m11-zsd-krasnodar-to-sest

2026-10-16T00:01:22.469Z: automatic queue STARTED; 71/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-01-22-469Z-started.json). max-chain-m4-ckad-m11-zsd-rostov-to-sest

2026-10-16T00:01:54.934Z: automatic queue DONE; 72/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-01-54-934Z-done.json). max-chain-m4-ckad-m11-zsd-rostov-to-sest

2026-10-16T00:01:58.481Z: automatic queue STARTED; 72/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-01-58-481Z-started.json). max-chain-m4-ckad-m11-zsd-sest-to-krasnodar

2026-10-16T00:02:33.938Z: automatic queue DONE; 73/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-02-33-938Z-done.json). max-chain-m4-ckad-m11-zsd-sest-to-krasnodar

2026-10-16T00:02:37.408Z: automatic queue STARTED; 73/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-02-37-408Z-started.json). max-chain-m4-ckad-m11-zsd-sest-to-rostov

2026-10-16T00:03:09.731Z: automatic queue DONE; 74/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-03-09-731Z-done.json). max-chain-m4-ckad-m11-zsd-sest-to-rostov

2026-10-16T00:03:13.205Z: automatic queue STARTED; 74/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-03-13-205Z-started.json). max-chain-m4-ckad-m11-zsd-voronezh-to-prim

2026-10-16T00:03:38.150Z: automatic queue DONE; 75/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-03-38-150Z-done.json). max-chain-m4-ckad-m11-zsd-voronezh-to-prim

2026-10-16T00:03:41.472Z: automatic queue STARTED; 75/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-03-41-472Z-started.json). pair-m11-ckad-domodedovo-to-spb

2026-10-16T00:04:01.727Z: automatic queue DONE; 76/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-01-727Z-done.json). pair-m11-ckad-domodedovo-to-spb

2026-10-16T00:04:05.018Z: automatic queue STARTED; 76/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-05-018Z-started.json). pair-m11-ckad-noginsk-to-spb

2026-10-16T00:04:22.536Z: automatic queue DONE; 77/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-22-536Z-done.json). pair-m11-ckad-noginsk-to-spb

2026-10-16T00:04:25.897Z: automatic queue STARTED; 77/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-25-897Z-started.json). pair-m11-ckad-spb-to-domodedovo

2026-10-16T00:04:45.763Z: automatic queue DONE; 78/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-45-763Z-done.json). pair-m11-ckad-spb-to-domodedovo

2026-10-16T00:04:48.931Z: automatic queue STARTED; 78/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-04-48-931Z-started.json). pair-m11-ckad-spb-to-noginsk

2026-10-16T00:05:08.588Z: automatic queue DONE; 79/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-08-588Z-done.json). pair-m11-ckad-spb-to-noginsk

2026-10-16T00:05:11.843Z: automatic queue STARTED; 79/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-11-843Z-started.json). pair-m11-ckad-torzhok-to-ramenskoe

2026-10-16T00:05:30.318Z: automatic queue DONE; 80/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-30-318Z-done.json). pair-m11-ckad-torzhok-to-ramenskoe

2026-10-16T00:05:33.477Z: automatic queue STARTED; 80/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-33-477Z-started.json). pair-m11-zsd-moscow-to-prim

2026-10-16T00:05:53.489Z: automatic queue DONE; 81/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-53-489Z-done.json). pair-m11-zsd-moscow-to-prim

2026-10-16T00:05:56.791Z: automatic queue STARTED; 81/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-05-56-791Z-started.json). pair-m11-zsd-moscow-to-sest

2026-10-16T00:06:16.585Z: automatic queue DONE; 82/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-06-16-585Z-done.json). pair-m11-zsd-moscow-to-sest

2026-10-16T00:06:19.793Z: automatic queue STARTED; 82/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-06-19-793Z-started.json). pair-m11-zsd-prim-to-moscow

2026-10-16T00:06:39.445Z: automatic queue DONE; 83/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-06-39-445Z-done.json). pair-m11-zsd-prim-to-moscow

2026-10-16T00:06:42.824Z: automatic queue STARTED; 83/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-06-42-824Z-started.json). pair-m11-zsd-sest-to-moscow

2026-10-16T00:07:02.015Z: automatic queue DONE; 84/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-02-015Z-done.json). pair-m11-zsd-sest-to-moscow

2026-10-16T00:07:05.302Z: automatic queue STARTED; 84/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-05-302Z-started.json). pair-m11-zsd-tver-to-sest

2026-10-16T00:07:23.608Z: automatic queue DONE; 85/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-23-608Z-done.json). pair-m11-zsd-tver-to-sest

2026-10-16T00:07:26.937Z: automatic queue STARTED; 85/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-26-937Z-started.json). pair-m12-ckad-dmitrov-to-kazan

2026-10-16T00:07:48.677Z: automatic queue DONE; 86/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-48-677Z-done.json). pair-m12-ckad-dmitrov-to-kazan

2026-10-16T00:07:52.201Z: automatic queue STARTED; 86/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-07-52-201Z-started.json). pair-m12-ckad-kazan-to-dmitrov

2026-10-16T00:08:12.393Z: automatic queue DONE; 87/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-08-12-393Z-done.json). pair-m12-ckad-kazan-to-dmitrov

2026-10-16T00:08:15.777Z: automatic queue STARTED; 87/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-08-15-777Z-started.json). pair-m12-ckad-kazan-to-klin

2026-10-16T00:08:36.263Z: automatic queue DONE; 88/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-08-36-263Z-done.json). pair-m12-ckad-kazan-to-klin

2026-10-16T00:08:39.658Z: automatic queue STARTED; 88/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-08-39-658Z-started.json). pair-m12-ckad-klin-to-kazan

2026-10-16T00:09:02.707Z: automatic queue DONE; 89/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-02-707Z-done.json). pair-m12-ckad-klin-to-kazan

2026-10-16T00:09:06.105Z: automatic queue STARTED; 89/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-06-105Z-started.json). pair-m12-ckad-vladimir-to-klin

2026-10-16T00:09:24.022Z: automatic queue DONE; 90/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-24-022Z-done.json). pair-m12-ckad-vladimir-to-klin

2026-10-16T00:09:27.508Z: automatic queue STARTED; 90/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-27-508Z-started.json). pair-m4-a289-kerch-to-rostov

2026-10-16T00:09:46.074Z: automatic queue DONE; 91/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-46-074Z-done.json). pair-m4-a289-kerch-to-rostov

2026-10-16T00:09:49.466Z: automatic queue STARTED; 91/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-09-49-466Z-started.json). pair-m4-a289-moscow-to-taman

2026-10-16T00:10:21.709Z: automatic queue DONE; 92/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-10-21-709Z-done.json). pair-m4-a289-moscow-to-taman

2026-10-16T00:10:25.320Z: automatic queue STARTED; 92/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-10-25-320Z-started.json). pair-m4-a289-rostov-to-kerch

2026-10-16T00:10:43.932Z: automatic queue DONE; 93/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-10-43-932Z-done.json). pair-m4-a289-rostov-to-kerch

2026-10-16T00:10:47.619Z: automatic queue STARTED; 93/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-10-47-619Z-started.json). pair-m4-a289-taman-to-voronezh

2026-10-16T00:11:08.710Z: automatic queue DONE; 94/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-11-08-710Z-done.json). pair-m4-a289-taman-to-voronezh

2026-10-16T00:11:12.322Z: automatic queue STARTED; 94/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-11-12-322Z-started.json). pair-m4-a289-voronezh-to-taman

2026-10-16T00:11:35.219Z: automatic queue DONE; 95/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-11-35-219Z-done.json). pair-m4-a289-voronezh-to-taman

2026-10-16T00:11:38.769Z: automatic queue STARTED; 95/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-11-38-769Z-started.json). pair-m4-m11-krasnodar-to-spb

2026-10-16T00:12:14.266Z: automatic queue DONE; 96/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-12-14-266Z-done.json). pair-m4-m11-krasnodar-to-spb

2026-10-16T00:12:18.025Z: automatic queue STARTED; 96/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-12-18-025Z-started.json). pair-m4-m11-rostov-to-spb

2026-10-16T00:12:50.284Z: automatic queue DONE; 97/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-12-50-284Z-done.json). pair-m4-m11-rostov-to-spb

2026-10-16T00:12:54.045Z: automatic queue STARTED; 97/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-12-54-045Z-started.json). pair-m4-m11-spb-to-krasnodar

2026-10-16T00:13:30.524Z: automatic queue DONE; 98/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-13-30-524Z-done.json). pair-m4-m11-spb-to-krasnodar

2026-10-16T00:13:34.224Z: automatic queue STARTED; 98/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-13-34-224Z-started.json). pair-m4-m11-spb-to-rostov

2026-10-16T00:14:07.012Z: automatic queue DONE; 99/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-14-07-012Z-done.json). pair-m4-m11-spb-to-rostov

2026-10-16T00:14:10.887Z: automatic queue STARTED; 99/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-14-10-887Z-started.json). pair-m4-m11-voronezh-to-spb

2026-10-16T00:14:37.228Z: automatic queue DONE; 100/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-14-37-228Z-done.json). pair-m4-m11-voronezh-to-spb

2026-10-16T00:14:40.938Z: automatic queue STARTED; 100/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-14-40-938Z-started.json). single-a289-kerch-to-krasnodar

2026-10-16T00:14:59.522Z: automatic queue DONE; 101/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-14-59-522Z-done.json). single-a289-kerch-to-krasnodar

2026-10-16T00:15:03.210Z: automatic queue STARTED; 101/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-15-03-210Z-started.json). single-a289-krasnodar-to-kerch

2026-10-16T00:15:22.149Z: automatic queue DONE; 102/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-15-22-149Z-done.json). single-a289-krasnodar-to-kerch

2026-10-16T00:15:25.700Z: automatic queue STARTED; 102/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-15-25-700Z-started.json). single-a289-krasnodar-to-taman

2026-10-16T00:15:44.038Z: automatic queue DONE; 103/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-15-44-038Z-done.json). single-a289-krasnodar-to-taman

2026-10-16T00:15:47.452Z: automatic queue STARTED; 103/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-15-47-452Z-started.json). single-a289-krasnodar-to-temryuk

2026-10-16T00:16:05.771Z: automatic queue DONE; 104/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-05-771Z-done.json). single-a289-krasnodar-to-temryuk

2026-10-16T00:16:09.361Z: automatic queue STARTED; 104/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-09-361Z-started.json). single-a289-taman-to-krasnodar

2026-10-16T00:16:27.596Z: automatic queue DONE; 105/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-27-596Z-done.json). single-a289-taman-to-krasnodar

2026-10-16T00:16:31.324Z: automatic queue STARTED; 105/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-31-324Z-started.json). single-ckad-domodedovo-to-klin

2026-10-16T00:16:51.432Z: automatic queue DONE; 106/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-51-432Z-done.json). single-ckad-domodedovo-to-klin

2026-10-16T00:16:55.385Z: automatic queue STARTED; 106/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-16-55-385Z-started.json). single-ckad-klin-to-domodedovo

2026-10-16T00:17:14.091Z: automatic queue DONE; 107/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-17-14-091Z-done.json). single-ckad-klin-to-domodedovo

2026-10-16T00:17:17.820Z: automatic queue STARTED; 107/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-17-17-820Z-started.json). single-ckad-noginsk-to-podolsk

2026-10-16T00:17:35.955Z: automatic queue DONE; 108/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-17-35-955Z-done.json). single-ckad-noginsk-to-podolsk

2026-10-16T00:17:39.817Z: automatic queue STARTED; 108/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-17-39-817Z-started.json). single-ckad-podolsk-to-noginsk

2026-10-16T00:17:58.422Z: automatic queue DONE; 109/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-17-58-422Z-done.json). single-ckad-podolsk-to-noginsk

2026-10-16T00:18:01.958Z: automatic queue STARTED; 109/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-18-01-958Z-started.json). single-ckad-ramenskoe-to-klin

2026-10-16T00:18:20.886Z: automatic queue DONE; 110/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-18-20-886Z-done.json). single-ckad-ramenskoe-to-klin

2026-10-16T00:18:24.296Z: automatic queue STARTED; 110/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-18-24-296Z-started.json). single-khabarovsk-knyaze-to-smidovich

2026-10-16T00:18:42.200Z: automatic queue DONE; 111/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-18-42-200Z-done.json). single-khabarovsk-knyaze-to-smidovich

2026-10-16T00:18:45.575Z: automatic queue STARTED; 111/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-18-45-575Z-started.json). single-khabarovsk-smidovich-to-knyaze

2026-10-16T00:19:03.441Z: automatic queue DONE; 112/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-03-441Z-done.json). single-khabarovsk-smidovich-to-knyaze

2026-10-16T00:19:06.975Z: automatic queue STARTED; 112/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-06-975Z-started.json). single-khabarovsk-smidovich-to-nekrasovka

2026-10-16T00:19:25.068Z: automatic queue DONE; 113/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-25-068Z-done.json). single-khabarovsk-smidovich-to-nekrasovka

2026-10-16T00:19:29.150Z: automatic queue STARTED; 113/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-29-150Z-started.json). single-khabarovsk-smidovich-to-vyazemsky

2026-10-16T00:19:47.884Z: automatic queue DONE; 114/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-47-884Z-done.json). single-khabarovsk-smidovich-to-vyazemsky

2026-10-16T00:19:51.451Z: automatic queue STARTED; 114/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-19-51-451Z-started.json). single-khabarovsk-vyazemsky-to-smidovich

2026-10-16T00:20:10.356Z: automatic queue DONE; 115/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-20-10-356Z-done.json). single-khabarovsk-vyazemsky-to-smidovich

2026-10-16T00:20:13.936Z: automatic queue STARTED; 115/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-20-13-936Z-started.json). single-m11-moscow-to-spb

2026-10-16T00:20:35.171Z: automatic queue DONE; 116/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-20-35-171Z-done.json). single-m11-moscow-to-spb

2026-10-16T00:20:38.715Z: automatic queue STARTED; 116/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-20-38-715Z-started.json). single-m11-moscow-to-torzhok

2026-10-16T00:20:58.104Z: automatic queue DONE; 117/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-20-58-104Z-done.json). single-m11-moscow-to-torzhok

2026-10-16T00:21:01.556Z: automatic queue STARTED; 117/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-21-01-556Z-started.json). single-m11-moscow-to-tver

2026-10-16T00:21:21.086Z: automatic queue DONE; 118/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-21-21-086Z-done.json). single-m11-moscow-to-tver

2026-10-16T00:21:24.687Z: automatic queue STARTED; 118/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-21-24-687Z-started.json). single-m11-spb-to-moscow

2026-10-16T00:21:46.141Z: automatic queue DONE; 119/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-21-46-141Z-done.json). single-m11-spb-to-moscow

2026-10-16T00:21:49.792Z: automatic queue STARTED; 119/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-21-49-792Z-started.json). single-m11-tver-to-moscow

2026-10-16T00:22:08.383Z: automatic queue DONE; 120/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-22-08-383Z-done.json). single-m11-tver-to-moscow

2026-10-16T00:22:12.268Z: automatic queue STARTED; 120/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-22-12-268Z-started.json). single-m12-kazan-to-moscow

2026-10-16T00:22:33.807Z: automatic queue DONE; 121/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-22-33-807Z-done.json). single-m12-kazan-to-moscow

2026-10-16T00:22:37.604Z: automatic queue STARTED; 121/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-22-37-604Z-started.json). single-m12-kazan-to-vladimir

2026-10-16T00:22:58.761Z: automatic queue DONE; 122/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-22-58-761Z-done.json). single-m12-kazan-to-vladimir

2026-10-16T00:23:02.634Z: automatic queue STARTED; 122/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-23-02-634Z-started.json). single-m12-moscow-to-kazan

2026-10-16T00:23:25.875Z: automatic queue DONE; 123/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-23-25-875Z-done.json). single-m12-moscow-to-kazan

2026-10-16T00:23:30.500Z: automatic queue STARTED; 123/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-23-30-500Z-started.json). single-m12-murom-to-kazan

2026-10-16T00:23:50.000Z: automatic queue DONE; 124/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-23-50-000Z-done.json). single-m12-murom-to-kazan

2026-10-16T00:23:53.543Z: automatic queue STARTED; 124/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-23-53-543Z-started.json). single-m12-vladimir-to-kazan

2026-10-16T00:24:13.972Z: automatic queue DONE; 125/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-24-13-972Z-done.json). single-m12-vladimir-to-kazan

2026-10-16T00:24:17.863Z: automatic queue STARTED; 125/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-24-17-863Z-started.json). single-m3-kaluga-to-moscow

2026-10-16T00:24:37.344Z: automatic queue DONE; 126/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-24-37-344Z-done.json). single-m3-kaluga-to-moscow

2026-10-16T00:24:40.949Z: automatic queue STARTED; 126/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-24-40-949Z-started.json). single-m3-moscow-to-kaluga

2026-10-16T00:25:01.214Z: automatic queue DONE; 127/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-01-214Z-done.json). single-m3-moscow-to-kaluga

2026-10-16T00:25:04.976Z: automatic queue STARTED; 127/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-04-976Z-started.json). single-m3-moscow-to-maloyaroslavets

2026-10-16T00:25:24.167Z: automatic queue DONE; 128/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-24-167Z-done.json). single-m3-moscow-to-maloyaroslavets

2026-10-16T00:25:27.677Z: automatic queue STARTED; 128/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-27-677Z-started.json). single-m3-moscow-to-obninsk

2026-10-16T00:25:46.795Z: automatic queue DONE; 129/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-46-795Z-done.json). single-m3-moscow-to-obninsk

2026-10-16T00:25:50.265Z: automatic queue STARTED; 129/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-25-50-265Z-started.json). single-m3-obninsk-to-moscow

2026-10-16T00:26:09.291Z: automatic queue DONE; 130/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-26-09-291Z-done.json). single-m3-obninsk-to-moscow

2026-10-16T00:26:12.808Z: automatic queue STARTED; 130/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-26-12-808Z-started.json). single-m4-domodedovo-to-krasnodar

2026-10-16T00:26:41.445Z: automatic queue DONE; 131/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-26-41-445Z-done.json). single-m4-domodedovo-to-krasnodar

2026-10-16T00:26:45.237Z: automatic queue STARTED; 131/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-26-45-237Z-started.json). single-m4-krasnodar-to-domodedovo

2026-10-16T00:27:10.945Z: automatic queue DONE; 132/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-27-10-945Z-done.json). single-m4-krasnodar-to-domodedovo

2026-10-16T00:27:14.934Z: automatic queue STARTED; 132/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-27-14-934Z-started.json). single-m4-krasnodar-to-rostov

2026-10-16T00:27:33.972Z: automatic queue DONE; 133/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-27-33-972Z-done.json). single-m4-krasnodar-to-rostov

2026-10-16T00:27:37.698Z: automatic queue STARTED; 133/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-27-37-698Z-started.json). single-m4-krasnodar-to-voronezh

2026-10-16T00:27:58.445Z: automatic queue DONE; 134/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-27-58-445Z-done.json). single-m4-krasnodar-to-voronezh

2026-10-16T00:28:02.338Z: automatic queue STARTED; 134/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-28-02-338Z-started.json). single-m4-voronezh-to-krasnodar

2026-10-16T00:28:23.339Z: automatic queue DONE; 135/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-28-23-339Z-done.json). single-m4-voronezh-to-krasnodar

2026-10-16T00:28:26.949Z: automatic queue STARTED; 135/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-28-26-949Z-started.json). single-odintsovo-golitsyno-to-moscow

2026-10-16T00:28:45.507Z: automatic queue DONE; 136/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-28-45-507Z-done.json). single-odintsovo-golitsyno-to-moscow

2026-10-16T00:28:49.318Z: automatic queue STARTED; 136/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-28-49-318Z-started.json). single-odintsovo-moscow-to-golitsyno

2026-10-16T00:29:08.202Z: automatic queue DONE; 137/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-08-202Z-done.json). single-odintsovo-moscow-to-golitsyno

2026-10-16T00:29:11.655Z: automatic queue STARTED; 137/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-11-655Z-started.json). single-odintsovo-moscow-to-kubinka

2026-10-16T00:29:30.388Z: automatic queue DONE; 138/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-30-388Z-done.json). single-odintsovo-moscow-to-kubinka

2026-10-16T00:29:34.228Z: automatic queue STARTED; 138/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-34-228Z-started.json). single-odintsovo-moscow-to-zvenigorod

2026-10-16T00:29:54.103Z: automatic queue DONE; 139/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-54-103Z-done.json). single-odintsovo-moscow-to-zvenigorod

2026-10-16T00:29:57.830Z: automatic queue STARTED; 139/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-29-57-830Z-started.json). single-odintsovo-zvenigorod-to-moscow

2026-10-16T00:30:16.832Z: automatic queue DONE; 140/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-30-16-832Z-done.json). single-odintsovo-zvenigorod-to-moscow

2026-10-16T00:30:21.422Z: automatic queue STARTED; 140/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-30-21-422Z-started.json). single-zsd-blag-to-prim

2026-10-16T00:30:40.480Z: automatic queue DONE; 141/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-30-40-480Z-done.json). single-zsd-blag-to-prim

2026-10-16T00:30:44.064Z: automatic queue STARTED; 141/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-30-44-064Z-started.json). single-zsd-peterhof-to-sest

2026-10-16T00:31:03.058Z: automatic queue DONE; 142/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-03-058Z-done.json). single-zsd-peterhof-to-sest

2026-10-16T00:31:06.657Z: automatic queue STARTED; 142/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-06-657Z-started.json). single-zsd-prim-to-blag

2026-10-16T00:31:25.258Z: automatic queue DONE; 143/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-25-258Z-done.json). single-zsd-prim-to-blag

2026-10-16T00:31:29.017Z: automatic queue STARTED; 143/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-29-017Z-started.json). single-zsd-pushkin-to-sest

2026-10-16T00:31:47.876Z: automatic queue DONE; 144/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-47-876Z-done.json). single-zsd-pushkin-to-sest

2026-10-16T00:31:51.487Z: automatic queue STARTED; 144/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-31-51-487Z-started.json). single-zsd-sest-to-pushkin

2026-10-16T00:32:10.383Z: automatic queue DONE; 145/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-32-10-383Z-done.json). single-zsd-sest-to-pushkin

2026-10-16T00:32:14.007Z: automatic queue STARTED; 145/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-32-14-007Z-started.json). triple-m11-ckad-m12-kazan-to-spb

2026-10-16T00:32:45.192Z: automatic queue DONE; 146/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-32-45-192Z-done.json). triple-m11-ckad-m12-kazan-to-spb

2026-10-16T00:32:48.935Z: automatic queue STARTED; 146/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-32-48-935Z-started.json). triple-m11-ckad-m12-kazan-to-torzhok

2026-10-16T00:33:13.222Z: automatic queue DONE; 147/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-33-13-222Z-done.json). triple-m11-ckad-m12-kazan-to-torzhok

2026-10-16T00:33:17.195Z: automatic queue STARTED; 147/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-33-17-195Z-started.json). triple-m11-ckad-m12-spb-to-kazan

2026-10-16T00:33:48.554Z: automatic queue DONE; 148/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-33-48-554Z-done.json). triple-m11-ckad-m12-spb-to-kazan

2026-10-16T00:33:52.340Z: automatic queue STARTED; 148/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-33-52-340Z-started.json). triple-m11-ckad-m12-torzhok-to-kazan

2026-10-16T00:34:17.652Z: automatic queue DONE; 149/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-34-17-652Z-done.json). triple-m11-ckad-m12-torzhok-to-kazan

2026-10-16T00:34:21.592Z: automatic queue STARTED; 149/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-34-21-592Z-started.json). triple-m11-ckad-m12-tver-to-murom

2026-10-16T00:34:43.795Z: automatic queue DONE; 150/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-34-43-795Z-done.json). triple-m11-ckad-m12-tver-to-murom

2026-10-16T00:34:47.648Z: automatic queue STARTED; 150/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-34-47-648Z-started.json). triple-m4-m11-zsd-krasnodar-to-sest

2026-10-16T00:35:25.792Z: automatic queue DONE; 151/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-35-25-792Z-done.json). triple-m4-m11-zsd-krasnodar-to-sest

2026-10-16T00:35:29.786Z: automatic queue STARTED; 151/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-35-29-786Z-started.json). triple-m4-m11-zsd-rostov-to-sest

2026-10-16T00:36:05.569Z: automatic queue DONE; 152/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-36-05-569Z-done.json). triple-m4-m11-zsd-rostov-to-sest

2026-10-16T00:36:09.659Z: automatic queue STARTED; 152/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-36-09-659Z-started.json). triple-m4-m11-zsd-sest-to-krasnodar

2026-10-16T00:36:47.881Z: automatic queue DONE; 153/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-36-47-881Z-done.json). triple-m4-m11-zsd-sest-to-krasnodar

2026-10-16T00:36:52.014Z: automatic queue STARTED; 153/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-36-52-014Z-started.json). triple-m4-m11-zsd-sest-to-rostov

2026-10-16T00:37:27.200Z: automatic queue DONE; 154/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-37-27-200Z-done.json). triple-m4-m11-zsd-sest-to-rostov

2026-10-16T00:37:31.219Z: automatic queue STARTED; 154/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-37-31-219Z-started.json). triple-m4-m11-zsd-voronezh-to-prim

2026-10-16T00:37:59.085Z: automatic queue DONE; 155/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-37-59-085Z-done.json). triple-m4-m11-zsd-voronezh-to-prim

2026-10-16T00:38:03.294Z: automatic queue STARTED; 155/155,0/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-38-03-294Z-started.json). lnr-лисичанск-moscow-center

2026-10-16T00:38:27.289Z: automatic queue DONE; 155/155,1/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-38-27-289Z-done.json). lnr-лисичанск-moscow-center

2026-10-16T00:38:31.483Z: automatic queue STARTED; 155/155,1/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-38-31-483Z-started.json). dnr-краматорск-saint-petersburg-center

2026-10-16T00:39:09.609Z: automatic queue DONE; 155/155,2/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-39-09-609Z-done.json). dnr-краматорск-saint-petersburg-center

2026-10-16T00:39:13.891Z: automatic queue STARTED; 155/155,2/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-39-13-891Z-started.json). dnr-новоазовск-kazan-center

2026-10-16T00:39:45.880Z: automatic queue DONE; 155/155,3/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-39-45-880Z-done.json). dnr-новоазовск-kazan-center

2026-10-16T00:39:50.030Z: automatic queue STARTED; 155/155,3/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-39-50-030Z-started.json). dnr-новоазовск-kerch-center

2026-10-16T00:40:12.053Z: automatic queue DONE; 155/155,4/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-40-12-053Z-done.json). dnr-новоазовск-kerch-center

2026-10-16T00:40:16.031Z: automatic queue STARTED; 155/155,4/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-40-16-031Z-started.json). dnr-новоазовск-moscow-center

2026-10-16T00:40:44.163Z: automatic queue DONE; 155/155,5/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-40-44-163Z-done.json). dnr-новоазовск-moscow-center

2026-10-16T00:40:48.395Z: automatic queue STARTED; 155/155,5/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-40-48-395Z-started.json). dnr-новоазовск-saint-petersburg-center

2026-10-16T00:41:27.995Z: automatic queue DONE; 155/155,6/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-41-27-995Z-done.json). dnr-новоазовск-saint-petersburg-center

2026-10-16T00:41:32.084Z: automatic queue STARTED; 155/155,6/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-41-32-084Z-started.json). dnr-талаковка-kazan-center

2026-10-16T00:42:06.047Z: automatic queue DONE; 155/155,7/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-42-06-047Z-done.json). dnr-талаковка-kazan-center

2026-10-16T00:42:10.359Z: automatic queue STARTED; 155/155,7/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-42-10-359Z-started.json). dnr-талаковка-kerch-center

2026-10-16T00:42:32.667Z: automatic queue DONE; 155/155,8/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-42-32-667Z-done.json). dnr-талаковка-kerch-center

2026-10-16T00:42:36.615Z: automatic queue STARTED; 155/155,8/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-42-36-615Z-started.json). dnr-талаковка-moscow-center

2026-10-16T00:43:05.635Z: automatic queue DONE; 155/155,9/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-43-05-635Z-done.json). dnr-талаковка-moscow-center

2026-10-16T00:43:09.971Z: automatic queue STARTED; 155/155,9/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-43-09-971Z-started.json). dnr-талаковка-saint-petersburg-center

2026-10-16T00:43:51.804Z: automatic queue DONE; 155/155,10/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-43-51-804Z-done.json). dnr-талаковка-saint-petersburg-center

2026-10-16T00:43:55.942Z: automatic queue STARTED; 155/155,10/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-43-55-942Z-started.json). dnr-урзуф-kazan-center

2026-10-16T00:44:40.867Z: automatic queue DONE; 155/155,11/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-44-40-867Z-done.json). dnr-урзуф-kazan-center

2026-10-16T00:44:45.196Z: automatic queue STARTED; 155/155,11/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-44-45-196Z-started.json). dnr-урзуф-kerch-center

2026-10-16T00:45:06.967Z: automatic queue DONE; 155/155,12/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-45-06-967Z-done.json). dnr-урзуф-kerch-center

2026-10-16T00:45:10.946Z: automatic queue STARTED; 155/155,12/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-45-10-946Z-started.json). dnr-харцызск-kazan-center

2026-10-16T00:45:43.103Z: automatic queue DONE; 155/155,13/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-45-43-103Z-done.json). dnr-харцызск-kazan-center

2026-10-16T00:45:47.325Z: automatic queue STARTED; 155/155,13/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-45-47-325Z-started.json). dnr-харцызск-kerch-center

2026-10-16T00:46:10.987Z: automatic queue DONE; 155/155,14/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-46-10-987Z-done.json). dnr-харцызск-kerch-center

2026-10-16T00:46:15.177Z: automatic queue STARTED; 155/155,14/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-46-15-177Z-started.json). dnr-харцызск-moscow-center

2026-10-16T00:46:43.075Z: automatic queue DONE; 155/155,15/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-46-43-075Z-done.json). dnr-харцызск-moscow-center

2026-10-16T00:46:47.431Z: automatic queue STARTED; 155/155,15/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-46-47-431Z-started.json). dnr-харцызск-saint-petersburg-center

2026-10-16T00:47:27.732Z: automatic queue DONE; 155/155,16/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-47-27-732Z-done.json). dnr-харцызск-saint-petersburg-center

2026-10-16T00:47:32.144Z: automatic queue STARTED; 155/155,16/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-47-32-144Z-started.json). kherson-новая-збурьевка-saint-petersburg-center

2026-10-16T00:48:17.467Z: automatic queue DONE; 155/155,17/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-48-17-467Z-done.json). kherson-новая-збурьевка-saint-petersburg-center

2026-10-16T00:48:21.967Z: automatic queue STARTED; 155/155,17/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-48-21-967Z-started.json). kherson-скадовск-kazan-center

2026-10-16T00:49:02.902Z: automatic queue DONE; 155/155,18/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-49-02-902Z-done.json). kherson-скадовск-kazan-center

2026-10-16T00:49:07.296Z: automatic queue STARTED; 155/155,18/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-49-07-296Z-started.json). kherson-скадовск-kerch-center

2026-10-16T00:49:30.240Z: automatic queue DONE; 155/155,19/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-49-30-240Z-done.json). kherson-скадовск-kerch-center

2026-10-16T00:49:34.658Z: automatic queue STARTED; 155/155,19/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-49-34-658Z-started.json). kherson-скадовск-moscow-center

2026-10-16T00:50:10.284Z: automatic queue DONE; 155/155,20/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-50-10-284Z-done.json). kherson-скадовск-moscow-center

2026-10-16T00:50:14.821Z: automatic queue STARTED; 155/155,20/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-50-14-821Z-started.json). kherson-скадовск-saint-petersburg-center

2026-10-16T00:51:01.175Z: automatic queue DONE; 155/155,21/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-51-01-175Z-done.json). kherson-скадовск-saint-petersburg-center

2026-10-16T00:51:05.667Z: automatic queue STARTED; 155/155,21/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-51-05-667Z-started.json). kherson-старая-збурьевка-kazan-center

2026-10-16T00:51:47.319Z: automatic queue DONE; 155/155,22/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-51-47-319Z-done.json). kherson-старая-збурьевка-kazan-center

2026-10-16T00:51:51.935Z: automatic queue STARTED; 155/155,22/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-51-51-935Z-started.json). kherson-старая-збурьевка-kerch-center

2026-10-16T00:52:15.293Z: automatic queue DONE; 155/155,23/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-52-15-293Z-done.json). kherson-старая-збурьевка-kerch-center

2026-10-16T00:52:19.529Z: automatic queue STARTED; 155/155,23/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-52-19-529Z-started.json). kherson-таврийск-kazan-center

2026-10-16T00:53:00.314Z: automatic queue DONE; 155/155,24/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-53-00-314Z-done.json). kherson-таврийск-kazan-center

2026-10-16T00:53:05.163Z: automatic queue STARTED; 155/155,24/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-53-05-163Z-started.json). kherson-таврийск-kerch-center

2026-10-16T00:53:28.811Z: automatic queue DONE; 155/155,25/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-53-28-811Z-done.json). kherson-таврийск-kerch-center

2026-10-16T00:53:32.922Z: automatic queue STARTED; 155/155,25/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-53-32-922Z-started.json). kherson-таврийск-moscow-center

2026-10-16T00:54:09.211Z: automatic queue DONE; 155/155,26/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-54-09-211Z-done.json). kherson-таврийск-moscow-center

2026-10-16T00:54:13.740Z: automatic queue STARTED; 155/155,26/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-54-13-740Z-started.json). kherson-таврийск-saint-petersburg-center

2026-10-16T00:55:00.354Z: automatic queue DONE; 155/155,27/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-55-00-354Z-done.json). kherson-таврийск-saint-petersburg-center

2026-10-16T00:55:05.338Z: automatic queue STARTED; 155/155,27/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-55-05-338Z-started.json). kherson-херсон-kazan-center

2026-10-16T00:55:53.498Z: automatic queue DONE; 155/155,28/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-55-53-498Z-done.json). kherson-херсон-kazan-center

2026-10-16T00:55:58.239Z: automatic queue STARTED; 155/155,28/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-55-58-239Z-started.json). kherson-херсон-kerch-center

2026-10-16T00:56:25.678Z: automatic queue DONE; 155/155,29/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-56-25-678Z-done.json). kherson-херсон-kerch-center

2026-10-16T00:56:29.988Z: automatic queue STARTED; 155/155,29/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-56-29-988Z-started.json). kherson-херсон-moscow-center

2026-10-16T00:57:13.277Z: automatic queue DONE; 155/155,30/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-57-13-277Z-done.json). kherson-херсон-moscow-center

2026-10-16T00:57:17.909Z: automatic queue STARTED; 155/155,30/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-57-17-909Z-started.json). kherson-херсон-saint-petersburg-center

2026-10-16T00:58:11.291Z: automatic queue DONE; 155/155,31/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-58-11-291Z-done.json). kherson-херсон-saint-petersburg-center

2026-10-16T00:58:16.380Z: automatic queue STARTED; 155/155,31/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-58-16-380Z-started.json). lnr-ровеньки-kazan-center

2026-10-16T00:58:51.318Z: automatic queue DONE; 155/155,32/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-58-51-318Z-done.json). lnr-ровеньки-kazan-center

2026-10-16T00:58:56.015Z: automatic queue STARTED; 155/155,32/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-58-56-015Z-started.json). lnr-ровеньки-kerch-center

2026-10-16T00:59:22.332Z: automatic queue DONE; 155/155,33/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-59-22-332Z-done.json). lnr-ровеньки-kerch-center

2026-10-16T00:59:26.729Z: automatic queue STARTED; 155/155,33/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-59-26-729Z-started.json). lnr-ровеньки-moscow-center

2026-10-16T00:59:56.300Z: automatic queue DONE; 155/155,34/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T00-59-56-300Z-done.json). lnr-ровеньки-moscow-center

2026-10-16T01:00:00.944Z: automatic queue STARTED; 155/155,34/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-00-00-944Z-started.json). lnr-ровеньки-saint-petersburg-center

2026-10-16T01:00:40.950Z: automatic queue DONE; 155/155,35/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-00-40-950Z-done.json). lnr-ровеньки-saint-petersburg-center

2026-10-16T01:00:45.754Z: automatic queue STARTED; 155/155,35/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-00-45-754Z-started.json). lnr-рубежное-kazan-center

2026-10-16T01:01:18.976Z: automatic queue DONE; 155/155,36/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-01-18-976Z-done.json). lnr-рубежное-kazan-center

2026-10-16T01:01:23.598Z: automatic queue STARTED; 155/155,36/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-01-23-598Z-started.json). lnr-рубежное-kerch-center

2026-10-16T01:01:50.677Z: automatic queue DONE; 155/155,37/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-01-50-677Z-done.json). lnr-рубежное-kerch-center

2026-10-16T01:01:55.144Z: automatic queue STARTED; 155/155,37/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-01-55-144Z-started.json). lnr-сорокино-kazan-center

2026-10-16T01:02:30.090Z: automatic queue DONE; 155/155,38/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-02-30-090Z-done.json). lnr-сорокино-kazan-center

2026-10-16T01:02:34.831Z: automatic queue STARTED; 155/155,38/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-02-34-831Z-started.json). lnr-сорокино-kerch-center

2026-10-16T01:03:01.485Z: automatic queue DONE; 155/155,39/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-03-01-485Z-done.json). lnr-сорокино-kerch-center

2026-10-16T01:03:06.073Z: automatic queue STARTED; 155/155,39/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-03-06-073Z-started.json). lnr-сорокино-moscow-center

2026-10-16T01:03:36.279Z: automatic queue DONE; 155/155,40/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-03-36-279Z-done.json). lnr-сорокино-moscow-center

2026-10-16T01:03:40.990Z: automatic queue STARTED; 155/155,40/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-03-40-990Z-started.json). lnr-сорокино-saint-petersburg-center

2026-10-16T01:04:21.602Z: automatic queue DONE; 155/155,41/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-04-21-602Z-done.json). lnr-сорокино-saint-petersburg-center

2026-10-16T01:04:26.300Z: automatic queue STARTED; 155/155,41/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-04-26-300Z-started.json). lnr-старобельск-kazan-center

2026-10-16T01:05:00.601Z: automatic queue DONE; 155/155,42/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-05-00-601Z-done.json). lnr-старобельск-kazan-center

2026-10-16T01:05:05.345Z: automatic queue STARTED; 155/155,42/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-05-05-345Z-started.json). lnr-старобельск-kerch-center

2026-10-16T01:05:32.857Z: automatic queue DONE; 155/155,43/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-05-32-857Z-done.json). lnr-старобельск-kerch-center

2026-10-16T01:05:37.523Z: automatic queue STARTED; 155/155,43/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-05-37-523Z-started.json). lnr-старобельск-moscow-center

2026-10-16T01:06:06.215Z: automatic queue DONE; 155/155,44/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-06-06-215Z-done.json). lnr-старобельск-moscow-center

2026-10-16T01:06:10.921Z: automatic queue STARTED; 155/155,44/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-06-10-921Z-started.json). lnr-старобельск-saint-petersburg-center

2026-10-16T01:06:49.582Z: automatic queue DONE; 155/155,45/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-06-49-582Z-done.json). lnr-старобельск-saint-petersburg-center

2026-10-16T01:06:54.511Z: automatic queue STARTED; 155/155,45/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-06-54-511Z-started.json). zaporizhzhia-кушугум-kerch-center

2026-10-16T01:07:22.083Z: automatic queue DONE; 155/155,46/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-07-22-083Z-done.json). zaporizhzhia-кушугум-kerch-center

2026-10-16T01:07:26.625Z: automatic queue STARTED; 155/155,46/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-07-26-625Z-started.json). zaporizhzhia-кушугум-moscow-center

2026-10-16T01:08:07.581Z: automatic queue DONE; 155/155,47/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-08-07-581Z-done.json). zaporizhzhia-кушугум-moscow-center

2026-10-16T01:08:12.361Z: automatic queue STARTED; 155/155,47/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-08-12-361Z-started.json). zaporizhzhia-кушугум-saint-petersburg-center

2026-10-16T01:09:03.397Z: automatic queue DONE; 155/155,48/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-09-03-397Z-done.json). zaporizhzhia-кушугум-saint-petersburg-center

2026-10-16T01:09:08.450Z: automatic queue STARTED; 155/155,48/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-09-08-450Z-started.json). zaporizhzhia-мелитополь-kazan-center

2026-10-16T01:09:52.276Z: automatic queue DONE; 155/155,49/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-09-52-276Z-done.json). zaporizhzhia-мелитополь-kazan-center

2026-10-16T01:09:57.273Z: automatic queue STARTED; 155/155,49/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-09-57-273Z-started.json). zaporizhzhia-мелитополь-kerch-center

2026-10-16T01:10:23.761Z: automatic queue DONE; 155/155,50/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-10-23-761Z-done.json). zaporizhzhia-мелитополь-kerch-center

2026-10-16T01:10:28.425Z: automatic queue STARTED; 155/155,50/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-10-28-425Z-started.json). zaporizhzhia-мелитополь-moscow-center

2026-10-16T01:11:07.941Z: automatic queue DONE; 155/155,51/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-11-07-941Z-done.json). zaporizhzhia-мелитополь-moscow-center

2026-10-16T01:11:12.911Z: automatic queue STARTED; 155/155,51/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-11-12-911Z-started.json). zaporizhzhia-мелитополь-saint-petersburg-center

2026-10-16T01:12:03.027Z: automatic queue DONE; 155/155,52/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-12-03-027Z-done.json). zaporizhzhia-мелитополь-saint-petersburg-center

2026-10-16T01:12:08.139Z: automatic queue STARTED; 155/155,52/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-12-08-139Z-started.json). zaporizhzhia-пологи-kazan-center

2026-10-16T01:12:53.423Z: automatic queue DONE; 155/155,53/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-12-53-423Z-done.json). zaporizhzhia-пологи-kazan-center

2026-10-16T01:12:58.448Z: automatic queue STARTED; 155/155,53/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-12-58-448Z-started.json). zaporizhzhia-пологи-kerch-center

2026-10-16T01:13:26.650Z: automatic queue DONE; 155/155,54/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-13-26-650Z-done.json). zaporizhzhia-пологи-kerch-center

2026-10-16T01:13:31.286Z: automatic queue STARTED; 155/155,54/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-13-31-286Z-started.json). zaporizhzhia-пологи-moscow-center

2026-10-16T01:14:11.480Z: automatic queue DONE; 155/155,55/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-14-11-480Z-done.json). zaporizhzhia-пологи-moscow-center

2026-10-16T01:14:16.648Z: automatic queue STARTED; 155/155,55/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-14-16-648Z-started.json). zaporizhzhia-пологи-saint-petersburg-center

2026-10-16T01:15:07.518Z: automatic queue DONE; 155/155,56/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-15-07-518Z-done.json). zaporizhzhia-пологи-saint-petersburg-center

2026-10-16T01:15:12.695Z: automatic queue STARTED; 155/155,56/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-15-12-695Z-started.json). zaporizhzhia-розовка-kazan-center

2026-10-16T01:15:53.983Z: automatic queue DONE; 155/155,57/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-15-53-983Z-done.json). zaporizhzhia-розовка-kazan-center

2026-10-16T01:15:59.141Z: automatic queue STARTED; 155/155,57/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-15-59-141Z-started.json). zaporizhzhia-розовка-kerch-center

2026-10-16T01:16:28.661Z: automatic queue DONE; 155/155,58/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-16-28-661Z-done.json). zaporizhzhia-розовка-kerch-center

2026-10-16T01:16:33.642Z: automatic queue STARTED; 155/155,58/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-16-33-642Z-started.json). zaporizhzhia-розовка-moscow-center

2026-10-16T01:17:11.054Z: automatic queue DONE; 155/155,59/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-17-11-054Z-done.json). zaporizhzhia-розовка-moscow-center

2026-10-16T01:17:16.187Z: automatic queue STARTED; 155/155,59/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-17-16-187Z-started.json). zaporizhzhia-розовка-saint-petersburg-center

2026-10-16T01:18:04.900Z: automatic queue DONE; 155/155,60/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-18-04-900Z-done.json). zaporizhzhia-розовка-saint-petersburg-center

2026-10-16T01:18:09.995Z: automatic queue STARTED; 155/155,60/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-18-09-995Z-started.json). zaporizhzhia-токмак-kazan-center

2026-10-16T01:18:56.622Z: automatic queue DONE; 155/155,61/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-18-56-622Z-done.json). zaporizhzhia-токмак-kazan-center

2026-10-16T01:19:01.797Z: automatic queue STARTED; 155/155,61/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-19-01-797Z-started.json). zaporizhzhia-токмак-kerch-center

2026-10-16T01:19:30.471Z: automatic queue DONE; 155/155,62/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-19-30-471Z-done.json). zaporizhzhia-токмак-kerch-center

2026-10-16T01:19:35.388Z: automatic queue STARTED; 155/155,62/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-19-35-388Z-started.json). zaporizhzhia-токмак-moscow-center

2026-10-16T01:20:16.965Z: automatic queue DONE; 155/155,63/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-20-16-965Z-done.json). zaporizhzhia-токмак-moscow-center

2026-10-16T01:20:22.091Z: automatic queue STARTED; 155/155,63/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-20-22-091Z-started.json). zaporizhzhia-токмак-saint-petersburg-center

2026-10-16T01:21:13.437Z: automatic queue DONE; 155/155,64/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-21-13-437Z-done.json). zaporizhzhia-токмак-saint-petersburg-center

2026-10-16T01:21:18.659Z: automatic queue STARTED; 155/155,64/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-21-18-659Z-started.json). max-chain-m12-ckad-m11-zsd-cheboksary-to-prim

2026-10-16T01:21:56.791Z: automatic queue DONE; 155/155,65/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-21-56-791Z-done.json). max-chain-m12-ckad-m11-zsd-cheboksary-to-prim

2026-10-16T01:22:01.888Z: automatic queue STARTED; 155/155,65/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-22-01-888Z-started.json). max-chain-m12-ckad-m11-zsd-prim-to-arzamas

2026-10-16T01:22:38.010Z: automatic queue DONE; 155/155,66/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-22-38-010Z-done.json). max-chain-m12-ckad-m11-zsd-prim-to-arzamas

2026-10-16T01:22:42.958Z: automatic queue STARTED; 155/155,66/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-22-42-958Z-started.json). max-chain-m12-ckad-m11-zsd-prim-to-cheboksary

2026-10-16T01:23:21.954Z: automatic queue DONE; 155/155,67/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-23-21-954Z-done.json). max-chain-m12-ckad-m11-zsd-prim-to-cheboksary

2026-10-16T01:23:27.025Z: automatic queue STARTED; 155/155,67/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-23-27-025Z-started.json). max-chain-m12-ckad-m11-zsd-sest-to-vladimir

2026-10-16T01:23:59.127Z: automatic queue DONE; 155/155,68/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-23-59-127Z-done.json). max-chain-m12-ckad-m11-zsd-sest-to-vladimir

2026-10-16T01:24:04.133Z: automatic queue STARTED; 155/155,68/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-24-04-133Z-started.json). max-chain-m12-ckad-m11-zsd-vladimir-to-sest

2026-10-16T01:24:36.582Z: automatic queue DONE; 155/155,69/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-24-36-582Z-done.json). max-chain-m12-ckad-m11-zsd-vladimir-to-sest

2026-10-16T01:24:41.736Z: automatic queue STARTED; 155/155,69/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-24-41-736Z-started.json). max-chain-m4-ckad-m11-zsd-krasnodar-to-prim

2026-10-16T01:25:28.388Z: automatic queue DONE; 155/155,70/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-25-28-388Z-done.json). max-chain-m4-ckad-m11-zsd-krasnodar-to-prim

2026-10-16T01:25:33.687Z: automatic queue STARTED; 155/155,70/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-25-33-687Z-started.json). max-chain-m4-ckad-m11-zsd-prim-to-krasnodar

2026-10-16T01:26:21.340Z: automatic queue DONE; 155/155,71/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-26-21-340Z-done.json). max-chain-m4-ckad-m11-zsd-prim-to-krasnodar

2026-10-16T01:26:26.717Z: automatic queue STARTED; 155/155,71/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-26-26-717Z-started.json). max-chain-m4-ckad-m11-zsd-prim-to-rostov

2026-10-16T01:27:10.549Z: automatic queue DONE; 155/155,72/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-27-10-549Z-done.json). max-chain-m4-ckad-m11-zsd-prim-to-rostov

2026-10-16T01:27:16.136Z: automatic queue STARTED; 155/155,72/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-27-16-136Z-started.json). max-chain-m4-ckad-m11-zsd-prim-to-voronezh

2026-10-16T01:27:55.153Z: automatic queue DONE; 155/155,73/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-27-55-153Z-done.json). max-chain-m4-ckad-m11-zsd-prim-to-voronezh

2026-10-16T01:28:00.992Z: automatic queue STARTED; 155/155,73/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-28-00-992Z-started.json). max-chain-m4-ckad-m11-zsd-rostov-to-prim

2026-10-16T01:28:44.731Z: automatic queue DONE; 155/155,74/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-28-44-731Z-done.json). max-chain-m4-ckad-m11-zsd-rostov-to-prim

2026-10-16T01:28:50.161Z: automatic queue STARTED; 155/155,74/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-28-50-161Z-started.json). pair-m11-ckad-domodedovo-to-novgorod

2026-10-16T01:29:22.142Z: automatic queue DONE; 155/155,75/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-29-22-142Z-done.json). pair-m11-ckad-domodedovo-to-novgorod

2026-10-16T01:29:27.122Z: automatic queue STARTED; 155/155,75/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-29-27-122Z-started.json). pair-m11-ckad-noginsk-to-tver

2026-10-16T01:29:55.697Z: automatic queue DONE; 155/155,76/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-29-55-697Z-done.json). pair-m11-ckad-noginsk-to-tver

2026-10-16T01:30:00.791Z: automatic queue STARTED; 155/155,76/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-30-00-791Z-started.json). pair-m11-ckad-novgorod-to-domodedovo

2026-10-16T01:30:31.797Z: automatic queue DONE; 155/155,77/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-30-31-797Z-done.json). pair-m11-ckad-novgorod-to-domodedovo

2026-10-16T01:30:37.051Z: automatic queue STARTED; 155/155,77/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-30-37-051Z-started.json). pair-m11-ckad-ramenskoe-to-torzhok

2026-10-16T01:31:08.768Z: automatic queue DONE; 155/155,78/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-31-08-768Z-done.json). pair-m11-ckad-ramenskoe-to-torzhok

2026-10-16T01:31:13.770Z: automatic queue STARTED; 155/155,78/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-31-13-770Z-started.json). pair-m11-ckad-tver-to-noginsk

2026-10-16T01:31:43.803Z: automatic queue DONE; 155/155,79/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-31-43-803Z-done.json). pair-m11-ckad-tver-to-noginsk

2026-10-16T01:31:48.919Z: automatic queue STARTED; 155/155,79/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-31-48-919Z-started.json). pair-m11-zsd-novgorod-to-sest

2026-10-16T01:32:18.681Z: automatic queue DONE; 155/155,80/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-32-18-681Z-done.json). pair-m11-zsd-novgorod-to-sest

2026-10-16T01:32:23.619Z: automatic queue STARTED; 155/155,80/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-32-23-619Z-started.json). pair-m11-zsd-prim-to-torzhok

2026-10-16T01:32:54.132Z: automatic queue DONE; 155/155,81/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-32-54-132Z-done.json). pair-m11-zsd-prim-to-torzhok

2026-10-16T01:32:59.715Z: automatic queue STARTED; 155/155,81/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-32-59-715Z-started.json). pair-m11-zsd-sest-to-novgorod

2026-10-16T01:33:29.687Z: automatic queue DONE; 155/155,82/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-33-29-687Z-done.json). pair-m11-zsd-sest-to-novgorod

2026-10-16T01:33:34.790Z: automatic queue STARTED; 155/155,82/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-33-34-790Z-started.json). pair-m11-zsd-sest-to-tver

2026-10-16T01:34:05.101Z: automatic queue DONE; 155/155,83/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-34-05-101Z-done.json). pair-m11-zsd-sest-to-tver

2026-10-16T01:34:10.149Z: automatic queue STARTED; 155/155,83/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-34-10-149Z-started.json). pair-m11-zsd-torzhok-to-prim

2026-10-16T01:34:40.308Z: automatic queue DONE; 155/155,84/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-34-40-308Z-done.json). pair-m11-zsd-torzhok-to-prim

2026-10-16T01:34:45.501Z: automatic queue STARTED; 155/155,84/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-34-45-501Z-started.json). pair-m12-ckad-arzamas-to-domodedovo

2026-10-16T01:35:15.444Z: automatic queue DONE; 155/155,85/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-35-15-444Z-done.json). pair-m12-ckad-arzamas-to-domodedovo

2026-10-16T01:35:20.507Z: automatic queue STARTED; 155/155,85/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-35-20-507Z-started.json). pair-m12-ckad-dmitrov-to-murom

2026-10-16T01:35:51.073Z: automatic queue DONE; 155/155,86/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-35-51-073Z-done.json). pair-m12-ckad-dmitrov-to-murom

2026-10-16T01:35:56.365Z: automatic queue STARTED; 155/155,86/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-35-56-365Z-started.json). pair-m12-ckad-domodedovo-to-arzamas

2026-10-16T01:36:28.117Z: automatic queue DONE; 155/155,87/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-36-28-117Z-done.json). pair-m12-ckad-domodedovo-to-arzamas

2026-10-16T01:36:33.356Z: automatic queue STARTED; 155/155,87/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-36-33-356Z-started.json). pair-m12-ckad-klin-to-vladimir

2026-10-16T01:37:04.248Z: automatic queue DONE; 155/155,88/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-37-04-248Z-done.json). pair-m12-ckad-klin-to-vladimir

2026-10-16T01:37:09.503Z: automatic queue STARTED; 155/155,88/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-37-09-503Z-started.json). pair-m12-ckad-murom-to-dmitrov

2026-10-16T01:37:39.830Z: automatic queue DONE; 155/155,89/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-37-39-830Z-done.json). pair-m12-ckad-murom-to-dmitrov

2026-10-16T01:37:45.033Z: automatic queue STARTED; 155/155,89/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-37-45-033Z-started.json). pair-m4-a289-anapa-to-voronezh

2026-10-16T01:38:17.612Z: automatic queue DONE; 155/155,90/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-38-17-612Z-done.json). pair-m4-a289-anapa-to-voronezh

2026-10-16T01:38:22.888Z: automatic queue STARTED; 155/155,90/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-38-22-888Z-started.json). pair-m4-a289-domodedovo-to-kerch

2026-10-16T01:39:03.214Z: automatic queue DONE; 155/155,91/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-39-03-214Z-done.json). pair-m4-a289-domodedovo-to-kerch

2026-10-16T01:39:08.713Z: automatic queue STARTED; 155/155,91/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-39-08-713Z-started.json). pair-m4-a289-kerch-to-domodedovo

2026-10-16T01:39:47.578Z: automatic queue DONE; 155/155,92/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-39-47-578Z-done.json). pair-m4-a289-kerch-to-domodedovo

2026-10-16T01:39:53.101Z: automatic queue STARTED; 155/155,92/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-39-53-101Z-started.json). pair-m4-a289-taman-to-moscow

2026-10-16T01:40:32.529Z: automatic queue DONE; 155/155,93/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-40-32-529Z-done.json). pair-m4-a289-taman-to-moscow

2026-10-16T01:40:38.089Z: automatic queue STARTED; 155/155,93/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-40-38-089Z-started.json). pair-m4-a289-voronezh-to-anapa

2026-10-16T01:41:12.284Z: automatic queue DONE; 155/155,94/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-41-12-284Z-done.json). pair-m4-a289-voronezh-to-anapa

2026-10-16T01:41:17.734Z: automatic queue STARTED; 155/155,94/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-41-17-734Z-started.json). pair-m4-m11-krasnodar-to-torzhok

2026-10-16T01:42:00.406Z: automatic queue DONE; 155/155,95/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-42-00-406Z-done.json). pair-m4-m11-krasnodar-to-torzhok

2026-10-16T01:42:06.043Z: automatic queue STARTED; 155/155,95/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-42-06-043Z-started.json). pair-m4-m11-rostov-to-tver

2026-10-16T01:42:44.850Z: automatic queue DONE; 155/155,96/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-42-44-850Z-done.json). pair-m4-m11-rostov-to-tver

2026-10-16T01:42:50.414Z: automatic queue STARTED; 155/155,96/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-42-50-414Z-started.json). pair-m4-m11-spb-to-voronezh

2026-10-16T01:43:30.546Z: automatic queue DONE; 155/155,97/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-43-30-546Z-done.json). pair-m4-m11-spb-to-voronezh

2026-10-16T01:43:35.901Z: automatic queue STARTED; 155/155,97/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-43-35-901Z-started.json). pair-m4-m11-torzhok-to-krasnodar

2026-10-16T01:44:19.101Z: automatic queue DONE; 155/155,98/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-44-19-101Z-done.json). pair-m4-m11-torzhok-to-krasnodar

2026-10-16T01:44:24.563Z: automatic queue STARTED; 155/155,98/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-44-24-563Z-started.json). pair-m4-m11-tver-to-rostov

2026-10-16T01:45:04.917Z: automatic queue DONE; 155/155,99/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-45-04-917Z-done.json). pair-m4-m11-tver-to-rostov

2026-10-16T01:45:10.639Z: automatic queue STARTED; 155/155,99/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-45-10-639Z-started.json). single-a289-anapa-to-krasnodar

2026-10-16T01:45:41.134Z: automatic queue DONE; 155/155,100/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-45-41-134Z-done.json). single-a289-anapa-to-krasnodar

2026-10-16T01:45:46.512Z: automatic queue STARTED; 155/155,100/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-45-46-512Z-started.json). single-a289-krasnodar-to-anapa

2026-10-16T01:46:16.992Z: automatic queue DONE; 155/155,101/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-46-16-992Z-done.json). single-a289-krasnodar-to-anapa

2026-10-16T01:46:22.361Z: automatic queue STARTED; 155/155,101/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-46-22-361Z-started.json). single-a289-slavyansk-to-taman

2026-10-16T01:46:52.647Z: automatic queue DONE; 155/155,102/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-46-52-647Z-done.json). single-a289-slavyansk-to-taman

2026-10-16T01:46:57.753Z: automatic queue STARTED; 155/155,102/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-46-57-753Z-started.json). single-a289-taman-to-slavyansk

2026-10-16T01:47:27.389Z: automatic queue DONE; 155/155,103/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-47-27-389Z-done.json). single-a289-taman-to-slavyansk

2026-10-16T01:47:32.769Z: automatic queue STARTED; 155/155,103/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-47-32-769Z-started.json). single-a289-temryuk-to-krasnodar

2026-10-16T01:48:02.559Z: automatic queue DONE; 155/155,104/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-48-02-559Z-done.json). single-a289-temryuk-to-krasnodar

2026-10-16T01:48:07.880Z: automatic queue STARTED; 155/155,104/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-48-07-880Z-started.json). single-ckad-dmitrov-to-kazan

2026-10-16T01:48:43.251Z: automatic queue DONE; 155/155,105/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-48-43-251Z-done.json). single-ckad-dmitrov-to-kazan

2026-10-16T01:48:48.566Z: automatic queue STARTED; 155/155,105/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-48-48-566Z-started.json). single-ckad-dmitrov-to-rostov

2026-10-16T01:49:27.150Z: automatic queue DONE; 155/155,106/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-49-27-150Z-done.json). single-ckad-dmitrov-to-rostov

2026-10-16T01:49:32.735Z: automatic queue STARTED; 155/155,106/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-49-32-735Z-started.json). single-ckad-kazan-to-dmitrov

2026-10-16T01:50:05.934Z: automatic queue DONE; 155/155,107/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-50-05-934Z-done.json). single-ckad-kazan-to-dmitrov

2026-10-16T01:50:11.266Z: automatic queue STARTED; 155/155,107/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-50-11-266Z-started.json). single-ckad-klin-to-ramenskoe

2026-10-16T01:50:42.712Z: automatic queue DONE; 155/155,108/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-50-42-712Z-done.json). single-ckad-klin-to-ramenskoe

2026-10-16T01:50:48.290Z: automatic queue STARTED; 155/155,108/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-50-48-290Z-started.json). single-ckad-rostov-to-dmitrov

2026-10-16T01:51:26.089Z: automatic queue DONE; 155/155,109/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-51-26-089Z-done.json). single-ckad-rostov-to-dmitrov

2026-10-16T01:51:31.854Z: automatic queue STARTED; 155/155,109/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-51-31-854Z-started.json). single-khabarovsk-berezovka-to-vyazemsky

2026-10-16T01:52:02.835Z: automatic queue DONE; 155/155,110/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-52-02-835Z-done.json). single-khabarovsk-berezovka-to-vyazemsky

2026-10-16T01:52:08.099Z: automatic queue STARTED; 155/155,110/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-52-08-099Z-started.json). single-khabarovsk-khabarovsk-to-vyazemsky

2026-10-16T01:52:38.131Z: automatic queue DONE; 155/155,111/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-52-38-131Z-done.json). single-khabarovsk-khabarovsk-to-vyazemsky

2026-10-16T01:52:43.635Z: automatic queue STARTED; 155/155,111/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-52-43-635Z-started.json). single-khabarovsk-nekrasovka-to-smidovich

2026-10-16T01:53:13.968Z: automatic queue DONE; 155/155,112/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-53-13-968Z-done.json). single-khabarovsk-nekrasovka-to-smidovich

2026-10-16T01:53:19.304Z: automatic queue STARTED; 155/155,112/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-53-19-304Z-started.json). single-khabarovsk-vyazemsky-to-berezovka

2026-10-16T01:53:49.431Z: automatic queue DONE; 155/155,113/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-53-49-431Z-done.json). single-khabarovsk-vyazemsky-to-berezovka

2026-10-16T01:53:54.651Z: automatic queue STARTED; 155/155,113/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-53-54-651Z-started.json). single-khabarovsk-vyazemsky-to-khabarovsk

2026-10-16T01:54:24.878Z: automatic queue DONE; 155/155,114/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-54-24-878Z-done.json). single-khabarovsk-vyazemsky-to-khabarovsk

2026-10-16T01:54:30.073Z: automatic queue STARTED; 155/155,114/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-54-30-073Z-started.json). single-m11-moscow-to-novgorod

2026-10-16T01:55:03.222Z: automatic queue DONE; 155/155,115/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-55-03-222Z-done.json). single-m11-moscow-to-novgorod

2026-10-16T01:55:08.565Z: automatic queue STARTED; 155/155,115/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-55-08-565Z-started.json). single-m11-novgorod-to-moscow

2026-10-16T01:55:40.161Z: automatic queue DONE; 155/155,116/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-55-40-161Z-done.json). single-m11-novgorod-to-moscow

2026-10-16T01:55:45.631Z: automatic queue STARTED; 155/155,116/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-55-45-631Z-started.json). single-m11-spb-to-tver

2026-10-16T01:56:17.278Z: automatic queue DONE; 155/155,117/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-56-17-278Z-done.json). single-m11-spb-to-tver

2026-10-16T01:56:22.715Z: automatic queue STARTED; 155/155,117/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-56-22-715Z-started.json). single-m11-torzhok-to-moscow

2026-10-16T01:56:54.006Z: automatic queue DONE; 155/155,118/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-56-54-006Z-done.json). single-m11-torzhok-to-moscow

2026-10-16T01:56:59.345Z: automatic queue STARTED; 155/155,118/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-56-59-345Z-started.json). single-m11-tver-to-spb

2026-10-16T01:57:31.308Z: automatic queue DONE; 155/155,119/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-57-31-308Z-done.json). single-m11-tver-to-spb

2026-10-16T01:57:36.826Z: automatic queue STARTED; 155/155,119/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-57-36-826Z-started.json). single-m12-arzamas-to-moscow

2026-10-16T01:58:08.890Z: automatic queue DONE; 155/155,120/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-58-08-890Z-done.json). single-m12-arzamas-to-moscow

2026-10-16T01:58:14.261Z: automatic queue STARTED; 155/155,120/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-58-14-261Z-started.json). single-m12-cheboksary-to-moscow

2026-10-16T01:58:47.062Z: automatic queue DONE; 155/155,121/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-58-47-062Z-done.json). single-m12-cheboksary-to-moscow

2026-10-16T01:58:52.609Z: automatic queue STARTED; 155/155,121/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-58-52-609Z-started.json). single-m12-kazan-to-murom

2026-10-16T01:59:24.864Z: automatic queue DONE; 155/155,122/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-59-24-864Z-done.json). single-m12-kazan-to-murom

2026-10-16T01:59:30.304Z: automatic queue STARTED; 155/155,122/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T01-59-30-304Z-started.json). single-m12-moscow-to-arzamas

2026-10-16T02:00:03.509Z: automatic queue DONE; 155/155,123/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-00-03-509Z-done.json). single-m12-moscow-to-arzamas

2026-10-16T02:00:09.055Z: automatic queue STARTED; 155/155,123/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-00-09-055Z-started.json). single-m12-moscow-to-cheboksary

2026-10-16T02:00:43.415Z: automatic queue DONE; 155/155,124/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-00-43-415Z-done.json). single-m12-moscow-to-cheboksary

2026-10-16T02:00:48.986Z: automatic queue STARTED; 155/155,124/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-00-48-986Z-started.json). single-m3-balabanovo-to-kaluga

2026-10-16T02:01:19.245Z: automatic queue DONE; 155/155,125/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-01-19-245Z-done.json). single-m3-balabanovo-to-kaluga

2026-10-16T02:01:24.637Z: automatic queue STARTED; 155/155,125/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-01-24-637Z-started.json). single-m3-kaluga-to-balabanovo

2026-10-16T02:01:55.465Z: automatic queue DONE; 155/155,126/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-01-55-465Z-done.json). single-m3-kaluga-to-balabanovo

2026-10-16T02:02:00.755Z: automatic queue STARTED; 155/155,126/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-02-00-755Z-started.json). single-m3-kaluga-to-obninsk

2026-10-16T02:02:31.787Z: automatic queue DONE; 155/155,127/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-02-31-787Z-done.json). single-m3-kaluga-to-obninsk

2026-10-16T02:02:37.102Z: automatic queue STARTED; 155/155,127/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-02-37-102Z-started.json). single-m3-maloyaroslavets-to-moscow

2026-10-16T02:03:07.910Z: automatic queue DONE; 155/155,128/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-03-07-910Z-done.json). single-m3-maloyaroslavets-to-moscow

2026-10-16T02:03:13.269Z: automatic queue STARTED; 155/155,128/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-03-13-269Z-started.json). single-m3-obninsk-to-kaluga

2026-10-16T02:03:43.465Z: automatic queue DONE; 155/155,129/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-03-43-465Z-done.json). single-m3-obninsk-to-kaluga

2026-10-16T02:03:48.780Z: automatic queue STARTED; 155/155,129/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-03-48-780Z-started.json). single-m4-moscow-to-voronezh

2026-10-16T02:04:22.776Z: automatic queue DONE; 155/155,130/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-04-22-776Z-done.json). single-m4-moscow-to-voronezh

2026-10-16T02:04:28.174Z: automatic queue STARTED; 155/155,130/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-04-28-174Z-started.json). single-m4-rostov-to-krasnodar

2026-10-16T02:04:59.144Z: automatic queue DONE; 155/155,131/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-04-59-144Z-done.json). single-m4-rostov-to-krasnodar

2026-10-16T02:05:04.575Z: automatic queue STARTED; 155/155,131/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-05-04-575Z-started.json). single-m4-rostov-to-voronezh

2026-10-16T02:05:36.396Z: automatic queue DONE; 155/155,132/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-05-36-396Z-done.json). single-m4-rostov-to-voronezh

2026-10-16T02:05:41.781Z: automatic queue STARTED; 155/155,132/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-05-41-781Z-started.json). single-m4-voronezh-to-moscow

2026-10-16T02:06:14.535Z: automatic queue DONE; 155/155,133/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-06-14-535Z-done.json). single-m4-voronezh-to-moscow

2026-10-16T02:06:19.916Z: automatic queue STARTED; 155/155,133/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-06-19-916Z-started.json). single-m4-voronezh-to-rostov

2026-10-16T02:06:52.176Z: automatic queue DONE; 155/155,134/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-06-52-176Z-done.json). single-m4-voronezh-to-rostov

2026-10-16T02:06:57.761Z: automatic queue STARTED; 155/155,134/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-06-57-761Z-started.json). single-odintsovo-golitsyno-to-rublevo

2026-10-16T02:07:28.191Z: automatic queue DONE; 155/155,135/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-07-28-191Z-done.json). single-odintsovo-golitsyno-to-rublevo

2026-10-16T02:07:33.658Z: automatic queue STARTED; 155/155,135/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-07-33-658Z-started.json). single-odintsovo-kubinka-to-moscow

2026-10-16T02:08:03.929Z: automatic queue DONE; 155/155,136/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-08-03-929Z-done.json). single-odintsovo-kubinka-to-moscow

2026-10-16T02:08:09.338Z: automatic queue STARTED; 155/155,136/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-08-09-338Z-started.json). single-odintsovo-lesnoy-to-moscow

2026-10-16T02:08:40.203Z: automatic queue DONE; 155/155,137/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-08-40-203Z-done.json). single-odintsovo-lesnoy-to-moscow

2026-10-16T02:08:45.471Z: automatic queue STARTED; 155/155,137/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-08-45-471Z-started.json). single-odintsovo-moscow-to-lesnoy

2026-10-16T02:09:15.850Z: automatic queue DONE; 155/155,138/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-09-15-850Z-done.json). single-odintsovo-moscow-to-lesnoy

2026-10-16T02:09:21.083Z: automatic queue STARTED; 155/155,138/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-09-21-083Z-started.json). single-odintsovo-rublevo-to-golitsyno

2026-10-16T02:09:52.140Z: automatic queue DONE; 155/155,139/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-09-52-140Z-done.json). single-odintsovo-rublevo-to-golitsyno

2026-10-16T02:09:57.435Z: automatic queue STARTED; 155/155,139/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-09-57-435Z-started.json). single-zsd-blag-to-sest

2026-10-16T02:10:28.474Z: automatic queue DONE; 155/155,140/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-10-28-474Z-done.json). single-zsd-blag-to-sest

2026-10-16T02:10:33.867Z: automatic queue STARTED; 155/155,140/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-10-33-867Z-started.json). single-zsd-peterhof-to-prim

2026-10-16T02:11:04.634Z: automatic queue DONE; 155/155,141/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-11-04-634Z-done.json). single-zsd-peterhof-to-prim

2026-10-16T02:11:10.152Z: automatic queue STARTED; 155/155,141/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-11-10-152Z-started.json). single-zsd-prim-to-peterhof

2026-10-16T02:11:41.552Z: automatic queue DONE; 155/155,142/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-11-41-552Z-done.json). single-zsd-prim-to-peterhof

2026-10-16T02:11:47.094Z: automatic queue STARTED; 155/155,142/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-11-47-094Z-started.json). single-zsd-sest-to-blag

2026-10-16T02:12:18.130Z: automatic queue DONE; 155/155,143/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-12-18-130Z-done.json). single-zsd-sest-to-blag

2026-10-16T02:12:23.453Z: automatic queue STARTED; 155/155,143/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-12-23-453Z-started.json). single-zsd-sest-to-peterhof

2026-10-16T02:12:54.015Z: automatic queue DONE; 155/155,144/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-12-54-015Z-done.json). single-zsd-sest-to-peterhof

2026-10-16T02:12:59.412Z: automatic queue STARTED; 155/155,144/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-12-59-412Z-started.json). triple-m11-ckad-m12-arzamas-to-spb

2026-10-16T02:13:37.109Z: automatic queue DONE; 155/155,145/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-13-37-109Z-done.json). triple-m11-ckad-m12-arzamas-to-spb

2026-10-16T02:13:42.586Z: automatic queue STARTED; 155/155,145/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-13-42-586Z-started.json). triple-m11-ckad-m12-murom-to-tver

2026-10-16T02:14:15.468Z: automatic queue DONE; 155/155,146/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-14-15-468Z-done.json). triple-m11-ckad-m12-murom-to-tver

2026-10-16T02:14:20.906Z: automatic queue STARTED; 155/155,146/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-14-20-906Z-started.json). triple-m11-ckad-m12-novgorod-to-vladimir

2026-10-16T02:14:53.978Z: automatic queue DONE; 155/155,147/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-14-53-978Z-done.json). triple-m11-ckad-m12-novgorod-to-vladimir

2026-10-16T02:14:59.747Z: automatic queue STARTED; 155/155,147/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-14-59-747Z-started.json). triple-m11-ckad-m12-spb-to-arzamas

2026-10-16T02:15:38.204Z: automatic queue DONE; 155/155,148/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-15-38-204Z-done.json). triple-m11-ckad-m12-spb-to-arzamas

2026-10-16T02:15:43.892Z: automatic queue STARTED; 155/155,148/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-15-43-892Z-started.json). triple-m11-ckad-m12-vladimir-to-novgorod

2026-10-16T02:16:18.230Z: automatic queue DONE; 155/155,149/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-16-18-230Z-done.json). triple-m11-ckad-m12-vladimir-to-novgorod

2026-10-16T02:16:23.688Z: automatic queue STARTED; 155/155,149/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-16-23-688Z-started.json). triple-m4-m11-zsd-domodedovo-to-sest

2026-10-16T02:16:58.645Z: automatic queue DONE; 155/155,150/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-16-58-645Z-done.json). triple-m4-m11-zsd-domodedovo-to-sest

2026-10-16T02:17:04.200Z: automatic queue STARTED; 155/155,150/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-17-04-200Z-started.json). triple-m4-m11-zsd-krasnodar-to-prim

2026-10-16T02:17:52.909Z: automatic queue DONE; 155/155,151/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-17-52-909Z-done.json). triple-m4-m11-zsd-krasnodar-to-prim

2026-10-16T02:17:58.671Z: automatic queue STARTED; 155/155,151/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-17-58-671Z-started.json). triple-m4-m11-zsd-prim-to-krasnodar

2026-10-16T02:18:48.824Z: automatic queue DONE; 155/155,152/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-18-48-824Z-done.json). triple-m4-m11-zsd-prim-to-krasnodar

2026-10-16T02:18:54.677Z: automatic queue STARTED; 155/155,152/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-18-54-677Z-started.json). triple-m4-m11-zsd-prim-to-voronezh

2026-10-16T02:19:35.847Z: automatic queue DONE; 155/155,153/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-19-35-847Z-done.json). triple-m4-m11-zsd-prim-to-voronezh

2026-10-16T02:19:41.412Z: automatic queue STARTED; 155/155,153/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-19-41-412Z-started.json). triple-m4-m11-zsd-sest-to-domodedovo

2026-10-16T02:20:15.618Z: automatic queue DONE; 155/155,154/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-20-15-618Z-done.json). triple-m4-m11-zsd-sest-to-domodedovo

2026-10-16T02:20:21.259Z: automatic queue AUDIT_QUEUE_DONE; 155/155,154/154. [Checkpoint](../../docs/checkpoints/auto-2026-10-16T02-20-21-259Z-audit_queue_done.json).

16.10.2026 05:20МСК: части1–18DONE,309/309иREPORT340/340; queue jobSUCCESS. Часть19 STARTED: A289 полные3рамки при внешних концах длинной поездки. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-started.md). Parentdb83e758; no merge/Production.

16.10.2026: A289realcapture regression RED,1expectedfail/2PASS; STARTED полный3РВПвектор при внешнемконце. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-a289-regression-red.md). Parent3ed0437d; codefix ещё не внедрён.

16.10.2026: A289fullvector code внедрён, первыйfocused FAILED15PASS/1testfilefailed наVMJSONloader. Следующее nativeimport composition вновомтесте. ../../docs/checkpoints/2026-10-16-part19-a289-focused-loader-failed.md. Новоеполноеисправление ещёнепроверено.

16.10.2026: A289fullinterior vector focused20/20PASS; fullbuildSTARTED, затемlint/replay. ../../docs/checkpoints/2026-10-16-part19-a289-focused-pass.md. Часть19ещёINPROGRESS.

16.10.2026: A289fullvector fullbuild673/673+quote/API/Next/TypeScript/static16/16PASS; lint3/diffSTARTED. ../../docs/checkpoints/2026-10-16-part19-a289-build-pass.md.

16.10.2026: A289lint3/diffPASS; STARTED correctedengine offlineАскания-Нова→Казань15/17октября, baselineнепереписывать. ../../docs/checkpoints/2026-10-16-part19-a289-lint-pass-replay-started.md.

16.10.2026: correctedofflineАскания-Нова→Казаньcomplete2/2,3640/3970(RUB15/17окт),baselineunknownнеперезаписан. STARTED helperimpactна59A289findings. ../../docs/checkpoints/2026-10-16-part19-a289-replay-pass.md. Не новыйlive/внешнееподтверждение.

16.10.2026:19AfullinteriorA289 DONE; helperimpact57/59A289компонентоввосстановлены,2partialМосква↔Таманьunknown. Full673/focused20/lint3PASS; wholeofflineAskaniaKazan3640/3970complete. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-a289-impact-done.md). NEXTSTARTED19B: pair-m4-a289-moscow-to-taman, actualentryproofпередвыбором385. ОчередьPART19_FINDINGS_QUEUE.json. Часть19не завершена,20не начата; baselineREPORTimmutable.

16.10.2026:19Bdiagnosed: selectedValhallaвходитA289с03К252между23и82,рамка23>13.5км; восточныйMaryanskayafallbackневерен. STARTED directedconnectorregression/guardedbindingдо385черезсуществующуюматрицу. ../../docs/checkpoints/2026-10-16-part19b-a289-connector-diagnosed.md.
# 16.10.2026 — part19B directed connector focused DONE / full gate STARTED

Parent c2d11f9f, working branch/PR14draft only. RED reproduces missing385 on selected Valhalla Moscow/Taman partial vector; implemented strict three-control directed Slavyansk entry/exit proof before generic M4 fallback. Actual dated matrix supplies fare; missing23 alone never suffices. Focused23/23PASS, full gate and whole-engine replay not yet run. Details/recovery: docs/checkpoints/2026-10-16-part19b-a289-connector-focused.md. No baseline/raw/live rewriting, no production/main/Android.

16.10.2026:19B fullgate676/676+quote/API/Next/TS/static16/16PASS, scopedlint5/diffPASS. Remote79df66d8/tree8dab735a verified. STARTED single Moscow→Taman selected-capture offline replay15/17Oct09:00MSK. Details/rawSHA/recovery: ../../docs/checkpoints/2026-10-16-part19b-a289-build-pass.md. Minor save preflight blankEOF fixed before durable save; no lost data.

16.10.2026: Moscow→Taman offline complete2/2, priced4725/5625 (M44340/5240 +A289385), 15/17Oct09:00MSK; no replay misses, raw preserved, tariffunconfirmed. Parentc1771e4d. Exact outputSHA/checkpoint: ../../docs/checkpoints/2026-10-16-part19b-moscow-taman-replay.md. STARTED reverse single case after durable head/tree verification.

16.10.2026:19B DONE reverse Taman→Moscow observed same4725/5625,2/2complete/missingResponses=[], direct selectedValhalla exit proof. Parent79abfd50/tree69f28fa5 verified. Raw/baseline preserved, tariffunconfirmed. Exactpaths/SHA in ../../docs/checkpoints/2026-10-16-part19b-taman-moscow-replay.md. A289 remaining2 recovered after57prior component-only; do not call59totalquotes. Findings queue/part19 plan updated. NEXT STARTED one historicalM4-policy case dnr-гранитное-moscow-center, no newsourcefix before replay. Part19ongoing/20planned.

16.10.2026:19C historicalM4policy1/25 checked: dnr-гранитное-moscow-center currentoffline3810/4640, complete2/2, trip-departure-v1 basisAt matchesdeparture, no currentfinding. No sourcefix, originalbaselineweekdaynull preserved. NUL-safe filename inspection recovered from GitCquoted Cyrillic ENOENT. Exacthashes/recovery: ../../docs/checkpoints/2026-10-16-part19c-granitnoe-m4-policy-replay.md. Nextsinglecase zaporizhzhia-пришиб-moscow-center afterdurablesave.

16.10.2026: current WORK_STATE refreshed, superseded statuses moved out of current index only; all historical records retained. Parent9561e3f4/treee261b502 verified. No source/evidence changes. ../../docs/checkpoints/2026-10-16-part19-handoff-refreshed.md. Next case unchanged, part19ongoing/20planned.

16.10.2026 07:38 МСК:19C Пришиб→Москва DONE, historical M4 policy2/25 checked. Selected OSRM2018186m; current offline5840/6890 (М-4 5040/6090+А-289800), complete2/2/missingResponses=[], trip-departure-v1; no new runtime change, baseline unknown preserved, tariff unconfirmed. Source79df66d8/full676 validation from prior step, not rerun. Metadata-only PR14draft/head7aa114ac verified after full fetch_pr Transport closed twice; workflow38824450386/job116729992063 SUCCESS, no relaunch. [Exact evidence/checkpoint](../../docs/checkpoints/2026-10-16-073825-part19c-prishib-m4-policy-replay.md). NEXT STARTED ONLY kherson-раденск-moscow-center3/25, existing capture/two profiles then durable commit/head/tree. Part19ongoing/20planned; no main/merge/Production/Android.

16.10.2026 08:38 МСК:19C Раденск→Москва DONE, historical M4 policy3/25 checked. Selected OSRM1980035m; offline5840/6890=М-4 5040/6090+А-289800, complete2/2/missingResponses=[], trip-departure-v1. No runtime change, old unknown preserved, tariff unconfirmed; full676 относится к предыдущему19B и не rerun. PR14draft/head a53bd290/tree f280ac89 и workflow SUCCESS проверены. Read-only metadata SyntaxError исправлен до replay без изменения данных. [Результат/SHA/recovery](../../docs/checkpoints/2026-10-16-083802-part19c-radensk-m4-policy-replay.md). NEXT STARTED ONLY dnr-гранитное-saint-petersburg-center4/25: existing capture/two profiles, preserve unrelated unknown, checkpoint+commit+head/tree до следующего случая. Part19ongoing/20planned; no main/merge/Production/Android.

16.10.2026 09:36МСК:19C Гранитное→СПб historicalM4policy4/25 DONE; selectedValhalla1972786m, replay complete2/2/no missingResponses. М-4 3810/4640 по отправлению, ошибка не воспроизвелась; **fulltotal unknown**, missing=[zsd], zsd_trip_extends_outside_reviewed_zone1 сохранён, subtotal не итог. Code unchanged, prior full676 not rerun, raw/baseline preserved. PR14draft/head9565897c/tree14f9dc1d и job SUCCESS verified. [Точные outputs/SHA](../../docs/checkpoints/2026-10-16-093623-part19c-granitnoe-spb-m4-policy-replay.md). NEXT STARTED ONLY lnr-брянка-saint-petersburg-center5/25, existingcapture/two dates then checkpoint/commit/head/tree. Часть19ongoing/20planned, no release/main/merge/Android.

16.10.2026 10:22МСК:19C Брянка→СПб M4policy5/25checked, selectedValhalla1827396m, complete2/2/no missingResponses. M43810/4640 по отправлению, oldprofileerror не воспроизвелась; **total unknown**, missingzsd/outside reviewedzone1. Existing M11 components retained, subtotal не итог. No runtimechange/full676notrerun; baseline/report/raw сохранены. PR14draft/head6fa74b45/treed6f6b901 и jobSUCCESS verified. Вспомогательный clocktool недоступен после successful replay, error не влияет на расчёт. [Evidence/SHA/recovery](../../docs/checkpoints/2026-10-16-102232-part19c-bryanka-spb-m4-policy-replay.md). NEXT STARTED ONLY zaporizhzhia-пришиб-saint-petersburg-center6/25, two savedcapture profiles then checkpoint+head/tree. Часть19ongoing/20planned, no release/main/merge/Android.

16.10.2026 10:27МСК пользователь вновь прямо поручил запускать следующий этап автоматически. ExecutionUnit уточнён: один маршрут на отдельный durable checkpoint, затем сразу следующий без нового захода/«дальше». Старый лимит одногоcaseза запуск снят, последовательность/одинwriter/commit/head/tree после каждого не отменены. [Решение и NEXT STARTED case6/25](../../docs/checkpoints/2026-10-16-1030-auto-sequential-microsteps.md). Автоматически продолжать case7 и далее после подтверждения сохранения предыдущего; part19ongoing/20planned.

16.10.2026 STARTED automatic-policy-replay-queue дляоставшихся20historicalM4cases в существующемworkflow/одинwriter. Пользователь10:27МСК подтвердилсразуnextпослекаждогоdurablesave. Runner/focused/fullgate передworkflowpush/observedrun. [Recovery](../../docs/checkpoints/2026-10-16-part19-automatic-policy-queue-started.md). No309rerun/no newlive/no guessed fares, part19ongoing/20planned.

16.10.2026 automatic policy runner implemented, focused5/5/scopedlint2/diff PASS; workflow still not enabled. STARTED raw/report guard and isolated per-case persistence integration, then fullgate before workflow finalpush. [Checkpoint/recovery](../../docs/checkpoints/2026-10-16-part19-policy-runner-focused.md). Only existing20remainingM4policycases; no live/fare changes. Transient exec-server transport closed while appending logs retried after actual file/status check, no duplicate entry/data loss.

16.10.2026 policyqueue focused8/8+scopedlint3/diff PASS: actualraw identity/reportSHA guards, isolated STARTED/DONE/FAILED/pushstop integration. Firstfixturelint5require-errors fixed with asyncnativeimports, tests rerunPASS. STARTED pnpm build fullgate, workflow notyet enabled. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-policy-runner-integration-pass.md). No runtimefarechange/no newrouting.

16.10.2026 policyqueue fullgate684/684+quote/API/Next/TS/static16/16 PASS, focused8/lint3/diffPASS, runtimefaresunchanged. STARTED final workflowactivation afterdurablesave; mustobserveactualnewrun/job, then noassistantbranchwriteswhileactive. [Checkpoint/recovery](../../docs/checkpoints/2026-10-16-part19-policy-queue-build-pass.md). Remaining20historicalM4cases only, part19/20notdone.

16.10.2026 automaticpolicyqueue READY: existingworkflow now selects currentpolicy phase after completedparts1–18, remaining20/25, fullbuildbeforewriter, sameconcurrency, percaseSTARTED/DONE/head/tree. Full684/focused8/lint3PASS. Finalworkflowpush triggersNEWRUN; AUTOstate.workflowRun deliberatelynull untilobserved/runnerSTARTED. [Activation/recovery](../../docs/checkpoints/2026-10-16-part19-policy-queue-ready.md). Next observebranchpushruns/jobs, no branchwriteswhileactive. No claimrunactive beforeobservation. Part19ongoing/20planned.

2026-10-16T07:47:04.533Z: PART19_M4_POLICY_STARTED M4 policy 5/25; zaporizhzhia-пришиб-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-04-533Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:08.572Z: PART19_M4_POLICY_DONE M4 policy 6/25; zaporizhzhia-пришиб-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-08-572Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:11.016Z: PART19_M4_POLICY_STARTED M4 policy 6/25; kherson-раденск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-11-016Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:15.404Z: PART19_M4_POLICY_DONE M4 policy 7/25; kherson-раденск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-15-404Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:17.848Z: PART19_M4_POLICY_STARTED M4 policy 7/25; zaporizhzhia-пришиб-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-17-848Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:21.626Z: PART19_M4_POLICY_DONE M4 policy 8/25; zaporizhzhia-пришиб-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-21-626Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:23.977Z: PART19_M4_POLICY_STARTED M4 policy 8/25; kherson-раденск-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-23-977Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:27.711Z: PART19_M4_POLICY_DONE M4 policy 9/25; kherson-раденск-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-27-711Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:30.151Z: PART19_M4_POLICY_STARTED M4 policy 9/25; dnr-широкино-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-30-151Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:33.600Z: PART19_M4_POLICY_DONE M4 policy 10/25; dnr-широкино-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-33-600Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:36.234Z: PART19_M4_POLICY_STARTED M4 policy 10/25; zaporizhzhia-молочанск-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-36-234Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:40.375Z: PART19_M4_POLICY_DONE M4 policy 11/25; zaporizhzhia-молочанск-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-40-375Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:42.968Z: PART19_M4_POLICY_STARTED M4 policy 11/25; kherson-чулаковка-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-42-968Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:47.368Z: PART19_M4_POLICY_DONE M4 policy 12/25; kherson-чулаковка-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-47-368Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:49.787Z: PART19_M4_POLICY_STARTED M4 policy 12/25; dnr-широкино-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-49-787Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:53.722Z: PART19_M4_POLICY_DONE M4 policy 13/25; dnr-широкино-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-53-722Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:47:56.385Z: PART19_M4_POLICY_STARTED M4 policy 13/25; lnr-лисичанск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-47-56-385Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:00.252Z: PART19_M4_POLICY_DONE M4 policy 14/25; lnr-лисичанск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-00-252Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:02.873Z: PART19_M4_POLICY_STARTED M4 policy 14/25; zaporizhzhia-молочанск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-02-873Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:06.984Z: PART19_M4_POLICY_DONE M4 policy 15/25; zaporizhzhia-молочанск-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-06-984Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:09.504Z: PART19_M4_POLICY_STARTED M4 policy 15/25; kherson-чулаковка-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-09-504Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:13.558Z: PART19_M4_POLICY_DONE M4 policy 16/25; kherson-чулаковка-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-13-558Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:16.287Z: PART19_M4_POLICY_STARTED M4 policy 16/25; zaporizhzhia-молочанск-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-16-287Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:20.249Z: PART19_M4_POLICY_DONE M4 policy 17/25; zaporizhzhia-молочанск-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-20-249Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:22.893Z: PART19_M4_POLICY_STARTED M4 policy 17/25; kherson-чулаковка-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-22-893Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:27.149Z: PART19_M4_POLICY_DONE M4 policy 18/25; kherson-чулаковка-kazan-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-27-149Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:29.874Z: PART19_M4_POLICY_STARTED M4 policy 18/25; dnr-урзуф-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-29-874Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:33.733Z: PART19_M4_POLICY_DONE M4 policy 19/25; dnr-урзуф-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-33-733Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:36.281Z: PART19_M4_POLICY_STARTED M4 policy 19/25; zaporizhzhia-гуляйполе-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-36-281Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:40.342Z: PART19_M4_POLICY_DONE M4 policy 20/25; zaporizhzhia-гуляйполе-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-40-342Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:42.974Z: PART19_M4_POLICY_STARTED M4 policy 20/25; kherson-старая-збурьевка-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-42-974Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:46.959Z: PART19_M4_POLICY_DONE M4 policy 21/25; kherson-старая-збурьевка-moscow-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-46-959Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:49.596Z: PART19_M4_POLICY_STARTED M4 policy 21/25; dnr-урзуф-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-49-596Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:53.580Z: PART19_M4_POLICY_DONE M4 policy 22/25; dnr-урзуф-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-53-580Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:56.134Z: PART19_M4_POLICY_STARTED M4 policy 22/25; lnr-рубежное-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-56-134Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:48:59.820Z: PART19_M4_POLICY_DONE M4 policy 23/25; lnr-рубежное-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-48-59-820Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:49:02.404Z: PART19_M4_POLICY_STARTED M4 policy 23/25; zaporizhzhia-гуляйполе-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-49-02-404Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:49:06.131Z: PART19_M4_POLICY_DONE M4 policy 24/25; zaporizhzhia-гуляйполе-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-49-06-131Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:49:08.576Z: PART19_M4_POLICY_STARTED M4 policy 24/25; kherson-старая-збурьевка-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-49-08-576Z-part19_m4_policy_started.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:49:12.569Z: PART19_M4_POLICY_DONE M4 policy 25/25; kherson-старая-збурьевка-saint-petersburg-center. [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-49-12-569Z-part19_m4_policy_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

2026-10-16T07:49:15.074Z: PART19_M4_POLICY_CLASS_DONE M4 policy 25/25; . [Checkpoint](../../docs/checkpoints/policy-2026-10-16T07-49-15-074Z-part19_m4_policy_class_done.json).  Offline reproducibility only; unknown is not0, subtotal is not total.

16.10.2026 automaticM4policy25/25 DONE, actualrun38869309675/job116869376746 SUCCESS. Rootverified20raw+40replaySHA/integrity/departure/M4, originalREPORTunchanged;20wholeofflinequotes/5unknownZSD, not25confirmedfares. Cleancheckout syncedafterjobcompletion to b90d630f/tree1f5465e3. Full684/focused8/lint3 plusCIbuildPASS. [Verifiedhandoff](../../docs/checkpoints/2026-10-16-part19-policy-25-done-m4-unpriced-started.md). NEXT STARTED19D m4:unpriced1/22 dnr-гранитное-kazan-center savedcapture/two profiles then durablesave before one-causefix. Parts19ongoing/20planned.

16.10.2026 19D Granitnoe→Kazan currentunknown reproduced2/2complete, m4candidateCount0/confirmedPvps=[]; notprooffree/runtimebug. No fare/codechange. [Outputs/SHA/NEXT](../../docs/checkpoints/2026-10-16-part19d-granitnoe-kazan-unknown-reproduced.md). NEXT STARTED samecase selectedraw paid-edge/booth/wayIDs/geometryscope diagnosis before fix; no nextroute yet. Full684+CIbuildPASS remainspriorvalidation, part19ongoing/20planned.

16.10.2026 19D selectedraw diagnosis: exactly2paidM4ways1182567076/31984600 (aliasesМ4/E50/E115/Дон),0booths, complete trace; matchedcore=m4 but0knownPVP. Causeofblockinglocated, correctnessofpaidtag/scope notyet established; no price/freeclaim/sourcechange. [Evidence/NEXT](../../docs/checkpoints/2026-10-16-part19d-granitnoe-kazan-paid-ways.md): samecase only extract2selectedtraceedges/shapewindow+facilitymap/primaryOSMtags; saveproofbeforefix. Full684/CIbuildPASSprior, policy25/25done; part19ongoing/20planned.

16.10.2026 freshcheckout recoveryDONE: actualremote8c3d73ee/tree189a4708, PR14draft, workflow38869309675/jobSUCCESS. Transientexecserverdisconnect and helperJSsyntax recovered before projectchanges, no loss/bypass. [Checkpoint](../../docs/checkpoints/2026-10-16-1119-fresh-checkout-recovery.md). NEXT same19DGranitnoeKazan selected2M4traceedges/shapewindow only; no source/farechange, old684gate notrerun.

16.10.2026 19D GranitnoeKazan selectedscopeDONE:2primaryOSMways≈1.966km matchselectedgeometry,0booths,nearestknown1046≈8.638km. Traceoutputshapeabsent, indicesnotrequestindices. Exactpaymentapplicability notestablished/operatorpage403; no bypass, unknownretained, no fare/freeclaim/runtimechange. [Evidence/checkpoint](../../docs/checkpoints/2026-10-16-part19d-granitnoe-kazan-scope-reviewed.md). Case1source-gatedhold; NEXT restorefrozentools/currentcheckout then Lisichansk→Moscowcase2 offline2profiles and durablecheckpoint. Other21casesnotblocked; part19ongoing/20planned.
16.10.2026 dependency recovery DONE: frozen install exit0/18.6s, Node24.19.0/pnpm11.25.0, lockfile unchanged. No new fullgate. NEXT STARTED Lisichansk→Moscow m4:unpriced2/22 two offlineprofiles; checkpoint before fix/nextcase. [Recovery](../../docs/checkpoints/2026-10-16-part19d-dependencies-restored.md).

16.10.2026 19D Lisichansk→Moscow2/22 offline2profiles DONE, complete/hash/departure verified; unknown retained:460→71 endpoint exactfaremissing. No runtimechange/newfullgate. [Checkpoint](../../docs/checkpoints/2026-10-16-part19d-lisichansk-moscow-replay.md). NEXT STARTED samecase adapter/matrix/source review before correction/nextcase; continue automatically.

16.10.2026 19D samecase diagnosisDONE: reversed combined416+460 retained forward atomic order, creating wrong416→71 key instead of460→71; existing1830/2300 fare not newprice. [Correction STARTED](../../docs/checkpoints/2026-10-16-part19d-reversed-compound-boundary-diagnosis.md): compiler orientation+regression, focused/fullgate separate durable steps; unknown/unconfirmed preserved.

16.10.2026 [part19d-compound-compiler-change](../../docs/checkpoints/2026-10-16-part19d-compound-compiler-change.md): Code change DONE, regenerated register; tests NOT yet run, not accepted for completion. NEXT STARTED: Run focused endpoint/adapter/source tests and eslint modified compiler/test, record exact PASS/FAIL then fullgate; do not replay another route before validation.

16.10.2026 [part19d-compound-focused-pass](../../docs/checkpoints/2026-10-16-part19d-compound-focused-pass.md): Focused validation DONE:26/26 PASS, eslint2modifiedfiles exit0. Commands: node --import ./scripts/register-ts-paths.mjs --test experiments/nationwide-tolls/m4-endpoint-register.test.mjs experiments/nationwide-tolls/engine/m4-route-adapter.test.mjs experiments/nationwide-tolls/m4-verified-source.test.mjs; pnpm exec eslint compiler/test. No runtime sums/newprice/reversefare invention; sourcePDF/receipt hashes verified by tests. Fullgate not yet run. NEXT STARTED: Run npm run build -- --webpack with log capture; inspect complete audit/quote/API/Next/TS/static summary and exitstatus; record before route replay.

16.10.2026 [part19d-focused-lint-failed](../../docs/checkpoints/2026-10-16-part19d-focused-lint-failed.md): Correction / FAILED lint:26/26 focusedtestsPASS, but combined command exit1 from2no-require-imports violations at existing CommonJS compilerline1. Previous focused-pass checkpoint incorrectly asserted exit0 before finaloutput was inspected; superseded and visibly annotated, old log preserved. No fullgate launched, no pricing acceptance. Compiler is deliberately.cjs with unchanged native require; no new lintissue introduced by directionpatch. NEXT STARTED: Run eslint test normally and CJS compiler with explicit no-require-imports exception only; document exact command and inspect exit before recording. Then fullgate. Do not change global lint policy.

16.10.2026 [part19d-compound-lint-recovery-done](../../docs/checkpoints/2026-10-16-part19d-compound-lint-recovery-done.md): Lint recovery DONE exit0: pnpm exec eslint experiments/nationwide-tolls/m4-endpoint-register.test.mjs && pnpm exec eslint experiments/nationwide-tolls/scripts/build-m4-endpoint-register.cjs --rule '@typescript-eslint/no-require-imports: off'. Explicit CJS-only exception for existing native require, not ordinary lintPASS/global policy change.26/26 focused tests passed earlier; plain eslint exit1 is retained in prior correction checkpoint. NEXT STARTED: Fullgate STARTED: npm run build -- --webpack, /tmp/part19-compound-fullgate.log. Require actual exit0 and audit/quote/API/Next/TS/static summaries; onfailure record exactfailure beforefix. Do not price/replay nextcase yet.

16.10.2026 [part19d-compound-fullgate-pass](../../docs/checkpoints/2026-10-16-part19d-compound-fullgate-pass.md): Fullgate DONE: npm run build -- --webpack exit0,687/687testsPASS,0fail; quotecontractPASS, APIadapterPASS, Nextwebpackcompiled7.0s, TypeScript6.1s, static16/16. Previously684+3newregressions. Focused26/26PASS; eslint CJS exception documented separately, ordinarylintfailure retained. Worktree clean/diffcheckPASS aftergate. No deployment/merge/livechecks. NEXT STARTED: Replay ONLY Lisichansk→Moscow savedcapture again for15/17October09:00MSK on correctedengine; verify outputs/hash/unknownstatus and record durablecase before nextcase.

16.10.2026 [part19d-lisichansk-moscow-recovered](../../docs/checkpoints/2026-10-16-part19d-lisichansk-moscow-recovered.md): Case2 corrected replay DONE: whole-route offline estimate1830/2300 RUB for15/17Oct09:00MSK; not confirmed operatorfare. Same OSRM937773m/capture9dd9bdfb..., integrity complete2/2/missingResponses=[], departurebasis unchanged, missing=[], auditpriced.36endpoint key relocation is NOT36verifiedwhole-routecases. NEXT STARTED: Next dnr-широкино-kazan-center3/22 only: savedcapture2026-10-15T12-08-35-445Z-capture.json.gz, two currentengineoffline15/17Oct09:00MSK; verify actualresult/evidence, durablecheckpoint before diagnosis/nextcase; automatic continuation.

16.10.2026 [part19d-shirokino-kazan-source-hold](../../docs/checkpoints/2026-10-16-part19d-shirokino-kazan-source-hold.md): Case3/22 DONE review: Valhalla1668355m, offline15/17October09:00MSK complete2/2/hash/departure verified; unknownM4/candidate0/0booths. Selected paidledger contains exactly same2ways1182567076/31984600 as GranitnoeKazan. Independent selectedgeometry endpoint match1719→1721→1728within0.046m, savedPVP1046 nearestselectedvertex≈8.640km. Reused preserved primaryOSMways, no newfetch or403bypass; no inferredfreefare. Same1.966km source-gatedcollectionscope, no compilerregression. [Evidence/SHA](evidence/2026-10-16-shirokino-kazan-scope.json). Oldraw/live/replays preserved, fullgate687PASS remainslatest. Class3reviewed:1recovered/2sourcegated, not3confirmedfares. NEXT STARTED: Next lnr-рубежное-moscow-center4/22 only, get exactexistingcorpus capture, currentoffline15/17Oct09:00MSK; durablepair/checkpoint before nextcase; no repeat completedpolicyclass.

16.10.2026 [part19d-case4-replay](../../docs/checkpoints/2026-10-16-part19d-case4-replay.md): Case4/22 lnr-рубежное-moscow-center offlinepair DONE: 1830/2300 RUB, whole-route estimate recovered, stillunconfirmed. ProviderOSRM/914568m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case4-replay.json), captureSHA36d0b3bfcf20b6d80eb8bd3baa310c61be3a87a49b5e988e6502f232997ea2b6. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Next dnr-бахмут-moscow-center case5/22 only, exactexistingcorpus capture and15/17Oct09:00MSK offlinepair; durablecheckpoint before nextcase.

16.10.2026 [part19d-case5-replay](../../docs/checkpoints/2026-10-16-part19d-case5-replay.md): Case5/22 dnr-бахмут-moscow-center offlinepair DONE: 1830/2300 RUB, whole-route estimate recovered, stillunconfirmed. ProviderOSRM/991458m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case5-replay.json), captureSHAf2d806e59d7c139ab6d0875757ee76c55abf1b85b9e909e12e4673a40147ea44. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Next dnr-краматорск-moscow-center case6/22 only, exactexistingcorpus capture and15/17Oct09:00MSK offlinepair; durablecheckpoint before nextcase.

16.10.2026 [part19d-case6-replay](../../docs/checkpoints/2026-10-16-part19d-case6-replay.md): Case6/22 dnr-краматорск-moscow-center offlinepair DONE: 1830/2300 RUB, whole-route estimate recovered, stillunconfirmed. ProviderOSRM/982509m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case6-replay.json), captureSHAed4c45197f7a105878675ec0e4021e2c3bc95df216addfcedde0e4c896578d12. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Next zaporizhzhia-гуляйполе-kazan-center case7/22 only, exactexistingcorpus capture and15/17Oct09:00MSK offlinepair; durablecheckpoint before nextcase.

16.10.2026 [part19d-case7-replay](../../docs/checkpoints/2026-10-16-part19d-case7-replay.md): Case7/22 zaporizhzhia-гуляйполе-kazan-center offlinepair DONE: / RUB, unknown retained. ProviderValhalla/1842528m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case7-replay.json), captureSHA34148e82f69e87b58eadce3e90ec0965d2c25e4b939213c5106c1059cacbafce. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Samecase zaporizhzhia-гуляйполе-kazan-center: diagnose exact currentmissing reason/selectedscope before nextcase; do not guess price.

16.10.2026 [part19d-gulyaypole-kazan-source-hold](../../docs/checkpoints/2026-10-16-part19d-gulyaypole-kazan-source-hold.md): Case7 scope diagnosis DONE: complete selectedValhalla1842528m/0booths, exactlysame2paidways1182567076/31984600 as source-gatedGranitnoe/ShirokinoKazan. Reused primaryOSM endpoints independently match selectedvertices3011→3013→3020 within0.046m, saved1046 nearestvertex≈8.640km. Same≈1.966kmpaid-taggedscope; exactcollection/freeproof remainsabsent, no newfetch/bypass/fareinvention. [Geometryevidence](evidence/2026-10-16-gulyaypole-kazan-scope.json); two replays/SHA in case7checkpoint.7/22reviewed:4wholeestimates recovered/3sourcegated; not7confirmedfares. Remotehead/PR14draft/jobSUCCESS rechecked atfb137002, noactivewriter. Full687gatePASS remainslatest. NEXT STARTED: Next max-chain-m4-ckad-m11-zsd-voronezh-to-prim8/22 exactexistingcapture/two offlineprofiles; actualcomponentmissing/evidence review before furthercase. Automatic continuation; all20notcomplete.

16.10.2026 [part19d-case8-replay](../../docs/checkpoints/2026-10-16-part19d-case8-replay.md): Case8/22 max-chain-m4-ckad-m11-zsd-voronezh-to-prim offlinepair DONE: / RUB, unknown retained. ProviderValhalla/1245601m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case8-replay.json), captureSHAfa38a093f1ccf7fee9c35e27eec0dff76bf878fcdcf88bb06fda0ea79f17c7c9. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Samecase max-chain-m4-ckad-m11-zsd-voronezh-to-prim: diagnose exact currentmissing reason/selectedscope before nextcase; do not guess price.

16.10.2026 [part19d-case8-component-recovered](../../docs/checkpoints/2026-10-16-part19d-case8-component-recovered.md): Case8 M4 finding classified DONE:1830/2300 M4component restored, wholequote remainsunknown duezsd_trip_extends_outside_reviewed_zone1 andunmapped_selected_route_paid_booth. Do not present knownM4/M11 subtotal asfulltotal. Remaining products are separate existing findingclasses, retained for later diagnosis; no M4fare change needed. Exactoutputs/hashes incase8evidence, complete2/2 samecaptureValhalla1245601m/departurepolicy. Initial capturelookup incorrectly searched regionalcorpus only, failed before replay; recovered exactroad-cases.json.auditEvidence.capture2026-10-16T00-03-24-052Z without guessing filename/provider. No failedroute/rebuiltlive.8/22checked:4wholeestimates+1M4componentrecovered/3sourcegated. Previousfull687gate stilllatest. NEXT STARTED: Next pair-m4-a289-taman-to-voronezh9/22 fromroad-cases.json, exactsavedcapture twoofflineprofiles, verifyeverycomponent; durablebefore nextcase. M4componentdone canadvance thisclass while unrelatedunknownproductsremainqueued.

16.10.2026 [part19d-case9-replay](../../docs/checkpoints/2026-10-16-part19d-case9-replay.md): Case9/22 pair-m4-a289-taman-to-voronezh offlinepair DONE: / RUB, unknown retained. ProviderOSRM/1026560m, complete2/2/SHA/departurepolicy verified; frozenREPORT unchanged. [Exactevidence](evidence/2026-10-16-part19d-case9-replay.json), captureSHAdb7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a. Existingraw/live/oldreplay preserved. Full687gate/26focusedPASS remainslatest; no newruntimechange. Not freshlive/independentoperatorconfirmation. NEXT STARTED: Samecase pair-m4-a289-taman-to-voronezh: diagnose exact currentmissing reason/selectedscope before nextcase; do not guess price.

16.10.2026 [part19d-case9-545-scope-diagnosis](../../docs/checkpoints/2026-10-16-part19d-case9-545-scope-diagnosis.md): Case9 diagnosis DONE / scope binding still UNRESOLVED, not a proven new runtimebug. OSRM1026560m/complete10booths/784paidedges, exact545node5818209495. Physicalendpoint1223→545 cannot directly match semantic tariff IDs545-a/b. Existingdatedmatrix has two different finished variants:1223→545-a3060/3620 includesbothrows;1223→545-b2920/3460 includesonlyb. Crossing545alone cannot choose these: explicit existing m4-plaza-nodes.ts notes and corridorinventory require independently proven scope/precomputed finishedspan. Primaryverifiedrows517–544140/160 and544–589180/250 retained; do not rename/fold blindly or selectmin/max. Nativelegacy through545 helper needs flankingplazas<517 and>589; selected endpoint-only preview isnotthatproof and legacyamountmustnotbeimported. NEXT STARTED: Samecase9 first: inspect only selected trace/route paid-edge geometry around545 northbound and actualexit toward Voronezh; locate independent operator collection rule or prove exact545section scope before one-causefix. Keepunknownifnotproven. Persist this microstep before case10. Automatic task remainsenabled; this isnot a fulltaskblocker.

2026-10-16 resume: exact-tree ancestry recovery DONE; see ../../docs/checkpoints/2026-10-16-resume-exact-tree-recovery.md. Same case9 next, no runtime change.

16.10.2026 [Fresh checkout DONE / samecase9 narrowreview STARTED](../../docs/checkpoints/2026-10-16-1222-fresh-checkout-case9-resume.md): actuala11dcf46/PR14draft, workflow38869309675SUCCESS. No newcode/build. Next primaryPDF545tariffrows/footnotes+selectedgeometry, unknown preserved until scopeproof; oldcheckout retained.

2026-10-16-122949 MSK [Case9scopeDONE/source-gated](../../docs/checkpoints/2026-10-16-122949-case9-545-source-gate.md): primaryPDF/4OSMobjects andselected545exactlane reviewed, M4named28km notpaid-scopeproof; collectionrule unresolved/operator403notbypassed, unknownretained. No code/newgate; prior687historical. NEXT STARTED case10 Voronezh→Taman savedcapture/twoofflineprofiles; case9holdnotfulltaskblocker. CLIcredentialfailure recoveredconnector exacttree2ac0d2a; source/historypreserved.

2026-10-16-123215 MSK [case10-frozen-tools-ready](../../docs/checkpoints/2026-10-16-123215-case10-frozen-tools-ready.md): Dependency prerequisite DONE: pnpm install --frozen-lockfile exit0 in1.1s, pnpm11.25.0; tracked worktree remainedclean, lockfileunchanged. No newtest/build claim, previous687gate historical. No sourcepricechange. NEXT: Case10 pair-m4-a289-voronezh-to-taman capture2026-10-16T00-11-20-485Z-capture.json.gz; run twoofflineprofiles15/17Oct09:00MSK, verifySHA/provider/integrity/departure/M4component; save separately before nextcase.

2026-10-16-123435 MSK [part19d-current-case10](../../docs/checkpoints/2026-10-16-123435-part19d-current-case10.md): Case10/22 pair-m4-a289-voronezh-to-taman DONE: source_gated_physical545_scope_unresolved, providerOSRM/1025458m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next pair-m4-m11-voronezh-to-spb, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-123630 MSK [part19d-current-case11](../../docs/checkpoints/2026-10-16-123630-part19d-current-case11.md): Case11/22 pair-m4-m11-voronezh-to-spb DONE: m4_component_priced_other_products_unknown, providerValhalla/1236369m. Wholeamounts[null,null], remaining["zsd"]; no numeric subtotal presented asfulltotal. NEXT: Next single-m4-krasnodar-to-voronezh, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-123734 MSK [part19d-current-case12](../../docs/checkpoints/2026-10-16-123734-part19d-current-case12.md): Case12/22 single-m4-krasnodar-to-voronezh DONE: source_gated_physical545_scope_unresolved, providerOSRM/836186m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next single-m4-voronezh-to-krasnodar, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-123840 MSK [part19d-current-case13](../../docs/checkpoints/2026-10-16-123840-part19d-current-case13.md): Case13/22 single-m4-voronezh-to-krasnodar DONE: source_gated_physical545_scope_unresolved, providerOSRM/835029m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next triple-m4-m11-zsd-voronezh-to-prim, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-123947 MSK [part19d-current-case14](../../docs/checkpoints/2026-10-16-123947-part19d-current-case14.md): Case14/22 triple-m4-m11-zsd-voronezh-to-prim DONE: m4_component_priced_other_products_unknown, providerValhalla/1245601m. Wholeamounts[null,null], remaining["zsd","unknown-paid-road"]; no numeric subtotal presented asfulltotal. NEXT: Next dnr-новоазовск-kazan-center, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124051 MSK [part19d-current-case15](../../docs/checkpoints/2026-10-16-124051-part19d-current-case15.md): Case15/22 dnr-новоазовск-kazan-center DONE: source_gated_same_two_way_collection_scope, providerValhalla/1647414m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next dnr-талаковка-kazan-center, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124158 MSK [part19d-current-case16](../../docs/checkpoints/2026-10-16-124158-part19d-current-case16.md): Case16/22 dnr-талаковка-kazan-center DONE: source_gated_same_two_way_collection_scope, providerValhalla/1688157m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next zaporizhzhia-розовка-kazan-center, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124305 MSK [part19d-current-case17](../../docs/checkpoints/2026-10-16-124305-part19d-current-case17.md): Case17/22 zaporizhzhia-розовка-kazan-center DONE: source_gated_same_two_way_collection_scope, providerValhalla/1742659m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next pair-m4-a289-anapa-to-voronezh, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124417 MSK [part19d-current-case18](../../docs/checkpoints/2026-10-16-124417-part19d-current-case18.md): Case18/22 pair-m4-a289-anapa-to-voronezh DONE: source_gated_physical545_scope_unresolved, providerOSRM/992359m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next pair-m4-a289-voronezh-to-anapa, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124521 MSK [part19d-current-case19](../../docs/checkpoints/2026-10-16-124521-part19d-current-case19.md): Case19/22 pair-m4-a289-voronezh-to-anapa DONE: source_gated_physical545_scope_unresolved, providerOSRM/991519m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next single-m4-rostov-to-voronezh, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124629 MSK [part19d-current-case20](../../docs/checkpoints/2026-10-16-124629-part19d-current-case20.md): Case20/22 single-m4-rostov-to-voronezh DONE: source_gated_physical545_scope_unresolved, providerValhalla/567353m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next single-m4-voronezh-to-moscow, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124732 MSK [part19d-current-case21](../../docs/checkpoints/2026-10-16-124732-part19d-current-case21.md): Case21/22 single-m4-voronezh-to-moscow DONE: whole_estimate_present_current_engine, providerValhalla/520174m. Wholeamounts[1830,2300], remaining[]; no numeric subtotal presented asfulltotal. NEXT: Next single-m4-voronezh-to-rostov, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-124839 MSK [part19d-current-case22](../../docs/checkpoints/2026-10-16-124839-part19d-current-case22.md): Case22/22 single-m4-voronezh-to-rostov DONE: source_gated_physical545_scope_unresolved, providerValhalla/565794m. Wholeamounts[null,null], remaining["m4"]; no numeric subtotal presented asfulltotal. NEXT: Next dnr-гранитное-saint-petersburg-center, exactexistingcapture fromregionalcorpus/road-cases, offline15/17Oct09:00MSK; separatecasecheckpoint/readback before next. Keepknownsourcegates/unrelatedmissingproductsvisible.

2026-10-16-125248 MSK [part19d-m4-22-review-and-open-collection-rule](../../docs/checkpoints/2026-10-16-125248-part19d-m4-22-review-and-open-collection-rule.md): M4 finding review DONE22/22 distinctcases, NOT22confirmedfares:5wholeunconfirmedestimates,3M4componentspriced/wholeunknown,8physical545scopegated,6shortM4scopegated. Currentqueue and per-caseSHA/checkpoints preserve exactoutcomes; unchangedfrozenREPORT. No newruntimechange/fullgate thisturn, prior687historical. NEXT: NEXT narrowstep: evaluate primaryopen-rule applicability and safe exactlyreviewedM4scope guard, then one-causecodechange only ifindependentproofsuffices; focused+fullgate and6separatecasecheckpoints beforeacceptance. Otherwise keep6unknown and continueZSDfirst dnr-гранитное-saint-petersburg-center. Keep8physical545sourcegates; parts19ongoing/20planned.

2026-10-16-125719 MSK [m4-open-rule-proof-and-api-review](../../docs/checkpoints/2026-10-16-125719-m4-open-rule-proof-and-api-review.md): Primary-rule verification DONE, implementation NOT started: operator uploaded13pagePDF SHAa3ed4b13529e0eae7865bfc4192c6944a0b3ece6c371062a97d5b6dc461c57dc section2.1 is PAGE4 (visuallyrendered1600px), notpage3; earliercheckpoint visiblyannotated, oldstatementpreserved. Page2matchingheading is tableofcontents. Fulltext containsno545-specificrule, so8physical545gates remainunresolved. NEXT: Revisit exactshortM4scope case1 dnr-гранитное-kazan-center: decide whether primaryfullway-node geometry/facilitymap+operatoropenrule establishes positive no-charge proof. If sufficient, implement reviewedroad-scopeguard (no benchmarkrouteIDs) requiring same-selectedcompleteValhalla/boothcoverage, exact2ways1182567076+31984600/directedgeometry,0booths+0knownM4candidates; wholezero onlywithnoothermissingproducts, preserveauditraw and avoidlatefallback/APIcontradictions. Focused adversarialtests+fullgate and6separatecasecheckpoints before accepting any0/FREE. If proofstillinsufficient, keep6unknown and continueZSDfirstcase dnr-гранитное-saint-petersburg-center. Parts19ongoing/20planned.

2026-10-16 13:58 MSK: # Short M4 positive proof review — DONE, source gate retained

16.10.2026 MSK. Parent ecd165c2aefb93f6331129f8a8da34ddcdab3021, working branch fix/v3-missing-route-prices-2026-10-15, draft PR14. Fresh clone calculator-resume matches remote parent; prior checkout no longer exists. Initial exec failed due missing working directory, retry in /tmp succeeded; no permission escalation needed. Latest parent PR workflow38884064919 completed/success; no active writer observed.

Read primary PDF pages3–4 with pdftotext -layout, existing fullway geometry evidence and API review. General rule applicability to M4 is explicit (definitions p3); section2.1 p4 states payment is triggered at a PVP and allows travel without crossing one. This supports the intended algorithm, but source record m4-355-receipt-rule-verified-2026-10-14.json explicitly has effectiveFrom:null and notes historical/current topology differences. No independently dated operator physical collection-scope record for these two exact ways is present; association to PVP1046 remains a search snippet previously rejected for scope proof. Valhalla completeness and an OSM map without booth tags are useful corroboration, not independent operator inventory completeness. Endpoint/direct-way matching cannot turn absence of map data into independent no-charge confirmation.

Decision: retain six source-gated unknowns; do not implement a route/way allowlist returning zero on this evidence alone. This is not a rejection of open collection or proof of a charge. Missing proof: current operator applicability/collection boundaries for the exact selected short segment (or equivalent independently confirmed control). Eight physical545 gates remain separate. No code/prices changed; no tests/build executed; historical687 remains historical. Raw/captures/REPORT preserved.

NEXT STARTED: ZSD first case dnr-гранитное-saint-petersburg-center, locate exact existing capture from corpus.json, restore frozen dependencies, offline replay15/17Oct09:00MSK, preserve raw and inspect missing ZSD scope. Do not rerun completed22 M4 or25 policy cases. Save each replay case before continuing. Parts19 ongoing/20 planned; no main/merge/Production/Android changes.

Checkpoint: ../../docs/checkpoints/2026-10-16-1358-short-m4-proof-review.md

16.10.2026 frozen dependencies DONE exit0/24.2s, lock unchanged; ZSD Granitnoe→SPB exact saved-capture two-profile replay STARTED. See ../../docs/checkpoints/2026-10-16-1401-zsd-dependencies-ready.md

16.10.2026 ZSD Granitnoe→SPB replay DONE2/2 complete; M4 now3810/4640, only ZSD missing; component sums are not totals. Samecase exactways/gates scope diagnosis STARTED. ../../docs/checkpoints/2026-10-16-1403-zsd-granitnoe-spb-replay.md

16.10.2026 ZSD Granitnoe→SPB physicalscope DONE: actual northbound PVP5 node933974870,26ways/12outside reviewedzone1, exitEkateringofka. Primaryzone prices exist; wholecollectionscope stillrequires binding. ../../docs/checkpoints/2026-10-16-1406-zsd-granitnoe-exact-scope.md NEXT samecase ownercash/cardscope, noalias/guessedtotal.

16.10.2026 ZSD case1 primaryrules review DONE; source-gatedfinishedscope, no600guess. NEXT STARTED case2 Bryanka→SPB twoofflineprofiles. ../../docs/checkpoints/2026-10-16-1410-zsd-primary-rule-scope-hold.md

16.10.2026 ZSDcase2 Bryanka→SPB DONE2/2 exit0/complete, same26ways/PVP5 ascase1, unknownZSDonly. NEXT case3 Lisichansk→SPB exactcapturetwoofflineprofiles. ../../docs/checkpoints/2026-10-16-1412-zsd-bryanka-spb-replay.md

2026-10-16T14:06:50.067788+03:00: ZSDcase3 lnr-лисичанск-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140650-zsd-case3.md. NEXT lnr-рубежное-saint-petersburg-center.

2026-10-16T14:07:37.609727+03:00: ZSDcase4 lnr-рубежное-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140737-zsd-case4.md. NEXT zaporizhzhia-гуляйполе-saint-petersburg-center.

2026-10-16T14:07:57.816486+03:00: ZSDcase5 zaporizhzhia-гуляйполе-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140757-zsd-case5.md. NEXT dnr-бахмут-saint-petersburg-center.

2026-10-16T14:08:18.519398+03:00: ZSDcase6 dnr-бахмут-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140818-zsd-case6.md. NEXT dnr-волноваха-saint-petersburg-center.

2026-10-16T14:08:39.298384+03:00: ZSDcase7 dnr-волноваха-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140839-zsd-case7.md. NEXT dnr-донецк-saint-petersburg-center.

2026-10-16T14:08:59.138428+03:00: ZSDcase8 dnr-донецк-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140859-zsd-case8.md. NEXT lnr-алчевск-saint-petersburg-center.

2026-10-16T14:09:19.598530+03:00: ZSDcase9 lnr-алчевск-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140919-zsd-case9.md. NEXT lnr-антрацит-saint-petersburg-center.

2026-10-16T14:09:40.512335+03:00: ZSDcase10 lnr-антрацит-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-140940-zsd-case10.md. NEXT lnr-довжанск-saint-petersburg-center.

2026-10-16T14:10:00.457425+03:00: ZSDcase11 lnr-довжанск-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-141000-zsd-case11.md. NEXT lnr-марковка-saint-petersburg-center.

2026-10-16T14:10:21.676416+03:00: ZSDcase12 lnr-марковка-saint-petersburg-center DONE2/2 exit0/complete, source_gated_same_exact_way_set, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-141021-zsd-case12.md. NEXT max-chain-m12-ckad-m11-zsd-arzamas-to-prim.

2026-10-16T14:10:40.127312+03:00: ZSDcase13 max-chain-m12-ckad-m11-zsd-arzamas-to-prim DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['ckad', 'm11-15-58', 'unknown-paid-road', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-141040-zsd-case13.md. NEXT max-chain-m12-ckad-m11-zsd-kazan-to-sest.

16.10.2026 primaryproof DONE: unnamednode1766158781 belongsZSD via4directedways, all in selectedcase13ledger; fixexactidentity STARTED, nofarechange. ../../docs/checkpoints/2026-10-16-zsd-planernaya-identity-proof.md Plan90%18/20. NEXT source/adversarialregression thenfocused/fullgate/samecasereplay.

16.10.2026 Planernayaexactidentity CODE DONE/fourregressionsadded, NOTtested; NEXT focusedtests/lint thenfullgate/samecase. ../../docs/checkpoints/2026-10-16-zsd-planernaya-identity-code.md Plan90%.

16.10.2026 Planernayafocused8/8PASS/eslintnewtestexit0; fullgateSTARTED npm run build -- --webpack. ../../docs/checkpoints/2026-10-16-zsd-planernaya-focused-pass.md Plan90%.

16.10.2026 Planernayafullgate DONE exit0:691/691+quote/API+Nextwebpack/TS/static16/16PASS. NEXT correctedcase13twoofflineprofiles. ../../docs/checkpoints/2026-10-16-zsd-planernaya-fullgate-pass.md Overallplan90%18/20.

16.10.2026 ZSD1766158781identityfix validated withcorrectedcase13pair: redundantunknownroadgone, M11head/CKAD/ZSD stillblocknulltotal. 691fullgatePASS/8focusedPASS. Rawfullgatelog CR bytepreservation recovery included; requireexacttree. ../../docs/checkpoints/2026-10-16-zsd-planernaya-corrected-replay.md NEXT case14Kazan→Sestroretsk; plan90%18/20.

2026-10-16T14:19:34.491002+03:00: ZSDcase14 max-chain-m12-ckad-m11-zsd-kazan-to-sest DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['ckad', 'm11-15-58', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-141934-zsd-case14.md. NEXT max-chain-m12-ckad-m11-zsd-murom-to-sest.

16.10.2026 ZSDcase14 scopeDONE:76ways/two namedPvP/south→northKAD, no newidentitybug, sourcegate retained. Latest691fullgatePASS supersedes stale687template. ../../docs/checkpoints/2026-10-16-zsd-kazan-sestroretsk-scope.md NEXTcase15Murom→Sestroretsk; plan90%.

2026-10-16T14:21:32.369652+03:00: ZSDcase15 max-chain-m12-ckad-m11-zsd-murom-to-sest DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['ckad', 'm11-15-58', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142132-zsd-case15.md. NEXT max-chain-m12-ckad-m11-zsd-sest-to-kazan.

2026-10-16T14:22:04.923099+03:00: ZSDcase16 max-chain-m12-ckad-m11-zsd-sest-to-kazan DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['ckad', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142204-zsd-case16.md. NEXT max-chain-m12-ckad-m11-zsd-sest-to-murom.

16.10.2026 ZSDcase16 distinctscopeDONE: 67ways/54outside reviewedzone1, actualguardrefusal consistent, no fareguess/runtimefix. ../../docs/checkpoints/2026-10-16-142324-zsd-case16-scope.md NEXTmax-chain-m12-ckad-m11-zsd-sest-to-murom; plan90%, latest691gatePASS.

2026-10-16T14:24:14.117035+03:00: ZSDcase17 max-chain-m12-ckad-m11-zsd-sest-to-murom DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['ckad', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142414-zsd-case17.md. NEXT max-chain-m4-ckad-m11-zsd-krasnodar-to-sest.

2026-10-16T14:24:35.248947+03:00: ZSDcase18 max-chain-m4-ckad-m11-zsd-krasnodar-to-sest DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142435-zsd-case18.md. NEXT max-chain-m4-ckad-m11-zsd-rostov-to-sest.

16.10.2026 ZSDcase18 distinctscopeDONE: 76ways/62outside reviewedzone1, actualguardrefusal consistent, no fareguess/runtimefix. ../../docs/checkpoints/2026-10-16-142453-zsd-case18-scope.md NEXTmax-chain-m4-ckad-m11-zsd-rostov-to-sest; plan90%, latest691gatePASS.

2026-10-16T14:25:11.185285+03:00: ZSDcase19 max-chain-m4-ckad-m11-zsd-rostov-to-sest DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142511-zsd-case19.md. NEXT max-chain-m4-ckad-m11-zsd-sest-to-krasnodar.

2026-10-16T14:25:33.114822+03:00: ZSDcase20 max-chain-m4-ckad-m11-zsd-sest-to-krasnodar DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142533-zsd-case20.md. NEXT max-chain-m4-ckad-m11-zsd-sest-to-rostov.

16.10.2026 ZSDcase20 distinctscopeDONE: 67ways/54outside reviewedzone1, actualguardrefusal consistent, no fareguess/runtimefix. ../../docs/checkpoints/2026-10-16-142551-zsd-case20-scope.md NEXTmax-chain-m4-ckad-m11-zsd-sest-to-rostov; plan90%, latest691gatePASS.

2026-10-16T14:26:11.986552+03:00: ZSDcase21 max-chain-m4-ckad-m11-zsd-sest-to-rostov DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142611-zsd-case21.md. NEXT max-chain-m4-ckad-m11-zsd-voronezh-to-prim.

2026-10-16T14:26:33.677215+03:00: ZSDcase22 max-chain-m4-ckad-m11-zsd-voronezh-to-prim DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142633-zsd-case22.md. NEXT pair-m11-ckad-domodedovo-to-spb.

2026-10-16T14:26:54.350882+03:00: ZSDcase23 pair-m11-ckad-domodedovo-to-spb DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142654-zsd-case23.md. NEXT pair-m11-ckad-noginsk-to-spb.

2026-10-16T14:27:12.414460+03:00: ZSDcase24 pair-m11-ckad-noginsk-to-spb DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['ckad', 'm11-15-58', 'zsd']; sameexactscope=True. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142712-zsd-case24.md. NEXT pair-m11-ckad-spb-to-domodedovo.

2026-10-16T14:27:33.618941+03:00: ZSDcase25 pair-m11-ckad-spb-to-domodedovo DONE2/2 exit0/complete, current_unknown_needs_distinct_scope_review, missing['unknown-paid-road', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142733-zsd-case25.md. NEXT pair-m11-ckad-spb-to-noginsk.

16.10.2026 ZSDcase25 distinctscopeDONE: 38ways/25outside reviewedzone1, actualguardrefusal consistent, no fareguess/runtimefix. ../../docs/checkpoints/2026-10-16-142752-zsd-case25-scope.md NEXTpair-m11-ckad-spb-to-noginsk; plan90%, latest691gatePASS.

2026-10-16T14:28:10.896352+03:00: ZSDcase26 pair-m11-ckad-spb-to-noginsk DONE2/2 exit0/complete, source_gated_same_reviewed_zsd_scope, missing['ckad', 'zsd']; sameexactscope=False. Plan progress90% (18/20, notfarecoverage). Checkpoint ../../docs/checkpoints/2026-10-16-142810-zsd-case26.md. NEXT pair-m11-zsd-moscow-to-prim.

2026-10-16T14:30:02.393729+03:00: ZSD26/76 individuallydurable; thisblock13additionalcases, sourcegateskept, no runtimechange/newfullgate. Overallplan90%18/20. Existingauto enabled/readbackconfirmed; promptonlyupdatedwithpercentinstruction/scheduleunchanged. Checkpoint ../../docs/checkpoints/2026-10-16-zsd-26case-handoff-and-auto-reporting.md. NEXTcase27pair-m11-zsd-moscow-to-prim.

16.10.2026 16:54MSK scratch-pruning recovery DONE, exactclonehead/tree verified; no routeprogress lost. NEXT frozen dependencies/repository-owned ZSDsinglecaseutility, then case27. ../../docs/checkpoints/2026-10-16-1654-resume-after-scratch-pruning.md Plan90%.
# 2026-10-16 16:54 МСК — case 27 replay: FAILED import path

Первый offline replay `pair-m11-zsd-moscow-to-prim` не запустился: ошибочно указан `./experiments/nationwide-tolls/scripts/register-ts-paths.mjs`, фактический import — `./scripts/register-ts-paths.mjs`. Exit 1 до чтения capture; результаты и тарифная логика не менялись. См. `../../docs/checkpoints/2026-10-16-1654-zsd-case27-replay-failed-import.md`. Следом повторить тот же case с исправленным import. План 90% (18/20), ZSD review 26/76.

16.10.2026 frozen dependencies restored exit0/15.7s, lockunchanged; NEXT repository-owned ZSD review utility. ../../docs/checkpoints/2026-10-16-1656-frozen-dependencies-restored.md No newtest/build/route; plan90%.

16.10.2026 ZSD repository-owned singlecase utility CODE DONE, fourintegrity/adversarial tests added; syntaxchecks passed, focused/fullgate NOTyet run. ../../docs/checkpoints/2026-10-16-zsd-repository-runner-code.md NEXT focusedchecks, fullgate, case27. Plan90%.

16.10.2026 ZSDdurablerunnerfocused4/4PASS/lint2filesexit0, rulesreread peruser17:11; NEXTfullgate then automaticcase27. ../../docs/checkpoints/2026-10-16-zsd-runner-focused-pass.md Plan90%.

16.10.2026 current-chat resume: rules/20parts reread, exact remote tree matched in own checkout. Plan90%. NEXT fullgate then case27. docs/checkpoints/2026-10-16-continue-current-chat.md

16.10.2026 fullgate DONE exit0:695/695, quote/API, webpack/TS/static16/16 PASS. Raw log preserved. NEXT case27 --next. Plan90%. docs/checkpoints/2026-10-16-current-chat-fullgate-pass.md

16.10.2026 runnerpreflight FAILED before replay: untracked dependency symlink, localexclude repaired. No caseprogress. NEXT retrycase27. Plan90%. docs/checkpoints/2026-10-16-zsd-preflight-symlink-recovery.md

2026-10-16T14:20:22.672Z: ZSD case27 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-20-22-671Z.md). NEXT ZSD nextcase pair-m11-zsd-moscow-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T14:21:01.822Z: ZSD case28 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-21-01-821Z.md). NEXT ZSD nextcase pair-m11-zsd-prim-to-moscow; --next; savedcapture twoofflineprofiles.

2026-10-16T14:21:34.192Z: ZSD case29 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-21-34-191Z.md). NEXT Diagnose current ZSD scope using --diagnose before the nextcase.

2026-10-16T14:22:03.311Z: ZSD distinct scope diagnosis DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-22-03-311Z.md). NEXT ZSD nextcase pair-m11-zsd-sest-to-moscow; --next; savedcapture twoofflineprofiles.

2026-10-16T14:22:40.283Z: ZSD case30 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-22-40-282Z.md). NEXT ZSD nextcase pair-m11-zsd-tver-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T14:23:16.596Z: ZSD case31 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-23-16-595Z.md). NEXT ZSD nextcase pair-m4-m11-voronezh-to-spb; --next; savedcapture twoofflineprofiles.

2026-10-16T14:23:47.962Z: ZSD case32 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-23-47-961Z.md). NEXT ZSD nextcase single-m11-moscow-to-spb; --next; savedcapture twoofflineprofiles.

2026-10-16T14:24:19.601Z: ZSD case33 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-24-19-601Z.md). NEXT ZSD nextcase single-m11-spb-to-moscow; --next; savedcapture twoofflineprofiles.

2026-10-16T14:24:53.591Z: ZSD case34 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-24-53-591Z.md). NEXT ZSD nextcase single-zsd-blag-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T14:25:27.773Z: ZSD case35 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-25-27-773Z.md). NEXT Diagnose current ZSD scope using --diagnose before the nextcase.

16.10.2026 case35 diagnosis FAILED optionalmaneuvers absent; runnerfix+regression CODE DONE, untested. NEXT focused/fullgate then retrydiagnose. Plan90%. docs/checkpoints/2026-10-16-zsd-geometry-only-diagnosis-fix.md

16.10.2026 geometry-only focused5/5PASS+eslint exit0. NEXT fullgate then case35diagnosis. Plan90%. docs/checkpoints/2026-10-16-zsd-geometry-focused-pass.md

16.10.2026 geometry-only fullgate exit0:696/696+quote/API+webpack/TS/static16/16PASS. NEXT case35 --diagnose. Plan90%. docs/checkpoints/2026-10-16-zsd-geometry-fullgate-pass.md

2026-10-16T14:28:34.645Z: ZSD distinct scope diagnosis DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-28-34-645Z.md). NEXT ZSD nextcase single-zsd-pushkin-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T14:29:07.615Z: ZSD case36 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-29-07-614Z.md). NEXT ZSD nextcase single-zsd-sest-to-pushkin; --next; savedcapture twoofflineprofiles.

2026-10-16T14:29:41.096Z: ZSD case37 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-29-41-095Z.md). NEXT ZSD nextcase triple-m11-ckad-m12-kazan-to-spb; --next; savedcapture twoofflineprofiles.

2026-10-16T14:30:11.880Z: ZSD case38 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-30-11-879Z.md). NEXT ZSD nextcase triple-m11-ckad-m12-spb-to-kazan; --next; savedcapture twoofflineprofiles.

2026-10-16T14:30:45.809Z: ZSD case39 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-30-45-808Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-krasnodar-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T14:31:19.288Z: ZSD case40 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-31-19-287Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-rostov-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T14:31:51.979Z: ZSD case41 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-31-51-978Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-sest-to-krasnodar; --next; savedcapture twoofflineprofiles.

2026-10-16T14:32:29.470Z: ZSD case42 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-32-29-470Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-sest-to-rostov; --next; savedcapture twoofflineprofiles.

2026-10-16T14:33:00.908Z: ZSD case43 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-33-00-907Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-voronezh-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T14:33:32.505Z: ZSD case44 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-33-32-503Z.md). NEXT ZSD nextcase dnr-краматорск-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:34:04.922Z: ZSD case45 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-34-04-922Z.md). NEXT ZSD nextcase dnr-талаковка-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

16.10.2026 case45 exacttree durable after Cyrillic path transfer recovery; raw retained/no rerun. NEXTcase46. Plan90%. docs/checkpoints/2026-10-16-zsd-cyrillic-path-persist-recovery.md

2026-10-16T14:35:29.499Z: ZSD case46 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-35-29-498Z.md). NEXT ZSD nextcase dnr-харцызск-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:36:02.345Z: ZSD case47 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-36-02-342Z.md). NEXT ZSD nextcase lnr-ровеньки-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:36:42.146Z: ZSD case48 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-36-42-146Z.md). NEXT ZSD nextcase lnr-сорокино-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:37:13.168Z: ZSD case49 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-37-13-167Z.md). NEXT ZSD nextcase lnr-старобельск-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:37:50.457Z: ZSD case50 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-37-50-456Z.md). NEXT ZSD nextcase zaporizhzhia-розовка-saint-petersburg-center; --next; savedcapture twoofflineprofiles.

2026-10-16T14:38:28.073Z: ZSD case51 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-38-28-073Z.md). NEXT ZSD nextcase max-chain-m12-ckad-m11-zsd-cheboksary-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T14:54:09.670Z: ZSD case52 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-54-09-669Z.md). NEXT ZSD nextcase max-chain-m12-ckad-m11-zsd-prim-to-arzamas; --next; savedcapture twoofflineprofiles.

2026-10-16T14:55:21.353Z: ZSD case53 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-55-21-353Z.md). NEXT ZSD nextcase max-chain-m12-ckad-m11-zsd-prim-to-cheboksary; --next; savedcapture twoofflineprofiles.

2026-10-16T14:56:23.108Z: ZSD case54 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T14-56-23-107Z.md). NEXT ZSD nextcase max-chain-m12-ckad-m11-zsd-sest-to-vladimir; --next; savedcapture twoofflineprofiles.
2026-10-16T18:43:00+03:00: восстановлен отдельный checkout и зависимости после очистки временной среды; `pnpm install --frozen-lockfile` exit0, 504 policy entries, 429 packages. Исходники/lockfile без изменений. [Checkpoint](../../docs/checkpoints/2026-10-16-1843-dependencies-restored.md). NEXT ZSD case55. Plan90% (18/20), ZSD54/76.

2026-10-16T15:43:19.349Z: ZSD case55 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T15-43-19-348Z.md). NEXT ZSD nextcase max-chain-m12-ckad-m11-zsd-vladimir-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T15:44:20.992Z: ZSD case56 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T15-44-20-991Z.md). NEXT ZSD nextcase max-chain-m4-ckad-m11-zsd-krasnodar-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T16:51:08.178Z: ZSD case57 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-51-08-177Z.md). NEXT ZSD nextcase max-chain-m4-ckad-m11-zsd-prim-to-voronezh; --next; savedcapture twoofflineprofiles.

2026-10-16T16:52:00.109Z: ZSD case58 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-52-00-108Z.md). NEXT ZSD nextcase max-chain-m4-ckad-m11-zsd-rostov-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T16:53:50.520Z: ZSD case59 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-53-50-519Z.md). NEXT ZSD nextcase pair-m11-zsd-novgorod-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T16:55:29.263Z: ZSD case60 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-55-29-262Z.md). NEXT ZSD nextcase pair-m11-zsd-prim-to-torzhok; --next; savedcapture twoofflineprofiles.

2026-10-16T16:56:47.020Z: ZSD case61 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-56-47-019Z.md). NEXT ZSD nextcase pair-m11-zsd-sest-to-novgorod; --next; savedcapture twoofflineprofiles.

2026-10-16T16:58:56.541Z: ZSD case62 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T16-58-56-537Z.md). NEXT ZSD nextcase pair-m11-zsd-sest-to-tver; --next; savedcapture twoofflineprofiles.

2026-10-16T17:00:04.181Z: ZSD case63 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-00-04-180Z.md). NEXT ZSD nextcase pair-m11-zsd-torzhok-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T17:01:23.089Z: ZSD case64 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-01-23-087Z.md). NEXT ZSD nextcase pair-m4-m11-spb-to-voronezh; --next; savedcapture twoofflineprofiles.

2026-10-16T17:02:36.458Z: ZSD case65 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-02-36-457Z.md). NEXT ZSD nextcase single-m11-spb-to-tver; --next; savedcapture twoofflineprofiles.

2026-10-16T17:03:59.021Z: ZSD case66 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-03-59-020Z.md). NEXT ZSD nextcase single-m11-tver-to-spb; --next; savedcapture twoofflineprofiles.

2026-10-16T17:05:06.763Z: ZSD case67 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-05-06-762Z.md). NEXT ZSD nextcase single-zsd-blag-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T17:06:19.284Z: ZSD case68 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-06-19-283Z.md). NEXT Diagnose current ZSD scope using --diagnose before the nextcase.

2026-10-16T17:07:20.803Z: ZSD distinct scope diagnosis DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-07-20-801Z.md). NEXT ZSD nextcase single-zsd-peterhof-to-prim; --next; savedcapture twoofflineprofiles.
## 2026-10-16 — ZSD case 68 persistence recovery

The case 68 scope diagnosis checkpoint remained intact, but the first GitHub connector upload of its seven-file local commit did not preserve three oversized append-only files. PR14 advanced to `1a215cc1dbd97f834b1c1c19ce2532d783c38df9`; GitHub tree `35eecba59e1faac4613a4ce0a48a8188464af065` differed from local `30d25946739467c909269b84b30c89f19b03fc53`. Mismatched local/remote blob SHAs are recorded in [the repair checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-12-02-000Z-tree-readback-repair.md). The shell base64 output had been silently truncated before connector upload; do not treat such uploads as complete based only on successful API responses.

Recovery is the only current action: transfer full exact `NEXT_STEPS.md`, `PART19_FINDINGS_QUEUE.json`, and `WORK_LOG.md` blob data in bounded pieces, create a non-force fast-forward commit based on the currently verified PR14 head, then confirm exact local tree and path blob SHAs by Git fetch/readback. The case 68 diagnostic remains “selected trace extends beyond zone 1; 57 unreviewed ways”; no tariff decision or runtime change. No full test/build was run. Plan remains 90% (18/20). Case 69 must not start before repair verification.

2026-10-16T17:14:47Z: Recovery DONE. Large files were transported as bounded base64 slices; the returned GitHub blob SHA for each matched the exact local Git blob before tree creation. New PR14 head `c2e744d030b9a6f1c3cbc3ed5ac20674458dbb67` fetches tree `433ea764ea17d4f5cd4b41a37e2b59902a31586a`, equal to local companion commit tree. All seven path SHAs matched and working tree was clean. The incomplete checkpoint snapshot at `1a215cc...` is superseded; no force update used. Audit finding remains no tariff inference. [DONE checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-14-47-000Z-tree-readback-repair-done.md). NEXT case69 saved-capture/two-profile replay.

2026-10-16T17:16:56.121Z: ZSD case69 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-16-56-120Z.md). NEXT Diagnose current ZSD scope using --diagnose before the nextcase.

2026-10-16T17:19:29.899Z: ZSD distinct scope diagnosis DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-19-29-896Z.md). NEXT ZSD nextcase single-zsd-sest-to-blag; --next; savedcapture twoofflineprofiles.

2026-10-16T17:21:33.811Z: ZSD case70 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-21-33-810Z.md). NEXT Diagnose current ZSD scope using --diagnose before the nextcase.

2026-10-16T17:23:39.495Z: ZSD distinct scope diagnosis DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-23-39-494Z.md). NEXT ZSD nextcase triple-m11-ckad-m12-arzamas-to-spb; --next; savedcapture twoofflineprofiles.

2026-10-16T17:25:46.942Z: ZSD case71 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-25-46-940Z.md). NEXT ZSD nextcase triple-m11-ckad-m12-spb-to-arzamas; --next; savedcapture twoofflineprofiles.

2026-10-16T17:28:40.815Z: ZSD case72 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-28-40-814Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-domodedovo-to-sest; --next; savedcapture twoofflineprofiles.

2026-10-16T17:31:01.437Z: ZSD case73 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-31-01-435Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-krasnodar-to-prim; --next; savedcapture twoofflineprofiles.

2026-10-16T17:35:07.405Z: ZSD case74 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-35-07-404Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-prim-to-voronezh; --next; savedcapture twoofflineprofiles.

2026-10-16T17:36:52.511Z: ZSD case75 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-36-52-510Z.md). NEXT ZSD nextcase triple-m4-m11-zsd-sest-to-domodedovo; --next; savedcapture twoofflineprofiles.

2026-10-16T17:39:01.255Z: ZSD case76 replay DONE; plan90% (18/20). [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-39-01-254Z.md). NEXT ZSD class reviewed; assess remaining finding classes, do not mark part19 complete.
## 2026-10-16 — ZSD queue finding classification

After case76, all 76 ZSD saved-capture cases were replayed in both departure-date profiles with complete integrity. The recorded finding has been reclassified from `needs_diagnosis` to `source_gated_collection_span_unbound`: source evidence does not bind the operator’s finished collection span, so the tool’s fail-closed unknown remains appropriate. This classifies the current evidence; it does not fix runtime code, confirm a toll, or claim a free route. See [checkpoint](../../docs/checkpoints/2026-10-16-zsd-classification-76-cases.md) and exact count evidence `docs/checkpoints/evidence/2026-10-16-zsd-queue-classification.json`.

Audit distribution: 53 same reviewed scope, 9 distinct finished-scope cases, 11 exact-way-set matches, plus three distinct source/identity classes; missing-component case counts are preserved in the evidence JSON. Case counts are reproduction coverage, not fare coverage. No runtime tests/full build were run. Overall 18/20 parts =90%; Part19 remains in progress. NEXT: assess `m4:unpriced` from its 22 saved evaluations, one finding only.

2026-10-16T17:48:58Z: Part19 finding `m4:unpriced` classified from all22 saved evaluations; grouped results 5 whole-route estimates without operator confirmation, 3 M4 components with other products unknown, 8 physical545 unresolved, 6 short/open-collection unresolved. Exact M4 finished collection scope remains unbound; general open-collection rule has no effectiveFrom in the saved M4 record. Preserved unknown; no price/zero/free inference. Runtime unchanged, no tests/build run. Evidence: [checkpoint](../../docs/checkpoints/2026-10-16-part19-m4-unpriced-classification.md), [grouped evidence](../../docs/checkpoints/evidence/2026-10-16-m4-22-case-classification.json). NEXT inspect `m11_partial_head_entry_boundary_unresolved` saved evidence only; one finding at a time. Plan90% (18/20), not fare coverage.

2026-10-16T17:55:31Z: STARTED diagnosis of Part19 finding `m11_partial_head_entry_boundary_unresolved`, first saved case `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`. Input capture SHA, baseline occurrences and paired-profile replay paths are recorded in [STARTED checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-head-boundary-started.md). Next inspect selected paid-edge entry sequence against exact primary M11 payment boundary; unknown remains until proven. No new live call, price/code change, or test/build. Plan90% (18/20), not fare coverage.

2026-10-16T18:01:25Z: M11 boundary case1 `max-chain-m12-ckad-m11-zsd-arzamas-to-prim` DONE/source-gated. Complete 9/9 captured trace; two complete offline date-profile replays retain unknown M11 15–58, CKAD and ZSD. Selected route does not contain the operator-identity-linked MMK north gate ways, and nearest gate nodes exceed the existing 25m directional crossing rule; Moscow PVP21 spatial anchor is explicitly unresolved in the saved primary-source evidence. No threshold widening or price/zero inference. Evidence checkpoint `../../docs/checkpoints/2026-10-16-part19-m11-case1-boundary-source-gated.md`. Next only case2. Overall plan90% (18/20), not tariff coverage.

2026-10-16T18:06:04Z: STARTED case2 `max-chain-m12-ckad-m11-zsd-kazan-to-sest` for Part19 M11 head-boundary finding. Saved capture and live/offline paired profile SHA-256 values are fixed in [checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case2-boundary-started.md) and [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case2-boundary-inputs.json). Current saved results show complete trace but keep M11 15–58 null, alongside unknown CKAD/ZSD; not a whole fare. Compare exact selected paid-edge sequence with the primary M11 boundary proof; no new live request, code/fare change, or test/build. Completed review count remains 1/8. Overall agreed plan90% (18/20), not tariff confirmation.

2026-10-16T18:08:14Z: M11 boundary case2 `max-chain-m12-ckad-m11-zsd-kazan-to-sest` DONE/source-gated. Complete 1,558,165m trace and 15/17 Oct paired outputs remain reproducible; selected trace lacks the two operator-identity-linked directed gate ways and nearest gate nodes are outside the existing 25m match threshold (26.5m/41.8m); stored Moscow PVP21 anchor remains unresolved. Preserve M11 15–58 unknown; CKAD and ZSD remain unknown, so no whole fare or subtotal claim. No runtime/fare change or tests/build. Evidence: [checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case2-boundary-source-gated.md), [review JSON](../../docs/checkpoints/evidence/2026-10-16-m11-case2-boundary-review.json). Two of eight finding cases reviewed; overall plan90% (18/20), not tariff coverage. NEXT case3 `max-chain-m12-ckad-m11-zsd-murom-to-sest`.

2026-10-16T18:53:27Z: User decision21:51MSK recorded as binding [WORKFLOW_RULES](../../docs/WORKFLOW_RULES.md) and AGENTS/CHECKPOINT_PROTOCOL clarification. Root cause/user impact determines finding review; repeated cases get bounded exception checks; four final cause outcomes are explicit; unfinished assessment stays operational IN_PROGRESS. Full logs/raw stay out of context, short offline review uses one completed checkpoint, required code gates and remote readback remain. Formal90%=18/20 belongs to both155/154 audit batches and is separate from wider calculator/matrix completion, actual checks and tariff confirmation. Existing continuation automation prompt update returned success; cadence/enabled state preserved. Source cf97c6e4aaf2220655c17a8978e89c4b0f587e62/treefb2d2a0e5ad7d18df2cae25d3e17413c8a8a2872, PR14open/draft, CI38947789852 verify/live_probe completed/success. A clean detached checkout was created from that source without touching the divergent old checkout. Git CLI auth diagnostic: no helper/gh/standard GitHub credentials found; push --dry-run exit128 `fatal: unable to get password from user`; no secret emitted or requested. Connector auth cannot be exported through available tools, so CLI setup remains BLOCKED_BY_ENVIRONMENT_AUTH, authorized connector remains usable. Docs/JSON/link/diff checks before commit; no runtime/fare/source capture changes, no new route replay/live/full build. NEXT murom-to-sest exception check only after durable save/readback and checking absence of active writer. [Checkpoint](../../docs/checkpoints/2026-10-16-215327-workflow-efficiency-rules.md).


2026-10-16T19:39:58Z: Part19 M11 boundary case3 `max-chain-m12-ckad-m11-zsd-murom-to-sest` checked against saved evidence. Complete 8/8 trace; live + same-date replay + weekend replay match capture and remain unknown for M11 15–58/CKAD/ZSD. Directed gate ways absent; nearest nodes 26.5m/41.8m >25m; PVP21 spatial anchor remains unresolved. Same source-gated cause, no material exception. No new live/capture/code/tariff/test. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case3-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case3-boundary-review.json). M11 cause reviewed3/8; next pair-M11 CKAD Noginsk→SPb bounded check. Formal plan18/20=90%, not tariff coverage.

2026-10-16T20:00:50.463Z: Part19 M11 boundary case4 `pair-m11-ckad-noginsk-to-spb` reviewed from saved capture/profiles. Complete 6/6 trace; live + same-capture weekday/weekend profiles match; directed MMK gate ways absent and approximate nearest-node distances 26.61m/41.98m exceed 25m; no material exception, same boundary-source blocker. Unknown M11 15–58/CKAD/ZSD preserved; no new live/code/tariff/tests. Valhalla candidate 25,413s vs OSRM 32,301s is consistent with fastest-route-only rule. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case4-boundary-review.json). M11 cause reviewed4/8; next triple-M11/CKAD/M12 Kazan→SPb. Formal plan18/20=90%, not tariff coverage.

2026-10-16T20:19:47Z: Part19 M11 boundary case5 `triple-m11-ckad-m12-kazan-to-spb` reviewed against saved capture and profiles only. Complete 11/11 trace/2,106 edges; live + same-date and weekend replay all bind capture SHA-256 b4e49dba…cafe00. Directed MMK gate ways absent; approximate nearest gate-node distances 26.47m/41.76m exceed 25m. Fastest saved route remains Valhalla 61,507s vs OSRM 70,869s. No material exception to M11 boundary blocker; CKAD east arc and ZSD scope remain separate route unknowns; route amount null. No new live/code/tests/tariff confirmation. Check 5/8; formal plan 18/20=90%. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case5-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case5-boundary-review.json). Next: case6.

2026-10-16T20:39:00Z: Part19 M11 boundary case6 `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim` reviewed from saved capture/live/replay only. Complete 10/10 trace, 2,766 edges; five complete profiles bind capture SHA ce2577c8…b1f6fdcf. All preserve route 1,380,434m/53,656s and fastest-only Valhalla (OSRM 64,253s). M11 directed gate ways absent; nearest gate nodes approx 26.47m/41.76m >25m. Earlier live/replays showed redundant unknown-paid-road, later same-capture weekday/weekend replay added exact selected-trace ZSD node 1766158781 and removed that label; this is consistent with previously source-validated ZSD identity fix, but ZSD zone/fare remains unknown. M12 expected traversal and CKAD east arc remain unproven. No new live/code/tests/price. M11 cause outcome blocked by missing reliable data; case count6/8. Formal plan18/20=90%. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case6-boundary-exception.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case6-boundary-exception.json). Next: case7.

2026-10-16T21:16:00Z: Part19 M11 boundary case7 `max-chain-m12-ckad-m11-zsd-vladimir-to-sest` reviewed from saved capture/live/replays. Complete 7/7 trace, 1,690 edges; 3 unique profiles bind capture SHA 5e895d67…f52eb6f and preserve 921,380m/31,886s. Valhalla remains fastest vs OSRM 40,158s. Directed M11 gate ways absent; approximate nearest gate-node distances 26.47m/41.76m >25m. No material M11 exception. Expected M12 traversal not proven; CKAD east arc and ZSD beyond reviewed zone1 remain unresolved; route total null. No new live/code/tests. Cause exception check7/8; formal plan18/20=90%. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-case7-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-17-m11-case7-boundary-source-gated.json). Next: case8.


2026-10-16T22:45:16Z: Part19 M11 boundary case8 `triple-m11-ckad-m12-arzamas-to-spb` reviewed from saved evidence only at parent 5cb2b80a0b69202af606badaf226b0fb5642feb4. Capture blob b95d07d9…264f0936658d55f4 / SHA-256 b47f5207…91ea61b; live, same-date and weekend profiles reduce to 3 unique blob SHAs, all capture-bound and preserving Valhalla fastest route 1,149,643m/43,716s (OSRM 51,485s). Expected M11/CKAD/M12 traversals represented; M11 15–58 reason remains `m11_partial_head_entry_boundary_unresolved`, CKAD east arc and ZSD beyond reviewed zone1 unresolved. Full toll amount null; component matrix outputs do not establish total fare. No material exception; cause outcome blocked by missing reliable data. No new live/replay/code/tests/tariff confirmation. M11 exception checks complete 8/8. Formal plan18/20=90%, not tariff coverage. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-case8-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-17-m11-case8-boundary-source-gated.json). NEXT: Part19 cross-cause synthesis and Part20 required gates/handoff.


2026-10-16T23:31:29Z: Part19 state reconciliation found stale M11 metadata in `PART19_FINDINGS_QUEUE.json` (4/8 checked/five pending) despite saved case5–8 checkpoints. Updated M11 to 8/8, outcome blocked by missing reliable data, linked all eight reviews and preserved prior state in `statusHistory`; no result/evidence history deleted. PR14 open draft at 3e61db433146a9449576c6c7c51073992d96be28; CI #38977636786 completed/success; no active jobs. Updated short handoff and next priority. No live/replay/code/tests/tariff claims. Next cause is `unknown-paid-road:unpriced` (baseline64), compare case overlap with `expected-road-not-proven` before treating counts as affected routes. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-ledger-reconciliation.md); [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-m11-ledger-reconciliation.json).

2026-10-17T00:15:54Z: Part19 `unknown-paid-road:unpriced` aggregate classified DEFERRED after inspecting its 64 saved queue IDs and current route composer. Overlap: 41 with `m11-58-679:unpriced`, 15 with `m11_58_679_facility_sequence_incomplete` (contained in that M11 subset), 19 with `expected-road-not-proven`; counts overlap, not unique routes. Composer source lines 58–59 excludes the unknown aggregate from valid priced components; lines 71–77 preserve status unknown/tolls null if unresolved. This is intentional fail-closed behavior, not a confirmed bug or price. Actual current route/profile checks 0; no live/replay/code/tests. Parent run #38981909036: verify/live_probe completed success; branch was quiet at write preflight. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-unknown-paid-road-aggregate-deferred.md); [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-unknown-paid-road-aggregate-deferred.json). NEXT narrower cause: `m11_58_679_facility_sequence_incomplete` (baseline15), inspect saved evidence only for material distinctions.

## 2026-10-17 — Part19 M11 facility-sequence finding blocked

Reviewed `m11_58_679_facility_sequence_incomplete`: 15 route cases, 30 saved weekday/weekend profiles. All profiles have complete trace/replay integrity, the same capture SHA per pair, the same selected fastest provider, and the same incomplete facility-sequence reason; amounts remain null/unconfirmed. Official inventory lists 21 PVP IDs without coordinates; spatial anchors bind only p58/p593/p679. Outcome: **blocked by missing reliable data**, not an established code defect. Unknown/null preserved; no fare or full trip total inferred. No live/replay/build/tests. Next: inspect only the 26 IDs in `m11-58-679:unpriced` not among these 15. Formal progress 18/20=90%, unchanged.

[Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-facility-sequence-blocked.md) · [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-m11-facility-sequence-blocked.json)

## 2026-10-17 — Part19 M11 58–679 cause blocked

Reviewed the 26 residual IDs outside the previously reviewed facility-sequence 15. Inspected 74 replay-file entries but deduplicated to 52 unique weekday/weekend profiles; all 26 cases have one profile per date. All 52 have complete trace/replay integrity, select the fastest provider, show `only_one_verified_boundary_crossing`, and keep M11 amount null/unconfirmed. Official tariff inventory has 21 points with no coordinates; spatial controls cover p58/p593/p679 only; resolver requires two independent crossings. Outcome: **blocked by missing reliable data**, not a proven defect. Separate CKAD/ZSD/unnamed-booth blockers remain distinct and known M4/M12 components remain partial. Combined finding: 41 cases / 82 unique profiles. No live/replay/build/tests. NEXT: `arc_not_proven`, baseline34, saved evidence/exceptions only. Formal progress 18/20=90%.

[Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-58-679-blocked.md) · [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-m11-58-679-blocked.json)


## 2026-10-17T06:32:46 — Part19 CKAD east-arc cause blocked

Reviewed historical `arc_not_proven` from the frozen audit report at source head `6df92a4bf60ba64e0a3ac8ca2d5e856248de7c9b` / tree `dc4c2b12a326ab4316e364d2779d2d6c606c0869`. It contains 34 route cases, 102 occurrences, and 68 distinct weekday/weekend profiles. All 34 rows report evidence/raw/trace complete and same-date parity true; weekday/weekend amounts are null; selected provider is Valhalla. Every occurrence has `ckad_east_arc_not_proven`. All 102 unique live/replay evidence paths exist in the source tree (34 live, 68 replay). Broader road coverage says traversal proven in 22 cases and expected-road-not-proven in 12; neither establishes exact CKAD east-arc billing scope. Overlaps are non-additive (ZSD16, M11 head8, M11 58–67914, unknown-paid-road18, expected-road-not-proven12, M12 pair2). Outcome: **blocked by missing reliable data**, not a code fix or fare proof. No new live/replay/tests/builds; unknown/null preserved.

Also verified run #38994773498 succeeded on the source head but executed the non-fastest payment-point-avoiding Moscow–Krasnodar probe (step7) successfully, contrary to fastest-route-only scope. Removed that step and its artifact entry from `.github/workflows/special-territory-policy.yml`; the workflow triggered by this update must be observed before the next independent step.

Updated queue, AUTO_QUEUE_STATE, WORK_STATE, NEXT_STEPS and this append-only log. Formal plan 18/20=90%, not tariff coverage. [Checkpoint](../../docs/checkpoints/2026-10-17-0632-part19-arc-not-proven-blocked.md) · [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-arc-not-proven-blocked.json). NEXT: `expected-road-not-proven`, saved-data exceptions only.


## 2026-10-17 07:35 МСК — expected-road-not-proven grouped assessment

- Saved-report-only review on branch `fix/v3-missing-route-prices-2026-10-15`, source head/tree `fec51dab8eddc1919b4e839cc1b59a1c345f3b05` / `0bd121306facb563761e924d54c57ad4aa4487c1`, PR14 open/draft. Latest workflow run #38999218280 success at source head; no active branch run before this documentation save.
- Matched 64/64 finding case IDs to report rows; checked 64 unique live artifact paths in the source tree (all present), with raw, trace-complete, same-date-parity flags true. Missing expected road-label distribution: CKAD30, M12 11, Khabarovsk10, Odintsovo8, ZSD3, M4 2. 32 cases overlap existing finding ledgers and 32 do not; do not add overlapping counts.
- Conclusion: `expected-road-not-proven` is a mixed symptom, not one demonstrated defect. Report evidence does not establish that a fastest selected route actually traversed a chargeable omitted segment. Outcome: **deferred**; no road or fare was forced/added. User impact remains conditional/unconfirmed.
- M11 boundary cases5–8 were found already DONE in committed checkpoints; the shared M11 boundary cause remains **blocked by missing reliable data**, amounts unknown/null. No repeats.
- No new route/live/replay/build/test, no tariff confirmation. Formal-plan progress stays 18/20=90%.
- Checkpoint/evidence: `docs/checkpoints/2026-10-17-0735-part19-expected-road-not-proven-deferred.md`, `docs/checkpoints/evidence/2026-10-17-part19-expected-road-not-proven-deferred.json`. Next: review `m12_current_operator_pair_not_bound` (baseline4) from saved evidence only.


## 2026-10-17 08:41 МСК — M12 operator-pair cause review

- Reviewed cause `m12_current_operator_pair_not_bound` on `fix/v3-missing-route-prices-2026-10-15`, source head/tree `8582031d0565ebcb6ecd4982a12bfa389ec411ba` / `7fb29e51a6ce5dac755b502684278894034e868c`, PR14 draft. Latest branch workflow #39003295081 success on source head; no active writer at review start.
- Checked 4 cases across 8 date profiles and 12 saved evidence occurrences (4 live, 4 same-date replay, 4 weekend replay); all 12 files and all 4 captures exist in the tree. All four M12 outputs are `amount=null` / `pricingStatus=unknown` with the same explicit reason. Route spans are present; no toll-node IDs/operator pair bound.
- The M12 RVP evidence snapshot is explicitly `CALIBRATED_PARTIAL_RVP_EVIDENCE`, has 9 anchors, and warns it is not a complete inventory. This supports a missing spatial binding cause, not a proven tariff amount. Two of the four route cases also have a separate CKAD unknown. Counts overlap.
- Outcome: **blocked by missing reliable data**; preserved fail-closed unknown, no code/tariff changes. No new route/live/replay/test/build. Formal plan remains 18/20=90%.
- Checkpoint/evidence: `docs/checkpoints/2026-10-17-0841-part19-m12-operator-pair-blocked.md`, `docs/checkpoints/evidence/2026-10-17-part19-m12-operator-pair-blocked.json`. Next: assess `engine_not_yet_composed` (baseline13), stored evidence only.


## 2026-10-17T06:28:16Z (2026-10-17 09:28 МСК) — M1/M3 engine-not-composed cause review

- Verified PR14 draft and branch head `2b1882159d7ef0576c7eb8c3dcb6ca13f6bd0c21`; branch Actions #39007230631 success on source head, plus known PR workflow #38959170444 success on older head; no active branch run at start.
- Reviewed saved finding `engine_not_yet_composed`: 13 case rows, 39 live/same-date/weekend evidence occurrences; all 39 paths exist, all 13 traces and same-date parity complete, all weekday/weekend amounts null. No new route requests, replays, tests or builds.
- This parent label mixes causes. M3: 10 traversal-proven cases, but category-I rates in the national registry are verified through 2026-10-10 only; saved profiles depart 2026-10-15 and 2026-10-17. Gate inventory does not verify fare version and shadow pricing requires complete three-gate proof; M1/M3 are diagnostic-only in current route composition. Status: **blocked by missing reliable data**. User-facing full amounts must remain unknown/null.
- M1/OD-labeled: 3 rows; 2 overlap `odintsovo:unpriced`, 1 overlaps `expected-road-not-proven`. Status for this subcause: **deferred** pending OD-specific review. Parent aggregate status: **deferred**. No independent bug or tariff inferred.
- Formal progress remains 18/20=90% only. Details/evidence: `docs/checkpoints/2026-10-17-part19-engine-not-yet-composed-review.md`, `docs/checkpoints/evidence/2026-10-17-part19-engine-not-yet-composed-review.json`. Next: saved-evidence review of `odintsovo:unpriced` baseline2 and overlap check.


## 2026-10-17 10:41 МСК — Part19 Odintsovo route-to-PVP cause review

- Verified branch/PR14 at source head `bdf620e441d2cbe287a348bd388d28e188106341`; branch and PR heads matched. Run #39010035622 completed success on this head; no active branch writer before review.
- Reviewed saved finding `odintsovo:unpriced`: 2 route cases (Golitsyno–Rublevo and reverse), 4 unique route/date profiles (weekday and weekend), 6 saved live/same-date/weekend evidence occurrences; all six files exist and their blob SHAs are recorded in the evidence file.
- Both selected-route traces prove Northern Odintsovo Bypass traversal. The current official category-I base-fare candidate table exists, but route-product boundary is “operator direction/time pair to audit”; tariff selection report states runtimeApproved=false/integration pending. Exact directed route-to-PVP binding is missing, and M1/unmapped paid-booth components also remain unknown.
- Outcome: **blocked by missing reliable data**. Whole toll totals stay null; no amount inferred, no code or tariff values changed. No new live/replay/test/build.
- Aligned the stale `arc_not_proven` top-level queue status with its already saved completed blocked outcome. Updated current handoff and next action; Part19 remains IN_PROGRESS for synthesis/status reconciliation before Part20.
- Checkpoint/evidence: `docs/checkpoints/2026-10-17-1041-part19-odintsovo-unpriced-blocked.md`, `docs/checkpoints/evidence/2026-10-17-part19-odintsovo-unpriced-blocked.json`.


## 2026-10-17 11:11 МСК — Part19 canonical outcome synthesis

User/project decision: follow AGENTS.md and WORKFLOW_RULES.md; keep only one canonical disposition per cause and avoid repeating completed M11 checks. Before edit, verified branch and PR14 point to 2e816d7a744298b5e7a8aa70d33c4b5c6a5de41f; branch Actions #39014574620 success on that source head; no active branch writer. Inspected the current 13-record Part19 queue and relevant saved checkpoints. Added canonicalOutcome/canonicalOutcomeRationale to each existing record while preserving prior status, history, case IDs and source evidence. Outcome counts: fixed_and_verified 1 (A-289 component binding only, not full trip/fare confirmation), not_reproduced 1, blocked_by_missing_reliable_data 8, deferred 3. Four named M11 cases are present in the saved eight-case boundary exception review and remain blocked by the same missing directed entry/payment boundary; not rerun. No new live/replay, tests/builds, code or tariff data. Marked Part19 done; plan advances to 19/20=95%; Part20 is next after verifying this commit's Actions. See docs/checkpoints/2026-10-17-111116-part19-outcome-synthesis.md and queue outcomeSynthesis. Unknown remains null; no full toll totals confirmed.


## 2026-10-17 11:51 МСК — Part20 final verification

Verified PR14/branch head cfb442401a3cde9b6311026675d39484df394182; post-Part19 Actions #39016525904 completed success on this exact commit. Both verify and live_probe jobs passed. Verified tests, TypeScript, Next build, provider geometry/per-leg-times, Photon suggestions, the fixed 50-settlement route corpus, and six Yandex screenshot-route comparisons. Parsed the Part19 queue (13 entries with canonical outcomes 1 fixed-and-verified component binding, 1 not reproduced, 8 blocked, 3 deferred), plan progress and states, and checked the handoff link targets against the repository tree. Four previously queued M11 cases were already in the saved eight-case boundary review; no duplicate run. No tariff amounts changed or confirmed by these checks; unknown remains null and full trip totals remain unconfirmed. Marked formal Part20 done (20/20=100%); this is only the agreed formal route-audit plan, not completion of the broader calculator. See docs/checkpoints/2026-10-17-115129-part20-final-verification.md. Verify the post-save workflow/head before disabling the scheduled continuation.

## 17.10.2026 12:39 МСК — от завершённого аудита к конкретным решениям

Новый запрос пользователя: после успешного финального run перейти к разбору аудита и поиску решений. Run39019024457 completed/success на 69e7933257f5ac0d2ee42dd0bfbd258fcb1eb74f; PR14/head совпали, активных branch runs нет. Старое автопродолжение отключено (update подтвердил is_enabled=false). Разобраны реальные различия по дорогам, записан experiments/nationwide-tolls/POST_AUDIT_SOLUTIONS_2026-10-17.md. Выбрана точная цель ЗСД: не общая зональная цена, а cash/card collection span сохранённого КАД-юг→Екатерингофка. Повторно извлечена норма6.2.17 о связанном проезде Автомобильная↔Благодатная по чеку; это запрещает слепую сумму физических шлагбаумов. Проверен zone1-only код и уже существующая независимая mainline58↔679 логика M11, чтобы не предлагать ненужную полную перепись 21 координаты для доказанного полного вектора. Свежие запросы общих страниц whsd/nch дали502/403; транспондерные/непервичные цены не использованы. Тариф не активирован, runtime код не менялся, новых route cases/live/capture/replay/manual tests/builds0. Формальный план100% не является процентом новой работы. Checkpoint docs/checkpoints/2026-10-17-123911-post-audit-solutions.md, evidence docs/checkpoints/evidence/2026-10-17-post-audit-solutions.json. Следующий шаг — точная первичная схема коллекции ПВП5 и проверки исключений, не повтор всех76.


## 17.10.2026 13:36 МСК — ЗСД primary scope STARTED

Новый прямой запрос «Делай». PR14/head ea14eb19953d362cb22b2377b32f83203afba6ca, Actions39022053725 success. Сохранён docs/checkpoints/2026-10-17-133600-zsd-primary-scope-STARTED.md перед скачиванием и визуальным разбором первичных PDF. Прямые публичные запросы whsd.ru успешны200; прежний502 ограничивался web retrieval. nch-spb403 без обхода. Уже сохранённая HTML-таблица доступна, готовая привязка цены конкретного пути пока не доказана. Выявлены точные PDF96/32_1/Pravila0926. Новых маршрутных запусков0; цена/код не менялись.


## 17.10.2026 13:53 МСК — ЗСД КАД-юг→Екатерингофка, один finished vector

Выполнено прямое «Делай». После STARTED fbc7be2 и source CI39025484086 success получены первичные PDFs владельца96/32_1 и правила с01.10.2026; прямой owner HTTP200, не обход nch403. Новое направленное включение съезда в owner96 Annex1 снимает прежнюю конкретную неопределённость scope; текущие зональные цены дают precomputed vector600, не operator OD receipt. OSM26ways непрерывны, toll/oneway yes; exact exit183902370 проверен первично. Новый guarded cash/card component выбирает одну готовую строку, старый zone1 сохранён. Один сохранённый capture и2offline profiles:9534/11184, missing=[], totalpriceConfirmation unconfirmed, zero new live. Focused16/16, finalfull704/704 plus quote/API pass,TS/build pass. Первые failures только sparse fixture omissions, затем exact tracked fixtures восстановлены. Первичные sources/manifest, source proof, code/tests, outputs/logs и DONE checkpoint сохранены в этом шаге. См. docs/checkpoints/2026-10-17-135300-zsd-kad-ekateringofka-fixed.md и evidence. Другие75 ZSDcases не перепроверены/не засчитаны. Следующее — проверить материальные исключения совпавшего physicalscope после post-saveCI; старый план100% не новое farecoverage.


## 17.10.2026 14:33 МСК — Брянка: исключения нового вектора ЗСД

Прямое «Дальше». Head/PR dc44185940e0da95dafa00b5718b751fb729981c, CI39026791473 success; checkout сверён. На собственном сохранённом capture SHA bb720239367689bf2c68a22c3c2277cf3c34cd48a80a3d8052464c1f68a71815 текущий компонент подтвердил26ways,12направленных witnesses, complete trace/booths и выход183902370. Два отправления дали600, три отрицательные модификации далиunknown; assertions PASS. Это1component-onlycase,2positive date checks,3negative; full replay/live0. Цена source-derived, не независимый OD-чек, whole trip не пересчитан. Накопленно2 из76cases на новой правке,74не зачтены; общая причина остаётся partial/data-blocked, другие причины не менялись. Код/источники цен не менялись; новых broad tests/build0. Checkpoint docs/checkpoints/2026-10-17-143328-zsd-bryanka-exceptions.md, evidence docs/checkpoints/evidence/2026-10-17-zsd-bryanka-exceptions.json; JSON/content/links проверяются перед connector commit/tree/head readback. NEXT после post-saveCI: Лисичанск→СПб exception check, no309rerun. Старый план20/20=100%.


## 17.10.2026 15:01 МСК — пользователь разрешил пакет74

Текущий head/PR3ae7761fc0cebccc72777f487c5af8ca0b926665, CI39029215204 success. Прямое поручение запустить74 разом; старый процент больше не выводить. Правила AGENTS/WORKFLOW_RULES/CHECKPOINT_PROTOCOL уточнены: одна разрешённая batch-единица с progress и отдельным результатом каждого случая, STARTED и один итоговый commit/readback. Inputs74 unique caseIds/capture paths/SHA из сохранённой очереди; ни один ещё не выполнен этим пакетом. STARTED docs/checkpoints/2026-10-17-150159-zsd-batch74-STARTED.md; затем current component-only2dates per capture, no live/full trip replay.


## 17.10.2026 15:08 МСК — пакет74 завершён

По прямому поручению пользователя, в соответствии с новым batch-правилом STARTED7f6e6b8a4488bc3ee0aa4ce760b727b03b57f28b. Source runtime3ae7761fc0cebccc72777f487c5af8ca0b926665, CI39029215204 success. Script check-zsd-saved-batch.mjs прочитал74точных capture (SHA matched,32691411bytes), выполнил148current component/date checks;24case×2 дали600source-derived,50case×2 unknown; errors0, complete traces/booths74. No live/full replay. Отдельные74case JSON, progress/summary/hash manifests, README12physical fingerprints, validation и логи сохранены. Итог текущей правки26/76ZSDcomponentscalculated,50unknown; все76оценены, не все исправлены/не все full totalsconfirmed. Full704+quote/API PASS,TS/build PASS. Initial audit ENOENT sparse fixture восстановлен точным tracked Git object; bulkblobfetch bad revision заменён bounded git show4readers без смены авторизации, всеSHAverified. Runtime/тарифы не менялись. DONE docs/checkpoints/2026-10-17-150839-zsd-batch74-DONE.md. Перед итоговым remote update исключить activeCI39030982703, затем connector expected-parent/non-force/tree/head readback. NEXT primary directed scope representative9 Arzamas→Prim, остальные8exceptions; не50новыхlive.


### Наблюдение о задержке CI при сохранении

Служебный STARTED-коммит повторно запустил `.github/workflows/special-territory-policy.yml`, включая неизменённые широкие сетевые проверки. У live_probe timeout-minutes60 и continue-on-error true; `scripts/address-search-live-probe.mjs` последовательно перебирает13queries и вызывает fetch без явного AbortSignal/timeout. Поэтому завершённый локальный batch сам по себе не означает завершение побочного CI. Во время ожидания run39030982703 наблюдались переходы provider geometry → Photon →50-settlement corpus →6Yandex comparisons: признаков остановки runner не установлено. Runtime/тарифы не менялись. Это отдельная конкретная причина избыточных ожиданий; её оптимизация — ограниченный timeout и запуск live только при изменении влияющих файлов, с сохранением обязательного verify. В данном пакете workflow/пробы не изменялись.


# ЗСД: группа из 9 случаев, съезд к Богатырскому / Планерной

17.10.2026, 15:30 МСК. **Анализ DONE; тариф BLOCKED_BY_MISSING_RELIABLE_DATA.**

## Исходное состояние

Remote и PR head: `567090bf34db7ba9dc343469398d53682048bb48`, tree `112dc32686802a203b599f8df69731e922f39722`. Единственная рабочая ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 открыт и остаётся draft. При начале Actions run `39031962573` был in_progress: verify success, live_probe выполнял Photon suggestions. На повторной проверке 15:31 МСК оба job completed/success; условия для единственного remote writer выполнены. В последних шести runs других активных нет. Ветка не обновлялась; merge, Production, Android и автоматизаций нет.

Создан собственный checkout текущей сессии от точного remote head. Старый checkout был detached на другом commit с тем же tree. Попытка shared clone не прошла из-за отсутствующего promisor object; восстановление через общую базу объектов и точные commit metadata GitHub успешно: локально воспроизведён SHA567090bf… и сверено дерево. Не выполнялись push или настройка credentials. При извлечении HTML отсутствовал bs4; успешно использована стандартная библиотека Python.

## Представитель и исключения

Представитель: `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`, fingerprint `0c0e778a8622dfc6a3f57032f70fd16bc29fa010f3785c0215b8bb7ffae9c6c4`.

Проверены все 9 capture и 9 sealed результатов по SHA256. На собственном dense trace каждого подтверждены восемь упорядоченных свидетелей въезда / южного ПВП / северного съезда: отклонение ≤25 м, сегменты ≤500 м; complete trace и booth coverage; два направленных ПВП `933974870→1766158781`; направленная цепь съезда `721839717→165031082→252148968→355755817`. Ответвление Екатерингофки `183902370` отсутствует. **Среди остальных восьми случаев материальных исключений нет.**

Физический въезд: КАД (юг), на север. Физический съезд: к **Богатырскому проспекту / Планерной улице** через ПВП1766158781. Название контрольной точки «Приморский проспект» не является названием этого съезда. Исходная OSM topology имеет destination:street=Богатырский проспект;Планерная улица и непрерывную направленную цепь. Она доказывает идентичность дороги, но сама не определяет сбор.

Первичные определения зон `96.pdf` (приложение1), текущие cash/card ставки `32_1.pdf`, правила6.2/6.3 и сохранённая topology прочитаны; восемь source-manifest SHA проверены. Владелец указывает направленный въезд КАД-юг в зоне1, центральный путь в зоне2 и съезд Богатырского со стороны Приморского в зоне3. Однако в этих источниках не найдена **явная направленная привязка оплачиваемого набора зон к связанной паре ПВП** данного законченного проезда. Общая ставка300руб/зона и число ПВП не заменяют эту привязку.

Пункт6.2.17 описывает чек для Автомобильная↔Благодатная: первый ПВП, сохранённый чек, до60мин. Текущая пара КАД-юг→Богатырский/Планерная иной области; автоматически распространять льготу по чеку нельзя. Общая обязанность сохранять чек — п.6.2.8. По п.6.3 модуль показывает стоимость за зону(зоны), но конкретной таблицы соответствия для пары здесь нет.

**Итог причины для группы: заблокирована отсутствием надёжных данных.** Не хватает первичной направленной схемы/таблицы владельца, определяющей область и цену (или доказанный набор оплачиваемых зон) для проезда через933974870 и1766158781, включая зачёт/перекрытие оплаты, если он применяется. Альтернатива — операторский cash/card OD-расчёт или чеки именно этой пары, направления и класса без транспондера. Готовый вектор600руб заканчивается на Екатерингофке; здесь его не применяли. Новую цену900/1200 и сумму по шлагбаумам не назначали. Исторический600-вектор не переаудирован.

Два ограниченных свежих обращения к страницам тарифов и правил владельца через web вернули502 Bad Gateway. Два поисковых вызова не дали релевантной первичной привязки; поиск остановлен, новые маршруты не запрашивались. Подробное source review: `experiments/nationwide-tolls/checks/2026-10-17-zsd-planernaya-group9/source-review.json`.

## Переход к следующей группе

После блокировки рассмотрен **только представитель** следующей группы из7: `max-chain-m12-ckad-m11-zsd-kazan-to-sest`, fingerprint258ee8abe705…. Его capture SHA, sealed result SHA, прежняя scope-запись, complete trace/booths и инструкции съезда проверены. Фактически это КАД-юг→КАД-север через1766158812, не продолжение доЕ18«Скандинавия», несмотря на to-sest вID.

Для представителя также нет надёжного готового вектора: недостаёт первичной направленной области сбора на1766158812 и точной привязки варианта северного съезда. Только один представитель проверен; **остальные шесть не проверены, группа не закрыта**. Доказательства: `experiments/nationwide-tolls/checks/2026-10-17-zsd-planernaya-group9/next-group-representative.json`.

## Фактические проверки и счётчики

`python experiments/nationwide-tolls/scripts/review-zsd-planernaya-group.py` — exit0: checkedCases9, exceptions0, newPricedComponents0. Скрипт выполняет только краткую offline-проверку границ и контрольных сумм. STARTED.json, отдельные cases/*.json, progress.json и summary.json сохранены локально; долгий пакет или новый component replay не запускались.

Группа9: один представитель + восемь проверок исключений; ноль новых рассчитанных компонентов; девять unknown; ноль подтверждённых полных тарифов. Следующая группа7: один представитель, шесть непроверенных; ноль новых цен. Новых component/date запусков0; переиспользованы18 sealed результатов при неизменённых source hashes. Новых live-маршрутов/full replay0. Baseline остаётся26 рассчитанных ZSD-компонентов /50 unknown из76 оценённых случаев. Полные тарифы поездок этим шагом не подтверждены.

Runtime, тарифные данные и старые результаты не изменены. Новый full build / unit gate не запускался. Python syntax, JSON, ссылки и контрольные суммы проверяются в validation.json; результаты предыдущего CI не выдаются за новый локальный запуск.

## Сохранение и точный следующий шаг

Checkpoint, WORK_STATE, NEXT_STEPS, WORK_LOG и очередь подготовлены к одному итоговому сохранению. Пока CI был активен, ветка не обновлялась. После его завершения оба job success; перед переносом повторно сверяются run status, branch/PR head и active runs. Перенос: один GitHub connector commit с expected parent, non-force и exact tree/blob/head readback. Если head изменился, сначала согласовать различия; force не применять. Фактический новый commit определяется readback после записи, без самоссылочного SHA в этом файле.

После сохранения: обратная группа `1e954c437e46`, представитель `max-chain-m12-ckad-m11-zsd-sest-to-kazan`; сначала её сохранённые capture/primary evidence. Не повторять74/76/309 маршрутов и не искать заново общие ставки300руб без новых данных об области сбора. К двум текущим блокировкам возвращаться при появлении конкретной первичной привязки.

Дополнительная проверка15:32МСК: воспроизведение скрипта в отдельном output-dir прошло exit0; case JSON идентичны9/9, summary идентичен без timestamp. Это повтор тех же9 случаев, не дополнительные случаи. Python syntax, JSON, ссылки короткого handoff, hashes и git diff --check PASS; validation.json сохранён.


# ЗСД: оставшиеся представители, DONE

2026-10-17T16:15:12.524763+03:00. Статус анализа: DONE. Итог тарифных областей: **заблокирована отсутствием надёжных данных**. Новая причина повторного заезда: **отложена до отдельного кодового блока**, точные6proof сохранены.

## Входы и состояние

Ветка `fix/v3-missing-route-prices-2026-10-15`, source/branch/PR head `97d165fe4d071e68d2a30b341babc16fb1c2af56`; PR14 открыт/draft. Actions39033008320 фактически completed/success при начале работы; последние3runs completed/success. Чистый checkout текущей сессии совпадал с remote. CLIpush/credentials не трогали. Main/merge/Production/Android/сообщений/автоматизаций нет.

Канонический handoff указывал обратную группу1e954c437e46. Проверен представитель Сестрорецк→Казань: физически КАД-север→КАД-юг, южное направление, два направленных ПВП1766158804 и933975069. Надёжного готового cash/card вектора не найдено. По тому же source-gap далее изучены только ещё не разобранные представители, без повторения9/7представителей прошлого блока и без rerun74/76/309.

## Что выполнено и зачем

9 новых представителей соответствуют34 случаям в physical fingerprints; это не34проверки. Для каждого проверены captureSHA, sealed resultSHA, complete trace/booths, selected provider, метры и точное совпадение всей geometry с record.route.coordinates. Для OSRM берутся собственные steps/GeoJSON; для Valhalla — собственные decoded polyline6/maneuvers. После обнаружения конкретного повторного заезда добавлены5siblings той же группы; всего14уникальных фактически изученных случаев. Скрипт `experiments/nationwide-tolls/scripts/review-zsd-remaining-scopes.py`. Отдельные cases/*.json, progress/summary/STARTED сохранены как короткая offline-единица; долгих новых сетевых тестов не было.

Полная таблица, первичные ссылки/SHA и ограничения: `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/README.md`, `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/source-review.json`, `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/summary.json`.

Во всех6случаях5733 подтверждён selected trace motif: северное ЗСД ответвление→ПВП1766158781→городские links151490266/355755820/192140964/784207300/784207299/355755821 с toll=false→312063993/192140957/355755818/191727240/355755819/721839718/252148969→ЗСД233006897 наюг. Вход и выход разных оплачиваемых частей разделены городским разворотом. Готовый единый обратный вектор применять нельзя. Фактическая ошибка выбора физической геометрии по правилу no-reentry доказана; числовая ошибка тарифа не заявляется, поскольку компонент ужеunknown. Исправление ещё не реализовано; отдельный следующий кодовый блок, не новая серия source-gap поиска.

Группа2c00 (7случаев) входит со стороны Крузенштерна/Шкиперского, а не Екатерингофки: найден raw end_node13020687195 type=toll_gantry на351741889, toll=false. Это не доказательство бесплатности. Точный отдельный продукт/тариф развязки source-gated;6siblings этой группы не проверены. Не переносить600-вектор Екатерингофки на этот въезд.

Общие ставки/направленные определения владельца сохранены и сверены по8SHA. Свежие bounded обращения: оператор403, владелец502. Поиск выдал старые operator rules/нерелевантные результаты, но не current directed collection bundle; вторичные цены не использованы. Поиск остановлен. Для восьми представителей нужны точные primary привязки оплаты к entry/exit; тарифы не назначены по количествуПВП или совпадениюназваний.

## Проверки, ошибки и ограничения

Первый запуск остановился после1case на OSRMGeoJSON KeyError0: скрипт ожидал encoded string. Добавлено чтение geometry.coordinates для dict; rerunexit0,14unique/6reentry. Ошибка и восстановление сохранены. Эксперимент прямой привязки trace end_shape_index к input.shape отброшен: matched trace индексы отличаются от входной формы; пробные координаты не попали в решения/тарифы. Не считать это доказательством runtimeошибки координат.

Выполнено:14captureSHA и14sealedSHA,14selectedgeometry identity. Воспроизводимость, syntax, JSON, ссылки, resultSHA иgitdiff фиксируются в validation.json. Full unitgate/TS/Nextbuild заново не запускались; runtime/тарифы/старыеcases не менялись. ИсходныйCI39033008320 success; post-saveCI проверять отдельно, не приписывать ему успех.

Счётчики:9представителей+5исключений=14новых уникальных boundaryreviews. Накопленно24из50unknowncases получили разборграниц,11из11physicalgroups представлены;26siblings непроверены. Новыхcomponent/date проверок0;28старыхprofile records использованы безпересчёта. Новыхfullreplay/live0. Новыхрассчитанныхкомпонентов0; подтверждённыхполныхтарифов0. Baseline26priced/50unknown неизменён.

## Сохранение и NEXT

Обновлены короткий WORK_STATE, NEXT_STEPS, append-only WORK_LOG, PART19_FINDINGS_QUEUE.postAuditSolution.directedGroupReviews и новая postAuditGeometryFindings. История сохранена. Перед переносом проверитьhead/PR/activewriter; один non-force connector commit с expectedparent97d165fe…, exact local/remote tree, всеchangedblobSHA иbranch/PRreadback. ФактическийSHA итоговогокоммита определяетсяпослезаписи, безсамоссылки. ПриактивномCI веткунеобновлять.

Следующийкодовыйблок: устранение подтверждённого выхода/повторногозаезда5733 в выбранном маршруте. Сначала trace transport/route selection/validation контракты и мотив из6capture; затем один узко ограниченный guard и focused отрицательные/положительные тесты, обязательныйgate/build; не подменять один fastest маршрут более медленным бесплатным. Пока sourceцены unknown, их не подставлять. Остальные26siblings не запускать безготового общего решения/новойпричины.

Фактическая финальная проверка: повтор в отдельном output-dir exit0;14caseJSON идентичны, summary идентичен безtimestamp. Python syntax, JSON, hashes14+14, первичные8SHA, handoff links, очередь11groups/24checked/26unchecked иgitdiff PASS. Это повтор техже14случаев, не новыеуникальныепроверки. validation.json сохранён.


# ЗСД: исправление повторного заезда — STARTED

2026-10-17T16:25:22.498391+03:00. Source remote/PR head `0cc2c469d5ef0385fe8446983103233ef73606a2`, tree `e8504dc0cf4d36a6cc1f3a77e37cd03b5996e9de`. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Run39035926910 в начале in_progress: verify success, live_probe выполняет Photon. Пока активен — remote update не выполняется. Перед сохранением этогоSTARTED проверить фактический статус/head и отсутствие другихwriters. Старые тарифные статусы и доказательства сохраняются.

## Цель и ограниченная реализация

Шесть capture группы5733 подтверждают один конкретный мотив: северное ЗСД→ПВП1766158781→городской разворот Богатырского/Планерной→новый южный заезд наЗСД. Нужно исключать этот физически недопустимый кандидат **до ранжирования по времени** в обеих V3 ветвях ordinary/special. Не менять V2, тарифные источники, транспондеры, main/Production/Android. Не начинать общий поиск более медленных бесплатных альтернатив.

Точка интеграции найдена: `lib/v3-calculation/route-candidate.ts:isUsableRoute` уже вызывается обеими ветвями до выбора/тарификации. Добавить узкий geometry-only guard известного мотива. Он использует8упорядоченных физических свидетелей выбранной dense geometry, допуск15м, плотностьсегментов≤500м и ограничение локальной длины. Северный проезд без повторного въезда, обычныйюжныйвъезд, обратный порядок, соседняя дорога и редкий chord не должны ложно отклоняться. Это геометрические физические якоря, не OD/ETA/ценовойbenchmark.

По короткому локальному предварительному анализу восемь свидетелей присутствуют у всех6исходныхValhalla маршрутов (отклонения0м); у сохранённыхобычныхOSRMответов motif отсутствует. Прежний выбор Valhalla был по меньшемуETA. После структурного фильтра ожидается обычныйOSRMкандидат с минимальным временем средиоставшихсявалидныхответов; стоимость не участвует вранжировании. При отсутствии допустимыхкандидатов вернуть существующую ошибкумаршрутизации, не продавать invalidroute и не возвращатьнулевой тариф. Чужойtrace старойValhallaгеометрии не переносить наOSRM.

## Входы и проверка

Точные6capture/SHA перечислены в `experiments/nationwide-tolls/checks/2026-10-17-zsd-remaining-scopes/summary.json` и соответствующихcases/*.json. Входной fingerprint5733fbb44c1c68eac1b81aa40e7e08b59201621562b0c133671ae51437d09a34. Результаты каждого нового guard/selection исключения, SHA, progress и сводку сохранить в `experiments/nationwide-tolls/checks/2026-10-17-zsd-no-reentry`. Фикстуры и физические witnesses — новыйsource snapshot ЗСД с provenance; runtime читает только небольшой geometry asset.

План проверок:6старыхbad геометрий+6собственных обычныхOSRMкандидатов, несколько известных непрерывныхnegativecontrols; end-to-end mocked V3ordinary иspecial API (безlive), проверка отсутствияbypassзапросов и переноса чужогоpricingevidence; затем обязательные fullaudit+quote/API, TypeScript иNextbuild. Новыхlive и полногоauditreplay74/76/309 не запускать. ЕслиOSRMgeometryвыбрана, но её новыйtrace вsavedcapture отсутствует, оставить tariffunknown; недостающие данные не объявлятьнулём или готовымполнымитогом.

## Восстановление

До долгихтестов этотSTARTED должен быть достижимизразрешённойветки и readbackпроверен. Результаты ещё не выполнены и не засчитаны. В случае прерывания прочитать этотcheckpoint, проверитьremotehead/CI иprogressдиректории; не повторять исходныйrootcauseaudit. По завершении — одинDONE/FAILEDcheckpoint софактическимивыходами, WORK_STATE/NEXT_STEPS/WORK_LOG/queue и exact tree/blob/headreadback. НовыйCI послеSTARTED можетидтипараллельно локальнойработе; финальныйremoteupdate только послеотсутствияactive/queuedрелевантныхruns.

ИсходныйCI39035926910 передSTARTED completed/success; localdraft guard/tests подготовлен беззапускапроверок, будетотдельнымDONEкодовымсохранением.


# V3 ЗСД: защита от повторного заезда — DONE локально

17.10.2026, 16:38 МСК. Причина `zsd:selected-route-reentry`: **исправлена и проверена в точной области шести сохранённых случаев**. Итоговый remote commit ещё требует записи и readback после прекращения активного CI.

Source head: `0cc2c469d5ef0385fe8446983103233ef73606a2`. Durable STARTED: `80a15c47087199bab3d96783559fc486946b52be`, tree `f7980a092d1146f6f561c452c182b7961c0cf080`. Единственная ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 открыт/draft.

## Что изменено и почему

Добавлен `lib/v3-calculation/zsd-reentry-policy.ts`. Он проверяет конкретную доказанную последовательность: северное ЗСД → съезд через Планерную/Богатырский → городской разворот → новый въезд на южное ЗСД. Требуются восемь упорядоченных физических свидетелей, расстояние до собственной геометрии ≤15 м, плотность каждого местного сегмента ≤500 м и местная длина ≤4 км. Одного ПВП, конечного пункта или названия дороги недостаточно.

Небольшой runtime asset: `experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json`. Capture SHA, индексы исходной геометрии, шесть случаев и четыре независимых контроля вынесены в source-manifest.json. Runtime не читает OD/ETA/ценовой benchmark.

Общий V3 `lib/v3-calculation/route-candidate.ts:isUsableRoute` исключает такой кандидат **до сравнения времени**; эта функция уже используется ordinary и special pipeline. Из оставшихся обычных ответов провайдеров выбирается один с минимальным временем. Цена и наличие тарифа не влияют на выбор. Новые бесплатные/bypass-запросы не добавлялись. Если допустимых кандидатов нет, возвращается существующая ошибка маршрутизации.

На каждом из шести собственных capture прежний более быстрый Valhalla нарушает no-reentry и отклонён; собственный обычный OSRM допустим и выбирается среди оставшихся ответов. Это исправление известного мотива, **не общий детектор всех повторных заездов России**. V2, тарифные источники, API-контракт и правило тарификации по отправлению не менялись.

## Проверки

`lib/v3-calculation/zsd-reentry-policy.test.ts`: шесть bad/шесть обычных OSRM, четыре непрерывных negative controls, source hashes, обратный порядок, соседний путь, chord, разрыв и отсутствие допустимого кандидата.

`scripts/v3-route-selection-audit.test.ts`: ordinary API выбирает OSRM и проверяет только его собственные точки; special API применяет тот же допуск; единственный запрещённый кандидат даёт502 без тарификации. Все три API-регрессии ожидаемо падают при отключении только guard через внешний тестовый loader. Production-файлы для mutation не изменялись.

`experiments/nationwide-tolls/scripts/check-zsd-no-reentry.mjs`: воспроизводимый пакет шести candidate checks с отдельными JSON, progress и SHA summary, плюс четыре контроля; без запросов routing/tracing/fare.

Фактические результаты:

- Focused24/24 PASS; mutation: exit1/fail3 ожидаемо, проверка существенности регрессий PASS.
- Full audit721/721 PASS; quote/API checks PASS.
- TypeScript exit0; targeted ESLint exit0.
- Next build exit0: compile/TS PASS, static16/16.
- Candidate batch:6/6 случаев, шесть отклонённых reentry-геометрий, шесть допущенных собственных OSRM, четыре неотклонённых непрерывных контроля.

Первый full audit:715 pass и1 module fail из716 из-за ENOENT старой A289-фикстуры в sparse checkout. Восстановлены три точных tracked capture из Git objects, blob SHA совпали; повтор прошёл721/721. Initial failure, recovery и оба лога сохранены. Первый focused log пуст при exit0; явный reporter24/24 и full audit проверены. После STARTED первый PR readback ещё видел прежний head при уже обновлённой ветке; повтор подтвердил80a15c…/draft/tree/шесть blob, повторный writer не запускался.

Зависимости скопированы из имеющегося локального node_modules в собственный checkout без install/network и изменения lockfile. Итоговые JSON/hash/link/diff-проверки — validation.json.

## Счётчики и ограничения

Шесть уникальных исходных случаев;12 проверенных candidate-геометрий; четыре самостоятельных negative controls. Новых live provider requests и full-trip replay0. Новых рассчитанных тарифных компонентов и подтверждённых полных тарифов0. Mock HTTP в тестах не является live-данными.

Полные цены для новых OSRM-геометрий не пересчитывались. Старый trace Valhalla нельзя переносить на новый OSRM: mocked API подтверждает запрос только собственных точек выбранного OSRM и unknown при недоступном новом trace. Исторический baseline26 priced/50unknown не является пересчитанным покрытием новых выбранных геометрий.

## CI и сохранение

Исходный run39035926910 completed/success перед STARTED. Post-STARTED run39036931767: verify completed/success; необязательная широкая live_probe ещё активна при подготовке этого checkpoint. Отмена не выполнялась: в connector нет cancel-команды; пользователь уведомлён. CLI credentials и browser fallback не пробовали. Дождаться фактического прекращения перед remote update. Новый code CI не выдавать за успешный по локальным проверкам.

Обновлены append-only WORK_LOG, короткие WORK_STATE/NEXT_STEPS и geometry finding в очереди. Пути результатов: `experiments/nationwide-tolls/checks/2026-10-17-zsd-no-reentry/`. Перед записью проверить head/PR/active writers; перенос одним non-force connector commit с expected parent80a15c… и точными tree/blob/head readback. При изменении head сначала readback/reconcile. Main, merge, Production, Android, сообщений и автоматизаций нет.

NEXT: после сохранения проверить CI нового кода. При продолжении pricing получить собственный selected OSRM trace одного представителя, поскольку геометрия действительно изменилась. Source collection gaps остаются unknown. Не повторять74/76/309 и26 siblings без общего решения.

Финальная проверка перед записью 2026-10-17T16:46:26.789689+03:00: run39036931767 завершил verify иlive_probe completed/success. Отмена не выполнялась. Активныхзаданий исходногозапуска больше нет; разрешена итоговаязапись сexpectedparent80a15c…. Новыйpost-saveCI проверятьотдельно.

При финальном staged diff --check обнаружены только trailing whitespace/CR в исходных build/mutation логах. Точные исходные байты сохранены в build.raw.log.gz и mutation-expected-failure.raw.log.gz (SHA и обратная распаковка проверены); печатные .log нормализованы по пробелам/концу файла, validation обновлён. Код не менялся, тесты не перезапускались. Полный staged diff к STARTED проверяется повторно перед единственным итоговым remote commit.


# Собственный trace OSRM — DONE

2026-10-17T17:28:10.010625+03:00. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Source/code head `a49470b7b9ebf4065c44890bc5e516a74dbe0166`; CI39038119987 фактически completed/success. Durable STARTED `dbb5a1ef669e3ce5179d35b59f22378602b766c8`, tree6042eb4100736f0e1989fef87c7cebd0d5781c0f. Точные head/tree/два blob и PR draft проверены readback.

## Причина и результат

После исправления повторного заезда старый Valhalla trace неприменим к выбранному OSRM. Для одного `pair-m11-zsd-prim-to-moscow` восстановлены собственные OSRM metadata из записанного ответа: 715622 м / 30963 с. Valhalla отклонён. BRouter3D не принимается существующим контрактом, а его диагностическая 2D-проекция тоже содержит физический повторный заезд. OSRM выбран по ETA среди допустимых обычных ответов; цена в выборе не участвует.

Единственный новый live map-matching: 6/6 HTTP200, полный trace и booth coverage, failed chunks0. Все точки запросов принадлежат OSRM. Законченный проезд ЗСД: Благодатная → КАД-юг к Пулковскому, точные318102347/375574651 и упорядоченный exit proof. Семь source SHA проверены, включая первичные приказы96/32_1 и правила. Применим существующий готовый вектор зоны1 за300 ₽. Цена600 Екатерингофки и зачёт по чеку другой пары не переносились. Вектор рассчитан по первичным данным; независимого OD-чека нет.

Итог для представителя: **исправлена и проверена** собственная привязка и расчёт компонента ЗСД после замены маршрута. Геометрическое исправление всех шести сохраняет fixed_and_verified; цены остальных пяти новых маршрутов не проверены. Проверен один случай, рассчитаны четыре компонента (ЗСД1/300), подтверждённых полных тарифов0. Составной расчёт5424 на отправление2026-10-15T09:00:00+03:00 имеет priceConfirmation=unconfirmed. Исторический26/50 не является пересчитанным глобальным покрытием новых геометрий.

## Файлы и проверки

[Полный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-zsd-selected-osrm-trace/README.md), capture.json.gz, selected-route.json.gz, шесть raw requests, STARTED/progress/result/boundary-proof/validation и логи. Скрипты trace-selected-zsd-osrm.mjs и check-selected-zsd-osrm.mjs сохраняют raw и progress, ограничивают сеть trace endpoint /12attempts/120с и блокируют продолжение при terminal error. Offline-mode строго проверяет точные request bodies и результат. Runtime и тарифные векторы не менялись.

Выполнено: два node--check PASS; один offline pricing replay нового capture точно совпал, misses0 и новой сети0; семь source hashes, шесть копий raw responses и собственные route/geometry SHA совпали; пять отрицательных проверок PASS; диагностическая 2D-проекция BRouter подтвердила повторный заезд. Новых routing-запросов0, старых replay74/76/309 нет. Для новых скриптов, по обязательному правилу AGENTS после кода, gate повторён: 721/721, quote/API, TypeScript и Next build16/16 PASS. Точные stdout сохранены gzip без изменения байтов; required-checks.json содержит exit codes и время. Runtime не менялся.

## Сохранение и следующий шаг

Post-STARTED CI39040459995 при готовности случая ещё выполнял необязательную широкую live_probe; обязательный verify completed/success. Операция ЗСД закончена: это ожидание CI. До прекращения активного CI ветку не обновлять. Перед одним итоговым non-force connector commit проверить head/PR/CI, expected parentdbb5a1ef…, затем точные tree/blob/head. Результат не считать сохранённым в remote до переноса. WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и очередь обновлены. Main/merge/Production/Android, сообщений и новых автоматизаций нет.

NEXT после durable DONE и актуального CI: один ограниченный пакет остальных пяти новых OSRM с собственными geometry/metadata/trace. Повторно использовать новый raw только при идентичном request payload, а не общем ПВП. Группа9 и другие непривязанные области сбора остаются BLOCKED; общий поиск тех же тарифов не повторять.

Финальная проверка перед сохранением 2026-10-17T14:36:20.852653+00:00: branch/PR headdbb5a1ef… совпали, PR14 open/draft; CI39040459995 completed/success, verify и live_probe completed/success. Пять последних запусков завершены. Ожидание CI закончилось; разрешена одна итоговая non-force запись с expected parentdbb5a1ef…. Новый post-save CI проверяется отдельно.


# Пять изменившихся OSRM ЗСД — DONE

17.10.2026 17:57 МСК. Разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Source `8fecbab5245fed3b7bff644eb0ccce4f2efa2c33`; CI39041543624 completed/success перед STARTED. Durable STARTED `d9a96ec04875078fefb0ec2b487dc6446ede220f`, tree `85a47e0f8bdc23224918ff9ccc39b417acf8eaf1`; head/tree/четыре blob/PR draft проверены readback. Runtime не изменён.

## Законченный результат

Пять оставшихся OSRM восстановлены с собственными metadata из собственных записанных ответов. Все capture SHA совпали. Valhalla и диагностический BRouter2D имеют запрещённый повторный заезд. OSRM выбран по ETA среди допустимых обычных кандидатов; цена в выборе не участвует. Новых routing-запросов нет.

Все пять trace и booth coverage полные. Основных chunks41, дополнительно два вызова одного локального trace М-4: всего43 обращения,27 точных reuse,16 новых HTTP200,20 различных использованных raw-ответов. Ошибок и retry429 нет. У всех законченный scope Благодатная → КАД-юг к Пулковскому: собственный gate318102347/375574651, полный набор zone1 ways, направленный exit proof. Семь source SHA, включая owner96/32_1/правила, проверены. Применён готовый вектор зоны1 за300 ₽. Цена не назначена по общему ПВП;600 Екатерингофки и receipt credit другой пары не переносились. Независимого OD-чека нет.

Причина ЗСД для пяти заменённых геометрий **исправлена и проверена**. Проверено пять случаев, рассчитано19 компонентов, включая пять ЗСД; подтверждённых полных тарифов0. Два составных расчёта к Воронежу7254 имеют статус unconfirmed. Три полных итога остались unknown; известные subtotal4494/4494/300 не выданы за полную цену. Вся поездка тарифицируется по отправлению15.10.2026 09:00 МСК, легковой, cash/card.

Вместе с предыдущим представителем: все шесть изменившихся OSRM имеют собственный полный trace и ЗСД300. Рассчитано23 компонента; три составных расчёта и три unknown; подтверждённых полных тарифов0. Предыдущий представитель не пересчитывался. Исторический baseline26/50 не объявляется пересчитанным покрытием всех76.

## Доказательства и проверки

[Подробный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-zsd-osrm-five/README.md), inputs-plan/STARTED/progress/summary, отдельные route/capture/result и raw responses в том же каталоге. Runner trace-zsd-osrm-replacements.mjs сохранён до сети; новые запросы допускаются только к trace_attributes, максимум35 attempts/180с, terminal circuit, точный URL/method/body cache. Проверяющий check-zsd-osrm-replacements.mjs не использует сеть.

Выполнено: строгий offline replay пяти результатов точно совпал, misses0/unused0/network0; независимая проверка пяти собственных геометрий и границ,20 raw и семи source SHA;15 отрицательных проверок PASS. Синтаксис двух скриптов PASS, обязательный audit721/721, quote/API, TypeScript и Next build16/16 PASS. Точные stdout сохранены gzip без изменения байтов, exit codes — required-checks.json. Старые74/76/309 не повторялись, широких ручных live-проб нет.

## Остаток и сохранение

Независимые причины отложены: М-12/ЦКАД у двух новых маршрутов (`m12_current_operator_pair_not_bound`, `ckad_east_arc_not_proven`); М-11 Торжка (`only_one_verified_boundary_crossing`, неопознанный узел3183012434 на way795246101). К ним нельзя переносить тарифы старого Valhalla. Следующий ограниченный блок — точная привязка съезда Торжка по сохранённому capture и готовым источникам, без нового routing. Исходные owner collection gaps других групп ЗСД остаются BLOCKED отдельно.

Post-STARTED CI39042535356 при готовности пакета ещё активен, verify успешен. До прекращения active/queued CI ветку не обновлять. Это ожидание широкой live_probe, а не работа пакета. WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и очередь обновлены. Перед одним итоговым non-force commit проверить branch/PR/CI с expected parentd9a96ec0…, затем точные tree/blob/head readback. Новый post-save CI проверять отдельно. Main/merge/Production/Android, сообщений и новых автоматизаций нет.

Во время ожидания CI выполнена только безопасная read-only подготовка следующего блока: p258/Будово присутствует в операторском списке точек, но facility p258 отсутствует в текущем spatial snapshot. Узел3183012434/795246101 — кандидат, привязка не доказана и цена не назначена. Точные источники и SHA сохранены в torzhok-followup-notes.json; это не новый выполненный pricing case и не исправление М-11.

Финальная проверка перед сохранением 2026-10-17T15:05:37.441302+00:00: branch/PR head d9a96ec04875078fefb0ec2b487dc6446ede220f совпали, PR14 open/draft; CI39042535356 completed/success, verify и live_probe completed/success. Все пять последних runs завершены. Ожидание CI закончено, разрешена одна итоговая non-force запись с expected parent d9a96ec0…. Новый post-save CI проверять отдельно.


# М-11 Торжок p258 — DONE

17.10.2026 20:34 МСК. Source `5281fa019eda95128035be5a0a1d2d1d95f34425`; durable STARTED `5b000b5ff6220ffab307b835feabb7764a661b89`, tree `8b867023f6299b27e3aca13e8abb8964e948392b`. Единственная ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. STARTED head/tree/четыре blob/PR draft проверены. При продолжении20:24 фактические remote/PR/local head совпали с5b000b5f…, CI39044745179 completed/success. Три сохранённых первичных OSM ответа не повторялись.

## Причина и решение

Именованная часть М-11 на собственном OSRM к Торжку заканчивается примерно за930м до кассы. В старом spatial snapshot нетp258, узел3183012434 не классифицирован; готовая строка p679→p258 существовала, но до физической привязки не применялась.

Первичные node/way/local-map подтверждают ПВП8 Торжок и соседний объект «ПВП Торжок258км» в том же комплексе, согласованный с официальной точкой258/Будово. Связная цепь семи one-way paid links, точные узлы, полный собственный trace и старый первичный gate679 сохранены. Здание не объявляется содержащим gate. Это привязка по первичным данным; независимого операторского OD-чека нет. После одной нерелевантной пары поисковых запросов поиск не расширялся. Новых routing/trace нет.

Новый m11-p258-exit-boundary.ts и малый directed-exit.json проверяют полные coverage, собственные entry679/exit258 на правильных ways, strict конец у junction, девять упорядоченных свидетелей, плотность и local span. Стандартные120/500м не менялись. m11-product-boundaries.ts создаёт отдельный доказанный продукт p679→p258, route-leg-pricing передаёт собственную validation; unpriced-road-coverage узнаёт точный3183012434 как М-11. Исторические spatial/capture не менялись; обратное направление не включено. Runtime читает только физические якоря, а не case/OD/ETA/fare benchmark.

Итог причины: **исправлена и проверена**. При отправлении15.10.2026 09:00 МСК:2400+94+300=2794 ₽. Три компонента, два новых; полный расчёт внутренне unconfirmed, подтверждённых полных тарифов0. Один целевой случай и один независимый сквозной контроль5424 без изменения. Три проверки отправления одного случая подтверждают сохранение четверга при достижении gate в пятницу. Публичный API возвращает priced2794 и по действующей политике не публикует внутренние confirmation fields; политика не менялась.

## Проверки и сохранение

[Подробный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-m11-torzhok-p258/README.md). Focused7/7, обязательные728/728 и quote/API, TypeScript, ESLint, Next build16/16 PASS. Initial focused6/7 был ошибочным ожиданием внутреннего поля публичного API; исправлено только ожидание, исходный лог сохранён. Artifact replay сопоставил четыре точных собственных trace-запроса, validation совпала, misses/unused/network0. Raw, источники, SHA, result/runtime SHA и точные gzip-логи сохранены.74/76/309 не повторялись.

По конкретным шести изменившимся OSRM теперь25 рассчитанных компонентов, четыре составных расчёта/два unknown, ЗСД6×300; подтверждённых полных тарифов0. Исторический baseline26/50 не переписан как глобальная сводка всех76. WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и очередь обновлены. Перед одним итоговым non-force commit проверить branch/PR/CI с expected parent5b000b5f…, затем точные tree/blob/head. Новый post-save CI проверять отдельно. Main/merge/Production/Android, сообщений и автоматизаций нет.

NEXT: общий scope М-12/ЦКАД двух собственных OSRM Арзамаса/Чебоксар. Сначала сохранённые границы и готовые операторские продукты, без нового routing. Остальные owner collection blocks ЗСД сохраняются.

Финальная проверка перед записью 2026-10-17T17:37:04.652520+00:00: branch/PR head5b000b5ff6220ffab307b835feabb7764a661b89 совпали, PR14 open/draft; CI39044745179 completed/success, verify и live_probe completed/success. Пять последних runs завершены. Итоговая non-force запись с expected parent5b000b5f…, новый post-save CI проверять отдельно.


# Собственные OSRM: М-12/ЦКАД — DONE разбора / BLOCKED привязки

17.10.2026 20:52 МСК. Source `54f4cccccd0d4b70ae34f063ac4db351b013acba`, tree `d28efcdc61f6bcfb3c6681cdce078a89eb2b60ce`. Единственная ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft; local/remote/PR heads совпали. CI39054871192 при начале активен; verify успешен, широкая live_probe ещё выполняется. До окончания active/queued CI remote не обновлять. Сохраняется один ограниченный offline-разбор, не новый pricing-пакет.

## Общая причина и исключение

Два собственных OSRM имеют идентичный направленный коридор ЦКАД от М-11 до М-12 (SHA2809793ae661e5178eda289723955fdc7fac43fe4afe3b89bcea8fe8b032fac1), а текущий адаптер поддерживает только полный М-11↔М-4. Ослабление южных anchors или тариф всего восточного проезда ошибочны. Отдельная физическая привязка к операторской паре нужна до узкого нового adapter.

Выходы М-12 существенно различаются: Арзамас —22Н-0239 после420; Чебоксары —М-7 у Владимира до184. У Арзамаса direct184/281/314/392/420 не доказывают западный вход:114.748км до первого известного против интервала174→184. У Чебоксар нет двух прямых калиброванных RVP,184 находится93.291м от геометрии за её М-12 выходом. Радиус80м и другие thresholds не менялись.

Координаты трёх западных рамок10782165529/11214930528/11157985901 уже сохранены в limited fixture, совпадают с обоими маршрутами и trace; отсутствует первичная привязка к операторским RVP/оплачиваемым интервалам. Калиброванных81/118/174 нет. Реальные съезды не объявлялись тарифными точками по названию города. Существующие981/2952/1239 — только lookup кандидатов, не начислены. Для северной пары ЦКАД М-11→М-12 сноска М-12–Носовихинское120мин не требуется;16 условных клеток не разрешались.

Итог причины: **заблокирована отсутствием надёжных данных о физических тарифных границах**. Это законченная диагностика и подготовка точных входов, не исправление runtime и не подтверждение цены.

## Выполненные проверки

[Полный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-selected-osrm-m12-ckad-scope/README.md), per-case JSON/progress/summary/source-hashes и воспроизводимый script. Рассмотрены2 случая:1 представитель+1 проверка исключения;19 trace occurrences/13 различных raw;45 hash entries, включая первичные PDF. Все request points принадлежат собственным маршрутам; capture/route/geometry SHA и coverage полные. Начальная ошибочная сверка текущего pricing-file с историческим SHA исправлена проверкой замороженного Git5281fa01; raw и прежние результаты сохранены. Диагностика ошибки записана.

Final script syntax/review PASS; audit728/728 +quote/API, TypeScript, ESLint, Next build16/16 PASS. Процессы ограничены40с каждый, фактически10.101/2.065/1.095/8.554с; короткий локальный разбор не требовал STARTED. Новых routing/trace/primary requests0; pricing replay0; новых рассчитанных компонентов0; новых полных расчётов0; подтверждённых полных тарифов0. Сохранённый subtotal4494 каждого случая не является полным итогом. Совокупные25 компонентов/4расчёта/2unknown по шести изменившимся OSRM и исторический26/50 не переписаны.

## Сохранение и следующий шаг

WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и актуальная очередь обновлены с сохранением истории. После окончания CI39054871192 проверить branch/PR head54f4cccc… и все текущие runs, затем один non-force update с expected parent54f4cccc…, exact tree/blob/head readback. Новый post-save CI проверять отдельно. Main/merge/Production/Android/сообщений/новых автоматизаций нет.

NEXT: один ограниченный первичный проход общей пары ЦКАД М-11→М-12 по точным сохранённым ways1148492112/1148492111/1189855267 и соединению916593974→916593983→916593976→1189855268; не новый routing и не повтор74/76/309. Только при доказательстве — новый узкий adapter и пакетная проверка двух собственных случаев. М-12 западные RVP и два разных выхода требуют отдельного первичного определения; отсутствие связи не лечить увеличением radius. До длительной операции — durable STARTED; при отсутствии данных остановить эту причину и перейти к другой.

Финальная проверка перед записью 2026-10-17T17:54:55.476Z: branch/PR head54f4cccccd0d4b70ae34f063ac4db351b013acba совпали; PR14 open/draft. CI39054871192 completed/success (verify и live_probe), пять последних runs завершены. Ожидание CI закончено; один non-force update с expected parent54f4cccc…, новый post-save CI проверять отдельно. Exact readback — pre-save-readback.json.


# ЦКАД М-11→М-12 — STARTED

17.10.2026 21:08 МСК. Source `f010d847765874573a52ef1926f3ca82dc1a44c4`, tree `94ba2e72308312c56d0c77cda00d09ccae98c911`. Единственная ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft; local/remote/PR совпали, CI39055898864 completed/success, пять последних runs завершены. Перед сетью/длительными тестами сохранить STARTED и проверить head/tree/blob.

Два собственных OSRM и общий коридор уже проверены в предыдущем DONE; не повторять routing/trace и74/76/309. Цель — первичная направленная привязка М-11→М-12 и узкий adapter готовой981 клетки только при доказательстве. Первичный PDF/матрица/регистр уже сохранены, повторный числовой аудит не нужен. М-12 и его разные выходы в этом шаге не включаются; subtotal не полный итог.

[Точные inputs и SHA](../../experiments/nationwide-tolls/checks/2026-10-17-ckad-m11-m12/inputs.json). Не более12 exact OSM GET (8 ways/full,4 nodes), максимум120с суммарно и15с каждый, без retry/широкого поиска. Capturer сохраняет каждый raw/metadata/progress; terminal response останавливает сеть. Восстановление только тех же inputs и точных сохранённых ответов; неизвестные привязки остаются BLOCKED.

Если первичная связная геометрия и операторские границы доказаны, добавить небольшой physical snapshot и forward-only adapter. Нынешняя validation отбрасывает non-toll соединения; сохранить минимальный контекст named А-113 блока из полного trace, чтобы доказать один непрерывный проезд, вход из М-11 и выход через три links к М-12. Отклонять неполноту, другой/повторный блок, reverse/parallel/sparse geometry и чужие концы. Старый М-11↔М-4 adapter/пороги без изменения. Runtime не читает benchmark/case/OD/ETA/fare expectations.

Затем обе saved-case exceptions, focused/API negative controls, обязательные audit/quoteAPI/TS/ESLint/build, per-case results/progress, один DONE checkpoint/commit/readback. Число проверенных случаев, новых рассчитанных компонентов и подтверждённых полных тарифов отдельно. При активном CI ветку не обновлять. Нового routing/trace, main/merge/Production/Android/сообщений/автоматизаций нет.

Статус STARTED: первичных запросов и новых рассчитанных компонентов пока0. Следующий шаг после durable readback — ограниченный capturer с CKAD_DURABLE_STARTED_COMMIT; только при доказательстве реализация, иначе точный blocker и следующая причина.


## 2026-10-17 23:07 МСК — DONE: правило после зависания и точка восстановления

Прямой запрос пользователя: после зависания делить последнюю задачу на части. Обновлены AGENTS.md, docs/WORKFLOW_RULES.md и docs/CHECKPOINT_PROTOCOL.md; связаны WORK_STATE, NEXT_STEPS, DECISIONS и отдельный checkpoint docs/checkpoints/2026-10-17-230704-hang-recovery-rule-DONE.md. Правило ограничивает повторный запуск незавершённым остатком, требует результата/durable-save каждой части и повторного дробления при новой остановке.

Source remote/PR14 draft a666fb4887ea54a328a29fb3bfc2dfa5102e5499; workflow39056837838 completed/success проверен через GitHub. Локальный a9f2bf98106bc798cc3536a7c920cd2c4dbd10a2 содержит 60-файловый готовый блок ЦКАД, но remote всё ещё STARTED: это остановка сохранения, а не основание повторять аудит. Исходный checkout не изменён. Новый docs commit основывается на remote; перенос a9f2bf поверх него потребует согласовать журналы, сохранив новые правила.

Первое создание полного checkout из shared partial repository показало отсутствующие старые blobs. Вместо сетевого восстановления тысяч неотносящихся файлов использован чистый sparse checkout только нужных документов на точном remote SHA. Коммит включает только восемь явно выбранных документов; удалений evidence/runtime нет.

Проверки этой правки: content assertions, существование новых относительных ссылок в Git tree, git diff --check и allowlist staged paths. Full build/новые тарифные, routing/trace проверки не запускались (docs-only). Фактические результаты проверок и durable/readback подтверждаются выполнением и последующей проверкой коммита; старые результаты ЦКАД не считаются проверками этого шага. NEXT: восстановить сохранение a9f2bf по трём частям из WORK_STATE, без повторения аудита. Main/merge/Production/Android не изменяются.

Точный локальный сбой сохранения: обычный git commit завершился exit1 (Error building trees) из-за отсутствующего старого blob a18460bd… в исходном partial object store. Документы staged и diff --cached --check успешны. Для docs-only дерева использовать git write-tree --missing-ok и commit-tree; это сохраняет ссылки на неизменённые удалённые blobs, не подменяет их пустыми файлами и не включает удалений. Итоговое дерево обязано совпасть с деревом GitHub create_tree, построенным от source tree.


## 2026-10-17 23:12 МСК — восстановление сохранения ЦКАД, часть1

DONE локальная проверка готового a9f2bf…:60 exact files/1306375bytes,6runtime hashes,13frozen sources,12primary raw,2case files PASS. Прежние логи focused8/8,audit736/736,quote/API/TS/ESLint/build exit0 доступны и прочитаны; новые тесты/сеть0. Исправлена только проверка формата Node reporter в recovery-скрипте. Manifest: checks/2026-10-17-ckad-save-recovery/verification.json; подробности/команды/ограничения: docs/checkpoints/2026-10-17-231217-ckad-recovery-part1-DONE.md.

Source remote5102b44…/PR14draft, CI39065562352 verify success/live_probe active. По правилу active CI remote пока не обновлять; подготовлена одна docs-only единица сохранения части1. Pending runtime ещё не опубликован. NEXT после terminal CI и durable checkpoint readback — exact transfer60 файлов с согласованием трёх журналов, затем code save/readback; аудит не повторять.

Для устранения зависимости от исходного scratch в ту же recovery-единицу добавлен pending-ckad.bundle82729байт с исходным a9f2bf и prerequisite a666fb48. Git bundle create/list-heads/verify PASS; SHA256 в manifest. Архив не применяет код к runtime. После remote commit/readback эту часть можно восстановить из GitHub без исходного checkout.


# ЦКАД М-11→М-12 — DONE

17.10.2026 21:20 МСК. Sourcef010d847765874573a52ef1926f3ca82dc1a44c4/tree94ba2e72308312c56d0c77cda00d09ccae98c911. Durable STARTEDa666fb4887ea54a328a29fb3bfc2dfa5102e5499/tree0e04b98cc6140027c7fb076ecfd97f8ff0551c76; head/tree/6blobs/PR14open draft проверены. Однократное отставание PR исправилось повторным read без второго update. Единственная ветка fix/v3-missing-route-prices-2026-10-15; до STARTED CI39055898864 success. Текущий CI39056837838 активен во время подготовки DONE, verify успешен; remote до завершения не писать.

## Причина, источники и реализация

Старый adapter ЦКАД принимал только полный М-11↔М-4, два собственных OSRM имеют общий неполный М-11→М-12. Paid-only validation теряла non-toll connections и не доказывала непрерывный проезд. Итог причины: **исправлена и проверена** для двух выбранных направленных проездов.

12 заранее объявленных primary OSM GET:8 ways/full+4 nodes, все200,7738мс, без повторного routing/target trace/широкого поиска. Первичные А-113 entry и касса8087316064, четыре gantry и connected exit1189855267→916593974→916593983→916593976→1189855268. Их49 координат, собственный полный named trace с предшествующей М-11 и опубликованные operator interchange labels доказывают пару. Существующая categoryI cash/postpay981 клетка приказа56 применяется напрямую; матрица/регистр не менялись. Северная пара не использует conditional М12–Носовихинское;120мин boolean не применялся. Независимого OD-чека нет.

Новый ckad-m11-m12-boundary.ts+physical-directed.json требуют one named А-113 block с собственными граничными событиями, полного trace/booths/checked chunks, одной кассы, правильных links/направления и49 ordered own witnesses≤25м, local density≤500м/core≤5км и ограниченного пути. toll-validator.ts сохраняет компактный ckadTraceBlocks из всех edges, включая non-toll. Врезка в ckad-product-boundaries.ts выполняется только после неуспеха старого full arc; route-leg-pricing передаёт own validation. Старый full arc/общие thresholds без изменения, reverse/другие пары не включены. Benchmark/case/OD/ETA/fare expectations в runtime не читаются.

## Результаты и проверки

[Подробный отчёт](../../experiments/nationwide-tolls/checks/2026-10-17-ckad-m11-m12/README.md), [первичные evidence](../../experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/README.md). Два случая: оба ЦКАД981, по5 рассчитанных компонентов, subtotal4494→5475; full API amountnull, missing толькоm12. Новых рассчитанных компонентов2, новых полных расчётов0, подтверждённых полных тарифов0. Прежние fields validation из19 own main trace occurrences/13 raw совпали, добавился только context. По шести OSRM27компонентов/4составных расчёта/2unknown, historical26/50 не менялся.

Final focused8/8:20 context+6 geometry negative variants; raw non-toll city-gap mutation сохраняет paid-only list, но даёт2 named blocks и отвергается. Own API2, departure checks, exact auxiliary М-4 replay независимого контроля7254 без лишнегоЦКАД. Full736/quoteAPI/TS/ESLint/build16/16 PASS, exact gzip stdout/exit/time сохранены. Долгие операции выполнены после durable STARTED.

Initial5/8: три ошибки тестовых ожиданий (uid regex, ложное предположение по названию case, непубличный API field), исправлены только тесты. Второй8/8 не принят как доказательство: независимый Voronezh control мог выполнять local М-4 fetch без перехвата; один вызов контроля неинструментирован, HTTP attempt count не измерен/raw отсутствует. После обнаружения default fetch закрыт, exact auxiliary replay добавлен, final focused и весь gate повторены. Сетевую экспозицию всего блока не объявлять нулевой;12 planned primary reads и0 новых target routing/trace считаются отдельно. Логи/initial-check-findings сохраняют историю.

Source progress после exit0 оказался старымIN_PROGRESS9 при наличии12 exact raw/metadata. Старый файл сохранён, DONE12 восстановлен только после проверки полного planned URL набора и каждогоSHA, без re-fetch. Причина устаревшего progress не установлена. Это не новый pricing case.

## Сохранение и следующие этапы

WORK_LOG дополнен, короткие WORK_STATE/NEXT_STEPS и очередь обновлены с сохранением истории. После прекращения CI39056837838 проверить head a666fb48…/PR14draft и текущие runs, затем один non-force DONE с expected parenta666fb48…, exact tree/blob/head readback; новый CI отдельно. Main/merge/Production/Android/сообщений/новых автоматизаций нет.

Остались три крупных этапа: (1) М-12 западные RVP и разные съезды, готовые векторы только после привязки; (2) остальные незакрытые причины очереди по одному решению и пакетным исключениям, сохраняя source gaps какBLOCKED; (3) итоговый focused/general gate и handoff с раздельным учётом компонентов/полных расчётов/подтверждённых тарифов. Старый20-план/74/76/309 не повторять. Ближайший шаг — STARTED перед ограниченной первичной привязкой М-12 по saved nodes10782165529/11214930528/11157985901 и distinct exits22Н-0239/М-7. Полная цена двух поездок пока неизвестна.

Финальная проверка перед записью 2026-10-17T18:22:54.393Z: branch/PR head a666fb4887ea54a328a29fb3bfc2dfa5102e5499 совпали, PR14 open/draft. CI39056837838 completed/success, verify и live_probe; пять последних runs завершены. Один non-force DONE с expected parenta666fb48… после завершения CI. Новый post-save CI проверять отдельно. Exact evidence: pre-save-readback.json. Final focused отдельно утверждает0 неожиданных fetch attempts; gate повторён после усиления guard.


## 2026-10-17 — восстановление code save ЦКАД после зависания

После durable recovery часть1 fe5f1fc8… перенесены57exact файлов исходного a9f2bf и согласованы3журнала без утраты новых правил/истории. Runtime/evidence соответствуют прежним проверкам, матрица/цены не меняются. Checkpoint docs/checkpoints/2026-10-17-2320-ckad-code-save-recovery-DONE.md; progress checks/2026-10-17-ckad-save-recovery/transfer-progress.json. Source CI39065562352 success; recovery CI39066237658 активен при подготовке, до terminal не двигать ref. Один atomic non-force code commit на fe5f1fc8… и exact tree/blobs/head readback, затем фактический code CI. Новых тестов/сети/pricing replay0; прежние focused8/audit736/quoteAPI/TS/ESLint/build результаты сохранены. NEXT: code CI, затем отдельная привязкаМ-12; полный итог двух поездок unknown.


## 2026-10-17 23:30 МСК — LOCAL ONLY: готовый code commit ожидает terminal CI

Prepared remote commit e3c07ac3e09e8be1bbecd482b70974c691681f2b/tree d3e0340c9e352cd858854666c0f225a168f31764, parent fe5f1fc8bd0986e222cb49a4e906a12005513c65;62path SHA readback PASS. Remote ref не перемещён: CI39066237658 verify success, live Photon address probe active. Нет per-request timeout в scripts/address-search-live-probe.mjs (blob deae251b0f199dbe82b6eb5aa4013f435abd1e5c), job ограничен60минутами. Это наблюдаемая причина потенциального долгого ожидания, не доказательство зависшего конкретного fetch; автоотмена не разрешена правилами.

Точный recovery record docs/checkpoints/2026-10-17-pending-ckad-remote-save.json и верхние WORK_STATE/NEXT_STEPS локальные, НЕ сохранены в GitHub. NEXT: actual CI/heads, после terminal non-force ref fe5f1fc8→e3c07ac3 и readback/code CI; при изменённом head согласовать без force. Повторять перенос62файлов и исходный аудит не нужно. Durable bundle/manifest уже сохранены в fe5f1fc8; runtime пока не интегрирован.


## 2026-10-17 23:35 МСК — DONE: code save ЦКАД и фактический code verify

CI39066237658 terminal completed/success, parent fe5f1fc8…/PR14draft сверены; non-force ref update на e3c07ac3e09e8be1bbecd482b70974c691681f2b выполнен. Exact tree d3e0340c9e352cd858854666c0f225a168f31764/62pathSHA/head/PRdraft readback PASS. Блок восстановлен и reachable из единственной разрешённой GitHub-ветки; больше не pending save.

Code CI39067254489 verify117497372912 completed/success. Реальный job log получен:tests284/pass284/fail0/skipped0,TypeScript success,Next compiled/static16/16 success. Это новые CI-проверки; прежний audit736 не переименовывать в новый CI. Live_probe активен, полного success run ещё нет. Source code/audit/pricing не повторялись, новые primary/routing/trace0 в локальной работе; CI live-запросы считать отдельно.

Readback JSON docs/checkpoints/2026-10-17-ckad-code-durable-readback.json и обновлённая pending-record statusDONE отражают фактический статус. Эти последние наблюдения пока локальные из-за новогоactiveCI; код и исходные журналы ужеdurable в e3c07ac3. NEXT после проверки terminalCI — отдельный bounded address-probe timeout fix; затем М-12. Полные цены двух поездокunknown.


## 2026-10-17 23:49 МСК — STARTED: bounded address live probe

Sourcee3c07ac3…/PR14draft, CI39067254489 completed/success проверен. Отсутствуют deadlines запроса/тела адресной проверки. Один ограниченный блок:10с request+body,90с whole probe, abort/race и incremental reports/progress; offline failure/budget tests и обязательный audit/TS/ESLint/build. STARTED docs-only [skip ci] предотвращает ненужный повтор широкого live-аудита для журналов; финальный code commit безskip проходит обычный CI. Источник механизма: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs . Полные инструкции/recovery в docs/checkpoints/2026-10-17-234931-address-probe-timeout-STARTED.md. Scope probe/tests/progress artifact только; тарифы/матрица/app/lib без изменения.


## 2026-10-17 — DONE: bounded address-search probe

Одна причинаисправлена: запрос/JSONbody10с, общийbudget90с сabort/race, per-source errors, atomic partial array+progress после города и явныйBUDGET_EXHAUSTED/CLIexit1. Добавлены helper,8offline tests и одна строка progress artifact вworkflow. App/lib/матрица/ставки без изменения. Source e3c07ac3…/CI39067254489 success; durable STARTED925c8c4d…/6path readback, docs-only skipCI.

Actualfocused8/8,fullaudit744/744+quote/API,TS,ESLint иNext16/16 PASS. Initialserializationtest failure исправлен только test fixture/normalization. Initialbuild exit1: external node_modules symlink rejected byTurbopack; зависимости локально скопированы, повторён только failed build,exit0. Exact source SHA256/commands/exit/timing/initial+final gzip logs в checks/2026-10-17-address-probe-timeout; подробныйcheckpoint docs/checkpoints/2026-10-17-2350-address-probe-timeout-DONE.md.

Локальных live/providercaptures0;8faulttests mocked, externalavailability не заявляется. Передfinal non-force expected925c8c4d… сверитьhead/PRdraft/terminalCI; commit безskip,exacttree/blobs/headreadback. Новыйpost-saveCI отдельно. NEXTcodeCI,затемМ-12 западныерамки иразныеexits;unknown/fulltariffs не превращатьв0.

Уточнение сохранности evidence: initial focused invocation exit1 наблюдался в выводе инструмента (AssertionError по undefined/JSON normalization), однако focused-initial.log при финальной проверке имеет0байт, причина не установлена. Полный initial focused raw НЕ сохранён; empty gzip не является его доказательством. initial-observations.json явно фиксирует доступное наблюдение и это ограничение. Initial build raw и все принятые final logs доступны; окончательные8/744/TS/ESLint/build PASS прочитаны из реальных логов.


## 2026-10-17 — actual code save/readback: address timeout

Final non-force d497df67738696dbe9c11e4dc14e617717ea1a2a parent925c8c4d…, exacttree8e50f77a553ace772f0f1ccb39722baa5627062b/20path/head/PR14draft readbackPASS. НовыйCI39068966825 verify117502410949 completed/success;live_probe117502411255in_progress/providergeometry принаблюдении. Fullrun successнезаявлен. Focused8/full744/quoteAPI/TS/ESLint/build16/16 — фактический localgate изреальныхлогов. Readbackrecord docs/checkpoints/2026-10-17-address-timeout-remote-readback.json; последниеCIнаблюдения локальные, код/evidence20файловужеdurable. NEXTactualCI/head, затем отдельныйМ-12STARTED; прошедшиекейсы/тестынеповторятьбезпричины.


## 2026-10-18 00:01 МСК — STARTED: bounded М-12 western boundary binding

Source d497df67…/PR14draft; CI39068966825activeприподготовке,verify success. Подготовлены frozeninputs8SHA,9точныхprimaryOSM URLs(3nodes+6ways/full),15сeach/120сwhole иterminalfirstfailure. Запланированы2узкихoperatorqueries/≤4opens толькоboundaryidentity, не тарифы. Savedcases дают разные exitsМ-7Владимир/22Н-0239Арзамас; общийCKADentryreuse. Готовые1239/2952неприменены,новыхrouting/trace0; архивЦКАД/74/76/309неповторять. STARTEDdocs-onlyskipCI, доterminalстарогоCI/head/readbackremoteнеписать; доdurableSTARTEDprimaryсетьнепускать. Checkpoint docs/checkpoints/2026-10-18-000148-m12-western-boundaries-STARTED.md; inputs checks/2026-10-18-m12-western-boundaries/inputs.json. NEXTboundedprimary, затемproof+узкийadapter/gateиликонкретныйBLOCKED/DONEбезрасширенияпоиска.

Перед STARTED: CI39068966825 обаjobscompleted/success,ожиданиезакончено; source-ci.json сохранён. Точныедвеprimarysearchquery/domainfiltersуточненывinputsбезувеличениялимита.


## 2026-10-18 — DONEphysical/BLOCKEDoperator: westernМ-12

Source d497df67…/CI39068966825обаjobs success;durableSTARTED1a8df19a…/7pathreadback. Primary9OSMHTTP200/8.684с;3gantrycoordsи2connectedexitsverified,операторскихномеровнет. Арзамас22Н-0239неавтоматическийP158alias;ЧебоксарыМ-7exitнеавтоматическийoperatorvladimirpoint.1239/2952неприменены,subtotal5475исторический,fullTripunknown. Новыхrouting/trace/wholepricingreplay/components/fullfares0.

2operatorqueries/4plannedpagesсretrievallimitation(неверныйavto-dor.ru/нерелевантные12resultsисключены),затемявнообоснованные2точечныхdatareadsнаблюдённогоgettrack86127:normalGETredirect→одинAJAX-headerGET. Обаraw/metadataсохранены,не скрытывOSMcount. ОбщийМ-12fragmentнеcrosswalk;новыйsource m-12-vostokнаблюдён,неполучен. Полныеформулировки/ограничениявREADME,operator-retrieval.json иcheckpointdocs/checkpoints/2026-10-18-000148-m12-western-boundaries-DONE.md.

Focusedcapture-reuse/noSTARTEDguards0unexpectedfetchPASS;reviewfrozen8/raw9hashes/3coords/2chainsPASS. Initialofflineexit1guardоткрылmixedoperator/OSMmetadatafolder:rawлогсохранён,operatorrecordsперенесенывsubfolder,guardбезизменения. Fullgate744/quoteAPI/TS/ESLint/Next16/16всеexit0,exactcommand/timing/gzipсохранены. Этоutilitygate,неповторживоготарифногоаудита. QueueM12followupupdated;всебазовыесчётчикииостальныеfindings/historyM11/CKADfixespreservedassertPASS.

NEXTactualnewCI;одинновыйboundedsource-specificпроходтолькопоobservedm-12-vostokURL;старые9objects/search/ЦКАД/74/76/309неповторять. Еслиновыйsourceнеустанавливаетcrosswalk,retainBLOCKEDиперейтикдругимassessedcauses. Finalnon-forceexpected1a8df19a…/tree/path/headreadback,безskip,PR14draft;никакихmain/merge/Production/Android.

Сбой сохранения: первая передача объектов остановилась до загрузки первого blob, потому что exec-server потерял соединение. Read-only pwd затем успешно подтвердил доступ к тому же checkout; GitHub head не изменился. Исходные файлы доступны, codeSHA совпали. Передача продолжена последовательно с per-file progress. Тесты и сетевые прогоны из-за этого сбоя не повторялись. Точное событие — checks/2026-10-18-m12-western-boundaries/transport-events.json.


## 2026-10-18 — фактическое сохранение М-12 primary review

Remote a9ad472218b15fc2952304b1fa5d70670ce929a1 parent1a8df19a…, tree16f81749670cec8480fc8cfe5ce8b74bda7b4828;52pathSHA/head/PR14draft readbackPASS. Новый CI39071021984 verify117508472379 completed/success, live_probe117508472518 in_progress. Полный run не объявлен успешным. Точные record/status сохранены локально в docs/checkpoints/2026-10-18-m12-western-remote-readback.json; эта последняя запись CI пока не опубликована из-за activeCI, основной блок и52файла уже durable.

Транспорт exec-server восстановился после одного read-only healthcheck; последовательная передача48blob+progressfile прошла с exactSHA, исходные тесты/сеть не повторялись. NEXT: actualCI/head, затем только новый observed URLm-12-vostok. Исследованные9объектов и два прежних поиска не повторять.


## STARTED 2026-10-18: официальный источник М-12

CI39071021984 completed/success на a9ad4722…; одна новая страница и одна связанная схема,15с/request,60с budget. План: docs/checkpoints/2026-10-18-m12-official-page-STARTED.md. Не повторять готовые физические проверки и расчёты.


## DONE 2026-10-18: новая официальная страница М-12

Один GET200,229612bytes; raw+metadata+links+result сохранены. Нет нужного crosswalk и релевантной схемы, привязка BLOCKED. Новых цен0; код не менялся, тесты не повторялись. Checkpoint: docs/checkpoints/2026-10-18-m12-official-page-DONE.md. NEXT: saved Part19 cause reconciliation/final gate scope.


## 2026-10-18 — сверка продолжения без повторов

# Актуальная передача состояния — 18.10.2026

Сверка сохранённых данных, без повторного маршрутного аудита.13 базовых записей:1 исправлена и проверена,1 не воспроизвелась,8 заблокированы данными,3 агрегатные причины отложены. Это записи причин с перекрытиями, не число маршрутов и не готовность калькулятора.

| Область | Оставшийся пробел | Условие продолжения |
|---|---|---|
| М4 |8 физических545 и6 коротких scopes;5 оценок без подтверждения оператора | доказать тарифный охват конкретной границы/направления; не выбирать цену по номеру545 |
| М11 | точные въезды головного участка и упорядоченные объекты58–679 | координаты и направленная операторская идентичность; исправление258 не распространять на все41случай |
| ЦКАД | часть исторических дуг не доказана | точный непрерывный тарифный охват; готовый М11→М12 уже исправлен |
| М12 | три рамки и два съезда без операторского соответствия | новый независимый crosswalk; официальная обзорная страница уже проверена |
| ЗСД |50 исторических компонентов unknown; часть групп имеет только representative review | направленный охват оплаты/зачёт платежа; не повторять76 или74 |
| Одинцово/М1 | не связана направленная пара ПВП | доказать пару с выбранным маршрутом |
| М3 | датировка тарифов и порядок объектов | источник, действующий на дату поездки, и тот же trace |

Поздние исправления ЗСД/геометрии/258/ЦКАД сохранены отдельно от baseline outcomes. Частичный subtotal5475 не полная цена. Старый план19/20 уже завершён; новая широкая финальная проверка без изменения кода или конкретного дефекта не требуется. Последний codeCI39071021984 success; docs-head878ef70a без runs.

Исправлены два указателя очереди: путь отчёта Одинцово (раньше весь текст; точное совпадение с файлом проверено) и уже выполненный запрос М12. Детали, SHA и проверенные ссылки: result.json.

NEXT: M4 physical545: inspect only the retained 1223→545-a/545-b tariff-span provenance and source documents to specify the missing boundary identity; no repeat22 routes or live routing. A new network review requires a bounded STARTED and a precise independent source. If retained evidence already exhausts that question, preserve BLOCKED and state the exact missing operator evidence.


## 2026-10-18T03:01:01.198125+00:00 — М4-545 retained provenance

Точная полоса и цены двух вариантов уже сохранены;4objectSHA+2PDFSHA совпали. Новый операторский lane-to-section источник отсутствует в retained наборе. BLOCKED, runtime/сеть/replay/tests0. docs/checkpoints/2026-10-18-m4-545-retained-provenance-DONE.md. NEXT: New source only: operator collection scheme or direction/lane rule for physical545 and sections517–544/544–589, applicable to trip departure. Bound any retrieval in STARTED; do not repeat the retained403 URLs or select min/max/alias.


## 2026-10-18T05:38:35.458521+00:00 — STARTED М4-545 operator source

До4queries/4новых primary reads, directGET15с/max-time20с/max4MB. Точные параметры в experiments/nationwide-tolls/checks/2026-10-18-m4-545-operator-source/inputs.json. Без повторных маршрутов/PDF/403URL, без выбора суммы.


## 2026-10-18T05:40:13.277762+00:00 — М4-545 source discovery DONE / linkedsections STARTED

4queries/4reads;3newoperator403/ownerindex200. Исторический текст2016 один/два участка не currentproof. Две новые observed links сохраняются для bounded2pages+2schemes, безqueries. docs/checkpoints/2026-10-18-m4-545-source-discovery-DONE-linked-sections-STARTED.md. Runtime/route/replay/цены0.


## 2026-10-18T05:41:30.875493+00:00 — М4-545 officialsource DONE/BLOCKED

# М4-545: официальный source pass завершён, привязка BLOCKED

18.10.2026. Два отдельно сохранённых ограниченных прохода:4queries/4reads, затем0queries/2exact linked pages. STARTED0856aaa5… и0330c5b0… прочитаны после записи, PR14draft.

Новый индексированный текст оператора от26.12.2016 описывает взимание на545 за один или два участка в зависимости от маршрута. Это полезный исторический указатель, не источник текущих цен или доказательство выбранной полосы. Три новые directoperator reads вернули403. Официальный ownerindex открывается, но обе его конкретные ссылки517–544/544–633 возвращают «Элемент не найден!». Связанных схем в них нет; никаких URLвариаций/обходов403 не выполняли. Первая поисковая система дала нерелевантные результаты; они исключены и не считаются evidence отсутствия данных.

Raw weboutputs сохранены как gzipJSON с SHA256. Всё относится к доступности конкретных страниц, а не ко всем возможным источникам.

**Итог:** нет операторского соответствия physicalnode5818209495/way615270691 тарифному охвату517–544/544–589 на дату поездки. Суммы3060/3620 и2920/3460 остаются неприменёнными вариантами. Runtime/матрица не менялись, новыеroute/replay/pricedcomponents/fullfares0. Тесты/сборка не требовались для этой source-only единицы и не запускались. Проверены JSON/gzip/hash/diff и ссылки отчёта; последний codeCI39071021984 success относится к своему head.

NEXT: М4 остаётсяdata-blocked до нового независимого operatorcollectionproof. Не повторять этотsourcepass или старуюгеометрию/22маршрута. Следующая отдельная причина — датировка сохранённых тарифовМ3; сначала только savedprovenance, затем boundedSTARTED перед новым primarysource.


## 2026-10-18T05:43:04.560076+00:00 — STARTED M1/M3 shadow departure-policy bug

Конкретноеотличие: сохранённыйshadow сравниваетdate/profile конца, конфликт с15Octproductrule. Inputs: experiments/nationwide-tolls/checks/2026-10-18-m1-m3-departure-policy/inputs.json. Толькоmidnightdiagnosticguard; farehorizon/physicalproof/customerpricing безизменения. Требуютсяfocused/fullgate, сеть0.


## 2026-10-18T05:46:12.454967+00:00 — М1/М3 departure policy исправлена и проверена

# Исправление диагностического тарифа М-1/М-3 по дню отправления

18.10.2026. Найден и исправлен отдельный дефект `m1-m3-shadow-quote.mjs`: диагностика возвращала unknown при переходе через московскую полночь, сравнивая дату и профиль конца поездки с началом. Это противоречило правилу пользователя от15.10.2026: весь расчёт определяется отправлением.

Теперь календарь выбирается только по отправлению. Например, четверг→пятница сохраняет диагностические480₽ для доказанного полного М3-коридора, воскресенье→понедельник —520₽. Это существующие ставки и синтетические regression fixtures, не новые маршруты или подтверждённые полные тарифы. Проверки физического порядка объектов, временной зоны, длительности, effectiveFrom и verifiedThrough сохранены. Результат остаётся diagnosticOnly; клиентская сумма не получает shadow price.

Регрессия до исправления:31тест,26pass/5ожидаемыхfail. После:31/31. Полный аудит750/750, quote/API, TypeScript и ESLint прошли. Сборка сначала не смогла открыть сохранённую базу Turbopack (`invalid digit found in string`); `.next` перемещён в отдельный временный каталог без изменения зависимостей/конфигурации. Повторена только сборка: PASS,16/16страниц. Исходный failed-log и запись восстановления сохранены. Все логиgzip проверены по исходномуSHA256.

**Ограничения:** verifiedThrough остался2026-10-10. Отправления15/17октября не разблокированы. Полнота и точные gate identities нужны отдельно; новых клиентских компонентов/подтверждённых полных тарифов0. Не переносить480/520 в клиентскую сумму по одному совпадению названияМ3.

Source369df969…; durable STARTED5866364a…/tree6d65bd18…,5path/head/PR14draft readback. Final code commit безskipci; workflow settings не менялись. До следующего writer проверить фактический CI этого commit.

NEXT: CI, затем только новый ограниченный source/date разборМ3 при наличии независимого официального источника. Не повторять10saved routes, М4sourcepass или старые пакеты. ПолеeffectiveFrom само по себе не продлевает verifiedThrough.


## 2026-10-18T05:57:06.449954+00:00 — codeCI success / M3 date-source STARTED

CI39101746826 verify117599261373/live_probe117599261271 completed/success; всеstepssuccess, remotePRhead65bed1ae…/draft сверены. Новый bounded M3source:4queries/4reads, безroute/replay/старыхисточников. Inputs: experiments/nationwide-tolls/checks/2026-10-18-m3-tariff-date-source/inputs.json.


## 2026-10-18T06:00:37.438303+00:00 — М3 date source DONE/BLOCKED; ZSDsix STARTED

4queries/4reads; indexedстарыецифры/news2025 неproof2026. Sourcehorizon ицены неизменны, directtrack38AJAX20021KBбезdatedrates. docs/checkpoints/2026-10-18-m3-date-source-DONE-zsd-six-STARTED.md. Следующийновыйscope:6uncheckedsiblings258ee8 exit/trace exceptioncompare, безreplay/сети/componentrerun.


## 2026-10-18T06:03:59.236184+00:00 — ZSD north-KAD six DONE

# ЗСД: шесть недостающих проверок границы северного КАД

18.10.2026. Группа258ee8… имела одного подробно проверенного представителяКазань→Сестрорецк и шесть явно непроверенныхsiblings. Проверены только их собственные сохранённыеcapture/trace/exit instructions; прежние74component checks не запускались повторно.

**Результат6/6:** rawcapture SHA и frozenreport SHA совпали; own selected Valhalla response geometry точно совпадает с каждой выбраннойroute geometry. Trace complete/booth coveragecomplete; в собственныхrawtrace подтверждён порядок933974870/way381576632 →1766158812/way458501101. Все76ZSDways соответствуют sealed priorreport; собственныеинструкции ведуткЛевашовскому/КАД/Приморскому иА118. Это реальный съездкКАД-север, а не продолжение доСкандинавии, независимо отto-sest вcaseID. Materialexceptions0, errors0. Подробно проверена вся группа7/7 с учётом ранее готового представителя; новых siblingchecks6, не7.

**Outcome: blocked_by_missing_reliable_data.** Не хватает направленного operatorcash/card collection bundle/готового вектора для этих точныхграниц. Физическийtrace не доказывает сумму;300₽/зона не присваивается. Новыхpricedcomponents/confirmedfullfares0. Исторические26priced/50unknown не пересчитывались и не стали новыми результатами.

Шестьcapture-файлов отсутствовали вsparseworkingtree, но ихblobs были вlocalGit. Они восстановлены безlazyfetch и проверены поGitblobSHA+SHA256. Сетевыхзапросов/providerrequests/replay/pricingcalls0. ПервоначальныйFileNotFound припробесхемы отмечен вrecovery-progress.json; это не потеря исходногоcapture и не повод повторять live. Per-caseoutputs/progress записывалисьатомарно, весь пакет0.124с. Новыйruntimeкод не менялся; fulltests/build не требовались и не запускались. ПровереныJSON/6caseSHAs/6captureSHA+Gitblobs/diff.

Source STARTED1f5dbd9d…/treec2439975…,13path/head/PR14draft readback. Метод выборки следует existingreview-zsd-remaining-scopes.py: decode selected-provider shape, compare own record, use own maneuver indices; trace-output shapeindices не применялиськвходнойгеометрии. Reproduction inputs/отдельныефакты/хэши сохранены; один-offline Pythonанализ не подключёнкприложению.

NEXT: следующая отдельно незавершённая группа1e954c437e46 (КАД-север→КАД-юг),7unchecked siblings. До пакетногочтения отдельныйSTARTED сточнымиcaseIDs/frozenpaths; толькоowncapture exceptionchecks,безreplay/сети. М3datesource иМ4sourcepass удерживатьBLOCKED,неповторять безнезависимогоисточника.


## 2026-10-18T06:08:08.643649+00:00 — STARTED ZSD north→south seven

Группа1e954c437e46,7явноunchecked sibling boundarychecks. Frozeninputs: experiments/nationwide-tolls/checks/2026-10-18-zsd-north-south-seven/inputs.json. До7cases/120с, сеть/replay/pricing0. Source53726893…/PR14draft/emptyworkflowruns проверены. Per-caseprogress иодинDONEcheckpoint.


## 2026-10-18T06:10:25.222035+00:00 — ZSDsevenDONE/remaining13STARTED

# ЗСД: семь sibling boundary checks, КАД-север→КАД-юг

18.10.2026. Проверены семь явно незавершённых siblings группы1e954c437e46; представительСестрорецк→Казань ранее готов и повторно не проигрывался. Каждый frozenreport/captureSHA совпал. SelectedValhalla response geometry точно совпадает с собственной сохранённойroute geometry, tracecomplete иboothcoveragecomplete. В собственномrawtrace подтверждён порядок1766158804/way458501127 →933975069/way375574640; wayset совпадает сrepresentative. Ownmaneuvers подтверждают входсоКАД/Выборгскогош. и выходкА118/КАД/Пулковскому. Materialexceptions0/errors0.

Новыми являются7own boundary exceptionchecks; с прежнимпредставителем группа8/8. Это не новыеroutecaptures, componentdatechecks или fullpricingreplay. Прежнийкомпонентныйпакет74 не перезапускался. Runtime/матрица/тарифы безизменений; новыхpricedcomponents/confirmedfullfares0. Outcome: blocked_by_missing_reliable_data — отсутствует directedowner cash/card collectionbundle/готовыйтарифныйвектор дляточныхграниц. Физическийwayset/ПВП не подтверждаетсумму300₽/зона.

Недостающиевworkingtreecaptures восстановленыизсуществующихlocalGitblobs сlazyfetchdisabled. Проверены7reportSHA/7captureSHA/GitblobSHA. Per-case/progress атомарны; пакет0.168с, network/provider/pricing/replay0. Fulltests/build дляevidence-only не требовались и не запускались. Метод выбираетownselectedproviderroute и сравниваетгеометрию; используетownmaneuverindices, неиндексыtraceoutputshape.

STARTED816e8752…/treea5c9d8e2…,5paths/head/PR14draft readbackPASS. Вариантыreceipt/sourceкМ3/М4неповторялись. Подробныефакты:cases/*.json,summary.json,progress.json,recovery-progress.json.

Следующийboundedbatch13(4+3+6): experiments/nationwide-tolls/checks/2026-10-18-zsd-remaining-thirteen/inputs.json. Сначалаdurablereadback,послебезсети/replay.


## 2026-10-18T06:14:59.345709+00:00 — remaining13ZSDboundarychecksDONE

# ЗСД: оставшиеся13 собственных boundary exception checks

18.10.2026. После7завершённыхchecks группы1e954 проверены13явноuncheckedsiblings трёх других ранее оценённыхscopegroups. Представители не пересчитывались. По каждому провереныfrozenreportSHA,captureSHA,точное совпадениеownselectedproviderresponsegeometry с выбраннойroutegeometry,полнотаtrace/boothcoverage,порядокПВПвrawtrace иownentry/exit.

| Группа | Новыеchecks | С готовымпредставителем | Физическое различие |
|---|---:|---:|---|
|3493, КАД-юг→КАД-север,OSRM|4|5/5|Другая севернаяполоса1766158809|
|3404, КАД-север→КАД-юг,OSRM|3|4/4|Северныйвъезд5745105499|
|2c00, Макарова/Шкиперский→КАД-юг,Valhalla|6|7/7|Рамка13020687195/way351741889 иПВП933975069|

УOSRM собственныевходные/выходныеmaneuvers включаякоординаты совпали ссоответствующимпредставителем; утретьейгруппы собственныйtrace содержитточнуюрамку,аинструкции —съездкКАД/Пулковскому. Rawboothorder иwaysets совпали вкаждойгруппе. Error0, finalmaterialexceptions0. Пакет0.615с; сети/providercalls/pricingcalls/fullroute replay0. Вэтойсессии20новыхsiblingboundarychecks(7+13), неповтор74pricingchecks.

**Уточнениерамки2c00:** первичнаяодноразоваясверка ошибочнотребовалаtoll=true наapproachedge. Это вызвало6ложныхпредварительныхотличий. Вretainedrepresentative икаждомсобственномcapture фактическиtoll=false приnode.type=toll_gantry,way351741889. Исправлено сравнениесфактамипредставителябезповторногопарсингаcapture: идентичностьрамкиподтверждена, но необходимость/размеротдельнойплаты неподтверждены. Исходные6выводов иinitialsummary сохраненывinitial-gantry-toll-assumption/, correction —comparison-correction.json. Ниtoll=false,нитипрамки неозначаютдоказаннуюбесплатность/плату.

**Итог:** все3группы остаютсяblocked_by_missing_reliable_data: нетнаправленногоoperatorcash/card collectionbundle иготовоготарифноговектора дляточныхграниц; у2c00 отдельнонуженохватвъезднойрамки. Новыхpricedcomponents/confirmedfullfares0, runtime/матрицане менялись. Исторические26priced/50unknown несчиталисьзаново. Теперьнеосталосьявноunchecked sibling boundary cases вdirectedGroupReviews; это завершениеэтойсверки, неготовностьтарифовиливсегокалькулятора.

Missingworkingtreecaptures восстановлены толькоизсуществующихlocalGitblobs сGIT_NO_LAZY_FETCH=1. Проверены13reportSHA/13captureSHA/GitblobSHA; JSON/diff/progress. Fulltests/build не требовались дляevidence-only ине запускались. ПоследнийcodeCI39101746826 completed/success относитсяк65bed1ae…; онневыдаётсяза новуюпроверкуэтихданных.

STARTEDd28d6629…/tree06f5a119…,17path/head/PR14draft readbackPASS. Методselectedgeometry/trace следуетexistingreview-zsd-remaining-scopes.py; trace-outputshapeindices не используютсядляselectedinputcoordinates.

NEXT: нерасширятьrouteaudit. Следующийнезависимыйпробел —operatorrule/datedreceipt по въездуМакарова/Шкиперскийчерезрамку13020687195 ивыходуКАД-югчерез933975069. Передновымsourcepass boundedSTARTED сточнымnewsource; общие300₽/зона,наличиерамкиилиtolltag не выбиратькакцену. М3date/M4physical545 удерживатьBLOCKEDбезновогонезависимогоисточника.


## 2026-10-18T06:23:04.436340+00:00 — STARTED exactZSDinterchange source

Sourcefb097de6…/PR14draft/emptyruns проверены. Вretainedindex найдены95-1/pr47/pr8-1,ещёнечитались. Бюджет3PDF+1exactOSMway,max20с/12MB,parallel2. Inputs:experiments/nationwide-tolls/checks/2026-10-18-zsd-shkipersky-source/inputs.json. Existingroutebatch не повторять; actualinterchangeidentity отдельноотbillingproof.


## 2026-10-18T06:27:49.494322+00:00 — RVP64 primaryidentity / Shkipersky tariff distinction

# ЗСД: отдельный тариф развязки и идентификация РВП-64

18.10.2026. Новый проход ограничен четырьмя точнымиGET:3новыхPDFпо ссылкам сохранённогоownerindex и1exactOSMway/full. Все4HTTP200, raw/URL/дата/SHA сохранены. Старыеобщиетарифныестраницы иroutebatches не повторялись.

## Что установлено

- В собственных ранее проверенных маршрутах находится node13020687195 наway351741889. НовыйprimaryOSMresponse называет его **РВП-64**, ref:rutoll=64E, координаты[30.2224424,59.9615898], operator «Магистраль Северной Столицы». Way — односторонний проспект Крузенштерна. Это точная идентичность ранее записанногоnode/way; радиусы и геометрические пороги не менялись.
- Тариф Шкиперскойразвязки по приказу95 от29.12.2025 перечисляет РВП571/581/59/60. **Связь РВП-64 с этим тарифом не доказана.** Ранее использованный общий label «Макарова/Крузенштерна/Шкиперский» недостаточен для назначения отдельного продукта; номер64 должен проверяться отдельно.
- Пункт2этоготарифа освобождает пользователя безтранспондера от отдельнойплаты заШкиперскуюразвязку, сохраняяоплатуосновногоЗСД поегоправилам. Пункт4 отдельно ограничиваетнетарифицируемыймаршрут Шкиперский↔Макарова. Ниодноправило не превращает нашмаршрут доКАД-юг вfree/0 и не привязываетавтоматически64.
- Приказ47от26.06.2025 —толькоразовоебесплатноеокно27.06.2025 16:00–21:00; кпоездкамоктября2026 не применяется. PDFсканированный:пустойpdftotext не считалсяотсутствиемсодержимого, страницапрочитана визуально.
- Старые правилаШкиперскойразвязки2024года определяют581/59/60; текст всех9страниц извлечён,визуальнорассмотрены2/5/6. Тариф95иприказ47визуальнопровереныцеликом(по1странице). PNGпросмотрадляQAв/tmp/pdfs/shkipersky; исходныеPDF/text/hash сохраненывGit.

## Решение

Уточненаphysicalidentity; прежнююгипотезуотдельноготарифаШкиперскойнеприменятьк64. Полныйcash/cardbundleдляРВП64→ПВП933975069 пока **blocked_by_missing_reliable_data**. Новыхтарифов/компонентов/подтверждённыхполныхцен0, runtime/матрицабезизменений. Отсутствиеотдельнойплатывчужомпродукте не означаетнулевойценыосновногоЗСД.

Проверки:4rawSHA/metadata/PDFmagic, XMLnodeвexactway, PDFtext+visual, JSON/diff. Fulltests/build не требовались ине запускались дляsource-only единицы. STARTED42c3e310…/tree8fd50939…,5path/head/PR14draft readbackPASS.

NEXT: только новыйточечныйownerисточник соответствия РВП64/ref64E иcash/cardscope доКАД-юг. ПередновымsourcepassboundedSTARTED. Не повторять4завершённыхGET/маршруты/общиетарифы; не назначать13/6₽или0изtariff95этомуnode.


## 2026-10-18T10:38:15+03:00 — восстановление сохранения

После сообщения о зависании восстановлена только передача готового результата: отдельные tree/commit/ref, затем точный readback 19/19 файлов. Remote source DONE `ccde1c328359c39d5bdc1ba819d2ff4798dea536`, tree `616bc88d5c01adcadd62ab821bb9d33463081ff8`; PR #14 открыт/draft. Источники и расчёты повторно не запускались. Нового CI нет ([skip ci]). Полные ограничения и продолжение: [recovery checkpoint](../../docs/checkpoints/2026-10-18-1038-zsd-save-recovery-DONE.md).


## 2026-10-18T10:47:29.621070+03:00 — recovery handoff и STARTED нового точного RVP64 source

# STARTED — РВП-64: действующие правила и схема ЗСД

Время МСК: 2026-10-18T10:47:29.621070+03:00. Source head `ccde1c328359c39d5bdc1ba819d2ff4798dea536` / tree `616bc88d5c01adcadd62ab821bb9d33463081ff8`; разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 open/draft. Последний observed code CI #39101746826 completed/success; новых active/queued runs в просмотренной очереди нет.

Подготовленная recovery-запись 10:38 сохранена в этой единице; исходные 19 source-файлов уже подтверждены в ccde1c, не пересчитывались. Для новой сессии создан отдельный sparse checkout из точного remote commit; SHA commit восстановлен побайтно и совпал, дерево не заменялось старой локальной историей. Первичный полный checkout выявил отсутствующие архивные Git blobs в локальной копии; sparse read-tree исключил неиспользуемые архивы, рабочий индекс до изменений чистый. Архивные аудиты не перезапускались, удалений в commit нет.

## Ограниченный остаток

1. Скачать один ещё не прочитанный PDF действующих правил `Pravila0926.pdf`, найденный в сохранённом официальном списке; до одной новой явно связанной схемы только при необходимости. Не более 20 секунд / 12 MB на запрос, новых searches/маршрутов/replay — 0. После каждого ответа сразу raw/metadata/SHA.
2. Извлечь текст, выбрать релевантные страницы по определениям продукта, наличным/карте, пунктам оплаты и схемам; визуально проверить выбранные страницы. Сопоставить с уже доказанным RVP64/ref64E без изменения геометрии и без новой трассировки.
3. Сохранить DONE/BLOCKED с точными фактами, выполненными проверками и одним следующим шагом; remote commit/tree/path/head readback. Изменение runtime — отдельная задача только при достаточном доказательстве.

Входы, URL, лимиты и восстановление: `experiments/nationwide-tolls/checks/2026-10-18-rvp64-current-rules/inputs.json`. Если ответ уже сохранён и hash совпадает, продолжить извлечение/анализ, сеть не повторять. Unknown не заменять нулём, полную цену не выводить из неполной суммы. Перед новым источником нужен durable STARTED readback. Full tests/build для documentation/source STARTED не запускались и не требуются; проверяются JSON, ссылки, diff и отсутствие runtime changes. Merge/main/Production/Android не разрешены.


## 2026-10-18T10:52:17.528197+03:00 — текущие правила ЗСД: source review DONE, fare BLOCKED

# РВП-64: действующие правила ЗСД проверены

Один новый официальный GET: `https://whsd.ru/assets/disclosure/70/Pravila0926.pdf`, HTTP 200, 10558533 байт, SHA256 `659346fb36a6cccb022d5fb61ee5396b82d62b6bbacdac023fe20447192d3bd2`. Raw и metadata сохранены в `experiments/nationwide-tolls/source-snapshots/zsd/2026-10-18-rvp64-current-rules`. PDF содержит 29 сканированных страниц; pdftotext вернул только разрывы страниц. Это не считалось отсутствием данных. Контактный лист — обзор 29 страниц; подробно визуально прочитаны PDF-страницы 1, 2, 12–17, 28–29 (печатная нумерация на единицу больше). Остальной текст PDF подробно не проверен.

## Вывод

Документ — приложение 1 к приказу 40 от 21.09.2026; сохранённый официальный перечень указывает действие с 01.10.2026. Пункт 6.2.2 разделяет оплату обычной дороги наличными/картой на барьерном ПВП и специально перечисленные безбарьерные направления Витебской развязки. Схема в разделе 12 относится к Витебской развязке у Кубинской/Благодатной улиц, а не доказывает тарифную идентичность РВП-64. Раздел 13.6 о постоплате без транспондера нельзя переносить на РВП-64 только из-за общего названия ЗСД.

Точная операторская привязка въезда `13020687195` / `64E` к тарифным зонам и полный набор сборов до `933975069` по-прежнему не доказаны: **заблокировано отсутствием надёжных данных**. Новых клиентских цен и подтверждённых полных тарифов — 0. Runtime и матрица не менялись. Повторных routing/trace/replay и старых source GET — 0. Дополнительная схема не запрашивалась: PDF не дал новой связанной схемы, нужной для РВП-64.

## Проверки и продолжение

Raw SHA256/metadata/PDF magic, PDFinfo, визуальная проверка перечисленных страниц, JSON и git diff — выполнены. Full tests/build для source-only шага не запускались. Источник полностью сохраняется в Git, не заменяется потерянным raw или URL.

Следующий шаг: новый ограниченный **поиск точной идентичности** РВП-64/ref64E у оператора и схемы въезда Макарова/обычного сбора; не повторять этот PDF, 4 Shkipersky GET, 74 component checks и 20 sibling checks. До новой сети сохранить STARTED с лимитами.


## 2026-10-18T11:23:44.288166+03:00 — восстановление после сообщения об остановке

# Recovery DONE / STARTED — точный поиск оператора для РВП-64

МСК: 2026-10-18T11:23:44.288166+03:00. Пользователь сообщил о повторном зависании. Фактическая точка: предыдущий PDF/source review и сохранение полностью закончены в `e5e3042b6f7aacf0c95b604fa731c5111ac5763d`; 9 path/tree/blob/head checks прошли, PDF blob `47bfc1aba5884859cb92089a3042951dda1beb2c`. Ветка и PR #14 head повторно сверены, draft=true. Последние observed runs #39101746826 и #39071021984 completed/success; docs-only source commits новых PR runs не запускали. Незавершённого расчёта/передачи PDF нет, локальные tracked paths чистые.

Проверка процессов через ps завершилась `fatal library error, lookup self`; отсутствие зависшего процесса этим не доказано. По наблюдаемым GitHub данным active/queued writer нет; дублирующий аудит/отмена CI не выполнялись. Скриншоты пользователя показывают длительность UI, это не доказательство состояния отдельного процесса.

## Деление только оставшегося шага

1. Не более двух точных поисковых запросов: `"РВП-64" ЗСД` и `site:nch-spb.com "Макарова" "без транспондера"`. Сохранить оба результата и per-query progress. Готовность: 2/2 ответа либо явная ошибка инструмента. Не повторять ранее изученные PDF/маршруты.
2. Прочитать не более двух **новых** страниц/схем первичного оператора, найденных в этих ответах. Уже сохранённые URL читать локально. До 20 секунд и 3 MB на прямой GET. При отсутствии нового релевантного источника часть завершается без GET, с точным пробелом.
3. Сохранить результат по точной идентичности/платёжному охвату и DONE/BLOCKED; одна итоговая единица с raw/progress/SHA, commit и readback. Тариф не активировать без полного доказательства.

Входы: `experiments/nationwide-tolls/checks/2026-10-18-rvp64-exact-owner-search/inputs.json`. После прерывания продолжить с первого незавершённого ответа, завершённый поиск/чтение не повторять. Полные tests/build для source-only STARTED не запускались. Main/merge/Production/Android не разрешены. STARTED должен быть durable до сети.


## 2026-10-18T11:26:39.363248+03:00 — exact RVP64 search DONE / pricing BLOCKED

# РВП-64: точный поиск завершён

МСК: 2026-10-18T11:26:39.363248+03:00. Durable STARTED: `c3470606b3423b49ae533627fa0c6f6ee7bad2de`, tree `580791f4338cda1d98ea25de6d1bc0c3a07b22f7`; 5 paths/tree/head/PR draft readback прошли. После первого ref update PR metadata кратко показывали старый head; повторные независимые ref/PR/commit reads подтвердили новый head и точное дерево. Повторного update_ref не было.

Выполнено ровно два заданных поисковых запроса через system1. Полный объединённый ответ и SHA сохранены; сервис не приписал результаты отдельным запросам, поэтому поштучные hit counts не придуманы. Progress обоих запросов сохранён.

Объединённый ответ дал одну стороннюю публикацию от 11.11.2020 с историческими поездками 2019/2020 и транспондером. Это только lead; действующий операторский тариф наличными/картой и точная привязка въезда им не подтверждены. Новых релевантных страниц оператора не получено, дополнительные GET не выполнялись. Сторонняя публикация не подменяет первичный источник и не добавлена в активную матрицу.

## Итог по причине

**Заблокирована отсутствием надёжных данных.** Нужны первичная операторская схема соответствия `13020687195` / `РВП-64` / `64E` тарифному продукту и полный набор сборов до `933975069`. Новых цен, подтверждённых полных тарифов, маршрутов, trace/replay — 0. Runtime не менялся. Прошлые PDF и route batches не повторялись.

## Проверки и точка продолжения

Проверены JSON inputs/raw/progress/result, SHA raw, локальные ссылки и git diff. Full tests/build не запускались: source-only изменение. Последний наблюдаемый code CI #39101746826 успешен; это не CI для docs-only commit. PR #14 остаётся draft.

Повторять текущие два запроса, PDF действующих правил, Shkipersky pass, 74 component и 20 sibling checks нельзя без нового конкретного основания. Эту причину продолжать только при новом независимом документе оператора, схеме точного въезда или датированном чеке наличными/картой. Не считать unknown нулём. Merge/main/Production/Android не разрешены.


## 2026-10-18T12:07:52.076798+03:00 — isolated new M11 head physical target / STARTED

# STARTED — точный въезд ЦКАД47→М11 вместо рамок ММК50

МСК 2026-10-18T12:07:52.076798+03:00; source `ca58a6ebd603aec149103a3e1c2e3f3fa5f392ec`, PR14 draft, ветка `fix/v3-missing-route-prices-2026-10-15`. Последний code CI39101746826 completed/success, локальный tracked index чист до начала. Автоматизации не создаются по решению пользователя; продолжение вручную.

Из старого собственного capture (SHA `e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0`) выделен ранее не привязанный конкретный въезд: toll_booth8087316065 наway954011576, далее954011577→791520973→1270188032 (первый именованный paidМ11). Точные выбранные рёбра/ноды/shapeindices сохранены в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/candidate.json`. Гипотеза — отдельный ЦКАД47/ПВП18, а не ММК50/ПВП6Б2. Официальная сохранённая тарифная таблица различает `tskad` и `mmk_a107`; одинаковое название дороги не разрешает подмену пары.

Предыдущие8case reviews/41mainlinecases не повторяются. Новая причина source pass — конкретный иной gate/way из уже сохранённого trace. Сам capture/replay не меняется.

## Остаток текущего блока

1. До3 новых exactprimaryGET: node8087316065, firstM11way1270188032/full и локальная карта вокруг полученной точной координаты. Каждый20с/12MB, search/routing/trace/replay0; raw/metadata/hash после каждого.
2. Прочитать только релевантную сохранённую operator PDF страницу5 и связность направленных ways. Установить достаточность физической/операторской привязки; если пробел остаётся, не назначать цену.
3. Один DONE/BLOCKED checkpoint с точными проверками, сохранением source proof и next step. Runtime — отдельный блок только при доказательстве, с focused/full gates.

Входы/ограничения/условия повтора в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/inputs.json`. До сети STARTED commit/tree/path/head readback. При остановке повторять только незавершённые части; готовыеGET не повторять. Full tests/build не запускались: source/preparation only. Merge/main/Production/Android не разрешены.


## 2026-10-18T12:12:21.313653+03:00 — CKAD47 source proof DONE / integration STARTED

# М11: северный въезд через ЦКАД47 / ПВП18

Три новых primary OSM GET200, raw/metadata/SHA сохранены. Официальный сохранённый PDF проверен по SHA и визуально на странице5; он отдельно называет ПВП18 «ЦКАД» на47км, ММК48/50 и Солнечногорск58. Опубликованная тарифная таблица уже имеет отдельную пару `tskad→solnechnogorsk`; новая цена не придумана.

Первичный точный узел8087316065 лежит наодностороннем954011576; далее954011577→791520973→1270188032. Все три соединения имеют общий exactOSMnode, последнийway — платнаяМ11. Узел явно зарегистрирован в собственном сохранённом trace. Семь первичных якорей идут по выбранной геометрии в правильном порядке; максимальное отклонение вспомогательного локального анализа0.041м. Порог25м не расширялся. Локальная карта сама не включает последнийМ11way (его узлы за пределамиbbox), поэтому он независимо получен exactway/full и соединён через3566326245; отсутствие вbboxне считалосьразрывом.

Это конкретный новый source target, не повтор восьми replay. Доказательство только северного въезда; обратная рамка и остальные маршруты не включены автоматически. Source proof: `experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-entry/directed-ckad47-entry.json`. Runtime/тарифы пока не менялись, новых компонентов/подтверждённыхполныхцен0.

## STARTED — узкая интеграция

После durable readback source proof добавить строгий matcher северного въезда: complete selected validation, exactgate/way, непрерывная четырёхwayцепь, семьупорядоченных физических якорей, существующее strict mainline58→679 proof. Выбрать готовую пару `tskad→solnechnogorsk` по отправлению. Негативные проверки: reverse, чужой/нетgate, неполнаяvalidation, пропущенныйway/якорь, геометриямимо, headless/сквозной/MMKконтроли. Затем обязательныеfocused/fullgate/build; исходы сохранять до перехода к siblingcases. До долгойпроверки сохранёнэтот STARTED.


## 2026-10-18T12:22:04.441702+03:00 — M11 CKAD47 code fix and verification DONE

# DONE — северный въезд ЦКАД47→М11

МСК 2026-10-18T12:22:04.441702+03:00. Source proof durable `6b83a64899b8d45fe10ff2d8780fff066f50e503`, tree916647a1402813e679bdd80df5bdca784d78cfdc; readback15 paths/head/draft PASS. Одна разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft.

## Исправление

Новый `m11-ckad-head-entry.ts` распознаёт отдельно доказанный ПВП18 «ЦКАД» на47км. Требует полного собственногоvalidation, точногоgate8087316065 на954011576, платного продолжения1270188032, семиorderedanchors и прохождения по38точкам независимой первичнойOSMцепи в25мкоридоре. Reverse/обход/неполноеtrace не разрешены. `m11-product-boundaries.ts` добавляет готовую `tskad→solnechnogorsk` только при уже доказанной strict mainline58→679 и северном порядке. Москва/ММК/обратныйпроезд не заменяются этой парой. Runtime содержит физическиеOSMякоря, не case/архивныйcapture/маршрутнуюцену.

Один собственный target `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`: ранее headunknown, теперь280₽по отправлению15Oct09:00 и320₽по17Oct09:00. M11head+mainlineсоставляют4180/4520₽, **это не полная поездка**. Общийcomposer проверен с запретом fetch: pricedМ11head/mainline/tail иМ12; missingЦКАД/ЗСД, wholeunknown, requests0. Новыхpricedcomponents1, подтверждённыхполныхтарифов0.

## Проверки

Focused20/20; fullaudit757/757 +quote/API contracts PASS; targetedESLint PASS; `tsc --noEmit --incremental false` PASS; Next/Turbopackbuild16/16 PASS. Отдельныйcomposerprobe PASS без сети. Исходные архивныеcapture/hashes сохранены без правок.

Первый exploratoryguard требовал non-toll approachways в paid-onlywayIds и правильно далunknown; контракт исправлен наexactgate+paidcontinuation+independentphysicalcorridor. Три первыхfullgate попытки остановились на отсутствующихfixture в sparse checkout; восстановлены точные старыеGitblobs, затем757/757. После этого Nextотвергвнешнийnode_modules symlink; создана локальная hardlinkкопия зависимостей, package/lockfilesне менялись. Повторная самостоятельнаяNextсборка16/16прошла. Ошибки/успешныевыходы сохранены gzip в`experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/implementation-logs`; эти ошибки не скрыты и не объявлены успешными npmrunbuild.

## Продолжение

После публикации проверить actual codeCI; до его завершения не писать в ветку. Затем отдельный boundedSTARTED на семь остальных headcases: только owncapture/gate/way/geometry/датированныепары по новой общейпривязке, per-caseprogress, без повторных восьми replay/41routeaudit и новой сети. Они **не засчитаны** текущим представителем. Baselineочередь и canonicalистория сохранены, latestFixReviewотдельно. ЗСДРВП64/ЦКАД/М12прочиепробелы не закрыты этимисправлением. Merge/main/Production/Android не выполнялись.


## 2026-10-18T12:32:21.990710+03:00 — codeCI success / seven-case STARTED

# STARTED — семь оставшихся М11 head cases

МСК 2026-10-18T12:32:21.990710+03:00. Source code `29129946ed7445677332749857f89efbc9ff546b`; CI39115104478 **completed/success**, оба jobsverify/live_probecompleted/success. Remote/PRhead повторносовпал,PR14draft;разрешённаяветка `fix/v3-missing-route-prices-2026-10-15`.

Цель: проверить применение уже сохранённой севернойпривязкиЦКАД47→М11 ксеми оставшимся собственнымcapture. ПервыйпредставительАрзамас→Приморскийнеповторяется. Входы7точныхGitblob/path,6code/dataSHA и14datedпрофилей в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-seven/inputs.json`.

Лимит:7cases,2датыкаждый,60секработы; новыхсети/routing/trace/sourceGET/fullpricingreplay0. Проверяется собственныйrawGitblobSHA,полнотаvalidation,exactgate/paidcontinuation/38pointcorridor/7orderedanchors,strictmainline58→679 иготоваяheadпара. Длякаждого3negativeguards:reverse/incomplete/absentgate. Полныеитогипоездок ипрочиедорогивэтомблокенепересчитываются.

Runner `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-seven/check-head.mjs` сохраняеткаждыйрезультат иprogressатомарно. ПрипрерыванииDONEпереиспользоватьтолькоприinput/runner/runtimefingerprint+blobсовпадении;иначестоп. Любоеотличиефактическихданныхсчитатьmaterialexception,неослаблятьguard. Заодинпакетодинитоговыйcommit/readback;поштучныхCIнебудет. Runtimeнеменяется,fullgateповторне нужен;проверкиrunner syntax/JSON/hash/diffдостаточныдляsource-onlyпакета.

ПослеdurableSTARTEDreadbackвыполнитьодинrunnerзапуск,прочитатькаждыйcaseиитог,сохранитьDONE/ошибкуиобновитьочередь. БлокиЗСД/ЦКАД/М12необъявлятьзакрытыми. Никакихавтоматизаций,merge/main/Production/Android.


## 2026-10-18T12:35:35.102446+03:00 — seven CKAD47 head siblings DONE / cause fixed8of8

# DONE — семь оставшихся случаев въезда ЦКАД47→М11

МСК: 2026-10-18T12:35:35.102446+03:00. Source code `29129946ed7445677332749857f89efbc9ff546b`; CI #39115104478 completed/success, verify/live_probe оба success. STARTED `7ca43b55783109fb53b9df31070759c83080cbd4`, treea57bca01f5d015003bc0a2336f7ade822a028965, 6paths/head/tree/draft readback PASS. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft.

## Выполнено

Проверены **7 собственных сохранённых маршрутов / 14 профилей отправления** (15 и17 октября09:00МСК). Каждый исходныйGitblob совпал с inputs; сохранены rawSHA256, provider, физическийgate, статус полныхtrace, направленные boundary, готовая headпара и исход без selectedgatevalidation. Первый представительАрзамас→Приморский не повторялся.

Во всех7случаях новая привязка даёт `tskad→solnechnogorsk`:280₽на15Oct и320₽на17Oct. M11head+mainline4180/4520 — только компонентыМ11, не итог поездки. Материальных исключений0; отрицательные проверки reverse/incomplete/absentgate **21/21 PASS**. Безselectedgatevalidation headnull во всех14профилях.

Вместе с ранее сохранённым представителем эта конкретная причина закрыта **8/8 собственных случаев**; 16стандартных datedheadprofiles, новыхвтекущемпакете14. Новыхвосстановленныхheadcomponents7, суммарно8поэтимвосьми. Новыхнезависимоподтверждённыхполныхтарифов0. Остальные платные системы/готовностьРоссии этими числами не измеряются.

## Что не повторялось

Routing/trace/sourceGET/fullpricingreplay/network — 0. Проверялся только сохранённый selected capture и новый общий guard сдатированнымM11component. Всеcaseoutputs/progress сохранены атомарно, каждый результат имеет input/runner/runtime fingerprint. Runtime и матрица в этом пакете не менялись. Fullgate/build не повторялись: неизменный code уже имеет 757/757+quote/API/TS/ESLint/Next16/16 локально и успешный GitHubCI.

## Очередь и продолжение

По тем же13исходным findingrecords теперь: **2 fixed,1 not reproduced,7 blocked,3 deferred**. Предыдущая сводка1/1/8/3 и старые headsource-gated результаты сохранены в истории; когорты маршрутов не складываются. Это изменение одной причины, не новая нумерация этапов.

Следующий точный случай: **Торжок→Раменское**, `pair-m11-ckad-torzhok-to-ramenskoe`, из оставшейся М11 58–679 причины. Сначала точные сохранённые въезд/съезд и уже имеющаяся primaryгеометрия Торжка. Не переносить подтверждённыйвыезд p679→p258 на иной въезд/направление без proof; не повторять41/15/готовые8. До длительного source/testзапуска новый boundedSTARTED.

Проверки текущего пакета:7rawGitblob/sha,6runtime/datafingerprints,14ownprofiles,21negativeguards,7caseoutputSHA,JSON/progress/queuecanonicalcounts,runner syntax иdiff PASS. Имена caseoutputs иSHA вsummary.json; ошибки/исключения0. STARTED до выполнения уже durable. Последующий DONEcommit/tree/path/headreadback выполняется до следующего независимого шага. Merge/main/Production/Android/автоматизации не выполнялись.


# Торжок → Раменское: отдельный въезд — DONE / тариф BLOCKED

18.10.2026. Parent `4067d68f4cb750070b1c022b81105cf7565784f1`, разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft. Предыдущий пакет 8/8 сохранён: exact tree и 16 paths проверены. Для parent workflow_runs пуст; последний code CI 39115104478: verify/live_probe success.

Один короткий offline-разбор собственного полного Valhalla capture, два профиля отправления (15/17 октября 09:00 МСК). Архивный blob отсутствовал локально; получен из той же версии GitHub и импортирован в Git objects с проверкой SHA c4c60b8987cb2ff44be21df4a0359249c90b5cfb и SHA256 из прежней очереди. Захват не повторялся.

Выбранные события: въезд 5286168661 / way766468434 (edgeToll=false), последующий 8087316064 / way1270188041 у ЦКАД. Начало именованного блока М11 [35.426147,56.983081], примерно в40.94км от gate p258. Ближайшая точка всего маршрута к gate p258 —20.63км. В retained primary карте ПВП8 есть противоположная рамка5286254520, но нет фактического въезда5286168661. Нельзя считать название города доказательством въезда p258; иное тарифное имя пока не назначено.

Текущий p679→p258 guard корректно false; оба профиля возвращают m11_outer_boundaries_unresolved. Это проверка границ, не полный pricing replay и не подтверждение полного тарифа. Сетевая тарификация/routing/trace0; один connector-read существующего capture. Runtime/тарифы не менялись; full build не запускался. Одна причина остаётся заблокирована отсутствием надёжной привязки, глобальные счётчики не увеличены как за исправление.

Воспроизведение: `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/checks/2026-10-18-m11-torzhok-ramenskoe/inspect.mjs`, exit0. Полные выбранные поля и SHA в result.json. Скрипт запрещает fetch; проверяет blob, completeness и ожидаемые отрицательные результаты.

NEXT: отдельный bounded STARTED для primary node5286168661, way766468434/full и при необходимости локальной карты связного въезда. Установить физическую направленную цепь и сопоставление с официальной тарифной границей. Не переносить p258/другую точку по близости; прежние41/15/8 и ЗСД PDF не повторять. Перед записью проверить PR/branch/отсутствие active CI; non-force expected parent, затем exact tree/blob/head readback. Фактический remote SHA фиксируется транспортом после сохранения.


# Точный въезд М11 5286168661 — STARTED

18.10.2026 12:42 МСК. Parent b6df97d0497bd30d4ccf7912fbe0aa9ad9fa9acd; local/PR head совпали, PR14 open/draft, ветка fix/v3-missing-route-prices-2026-10-15. Последние5 Actions completed/success; активных запусков в выборке нет. Предыдущий отдельный разбор сохранён, capture SHA c4c60b8987cb2ff44be21df4a0359249c90b5cfb не переснимать.

Цель: первичная идентичность node5286168661 / way766468434 и направленное платное продолжение; не назначать тарифную точку по названию Торжка. Не переносить p679→p258 guard.

Лимиты: сначала два GET exact node и way/full, затем максимум одна локальная карта до0.02° на сторону при конкретном пробеле связности. Каждый запрос timeout15s, суммарно до45s; без retry/routing/trace/price replay. Существующий capture-m11-p258-sources.mjs сохраняет полные bytes/HTTP/SHA/progress и пропускает уже сохранённые ответы. Выход source-snapshots/m11/2026-10-18-entry5286168661/. После получения short offline review и DONE; код/цены до доказательства не менять.

Recovery: продолжить по metadata/progress, не повторять сохранённые GET. При timeout сохранить ошибку и конкретный gap. После DONE exact tree/blob/head readback до следующей независимой работы. Официальный тариф и соответствие exit ЦКАД могут остаться отдельными блокерами; unknown не free. Main/merge/Production/Android/автоматизации не разрешены.


# М11: точный въезд 5286168661 — DONE SOURCE / тариф не включён

18.10.2026. Parent и durable STARTED a6018ad2e74a760edcfb8a428fd83f4265defef0, exact tree/4 paths/PR head draft проверены. Разрешённая ветка fix/v3-missing-route-prices-2026-10-15. До STARTED пять последних Actions completed/success, последний code run39115104478 по29129946. Предыдущий capture не переснимался.

## Установлено

Три новых primary OSM GET, все HTTP200: exact node5286168661, way766468434/full, одна карта bbox35.419,56.976,35.438,56.994. Суммарное networkElapsedMs в progress.json; каждый запрос ограничен15s, retry0. Полные bytes/метаданные/SHA/progress сохранены в source-snapshots/m11/2026-10-18-entry5286168661. Источники: https://api.openstreetmap.org/api/0.6/node/5286168661 ; https://api.openstreetmap.org/api/0.6/way/766468434/full ; https://api.openstreetmap.org/api/0.6/map?bbox=35.419,56.976,35.438,56.994 . OSM © OpenStreetMap contributors, ODbL.

Рамка fee=yes, cash/mastercard/visa=yes; gate way oneway=yes, destination Москва / М11. Полная directed цепь766468434→766468433(toll=yes)→547081894→496959520→1205158257(toll=yes,refМ11). На промежуточном4886068970 начинается именованный block provider. 61 независимая первичная точка совпадает с собственным capture в строгом порядке; max deviation0.0000555км, strict begin0.0000288км. Это не расширение допусков и не перенос p258.

Соседний way655195663 назван «ПВП Лихославль —214км», ближайшая вершина в70.56м от рамки. Рамка не объявлена находящейся внутри этого здания. Retained Order274 control имеет p214 (Букарево), дата04.09.2026. Километр согласован, имя отличается: p214 записана как candidate, не выдана за независимую operator lane crosswalk. Ни p209, ни p258 по названию исходного города не назначались.

## Проверка и ограничения

`python .../build-proof.py`, затем `node --import ./scripts/register-ts-paths.mjs .../verify-capture.mjs`: exit0, SHA источников и собственного capture проверены,61/61ordered point matches, exact selected gate way766468434. Полные результаты binding-proof.json, physical-only directed-entry.json. build-proof.py пересоздаёт промежуточный proof, verifier завершает его; operatorPointReview добавлен отдельно из retained current control. Новые routing/trace/full pricing replay0. Runtime/цены не менялись, новых рассчитанных компонентов0, подтверждённых полных тарифов0. Full build не требовался и не запускался. Предыдущие8/41/15cases и ЗСДне повторялись.

## Точный следующий шаг

Короткий offline review: сопоставить p214 с retained operator документами и проверить собственное пересечение p58 и выход кЦКАД8087316064 по retained геометрии. Оставшийся gap обозначить отдельно; если нужен новый source — bounded STARTED, без повторов этих3GET. Runtime включать лишь для строгой доказанной пары, полная цена по-прежнему зависит от других компонентов. Перед сохранением сверить PR/branch/activeCI; non-force expected parent a6018ad2…, затем exact tree/blob/head readback. При сбое передачи продолжить сохранение этих файлов, не повторять source capture. Main/merge/Production/Android/автоматизации не затрагиваются.


# М11 p214→p58 — SOURCE REVIEW DONE / IMPLEMENTATION STARTED

18.10.2026. Parent b9248a5d1257d8fb2cc5e8a480c3273473421b28, local/PR head совпали; PR14 draft, последние3 Actions completed/success (code39115104478). Три GET и61точка sourceproof сохранены, не повторяются.

Короткий offline review: точный gate5286168661 находится на московском въезде комплекса «ПВП Лихославль —214км», в70.56м от именованного административного здания. Операторская утверждённая Order274 таблица содержит p214/Букарево,км214. Принимается source-derived physical binding кp214 по километру, комплексу и связной направленной цепи, как для p258. Это не независимый операторский lane crosswalk или OD-чек; источник и ограничение сохраняются. Разные названия комплекса/деревни не подменяются названием города Торжок. Старый статус candidate сохраняется в source-only checkpoint.

Own capture c4c60b8987cb2ff44be21df4a0359249c90b5cfb: полный selected Valhalla, entry5286168661/way766468434, paid766468433 и1205158257, strictbegin у4886068970. p58 independent anchor3243217926 проходит в32.1м; индекс963.43 после gate и до strictend1036. Другие якоря p58 в66–103м. Уже принятые120м generic p58 допуски не расширять. End южнееp58, gate8087316064 на переходе кЦКАД; retained CKAD карта подтверждает его way1270188041, но эта рамка не даёт автоматически точную headfare. Map не полностью покрывает strictend, поэтому head58→ЦКАД сохраняетсяunknown.

План bounded реализации: отдельный inspectM11P214Entry с полным selected coverage/chunks, exact unique gate/way, двумя paid ways,61точкой independent corridor в25м, strictbegin25м, плотностью и направлением, p58 до strictend. Только directed p214→p58; headDetected=true,head=null. Reverse/прочиеp214/переезды и обрывочные capture не включать. Runtime physical JSON не содержит caseID/времени/цен/benchmark. Два профиля тарифицировать существующей таблицей Order274 по отправлению. Нового routing/trace/source/full routeaudit нет.

До кода сохранить этот STARTED exact tree/path/head. Затем focusednegative/regression и owncomposercheck, обязательные pnpm build/audit, tsc/ESLint. Риск прерывания: каждый процесс ограничить временем, логи писать в checks/2026-10-18-m11-p214-entry/, результаты сохранять DONE/FAILED без повторов готового. Следующий блок — диагностика исключенийsiblings только после codeCI и отдельногоSTARTED; эта реализация не засчитывает непроверенныеcases. Runtime/build не выполнены этимSTARTED. Main/merge/production/Android/автоматизации не затрагиваются.


# Восстановление p214 после остановки — STARTED

18.10.2026 13:34 МСК. Последний подтверждённый remote/local/PR14 head d1d0bd9797ca3ae9351de8a1898090bbdf372353, draft. STARTED реализации сохранён; runtime не менялся, новых процессов/расчётов нет. Уже готовые3GET/61pointchecks не повторять.

Незавершённый остаток разделён: A) standalone strict physical matcher + короткие focused negative tests, сохранить PART-A DONE с обязательными широкими checks ещё pending, без включения в composer; B) подключение пары p214→p58 и own quote, focused + обязательный full gate/build/TS/ESLint, сохранить результаты; C) точное remote readback и codeCI. Если снова остановится, дробить только незавершённый остаток. Не пересчитывать завершённое при проблеме сохранения. Лимитfocused60s,build300s; полные логи в checks/2026-10-18-m11-p214-entry. До завершенияB не объявлять исправление интегрированным и проверенным. Ценаwholetripunknown, head58→ЦКАДunknown. Main/merge/production/Android/автоматизации не затрагиваются.


# М11 p214 — PART A DONE, интеграция pending

18.10.2026. Source/remote head 4eec0318fe1be828a8ab4effb1a0be354101caf8; ветка fix/v3-missing-route-prices-2026-10-15, PR14 open/draft. Новый session checkout получен git clone непосредственно от текущего remote; worktree был чист. Последние три branch CI completed/success, последний code run39115104478; для docs-only head runs нет.

Добавлен standalone inspectM11P214Entry: полные chunks/booth coverage, единственный exact gate/way, две paid ways, 61 ordered independent points в25м, directed strict begin в25м, плотный corridor и продолжение до p58 в существующих120м, strictend послеp58. В composer не подключён. Тарифы и runtime-ответы не меняются. Исходные GET/capture/sourcechecks не повторялись.

Команда timeout60 node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m11-p214-boundary.test.ts: final4/4PASS, 11 validation-negative variants,5 evidence-negative/null checks,4 geometry-negative checks. Первоначально3/4: проверка corridor ошибочно включала наружную вершину после source-end; проверка внутренних вершин ограничена собственным диапазоном, плотность крайних сегментов сохранена. Initial/final логи в checks/2026-10-18-m11-p214-entry. timeout60 node node_modules/typescript/bin/tsc --noEmit exit0.

Обязательные fullgate/build/ESLint ещё pending вPART B по сохранённому recovery-плану. Это промежуточная часть, не завершённое исправление или подтверждённый полный тариф. Локальный node_modules symlink использует уже установленный набор среды, вgit не включается. Новых сетевых маршрутов/источников0, новых priced components0.

NEXT PART B после durable readback: включить только p214→p58 с headDetected=true/head=null; ownweekday/weekendquote и негативные regression, fullgate/build/TS/ESLint. Полный итог оставлятьunknown из-за head58→ЦКАД. ЗатемPART CcodeCI. Не менять main/Production/Android.


# М11 p214→p58 — PART B DONE, codeCI pending

18.10.2026. Parent d55cc55ee79188ab3aa6960ed025c7091dac4855, tree9ce0761addd1cfb40687ef8ed9cee337526bc21c; remote branch/commit/tree и PR14 head/draft прочитаны и совпали с локальным деревом PART A. Следующий source checkout синхронизирован fetch и недеструктивным update-ref; изменений данных при синхронизации нет. Последние codeCI до изменения completed/success; для PART A [skip ci] runs отсутствуют.

Включён inspectM11P214Entry в resolveM11ProductBoundaries только как southbound p214→p58 fallback при неразрешённых generic boundaries и корректных дате/длительности. headDetected=true/head=null; отрезок p58→ЦКАД не присвоен. Уточнённая physical association p214/source-derived review сохранена в предыдущем STARTED; это не независимый операторский lane crosswalk. Цены берутся существующим matrix adapter из Order274, таблица/цены не редактировались.

Собственный полный selected Valhalla capture c4c60b8987cb2ff44be21df4a0359249c90b5cfb, три отправления: Thu09:00/Thu23:59 дают mainline1250₽, Sat09:00 даёт1390₽. Переход полуночи не меняет профиль отправления. Новых рассчитанных компонентов1; новых подтверждённых полных тарифов0. Полный API итогnull: missing m11-15-58,ckad,unknown-paid-road. Никакого вывода free/0. Эти результаты относятся к одному собственному случаю, остальные41/15/siblings этим не проверены.

Проверки:
- timeout60 node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m11-p214-boundary.test.ts scripts/v3-m11-p258-boundary.test.ts scripts/v3-m11-ckad-entry.test.ts:19/19PASS. Final audit включает точные1250/1390 asserts, malformed/coverage/direction guards. Owncomposer mock fetch attempts0.
- timeout300 npm run build: полный audit762/762PASS + quote/API contractsPASS, затем NextFAIL из-за внешнейnode_modules symlink. Ошибка не объявляется успешной сборкой.
- После замены только localdependency symlink на hardlinkcopy: timeout300 node node_modules/next/dist/bin/next build exit0; Next/TypeScript/static16/16PASS. Package/lockfilesне менялись. Полный audit не повторялся, поскольку код после него не менялся.
- node node_modules/typescript/bin/tsc --noEmit, targetedESLint и git diff --check exit0. Точные команды/returncodes в part-b-check-status.json; gzлоги и SHA в part-b-result.json. Первые tsc/ESLint также без вывода; финальные повторены для однозначного exitcode.

Remote-save/codeCI ещё не выполнены этим локальным checkpoint. После записи требуется exact head/tree/readback, затем наблюдать новый CI. Не запускать другогоwriter при active/queued jobs. Если CI завершёнsuccess, следующий отдельный boundedSTARTED: проверить только ещё не проверенные owncaptures с exactp214 entry на исключения; готовые41/15, source3GET/61checks и текущий case не повторять. Оставшиесяhead/CKAD/unknown-paid-road blockersразбирать отдельно. Main/merge/Production/Android/автоматизации не затрагивались.


# М11 p214 — PART C DONE: remote и CI проверены

18.10.2026. Remote branch/PR14/local head3da74d0f487bdc2b7d9ec4df9a2f8c3d2bb22723; exacttree3604bdd2633a54b379965bfa8a546b9f3f715c0a совпал с локальным PART B. Worktreeclean, PRopen/draft. Сохранение всех16файлов PART B подтверждено совпадениемGitblobSHA и итоговогоtree.

Actions39120413592 completed/success. Jobverify117654704930 completed/success: focused corpus,tsc,Nextbuild. Joblive_probe117654704870 completed/failure, workflowcontinue-on-error=true: geometryPASS, PhotonaddresssearchFAIL, последующие50settlement/YandexstepsSKIPPED. Нельзя объявлятьвесьlivegateпройденным. Логи прочитаны через connector, summary/errorproof сохранены в checks/2026-10-18-m11-p214-entry/part-c-ci-result.json. PhotonHTTP503, затемtimeout10s и totalbudget90s;100failedsources из13queries, completed13/planned13 но statusBUDGET_EXHAUSTED. Rankingfalse на пустом ответе не доказывает ошибку ранжирования; новыхlivequeries/rerun нет. Причина внешнего сбоя: blockedbyexternalavailability; source reliability issue отдельно от M11integration.

p214→p58 исправление и локальные+remote codechecks завершены; полная стоимость и оставшиесяproducts по-прежнемуunknown. Новых тарифных/маршрутных проверок вPART Cнет. Main/merge/Production/Androidне тронуты.

NEXT после durableсохранения: короткаяofflineинвентаризация exact gate5286168661 среди собственных savedcaptures, исключая уже проверенныйpair-m11-ckad-torzhok-to-ramenskoe; перечислить только реальныеuncheckedsiblings с уникальнымиinputSHA. Не повторять41/15 routeaudits. Еслиsiblingsнет — не создавать пустойпакет, перейти к конкретному собственному unresolvedhead58→ЦКАД. До длительногоboundedпакета отдельныйSTARTED. ВнешнийPhotonсбой не считать устранённым.


# p214 inventory DONE / три собственных случая STARTED

18.10.2026. Parent93d7175b562f119cc239160ff68f349cbc81ac06/tree66ef9d497eb54e76b3a8afc014b96faaf020a18e, PR14open/draft; PARTCсохранение подтвердилось после первоначальноустаревшегоPRreadback, rawPR/head/treeповторносовпали. Code3da74d0f CIverifyPASS, livePhotonFAIL сохранён отдельно; activejobsнет.

Короткаяofflineинвентаризация364уникальных gzipcaptureSHA из experiments/nationwide-tolls (18.45s, лимит40s), ошибок0. Проверялись только exact booth osmNodeId5286168661 в собственномvalidation, не цена/маршрут/границы. Inputsmanifest и result в checks/2026-10-18-m11-p214-sibling-inventory. Четыре owncompletecaptures: готовыйРаменское плюс ещётри — pair-m4-m11-torzhok-to-krasnodar, single-m11-torzhok-to-moscow, triple-m11-ckad-m12-torzhok-to-kazan. Это364прочитанныхcapturefiles, не364проверенныхмаршрута или тарифныхслучая. Новыхисточников/запросов0.

STARTED следующий boundedexceptionbatch: только три новыхcaptures, точныеpaths/SHA в checks/2026-10-18-m11-p214-three/inputs.json, два профиляThu/Sat, всего6. Лимит60s. Отдельно проверить ownstrictgeometry, exactentry, matcher/resolver, компонент1250/1390 и owncomposer сохранениеunknownполнойцены. Mockfetch запрещаетсеть; missingvalidation/missinggate отрицательныеguards. Per-caseprogress писатьпослекаждого, готовыйРаменское исключён. Не повторять41/15полныхаудитов, source3GET или61sourcepointcheck. Причина новогоcomponentcheck — новая runtimeреализацияp214, отсутствиеownexceptionresultsэтихтрёх. Тарифнаяматрица/кодне меняются.

После durableSTARTED/readback выполнитьrunner и сохранитьодинDONE/FAILEDсдетальнымирезультатами. Если любойматериальныйисключительныйслучай — не присваиватьемуценуавтоматически; записатьотличие и отдельныйследующийшаг. Полныетарифыunknown, остальныеhead/CKAD/unknownpaidroadblockersнеприкрывать. Затем перейти к собственному head58→ЦКАДboundaries, еслиосталсянеизвестен. Main/merge/Production/Androidне трогать.


# М11 p214 — три own exceptions DONE, ограничение harness сохранено

18.10.2026. Parent5342f28ce4b8c74b640a18f2ff447de0ae378e2b/tree653c1c6b31343a709d03c11ba6cd0965ea7a071a; PR14draft, точный STARTED branch/tree/PRreadbackподтверждён. При первомreadback PRещёуказывалпредыдущийhead; повторныйrawPRсовпал, вычисленияне повторялись. Code3da74d0f, verifyCI39120413592success; PhotonFAILне исправлен.

Выполнен boundedofflineпакет трёх owncaptures, шестьдатированныхпрофилей, девятьотрицательныхguards(nullvalidation/безточнойрамки/reverse). Все3exactphysicalmatcher/resolverпроверкиPASS, каждый mainline p214→p58=1250Thu/1390Sat. МатериальныхисключенийМ11нет. НовыхрассчитанныхМ11компонентов3 (вместесготовымРаменское4), подтверждённыхполныхтарифов0. ПолныйAPIитогnullво6/6. Код/матрица/ценыruntimeне менялись, готовые41/15/sourcechecks/Раменскоене повторены.

Пути: checks/2026-10-18-m11-p214-three/{inputs,progress,summary}.json, cases/*.json, check.mjs, run*.log. CaptureSHAпровереныпередownпроверкой, результатысохраненыпосле каждого case. Команда timeout60 node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/checks/2026-10-18-m11-p214-three/check.mjs.

Ошибки не скрыты: перваяпопыткаимпорта engineимелаошибочныйrelativepath; завершиласьдоcaseprocessing. Послеисправления все3cases/6profiles/9guards выполнились ибылисохранены, нофинальныйassert fetchAttempts===0 завершилпроцессexit1: было4попыткиfetch, каждаяостановленаthrowingmock до сети. РеальныхHTTPзапросов0. ЭтоожидаемыезапросыдругогопродуктаМ4вкомпоновщике, неошибкаp214. СледовательнополнаякомпозицияМ4непроверена; еёunknownmissingнельзяиспользоватьдлявыводов оМ4. Никакихunmockedвызововнебыло. СтатусDONE_WITH_HARNESS_CAVEAT; runnerисправлендляразделенияblockedattempts/actualrequests; готовыеcasesнеперезапускались,summaryзавершён по сохранённомуprogress. node--check и gitdiff--checkвыполнены отдельно; broadbuildнеперезапускался: изменён толькоизолированныйauditrunner/доказательства, runtimeс прошлого762PASSне менялся.

Остатокпоowncases: Краснодар — missingМ4/head/unknownpaidroad; Москва — head/unknownpaidroad; Казань — head/ЦКАД/unknownpaidroad, М12компонентимеется. Не считатьчислоmissingновымиуникальнымипричинами.

NEXT: отдельныйкороткийoffline source review own single-m11-torzhok-to-moscow: точныеheadentryp58/Moscowexitgates и retainedoperatorheadtable, безповторатрассирования/цены. Еслиfullheadужефизическидоказан, спланировать узкуюинтеграцию p214→p58 + p58→Москва; unknownpaidroadвсёравнонепрятать. До длительногоsource/codeшагаdurableSTARTED. Main/Production/Androidне затрагивались.


# Торжок→Москва — head source review DONE / exact node source STARTED

18.10.2026. Parentc25b163b088aaded3ea245fac0741e555f702dd4/tree0c9e2100502033af39ad719f4aab61f299505b18, PR14draft, codeCIverifyPASS. Own single-m11-torzhok-to-moscow captureSHA11c1ccb92c498be357958138e293b7ed24f94a86e59bb7e1a366c9e67172b798; полныйstrictblockends37.481044,55.885579. Exactheadcandidategate7171624764/way502872285,tolltrue. Нельзяприсвоитьегоpvp21поиндексуилигороду: retainedOSM3files содержатегоwayвrelationmembership, но definitionузлаотсутствует. Этообнаружениеevidencegap, не доказанныйhead/тариф.

Существующийruntime MOSCOW_M11_ENTRY37.472,55.8842 имеет1.5kmlegacytolerance; использоватьегоодногодлянегenericp214fullheadнельзя. Retainedm11-head-route-adapter имеетготовуюнаправленнуюпаруsolnechnogorsk→moscow; деньгиотдельноизoperatorтаблицы, OSMденегне даёт. Runtimeне менялся, quote/sourcechecksготовыхcasesне повторены.

STARTED boundedsourceproof: ровнодваprimaryGET https://api.openstreetmap.org/api/0.6/node/7171624764 и https://api.openstreetmap.org/api/0.6/way/502872285/full. Перзапрос20s, общийлимит50s, maxbody2MB. Сохранятьrawиstatus/SHAсразупослекаждого,безавтоповтора. Цель: exactкоординаты/тегиgate инаправленныйwayпорядок/соседниеподтверждённыеузлы. Сравнениегеометриитолькособственногоsinglecapture, безrouting/trace/pricingreplay. Ошибкаили403/timeoutне означаетдоказательствоидентичности/цены. Выходвsource-snapshots/m11/2026-10-18-moscow-head7171624764. ПослеответоводинDONE/BLOCKEDcheckpoint,sourceproofне активируеттариф. ДлякодаотдельныйSTARTED/focused/fullgate. Main/Production/Androidне трогать.


# Head Торжок→Москва — SOURCE DONE, tariff binding pending

18.10.2026. Sourceparent e42a00eb23a4e1006a2a39924ac880da79ebb71b/tree77f20b00f806ef9340164654d71be85e5f5ff4c7; branch/PR14draft совпали, sourceSTARTEDdurable. Сделано ровно2новыхprimaryGET200: node7171624764(525bytes), way502872285/full(1900bytes),4.6/5.1s. Rawmetadata/sha/progress сразу сохранены в source-snapshots/m11/2026-10-18-moscow-head7171624764. Отказов/повторов0.

Node55.9354985,37.4500368: barrier=toll_booth,fee=yes. Way502872285: oneway=yes,toll=yes,refМ-11/nameНева,3orderednodes4932294633→7171624764→4932294632. Собственныйsingle-m11-torzhok-to-moscow captureSHA11c1ccb9…72b798: все3sourceanchors совпали в0.000019km(max,около2см),индексы1255.009→1255.990→1256.999,послеp58(963.431,32.1м),доstrictend1330. Selectedgateeventexactnode/wayedgeToll=true. StrictendотстарогоMoscowentryanchorв584.5м,routeближайшийв499.1м. Этофизическоеsourceproofнаодномсобственноммаршруте; неоператорскийODчек/непривязкацены.

Деньги/кодне менялись; runtimeheadпо-прежнемуunknown,новыхpricedcomponents0. ВrawнетимениПВП21/операторскоготарифногокода: невыдаватьегоназваниезаsourcefact. directed-gate.jsonсодержиттолькопервичнуюгеометрию,own-proof.json—отдельныйofflinebenchmarkне дляruntime. Scriptcapture.pyсохранён дляаудита,неперезапускатьготовыеGET. verify-own.mjsпроверяетсобственныйrouteбезсети;выполнен1разиз/tmp,врепосохраненаэквивалентнаяверсиясaliasимпортом. node--checkпроверен; новыйfullbuildне нуженприsource-onlyизменении.

NEXT: короткийofflineoperatorbindingreview парыsolnechnogorsk→moscow по retainedcurrentheadtable/source иexistingМoscowendpointpolicy. Припринятомscope отдельныйboundedCODE STARTED: толькоownp214fallback+exactdirectedheadgate+strictsingleblock+p58→gate→strictend/Moscowcoverage; genericdistanceпороги нерасширять,другиеp214casesheadнепереносить. Затемnegative/focused/fullgate/build и ownunknownguard,unknownpaidroadне скрывать. Еслиfullheadнеподтверждается — source-gated,нужендругойнезависимыйsource,готовые2GET/3anchorsнеповторять.

Предыдущийпакет4/4p214owncapturesmainlineготов,6новыхпрофилей/9negativeguardsсохраненывc25b163b. ВнешнийPhotonсбойпоCI39120413592остаётсяотдельнымblockedavailability. PR14draft,никакогоmain/merge/Production/Android.


# М11 p214→Москва — offline binding DONE / CODE STARTED

18.10.2026. Branch/local/PR14headbddcddb821f591e9dc1ed3bda8b28bf4cc829279, tree548a275443a5f39d1846849e88fd5a903b11136d, open/draft. Последний codeCI39120413592verifyPASS; PhotonliveFAILзаписан отдельно. Docs-onlyheadrunsнет; новыхисточников0.

Retainedcurrentнаправленнаяпараsolnechnogorsk→moscow: night880/monThu1130/fri1260/sat1500/sun1650. Этообратнаяпара, не moscow→solnechnogorsk. ОператорPDFsha514f8853…c9485совпал, прежнийindependentaudit42rows/210cells/differences0неповторялся. Bindingreviewвchecks/2026-10-18-m11-p214-moscow-head/binding-review.json. Принимаетсяsource-derivedbound: непрерывныйstrictM11отp58черезexactsouthboundpaidgate7171624764/502872285кexistingMoscowendpoint. Неутверждаетсяоператорскийlane-crosswalkилиимяПВП21поOSM. Existing1.5kmendpolicyне расширять; одинэтотanchorнедостаточен.

CODE STARTED, один boundedблок: отдельныйstrictheadmatcher (fullchunks/oneblock/uniqueexactgatepaidway/3orderedanchors25m/p58beforegate/strictendaftergatewithinexistingMoscow1.5km/densegeometry). Подключить тольков ужеprovedp214fallback, fromsolnechnogorsk/tomoscow/paymentbasisdeparture; другихfull/headresolverне менять. PhysicalruntimeJSONтолькоindependentgeometryбезbenchmark/caseID/time/цен. Полныйитогсохранятьnullиз-заunknownpaidroad; неустранятьегоэтимблоком.

Проверки: ownsinglecapture, weekday/Thu23:59/Fri/Sat/Sun сexact1130/1130/1260/1500/1650head; negativesgate/way/duplicates/coverage/chunks/reverse/parallel/chord/missingstrict/p58/earlyend/truncated/detour; unchangedРаменское/Казаньheadunknown. Focusedtimeout60s; audit/fullbuildtimeout300s;TS/ESLint/diff,логи иperstepresultвchecks/2026-10-18-m11-p214-moscow-head. Источники2GET/3anchorsготовы,неповторятьsourcecapture. Новогоrouting/trace0. До DONEне объявлятьценуподключённой.

Еслиостановка — сохранитьготовуючасть/логи,дробитьтольконезавершённое,неповторятьsourceилиготовыетестыбезоснования. ПослеDONEremoteexacthead/tree/readback и codeCI. Main/merge/Production/Androidне затрагивать.


# М11 p214 → Москва: head исправлен и проверен; code CI pending

18.10.2026. Исходный commit `c2d50a2b8774204fef77373488b57b180f1be300`, tree `d774755946fbe44718b350b4df3d93957569b3eb`; STARTED сохранён и проверен в разрешённой ветке, PR №14 открыт/draft. Локальная ветка синхронизирована с этим remote commit.

## Что изменено

Добавлен `lib/v3-calculation/m11-southbound-moscow-head.ts`. Он требует полного trace/chunk coverage, одного строгого блока М11, уникальной точной платной рамки7171624764/way502872285, paid-way evidence, трёх независимых направленных точек в25м, p58 перед рамкой и строгого конца М11 после неё в существующей области московского конца дороги. Порог1.5км Москвы и120м p58 не расширены; одного приближения к Москве для тарифа недостаточно. Проверяется плотность собственной геометрии до строгого конца.

В `m11-product-boundaries.ts` новый matcher используется только после уже доказанного собственного въезда p214. При доказательстве включается опубликованная направленная пара `solnechnogorsk → moscow`; при неполных данных head остаётся null. Физический JSON `physical-head-gate.json` содержит только независимые gate/way/ordered coordinates, без caseID, дат, цен и benchmark. Исходный snapshot и raw не заменены.

## Фактические результаты

Собственный `single-m11-torzhok-to-moscow`: Thu09:00 и Thu23:59 mainline1250+head1130=2380₽; Fri1390+1260=2650₽; Sat1390+1500=2890₽; Sun1390+1650=3040₽. Это суммы компонентов М11, не полный тариф маршрута. Во всех пяти профилях API amount остаётся null, единственный оставшийся missing — `unknown-paid-road`. Новых рассчитанных head-компонентов1, подтверждённых полных тарифов0. Политика даты отправления соблюдена. Другие собственные p214→Раменское/Казань не получили московский head.

## Проверки

- `timeout60 node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m11-p214-moscow-head.test.ts scripts/v3-m11-p214-boundary.test.ts scripts/v3-m11-p258-boundary.test.ts scripts/v3-m11-ckad-entry.test.ts` —25/25PASS. Проверены исходные SHA, отсутствие/подмена/дублирование рамки, неоплачиваемый edge, неполные chunks, обратная/параллельная/разреженная/обрезанная геометрия, локальный detour, неполный строгий охват и два других собственных head-контроля.
- `npm run build` под subprocess timeout300s — exit0: audit768/768, quote/API contractsPASS, Next/TypeScript и static16/16PASS.
- `tsc --noEmit`, targeted ESLint — exit0; `git diff --check` — exit0. Точные команды и коды в `check-status.json`/`build-status.json`, gzлоги и SHA в `result.json`.
- Новых sourceGET/routing/trace0. Own composer test закрывает fetch throwing mock; попыток0. Завершённые sourceGET/широкие routeaudits не повторялись. Прежний Photon live failure не считается исправленным.

## Сохранение и продолжение

Это DONE локального кода и проверок. После записи обязательны exact remote head/tree/readback и отдельная проверка нового codeCI; не объявлять его успешным заранее и не писать в ветку при active/queued job. Main/merge/Production/Android не затрагивались.

NEXT после codeCI: короткий offline-разбор `unknown-paid-road` только на собственном `single-m11-torzhok-to-moscow`, с exact unmatched booth/way IDs из текущего coverage и уже сохранённым physical p214 proof. Не удалять unknown по факту рассчитанного М11 или названию города; сначала доказать идентичность конкретного orphan. Не повторять364 inventory/4готовыхp214cases/GETисточников. Для следующего изменения отдельный bounded STARTED и обязательные проверки.


# p214 orphan: диагностика DONE / исправление STARTED после сохранения

18.10.2026. Source branch/local/PR14 head `d5d8b37c87be9ea0811298e2496c173cd8581aca`, tree `ff39c5952dd861515b14781f4f01f107e4cf2b17`; PR открыт/draft. Code CI39122753013 verify completed/success (тесты, TS, Next). Live job при начале диагностики active: запись в ветку отложена до завершения всех jobs, согласно WORKFLOW_RULES; не отменять и не запускать дубликат.

Короткий offline-разбор собственного `single-m11-torzhok-to-moscow`: exact booth5286168661/way766468434, roadNames=[] и edgeToll=false, один создаёт `unmapped_selected_route_paid_booth`. Изолированная именованная южная рамка7171624764 классифицируется M11 и orphan не создаёт. Exact5286168661/766468434 совпадает с сохранённой первичной directed-entry.geometry; источник/направленная связь с М11 уже подтверждены, sourceGET не повторяются. `diagnosis.json` содержит captureSHA и per-eventcoverage. Это ошибка идентичности в классификаторе, а не новый платный продукт, ставка или бесплатность.

После durable STARTED/readback выполнить один bounded кодовый блок: экспортировать source-derived exact p214 node/way и классифицировать только эту пару как M11 в unpriced-road-coverage; не применять соседние nodes, другие/missingways, другие безымянные booths или неполныйtrace. Принадлежность дороге не авторизует тариф: отсутствие strictentry/head/dates/chunks должно сохранять неизвестную цену через существующие guards.

Фокус: before unknown orphan / after exacttupleM11, negativeswrongnode/wrongway/missingway/extraorphan/incompletevalidation. Ownquote Thu2380/Sat2890, API price остаётся estimate/unconfirmed, не операторский подтверждённыйODчек. Для head-теста обновить ожидание полногоestimateтолько при missing=[]; controls Раменское/Казань headunknown. Собственный V3API exactrecordedrequest/response replay, безновыхrouting/trace; при отсутствующемtraceAPIamountnull. Лимитfocused60s, fullbuild300s, TS/ESLint/diff; логи/resultвchecks/2026-10-18-m11-p214-orphan. Не повторять364inventory/4готовыхownphysicalchecks/источники.

При остановке дробить только остаток, исходные результаты не пересчитывать при сбое сохранения. После полного локальногоgate — один DONE commit/readback и наблюдение новогоcodeCI. Main/merge/Production/Android не затрагивать.


Перед записью: CI39122753013 оба jobs completed/success. Geometry, Photon,50settlement и6Yandexsteps PASS. ПредыдущийlivePhotonfailure39120413592 не стирается; текущая сеть прошла в отдельномrun. Ожидание завершено, ограничения единственногоwriter соблюдены. Jobstep snapshot в previous-ci-jobs.json. Код этой новой причины ещё не менялся.


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


# Восстановление рабочей копии — DONE

18.10.2026. Перед продолжением remote PR14 head `24695f0feb1ea083427bce252a74a052e9c984bd`, open/draft. CI39123710038: verify117664362773 и live_probe117664362971 completed/success; geometry, Photon,50settlement и6Yandex steps PASS. Новых live-запусков не было.

Среда очистила текущий scratch checkout. Первая команда exec в прежнем cwd получила ENOENT; корень scratch доступен, репозиторий отсутствовал. Попытка локального clone старой копии2fe30f56e680 не удалась: upload-pack не прочитал старый objecta18460bd…; это не ошибка remote проекта. Локальный источник не изменён. Прямой single-branch clone из GitHub успешно восстановил текущую разрешённую ветку: HEAD24695f0f/treeb8344fa2fe10e704ff9c5a981d2b8fc26bb7a8c5, исходное дерево чистое. GitHub/PR и local совпали. Репозиторий содержит все ранее сохранённые код/журнал/raw; вычисления и sourceGET не повторялись.

Прочитаны текущий WORK_STATE и инструкции; AGENTS/rules/protocol остаются ранее прочитанными версиями. Восстановлена локальная hardlinkкопия установленного node_modules для следующих проверок; package/lockfiles не менялись, зависимости не входят вGit. Тесты/build при восстановлении не запускались, это docs-only операция. Проверки — exact head/tree, исходный worktree clean, git diff--check и ссылки checkpoint. Никаких main/merge/Production/Android изменений.

NEXT после durable recovery readback: короткий offline source review собственного pair-m11-ckad-torzhok-to-ramenskoe (capturec4c60b89…), exactsouthbound8087316064/way1270188041 и strictend по retainedentry-local-map. Северный8087316065 и Московскийвыезд не переносить. Готовыеисточники/4p214cases/364inventory не повторять; новыйsourceзапростолько при конкретномgap и boundedSTARTED.


# М11 → ЦКАД47: offline review DONE / четыре exact источника STARTED

18.10.2026. Parent3acfc4c1f0cab1b491ab238b8273ce0bc638aafd/treebd82851efd5484a4a664e4b97b10467592a2f089, PR14draft; recovery сохранён/readback. Runtime code24695f0f, codeCI39123710038 verify/liveобаPASS.

OwnРаменскоеcaptureSHA8fe0ec0a…feeb4d6: strictend37.199624,56.090070; selectedtrace оканчиваетМ11 наnode9556466755/way1270188034. Дальше собственныеrawedges точно задают четыре approachways1148492112→1148492111→791520971→620063414, затем476099617→620063413→1270188044→1270188043→1270188042→1270188041, gate8087316064. Сохранённаякартаsha4c67bf66…7dc85c содержитgate/последниешестьways, нопервыечетыреdefinitionотсутствуют: ихнельзязаменятьnamedlabelЦКАДилипрямойхордой. Картаbbox37.2028…не покрываетstrictend; ближайшийsourcepoint59.5м, за25м. Никакихsourcechecks/prefixp214не повторяли, здесь новыйконкретныйgap.

Retainedreverseheadtable solnechnogorsk→tskad: night50/Thu200/Fri220/Sat240/Sun320. Не northbound280/320. Этоcandidate привязка того же комплексаPVP18ЦКАД47, подтверждённого operatorpage5 в прежнем northentrysource; направленный southboundкоридор надо доказать отдельно. До его доказательстваheadunknown, никакихтарифныхизменений.

STARTED boundedsource: ровно4GET https://api.openstreetmap.org/api/0.6/way/{1148492112,1148492111,791520971,620063414}/full. Максимум20s/GET,80s total,body≤1MB; последовательныйper-responseprogress/rawmetadata/SHA,безповторов. Sourcepath source-snapshots/m11/2026-10-18-ckad47-exit. ПослеGET соединить новые4ways сretained6, проверитьexactdirectednodes/oneway/ownselectedgeometry в25м, sourcefirstnode9556466755 противstrictend, ownp58→exitorder. Сетьбезrouting/trace,готовуюretainedкартуне запрашивать. Еслиgapостаётся — BLOCKED иотдельныйscope; никакихавторизацийтарифаизодногоназвания.

После sourceproof — DONE и отдельныйCODE STARTED дляstrictownp214headexit,focused/fullbuild; M11head иCKADarc отдельныепродукты, wholefareunknownпокаCKADне доказан. Приостановке продолжитьпоprogress,неповторятьготовыеGET. Main/merge/Production/Androidне затрагивать.


# М11 → ЦКАД47: source DONE / CODE STARTED

18.10.2026. Parent98c3869fb7a7eeaf8c66076864ca37e7f8ea39c1/treeaae470f86c06a8b560be5fa0c9e74c0adb41d2a5, STARTEDremote/head/tree/PR14draftсовпали. ЧетыреexactGET200 завершены,каждый4.4–4.6s;rawmetadata/SHA/progressсохранены сразу. Старуюкарту/источники не запрашивали. Routing/trace0.

Sourceproof `source-snapshots/m11/2026-10-18-ckad47-exit`: новые4ways соединены с6retainedways;10/10oneway и общиеfirst/lastnodeIDs согласованы. Independentstrictjunction9556466755 совпал сownstrictend в0.0000128км (~1.3см). Все48orderedcorridorpoints совпали сownРаменское вмаксимум0.0000544км (~5.4см), p58индекс963.431доexitfirst1035.9999; exactgate8087316064/1270188041 найден1раз. Это полный направленный южный съезд того же PVP18ЦКАД47 комплекса; source-derivedоператорскаяпривязка по сохранённомуpage5+раздельнымполосам, неофициальныйoperatorlane-crosswalk/ODчек. Северный8087316065не переносился. Raw/sourceproof и ownbenchmarkразделены, runtimeне менялся, новыхpricedcomponents0.

Retaineddirectpair solnechnogorsk→tskad: night50/MonThu200/Fri220/Sat240/Sun320. Она опубликована отдельно отобратнойпары. CODE STARTED: отдельный inspectM11CkadHeadExit, completechunks/oneM11strictblock/uniqueexactgateway/strictend25мsourcejunction/p58beforeexit/48orderedpoints25м/fullcorridor/density. Non-tollaccesswaysне требовать вpaid-onlywayIds: ихowncontinuityдоказананезависимойполнойгеометрией. Только существующийprovedp214fallback; Москва иnorthCKADentryне меняются. PhysicalJSONне содержитprices/caseID/time/benchmark.

Цель ownРаменское: head200/240, М11subtotal1450/1630; wholequoteостаётсяunknownиз-заЦКАД. НедопустимоheadподменятьCKADfareилиобнулятьCKAD. Проверитьownheadcomponent/unknownquote иguardsmissing/wrong/duplicategate/coverage/chunks/reverse/parallel/sparse/detour/strictend; пятьdepartureprofilesиThu23:59. RegressionМоскванеполучаетtskadhead. Длядругихownp214exitsссовпадающимкоридором — явныеownboundary/componentcontrols; невыдаватьихавтоматическиза wholefare.

Лимитfocused60s/fullbuild300s, TS/ESLint/diff, полныелогивchecks/2026-10-18-m11-ckad47-exit. ПослеDONEcommit/readback/codeCI. Еслиостановка — делитьостаток; не повторять4GET/48sourcepoints/готовыеp214prefixes. Main/merge/Production/Androidне менять.


# Южный съезд М11 → ЦКАД47: исправлен и проверен; новый CI pending

18.10.2026. Parent `5a6bef2d0a61bbcb9c3c4a6ec4f8574cafcef7a8`, tree `0b53c28a0b9cc68135a72b2082e86f12d7fe0066`. Source DONE/CODE STARTED сохранён, exact remote head/tree/PR14draft совпали. Последний предыдущий codeCI39123710038 verify/live оба success; новые результаты CI отдельно после записи.

## Изменение

`m11-ckad-head-exit.ts` связывает только точный южный exit8087316064/way1270188041. Требуются полный validation/chunk coverage, один корректный strictM11block, уникальный gate/way, strictend у независимогоnode9556466755 в25м, p58 до exit и48 независимых orderedpoints по10onewayways, полное покрытие corridor и плотность геометрии. Non-toll access не ищется в paid-onlywayIds; его связь доказана полным собственным corridor. Сеть для matcher не нужна.

В `m11-product-boundaries.ts` matcher подключён только после строгого p214entry fallback. Выбирается отдельная опубликованная пара `solnechnogorsk → tskad`: Thu200/Fri220/Sat240/Sun320/night50. Московский head и северный CKAD entry сохранены отдельно, тарифные таблицы/пороги/выбор fastest не менялись. CKAD остаётся самостоятельным продуктом; её тариф не заменён платой за head.

## Собственные результаты и исключения

- Раменское: Thu09:00/Thu23:59 head200, М11subtotal1450₽; Fri220/1610₽; Sat240/1630₽; Sun320/1710₽. Во всех пяти own quote профилях полный API итогnull, missing только `ckad`. Нового полного тарифа нет.
- Казань: собственный независимый capture прошёл strictcorridor; own M11component Thu1450/Sat1630₽. Его полная композиция в этом блоке не запускалась и не подтверждается этими двумя componentcontrols.
- Москва и Краснодар: собственные captures не имеют нужного CKAD exit, matcherfalse, остаётся отдельный moscowhead. Первая focusedпопытка26/27 ошибочно считала Краснодар CKAD-positive; его ownstrictend37.483494,55.889379 и gate7171624764 доказали исключение. Исправлено ожидание теста на CKAD-negative, runtimeдопуски не ослаблялись. Initialfailurelog сохранён.

Новых рассчитанных headкомпонентов2 собственных случаев; подтверждённых полных тарифов0. Эти числа не расширяют покрытие всех М11/ЦКАД. Source4GET/48pointproof завершены прежним commit и не повторены в кодовом блоке. Новых routing/trace/sourceGET в кодовом блоке0, owncomposer fetchattempts0.

## Проверки

Focused27/27PASS: sourceSHA/10wayconnectivity, wrong/missing/duplicate gate, partial/failedchunks, reverse/parallel/chord/cropped/detour, malformed/missing strictspan, wrongstrictend; пять departureprofiles, ownKazancorridor и два других ownexitcontrols. Актуализированы существующие p214 и moscowhead regression expectations: Раменское/Казань получают свой CKADhead, не Московский.

`npm run build` с timeout300s exit0: audit777/777, quote/API contracts, TypeScript/Next/static16/16PASS. `tsc --noEmit`, targetedESLint и gitdiff--check exit0. Команды/status/gzлоги/SHA в `checks/2026-10-18-m11-ckad47-exit/result.json`. Узкие тесты имеют timeout60s. Новые ставки/импорт benchmark в runtime отсутствуют.

## Продолжение

После записи проверить exactremote head/tree/PR и новый codeCI. Пока jobactive/queued — второго writer не запускать. Main/merge/Production/Android не затронуты.

NEXT после CI: коротко прочитать current CKAD resolver reason/actual selected A113 exit на own `pair-m11-ckad-torzhok-to-ramenskoe`, сопоставить с уже доказанным CKAD M11→M12 context и retained source definitions. Разбирать только конкретный оставшийся CKAD billing endpoint/context, без повторов34общихarc/364inventory/4p214cases/готовых10way48pointproof. Не переносить северную/полнуюarcцену на иной съезд. Если нового источника не хватает — точный gap и отдельный bounded STARTED, не новый routing/fullrouteaudit.


# ЦКАД Торжок→Раменское: диагностика DONE / exact exit source STARTED

18.10.2026. Source branch/local/PR14 head `ee7d1d4b4887315e9f80263daf3b9aa18bddcb33`, tree `14d61cf58363c386a03019574d33ade03f208c55`, open/draft. CodeCI39132410371 verifyPASS; в начале review live job active, поэтому запись STARTED ждала завершения jobs по WORKFLOW_RULES. Ничего не отменяли и не дублировали.

Короткий offlineразбор own `pair-m11-ckad-torzhok-to-ramenskoe` (captureSHA8fe0ec0a…feeb4d6): frozenvalidation создан до ckadTraceBlocks. Обоснован один ограниченный currentparser replay: 3mockrequests, exactrecordedkeys, misses0, complete3/3. Реальной сети0. Rawне менялся, отобрантотжесобственныймаршрут354824м/13566с. Новыйконтекстсохранён в diagnosis.json; это не повтор309/34/364маршрутныхаудитов.

Original и rebuiltresolver reason одинаковый `ckad_east_arc_not_proven`: это не просто утраченнаяметадата. CKADblockfirst1148492112, beforeM11way1270188034/endnode9556466755 (совпадает сготовымentryproof), lastpaidway886019081/endnode10832306578. Aftercontext: трипоследовательныхedgeчастиway886019063 сendnodes13184575946/13184575942/8914828064, затемA107way119881263/endnode3140785578. Repeatedwaysfalse. Это иной физический выход, чем реализованная параМ11→М12. ГотоваяпараМ11→М4такжене подходит. DefinitionэтихтрёхwaysвretainedCKADsourceотсутствует. НазваниеA107не выбираетячейкуматрицы: внейнесколькоразныхвыходов, включаясеверныйНикольскоеГорки; ценунеугадывать.

STARTED источник: ровно3GET https://api.openstreetmap.org/api/0.6/way/{886019081,886019063,119881263}/full. ≤20s/GET,60s total,body≤1MB,raw/status/SHAсразу после каждого,безповтора. Sourcepath source-snapshots/ckad/2026-10-18-ramenskoe-exit. Цельточныеexitjunction/onewayconnector/A107connection и собственнаянаправленнаягеометрия; деньги/кодневключатьэтимsourcepass. Необращатьсякновомуrouting/traceилиготовымM11источникам.

ПослеsourceDONE: отдельнооценитьдоказаннуюсвязь сoperatorbillingpoint иdirectmatrixcell, использоватьготовыйM11→M12entry/coreproofтольковсовпадающемprefix. Еслиоператорскоеимяне доказано — BLOCKED до конкретногоownerproof и следующийboundedSTARTED; A107/названиегорода/близостьне заменяютнаправленнуюпару. Source3GETне повторять. ДляновогоматчераотдельныйCODE STARTED/focused/fullbuild/APIunknownguards. Main/merge/Production/Androidне менять.


Перед записью: CI39132410371 verify/live_probe оба completed/success, включая geometry/Photon/50settlement/6Yandex. Всеjobs завершены, единственныйwriterсоблюдён. Снимокjobstepsсохранёнвprevious-ci-jobs.json. SourceGET ещёне выполнялись этимSTARTED.


# ЦКАД выход к Раменскому: physical source DONE / owner alias STARTED

18.10.2026. Parent992166b3b4a87703203b96ee922affaa75147f1e/treeb6986b2c7670091927263d9a75920f6b14a0dab3, sourceSTARTEDdurable/readback, PR14draft. Runtimeee7d1d4b; CI39132410371verify/liveобаPASS.

Ровно3primaryGET200 завершены и сразу сохранены: way886019081/full,886019063/full,119881263/full, каждый4.2–4.5s. Полныйgeometrysourceпоказываетexitjunction10832306578 в38.3575425,55.6403954. ТочнаявыбраннаячастьpaidCKADway886019081:10782061695→10832306578; источникwayпродолжаетсядальшедо8238636524, поэтомуегополныйконецнеиспользованкаквыход. Directedconnector886019063:10832306578→8914828064. A107way119881263: выбрантолькосрез8914828064→3140785578; sourcewayначинаетсяраньшеу8238636476. Все3oneway=yes; ниоднагеометриянеперевёрнутавопрекиsource.

Вsource-snapshots/ckad/2026-10-18-ramenskoe-exit raw/metadata/SHA/progress,physical-exit.json иown-proof.json. 29новыхselectedexitpoints +12уже сохранённыхM11→M12entry/coreprefixwitnesses совпали сownРаменское строгоупорядоченно, максимум0.0000544км (~5.4см). СтарыйM12exitconnectorне переносился. ДоказываетсясобственныйCKADentry→частичныйeastarc→реальныйA107exit; billingpointиpriceэтимещёнедоказаны. Код/ставкине менялись,новыхpricedcomponents0,новыхrouting/trace0.

Оставшийсяgap: в трёхrawwaytags нетимениoperatorbillingpoint, толькоA113/A107. Не назначатьпаруНикольскоеГоркиилиЕгорьевскоепоодномудорожномуномеру. Candidateдляпроверки—Егорьевскоешоссе; ниэтаячейка,ниценаеёнеактивируютсясейчас.

STARTED owneraliaslookup: один точный поиск по официальным доменам russianhighways.ru/tskad.ru/avtodor-tr.ru длясвязиЕгорьевскоговыходаЦКАДсA107, затемдо2новыхоператорскихстраниц/схем (нестарыйmatrixPDF). Никакихперезапросовготовых3GET/41точки/CKADcore/sourcepasses. Сохранятьquery/snippets/URL/фактчтения,невыдаватьleadзаcrosswalk. ПриотсутствиидоказательстваBLOCKEDсconditionдляпродолжения. При доказаннойaliasпривязке — отдельныйCODE STARTED, strictcontext+geometrymatcher+directmatrixcell, currentparserreplayownvalidation,focused/fullbuild/APIguards. Main/merge/Production/Androidне трогать.


# Owneralias pass1 DONE_NOT_PROVEN / строгофильтрованный поиск STARTED

18.10.2026. Parent5e351cfa6ab3b49b93fd4dffe652437fdf451eb1/tree945081106df421c4e274e2f9c88ccb622c512f11, physicalproofсохранён/readback/PR14draft. Runtimeee7d1d4b, CIverify/livePASS.

Первыйпланвыполнен:1query сsiteORвтекстезапроса дал0пригодныхoperatorhits (ввыдаче толькосторонниесайты, неиспользовалиськакproof). Read1https://tskad.ru/→HTTP502, metadataсохранена. Read2https://avtodor-tr.ru/ru/ckad/→webfetch403, sourcecontentнедоступен. Необходили403,повтораURLнет. Billingaliasне доказан, runtime/ценыunchanged, новыхpricedcomponents0. Этоинфраструктурный/поисковыйgap,не доказательствоотсутствиятарифа. pass1-result.jsonсохранён, сторонниетекстывproofне переносились.

НовыйboundedSTARTED оправданконкретнымизменениемretrieval: вместо неэффективногоsiteORвтексте — настоящийdomainsfilter инструмента. Максимум2новыхзапроса:1)ЦКАД Егорьевское шоссе А107, domainsrussianhighways.ru/tskad.ru/avtodor-tr.ru;2)ЦКАД Егорьевское шоссе развязка Раменское, domainrussianhighways.ru. Затемдо2новыхоператорскихстраництолькоизрезультатов; прежние502/403URL/матрицаPDF/OSM3GETне повторять. Цель exactroad/billingalias, не тарифныечисла. СохранитьresultURL/evidenceиограничения. Нетcrosswalk — BLOCKED; толькопосленовогодоказательстваCODE STARTED. Main/merge/Production/Androidне менять.


# ЦКАД М11 → Егорьевское: owner binding DONE / CODE STARTED

18.10.2026. Parent8bdabbf0189e16270879a7a5a8b00fa47de63902/tree10ef0d489250e8c25bfa1fa285311751f7f17001, PR14draft, STARTEDretrievalсохранён/readback. Runtimeee7d1d4b, предыдущийcodeCIverify/livePASS.

Дваdomain-filteredquery выполнилиплан и нашлиофициальныеисточники. PrimaryoperatorPDFterms1.12 виндексеописываетЕгорьевскуюточку какразвязкусА107рядомсЕгорьевскимшоссе; полныйwebopenнепрочитан, directHTTP403, не обходился. Этотsnippetсохранёнтолькокакdiscovery lead, некакпрочитанныйдокумент. НовыйownerPDF `Infomemo_CRR4_rus.pdf`HTTP200,1,897,406bytes,sha52d00e69…113bca,53pages. Страницы24–26прочитаныровнопривязкойдорог;page25отрендеренpdftoppm1500pxивизуальнопроверен. ОфициальнаяпроектнаясхемаотделяетТР2ММКотТР3Егорьевскоешоссе иописываетсъезд1со стороныЦКАД-севернаА107-югдалеекР105. Этоисторическаятопология, несточникставок. СопоставленосреальнымсовременнымOSMsource:10832306578→886019063→8914828064→А107наюг,55.6404/38.3575;полнаясобственнаягеометрия41pointsупорядочена. Принимаетсяsource-derivedphysical/operatorroadaliasbinding, неофициальныйlaneIDcrosswalk/чек. CaseID/время/ценывruntimephysicalне переносить.

ПрямаяготoваяячейкаcurrentCategoryIpostpayment/noTransponder М11Нева→Егорьевскоешоссе=1218₽,allDays. Числаматрицыне меняются. Специальный120minuteM12endpointfootnoteкэтойпаре(М11→Егорьевское)не применяется: М12толькопромежуточныйузел, не начальный/конечныйтарифныйотрезок.

CODE STARTED bounded: отдельныйforwardCKADmatcherдляentryM119556466755/1148492112/8087316064 иexit886019081/10832306578 через886019063→A107119881263. Нужны currentvalidationckadTraceBlocks1/repeatedfalse/exactbefore/after4/completechunks/paidlastway, независимыйentrycorridor48points иretainedcoreprefix12+exit29,порядок25м/плотность/длинабезпетли. Не переноситьM12exitconnectorилиполныйM4arc. Матчерразрешаеттолькоточнопривязаннуюнаправленнуюпару;unknown/инаярамка/инойexitостаютсяunknown.

OwnРаменскоеcurrentvalidationfromsavedraw3exactmockreplay(старыйsnapshotбезctxне считатьготовым). ОжиданиеThu2668/Sat2848, пятьdepartureprofilesвсего,unconfirmedcompleteestimate; source3GET/41physicalpointsне повторятькакновыемаршруты. APIexactownrecordedresponses: ready2668,missingtrace→null. Focusedtimeout60s/fullbuild300s,TS/ESLint/diff;сохранитьвchecks/2026-10-18-ckad-ramenskoe-boundary. Новыхrouting/trace/sourceGETдлякода0. ПослеDONEremote/readback/codeCI,никакогоmain/merge/Production/Android.


18.10.2026 recovery STARTED: remote e8c4e32 verified, CI39132410371 success; unfinished implementation split A matcher / B quoteAPI and gates / C readbackCI. Sources not repeated. See ../../docs/checkpoints/2026-10-18-ckad-egoryevskoe-recovery-STARTED.md


18.10.2026 PART A DONE: standalone Egoryevskoye matcher, independent entry48/core12/exit29, focused3/3 including23context+8geometry negatives, TS/ESLint/diff PASS. No integration/fullgate yet. Recovery clone84e365a7 exact. See ../../docs/checkpoints/2026-10-18-ckad-egoryevskoye-part-a-DONE.md


## PART B DONE — ЦКАД М-11 → Егорьевское в полном расчёте

18.10.2026. Source/parent b030cd714d3442de7e32e14c3075e6339c5628fe, tree ce27533a7d7e683be402bfdc38fe6f953b49a88e. Branch fix/v3-missing-route-prices-2026-10-15, PR14 draft. CI39144007812 verify/live_probe completed/success до изменений. Новый checkout текущей сессии восстановлен из существующих Git-объектов; HEAD/tree совпали с фактическим PR head; чужие checkout не изменены. Git origin исправлен на исходный GitHub URL, tracking ref выровнен по проверенному remote. Новых route/trace/source HTTP0; старые аудиты и поиск источников не повторялись. STARTED scope части B уже сохранён в owner/recovery checkpoints.

В lib/v3-calculation/ckad-product-boundaries.ts подключён inspectCkadM11ToEgoryevskoye до общего east-arc resolver. Только точное доказанное направление возвращает пару «М-11 Нева» → «Егорьевское шоссе». Существующий matrix adapter берёт прежнюю1218 ячейку; матрица, matcher и source geometry не менялись. Прежние M11→M12 и полный восточный arc сохранены. Frozen validations не переписаны.

Добавлен scripts/v3-ckad-egoryevskoye-pricing.test.ts: точная идентичность own capture SHA/метры/секунды/2140points, existing1218 даже при длительности>120мин, пять departures, семь отрицательных quote/context проверок, POST/NextRequest с replayingFetch(capture.calls). Direct quotes используют готовый diagnosis.rebuiltValidation без повторного диагноза. Default fetch блокирует незаписанные обращения, API только точный replay; unexpected requests0/misses0, toll-avoid запросов0.

Результаты: Thu09:00=2668, Thu23:59=2668, Fri=2828, Sat=2848, Sun=2928; все priced, missing=[], priceConfirmation=unconfirmed. APIready2668, Valhalla/354824м/13566с сохранены; trace_attributes503 → amountnull/statusunknown. Старый/no context, partial, wrong entry/exit/M12connector/repeated остаются unknown. Один собственный маршрут/пять профилей, один новый рассчитанный компонент ЦКАД, независимо подтверждённых полных тарифов0. Связь с операторским названием остаётся ранее принятой source-derived association, не чек/crosswalk.

Проверки и логи: checks/2026-10-18-ckad-ramenskoe-boundary/part-b/. Initial focused14/15: ошибка только нового тестового ожидания status complete вместо фактического контрактного priced; исправлено ожидание, runtime не менялся. Initial log сохранён. Final focused15/15 PASS (timeout60s; включая готовые strict matcher и M11→M12 regressions). timeout300s npm run build exit0:784/784 + quote contracts PASS, Next16/16. Отдельные tsc --noEmit и targeted ESLint exit0. git diff --check exit0. Node24.19.0, зависимости скопированы hardlink directory из существующего node_modules; symlink не использовался. evidence manifest содержит SHA256 файлов; исходная тарифная матрица без diff.

Сохранение: local commit + GitHub blobs/tree/commit/ref/readback — выполнить после этой записи; не считать DONE durable до exact remote readback. Post-save codeCI проверяется отдельно. Main/merge/Production/Android не менялись.

NEXT PART C: проверить новый remote commit/tree/PRhead и новый codeCI, не писать при active jobs. После CI вернуться к следующей отдельной незавершённой причине по ранее сохранённой очереди, без повторов 74/76/309 и источников этого участка. Общая готовность калькулятора и подтверждённость всех тарифов не заявлены.


# PART C DONE / следующий bounded scope STARTED

18.10.2026. Проверен code commit bd811734f75df70f1e987ab17590ecdc92e581b2, tree ac581f874283d5e7d5d7f63f4cc530b8f84a6947; local clean/branch и фактический PR14 head совпали, PR draft. CI39145260247: verify и live_probe completed/success, включая tests/tsc/build и live route/Photon/corpus/screenshot steps. Дубликатов/отмен не было. PART B durable readback прошлого шага подтверждён. Готовые исходники/аудиты/расчёты повторно не запускались. Нового кода, тарифов, тестов и подтверждённых полных цен0.

Дальнейшая очередь прочитана точечно: cause-handoff-reconciliation/README/result и точная исходная запись odintsovo:unpriced. M4/M3/ZSD уже имеют последующие sourcepasses/BLOCKED; не повторять их. М11/ЦКАД получили поздние узкие исправления; это не закрывает все старые cohort. Следующая независимая причина: направленная пара Северного обхода Одинцово, два сохранённых случая Голицынo↔Рублёво. Исходная проверка route traversal уже выполнена; её не повторять.

STARTED ограниченного продолжения: только retained boundary/tariff provenance. Входы: docs/checkpoints/evidence/2026-10-17-part19-odintsovo-unpriced-blocked.json; odintsovo-bypass-category1-base в TARIFF_MATRIX_CANDIDATES_2026-10-12.json; соответствующие строки TARIFF_SELECTION_REGISTER/REPORT и готовые source paths. До60с локальной выборки: найти точные physical node/way, операторские PVP названия и направление/время для двух уже известных границ. Не обходить все364capture, не повторять full replay/route audit, не делать сетевых запросов. Выход — компактный source-gap report с SHA/точными путями: есть ли уже независимая binding proof или какой конкретный source отсутствует. Новую сеть/код разрешать только отдельным следующим bounded STARTED при действительной новой зацепке. Пока тариф unknown/null, матрицу не менять.

NEXT: после durable readback этой записи выполнить описанную retained provenance выборку. Затем сохранить DONE/BLOCKED, выбрать конкретное продолжение. Никаких main/merge/Production/Android.


# Одинцово: retained provenance DONE / primary lanes STARTED

18.10.2026. Source e3d1d050/tree928ed733, PR14draft, предыдущий codeCI39145260247 verify/live_probe success. Docs C commit без runs. Локальная ветка выровнена с exact remote tree без изменений рабочего дерева.

Только точная выборка двух известных captures и трёх provenance файлов, без повторного route assessment/replay. Доказательство trace/traversal уже было сохранено ранее; здесь оно не засчитано заново. Извлечены направленные booth tuples: к Москве3109177688/1067836106 затем3783549013/374972862; от Москвы3783549015/374972870 затем3109177690/1067836109. Никаких цен к ним не назначено. Candidate имеет96 выбранных offline строк, runtimeApproved=false; FAQ route/PVP examples уже найдены, повторять поиск не нужно. В sourceSnapshots candidate нет отдельного локального Одинцовского source reference; точный текстовый поиск четырёх nodeIDs по retained source-snapshots вне исходных replay/live не нашёл первичных definitions. Это не доказательство отсутствия данных во всех архивах.

Evidence: experiments/nationwide-tolls/checks/2026-10-18-odintsovo-directed-binding/retained-gap.json: точные inputs/SHA/booth order/missing proof. Нужна primary physical lane identity и независимое соответствие operator plaza, затем scope selected route. Одного имени М1/СОО недостаточно. Старая заметка candidate про per-crossing время не отменяет пользовательское правило дня старта. Тарифы/код не менялись; routeaudit/replay/network/tests0; известный отсутствующий файл SOURCE_AUDIT_2026-10-12.md не использован.

STARTED следующий короткий source шаг: четыре точных OSM way/full для1067836106,374972862,374972870,1067836109. Inputs сохранены в primary-inputs.json. ≤4GET,15с каждый/60с всего, без retry; terminal transport failure останавливает проход. Raw/status/SHA/progress писать сразу. Полученные200 не повторять. Routing/trace/operatorprice sources0, не искать уже найденные тарифы. После получения — только lane definitions и направление; operator price binding пока не обещана. Затем отдельный DONE/BLOCKED commit/readback до независимого шага. Пока все неподтверждённые суммыnull; M1 и unknownpaidroad отдельно.

NEXT после durable readback: исполнить четыре exactprimaryGET и сохранить bounded результат. Main/merge/Production/Android не менялись.


# Одинцово: primary lanes DONE / identity CODE STARTED

18.10.2026. Durable STARTED56e3fa884fd95248c542e6ccbc647a935e0869e7/treed7a3244d verified. Четыре exactway/full GET HTTP200,21.613с, без retry; raw/status/SHA сохранены в checks/2026-10-18-odintsovo-directed-binding/. primary-progress.json и primary-proof.json фиксируют точные результаты. OSM barrier=toll_booth/name/operator:3109177688/1067836106 и3109177690/1067836109 — ПВП17,7;3783549013/374972862 и3783549015/374972870 — ПВП6,9; оператор АО«Новое качество дорог». Все way oneway=yes. 27 независимых source lane nodes совпали с собственной selected geometry в прямом порядке, максимальное отклонение<0.06м; это source-direction check, не новый маршрутный аудит/trace/replay. Никакого нового routing/tariffsource retrieval0. Матрица/цены/код без изменений, новых оценок/подтверждённых тарифов0.

Установлена отдельная identity причина: M1/M3 gate audit roadFamily видит М1 alias внутри Северного обхода как Avtodor M1; unpricedRoadCoverage распознаёт именованную полосу по региональному имени, но безымянную6,9 относит unknown-paid-road. Exact primary identity не означает готовый полный тариф. Исторический blocker тарифной композиции сохраняется. Operator route examples уже retained; новый поиск не нужен. Сопоставление OSM plaza name с операторской таблицей source-derived, не официальный IDcrosswalk/чек.

CODE STARTED bounded identity-only: добавить общий exactnode/way идентификатор четырёх полос с отдельным чистым JSON из proof (без caseID/денег/даты); в unpricedRoadCoverage отнести их odintsovo, в M1/M3 gate audit исключить только эти exacttuples из M1. Другие неизвестные/реальные M1 не маскировать; неверные node/way и неполное покрытие остаются conservative. Цены/обходной adapter не добавлять. Нужны собственные оба captured validation identity assertions и отрицательные othernode/wrongway/дополнительнаяunknown/реальнаяM1; focused≤60с, fullbuild≤300с,TS/ESLint. Только после durable source DONE/readback переходить к коду. Никаких новых sourceGET/route/trace. Затем identityDONE/remote/codeCI, отдельным следующим шагом strict paid-product traversal и готовые тарифные ячейки при достаточном доказательстве.

NEXT: выполнить identity-only scope после сохранения этой записи. PR14draft/main/merge/Production/Android unchanged.


# FIXED — точные identity полос Северного обхода Одинцово

18.10.2026. Source f8aeb1aa796ff1e811a8f29e099cf5e16b985b54/tree18bc3b55, PR14draft; source DONE commit/tree/readback verified, docs head без runs. CI предыдущего кода39145260247 verify/live_probe completed/success. Raw4GET не повторялись, новых route/trace/source/tariff requests0. Уточнение elapsed source pass: сумма длительностей ответов21.613с, общий elapsed в primary-progress21.615с.

Добавлены чистый source-snapshots/odintsovo/2026-10-18-directed-lanes.json и общий odintsovo-lane-identity.mjs. Только4 exactnode/way tuples, PVPname/operator/oneway и независимые координаты с SHA primary bytes, без caseID/денег/даты отправления. isOdintsovoLane называет продукт, не разрешает цену/направленный тариф/полный scope. В m1-m3-gate-evidence.mjs эти4tuple не считаются AvtodorM1 лишь из-за aliasМ1; в lib/v3-calculation/unpriced-road-coverage.ts те же точные eventIDs отнесены odintsovo, включая безымянные6,9 lanes. Не добавлены свободные маршруты или тарифы, ни одна ячейка матрицы не менялась. Неверные IDs/ways/другие реальныеМ1 и дополнительныеunknownbooths не исключаются.

scripts/v3-odintsovo-lane-identity.test.ts проверяет4primarySHA/идентичность, оба own savedvalidations, absentnames, wrongnode/way/missingway, дополнительныйunknownbooth, реальныйМ1 и incompletecoverage. Четыре теста нового модуля, focused43/43 с существующими coverage/M1M3 regressions PASS. Два собственных quotes теперь missing=['odintsovo'] вместо ложныхМ1/unknownaliases, amountnull/statusunknown сохранены. Это identity проверка старых captures, не новый routeaudit/самостоятельное тарифное подтверждение. Новых pricedcomponents/подтверждённых полных тарифов0.

Обязательные проверки выполнены: timeout60s focused exit0; timeout300s npm run build exit0,788/788 + quote contracts PASS, Next16/16. tsc --noEmit exit0; targeted ESLint4changedcodefiles exit0; git diff --check exit0. Непредвиденных fetchattempts0. Логи/quotes и manifestSHA — checks/2026-10-18-odintsovo-directed-binding/identity/. Ошибок текущих focused/full запусков нет. Source-proof source association не является официальнымOSM-IDcrosswalk/чеком.

Сохранить exactlocaltree через authorized connector в ту же ветку; после remote commit/tree/PRhead readback проверить новыйcodeCI. При activejobs не писать/не запускать duplicate.

NEXT после codeCI: ограниченный strict scope двухнаправленной пары ПВП17,7↔6,9 на этих собственных маршрутах. Использовать готовые4primaryGET/27pointproof и operatorroute/PVPexamples из candidate, не повторять источники. Сначала убедиться в полном перечне оплачиваемых событий/порядке/непрерывности/нетreentry; затем отдельным boundedCODESTARTED подключать готовые categoryI/noTransponder ячейки по дню старта, пять временных controls/негативные варианты/ownAPI и fullgate. Пока никакие650/700 и другие цены к маршрутам не применены. Main/merge/Production/Android unchanged.


# LOCAL DONE / REMOTE SAVE BLOCKED — тарифный scope Одинцово

18.10.2026. Branch/PR14draft exacthead998a11b5891ddbf539c224fce129ede63b6ae754/tree84d8dde5. Локальное дерево в начале clean, remote head совпал. CI39146933232 verify completed/success, live_probe in_progress на Probe live provider geometry and per-leg times; сетевые последующие steps pending. Joblogs API404 BlobNotFound, полноценный live progress из этого не установлен. CI не отменялся/не дублировался. Remote write запрещён пока active/queued по правилам проекта. Эта запись и результат пока ТОЛЬКО ЛОКАЛЬНЫЕ; не считать durable сохранёнными в GitHub.

Выполнен короткий offline scope review только двух exactknowncaptures и имеющейся тарифной пары, без нового routeaudit/replay/source requests. operatorexamples уже соответствуют17,7→6,9 (Минское→Рублёвский/МКАД) и6,9→17,7 (МКАД→Минское). Но авторизация полного расчёта преждевременна: forward rawtrace имеет8платныхА113edges46–53, включаяtoll_gantry12443433262 наway1080462753. Тип gantry отсутствует в старом tollBooths (парсер сейчас считает толькоtoll_booth). paidProductsFromName('А-113') и полное название Центральной кольцевой дороги возвращают[]; это пропуск оплачиваемой системы. Reverse paidА113edges0. Значит прежнее missing=[odintsovo] не является доказательством полноты forwardpaidproducts. Все frozen snapshots оставлены как есть. Источник — уже записанный raw trace, не новое независимое тарифное подтверждение.

Точное evidence сSHA/edgeindices/way/nodeids: experiments/nationwide-tolls/checks/2026-10-18-odintsovo-pair-scope/result.json. Runtime/тарифы не менялись. Выполнена одна короткая Node-проверка распознавания, не fulltest/build. Новых pricedcomponents/полных тарифов0. Старый CIverifyPASS относится к identity-коду, не к будущим изменениям.

NEXT строго: дождаться прекращенияCI39146933232, перечитать branch/PRhead и всеactivejobs, сначала сохранить ЭТОТ завершённыйscope в GitHub с exacttree/readback. До этого не расширять работу. Затем boundedCODESTARTED: распознавание платногоА113/fullCKADname в общей paidcoverage, негативные lookalikes/другиеroads/неполныйtrace, ownforwardunknownCKAD иreverseбезновойCKAD,focused/fullbuild. Не разрешать цену по одномуroadalias и не объявлять gantry free. Только после этого отдельный strictdirection17,7↔6,9/no-reentry/ownfulltrace/fare/API шаг. Forwardfullamountnull пока CKAD не оценён; самodintsovo component может быть оценён отдельно после доказательства. Primary4GET/27points и operatorfares не повторять. Никаких main/merge/Production/Android.


# SCOPE DONE / CODE STARTED — оплачиваемая А-113 перед обходом Одинцово

18.10.2026, обновление перед durable save: CI39146933232 обе jobs verify/live_probe completed/success, включая Photon/corpus/Yandex. Ожидание завершено, отмен/дубликатов0. Подготовленные blobs/tree/commit пока CI был active не меняли branchref. Ниже сохранён точный ход локальной диагностики и первоначальная блокировка сохранения.

CODE STARTED: минимальный paidProductsFromName matcher точного А/A113ref и полного названия ЦКАД. Применяется только к уже имеющимся paidnames/paidbooths/segments через существующий coverage; не назначает цену и не доказывает free. Не расширять isTollBooth/gantryAPI этой задачей и не переписывать frozenvalidation. Focused≤60с: exactunicode variants,lookalikes/другиеAroads,ownforward→missingCKAD,ownreverseбезCKAD; известные alias/unknownguards; fullbuild≤300с,TS/ESLint/diff. Нет новыхsource/route/trace запросов. До испытаний сохранить STARTED exactremote/readback. Следующий независимый шаг — строгаяпараОдинцово, после durableDONE/codeCI.

## Первоначальная локальная запись

Подготовка scopeSTARTED: initial diff --check сообщил лишнюю пустую строкуEOF; она удалена, final diff --check exit0.

# FIXED — оплачиваемая А-113 не теряется перед ценой Одинцово

18.10.2026. Source95c1fbd3094ae7b076462d8c0cd4949ed72d52a5/tree0846e6b0, branch/PR14draft совпали; durable STARTED/scopeevidence сохранены/readback. CI предыдущего identityкода39146933232 обе jobs completed/success; ожидание не отменялось,дубликатов0. Предыдущая локальная блокировка сохранения закончилась: запись LOCAL-CI-BLOCKED уже доступна в GitHub в95c1fbd3 и хранит первоначальную историю, не текущее состояние. Непривязанные подготовительные tree/commit при ожидании не изменяли branchref.

lib/v3-calculation/unpriced-road-coverage.ts теперь распознаёт точный А/A113ref с вариантами dash/space и полное имя «Центральная кольцевая автомобильная дорога» как productckad. Поддерживаются несколько aliases одного booth через·. Сохранён приоритет МалыхВязём/региональных productnames. А1130/А113а/А107/М113/«съезд наА113» и названияподъездов не совпадают. Это распознавание уже оплачиваемых/кандидатных имён, не доказательство тарифа/free. isTollBooth/gantryAPI, матрица/цены и frozenvalidation не менялись. Сырой toll_gantry12443433262 как раньше отсутствует вbootharray, но его платнаяА113 теперь блокирует неполныйполныйитог черезpaidroadname; общий парсингвсехgantries отдельная задача, не заявлен исправленным.

Новые4regressiontests в scripts/v3-ckad-alias-coverage.test.ts: exactname/unicode/alias,negative lookalikes,paidname безbooths иincompletecoverage, собственные quotes и POST/NextRequest replay двух уже сохранённых captures. Forward Голицынo→Рублёво46386м/2811с: missing=['ckad','odintsovo']; reverse43941м/2638с: missing=['odintsovo']. Оба выбранныхproviderOSRM сохранены, amountnull/statusunknown. Ранее записанные Valhalla trace responses относятся к диагностикеselectedOSRM; не путать providerroute сtraceprovider. Никаких реальных externalrequests/replaymisses/неожиданныхfetchattempts0; avoidtollalternatives0. Новых pricedcomponents/подтверждённых полных тарифов0. НовыеAPIreplays2,directquotes2; oldrouteaudit/primary4GET/27points не повторялись.

Initialfocused17/18: неверное новое тестовое ожидание Valhalla вместо фактического ownproviderOSRM. Исправлено только ожидание на r.provider, код не подгонялся; initiallog сохранён. Finalfocused18/18 PASS (timeout60s; новые4+identity4+coverage10). Full timeout300s npm run build exit0:792/792+quotecontractsPASS, Next16/16. Отдельные tsc--noEmit и targetedESLint2files exit0; gitdiff--check exit0. Логи/API/quotes/manifestSHA в checks/2026-10-18-odintsovo-pair-scope/coverage/.

Сохранение codeDONE: localcommit→authorizedGitHubblob/tree/commit/nonforceref→exactremote/PRtree readback; post-savecodeCI отдельно. Не выдавать прошлыйCI за проверку новогоизменения.

NEXT после codeCI: boundedstrict17,7↔6,9 scope: полная namedпродуктовая непрерывность включаянетарифицируемые links, exactboothorder/way/direction/geometry, нетexit-reentry/повторов/другихплатныхсобытий. Использоватьуже4primaryGET/27points иготовыеoperatorroute/PVPexamples; при необходимости currentparsercontext толькообоснованныйofflinecapture replay,неlive. Затем separateCODESTARTED fareadapter готовыхcategoryI/noTransponderячеекпоdaystart, boundarytimecontrols и ownAPI/fullgate. Forwardfullamount обязан оставатьсяnull пока отдельныйCKAD/mалыеВязёмы не имеет точнойсобственнойцены, дажееслиСамОдинцовооценён. Reverseполныйитог только после собственногоstrictscope. Никаких новыхисточниковготовыхцен/маршрутныхаудитов. Main/merge/Production/Android unchanged.

# STARTED — строгий контекст и matcher пары Одинцово, без денег

18.10.2026. Source db7d0c5c2982044bff94f5de696a20d65d706348/tree469a77ac, clean local, PR14draft/head совпали; codeCI39148079088 verify/live_probe completed/success. Готовые исходники и источники4GET/27points не повторять.

Короткая materialscope выборка двух ownraw traces показала: forward namedСООblock157–217 (61edge), reverse50–108 (59edge), внутри включены nontoll именные связи и точные безымянные way374972862/374972870; repeatedway послеcollapse0. Перед/после есть внешние дороги, два exactknownbooths в правильном порядке; безымянныхpaidребер внеblocks0. Не новыйrouteaudit. ForwardotherCKAD уже корректно удерживает wholeamountunknown; этого не отменять.

Незавершённый шаг разделён по реальному объёму:
A (этот STARTED): optional odintsovoTraceBlocks в валидаторе: continuousproduct names плюс две independentlyknownunnamedlanes, полныеbefore/after, collapsedrepeatflag и allevents в блоке. Отдельный inspectOdintsovoPair(route,validation) требуетcompletechunks/booths/одинblock/нетrepeat/exacttwoeventorder, совпадение независимых27physicalpoints/order/density, безcaseIDs/денег/дат. Не подключать matcher к ценам. Owncurrentvalidation получить обоснованным2exactrecordedtrace replay сmisses0 (старыйsnapshotнеимеетновогоctx); данные сохранить, полныеoldfieldsсравнитьexcludingnewctx/CKADctx. Никакойlive/source/routingсети. Focused≤60с, fullbuild≤300с,TS/ESLint/diff; негативныеmissingctx/2blocks/namedfreegap/reentry/repeatevent/wrongnodeway/direction/incomplete/sparse/shifted. ЧастьA сохранять отдельно сexactremote/readback/codeCI.
B послеA иCI: отдельныйfareadapter готовыхoperatormatrixcells, directional day/time context по отправлению, включая источникweekday/weekendHolidaycalendar (не путать M11customcalendarсОдинцовским). Только доказанныеprofilecontext использовать; при недостаткеcalendarданных конкретныйblocker вместо догадки. Никаких новыхцен вA.

NEXT: durable STARTED/readback, выполнить толькоA. Цены/матрица/frozenvalidation не меняются, старыйsnapshot по-прежнемуunknown. Main/merge/Production/Android unchanged.

# PART A DONE — строгий двухнаправленный проезд ПВП Одинцово, без тарифа

18.10.2026. Source/durableSTARTEDc88f0f7f0425ae92f3368792be6b7e555ca6f2a9/tree4c13cbeb, branch/PR14draft/readback совпали; старыйcodeCI39148079088 verify/live_probecompleted/success. Локальное дерево выровнено по exactremote перед кодом. Первая попытка загрузки STARTEDобратилась к утраченному междутуровомуhelper и завершиласьReferenceError доupload; helperсозданзаново, всеblobs/tree/ref/readbackSTARTED затем проверены. Никакие ранее полученныеsource4GET/27points не запрашивались снова.

lib/toll-validator.ts теперь добавляет optionalodintsovoTraceBlocks только приnamedСОО/independentlyknownlaneway. В блок включены nontollсвязи и безымянныеknownplazaways, before/after, collapsedrepeatflag, compactedges сnodeIDs/wayIDs/именами/toll/paymentEvent. Включениеgantry какpaymentEvent локальновконтекстеСОО не меняет общийtollBooths/isTollBoothAPI. Поле не является разрешением цены. Для прочихдорог без такого блока полеопущено; frozenvalidations не переписаны. В odintsovo-lane-identity.mjs отдельный isOdintsovoLaneWay применяется только как physicalcontinuity identity, не как фактпрохожденияgate.

Новый standalone lib/v3-calculation/odintsovo-pair-boundary.ts exportinspectOdintsovoPair: completeintegerchunks/boothcoverage/tollstatus, одинcontinuousblock, boundarybefore/after, productnamedfirst/last, validway/endnode, отсутствиенепоследовательногоповтораway и любыхповторовendnode, ровнодваpaymentEvents сexactnode/way и ownboothorder, paidlaneevidence, независимыеполосы27sourcepoints с25m/order/density1km/bodylengthbound1.8chord. Выход только direction/plazavector, безcaseID/даты/денег. Дляforward17,7→6,9, reverse6,9→17,7. К resolver/composer/ценам НЕ подключён. Нельзя заявлять новыеpricedcomponents.

scripts/v3-odintsovo-pair-boundary.test.ts обоснованно восстанавливает newcontext издвухownsavedtrace responses:2exactmockrequests/misses0; прежниеfieldsdeepEqualoldvalidationexcludingnewOdintsovo/previousCKADcontext. Сохранены currentvalidations с61/59edges. Третийmockrequest — mutatedfreecitygap втомжеraw: paidRoadEdges/tollBooths неизменны, но2blocks, matcherreject. Это negativeparsercase, неlive/новыймаршрут. Новыхexternal/source/routing/traceHTTP0, непредвиденныхfetchattempts0. В новыхтестах40contextnegativeasserts (20вариантов×2owncases),10geometrynegativeasserts, обаoldfrozenctxmissingreject; standalonequotes2по-прежнемуodintsovomissing/amountnull. СуществующиеAPIregressionsвfocused такжепрошли; новыхAPIцен0.

Фактические проверки: focusedtimeout60s13/13PASS (новых5+existingidentity4+CKADalias4); никакихinitialtestfailures. Fulltimeout300snpmrunbuildexit0:797/797+quote/APIcontractsPASS,Next16/16; отдельныеtsc--noEmitи targetedESLint4changedcodefilesexit0,gitdiff--checkexit0. Логи/validation/negativechecks/SHAmanifest в checks/2026-10-18-odintsovo-continuity/. Новыхpricedcomponents/подтверждённыхполныхтарифов0.

Сохранение codeDONE выполняется черезлокальныйcommit/authorizedGitHubblobtree/expectedparent/nonforceref/exactremote/readback; новыйcodeCIпроверятьотдельно. Main/merge/Production/Android unchanged.

NEXT PART B после codeCI: готовыйtariffadapter длястрогодоказанных17,7↔6,9, толькоизcurrentselectedcategoryI/noTransponderячеек, безизмененияматрицы. Тарифконтекстзамороженвотправлении; roadcalendarsсохраняются. Нуженобоснованныйcalendarweekday/weekendHolidayдляСОО, не переноситьM11customholidayoverrides поаналогии. Еслиsourcecalendarнепозволяетдату — profileunknown, не гадать. Operatorroute/PVPexamples/tableужеесть; несобиратьихзаново. Даты/времяграниц/направления/ownquotes/APIready/unavailable/negatives/fullbuild — отдельныйboundedSTARTED. Forwardwholeamountnull покаCKADнеоценён; reversewholeтолькопослеобоснованногопрофиля. ГотовуючастьA/4GET/27pointsourceproof/старыеаудитынеповторять.

# RECOVERY DONE / STARTED — calendar перед тарифом Одинцово

18.10.2026. Remote/PR14draft head24ea6edc9a6a17c44df7d9d40e8f4f060125075c/ tree566d967fa4d457f0431c53e33970c10246f07ded. CI39149617219 completed/success, verify/live_probe обаsuccess ранее прочитаны. Рабочийкаталогсессииочищен. Cloneизстаройлокальнойкопии2fe30f56e680 failed exit128:missingobjecta18460bd; чужаякопиянеизменялась. Затем freshsinglebranchcloneGitHubexit0,6148files,HEAD/treeсовпали,finalclean. Промежуточныйstatus былпрочитан доокончанияcheckout и показал временныеD — никакихdelete/reset по немуне выполнялось; послеfinishфайлывосстановлены. Зависимостиcp-alвреальнуюпапкуnode_modules. Результаты/sourceготовыхчастейнеповторялись.

Новыйнеразрешённыйвопрос — календарьдневныхпрофилейСОО: кандидатнаятаблицаужеесть,operatorroute/PVPbindingsиstrictmatcherготовы. НельзябратьM11customcalendarилигадатьпраздники. Доrecoveryслучайновыполненодинисковыйquerysitegovernment2026/переносы:выдача нерелевантна,содержаниенеиспользовалось,страницынеоткрывались. Запроснеповторять. Дальнейшийисточникобосноватьотдельнымboundedпроходомниже.

STARTED boundedcalendarpass:≤2новыхdomain-filteredofficialqueries government.ru/rosmintrud.ru,затем≤2primarypage/documentreads понайденнымновымточнымURL. Искать только2026переносы/полныйпроизводственныйcalendar; готовыеM-Roadтарифы/FAQ/4OSMGET/27pointsнеповторять. Сохранятьответы/primarytextURL/SHA/progressсразу. Без обхода403/повторныхнеизменныхзапросов. Еслинетдостаточногоcalendarисточника — BLOCKEDprofile,адаптернеопределяеттарифпоаналогии. Принадёжномcalendar — отдельныйDONE/CODESTARTEDсгодовойобластьюдействия,daystart/ночь01–05,направленныемatrixprofiles,безизмененияденегматрицы. Сначала durableSTARTED/readback передэтойсетью.

NEXT: exactclone/commit/readback recoverySTARTED, выполнитьтолькокалендарныйпроход. Затем отдельныйboundedfarecode+ownquotes/API/fullgate. НикакихProduction/main/merge/Android.

# CALENDAR DONE / CODE STARTED — тариф Одинцово по строгой паре

18.10.2026. Durable recoverySTARTED e310359d418c5fb036d00a53208bc774bf40da12/tree8895c56f/readback verified; PR14draft. СтараяветкаCI39149617219completed/success,docsSTARTEDбезновогокода.

Выполнен boundedпроход:2domain-filteredqueries (одинbatch),2directprimaryGET. Поиск далофициальнуюстатьюМинтруда/social/social/1366 со всеми2026диапазонами иофициальныйadoptedPDFпостановления24.09.2025№1466:перенос03.01→09.01,04.01→31.12. Полныйсодержательныйтексткороткогопостановленияприведёнвпоисковомизвлечении,официальныйURL. СтатьяМинтруда01.07.2025 самаproposal; трансферы подтверждаютсяпозднейшимadopteddecree. DirectPDF503,MintrudHTML403,безretry/обхода. СкачанныхPDF/HTMLнет. Индексированнаяофициальнаятекстоваявыдачасохранена в source-snapshots/odintsovo/2026-calendar/search-results.json, rawfailure/progressотдельно. ПопыткалокальногопарсингаHTMLвыявилаотсутствиеbs4; HTMLнеполучен,новыезависимостинеставились. Это не прочитанныйPDF и не операторскийчек.

Решение: принять source-derivednationalcalendar2026 издвухофициальныхиндексированныхтекстов; этоявнаяинференция,непереносM11customholidayrules. calendar-2026.jsonсодержитSat/Sunиadditionaldates,transferredworkingdates[],ссылки/ограничения/SHAвыдачи. Вычисленнаясверка365дней:118nonworking/247working (арифметическаяпроверка,не независимыйисточник). ТарифСООweekendHolidayсемантикаужесохранена вoperatorcandidate; Птвыбираетсяweekdayпоегоroadcalendar,непереноситьМ4calendar. Матрица/ценынеменяются. Новыхpriced0.

CODE STARTED bounded: standalonecalendar/profile resolver EuropeMoscow только2026,ночь01:00–04:59:59=night;05:00–23:59:59день,weekdaytowardpeak07–13,awaypeak16–22,weekend/holidaydayпоcalendar. 00:00–00:59:59unknown:таблица05–01неописываетнадёжноcalendartransition,ценупоаналогии невыбирать. Время/датавсейпоездкизамораживатьвотправлении черезdepartureTariffContext,никакихper-PVParrivalclock.

ПодключитьinspectOdintsovoPairкрегиональномуcomponentadapter,exactmatrixcellsотготовыхfrom/to/profileсpvpVector17,7↔6,9. Двеодинаковыепрофильныеклассификацииповектору,непересчитатьфактическиевременаоплаты. Старыйvalidationбезctx→unknown. Onlystrictpairразрешаетцену;дополнительныеплатныекомпонентысохраняются,forwardCKADwholeamountnull;reverseприknownprofileполныйunconfirmedestimate. Готовыеsources/strictmatcherбезповтора. Тарифы650/700/20изматрицы,неменять.

Проверки≤60сfocused:own5date/timeprofilesвобоихнаправлениях,границы01/05/07/13/16/22/24,timezoneequivalence,праздник04.11/перенос31.12,год2027/pre-effectiveunknown,invaliddate,00–01unknown,negativecontext/reentry;ownPOSTrecordedresponsesreadyreverse650/forwardnullCKAD,trace503→null,безexternalrequests/avoidroutes. Fullbuild≤300s,TS/ESLint/diff. Сохранитьevidence/DONE/remote/readback/codeCI. Никакихmain/merge/Production/Android.

NEXT: durablecalendarDONE/CODESTARTED,затемтолькоэтотadapter/profileblock. Ограниченияполученияcalendarисточниковне скрывать.

# PART B DONE — подключён тариф строгой пары Одинцово

Дата: 18.10.2026. Ветка: fix/v3-missing-route-prices-2026-10-15, PR №14 остаётся draft.
Исходный коммит и сохранённый CODE STARTED: b08de00a6eaa6d1963d4aa0032d62a46f81604ca; дерево 8420f41e0c3fb164cb48c352f3efe98d8fae9979. Их точное соответствие локальному дереву и PR проверено. Предыдущий CI кода №39149617219 завершился успешно; новый CI этого изменения проверяется после сохранения.

## Что изменено

Добавлен lib/v3-calculation/odintsovo-pair-component.ts. Адаптер требует положительный inspectOdintsovoPair: полный trace, один непрерывный блок, точные полосы и порядок двух ПВП, независимые геометрические свидетели. Имя дороги или близость к ПВП сами по себе цену не разрешают. Адаптер подключён только к региональному компоненту odintsovo в route-leg-pricing.ts.

Используются существующие направленные ячейки TARIFF_SELECTION_REGISTER: Минское шоссе → Рублевский проезд / МКАД и МКАД → Минское шоссе. Цена берётся готовым вектором, не новой суммой: обычный дневной/выходной профиль 650 ₽, пик соответствующего направления 700 ₽, ночь 20 ₽. Числа, строки и генератор матрицы не менялись.

Europe/Moscow, дата и время отправления фиксируются для всей поездки через departureTariffContext. Прибытие и часы прохождения отдельных ПВП цену не меняют. Ночь 01:00–04:59:59; с 05:00 дневной профиль. В рабочие дни пик к Москве 07:00–12:59:59, из Москвы 16:00–21:59:59. Выходные/праздники определяются отдельным календарём СОО, не календарём М-4 или М-11. Пятница остаётся рабочим днём согласно сохранённой таблице этого оператора.

Календарь ограничен 2026 годом. Основание — ранее сохранённые официальные индексированные тексты Минтруда и принятого постановления №1466; это явно source-derived inference, а не скачанный PDF, операторский календарь или чек. Прямые PDF/HTML запросы дали 503/403 и не обходились. Для 00:00–00:59:59 нет надёжной трактовки перехода тарифного дня, поэтому цена unknown. За пределами 2026 года, до действия тарифной строки, при неправильной дате или неполном контексте также unknown. Эти ограничения не скрыты fallback-ценой.

## Проверенные результаты

Два собственных маршрута, пять профилей отправления на каждом (10 direct quotes):
- Чт 09:00: компонент к Москве 700 ₽; обратный полный estimate 650 ₽.
- Чт 23:59: 650 / 650 ₽, без переоценки по прибытию в следующие сутки.
- Пт 17:00: 650 / 700 ₽.
- Сб 09:00: 650 / 650 ₽.
- Вс 02:00: 20 / 20 ₽.

Все пять полных сумм к Москве остаются null: отдельный ЦКАД не оценён. Обратный маршрут при каждом известном профиле получает полный, но unconfirmed estimate. Старые frozen validations без нового контекста остаются unknown. Два новых рассчитанных компонента на двух собственных маршрутах; это не всё покрытие Одинцово. Новых независимо подтверждённых полных тарифов — 0.

Три новых POST/NextRequest replay: forward ready → null, missing CKAD; reverse ready → 650 / priced; reverse trace_attributes503 → null / unknown. Сохранены собственные OSRM 46386 м / 2811 с и 43941 м / 2638 с. Replay misses и неожиданные fetch attempts — 0, реальных routing/trace/source HTTP в кодовом блоке — 0, toll-avoid запросов — 0. Готовые 4 OSM GET / 27 source points не повторялись.

Новый scripts/v3-odintsovo-pair-pricing.test.ts проверяет профили, границы 01/05/07/13/16/22/24, временные зоны, праздничные и перенесённые дни, неизвестный год/дату/полночь, freeze-at-departure, отсутствие/повторы/неверный контекст и API. Два существующих теста обновлены под намеренное новое поведение: полный reverse API теперь 650; frozen snapshot без контекста по-прежнему не разрешает цену. Массовых изменений старых snapshots нет.

## Команды и реальные проверки

- Initial focused: 13/14. Ошибка нового тестового ожидания: публичный API по прежнему контракту удаляет priceConfirmation/displayLabel и текст неподтверждённости. API не меняли, тест согласован с существующим контрактом; внутренние quotes всё равно проверяют unconfirmed. Initial log сохранён.
- Final focused: timeout 60s, 14/14 PASS.
- Initial npm run build: тесты PASS, затем TypeScript FAIL (TS2339: reason не гарантирован в JS union). Отдельный initial tsc exit2. Исправлено безопасной проверкой наличия поля, без изменения денежных результатов; оба initial log/exit сохранены.
- Final timeout 300s npm run build: exit0, 802/802 + quote/API contracts PASS, Next 16/16.
- Final tsc --noEmit: exit0. Targeted ESLint пяти изменённых файлов: exit0. git diff --check: exit0.

Evidence и SHA256 manifest: experiments/nationwide-tolls/checks/2026-10-18-odintsovo-pair-pricing/.
Перед завершением требуется local commit → проверенные blobs/tree → commit с исходным parent → non-force ref → точное remote commit/tree/PR readback. Новый code CI отдельно. Main, merge, Production и Android не затронуты.

## Следующий шаг

После сохранения и нового CI перейти к точной рамке ЦКАД 12443433262 / way1080462753 перед обходом Одинцово. Сначала только сохранённые source/trace данные и готовые строки для Малых Вязём/ЦКАД: доказать операторский продукт и направление, не назначать цену по одному А-113. При нехватке первичных данных — отдельный bounded STARTED для точного недостающего источника. Готовые этапы Одинцово и прошлые аудиты не повторять. Ограничения календаря/00–01 сохраняются отдельной задачей; не выдавать обход 403 за их решение.

# STARTED — пользователь выбрал базовые 650 ₽ для планирования Одинцово

18.10.2026. Прямое уточнение пользователя: для текущего проезда Одинцово применять 650 ₽ независимо от ночных 20 ₽ и пиковых 700 ₽. Расчёт предназначен для предварительного бюджета, ночь заранее не прогнозируем, небольшую надбавку принимаем как возможную погрешность. Это базовая плановая оценка, а не арифметическое среднее или обещание фактического списания.

Общий принцип пользователя: в аналогичных ситуациях выбирать рациональную опорную оценку, не усложнять расчёт малозначительными временными факторами. Это не назначение650 любой платной дороге и не разрешение игнорировать целую дорогу/дважды начислять плату. Конкретные опорные тарифы других дорог выбирать по их данным и масштабу расхождения. Подробное уведомление о погрешности пользователь намерен обсудить отдельно.

Source/PR14draft head dbd1b81c13261bd42ceb7812d8473efa97d9357a, tree d3dc45f36ee4acb2314f31bf00e5d27370044312; CI39154472440 completed/success. Каталог сессии снова очищен, восстановлен свежий single-branch clone прямо из GitHub (старый повреждённый локальный clone не использовался); HEAD/tree совпали, clean. Зависимости cp-al в настоящую node_modules. Источники/готовые расчёты заново не собирались.

Ограниченный блок: убрать odintsovoDepartureProfile, зависимость runtime от праздников/календаря2026 и выбор ночи/пика. Использовать существующий готовый ordinary вектор650 в обоих направлениях как плановую базу; профиль матрицы здесь обозначает выбранную опорную строку, не предсказание часов прохождения. Дата отправления остаётся для проверки действия тарифной строки; долгота поездки не переоценивает тариф. Ошибочная дата/отсутствующая цена по-прежнему не выдумываются. 00–01 и будущий год больше не блокируют расчёт по причине часового календаря. Исторические тарифные строки20/700 и source snapshots сохраняются, числа матрицы не меняются.

Не расширять этот блок на геометрию/другие дороги. Forward с ещё неизвестным ЦКАД не выдавать за полный известный итог. Новая общая модель приближений обсуждена отдельно; общий fallback всех дорог требует отдельного конкретного внедрения.

Проверки: focused≤60с — ночь/пик/00–01/обычный день/выходные/праздник/2027 для обоих направлений650;10ownquotes;ownAPIready650 в ночи и пик,missingtrace→unknown; oldctx/unknownotherroad guards. Fullbuild≤300с, TS/ESLint/diff. Новый каталог evidence: checks/2026-10-18-odintsovo-planning-base-650/. Затем DONE/remote exact readback/codeCI. STARTED сохранить до кода/длительных тестов.

NEXT: durable STARTED/readback, минимальное упрощение и проверки. PR14draft; main/merge/Production/Android не менять.

# DONE — базовые 650 ₽ для планирования пары Одинцово

Дата: 18.10.2026. Ветка fix/v3-missing-route-prices-2026-10-15, PR №14 draft.
Source / durable STARTED: 99d78d5b8b56fdd5e81b7eacc3c7818dd8eaa3a0, tree ab43acf6840ca1c3b356f74ed3c2290444d643f8. Exact remote/PR/tree readback проверен, локальная ветка выровнена без изменений файлов. Предыдущий code CI39154472440 completed/success; новый CI проверять после сохранения кода.

## Решение пользователя и реализация

Пользователь прямо выбрал 650 ₽ как базовую плановую оценку Одинцово. Ночные20 ₽ и пиковые700 ₽ не прогнозировать. Это предварительный бюджет поездки; ночная скидка может уменьшить фактическую оплату, небольшая пиковая надбавка допустима. Решение заменяет прежнюю часовую классификацию этой пары. Для других дорог принят принцип рациональной опорной оценки, но их конкретные базы этим изменением не назначены. Новые уведомления о погрешности не добавлены — пользователь намерен обсудить их отдельно.

В lib/v3-calculation/odintsovo-pair-component.ts удалены odintsovoDepartureProfile, импорт календаря, типы часовых профилей и логика ночи/пиков/праздников. Дата отправления используется только для срока действия уже существующей ordinary тарифной строки, а не для предсказания момента прохождения ПВП. Матрица не менялась. Для обеих доказанных направленных пар выбирается готовый weekdayOrdinary|weekdayOrdinary вектор650 как плановая база; это сознательный выбор опорной строки, не утверждение о фактическом буднем дне. В поле period указано «базовая оценка».

Устранены отказы из-за 00:00–00:59 и отсутствия календаря2027: действующая базовая строка может использоваться для планирования без годового часового календаря. Ошибочная дата, дата до действия строки и некорректные входы по-прежнему обрабатываются как unknown. Исторические значения20/700, source snapshots и старые журналы сохранены. Физический matcher и остальные дороги в этом блоке не менялись.

Это упрощение тарифной части. Общая модель приближённых ответов и перенос общей проверки непрерывности из частных адаптеров ещё не реализованы этим изменением. Forward по-прежнему имеет отдельный неизвестный ЦКАД, поэтому650 не выдаётся за весь маршрут.

## Проверки

scripts/v3-odintsovo-pair-pricing.test.ts обновлён под новое прямое правило пользователя:
- 7 дат ×14 времён ×2 направления =196 проверок базовых650: ночь, пик, 00–01, будни/выходные/праздники/2027.
- 10 own direct quotes: на двух маршрутах все компоненты Одинцово650; reverse полный planning estimate650, forward полный amountnull из-за CKAD.
- 6 собственных API replay: forward ready/null; reverse ready650; unavailabletrace/null; reverse ночь, пик и00:30 —650. Сохранились own OSRM46386м/2811с и43941м/2638с. Все replay misses / unexpected fetch attempts0. Реальных routing/trace/source HTTP в кодовом блоке0, toll-avoid запросов0.
- Отрицательные проверки отсутствующего/неполного/повторного/неверного контекста и чужих платных компонентов сохранены; новая цена не маскирует целую неизвестную дорогу.

Реальные команды и результаты:
- timeout60s focused3files:14/14PASS, ошибок нет.
- timeout300s npm run build:exit0,802/802+quote/API contractsPASS,Next16/16.
- tsc --noEmit:exit0; targetedESLint2files:exit0; gitdiff--check:exit0.

Evidence: experiments/nationwide-tolls/checks/2026-10-18-odintsovo-planning-base-650/, manifestSHA256. Матрица/генераторы/источники не менялись. Код адаптера стал короче на21строку; подробные часовые графики больше не участвуют в деньгах этой пары. Независимо подтверждённых полных операторских тарифов0 — выдаётся плановая оценка.

## Сохранение и следующий шаг

Сохранить localcommit и exacttree в authorized GitHub branch с parent99d78d5b/nonforce/ref/readback; новый codeCI отдельно. Main, merge, Production и Android не затронуты.

После CI применять новую постановку задачи к дальнейшей очереди: сначала выбирать обоснованные готовые опорные тарифы и устранять избыточные календарные отказы, а не автоматически продолжать углублённые доказательства каждого частного пути. Для оставшегося ЦКАД перед Одинцово12443433262/1080462753 сначала использовать уже сохранённые данные и готовую таблицу продукта/интервала. Не приравнивать650 к любой дороге; крупные пропуски/дубли по-прежнему исправлять. Конкретный общий fallback и уведомления о погрешности требуют следующего ограниченного блока, не считать их уже внедрёнными.


# DONE — локальная проверка матричной пары ЦКАД для А-113

18.10.2026 22:52 МСК. Продолжена работа после пользовательского решения применять рациональные базовые тарифы. Сверены только сохранённая category-I CKAD direct-pair matrix и собственный Golitsyno→Rublevo capture/его record.validation. Матрица использует выбранную пару въезд→выезд среди 15 узлов; capture подтверждает наличие платного А-113 блока, но просмотренные поля не устанавливают его CKAD entry→exit. Ранее сохранённый gantry `12443433262`/way `1080462753` также не определяет тарифную ячейку без граничной пары. Вывод: базовый тариф для Одинцово остаётся применим только к своей паре; CKAD цена по аналогии не присваивается. Никаких внешних запросов, повторных маршрутных replay, изменений кода или тарифных данных не было. PR14 остаётся draft, production не менялся. Подробно: `docs/checkpoints/2026-10-18-ckad-a113-matrix-pair-review-DONE.md`. NEXT: проверить точную физическую пару на уже сохранённых геометриях и сопоставить с матрицей; при невозможности — не изобретать сумму и брать следующий привязанный продукт.


# DONE — saved trace подтвердил непрерывность А-113

18.10.2026 22:52 МСК. Из ранее сохранённого forward Golitsyno→Rublevo capture локально прочитан только Valhalla trace_attributes response `calls[3]`; внешний replay/HTTP не запускался. Элементы46–53 составляют непрерывный8edge paid=true block А-113/ЦКАД, edge54 free; отдельного exit/re-entry нет. Повтор way1080462753 на соседних ребрах — split одного way, не повторный участок. Это подтверждает принятую пользователем модель прохода по непрерывной платной дороге. Статус выбранного provider — OSRM; diagnostic trace не объявляется route provider. Точный entry/exit для directFare matrix пока не доказан, поэтому тарифа не добавлено, amount остаётся unknown из-за ЦКАД. Подробно: `docs/checkpoints/2026-10-18-ckad-a113-saved-trace-continuity-DONE.md`. NEXT: проверить только сохранённые boundary inventories на точную пару matrix nodes; никаких повторных route/source requests.


# DONE — короткая сверка CKAD inventories для блока А-113

18.10.2026 23:52 МСК. После восстановления свежего clone проверен локальный head `99130ef3c733e3519cd6d9e7a80fb20a302b8dbd`, tree `3d3f02409aca7435717d2cc8ca7688e79740f123`, PR14 draft; workflow run на docs-only commit отсутствует. Сопоставлены ID блока A-113 edges46–53 из уже сохранённого trace и три локальные CKAD physical inventory: M11→M12, CKAD exit to Ramenskoe/A107 `physical-directed.json`, и `physical-exit.json`. Точных совпадений way/node IDs нет. Эти файлы предназначены для других пар и не задают boundary текущего участка; вывод ограничен именно ими. Новый route/source запросов и replay нет; code, fare matrix и runtime не менялись. Непрерывность из предыдущего checkpoint остаётся установленной, re-entry-гипотеза повторно не проверялась. Подробно: `docs/checkpoints/2026-10-18-ckad-a113-inventory-match-DONE.md`. NEXT: перейти к следующему заранее подготовленному и уже привязанному тарифу; этот blocker не повторять без новых boundary evidence.

## DONE / BLOCKED — новые официальные источники по ЦКАД и ЗСД, 2026-10-19

По запросу пользователя «Ищи недостающие данные» проверены только официальные страницы ГК «Российские автомобильные дороги», Автодора и WHSD. Открытые страницы roadckad.ru различают развязку ЦКАД-3 с М-11, А-107 Никольское-Горки, М-8/А-107 и М-7 от развязки ЦКАД-4 с А-107/Егорьевским шоссе; отдельно указано, что ЦКАД-5 включает реконструированный участок А-107 и бесплатен. Текущий индекс тарифов Автодора выдаёт 119 ₽ для М-11—Никольское-Горки, но локальный сохранённый выход М-11→Егорьевское — way119881263/node3140785578 at 38.3591975,55.6313228, а вход М-11 в snapshot at37.1996241,56.0900701: 119 ₽ к нему не переносить.

Офлайн прочитан только соответствующий сохранённый участок trace capture Golitsyno→Rublevo: toll=true edges46–53, координатный диапазон lon37.009077–37.014098, lat55.618699–55.631242. Официальное утверждение о бесплатном ЦКАД-5 создаёт потенциальное противоречие, но принадлежность этих координат конкретному пусковому комплексу не доказана; возможная близость к ЦКАД-5 — inference, не source-proven. Сохранённый тариф для А-113 не выбран. По WHSD найден действующий раздел тарифов 2026, но поиск не дал точной связки РВП64/64E с cash/card тарифной зоной; open returned502, обхода не было. По Автодору tariff index/PDF direct open вернул403; поисковый индекс показал строку119, сама такая строка уже имеется в сохранённой матрице.

Изменений кода/матрицы/цен нет; новых route replay, route HTTP и скачиваний0; новых priced components0, подтверждённых full fares0. PR14 remains draft, source head cebd5550, current workflow list for that head empty. Полный evidence: `experiments/nationwide-tolls/checks/2026-10-19-ckad-whsd-source-followup/result.json`; подробный checkpoint `docs/checkpoints/2026-10-19-ckad-whsd-source-followup-DONE.md`. Следующий шаг — офлайн сопоставить сохранённую геометрию edges46–53 с участками ЦКАД-5/3-5, без нового route/source fetch и без цены до точного соответствия.

## 2026-10-19 — PK-5 chainage crosswalk for saved A-113 trace

A bounded official-source lookup found that Russian Highways identifies PK-5 as toll-free, publishes PK-5 chainage km 252+170–334+440, and a Moscow Region law assigns the A-113 section in Golitsyno km 268+001–273+700, including the M-1 interchange. Those ranges overlap, narrowing the likely identity of saved toll=true A-113 edges 46–53. The capture coordinates are nearby, but an exact coordinate/way-to-chainage join is still missing; no fare was assigned and no code/matrix changed. No route replay, route API request, or source download. [Checkpoint](../../docs/checkpoints/2026-10-19-ckad-a113-pk5-chainage-DONE.md); [evidence](checks/2026-10-19-ckad-a113-pk5-chainage/result.json).

## BLOCKED — официальный crosswalk ЦКАД-5 недоступен по опубликованной ссылке

19.10.2026. Пользователь попросил продолжить поиск недостающих данных. Проверены фактические PR #14 draft, branch head `c23b13a9914babce74cc8e8d68171aa8fc98b5ad`, clean local tree и Actions run `39211015878` (verify success, live_probe active). Открыта уже найденная официальная запись администрации Наро-Фоминского округа о документации планировки ПК-5; опубликованная ссылка ведёт на `https://yadi.sk/d/-VNEML1GXHYsTA`. Одним bounded fetch ссылка разрешилась в `https://disk.yandex.com/d/-VNEML1GXHYsTA`, где сервис вернул “Link blocked — The file is blocked for violating the terms of placing user content on Yandex services.” Сам документ не получен/не прочитан, обхода нет. Это не доказывает coordinate/way-to-chainage для saved A-113 edges46–53 и не позволяет начислить ноль. Уже сохранённые правила ЗСД `Pravila0926.pdf` отдельно проверены по их DONE-записи и не дают связь РВП-64 с зоной; повторного чтения/GET не было. В текущем NEXT_STEPS нет иной заранее подготовленной mapped-fare пары, где одновременно доказаны границы и собственная строка цены. Код, матрица и runtime не менялись; новый маршрут/replay/source download — 0; новые priced components — 0. Подробно: `docs/checkpoints/2026-10-19-ckad-a113-pk5-plan-link-BLOCKED.md`; evidence: `experiments/nationwide-tolls/checks/2026-10-19-ckad-a113-pk5-plan-link/result.json`. Следующий шаг только после доступного официального crosswalk или новой prepared boundary+fare пары. PR14 остаётся draft; не merge/main/Production/Android.


## 2026-10-19 — проверка старой авто-ошибки Москва—Казань по saved M-12 evidence

Открытый issue #2 от 29.09.2026 сообщал для Москва—Казань 0 ₽/segments=0 при ожидаемом диапазоне 3 500–7 500 ₽. В текущей ветке прочитаны только существующие live/replay поля двух сохранённых systemic cases, без новых route/source запросов: `single-m12-moscow-to-kazan` и `single-m12-kazan-to-moscow`. Для обеих трасс Valhalla trace complete; `roadCoverage` подтверждает traversal M-12; weekday/weekend replays содержат 3 513 ₽ и `priceConfirmation=unconfirmed`. Симптом не воспроизвёлся на этих двух аналогичных cases, но точные исторические issue controls не найдены, поэтому cause не объявлена устранённой. Для Ейск—Москва и Майкоп—Москва exact saved captures в дереве не найдены; эти два случая остаются открытыми. Изменений кода, тарифа или матрицы, новых replay/API/live requests — 0; build/tests не запускались, так как только читались сохранённые JSON-результаты. PR #14 draft; исходный HEAD `b96a7fe82a1e74a912687237d5aeee9d3a917846`; Actions run `39212013910` success. [Checkpoint](../../docs/checkpoints/2026-10-19-issue2-m12-saved-route-review-DONE.md). Next: проверить Ейск—Москва и Майкоп—Москва только через точные route controls/captures, без переноса M-12 результата.
## 2026-10-19 — наличие capture для Ейск—Москва / Майкоп—Москва

Следующий пункт актуального NEXT после проверки issue #2 — оценить, есть ли exact route controls/captures для двух других старых нулевых результатов. Инвентарь имён в `experiments/nationwide-tolls` не дал совпадений `yeisk/yeysk/maykop/maikop/eysk`; поиск соответствующих русских/латинских названий по несжатым JSON в `source-snapshots/systemic-road-audit-2026-10-15` и `checks` также пустой. `.json.gz` по содержимому не сканировались; точные endpoint controls из старого issue в текущем индексируемом evidence не установлены. Сохранённый вывод Москва—Казань на другие OD не переносился.

Запуск bounded cases остановлен до STARTED: текущий checkout sparse (только `docs/` и `experiments/nationwide-tolls/`), поэтому runner в `scripts/` отсутствует; `node_modules` отсутствует. Для нового route/provider трафика также требуются точные controls. Новых capture/replay/API/source запросов, кодовых или ценовых изменений — 0; build/tests не запускались. На удалённом HEAD `9376d179d8ad4573ff880aff08c717d8526ec858` PR #14 draft; run `39235786553` имел `verify=success`, `live_probe=in_progress`. [Checkpoint](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-capture-availability-BLOCKED.md). Следующий шаг — после завершения live_probe восстановить полный checkout/deps, найти runner и точные controls; затем отдельно начать только два bounded cases. Этот docs-блок требует commit/readback до любого дальнейшего независимого шага.
## 2026-10-19 — STARTED: восстановить runtime для Ейск—Москва / Майкоп—Москва

После проверки предыдущего docs commit `4954467988cf58a92acec725816e5f7688c70a82` точный remote head совпал с локальным, PR #14 draft; Actions run `39239030289` завершён, оба job `verify` и `live_probe` success. Подготовлен следующий ограниченный шаг: восстановить sparse-каталоги `scripts/`, `lib/`, `app/`, `components/`, `public/`, `data/` и установить зафиксированные зависимости (`pnpm@11.25.0`, Node v24.19.0). Runner и endpoint controls после этого проверить до запуска новых route requests. В этом STARTED блоке capture/replay/API/source requests не выполнялись. Детали и recovery — в [checkpoint](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-runtime-STARTED.md).
## 2026-10-19 — runtime восстановлен; найдены сохранённые project controls

По STARTED checkpoint восстановлены sparse каталоги `scripts/lib/app/components/public/data`; `pnpm install --frozen-lockfile` завершился с exit 0, 429 пакетов, frozen lockfile актуален. Найдены controls в `scripts/segment1-user-regression.mjs`: Ейск 46.711524,38.276451; Майкоп 44.609826,40.100653; Москва 55.755819,37.617644. В том же тесте находятся ожидаемые bands 5 240/7 240 ₽ и 6 090/8 400 ₽; это тестовые assertions, не подтверждённые оператором полные тарифы. `scripts/live-user-route-audit.mjs` содержит те же OD округлёнными координатами, но выполняет девять случаев; оба существующих широких runner не запускались. Текстовый поиск experiment JSON и file-name search не нашли сохранённых точных case captures. Точные исходные UI-controls issue #2 остаются неустановленными, поэтому новые будущие cases — проектный proxy, не точный повтор старого запроса. Ручных route calls/replay в блоке 0; code/matrix/fare unchanged; локальные tests/build после install не запускались. Workflow `39240195036` завершён `verify=success` / `live_probe=success` на parent commit `48e296d`. [Checkpoint](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-runtime-DONE.md). Следующий блок: подготовить отдельный двухслучайный capture harness, STARTED перед сетевым запуском.


## STARTED — 19.10.2026: bounded issue #2 proxy captures

Проверены PR14 open/draft, head/tree `82f4176`/`0d5809c`, локальный clean checkout exact match, CI `39241370620` success. По handoff выбраны только два project regression controls: Ейск→Москва и Майкоп→Москва из `scripts/segment1-user-regression.mjs`; это не доказанные исходные UI-точки issue и test expected amounts не тарификация. Следующий блок ограничен двумя собственными V3 API capture-вызовами с полным raw response/fetch evidence; затем separate offline same-date + Saturday replay. Код и матрица без изменений. [STARTED](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-capture-STARTED.md).


## DONE / STARTED — 19.10.2026: два issue #2 proxy capture, offline replay следующий

Собственный current V3 API вызван по одному разу на Ейск→Москва и Майкоп→Москва, оба с departure `2026-10-22T09:00:00+03:00`. Оба HTTP200, выбран Valhalla, все 14/15 raw fetch responses имеют HTTP200. Ейск: 1 271 781 м / 59 629 с, amount 4 340 ₽, weekday/weekend 4 340/5 240 ₽; Майкоп: 1 404 674 м / 65 838 с, amount 5 040 ₽, weekday/weekend 5 040/6 090 ₽. API route validation говорит complete для распознанного M-4 и одного toll edge; это не независимое подтверждение whole-route tariffs. Суммы отличаются от сохранённых test assertions 5 240/7 240 и 6 090/8 400. Historical issue coordinates не доказаны; captures маркируются project proxy. Full requests/responses/fetches и SHA-256 сохранены в [checkpoint](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-capture-DONE-replay-STARTED.md). Первая попытка прервана 8-секундным shell timeout до полного API response; процесс завершился, durable capture не было; один bounded повтор Ейск дал конечный complete capture. Код/матрица без изменений. NEXT: offline Thu/Sat replay из saved calls, сеть0/misses0/all consumed.


## DONE / STARTED — 19.10.2026: issue #2 V3 proxy replay и V2 comparison

Два собственных V3 captures завершены и сохранены с raw HTTP evidence. Offline replay обеих сохранённых трасс на Thu 22 Oct и Sat 24 Oct: 4/4 API HTTP200, live fetch0, misses0, unused responses0. Thu/Sat: Ейск 4 340/5 240 ₽, Майкоп 5 040/6 090 ₽; метры/секунды/provider стабильны. [V3 DONE](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-v3-capture-replay-DONE.md). Важная коррекция: `segment1-user-regression.mjs` проверяет `/api/v2`, V3 captures не сопоставимы напрямую с его test bands. NEXT: отдельный STARTED checkpoint на два V2 proxy captures и replay.

## STARTED — 19.10.2026: bounded V2 comparison

Проверить собственный `/api/v2/calculate` только для двух project controls Ейск→Москва и Майкоп→Москва из сохранённого runner, один четверговый capture на OD, полные raw inputs/API/fetches; offline same-call replay Thu/Sat. Не запускать широкий regression script; test expectations остаются assertions, не confirmed fares. [STARTED](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-v2-compare-STARTED.md).

## 2026-10-19 — РВП-64: новый официальный exact search завершён без тарифа

После durable STARTED `40f1b0ac47b0da756f552cc1faf8e653ca4addb5` выполнен ровно один новый system1 query `site:whsd.ru "64E" "Макарова" тариф`. Релевантной официальной страницы о связи РВП-64/ref64E/въезда Макарова с cash/card product до ПВП `933975069` не получено; выдача нерелевантна. Нового GET/replay/route/source документирования не было; search tool не предоставил экспортируемый raw/JSON или SHA. Запрос и ограничение отмечены в [DONE/BLOCKED checkpoint](../../docs/checkpoints/2026-10-19-rvp64-official-domain-search-BLOCKED.md). Итог: `BLOCKED_BY_MISSING_RELIABLE_DATA`; unknown не ноль, новые тарифы/компоненты0, код/матрица без изменений. Удалённое сохранение этого блока ожидает завершения CI `39247653701`. Возобновлять только при независимом точном операторском источнике/схеме или датированном чеке.
## 2026-10-19 — РВП-64: bounded exact search STARTED

По прямому указанию пользователя возобновлена только причина РВП-64. До нового внешнего запроса сверены ветка `fix/v3-missing-route-prices-2026-10-15`, чистое дерево и head `82941bf0d0fc4b19241f6f02265921c27b7a5c61`, PR #14 open/draft, CI run `39244213930` success. Предыдущие exact owner search, current-rules PDF и точная физическая идентификация изучены в сохранённых checkpoints; они не доказывают продукт наличными/картой на РВП-64 до `933975069`. Поэтому сохранён STARTED на один новый доменно-ограниченный запрос `site:whsd.ru "64E" "Макарова" тариф` и максимум одну прямо релевантную страницу оператора. Старые запросы, PDF, route batches и checks не повторять. Code/fare matrix unchanged. [STARTED](../../docs/checkpoints/2026-10-19-rvp64-official-domain-search-STARTED.md).


## 2026-10-19 — корректировка статуса сохранения РВП-64

Уточнение к непосредственно предшествующей записи: фраза «удалённое сохранение ... ожидает завершения CI `39247653701`» ошибочна. DONE/BLOCKED запись уже была сохранена в разрешённой ветке commit `d7635f220c95bfc1b5ae78f9346ab7fc7f4b04d1`; tree и четыре файловых SHA были сверены. Сохранение не ожидало этот CI. Датированное исправление и текущее состояние CI/head: [checkpoint](../../docs/checkpoints/2026-10-19-151200-rvp64-save-state-correction.md). Нового независимого первичного источника нет; тариф остаётся unknown, новых цен/компонентов 0, runtime/матрица без изменений. Следующий шаг — только при новой точной операторской схеме/таблице или датированном наличном/карточном чеке.
