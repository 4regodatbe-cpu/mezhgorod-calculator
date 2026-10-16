# Калькулятор «Из А в Б»: часть19

16.10.2026. Только fix/v3-missing-route-prices-2026-10-15, PR14 draft. Verified parent29239dcce31ea961893833411f10f3a452dde6e7/tree7876ad39. Actualworkflow38869309675/job116869376746 SUCCESS, noactivewriter (latestGitHubcheck). AUTO_QUEUE_STATE still records completedpolicyclass, not a new activewriter; do not rerun that completedclass.

## DONE

Части1–18:155/155+154/154, frozenREPORT340/340.19A/19B A289:57helper-only+2whole-routecases, не59полныхтарифов.19Cpolicy25/25DONE:20wholeofflinequotes/5unknownZSD.

19D m4:unpriced9/22 replaychecked:
- **4wholeofflinequotes recovered**: Лисичанск/Рубежное/Бахмут/Краматорск→Москва, каждый1830/2300₽15/17окт09:00МСК, unconfirmed estimate. [Лисичанск](checkpoints/2026-10-16-part19d-lisichansk-moscow-recovered.md), [case4](checkpoints/2026-10-16-part19d-case4-replay.md), [case5](checkpoints/2026-10-16-part19d-case5-replay.md), [case6](checkpoints/2026-10-16-part19d-case6-replay.md).
- Fix4811a106: compilercombined416+460 northbound atomicorder;36ключейперенесены/безновыхцен. Не36готовыхмаршрутов. Rawsourcechainsнепереписаны.
- **1M4component recovered** case8 Воронеж→Приморский:1830/2300, но wholeunknown ZSD+unmappedbooth; не выдаватьsubtotalзаитог. [Разбор](checkpoints/2026-10-16-part19d-case8-component-recovered.md).
- **3source-gated unknown** Гранитное/Широкино/Гуляйполе→Казань: same2selectedpaidways≈1.966km/0booths/0knownPVP; exactcollection/freeproof отсутствует, operator403необходили. [Диагноз](checkpoints/2026-10-16-part19d-gulyaypole-kazan-source-hold.md).
- **Case9 currentunknown** Тамань→Воронеж OSRM1026560m: endpoints1223→545resolved, exactdatedphysical545pairabsent. Semantic545-a/b have differentexistingfinishedfares, physical545alone insufficient. A289800/DZOK410known, неитог. [Checkpoint/evidence](checkpoints/2026-10-16-part19d-case9-545-scope-diagnosis.md).

Fullgate687/687+quote/API/Nextwebpack/TypeScript/static16/16 PASS; focused26/26PASS. Ordinaryeslintcompilerexit1(existingrequire), затемCJS-onlyexplicitruleexceptionexit0; [запись](checkpoints/2026-10-16-part19d-compound-lint-recovery-done.md). Преждевременная записьlintPASS явноисправлена/историясохранена.

## NEXT STARTED автоматически

**Same case9 pair-m4-a289-taman-to-voronezh**: selectedcapture2026-10-16T00-10-53-930Z-capture.json.gz вsystemicruns. Точечно прочитатьselectedpaid-edge/geometry вокругПВП545 и northboundexit→Voronezh. Независимо установить545-a/b collection/traversalscope передготовойdirectmatrixcell; не alias545→a/b/min/max/legacysum. Еслинеустановлено, сохранятьunknown. Отдельныйcheckpoint/log/queue/plan/state+commit/GitHub/head/exacttree доисправления/case10. Cases10–22 ещёнепровереныcurrentengine; regional corpus.json и control road-cases.json — дваиндекса, не искатьcontrolтольковregional.

Часть19 IN PROGRESS,20 PLANNED; прочиеfindingclasses неполностьюразобраны. Одинwriter; active/queuedjob→неписатьвветку. TIME_LIMITвозобновляем. Raw/live/baseline/historyсохранять. Replay≠freshlive/подтверждённыйтариф. Unknown≠0,subtotal≠итог, wholetripпоотправлению, междорожныевекторыотложены. No main/merge/Production/Android/messages. Автопродолжение включено, неотключатьпокавсе20незавершены.

[Protocol](CHECKPOINT_PROTOCOL.md) · [Plan](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json) · [Queue](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json) · [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md) · [NEXT](../experiments/nationwide-tolls/NEXT_STEPS.md).
