# Other road cases — retained result digest

- **CKAD M11→M12:** prior request timed out with no HTTP response; owner count was unchanged at 991. `outcome_unknown` persists and replay is forbidden. Physical interchange evidence does not reconstruct the lost response.
- **M11 PVP18:** Stage 7 HTTP 200, 6,369 m; raw WKT was not retained, so exact directed path/price attribution is unavailable. Do not repeat.
- **Pulkovo both directions:** Stage 7 calls and OSM gate witnesses are documented in Stage 7 sources; no repeat. Payment aggregates do not distinguish airport-only vs conditional combined fares.
- **ZSD RVP64:** one Stage 7 short result, 176 m, payment fields unavailable/null; physical node identity confirmed separately. Treat as negative geometry/control only, never zero-fare proof or a standalone PVP.
- **M-4 PVP62–71:** the earlier pilot is accepted as done and is not repeated. Full request/raw geometry is absent in this checkout. The machine-readable cases in `m4-62-71/scenarios.json` distinguish a directed exit at PVP62 from a continuous route reaching PVP71; both remain unknown until route and operator evidence is available. No difference in price or charge is inferred here.
