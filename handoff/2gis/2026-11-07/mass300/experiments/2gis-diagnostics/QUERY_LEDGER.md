# Журнал запросов 2ГИС

## Stage 8 official tariff review — 2026-11-06

2GIS API calls: **0**; new quota debit: **0**. Stage8 used only public operator documents and retained project snapshots. The live PVP18 Stage7 response was not replayed and was not assigned a tariff because its directed geometry was not retained. CKAD `outcome_unknown` remains no-retry. See [Stage8 result](STAGE8_RESULT.md).

Этап 3: **0 новых API вызовов; 0 списано по этому этапу.** Задание разрешает подготовить, но прямо запрещает запуск без отдельного разрешения владельца.

## Официальное правило биллинга и снимок квоты

Проверены актуальные публичные страницы 2ГИС 05.11.2026:

- Routing Overview: https://docs.2gis.com/en/api/navigation/routing/overview
- POST global reference: https://docs.2gis.com/en/api/navigation/routing/reference/routing
- Pricing and billing: https://docs.2gis.com/en/platform-manager/subscription/pricing
- Examples: https://docs.2gis.com/en/api/navigation/routing/examples/routing

Для Routing API публичная таблица называет billing unit **Route**. Для одного набора точек оплачивается один маршрут; дополнительные alternative route options в том же запросе отдельно не оплачиваются. Успешный API request в описании биллинга — HTTP 200 или 204. Эта формула относится к одному набору точек; не превращать HTTP count в доказательство фактического изменения счётчика до readback.

Из brief владельца: скриншоты Platform Manager от 05.11 показывали demo key, Routing API active, 9/1000 использовано и 991 осталось; key interval 03.11–03.12. Это показание на момент screenshot, а не текущий readback. Та же публичная Pricing страница называет demo total limit Routing API 1,000 и subscription per-minute limit 600 units/min. Чтобы не приблизиться к пределу и пока не известны key-specific overrides, локальный runner ограничен 5 expected route units/min. Не создавать новые ключи/paid services.

Ожидание для каждого запроса с одним набором точек и alternative=0: один billable route по публичной формуле. Фактический debit из demo counter пока неизвестен; после первого ответа требуется вручную сравнить Routing API counter до/после. Перейти ко второму запросу runner не позволит без этой сверки, сохранённой оценки полезности ответа и явного продолжения.

## Последовательность (не запускалась)

| Порядок | Окно | Координаты [lon,lat] | Запросный набор | Возможная польза |
|---:|---|---|---|---|
| 1 — первичный | ckad-m11-m12 | [37.1996241,56.0900701] → [37.2148620,56.0915116] | 1 набор точек, driving, fastest, jam, detailed, need_payment_info=true, alternative=0 | Проверить направленный M11→M12 путь через booth к after-booth node. Наиболее сильная собственная физическая трасса. |
| 2 — только после review №1 | m11-15-58 | [37.2144063,56.0917554] → [37.2004102,56.0897492] | Те же параметры; только northbound | Проверить отдельную one-way последовательность через PVP18/gate8087316065. |
| 3 — независимый объект, условно | zsd-rvp64-exit | [30.2234101,59.9617618] → [30.2204329,59.9612328] | Те же параметры | Проверить участок ЗСД на нанесённой границе без предположения, что gate — касса. |

Все окна далеко ниже demo 50 km limit. Приёмка должна проверять одновременно HTTP статус, внутренний status маршрута, geometry selection и оплату отдельно. API описывает need_payment_info как включение информации об оплате, если route содержит toll roads; это не доказательство собственного продукта или цены.

## Дублирование окон 1 и 2

Они находятся в одном узле и имеют похожую длину, но evidence связывает их с разными направленными связями: №1 — M11→M12 через booth8087316064 к точке после кассы; №2 — собственная one-way северная цепь через gate8087316065. Это не зеркальная пара одних и тех же OSM ways. Запрос №2 всё равно условный: агрегат оплаты 2ГИС не идентифицирует один из двух продуктов. Если первый вызов не возвращает пригодную геометрию/payment info, второй не даст полезного разделения и должен остаться NOT_RUN.

