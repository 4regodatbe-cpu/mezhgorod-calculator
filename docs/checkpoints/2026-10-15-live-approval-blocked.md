# Live route blocked by automatic approval review

BLOCKED. Parentc46c9e472d7bd19a01b5d209539ef7ee44016b70 remote read-back подтверждён; PR14draft/fix-v3 рабочая ветка. Команда single-case batch Лисичанск→СПб --limit1 запущена; log содержит только START, batch содержит started row, новый live результат/capture не подтверждён.

Следующий write_stdin rejected: unacceptable risk — private repository route coordinates and related request data sent to untrusted external Valhalla; user authorized audit but not explicit disclosure to destination. Повторный вызов/другой сетевой transport не использовался. Проверены файлы; активных node audit процессов по /proc не найдено. Наличие START не означает выполненный маршрут; executionStatus blocked-before-confirmed-result, без audited status.

Нужна явная авторизация пользователя на передачу координат городов/контрольных точек Valhalla, OSRM и BRouter для live расчётов; запросить после выполнения unaffected offline части.

STARTED unaffected task: разбор существующих captures/REPORT findings офлайн, без отправки координат. Сохранять точные причины M4/A289/ЗСД, связи route/component и missing coverage; код тарифов не менять до обсуждения findings. Product source/Production без изменений.
