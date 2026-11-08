Status: DONE — 27.10.2026 02:28 МСК.

Task: reliability plan block2, V2 unknown/null presentation. Parent `1d8892d542b4eef1f973f0ad8489372c05613b3e`; branch `fix/v3-missing-route-prices-2026-10-15`; PR14 remains Draft.

Existing helper tests covered unknown toll resolution, base-only quote, explicit free zero, priced quote and alternative-route fare copy. A new server-render regression reproduced an actual UI contradiction: a manual 3,050 ₽ road amount produced a labeled 3,150 ₽ trip total while the card also said the full amount was not calculated.

Changed `app/v2/components/route-card.tsx` so the “full amount is not calculated” note is hidden only while a manual toll override is entered. The provider's unknown toll status remains visible, and the manual amount remains labeled. Added `scripts/v2-unknown-result-render.test.mjs` for unknown/base-only and manual-total rendering, plus a V2 clipboard regression confirming unknown tolls are copied as unknown and never as zero. No tariff, routing, or pricing rules changed.

Checks PASS:

- `node scripts/v2-unknown-result-render.test.mjs` — 2/2.
- `node --import ./scripts/register-ts-paths.mjs --test scripts/v2-quote-presentation.test.ts scripts/v2-hook-unmount-abort.test.mjs` — PASS.
- `npx tsc --noEmit` — exit0.
- `npx eslint app/v2/components/route-card.tsx scripts/v2-unknown-result-render.test.mjs` — exit0.
- `git diff --check` — PASS.

No browser, network, full build or broad CI was run. Technical progress 6/24 (25%): 1,2,12,17,19,22. Block20 remains PARTIAL. Next block3: V3 unknown/null response and display contract. Changes must be committed and verified on the allowed remote branch before further work.
