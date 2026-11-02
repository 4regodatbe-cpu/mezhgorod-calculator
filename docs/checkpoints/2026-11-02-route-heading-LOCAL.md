# Route heading semantics — LOCAL

Owner requests corridor-specific headings instead of a universal minimum-time claim and careful eventual placement of the corridor switch in V3. No publication requested after the separate test prototype.

V3 single-result panels now derive display/copy heading from actual selected response: verified specialOnly → new-territory route; mixed mainland/crimea → corresponding approach; missing metadata → neutral special-territory heading. Ordinary V3 and default legacy RouteCard unchanged. Never infer Krasnodar from endpoints or broad corridor label. Optional type fields describe already existing API metadata; no routing, tariff or provider changes.

Target tests: heading 2 PASS; actual SSR result render 9 PASS; TypeScript/scoped ESLint PASS. React review: pure derived label, no new hooks/requests/mutable state, text safely escaped, existing heading semantics preserved. Full offline gate exit0: 1104 PASS, 0 FAIL, 1 SKIP plus quote/adapter PASS; Next.js production build exit0. Logs /tmp/route-heading-gate.log and /tmp/route-heading-build.log (local environment, not durable evidence by themselves).

The real two-choice switch is not yet wired into the primary app: API currently produces one selected corridor, and the prior standalone demo contains synthetic data. Never present it as a second real route. Need independently calculated direct/external candidates, verified territory time and an explicit selected-route key before adding enabled choices. Single displayed result and truthful copy must remain.

Offline plan inspection for both directions confirms Donetsk/Volnovakha↔Volgograd: mainland with no bridge; Melitopol↔Volgograd: crimea with bridge. This checks planning, not live road availability or a completed calculation. No city-name rules introduced. Main/Production/Android unchanged.
