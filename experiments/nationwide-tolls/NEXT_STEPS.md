## DONE — runtime восстановлен; regression controls найдены, captures отсутствуют

[Отчёт](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-runtime-DONE.md). Dependencies installed; runner candidates `scripts/live-user-route-audit.mjs` (9 routes) и `scripts/segment1-user-regression.mjs` (широкий regression suite) намеренно не запускались. Сохранённые city coordinates найдены в тестах, но нет доказательства, что это исходные issue controls; captures/replays отсутствуют. NEXT: отдельный STARTED, изолированный только для Ейск→Москва и Майкоп→Москва, один capture на case с сохранением inputs/raw response, затем offline weekday/weekend replay. Test expected amounts не считать подтверждёнными тарифами.

## HISTORICAL STARTED — восстановление runtime перед двумя issue #2 cases

[Исходный STARTED checkpoint](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-runtime-STARTED.md); блок завершён итогом выше. CI run39239030289 завершён `verify=success`, `live_probe=success`.

## BLOCKED — issue #2: Ейск—Москва и Майкоп—Москва требуют bounded capture/replay

[Проверка наличия evidence и текущий runtime blocker](../../docs/checkpoints/2026-10-19-issue2-yeysk-maykop-capture-availability-BLOCKED.md). В именах сохранённых файлов и searchable JSON в systemic audit/checks нет точных route records; exact issue endpoint controls также не установлены. Local checkout sparse: `scripts/` отсутствует, `node_modules` отсутствует. NEXT: после завершения CI восстановить полный checkout/deps и проверить точные controls/runner. Затем STARTED checkpoint и два ограниченных named/proxy route cases с same-date и weekend offline replay; proxy не называть точной регрессией.

## DONE — старый симптом Москва—Казань проверен по сохранённым route evidence

[Результаты и границы вывода](../../docs/checkpoints/2026-10-19-issue2-m12-saved-route-review-DONE.md). Forward/reverse M-12 traversal proven; saved quote 3 513 ₽ в weekday и weekend replay, `priceConfirmation=unconfirmed`. Это не точное воспроизведение исторического issue route. Для Ейск—Москва и Майкоп—Москва соответствующих captures в текущем дереве нет. NEXT: проверить два OD только по exact controls/captures; при отсутствии evidence — bounded capture + same-date/weekend replay отдельными шагами.

## BLOCKED — официальный план ПК-5 заблокирован издательской ссылкой

[Проверка ссылки](../../docs/checkpoints/2026-10-19-ckad-a113-pk5-plan-link-BLOCKED.md). Страница администрации подтверждает публикацию плана и ведёт на Яндекс Диск; сервис сообщает, что файл заблокирован. Содержимое не прочитано, обход не предпринимался. Точной геопривязки A-113 edges46–53 к пикетажу нет, ноль не ставить. Текущий handoff не содержит следующей подготовленной пары с доказанными границами и собственной тарифной строкой. Возобновить при доступном официальном crosswalk или новой доказанной паре; готовые аудиты/источники не повторять.

## DONE / BLOCKED — география ПК-5 сужена официальным пикетажом

[Результат](../../docs/checkpoints/2026-10-19-ckad-a113-pk5-chainage-DONE.md). ЦКАД-5 км252+170—334+440; участок А-113 в Голицыно км268+001—273+700 (включая развязку М-1) находится внутри этого диапазона, а оператор объявляет ПК-5 бесплатным. Сохранённый trace edges46–53 находится рядом с Голицыно, но его точное stationing/coordinate-to-chainage соответствие не установлено. Не ставить ноль автоматически.

## DONE / BLOCKED — официальные страницы сузили CKAD/WHSD blocker

[Источники и результат](../../docs/checkpoints/2026-10-19-ckad-whsd-source-followup-DONE.md). М-11—Никольское-Горки119₽ подтверждён для соответствующей короткой пары, но saved выход к Егорьевскому шоссе — другой узел. Операторская страница объявляет ЦКАД-5 бесплатным; A-113 paid=true trace near Golitsyno требует exact geospatial crosswalk до выбора тарифа. RVP64 exact mapping отсутствует. NEXT: offline сопоставить координаты saved edge46–53 с CKAD-5/3-5; новые route/source GET и тарифные правки не нужны до результата.

## DONE — короткий индекс следующего mapped-fare кандидата

[Результат](../../docs/checkpoints/2026-10-18-mapped-fare-index-DONE.md). Тарифная строка М-11→А-107 119 ₽ сохранена, но отдельное exact boundary evidence для новой пары не установлено; не подставлять её по совпадению имени. Текущие М-11→Егорьевское/М-12 распознаватели уже подключены. NEXT: перейти к следующей подготовленной задаче с доказанными границами и своей тарифной строкой; к кандидату А-107 вернуться только при новом boundary evidence.

## DONE — локальный поиск boundary mapping А-113 по сохранённым inventories

[Результат](../../docs/checkpoints/2026-10-18-ckad-a113-inventory-match-DONE.md). Совпадений IDs блока А-113 в трёх сохранённых CKAD physical inventories —0; эти inventories относятся к М-11→М-12 и М-11→Раменское/А-107. Не повторять проверку; re-entry уже исключён непрерывным trace. NEXT: взять следующий заранее подготовленный тарифный пункт с сохранёнными границами, а к А-113 вернуться только при новом boundary evidence.

## DONE — saved trace CKAD А-113 непрерывен

[Поля trace и вывод](../../docs/checkpoints/2026-10-18-ckad-a113-saved-trace-continuity-DONE.md). Для forward Голицынo→Рублёво `calls[3]` сохранённого capture показывает8 последовательных toll edges46–53; re-entry нет. Выбранный route provider OSRM, Valhalla trace — только сохранённые атрибуты той же геометрии. NEXT: сопоставить уже сохранённые начало/конец этого CKAD-блока с одной из15 матричных пар; если нет прямого соответствия — не назначать тариф по геометрическому сходству.

## DONE — локально проверена матричная пара ЦКАД для А-113

[Результат](../../docs/checkpoints/2026-10-18-ckad-a113-matrix-pair-review-DONE.md). У сохранённого направления Голицынo→Рублёво платный блок А-113 виден, но сохранённая валидация не задаёт CKAD entry→exit. Матрица тарифицирует конкретную пару из 15 узлов; цену не подставляли. NEXT: точечно проверить только уже сохранённую физическую геометрию и route evidence на такой парный boundary; если нет однозначной связи с матрицей, перейти к следующему уже привязанному тарифу без повторных источников.

## DONE — Одинцово базовые650 ₽ круглосуточно; новый CI pending

[Новое правило, код и проверки](../../docs/checkpoints/2026-10-18-odintsovo-planning-base-650-DONE.md). Прямое решение пользователя: плановая база650, ночь/пик не прогнозируются. Удалены runtime календарь/часовые профили и отказы00–01/2027 для этой пары. Матрица прежняя; дата только для срока действия строки. 196 временных проверок,10ownquotes,6APIreplays; focused14/14,full802/802+quote/API,Next16/16,TS/ESLint/diffPASS. Новые уведомления не добавлены. ForwardCKAD всё ещё unknown. NEXT послеremote/newCI: дальнейшие оценки по рациональным опорным тарифам; готовые источники не повторять. Общий fallback всех дорог ещё не внедрён. PR14draft.

## Предыдущая история

## STARTED — новая политика: Одинцово базовые650 ₽ в любое время

[Решение пользователя и scope](../../docs/checkpoints/2026-10-18-odintsovo-planning-base-650-STARTED.md). Ночь/пик не прогнозируются; runtime calendar2026 и блок00–01 для этой пары убрать, готовый ordinary vector650 использовать как плановую базу. Числа матрицы сохранить. Source dbd1b81c/tree d3dc45f3, CI39154472440success, fresh cloneclean. NEXT: minimal code+focused/fullbuild, DONE/remote/readback.

## Предыдущая история

## DONE — подключён тариф пары Одинцово; новый CI pending

[Код, результаты и ограничения](../../docs/checkpoints/2026-10-18-odintsovo-fare-PART-B-DONE.md). Два маршрута / 10 профилей: компонент 650/700/20 ₽ из прежней матрицы. Reverse API ready650, trace503→unknown; forward whole amount null из-за ЦКАД. Оценки unconfirmed, подтверждённых полных тарифов0. Focused14/14, full802/802+quote/API, Next16/16, TS/ESLint/diff PASS; initial ошибки тестового API-ожидания и TS сохранены. Календарь source-derived2026; 00–01 и другие годы unknown. NEXT после remote/newCI: точная рамка ЦКАД12443433262/1080462753 и операторский продукт, сначала сохранённые данные. PR14draft.

## Предыдущая история

## CALENDAR DONE / ОдинцовоfareCODESTARTED

[Источники/инференция/лимиты](../../docs/checkpoints/2026-10-18-odintsovo-calendar-DONE-fare-CODE-STARTED.md):2026calendarsource-derivedизофициальныхindexedtextМинтруда+adopted1466;directPDF503/HTML403безобхода,скачанныхисточниковнет. NEXT strictpairmatrixadapter+профильотправления;00–01/внегодакалендаряunknown,forwardCKADwholeunknown. Готовыеценынепересобирать.

## Предыдущая история

## RECOVERY DONE / календарьОдинцовоSTARTED

[Восстановление/лимиты](../../docs/checkpoints/2026-10-18-odintsovo-fare-recovery-calendar-STARTED.md): freshGitHubclone24ea6edc/tree566d967fclean,CI39149617219success. Sources/результатывосстановленыбезповтора. NEXT:≤2newofficialdomainqueries+≤2primaryreadsдляcalendar2026;таблицыM-Road/OSMнеповторять. ПослеcalendarотдельныйfareCODESTARTED.

## Предыдущая история

## PART A DONE — strictОдинцово17,7↔6,9, standaloneбезденег

[Код/доказательства/проверки](../../docs/checkpoints/2026-10-18-odintsovo-continuity-PART-A-DONE.md): optionalnamedtracecontext+exactdirectionmatcher, ownblocks61/59edges,2exactofflinevalidationreplays+1negativecitygap,40context/10geometrynegativechecksPASS. Focused13/13,full797/797+quote/API,Next16/16,TS/ESLint/diffPASS. Цены/матрицабезизменений,новыхpriced0. NEXT послеremote/newcodeCI: PART Bfareadapter+обоснованныйСООweekday/weekendHolidaycalendar,daystart,ownAPI; forwardCKADunknownсохранить. Sourcesготовы/неповторять. PR14draft.

## Предыдущая история

## STARTED — Одинцово strictконтекст/геометрия, безденег

[BoundedA/Bscope](../../docs/checkpoints/2026-10-18-odintsovo-continuity-STARTED.md): codeCI39148079088verify/liveSUCCESS. NEXT A: optionalnamedtraceblock+standalonematcher,2exactofflinevalidationreplay/negativeguards/fullbuild; источники4GET/27pointsготовы. Bfareadapterотдельно,day/timecalendarнегадать. ForwardCKADunknownсохранить. PR14draft.

## Предыдущая история

## FIXED — paidА113/fullCKADname учитываются; новыйcodeCI pending

[Код/проверки](../../docs/checkpoints/2026-10-18-ckad-paid-alias-coverage-CODE-DONE.md): ownforwardОдинцово missing=[ckad,odintsovo], reverse=[odintsovo]; обаAPIOSRM amountnull, никакихценне добавлено. Focused18/18,full792/792+quote,Next16/16,TS/ESLint/diffPASS; initialtestproviderassumption сохранён. Source95c1fbd3 durable, предыдущийCI39146933232verify/liveSUCCESS. NEXT послеremote/newcodeCI: strict17,7↔6,9continuity/no-reentry и отдельныйfareadapter; forwardнепоказыватьчастичнуюсумму. Источникиготовы/повторовнет. PR14draft.

## Предыдущая история

## SCOPE DONE / CODE STARTED — оплачиваемаяА113не должна теряться

[Evidence/ограниченныйcode scope](../../docs/checkpoints/2026-10-18-odintsovo-pair-scope-LOCAL-CI-BLOCKED.md): CI39146933232 verify/liveSUCCESS, ожиданиезавершено. ForwardОдинцово8paidА113edges/gantry12443433262, текущийcoverageне распознаётА113/fullCKADname. NEXT послеdurableSTARTED: минимальныйpaidproductnamematcher+ownforwardunknownCKAD/reversecontrol,focused/fullbuild; цены/gantryAPI/frozensне менять.

