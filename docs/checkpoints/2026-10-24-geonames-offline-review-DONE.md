# DONE C offline review — 24.10.2026 МСК

Durable C STARTED e6578e87b98729bb467f37a1c1dbc3ccecc769bf/tree912f3fcbc45ab045d2db89659ccdef9d61a7a45d, разрешённая fix branch/PR14 draft. После readback выполнен bounded offline анализ уже сохранённого ZIP, без новой сети/маршрутов/API.

Результаты/код воспроизведения: experiments/road-ref-boundaries/checks/2026-10-24-geonames-review/{README.md,review.py,classify.mjs,result.json,selected-records.json,progress.json}. 458879строк;237006P;0invalid/duplicateIDs. Все237006точек прочитаны изsource country records и классифицированы существующим production classifier на4полигонах/exactSHA. ДНР1803;ЛНР1376(1RU+1375UA);Запорожская1266;Херсонская985;outside231576;boundaryexceptions0. Это data presence, НЕ полнота/точность. Крым coverageUNKNOWN (полигон отсутствует в4-regiondataset).

8имен/93реальныхкандидата: Москва3,Краснодар2,Донецк2,Луганск2,Ялта5,Севастополь3,Тарасовка75(2ДНР),Черноморское1. Сохранены все id/admin/raw19fields/line/hash, country provenance. Не выбиратьfirst, не сливатьомонимы.93matches из untypedaliases, V2/history/ru непроверены. Admincodes не готовые русские labels. ClassP включает abandoned/historical/sections: не объявлять237006современными пригодными дляruntime поселениями.

Проверки фактически: standalone parser selftest malformed/nonfinite/range/homonym PASS; offline dataset5.789с/P-count237006; sum/classificationconservation PASS;93rawrowSHA/fields/runtimeEligiblefalse PASS; git diff --check. Калькулятор app/lib/data/switches не менялся, широкие старые codegates не повторены; CI40091639551доэтого verifyPASS,addressFAIL,50/YandexSKIP. Python/Node scripts — только reproducible offline evidence, не production module.

Итог: SOURCE_DELIVERY_FIXED для CI-сети; SNAPSHOT_CANDIDATE_REVIEWED_STRUCTURALLY / RUNTIME_BLOCKED_BY_VALIDATION. Нет независимой точности координат/языковой маркировки/полноты/готовыхadminlabels; no runtime activation. Raw archives artifact14дней/scratch; постоянные93selectedrows/manifest вrepo, не утверждать долгосрочное сохранениевсегоZIP.

NEXT: короткий offline intake-policy review на сохранённых93records (актуальныеfeaturecodes/обязательныеlabels/неоднозначность) и отдельноboundedindependent source для конкретныхpriority IDs/русскихназваний. Не перезапускатьC/downloads/PhotonCI/routeperf. Production/main/Android/backup не трогать. Данный docs/evidence commit [skip ci], чтобы не повторитьсетевойкорпус; точный tree/readback послеconnector обязателен.
