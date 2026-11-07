# V1 Release — второй push VERIFIED; Preview browser PARTIAL

01.11.2026 МСК. Branch `fix/v3-missing-route-prices-2026-10-15`, PR №14 OPEN/Draft. Перед записью local `d54bf5bc8c901c28c8e913f3d53de3d2469fc27d`, remote `55aa69ae42097da37283677b7dd6f00f1a97058a`, clean, прямой parent и `git diff --check` PASS. Diff 5 файлов: только два индекса тестового clipboard harness и связанные документы. Локальный lock отсутствовал; remote перепроверен непосредственно перед записью. Один обычный fast-forward push без force выполнен. GitHub remote HEAD и PR head — `d54bf5bc…`, Draft сохранён. Remote contents readback `scripts/v3-hook-race-audit.test.mjs` и предыдущего checkpoint совпал с локальными SHA256. Третьего push не было.

## Автоматические проверки опубликованного SHA

- [Special territory run 41290799596](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41290799596): общий conclusion SUCCESS; `classify_live_scope`, `verify`, `calculation_timing` SUCCESS. Mandatory offline gate по логу `verify`: **1082 PASS, 0 FAIL, 1 SKIP**; TypeScript `tsc --noEmit` step SUCCESS; Next.js 16.3.4 `next build` step SUCCESS (`Compiled successfully in 8.0s`, 16/16 static pages). Frozen install PASS.
- [B03 run 41290799660](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41290799660): overall SUCCESS; `verify` и `address-ui` SUCCESS, контролируемые браузерные текущие 10/10 PASS плюс legacy eight. Artifact `13076744497` (zip SHA256 `f808479c1bacca39cff13ead80b9e25d26d8ec67aefe0fe8fdc66bab0506b9e2`). Это тестирование AddressField с контролируемыми ответами, не реальный сценарий нового Preview.
- `live_probe` внутри Special territory run имеет **job FAILURE**, несмотря на зелёный общий conclusion (допускается workflow). Первая live geometry/time probe SUCCESS; production address collector: Ростов PASS (1 HTTP503), Красн PASS (2 HTTP503/4 cooldown), Донецк `SOURCE_UNAVAILABLE` за 255 мс (4 HTTP503/3 cooldown). Дальнейшие 50-settlement и Yandex jobs SKIPPED. Это отдельная внешняя проблема Photon/сборщика; не считать её UI-регрессией или устранённой.
- Полный локальный `pnpm exec eslint . --ignore-pattern .next`: **exit0, 0 errors, 7 warnings** (существующие unused-vars). Hosted Actions не запускал отдельный ESLint step; не приписывать ему этот результат.

## Preview и браузер

Vercel deployment `dpl_HVjGtJ1bV9MmDChZ66nqzDu3HWqg` — **READY**, source SHA `d54bf5bc…`, target Preview, URL `https://mezhgorod-calculator-jlpw6uhnn-4regodatbe-5310.vercel.app/v3`. Production остался READY на `e3ca3783a8ba9de3271851959eba213bf7a76868`. Обычный HTTPS `/v3` перенаправляет на Vercel login. В этой среде нет Vercel CLI/OIDC credentials для Trusted Sources, Opera Connector ответил UNAVAILABLE после 30 с; защиту/доступ/share-ссылку не меняли. **Браузерная приёмка именно защищённого Preview NOT_RUN.**

Отдельно на том же Git source `d54bf5bc…` выполнен локальный Next dev + Chromium 156.0.8078.47 с официальным дополнительным разрешением sandbox. Desktop 1365×850 и mobile 390×844, светлая/тёмная темы, A/B, 4/8 тарифных полей, urgent toggle, ручной dual, fixed mobile calculate, result heading, unknown-toll notice, zone explanation, no horizontal overflow, no page console errors — PASS в ограниченном тесте. `/r`, `/api/v3/calculate`, `/api/collect` были **контролируемыми ответами**, поэтому это UI smoke, не реальный search/routing/tariff end-to-end и не приёмка Preview. Первая версия harness начинала ввод сразу после `DOMContentLoaded`, и Next dev сообщил hydration mismatch; после ожидания `networkidle` повторный уточняющий прогон PASS без browser console errors и без issue overlay. Причина первого сообщения не доказана как дефект приложения. Нативную мобильную клавиатуру эмулятор не воспроизводит. Визуальные screenshots осмотрены; на начальном mobile 390×844 срочная поездка видна без наложения, фиксированная кнопка ниже; при dual длинная форма прокручивается. Локальный dev process остановлен; автоматически добавленный `next dev` блок AGENTS.md удалён точечным patch после остановки, дерево clean до документального шага.

Локальные browser evidence в `/workspace/reorg-handoff-2026-10-31/` (не опубликованы):

| Файл | SHA256 |
| --- | --- |
| `v1-local-browser-check.json` | `51a15e69133383d1bed6fe48758d42d97f5681f869440d4c765d5cdd633d4391` |
| `v1-mobile-light.png` | `4b0d1bfca3ec02ebeab3fefc59bafaa13e6d96fd67c6ea5ff7ed4e5f90440c45` |
| `v1-mobile-dark.png` | `2203c936cbbef8b31af8b9f710244299ded5c917a8d8fd3c0d7db3c413f0fdc0` |
| `v1-mobile-dual-result.png` | `34590c3e2ffb61a8f0206d0041f32f746845d841ec786f78bee82a81e7ec57b4` |
| `v1-desktop-light.png` | `b8065ee1eef9339d0b4e31d9ae90f012f1d6f1d706d8d14e40557c53447f3cdf` |
| `v1-desktop-dark.png` | `c5323f0fb50bc86c3a99bb79035331cf1cf882d6052a96076c10e973edf821aa` |
| `v1-desktop-dual-result.png` | `09d922899f8e0c403780f968d2cffda7815e6cb47fd79b0342ec8a155005de8e` |

AUDIT-01 Донецк→Волноваха/Мелитополь остаётся PARTIAL и не пересматривался. Никаких новых тарифных/географических правил или Production изменений.

Следующий шаг: для полноценной Preview browser-приёмки нужен штатный авторизованный доступ к защищённому deployment (например, проектный Vercel CLI + short-lived Trusted Sources OIDC, без ослабления защиты); либо владелец выполняет собственную проверку по указанному READY URL. Отдельно восстановить production address collector/Photon и получить успешные traces AUDIT-01. Нового push без разрешения не выполнять; эта запись будет сохранена только локально с bundle.
