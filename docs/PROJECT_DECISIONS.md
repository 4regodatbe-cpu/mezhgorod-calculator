# Current project decisions

Updated: 2026-10-02. This note records the current boundary between the standalone Calculator 2.0, the public platform, and route benchmarks.

## Product boundary

- This repository remains the standalone Calculator 2.0 site/application used by dispatchers and taxi drivers.
- It is independent from `izavb-platform`. Keep its internal pricing rules/configuration separate; the platform will implement a similar but independent algorithm and may diverge.
- The benchmark route set is for offline tests only. It must not serve routes, provide runtime toll fallbacks, or set passenger fares.
- Calculator 3.0 UI/API/runtime has been removed on the work branch after preserving the available routes as offline benchmark fixtures. Calculator 1.0/APK remains unchanged.

## Benchmark snapshot

- A dated data-only snapshot is stored in `benchmarks/routes/yandex-2026-10-02/`; it is also present on the separate work branch `work/remove-v3-runtime-2026-10-02`.
- It preserves the 61 records currently present in the published JSON/CSV: 60 Yandex-sourced rows and one `Контрольная база` row, retaining original provenance; the available JSON/CSV includes no geometry.
- Snapshot contents: four small JSON packages, compact route index, original CSV export, manifest, and the captured weekday/weekend toll table for nine route pairs.
- Use offline snapshots for tests. Confirmed regressions block release; ambiguous differences are classified and reviewed. Add a new dated snapshot rather than changing this one.

## Implementation status

- The work branch removes `app/v3`, `app/api/v3/calculate`, and the obsolete V3 runtime integrity checks.
- `scripts/yandex-route-benchmark-integrity.mjs` checks the archived benchmark. Run it with `pnpm test:route-benchmark`.
- V2 UI was split into `app/v2/page.tsx` and `app/v2/components.tsx`. Routing provider adapters were moved from the API handler to `lib/route-providers.ts`.
- V2 still uses `lib/verified-routes.ts` for its own live toll control and candidate selection. Audit and replace those dependencies before removing the runtime route table; retain V2's independent behavior.
- The work branch is not merged. PR #6 `fix-systemic-toll-composition` remains open and should not be merged until its status and the updated boundary are reconciled.

## Internal pricing

The standalone V2 calculator keeps its own internal tariffs, including special-segment rates Standard 70, Comfort 80, Comfort+ 90, Minivan 110 RUB/km. Do not source these values from the public platform configuration.
