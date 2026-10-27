# Codebase audit fixes — work log

## 27.10.2026 05:40 МСК — block21 nullable address-result group 3 DONE

- Added explicit result/position assertions in three ranked-address cases and guarded an optional position read; no ranking expectation weakened. Strict errors45/22→41/21. Test1/1, scoped ESLint and diff PASS.
- Temporary typecheck config removed; no CI gate adopted. [Checkpoint](../checkpoints/2026-10-27-0540-block-21-nullable-search-results-DONE.md). Progress21/24 unchanged.

## 27.10.2026 05:30 МСК — block21 collector options mock group 2 DONE

- Typed the optional collector options/signal in `scripts/address-runtime-probe.test.ts`; no runtime behavior changed. Strict diagnostic count45/22 after this group (prior46/23); test1/1, scoped ESLint and diff PASS.
- Temporary typecheck config removed; overall gate not adopted. [Checkpoint](../checkpoints/2026-10-27-0530-block-21-collector-options-DONE.md). Progress21/24 unchanged.

## 27.10.2026 05:22 МСК — block21 fetch-mock typing group 1 DONE

- Strict scripts/tests typecheck remains experimental: baseline57 diagnostics/24 files. Typed the mock fetch contract in `scripts/address-probe-timeout.test.ts`; 11 diagnostics cleared, remaining46/23 files. No assertions or runtime logic changed.
- Test1/1, scoped ESLint, `git diff --check` PASS. Temporary strict config removed after the check; this is not a ready CI gate. Details: [checkpoint](../checkpoints/2026-10-27-0522-block-21-fetch-mock-types-DONE.md).
- Overall progress21/24 unchanged; continue another bounded type group.

## 27.10.2026 — редакционная подготовка рабочих сводок к сохранению

- Connector returned file-level risk messages without identifying an exact matched line. Static review found no credential assignment in the current working documents; the historical release details in WORK_STATE were redundant there and are now represented by a link to the unchanged release evidence. Two test summaries no longer repeat private-looking synthetic strings; the tests and immutable checkpoints remain unchanged.
- The local recovery commit remains intact. Computation profiles, their source/result SHA values, new profiler and checkpoint are unchanged. No security check was weakened and no alternate publication path was used.

## 27.10.2026 04:45 МСК — reliability block20 bounded offline profiling DONE

- Parent remote `c653fa9b1045c6f2b9adfee1488b12a30bf239cf`; allowed branch; PR14 Draft; no active Actions.
- Added `scripts/offline-provider-route-profile.mjs`: retained Eisk and Maykop Valhalla bodies go through the actual provider parser/decoder/geometry validation/evidence derivation behind a fetch stub. Eisk9,433 points median9.0735ms/p9524.1062; Maykop9,677 median6.1167ms/p9510.2225. Mocked calls24 total, network0; output geometry SHA/count exactly match the saved compute profiles.
- Existing operation benchmark result SHA values match across Eisk/Maykop fixtures. Old call-local cache optimization not repeated. Profiler assertions, syntax and JSON/provenance checks PASS; no runtime/tariff/routing edits.
- Acceptance DONE for bounded offline profile; limitations (no E2E/provider wait/SLA/multi-road missing-tariff fixture) in [checkpoint](../checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md). Progress21/24 (87.5%). Next block21 bounded type remediation.

## 27.10.2026 04:30 МСК — reliability block18 road-combination boundaries DONE

- Parent remote `a0827a5a4d2e7d0b3b33bb4424ce8604c61013ad`; allowed branch, PR14 Draft; no active Actions.
- Three focused offline files PASS: `systemic-toll-composition-test.ts`, `v3-m4-a289-composition.test.mjs`, `v3-road-availability-audit.test.ts` (command and limits in [checkpoint](../checkpoints/2026-10-27-0430-block-18-road-composition-DONE.md)).
- Confirmed unknown for incomplete components, no M4/A289 duplicate/mixed charge, M12 chosen geometry direction/span boundaries, and M11 departure-day fare behavior. No mass/live route audit, no tariff or business-logic edits.
- Bounded block18 acceptance is DONE; total20/24 (83.33%). A single live route crossing all covered facilities was not tested. Next address block20 residual offline coverage.

## 27.10.2026 04:18 МСК — block20 saved Maykop profile PARTIAL

- Parent remote `e4bee8241a1b52dc64d7bb4c00dec24f78ae921c`; branch allowed, PR14 Draft; no Actions on parent.
- Added a route selector to `scripts/offline-computation-profile.mjs` and profiled the saved Maykop source. Source SHA256 `97465139af01510b4439ac494d56fb008b78177ce15efd05edb8996b66934366`; geometry9,677 points, SHA256 `086f162a7802af547a1d23774736befd1436cc18cb9a7de3f0c7b65cf5106a10`; 0 network requests.
- Four real-geometry operation result hashes match saved Eisk baseline; medians are descriptive only, not controlled before/after. `node --check`, JSON/hash checks and `git diff --check` PASS. No app/tariff/routing-rule changes.
- Checkpoint [block20](../checkpoints/2026-10-27-0418-block-20-maykop-profile-PARTIAL.md). Block remains PARTIAL and overall remains19/24; pipeline stages plus multi-road/missing-tariff evidence remain open.

## 27.10.2026 04:08 МСК — focused combined regression, block23 PARTIAL