## Предыдущая история

## LOCAL ONLY — scopeDONE; remote save ждёт активныйCI

[Локальныйcheckpoint/точныйNEXT](../../docs/checkpoints/2026-10-18-odintsovo-pair-scope-LOCAL-CI-BLOCKED.md): codeCI39146933232 verifyPASS/live_probeactive; в forwardОдинцово rawtrace найден отдельный8edgepaidА113/gantry12443433262, который paidcoverage не распознаёт. ЦенунеподключатьдопокрытияCKAD. NEXT: послеCI сначала durablesaveэтогоблока, затем boundedA113coveragefix; всеисточникиужеесть.

## Предыдущая история

## FIXED — identity4полос Одинцово; codeCI pending

[Код и реальные проверки](../../docs/checkpoints/2026-10-18-odintsovo-identity-CODE-DONE.md): оба ownroutes теперь missing=[odintsovo], ложныеМ1/unknownaliases устранены; полного тарифа пока нет. Focused43/43, full788/788+quote, Next16/16,TS/ESLint/diff PASS. Sources0новых; матрица/ценыбезизменений. NEXT после remote/codeCI: strict17,7↔6,9scope/continuity/no-reentry, затем готовые fares с boundedSTARTED;4primaryGET/27points не повторять. PR14draft.

## Предыдущая история

## Одинцово — primary lanes DONE, identity CODE STARTED

[Sourceproof и scope](../../docs/checkpoints/2026-10-18-odintsovo-primary-DONE-identity-CODE-STARTED.md):4GET200,27ordered ownsourcepoints PASS; обе направленные пары17,7/6,9 привязаны физически. NEXT: exactnode/way identity, убрать ложныеM1/unknownaliases без добавления цены; focused/fullbuild. Готовые4GET/27points не повторять. Полный тариф пока unknown.

## Предыдущая история

## Одинцово — retained DONE, primary lanes STARTED

[Scope/evidence](../../docs/checkpoints/2026-10-18-odintsovo-retained-DONE-primary-STARTED.md): два known booth orders извлечены без повторного route audit; tariffbinding BLOCKED. NEXT: четыре exactway/full,≤60с/безretry,raw/progress; готовые тарифы/FAQ не искать. М11→Егорьевское codeCI39145260247 обе jobs PASS.

## Предыдущая история

## PART C DONE — codeCI успешно; далее Одинцово

[Проверка и bounded inputs](../../docs/checkpoints/2026-10-18-ckad-egoryevskoye-part-c-DONE-odintsovo-STARTED.md): bd811734/treeac581f87, CI39145260247 verify/live_probe success; PR14draft/localclean. М11→Егорьевское сохранён и проверен. NEXT: только retained directed PVP/tariff provenance двух Голицынo↔Рублёво; без повторного route audit/сети/источников М4/М3/ЗСД.

## Предыдущая история

## PART B DONE — ЦКАД М11 → Егорьевское подключён

[Код, проверки и ограничения](../../docs/checkpoints/2026-10-18-ckad-egoryevskoye-part-b-DONE.md): own Торжок→Раменское2668Thu/2828Fri/2848Sat/2928Sun, Thu23:59=2668, полный unconfirmed estimate. ЦКАД1218 из прежней матрицы, новый рассчитанный компонент1, подтверждённых полных тарифов0. APIready2668, trace503→null/unknown; frozen безctx остаётся unknown. Focused15/15, full784/784+quote, Next16/16, TS/ESLint/diff PASS; initial ошибка тестового status сохранена. Sources/audits не повторялись. Source b030cd71, CI39144007812 verify/livePASS. Новый codeCI pending. NEXT PART C: exact remote readback и codeCI; PR14draft, никаких main/merge/Production/Android.

## Предыдущая история

## PART A DONE — strict М11 → Егорьевское

[Код и проверки](../../docs/checkpoints/2026-10-18-ckad-egoryevskoye-part-a-DONE.md): focused3/3, TS/ESLint PASS. Standalone, composer пока не подключён; fullgate/build pending. NEXT B: resolver + own quote/API и полный gate.

## IN PROGRESS — восстановление М11 → Егорьевское

[Короткие части A/B/C](../../docs/checkpoints/2026-10-18-ckad-egoryevskoe-recovery-STARTED.md). NEXT: A strict matcher, full gate pending.

## OWNER BINDING DONE / CODE STARTED — М11→Егорьевское

[OwnerPDFvisualproof/scope](../../docs/checkpoints/2026-10-18-ckad-egoryevskoe-owner-DONE-CODE-STARTED.md): officialprojectpage25 + actualselectedA107southconnector,source-derivedalias. Currentdirectcell1218₽,неизменённая. NEXT: strictnamedctx+entry48/core12/exit29matcher,owncurrentparser/APIready2668/tracefailednull,focused/fullbuild. Готовыеисточникинеповторять,fullтарифещёнезаявлять.

## Предыдущая история

## OWNER PASS1 NOT_PROVEN / PASS2 STARTED — настоящийdomainsfilter

[Результат и лимит2queries/2newownerreads](../../docs/checkpoints/2026-10-18-ckad-ramenskoe-owner-pass1-DONE-pass2-STARTED.md): physicalexitдоказан;siteORпоискне далownerhits,tskad502/avtodor403,безобхода/повторов. NEXT:2domain-filteredofficialqueries;неподставлятьbillingpointпоA107. Runtime/priceunchanged,fullunknown. Готовые3GET/41pointsнеповторять.

## Предыдущая история

## PHYSICAL DONE / OWNER STARTED — ownЦКАД→A107exit

[Доказательства/одинquery/дваownerreads](../../docs/checkpoints/2026-10-18-ckad-ramenskoe-physical-DONE-owner-STARTED.md):3GET200,selected29exit+12retainedprefixpointsPASS. Exactexit10832306578/886019081,connector886019063,A107119881263. NEXT: подтвердитьoperatorbillingalias;понеоднозначномуA107ценуневыбирать. Runtimeunchanged/fullunknown. Готовые3GET/41pointproofнеповторять.

## Предыдущая история

## DIAGNOSIS DONE / SOURCE STARTED — точный выход ЦКАД к Раменскому

[Contextreplay и3GETscope](../../docs/checkpoints/2026-10-18-ckad-ramenskoe-exit-source-STARTED.md): owncurrenttracecomplete3/3,misses0,ноexitдругой:886019081→886019063→A107119881263. NEXT:3exactwayfullGET→sourceproof; billingpoint/ценыневыбиратьпоA107label. CI39132410371verify/liveобаPASS. Новыйrouting/trace0,готовыеисточникинеповторять.

## Предыдущая история

## FIXED — южный head М11→ЦКАД47; новый CI pending

[Код, owncases и проверки](../../docs/checkpoints/2026-10-18-m11-ckad47-exit-CODE-DONE.md): ownРаменскоеhead200Thu/240Sat, М11subtotal1450/1630, fullnull/missingCKAD. OwnКазань2componentprofilesPASS; Москва/КраснодарнеперенялиCKADhead. Focused27/27,full777/777+quote/API,Next16/16,TS/ESLintPASS; initialM4testassumptionfailureсохранён. NEXT послеCI: конкретныйownCKADexit/contextРаменского,безповтораобщихаудитов/источников.

## Предыдущая история

## SOURCE DONE / CODE STARTED — строгий съезд М11→ЦКАД47

[Proof и кодовыйscope](../../docs/checkpoints/2026-10-18-m11-ckad47-exit-source-DONE-CODE-STARTED.md):4GET200,10onewayways,48orderedownpointsPASS. NEXT: exactsouthboundheadmatcher+readyreversepair200Thu/240Sat,focused/fullbuild/TS/ESLint; CKADwholeunknownсохранить. СтарыеGET/48sourcepoints/p214prefixне повторять.

## Предыдущая история

## STARTED — четыре недостающих approachways съезда М11→ЦКАД47

[Offlinegap/точныеinputs/лимиты](../../docs/checkpoints/2026-10-18-m11-ckad47-exit-source-STARTED.md): ownРаменскоеstrictend9556466755;retainedgate8087316064/1270188041. NEXT:4exactOSMwayfullGET→sourcechainproof,per-responseprogress; безповторакарты/p214/routechecks. Headcandidate200Thu/240Sat,ценыruntimeне менялись. ПредыдущийCIverify/livePASS.

## Предыдущая история

## RECOVERY DONE — checkout восстановлен, прошлый CI полностью PASS

[Восстановление и ограничения](../../docs/checkpoints/2026-10-18-ramenskoe-checkout-recovery-DONE.md): remote/local24695f0f,CI39123710038 verify/liveобаsuccess. Код/доказательствавосстановленыизGitHub, безповторапроверок/источников. NEXT: ownРаменскоеsouthbound8087316064/1270188041 изretainedmap; сначалаofflineboundaryreview.

## Предыдущая история

## FIXED — exact p214 orphan; own Торжок → Москва полностью рассчитывается

[Код, API и проверки](../../docs/checkpoints/2026-10-18-m11-p214-orphan-CODE-DONE.md):2380Thu/2650Fri/2890Sat/3040Sun,missing=[],estimateunconfirmed. API ownreplay2380,traceunavailable→null. Focused28/28,full771/771+quote/API,build16/16,TS/ESLintPASS. НовыйcodeCIpending. NEXT послеCI: offlineownРаменскоеhead58→ЦКАД/southgate8087316064/way1270188041 по retainedmap; готовыеисточники/4cases/364inventoryнеповторять. Общиеblocksне закрыты однимestimate.

## Предыдущая история

## DIAGNOSIS DONE / CODE STARTED — exact p214 orphan

[Причина, scope и проверки](../../docs/checkpoints/2026-10-18-m11-p214-orphan-CODE-STARTED.md): unnamed5286168661/766468434 уже source-boundМ11, ноcoverageсоздаётunknown. CI39122753013 verify/liveобаPASS, ожиданиезавершено. NEXT: узкаяexacttupleклассификация + negatives/ownquote/APIreplay/fullgate. Никакихновыхsource/routeGET, ставок илибесплатныхисключений.

## Предыдущая история

## CODE DONE — М11 p214 → Москва; новый CI pending

[Изменение, проверки и следующий шаг](../../docs/checkpoints/2026-10-18-m11-p214-moscow-head-CODE-DONE.md): точный directed head1130Thu/1500Sat, М11subtotal2380/2890; полный API итогnull из-за `unknown-paid-road`. Focused25/25, fullaudit768/768+quote/API, build16/16, TS/ESLintPASS. NEXT: remote readback/codeCI, затем короткий offline exactorphan review на ownТоржок→Москва. Готовые4cases/364inventory/sourceGET не повторять; PhotonFAIL отдельно.

## Предыдущая история

## CODE STARTED — p214→Москва,строгийheadmatcher

[Bindingreview/план/лимиты](../../docs/checkpoints/2026-10-18-m11-p214-moscow-head-CODE-STARTED.md): retainedreverseheadpair1130Thu/1500Sat. Толькоподтверждённыйp214fallback+exactgate+strictM11доМКАД; полныйитогunknownpaidroadnull. NEXT: matcher/integration/focused/fullgate/TS/ESLint,безновойсети/sourceповторов.

## Предыдущая история

## SOURCE DONE — точная южная рамка М11

[Sourceproof/ограничения](../../docs/checkpoints/2026-10-18-m11-moscow-head-source-DONE.md): 2GET200,3orderedanchorsсовпали сownТоржок→Москва; node7171624764/way502872285southboundдоМКАД. Runtime/headценыunchanged. NEXT: offlineoperatorbindingreview solnechnogorsk→moscow; потомотдельныйCODE STARTED,focused/fullgate. Не повторять2GET/3anchors/готовые4p214cases. PhotonavailabilityFAILотдельно.

## Предыдущая история

## STARTED — точная рамка head Торжок→Москва

[Scope/2GET/лимиты](../../docs/checkpoints/2026-10-18-m11-moscow-head-source-STARTED.md): node7171624764/way502872285 отсутствуюткакdefinitionвretainedsource. Готовые3owncases/6profilesсохранены; неповторять. NEXT:2primaryGET,per-responseprogress, затемsourceDONE/BLOCKED. Runtime/ценыбезизменений; headunknown.

