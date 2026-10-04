# Geometry-based special-territory pricing

## Runtime implementation

The four complete OCHA ADM1 polygons (UA14, UA44, UA23, UA65) classify geocoded endpoints and split each route shape. Address names and any current front line are not classification inputs. Crimea has ordinary rates. The published boundary JSON in bbaa884 was truncated (contained a literal `bytes omitted` marker); it has been restored directly from the user's ukr_admin1.geojson archive, preserving all selected source geometries/properties and adding only special_territory_id. Attribution remains in data/SPECIAL_TERRITORY_BOUNDARIES.md.

A grid index narrows boundary-edge intersection searches. Route distance is distributed over intersected shape pieces and reconciles with the provider's route distance. The ordinary and special mileage are priced separately for all four vehicle classes. Default special rates are 70/80/90/110 RUB/km; both rate groups can be edited and saved on-device. Ordinary manual mode changes pricing but never disables geometry checks or the prohibition on special-zone transit between two ordinary endpoints. Missing/ambiguous geometry rejects the candidate rather than publishing a fictitious price.

The API builds separate mainland and Crimea candidates using hidden routing controls, validates ordered passage, and rejects Crimea candidates that turn back across the bridge. Ordinary Crimea/mainland journeys use the bridge and Krasnodar approach, with M4 controls for northbound travel. Special-to-special mainland candidates can remain direct. Controls guide routing only; they do not certify border crossing access or current road conditions. The coordinate Crimea outline is a coarse routing aid, not a tariff polygon.

Valhalla and OSRM adapters preserve per-leg distance, time, and shape. Boundary-split re-routing retains existing control points. Time evidence is accepted only when leg count, finite positive summaries, connected shapes, matching route/leg geometry, totals, and homogeneous tariff zones all pass. The measured route itself is then priced; time from a different route is never attached. A boundary snap that changes a leg's zone invalidates the comparison. No distance-proportional time estimate can admit Crimea.

Selection takes at most one candidate in each direction, prefers paid routes (including confirmed toll roads with unknown price), and compares the selected candidates' cumulative special-zone seconds. Crimea requires verified time <= 50% of mainland special-zone time. No mainland candidate means no result. When a paid option is available, confirmed-free cards are suppressed in this special case. Unknown toll amounts stay null. Direction/corridor implementation labels are not shown in the UI.

The coordinate classification endpoint updates automatic UI mode. Server geocoding independently determines automatic mode. A manual override is stored in sessionStorage and renewed by user activity; it expires after 30 minutes of inactivity. New sessions default to automatic. Rate storage uses localStorage independently of the override. Address/rate/mode changes clear results and abort stale in-flight calculations.

## Verification (2026-10-04)

- Native Node test runner with scripts/register-ts-paths.mjs: all 39 reported tests pass across scripts/*test.ts, including existing toll regressions, real four-polygon transitions, tariff composition, per-leg parsing/time integrity, unknown tolls, manual-mode transit exclusion, automatic server geocoding, selection of alternatives, and session expiry.
- Full TypeScript check and Next production build pass.
- Browser interaction verification is blocked in this environment: agent-browser daemon fails to start; fallback Playwright has no installed Chromium and browser downloads return truncated archives. Server rendering/build and API tests do not replace a browser test.
- Live Valhalla and OSRM request with one intermediate control returned two distinct per-leg durations/shapes, with sums matching route summaries.
- Live Krasnodar–Donetsk: mainland 518.043 km, 93.985 km in special zones, priced toll result. Time comparison was unverified and Crimea was withheld, as required.

## Remaining limits

There is no guaranteed successful live 50% comparison fixture yet. Providers can snap boundary controls, return mismatched geometry/leg counts, time out, or lack roads. Such responses intentionally withhold Crimea rather than approximate. Current route controls are technical routing anchors, not verified crossing permissions. Broad live route coverage and operational review remain necessary before production approval. No production deployment or PR merge is authorized by this change.