№3 расположен отдельно и его вопрос независим; запускать только если результат №1 пригоден и остаётся смысл квотного продолжения. Пакет остаётся не разрешённым к выполнению, хотя подготовлены все три draft.

## Зафиксированные результаты

| Окно | HTTP | Route status | Геометрия | Payment info | Фактический расход |
|---|---|---|---|---|---|
| ckad-m11-m12 | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | 0 |
| m11-15-58 | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | 0 |
| zsd-rvp64-exit | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | 0 |

Пилот 03.11.2026 не повторялся. Raw responses и полный pilot ledger не нашлись; сохранена только пользовательская сводка о трёх HTTP200 и количествах геометрии (М4 151, М12 137/219).

## Лицензия и хранение

Публичные API страницы описывают форму результата, но в проверенной документации не найдены достаточные условия, разрешающие архивировать/переиспользовать selection geometry или payment fields в road database. Полные ответы/геометрия инструментом не записываются; для финального ledger предполагаются только короткие redacted summaries. Но даже это не считать разрешённым до подтверждения условий владельцем/в Platform Manager. Защищённые сведения в основную дорожную базу не переносить.

API calls: 0. Owner-reported quota: 991 remaining at screenshot time. Current readback: NOT_CHECKED. Actual route-counter debit: NOT_CHECKED.

## Stage 4 authorization update — 2026-11-06

Owner authorization now covers one request for `ckad-m11-m12`; actual status remains NOT_RUN and debit 0. The supplied credential was not copied to disk or shell. The 05.11 snapshot (991 remaining) is retained as historical context and is not used as today's fresh counter. No current PM reading was obtained because the connected browser tool timed out. Before the authorized one-call run, record the numeric live remaining counter and owner confirmation that applicable terms permit this request and a redacted summary without raw geometry/response. After the call, record actual before/after counter delta; do not infer it from HTTP status. No other candidate is authorized.

Owner follow-up 2026-11-06 confirms both fresh counter and applicable terms; exact numeric remaining count was not included. Runner preflight requires that number. Status stays NOT_RUN / spend 0 until received. Browser timeout is superseded by the owner statement; no need to recheck or ask for terms again.

## Attempt recorded — 2026-11-06, no retry

`ckad-m11-m12` was attempted once after owner authorization. Pre-call Routing API remaining count: 991. Fetch threw a timeout/network error; the runner recorded `outcome_unknown`, with no HTTP status/response and no automatic retry. Expected billing unit: 1 Route per official docs; actual quota delta: UNKNOWN pending the owner's post-call counter. Do not infer a debit of 1 from the attempt, and do not repeat the request. Other candidates remain NOT_RUN.

## Post-attempt counter readback — 2026-11-06

Owner-reported Routing API remaining count after the attempt: 991; pre-attempt count: 991; observed delta/spend: **0 units** at readback. The route response remains unknown because fetch timed out without an HTTP status. Ledger status remains `outcome_unknown`; no retry or further candidate is permitted.

## Current draft request — M11 PVP18 northbound, NOT_RUN

Candidate: `m11-15-58`; A `[37.2144063,56.0917554]` → B `[37.2004102,56.0897492]`, northbound one-way chain 954011576→954011577→791520973→1270188032 through gate 8087316065. Request draft follows the recovered config: driving, fastest, detailed, need_payment_info=true, locale=ru, alternative=2, two stop points. Chord 0.90 km; per-window cap 5 km; demo cap 50 km. The request checks selected geometry along the directed PVP18 chain and presence of route_points/total_payments data. Alternative=0 returns primary only; alternative=2 permits two alternatives for geometric comparison. The saved official billing rule says alternatives in the same point-set call are not billed separately, so both configurations expect one Route; actual counter still must be read after any separately authorized run.

