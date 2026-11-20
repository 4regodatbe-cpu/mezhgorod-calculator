# Реорганизация E — обязательные проверки PASS, браузер/live NOT_RUN

31.10.2026 МСК. Исходный remote `57138b61240ab06d2886a0ee683e34c804977e65`, PR №14 OPEN/Draft. `git diff e3ca3783..HEAD -- app components lib data scripts package.json pnpm-lock.yaml next.config.ts .github` — пусто: рабочий runtime соответствует утверждённому V1 Release; изменены только архивы и документация.

Node v24.19.0, pnpm 11.25.0, Next 16.3.4. Первое `pnpm install --frozen-lockfile` exit254: default store недоступен; та же установка с `--store-dir /workspace/reorg-handoff-2026-10-31/pnpm-store` exit0. `pnpm test:audit` exit0: 1067 PASS, 0 FAIL, 1 SKIP. `pnpm exec tsc --noEmit` exit0. `pnpm lint` exit0: 0 errors, 7 warnings. `pnpm exec next build` exit0; приложение собрано, `/v2` и `/v3` присутствуют. Raw stdout/stderr: `docs/reorganization/checks/*.log`, машинная сводка `RESULTS.json`.

Локальный production server с изолированным `GEONAMES_LOCAL_PILOT=1 GEONAMES_LOCAL_TEST=1`: GET `/v2`, `/v3` HTTP200; POST `/r` для Краснодара, Донецка, Волновахи, Мариуполя, Мелитополя, Ялты, Москвы, Санкт-Петербурга — 8/8 HTTP200, источник GeoNames. Донецк ДНР первый, Ростовский одноимённый вариант сохранён. Первое smoke assertion ошибочно требовало строчную «область» в подписи и дало exit1; исправлена только проверка регистра, повтор exit0. Адреса/маршрутизаторы не подменялись; внешних маршрутов этот smoke не вызывал.

Новый desktop/mobile браузер: NOT_RUN, исторический RC1 browser нельзя называть текущим запуском. Новый live расчёт: NOT_RUN; обязательные сохранённые маршрутные регрессии входят в offline gate. Следующее F: записать финальный PARTIAL с B/C/D ограничениями; Product Release и PR не менять.