- Parent `5dd4222a2096eaef32282af424994aa3d18515d7`; allowed branch only, PR14 Draft; no active parent Actions.
- Combined18 relevant API/UI/provider suites passed across changed areas in blocks11/14/16 and related V2/V3 contracts: body/label/collect bounds and deadline; route provider size/geometry; API errors; V2 unknown/null, recovery and lifecycle; V3 pipeline, route selection, copy/render.
- `npx tsc --noEmit` PASS; scoped ESLint on affected source/tests PASS; `git diff --check` PASS. No live router/webhook, browser or broad audit/build.
- This is partial block23 evidence, not its full build/audit/CI acceptance. No source change and no progress increment. Checkpoint [focused regression](../checkpoints/2026-10-27-0408-block-23-focused-regression-PARTIAL.md). Next: continue block20 profile fixture/stage coverage, without rerunning the already completed cache optimization benchmark.

## 27.10.2026 03:52 МСК — reliability block21 TypeScript trial BLOCKED_FOR_ADOPTION

- Parent `642c61a531659d1d66e5eae7ba7ec834397096d6`; allowed branch only, PR14 Draft; no Actions on parent.
- A temporary strict noEmit config for TS tests/scripts was evaluated and removed because it produced57 errors across24 files. Categories:3 Next RequestInit augmentation,12 mock/response assignment,21 nullable/optional,4 invalid object props,12 fixture/argument mismatch,4 stale `priceConfirmation` accesses,1 missing toll validation message.
- Root application `npx tsc --noEmit` passed. A separate typecheck would reveal useful debt but is not ready for use; strictness was not relaxed. Exact paths/command in [checkpoint](../checkpoints/2026-10-27-0352-block-21-typecheck-BLOCKED.md).
- No code/runtime change and no typecheck success claimed. Progress remains19/24. Next: combined focused offline regression, then remediate typing in bounded groups.

## 27.10.2026 03:40 МСК — reliability block16 diagnostics/privacy DONE

- Parent `c4bc4be85f5989822816ac83391b155ccd2407c6`; allowed branch only, PR14 Draft; no active parent run.
- App-side diagnostic review found `/api/suggest` logs use bounded failure labels/counts and timings only; no query or URL. `calculation_timing` is opt-in with fixed stage names/counts/times/stops and no address fields. `/api/collect` strips street/house and returns generic errors.
- Test-first render reproduced `app/v2/error.tsx` unconditionally rendering raw `error.message`/digest in production despite “test-only” copy and logging the full Error object. Changed it to gate details outside production and log only `{digest}` (or `unavailable`). Dev/test still shows the troubleshooting detail; no API/calculation behavior changed.
- `scripts/v2-error-boundary-safe.test.mjs` RED before fix, GREEN2/2 after. `npx tsc --noEmit`, scoped ESLint and diff check PASS. No browser/network/logging-vendor access.
- Checkpoint [block16](../checkpoints/2026-10-27-0340-block-16-diagnostics-privacy-DONE.md). Technical19/24 (79.17%): blocks1–17,19,22. Next block21 scripts/tests TypeScript feasibility.

## 27.10.2026 03:22 МСК — reliability block15 cache review DONE

- Parent `ea559e8a8081eb07886d48b3f8ac1dba0d0046aa`; allowed branch only, PR14 Draft; no active run for parent.
- Reviewed current cache key/expiry/isolation code: routing GET requests encode coordinates plus candidate/provider options and use Next `force-cache` with revalidation21,600s. Photon uses exact URL keys, positive-only process cache300s/LRU128 and per-origin cooldown; caller cancellation is subscriber-scoped. Address suggestion cache normalizes Russian case/space/ё and uses positive-only five-minute LRU128. Photon fetch also has300s revalidation and deadline/cancel propagation.
- `photon-request-pool.test.ts`, `address-suggestion-cache.test.ts`, and `photon-fetch.test.ts` all PASS with mocked fetch/clock. No live request, no reproduced defect, no code change.
- Limit: Next framework cache behavior and multi-instance cache sharing not tested in deployed runtime. Checkpoint [block15](../checkpoints/2026-10-27-0322-block-15-cache-review-DONE.md). Technical progress18/24 (75%):1–15,17,19,22. Next block16 structured diagnostics/privacy.

## 27.10.2026 03:14 МСК — reliability block14 provider fallback DONE

- Parent remote/local `82dbd8a2e832816f832d20bb428e9910eda518df`; allowed branch only, PR14 Draft; no workflow runs on parent.
- Added one regression to `scripts/v3-route-selection-audit.test.ts`: mocked Valhalla transport timeout/rejection with valid OSRM must retain the successful competing candidate and return its ETA/provider identity. No production code or policy changed.
- Existing V3 tests in the same suite cover selecting fastest OSRM's own geometry, excluding invalid distance/time/geometry candidates, tie ordering and unknown toll when evidence is incomplete. Pipeline tests retain the unknown/null and paid/free contracts.
- Focused route selection + V3 pipeline suites PASS, `npx tsc --noEmit` PASS, scoped ESLint PASS, `git diff --check` PASS. External providers fully mocked, zero live requests.
- Checkpoint [block14](../checkpoints/2026-10-27-0314-block-14-provider-fallback-DONE.md). Technical progress17/24 (70.83%): blocks1–14,17,19,22. Next block15 cache key/TTL/isolation.

