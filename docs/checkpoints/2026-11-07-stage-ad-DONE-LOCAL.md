# Stage AD — DONE LOCAL / release gate BLOCKED

07.11.2026, Europe/Moscow. Isolated worktree `/workspace/stage-ad-reliability`, branch `codex/stage-ad-reliability`, base AC `2400f76001de9d88b0117b21aa7d91a6e63b7da3`; verified AC bundle SHA matches owner value. Published base last provided `8fae15c7…`; no remote write. Final runtime candidate `e4e070c8fb24b6e415029c31f4e4b2827ef010d0` follows earlier tested candidates549a7e66/35495477. Final documentation commit is discoverable in Git. Primary91 copy remains `86fd19bd…`, AC branch remains2400f760. No push/merge/Production/main/Android/PR14/archive or backup ref changes.

## A — DONE: real deadline/cancellation matrix

`withinRoutingSignal` bounds callers even if a transport ignores AbortSignal. It observes late rejections without unhandled rejection, removes listeners after settlement, and uses once-only abort listeners. `routingFetch` discards late response bodies; limited-body reader races its reads against the same provider signal, cancels stalled body, releases reader lock and preserves safe timeout cause. The native per-provider deadline remains25s. V3 adds a90s shared budget (under120s platform max) spanning body/geocode/special/normal routing asynchronous phases; request abort still yields400, server budget yields502 calculation-timeout. No retries or fabricated candidates. Synchronous CPU work cannot be preempted by JS timers.

| Temporal scenario | Observed |
|---|---|
| Each provider separately hangs while competitors work | Actual V3 handler HTTP200 for all3; real35ms timer injection only substitutes provider timeout duration |
| Slower response has faster valid ETA | Selected5000s Valhalla route over faster-arriving10000s peers |
| All3 non-cooperative fetches hang | Actual production25s expiry, API502 timeout, exactly3 calls |
| Candidate arrives before shared budget | API200, real100ms overall timer injected for bounded test |
| Candidate arrives after shared budget | API502 calculation-timeout; late settlement cannot create response |
| Caller abort / special routes / geocode / matching | Existing actual-handler cancellation regressions PASS; no toll result committed |
| Stalled response body | Real20ms expiry, body cancel invoked, timeout cause retained |
| Late response after abort / fresh operation | Late body discarded; fresh operation succeeds |

Unmodified25s test is separate from short real-clock injected deadlines; no fake timer completion claims. Runtime still waits for bounded candidate set to compare fastest admissible ETA, rather than selecting the first response. Tests preserve geometry/corridor validators. Added regression exposed metadata bug: HTTP200 reversed geometry had null HTTP status and geometryUsable=true; now known HTTP200 and validator rejection remain separate, geometryUsable=false. This changes diagnostics only, not route or tariff selection.

## B — DONE: standard environment/build restored

AC root node_modules symlink pointed outside its worktree, causing Turbopack filesystem-root panic. AD uses a real node_modules directory inside its root; ordinary pnpm internal package symlinks remain valid. Node24.19.0/pnpm11.25.0. Frozen install succeeded through authorized network command after sandbox EPERM. Store `/workspace/stage-ad-pnpm-store`; previous store retained. `--config.manage-package-manager-versions=false` avoids fallback auto-install outside writable roots and does not change package scripts/dependencies. Lockfile/package.json unchanged.

Exact standard command: `pnpm --config.manage-package-manager-versions=false build` (mandatory npm test:audit + next build). Final full offline1158 tests:1157 PASS/0 FAIL/1 SKIP; quote/API adapters PASS; standard Next16.3.4 Turbopack compiled, TypeScript and prerender PASS. No Webpack substitution or check suppression. Final full gate/build was repeated on stable candidate e4e070c8 after exact-status refinement; earlier35495477 build preserved separately.

## C — DONE for controlled local built UI

Playwright-core1.56.1 installed outside repo at `/workspace/stage-ad-tools`; system Chromium. Local server port3208 with exact candidate version checked; explicit local GeoNames pilot/test flags. Actual built JS/React/browser, controlled `/r` and `/api/v3/calculate`, analytics blocked to prevent Sheets writes. Desktop1280×900:14/14; mobile390×844:14/14 PASS. Scenarios: empty-state disable; A/B selection; controlled street refinement; clear/re-enter A preserving B; clear B preserving A; reverse; calculation/day duration/unknown toll; provider error; retry; clear pending calculation; late response protection; repeat and no horizontal overflow. Browser pageerrors empty. Screenshots inspected. Initial harness selector Куда also matched Откуда, fixed exact accessible-name matching; initial report preserved as harness evidence.

