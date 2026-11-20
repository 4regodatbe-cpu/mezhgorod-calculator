# DONE — сверка текущих статусов GeoNames, 24.10.2026 МСК

Parent 3471ba98ccb4174ba50e061cb9c3df9349aa163b / tree eecd088d2ad79b875af6c2d8c88b15dfdfaa53a1, разрешённая ветка, PR14 draft, CI completed. Короткая сверка документов без новых данных/запросов/тестов.

Причина: SETTLEMENT_PILOT_ACCEPTANCE.md продолжал утверждать DNS-blocked/NOT_STARTED, SETTLEMENT_FALLBACK_INTEGRATION.md — B/C не начинались и отсутствие любого fallback. Это противоречило сохранённым DONE и провоцировало повтор выполненного. Исправлены текущие статусы с exact ссылками на offline C, language join и label remainder; исходный проектный контракт помечен историческим. Разделены GeoNames DESIGN_ONLY/DATA_BLOCKED и implemented/disabled 4-city Photon snapshot. Новых доказательств покрытия/координат не заявляется.

Документированы 237006 P/93 candidates/92 ru city/19 collision groups и прежние ограничения. Country alias10field schema уже получена; не требуется глобальный V2. Проверены ссылки существованием файлов, diff whitespace. Код/данные/флаги не менялись; повторный full gate и live не запускались. Исторические checkpoint/raw не правились.

Следующий блок после save/readback: сократить docs/WORK_STATE.md и road-ref NEXT_STEPS до текущей точки, сохранив исходные байты в истории и ссылки на старые записи. Не превращать блокеры в новые бесконечные SSR/docs-тесты.
