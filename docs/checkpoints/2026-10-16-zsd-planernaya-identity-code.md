# Exact Planernaya identity change — CODE DONE / tests NOT run

16.10.2026 MSK parent32b36177/tree7df8a968 verified equal local. Added only exactnode1766158781→zsd to existing primary identity register with directedgraph/sourceURLs/SHA. No tariff/codeheuristic/routeIDs added to runtime. Added four regressions: primarySHA/directedgraph/selectedledger; actualunknownbooth mapsZSD while zone1quote stillrefuses; nearbyunknownnode stillblocks; incomplete trace stillblocks. Existing generic lookup consumes newidentity. No test/build yet run, not accepted asvalidated.

NEXT STARTED focused node --import ./scripts/register-ts-paths.mjs --test scripts/v3-zsd-planernaya-identity.test.ts scripts/v3-chain-boundaries.test.ts plus eslint newtest. Save result before required fullgate npm run build -- --webpack, then samecase replay. Plan90%18/20, sourcepricegates preserved. No main/merge/Production.
