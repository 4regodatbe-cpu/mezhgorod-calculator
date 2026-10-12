## 2026-10-11 — final symmetric M-4 span model (supersedes direction-specific lookup steps)

The user clarified that a continuous span has the same stored fare in either direction. The price key is its canonical unordered first/last PVP boundary pair, with two stored values only: Mon–Thu and Fri–Sun. Identify the selected route's actual PVP span; validate its intervening chain; then exact lookup. No per-PVP runtime sum, no re-entry flow, no directional duplicate price cell, no ramp OD table. Full details: `DECISIONS.md` dated 2026-10-11 and `REASSESSMENT_2026-10-11.md`.

1. **P0 — redesign matrix/compiler around canonical span endpoints:** one row per supported continuous span, same cell both directions, two price columns and source/version metadata. Exact intermediate PVP chain proves the span, not a separate fare dimension. Missing/unresolved chain => unknown.
2. **P0 — audit physical PVP/segment boundaries:** map each route-confirmed PVP to the finite canonical M4 segment boundary labels. Resolve parallel/alternative physical plazas (e.g. 339/355) during catalogue preparation or mark affected span unknown.
3. **P0 — reconcile amounts:** compare the accepted user/Yandex controls with stored segment tariff rows for the exact date/profile. Establish why old runtime sum is 1,000/1,430 vs supplied span values. Do not enter conflicting values as verified.
4. **P1 — precompute finite span tariff table:** verify both Mon–Thu and Fri–Sun totals for every supported span from the accepted sources; each span owns its cell. A longer span has a distinct amount.
5. **P1 — integrate only in sandbox V3:** remove per-PVP additive result as the new algorithm's displayed M4 price; perform symmetric span lookup using selected fastest geometry. Keep V2/Main/Production untouched.
6. **P1 — regression tests:** forward/reverse same span returns identical values; distinct spans do not share cells; missing/extra boundary or inconsistent intermediate chain returns unknown; missing period column returns unknown; no runtime add operation.
7. **P2 — run tests/build and route controls:** same fast geometry in both directions where available; Sochi→Rostov three-PVP sample, Sochi→Volnovakha, and a longer route crossing an additional boundary. Record actual outputs; do not publish Production without later authorization.

The earlier vector-specific list immediately below predates the symmetric endpoint-pair clarification; retain it as history but follow this latest order.

---

## 2026-10-11 — vector-model reassessment supersedes older M-4 ramp/whole-total blockers

Read `REASSESSMENT_2026-10-11.md` before taking an older unchecked item. The M-4 deliverable is a selected-route ordered PVP vector with one stored Mon–Thu aggregate and one Fri–Sun aggregate. Per-PVP fee aggregation occurs once during catalogue preparation; runtime must only perform exact vector lookup. Do not build an M-4 ramp/entry-exit OD matrix.

1. **P0 — reconcile tariff data:** determine why current saved per-PVP rows produce [1223,1184] = 850/1,160 ₽ and [1223,1184,1093] = 1,000/1,430 ₽, while user-provided Yandex controls are 700/850 ₽ and 850/1,000 ₽ respectively. Fix source period/vehicle/payment/road-vector mismatch only with evidence. Preserve all four values and provenance in audit; do not silently substitute.
2. **P0 — prove selected-route sequence:** obtain the fastest route geometry and confirmed ordered PVP events for Sochi→Rostov, Sochi→Volnovakha, plus a longer control that could cross PVP 1046. Do not infer 1046 from destination or route length.
3. **P1 — simplify price cell contract:** vector key + two precomputed period totals (with source/version metadata); exact sequence mismatch or missing price remains unknown. Independent route-total/Yandex controls are validation evidence, not ramp matrix entries. Ensure the compiler's requirement for a separate whole-corridor official total is a cross-check rather than an accidental requirement for an OD/ramp catalog.
4. **P1 — isolated route integration:** V3 must display only the exact vector lookup result and never the current per-PVP runtime sum as the new algorithm. If exact vector cell is unavailable, show unknown. Keep V2 unchanged; current branch's V2 diagnostic-shadow integration needs scope review before reuse.
5. **P1 — add regression examples:** exact reported two-PVP and three-PVP reference amounts; four-PVP vector cannot reuse three-PVP prices; missing/skipped PVP evidence and unknown vector stay unknown. Keep user-reported source labels until official/date/profile verification completes.
6. **P2 — execute full verification:** native Node suite, Vercel preview build, then browser checks with same route/time/profile; compare selected geometry/PVP sequence and period cell. No Production release without later explicit authorization.

