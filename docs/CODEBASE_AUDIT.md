# Комплексный технический аудит репозитория «Из А в Б»

Статус: DONE — завершён новый статический план из 18 блоков (18/18, 100%). Это не процент готовности продукта и не означает, что все сценарии протестированы. Аудировался репозиторий 4regodatbe-cpu/mezhgorod-calculator по remote разрешённой ветке fix/v3-missing-route-prices-2026-10-15, исходный baseline SHA f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d. На время финальной записи branch head 66a98948108e35379ef7b06c79319783e4087f16; PR #14 открыт, Draft, base audit/v3-matrix-provenance-2026-10-14; активных Actions нет.

## Краткая оценка

Архитектура содержит сильные fail-closed и bounded элементы: route candidates проходят control checks; unknown fares сериализуются null; частичная тарифная композиция не возвращается как итог; адресный pool ограничивает concurrency/queue/cache; V3 проверяет API response и очищает активные запросы при unmount. Основные найденные направления улучшения — согласованность входных API-контрактов V2/V3, свежесть/применимость тарифа, resource controls у нескольких публичных handler-ов, восстановление тарифа при неполной trace, V2 lifecycle, TypeScript checks для scripts и CI runtime версии.

Подтверждённых P0/P1 дефектов в пределах проведённого статического аудита не найдено. Это ограниченный вывод: тесты/build не запускались, runtime инциденты не воспроизводились.

## Выполнение плана

18 блоков: architecture/import map; address lookup/geocode; queue/cache/cancel; API inputs/call graph; provider adapters; candidate selection; saved V2/V3 evidence; geometry/direction/boundaries; toll composition/unknown; V2 UI; V3 UI; API response/error; security/privacy; performance/resources; dependencies/build; test inventory; CI workflows; data freshness/governance and synthesis.

Checkpoint sequence: [STARTED](checkpoints/2026-10-26-2100-codebase-audit-STARTED.md), [B1](checkpoints/2026-10-26-2103-codebase-audit-block-01-DONE.md), [B2](checkpoints/2026-10-26-2106-codebase-audit-block-02-DONE.md), [B3](checkpoints/2026-10-26-2108-codebase-audit-block-03-DONE.md), [B4](checkpoints/2026-10-26-2112-codebase-audit-block-04-DONE.md), [B5](checkpoints/2026-10-26-2124-codebase-audit-block-05-DONE.md), [B6](checkpoints/2026-10-26-2134-codebase-audit-block-06-DONE.md), [B7](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md), [B8](checkpoints/2026-10-26-2152-codebase-audit-block-08-DONE.md), [B9](checkpoints/2026-10-26-2201-codebase-audit-block-09-DONE.md), [B10](checkpoints/2026-10-26-2210-codebase-audit-block-10-DONE.md), [B11](checkpoints/2026-10-26-2218-codebase-audit-block-11-DONE.md), [B12](checkpoints/2026-10-26-2229-codebase-audit-block-12-DONE.md), [B13](checkpoints/2026-10-26-2240-codebase-audit-block-13-DONE.md), [B14](checkpoints/2026-10-26-2249-codebase-audit-block-14-DONE.md), [B15](checkpoints/2026-10-26-2302-codebase-audit-block-15-DONE.md), [B16](checkpoints/2026-10-26-2317-codebase-audit-block-16-DONE.md), [B17](checkpoints/2026-10-26-2331-codebase-audit-block-17-DONE.md), [B18](checkpoints/2026-10-26-2139-codebase-audit-block-18-DONE.md). The timestamp note explains the B7–B17 timestamp correction.

## Сохранённое сравнение V2/V3 — только ранее записанные captures/replays

| Маршрут / день | V2 | V3 | V2−V3 |
|---|---:|---:|---:|
| Ейск—Москва, чт 22.10.2026 | 1 271 780 м; 59 629 с; 4 920 ₽ | 1 271 781 м; 59 629 с; 4 340 ₽ | −1 м; 0 с; +580 ₽ |
| Ейск—Москва, сб 24.10.2026 | та же геометрия/время; 6 770 ₽ | та же геометрия/время; 5 240 ₽ | −1 м; 0 с; +1 530 ₽ |
| Майкоп—Москва, чт 22.10.2026 | 1 404 673 м; 65 838 с; 5 040 ₽ | 1 404 674 м; 65 838 с; 5 040 ₽ | −1 м; 0 с; 0 ₽ |
| Майкоп—Москва, сб 24.10.2026 | та же геометрия/время; 6 090 ₽ | та же геометрия/время; 6 090 ₽ | −1 м; 0 с; 0 ₽ |

