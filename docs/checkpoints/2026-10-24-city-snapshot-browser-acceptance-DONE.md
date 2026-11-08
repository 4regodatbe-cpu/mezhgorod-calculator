# DONE — исполнимый browser acceptance checklist, 24.10.2026 МСК

Parent d22205e95ed797336d3525b628192e46769d3638, tree ce123f01b418a91c33ed0c5e175c50beaf6e7406; SSR save/readback PASS. Документационный блок после сохранения тестов.

В ADDRESS_CITY_SNAPSHOT.md добавлены 8 конкретных сценариев браузерной приёмки: два Донецка без auto-select, выбор в A/B, swap, clear/replace, late response/cancel, ordinary/empty/502, no legacy fallback cache, узкий экран/клавиатура. Описаны локальные mock /r exact snapshot, network isolation, evidence и границы SSR/endpoint/browser/реального E2E. Флаг остаётся false. Это план, сценарии ещё NOT_RUN; браузерный blocker не устранён.

Проверки: git diff --check, существование указанных evidence/data/code paths и false-флаг. Только docs: full898/build повторно не запускались. Actual checks относятся к предыдущему кодовому checkpoint, не к browser E2E. Срок снимка сохранён (31.10.2026 11:24:54 МСК); без нового capture/review не продлевать.

Следующий шаг требует изменившейся предпосылки: доступный браузер, затем STARTED и этот checklist с per-scenario evidence. GeoNames labels/coords, unknown toll pair и km остаются самостоятельными DATA_BLOCKED; прежние скачивания/маршруты/запросы не повторять без нового источника. Production/main/Android/backup не менялись, PR14 draft.