## 27.10.2026 03:01 МСК — reliability block13 provider request-count review DONE

- Source remote/local `f5e694c87f0fbfbd2b9e4c4ab71d10f1851ca457`; allowed branch only, PR14 Draft; no source Actions runs.
- Read current V2 provider candidate flow and exact recorded B10 requests offline. The regular comparison intentionally uses Valhalla at three distinct toll penalties plus one OSRM and one BRouter candidate; a fourth high-penalty Valhalla route is conditional fallback only. Trace-attributes calls are per evidence chunk.
- Eisk run40354432433 capture:32/32 unique method+URL+body; Maykop run40369626668:36/36 unique. Per-route counts are four Valhalla route, 26/30 Valhalla trace, one OSRM and one BRouter. No exact repeated call was found. No additional runtime tests or live fetches were needed because no code changed.
- No call was removed: the differences represent candidate parameters and trace chunks needed to compare/validate route candidates. Exact capture provenance/sizes are linked in block11 checkpoint. Dynamic fallback coverage remains bounded by saved evidence and existing mocks.
- Checkpoint [block13](../checkpoints/2026-10-27-0301-block-13-provider-request-counts-DONE.md). Technical progress16/24 (66.67%): blocks1–13,17,19,22. Next block14 fallback/candidate correctness using existing mock coverage.

## 27.10.2026 02:52 МСК — reliability block11 router response limits DONE

- Source remote/local `c7bfe7157fc3decf2111102fb0eea9f99a623b95`; allowed branch only, PR14 Draft; no active workflow for source SHA.
- Inspected saved hosted artifacts only: B10 Eisk artifact12666050121 and Maykop artifact12671872287; downloaded ZIP SHA matched GitHub artifact digests. Parsed retained captures offline. All68 provider calls were HTTP200. Largest bodies: Valhalla route101,844 B, trace_attributes120,335 B, OSRM585,477 B, BRouter652,899 B.
- Added shared bounded streaming JSON response parsing (`lib/limited-provider-json.ts`) at8MiB (>12x observed largest response) and applied to Valhalla/OSRM/BRouter. It checks actual bytes, cancels over-limit streams, rejects malformed/empty/interrupted/invalid UTF-8 as generic `ROUTE_UNAVAILABLE`; existing25s fetch signal applies during body reads.
- Added WGS84/shape validation for provider route geometry (`lib/provider-route-geometry.ts`), requiring at least2 finite lon/lat points in range before downstream use. This prevents valid-HTTP but incomplete geometry from being used as a route.
- Tests: bounded-body4 assertions, geometry2 assertions; existing `calculate-api-error-mapping.test.ts` PASS; `npx tsc --noEmit`, scoped ESLint, `git diff --check` PASS. No live routing, build, or broad audit.
- No tariff, route-selection, or retry logic changed. Limit remains an engineering guard based on retained—not exhaustive—production-size samples. Checkpoint [block11](../checkpoints/2026-10-27-0252-block-11-provider-response-bounds-DONE.md). Technical progress15/24 (62.5%): blocks1–12,17,19,22. Next block20 profiling follow-up.

## 27.10.2026 02:45 МСК — reliability block10 webhook deadline DONE

- Parent `3b60bd138d6ed9a76dbd870ed0892d72ea0d3c28`; allowed branch only; PR14 Draft; no Actions for parent.
- RED mocked test confirmed the collection webhook request had no abort signal or deadline.
- Added an8s `AbortSignal.timeout` to the single webhook POST. Existing generic502 handling covers timeout and transport failures; no retry loop was added. The collection response/body privacy policy is unchanged.
- GREEN: `collect-webhook-deadline.test.ts` verifies8s signal, cancellation,1 fetch, generic502 and no leaked timeout/provider message; `collect-api-bounds.test.ts` tests PASS; `npx tsc --noEmit`, scoped ESLint and `git diff --check` PASS.
- No actual webhook/network call. Technical progress14/24 (58.33%): blocks1–10,12,17,19,22. Next11 response byte limits using retained provider payload evidence. [Checkpoint](../checkpoints/2026-10-27-0245-block-10-webhook-deadline-DONE.md).

## 27.10.2026 02:44 МСК — reliability block9 collection endpoint bounds/privacy DONE

- Parent `e5c4d89c29fe1539d3b07b1002e3f5edaee18132`; allowed branch only; PR14 Draft; no Actions for parent.
- RED: `/api/collect` accepted a body over16KiB and called the webhook. Privacy fixture also showed Cyrillic `ул. Секретная` and `ул. Частная` leaked because JavaScript ASCII `\b` did not detect a boundary before Cyrillic letters.
- Reused `readLimitedJsonObject` with a separate16KiB collect limit. Bad/malformed/non-object is400; oversize is413 before webhook. Replaced address-part boundary with Unicode letter/number guards, which remove street/house parts while retaining city/region. Existing `route_v2` contract still requires unknown toll values null; webhook schema does not receive a guessed price.
- GREEN: `collect-api-bounds.test.ts`2/2, calculation body-limit tests2/2, tsc, scoped ESLint, diff check PASS. Test confirms webhook receives coarse regions only and returns no street/house tokens. No actual webhook or external service called.
- Technical progress13/24 (54.17%): blocks1–9,12,17,19,22. Block10 external webhook deadline remains next; no timeout behavior changed here. [Checkpoint](../checkpoints/2026-10-27-0244-block-9-collect-DONE.md).

