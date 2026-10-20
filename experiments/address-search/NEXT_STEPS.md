# Address-search next steps

## Выполнено — 20.10.2026

Исправление опубликовано по прямому запросу пользователя: Production `dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP`, application source `4b647bfe01c903352f3842072ceafb23ea6d10a2`. Оба основных alias подтверждены. Build810/810 PASS, Next static16/16; GET /api/suggest для «Ростов», «Красн», «Моск», «Краснодар» дал HTTP200 и20 результатов. /v2 сохранена как старый алгоритм. PR14 draft, без merge/main.

## Следующий шаг при повторном сбое

Проверить точный полный ввод B и время попытки по live POST /r; GET API не заменяет UI проверку. UI A→B и live POST в выпуске не проверены. Не менять ranking или тарифы без воспроизведения. Shared browser cache ускоряет повтор того же запроса, первый запрос зависит от Photon.
