# STARTED — поиск после нескольких замен адреса, 20.10.2026

Пользователь воспроизвёл: Анапа→Краснодар620; очистить B→Ростов-на-Дону, расчёт верный; очистить A→Донецк — недоступность поиска и повторные отказы кнопкиПовторить. Раньше произвольные повторные замены работали. Source/PRhead bc2f2599252dca5170749f0314cf5b99f2c92be7, PR14draft. Production dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP / source4b647bfe; новая routingправка ДЗОК0f568c57 в Preview.

Одна строка поиска UI→POST /r→GET handler→несколько параллельных Photon URLs→rank→UI. Нужна проверка фактической последовательности через браузер, а не толькоGET API. Первые два ввода Анапа/Краснодар в публичном основном /v3 через cloud browser дали подсказки; первый расчёт запущен. В UI request state не выявлена поле-специфичная ветка; useEffect depends on Place, clears position on edit. Проверить provider fan-out, stale request/cancellation, повтор после ошибки. До доказательства не объявлять причиной лимит или ошибку поля.

Остаток: 1)bounded browser sequence+console and provider request counts; 2)исправить первый подтверждённый broken boundary, тесты repeated clear/type/retry и resource load; 3)focused/fullgate, сохранить evidence/state/remote tree, Preview. Не повторять тарифный аудит и live route captures. Новый Production выпуск без прямого запроса не делать.
