# 2GIS evidence handoff — 2026-11-06

Published as a dedicated subtree on `handoff/2gis-evidence`. This directory contains the Stage 8 M-11 integration materials, original Stage 9 archive and the final M-4/M-12/other-road evidence kit. It is self-contained apart from the referenced historical OSRM capture, which exists in the branch base at the exact repository-relative path and SHA recorded in the M-4 route-history review.

Start with `m11-stage8/INTEGRATION.md`, `m4-pvp545/FINDINGS.md`, `m12-interchanges/FINDINGS.md`, `integration/IMPLEMENTATION_PRIORITY.md`, and `LICENSES_AND_DATA.md`.

Offline verification commands, run from this directory:

```sh
python3 m11-stage8/tests/verify_sources.py
python3 m11-stage8/tests/verify_matrix.py
python3 m4-pvp545/regressions/verify_geometry.py
python3 m4-pvp545/regressions/verify_route_case.py
python3 m12-interchanges/regressions/verify_mapping.py
python3 m12-interchanges/regressions/verify_raw_osm.py
```

`MANIFEST.json` covers every handoff file except itself and `SHA256SUMS`; the checksum list covers the manifest and all other files except itself. The Stage 8 original archive and Stage 9 original archive have their own preserved hashes. Current-base patch scope and limits are in `m11-stage8/INTEGRATION.md`.

No runtime, tariff registry, workflow, or primary developer documentation is changed by the publication commit. Unknown route/product attribution remains null. CKAD remains `outcome_unknown` and no-replay.
