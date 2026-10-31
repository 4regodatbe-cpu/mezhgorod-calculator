# RC1 — реальная локальная HTTP-приёмка STARTED

Source 21cae380f5d977b75aa587e7102ceb367af4c959. App/lib/data/Next config/lockfile побайтово соответствуют проверенной I3 сборке 2750861c; новый runtime не подменяется старым. Уже собранный Next16.3.4 запущен локально на 127.0.0.1:3026; второй local test process 3027 использует explicit GeoNames local test flags и preload deny-photon.mjs. Нет Vercel env changes/Production activation. Skills verification/env-vars применяются для проверки границ и локальной конфигурации, без чтения секретов/env pull.

План api-flow.mjs: 11 реальных POST /r по городам, два SSR GET V3/V2, некорректный тариф→400, **один** live POST V3 Краснодар→Анапа с координатами из настоящего GeoNames ответа, caller bound45s. Photon outage контролируемый на границе fetch в local test process: никакие адресные/маршрутные JSON responses не подменяются. Счётчик попыток доказывает отсутствие лишнего Photon I/O у городов; маршрутизаторы для одного расчёта реальные. Исторические данные/внешние цены не пересматриваются.

Browser preflight: /usr/lib/chromium/chrome-sandbox mode4755, owner UID65534, не root. Это сохранённая причина SUID helper failure; защиту/владельца/права не меняем и повторный такой же запуск не делаем. Mobile interaction PENDING/BLOCKED_ENVIRONMENT, SSR не выдавать за браузер. Продолжать независимую HTTP/replay/SSR приёмку, не завершать весь цикл.

Логи и ответы пишутся по мере работы в experiments/release-candidate-1/2026-10-31/checks/. При ошибке сохранить первую сломанную границу, не объявлять PASS и не делать необоснованный повтор. Next — сохранённые relevant replay/price-view checks и устранение доказанного дефекта либо честный release report. Только локальное сохранение, нет push/CI/Production/массового аудита.
