# UI-04 — компактный первый экран, LOCAL

01.11.2026 МСК. Base `b1320c1f7e2cd4859dca00018b597885fe0227a6`, ветка `fix/v3-missing-route-prices-2026-10-15`, PR №14 Draft. В V1 Release уменьшены только вертикальные отступы шапки, вкладок режима, секции тарифов и срочной поездки. Четыре тарифные карточки, размеры шрифтов и 44px кнопки не уменьшены; скрытия содержимого и жёсткой высоты первого экрана нет. Старые отступы V2 сохранены посредством `releaseCopy`.

Файлы: `app/v3/page.tsx`, `app/v2/components/calculator-form.tsx`, `scripts/v3-calculator-form-ui.test.mjs`. Цель — дать больше полезного пространства на небольшом экране, не заставляя содержимое перекрываться ради искусственного «всё в экран».

Проверки: SSR/статический UI test 16/16 PASS (включая V1/V2 отступы, все восемь dual полей и минимум 44px для изменения ставок); TypeScript PASS; scoped ESLint exit0; `git diff --check` PASS. **Реальная геометрия viewport, системное увеличение шрифта, клавиатура и light/dark mobile browser NOT_RUN**; это обязательная открытая приёмка UI-04. Полный offline gate/Next build в прежней локальной среде блокировались EPERM, неизменённые команды не повторялись. Только local commit/bundle; push не выполнялся.

Следующий шаг: контролируемая hosted CI/Preview browser-проверка всех 14 UI-пунктов после разрешённой публикации. Отдельный AUDIT-01 остаётся PARTIAL по checkpoint `2026-11-01-ui-v1-audit01-route-reproduction-PARTIAL-LOCAL.md`.
