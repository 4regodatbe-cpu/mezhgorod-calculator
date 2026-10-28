# Experiment 11 — independent B01 source review — 28.10.2026

Source/application baseline: `ea2fd912c3ec046065c19896b411bf1abb2f34fa`.
Exactly three providers assessed; official documentation read through the web tool,
not live geocoding calls. No account created, purchase, credential extraction,
GeoNames download, 93-candidate/19-group rerun or coordinate admission.

## Decision

**No production-ready independent fallback yet.** Geoapify is a plausible
documented API for an isolated experiment, not verified coverage or availability.
The adapter below is preparation, not closure of B01/B02. All three providers
are operationally separate from photon.komoot.io; shared OSM data is not
independent coordinate corroboration. No provider offers a proved latency bound
for our deployment/regions merely by publishing API documentation.

| Candidate | Verified documentary constraints | Decision / missing evidence |
| --- | --- | --- |
| Public Nominatim | [OSMF policy](https://operations.osmfoundation.org/policies/nominatim/): autocomplete forbidden, maximum 1 request/s across the application; application identity, caching and ODbL attribution required. Donation-funded public service, no purchased quota/SLA established. OSM global coverage does not prove specific regional addresses. | REJECTED for this live typeahead. An explicit-submit product or separately hosted service would be a different design, not an endpoint substitution. No API request made. |
| Geoapify | [Autocomplete API](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/): API key, city/address types, administrative fields, datasource, match confidence; fields may be absent. [Pricing](https://www.geoapify.com/pricing/): free commercial use with attribution, 3000 credits/day, up to 5 req/s; first paid plan $59/month/10000 credits/day. [Terms](https://www.geoapify.com/terms-and-conditions/): OSM credit always, Geoapify credit on free plan, no error-free guarantee. Confidence is NOT surveyed positional accuracy. | EXPERIMENT CANDIDATE, operational admission BLOCKED: no configured credential, real regional/homonym responses or source review. Another hosted OSM geocoder is not independent evidence for every point. Need owner-provisioned scoped key, one bounded capture batch, admin/precision review and attribution before public use. |
| DaData | [Address API](https://dadata.ru/api/suggest/address/): Russian granular addresses, foreign coverage largely cities; IDs/admin hierarchy, explicit coordinate-quality codes; coordinate enrichment follows selection via count=1 using prior unrestricted_value. Up to 30 req/s/IP and 60 new connections/min/IP. [Pricing](https://dadata.ru/pricing/): free 10000/day; light 50000/day for 14000 RUB/year at review time. [Offer](https://dadata.ru/offer/): contracted API, automatic bulk processing through Suggestions prohibited. | CONDITIONAL, not admitted: no configured credential/real regional capture or rights review for local redistribution. Two-stage coordinate selection needs UX/budget design. qc_geo city/street/nearest-house cannot be passed off as a precise building fix; DNR/LNR and other required regional coverage UNKNOWN. |

Prices/quotas are observations on this review date, not a purchase recommendation
or contractual promise. API permission is not a blanket license to publish a
derived offline database. ODbL/source-specific obligations must survive display
and any later persistence.

## Isolated preparation

`geoapify-fallback-experiment.mjs` has no app/lib imports, runtime integration or
global switch change; default is disabled. Explicit enable + provided key +
`photon.unavailable === true` + remaining absolute shared deadline are necessary.
One city-only request, at most five results, at most two seconds and no retries.
It does NOT start after the original 20-second budget has expired. Therefore
using up all 20 seconds on Photon leaves no fallback time; production budgeting
requires separate evidence/approval rather than extending the deadline.

Returns only `unreviewed-candidates`, never a public Suggestion. City centres
are explicitly labelled provider-reported, reviewRequired=true and
publicUseApproved=false. No arbitrary confidence threshold declares coordinates
exact. Administrative signatures and distinct IDs remain separate; successful
empty/partial primary answers do not call fallback. Aborts and failures remain
structured; exception URLs/keys are not returned. This research adapter is not
a production transport: distributed quotas, bounded streaming-body validation,
real coverage, attribution UI and credential provisioning still need acceptance.
The four-entry saved Photon snapshot stays disabled and retains its original
31.10.2026 11:24:54 MSK expiry/review requirement.

Tests use synthetic city names/coordinates and injected transport only; they
prove the contract under full 503/429, NOT actual Geoapify availability during a
Photon outage. No new coordinate is licensed/reviewed/admitted by these tests.

Next: B11 saved-stage analysis; obtain a configured key via the normal credential
workflow before any real Geoapify request, never paste secrets into chat.
