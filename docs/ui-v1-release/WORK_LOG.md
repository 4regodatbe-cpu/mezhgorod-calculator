# V1 Release UI — журнал

## 01.11.2026 — второй push VERIFIED, CI PASS / Preview browser PARTIAL

[Checkpoint](../../docs/checkpoints/2026-11-01-ui-v1-second-push-ci-PASS-preview-PARTIAL.md). `d54bf5bc…` remote/readback PASS; Actions 41290799596/41290799660 overall SUCCESS, offline 1082/0/1, TS/Next build PASS, full local ESLint exit0/7 warnings. `live_probe` отдельно FAILURE (Донецк Photon 503/cooldown). Preview exact SHA READY, но Vercel Authentication без штатного OIDC блокирует браузер. Local Chromium desktop/mobile light/dark с моками PASS; не считать Preview/реальными маршрутами. Production и PR14 Draft без изменений. Документальный checkpoint остаётся local, третьего push нет.

## 01.11.2026 — единственный push, CI/Preview FAILED, локальное исправление теста

[Checkpoint](../../docs/checkpoints/2026-11-01-ui-v1-push-ci-FAILED-local-followup.md). Remote `55aa69ae…`/readback PASS, PR14 Draft. Actions 41288602244, 41288607999, 41288602256, 41288608013 FAILURE; B03 browser job SUCCESS, 2 stale clipboard harness indices остановили offline gate/Next build. `live_probe` Донецк Photon 503/cooldown отдельно FAILURE. Preview `dpl_GksaLeCZEyz3BLRfkYqy981ibnVh` ERROR, browser acceptance NOT_RUN. Индексы исправлены только локально (hook9/9, TS/lint PASS), второй push не выполнялся. AUDIT-01 PARTIAL.

## 01.11.2026 — локальная передача PARTIAL

[Матрица](ACCEPTANCE_STATUS.md), [checkpoint](../../docs/checkpoints/2026-11-01-ui-v1-local-handoff-PARTIAL.md). Все UI01–14 реализованы локально, но visual/hosted gates не закрыты. AUDIT-01 остаётся PARTIAL. Remote read-only `beb57c80…`, PR14 Draft; push нет.

## 01.11.2026 — UI-04, LOCAL

[Checkpoint](../../docs/checkpoints/2026-11-01-ui-v1-first-screen-LOCAL.md). Снижены вертикальные отступы первого мобильного экрана V1 без сокращения текста/44px targets и без изменения V2. SSR16/16, TS/scoped lint PASS; реальные viewport и увеличенный шрифт NOT_RUN. Все UI01–14 реализованы локально, визуальная/hosted приёмка не закрыта. No push.

## 01.11.2026 — AUDIT-01, PARTIAL LOCAL

[Checkpoint](../../docs/checkpoints/2026-11-01-ui-v1-audit01-route-reproduction-PARTIAL-LOCAL.md). Два реальных POST к V3 handler для Донецка→Волновахи/Мелитополя: HTTP502, остановка на special_options/routing до pricing; сохранены полные ответы и timing. Наблюдения Preview о суммах и 614,2 км не воспроизведены; точная причина требует исходного успешного response/trace, одинаковые live-пробы не повторялись. No push.

## 01.11.2026 — UI-10, LOCAL

V1-only transition effect scrolls after dual DOM appears, once per mode transition, cleans rAF, skips active input and respects reduced motion. Form15/15, TS/scoped lint PASS. Browser keyboard/mobile NOT_RUN; provisional until Preview. Commit/bundle local.

## 01.11.2026 — UI-11, LOCAL

V1 fixed mobile calculate доступен и после результата, нижний spacer защищает footer; V2 прежнее поведение. SSR14/14 включая 8 dual полей/urgent, TS/scoped lint PASS. Реальная keyboard/mobile проверка NOT_RUN. Commit/bundle local, no push.

## 01.11.2026 — UI-03, LOCAL

V1 TariffInputs: stronger border, compact padding/smaller Chevron, 44px hit targets preserved, rates/step untouched; V2 styles remain. Initial SSR regex assumed wrong class order, corrected. Form13/13, TS/scoped lint PASS. Visual light/dark/mobile NOT_RUN, commit/bundle local.

## 01.11.2026 — UI-13, LOCAL

V1 fastest-only dual cards: активная рамка/ring/фон, остальные контрастные; состояние также aria/Chevron, hit area сохранена. V2 стиль прежний. Result7/7, TS/scoped lint PASS; browser NOT_RUN. Commit/bundle local, no push.

## 01.11.2026 — UI-01, LOCAL

Прозрачный SVG не менялся: opaque cream fill был у anchor V3, удалён; `dark:invert` только в тёмной теме. Result-render7/7, TS/scoped lint PASS. Реальное визуальное подтверждение dark/mobile отсутствует. Commit/bundle local, no push.

## 01.11.2026 — UI-14, LOCAL

Fastest-only V1 RouteCard имеет новый заголовок и горизонтальные metrics, без изменения маршрута/copy; /v2 прежний badge/text. Result-render6/6, TS/scoped lint PASS, visual NOT_RUN. Commit/bundle local, no push.

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