## Предыдущая история

## DONE — ещё три own p214 случая,6профилей

[Результаты и caveat](../../docs/checkpoints/2026-10-18-m11-p214-three-DONE.md): М11mainline1250/1390,9negativeguardsPASS,исключений0. Вместе сРаменское4/4owncaptures. Runtimeunchanged. Полныйитогunknown;4fetchattemptsМ4заблокированымоком,реальнойсети0,harnessfinalassertexit1сохранён. NEXT: offlineheadsource review ownТоржок→Москва; готовыеcases/sourcechecksне повторять. PhotonFAILостаётсяотдельно.

## Предыдущая история

## INVENTORY DONE / STARTED — три собственных p214 случая

[Inputs и лимиты](../../docs/checkpoints/2026-10-18-m11-p214-inventory-DONE-three-STARTED.md): 364capturefiles прочитаны,4exactmatches,готовыйРаменскоеисключён. NEXT: 3owncaptures/6профилей,strictmatcher+owncomponent/unknowncheck, timeout60s,перслучайprogress. КодCIverifyPASS; livePhotonFAILотдельно. Новыхсети/полныхмаршрутныхаудитов0.

## Предыдущая история

## PART C DONE — p214 codeCI PASS, внешний Photon FAIL

[Remote и CI](../../docs/checkpoints/2026-10-18-m11-p214-part-c-DONE.md): code3da74d0f, run39120413592 completed/success, verifyPASS; live_probeFAIL(Photon503/timeouts/budget), последующиеlivechecksSKIPPED. NEXT: короткаяofflineинвентаризация ещёнепроверенных owncaptures сexactp214gate; готовыйcase/41/15 не повторять. Полныйтарифunknown.

## Предыдущая история

## PART B DONE — М11 p214→p58 подключён, codeCI pending

[Код, результаты и ограничения](../../docs/checkpoints/2026-10-18-m11-p214-part-b-DONE.md): ownmainline1250/1390₽; focused19/19, audit762/762+quote/API, Next16/16, TS/ESLintPASS. Initialsymlinkbuildfailure сохранён. Полный итогnull: head58→ЦКАД/ЦКАД/unknown-paid-road. NEXT: exactremote readback и codeCI; только после success — boundedпроверка ещёнепроверенных собственныхp214captures.

## Предыдущая история

## PART A DONE — строгий распознаватель p214

[Код и проверки](../../docs/checkpoints/2026-10-18-m11-p214-part-a-DONE.md): standalone matcher, focused4/4 и tscPASS. Composer ещё не подключён; fullgate/build pending. NEXT PART B: p214→p58, ownquote и обязательные проверки; head58→ЦКАДunknown.

## Предыдущая история

## STARTED — строгая пара М11 p214→p58

[Source review, scope и проверки](../../docs/checkpoints/2026-10-18-m11-p214-entry-STARTED.md). Собственный въезд и p58 подтверждены; реализация ещё не выполнена. Head58→ЦКАД остаётсяunknown, полная цена не заявляется. После durable STARTED — узкий matcher, focused/fullgate/build и DONE.

## Предыдущая история

## DONE SOURCE — подтверждён фактический въезд М11

Три GET200, пять направленных ways;61/61 independent ordered points совпали с собственным маршрутом. Соседний комплекс214км: p214 candidate, runtime/цены без изменений. [Доказательства, ограничения и команды](../../docs/checkpoints/2026-10-18-m11-entry5286168661-source-DONE.md).

**NEXT:** Offline: проверить operator p214 crosswalk и собственные p58/ЦКАД exit boundaries по retained источникам. Три GET въезда завершены, не повторять. До длительной работы или новых источников отдельный bounded STARTED.

## Предыдущая история

## STARTED — первичная привязка фактического въезда М11

[План и лимиты](../../docs/checkpoints/2026-10-18-m11-entry5286168661-STARTED.md): exact node5286168661 / way766468434, два GET и при необходимости одна локальная карта. Capture не повторять, runtime/цены пока без изменений. После durable STARTED выполнить source capture и сохранить DONE.

## Предыдущая история

## DONE — Торжок → Раменское: проверен другой въезд

Собственный complete capture, два профиля: границы unresolved. Фактический gate5286168661 отличается от p258; его нет в retained карте Торжка. Runtime и цены не менялись. [Доказательства и ограничения](../../docs/checkpoints/2026-10-18-m11-torzhok-ramenskoe-boundary-DONE.md).

**NEXT:** Подтвердить primary node5286168661 / way766468434 и направленное продолжение для pair-m11-ckad-torzhok-to-ramenskoe, затем сопоставить с операторской тарифной точкой. До сети bounded STARTED; p258 не переносить по названию города.

## Предыдущая история

## DONE — ЦКАД47→М11: headпричина закрыта8/8

Семь новых owncapturechecks/14датированныхпрофилей, исключений0, negativeguards21/21PASS; первыйпредставительнеповторялся. [Результаты и ограничения](../../docs/checkpoints/2026-10-18-m11-ckad47-seven-DONE.md). Code29129946/CI39115104478verify/live_probeобаsuccess. Runtimeвпакетеunchanged, новыхheadcomponents7 (всего8), подтверждённыхwholefares0. По13исходнымfindingrecordsтеперь2fixed/1notreproduced/7blocked/3deferred; стараясводкасохраненавистории.

**NEXT:** точныйсохранённыйслучайМ11 `pair-m11-ckad-torzhok-to-ramenskoe` — въезд/съезд иretainedprimaryТоржка. Не повторять41/15илиготовые8, не переноситьp679→p258выезд наинойвъезд/направление. До длительнойработыboundedSTARTED; послеэтогоDONEсначалаexactremote readback.

## Предыдущая история

## STARTED — семь собственных М11 head cases

CodeCI39115104478по29129946completed/success,verify/live_probeобаPASS. [Пакет7cases/14профилей,лимитыиrecovery](../../docs/checkpoints/2026-10-18-m11-ckad47-seven-STARTED.md). Новыхrouting/trace/сети0,первыйпредставительнеповторяется. ПослеdurableSTARTEDreadbackзапуститьrunner,сохранитьper-caseprogressиодинDONE. Runtimeнеизменяется.

## Предыдущая история

## DONE — М11: северный въезд ЦКАД47 исправлен

Один собственный target: head280₽будни/320₽суббота, новыхкомпонентов1, fulltripunknown из-заЦКАД/ЗСД. [Изменение, sourceproof, проверки и ограничения](../../docs/checkpoints/2026-10-18-m11-ckad47-implementation-DONE.md). Focused20/20, audit757/757+quote/API,TS,ESLint,Next16/16PASS; ошибкиlocalfixture/dependency сохранены.

**NEXT:** после exactremotehead/tree/pathreadback проверить codeCI; затем boundedпакет7siblings owncapturedentrychecks сновымSTARTED. Семьне засчитаны этимпримером; маршруты/sourcepass не повторять. Ветка/PR14draft; никакихавтоматизаций/merge/Production/Android.

## Предыдущая история

## DONE SOURCE / STARTED CODE — въезд ЦКАД47→М11

Новая первичная привязка gate8087316065 / ПВП18, четыреonewayсегмента и семь orderedanchors подтверждены наодном собственном маршруте. [Source proof и узкая интеграция](../../docs/checkpoints/2026-10-18-m11-ckad47-source-DONE-implementation-STARTED.md). ТриGET200,безrouting/replay. Следующийшаг: strict northboundmatcher+готоваяпараtskad→solnechnogorsk,focused/fullgate/build. Runtimeпока unchanged,новыхpricedcomponents0. Остальные8случаевне засчитывать автоматически.

## Предыдущая история

## STARTED — М11: точный въезд с ЦКАД47

В сохранённом собственном trace выделен gate8087316065→way1270188032, отдельный от прежних рамок ММК50. [Цель, входы и лимит3GET](../../docs/checkpoints/2026-10-18-m11-ckad47-entry-STARTED.md). Сначала primaryidentity/topology, затем отдельное внедрение при доказательстве. Старые8/41routechecks не повторять, тариф пока unknown. ЗСД РВП64 остаётся BLOCKED до нового источника. Автоматизации не запускаются.

## Предыдущая история

## DONE — точный поиск РВП-64 завершён; тариф BLOCKED

2 запроса, 1 исторический сторонний lead, 0 новых операторских страниц; цены/код без изменений. [Результат, evidence и точка продолжения](../../docs/checkpoints/2026-10-18-rvp64-exact-owner-search-DONE.md). Предыдущий PDF сохранён в `e5e3042b`; все завершённые проверки повторять не требуется.

**Условие продолжения этой причины:** новый независимый операторский документ/схема точного въезда РВП-64/ref64E либо датированный чек наличными/картой до КАД-юг. Текущие запросы/PDF/маршрутные проверки исчерпаны; повтор без нового основания не запускать.

## Предыдущая история

## STARTED — после остановки: точный поиск РВП-64

Предыдущий PDF/source блок полностью сохранён в `e5e3042b`; повтор не требуется. Остаток разделён на 2 запроса → до 2 новых операторских страниц → сохранение результата. [Лимиты и восстановление](../../docs/checkpoints/2026-10-18-rvp64-hang-recovery-exact-search-STARTED.md). Тариф пока BLOCKED.

## Предыдущая история

## DONE — текущие правила ЗСД прочитаны, точный тариф РВП-64 не доказан

Один новый официальный PDF, HTTP 200; скан, релевантные страницы проверены визуально. Схема относится к Витебской развязке. Общие правила наличных/карты не определяют сбор именно РВП-64→КАД-юг. [Факты и ограничения](../../docs/checkpoints/2026-10-18-rvp64-current-rules-DONE.md); runtime/цены без изменений, новых полных тарифов 0.

**Следующий шаг:** bounded поиск точной операторской привязки РВП-64/ref64E и схемы въезда Макарова либо документа о сборе. Не повторять PDF/маршруты/старые source passes; до сети новый STARTED.

## Предыдущая история

## STARTED — РВП-64: один новый официальный PDF

План и точные лимиты: [STARTED](../../docs/checkpoints/2026-10-18-rvp64-current-rules-STARTED.md). Один новый PDF правил с 01.10.2026, при необходимости одна связанная схема; без повторных маршрутов и старых source passes. Цена РВП-64→КАД-юг пока заблокирована. Recovery 19 файлов подтверждён в `ccde1c32`; подготовленная recovery-запись сохранена вместе с этим STARTED.

## Предыдущая история

## Следующий шаг после восстановления сохранения

Source DONE commit `ccde1c328359c39d5bdc1ba819d2ff4798dea536` проверен по дереву, 19 файлам и head PR #14 (draft). [Recovery checkpoint](../../docs/checkpoints/2026-10-18-1038-zsd-save-recovery-DONE.md).

Нужен новый точный операторский источник соответствия РВП-64/ref64E и cash/card scope основного ЗСД до ПВП 933975069. Перед сетью сохранить bounded STARTED. Существующие четыре GET, route checks и сохранение source DONE не повторять. Цена остаётся unknown; тариф Шкиперской к РВП-64 не привязан.

## Предыдущая история

## DONE — установлен РВП64; тарифШкиперской кнемунепривязан

4новыхprimaryGET200. Точныйnode13020687195/way351741889 названРВП64/ref64E. Тариф95Шкиперскойперечисляетдругиерамки; безТПвэтомпродуктеестьосвобождение,ноононеподтверждаетfree/0длянашегоРВП64→КАД-юг. [Источник и решение](../../docs/checkpoints/2026-10-18-zsd-rvp64-identity-and-shkipersky-rule-DONE.md). Runtime/ценыбезизменений.

NEXT:новыйточечныйowner crosswalkРВП64/ref64E иmainWHSDcash/cardscopeдо933975069; boundedSTARTEDдосети. ГотовыеGET/routechecksнеповторять; прежнийambiguousШкиперскийlabelнеиспользоватькакproductidentity.

## Предыдущая история

## STARTED — точный въезд ЗСД и тариф Шкиперской развязки

Найдены3новыхPDFlinks вretainedownerindex. [План](../../docs/checkpoints/2026-10-18-zsd-shkipersky-source-STARTED.md):3ownerPDF+1exactOSMway,0queries/route/replay. СперваразличитьфактическийвъездМакарова/Шкиперский,неприсваиватьразвязочныйтарифпоlabel.

