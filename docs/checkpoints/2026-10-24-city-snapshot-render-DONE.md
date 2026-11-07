# DONE — SSR-контракт резервного города, 24.10.2026 МСК

STARTED remote c51dd81a1a0107e3e46fb6ba2dced79ea8f5d551; branch fix/v3-missing-route-prices-2026-10-15, PR14 draft. Изменён только тест scripts/v3-calculator-form-ui.test.mjs плюс evidence/docs; продуктовый код, данные и snapshot false сохранены.

Добавлены 3 проверки реального HTML: notice+OSM/ODbL href у выбранного fallback в A/B при перестановке props; две подписи для двух fallback; нет stale notice после clear/edit/ordinary props. Это не клик по swap/clear и не browser E2E. React useEffect/запросы/таймеры не запускались.

Actual: focused5/full898/quoteAPI/whole ESLint0errors5warnings/webpackTypeScript/static16 PASS, git diff --check PASS. Точные команды/SHA/logs: experiments/road-ref-boundaries/checks/2026-10-24-city-snapshot-render/verification.json. Полный selector прежний, concurrency2, пропусков/ослабления timeouts нет. Новых live/route probes 0.

NEXT после exact remote save: уточнить браузерный acceptance checklist в ADDRESS_CITY_SNAPSHOT.md. UI E2E NOT_RUN из-за отсутствия Chromium; не повторять поиск/установку без изменившихся предпосылок. Перед активацией требуется UI review и freshness, snapshot не включать. Main/Production/Android/backup не затронуты.
