# Repeated address search — timeout regression patch, 2026-10-20

Status: local checks PASS; live patch verification pending. Parent417b68441e99fba88751d68a3e01720bc754fb50. No new Production release.

## Evidence and limits

Published GET /api/suggest?q=Доне returned502 via Vercel connector; a separate curl control returned502 after15.912849s (includes transit/startup). Direct global Photon q=Доне&limit=20 returnedHTTP200 after11.272841s,20 features including Донецьк. Raw successful response saved at experiments/address-search/2026-10-20-photon-done-response.json. A valid provider response can exceed our newly introduced10s deadline. The exact reason for all7 failures inside Production remains unobservable because its catch swallows errors; direct probe is a different network path and does not prove every Production failure was deadline-driven. No claim of provider429 or a permanent field-state bug.

## Patch

lib/photon-fetch.ts extends hard limit10→20 seconds, preserving cancellation and finite waiting. No automatic retry multiplying7 concurrent requests. Adds bounded failure categories only; app/api/suggest/route.ts logs elapsedMs, sourceCount and failure counts when all provider windows reject. No query text, coordinates, URLs or raw error messages logged. Cancelled client calls are not logged as outages. Windows/ranking and both A/B component behavior remain unchanged.

Regression simulates valid response at11.3s with fake timers; previous10s implementation would cancel it. Diagnostics tests cover503/429/deadline/connect-timeout/invalid data and raw-text suppression. Existing timeout and abort tests still pass.

## Actual checks

Focused suite45/45PASS. Full test:audit819/819PASS plus quote/API contractsPASS. Targeted ESLintPASS. next build --webpackPASS, compilation/types/static generation complete. Full stdout preserved in experiments/address-search/2026-10-20-repeated-search-{audit,build}.log.gz. git diff --checkPASS.

## Next

Save/read back exact tree, await Preview standard build and one bounded live Доне control. Inspect sanitized server diagnostic if it still fails; do not call this fully fixed based only on fake timers/direct Photon response. Production remains old release; PR14draft.
