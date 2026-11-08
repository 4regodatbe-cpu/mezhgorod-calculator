# B05 — verified Russian display guard in GeoNames, LOCAL

Parent ff1d1c05164c19901b6f1468282d8acb2b052ea4. No publication or deployment.

Regression-first test demonstrated that a priority-region record carrying `ru_name_unverified` was still displayed as `Unverified — Крым`. The local search now withholds priority-region records whose saved display name is explicitly unverified, lacks Russian Cyrillic, or contains Latin/Ukrainian-specific letters. It does not infer a Russian name from an arbitrary alias. Existing admitted source-tagged Russian names and their search aliases, IDs, coordinate values and provenance are unchanged. No rebuild or repeat validation of the source corpus.

Builder provenance: `local-gazetteer-build.py` selects names only from saved alternate names tagged `ru`, with dated/historical exclusions; its `ru_name_unverified` flag distinguishes fallback names. A language tag is source evidence, not independent linguistic review of every record. The old synthetic Crimea test now carries a Russian display name and preserves the Latin lookup alias; its coordinate-not-country assertion remains.

Actual verification (Node 24.19.0):

- Targeted language/ranking/index/API/safety tests: 13 PASS, 0 FAIL. Uses actual admitted data with Photon completely unavailable, existing excluded-name guard, data failure and abort fallback tests.
- `npm run test:audit`: exit 0; 999 PASS, 0 FAIL, 1 SKIP; quote/API adapter checks PASS. This offline gate does not include every experimental test, hence the separate targeted command.
- `node_modules/.bin/tsc --noEmit`: exit 0.
- `node_modules/.bin/next build --webpack`: exit 0; preferredRegion deprecation warning remains. No live route audit.
- Local full logs `/tmp/b05-language-{targeted,audit,tsc,build}.log`.

Incomplete: Photon still falls back to unverified raw names for some priority-region settlements. This commit does NOT guarantee Russian-only output across fallback providers. No whole-corpus linguistic proof, no actual protected Preview/browser/API/runtime measurements. Existing Preview still contains published d5be, not these local fixes. Vercel device login awaits explicit user confirmation; no challenge or credentials saved. No share access created.

Next: Photon verified-name selection without generated translations; generic explicit-region ranking tests; after authorized login, test existing Preview separately. Push still prohibited.
