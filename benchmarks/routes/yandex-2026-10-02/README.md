# Yandex route benchmark snapshot

- Snapshot: 2026-10-02
- Records: 61; Yandex-sourced: 60; control-base: 1.
- Use: offline regression and comparison tests only. Do not use for runtime route serving, production fallback, or passenger pricing.

## Files

- `manifest.json`: source, field inventory, counts, and package map.
- `routes-index.csv`: compact route ID and provenance index.
- `routes-*.json`: small packages of 13–16 route records. Each record retains all original route fields and its source label.
- `exports/verified-routes.csv`: exact source CSV retained for compatibility.
- `toll-periods.json`: captured weekday/weekend toll values from the source helper, stored as data.

The source JSON/CSV contains no geometry. This snapshot preserves the available metrics and toll data without inventing geometry. Keep it immutable; add any future verified results to a new dated snapshot.
