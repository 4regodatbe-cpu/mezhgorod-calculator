# Stage Z — verify M‑11/M‑4 handoff evidence

- Status: DONE (read-only evidence verification), 2026-11-07 UTC.
- Candidate worktree/branch: `/workspace/stage-z-stabilization`, `codex/stage-z-stabilization`.
- Candidate commit before this record: `5f18e4ea83567a9f58dbe0bfa8ca4f95eba5528c`; source ref: `origin/handoff/2gis-evidence` at `9c625c4cf5ea89625623fb4ead4bb4980b3e03c6`.
- Scope: verify the existing handoff package and its six stated source/regression checks. No API requests, route replay, tariffs or production files changed. Nothing from the evidence branch was merged or copied into runtime.

## Verified inputs and integrity

The package’s own `MANIFEST.json` declared 83 files. Recomputed byte lengths and SHA-256 values matched all 83 entries. `SHA256SUMS` verified all 84 listed files. The Stage 8 original packet archive SHA-256 was `310d3b70f53e79057e45927beb3edf448f08ca0a17200f782e1eb8f40f223918`; the separate source-files archive was `8acd94381a2f160feec6b1ee4b9d413a5a02993b0dacf5ab0fb033f4619a9e6c`.

The handoff states that M‑11 Section 15–58 uses 42 explicitly directed pairs / 210 tariff cells, Category I/no-transponder, and the current edition begins at `2026-11-02T01:00:00+03:00`. It also states pricing is associated with exit-PVP passage. The existing V3 model can estimate that passage from route duration, but this is a calculated estimate, not an operator-confirmed actual payment timestamp. M‑4 PVP545 tariff attribution and the four M‑12 physical/tariff crosswalks remain unknown and must stay guarded as such.

## Six checks

All six cited source checks passed when run against the extracted, hash-verified handoff plus the existing saved project capture where required:

1. `M11_SOURCE_HASHES_PASS editions=2 rules=1 original_packet=exact patch=verified`
2. `M11_SOURCE_MATRIX_PASS pairs=42 cells=210 changed=60 boundary=2026-11-02T01:00:00+03:00 special_days=2`
3. `M4_PVP545_GEOMETRY_PASS chains=3 gate_nodes=3 tariff_assignments=0`
4. `M4_SAVED_ROUTE_PASS directed_gate=5818209495 candidates=2 confirmed_products=0 fare=null`
5. `M12_CROSSWALK_GUARD_PASS tariff_rows=4 physical_labels=4 auto_matches=0`
6. `M12_REDACTED_OSM_PASS objects=9 source_hashes=preserved contributor_fields=removed`

## Provenance discrepancy retained

The handoff metadata and Stage 8 integration document identify historical runtime SHA `136a5a72f76076188b3768897951a2b700a3d728`, while the README inside the verified original packet identifies `136a5a72f1488ce7617d55e9f09648f3376d2ba7`. A fetch of the handoff commit did not make either historical object available by that SHA, and the remote reported the requested old object was not a ref. Therefore the corrected SHA is reported only as handoff metadata, not independently verified. This does not block a fresh integration from the independently verified official tariff sources; neither historical patch nor old runtime snapshot is applied.

No original 2GIS response, geometry, API key or aggregate price was added to the candidate. The extracted package and test outputs remain in temporary workspace only; the durable provenance is the read-only evidence ref/SHA, its manifest/hash declarations, this result and the source test names under `handoff/2gis/2026-11-06/`.

## Next

Inspect the current V3 M‑11 Section 15–58 path and integrate only its directed, dated current tariff data if the current geometry/boundary evidence is sufficient. Preserve M‑11 58–679 unchanged; keep M‑4 PVP545 and M‑12 mappings unknown. Push and publication remain forbidden.
