# V1 Release UI — журнал

## 01.11.2026 — UI-12, LOCAL

Заголовок зоны в V1 форме оставлен, пояснение показано только после completed dual result; /v2 исходный текст сохранён. SSR form12/12, result6/6, TS/scoped lint PASS. Только local commit/bundle. Далее UI и AUDIT-01.

## 01.11.2026 — UI-09, LOCAL

Удалено техническое описание локальной базы из footer V3, сохранены GeoNames и CC BY 4.0 links; статистика не затронута. Result-render5/5, TS/scoped lint PASS. Commit/bundle local, no push. Далее UI-12.

## 01.11.2026 — UI-08, LOCAL

V3-only conditional reference notice after result. Result render tests4/4, TS, scoped lint PASS; browser dark/mobile NOT_RUN. Commit/bundle local, no push. Далее UI-09/12.

## 01.11.2026 — UI-02, LOCAL

Release-only внутренние A/B значки рядом с MapPin, внешние строки sr-only; поля и реверс не меняют поведения, /v2 прежний. SSR11/11, TS, scoped lint PASS. Light/dark/mobile визуально не проверены. Commit/bundle local, push запрещён. Далее UI-08 и прочие независимые блоки.

## 01.11.2026 — UI-05, LOCAL

Скрыт toggle при releaseCopy, из V3 page/hook удалены его state/handler/request field. Серверный diagnostic flag опционален и `void` в route-leg, обязательная проверка дороги сохранена. V2 untouched. SSR10/10, TS, scoped lint, diff check PASS. Full audit/build ожидают подходящей среды, push запрещён. Далее UI-02.

## 01.11.2026 — изоляция текстов V1/V2, LOCAL

Два общих компонента получили необязательный `releaseCopy`, который выставляет только /v3. /v2 сохранил исторические надписи UI-06/07 без дублирования алгоритма. SSR9/9, TypeScript, scoped ESLint и diff check PASS; React review не выявил новых hooks/эффектов/запросов. Commit/bundle local, без push. Далее UI-01–05/08–14.

## 01.11.2026 — UI-07, LOCAL

`DonationCard` получил точные новые заголовок/описание/кнопку; действующая ссылка пожертвования не изменена. Компонент общий для /v3 и /v2. Добавлен SSR test на текст и URL: `node scripts/v3-calculator-form-ui.test.mjs` 7/7 PASS; TypeScript и scoped ESLint exit0. Full gate/build не повторялись при неизменном sandbox-блокере предыдущего шага; hosted CI требуется после отдельно разрешённой публикации. Production/main/PR не менялись. Следующее AUDIT-01.

## 01.11.2026 — UI-06, LOCAL

Задание владельца: новый текст ожидания «Подождите минуту». В `app/v2/components/calculator-form.tsx` обновлены обе desktop/mobile строки без изменения индикации/валидации/расчёта; из-за общего компонента затронуты /v3 и /v2. `scripts/v3-calculator-form-ui.test.mjs` проверяет оба текста через SSR; 6/6 PASS. Full audit локально exit1 из-за трёх ранее подтверждённых sandbox child-process failures, TypeScript PASS, lint exit0/7 warnings, Next build exit1 Turbopack process/port EPERM. Production/main/PR не менялись, push запрещён текущим заданием. Далее UI-07 и подходящая обязательная CI при разрешённой публикации.