## DONE — очередь ZSD sibling boundary checks закрыта

Вэтойсессии20новыхownsavedboundarychecks(7+13); вместе сготовымипредставителями группы8/8,5/5,4/4,7/7. Finalmaterialexceptions0/errors0. [Результат](../../docs/checkpoints/2026-10-18-zsd-remaining-thirteen-DONE.md). Увъезднойрамки13020687195toll=falseподход ивrepresentative,ив6siblings;initialtoll=trueassumption/correction сохранены,плата/бесплатностьневыводятся.

Явноunchecked siblings вdirectedGroupReviews0. Это неготовностьтарифов: новыеpricedcomponents/confirmedfullfares0. NEXT: конкретноеownercash/cardrule/datedreceipt въездМакарова/Шкиперский→КАД-юг(13020687195/933975069),сboundedSTARTED/newsource. Старыеrouteaudits/sourcepassesнеповторять.

## Предыдущая история

## DONE7ZSD / STARTED оставшиеся13boundarychecks

Группа1e954:7siblings безотличий,8/8сучётомготовогопредставителя. [Результат и следующийпакет](../../docs/checkpoints/2026-10-18-zsd-seven-DONE-remaining13-STARTED.md). Ценанедоказана; новыхрасчётов/сети0.

NEXT:13ownsavedboundaryexceptions в3группах3493/3404/2c00(4+3+6),точныеinputsвchecks/2026-10-18-zsd-remaining-thirteen. Представителей/74componentchecksнеповторять,per-caseprogress.

## STARTED — семь оставшихся границ ЗСД, КАД-север→КАД-юг

Группа1e954c437e46:проверить7ownsavedcaptures/trace/entry/exit,безpricingreplay/сети/повтора74. [План](../../docs/checkpoints/2026-10-18-zsd-north-south-seven-STARTED.md). Точныеinputs иper-caseprogress вchecks/2026-10-18-zsd-north-south-seven.

## DONE — ещё6ZSD exit/trace exceptionchecks, группа7/7

Группа258ee8:6own savedcaptures проверены, точнаяselectedgeometry/rawboothorder/exitКАД-север; exceptions0/errors0. [Результат](../../docs/checkpoints/2026-10-18-zsd-north-kad-six-DONE.md). Это новаяпроверкаграниц, не повтор74component checks. ЦенаBLOCKED: operatorcollectionbundle отсутствует. Новыхцен/route/replay0.

NEXT:7unchecked siblings группы1e954c437e46, КАД-север→КАД-юг. Передпакетом отдельныйboundedSTARTED, толькоownsavedexit/traceexceptionchecks. М3date иМ4sourcepasses не повторять безновогоисточника.

## Предыдущая история

## DONE М3source / STARTED шесть ZSD scope exceptions

CI39101746826 verify/live_probe success. Новый M3sourcepass4queries/4reads не доказалдаты15/17Oct; verifiedThrough нерасширен. [Результат и следующий пакет](../../docs/checkpoints/2026-10-18-m3-date-source-DONE-zsd-six-STARTED.md).

NEXT:6явноunchecked siblings группы258ee8, только own savedcapture/trace/exit comparison с представителем; network/replay/componentrerun0. Inputs: experiments/nationwide-tolls/checks/2026-10-18-zsd-north-kad-six/inputs.json. Per-caseprogress,одинфинальныйcheckpoint. Старыеroutebatches/M3source не повторять.

## STARTED — проверка дат тарифного источника М3

CI39101746826 по65bed1ae… completed/success:verify иlive_probe прошли. Исправление правилаотправления сохранено. [Новая source-задача](../../docs/checkpoints/2026-10-18-m3-tariff-date-source-STARTED.md):до4queries/4новыхreads, даты15/17Oct, без старогоPDF/новостимарта/route replay. verifiedThrough не расширять безproof.

## DONE — исправлено правило отправления в диагностике М1/М3

Shadow больше не отвергает переход московской полуночи; тарифный профиль определяется отправлением. [Изменение и проверки](../../docs/checkpoints/2026-10-18-m1-m3-departure-policy-DONE.md). Regression:до26/31,после31/31; full750/750+quote/API,TS,ESLint,cleanbuild16/16 PASS. Первичный buildcachefailure сохранён.

verifiedThrough2026-10-10 не расширен; отправления15/17Oct и клиентские цены не разблокированы. Новых клиентских компонентов/подтверждённых полных тарифов0. NEXT: actualCI codecommit до записи в ветку; затем новый bounded officialМ3source/date только при независимом источнике. Старые маршруты/М4источники не повторять.

## Предыдущая история

## STARTED — исправление даты диагностического тарифаМ1/М3

Обнаруженcodebug: shadow отвергаетпереходполуночи вопрекиправилуотправления. [План](../../docs/checkpoints/2026-10-18-m1-m3-departure-policy-STARTED.md). Срокверификацииисточника нерасширять, никакогоcustomerpricecutover. Проверитьрегрессии+fullgateофлайн.

## DONE — новыйsourcepass М4-545, привязкаBLOCKED

Найден исторический operatorтекст о1/2участках; directoperator403, обе точныеownersectionpages «Элемент не найден». Текущаяполоса/тарифныйохват не доказаны; новыхцен0. [Отчёт](../../docs/checkpoints/2026-10-18-m4-545-operator-source-DONE.md).4queries/6reads в2durablebounded проходах; безrouting/replay.

NEXT: М4 удерживать до нового независимогоoperatorproof, этотsourcepass/старыеPDF/геометрию не повторять. Перейти к savedprovenance дат тарифовМ3; перед новойсетью отдельныйboundedSTARTED.

## Предыдущая история

## DONE discovery / STARTED — две связанные страницы М4-545

4queries/4reads завершены:3operator403,ownerindex200. Найден исторический текст о раздельной/совместной оплате и две точные новые ссылки517–544/544–633. ПривязкаBLOCKED, новых цен0. [Следующий bounded проход](../../docs/checkpoints/2026-10-18-m4-545-source-discovery-DONE-linked-sections-STARTED.md):2sectionpages+до2linked schemes,0searchqueries.

## STARTED — официальный источник о взимании на М4-545

До4queries/4новых primary reads, directGET15с/max-time20с. Старые403/PDF/OSM/route batches не повторять. [План](../../docs/checkpoints/2026-10-18-m4-545-operator-source-STARTED.md).

## DONE — М4-545: повтор geometry/PDF не требуется

Сохранённые источники исчерпаны: точная полоса доказана, операторское соответствие двум тарифным вариантам нет. Проверены4objectSHA+2PDFSHA; новых сетевых запросов/расчётов/цен0. [Пробел и источники](../../docs/checkpoints/2026-10-18-m4-545-retained-provenance-DONE.md).

NEXT: новый операторский источник о взимании на545 и участках517–544/544–589, с bounded STARTED до сети. Старые403URL/22route replay/геометрию/рендерPDF не повторять.

## Предыдущая история

## DONE — очередь причин сверена,18.10.2026

Исправлены путь отчёта Одинцово и устаревшее продолжение М12. Baseline13:1fixed/1not reproduced/8blocked/3deferred; поздние узкие исправления учтены отдельно, когорты не складываются. Части19/20 старого плана уже выполнены; повторный финальный аудит не нужен без причины. [Сверка](../../docs/checkpoints/2026-10-18-0600-cause-handoff-reconciliation-DONE.md).

NEXT: сохранённая provenance вариантов М4 1223→545-a/545-b, только точные документы; без повторов22/74/76/309, без угадывания цены. М12 продолжать только при новом независимом источнике.

## Предыдущая история

## DONE: официальный источник М-12 проверен

Один GET HTTP200; релевантной схемы/доказательства тарифной привязки нет. Причина BLOCKED, новых цен0. [Результат](../../docs/checkpoints/2026-10-18-m12-official-page-DONE.md). CI исходного кода39071021984 success. NEXT: сверить оставшиеся assessed causes PART19 и объём итоговой проверки по сохранённым данным. Западный М-12 повторять только при новом независимом источнике.

## Предыдущая история

## Текущий шаг: официальный источник М-12

STARTED: одна новая страница https://russianhighways.ru/for_drivers/m-12-vostok/ и одна явно связанная схема. При пробеле сохранить BLOCKED. CI39071021984 success.

## DONE: физическая проверка М-12 сохранена в a9ad4722…

- Remote/PR14draft head **a9ad472218b15fc2952304b1fa5d70670ce929a1**, tree16f81749670cec8480fc8cfe5ce8b74bda7b4828. Non-force save и readback52pathSHA/head/draft — PASS. Файлы, первичные ответы, проверки, очередь и отчёт уже доступны из рабочей ветки.
- Новый CI39071021984: verify117508472379 completed/success; live_probe117508472518 ещё выполняется. Полный run success не заявлен. Локальные744/quoteAPI/TS/ESLint/build16/16 прошли; тарифные привязки по-прежнему BLOCKED. Новых цен/компонентов/fullfares0.
- [Фактическое подтверждение записи](../../docs/checkpoints/2026-10-18-m12-western-remote-readback.json). Только эта последняя запись наблюдений/CI пока LOCAL ONLY из-за activeCI; основной блок52файла уже durable в a9ad4722…. Сохранить наблюдение в следующем разрешённом checkpoint.
- **NEXT:** actualCI39071021984 и head/PR; затем один новый bounded проход по https://russianhighways.ru/for_drivers/m-12-vostok/ (точная ссылка найдена в сохранённом официальном AJAX-фрагменте, ещё не открывалась) и одной явно связанной схеме при наличии. Не повторять9OSM объектов/прежниеqueries/ЦКАД/74/76/309. Без официального соответствия рамок/съездов операторским интервалам2952/1239 не применять; при пробеле оставить BLOCKED и перейти к другим assessed causes.

## Предыдущая сохранённая история

## DONE physical / BLOCKED operator — М-12,18.10.2026

- Девять primaryOSMответов HTTP200 за8.684с подтвердили три рамки и два разных связных съезда. Операторские идентификаторы не получены: Арзамас выходит на22Н-0239, Чебоксары — наМ-7 уВладимира. [DONE](../../docs/checkpoints/2026-10-18-000148-m12-western-boundaries-DONE.md) · [отчёт](checks/2026-10-18-m12-western-boundaries/README.md).
- Два поиска/четыре плановых чтения страниц и два отдельно учтённых чтения конкретного linkedendpoint не дали crosswalk. Raw/metadata сохранены. Нерелевантные результаты и неправильный домен исключены; отсутствие данных у оператора не утверждается. Новая ссылка m-12-vostok найдена, но ещё не открыта.
- Frozen8/raw9hashes, offline reuse/noSTARTEDguard с0fetch, full744/quoteAPI/TS/ESLint/build16/16 — PASS. Initial отказ guard из-за смешанного каталога сохранён; исправлена организация данных. Runtime/матрица/цены не менялись. Новых routing/trace/pricingreplay/компонентов/подтверждённых fullfares0; прежний subtotal5475 — частичный. Остальная история и счётчики очереди сохранены.
- Source d497df67…/CI39068966825success; durable STARTED1a8df19a…. Final code commit без skipCI; после exact head/tree/path readback проверить новый CI. PR14draft; main/merge/Production/Android без изменений.
- **NEXT:** новый observed источник https://russianhighways.ru/for_drivers/m-12-vostok/ — один отдельный bounded проход после CI. Старые9OSM/поиски/ЦКАД/74/76/309 не повторять. Если crosswalk нет — BLOCKED и другие assessed causes.2952/1239 без доказательства не применять.

## Предыдущая сохранённая история

## STARTED — 18.10.2026 00:01 МСК: М-12 западные границы

- Source d497df67…/PR14draft; CI39068966825 completed/success: verify иlive_probe фактическиуспешны; ожиданиеокончено. [STARTED](../../docs/checkpoints/2026-10-18-000148-m12-western-boundaries-STARTED.md) · [9exact OSM URLs/frozen inputs](checks/2026-10-18-m12-western-boundaries/inputs.json).
- Только3западныхgantry +дваразныхexit:9GET≤15с/120с,terminalcircuit;2узкихoperatorqueries/≤4pageopens. ДоdurableSTARTED/readback сетьнепускать. ЦКАДвходreuse; новыхrouting/trace0.1239/2952 кандидатамиостаютсядоproof.
- **NEXT после durableSTARTED:** boundedprimarycapture иоператорскаяпривязка; припровалеисточникафиксироватьBLOCKEDбезрасширенияпоиска. Только доказательство разрешаетузкийadapter/обаowncases/fullgate; иначеruntime/ценыбезизменения. Старые74/76/309/ЦКАДнеповторять.