The prior queue below contains historical M-4 full-corridor-source and V2-shadow items. Follow them only where consistent with this vector-specific order. In particular, exhaustive interchange enumeration is superseded, and no per-request PVP sum is an acceptable V3 final amount.

---

# Toll OD/PVP experiment — execution backlog and resume instructions

Updated 2026-10-09. This file is the **actionable queue**, not a list of completed claims.
Read `AGENTS.md`, `docs/WORK_STATE.md`, `README.md`, `DECISIONS.md` and `WORK_LOG.md` before proceeding.

## Project boundaries

Repository `4regodatbe-cpu/mezhgorod-calculator`, branch `experiment/toll-od-matrix-2026-10-08`.
Active M-4 prototype: `m4-pvp-corridor.mjs`, `m4-pvp-evidence-adapter.mjs`, `matrix/m4-pvp-corridors.json`; backup originals under `sources/`.
Old M-11 and ramp-based experiments remain untouched. No M4 full-price tariff entries yet.

## Execution queue

- [x] **P0 — tariff source compiler code (DONE, not source-populated)**: `m4-pvp-compiler.mjs` and empty `matrix/m4-verified-source-intake.json` added. Validates official document fields, same-route/whole-corridor evidence, charge ledger vs independent operator total, directional 339/355, 545 and mixed zones; produces offline matrix only. 14 synchronous function assertions passed; Node file tests not yet run.
- [x] **P0 — versioned price code (DONE)**: Nonoverlapping time intervals supported; same-signature overlap rejected; corrected date-regex escape in commit `7ae532c`. 4 new Node versioning scenarios authored, not yet run.
- [x] **P0 — execute exact full Node suite (DONE IN VERCEL PREVIEW BUILD: 165/165 native Node checks PASS, 0 FAIL at commit 2b64461)**: `node --test experiments/toll-od-matrix/engine.test.mjs experiments/toll-od-matrix/od-geometry.test.mjs experiments/toll-od-matrix/od-sandbox-quote.test.mjs experiments/toll-od-matrix/m4-pvp-corridor.test.mjs experiments/toll-od-matrix/m4-pvp-evidence-adapter.test.mjs experiments/toll-od-matrix/m4-pvp-compiler.test.mjs`. Also include newly added `m4-fare-calendar-2026.test.mjs`, `m4-pvp-timed-quote.test.mjs`, and `m4-mixed-time-policy.test.mjs`. Recommended all-source command: `node --test experiments/toll-od-matrix/*.test.mjs`. Actual Vercel build logs (deployment dpl_4xj5wm9mLPY3QkYtkd4FAyVeZAxx) confirm 165/165 PASS; Next compile, TypeScript and prerender also PASS.
- [ ] **P1 — official operator tariff verification (IN PROGRESS: exact current M-4 PDF link now identified, body HTTP 403)**: Official 27.02.2026 note provides 5 040 ₽ full Moscow→Krasnodar weekday control effective 02.03.2026 (source recorded in `SOURCE_RESEARCH_2026-10-09.md`); exact PVP sequence and full directed pair tariff still unverified, so **0 cells added**. Official PDF link now identified: https://avtodor-tr.ru/upload/iblock/a2d/9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf (content inaccessible; see `inventory/m4-operator-source-discovery.json`). Acquire independently verified current operator complete-corridor fare(s) tied to exact same PVP sequence, direction, date and payment scheme. Populate `matrix/m4-verified-source-intake.json` only after strict acceptance protocol.
- [ ] **P1 — actual geometry parity**: Independently verify paid road edge/node identities, contiguous M-4 passage, booth crossing order and same selected route; validate bidirectional test routes. No mere proximity inference.
- [x] **P1 — 2026 calendar proof-of-concept (DONE ONLY IN SANDBOX)**: `m4-fare-calendar-2026.mjs` + `m4-pvp-timed-quote.mjs` use Moscow timezone, official 2026 weekday exceptions and per-PVP timestamps. Fail-closed for holiday/weekday transitions, missing timestamps, unknown 2027+ schedules and effective-version crossing. **Not** integrated into route ETA; not tested with live selected-route geometry.
- [x] **P1 — mixed-zone conservative policy (DONE ONLY IN SANDBOX)**: `m4-mixed-time-policy.mjs` derives 401–464 <=12h, >=12h+ overcharge context; 633–672 conflicting official rules => <=60min known within, >120min known over, 60–120min unknown. See `SOURCE_RESEARCH_2026-10-09.md`.
- [ ] **P1 — reconcile official 60 vs 120 minute rule (OPEN)**: Obtain dated/current signed or dated operator document and authoritative tariff-effective date for 633–672. Two active operator pages disagree. Do not guess at 61–120 minutes.
- [ ] **P1 — same-route PVP event timestamps (OPEN)**: Derive gate passage timestamps from the chosen route, drive departure in Moscow timezone and verified route leg progress; don't synthesize an unsupported precision or use timestamp from unrelated route geometry.
- [ ] **P2 — compare against baseline**: Run same-route golden regressions against current M-4 engine and trusted operator source; record mismatches rather than adjust prices blindly.
- [ ] **P2 — integration only after approval**: Preserve current fallback and total multi-road composition; gate PR, preview, production separately. Never publish from the experimental branch by default.

