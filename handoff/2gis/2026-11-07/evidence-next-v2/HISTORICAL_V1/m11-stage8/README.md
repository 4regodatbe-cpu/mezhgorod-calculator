# M-11 Stage 8: standalone integration evidence

Start with `INTEGRATION.md`, `SOURCES.json`, and `evidence/changed-60-cells.csv`. Official April and November PDFs, both extracted matrices, and the rules PDF are included. Run `python3 tests/verify_sources.py` and `python3 tests/verify_matrix.py` from this directory.

The `patches/stage8-legacy-implementation.patch` is a historical runtime patch tied to base commit `3a000f64c82a7e89715cdea09a13e1edf9354bef`; it does not apply to the current remote main. A separate current-main data-only overlay is provided at `patches/current-main-official-data-overlay.patch`. It is based on exact remote main commit `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9`, adds only source data/PDF, and does not modify runtime.

The source files prove official values and effective time. They do not eliminate the existing estimate-vs-actual difference: operator charges according to the tariff at exit-PVP passage, while current estimate policy uses trip departure time.
