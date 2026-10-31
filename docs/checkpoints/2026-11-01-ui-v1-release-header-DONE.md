# UI-01 — заголовок V1 Release — DONE

Дата 2026-11-01. Основание: утверждённое пользователем продуктовое имя **V1 Release**, при сохранении принятого дизайна.

Рабочая ветка `fix/v3-missing-route-prices-2026-10-15`; базовый HEAD до UI-правки `a3d7fbec4e2cf64fd11a1f7d592556e49c043b60`; точный исходный UI commit `f63fb41ce8c06553f8328574258fe41ee00e1131`. PR №14 OPEN/Draft.

Изменён `app/v3/page.tsx`: только строка `Актуальный калькулятор · один самый быстрый маршрут` → `V1 Release · один самый быстрый маршрут`. Создан `docs/ui-v1-release/README.md` с подтверждённой структурой UI и списком будущих вопросов, которые ещё не разрешены на изменение. Runtime тарифов, GeoNames, маршрутизация, структура дизайна, старый /v2 не менялись.

Фактические проверки:
- GitHub readback точного commit `f63fb41ce8c06553f8328574258fe41ee00e1131`: новая подпись присутствует, старая отсутствует — PASS.
- GitHub Actions B03 address UI run `41251210382`: completed/SUCCESS.
- GitHub Actions Special territory geometry and pricing run `41251210383`: completed/SUCCESS.
- Vercel Preview `dpl_ENRgrowFr9Uv6spwpcPngPvek6WN`: READY на `f63fb41ce8c06553f8328574258fe41ee00e1131`, target preview.
- Авторизованный HTTP GET Preview `/v3`: HTTP 200; новая подпись в HTML есть, прежняя отсутствует — PASS.
- Настоящий интерактивный mobile/desktop visual browser тест **NOT_RUN**: Opera connector UNAVAILABLE (30s), не повторялся.
- Новые локальные pnpm tests/TS/ESLint/build напрямую в этом чате не запускались; CI результат записан отдельно. Не смешивать виды доказательств.

Решение: UI-01 DONE в рабочей песочнице; **Production НЕ ОБНОВЛЯЛСЯ**. Следующее: обсуждение конкретных пользовательских UX-требований и их проверка на реальном экране, начиная с UI-02 (повторный расчёт на телефоне), UI-03 (неподтверждённый адрес), UI-04 (диагностика на основном экране). Не выполнять широкий редизайн или менять алгоритм.
