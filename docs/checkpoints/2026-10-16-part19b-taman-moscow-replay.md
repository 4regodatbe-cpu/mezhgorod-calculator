# Part19B — Taman→Moscow whole-engine replay DONE; connector fix DONE

16.10.2026. Parent79abfd50e338f43ed8c0d3ccf697c805b67924f9, exact tree69f28fa5106219488a486245281479ee1cfe9958 verified. Runtime79df66d8; full676/focused23/scopedlint5 PASS, source unchanged. Working branch/PR14draft only, no main/Production/Android/merge.

Existing runner offline replay on reverse capture exited0 for both profiles. Selected Valhalla1517262m, rawSHA84d63ae07de73f59c97340972e96803918c3137ec4c1e6e90603d568ba26f679. replayIntegrity complete=true/missingResponses=[], audit priced/missing=[] twice. Under `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-taman-to-moscow/`:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T04-01-43-532Z.json`, SHA256eed3874cef3afc77bd6f8cbb662a009240c7dac627d7816bf1efa5323c694835:4725=M44340+A289385.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T04-01-44-366Z.json`, SHA2564549ce7755ce97033ed06fafbe1967d31cedcaa3b9a94ca7b15520d199560559:5625=M45240+A289385.

A289 TamanBridge→Slavyansk, correct exact103>82 with directed exit proof. Output priceConfirmation remains unconfirmed. This is reproducible corrected-engine pricing, NOT fresh live or independent tariff validation. Original captures/live/replay/REPORT remain unchanged. Forward checkpoint has matching whole-route totals, independently observed not assumed symmetric.

19B fixed both remaining partial A289 cases. Combined with19A, all59 historical a289:unpriced cases have component-binding recovery evidence (57 helper-only impact;2 whole-engine/two-profile replays). This does NOT make59 complete route prices or validate their operator tariffs. Other finding classes remain untriaged; part19 remains in_progress,20 planned. Queue/plan updated with exact scope.

STARTED next microstep after durable checkpoint: current-engine historical-policy check for ONLY `dnr-гранитное-moscow-center`, first of25 m4_crossing_profile_changes. Find its existing capture via corpus/report metadata, offline replay15/17Oct09:00MSK using existing runner; inspect trip-departure-v1 basis and M4 component, preserve baseline and retain unknown unrelated products. No fresh routing needed. Save each case separately; do not relaunch completed309 queue. Continue without user command.
