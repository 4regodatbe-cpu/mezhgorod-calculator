# Offline integration test plan

## Included source-data regression

`python3 m11-stage8/tests/verify_matrix.py` validates the retained April and November sources, exact effective time metadata, Nov. 3/4 special profiles, 42 directed pairs, all 210 cells, and all 60 changed cells; it writes the checked 60-row CSV.

## Required when primary Codex implements runtime

- Run the main branch's current M-11 boundary/model and wrapper tests, then add tests for the full 15–58 pair adapter; the old Stage 8 TypeScript tests are tied to the pre-636e layout and are not a substitute.
- Verify local-time boundary at 00:59:59, exactly 01:00:00, and 01:00:01 on 2026-11-02; test November 3 as Friday and November 4 as Saturday from the official table.
- Verify all 210 extracted values and 60 edition deltas against the fixture; historical trip selects April and current instant selects November.
- Verify unresolved physical boundary, wrong-way pair, unsupported product, or partial route returns unknown/null.
- M-4 regressions must keep each unknown scenario null; test the exact way/node chains independently from tariff mapping.
- M-12 regressions must reject mapping physical chainage labels to operator RVP labels by nearest number; test unbound Arzamas/M-7 exits remain unknown.
- Preserve CKAD replay rejection and ZSD RVP64 no-zero control.

No runtime test is claimed as run by this package author unless a later dated result records it.
