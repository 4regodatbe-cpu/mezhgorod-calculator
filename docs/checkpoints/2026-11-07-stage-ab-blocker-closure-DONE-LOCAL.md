# Stage AB — закрытие доступных локальных блокеров V3 (DONE LOCAL)

- Дата: 2026-11-07 UTC.
- Репозиторий/worktree: `/workspace/final-gate-v3`.
- Ветка: `codex/final-gate-v3-repair`.
- База опубликованной разработки: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`.
- Код/тесты: `9ac745c35500e4bfcb04cf3411806be8a4887d44`; последующий документальный closure-коммит фиксируется историей Git.
- PR #14: Draft. Push, merge, Production, main, Android: не выполнялись.
- 91-коммитная основная локальная копия не изменялась.

## Цель и решение

Stage AB должен был закрыть оставшиеся блокеры V3 без повторного общего аудита. Выполнены только проверки сохранённых данных, ограниченная проверка официального источника, тестирование fail-closed поведения и правка CI/test contract. Новые live route запросы не выполнялись. Из-за отсутствия provider-level данных точную причину прежних двух HTTP 502 установить нельзя. Актуальность двух тарифных registry entries подтвердить не удалось; release readiness не объявляется.

## A — официальный источник и свежесть

`lib/toll-engine/tariff-registry.ts` содержит записи `avtodor-other-roads-2026-10-01-category1-transponder` и `...-no-transponder`. Обе ссылаются на один `data/tolls/2026-10-01-avtodor-other-roads-category1.json`, `observedAt=2026-10-01`, `effectiveFrom=null`, freshness window 30 дней. Snapshot содержит M‑1 (1 строку), M‑3 (3), ЦКАД (16), А‑289 (6), с отдельными полями оплаты транспондером/без него. Registry обрамляет общий snapshot; в inspected runtime `priceOtherRoadVerifiedSections` вызывается из CKAD production pricing для десяти распознанных восточных секций ЦКАД с `noTransponder`/`allDays`. Суммы и snapshot не изменены.

Прямой GET `https://avtodor-tr.ru/road/tariffs/` 2026-11-07 завершился HTTP/2 403 от DDoS-Guard после доступного штатного сетевого запроса. Поисковый индекс страницы старый (crawl примерно два месяца), не подтверждает текущий документ, суммы или effective date. Поэтому `observedAt`/`effectiveFrom` и freshness policy не обновлялись. Нет evidence более поздней официальной редакции.

## B — сохранённые маршруты и причины 502

Сохранены без повторного запуска шесть bounded V3 случаев:

| Маршрут | Результат | Платные дороги | Вывод |
|---|---|---|---|
| Ялта → Краснодар | HTTP 200; 501.2 км; 416 мин; OSRM | 800 ₽, компонент А‑289 | Сохранённый priced result; не новая проверка |
| Ялта → Москва | HTTP 200; 1817.8 км; 1476.8 мин; Valhalla | 4725 ₽ будни / 5625 ₽ выходные, M‑4 + А‑289 | Сохранённый расчет |
| Донецк → Казань | HTTP 200; 1534.9 км; 1424.4 мин | `unknown/null` | Нет прямой доказанной тарифной пары М‑12; стоимость поездки отдельно от toll |
| Москва → Казань | HTTP 200; 820.2 км; 687.9 мин | `unknown/null` | Та же граница доказательности М‑12 |
| Тверь → Адлер | HTTP 502 | — | Сохранённый route failure |
| Голубицкая → Санкт-Петербург | HTTP 502 | — | Сохранённый route failure |

Это ровно ранее сохранённое состояние до Stage AB regression; поскольку application runtime и тарифы не изменялись, новый route replay «после» не выполнялся и не подменяется предположением о пост-change runtime. В таблице сохранены измеренные route outcomes и отдельно явно неизвестные тарифы/ошибки; полей геометрии или provider payloads в manifest нет.

Для двух 502 известны агрегатный `ROUTE_UNAVAILABLE`, ошибки на каждом из трёх provider stages и общий API mapping в HTTP 502. Точные per-provider HTTP статусы, exception type, timeout/transport/parse category не записаны и не восстанавливаются из таймингов. Нельзя заключить, что виноват конкретный provider либо код/геометрия. `app/api/v3/calculate/route.ts` вызывает три кандидата (Valhalla, OSRM, BRouter) с 25-секундными сигналами, не включает bypass fallback при `fastestOnly`, и при отсутствии usable route завершает запрос без результата; нет искусственного route или нулевого toll.

Из сохранённого control script `scripts/v3-live-route-audit.mjs` установлены точные request inputs: `standard` mode/vehicle, `departureAt=2026-10-02T09:00:00+03:00`, POST `/api/v3/calculate`; Тверь `[lng 35.9176, lat 56.8587]` → Адлер `[39.9180, 43.4382]`, Голубицкая `[37.2761, 45.3258]` → Санкт-Петербург `[30.3351, 59.9343]`. Сценарии использовали до шести sequential cases в одном bounded runner, но per-provider response/transport details в итоговом sanitised report отсутствуют. Источник control coordinates — сам сохранённый test fixture, не утверждение о точных адресных входах пользователя.

## Изменение и проверки

Добавлен `scripts/v3-all-routing-providers-unavailable.test.ts`: actual V3 handler получает mocked HTTP 503 от каждого из трёх provider hosts; assertions подтверждают по одному вызову каждого, итоговый HTTP 502 и отсутствие route/legs/options. Добавлен targeted test в `calculator-final-gate.yml` и static workflow harness assertion. Это проверка системного контракта отказа, не реконструкция исторического provider error.

На code/test SHA `9ac745c3…` фактически выполнено:

- targeted provider-failure/API error mapping: 2/2 PASS;
- final-gate workflow harness: 6/6 PASS;
- V3 readiness checks: PASS;
- route benchmark integrity: 61 records PASS;
- TypeScript: PASS;
- ESLint: exit 0, 9 существующих warnings;
- `pnpm build`: 1143 PASS / 0 FAIL / 1 SKIP; Next production build и TypeScript PASS;
- YAML/JS syntax, `git diff --check`: PASS;
- local API smoke: 16/16 после разрешённого local server access; это не GitHub Actions.
- строгая тарифная свежесть: корректный BLOCK/exit 2 — две stale записи, ноль invalid, три effective-date unknown.

Hosted GitHub Actions на этом SHA не запускался, поскольку push запрещён. Полный live-route result на кандидате отсутствует. Предыдущий Stage AA Webpack build сохранён, runtime не менялся; на Stage AB повторно Webpack не запускался. Production не трогался.

## Состав и сохранение

Runtime/toll/route-selection/route geometry unchanged. Stage AB implementation/test diff — `calculator-final-gate.yml` и `scripts/v3-all-routing-providers-unavailable.test.ts`; docs/handoff дополнены текущей записью и manifest. SHA источников — [manifest](2026-11-07-stage-ab-manifest.json). Stage AA/AB historical checkpoints оставлены неизменёнными.

**Итог:** доступная локальная часть завершена; candidate не готов к публикации из-за непроверенной текущей тарифной свежести и отсутствия hosted Actions. Следующий точный шаг — получить датированный официальный source response/document для shared snapshot и effective date, сохранить его checksum, затем разрешённый hosted run на точном SHA. Для двух 502 — использовать provider-level logs будущего штатного run; не повторять запросы вслепую.
