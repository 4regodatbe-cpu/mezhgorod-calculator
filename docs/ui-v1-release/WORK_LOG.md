# V1 Release UI — журнал

## 01.11.2026 — UI-07, LOCAL

`DonationCard` получил точные новые заголовок/описание/кнопку; действующая ссылка пожертвования не изменена. Компонент общий для /v3 и /v2. Добавлен SSR test на текст и URL: `node scripts/v3-calculator-form-ui.test.mjs` 7/7 PASS; TypeScript и scoped ESLint exit0. Full gate/build не повторялись при неизменном sandbox-блокере предыдущего шага; hosted CI требуется после отдельно разрешённой публикации. Production/main/PR не менялись. Следующее AUDIT-01.

## 01.11.2026 — UI-06, LOCAL

Задание владельца: новый текст ожидания «Подождите минуту». В `app/v2/components/calculator-form.tsx` обновлены обе desktop/mobile строки без изменения индикации/валидации/расчёта; из-за общего компонента затронуты /v3 и /v2. `scripts/v3-calculator-form-ui.test.mjs` проверяет оба текста через SSR; 6/6 PASS. Full audit локально exit1 из-за трёх ранее подтверждённых sandbox child-process failures, TypeScript PASS, lint exit0/7 warnings, Next build exit1 Turbopack process/port EPERM. Production/main/PR не менялись, push запрещён текущим заданием. Далее UI-07 и подходящая обязательная CI при разрешённой публикации.
