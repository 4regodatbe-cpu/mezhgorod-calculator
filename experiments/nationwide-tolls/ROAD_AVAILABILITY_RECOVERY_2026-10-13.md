# Road-price recovery checkpoint — 2026-10-13, execution environment OFFLINE

## Current verified state

User supplied screenshots Volnovakha→Moscow (1182.6 km/17h09) and Ufa→Petersburg (2018.8 km/26h18), requested fixing these and similar missing road fares. Last confirmed local commit8429442; remote experiment branch ad9a8b06f5363c3a2d9c71899a82b9148178005a. No main/merge/Production.

Implemented and verified in the local working tree BEFORE disconnect:
1. M4 validation changes24s/four-request batches/4.5s attempt →55s budget/two-worker queue/8s attempt; next plaza starts when a slot frees. Existing strict near-miss rejection skips needless requests; positive charges STILL require exact toll-tagged expected OSM nodes. Nonarray local trace edges fail safely.
2. M4/M11 midnight guard: every crossed Moscow day must have the same road-specific resolved profile AND applicable fare/source. Tue→Wed/Fri→Sat no longer falsely block; Thu→Fri/holidays/unknown year/hidden weekend/version change remain unknown.
3. OSRM M12 strict named-step evidence bound to the EXACT selected overview geometry, excludes destinations; retains unresolved candidate. Single continuous span uses existing calibrated core. Disjoint traversal is not silently omitted from a composed total.
4. Special route result retains selected M4/national diagnostics; composition reasons retain upstream failures.
5. Tests updated for the intentional calendar/pool policy, with new availability regression suite.

## Actual checks, not plans

Full npm run build -- --webpack FINAL:536/pass536/fail0; quote/API contracts PASS; TypeScript/Next16/16 PASS; scoped ESLint/diff-check PASS. First build failed two stale expectations (all date transitions null/peak4 requests); corrected Tue→Wed unchanged fare with Thu→Fri null and peak2; final build inspected. No browser/hosted POST claimed.

Actual local API-handler + external providers/trace:
- Volnovakha→Moscow BEFORE: OSRM1182.425km/61701s,35.414s API; null because only8/14 M4 candidates completed. Another diagnostic old run11/14 showed repeated4500ms timeouts and tail plazas exhausted budget.
- Same saved selected geometry AFTER queue change, ACTUAL new trace requests:14/14 candidates resolved,8 paid nodes/6 rejected; complete native3050 weekday/3890 weekend.
- Fresh final Volnovakha API: same OSRM1182.425km/61701s,54.732s API;3050 RUB priced/unconfirmed. Longer verification is intentional;25s route+55s proof fits120s API allowance.
- Fresh Moscow→Voronezh API: Valhalla516.348km/24040s,32.618s API;2300 RUB priced/unconfirmed; ordinary weekday midnight trip.
- Ufa→Petersburg BEFORE: OSRM2016.848km/94548s,14.861s API; null for m11/ckad while M12 was omitted.
- Ufa→Petersburg FINAL: same OSRM2016.848km/94548s,16.068s API; null with explicit m11,m12,ckad. Full Ufa fee NOT solved.

Ufa selected trace: M11 has a301.2m unnamed step around p679, followed by5.327km named M11→A118. CKAD is M7→M11, not the currently supported complete M4→M11 east arc. M12 has two separated traversals (eastern section and mainline), interrupted by M7/local16K-1091; cannot treat one known subset as whole fee.

Primary source read: existing scanned September Order274 PDF pages9/10, text layer empty. Mainline679–681/681–684 categoryI56 RUB effective04Sep2026; airport access38 and conditional combined94 (footnote2 requires airport RVP fixation). No new tail money enabled without exact passage binding. Official direct PDF web fetch403; current search index identified the same10-page September PDF. Original PDF exists under source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf. Re-read originals before implementing physical mapping.

## Blocker and persistence limits

During final docs/Git save, tool call stalled; it was terminated without a completion result. Subsequent read-only exec failed:
failed to query exec-server capabilities ...409 Conflict, environment_offline: Environment is not connected.

Thus the local final docs/commit command may or may not have executed. Do not claim a new local SHA or clean tree. Remote runtime remained ad9a8b06 when rechecked; NEW runtime source has NOT been published. Last verified functioning UI Preview remains https://mezhgorod-calculator-ir6hc5hpg-4regodatbe-5310.vercel.app/v3 (sourcea38c50e3,530 tests). This checkpoint is docs/recovery data only and does NOT deploy the fare fixes.

Complete local source files and gzip chosen-provider responses existed before disconnect, but are currently inaccessible. Do not fabricate or substitute them. Recovery JSON reconstructs executed code edits from inspected remote baseline and recorded tool commands; it is NOT a byte-hash comparison with the inaccessible final local tree. New helper/test/live-runner sources are retained within it. Before using, prefer recovered local files, compare, run gates, and verify actual fees again.

## Resume, precisely

1. Restore/check writable runtime. Locate /workspace/scratch/fff27e842376/current-experiment, read AGENTS/current state, git status/head and actual remote/PRs. Do not overwrite an existing modified tree.
2. Prefer its already-tested changes and local live-controls/*.provider.json.gz. If unavailable, run recovery/apply-road-availability.py --apply in an isolated experiment checkout; driver validates base Git blob SHA or skips identical targets, aborts conflicts BEFORE writing.
3. Recovery new test expects the chosen Volnovakha archive. Recover the original JSON+gzip; if not possible regenerate with node --import ./scripts/register-ts-paths.mjs scripts/v3-live-user-routes-audit.mjs volnovakha-moscow. This is actual fresh routing; confirm selected route geometry/proof before treating new fixture as equivalent. Other runner cases moscow-voronezh/ufa-petersburg.
4. npm run build -- --webpack, scoped lint/diffcheck; inspect source/fixture hashes. Persist implementation and detailed log in Git, publish exact experimental Preview, inspect its own536 gate/source/availability; do not claim docs-only deployment carries fixes.
5. Finish full M12 multiple/eastern products, M11 southbound head/mainline+tail and CKAD M7→M11 direct pair binding (dated matrix1313 RUB present but physical integration missing). Ufa/prior Petersburg totals remain OPEN. No borrowed competitor geometry, city-only fare, subset-as-total, main/merge/Production.