This window is independent of the prior CKAD endpoints/direction, but the response aggregate cannot identify M11 15–58 vs CKAD product. Official operator matrix and own directed road mapping remain required for product/fare conclusions. Status NOT_RUN; no current authorization; no API call.

## Runner gate correction — 2026-11-06

`ckad-m11-m12` remains `outcome_unknown` and cannot be repeated. The local runner now scopes the duplicate reservation to the selected allowlisted window: CKAD state does not block independent `m11-15-58`. Each actual request still requires its own fresh preflight and separate owner approval containing that exact window ID. The CKAD approval cannot authorize PVP18. The unresolved reservation and safe request parameters are retained in the ignored local ledger; no real request was made during this correction. Regression: `CKAD=outcome_unknown`, CKAD replay rejected, PVP18 allowed by the ledger only after `validateOwnerApproval` accepts PVP18-specific permission.

## Stage 7 series authorization — 2026-11-06

Owner authorizes a bounded series up to 300 Routing API Route units on the existing demo key; no separate user confirmation is needed per request/package. Read-only Platform Manager access via Opera timed out. Last confirmed counter readback is 991 after CKAD, matching its pre-call count; the local ignored ledger records that CKAD result as `outcome_unknown`, observed quota delta 0, and expectedUnits 1. For conservative planning reserve one unit for that attempt and deduct each new authorized attempt's expected unit. After the PVP18 attempt below, the next-call working ceiling is 989 units; this is not a live counter and does not account for any unobserved external usage. Key expiration last confirmed 2026-12-03. The runner cap is 300 task units; local rate guard remains 5 units/min. No CKAD retry.

### M11 PVP18 northbound (`m11-15-58`)

- Call: one POST, `alternative=2`, no retries; owner Stage 7 series authorization; key was ephemeral and absent after command.
- HTTP200; routeBuildStatus `OK`; one route; distance 6,369m; duration514s.
- Geometry summary: 13 lines / 252 vertices, no malformed selection. Candidate has no source witness anchor configured; raw geometry was not retained. Therefore exact one-way PVP18 path match is **unverified**. Returned distance materially exceeds the candidate's expected 1–2km route, though it is below the official 50km ceiling.
- Payment summary: `route_points` count2; `total_payments` array entry count1. The numeric value was not decoded or retained; do not infer product or price.
- Expected billing under saved 2GIS pricing docs: 1 Route. Post-call PM counter could not be read; actual debit **unknown**. Local conservative budget deducts1 expected unit. No customer tariff or code change.

### ZSD RVP64→south-KAD exit (`zsd-rvp64-exit`)

- Call: one POST, `alternative=0`, no retry; separate allowlisted window and Stage7 series authorization.
- HTTP200; routeBuildStatus `OK`; one route; distance176m; duration17s.
- Geometry summary: 3 lines / 9 vertices, no malformed selections; nearest route vertex is26m from the configured OSM source anchor for node13020687195. This is consistent with the short physical corridor but does not prove exact paid-lane/gate crossing; raw geometry is not retained.
- Payment fields: event count/aggregate entry count unavailable (`null`), not zero. No fare or “free” conclusion.
- Expected billing: 1 Route. PM after-count unavailable; actual delta **unknown**. Deduct1 expected unit from local conservative task ceiling (next-call ceiling988). No CKAD replay.

### M-11→Pulkovo airport access (`m11-pulkovo-airport-access`) — PREPARED

- Directed OSM points `[30.3392171,59.7903025]` → `[30.3260124,59.7901200]` follow one-way way1369893169 → toll gantry node13377945035 “М-11 - Аэр. Пулково” → one-way way1524320371. Source evidence and OSM SHA are recorded in `candidate-evidence/m11-pulkovo-airport-access.json`.
- Chord/source segment length0.739km; request maximum5km; `alternative=0`; expected1 Route. DRY_RUN verified; not yet sent at this checkpoint.
- Hypothesis: 2GIS selected geometry should pass through the named gate and may report payment fields. It cannot establish whether 38 RUB airport-access or conditional94 RUB airport+mainline fare applies. Official Order274 remains source of price and conditions.
- Planned conservative quota ceiling988; actual counter after prior two calls unavailable. Key remains ephemeral; no call until Stage7 series authorization/preflight is reflected for this exact candidate.