## 27.10.2026 02:42 МСК — reliability block8 route-label bounds DONE

- Parent `e12ffd2f880413efe5a906b2996d82cf2f38d01b`; allowed branch only; PR14 Draft; no Actions for parent.
- RED endpoint test showed a257-character route label passed V2 field validation, reached mocked routing providers and returned502 rather than rejecting input.
- Added shared `lib/route-input-validation.ts`; V2/V3 now cap `from`/`to` labels at256 Unicode code points while retaining the existing trimmed-nonempty, coordinate-range, and address text unchanged. Values beyond the bound return400 before geocoding/routing. Tests cover exact256, 257, Cyrillic and supplementary emoji code points.
- GREEN: `calculation-point-label-limit.test.ts` 2/2; existing V2 special/ordinary and V3 pipeline API suites PASS; `npx tsc --noEmit`, scoped ESLint and `git diff --check` PASS.
- No live calls or changes to query normalization/ranking, coordinates, route policy, tariff behavior or UI copy. Technical progress12/24 (50%): blocks1–8,12,17,19,22. Next block9 `/api/collect` resource bounds. [Checkpoint](../checkpoints/2026-10-27-0242-block-8-label-bounds-DONE.md).

## 27.10.2026 02:40 МСК — reliability block7 calculation request body bounds DONE

- Parent `fff8197ef0a9d7d579ed18b6eed75a360209d8ca`; allowed branch only; PR14 Draft; no Actions for parent.
- RED: mocked endpoint tests showed a >16KiB JSON request was parsed and proceeded to provider work (eventually400 only because the mock had no address); malformed JSON returned500 in V2. No limit existed before `request.json()`.
- Added `lib/limited-json-body.ts`: shared16KiB cap, early declared-length rejection, streamed actual-byte count for missing/underreported lengths, body cancellation on excess, fatal UTF-8/JSON/object validation. V2/V3 return413 for oversized bodies and400 for malformed/non-object JSON. Oversized tests assert0 external calls.
- GREEN: new body guard2/2; V2 special/ordinary API, V3 pipeline, error mapping and partial-trace integration suites PASS; `npx tsc --noEmit`, scoped ESLint and `git diff --check` PASS. No routing/pricing behavior changed.
- No live service, full build or broad Actions. Technical progress11/24 (45.83%): blocks1–7,12,17,19,22. Next block8 string limits. [Checkpoint](../checkpoints/2026-10-27-0240-block-7-request-size-DONE.md).

## 27.10.2026 02:37 МСК — reliability block6 API contract compatibility DONE

- Parent `ca1704e4d234a281980b09c0216e546bceb19304`; allowed branch only; PR14 Draft; no Actions for parent.
- Reused focused mocked integration evidence instead of retesting route corpora: `special-territory-api.test.ts` exercises V2 input validation/ordinary+special output and unknown toll nulls; `v3-pipeline-integrity.test.ts` checks the V3 single-fast-route schema/validator and paid/unknown/free states; `calculate-api-error-mapping.test.ts` checks sanitized 400/502/500 responses; `v2-partial-trace-recovery.test.ts` verifies incomplete corridor recovery returns public unknown/null while retaining diagnostics.
- All four suites PASS. No contract defect reproduced; V2 and V3 engine/response policy remain separate. Size and string bounds are explicitly left for blocks7–8. No runtime changes in this block.
- No live service calls, broad audit, build or Actions. Technical progress10/24 (41.67%): blocks1–6,12,17,19,22. Next block7 body limits. [Checkpoint](../checkpoints/2026-10-27-0237-block-6-api-contracts-DONE.md).

## 27.10.2026 02:36 МСК — reliability block5 V2 cancellation/races DONE

- Parent `37024801dd3c0f2795fdd6dedb181bb9b0700ffa`; allowed branch only; PR14 Draft; no active Actions for parent.
- Test-first red reproduced two V2 lifecycle defects: reset after failure retained the stale error, and a delayed clipboard completion marked a cleared result as copied. The existing V2 hook also lacked V3-equivalent clipboard rejection handling.
- `use-v2-calculation.ts` now clears error/manual/copy state on reset, detaches and aborts the active controller, guards clipboard completion against the current controller, handles clipboard failures with a safe message, and clears the copied indicator timer on new request/reset/unmount. Request and pricing behavior unchanged.
- V2 lifecycle suite9/9 (unmount, older response after new response, clear, copy after clear, clipboard failure); V3 hook race suite8/8; `npx tsc --noEmit` PASS; scoped ESLint0 errors/1 existing unused `analyticsVersion` warning; `git diff --check` PASS.
- No B03 browser suite, network, full build or broad Actions. Technical progress9/24 (37.5%): blocks1–5,12,17,19,22. Next block6 API contracts. [Checkpoint](../checkpoints/2026-10-27-0236-block-5-v2-races-DONE.md).

## 27.10.2026 02:34 МСК — reliability block4 UI error handling DONE

