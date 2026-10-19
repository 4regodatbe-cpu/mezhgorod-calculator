# Address-search next steps

1. **IN PROGRESS — live provider timeout.** Screenshot queries «Ростов», «Красн…», «Моск…» produced HTTP 502; Vercel logs identify Photon connect timeouts from `iad1`.
2. Save current local fix to the authorized branch: put `/r` and `/api/suggest` in `fra1`, enable Vercel request cancellation, propagate `/r`'s signal. Local focused suite 43/43 and ESLint pass.
3. Wait for Preview build. Confirm deployment region and replay the three screenshot queries through GET `/api/suggest` and the same POST `/r` flow the UI uses; inspect Vercel runtime logs. Update this handoff with actual status.
4. PR #14 remains open/draft. No merge or Production release without a direct request.

The local browser cache speeds repeated exact searches across A/B. It does not improve first-time Photon latency; a first-query optimization needs a separately verified faster provider or a staged UI design that preserves territory ranking.
