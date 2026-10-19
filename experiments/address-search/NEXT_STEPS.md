# Address-search next steps

1. Code/tests are saved on the authorized branch in commit `b8c3766aa3163c0e9e0c0d4310ac22ac46dd1a29`; Vercel Preview full build passed (809/809 tests, static generation 16/16).
2. PR #14 remains open/draft. Do not merge or publish to Production without a direct request.
3. If the issue persists after eventual release, collect the exact point-B query and reproduce through `/api/suggest` before changing query/ranking behavior.

The local browser cache speeds repeated exact searches across A/B. It does not improve first-time Photon latency; a first-query optimization needs a separately verified faster provider or a staged UI design that preserves territory ranking.
