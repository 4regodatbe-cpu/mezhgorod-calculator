# Toll OD/PVP experiment — authoritative decisions

This document is intended for future developers and new ChatGPT conversations.
Project: `4regodatbe-cpu/mezhgorod-calculator`, sandbox branch `experiment/toll-od-matrix-2026-10-08`.
Updated: 2026-10-09. New decisions MUST be appended with a date; preserve superseded decisions and why they changed.

## Current authoritative decisions

### 2026-10-08 — isolate the research from the calculator (ACCEPTED)
- Copy the needed existing tariff, OSM and validation sources into `experiments/toll-od-matrix/sources/`.
- Prototype and test everything independently. Do not edit live V2, Production, or PR #12.
- Unknown/incomplete road pricing remains `null`, never a free/zero toll.

### 2026-10-08 — direct directional pair tariff lookup (ACCEPTED, scoped to systems with official OD matrices)
- Candidate approach: identify a confirmed toll-system entrance and exit, then return a preverified stored directed price for the relevant tariff period and vehicle category.
- M-11 example has **two** confirmed directed controls from a 22-point partial official snapshot, not a complete matrix.
- Reconstructing a tariff by subtraction of two published totals is forbidden.

### 2026-10-09 — M-4 PVP-first single-pass corridor (LATEST, OVERRIDES M-4 ramp-map requirement)
- User's intended journey: one continuous mainline traversal of M-4, without detour off the toll road and later re-entry. Do NOT spend work enumerating every motorway interchange or standard repeat-entry scenarios for M-4.
- It is a product routing assumption, **not a claim that exit-and-reentry cannot physically occur**. If a selected route contradicts it, refuse this shortcut with `unknown` rather than return a wrong price.
- The key becomes: confirmed first and last actual PVP **plus the exact intermediate PVP event sequence**, travel direction, category I without transponder, tariff period/date and verified mixed-zone state. Lookup a prevalidated complete corridor price **without runtime PVP summation**.
- PVP location alone is not proof of charging. Evidence must refer to the same selected route geometry and true paid-edge map matching (not merely nearby geographic anchors).
- Respect exceptional M-4 behavior: alternative directional 339/355, two rows associated with physical 545 PVP, mixed entry/exit zones 401–464 and 633–741 with time/charging conditions.
- The former M-4 all-ramp inventory is deferred as nonessential; `od-geometry.mjs` is preserved only for comparison and road systems whose tariff model actually needs entry/exit.
- **No confirmed full M-4 corridor price cells are available as of 2026-10-09**; all M-4 production tariffs are therefore unresolved in this sandbox.

## Operational governance — 2026-10-09 (ACCEPTED)
- Full append-only work log, clear decisions and executable next steps must be committed to the repository after each major block. Subsequent chats should resume without needing the preceding chat.
- Maintain current-state summary in `docs/WORK_STATE.md`, not by replacing the historical details. Repository evidence takes precedence over a verbal status report.
- No merge, Production publication, or live-calculator modifications as part of this sandbox experiment unless explicitly separately requested and verified.

## What is not approved
- Automatically deriving arbitrary M-4 PVP-pair prices from city prices, total route sums, adjacent PVP charges, unverified OSM proximity, or screenshots of different routes.
- Treating a single initial or final PVP as a unique full-corridor fingerprint when intermediate gates differ.
- Publishing the research into the user-facing calculator.

## 2026-10-09 — tariff calendar and contradictory mixed-grace rules (ACCEPTED IMPLEMENTATION IN EXPERIMENT)

- Actual PVP time is more precise than booking date: different physical PVPs may cross the Mon–Thu / Fri–Sun calendar boundary or a tariff version midnight. This case **must not reuse one whole-corridor price without proof**. Until mixed temporal pricing is independently verified, it returns `unknown/null`.
- Use Europe/Moscow civil date and explicit-tz ISO timestamps. Official posted 2026 holiday/preholiday exceptions override usual Monday–Thursday pricing. 2027+ schedule is unverified and must fail closed.
- The 401/414–464 km mixed toll system's 12-hour period is corroborated by both operator legal pages.
- **The 633–672 km limit conflicts on current operator pages**: `info/legal-info/pravila-proezda/` says 60 min; `company/docs/proezd/` says 120 min. Do not arbitrarily select 60 or 120. Until dated policy is clarified, accept only unambiguous classifications (≤60 within, >120 exceeded), otherwise return unknown.
- Do not trust a caller-supplied `mixedContext` if it differs from the state derived from two validated PVP timestamps on that same selected route.
- These are sandbox-only safety restrictions, not proof that the new engine is calibrated for commercial use.

## 2026-10-09 — authorized preview integration (USER-REQUESTED SCOPE)

- User explicitly requested integration with the calculator and a Vercel link **for testing**. This authorizes editing app/lib source in an isolated preview branch, not silently releasing Production/main.
- Because M4 directed PVP corridor priceCells = 0 and mainline continuity proof remains unavailable, **diagnostic-only integration** is the only currently defensible cutover stage. Retain legacy M4/other families' existing monetary behavior and expose verified PVP sequence and fail-closed reasons for testing.
- Preview build must run all standalone experiment Node tests before Next.js compilation. The first failure must block the preview. Any future fare cutover requires official verified complete-corridor total with matching geometry, date and sequence.
- Never store a temporary Vercel preview share-token in public repository documentation.