Capture IDs/SHA and offline replay evidence are in [B7 checkpoint](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md) and referenced run reports. Replays used all saved calls with zero live requests/misses/unused responses according to those historical reports. This audit did not download, replay or capture again. Values are proxy/API outputs; coordinates may not represent historical UI controls. They are not independent operator tariff evidence. The Eisk delta is an investigation lead only; do not alter fares from it. No fare table was changed.

## Находки

### P0 — критические

Не выявлены доказанные в пределах текущей проверки.

### P1 — высокие

Не выявлены доказанные в пределах текущей проверки.

### P2 — средние (сначала проверить/исправить)

1. **AUD-DATE-01 — V2 принимает некорректную дату отправления.**
   - Место: app/api/v2/calculate/route.ts:48; сопоставление: app/api/v3/calculate/route.ts:33–43.
   - Доказательство: V2 проверяет только, что Date.parse не дал NaN; нормализуемые невозможные календарные дни и timestamp без timezone могут пройти. V3 валидирует дату календарно и требует timezone для времени.
   - Последствие: прямой клиент V2 может задать значение, нормализуемое к другому календарному дню; дата выбирает weekday/weekend toll period. Штатный V2 UI отправляет ISO timestamp, поэтому пользовательский сценарий не воспроизведён.
   - Исправление: общий strict parser и API regression для invalid day/timezone/leap day.
   - Риск: низкий–средний — отвергнуть ранее принимаемые некорректные запросы; польза — единый и предсказуемый период; изолируется в validator + тесте.

2. **AUD-ERROR-01 — неизвестные ошибки API классифицируются как HTTP 400.**
   - Место: app/api/v2/calculate/route.ts:97, app/api/v3/calculate/route.ts:132.
   - Доказательство: любой код, не оканчивающийся UNAVAILABLE, получает 400, включая неизвестные исключения; сообщение пользователю при этом общее.
   - Последствие: monitoring/retry clients могут считать внутренний сбой ошибкой клиента; чувствительный текст исключения не раскрывается.
   - Исправление: typed input errors=400, известные upstream failures=502, неожиданные ошибки=500 с безопасным телом.
   - Риск низкий; улучшение диагностики и корректных retry; независимый mapper и contract tests.

3. **AUD-CI-01 — два workflow используют Node 22 при требовании Node 24.**
   - Место: package.json:5; .github/workflows/route-quality.yml:33; .github/workflows/systemic-toll-composition.yml:19.
   - Доказательство: package engine 24.x, workflows задают 22.13.0; первый — scheduled route monitor, второй — ручная composition проверка.
   - Последствие: проверки выполняются вне заявленной среды и могут падать/отличаться по Node API и engine compatibility. Фактическое падение не воспроизводилось.
   - Исправление: согласовать с Node 24.x и выполнить только соответствующие узкие workflow.
   - Риск низкий, польза — CI/runtime parity, независимая правка каждого workflow.

4. **AUD-DATA-01 — freshness gate фиксирует прошлую дату и не блокирует неизвестную effective date.**
   - Место: .github/workflows/calculator-final-gate.yml:57; scripts/check-tariff-freshness.mjs:3,19–20; lib/toll-engine/tariff-registry.ts:11–28.
   - Доказательство: CI передаёт TARIFF_AS_OF=2026-10-02 вместо даты запуска; freshness script считает stale по этому input и в strict mode завершает ошибкой только при stale>0. Три записи registry имеют effectiveFrom:null, а скрипт лишь считает incomplete и не включает это в strict fail. Механический расчёт по observedAt на 2026-10-26: 4 записи, stale=0 на эту дату, effectiveFrom unknown у 3; это не операторская проверка.
   - Последствие: при последующем запуске фиксированная дата не покажет старение источника; неизвестная дата вступления в силу остаётся видимой, но не блокирует gate. Возможна неверная применимость исторического/будущего тарифа.
   - Исправление: проверять возраст относительно даты запуска; отдельный статус/правило для missing effectiveFrom (UNKNOWN/blocked, пока не подтверждено). Не менять числовые тарифы без первичного источника.
   - Риск средний: strict gate может чаще возвращать blocked; польза — актуальная доказательность; изолируется в metadata/freshness checker/workflow.

5. **AUD-BUILD-01 — TypeScript tests из scripts не проверяются tsc.**
   - Место: tsconfig.json:49–60 (exclude scripts); package.json:15 (test:audit выполняет TS tests через Node).
   - Доказательство: test runner исполняет TS, но `tsconfig` исключает этот каталог; исполняемость/транспиляция не заменяет статическую проверку типов.
   - Последствие: type errors в тестовой/диагностической инфраструктуре могут остаться незамеченными build.
   - Исправление: отдельный no-emit tsconfig для scripts/tests или явный typecheck CI step.
   - Риск низкий–средний (возможны ранее не замеченные ошибки типов); польза — обнаружение до runtime; отдельная проверка без изменения продукта.

