# Реорганизация E — обязательная проверка STARTED

31.10.2026 МСК. Исходный remote `3248ee40712056ced320d93f86d870d7f8659155`, PR №14 OPEN/Draft. D: 0 перемещений/удалений; app/lib/data/package/Next config/CI не изменялись с базы инвентаря. Node v24.19.0, pnpm 11.25.0; node_modules в новом checkout отсутствует.

План: `pnpm install --frozen-lockfile`; `pnpm test:audit`; TypeScript `pnpm exec tsc --noEmit`; `pnpm lint`; `pnpm exec next build` (без повторного test:audit внутри `pnpm build`). Затем точечные API/UI smoke V2/V3 и GeoNames при доступной среде. Сохранить stdout/stderr, exit codes и source SHA. Не запускать массовые live-аудиты маршрутов. При прерывании использовать логи и продолжить с незавершённого gate.

Архивные восстановления 316/431/14042 и 61 файлов уже фактически проверены; не повторять без изменения архивов. Статус E STARTED, новые gate пока NOT_RUN.
