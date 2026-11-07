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

## 01.11.2026 — V1.01 mobile polish, LOCAL

Запрос владельца: убрать дубль справочного текста, сделать атрибуцию незаметнее, объединить два текста о быстром маршруте, сбалансировать метрики и тарифы, укрупнить кириллические А/Б, заменить блок ссылок шапки на V1.01. Изменены `app/v3/page.tsx`, только release-ветки UI в `address-field.tsx`, `route-card.tsx`, `pricing-fields.tsx`, два SSR-теста. Ни API, ни расчёты, ни /v2 не менялись; /v2 и `/v2/toll-roads` остаются доступными по URL, но ссылки убраны из шапки /v3. Длинное справочное предупреждение после результата сохранено; обязательные GeoNames/CC BY 4.0 ссылки сохранены видимыми. Общий быстрый quality message скрывается только при точном дубле и `status=single`, предупреждения не скрываются.

Проверки: result SSR 7/7, form SSR 16/16, TypeScript exit0, scoped ESLint exit0, offline `test:audit` 1082 PASS/0 FAIL/1 SKIP и quote tests PASS. Локальный Next dev + Chromium на 1365×850 и 390×844: light/dark, standard/dual, без горизонтального переполнения/console errors. API `/r`, `/api/v3/calculate`, `/api/collect` заменены контролируемыми ответами — это визуальная проверка, не проверка серверного расчёта или Preview. Mobile standard-card высота 737,5→612 px на тестовом unknown-тарифе; карточки + полное предупреждение занимают около одного viewport, но fixed-кнопка и вариативный контент требуют прокрутки на узких/увеличенных шрифтах. Штатный `next build` exit1 при Turbopack/PostCSS spawn/port EPERM; поддерживаемый `next build --webpack` exit0 (Next 16.3.4), не заявлять штатный build PASS. См. checkpoint и внешний screenshot/evidence manifest. Без push; AUDIT-01 и live Photon 503 остаются отдельными.

## 01.11.2026 — один V1.01 fast-forward push и приёмка, PARTIAL

Проверены чистый локальный HEAD `2c52c814…`, состав 3 коммитов/12 файлов, remote `d54bf5bc…`, ancestry и Draft PR14. Один обычный push завершился exit0, удалённая ветка `2c52c81425cd59ea6e4ea9f3ca3c47b34d8a83b6`; GitHub tree readback пяти изменённых UI/test blobs совпал с `git ls-tree`. Второго push не было.

Actions на том же SHA: route-quality 41321907484 SUCCESS; B03 push 41321907566 SUCCESS; B03 PR 41321914436 SUCCESS; special-territory 41321914446 overall SUCCESS. В verify последнего offline 1082 PASS/0 FAIL/1 SKIP, TypeScript и штатный `next build` PASS (Next 16.3.4); B03 PR address-ui 10/10 current PASS, legacy step успешен. Special-territory `verify` и `calculation_timing` SUCCESS, но отдельный `live_probe` job FAILURE: Донецк `SOURCE_UNAVAILABLE`, 4×`http_503` + 3×`source_cooldown`, 0 результатов; Краснодар PASS. Artifact 13090120367. Это известный внешний поисковый блокер, не устранён UI.

Vercel Preview `dpl_46d42SspdWHkqaG4SnB49jCXWS92` READY, Git SHA совпадает, URL https://mezhgorod-calculator-e67gsp7m3-4regodatbe-5310.vercel.app/v3. Неавторизованный запрос перенаправлен на Vercel Login; два обращения к Opera Browser Connector завершились `UNAVAILABLE`/30s. Защиту не ослабляли, публичную share-ссылку не создавали; реальный Preview browser desktop/mobile NOT_RUN. Локальная browser-проверка из V1.01 checkpoint остаётся доказательством того же исходного дерева с mocked API, не облачного поведения. Production/main/Android/backup/PR status не меняли. Итоговый документальный commit после push остаётся только локальным до нового разрешения.
## 01.11.2026 — internal special-only V3 tariff, LOCAL

