# V3 Release Candidate 1 — сводный результат

31.10.2026, локальная линия `fix/v3-missing-route-prices-2026-10-15`. Начальный HEAD `dbc701fb9560c7b6b3a4e0299734f365c88df4aa`; проверенные исходники `719d344b4de08953ba1e4af2db462a491723a327`. I1–I3/история/bundles сохранены. Runtime app/lib/data/CI/матрица не изменены в этом цикле. Remote read-only: `c0e76eccfda0bf4fd8eeb5ac299c6da1242baa57`, PR №14 OPEN/Draft. **Нового push и Production изменений нет.**

## Решение

**READY FOR CONTROLLED PREVIEW PUBLICATION**, при отдельном разрешении владельца и свежем preflight. **NOT APPROVED FOR PRODUCTION**: текущий полный desktop/mobile путь ещё не подтверждён браузером; GeoNames и оценочный модуль намеренно защищены от Production-включения. Это недостающая приёмка/разрешение, не доказательство дефекта маршрутизации и не основание обходить защиту.

Законченный минимальный сценарий: два населённых пункта, выбор подтверждённых координат, один самый быстрый допустимый маршрут, расстояние/время и тарифы трансфера; A/B можно менять и рассчитывать заново. Улица необязательна, дома не требуются. V2 сохраняется. Платные дороги: точный полный результат либо явно ориентировочная полная оценка, либо unknown/null с отдельно обозначенной известной частью. Ни неполная сумма, ни ноль не подменяют неизвестный полный итог.

## Что действительно проверено

| Пользовательский результат | Доказательство | Граница подтверждения |
| --- | --- | --- |
| Городской поиск при отказе Photon | 11 реальных HTTP POST /r →200, реальный GeoNames, 0 попыток Photon при local controlled outage | Реальные приложение/корпус/API; отказ Photon контролируемый, не удалённый outage в Vercel |
| ДНР/Ростовская область, Волноваха, Крым/ЛНР/Мариуполь | Реальные ответы api-flow.json: раздельные Донецки, приоритет ДНР и явного региона, валидные позиции | Проверенные запросы, не весь корпус и не гарантия всех населённых пунктов |
| Полный обычный расчёт | Один реальный V3 HTTP Краснодар→Анапа:200, 166347м/8713с/2280.669мс | Реальные routing services, не browser end-to-end; 2.28с не SLA |
| Тарифы трансфера | Реальная таблица: стандарт4159, комфорт4990, комфорт+5822, минивэн8317 ₽ при25/30/35/50₽/км | Фактический ответ; стоимость платной дороги отдельно620₽/priced, не новая независимая сертификация |
| Самый быстрый допустимый маршрут/failover | Current targeted V3 route-selection tests PASS | Контролируемые provider inputs; правила не изменены ради скорости/совпадения цен |
| Реверс, двойная тарификация, Крым | Current policy/actual-handler contracts PASS: обратные controls, Crimea ordinary/new territories dual, standard/dual API | Offline/контролируемые провайдеры, не второй live route |
| Подтверждённые/оценочные/неизвестные дороги | Current actual React SSR и API contracts PASS; known part не полный итог, ON/OFF и Production deny сохранены | SSR/контролируемые data, не живой mobile render |
| Очистка/повтор, отмена и защита от старого ответа | Current hook reset/unmount/race/copy tests PASS; исторический real city browser1280/390 PASS | Четыре input source files равны 3b08ca23, но новый полный mobile journey не выполнен |
| Старый V2 и атрибуция | HTTP SSR V2/V3→200, GeoNames attribution в V3 | Не новый полный расчёт старого V2 |
| Валидация ввода | Некорректный тариф→400 до маршрутизации, response/unknown-null guards PASS | Без изменения пользовательских тарифов и toll matrix |

Полные raw HTTP responses, даты, source SHA и server timings: [api-flow](../experiments/release-candidate-1/2026-10-31/checks/api-flow.json), [единственный live route](../experiments/release-candidate-1/2026-10-31/checks/live-krasnodar-anapa.json). Исторический exact Donetsk→Moscow replay —12 responses/0misses/0network/EXACT body+requests — использован из сохранённых результатов, не перезапущен и не назван новым live.

## Исправления и качество

