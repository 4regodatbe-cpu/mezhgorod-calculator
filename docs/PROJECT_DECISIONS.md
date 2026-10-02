# Current project decisions

Updated: 2026-10-02. This note records the current boundary between the standalone Calculator 2.0, the public platform, and route benchmarks.

## Product boundary

- This repository remains the standalone Calculator 2.0 site/application used by dispatchers and taxi drivers.
- It is independent from `izavb-platform`. Keep its internal pricing rules/configuration separate; the platform will implement a similar but independent algorithm and may diverge.
- The benchmark route set is for offline tests only. It must not serve routes, provide runtime toll fallbacks, or set passenger fares.
- Calculator 3.0 UI/API/runtime is to be removed after route data has been preserved and live/test references have been separated. Calculator 1.0/APK remains unchanged.

## Benchmark snapshot

- A dated data-only snapshot is stored in `benchmarks/routes/yandex-2026-10-02/` on branch `benchmark/yandex-routes-2026-10-02`.
- It preserves the 61 records currently present in the published JSON/CSV: 60 Yandex-sourced rows and one `Контрольная база` row, retaining original provenance; the available JSON/CSV includes no geometry.
- Snapshot contents: four small JSON packages, compact route index, original CSV export, manifest, and the captured weekday/weekend toll table for nine route pairs.
- Use offline snapshots for tests. Confirmed regressions block release; ambiguous differences are classified and reviewed. Add a new dated snapshot rather than changing this one.

## Required follow-up before deleting 3.0

- The current `app/v3` page and `app/api/v3/calculate` route still exist.
- `app/api/v2/calculate/route.ts` currently imports verified-route data for live route/toll control and route-candidate selection. Replace those runtime dependencies with the intended live algorithm/provider behavior and move benchmark comparisons into tests before deleting shared runtime code.
- Preserve the external V2 API and dispatcher/driver behavior while splitting large modules. The current largest files on the active code branch include:
  - `app/v2/page.tsx` ≈36 KB;
  - `app/api/v2/calculate/route.ts` ≈30 KB;
  - `data/route-coverage-plan.json` ≈24 KB;
  - `app/v3/page.tsx` ≈23 KB;
  - `lib/tolls.ts` ≈20 KB;
  - `pnpm-lock.yaml` ≈228 KB.
- Split UI by form/results/cards and API by route selection, toll composition, and pricing boundaries. Split large planning data into stable packages if it remains actively used. Do not manually split the generated lockfile.
- PR #6 `fix-systemic-toll-composition` remains open and currently reports a dirty/non-mergeable state. Keep it unmerged until the updated boundary and checks are reconciled.

## Internal pricing

The standalone V2 calculator keeps its own internal tariffs, including special-segment rates Standard 70, Comfort 80, Comfort+ 90, Minivan 110 RUB/km. Do not source these values from the public platform configuration.
