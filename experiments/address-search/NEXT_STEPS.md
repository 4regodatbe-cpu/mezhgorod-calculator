# Address-search next steps

1. **IN PROGRESS — live provider timeout.** Screenshot queries «Ростов», «Красн…», «Моск…» produced HTTP 502; Vercel logs identify Photon connect timeouts from `iad1`.
2. Region-only Vercel config attempt did not move functions: response header showed edge `fra1`, function `iad1`; its live results were mixed and include HTTP 502. Next.js `preferredRegion="fra1"` is now added to both handlers; request cancellation and proxy signal propagation are enabled.
3. Wait for the new Preview build, confirm runtime region from response headers, replay the three screenshot queries, and inspect Vercel runtime logs. Update this handoff with actual status.
4. PR #14 remains open/draft. No merge or Production release without a direct request.

The local browser cache speeds repeated exact searches across A/B. It does not improve first-time Photon latency; a first-query optimization needs a separately verified faster provider or a staged UI design that preserves territory ranking.