- Parent `a6f30e7ada3f760c770577e52bba6e639a195d0b`; allowed branch only; PR14 Draft; no active Actions for parent.
- Test-first red in both V2 and V3 hook harnesses reproduced the defect: a private-looking test sentinel in a fetch rejection message was surfaced verbatim. Existing HTTP 400/500/502/504 response messages were already displayed; preserve those server-sanitized strings. Exact sentinel remains in the focused regression test, not this work summary.
- Added `app/v2/components/request-errors.ts`, with a branded safe-message error so only deliberately user-facing response/validation messages pass through. Both hooks now show a generic retry message for untagged exceptions; malformed successful payloads retain the existing incomplete-route message. No retry loops or business logic added.
- Tests: V2 hook5/5; V3 hook8/8 (HTTP cases, network redaction, retry, malformed JSON, existing abort/race/clipboard); `scripts/special-territory-api.test.ts` PASS; `npx tsc --noEmit` PASS; scoped ESLint0 errors/1 existing warning (`analyticsVersion` in V2 hook); `git diff --check` PASS.
- No browser, network, full build or broad CI. Technical progress 8/24 (33.33%): blocks1–4,12,17,19,22. Next block5 lifecycle/race tests, without repeating B03 hosted cases. [Checkpoint](../checkpoints/2026-10-27-0234-block-4-ui-errors-DONE.md).

## 27.10.2026 02:31 МСК — reliability block3 V3 unknown/null contract DONE

- Parent `a5ee1c1f6785d5cd421d80de2c3eb3d1f4c56e4b`; allowed branch only; PR14 Draft; prior block remote readback confirmed matching tree and code/test/checkpoint/state blobs.
- Audited the V3 validator, shared V2/V3 fastest-route UI and copied quote. No application defect reproduced: unknown is accepted only with all three toll amounts null; explicitly free is a distinct state; shared V3 display is base-only; copied quote preserves unknown rather than zero.
- Added focused validation case in `scripts/v3-response-copy-audit.test.ts` and server-render case in `scripts/v3-result-render-audit.test.mjs`. No runtime code or tariff/routing behavior changed.
- GREEN: render suite3/3; response/copy and hook-race suites PASS; `npx tsc --noEmit`, scoped ESLint, `git diff --check` PASS. No browser, network, full build or broad CI.
- Technical progress 7/24 (29.17%): blocks1,2,3,12,17,19,22. Next block4 UI errors. [Checkpoint](../checkpoints/2026-10-27-0231-block-3-v3-unknown-DONE.md).

## 27.10.2026 02:28 МСК — reliability block2 V2 unknown/null presentation DONE

- Parent `1d8892d542b4eef1f973f0ad8489372c05613b3e`; allowed branch only; PR14 remains Draft; local tree was clean before this block.
- Existing V2 helper tests already showed unknown/null tolls render as base-only and confirmed-free routes as explicit zero. Added `scripts/v2-unknown-result-render.test.mjs` to verify actual server-rendered cards. RED reproduced a contradictory message: with provider pricing unknown and a user-entered 3,050 ₽ amount, UI showed a calculated 3,150 ₽ total while the card also said the full amount was not calculated.
- Minimal fix: `app/v2/components/route-card.tsx` suppresses only that contradictory notice while a manual amount exists. The unknown provider toll status remains visible and manual amount remains explicitly labeled. No pricing, toll or routing logic changed.
- GREEN: SSR render2/2; copied-quote regression verifies unknown stays unknown and never copies a zero road fee; `scripts/v2-quote-presentation.test.ts` plus `scripts/v2-hook-unmount-abort.test.mjs` PASS; `npx tsc --noEmit`, scoped ESLint, `git diff --check` PASS. No browser, network, full build or broad CI.
- Technical progress moves 5/24→6/24 (25%): blocks1,2,12,17,19,22. Block20 profiling remains PARTIAL. Next: block3 V3 unknown/null contract. PR14 Draft; only the allowed branch is used.
- Checkpoint: [block2](../checkpoints/2026-10-27-0228-block-2-v2-unknown-DONE.md).

## 27.10.2026 00:54 МСК — AUD-TRACE-RECOVERY-01 approved V2 fix DONE

- Parent remote/local `d891271479cce6164d10a72a317a51fa7f7f98d3`; allowed branch only; PR14 open/Draft; no Actions associated with that SHA at preflight.
- User approved the previously recorded policy: corridor recovery is approximate only; without independent full-route pricing, totals are null/status unknown; retain subtotal/segments for diagnostics; incomplete trace cannot use matched thresholds; independent composed complete cost remains priced under incomplete trace. Numeric thresholds and fare data unchanged.
- Test-first RED on `scripts/v2-partial-trace-recovery.test.ts`: complete and partial traces both exposed M12 subtotal995 as priced; partial `recoverCorridorTolls` returned the lower-threshold two-section recovery. Independent composed route-price fixture serialized priced even when validation was partial.
- Implementation: `lib/toll-recovery.ts` gates the existing soft matched threshold on toll+complete+complete booth-event coverage. `lib/v2-calculation/route-leg-pricing.ts` moves corridor recovery amounts into `corridorRecoveryDiagnostic` and returns zero-backed internal unknown totals. `lib/v2-calculation/route-leg.ts` exposes diagnostic subtotal and sections only in diagnostics mode. `tollsForApi` therefore emits null totals/unknown. No tariff/geometry/route-selection code changed. Existing V3 fixture now explicitly marks booth coverage complete.
- GREEN: focused trace tests (3 cases) and four related test files PASS; TypeScript noEmit PASS; scoped ESLint PASS; diff check PASS. Exact command/check list in [checkpoint](../checkpoints/2026-10-27-0054-aud-trace-recovery-fix-DONE.md).
- Broad full build/Actions intentionally not run because the full build launches repository-wide tests/live audit outside the user's narrow scope. No hosted CI claim. No route/provider/browser/network calls.
- Decision: [AUD-TRACE-RECOVERY-DECISION](AUD-TRACE-RECOVERY-DECISION.md). No independent block remains in the follow-up plan.

