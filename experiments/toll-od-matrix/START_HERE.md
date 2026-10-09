## Preview integration published — 2026-10-09

The experimental M-4 PVP algorithm is now **attached to the actual V2 calculation pipeline as a diagnostic shadow module**, not yet a replacement of the fare engine. The user can inspect the strict PVP candidates in a collapsible section beneath the route cards.

- Branch `experiment/toll-od-matrix-2026-10-08` integration commit `2b644617c0c93a3fc823a0aefb13f4d7c1181074`.
- **Vercel Preview READY:** https://mezhgorod-calculator-p1k0ywj71-4regodatbe-5310.vercel.app/v2 (may require Vercel authentication; share URL issued separately, expiring).
- **Build verified:** Vercel full native `node --test experiments/toll-od-matrix/*.test.mjs` → **165 PASS**, 0 fail; Next compilation and TypeScript passed; `/v2` HTTP 200.
- Historical failure: first build stopped on TypeScript missing `m4PvpPreview` in route-pricing return type; fixed `2b64461` and verified with fresh READY deployment. See latest `WORK_LOG.md`.
- **Not done:** real-road E2E and official PVP tariff data. `priceCells=[]`; do not represent experimental calculation as new accurate toll money. Old toll calculation still supplies customer prices.

# START HERE — transfer the M-4 PVP research to another developer/chat

**As of 2026-10-09** | Repo `4regodatbe-cpu/mezhgorod-calculator` | sandbox branch `experiment/toll-od-matrix-2026-10-08`.

## Latest 2026-10-09 checkpoint: exact source URL + native tests

- `m4-pvp-corridor-inventory.mjs` enumerates **420 hypothesis-only signatures** (20 PVP positions × 2 directions, contiguous windows only); all price fields null. 11 native Node tests passed, hashes identical to GitHub.
- `m4-fare-calendar-2026.mjs` / `m4-mixed-time-policy.mjs`: further **27 native Node tests passed**, hashes identical. **Total native 54/54 PASS** on 4 exact module/test pairs including M11 OD engine, see `TEST_EVIDENCE_2026-10-09.md`. Prior V8 145/145 checks are separate, not Node CI.
- Operator PDF link found: https://avtodor-tr.ru/upload/iblock/a2d/9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf . Browser sees the link on official `/road/tariffs/` page; PDF reader cannot access body (HTTP403). Do not infer fares/effective date; manifest `inventory/m4-operator-source-discovery.json`.
- No approved price cells, no real geometry, full native test suite/CI/build still pending.

## Latest 2026-10-09 findings

- The repository now includes `m4-fare-calendar-2026.mjs`, `m4-pvp-timed-quote.mjs`, and `m4-mixed-time-policy.mjs` with corresponding Node test source files.
- 2026 calendar exceptions are taken from the operator's own tariff page. Per-PVP Moscow-local time avoids erroneously applying Thursday prices to Friday gate crossings. Changing profile mid-trip returns unknown.
- **Critical unresolved conflict:** two official operator pages disagree whether 633–672 km mixed-zone receipt grace is **60 minutes** or **120 minutes**. The experimental algorithm safely marks 60–120 minutes unknown, until official valid rule/effective date can be established.
- Latest V8 exact-source tests: **145/145 equivalent synchronous test cases pass** across unchanged baseline and new temporal modules. These did **not** run via native Node.js `node --test`; CI and full calculator build remain unverified. No actual signed tariff source imported: `priceCells=[]`.
- See `WORK_LOG.md` block 7, `DECISIONS.md` latest decision, and `SOURCE_RESEARCH_2026-10-09.md`.

## Immediate resume checklist

1. Fetch the **current remote branch head**. Do not trust this document's commit if it has since moved. Never overwrite remote work without a lease / branch comparison.
2. Read `AGENTS.md`, `docs/WORK_STATE.md`, `experiments/toll-od-matrix/DECISIONS.md`, `WORK_LOG.md`, `NEXT_STEPS.md`, `SOURCE_INTAKE_PROTOCOL.md`, `README.md`. These files are deliberately sufficient without prior chat access.
3. Work only in `experiments/toll-od-matrix/` in this branch. **Do not merge PR #12, change main, alter live V2, or publish Production.**
4. Follow the next uncompleted checkbox in `NEXT_STEPS.md`; after a large block, **append** a dated work-log entry with exact status, tests and commit, refresh the top of `docs/WORK_STATE.md`, and reconcile the checklist.

## Goal and current product logic

User runs a dispatcher's long-distance transfer calculator. The specific research objective is more accurate pricing of Russian toll roads, first M-4 Don, without harming the existing calculator.

