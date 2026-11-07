# DONE — address suggestion latency and repeat searches

2026-10-19. User reported that the calculator could not find the destination (point B), then asked whether address search could be accelerated. The exact missing address was not supplied, so an address-specific miss was not reproduced.

## Findings and implementation

- Point A and point B share `app/v2/components/address-field.tsx` and `/api/suggest`.
- Published API probes for «Краснодар» took 6.37–9.20 s and returned suggestions; direct Photon took 6.78 s. Variation across probes does not isolate caching/provider/network effects.
- Added `lib/photon-fetch.ts`: a 10-second per-request deadline, propagation of caller cancellation, response validation, and preservation of Next's 300-second revalidation. Integrated into `app/api/suggest/route.ts`; partial-source success and ranking stay unchanged.
- Added a shared browser-side normalized LRU cache for non-empty results: 5-minute TTL, up to 128 query keys. It can make a repeat query across A/B immediate. First-time lookup still depends on Photon and is not claimed faster.

## Validation and persistence

- Focused tests passed 42/42; targeted ESLint passed.
- Saved to authorized branch `fix/v3-missing-route-prices-2026-10-15`, commit `b8c3766aa3163c0e9e0c0d4310ac22ac46dd1a29`; branch and PR #14 heads were verified at that SHA.
- Vercel Preview deployment `dpl_F3ftRbQdneZEoJrhZ3XfgoJHESMy` reached READY. Full `pnpm build` audit output: 809 tests passed, 0 failed; quote/API checks passed; Next compile succeeded; 16/16 static pages generated. The new Photon and address-cache tests appeared in the audit output.
- Preview `/api/suggest?q=Краснодар` returned HTTP 200 with 20 suggestions.
- PR #14 remains open/draft. No merge or Production release was performed.

## Follow-up

If the exact point-B address still fails after an eventual Production release, obtain the literal query and reproduce it through `/api/suggest` before changing provider or ranking behavior.
