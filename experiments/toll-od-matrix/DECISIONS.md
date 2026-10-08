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
