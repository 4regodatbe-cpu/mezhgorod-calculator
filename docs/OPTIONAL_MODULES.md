# Независимые модули алгоритма

Решение пользователя24.10.2026: новые возможности разделять на небольшие подключаемые модули, чтобы включение/отключение не требовало переписывания алгоритма. Реестр здесь описывает фактически внедрённые точки подключения; существующие движки не объявлять автоматически модульными.

Новый модуль должен иметь отдельные код/данные/тесты, явный переключатель, ограничение локальной работы, structured результат и причину остановки. Внешние запросы не добавлять ради необязательного обогащения. При нехватке данных/независимой ошибке записать проблему и продолжить другие части. Ошибка обязательного gate или неверная цена не превращаются в PASS: отключить новую возможность или исправить, сохранив fail-closed.

Цель времени полного расчёта — стараться до10с. Она не является уже достигнутым SLA; измерять полный запрос отдельно от CPU одного модуля. Не обрывать обязательные проверки с выдачей частичной суммы как полной.

| Модуль | Состояние | Включение / удаление | Контракт |
| --- | --- | --- | --- |
| addressCitySnapshot | IMPLEMENTED/DISABLED; full895/buildPASS; whole-repo ESLintPASS0errors/5warnings, UIpending | data/toll-feature-switches.json → addressCitySnapshot:false; одна unavailable-ветка /api/suggest | локальные4 citySuggestion/7dayexpiry/sourceSHA, fulloutage-only/cancel/sharedbudget/limitedcoverage+OSMcredit; ADDRESS_CITY_SNAPSHOT.md |
| calculationTiming | DONE, local880tests/buildPASS; E2E UNVERIFIED | data/toll-feature-switches.json → calculationTiming:false | фиксированные стадии включая special_options, Server-Timing/structured logs, без новой сети/смены цены; CALCULATION_TIMING.md |
| addressRequestPool | DONE, local864tests/buildPASS + endpoint/r regression | data/toll-feature-switches.json → addressRequestPool:false | queue/cache/singleflight/cooldown; collectAddressFeatures сохраняет прежние варианты/ranking и20с общий budget |
| roadKilometrage | DONE, локальные851tests/buildPASS | data/toll-feature-switches.json → roadKilometrage:false; один вызов optionalRoadKilometrage в m4-production.ts | m4PvpPreview.roadKilometrage; unknown/stop вместо ошибки основного расчёта; тарифы/выбор маршрута не меняет |

Пробелы/стопы: experiments/road-ref-boundaries/BLOCKERS.md. Последовательный план: docs/checkpoints/2026-10-24-road-kilometrage-STARTED.md. Production/main/merge не разрешены.

Подключение, удаление, схема данных и фактическое покрытие: experiments/road-ref-boundaries/KILOMETRAGE.md. Правило на будущие задачи сохранено в AGENTS.md; существующие движки целиком не переписывались.

Address module: experiments/road-ref-boundaries/ADDRESS_REQUEST_POOL.md. Лимит2 относится к одному тёплому process, не ко всем replicas.
