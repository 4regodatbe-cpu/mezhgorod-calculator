# B05 explicit-region matching — LOCAL verified

Base implementation 0d1a3331; verification started at 07bb3b3a. No push; published source remains d5be124153f649454dbb4fc55b4af427e7ab7d94.

## Defect and minimal change

Two regression-first cases failed: `Донецк Ростовская область` and an unrelated synthetic `Одинаковое Московская область` did not prefer the explicitly requested ordinary region. Photon now recognizes ordinary-region suffixes from existing provider state/county fields, strips that qualifier for name matching, and grants the existing explicit-area score. This applies outside the five coordinate-classified priority areas only: misleading provider state text cannot relabel DNR/Crimea or override their coordinate-derived area. The previous Donetsk-specific Rostov score bonus was removed; no per-city exception was added. Generic matching currently recognizes ordinary regions with the implemented oblast/krai/republic/region suffix form; this is not a claim to parse arbitrary free-form administrative prose.

Unqualified tiers are unchanged. Both Donetsk namesakes remain selectable, with unchanged IDs/coordinates. Existing fixed Crimea/new-territory qualifiers retain their priority. The GeoNames corpus/guard was not modified: actual API regressions now include all seven owner-requested queries and preserve exact IDs 709717/565348 for Donetsk and 689198 for Volnovakha. Rostov's saved administrative label has source title case `Ростовская Область`; region matching tests ignore case, not content. All five product region labels remain exact.

## Actual checks, Node 24.19.0

- Focused Photon language/ranking/region suites: 42 PASS/0 FAIL.
- Actual admitted GeoNames/API/safety/guard tests with external fetch throwing: 7 PASS/0 FAIL. City queries made zero Photon calls; street fallback, excluded-name guard, abort and route-coordinate compatibility assertions retained.
- Mandatory offline `npm run test:audit`: exit0; 1005 PASS/0 FAIL/1 SKIP; quote/API adapter checks PASS.
- TypeScript exit0; scoped ESLint exit0 with one unchanged unused-key warning; webpack Next production build exit0 with existing preferredRegion warning.
- Local full logs `/tmp/b05-regions-{focused,api,audit,build,eslint,tsc}.log`.

No repeated live audit or new routing-provider requests. Vercel whoami remains loggedIn:false even with standard Node proxy opt-in; no new login link, credential request or share access. Existing protected Preview checks are still UNVERIFIED, and new local fixes are not present there. Next: local desktop/mobile real-GeoNames UI smoke on this built source, then authorized existing Preview if CLI authentication completes. No publication without separate authorization.