## Предыдущая сохранённая история

## DONE — ограничение address probe сохранено в remote d497df67…

- Branch/PR14draft head **d497df67738696dbe9c11e4dc14e617717ea1a2a**, tree8e50f77a553ace772f0f1ccb39722baa5627062b.20path SHA + head/draft readbackPASS. Code/docs/evidence reachable из разрешённой GitHub-ветки; STARTED925c8c4d… был docs-onlyskip, finalcodecommit безskip.
- Полный локальный gate:focused8/8,audit744/744+quote/API,TS,ESLint,Next16/16PASS. Новый CI39068966825 **verify completed/success**, live_probe активен (provider geometry при последнем наблюдении). Полный run success ещё НЕ заявлен.
- [Фактический readback](../../docs/checkpoints/2026-10-17-address-timeout-remote-readback.json). Эта последняя запись наблюдений/CI пока LOCAL ONLY из-за activeCI; исправление и20файлов ужеdurable вd497df67…. Сохранить наблюдения следующим разрешённым checkpoint.
- **NEXT:** проверить CI39068966825 иhead/PRdraft; затем отдельный STARTED перед boundedprimary привязкой западныхМ-12 рамок10782165529/11214930528/11157985901 и разныхвыходов22Н-0239/М-7. Не повторятьпройденныеtests/ЦКАД/74/76/309 безновойпричины.2952/1239 бездоказательстваненазначать; fulltripunknown сохранять. Никакогоmain/merge/Production/Android.

## Предыдущая сохранённая история

## DONE — 17.10.2026: лимиты адресной сетевой проверки

- Request+body10с, общий budget90с; abort/race, прекращение новых запросов, incremental atomic array/progress. Budget-exhausted не выдаётся заDONE (CLIexit1), ошибки источников видны. Диагностический probe и artifact path; app/lib/тарифы/матрица без изменения. [DONE](../../docs/checkpoints/2026-10-17-2350-address-probe-timeout-DONE.md) · [отчёт/логи](checks/2026-10-17-address-probe-timeout/README.md).
- Focused8/8, full744/744+quote/API,TS,ESLint,Next16/16 PASS. Initial test-serialization failure и initial build environment failure сохранены; после локальной копии dependencies повторён только failed build. Новых local live/routing/trace/primary0. Sourcee3c07ac3…/CI39067254489success, durableSTARTED925c8c4d….
- Evidence limitation: полный initial focused raw отсутствует (файл0байт); initial-observations.json фиксирует фактическое наблюдение ошибки. Final test/build logs и initial build raw сохранены.
- Final code commit безskipci; после durable save проверить новыйCI фактически. До head/tree/blob readback код не считать опубликованным; PR14draft, no main/merge/Production/Android.
- **NEXT после durable save:** фактический codeCI; затем первичная привязка западныхМ-12 рамок10782165529/11214930528/11157985901 и двух выходов22Н-0239/М-7 по saved inputs.2952/1239 без доказательства не назначать,74/76/309 иЦКАД не повторять.

## Предыдущая сохранённая история

## STARTED — 17.10.2026 23:49 МСК: ограничение времени адресной проверки

- Source e3c07ac3…/PR14draft, **CI39067254489 completed/success**. Код ЦКАД сохранён и повторно не проверяется. [STARTED](../../docs/checkpoints/2026-10-17-234931-address-probe-timeout-STARTED.md).
- Один блок: request+body timeout10с, общий budget90с, abort/race, incremental array/progress и явный budget-exhausted статус; offline fault tests и обязательный full gate. Новых live/primary/routing/trace0, тарифы/матрица/app/lib без изменений.
- Docs-only STARTED сохраняется с [skip ci] после content/link/diff checks; финальный code commit безskip, обычный CI обязателен. Это не успешный code CI для STARTED.
- **NEXT после STARTED readback:** реализовать bounded probe/helper/tests, проверить fault scenarios без сети, full gate и DONE/remote readback. Затем — М-12.

## Предыдущая сохранённая история

## DONE — код ЦКАД надёжно сохранён, 17.10.2026 23:35 МСК

- **Remote/PR14draft head e3c07ac3e09e8be1bbecd482b70974c691681f2b**, tree d3e0340c9e352cd858854666c0f225a168f31764. Non-force update выполнен после terminal success CI39066237658 и проверки parent fe5f1fc8…. Все62path SHA повторно прочитаны из GitHub и совпали. Перенос/аудит ЦКАД больше НЕ повторять.
- Новый code CI39067254489: **verify completed/success**, реальный лог117497372912:284tests/pass284/fail0,TypeScript success,Next build/static16/16 success. Широкая live_probe ещё выполняется; весь run успешным не объявлен. Прежние audit736 и focused8 остаются прежними результатами.
- Два собственных маршрута: ЦКАД981 каждый, subtotal5475, полная суммаunknown/missingm12. Матрица/тарифы без изменения.
- [Readback evidence](../../docs/checkpoints/2026-10-17-ckad-code-durable-readback.json), [точный статус](../../docs/checkpoints/2026-10-17-pending-ckad-remote-save.json). Код/evidence/исходные журналы уже в remote e3c07ac3…. **Только эта новая запись фактического readback/CI пока локальна:** remote во время activeCI не обновлять; сохранить наблюдение в следующем разрешённом checkpoint.
- **NEXT:** проверить actual CI39067254489 и head/PR; после terminal отдельным ограниченным блоком устранить отсутствие request/body timeout и общего бюджета в address-search-live-probe (без отмены текущегоCI). Затем — первичная привязка западныхМ-12 рамок10782165529/11214930528/11157985901 и разных выходов22Н-0239/М-7.2952/1239 без доказательства не назначать. Не повторять74/76/309; main/merge/Production/Android не менять.

## Предыдущая локальная история (статусы ниже исторические)

## LOCAL ONLY — code save готов, ожидается terminal CI39066237658

- Удалённая разрешённая ветка/PR14draft: fe5f1fc8bd0986e222cb49a4e906a12005513c65. В ней надёжно сохранены manifest и bundle исходного блока ЦКАД.
- Полностью подготовленный GitHub commit **e3c07ac3e09e8be1bbecd482b70974c691681f2b**, tree **d3e0340c9e352cd858854666c0f225a168f31764**, parent fe5f1fc8…;62path SHA проверены через GitHub. Объект существует, но ref на него ЕЩЁ НЕ ПЕРЕМЕЩЁН. Код в рабочую ветку пока не включён.
- [Точная точка продолжения](../../docs/checkpoints/2026-10-17-pending-ckad-remote-save.json): проверить actual CI/branch/PR; если CI terminal и head всё ещё fe5f1fc8…, выполнить **non-force update_ref** разрешённой ветки на e3c07ac3… с expected_sha fe5f1fc8…, затем head/tree/path readback и фактический новый code CI. Если head изменился — согласовать изменения; не force/reset. Не повторять аудит, сборку дерева и передачу62файлов.
- Обнаружено: scripts/address-search-live-probe.mjs fetch без per-request timeout; workflow live_probe имеет только60минут общего лимита. Последнее наблюдение: verify success, адресный probe active; фактическое зависание отдельного запроса не доказано. Отдельный следующий технический fix — timeout запроса/тела и общий бюджет с incremental progress; активный CI автоматически не отменять.
- **Эта верхняя запись локальная и ещё НЕ опубликована в GitHub из-за active-CI rule.** Нельзя объявлять ни её, ни новый код durable. Для нового чата без локального checkout использовать prepared commit e3c07ac3…/parent fe5f1fc8… из handoff, либо durable bundle в fe5f1fc8…. Новых тестов/маршрутных запросов в recovery0.

## Предыдущая локальная история

## Восстановлен готовый код ЦКАД — 17.10.2026: сохранение code tree

- Исходный prepared a9f2bf… перенесён на актуальный remote fe5f1fc8…:57exact файлов +3согласованных журнала; новые правила после зависания и recovery-история сохраняются. [Recovery checkpoint](../../docs/checkpoints/2026-10-17-2320-ckad-code-save-recovery-DONE.md). Исходный [DONE21:20](../../docs/checkpoints/2026-10-17-212016-ckad-m11-m12-DONE.md) теперь сохраняется вместе с кодом/evidence.
- Два собственных OSRM: ЦКАД981 каждый, subtotal5475; полный итог unknown/missingm12. Восстановлены прежние focused8/8, audit736/736, quote/API/TS/ESLint/build exit0; это прежние проверки, новые live/pricing0. Все runtime hashes соответствуют проверенному a9f2bf.
- До terminal CI39066237658 remote ref не обновлять; после записи — exact tree/blob/head readback и отдельный code CI. Код считается durable только после этой записи/readback. PR14draft, main/merge/Production/Android без изменений.
- **NEXT после durable code readback:** проверить code CI; затем первичная привязка западных М-12 рамок10782165529/11214930528/11157985901 и двух разных выходов22Н-0239/М-7.2952/1239 не назначать без доказательства; старые74/76/309 не повторять.

## Предыдущая сохранённая история

## DONE проверки / сохранение ожидает CI — 17.10.2026 23:12 МСК: ЦКАД recovery, часть 1

- Проверены все60 файлов неопубликованного a9f2bf… (1306375байт), их Git blob/SHA256,6current runtime,13frozen source и12primary raw hashes. Сохранённые focused8/8, audit736/736, quote/API/TS/ESLint/build exit0 прочитаны; новых тестов/запросов0. [Checkpoint](../../docs/checkpoints/2026-10-17-231217-ckad-recovery-part1-DONE.md) · [manifest](checks/2026-10-17-ckad-save-recovery/verification.json).
- Remote/PR14draft5102b44… сверены. CI39065562352 verify success, live_probe активен при подготовке; до terminal ветку не обновлять. Код a9f2bf пока НЕ durable. Этот docs-only recovery checkpoint должен получить commit/readback до следующей независимой части.
- Подготовлена переносимая копия `checks/2026-10-17-ckad-save-recovery/pending-ckad.bundle`:82729байт, head a9f2bf…, prerequisite a666fb48…, git bundle verify PASS. После commit/readback архив обеспечит восстановление60файлов без старого scratch; runtime ещё не интегрирован.
- **NEXT после durable readback:** перенос60 exact файлов на актуальный remote с сохранением новых правил/журналов и per-file progress; затем запись code tree/readback и code CI. Старый аудит не повторять; обе полные цены пока unknown из-заМ-12.

## Предыдущая сохранённая история

## DONE — 17.10.2026 23:07 МСК: правило восстановления после зависания

- Пользователь поручил после зависания делить последнюю незавершённую задачу на меньшие части. Правило добавлено в WORKFLOW_RULES, AGENTS и CHECKPOINT_PROTOCOL: проверка фактического прогресса, последовательные части, durable-сохранение каждой, повторное дробление при новой остановке. [Checkpoint](../../docs/checkpoints/2026-10-17-230704-hang-recovery-rule-DONE.md).
- Фактически проверены remote/PR14 draft head `a666fb4887ea54a328a29fb3bfc2dfa5102e5499` и CI39056837838 completed/success. Изменяются только документы; runtime/тарифы и старые проверки не перезапускались. Новый post-save CI проверять отдельно.
- **Обнаруженная точка восстановления:** локальный `a9f2bf98106bc798cc3536a7c920cd2c4dbd10a2` в `/workspace/scratch/43bf6cdc55b7/mezhgorod` содержит подготовленный DONE ЦКАД (60 файлов), но не достижим из проверенного remote head. Его результаты НЕ объявлены durable. Исходный checkout и commit сохранены без изменений; текущая правка правил основана на remote `a666fb48…`, а не на неопубликованном runtime.
- **NEXT:** восстановить сохранение ЦКАД отдельными частями: (1) проверить локальный a9f2bf…/60-файловый diff и уже записанные результаты/хеши без повторного аудита; (2) перенести готовый diff поверх нового remote, сохранив это правило и recovery-записи, сверить точные пути/blob/tree; (3) после terminal CI выполнить non-force запись/readback и обновить handoff. При отсутствии исходных файлов зафиксировать потерю доступности; не выдавать старые тесты за новые. Затем — отдельные задачи М-12.