6. **AUD-SEC-01 — публичная collection API не показывает явные body/rate/deadline limits.**
   - Место: app/api/collect/route.ts:20–23,57+.
   - Доказательство: request.json читается до ограничения/очистки полей; обработчик не показывает byte limit, rate limit или AbortSignal у webhook fetch. Поля feedback и региона ограничиваются после разбора JSON.
   - Последствие: повторные большие/валидные POST способны расходовать функцию/webhook capacity. Ни атака, ни тест не выполнялись; внешний WAF/платформенный limit неизвестен, потому это риск, а не доказанный exploit.
   - Исправление: подтвердить platform limit; добавить ранний размерный cap и ограничение частоты/edge policy, плюс bounded webhook deadline.
   - Риск средний, чтобы не блокировать легитимную обратную связь; польза — ограничение затрат/удержания функций; можно внедрять отдельным API guard.

7. **AUD-TRACE-RECOVERY-01 — неполная trace с toll edge понижает порог corridor recovery.**
   - Место: lib/toll-validator.ts:317–325; lib/toll-recovery.ts:101–117; minRun в lib/toll-recovery-data.ts.
   - Доказательство: incomplete trace может иметь status=toll, complete=false; recovery считает любой status=toll map-matched и использует пороги M4 2 сегмента вместо 4, M12 2 вместо 5. Совпавший сегментный набор получает confidence=matched и может сериализоваться как priced.
   - Последствие: теоретически короткая совпавшая часть может быть показана как corridor result, если geometry узнаёт только часть длинного маршрута. Неверная сумма не воспроизведена; recovery также требует отдельного геометрического совпадения.
   - Исправление: добавить mock fixtures: complete vs partial chunks, route на коротком/длинном corridor; только после наблюдаемого случая решать, запрещать ли понижение при complete=false.
   - Риск средний — ужесточение увеличит unknown; польза — избежать неполной суммы; тестируется независимо в recovery evidence contract.

8. **AUD-UI-01 — V2 расчёт не отменяется при unmount.**
   - Место: app/v2/components/use-v2-calculation.ts:25,70–74,143; app/v2/page.tsx вызывает hook без cleanup.
   - Доказательство: есть abort предыдущего запроса и clearResult, но нет hook unmount cleanup; V3 в use-v3-calculation.ts имеет соответствующий effect cleanup.
   - Последствие: при SPA navigation запрос/серверные provider jobs могут продолжиться; это вероятная resource waste, не воспроизведено.
   - Исправление: cleanup effect abort pending controller, добавить hook test.
   - Риск низкий; польза — меньше лишней работы; независимая правка V2 hook.

9. **AUD-GEOCODE-01 — прямой Photon geocode не имеет локального deadline.**
   - Место: lib/route-providers.ts:22–34, используется V2/V3 API для label-only points.
   - Доказательство: fetch без AbortSignal.timeout; route adapters рядом имеют 25-секундный timeout. Отдельный address suggestion service не используется этим direct path.
   - Последствие: медленный upstream удерживает handler до platform/request timeout; outage не воспроизведён.
   - Исправление: bounded shared geocode transport и abort regression без изменения ranking.
   - Риск низкий–средний; польза — предсказуемое время/ресурсы; отдельный transport helper.

10. **AUD-API-01 — calculate API без явного application cap на bytes и длину labels.**
    - Место: app/api/v2/calculate/route.ts:33+ и V3 route.ts:49+; point labels проверяются на непустоту, request.json читается напрямую.
    - Доказательство: UI maxLength=200, но прямой API body не имеет такого server-side cap. Platform body limits не проверены.
    - Последствие: чрезмерный payload/label может расходовать parse/query ресурсы; эксплуатационный DoS не подтверждён.
    - Исправление: единый size/label validator до дорогих вычислений с согласованным UI пределом.
    - Риск низкий, если лимит согласован с клиентами; польза — ресурсная защита; отдельный input guard.

11. **AUD-PROVIDER-01 — JSON body route providers не имеет явного application byte cap.**
    - Место: lib/route-providers.ts:67–170.
    - Доказательство: adapters используют timeout/cache, затем response.json(); app-level max bytes не видно. Ограничения upstream/platform не измерялись.
    - Последствие: аномально крупный response может увеличить memory/parse latency; такой ответ не наблюдался.
    - Исправление: выяснить допустимый размер/платформу; затем bounded stream read и controlled provider error.
    - Риск средний — безопасный cap может отвергнуть легитимную сложную geometry; польза — memory bound; независимый helper для adapters.

