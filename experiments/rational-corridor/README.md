# Rational corridor comparison — offline proposal

## Local interface demo

Open `demo-preview.html` as a standalone file (no server or dependencies), or run `node experiments/rational-corridor/serve-demo.mjs` and visit http://127.0.0.1:3188. Rebuild the standalone file after edits with `node experiments/rational-corridor/build-demo.mjs`.

The demo uses generic selectable test endpoints and explicitly synthetic numbers, not live geocoding/routing. It exercises a single-result direct/external toggle for two distinct special endpoints, automatic 2:1 initial recommendation, explicit user override, signed time/price differences, address swap/reset, unavailable alternatives and unknown toll completeness. No requests leave the page. The real integration still needs verified geometry/territory leg times for BOTH candidates and correct ordinary/special vehicle pricing; do not substitute these fixtures for actual routes. Main app and Production are unchanged.

Owner discussion 2026-11-02: the Dzhankoy 60km sector was illustrative, not a geographic constraint. Do not implement place-name/radius exceptions or claim that time in administrative polygons proves safety. No verified dynamic front-line/access data exists in this model.

Build two physically valid candidates when appropriate: direct and external approach. Measure total driving time T and time S within the four special territories from verified routed legs (never proportional allocation by mileage). Compare T + w*S. The prototype w=1 means one additional minute inside the territories counts as one additional minute of inconvenience on top of total travel time. This is an explicit provisional preference, NOT an empirically established risk coefficient. Expose sensitivity to w during evaluation, not as a new public control.

A detour is worthwhile under this example preference only when saved special-territory time exceeds added total time. Thus a long circle saving very little loses naturally, without city exceptions or a fixed radius. Same exposure and longer time always loses. Missing/inconsistent measurements produce insufficient-evidence, not an invented preferred route.

Distance and toll differences remain mandatory diagnostics. This first pure comparator does not decide financial acceptability: estimated/unknown tolls must not become zero, and financial costs need a separate calibrated preference before runtime integration. The existing vehicle tariffs price the selected actual geometry; an external detour must retain ordinary/special splits and must not inherit specialOnly from its endpoints.

Owner trial decision 2026-11-02: two hours outside the special territories equal one hour inside. Public experimental parameter `specialTimeWeight=2`; equivalent formula is ordinarySeconds + 2*specialSeconds = T + S. Do not set the additional coefficient to 2 (that would count special time three times). Equal scores prefer shorter actual total time, then distance. This approves the trial preference, not a validated risk model or runtime integration.

This experiment is NOT imported by app/lib. It does not restore compulsory Krasnodar routing or alter Crimea coastal routes. Northern motorway preference is a separate policy from internal-territory trade-offs. Application integration requires recorded direct/external geometries for near, interregional and near-exit cases, measured leg times, sensitivity analysis and a review of distance/cost trade-offs. Reuse saved evidence before any bounded new provider captures. No public second-route UI or Production change in this block.