## 26.10.2026 23:49 МСК — AUD-TRACE-RECOVERY-01 V2 focused regression DONE

- Parent `529fb708bd880f9396b3399f5ec389eea78d7041`; allowed branch only; PR #14 Draft; preflight showed no runs for the current SHA.
- Added two offline V2 characterization cases from the existing synthetic saved M12 geometry: complete and incomplete trace. Both produced helper amount `995` and public `pricingStatus:"priced"`; incomplete metadata remained false/partial. A guarded global fetch observed 0 calls.
- `node --import ./scripts/register-ts-paths.mjs --test scripts/v2-partial-trace-recovery.test.ts` PASS; `git diff --check` PASS. This confirms only fixture-level behavior, not an official fare or user incident.
- No code/business/tariff policy changed. `priced` from a positive subtotal does not prove route-wide completeness. Follow-up proposal is separately recorded and awaits approval before policy implementation.
- Checkpoint: [V2 trace regression](../checkpoints/2026-10-26-2349-aud-trace-regression-DONE.md). Next: record proposal and await approval for trace policy; independently fix freshness-gate date source.

## 26.10.2026 23:52 МСК — AUD-TRACE-RECOVERY-01 policy proposal WAITING_FOR_APPROVAL

- Parent `0e3e9cb4be09aba212f424a2fd4e7e760b148928`; only allowed branch; PR14 Draft.
- Recorded proposed fail-closed public behavior in [proposal](AUD-TRACE-RECOVERY-PROPOSAL.md): positive approximate recovery fragments alone do not establish a route-wide fare; without independent full-route proof return null totals/unknown; incomplete traces cannot qualify for map-matched recovery. No M4/M12 thresholds or values change.
- This is a user-visible business/API policy decision. No implementation was made. Block 2 is paused awaiting approval; independent freshness-gate work may continue.
- Checkpoint: [policy WAITING](../checkpoints/2026-10-26-2352-aud-trace-policy-WAITING.md).

## 26.10.2026 23:53 МСК — AUD-DATA-01 freshness gate DONE

- Parent `a2d592a29bc83d1653a80bb838ac97aec77dab03`; allowed branch; PR14 Draft.
- Removed only the stale fixed date from `calculator-final-gate.yml`; runtime now resolves actual UTC CI date. `TARIFF_AS_OF` remains a strict, reproducible override.
- `scripts/check-tariff-freshness.mjs` now validates dates and reports freshness separately from effective-date provenance (`KNOWN`/`UNKNOWN`/`INVALID`). Strict mode fails stale or invalid metadata. Missing effective dates remain UNKNOWN and are not synthesized.
- Added `scripts/check-tariff-freshness.test.mjs`: focused test PASS. Actual-date run at 2026-10-26 and fixed 2026-10-02 run both: 4 rows, stale0, invalid0, unknown3, exit0. `git diff --check` PASS.
- No tariff/effective dates changed. No broad Actions/build/audit run; skip-CI commit avoids unrelated cumulative live probes.
- Checkpoint: [freshness date DONE](../checkpoints/2026-10-26-2353-tariff-freshness-date-DONE.md). Next: evidence-only list of the three UNKNOWN tariff dates.

## 26.10.2026 23:55 МСК — AUD-DATA-01 unknown-date evidence list DONE

- Parent `8c66a7b73ebdbd4240a854d5bb1c791fc74b1e9b`; allowed branch; PR14 Draft.
- Documented all three null dates and required primary evidence. M11 needs full signed order274, relevant complete 58–679 Category-I annex, and explicit commencement/amendment clause. Other-roads transponder/no-transponder need official dated order/publication tables covering every underlying M1/M3/CKAD/A289 row and explicit date clause; heterogeneous source dates require split registry metadata.
- Existing PDF/OCR and Oct1 page snapshot are insufficient to assign exact legal dates; no new external requests made. No tariff data/effectiveFrom changed.
- Record: [unknown effective dates](AUD-DATA-01-UNKNOWN-EFFECTIVE-DATES.md); checkpoint: [DONE](../checkpoints/2026-10-26-2355-aud-data-unknown-dates-DONE.md). Block 2 trace pricing proposal remains WAITING_FOR_APPROVAL.

## 26.10.2026 23:14 МСК — AUD-DATE-01 DONE

- Исходная разрешённая ветка / parent: `fix/v3-missing-route-prices-2026-10-15` / `fd41d4aaa817f8904be7e141b5bd6e5c0aca0ede`; PR #14 Draft. Рабочая копия создана отдельно из проверенного remote HEAD.
- Подтверждён дефект: V2 использовал только успешность `new Date(value)`, нормализуя, например, `2026-02-30`; дата с временем без TZ не отклонялась. Тарифный выбор и маршрутизация не менялись.
- Добавлены V2 request-level cases: невозможный календарь, не leap-year 29 Feb, locale date, timestamp без TZ, 24:00 — 400 до внешнего запроса; leap-day, date-only и timestamp с TZ принимаются.
- RED: до исправления `2026-02-30T09:00:00+03:00` дал 502 и дошёл до stub provider вместо 400; 8 остальных тестов файла прошли. GREEN: `scripts/special-territory-api.test.ts` 9/9; `npx tsc --noEmit` exit 0; `git diff --check` PASS.
- Ограничение: полная PR Actions verify не запускалась, поскольку её текущая runtime-классификация может включить широкий live-probe с 50-route corpus без связи с валидацией даты. Точечные/offline проверки выполнены; не утверждается PASS полного CI.
- Пути: `app/api/v2/calculate/route.ts`, `scripts/special-territory-api.test.ts`, текущий state, этот журнал/план и checkpoint.
- Следующий блок: AUD-ERROR-01; никакие тарифные суммы, effectiveFrom или recovery policy не менялись.

