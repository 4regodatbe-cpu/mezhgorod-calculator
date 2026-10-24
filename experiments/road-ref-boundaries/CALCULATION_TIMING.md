# Диагностика времени V3

Включение: data/toll-feature-switches.json → calculationTiming:true. Отключение: false; clock/log/Server-Timing перестают использоваться. Ядро — lib/calculation-timing.ts; интеграция — app/api/v3/calculate/route.ts и необязательный последний аргумент calculateLeg в lib/v3-calculation/route-leg.ts. Остальные callers не затронуты. Удаление: убрать эти обёртки/аргумент и модуль/переключатель, не менять тела операций.

Server-Timing показывает calc_total и завершённые стадии в миллисекундах. Серверный calculation_timing также содержит status, handlerElapsedMs, targetMs, overTarget, calls/errors/maxMs и stops. Только фиксированные labels; адреса/координаты/URL/исключения не записываются. Не хранит запросы между обращениями. Нет новых fetch, таймеров, retries или отмены. Работа ограничена 11 фиксированными типами стадий и фактическими вызовами текущего запроса.

Параллельные/вложенные стадии пересекаются, их нельзя складывать. calc_total — время внутри POST до отправки ответа; это не время пользователя, cold start или сетевой E2E. special_options пока измеряется целиком без внутренних provider spans. Недоступные часы дают null/stop; logger failure не влияет на сумму. overTarget при неизвестных часах null. Цель10000мс — наблюдаемый порог, не жёсткий deadline и не достигнутый SLA.

Проверки и ограничения: docs/checkpoints/2026-10-24-calculation-timing-DONE.md; checks/2026-10-24-calculation-timing/verification.json. Незавершённая стадия при ответе не записывается как завершённая. Модуль не принимает решений о цене/маршруте.
