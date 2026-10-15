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
