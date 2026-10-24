# BLOCKED — address search fix verified locally; remote save requires approval

19.10.2026 21:55 МСК. Source head `2ddc6112c3c2f7ad802485408d765449268e8a6b`, authorized branch `fix/v3-missing-route-prices-2026-10-15`, PR #14 open/draft. This checkpoint records work in the local sparse checkout only. Prior latest Actions run was `39290446095`, completed/success; no new run was started.

## Completed locally

- Confirmed point A and point B use the shared address component and `/api/suggest` path.
- Live published API query «Краснодар»: HTTP 200 with suggestions, 8.224717 s. Direct Photon query: HTTP 200, 6.779325 s. The actual point-B address was not supplied; the user's exact miss has not been reproduced.
- Added `lib/photon-fetch.ts`: 10-second hard request deadline, upstream AbortController, propagation of the incoming request cancellation, response status/JSON validation, and unchanged Next `revalidate: 300` behavior.
- Updated `app/api/suggest/route.ts` to use the helper. `Promise.allSettled` and partial-source success remain unchanged; address ranking, coordinates, and toll logic were not changed.
- Added `scripts/photon-fetch.test.ts` for successful payload, timeout, caller cancellation, and HTTP error.

## Actual checks

- `pnpm install --frozen-lockfile`: exit 0.
- `node --import ./scripts/register-ts-paths.mjs --test scripts/photon-fetch.test.ts scripts/address-search.test.ts`: 39/39 passed.
- `pnpm exec eslint app/api/suggest/route.ts lib/photon-fetch.ts scripts/photon-fetch.test.ts`: exit 0 after correcting initial unused-import/prefer-const findings.
- `pnpm exec tsc --noEmit`: exit 2 because this sparse checkout lacks existing ZSD source-snapshot JSON imports used by unchanged `lib/v3-calculation` files. Full test audit/build were not run. No new CI result exists.

## Remote-save blocker and state

Attempt to publish a documentation checkpoint commit to the public GitHub branch was rejected by automatic approval review. The reason stated was that the remote commit would publish project/operational details externally without authorization. No alternate GitHub connector write or other remote transport was attempted. This does not erase the user's past authorization recorded in project context; the automatic review rejected the current operation. The code and records remain local and have not been committed or saved remotely. No production release, merge, or Android update was performed.

## One next step

Ask the user for explicit approval to save the locally verified patch and handoff to the already authorized public GitHub branch. Before any future write, re-read and verify its branch head and PR state. After approved save, run the required full gates and inspect CI; leave production unchanged without a direct release request.

## Дополнение — 19.10.2026 22:02 МСК

Локальная копия сохранена двумя локальными коммитами: `6a69402` (STARTED checkpoint) и `75dc258c0e8355995d1b264720043394399876c8` (код, тесты и BLOCKED handoff). Они существуют только в текущем sparse checkout; remote branch фактически не обновлялась и readback нового SHA не выполнялся. Утверждение выше «не committed» относится к remote persistence, а не к локальным Git commits. Не публиковать эти commits без явного разрешения и повторной проверки head.

## Дополнение — 19.10.2026: повторный адресный поиск

После вопроса пользователя об ускорении добавлен общий browser-side LRU cache для непустых подсказок полей A/B: нормализация регистра/пробелов/ё, TTL 5 минут, максимум128 query keys; пустые результаты не сохраняются. Это ускоряет повтор того же поиска между полями, но не первый поиск. Три live API observations для одного «Краснодар»: 8.224717 с, позднее 9.202622 с, затем немедленный повтор 6.373840 с. Все получили результаты; variation не доказывает cache effect и first-request latency не устранена.

Дополнительно создан `lib/address-suggestion-cache.ts`, подключён `app/v2/components/address-field.tsx`, тесты `scripts/address-suggestion-cache.test.ts`. Объединённый focused suite теперь 42/42, targeted ESLint PASS. Это изменение пока только в рабочем дереве после commit `270d7a2`; не в remote/Production. Новые remote-write попытки не предпринимались.