## 26.10.2026 23:17 МСК — AUD-ERROR-01 DONE

- Исходный parent: `725b78916da2f51c8861f8c02cfed67b7f0ea3a8`; разрешённая ветка; PR #14 Draft.
- До исправления неизвестное исключение с тестовым provider-host sentinel возвращало HTTP 400. Проверка воспроизведена для обоих API handlers; точный fixture остаётся в профильном regression test.
- Добавлен общий typed classifier `lib/calculate-api-error.ts`: allowlist известных клиентских (400) и upstream (502) codes; все остальные исключения получают категорию `internal` и HTTP500. Тексты клиентских ответов остаются whitelist-only и не включают `error.message`. Существующие специальные error messages сохранены.
- Добавлены endpoint contract tests для V2 и V3: адрес не найден→400, известная ошибка geocoding 503→502, неожиданное исключение→500; приватная строка отсутствует в body. RED: V2 unexpected exception был 400 (ожидался500). GREEN: новый mapping test 1/1; `special-territory-api.test.ts` 9/9; `v3-api-audit.test.ts` PASS; `npx tsc --noEmit` exit0; diff check PASS.
- Изменены оба API route handler, один общий classifier и focused test. Live providers не вызывались; fetch полностью mock.
- Полный Actions/широкий live-probe не запускался: unrelated 50-route corpus не нужен для mapping. Не заявляем hosted CI.
- Следующий блок: AUD-CI-01. Тарифы, геометрия и восстановления не менялись.

## 26.10.2026 23:21 МСК — AUD-CI-01 STARTED

- Parent `28c48f1e89ea5cd8b0907b221f97a6c0f045050e`, allowed branch only, PR14 Draft, no active Actions at preflight.
- Test-first RED: the new config regression reports Node22.13.0 in both `.github/workflows/route-quality.yml` and `.github/workflows/systemic-toll-composition.yml` while `package.json` requires24.x. Updated only those `node-version` scalars to `'24'`; workflow triggers/jobs/commands and toll/geometry assertions are unchanged.
- Local checks: `scripts/audit-ci-node-version.test.mjs` 2/2 PASS; PyYAML syntax parse2/2 PASS; existing live-scope classifier10/10 PASS; exact changed-path model returns `no-route-runtime-change-in-update`; systemic composition command PASS under Node24.19; `tsc --noEmit` exit0.
- `pnpm build` could not start because managed environment lacks `/home/agent/.local/share/pnpm`. Equivalent `npm run build` started the repository’s broad offline `test:audit`; the two already-known spawnSync-dependent nationwide suites failed in this Codex sandbox, so the run was interrupted (exit130) and Next build stage did not run. No retry planned here. Running Next build directly also stopped with Turbopack `creating new process/binding to a port: Operation not permitted` (exit1). These are environment limitations, not evidence of a Node24 workflow regression.
- The scoped PR verify is started by this test/workflow update. Expected classifier outcome is skip live jobs; if metadata is incomplete, current fail-open may choose live, which is a CI limitation to report accurately. Await Actions completion before declaring DONE; no files may be written during the run.

## 26.10.2026 23:28 МСК — AUD-CI-01 DONE; hosted verify PASS

- Readback source/Actions commit `0cff630ba12547e9c9f9261aca123a67ec80d2aa`, PR14 still Draft. No active runs remain.
- Hosted run [40394972858](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40394972858) on GitHub-hosted Ubuntu24 and Node24.21.0: `verify` PASS (438/438 project tests, existing classifier10/10, issue capture4/4, TypeScript, Next build); `calculation_timing` PASS; overall run SUCCESS.
- Contrary to local classification model, hosted classifier output `route-runtime-changed` because its last verified baseline predates earlier skipped commits. Consequently `live_probe` ran. Its route geometry probe PASS; address runtime probe completed3/3 in2.427s: Ростов PASS (103 features), Красн PASS (20), Донецк SOURCE_UNAVAILABLE (HTTP503/cooldown, 0 features). 50-settlement and Yandex jobs SKIPPED. Job conclusion failure is tolerated (`continue-on-error`); overall workflow SUCCESS. This unplanned live probe is logged; do not repeat it. No B03 browser or B10 capture ran.
- Local isolated version/YAML checks PASS; exact systemic composition workflow command PASS on Node24.19. Local `npm run build` could not complete because nationwide child-process tests are blocked by known Codex `spawnSync EPERM`; direct Turbopack build also hit `Operation not permitted`. Hosted verification resolves the Node24/build regression question; the local failures remain environment-specific.
- Only setup-node versions changed; triggers, jobs, pricing and geometry checks/assertions untouched. Next block: AUD-UI-01.

