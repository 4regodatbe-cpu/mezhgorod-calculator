# Segment 8 — route-distance quality — COMPLETE

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: DONE
Validated workflow: `36877781722` — SUCCESS
Validated integration head: `264050b0a82206ee6d2f2fd0ce03697774ee0ba4`
Post-validation cleanup head before this checkpoint: `a7fad062a9338d38afbe0fa5d979c5c76aa91a26`
Production `main`: unchanged.

## Starting audit finding
The V2 API already queried multiple live routers (Valhalla + OSRM for fast routing; Valhalla + BRouter for avoid-toll routing), but matched known routes were returned directly from hard-coded stored values. That made the reference database a hidden replacement for live routing and violated the Segment 8 master-plan invariant.

## Completed

### 8A — pure route-quality model
Added `lib/route-quality.ts`:
- deterministic distance spread and deviation calculations;
- explicit `verified | single | warning` quality states;
- provider list, distance spread, time spread and golden-reference deviation;
- 7% material live-provider distance-disagreement threshold;
- deterministic selection of a live provider when live providers materially disagree and a golden reference exists;
- no stored reference can itself become the returned live route.

Distance and time are deliberately separate QA dimensions. Router duration disagreement is exposed but is not treated as a traffic-aware ETA promise.

### 8B — golden/known controls converted to QA references
`lib/verified-routes.ts` now exposes `goldenRouteReference(...)` from the existing verified-route database. Existing `accuracyPercent` is interpreted as a distance tolerance with a minimum 3% QA band. Source and verification date are preserved.

The legacy JSON corpus is intentionally not rewritten to invent missing provenance/fields. Partial legacy rows remain reference-only; the integrity gate reports usable coverage rather than fabricating metadata.

### 8C — V2 live integration
Removed the hidden `KNOWN_FAST_ROUTES` / `KNOWN_FREE_ROUTES` substitution path from `/api/v2/calculate`.

Fast routing now:
- compares live Valhalla and OSRM results;
- keeps the primary live result when providers are within the agreement threshold;
- when providers materially disagree and a golden control exists, may select the live candidate closer to the control;
- never returns the stored control itself as route distance/time;
- retains explicit degraded/single-provider and warning semantics.

Avoid-toll routing continues to use live Valhalla/BRouter candidates; golden data is QA/reference only and does not fabricate a free route.

### 8D — route geometry/pricing alignment
A safety issue discovered during integration was fixed before completion: if OSRM wins a material fast-route disagreement, toll geometry must follow the selected provider rather than silently remaining Valhalla geometry.

Current rule:
- selected Valhalla -> Valhalla geometry;
- selected OSRM -> OSRM geometry;
- fallback geometry only when the selected provider lacks usable coordinates.

M-12's production exact engine remains tied to Valhalla's strict M-12 span evidence. Therefore it is invoked only when Valhalla is the selected fast provider; Segment 8 does not pretend OSRM has equivalent strict M-12 evidence. M-4 continues to consume the selected route geometry.

### 8E — deterministic regression/gate
Added:
- `scripts/segment8-route-quality-test.ts`;
- `scripts/segment8-golden-corpus-test.ts`;
- `.github/workflows/segment8-route-quality.yml`.

Regression covers:
- two-provider agreement;
- material disagreement;
- golden-band selection among live candidates;
- providers agreeing with each other but both outside the golden band;
- single-provider good/bad/no-golden cases;
- no-provider failure;
- explicit assertion that the golden value itself never replaces the live route;
- repository guard against reintroducing `KNOWN_FAST_ROUTES` / `KNOWN_FREE_ROUTES` substitution.

Final workflow `36877781722` is GREEN: pure route-quality corpus, legacy QA-corpus check, hidden-substitution guard and full `pnpm build` all succeeded.

## Harness corrections made during Segment 8
Early gates exposed two harness/integration defects and they were fixed rather than ignored:
1. the legacy QA-corpus runner needed Node TypeScript stripping;
2. the old free-route branch still referenced the removed `MAX_VERIFIED_SPREAD_PERCENT`; it was aligned to the shared `MAX_PROVIDER_DISTANCE_SPREAD_PERCENT` constant.

One-shot migration workflows/scripts used only to safely patch the large API file were removed after the final green gate so they cannot be accidentally rerun.

## Safety result
- Live routing remains live.
- Known routes are QA/reference, not hidden answers.
- No toll amount was changed by Segment 8.
- No exact toll evidence was weakened.
- Provider disagreement is explicit and deterministic.
- Selected route geometry is aligned with the selected live provider.
- Production `main` remains unchanged.

## Next
Segment 9 — external toll-provider benchmark: benchmark HERE/TollGuru or another external toll provider against official Russian controls; external providers remain validators/fallback candidates until evidence proves otherwise.
