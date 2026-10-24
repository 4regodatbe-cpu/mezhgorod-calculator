# DONE block3 / завершена серия ADDRESS-001 mitigation — 24.10.2026 10:27 МСК

Три небольших блока выполнены последовательно в одном ответе с отдельными durable checkpoints: диагноз/STARTED→pool implementation→endpoint regression. [План](2026-10-24-address-diagnosis-DONE-pool-STARTED.md), [код блока2/STARTED блока3](2026-10-24-address-pool-DONE-endpoint-STARTED.md). Parent479f9dc636c5330d48a9750eef8c8fca20b682c0/tree b8d38e93df059ee7a8b1617fb0bcaf61cf906094 подтверждён remotePRhead и fetch/tree до блока3. PR14open/draft, та же разрешённая рабочая ветка. На промежуточном head workflows[] из-за описанногоskipci; это неCIpass. Финальный commit безskipci запускает обычный workflow на итоговом коде.

## Проверка реального endpoint с подставленным provider

Добавлен scripts/address-search-endpoint.test.ts. Это NextRequest→POST/r→GET/api/suggest→новый coordinator/pool→fetchPhotonFeatures→детерминированный fetch mock, затем прежние rankPhotonFeatures и NextResponse. Никакого обхода production resolver в тесте. Не браузер/Android/live и не утверждение об исправлении конкретного телефона.

[sequence.json](../../experiments/road-ref-boundaries/checks/2026-10-24-address-endpoint/sequence.json):40mock upstream fetches, peak2, live0.

- Анапа→Краснодар→Ростов:каждый200, корректный город в первой строке.
- Очистка во время ПредыдущийПрефикс:только2 уже начатых fetch, остальные queued отменены. Следующий Донецк200:ДНРпервым, Ростовская областьвторой. Старый отменённый endpoint502 не перекрывает новый; UI уже игнорирует свой aborted response.
- Повтор Донецк черезGET/api/suggest:0extra fetch,200 из успешного кэша.
- Два POST/rМосква:отменённыйA502, другойB200.7 уникальных provider URLs вместо14; B не теряет shared result.
- Частичный503 в одном варианте Сочи:положительный результат200 сохранён, остальные охлаждаемые задания не создают fan-out. Новый холодный адрес и повтор во время cooldown502,0extra fetch. Уже закэшированный Донецкостаётся200.
- Короткий запрос даётitems[], oversized/malformed input400. Partial/unavailable summaries есть и не содержат query/URL/названия городов. Очередь/active fetch по завершении0.

## Ошибка первого тестового запуска, сохранена и устранена

[initial-fixture-failure.log](../../experiments/road-ref-boundaries/checks/2026-10-24-address-endpoint/initial-fixture-failure.log):ожидалось30calls, стало34 на повторном GET. Причина — mock распознавал только «Донецк», а четыре действительных bboxvariants используют «донецк». Они ошибочно отвергались fixture как неожиданные и не кэшировались. Исправлен регистр в mock lookup, productionURL/ranking/code не менялись. Assertion0extrafetch не ослаблен. Исправленныйfocused/fullgate прошёл; этотfixturefailure не скрыт и не выдан за обнаруженныйprodbug.

## Фактические финальные проверки

Evidence checks/2026-10-24-address-endpoint и verification.json сSHA256. Focused3files48/48PASS; полный node audit эквивалент test:audit864/864PASS,0fail/skip. Quote/APIcontractsPASS отдельнойкомандой. ESLint новогоtestfile exit0; source5files ESLintPASS в блоке2. Next webpack build+TypeScript exit0/static16/16. Полный gate/build для test-only финальной части повторены по обязательному правилу проекта; другойlive routecorpus вручную не запускался. Все результаты сохранены сразу в файлы. Никаких snapshotизменений/пропущенных mandatoryassertions.

## Итог причины и оставшиеся вопросы

ADDRESS-FANOUT — исправлено и проверено контрактами:наодном process нет13одновременныхfetch/дублирующегоsameURL/ненужногоqueuedprefix приотмене, есть bounded positive cache/cooldown и общий20сbudget. ADDRESS-AVAILABILITY и исходный mobile/B-only symptom — UNVERIFIED/BLOCKED_BY_EXTERNAL_EVIDENCE:не установлены состояниеPhotonсейчас, отдельныйbanIP/реальныйmobile результат. Pool уменьшает нашу нагрузку и сохраняет positives; холодныйновыйадрес приполномoutageпо-прежнему502. Между replicas лимит не глобальный. Это не SLA и не утверждение полного10сE2E.

Тарифы/roadkilometrage/матрица/backup/main/Production/Android не менялись. BlockersKM-001/002,TARIFF-001,PERF-001 остаются; модульотключается addressRequestPool:false. Следующий конкретный шаг после финальногоremote readback — проверить обычныйCI на итоговомhead с различением verify/livePhoton/skipped; при доступномисточнике отдельный короткийlive smoke либо исходныйmobile сценарий, без broad route re-audit. Если live источник недоступен, сохранять ошибку и продолжать независимые задачи. Не начинать свою карту/новые платныеAPI и не назначать неизвестныецены.

Долговечность этого блока подтверждается последующим nonforceupdate/exacttree/headreadback. Документы/state/журнал/следующие шаги обновлены вместе с test/evidence. ParentCI отсутствуетнаskiphead, новыйCI заранее не объявлять успешным.
