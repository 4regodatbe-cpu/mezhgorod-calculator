# UI-05 — пользовательский ПВП переключатель удалён из V1 Release

01.11.2026 МСК. Base `0b4efef06e7df2bacfea53646a8eb99a98b1d4bc`. `CalculatorForm` скрывает переключатель при `releaseCopy` (только /v3), оставляя V2 без изменений. Из V3 page/hook удалены состояние, обработчик и отправка необязательного `diagnostics` поля. Серверный `calculateLeg` всё ещё выполняет обязательную тарификацию; флаг является compatibility/no-op (`void diagnostics`), не меняет цену выбранного маршрута. Ни тарифные правила, ни API сервера не изменены.

SSR 10/10 PASS с V1 absent/V2 present; TypeScript PASS, scoped ESLint exit0, diff check PASS. Full audit/build локально не повторены при известном EPERM; hosted gate требуется до публикации. React review: новых эффектов/запросов нет, V3 состояние стало проще. Локальный commit/bundle, push запрещён. Следующее UI-02.
