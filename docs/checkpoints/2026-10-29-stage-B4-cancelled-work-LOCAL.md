# B4 — bounded obsolete-work optimization measured LOCAL

29.10.2026 MSK; parent31ffa9fa. One logical optimization implemented in B2 (180e7caa), not another runtime change: stop main V3 geocode/provider/trace/backoff work after caller cancellation. This chooses the confirmed cancellation problem instead of inventing an unmeasured normal-CPU speedup.

Executed `node experiments/routing-reliability/cancelled-work-summary.mjs`:before/after source SHA and invariant assertions PASS. Matched deterministic diagnostic:3provider starts before vs1after; first existing call is signalled, two subsequent starts avoided. Separate6regressions prove no starts for a pre-aborted request and abort all3already pending provider signals, selected trace, geocode, special corridors and429wait. Existing25s/18s deadlines and mandatory noncancelled validation retained. Provider-side compute after cancelling a client socket is not measured.

Normal request fullbody and outbound URL/body parity EXACT on one complete retained Donetsk→Moscow source,12responses/run,0misses/network. That experiment's2688.89vs2358.65ms warm executions are **not** assigned as330ms savings: no repeated paired latency distribution or matching host/network conditions. `normalRequestSpeedupMs:null`; no10s SLA or general speed gain claimed. Reducing obsolete work/load is the measured practical benefit.

Evidence `2026-10-29/cancelled-work-summary.json`, cancel-before/after, uncancelled-parity and prior B2 logs. TypeScript/lint/build/fullgate1031PASS/1SKIP already verified exact unchanged runtime; no new code/tests/network here. Current-stage private callback/caches/new architecture not added. Prior special-split reuse is old work; possible ordinary duplicate analysis remains a separate deferred candidate, not silently counted fixed.

Next B5 five named controls from retained captures/results, current offline replay only for sufficient inputs. Missing exact destination/trace is BLOCKED_BY_DATA, not substituted by a neighbouring route. Local commit only; no push/deploy/CI/Production.
