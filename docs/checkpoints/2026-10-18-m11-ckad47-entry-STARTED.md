# STARTED — точный въезд ЦКАД47→М11 вместо рамок ММК50

МСК 2026-10-18T12:07:52.076798+03:00; source `ca58a6ebd603aec149103a3e1c2e3f3fa5f392ec`, PR14 draft, ветка `fix/v3-missing-route-prices-2026-10-15`. Последний code CI39101746826 completed/success, локальный tracked index чист до начала. Автоматизации не создаются по решению пользователя; продолжение вручную.

Из старого собственного capture (SHA `e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0`) выделен ранее не привязанный конкретный въезд: toll_booth8087316065 наway954011576, далее954011577→791520973→1270188032 (первый именованный paidМ11). Точные выбранные рёбра/ноды/shapeindices сохранены в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/candidate.json`. Гипотеза — отдельный ЦКАД47/ПВП18, а не ММК50/ПВП6Б2. Официальная сохранённая тарифная таблица различает `tskad` и `mmk_a107`; одинаковое название дороги не разрешает подмену пары.

Предыдущие8case reviews/41mainlinecases не повторяются. Новая причина source pass — конкретный иной gate/way из уже сохранённого trace. Сам capture/replay не меняется.

## Остаток текущего блока

1. До3 новых exactprimaryGET: node8087316065, firstM11way1270188032/full и локальная карта вокруг полученной точной координаты. Каждый20с/12MB, search/routing/trace/replay0; raw/metadata/hash после каждого.
2. Прочитать только релевантную сохранённую operator PDF страницу5 и связность направленных ways. Установить достаточность физической/операторской привязки; если пробел остаётся, не назначать цену.
3. Один DONE/BLOCKED checkpoint с точными проверками, сохранением source proof и next step. Runtime — отдельный блок только при доказательстве, с focused/full gates.

Входы/ограничения/условия повтора в `experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/inputs.json`. До сети STARTED commit/tree/path/head readback. При остановке повторять только незавершённые части; готовыеGET не повторять. Full tests/build не запускались: source/preparation only. Merge/main/Production/Android не разрешены.
