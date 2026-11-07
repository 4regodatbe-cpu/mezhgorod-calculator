# Stage AC — PARTIAL LOCAL, 07.11.2026 (Europe/Moscow)

Base Stage AB `1f4987f9e49f519480c7eda7359cab2c3b19885b`; isolated branch `codex/stage-ac-reliability`. Runtime/test implementation `f3db8239…`; expanded test `1fa76aa8…`. No remote changes; PR14 Draft left untouched. Main 91-commit copy and safety refs untouched.

## A — provider diagnostics implemented

`lib/routing-attempt.ts` defines safe typed failures and attempts. Shared fetch wrapper retains HTTP429/500/502/503/504 and classifies network versus signal timeout/cancellation. JSON parse causes retained by limited-body reader; geometry absence, reversed/invalid candidate, mandatory corridor and quality validation are distinguishable. Malformed HTTP200 structures are not declared genuine no-route. OSRM explicit NoRoute is recognized. Legacy public Error messages for shared provider functions preserved for V2; no V2 source changed.

V3 `route-leg.ts` records elapsed time, provider, attempt kind, status, safe failure code, available HTTP status, geometry/validator status and selection into request-local `calculation_timing` summary. No coordinates, provider URLs, raw payloads, arbitrary exception messages or stack traces added to logs/public API. Timing remains optional. Rejected raw provider attempts have null HTTP where not known. Byte-limit/UTF8/internal failures are not all fully distinguished yet. DNS remains under network; no exact DNS code is asserted.

## B — deterministic outcomes and remaining matrix

Actual V3 handler tests verify all three providers independently as sole valid candidate, each combined with HTTP503, injected typed timeout, reversed competing geometry and delayed failure (12 combinations). Another case rejects all reversed geometries with 502; previous two OSRM survival cases remain. All-provider503 and caller cancellation regressions pass. Simulated delays are 15ms; they do not prove real 25s expiry. No retry/cooldown changes introduced. Selection still waits on bounded parallel candidates to preserve fastest admissible choice.

V3 aggregates homogeneous known no-route / timeout / mandatory-corridor failures into safe distinct messages. Mixed/unknown failures remain upstream502. Cancellation remains existing HTTP400. No fabricated geometry/fare fallback.

Open: total operation budget is not introduced or independently exercised; genuine hanging-provider timeout, body-timeout/abort diagnostic details, mixed-success timing and every required corridor API scenario still need dedicated assertions. Do not claim full B1 12-scenario acceptance. Historical Tver→Adler and Golubitskaya→SPB root causes remain unrecoverable from StageAA evidence. New diagnostics support a future authorized capture; no live route calls made.

## C/D — addresses and UI

Admitted local GeoNames corpus returns selectable finite-coordinate results for Краснодар, Горячий Ключ, Ростов-на-Дону, Донецк ДНР, Волноваха, Мелитополь, Ялта, Симферополь, Москва, Казань; Donetsk Ростовская область is a different ID. This is controlled local/pilot coverage, not certification of Production flags. Existing street-context/503/pool/recovery/endpoint suites pass and preserve settlement fallback, regional namesake exclusion and cancellation. No new address defect independently reproduced, so no address runtime change.

Existing hook regressions confirm late-response/reset/unmount protection, clipboard consistency and best-effort analytics. Seven address/UI suite files PASS, not seven real browser journeys. Real four street controls, desktop/mobile A/B selection, reverse and repeated user calculations remain browser NOT_RUN. Chromium binary exists but Playwright dependency is absent in this worktree; no installation or hosted workflow run made. No Preview test claimed. Street reserve architectural gap remains; city-only GeoNames is not a street reserve.

## E — six controls

Reuse StageAB saved table only: Yalta→Krasnodar 200/501.2km/416min/OSRM/A289 component800; Yalta→Moscow 200/1817.8km/1476.8min/Valhalla/4725 weekday5625 weekend; Donetsk→Kazan 200/1534.9km/1424.4min/provider not preserved/toll unknown; Moscow→Kazan 200/820.2km/687.9min/Valhalla/toll unknown; Tver→Adler and Golubitskaya→SPB 502 without provider causes. No post-change live results or new corridor/price proof. Toll values/registries unchanged.

## F — exact verification

- Initial scripts-only offline: 126/126 file entries PASS (not full audit).
- Full mandatory offline with authorized subprocess access on runtime implementation: 1149 tests, 1148 PASS, 0 FAIL, 1 SKIP; quote and API adapter PASS.
- Expanded sole-provider matrix added afterwards: targeted file PASS, 12 combinations plus all-invalid and prior OSRM cases. Full gate not rerun after test-only expansion; runtime unchanged.
- TypeScript direct binary PASS after final test change; ESLint full exit0/9 existing warnings. `pnpm exec` initially attempted forbidden/outside store auto-install and exited254; direct installed binaries used and commands explicitly recorded.
- `npm run build`: offline PASS as above; standard Turbopack FAILED on external node_modules symlink (filesystem-root limitation). Explicit `next build --webpack`: PASS, compilation/TypeScript/prerender complete. This does not equal standard build PASS.
- local built server port3207 API smoke16/16 PASS, stopped afterwards; no successful provider requests used. Benchmark integrity61 PASS; workflow harness6/6 PASS.
- Initial ordinary sandbox full audit had three known subprocess failures. Authorized subprocess rerun resolved all three. No tests weakened.
- Historical five Markdown hard-break whitespace findings remain in StageAA checkpoint; StageAC diff check clean.
- No hosted CI/Preview/browser result. Two stale tariff metadata entries from StageAB remain outside AC.

Logs under `docs/checkpoints/evidence/stage-ac/`; checksums/source manifest alongside this checkpoint. No evidence of new P0/P1 in tested controlled cases; live route availability and remaining acceptance are open. Next: complete specific temporal/corridor failure matrix and real local browser flow, then standard build with dependencies within root. Push requires separate permission.
