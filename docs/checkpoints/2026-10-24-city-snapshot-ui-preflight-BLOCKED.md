# UI preflight: BLOCKED_BY_ENVIRONMENT_BROWSER — 24.10.2026

Исправления ESLint сохранены и прочитаны обратно: commit `d6d902320d3b5a2b43cc7836358120acdfd0d0ad`, tree `cf1249a10a3bb594cbbc430f600573e0c38a9d0d`. PR №14 остаётся draft; активных/queued CI перед записью не было.

Локальный Playwright доступен, но Chromium по его executablePath отсутствует. Стандартные пути Chrome/Chromium также не дали исполняемого файла. Проверка интерфейса остановлена на предпосылке среды: браузер и сервер не запускались, установка/скачивание не предпринимались, новых live-запросов 0. Это не UI FAIL и не UI PASS. Evidence: `experiments/road-ref-boundaries/checks/2026-10-24-city-snapshot-ui-preflight/result.json`.

Кодовые проверки остаются отдельными результатами: 895/895 тестов, quote/API, общий ESLint 0 ошибок / 5 прежних предупреждений, webpack/TypeScript/static 16/16 PASS. Они не заменяют браузерный сценарий.

`addressCitySnapshot:false` сохранён. Следующий выполнимый UI-блок требует доступного браузера: отдельный STARTED перед запуском сервера; реальные компоненты с локальными ответами из четырёх reviewed records, очистка/отмена/замена/разворот, notice и attribution, сохранение source metadata. Перед будущей активацией отдельно проверить свежесть снимка (истекает 31.10.2026 08:24:54 UTC). Не повторять скачивания GeoNames, маршруты и прежние замеры; Production/main/Android/backup не затронуты.