- [x] **P1 — provisional PVP signature enumeration (DONE, UNPRICED)**: `m4-pvp-corridor-inventory.mjs` generates 420 monotonic contiguous candidate signatures from 20 PVP positions, flags special sections, assigns no prices, claims no real-route existence. 11/11 native Node tests pass with matching Git SHA.

- [x] **P1 — wire safe PVP-first diagnostics into V2 API/UI (DONE, not fare cutover)**: selected live route M-4 strict map-matching proof goes to `m4-pvp-preview.mjs` and user-visible result details. Matrix is still empty; legacy M4 money kept intact.
- [x] **P1 — Vercel Preview deployment (DONE)**: deployment `dpl_4xj5wm9mLPY3QkYtkd4FAyVeZAxx` at `https://mezhgorod-calculator-p1k0ywj71-4regodatbe-5310.vercel.app/v2` READY, GET /v2 HTTP 200. Guest access share URLs expire and must be reissued, never commit tokens.
- [x] **P0 — browser E2E both directions (DONE ON PREVIEW; detailed in WORK_LOG block 10)**: Москва→Воронеж: 7 exact PVPs, toll 3060 ₽ legacy; Воронеж→Москва: 6 exact PVPs, toll 2590 ₽ legacy. **Not** cross-checked with independent operator receipts or Valhalla full continuous geometry. Browser DOM error mitigated and re-tested, but user device tests outstanding.
- [ ] **P1 — independently prove uninterrupted M4 corridor (NOT DONE)**: current audit deliberately does not invent full `continuityEvidence`. Design strict full-road graph/OSM proof and attach only when obtained from selected geometry.
- [ ] **P1 — first officially verified whole-corridor price cell + runtime fare cutover (BLOCKED BY SOURCE/GEOMETRY)**: do not replace legacy amount until complete exact PVP fingerprint + current price + date/mixed rules; then add feature gate and run side-by-side same-route regressions.

- [x] **P0 — V2 browser DOM recovery (DONE FOR TESTED CHROMIUM REVERSE ROUTE)**: `app/v2/layout.tsx` google notranslate, `page.tsx` translation disabled, stable loading messages and button DOM; error boundary. Native Node 172/172 pass. Latest browser E2E reverse succeeded after multiple failed intermediate deployments.
- [ ] **P0 — confirm across user mobile/browser settings**: check Russian language/auto-translation in Chrome and Android WebView on both directions plus double tariffs; a single browser E2E cannot establish all clients.
- [ ] **P1 — verify direct official PVP prices/true paid-edge continuity and input timings** before replacing the legacy monetary M4 engine.

## Development checkpoints
- Create a dated entry in `WORK_LOG.md` for the completed implementation, failing attempts and tests.
- In the same branch refresh the top of `docs/WORK_STATE.md` and this checklist.
- Record actual `git`/GitHub commit SHA and observed test evidence. Distinguish authored tests from executed tests.
- Before editing check branch head for concurrent changes; do not force-update or clobber an unrelated developer.


## 2026-10-12 — implementation follow-up

1. **P0:** migrate the legacy timed quote module/tests off `priceCells`, direction keys and mixed-zone fare dimensions so the branch build validates only the selected-route symmetric span tariff contract. Do not hide failing tests; preserve useful calendar/evidence checks where still applicable.
2. **P0:** run the full Node suite and Vercel build on current branch HEAD; inspect logs and record exact results.
3. **P1:** populate real span rows only after date/profile-specific operator tariff evidence and user/Yandex route controls agree; current matrix is intentionally empty.
4. **P1:** rerun forward/reverse, Sochi–Rostov (three-PVP example), and longer control routes against the one fastest selected route, confirm complete PVP chains and expected precomputed fare pair.
5. Keep all work in the sandbox branch. No V2/Main/Production publication without a later explicit request.
