# Northern Crimea routing and fare concern — reconciled

2026-11-02 MSK. Read-only history review and four bounded Production calculations on source a05fba10. No runtime or Production changes were necessary.

The 20 October bypass controls were intentional: force the western Krasnodar bypass for northern destinations. The subsequent owner instruction requires the fastest valid route; bridge-only ordinary routing removes that compulsion, while actual road geometry still determines money. Calling those earlier policy tests simply obsolete was inaccurate: they protected an earlier explicit decision.

The recent retained Yalta↔Rostov geometry still crosses the directional west-bypass plaza and all three A289 frames. New offline regressions verify this and distinguish bare dates from timezone-qualified departure instants.

Crucial correction: the earlier control script used departureAt=2026-11-02. The real UI sends an ISO instant. `departureTariffContext` and A289 validity intentionally require an instant. Thus the previous inference that these four northern controls proved missing fare data was not supported; they proved unresolved time input. Historical captures are retained unchanged.

Actual Production POSTs using the identical saved endpoint coordinates and departureAt=2026-11-02T12:00:00+03:00, all HTTP200/priced:
- Yalta→Rostov and reverse: 2060 RUB weekday, 2210 weekend. Components M4 850 weekday, A289 800, western bypass 410. Directed plaza crossings resolved in both retained geometries.
- Yalta→Moscow and reverse: 4725 weekday, 5625 weekend. Components M4 4340 weekday plus A289 385 (TamanBridge↔Slavyansk). This selected faster route is a different A289 traversal; adding full-road 800 and bypass 410 would be wrong.

New raw API responses: experiments/crimea-routing-2026-11-02/instant-recheck/. No operator values, boundaries, date-selection rules or application routing modified. Updated the probe to a UI-format instant, record it explicitly and reject reuse of a directory containing different departure input. New northern-fare tests 2/2 PASS; TypeScript and scoped ESLint exit0. No redundant application build or live audit, as runtime code is unchanged.

Remaining scope: date-only input may safely remain unknown where exact fare validity needs an instant. This check does not establish all operator rows or eliminate Photon outages. Production remains a05fba10. Local documentation/test commit and bundle preserve the correction without an unnecessary application release.
