# Segment 7 — tariff data versioning and updater checks — PLAN

Date: 2026-10-01
Branch: `optimize-calculator-2`

## Goal
Prevent silently stale or temporally incorrect toll amounts without weakening any fail-closed pricing invariant.

## Invariants
1. Every tariff dataset used for exact pricing must expose normalized provenance: road/system id, source, observed/published date when known, effective-from, optional effective-to, tariff/payment mode where relevant.
2. Missing or stale metadata is never silently interpreted as current.
3. Stale-data checks are deterministic and use an explicit `asOf` date in tests/workflows.
4. Historical/current selection is deterministic: choose only a snapshot whose effective interval contains the requested date; overlapping equally-specific snapshots are an error/unknown, not an arbitrary choice.
5. A future-effective snapshot must never price an earlier departure.
6. Tariff mode remains explicit for systems where operator pricing distinguishes transponder/no-transponder.
7. Existing road-specific engines remain authoritative for traversal evidence. Segment 7 changes tariff metadata/selection only; it does not invent route evidence.
8. No production `main` change in this segment.

## Subsegments
- 7A — normalized tariff metadata and freshness core.
- 7B — deterministic version selector and fixtures for historical/current/future/gap/overlap cases.
- 7C — adapt current M-12, M-11 partial and remaining-road snapshots to the common metadata contract without changing their route-evidence semantics.
- 7D — automated stale-data workflow/check with deterministic date and actionable warning output.
- 7E — regression/checkpoint and master-plan update.

## Freshness policy
Freshness is a maintenance signal, not tariff validity. A snapshot can be historically valid after becoming stale for updater purposes. Default maintenance thresholds are road-specific/configurable; the core must not convert a stale warning into a numeric zero or silently select another tariff.
