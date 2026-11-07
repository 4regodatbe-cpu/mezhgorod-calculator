# Primary Codex implementation priority

1. **M-11 15–58 dated matrix adapter**: ingest the versioned November source; preserve April for historical dates. Key by exact directed operator endpoint IDs and vehicle/payment category. Keep 58–679 partial model as a separate system/product until verified cross-system pairing.
2. **M-4 PVP545**: no tariff/runtime change yet. Acquire a dated lane-to-product + effective tariff + additivity/no-double-charge rule before enabling any of the scenarios.
3. **M-12**: replace chainage-proximity selection with explicit physical-to-operator crosswalk only when primary as-built/official source binds each endpoint. Keep unbound exits unknown.
4. **CKAD / ZSD controls**: preserve CKAD no-replay and ZSD RVP64 unknown/no-zero semantics.

No runtime patch is supplied for current main because the earlier Stage 8 patch targets a retired file layout. The only current-main overlay candidate is a source-data addition; code integration belongs to primary Codex.
