# Segment 7 — tariff data versioning and updater checks — COMPLETE

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: DONE
Validated workflow: `36876206314` — SUCCESS
Validated head before checkpoint: `113415746fd670f4f4ce7616b925e16055b59344`
Production `main`: unchanged.

## Completed

### 7A — normalized metadata/freshness core
Added `lib/toll-engine/tariff-versioning.ts` with normalized provenance and maintenance freshness semantics:
- snapshot/system id;
- source;
- observed/published date;
- effective-from/effective-to;
- tariff/payment mode;
- vehicle category/currency;
- configurable stale-after threshold.

Freshness states are `fresh | stale | future_observation | invalid`. Freshness is deliberately a maintenance signal and never converts a tariff to `0 ₽`.

### 7B — deterministic effective-date selector
Added fail-closed historical/current selection:
- only snapshots whose known effective interval contains `asOf` are eligible;
- future-effective snapshots cannot price earlier dates;
- gaps return `unknown`;
- equal-latest overlapping snapshots return ambiguity/`unknown` rather than arbitrary selection;
- missing effective-from is preserved as unknown provenance and is not selectable for historical/current exactness.

Direct deterministic fixtures cover historical/current boundary, future snapshot, gap, overlap ambiguity, fresh/stale/future-observation states.

### 7C — normalized current registry
Added `lib/toll-engine/tariff-registry.ts` for currently established datasets.

Important fail-closed audit correction made during implementation:
- M-12 has an independently known effective date (`2026-03-02`) and is selectable by date;
- M-11 current A1 source explicitly has `tariffEffectiveFrom: null`, so the registry keeps effective-from `null` rather than inventing a date;
- the Segment 6 remaining-road visible-page audit established observation date and explicit transponder/no-transponder modes, but not an exact effective-from date, so those registry entries also remain `null` and are not eligible for deterministic historical selection yet.

This preserves the global invariant that unknown temporal evidence cannot be silently promoted to exact current/historical truth.

### 7D — updater/stale-data checks
Added `scripts/check-tariff-freshness.mjs` and `.github/workflows/segment7-tariff-versioning.yml`.

The workflow:
- runs deterministic versioning fixtures;
- runs a direct TypeScript contract test against the actual versioning core/registry;
- runs deterministic freshness regression at `2026-10-01`;
- on weekly schedule or manual dispatch, runs a live-date freshness report so stale snapshots become visible without changing pricing semantics;
- runs the full production build;
- is hard-capped at 20 minutes.

The first workflow attempt failed immediately because it used npm against this pnpm repository. That harness error was corrected to the repository's pinned pnpm 11.25.0 setup. Subsequent gates are green; final run `36876206314` completed successfully, including direct core test, freshness regression and `pnpm build`.

## Safety result
- No route-evidence semantics changed.
- No tariff amount changed.
- No unknown effective date was guessed.
- Transponder/no-transponder metadata remains explicit.
- Staleness is surfaced as maintenance evidence, not as free-road evidence and not as zero price.
- Production `main` remains unchanged.

## Next
Segment 8 — route-distance quality: multi-provider distance/time QA, disagreement classification, known-route controls as QA rather than hidden live-route replacement, and a golden-route corpus with expected corridor/distance bands.
