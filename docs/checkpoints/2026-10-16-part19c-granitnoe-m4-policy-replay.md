# Part19C — historical M4 policy check 1/25 DONE

16.10.2026. Parent8e4920e412a89bb24ae75cf79216d9a8fc6597aa/treef7362f405c2f7be277076416fe5f62bb4530199a verified. Existing selected Valhalla `dnr-гранитное-moscow-center`, capture from corpus.auditEvidence: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-гранитное-moscow-center/2026-10-15T11-54-48-260Z-capture.json.gz`, SHA25683d926658f6cc87a970d69abad120df3f743b4782f55031494005293a9be7146. Not fresh route or tariff validation.

Existing registered runner --replay command exited0 for both departure profiles; selected1256591m. Both complete=true,missingResponses=[], audit priced/missing=[], trip-departure-v1.basisAt exactly departure instant, M4 exact m4-911→m4-71. Historical baseline weekdaynull / weekend4640 is preserved; current weekday3810 and weekend4640. No current m4_crossing_profile_changes finding here; no additional source change needed for this case. Does not close other24 historical cases or other finding classes.

New outputs in same run folder:

- `replay-2026-10-15T09-00-00-03-00-2026-10-16T04-03-20-085Z.json`, SHA256225bf93e0c566ebd6428f337210fefc60ff8df1c7376f8b1286e1e00d63d23b1: M4/total3810.
- `replay-2026-10-17T09-00-00-03-00-2026-10-16T04-03-20-900Z.json`, SHA256be914700f14237f1b78fe6c99d6d1f9eb57333514e28b10e03ab7d9317d20d4d: M4/total4640.

Evidence inspection initially used git ls-files newline output and failed ENOENT because Git C-quoted the Cyrillic path. Switched read-only enumerator to `git ls-files --others --exclude-standard -z`, then verified hashes/integrity successfully. This was an inspection command failure, not replay failure or missing raw. Use NUL-safe paths for future cases. No runtime changes; previously fullgate676 remains source validation. No main/merge/Production/Android. PR14draft, working branch only.

STARTED next microstep after durable save: ONLY `zaporizhzhia-пришиб-moscow-center` (historical M4 policy2/25), existing corpus.auditEvidence.capture; current-engine offline replay15/17Oct09:00MSK. Inspect actual M4 quote/basis, unrelatedunknown remains unknown; preserve baseline/no fresh route. Append evaluation to queue, do not conflate corrected-engine output with old same-date parity. Each route separately checkpoint/commit/head/tree.
