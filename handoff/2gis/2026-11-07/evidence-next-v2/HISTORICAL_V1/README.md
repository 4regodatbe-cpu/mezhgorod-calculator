# 2GIS toll evidence package — 2026-11-07

This is an offline, source-versioned evidence and integration handoff for the independent 2GIS diagnostics branch. It does not modify the calculator runtime or tariff registry and contains no API key, live 2GIS response, or instruction to replay an earlier query.

## Use

1. Read `TASK_RESULTS.md`, then `CONFIRMED_BINDINGS.json` and `UNKNOWN_BINDINGS.json`.
2. Treat a confirmed physical crossing separately from a confirmed operator tariff product. Only bindings with an explicit product, direction, vehicle category, payment method and effective tariff edition can produce a numeric charge.
3. Run the offline regression scripts listed in `REGRESSION_TESTS/README.md`.
4. Use `MAIN_CODEX_INTEGRATION.md` as a design handoff; do not copy any patch into runtime without review on the owner's working branch.
5. Verify `MANIFEST.json` and `SHA256SUMS` before relying on transferred artifacts.

The M4 current public tariff page has a row named 545–589 while the retained Order58 and 2016 explanation say 544–589. This discrepancy is recorded, not resolved by assumption. The official M12 tariff web page labels western segments 81/118/174, but the physical frame tie points are not established by those labels.

All coordinates and OSM identifiers retain the scope of their source evidence. OSM attribution is required; OSM geometry does not prove a tariff event. Original historical API queries were not repeated. CKAD M11→M12 remains outcome_unknown and must not be replayed. Public OSM contributor metadata (`user`, `uid`, `changeset`, `timestamp`) was removed from the included OSM XML; original response hashes are recorded in metadata, and the ODbL attribution is retained.

## Provenance

This package was assembled from the existing integration kit in this repository at source HEAD `8b936dbe1ee11de22de5a35ca0dbc3e66732d7fd`, plus official operator pages browsed 2026-11-07. Web pages without a downloaded local copy intentionally have `sha256: null` in `SOURCE_REGISTER.json`. No private owner data is included.