V3 duration bug fixed: 25h now1д1ч; zero components omitted and clipboard matches. Shared legacy V2 duration() remains unchanged, V3 fastest-summary opts in to durationWithDays(). Existing SSR/copy/V2 regressions pass.

Levels: real local built UI + controlled API PASS; local API + live external providers separately tested below; no fully live browser route flow claimed; hosted Preview/Production/Actions NOT_RUN. Final app-code e4e070c8 differs from live diagnostic build176e only in safe provider validation metadata; live calls were not repeated after that correction.

## D — PARTIAL: four live street queries and independent offline filtering

Exactly4 logical live /r queries, no repeats:

- Краснодар Красная:HTTP200, three OSM street ways returned, matching Краснодар context.
- Москва Тверская:HTTP200, W-427579315 street returned, matching Москва context.
- Донецк ДНР Артёма:HTTP200 partial, GeoNames settlement-only output; not a street success.
- Ялта Кирова:HTTP200 partial, GeoNames settlement-only output; not a street success.

Returned street IDs/labels passed existing runtime geographical-context checks. No independent cartographic survey or house accuracy claimed. Exact coordinates were not retained in result summary. Existing stored street-context/foreign-city namesake tests in full suite prove filter behavior; no invented street/fallback data added. The missing two live compatible streets remain source/coverage limitations; city remains selectable. No new address runtime defect independently established. No unsupported new street source/Nominatim autocomplete used.

## E — DONE: two current bounded diagnostics, historical cause unknown

One live POST per direction, original saved positions and 2026-10-02T09:00:00+03:00 standard vehicle/mode, source176e1d8e. Script `stage-ad-live-diagnostics.mjs` targets loopback only. No retries, no raw provider geometry saved.

| Direction | Result | Provider outcomes | Toll status |
|---|---|---|---|
| Тверь→Адлер |200;1836.455km;90093s (25h1m33s) |OSRM200 selected; Valhalla400; BRouter400 |unknown |
| Голубицкая→СПб |200;2210.036km;101385s (28h9m45s) |OSRM200 selected; Valhalla400; BRouter successful2xx/exact code not retained, rejected geometry |priced (amount not separately audited) |

End-to-end12.4s/20.1s, including toll matching;10s remains target, not guarantee. Public provider labels/validation retained; unavailable providers did not lose OSRM success. ProviderHTTP400 response bodies not collected, so internal provider rejection detail unknown. These are current observations, not reconstruction of historical502. Full all-unusable API502 proven by deterministic regressions. Amounts/geometry were not adjusted based on these outcomes.

## F — DONE proposal, owner decision pending

See `docs/TARIFF_FRESHNESS_GATE_PROPOSAL.md` and isolated evaluator/tests. Proposed separation: old observation warns; source integrity/product/period/edition conflicts block. This proposal does not certify the two current other-roads rows. EffectiveFrom/observedAt/prices/30day threshold and mandatory CI unchanged. Actual strict freshness exit2:2stale/0invalid/3unknown-effective dates. Permission required specifically to alter mandatory release-blocking freshness contract; proposal alone cannot make gate green.

## G — local acceptance complete with limits

- Final standard pnpm build/full offline:1157PASS/0FAIL/1SKIP plus quote/API PASS.
- TypeScript separate final invocation exit0; ESLint0errors/9existing warnings.
- Native25s and real short-clock temporal/provider/fallback/cancel/validator regressions PASS.
- Local exact-version browser14desktop+14mobile PASS; API smoke16/16 PASS, no successful external provider requests in smoke.
- Benchmark61 records PASS, final-gate workflow contract6/6 PASS; JS syntax and StageAD diff whitespace PASS.
- No changes to tariff runtime/registries/data, pricing module, .github workflows or Android; V2 default formatter preserved. No2GIS calls/materials.
- Production/Preview/hosted CI NOT_RUN, strict freshness remains BLOCKED. No demonstrated new P0/P1 remains in tested flows; unknown external availability and two street coverage gaps are explicit, not certified away.

Evidence/manifest alongside this checkpoint. Local server stopped after acceptance. Ready for owner review and separately authorized controlled publication/hosted CI, not a claim that full mandatory release gate passed. Next concrete decision: approve/reject freshness policy proposal and authorize exact candidate push if desired; retain source/street limitations.