12. **AUD-TEST-01 — отсутствуют некоторые API regression tests.**
    - Место: scripts/v3-api-audit.test.ts имеет строгие date cases; просмотренный scripts/special-territory-api.test.ts для V2 не проверяет departureAt. V3 route-selection test покрывает empty geometry, отдельной V2 equivalent не найдено.
    - Доказательство: тесты просмотрены статически, не исполнены. 145 test-like paths в tree все совпали с package test:audit glob-ами; coverage instrumentation не настроен.
    - Последствие: V2 date mismatch и некоторые guard parity issues могут незаметно вернуться.
    - Исправление: добавить точечные unit/API tests для V2 invalid dates, invalid geometry, partial trace contract; измерять coverage по критическим guards, не обязательно всему монорепо.
    - Риск низкий для тестов; польза — регрессии без массового live audit; полностью независимый тестовый блок.

### P3 — улучшения и техдолг

- V3 hook импортирует UI types/format/pricing utilities из app/v2/components; shared route-provider module также является интеграционным hotspot. Это coupling, не обнаруженная ошибка. Выделять нейтральный shared contracts пакет только при доказанной parity; средний риск неверной нормализации V2/V3, потенциальная польза — меньше дрейфа; независимый refactor.
- Большинство GitHub actions используют floating major tags (например, checkout@v4); не найдено вредоносного pinning. Рассмотреть commit SHA pins и автоматизированные обновления; низкая прямая польза, низкий/средний migration overhead.
- В CI branch protection endpoint недоступен через connector (403). Это не дефект приложения; до release проверить required checks/branch rules через GitHub admin/read access.

## Проверки и ограничения доказательств

- Полностью исполнен 18-блочный статический audit; 145 test paths подсчитаны/сопоставлены скриптом с test:audit globs. Это не запуск тестов.
- Не запускались npm/pnpm install, lint, tsc, test suite, next build, браузер, security scanner, performance benchmark или live providers.
- Использовались current remote files и исторические сохранённые B10 capture/replay reports. Nationwide route/fare audits не повторялись.
- Current PR #14 Draft, base branch audit/v3-matrix-provenance-2026-10-14. Actions runs были завершены, активных не было до финальной записи. PR protection/required contexts неизвестны, поскольку branch-protection API вернул 403 Resource not accessible by integration.
- Рабочее дерево Codex было устаревшим/грязным; исходники читались с точного remote branch ref, а не из локальных файлов.
- B7–B17 checkpoint filenames/headings получили последовательные временные метки, выходящие за фактические часы сессии. [Timestamp correction](checkpoints/2026-10-26-2139-codebase-audit-timestamp-correction.md) фиксирует, что точные времена завершения блоков не были сохранены; результаты и commit SHA корректны.

## Последовательность исправлений (только предложение; ничего не исправлено)

1. Верифицировать тарифную freshness policy: реальный as-of date в CI и решение для effectiveFrom UNKNOWN; не менять суммы без первичного источника.
2. Согласовать Node 24 runtime в двух workflows и подтвердить их узкие CI результаты.
3. Добавить V2 date API tests и выровнять validator с V3; отдельно типизировать ошибки и различать 400/502/500.
4. Добавить V2 unmount cleanup и тест без UI/business logic changes.
5. Ограничить request body/label и public collection rate/webhook deadlines после проверки deployment-level защиты.
6. Добавить тесты complete/partial trace corridor recovery; только по результатам решить fail-closed политику.
7. Typecheck scripts/tests отдельным no-emit tsconfig; затем проверять обязательные проверки изменившихся файлов.
8. Установить branch protection required checks через доступный GitHub admin/read path; не ослаблять CI classifier.
9. Рассмотреть action SHA pinning/shared-module refactor как необязательные P3.

## Не рекомендуется менять без новых доказательств

- Не менять тарифную матрицу по Eisk V2/V3 расхождению или одному сохранённому capture; Maykop совпал, обе пары — лишь project proxy outputs.
- Не менять выбор маршрута, дорожные направления и границы тарификации без первичного route/toll evidence; выполненный исторический audit не повторять.
- Не включать addressCitySnapshot (feature switch остаётся false) и не переводить optional modules в production без отдельного разрешения.
- Не превращать unknown/partial в ноль или полный total, не ослаблять tests/assertions и fail-closed guards.
- Не объединять V2/V3 расчётные engines и не удалять legacy endpoint до проверки consumers/contract.
- Не менять main, Android, резервную ветку, Production; не сливать PR #14 и не менять его Draft status.

## Итог и durable save

Отчёт и checkpoints — documentation-only; application behavior, rates and workflows остались неизменны. По завершении B18 remote readback должен подтвердить report, WORK_STATE и checkpoint в единственной разрешённой ветке. PR #14 остаётся Draft.