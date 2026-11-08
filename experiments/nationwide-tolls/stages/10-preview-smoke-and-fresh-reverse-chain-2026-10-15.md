# Этап 10 — exact Preview smoke и свежая обратная длинная цепочка, 2026-10-15

## Задача

Продолжить после внедрения одобренных пользователем 94 ₽ для М-11 679–684: подтвердить опубликованный Preview по точному SHA и запустить свежую длинную цепочку в обратном направлении. Не приравнивать проверку отдельного тарифа к готовности полного маршрута.

## Preview

GitHub PR #14 остаётся open, draft и mergeable. Head `b555be97c722b9eadc74780986edb783789e6c41` (`docs: refresh M11 tail CI handoff`). Vercel deployment `dpl_BW9c2DCBJLP1KXx7MHvLhhepFWnD` помечен READY, содержит метаданные точного SHA `b555be97c722b9eadc74780986edb783789e6c41` и ветки задачи.

Deployment Protection отклонил обычный `curl` ответом HTTP 302 с сообщением об Authentication. Повторная проверка через подключённый авторизованный Vercel fetcher прошла: `/api/version` HTTP 200, тело сообщает commit `b555be97c722b9eadc74780986edb783789e6c41`, environment `preview`; `/v3` HTTP 200 и HTML калькулятора. Секреты обхода не менялись и не сохранялись.

## Свежая геометрия: Санкт-Петербург → Краснодар через Москву

Сохранён live OSRM capture от `2026-10-15T04:35:19.248Z` UTC в `source-snapshots/long-chain-2026-10-15/spb-krasnodar-moscow-2026-10-15T04-35-19-248Z/`. Длина выбранной трассы 2,051,990 м; ожидаемые M-11 и M-4 найдены, но `traceComplete=false`. Отдельный `m11-679-684` компонент имеет amount/weekday/weekend **94 ₽**, с причиной `user_approved_m11_tail_94_rub_for_both_directions`. Другие оценённые компоненты: M-4 5040/5040/6090 ₽, M-11 head 1130/1130/1650 ₽, M-11 mainline 3900/3900/4200 ₽. Они не публикуются как итог этого маршрута.

Полный результат остаётся `unknown`/amount `null`: audit missing `zsd` (`zsd_complete_selected_trace_missing`) и `unknown-paid-road` (`selected_route_payment_trace_incomplete`). Это и есть текущая локализация сбоя, а не основание начислить только известный subtotal. Обратный прогон подтверждает решение по М-11, но не прошёл приёмку полной цепочки.

SHA-256 `live.json`: `91ac8de87dc564a56d2bb644bcf41246cdd2522e5c2be524323caef1db096c1b`. SHA-256 `capture.json.gz`: `22c1363f19e3d681989aa5d893c979f6a1520ac55204c166343d76b3c8b88000`.

## CI и следующий шаг

На последней проверке Actions `38682163789` для exact PR tip `b555be9` и `38681974174` для runtime commit `0198598` ещё `in_progress`; исход кодового SHA локально проверен ранее `pnpm build` (645/645 audit, quote/API, TS/Next, static16/16), но hosted CI нельзя объявлять успешным до завершения workflow.

Следующий крупный блок — исследовать ZSD continuation beyond zone1 и неизвестное событие `unknown-paid-road`: выбранная трасса, точные операционные gates/zones, полнота trace и готовая цена должны быть связаны независимо. Fail-closed поведение полного итога оставить. Решение 94 ₽ по М-11 закрыто. Merge, Production и Android не выполнялись.
