# Segment 9 provider capability audit

Date: 2026-10-01

## HERE Routing API v8
Public HERE documentation reviewed on 2026-10-01 documents:
- route calculation with toll information (`return=tolls`);
- toll summaries and per-section toll detail;
- toll systems and collection locations;
- explicit `tollsDataUnavailable` notice when tolls cannot be calculated;
- car toll-relevant vehicle parameters;
- route import can be followed by route-handle lookup for toll information.

References:
- https://docs.here.com/routing/reference/routing-api-v8-calculateroutes
- https://docs.here.com/routing/docs/routing-v8-tolls-routeimport
- https://docs.here.com/routing/docs/toll-cost-route-matching

Assessment: technically suitable for a benchmark adapter. It is NOT accepted as authoritative for Russian toll amounts by capability documentation alone.

## TollGuru
Candidate external toll provider named by the master plan. No authenticated live API credential is available in the repository/session, therefore Segment 9 records no fabricated TollGuru observations and does not use website estimates as API evidence.

## Decision
HERE is implemented as an optional live benchmark runner only. It is not connected to `/api/v2/calculate`, and cannot change user pricing. Exact amount accuracy remains evidence-gated by independent controls. A provider response of zero is not proof of a free route when toll coverage is unavailable/ambiguous.
