# M-4 PVP corridor source intake — acceptance protocol

Date: 2026-10-09. This document explains how to add **real, operator-verifiable** directed complete-corridor prices without copying guesses or city-pair estimates. All entries are for diagnostic sandbox testing only.

## Source-of-truth files

- `matrix/m4-pvp-corridors.json`: committed runtime-shaped **catalog skeleton**. Currently `priceCells=[]`.
- `matrix/m4-verified-source-intake.json`: **empty approved source intake**. Never fill from synthetically generated unit tests.
- `m4-pvp-compiler.mjs`: offline compiler. It never obtains tariffs from the network or changes production.
- `m4-pvp-corridor.mjs`: precise directed lookup; matches the full verified PVP signature, date, period and mixed-zone state.
- `m4-pvp-evidence-adapter.mjs`: converts actual independent matched PVP events to the lookup form; it does NOT prove the whole selected route is continuous by itself.
- `sources/m4-data.ts`: copied historical existing PVP row prices. Those are **not** verified complete-corridor records on their own.

## What an intake record MUST prove

1. A **single selected route** with stable route ID and identical geometry used for PVP crossing detection, operator price comparison and whole-route validation. One continuous M-4 passage; no off/on re-entry. The exact confirmed list of all PVPs (including middle ones), in chronological direction, must be complete.
2. Category I **without transponder**, with the exact profile (**Пн–Чт / Пт–Вс**, allowing separately certified official holidays and pre-holidays), start and end of tariff validity and operator document ID / URL / capture date.
3. **Each** confirmed actual PVP crossing has a corresponding official charge ledger event in the same sequence, explicitly charging or explicitly not charging with a reason and official row identifier. One actual 545 crossing may have two published tariff **rows**, but is still a single PVP.
4. Where 339 and 355 are both encountered, the directional receipt rule must suppress the correct duplicated charge (in the current copied model: 355 charged towards Moscow / 339 covered, reverse towards Krasnodar).
5. Mixed zones 401–464 (operator legal page may mark 414–464) and 633–741 must have documented entered/exited state and the elapsed-time rule. `within_limit` cannot charge both entry and exit when the journey stays within the valid period. Any insufficiency → unknown, not a guessed fare.
6. Independent **whole-corridor operator total** for the exact same selection, geometry, travel direction, fare class, date and payment conditions. The compiler verifies the ledger's two tariff-profile sums equal these independently confirmed controls; this is not a substitute for external authenticity checking.
7. Human document verification recorded as `reviewedBy="manual_checked"`, `reviewedAt`, `operatorTotalIndependentlyVerified=true`; these flags are procedural assertions, not a cryptographic signature. A URL merely hosted under an operator domain is NOT by itself proof that a number is legitimate. Save original screenshots/PDF reference, page/line and comparison artifact separately where available.

## File structure and offline compilation

`matrix/m4-verified-source-intake.json` contains:

```json
{
  "schemaVersion": 1,
  "systemId": "m4-don",
  "records": []
}
```

Each element of `records` must include:

- `id`, `routeId`, `direction` (`to_moscow` or `to_krasnodar`), `sequence` (e.g., a sequence of confirmed `m4-<km>` IDs).
- `context`: `mixed401`, `mixed633` each `not_used`, `within_limit`, or `exceeded_limit`.
- `proof`: `routeId`, `sameSelectedGeometry:true`, `completePvpCoverage:true`, `continuousMainline:true`, `officialTotalIndependentlyVerified:true`, `reviewedBy:"manual_checked"`, `reviewedAt:"YYYY-MM-DD"`.
- `source`: `kind:"official_verified_corridor"`, `category:"I"`, `payment:"no_transponder"`, `effectiveFrom`, `effectiveTo` (date or null), `capturedAt`, `documentId`, `url` (Avtodor operator domain).
- `events`: same length and exact order as `sequence`; each has `pvpId`, `disposition` (`paid`, `receipt_covered`, `mixed_exit_no_extra`), and `parts` with `officialRowId`, `monThu`, `friSun`. For each PVP normally exactly one part; 545 may carry two.
- `operatorTotal`: independent published `monThu` and `friSun` for the **same whole corridor**.

Compiler:
`compileVerifiedM4Tariffs(templateMatrix, sourceIntake)` → validates and returns a new diagnostic tariff catalog in memory. It runs `validateM4PvpMatrix` before returning and rejects overlapping tariff dates for identical corridor signatures.

Tests:
`node --test experiments/toll-od-matrix/m4-pvp-compiler.test.mjs experiments/toll-od-matrix/m4-pvp-corridor.test.mjs`.
Do not claim these have run unless actual execution output has been inspected.

## Precautions

- Historic `lib/toll-data/full-routes.ts` full-city tariff may be an **external control** only after proving the PVP signature of that identical route; never paste a city-pair total into an arbitrary PVP sequence.
- Operator site: https://avtodor-tr.ru/road/tariffs/
- Charging rules: https://avtodor-tr.ru/info/legal-info/pravila-proezda/
- Conflicting website descriptions of first mixed-zone starting km (401 vs 414) must remain noted and independently reconciled from exact PVP events.
- Previously collected 53 interchange candidates are now secondary (user explicitly requested **PVP-first**), and still have no verified OSM access IDs.
- Until sources are fully verified, **real M4 price cells remain zero**. A synthetic fixture in a test can produce a number, but that is *not* a real fare.
