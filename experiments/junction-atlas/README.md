# Directed junction atlas — Stage D map addition

Local research only, not a runtime road/tariff database. Original StageC/D findings remain preserved; this atlas separates point coordinates, directed graph connectivity, selected-route traversal and operator price/product applicability. Do not infer one from another.

OSM-derived data: © OpenStreetMap contributors, ODbL, https://www.openstreetmap.org/copyright. Preserve attribution/source/version/hash when reusing derived records. Any retained standard OSM tile is an individual cartographic evidence view, not bulk/offline tile harvesting; keep the visible attribution in any presentation. Yandex observations are page/route UI evidence with URL and capture date, not surveyed coordinates or an operator tariff certificate. No Yandex commercial API, authentication bypass or pixel-derived invented coordinate is used.

Browser capabilities: Opera URL navigation and accessibility reads worked; the first screenshot timed out after30s. No click/drag tool exposed. Local Chromium first failed creating its default profile; specifying a writable temporary profile revealed a broken SUID sandbox helper and read-only crash-report directory. No sandbox flags, permissions, TLS settings or system configuration were altered to work around it, and identical retries are not authorized. Use available page facts and lawful alternative map views; keep unavailable visual verification explicit.

Inputs and cases are bounded retained junctions, not new whole-route captures. Existing owner-approved M4/PVP545320/410 working component and existing ZSD600 are unchanged; older experimental documents saying these were unadmitted are historical and superseded by28Oct owner policy/current implementation. New southbound or other-road vectors do not inherit those prices automatically.

## Saved results —30.10.2026

[Report and exact limitations](2026-10-30/REPORT.md); [32point unified atlas/provenance](2026-10-30/atlas.json). Six case files keep per-road source hashes, graph/trace evidence and unknown commercial boundaries separate. The two Yandex detours at M12mainlinejoin/M11CKADentry remain unresolved, not successful direct-route confirmations.

Offline reproducibility: `node experiments/junction-atlas/build-m4.mjs`, `python experiments/junction-atlas/build-zsd.py`, `python experiments/junction-atlas/build-other.py m12` (or m11/ckad/zsd-extended); outputs are JSON to stdout, not runtime data updates. `node experiments/junction-atlas/finalize.mjs` verifies source hashes, unique point IDs and saved focused-test counts and prints the consolidated atlas. Do not download sources or rerun past application/road audits merely to regenerate metadata. Current M4 check log is m4-south-checks.log; the earlier first-pass log is retained unchanged.