## Предыдущая сохранённая история

## STARTED — 17.10.2026 21:08 МСК: ЦКАД М-11→М-12

- Source/branch/PR14draft headf010d847… сверены; CI39055898864 success. [STARTED](../../docs/checkpoints/2026-10-17-210814-ckad-m11-m12-STARTED.md) · [inputs](checks/2026-10-17-ckad-m11-m12/inputs.json).
- Один ограниченный первичный проход:8 way/full+4 node GET,≤120с/15с каждый, terminal circuit; новых routing/trace0. До durable STARTED/readback сеть не запускать. При доказательстве — forward-only adapter и непрерывный named trace блока ЦКАД, оба случая и полный gate. М-12 остаётся отдельным unknown.
- NEXT: durable STARTED, primary capture/proof; при нехватке данных конкретный blocker без расширения поиска. В активный CI remote не писать.

## Предыдущая сохранённая история

## DONE разбора / BLOCKED привязки — 17.10.2026 20:52 МСК: собственные М-12/ЦКАД

- Проверены2 случая:1 представитель+1 исключение,19 сохранённых trace occurrences/13 raw,45 source hash entries. Общая геометрия ЦКАД М-11→М-12 полностью совпадает; адаптер поддерживает только М-11↔М-4. Выход М-12 к Чебоксарам —М-7 у Владимира; к Арзамасу —22Н-0239 после420. Один вектор между ними не переносить. [DONE](../../docs/checkpoints/2026-10-17-205246-selected-osrm-m12-ckad-scope-DONE.md) · [отчёт](checks/2026-10-17-selected-osrm-m12-ckad-scope/README.md).
- Итог причины: **заблокирована отсутствием надёжной первичной привязки тарифных границ**. Координаты западных рамок уже есть; не доказаны их операторские номера и точные оплачиваемые интервалы. Готовые981/2952/1239 не назначены. Северная пара ЦКАД не использует условный участок М-12–Носовихинское; сноску120мин не разрешали по ETA.
- Runtime и тарифы не менялись; новых routing/trace/primary0, pricing replay0, новых компонентов/полных расчётов/подтверждённых полных тарифов0. Исторические subtotal4494 и совокупные25компонентов/4расчёта/2unknown по шести OSRM без изменения. Audit728/quoteAPI/TS/ESLint/build16/16 PASS; initial hash-check version mismatch объяснён и сохранён.
- Source54f4cccc…/PR14draft сверены. CI39054871192 при подготовке активен: verify success, live_probe работает. Remote только после его окончания, новый post-save CI отдельно.
- **NEXT после durable DONE:** ограниченная первичная привязка общего ЦКАД М-11→М-12 по точным transition IDs из summary; затем узкий adapter только при доказательстве и обе case exceptions. Западные рамки М-12 и разные выходы — отдельная привязка. Не повторять74/76/309, тарифный поиск и исходные ZSD owner blocks.

- Перед итоговой записью: CI39054871192 completed/success, verify и live_probe; пять последних runs завершены. Branch/PR head54f4cccc… совпали, PR14 draft. Ожидание закончено; новый post-save CI отдельно.

## Предыдущая сохранённая история

## DONE — 17.10.2026 20:34 МСК: М-11 Торжок p258

- **Исправлена и проверена** направленная привязка3183012434 кp258/Будово. Собственный OSRM: **2400+94+300=2794 ₽** по отправлению15.10.2026. Три рассчитанных компонента, два новых; полный тариф внутренне unconfirmed, подтверждённых полных тарифов0. [DONE](../../docs/checkpoints/2026-10-17-203458-m11-torzhok-p258-DONE.md) · [отчёт](checks/2026-10-17-m11-torzhok-p258/README.md).
- Три первичных OSM GET, семь связных paid links и девять собственных физических свидетелей. Новый directed access adapter, общие thresholds без изменения. Новых routing/trace0. Обратное направление и другие partial М-11 не включены.
- Focused7/7, full728/728, quote/API, TypeScript, ESLint и build16/16 PASS. Сквозной OSRM5424 сохранён; API при недоступном trace остаётся unknown. Initial6/7: исправлено только тестовое ожидание скрытого поля API; лог сохранён.
- По конкретным шести заменённым OSRM:25 рассчитанных компонентов, четыре составных расчёта/два unknown, ЗСД6×300, подтверждённых полных тарифов0. Исторический26/50 не является новой глобальной сводкой76. Source5281fa01…; durable STARTED5b000b5f… и CI39044745179 success проверены при продолжении.
- **NEXT после durable DONE и актуального CI:** общий scope М-12/ЦКАД собственных OSRM к Арзамасу/Чебоксарам: `m12_current_operator_pair_not_bound`, `ckad_east_arc_not_proven`. Сначала saved evidence; subtotal4494 не полный итог. Старые owner blocks ЗСД остаются отдельно;74/76/309 не повторять.

- Перед финальной записью: branch/PR head5b000b5f… совпали, PR14 draft. CI39044745179 completed/success (verify и live_probe), последние пять runs завершены. Новый post-save CI проверять отдельно.

## Предыдущая сохранённая история

## DONE — 17.10.2026 17:57 МСК: пять собственных OSRM trace ЗСД

- **5/5 случаев, полные trace, ЗСД5×300 ₽** по готовому законченному вектору Благодатная → КАД-юг. Рассчитано 19 компонентов, подтверждённых полных тарифов0. Два расчёта к Воронежу — 7254/unconfirmed; три полных итога unknown. [DONE](../../docs/checkpoints/2026-10-17-175742-zsd-osrm-five-DONE.md) · [отчёт](checks/2026-10-17-zsd-osrm-five/README.md).
- 43 обращения trace:27 точных reuse,16 новых HTTP200 (15 для основной геометрии и один local М-4), нового routing0. Строгий offline replay5/5;20 raw, семь source SHA,15 отрицательных проверок PASS.721/quoteAPI/TS/build16/16 PASS. Runtime и тарифы не менялись;74/76/309 не повторялись.
- Вместе с предыдущим представителем все шесть изменившихся OSRM имеют собственный trace и ЗСД300. Всего 23 рассчитанных компонента, три составных расчёта/три unknown, подтверждённых полных цен0. Исторический26/50 не пересчитан как глобальный baseline.
- Source8fecbab5… /CI39041543624 success; durable STARTEDd9a96ec0…. Post-STARTED CI39042535356 активен при готовности пакета, verify успешен; до его завершения ветку не обновлять. Новый CI после DONE проверять отдельно.
- **NEXT после durable DONE и актуального CI:** привязать съезд М-11 нового OSRM Торжка3183012434/795246101 и готовую пару; до доказательства unknown. Затем общий scope М-12/ЦКАД Арзамаса и Чебоксар. Исходный owner block ЗСД группы9 остаётся; общий поиск тех же ставок не повторять.

- Подготовка NEXT: p258/Будово есть в операторском списке, facility p258 отсутствует в spatial snapshot. Связь с3183012434 пока гипотеза; доказать по первичным данным, не расширять порог расстояния. Подробности — torzhok-followup-notes.json.

- Перед финальной записью: CI39042535356 завершился успешно (verify и live_probe); последние пять runs завершены. Branch/PR head d9a96ec0… совпали, PR14 draft. Ожидание CI закончено; новый post-save CI проверять отдельно.

## Предыдущая сохранённая история

## DONE — 17.10.2026 17:28 МСК: собственный trace одного OSRM

- `pair-m11-zsd-prim-to-moscow`: выбран собственный OSRM из сохранённого ответа, 715622 м /30963 с. Новый trace6/6 HTTP200, coverage complete. Благодатная → КАД-юг через ПВП318102347; существующий вектор зоны1: **300 ₽**. [DONE](../../docs/checkpoints/2026-10-17-172810-zsd-selected-osrm-trace-DONE.md).
- Строгий offline replay совпал, misses0. Семь source SHA, шесть raw responses и пять отрицательных проверок PASS. Новых routing-запросов0. Проверен один случай, рассчитаны четыре компонента, включая один ЗСД. Сумма5424 по отправлению15.10.2026; **priceConfirmation=unconfirmed, подтверждённых полных тарифов0**. Остальные пять OSRM не пересчитаны; исторический26/50 не обновлён как новый baseline.
- Sourcea49470b7… /CI39038119987 success; durable STARTEDdbb5a1ef…. Post-STARTED CI39040459995: verify успешен, широкая live_probe ещё активна при готовности случая. Финальная remote-запись только после прекращения CI; новый post-save CI проверять отдельно. Runtime не менялся.
- Обязательные проверки новых скриптов: 721/721, quote/API, TypeScript и Next build16/16 PASS. Логи сохранены; runtime не менялся.
- NEXT после durable DONE и актуального CI: один ограниченный пакет остальных пяти изменившихся OSRM. Сначала saved geometry и точные request keys; reuse только идентичного payload, недостающие chunks получить ограниченно. Пакет74/76/309 не повторять. Группа9 КАД → Планерная и другие непривязанные области оплаты остаются unknown.

- Перед финальным сохранением: CI39040459995 completed/success (verify и live_probe), последние пять запусков завершены; branch/PR headdbb5a1ef… совпали, draft сохранён. Ожидание CI закончено. Новый post-save CI проверять отдельно.

## Предыдущая сохранённая история

## DONE — 17.10.2026 16:46 МСК: no-reentry ЗСД

- **Исправлена и проверена точная причина шести случаев5733:** общий V3 `isUsableRoute` исключает доказанный городской разворот и повторный заезд до ETA-ранжирования. Восемь физических свидетелей,15м, сегменты≤500м, местный путь≤4км. Один самый быстрый допустимый обычный кандидат; цена не участвует. Без допустимых кандидатов — ошибка маршрутизации. [DONE](../../docs/checkpoints/2026-10-17-163758-zsd-no-reentry-DONE.md) · [результаты](checks/2026-10-17-zsd-no-reentry/README.md).
- Шесть bad Valhalla отклонены / шесть собственных OSRM допущены; четыре непрерывных контроля не отклоняются. Focused24, full721 + quote/API, TS, ESLint и Next build16/16 PASS. Все три новых API-теста ожидаемо падают без guard. Initial A289 ENOENT восстановлен из трёх точных Git-фикстур; initial/PASS логи сохранены.
- V2 и тарифы не менялись. Live/full replay0, новых подтверждённых цен0. Исторический baseline26priced/50unknown не пересчитан. Старый trace Valhalla не применять к новому OSRM. Guard ограничен доказанным мотивом; общая защита всех дорог не заявлена.
- Durable STARTED80a15c… (source0cc2c469…), PR14draft. Post-STARTED CI39036931767: verify иlive_probe completed/success перед финальной записью; отмена не выполнялась. Этот кодовый блок сохраняется с expected parent80a15c… и точным tree/blob/head readback; новый code CI проверять отдельно.
- NEXT после сохранения: фактический code CI; при продолжении pricing — собственный trace выбранного OSRM одного представителя, поскольку геометрия изменилась. Не повторять74/76/309 и26 siblings; no main/merge/Production/Android.

## Предыдущая сохранённая история

## STARTED — 17.10.2026 16:25 МСК: guard повторного заездаЗСД

- Поручение: исправить6подтверждённых повторныхзаездов группы5733. Source head0cc2c469…, PR14draft. [STARTED](../../docs/checkpoints/2026-10-17-162522-zsd-no-reentry-STARTED.md). До длительныхтестов сохранить и проверитьreadback; приактивномCI не обновлятьветку.
- Решение: узкий geometryguard вобщемV3 `isUsableRoute` до выбораETA;8физическихсвидетелей, порядок/dense/maxlocalspan. ОбычныйOSRMкандидатестьво всех6savedresponses; цены не участвуют ввыборе, чужойtrace не переносить. V2/тарифы не менять.
- NEXT: послеdurableSTARTED реализоватьguard иfocused/integrationтесты, затемfullgate/TS/build, per-caseprogress, одинDONEcheckpoint. Покаисправлениене выполнено; live/replay74/76/309 не запускать.

## Предыдущая сохранённая история

## Handoff — 17.10.2026 16:15 МСК: представители ЗСД и повторный заезд

