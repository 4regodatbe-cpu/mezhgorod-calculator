# Routing compromise — historical constraints and decision needed

2026-11-02 MSK. Owner asks for systemic northern Crimea routing, preservation of coastal routes, and minimization of travel inside the four special territories with practical direct exceptions. Current Production a05fba10. No runtime changes or release in this investigation.

Historical facts:
- docs/SPECIAL_TERRITORY_POLICY.md records a former 50% time criterion cancelled by owner on 2026-10-04, then replaced by a geographic approach polygon. That old criterion must not be silently reinstated or reinterpreted as a total-detour budget.
- 2026-10-20 explicitly established western Krasnodar bypass for northern Crimea↔M4 trips; old ordinary plans also forced Krasnodar for southern destinations, causing the coastal defect.
- af6f1575 (2026-11-01) made all two-special-endpoint plans direct; this changed Melitopol↔Donetsk as well as short local trips. The later specialOnly tariff guard requires all geometry within the zones and would need review if an external detour is restored; actual outside kilometres must remain ordinary.
- The latest Crimea correction changed ordinary Crimea plans only; special one-endpoint corridors remain geographic. Current northern routes can naturally choose Timashevsk; full motorway/bypass travel and fastest unconstrained travel are distinct route policies.

Concrete proposed separation for owner decision:
1. Ordinary Crimea↔northern mainland: retain bridge and the established northern M4/west-bypass approach; apply it by the existing geographic north criterion, including Simferopol↔Voronezh, not city-name exceptions.
2. Ordinary coastal/southern trips: bridge only, no compulsory Krasnodar; retain the six captured short-route regressions.
3. Two-special-endpoint trips: compare a direct valid route with an external approach using measured route/territory times. Prefer less exposure only within an owner-approved detour budget. No code can infer physical safety from territory polygons. Short trips need a general exception, not named-city special cases.

Unresolved business input: maximum additional total duration allowed for the lower-exposure route, and whether an absolute or proportional budget applies. The description 'colossal detour' does not define this boundary. Do not invent a threshold, force a 50% interpretation, or relabel an external trip specialOnly. One public route for now; no UI alternatives introduced.

After decision: implement policy and pricing-geometry safeguards, regress both directions for north/coast/local/interregional cases, perform bounded live comparison and required CI, then release within owner's existing authorization. Preserve previous raw evidence and source history.
