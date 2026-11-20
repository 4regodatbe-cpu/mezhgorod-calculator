# Stage AD exact status refinement

Validation diagnostics must not infer that every successful provider response was HTTP200. A private WeakMap now carries the actual response status alongside the unmodified route object; it is not serialized into public API geometry/price. Both accepted and validator-rejected route candidates use that exact status. Added actual-handler200/201 regression. No route selection or tariff changes.

Correction to the earlier live checkpoint: Голубицкая BRouter completed transport/parsing and was rejected by validation, but old metadata did not retain its exact2xx code. HTTP200 in the earlier prose was an inference, not preserved response evidence. Do not repeat the external call to repair historical metadata. Final report says successful2xx/code not retained. Final gate/build and exact-version controlled browser follow on this refinement.
