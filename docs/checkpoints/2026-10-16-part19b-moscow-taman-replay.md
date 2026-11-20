# Part19B — Moscow→Taman whole-engine replay DONE

16.10.2026. Parent c1771e4d13a931fe43a44a63f17fe0188282ecac, source79df66d8, working branch/PR14draft only. Fullgate676 and focused23 previously PASS; runtime unchanged.

Existing runner `node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs --replay <capture> <departureAt>` exited0 twice. Selected Valhalla1518823m, exact same rawSHA3a49571931bdfe0afedfa1f2bbefff81b6c265dd85ab51fd7e52f1a638c5ab66. Both replayIntegrity complete=true, missingResponses=[], audit.status=priced, audit.missing=[]. Not new live, not independently confirmed tariff.

Outputs under `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-moscow-to-taman/`:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T04-00-38-285Z.json`, SHA2563c9dbd626a6465dec71dd04882f55d262958e5fc271db3e64e6e3cf1f5275c24: total4725=M44340+A289385.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T04-00-44-882Z.json`, SHA256a0a4cd70b686af720f4b1f91a45f681191ee9dceb1f07dbdc03bcb30bcc07778: total5625=M45240+A289385.

Whole trip priced by departure instant. A289 segment explicitly Slavyansk→TamanBridge, not full Maryanskaya800; output retains priceConfirmation=unconfirmed. Original raw/live/replay/baselineREPORT untouched. Persist new timestamped outputs with checkpoint and exact head/tree readback.

STARTED next single reverse case after persistence: `pair-m4-a289-taman-to-moscow/2026-10-16T01-40-05-574Z-capture.json.gz`, rawSHA84d63ae07de73f59c97340972e96803918c3137ec4c1e6e90603d568ba26f679; run same two departure profiles. Verify actual outputs and missingResponses; do not assume symmetric total. Then update finding queue only with evidenced scope.
