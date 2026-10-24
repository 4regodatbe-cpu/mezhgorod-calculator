# Пробелы и отложенные проблемы

Обновлять датированными записями; рабочая часть алгоритма продолжается независимо. Unknown не free, неподтверждённая цена не0. Закрытие требует фактического evidence.

| ID | Статус 24.10.2026 | Наблюдение / влияние | Следующий независимый шаг |
| --- | --- | --- | --- |
| KM-001 | BLOCKED_BY_DATA | У graph pair4443232947→358467208 нет проверенных официальных километров/координат output shape; нельзя назначить соседний км | Добавить reviewed anchor/section с источником в локальный реестр, модуль не блокировать |
| KM-002 | BLOCKED_BY_DATA | Полной калиброванной геометрии обходов/шкал км нет | Пополнять только нужные sections; свою дорожную сеть не строить |
| PERF-001 | UNVERIFIED | До10с всей системы — целевой ориентир; slow external routing/matching может его превышать | Отдельный bounded E2E timing после стабилизации источников; локальные замеры модуля сохранять отдельно |
| ADDRESS-001 | IN_PROGRESS | CI39997833752 и40067156518: Photon live job failed, общий success допускает ошибку; причина A/B не доказана | Offline fan-out/fallback review; не смешивать с километражем |
| TARIFF-001 | BLOCKED_BY_DATA | Scope/цены graph pair pending unknown, активных новых строк0 | Заполнить проверенный scope/источник/даты отдельно |
| DOC-001 | DEFERRED |24.10 web open OSM milestone timeout, новых данных не извлечено | При сборе реальных anchors проверить первичный источник; для локального ядра не блокер |

Исходные статусы/логи: docs/checkpoints/2026-10-24-road-ref-recovery-DONE.md и checks/2026-10-24-recovery/ci-status.json. Новые runtime стопы возвращать структурированно в диагностике расчёта; не писать синхронные сетевые/file logs в критическом пути.

## 24.10.2026 — результаты реализации

KM-001/KM-002 остаются BLOCKED_BY_DATA: локальное ядро/индекс/проекция готовы, но real pending pair по-прежнему без км.14 named groups/81 nodes добавлены из прежнего runtime inventory только как номинальные позиционные anchors; новых live данных0. Projection проверена synthetic; reviewed реальных sections0. PERF-001 остаётся UNVERIFIED для E2E10с; локальные CPU замеры — checks/2026-10-24-kilometrage/performance.json. ADDRESS-001/TARIFF-001 не переделывались этим этапом. Попытка прочитать ещё работающий job120797900591 вернула GitHub logs404 BlobNotFound; трактуется как недоступность незавершённого лога, без повтора маршрутов/отмены CI. Правки обязательных source проверок не пропускались.

## 24.10.2026 — ADDRESS-001 mitigated, availability UNVERIFIED

Избыточный7–13parallelfanout заменён boundedprocesspool/singleflight/cache/cooldown и20собщимbudget. Contractsgate54/863/buildPASS; следующийendpointregression отдельно. Реальнаядоступностьсервиса/исходныйmobileсбой/B-only причинность не подтверждены. Успешныйкэш толькоуже полученныхURL, холодныйновыйадрес приoutageпо-прежнему502. Никаких выдуманныхкоординат/новыхAPI. ДлинныйCIплан: промежуточныйcodecommit skipci приполномlocalgate, обычныйCI послеendpointблока; CIограниченияwriterсохраняются.
