# B10 Maykop-only V2 capture — STARTED

- Status/time: STARTED, 26.10.2026 20:07 МСК.
- Allowed branch/head at start: `fix/v3-missing-route-prices-2026-10-15` / `456bf6a9e8348264383d6a83d9fb635e4b2c7690`.
- PR #14 open/Draft; selective CI run40364820838 completed SUCCESS; no GitHub Actions active at this checkpoint. Do not change main, Android, backup or Production; no merge/force push.
- Existing remote B10 workflow, capture harness and proxy capture script were byte-identical to the local baseline. Workflow currently triggers only when its own file changes and captures both Eisk and Maykop by default.
- Eisk V2 capture is complete and preserved at run40354432433: 32 raw fetch responses HTTP200, capture SHA256 `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0`; do not recapture. Saved V3 Maykop capture and offline replay files exist in `experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19/`.
- Scope of this block: strict `B10_CAPTURE_CASES` allow-list; first-selected-case provider preflight; capture and offline V2/V3 compare only selected IDs; configure `maykop-to-moscow` only after hosted selector verification. No network request yet.
- Local focused selector tests: 4/4 PASS; scripts parse. The extra hosted check must run while B10 workflow remains unchanged, then classifier must prove the B10-workflow-only update skips broad special-territory live jobs before the one Maykop capture.
- Safety hold: hosted run40366544254 returned `head-already-checked` at f63a58d, while independent compare f2208fdae…→f63a58d… is `ahead` by16 commits. Its exact previous SHA was not logged; mutable PR-link metadata is possible but unproven. Classifier now uses immutable workflow-run `head_sha`, keeps PR association as scope, and fails open on missing/uncertain history. This correction is unhosted; no B10 run until hosted output proves a genuine non-runtime delta and verify passes.
- One capture max; preflight one request per required provider, then Maykop V2 capture, raw status/body/SHA evidence, offline Thursday/Saturday replay and V2/V3 distance/time/toll-output comparison. No tariffs may be changed from algorithm deltas.
- Stop before capture if prior checks/API/delta cannot be proven safe or if any required provider fails; record exact blocker. Never repeat Eisk.
