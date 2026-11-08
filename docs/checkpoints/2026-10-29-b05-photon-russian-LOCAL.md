# B05 — Photon settlement language evidence, LOCAL verified

Parent work: a425195d, verification-start checkpoint e6b20a3c. Published Preview still d5be124153f649454dbb4fc55b4af427e7ab7d94; no push, deployment or CI change.

## Implementation and evidence

Regression-first `scripts/photon-russian-display.test.ts` reproduced `Unverified — Крым`. For coordinate-classified Crimea/four priority territories, settlement display now requires a Russian source field (`name:ru`/`name_ru`) or a Russian name in the existing reviewed RuWiki index scoped to the coordinate-derived territory. Non-Russian-letter/Latin values in those Russian fields are rejected. With no evidence the settlement is withheld, not translated. A manually maintained city display dictionary was removed; search aliases remain unchanged. IDs and coordinates are untouched. Non-settlement street/house handling and oblast-level responses remain unchanged.

Russian language tags are source evidence, not proof of upstream linguistic infallibility. Photon-only coverage can decrease for settlements with neither localized source fields nor a reviewed name; no invented replacement is supplied. GeoNames remains the independent settlement source in the Preview pilot. Foreign source names remain aliases for matching. All five compact regional labels come from existing coordinate classification, never provider country text.

Synthetic ranking fixtures now explicitly supply Russian-language fields: their existing assertions remain. Four foreign-name fixture cases explicitly model their source Russian name rather than relying on the removed translation dictionary. Dedicated new negative cases retain untagged Cyrillic and foreign values to test refusal.

## Checks actually completed, Node 24.19.0

- Focused Photon language/ranking suite: 39 PASS/0 FAIL.
- Mandatory offline `npm run test:audit`: 1002 PASS, 0 FAIL, 1 SKIP; quote/API adapter checks PASS, exit0.
- `node_modules/.bin/tsc --noEmit`: exit0.
- Scoped ESLint of changed TS files: exit0, zero errors, one existing unused `key` warning in the unchanged dedupe callback.
- `node_modules/.bin/next build --webpack`: exit0. Existing preferredRegion deprecation warning remains.
- Full local logs `/tmp/b05-photon-language-{focused,audit,build,eslint,tsc}.log`.

No new live routing requests or corpus rebuild. Existing CLI device login was not restarted; `whoami --format json --non-interactive` still returned loggedIn:false. Therefore real protected Preview checks are UNVERIFIED; they would exercise published d5be, not these local changes. New login URLs/share links were not created. No credential persisted in repository.

Next: generic explicit-region ranking regression, including Rostov versus DNR and actual GeoNames API cases; then exact existing Preview only if authentication completes. Historical protected experiment WORK_LOG/NEXT_STEPS not rewritten; this checkpoint and WORK_STATE are the authorized handoff.
