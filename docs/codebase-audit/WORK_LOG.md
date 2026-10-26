# Codebase audit fixes — work log

## 26.10.2026 23:14 МСК — AUD-DATE-01 DONE

- Исходная разрешённая ветка / parent: `fix/v3-missing-route-prices-2026-10-15` / `fd41d4aaa817f8904be7e141b5bd6e5c0aca0ede`; PR #14 Draft. Рабочая копия создана отдельно из проверенного remote HEAD.
- Подтверждён дефект: V2 использовал только успешность `new Date(value)`, нормализуя, например, `2026-02-30`; дата с временем без TZ не отклонялась. Тарифный выбор и маршрутизация не менялись.
- Добавлены V2 request-level cases: невозможный календарь, не leap-year 29 Feb, locale date, timestamp без TZ, 24:00 — 400 до внешнего запроса; leap-day, date-only и timestamp с TZ принимаются.
- RED: до исправления `2026-02-30T09:00:00+03:00` дал 502 и дошёл до stub provider вместо 400; 8 остальных тестов файла прошли. GREEN: `scripts/special-territory-api.test.ts` 9/9; `npx tsc --noEmit` exit 0; `git diff --check` PASS.
- Ограничение: полная PR Actions verify не запускалась, поскольку её текущая runtime-классификация может включить широкий live-probe с 50-route corpus без связи с валидацией даты. Точечные/offline проверки выполнены; не утверждается PASS полного CI.
- Пути: `app/api/v2/calculate/route.ts`, `scripts/special-territory-api.test.ts`, текущий state, этот журнал/план и checkpoint.
- Следующий блок: AUD-ERROR-01; никакие тарифные суммы, effectiveFrom или recovery policy не менялись.

## 26.10.2026 23:17 МСК — AUD-ERROR-01 DONE

- Исходный parent: `725b78916da2f51c8861f8c02cfed67b7f0ea3a8`; разрешённая ветка; PR #14 Draft.
- До исправления неизвестное исключение `Error("private-provider-host.example/token")` возвращало HTTP 400. Проверка воспроизведена для обоих API handlers.
- Добавлен общий typed classifier `lib/calculate-api-error.ts`: allowlist известных клиентских (400) и upstream (502) codes; все остальные исключения получают категорию `internal` и HTTP500. Тексты клиентских ответов остаются whitelist-only и не включают `error.message`. Существующие специальные error messages сохранены.
- Добавлены endpoint contract tests для V2 и V3: адрес не найден→400, известная ошибка geocoding 503→502, неожиданное исключение→500; приватная строка отсутствует в body. RED: V2 unexpected exception был 400 (ожидался500). GREEN: новый mapping test 1/1; `special-territory-api.test.ts` 9/9; `v3-api-audit.test.ts` PASS; `npx tsc --noEmit` exit0; diff check PASS.
- Изменены оба API route handler, один общий classifier и focused test. Live providers не вызывались; fetch полностью mock.
- Полный Actions/широкий live-probe не запускался: unrelated 50-route corpus не нужен для mapping. Не заявляем hosted CI.
- Следующий блок: AUD-CI-01. Тарифы, геометрия и восстановления не менялись.
