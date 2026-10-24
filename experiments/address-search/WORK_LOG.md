# Address search work log

## 2026-10-19 — point-B search latency

- Request: user reports that the calculator does not find the destination address (point B).
- Source: on authorized branch `fix/v3-missing-route-prices-2026-10-15`, PR #14 draft, source head `2ddc6112c3c2f7ad802485408d765449268e8a6b`.
- Diagnosis: A and B share `app/v2/components/address-field.tsx` and `/api/suggest`; the API fans out to all Photon URLs with `Promise.allSettled`, without a deadline or propagation of the browser's abort signal. Published API probe for «Краснодар» returned suggestions but took 8.224717 s; direct Photon took 6.779325 s. The exact destination reported by the user was not provided, so an address-specific miss was not reproduced.
- Changed locally: `lib/photon-fetch.ts` adds a 10 s hard timeout, aborts upstream work when the browser cancels, preserves the 300 s Next fetch revalidation, and validates Photon JSON. `app/api/suggest/route.ts` uses the helper while retaining partial-result behavior. `scripts/photon-fetch.test.ts` covers successful results, timeout, caller cancellation, and HTTP 503.
- Checks: `pnpm install --frozen-lockfile` succeeded; `node --import ./scripts/register-ts-paths.mjs --test scripts/photon-fetch.test.ts scripts/address-search.test.ts` passed 39/39; targeted ESLint passed after a first invocation found an unused import/prefer-const issue that was corrected. `pnpm exec tsc --noEmit` was attempted and failed because sparse checkout omits existing `experiments/nationwide-tolls/source-snapshots/zsd/*.json` imported by unchanged calculator modules. Full audit/build and new CI were not run.
- Save status: local branch only. Automated approval review rejected the public GitHub push as unapproved external publication; no connector or alternate remote-write path was attempted. No remote code commit, CI run, merge, or Production deployment was made. Production remains unchanged.
- Next: after explicit authorization for the GitHub write, verify the remote head is still the source commit (or safely reconcile), save this patch and checkpoint to the authorized branch, then run required full gates and inspect CI. A deployed fix still requires a direct production-publish request. Ask the user for the exact point-B address if the failure persists after the bounded change is deployed.

### Local persistence correction — 19.10.2026 22:02 МСК

The initial STARTED record is local commit `6a69402`; the source/test/BLOCKED package is local commit `75dc258c0e8355995d1b264720043394399876c8`. The automatic review rejected the attempted remote push, so the origin branch remains at the prior source commit to our last remote read (`2ddc6112c3c2f7ad802485408d765449268e8a6b`). No remote readback of the local commits, CI, or production deployment occurred. Local commits preserve the work in this workspace but do not meet the project's durable remote-save requirement.

## 2026-10-19 — repeat-query speed cache

- User asked whether address search can be accelerated. A repeat published API request returned in 9.202622 s; an immediate repeat returned in 6.373840 s. Both returned 20 suggestions. The variation does not isolate caching or provider/network effects, and Photon itself remains the dominant unverified latency source.
- Added a browser-side normalized LRU cache shared by the A/B fields: non-empty results are reused for five minutes, at most 128 query keys. Empty results are not cached. New files: `lib/address-suggestion-cache.ts`, `scripts/address-suggestion-cache.test.ts`; integration in `app/v2/components/address-field.tsx`.
- Validation: combined focused suite passed 42/42; targeted ESLint passed. No full build, full audit, remote update, CI or Production release.
- First lookup remains externally bounded by Photon and is not claimed faster. The automatic review rejection was superseded by the user's explicit authorization.

## 2026-10-19 — authorized save and full preview build

- Rechecked branch and PR #14 immediately before writing: source head was `2ddc6112c3c2f7ad802485408d765449268e8a6b`, PR open/draft. Saved the combined change as commit `b8c3766aa3163c0e9e0c0d4310ac22ac46dd1a29` on the authorized branch; verified the branch head and PR head match.
- Vercel Preview deployment `dpl_F3ftRbQdneZEoJrhZ3XfgoJHESMy` reached READY. Its full `pnpm build` ran `test:audit`: 809 passed, 0 failed; quote/API checks passed; Next compiled successfully and generated 16/16 static pages. New Photon timeout/cancellation and address-cache tests appeared in the passing audit output.
- Preview `/api/suggest?q=Краснодар` returned HTTP 200 and 20 suggestions. This control does not reproduce the exact address the user reported.
- PR remains draft/open. No merge or Production release was performed. Exact next step only if the issue persists after eventual release: collect the literal point-B query and reproduce it before changing provider/ranking logic.

## 2026-10-19 — screenshot follow-up: Photon connection timeout

- User screenshots show the failure persisted in preview for «Ростов», partial «Красн…», and partial «Моск…».
- Reproduced via the current preview API: those three queries returned HTTP 502; a simultaneous control for «Краснодар» returned HTTP 200. Vercel runtime diagnostics showed 8 `ConnectTimeoutError` failures to `photon.komoot.io:443`, all from function region `iad1`, each at the configured 10-second deadline.
- The UI submits through `POST /r`. Inspection found that proxy rebuilt `NextRequest` without the original `request.signal`; additionally, Vercel request cancellation is opt-in for Node functions. Thus the previous abort propagation did not stop obsolete Photon requests for this UI path.
- Local follow-up: `app/r/route.ts` now forwards the request signal; `vercel.json` assigns only `/r` and `/api/suggest` functions to `fra1` and enables `supportsCancellation`. Added `scripts/address-search-proxy.test.ts` to ensure signal aborts pass through the proxy. This targets the observed connection timeout while keeping unrelated functions in their existing region.
- Checks: focused address/Photon/cache/proxy suite passed 43/43; targeted ESLint, JSON parse and `git diff --check` passed. The region/proxy patch has not yet deployed to Preview; live behavior remains unverified.
- Next: save on the authorized branch, wait for Vercel preview build, verify function region `fra1`, then probe the three screenshot queries and the `/r` POST path; inspect runtime error counts. Do not mark fixed unless these succeed. PR #14 remains draft; no Production release.

