# B05 — Crimea-first ranking, LOCAL

Owner's new rule supersedes historical new-territory-first expectations. Local parent: aeed2ad3a78849bff8700478136274f3f2fce2da; published Preview remains d5be124153f649454dbb4fc55b4af427e7ab7d94. No push, CI change or deployment.

Changed GeoNames settlement tiers to Crimea → four priority territories → remaining Russia → other countries. Photon exact comparable settlements now use the same order; explicit supported area qualifiers still win, and Crimea POIs receive no settlement boost. No source corpus, IDs, coordinates, routing or tariffs changed. Historical assertions changed only where they expressly required the superseded geographical order.

Regression-first: both new ranking tests failed with the original order, then passed after the minimal changes. Commands:

```
node --import ./scripts/register-ts-paths.mjs --test --test-isolation=none scripts/address-priority.test.ts scripts/address-search.test.ts experiments/address-search/local-gazetteer-priority.test.mjs experiments/address-search/local-gazetteer.test.mjs
node_modules/.bin/tsc --noEmit
npm run test:audit
node_modules/.bin/next build --webpack
```

Targeted 43/43 PASS; TypeScript exit 0; full offline gate exit 0; webpack production build exit 0. Full logs retained locally in `/tmp/b05-priority-{targeted,tsc,audit,build}.log`. Default isolated test launch gave a generic test-worker failure; same test in `--test-isolation=none` exposed the actual failing assertion and verified the fix. Build used approved standard execution permission. Existing preferredRegion deprecation warning remains.

Incomplete: universal verified-Russian-only display is not yet implemented; current fallback can expose unverified provider names. Explicit arbitrary Russian region qualifiers beyond existing supported matching need separate regression coverage; not claimed universally fixed. No repeat corpus validation. Existing omitted-name guard untouched. Preview real desktop/mobile/API/resources remain unverified pending authorized device login. The login challenge is deliberately not saved here. No credentials or tokens stored in repository.

Next: language provenance and fail-closed display handling, then targeted guard/API tests; after login use exact existing protected Preview and distinguish its published behavior from this local-only change.
