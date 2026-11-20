# B03 BLOCKED — Chromium runtime preflight

Статус: BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME, 24.10.2026 21:56 МСК.

Исходный remote commit: `35ad16caaaa11b41ba191cdeb889424fccf468c2`; ветка `fix/v3-missing-route-prices-2026-10-15`; PR №14 draft.

## Проверено

- Новая среда действительно содержит `/usr/bin/chromium` версии `154.0.8037.57`.
- Один ограниченный headless smoke `about:blank` с отдельным временным профилем и лимитом 20 секунд завершился exit `133` до DOM.
- Причина в stderr: Crashpad `setsockopt: Operation not permitted (1)`, затем `Trace/breakpoint trap`.
- Node `v24.19.0`, pnpm `11.25.0`; проектные зависимости в чистой копии отсутствуют.

Полное evidence и точная команда: [README](../../experiments/road-ref-boundaries/checks/2026-10-24-b03-browser-preflight/README.md).

## Решение

Не устанавливать зависимости и не запускать восемь UI-сценариев, пока Chromium не проходит минимальный launch prerequisite. Все восемь сценариев остаются `NOT_RUN`; существующий SSR не выдаётся за browser QA. Флаг `addressCitySnapshot:false` не менялся. Код, данные, тарифы и Production не менялись; широкие тесты и внешняя сеть не запускались.

Следующий независимый блок: B04 exact OSM coordinate/topology intake для уже доказанной pending-пары М-4, без назначения официального километра, scope или цены.