### Preview verification and region-config correction — 2026-10-19

- The first follow-up commit built successfully, but live queries on its preview were mixed: «Ростов» and «Моск» returned HTTP 200; «Красн» and «Краснодар» returned HTTP 502.
- The response header showed `x-vercel-id: fra1:iad1:...`: request entered the Frankfurt edge, but the function still ran in `iad1`. Per-function `vercel.json` path settings alone did not move the Next App Router functions in this deployment.
- Added Next.js route segment `export const preferredRegion = "fra1"` to both `app/r/route.ts` and `app/api/suggest/route.ts`, retaining Vercel `supportsCancellation`. This is a corrective attempt; verify the next deployment's actual runtime region and same query set.
- Do not treat earlier mixed responses as a pass; runtime still returned 502. Newest commit/build/live probe is pending.


## 2026-10-19 — final preview verification

- Latest authorized branch head `b82e951875284b3ef1cacbf09b78be0811d1365a` is PR #14's open/draft head; Vercel Preview deployment `dpl_B9R6u4Y4eMiVrFEumgQwb4Qigwyf` is READY and its Vercel status is success.
- Replayed GET `/api/suggest` for «Ростов», «Красн», «Моск» and «Краснодар»: all returned HTTP 200. For «Ростов», «Ростов-на-Дону» appears among the first three ranked suggestions. Response headers included `::fra1::` in `x-vercel-id`.
- Focused address-search/proxy/Photon/cache tests passed 43/43. The test confirms that `POST /r` forwards the incoming abort signal. A live POST was not executed: the available protected-preview fetch connector supports GET only. Do not infer POST live behavior beyond the passing proxy regression test.
- No merge or Production deployment. If the user's original UI still shows the unavailable message on this preview, the next needed evidence is the exact full typed query and approximate attempt time so its POST request can be investigated.


# DONE — публикация исправления поиска адресов, 20.10.2026

## Авторизация и выпуск

Пользователь прямо поручил «Публикуй с исправлением». STARTED checkpoint сохранён коммитом e47ec8f8c0760bc0f28720d48216bc8763a79bb6; readback PR #14 подтвердил его head. Создан отдельный Production deployment dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP из точного проверенного source 4b647bfe01c903352f3842072ceafb23ea6d10a2. Vercel READY; target=production; aliasError=null. Оба основных alias mezhgorod-calculator.vercel.app и mezhgorod-calculator-4regodatbe-5310.vercel.app через get_alias подтверждены за этим deployment. PR #14 остался open/draft; merge и изменение main не выполнялись.

## Фактические проверки

Production build: 810 tests / 810 pass / 0 fail; quote/API contracts PASS; Next compiled successfully; static generation 16/16; Build Completed. Production GET / вернул HTTP200 и метку актуального калькулятора. GET /v2 — HTTP200 и «старый алгоритм». GET /api/suggest для «Ростов», «Красн», «Моск», «Краснодар» — каждый HTTP200, 20 подсказок; для «Ростов» среди первых трёх есть «Ростов-на-Дону».

Скан error runtime logs нового deployment за последние 5 минут: No logs found. Это ограниченный скан, не доказательство отсутствия всех ошибок. Полный интерактивный сценарий A→B и live POST /r в этом выпуске не проверены; authenticated connector выполняет только GET, существующего authenticated Vercel CLI в среде нет. Не считать GET проверкой UI. Прокси abort propagation ранее покрыт focused regression (43/43).

Опубликованы ранее проверенные изменения timeout/abort, общего LRU cache и региона адресных handlers. Тарифная матрица и аудит в этом выпуске не редактировались. Evidence: 2026-10-20-address-search-production-evidence.json. Следующий шаг — при повторном отказе UI сопоставить точный запрос и время с POST /r; не повторять полный тарифный аудит.


## 2026-10-20 — exact repeated-edit UI scenario

See [bounded UI evidence](../../docs/checkpoints/2026-10-20-repeated-address-search-UI.md). Two calculations passed; first full Донецк search passed; subsequent fresh prefix Доне failed while cached full query worked. No precise upstream cause established; current API suppresses errors. Diagnostics/resilience remain IN_PROGRESS, no new release.


## 2026-10-20 — short deadline regression and sanitized diagnostics

[Patch checkpoint](../../docs/checkpoints/2026-10-20-repeated-address-search-PATCH.md): Production prefix Доне502; direct Photon20features after11.272841s exceeds our10s. Hard limit20s, cancellation retained, no retry fanout; safe all-source failure counts. Focused45/full819 + quote/API/ESLint/webpack buildPASS. Preview live pending; exact Production upstream failure not yet classified, no new release.


## 2026-10-20 — Preview full-story verification complete

[Verified checkpoint](../../docs/checkpoints/2026-10-20-repeated-address-search-VERIFIED.md). Source4f62abf/tree0808d21e matches local and remote; Previewdpl_646vu3uc3f4dJzFmQDLpaPRL9svL READY/statussuccess, standard build819/819 + compile/static16/16PASS. Actual fresh-origin UI POST ДонеPASS; exact two-calculation/X replacement sequencePASS including selecting Донецк—ДНР. Screenshot/build proof retained. Underlying old Production individual failures cannot be classified retrospectively; valid11.27s response demonstrates10s timeout regression, corrected20s tested. No new Production release.