## 26.10.2026 23:30 МСК — AUD-UI-01 DONE

- Parent: `3f5f751898554cde144cbf67c6eff1d61bcc2f36`; allowed branch and PR14 Draft; Actions idle after run40394972858.
- Regression test first: new `scripts/v2-hook-unmount-abort.test.mjs` failed because the request AbortSignal remained `aborted:false` after simulated component cleanup. The deferred response is released, and late result remains uncommitted after the fix.
- Minimal fix in `app/v2/components/use-v2-calculation.ts`: `useEffect` cleanup aborts `pending.current` and clears the ref. No fetch semantics, result behavior, or business logic changed.
- GREEN: focused V2 lifecycle1/1, existing V3 lifecycle/race6/6, ESLint focused files (0 errors; existing `analyticsVersion` unused warning), `npx tsc --noEmit` exit0, diff check PASS.
- No browser/B03 or external services. Full hosted verify not triggered because this V2 runtime path makes special live classifier run unrelated provider corpus; it is not required to verify the abort contract. No CI run active before save.
- Next block: AUD-DATA-01 read-only evidence/recommendation; do not edit tariff values or effective dates.

## 26.10.2026 23:31 МСК — AUD-DATA-01 evidence DONE; tariff provenance BLOCKED_BY_DATA

- Parent `7769f0b0840962ac7289acdb04f08e57e9a6e8a8`; no active Actions, PR14 Draft.
- Inspected only existing source/workflow/script; no network or tariff source requests. At `lib/toll-engine/tariff-registry.ts` rows M11 58–679 and Avtodor-other-roads transponder/no-transponder explicitly state effective-from not established; three rows keep `effectiveFrom:null`.
- `.github/workflows/calculator-final-gate.yml:55-59` pins `TARIFF_AS_OF=2026-10-02` and strict stale mode. `scripts/check-tariff-freshness.mjs:3,12-19` computes age from `observedAt`; it counts missing effectiveFrom but only prints it. Exit2 is set only for stale rows.
- Reproducible offline runs: current `asOf=2026-10-26`: 4 rows, stale0, effectiveDateUnknown3, ages24/25d; pinned `asOf=2026-10-02`: stale0, unknown3, ages0/1d; simulated `asOf=2026-11-20` + strict: 4 stale, unknown3, exit2. The workflow's frozen date means that simulated future staleness would not advance in its actual run.
- Evidence proves gate drift and metadata incompleteness; it does not prove any displayed fare amount wrong. Recommendation: derive freshness date from CI run UTC date (with deterministic test override), and separately surface UNKNOWN effective date as unresolved provenance. Obtain exact applicability dates from operator primary documents before editing any tariff metadata or fare values.
- No data/code/tariff changes. Next: AUD-TRACE-RECOVERY-01 static/offline evidence only.

## 26.10.2026 23:32 МСК — AUD-TRACE-RECOVERY-01 evidence DONE; policy unchanged

- Parent ee8d14bdcb869eeb74041c728167337765ea137f; allowed branch; PR14 Draft; no active Actions.
- Static chain: lib/toll-validator.ts:317-338 returns status "toll" whenever any toll edge was seen, even with complete:false and partial booth-event coverage. lib/toll-recovery.ts:117 sets mapMatched from status alone; :101-103 therefore selects the more permissive thresholds in lib/toll-recovery-data.ts:62-63 (M4 2 vs4, M12 2 vs5 adjacent sections).
- Offline synthetic control using the existing M12 geometry from scripts/v3-unpriced-coverage-audit.test.ts and explicit validation complete:false, checkedChunkCount=1/2, boothEventCoverage=partial returned recovery helper amount 995 for two approximate M12 sections; passing it to tollsForApi yields pricingStatus=priced. This amount is an internal fixture/output, not an independently established current fare or route quote.
- V2 call path (lib/v2-calculation/route-leg-pricing.ts:144-148; lib/v2-calculation/route-leg.ts:137) passes remote recovery to tollsForApi, whose positive-amount branch (free-route-selection.ts:48-58) marks it priced without checking trace completeness. This is a reproducible helper/serialization behavior and a P2 risk; no live or actual user route was tested.
- V3 currently converts recovered corridor fragments to unknown/diagnostic-only at lib/v3-calculation/route-leg-pricing.ts:241-247. Existing coverage test uses validation complete:true; no dedicated partial-trace recovery regression was found. No routes, captures, or external providers were revisited.
- Recommendation: before altering recovery thresholds, add an isolated incomplete-trace regression and decide explicitly whether partial trace may support diagnostic fragments only. Do not let incomplete geometry/map-match evidence become a known full numeric fare; preserve V3 fail-closed output and unknown semantics. Any threshold/policy change requires separate authorization and evidence.
- No code, amounts, effective dates, or recovery rules changed. Four requested code fixes are done; this was the sixth of six plan blocks.
- CI side effect during this docs-only analysis: run40396491540 (commit ee8d14bdcb869eeb74041c728167337765ea137f) also ran despite the local path model: live geometry step PASS; address runtime step failed SOURCE_UNAVAILABLE after Ростов PASS106, Красн PASS20, Донецк 503/cooldown with0 results; 50-settlement and Yandex steps SKIPPED; overall workflow SUCCESS. This was not a new authorized route audit; do not repeat. Another intervening docs run40396071858 completed verify/classifier successfully with live jobs SKIPPED.