## 2026-10-09 — client DOM stability on Russian-language V2 Preview (engineering fix)
- React browser error `insertBefore` observed repeatedly after route calculation; exact exception recovered through test-only V2 error boundary.
- To mitigate potential DOM rewriting from browser auto-translation and avoid React text-node reconciliation, the V2 Preview opts out of translation (`translate="no"`, `notranslate`, route metadata `google=notranslate`) and keeps button/loading labels mounted as stable sibling spans. Browser E2E reverse succeeded on latest Preview.
- Browser translator as direct cause is a hypothesis, **not proven**; no credentials, persistent tracking, third-party scripts, or Production changes introduced. Preserve test-only debug transparency until user acceptance.


## 2026-10-11 — M-4 price is keyed by the selected route's PVP vector (clarification)

The user clarified the M-4 pricing unit: for the supported continuous M-4 corridor, identify the ordered PVPs that the **single selected fastest route actually crosses** and look up one prevalidated price for that exact vector and calendar period. Do not require a general interchange/entry-exit OD inventory or sum individual PVP amounts at runtime. The PVP sequence is route evidence / matrix key; the stored vector cell is the fare. Different exit points naturally produce different vector keys (for example, [1223,1184] versus [1223,1184,1093]); farther travel adds the next PVP(s) and requires its own vector cell. If a route continues north of PVP 1093, include PVP 1046 only when the selected geometry confirms crossing it; never infer an extra gate merely from destination labels or omit it because an expected cell is absent.

User-provided reference examples for future matrix seeding (reported 2026-10-11; category I passenger car, no transponder, ordinary weekday/weekend schedule as discussed):
- Vector [1223,1184]: 700 RUB Mon–Thu; 850 RUB Fri–Sun.
- Vector [1223,1184,1093]: 850 RUB Mon–Thu; 1,000 RUB Fri–Sun.
- A vector containing the additional PVP 1046 must include its separately validated fare and cannot reuse the three-PVP price.

These two amounts are **user-reported calibration references**, not independently verified operator tariff cells. Preserve provenance as user-provided and do not relabel them as official/fully verified until reconciled against the applicable dated operator tariff. Current live M4 additive pricing is not changed by this experiment decision. A route whose PVP sequence/continuity is incomplete or lacks an exact vector-and-period cell remains unknown/null; never present a partial sum as a complete fare.


## 2026-10-11 — authoritative M-4 segment-vector tariff model (supersedes earlier directed-vector lookup)

The user restated the final M-4 model. Treat this as authoritative over earlier experiment notes that made direction, first/last event sequence or mixed-context state part of separate fare keys.

- Divide M-4 into the finite ordered paid segments/PVP boundaries used by the verified route model (illustrative labels: M4-1 ... M4-10). A continuous selected route traverses one contiguous span between its first and last confirmed PVP boundaries, such as M4-4↔M4-7. It does not leave M-4 and re-enter later; never model re-entry as normal behavior for this product flow.
- Fare is stored once for that span. The lookup key is the canonical unordered endpoint pair, e.g. (M4-4,M4-7); the reverse (M4-7,M4-4) uses the same cell and same fare. Route direction does not change the price for the same span.
- Each span cell contains exactly the two customer fare values: Mon–Thu and Fri–Sun. Their totals are prepared offline by verifying the PVP/segment charges along that span against the accepted operator/Yandex route controls. Runtime only identifies the span and retrieves its stored period value. It does not sum individual PVP prices.
- Which span applies comes from the single selected fastest-route geometry and the first/last PVP boundaries actually crossed. The intervening PVP chain must match the canonical continuous span. No ramp/entry-exit OD map is needed; no alternative or partial span price can substitute.
- The full finite set of valid continuous spans can be checked and stored in the tariff table, in both period columns. A longer span has its own cell; adding a PVP cannot keep using a shorter span's price. If boundary evidence, intermediate chain, period price or verified span cell is missing, return unknown/null rather than a partial calculation.
- Product vehicle/payment profile remains passenger car/category I as applicable, no transponder, no special discount. Use the user's already-set date/day selection rules for choosing the applicable Mon–Thu or Fri–Sun column.

**Superseded design details:** do not require separate prices for opposite directions; do not use direction as an independent fare key when the canonical span is the same; do not require an OD ramp inventory; do not expose sums computed per PVP at request time. Earlier sequence-based work remains useful for detecting and validating which PVPs are traversed and for proving the span. Special/ambiguous physical PVP groupings must be resolved into the finite segment model during source preparation; if the boundaries cannot be represented unambiguously, leave that span unknown until corrected.

**Status:** this is a product decision, not completed implementation. Current experiment matrix/compiler/route integration must be revised to match it and tested. V2 and Production remain outside the sandbox work.