Создан [PRODUCT_DELIVERY_ADDENDUM](PRODUCT_DELIVERY_ADDENDUM.md), ссылки из AGENTS/WORKFLOW_RULES. Все десять правил поставки действуют без удаления старой истории и без отмены safety/CI/no-push. Создан воспроизводимый localhost API приёмочный скрипт с реальным корпусом и ограниченной fault injection; сохранены I1 snapshot и I3 CI trigger fixes.

**Новых подтверждённых P0/P1 в проверенных сценариях не выявлено; runtime-исправлений в этом цикле 0.** Это не заявление об отсутствии любых ошибок во всём проекте. Код не менялся ради формального числа исправлений. Открытые границы не скрыты:

- Current full desktop/mobile browser acceptance — **BLOCKED_ENVIRONMENT / NOT_VERIFIED**, не исправленный дефект и не PASS. В текущем namespace Chromium helper UID65534; root mapping не соответствует требованиям Chrome. Sandbox/права не менялись. Единственная попытка Opera Browser Connector к существующему Preview — UNAVAILABLE30s; страница/доступ не подтверждены, действие могло выполниться, повтор не делался. Share не создавался, Protection не отключалась. [Browser evidence](../experiments/release-candidate-1/2026-10-31/checks/browser-evidence.json).
- Новый SHA Actions/Preview — **NOT_RUN**, потому что push запрещён. Старое deployment не выдано за новую приёмку. Обязательный реальный mobile проход с расчётом нужен до Production signoff.
- GeoNames/optional toll overlay — разрешены только согласно текущим local/Preview gates. Для публичного выпуска нужна отдельная согласованная Production-политика и проверка активации; текущая задача не разрешает отключить deny или изменить Vercel Production env. Свободный поиск при Photon outage доказан для opt-in, **не для нынешнего Production с gate OFF**.

## Что допустимо отложить после выпуска

| Ограничение | Приоритет/решение | Условие безопасного отложения |
| --- | --- | --- |
| Photon503 в необязательном уличном поиске | P2 при доступном независимом GeoNames для городов | Честная ошибка/повтор/безопасный вариант населённого пункта; не обещать полную уличную доступность |
| Исключённые неподтверждённые GeoNames записи/неполные homonyms | P2, данные не расширять вслепую | Partial/область покрытия обозначены, отсутствующие координаты не выдумываются; не гарантия всего корпуса |
| Неизвестные платные компоненты | P2 data limitation при честном unknown/null | Не выдавать subtotal за полный итог, не назначать тариф из остатка Яндекса/соседнего участка |
| Оценки отдельных длинных маршрутов | P2 optional | Модуль OFF по умолчанию, явно estimated и ограничения применимости; не менять strict transfer/route choice |
| Время внешних route/trace сервисов | P2 наблюдение | Бюджеты/отмена/ошибка сохраняются; один2.28с контроль не10с SLA |
| Семь lint warnings / preferredRegion deprecation | P3 технический долг | Нет lint errors/build errors; отдельное изменение после поставки |

Если ограничение перестаёт быть безопасным и ломает основной сценарий, оно переоценивается в P0/P1 и блокирует выпуск — не считается автоматически принятым.

## Финальные gates

На Node24.19.0 / Next16.3.4: 52 targeted PASS; полный offline gate **1063 PASS/0FAIL/1SKIP**, quote/API contracts PASS; TypeScript `--noEmit`, ESLint (0errors/7warnings), direct Next webpack production build — exit0. TypeScript выполнялся после build, не параллельно с .next/types. Новых массовых live-аудитов/перепроверки corpus/operator/Yandex нет. [Machine summary / полные логи](../experiments/release-candidate-1/2026-10-31/checks/RESULTS.json).

## Единственное необходимое решение владельца

Разрешить отдельно **контролируемую публикацию рабочей ветки с существующими обязательными CI и авторизованной актуальной Preview/browser-приёмкой desktop/mobile**. Перед записью снова проверить remote/ancestry/CI, без force и перезаписи изменений. Нужна работающая разрешённая браузерная среда; если используются GitHub-hosted реальные сценарии, их узкий запуск согласовывается отдельно, без автоматического широкого аудита. Не требуется выдавать пароли/токены в чат или ослаблять Protection.

Production/main/Android/backup/merge в это разрешение не входят. Production activation/release — отдельное решение после закрытия приёмки и политики GeoNames. До него работа остаётся локальной; следующее действие не новый исследовательский аудит, а разрешённая проверка готового кандидата.
