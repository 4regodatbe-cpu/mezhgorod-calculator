# B01 adapter metadata fix LOCAL PASS / external credential BLOCKED / gate STARTED

28.10.2026; priorlocal56e2597/remotebase702f37f4. GEOAPIFY_API_KEY existence
flagfalse and no configuredcloudcredentialbinding; no secretvalue read, live
provider request, purchase/account or publicfallbackactivation. B01realcoverage
BLOCKED_BY_EXTERNAL_CREDENTIAL; same3providerreview/GeoNames not repeated.

One actualexperimentaldefect reproduced: provider datasource/debug could echo
the passedkey into returned unreviewedcandidate metadata. Newsyntheticregression
initially9PASS/1FAIL; fixed by bounded whitelist of source-name/attribution/
license/safehttpsURL, noURLcredentials/query/hash; drop key-bearingtext and
unvalidatedcountyobject. Preserve safeprovenance, distincthomonyms, defaultoff,
fullprimaryfailureonly, successfulpartial/emptypriority,20sremainingdeadline/
2srequest/no-retry/cancellation unchanged. No app/lib edit.

`node experiments/address-search/geoapify-fallback-experiment.test.mjs`:10/10
PASS afterfix. ScopedESLint0errors/0warnings, diffcheckPASS. Red/greenlogs
under experiments/address-search/checks/b11-reuse/local-b01-*.log; synthetic
keyonly, no realcredentiallogged. Experimentaladapter not productiontransport;
realregionalcoordinate/admin/license/attribution review remains required.

Next now STARTED: one complete mandatory offline test:audit including new
B11/B05tests, quote checks, TypeScript, scopedESLint and directNextbuild onNode24.
Use installedmatchinglockdeps, no pnpm build/liveprobe/provider capture/deploy.
Sandbox-supported per-command networkgrant allows childprocesses, not altered
app behavior. This verifies currentlocaltree, whose publicAPI stillunchanged;
not a build/CI proof of deployed B11. Preserve results/exitcodes locally and
technicalpatch. PublicationBLOCKED_BY_SECURITY_REVIEW; no retry/alternatewriter.
