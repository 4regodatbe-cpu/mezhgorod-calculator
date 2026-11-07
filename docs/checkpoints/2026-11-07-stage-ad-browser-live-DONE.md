# Stage AD browser/live checkpoint — 07.11.2026

Application build/source `176e1d8ef3f38e5b1d3643a5c2d4711ab9766348`, version endpoint checked. Local server port3208 only, GeoNames local test flags explicit; no Production flags/settings changed. Standard pnpm11.25.0 frozen install/build including Turbopack PASSED (1155 PASS/0 FAIL/1 SKIP at this implementation). TypeScript passed in build; lint0errors/9existing warnings. Installed node_modules is local directory with ordinary pnpm internal links, unlike AC's external root symlink.

Real Chromium on actual built React app, controlled `/r` and calculation replies: desktop14/14, mobile14/14 PASS. Address selection/street refinement/clear/preserve/reverse/recalculate, upstream error/retry, cancel/late response and no horizontal overflow covered. Analytics blocked; no Google Sheets writes. App version matched exact source. Initial selector `Куда` also matched `Откуда`; corrected harness to exact accessible names. That was a harness failure, not runtime defect. Screenshot review confirmed day/hour display and honest unknown toll. Does not certify live routes or street membership.

Four live address queries, exactly once each: Краснодар Красная — 3 street ways within returned Краснодар context; Москва Тверская — 1 street way within Москва context. These outputs passed existing runtime street-context filtering; no separate cartographic survey is claimed. Донецк ДНР Артёма and Ялта Кирова — partial GeoNames settlement-only output, not verified streets. Current response labels/IDs captured without raw provider geometry. Existing offline foreign-city namesake regressions remain passing.

Two live route POSTs, one each, original coordinates/departure 2026-10-02T09:00:00+03:00: Тверь→Адлер HTTP200, OSRM, 1836455m/90093s, toll unknown; Valhalla400 and BRouter400. Голубицкая→СПб HTTP200, OSRM, 2210036m/101385s, toll priced; Valhalla400, BRouterHTTP200 route rejected by geometry validator. End-to-end ~12.4s/~20.1s (includes matching). No repeat or benchmark substitution. Historical failures remain unproven; current full success demonstrated.

The latter exposed a diagnostics defect: rejected HTTP200 geometry lost known HTTP status and reported geometryUsable=true. Corrected attempt metadata and added actual-handler regression; final gates/rebuilt exact SHA still required. No toll/route-selection changes.

Freshness proposal remains isolated; mandatory strict30day gate unchanged. Final action: commit refinements, run final standard build/offline and exact-SHA local browser, then logs/manifest/bundle. No push authorized.
