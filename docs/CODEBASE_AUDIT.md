# Технический аудит репозитория «Из А в Б»

Статус: IN_PROGRESS; новый план — 18 блоков. Источник: удалённая ветка `fix/v3-missing-route-prices-2026-10-15`; исходный SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Только анализ документов/кода и сохранённых тестов: рабочая бизнес-логика, цены и настройки не изменялись. Процент относится только к этому аудиту.

## План и прогресс

18 блоков: 1 архитектура; 2 адресный поиск; 3 кэш/очередь/отмена; 4 API inputs/call graph; 5 провайдеры; 6 candidate selection/fastest; 7 V2/V3 и сохранённые Eisk/Maykop evidence; 8 геометрия/границы без повтора аудита дорог; 9 тарифная композиция; 10 V2 UI; 11 V3 UI; 12 API ответы/ошибки; 13 безопасность; 14 производительность; 15 зависимости/build; 16 тесты; 17 CI; 18 документация/data governance/синтез.

Завершено 6/18 (33.3%). Условия, evidence и ограничения — в dated checkpoints B1–B6 под `docs/checkpoints/`; последний: [B6](checkpoints/2026-10-26-2134-codebase-audit-block-06-DONE.md). Массовые аудиты, live-сеть, браузер, build и тесты не запускались.

## Предварительная оценка

Проверенные области демонстрируют bounded address suggestion pool и таймауты route adapters. Существенного подтверждённого P0/P1 пока нет. Основные кандидаты — отсутствие deadline в прямом geocode path и неполное совпадение явных геометрических проверок V2/V3; оба требуют дальнейшей проверки и точечного regression, но текущий аудит read-only.

## Находки

### P2 — вероятный риск надёжности

**AUD-GEOCODE-01 — direct label geocoding не имеет локального timeout.** В `lib/route-providers.ts` функция `geocode` при отсутствии позиции делает Photon fetch без AbortSignal; V2/V3 calculate handlers разрешают label-only point и вызывают geocode параллельно. Route adapters задают 25s deadline, отдельный suggestion service ограничен отдельно, но этот путь его не использует. Долгая задержка/отказ не воспроизводились. Возможное следствие — удержание API-расчёта до platform/request timeout. Рекомендация: ограничить direct adapter и добавить abort regression без изменения ranking. Низкий–средний риск, польза — предсказуемые ресурсы; отдельный модуль.

**AUD-API-01 — calculate API не задаёт явный app-level лимит тела запроса/длины point label.** Статическое подтверждение описано в [B4](checkpoints/2026-10-26-2112-codebase-audit-block-04-DONE.md). Платформенный body cap/эксплуатация не проверялись, поэтому это вероятный ресурсный риск, не установленная уязвимость. Изолировать через общий API validator; низкий–средний риск.

**AUD-PROVIDER-01 — нет явного app-level byte cap для JSON provider responses.** Три routing adapters используют abort/revalidation, но парсят response.json() напрямую. Нет доказательства, что upstream может превысить допустимый размер или что платформа не ограничивает его. Риск не доказан; сначала установить реальные лимиты среды/контрактов, затем при необходимости ограничить чтение.

**AUD-TEST-01 — V2 не имеет явно установленного regression для невалидной геометрии в исследованном наборе тестов.** V3 содержит `isUsableRoute` и regression «incomplete geometry never becomes a straight line priced as a real road» (`scripts/v3-route-selection-audit.test.ts`). В V2 такой явный gate не найден в просмотренных тестовых именах/файлах, хотя публичные API пути передают контрольные позиции. Это покрытие/defense-in-depth gap, не доказанный runtime-дефект. Добавить узкий V2 test на пустую geometry и некорректные meters/seconds/endpoints; не менять правила выбора маршрута без подтверждённого падения. Низкий риск теста, средний guard-риск, отдельный модуль.

## Проверка предварительного P1-кандидата

Изначальное предположение, что пустая geometry V2 доходит до тарификации, **не подтверждено и снято**. Текущие публичные V2 обычный и special paths передают routing controls в `followsPlan`; helper ищет последовательный проход каждой позиции и возвращает false, если координат нет. Значит, пустой массив отклоняется до формирования/выбора routeCandidates на этих call paths. V2 действительно не вызывает V3 `isUsableRoute`, но из одного этого различия нельзя выводить ошибочную цену. Проверка статическая; V2 regression не запускался/не добавлялся.

## Проверено и непроверено

B1–B6 выполнены по текущим remote blobs; провайдеры не вызывались. Исторические Eisk/Maykop captures пока не повторялись. Остались B7–B18: V2/V3 saved-evidence comparison, toll geometry, tariff composition, UI, API outputs, security, performance, dependencies/build, tests, CI and governance. Ни один тест/build не запускался; runtime/P0–P1 assessment не завершён.

## Следующий шаг

B7: проверить только уже сохранённые V2/V3 captures/results по Ейск—Москва и Майкоп—Москва, не запускать новый capture и не менять тарифы. Затем checkpoint/readback.