Originally tried full ramp-to-ramp OD pricing, but on **2026-10-09** the user clarified that calculator routes should be one continuous M-4 passage, **without normal exit and later re-entry**. The active architecture is therefore **PVP-first**:
- Take the chosen route and its *same-route* independent PVP map-matching evidence.
- Require full PVP coverage and monotonic movement towards Moscow or Krasnodar, rather than infer a charge from geographic proximity.
- Identify first/last PVP and **every actual intermediate PVP**. The *exact direction + sequence + tariff period/date + mixed-zone conditions* is the lookup key.
- Return the precomputed trusted **whole-corridor amount**. Do not sum PVP tariffs during the live quote.
- If a trip contradicts continuous M-4 travel, any PVP/geometry is unresolved, a price is unverified, or the relevant date is outside the tariff version → `unknown` and `amountRub:null`; never silently return `0 ₽`.
- Special M-4 cases: directional 339/355 ticket/receipt, 545 having two official charging parts for one physical gate, mixed 401/414–464 km and 633–741 km with exit grace-period rules.
- Preserve other toll families (M-11/M-12/A-289/ЦКАД) without claiming this prototype covers them.

## Already DONE (code)

| Component | Path | Role |
|---|---|---|
| Archived source materials | `sources/` | 11 copied M-4/M-11 files, tariff and anchor evidence |
| M-4 point inventory | `inventory/m4-payment-facilities.json` | 20 distinct known PVP kilometre positions; NOT complete tariff matrix |
| Original ramp prototype (superseded for M-4) | `od-geometry.mjs`, `od-sandbox-quote.mjs` | Kept for comparison/M-11 experiments only |
| Partial M-11 OD | `matrix/m11.json` | 2 official direct price pairs from 22 listed points; not a complete M-11 matrix |
| M-4 strict event adapter | `m4-pvp-evidence-adapter.mjs` | PVP node/paid-edge checks to directed event sequence |
| M-4 current lookup | `m4-pvp-corridor.mjs` | Single-corridor versioned exact PVP signature lookup |
| M-4 empty trusted catalog | `matrix/m4-pvp-corridors.json` | 20 known PVP IDs, `priceCells=[]` (**zero verified complete price rows**) |
| New offline compiler | `m4-pvp-compiler.mjs` | Accepts only complete audited operator charge ledger + independent official total; catches 339/355, 545, mixed zones |
| New empty source intake | `matrix/m4-verified-source-intake.json` | `records=[]`; never import guessed real-world values |
| Automated test *source files* | `*.test.mjs` | Synthetic independent scenarios (not live E2E) |

## Real status vs plans

**Done:** creating and committing modules, research inventory, same-route proof contracts, direct lookup, tariff date ranges, offline compiler, synthetic test source. Existing V8 function assertions (41 lookup/adapter + 14 compiler) were exercised during authoring; these are *not* Node regression results.

**Not established:** fully verified M-4 corridor tariffs, end-to-end official price reconciliation, original geometry/route validity on real drives, holiday-aware tariff date selection, CI execution or Next.js build for the latest changes. **Do not say M-4 full matrix is ready.**

**Known blocker:** a text extractor request to Overpass for real interchange OSM access IDs returned HTTP 406 (not a proof of missing nodes). The project was subsequently rescoped to PVP-first, so exhaustive ramp inventory is no longer required.

## Latest source compilation (2026-10-09)

- `m4-pvp-compiler.mjs` now validates complete operator charge-ledger records and compiles a full-corridor price only if the independently documented whole-corridor total matches both stored profiles; the official intake is still empty.
- `m4-pvp-corridor.mjs` now supports nonoverlapping consecutive tariff effective-date versions; there was a date regex escaping error in an initial commit and it was fixed in `7ae532c`.
- Additional 18 compiler Node test cases + 4 version tests authored (not run). 14 isolated JS function assertions passed on compiler logic. Read `SOURCE_INTAKE_PROTOCOL.md` and `SOURCE_RESEARCH_2026-10-09.md`.

## Next safe task

Implement and verify source intake from **official actual** M-4 operator documents together with proof of corresponding *same-route* PVP sequence; populate at least one *real* independently cross-checked corridor, then bidirectional regression on actual chosen route and its fare category/date. If documentary evidence is incomplete, leave `priceCells=[]` and record the obstacle. Execute Node tests, record outputs honestly.

## Documentation rule (user-mandated)

Repository is the primary memory. Never delete the history in `WORK_LOG.md`; record executed outcomes, failures, SHA and future work, not just intentions. New developers should not have to reconstruct this project's design from chat history.