- **DONE:** 9 новых представителей +5проверок исключений =14уникальных сохранённых случаев; SHA и geometry выбранного провайдера совпали14/14. Накопленно представлены все11групп50unknown, но границы проверены только24/50случаев;26siblings не проверены. Новых цен0, baseline26рассчитанных компонентов/50unknown неизменён. [Checkpoint](../../docs/checkpoints/2026-10-17-161512-zsd-remaining-representatives-DONE.md) · [таблица/доказательства](checks/2026-10-17-zsd-remaining-scopes/README.md).
- **Новая подтверждённая причина:** все6маршрутов группы5733 от Приморского выходят с ЗСД к Богатырскому/Планерной, идут по городским links и заезжают наЗСД повторно. Это нарушает no-reentry; один обратный готовый вектор неприменим. Исправление кода **отложено до следующего отдельного блока**, ещё не выполнено; числовая ошибка не заявлена, текущий компонент unknown.
- Остальные8новых представителей заблокированы по primary collection span. У группы2c00 обнаружен входКрузенштерна/Шкиперского с toll_gantry13020687195 на351741889 (toll=false): отдельную оплату не считатьнулевой и не переносить600Екатерингофки. Оператор403/владелец502; общий поиск техже ставок остановлен.
- Source/remote/PRhead97d165fe…, PR14draft, CI39033008320success фактически проверен. Runtime/тарифы не менялись; новых component/date/full/liveзапусков0. Этот блок сохранятьодним connectorexpected-parentcommit/readback, post-saveCIпроверятьотдельно.
- **NEXT:** кодовыйблок no-reentry по6сохранённымcapture5733: изучитьroute selection/trace contracts, реализоватьузкийguard, focused+обязательныеgate/build. Не повторять74/76/309 и26siblings дообщегорешения; не менятьmain/Production/Android.

## Предыдущая сохранённая история

## Handoff — 17.10.2026 15:31 МСК: группа9 заблокирована по источникам

- **DONE анализ группы9; тариф BLOCKED:** 9 capture и sealed результатов проверены поSHA; восемь проверок исключений без отличий. Въезд КАД-юг, съезд к Богатырскому/Планерной через1766158781. Не хватает первичной направленной области cash/card сбора и зачёта для пары933974870→1766158781. Готовый600-вектор Екатерингофки не применён. Runtime/цены не менялись.
- Следующий представитель группы7 Kazan→Sest проверен по сохранённому capture: физически КАД-юг→КАД-север/1766158812; надёжной привязки сбора нет, шесть остальных случаев не проверены. Новых цен0; baseline26 рассчитанных компонентов/50unknown сохраняется. Новых component/date, full replay и live-маршрутов0. [Checkpoint](../../docs/checkpoints/2026-10-17-153001-zsd-planernaya-group9-BLOCKED.md) · [9case evidence](checks/2026-10-17-zsd-planernaya-group9/summary.json) · [следующий представитель](checks/2026-10-17-zsd-planernaya-group9/next-group-representative.json).
- CI39031962573: verify и live_probe completed/success (повторная проверка15:31МСК); во время активногоCI ветка не менялась. Исходный remote/PR head567090bf…, PR14 draft. Этот блок сохраняется одним connector commit с expected parent и проверкой tree/blob/head; CLIpush не повторять.
- NEXT после сохранения: обратная группа1e954c437e46, представитель `max-chain-m12-ckad-m11-zsd-sest-to-kazan`; использовать сохранённые данные, не повторять пакет74/76/309 и общий поиск тех же ставок.

## Предыдущая сохранённая история

## 17.10.2026 15:08 МСК — пакет74 DONE

74/74captures×2dates:24новых calculated ZSDcomponents600,50unknown,0execution errors, no live/full replay. Итого76/76assessed,26componentspriced/50unknown. [Итог/группы](checks/2026-10-17-zsd-batch74/README.md) · [checkpoint](../../docs/checkpoints/2026-10-17-150839-zsd-batch74-DONE.md). Проверки704/TS/build PASS. NEXT после сохранения/currentCI: primary finished scope одного representative9cases `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`; не50поштучных live повторов. Старый процент не выводить в текущих отчётах.

## 17.10.2026 15:01 МСК — пакет74 STARTED

Прямое поручение: один пакет, один итоговый commit, отдельные case results. [Входы/восстановление](../../docs/checkpoints/2026-10-17-150159-zsd-batch74-STARTED.md). Выполнить current ZSD component на74 saved captures×2dates, no live/full replay. Формальный старый процент в текущих отчётах не использовать.

## 17.10.2026 14:33 МСК — ЗСД: проверен второй сохранённый случай

Брянка→СПб: component-only600 на2датах;3negative unknown. Новых full replay/live0. Накопленно2/76cases,74не зачтены этой версией. Полный итог Брянки не заявлять. CI правки39026791473 success. [Checkpoint](../../docs/checkpoints/2026-10-17-143328-zsd-bryanka-exceptions.md). NEXT после нового CI/head: Лисичанск→СПб, только material exceptions полного физического scope. Формальный план100%, не подтверждённость тарифов.

## 17.10.2026 13:53 МСК — один вектор ЗСД исправлен

КАД-юг→Екатерингофка:600 ₽ source-derived owner vector, полные offline totals Гранитное→СПб9534/11184 с сохранением unconfirmed. Full704 + TS + build PASS. [Подробный checkpoint](../../docs/checkpoints/2026-10-17-135300-zsd-kad-ekateringofka-fixed.md). После post-save CI проверить только фактические исключения совпавшего physical scope; остальные75 случаев не считать выполненными по этому шагу. Старый формальный план20/20=100%.

## 17.10.2026 13:36 — ЗСД primary scope STARTED

Скачать/сохранить три первичных PDF владельца и проверить cash/card scope ПВП5. [Точные входы и продолжение](../../docs/checkpoints/2026-10-17-133600-zsd-primary-scope-STARTED.md). Не повторять76 маршрутов; тариф не назначать без доказательства.

## 17.10.2026 12:39 МСК — поиск решений после аудита

Старый формальный план 20/20=100% и его финальный CI #39019024457 success; старое автопродолжение отключено. По новому запросу пользователя продолжается общая задача: [конкретные решения и acceptance criteria](POST_AUDIT_SOLUTIONS_2026-10-17.md). Ближайший объект — cash/card scope ПВП5/КАД-юг→Екатерингофка и исключение связанной оплаты по чеку; новых прогонов/цен нет. Перед следующей записью проверить новый run/head. Не добавлять подэтапы ради счётчика.

---

## Current handoff — 2026-10-17T08:51:29Z (2026-10-17 11:51 МСК)

- Формальный план 20/20 = 100%; Parts 19 и 20 завершены в сохранённой ветке. Это не подтверждённость тарифов и не завершение всей широкой задачи калькулятора.
- Part19: 13 findings, outcomes 1 fixed-and-verified component binding, 1 not reproduced, 8 blocked by missing reliable data, 3 deferred. M11 four named cases уже были включены в 8-case saved review; тариф остаётся unknown/null.
- Part20: workflow #39016525904 success на source head `cfb442401a3cde9b6311026675d39484df394182`; tests/TS/build/live probes, fixed 50-settlement corpus audit и 6 Yandex screenshot comparisons прошли. Ссылки и статусы формального плана проверены.
- NEXT: verify post-save Actions + exact branch/PR head; upon success disable this automation. No merge/main/Production/Android.

[Checkpoint](../../docs/checkpoints/2026-10-17-115129-part20-final-verification.md) · [Queue](PART19_FINDINGS_QUEUE.json) · [Plan](SMALL_PARTS_PLAN.json).

---

## Current handoff — 2026-10-17T08:11:16Z (2026-10-17 11:11 МСК)

- Part19 synthesis DONE: 13/13 finding records normalized to canonical outcomes; counts 1 fixed-and-verified component binding, 1 not reproduced, 8 blocked by missing reliable data, 3 deferred. Cross-finding route baselines overlap.
- The four named M11 cases are among the saved eight-case boundary review; no rerun. They remain blocked by missing reliable route-to-entry/payment boundary evidence; amount remains null.
- No new route calls/replays/tests/builds or tariff changes. Formal plan 19/20 = 95%, not tariff confidence.
- NEXT: after this commit's Actions result is observed, complete Part20 docs-only content/link checks and required CI handoff.

[Checkpoint](../../docs/checkpoints/2026-10-17-111116-part19-outcome-synthesis.md) · [Queue](PART19_FINDINGS_QUEUE.json) · [WORK_STATE](../../docs/WORK_STATE.md).

---

## Current handoff — 2026-10-17T07:41:10Z (2026-10-17 10:41 МСК)

- PR14 draft открыт; source head до записи `bdf620e441d2cbe287a348bd388d28e188106341`, Actions #39010035622 success на этом head. Проверить новый post-save run перед следующей записью.
- Part19 cause `odintsovo:unpriced`: **blocked_by_missing_reliable_data**. 2 route cases, 4 unique route/date profiles, 6 saved live/same-date/weekend artifacts; all files present. Both routes prove Odintsovo bypass traversal, but exact directed PVP vector binding is unresolved. Official fare candidate exists, while selection report has `runtimeApproved=false`; M1 and unknown paid booth also keep totals null.
- `arc_not_proven` queue field aligned with its saved blocked outcome. No new route calls, replay, tests, builds or tariff changes. Full quote remains unknown/null.
- Formal plan stays **18/20 = 90%**. Part19 synthesis/status reconciliation remains; Part20 required verification is planned.

[Checkpoint](../../docs/checkpoints/2026-10-17-1041-part19-odintsovo-unpriced-blocked.md) · [Evidence](../../docs/checkpoints/evidence/2026-10-17-part19-odintsovo-unpriced-blocked.json) · [Queue](PART19_FINDINGS_QUEUE.json).

# Следующие действия



[Актуальный handoff](../../docs/WORK_STATE.md); история ниже сохранена.

## Part 19 cause review — `arc_not_proven`

Outcome: **blocked_by_missing_reliable_data**. Reviewed all 34 baseline cases across 68 unique weekday/weekend profiles and 102 unique saved live/replay evidence files; all paths exist, report rows are complete, all occurrences are `ckad_east_arc_not_proven`, and weekday/weekend amounts remain null. Broader road traversal is proven in 22 rows and not proven in 12; neither proves the exact CKAD east-arc chargeable boundary. No new route calls, replay, tests, builds or tariff confirmation. See [checkpoint](../../docs/checkpoints/2026-10-17-0632-part19-arc-not-proven-blocked.md) and [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-arc-not-proven-blocked.json).

Formal progress stays **18/20 = 90%**; this is only the formal plan percentage, not tariff coverage or release readiness.

NEXT: `expected-road-not-proven` (baseline 64), inspect shared cause and exceptions from saved evidence only, with overlaps excluded; no live/replay absent material distinction or evidence gap. Workflow run #38994773498 also executed an out-of-scope toll-avoidance probe; that step is removed from the PR workflow in this commit. Observe new workflow status after save.

Part19 `m11-58-679:unpriced`: **blocked_by_missing_reliable_data**. All 41 route cases assessed across 82 unique saved weekday/weekend profiles (15/30 earlier + 26/52 now). The 74 residual artifact-file entries contained 22 duplicates, excluded from the check count. M11 remains unknown/null; no tariff/full total confirmed. No new live/replay/build/tests.

NEXT: `arc_not_proven` (baseline34): inspect grouped causes and exceptions from saved artifacts only. No duplicate profiles or new probes without material distinction/evidence gap. Formal plan stays 18/20=90%; Part19 IN_PROGRESS, Part20 PLANNED. No main/merge/Production/Android.

[Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-58-679-blocked.md) · [evidence](../../docs/checkpoints/evidence/2026-10-17-part19-m11-58-679-blocked.json)

---

## Сохранённая история предыдущих очередей

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
# 16.10.2026 current next: part19B full gate

After persisted connector-focused checkpoint: pnpm build + scoped lint/diff. Do not claim whole-engine totals before per-direction offline replay of selected capture. Each direction separate checkpoint/commit/head/tree. Part19 not complete;20 not started. See docs/checkpoints/2026-10-16-part19b-a289-connector-focused.md.

