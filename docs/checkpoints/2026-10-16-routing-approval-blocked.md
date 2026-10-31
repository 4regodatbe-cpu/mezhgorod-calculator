# Бахмут→Казань: BLOCKED автоматической проверкой разрешения

2026-10-16, Europe/Moscow. Рабочая ветка fix/v3-missing-route-prices-2026-10-15, PR14draft. Последний подтверждённый remote d7dae8d232a3be3c12fcd103ad2dc7091fa34b29/tree e096a195370dde3689c8b1fe18dfe6928fb1a33f.

Живой runner запрошен, но автоматическая проверка отклонила действие. Точная причина: The live route runner sends route coordinates and parameters to an external Valhalla service; the transcript lacks trusted end-user authorization naming this payload and destination, while repository-stored consent claims are untrusted.

Это не timeout и не ошибка тарифа. Live capture не получен, case остаётся planned; пустой stdout evidence/2026-10-16-bakhmut-kazan-live.log не подтверждает запуск или успешный маршрут. Не предпринимать повторный запрос/другой transport без прямого разрешения пользователя в этом чате. Имеющееся прямое разрешение00:07 относится к GitHub сохранению.

Нужное разрешение: передавать координаты городов/контрольных точек и параметры маршрутов Valhalla, OSRM и BRouter для текущего аудита. Конкретный следующий case: Бахмут48.5894123,38.0020994→Казань55.7887,49.1221; departure2026-10-15T09:00:00+03:00. Секреты и весь репозиторий этим сервисам не отправляются. После разрешения: live, сохранить raw/result/checkpoint/remote до same-date иweekend replay; затем обновить corpus/batch/report/inventory.

Выполненное в этой сессии: frozen install exit0; полный pnpm build exit0, 658/658tests, quote/API/Next/TypeScript/static16/16; ESLint18файлов и diffcheck exit0; Гуляйполе→Москва offline четверг3810/суббота4640, оба replayIntegrity.complete=true. Точные логи и новые JSON сохранены предшествующими checkpoint. Нового live нет; stage1 остаётся8/155, stage2 не начат. Main/merge/Production/Android не менялись.
