# A4 boundary checks — local corrections verified, no publication

Baseb266d755. During acceptance review, two additional regression-first tests caught edge cases in the new relevance logic BEFORE publication:

1. Full numeric settlement names such as synthetic8Марта lost the existing geographical tiers because every numeric query entered address scoring. Restore the legacy tier only for the complete locality name (or supported explicit region qualifier), never for a city prefix of a comma-separated detailed address. No city-name exception added.
2. Some providers put municipal/county units into a city slot. Removing generic markers could make городской округ Краснодар falsely match cityКраснодар and beat a genuine city/street partial match. Conservative administrative-unit detection now rejects those values as city evidence; state/county already excluded. No new geometry/administrative fact invented.

Files lib/address-query.ts, lib/photon-address-search.ts and scripts/compound-address.test.ts. Each test failed on the preceding implementation, then passed. Existing original-city/territory tests remain unchanged. No routing, tariff, base corpus, pool or timeout modification.

Final exact working-code checks, Node24.19.0:81isolatedtargetedPASS/0FAIL; mandatory offline1013PASS/0FAIL/1SKIP plus quote/API checksPASS; TypeScript exit0, scopedESLint exit0 with one unchanged unused-key warning; next build--webpack exit0 with preferredRegion deprecation. Logs /tmp/stage-a4-release-{targeted,audit,tsc,eslint,build}.log. Gates were repeated only after these confirmed new code-boundary corrections, not as a live/mass audit. No additional Photon or route requests for these corrections.

Separate real local acceptance already exercised the c962fb73 core detail fix: actual Photon-backed compound API first selected Красная100Краснодар; desktop/mobile pure-city A/B swap/clear and detailed-choice UI passed; one Moscow–SPb calculation returnedHTTP200. Those runtime captures precede these last guards; final guards are covered by saved-response replay/contract tests and final build, not misrepresented as a second live browser run. Preserve the exact runtime-source distinction in the A4 evidence checkpoint.

Next save bounded acceptance outputs, local memory/time observation, owner-reported A1 Preview evidence and unresolved new-source Preview/house-data/free-reserve requirements. No push authorized, publisheda1c169d3 unchanged.