16.10.2026 next: fullgate676 PASS; run ONLY Moscow→Taman raw00-10-06-845Z offline replay15/17Oct09:00MSK, inspect complete/missingResponses/tolls, save/checkpoint first; then reverse. ../../docs/checkpoints/2026-10-16-part19b-a289-build-pass.md.

16.10.2026 next: forward replay saved4725/5625 complete; reverse Taman→Moscow raw01-40-05-574Z only, same two profiles; inspect then checkpoint. ../../docs/checkpoints/2026-10-16-part19b-moscow-taman-replay.md.

16.10.2026 CURRENT NEXT:19B DONE bothdirections; nextONLY dnr-гранитное-moscow-center, historical m4_crossing_profile_changes. Existingcapture/current-engine offline15/17Oct09:00MSK, inspect trip-departure-v1 and actual M4 quote; checkpoint+commit+head/tree before nextcase. No new live/no full309rerun. ../../docs/checkpoints/2026-10-16-part19b-taman-moscow-replay.md. Part19ongoing,20notstarted.

16.10.2026 CURRENT NEXT: historicalM4policy1/25checked; ONLY zaporizhzhia-пришиб-moscow-center2/25. Corpus.auditEvidence.capture, offline15/17Oct09:00MSK then checkpoint+head/tree. No otherclass expansion before save. Use NUL-safe Gitpaths. ../../docs/checkpoints/2026-10-16-part19c-granitnoe-m4-policy-replay.md.

16.10.2026: current handoff refreshed without deleting historical logs. Next case unchanged; see ../../docs/WORK_STATE.md and ../../docs/checkpoints/2026-10-16-part19-handoff-refreshed.md.

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
2026-10-16T18:43:00+03:00: среда восстановлена и готова; NEXT выполнить ровно ZSD case55 `max-chain-m12-ckad-m11-zsd-sest-to-vladimir`, затем сохранить и проверить remote head/tree. [Checkpoint](../../docs/checkpoints/2026-10-16-1843-dependencies-restored.md). Plan90% (18/20), ZSD54/76.

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

2026-10-16T17:12:02.000Z: ZSD diagnosis persistence repair DONE; found oversized local `NEXT_STEPS.md`, `PART19_FINDINGS_QUEUE.json` and `WORK_LOG.md` blobs had been truncated during connector upload. [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-12-02-000Z-tree-readback-repair.md). Restore exact complete Git blob contents and verify branch tree/paths before the next case.

2026-10-16T17:14:47.000Z: ZSD diagnosis persistence repair VERIFIED; PR14 head `c2e744d030b9a6f1c3cbc3ed5ac20674458dbb67`, tree `433ea764ea17d4f5cd4b41a37e2b59902a31586a`, all seven changed blob SHAs match. [Checkpoint](../../docs/checkpoints/zsd-2026-10-16T17-14-47-000Z-tree-readback-repair-done.md). NEXT case69 `single-zsd-peterhof-to-prim`; saved capture, two offline date profiles.

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

2026-10-16T17:41:54Z: `zsd:unpriced` classified source-gated after 76/76 saved cases were replayed and scoped; operator collection span remains unbound, no tariff/free claim. [Checkpoint](../../docs/checkpoints/2026-10-16-zsd-classification-76-cases.md). NEXT review `m4:unpriced` from its 22 saved evaluations, then continue one finding at a time. Plan90% (18/20); not fare coverage.

2026-10-16T17:48:58Z: `m4:unpriced` 22/22 saved evaluations classified source-gated: five whole-route estimates lack operator fare confirmation; three M4 components have other products unknown; eight physical545 and six short-route scopes remain unbound. No tariff/zero/free claim, runtime change, test, or build. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m4-unpriced-classification.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m4-22-case-classification.json). NEXT only `m11_partial_head_entry_boundary_unresolved`, inspect saved evidence and classify/fix one cause with proof. Overall plan90% (18/20), not tariff coverage.

2026-10-16T17:55:31Z: STARTED `m11_partial_head_entry_boundary_unresolved`, first case `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`; capture SHA and two departure-profile evidence paths are recorded. Compare selected paid edges with primary M11 boundary. No new live call/price/code/test. [STARTED checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-head-boundary-started.md). Overall plan90% (18/20); not tariff coverage.

2026-10-16T18:01:25Z: M11 boundary case1 `max-chain-m12-ckad-m11-zsd-arzamas-to-prim` reviewed from complete saved capture and two profiles. Entry/PVP21 boundary unbound; M11 15–58 remains unknown; adjacent M11 components are not a whole fare. No new live call/price/code/test. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case1-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case1-boundary-review.json). NEXT case2 `max-chain-m12-ckad-m11-zsd-kazan-to-sest`, same exact source/route test. Overall plan90% (18/20), not tariff coverage.

2026-10-16T18:06:04Z: STARTED case2 `max-chain-m12-ckad-m11-zsd-kazan-to-sest` for M11 head-boundary finding. Complete capture and 15/17 Oct profile input SHAs are fixed in [STARTED checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case2-boundary-started.md) and [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case2-boundary-inputs.json). Existing outputs still leave M11 15–58 unknown; no new live request or price inference. Next inspect exact M11 entry/payment-boundary support and record case2 result before case3. Overall plan90% (18/20), separate from 1/8 completed-case reviews and tariff confirmation.

2026-10-16T18:08:14Z: M11 boundary case2 `max-chain-m12-ckad-m11-zsd-kazan-to-sest` source-gated after its saved capture and 15/17 Oct profiles were reviewed. The exact gate ways are absent from the trace, nearest gate-node distances are 26.5m/41.8m versus the 25m gate rule, and the payment-time source leaves Moscow PVP21's spatial anchor unresolved. Retain unknown; CKAD/ZSD also block a complete fare. No new live request, price/code/test/build. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case2-boundary-source-gated.md); [evidence](../../docs/checkpoints/evidence/2026-10-16-m11-case2-boundary-review.json). NEXT case3 `max-chain-m12-ckad-m11-zsd-murom-to-sest`. Overall plan90% (18/20); reviewed 2/8 cases, not tariff coverage.

2026-10-16T18:53:27Z: User-approved [cause/impact rules](../../docs/WORKFLOW_RULES.md) adopted; existing automation prompt updated. [Checkpoint](../../docs/checkpoints/2026-10-16-215327-workflow-efficiency-rules.md). NEXT: check only murom-to-sest case3 for material exceptions to the established M11 boundary cause using existing capture/paired-profile metadata; preserve each actual bounded check before next, full replay only if concrete difference/incomplete evidence. Six exception checks pending, two detailed reviews already saved; no new route checks in this rules step. Overall formal plan18/20=90%, not calculator/tariff readiness. CLI push auth remains environment-blocked after dry-run exit128; use authorized connector without repeated credential retries. CI38947789852 completed/success belongs to source head cf97c6e; recheck workflow status on the published new head before another branch write.


2026-10-16T19:39:58Z: M11 finding case3 DONE/source-gated; no material exception. Review count3/8; formal plan90% (18/20). [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case3-boundary-source-gated.md). NEXT only `pair-m11-ckad-noginsk-to-spb` saved evidence bounded exception check; persist before case5.


2026-10-16T20:00:50.463Z: M11 boundary case4 DONE/source-gated, no material exception; 4/8 cases checked. Next only `triple-m11-ckad-m12-kazan-to-spb` saved-evidence exception check; no full replay/new live absent a concrete difference. See checkpoint `../../docs/checkpoints/2026-10-16-part19-m11-case4-boundary-source-gated.md`. Formal plan remains90% (18/20), not tariff readiness.


2026-10-16 23:19:47 MSK: Part19 M11 boundary case5 DONE from saved evidence only; M11 cause 5/8 checks. No material exception; case-specific CKAD east arc/ZSD scope unresolved, M11 amount unknown and trip total null. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case5-boundary-source-gated.md). NEXT after verified save and no active writer: case6 `max-chain-m12-ckad-m11-zsd-cheboksary-to-prim`, saved-data exception check only. Formal plan remains18/20=90%, not tariff readiness.


2026-10-16 23:39:00 MSK: Case6 M11 saved-evidence exception review DONE. M11 boundary remains blocked; earlier unknown-paid-road classification changed in later same-capture replays with exact ZSD booth node 1766158781; previously validated identity fix resolves label, not tariff. M12 expected road, CKAD east arc and ZSD zone scope remain unknown; no route amount. [Checkpoint](../../docs/checkpoints/2026-10-16-part19-m11-case6-boundary-exception.md). NEXT only after durable readback/no active writer: case7 `max-chain-m12-ckad-m11-zsd-vladimir-to-sest`, saved evidence only. Formal plan18/20=90%, not tariff readiness.


2026-10-17 00:16:00 MSK: Case7 DONE from saved profiles; same M11 boundary blocker, no exception; expected M12 traversal unproven, CKAD/ZSD scope unknown and route total null. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-case7-boundary-source-gated.md). NEXT after durable readback/no active writer: case8 `triple-m11-ckad-m12-arzamas-to-spb`, saved-evidence check only. Formal plan18/20=90%, not tariff coverage.


2026-10-17 01:45:16 MSK: Case8 `triple-m11-ckad-m12-arzamas-to-spb` DONE from saved evidence; no material exception to shared M11 head-boundary cause. 3 unique route profiles across live/same-date/weekend bind the same capture; duplicate blobs counted once. M11 head unknown, CKAD east arc and ZSD scope unresolved, whole-route amount null. No new live/replay/code/tests. M11 cause exception checks complete 8/8; outcome blocked by missing reliable data. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-case8-boundary-source-gated.md). Formal plan18/20=90%, not tariff coverage. NEXT: Part19 cross-cause synthesis then Part20 required gates/handoff.


2026-10-17 02:31:29 MSK: Reconciled Part19 queue: M11 case1–8 checkpoints now represented in the findings ledger; shared cause status blocked by missing reliable data. NEXT single cause: `unknown-paid-road:unpriced`, inspect saved evidence/current engine and compare overlap with `expected-road-not-proven`; do not infer 128 unique cases. No new live/replay/tests in this reconciliation. [Checkpoint](../../docs/checkpoints/2026-10-17-part19-m11-ledger-reconciliation.md). Plan18/20=90% only.


## Восстановленный отчёт исходного блока (до публикации, 21:20 МСК)

## DONE — 17.10.2026 21:20 МСК: ЦКАД М-11→М-12

- **Исправлена и проверена** одна общая причина двух собственных OSRM. Primary12GET/49witnesses, полный named контекст А-113 с non-toll links; новый forward-only adapter. У каждого ЦКАД981,5компонентов, subtotal5475; full amountnull/missingm12. Новых компонентов2, полных расчётов/подтверждённых полных тарифов0. [DONE](../../docs/checkpoints/2026-10-17-212016-ckad-m11-m12-DONE.md) · [отчёт](checks/2026-10-17-ckad-m11-m12/README.md).
- Focused8, full736/quoteAPI/TS/ESLint/build16/16 PASS.20 контекстных+6 геометрических отрицательных вариантов, API2, recorded control7254. Initial тестовые ошибки и один uninstrumented М-4 control fetch-capable invocation сохранены; final default fetch закрыт/exact replay. Не заявлять нулевую сетевую экспозицию всего блока. Primary/target queries считать отдельно. ProgressDONE12 восстановлен по exact raw без re-fetch.
- По шести заменённым OSRM27 рассчитанных компонентов,4составных расчёта/2unknown, подтверждённых полных тарифов0. Historical26/50 без изменения. Старый полный ЦКАД arc/общие thresholds, матрица и цены не менялись; новые routing/target trace0.
- Durable STARTEDa666fb48…/tree0e04b98c… verified, PR14draft. CI39056837838 активен при подготовке, verify success; до завершения remote не писать. Новый post-save CI отдельно.
- **NEXT после durable DONE:** первичная привязка западных М-12 рамок и разных выходов. Рамки10782165529/11214930528/11157985901, выходы22Н-0239/М-7 у Владимира;2952/1239 не присваивать без доказательства. Без нового routing и повторов74/76/309. Затем остальные причины и итоговый gate/handoff; исходные ZSD owner blocks остаются отдельно.

- Перед итоговой записью: CI39056837838 completed/success (verify и live_probe), последние пять runs завершены; branch/PR heada666fb48… совпали, PR14 draft. Final focused asserts0 неожиданных fetch attempts. Новый post-save CI отдельно.

## Предыдущая сохранённая история