#### Result — 2026-11-06

- One POST, `alternative=0`, no retry: HTTP200/route OK; 741m/48s; 3 geometry lines/7 vertices; nearest geometry vertex266m from gate node13377945035.
- Two route points and one total-payments entry were reported; numeric amount/product not retained. Distance matches the source corridor length (739m) closely, but no raw WKT was retained and vertex-only distance cannot prove the exact gate crossing.
- Expected1 Route; post-call PM counter unread, actual delta unknown; working ceiling987. Do not repeat.


### Pulkovo→M-11 reverse airport access (`pulkovo-m11-airport-access-reverse`) — PREPARED

- Directed OSM points `[30.3259779,59.7900004]` → `[30.3407729,59.7901549]` follow one-way way1524320372 → toll gantry node13377945036 “Аэр. Пулково - М-11” → one-way way1360759955. Evidence: `candidate-evidence/pulkovo-m11-airport-access-reverse.json`.
- Chord0.83km; maximum5km; `alternative=0`; expected1 Route; DRY_RUN and target tests PASS.
- Hypothesis: compare route geometry/payment-field presence for this reverse approach with M-11→airport. API aggregate cannot establish the standalone38-RUB or conditional94-RUB fare; official Order274 controls.
- Conservative quota ceiling987, not a live counter. Stage7 series authorization applies; one attempt only, no retry.

#### Result — 2026-11-06

- One POST, `alternative=0`, no retry: HTTP200/route OK; 830m/51s; geometry4 lines/10 vertices; nearest geometry vertex240m from gate node13377945036.
- Payment event count2 and total-payments entry count1; no amount/product retained. Directed OSM chord is~828m; distance is corridor-consistent, but raw WKT absent and exact gate crossing unverified.
- Paired M-11→airport answer was741m with the same event/aggregate counts. Similarity does not identify a fare or establish the same gate selection.
- Expected1 Route, PM after-counter unread; conservative working ceiling986. No repeat.


### M-4 PVP545 northbound bypass-side cash gate (`m4-545-northbound-bypass-gate`) — PREPARED

- Directed OSM points `[39.5547146,51.4701519]` → `[39.5546944,51.4703840]` on one-way way615270691, ordered node5818209500→toll booth5818209495→5818209499. ODbL source SHA and branch evidence: `candidate-evidence/m4-545-northbound-bypass-gate.json`.
- Source path/chord~26m; max2km; `alternative=0`; expected1 Route. DRY_RUN and tests13/13 PASS.
- Hypothesis tests selected route passage/payment-field presence for the specific bypass-side northbound branch. It cannot identify the current tariff pair or establish the320/410 accepted component for this tiny window. Keep price unknown/null.
- Conservative quota ceiling986, actual post-count unread. Stage7 series authorization exists, but the runner’s local exact-window approval gate rejected execution before network. No API request, ledger attempt, or debit; see the BLOCKED checkpoint.


## Stage 9 evidence reuse ledger — 2026-11-06

| Case | Existing status reused | This stage | New API / units | Result boundary |
|---|---|---|---:|---|
| `m4-545-northbound-bypass-gate` | PREPARED; prior `--execute` stopped before network by exact-window approval gate | Offline evidence review only | 0 / 0 | One-way south bypass gate geometry supported; tariff mapping unknown; don't edit gate timestamp |
| `m4-62-71-pilot` | Historical successful pilot summary | Not repeated | 0 / 0 | Raw full route evidence absent in checkout; no new attribution |
| `ckad-m11-m12` | `outcome_unknown`; observed owner counter delta 0 | Not retried | 0 / 0 | Unknown response persists; replay forbidden |
| `m12-western-exits` | Two saved physical exit reviews | Not replayed | 0 / 0 | Physical links known; operator crosswalk absent |
| `zsd-rvp64-exit` | One Stage 7 HTTP200 result | Not repeated | 0 / 0 | Redacted geometry near node; payment fields null/unavailable, not zero; no product inference |

