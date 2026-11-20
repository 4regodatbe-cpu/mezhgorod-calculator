# B3 — saved timing analysis LOCAL DONE, missing spans explicit

29.10.2026 MSK; parent180e7caa, no runtime changes. Executed `node experiments/routing-reliability/saved-timing-summary.mjs`:read only three retained full-handler observations and three existing offline profiles; source SHA256 and extracted stages saved in2026-10-29/timing-summary.json. No route/network/reprofiling/audit or build repeated.

| Historical observation | Handler | Routing (network+parse/evidence) | Toll matching (trace network+local) | Toll pricing | Response pricing |
|---|---:|---:|---:|---:|---:|
| Ordinary CI |2225.425ms|1437.258|659.430|48.794|10.387|
| Special CI |7318.419ms|1115.330|3267.508|891.989|590.168|
| Local Moscow→SPb |4085.855ms|2064.693|1830.996|119.838|15.394|

Request parsing0.447–0.802ms and positioned geocoding0.054–0.126ms are not bottlenecks in these specific calls; fresh address search/cold import is outside that claim. Provider spans overlap; never sum Valhalla/OSRM/BRouter or parent/child timing. Toll matching includes trace HTTP/chunks/backoff, so its3.27s is not measured pure CPU. Existing decode/evidence6–9ms median and recognition/recovery profiles are different fixtures, not an exact network subtraction. Geometry admission, fastest selection and final JSON serialization are not separately timed in the retained handler telemetry; mark UNMEASURED rather than zero.

Special-response split reuse from prior B11 is already implemented, not a new gain. Ordinary route admission/response analysis may still repeat same-input work; not selected or modified in this bounded stage without its own equivalence/profile evidence. Here the proved high-value B4 target is stale work after cancellation, already corrected in B2. No normal-request speed gain or universal10s target claim. The three old requests happened to be under10s; other failures/timeouts remain possible.

Checks: normalized finite stage values/source hashes/sourceJSON and new link checks; no changed runtime/gate required. Local commit/readback only, no push/Preview/Production/CI. Next B4 record exact before/after work reduction separately from latency, then B5 five named saved controls.
