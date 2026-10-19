# Address-search decisions

- 2026-10-19: Preserve the current Photon URL generation, result ranking, territory priorities, partial-success behavior, and 300-second Next fetch revalidation. Add a bounded 10-second timeout per Photon request and propagate cancellation from the incoming `/api/suggest` request to its upstream fetches. This limits stale or indefinitely pending work without assigning made-up coordinates or changing address ranking.
- 2026-10-19: Do not describe the point-B symptom as fully reproduced: the user did not provide the missing address. The live «Краснодар» control returned results after 8.224717 seconds, showing slow behavior in the shared path.
- 2026-10-19: No Production publish or PR merge is included in this task.
- 2026-10-19: Reuse non-empty address suggestion results in a bounded browser LRU for five minutes (up to 128 normalized queries). This accelerates repeat searches across the A/B fields without inventing coordinates; first-time lookups still wait on Photon.
