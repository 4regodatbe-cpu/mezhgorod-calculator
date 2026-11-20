# UI-06 — ожидание расчёта, LOCAL

01.11.2026 МСК. Base `beb57c803424cbf9993bdefe8e3a9d8c7ef4a39d`, PR14 Draft. Две desktop/mobile строки общего `CalculatorForm` заменены с «Подождите пару минут» на «Подождите минуту»; индикаторы, загрузка и ошибки не менялись. Компонент общий для V1 Release (/v3) и исторического /v2, поэтому текст изменён в обоих интерфейсах. Добавлен SSR-regression на две строки.

Точечный `node scripts/v3-calculator-form-ui.test.mjs`: 6/6 PASS. `pnpm test:audit`: exit1, 180 PASS/3 FAIL в начальной группе из-за тех же трёх child-process тестов, ранее 7/7 PASS на GitHub-hosted Node24; дальнейшие группы не запустились. TypeScript `pnpm exec tsc --noEmit`: PASS. `pnpm lint`: exit0, 0 errors/7 прежних warnings. `pnpm exec next build`: exit1, Turbopack не смог создать process/bind port, EPERM sandbox. Нельзя объявить полный gate/build PASS. Runtime тарификации и маршрутизации не изменён.

Сохранение: локальный commit и bundle, без push по текущему заданию. Следующее — независимый UI-07 и затем проверка обязательных gates в подходящей среде только при разрешённой публикации; не менять приложение ради sandbox.