## 2026-11-07 MASS continuation — preparation only
Previous11MASSattemptsremainimmutableandreserved;9observedcharges+2unreconciled,lastobservedPM976/conservative974notfreshread. NewRoutingattempts0/newdebit0. Prepared293exactwindows(289primary+4reserve),allnewapprovalsEMPTY,pendingmanifestSHAeaeccffd2a4a0e9515026f5a8e9e552fa7014f2176994caa3a317c87c6fa499f. PublicOSMsourceintakeisnotRoutingAPIquota. Do notinventconsentfromgeneralcontinueoroverwritepriorIDs;no fullcampaignCOMPLETEclaim.

## 07.11.2026 — MASS exact authorization registered, PM blocked

Owner explicitly approved immutable manifest eaeccffd2a4a0e9515026f5a8e9e552fa7014f2176994caa3a317c87c6fa499f at base6c2280e1:289newunits,293exactIDs including4replacements. 293 singleton permissions registered at actual observation time; unchanged scope/expiry validator PASS. HEAD/hash/dedup,31tests,293bodychecks and prior no-replay PASS. Opera2bounded list_tabs attempts UNAVAILABLE30s; no current PM free quota/expiry/no-paid confirmation, process key absent. Newcalls/reservations/debit0; prior11reserved/9observed/2pending unchanged. No runtime/push. See ../../2gis-mass300-evidence/CONTINUATION/EXECUTION/README.md and checkpoint2026-11-07-MASS-CONT-AUTHORIZED-PM-BLOCKED.md. Historical prepared EMPTY approvals remain as frozen baseline; current records in EXECUTION. Resume after genuine freshPM/credential verification; do not fabricate approval renewals.

## 07.11.2026 — actual MASS continuation:44attempts, stop429

## 07.11.2026 — MASS practical results saved; PARTIAL / PAUSED_HTTP_429

[Checkpoint](../../docs/checkpoints/2026-11-07-MASS-CONT-LIVE-PAUSED429.md),[results](../../2gis-mass300-evidence/CONTINUATION/EXECUTION/RESULTS_FINAL.md). New44unique attempts:43HTTP200/OK,1HTTP429,no laterRoutingcalls/retries.9systems/19attemptedobjects(18built),35source-scoped(13cross/22controls),8scope mismatches,8sameaggregatecross-controlpairs. Mininterval15.252s,maxdistance44.679km. LivePM25→37→61→65,final65/1000;935displayed/930conservative. Campaign55reserved/50observed/5unreconciled;counterdelta40thissessionnotexactper-requestattribution. CKAD13unattemptedexcludedafter40/44km detours;232primarypaused,4reservesunused,245authorizedunitsremain. Exact approval unchanged; no timestamps refreshed. Stopon429; resolve platformlimit/freshPMbeforeindependentremainingqueue; do not replayfailedID/old11/CKAD. 31tests+293bodychecks+liveauditPASS. No newworkingmodel/receipt/provenV3runtimebug,4acceptedmodelsunchanged,no runtime/tariff/push.


Full detailed append-only stage record: ../../docs/checkpoints/2026-11-07-MASS-CONT-LIVE-PAUSED429.md. Failurecause429unknown,noRetries,noAPIprobes;lastcounter65/1000,0/5minute doesnotexplainpast429. Existingclientusedunchanged;onlypreparedallowlistconfigsactivated. KeynotstoredinGit/files/archive;oneOpera-row-namefiltermissinchattooloutputrecordedindetailedreport,filtercorrected.