После routing checkpoint добавлен V3-only критерий полной внутренней геометрии, отказ внешнего детура и защита от ручного ordinary override. Форма/результат/копия показывают единственный особый тариф после подтверждённого маршрута; V2 defaults прежние. Целевые API/SSR/геометрические тесты PASS, TS и scoped ESLint exit0, Webpack build exit0. Общий offline 182/185 test files PASS и три sandbox EPERM; штатный Turbopack build EPERM. Два ограниченных OSRM ответа с полной внутренней геометрией подтверждены; локальный POST 502 из-за Node fetch ECONNREFUSED при доступном curl/proxy. Подробности в checkpoint. No push.

## 01.11.2026 — Rostov GeoNames label, LOCAL

Локальный корпус уже содержит точный алиас «Ростов-на-Дону» для ID 501175. Только эта идентичность теперь отображается полным именем при совпадении проверенных региона/координат; Ярославский ID 501183 не затронут. `/api/suggest` и `/r` с выключенным Photon, выбор координат и сохранённый snapshot при фиксированной дате PASS; runtime fallback switch остаётся OFF. См. checkpoint. No push.

## 01.11.2026 — mobile browser attempt, BLOCKED_BY_ENV

Локальный `next start` для Webpack-сборки READY при дополнительном сетевом разрешении. Chromium 390×844 с отключённым JavaScript и 18-секундным лимитом повторял TLS `net_error -202` и не создал screenshot. Это не визуальный PASS; SSR группы/карточки прошёл отдельно. Процесс браузера и локальный сервер остановлены, push нет.
## 01.11.2026 18:49 UTC — V1.01 special routes / Rostov publication, PARTIAL

Один fast-forward push `2c52c814…` → `3f185c7b…` успешен; remote readback и PR14 Draft подтверждены. Hosted route-quality и B03 browser SUCCESS (10/10 current browser); special verify offline 1090 PASS/0 FAIL/1 SKIP, TS/build PASS. `calculation_timing` Donetsk→Moscow HTTP200; `live_probe` отдельно FAILED на Photon HTTP503/cooldown для Донецка. Preview этого SHA READY, но Vercel Authentication и отсутствие CLI/OIDC плюс browser connector UNAVAILABLE не позволяют провести живые desktop/mobile сценарии. Контрольные внутренние/обратные маршруты и четыре суммы в Preview не подтверждены. Полные данные и ссылки: [checkpoint](../checkpoints/2026-11-01-1849-v101-special-push-preview-PARTIAL.md). Запись local; нового push нет.
## 01.11.2026 23:24 MSK — Android V1.01 download, LOCAL/PARTIAL

Выполнена локальная интеграция проверенного APK из artifact 13097107982 в `public/downloads/`; SHA-256 `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a`. На `/v3` подготовлена кнопка скачивания, V2 не менялась. Попытка отдельного GitHub prerelease asset получила HTTP401 на upload host; пустой release/tag не остался. Tests 2/2, TypeScript, scoped ESLint, прямой Next build и локальный HTTP200/819945 bytes/SHA PASS; local full audit 183/186 test files, три известных sandbox child-process сбоя. Desktop/mobile Chromium не завершился из-за TLS -202. Публичная ссылка и Preview пока не проверены: push/Production запрещены. [Подробный checkpoint](../checkpoints/2026-11-01-2324-android-v101-download-LOCAL-PARTIAL.md).
## 02.11.2026 — Crimea routing P1 release

Production a05fba10 READY, все 14 реальных двунаправленных контролей HTTP200. Убран обязательный Краснодар для обычных Крым↔материк поездок, мост сохранён; V3 выбирает планы по времени. Hosted offline1099/0fail/1skip, TS/build/browser PASS, отдельный известный Photon503 остаётся. Итоги и исходные ответы: [checkpoint](../checkpoints/2026-11-02-crimea-routing-production-DONE.md). Main/Android V2 не менялись, PR14 Draft; финальная запись local.
