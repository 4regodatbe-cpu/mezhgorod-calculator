## CURRENT 2026-10-09 — M3 bidirectional real physical toll nodes resolved and browser-verified

- Code at `04c253d23ade176a49b236032aebaa6c0d1a6498`; **289/289 native Node tests PASS, Next + TypeScript PASS** on Vercel deployment `dpl_AyBUbHjyX1mZFh6rA2wftV2Fv5ja` READY. Preview `https://mezhgorod-calculator-r6x9ndg7j-4regodatbe-5310.vercel.app/v2` (temporary Vercel guest token issued separately, NEVER commit).
- LIVE E2E Москва→Калуга and Калуга→Москва with deep gate diagnostics: **all three exact M3 PVP 86/136/168 recognized both directions** from six independently checked OSM toll_booth nodes. **800 ₽ source-day component reference** is visible but NOT added to customer fare, which remains UNKNOWN. `M1_M3_EVIDENCE_2026-10-09.md` has all OSM source URLs, raw IDs, coordinates and exact run IDs.
- Critical recent fix: selected-route `lib/toll-validator.ts` Valhalla filter changed to `edge.end_osm_node_id` from unsupported `node.osm_id`. Before fix IDs all null despite 3 real booth events. After fix + OSM cross-check, both directions proven. **M1 46km exact gate OSM IDs remain UNVERIFIED**.
- IMPORTANT: the project goal is **nationwide complete toll pricing**, not satisfied. Most networks lack full paid entry/exit/receipt/calendars. `national-price.mjs` remains research-only; new M3 number is shadow diagnostic, no new customer toll cutover.
- NEXT: work M1 46km physical OSM evidence via actual selected route; independently verify full M3 operator OD receipt/effective tariff date, then address remaining nationwide roads. Read all committed work files before continuing.

# Начните здесь — общероссийские платные дороги («из А в Б»)

**Состояние на 9 октября 2026 года:** новая общероссийская ветка расширения начата после просьбы пользователя рассчитать остальные платные дороги России. Основная ветка **`experiment/toll-od-matrix-2026-10-08`**, проверенный код **`6917191f6be70561872a971cd904c9f665e4dda7`**, Vercel Preview **READY**: https://mezhgorod-calculator-pjfvyy2kq-4regodatbe-5310.vercel.app/v2 (может требовать авторизацию Vercel; временный гостевой токен в публичном репозитории не хранить).

## Сделано, а не запланировано

- В `national-registry.json` занесены **22 национальные/региональные тарифные системы** с именами, операторами и источниками. **Это не полный доказанный перечень абсолютно всех дорог России**: Псковская область, например, объединяет четыре разные дороги в одну группу.
- У **8** групп имеются опубликованные частичные тарифные строки, внесённые в **автономный** движок `national-price.mjs`. Он принимает только уже независимо подтверждённые физические платные события того же маршрута. `quoteNationwideTrip` выдаёт `null` при **любом** неизвестном/недоказанном компоненте, не частичную сумму.
- `national-preview.mjs` принимает имена прежних геометрических отрезков и evidence-сигналы реальных существующих модулей M4/M11/M12/CKAD и выдаёт список предварительных дорожных систем; эти признаки **не разрешают начисление нового тарифа**.
- Действующий V2 `/v2` показывает отдельную раскрывающуюся диагностику «Платные дороги России · проверка покрытия». `/v2/toll-roads` показывает каталог 22 групп/статусов/операторских ссылок. Фактическая стоимость дороги остаётся **по старым модулям**; не запущены новые восьмисетевые цены без независимой геометрии.
- Vercel из SHA `6917191f` подтвердил **235/235 Node tests PASS**, TypeScript и Next build PASS. Браузерный E2E Москва→Воронеж (TinyFish run `4227d920-4a18-4992-940b-d520ca07cbcd`) подтвердил распознавание М4 в общероссийском списке по 7 строгим ПВП, но выставленные **3060 ₽ остаются старым тарифным движком**, не новым.
- `main`, UI PR #12 и Production не обновлялись. Варианты Standard/Comfort/Comfort+ автомобиля — **не** физический класс I/II/III/IV оператора дороги.

## Для дальнейшей работы в новом чате

1. `AGENTS.md` и `docs/WORK_STATE.md` — обязательные правила Git-лога и текущий статус.
2. `experiments/nationwide-tolls/README.md`, `SOURCE_AUDIT_2026-10-09.md`, `DECISIONS.md` — архитектура, источники и расчётные ограничения.
3. `experiments/nationwide-tolls/WORK_LOG.md` — **append-only** подтверждённый журнал коммитов, E2E, ошибок и инструментальной проверки.
4. `experiments/nationwide-tolls/NEXT_STEPS.md` — очередь: полный операторский тариф по всем оставшимся системам, настоящий nationwide paid-edge/entry-exit same-route matching, E2E на других дорогах, затем **только явно проверенный тарифный cutover по каждой системе**.
5. Ветка `experiments/toll-od-matrix/` продолжает хранить исследования М4 и её отдельную матрицу. По М4 полных официально сопоставленных цен по ПВП **0**; не путать со старыми суммами калькулятора.

**При следующих изменениях:** код и большой блок документов коммитить атомарно, добавлять датированную запись в `WORK_LOG.md`, поддерживать свежую запись наверху `docs/WORK_STATE.md`. Не выдавать реестр тарифов за автоматически рассчитанную стоимость.
