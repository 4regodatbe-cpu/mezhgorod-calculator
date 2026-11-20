# V1.01 special internal routes: publication and hosted acceptance — PARTIAL

Date: 2026-11-01 18:49 UTC. Authorized scope: one ordinary fast-forward push to `fix/v3-missing-route-prices-2026-10-15`; no second push, Production, main, V2, Android, backup refs or PR merge.

## Publication

- Starting remote: `2c52c81425cd59ea6e4ea9f3ca3c47b34d8a83b6`; prepared local HEAD: `3f185c7b0fcffc003347f7b35dff32ea1c620851`. The worktree was clean and the remote was an ancestor of the local HEAD.
- Six commits and 24 changed files were reviewed; no CI configuration, unplanned artifacts or detected secrets. V2-only defaults in shared components were retained.
- One `git push origin HEAD:refs/heads/fix/v3-missing-route-prices-2026-10-15` succeeded, exit 0. Remote readback: HEAD `3f185c7b0fcffc003347f7b35dff32ea1c620851`, tree `e76506ed0974b3d4145c7d1d5e2df09fee3bf65c`, matching local. Six representative changed blobs matched local and GitHub readback. PR #14 remained OPEN/Draft.

## GitHub Actions on exact SHA

- [Route quality 41337975840](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41337975840): SUCCESS; route/tariff regressions, benchmark integrity, production build and V2 request-validation smoke passed.
- [B03 browser 41337981188](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41337981188): SUCCESS; `verify` and `address-ui` passed. Current browser results were 10/10 PASS on SHA `3f185c7b`; artifact `13095788823`.
- [Special territory 41337981186](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41337981186): overall SUCCESS; `verify` passed mandatory offline gate **1090 PASS, 0 FAIL, 1 SKIP**, TypeScript and Next.js build. `calculation_timing` passed with a real Donetsk→Moscow handler HTTP 200, 1,123.25 km, 58,336 s, 8,255 ms. Its log explicitly says `tariffIndependentlyVerified:false` and `deployedBrowserEndToEnd:false`; it is not proof of full Preview acceptance.
- The separate `live_probe` job **FAILED**, despite overall workflow SUCCESS: provider geometry step succeeded, but the bounded production address collector returned `SOURCE_UNAVAILABLE` for `Донецк` after 278 ms (4 HTTP 503 and 3 source cooldown; zero features). `Ростов` passed in 1,192 ms and `Красн` passed in 781 ms. The 50-settlement and Yandex steps were skipped. Artifact `13096321909` was uploaded; attempted download returned 403 Forbidden from the artifact object store, so the job log is the available readback. No rerun was initiated.

## Preview and acceptance boundary

- Vercel deployment `dpl_9gY3NN6WnrQYHUL4b9R8fkFt7EaA`, [exact-SHA Preview](https://mezhgorod-calculator-8r1o00ihs-4regodatbe-5310.vercel.app/v3), is READY and reports commit `3f185c7b` on the allowed branch, target Preview.
- Normal HTTPS requests redirect to Vercel Login. The browser connector returned `UNAVAILABLE` after a 30-second deadline. Local `vercel` CLI, a linked `.vercel/project.json`, and `VERCEL_OIDC_TOKEN` are absent. No share link was created and protection was not changed. Thus desktop/mobile browser acceptance on this deployment is **NOT_RUN**.
- The actual deployed Donetsk→Volnovakha and Donetsk→Melitopol distances, times, absence of Crimea detour, four tariff sums and single group are **NOT_VERIFIED**. Likewise cross-region reverse and exact preservation of dual pricing in Preview are **NOT_VERIFIED**. Pre-push local controlled tests and the two bounded OSRM geometries remain evidence for code behavior, not a substitute for the deployed full calculation.
- The new Ростов-на-Дону GeoNames display/order was verified locally by controlled tests, and the hosted live address collector saw Ростов-на-Дону within the first eight, not necessarily first. The deployed Preview ordering against Rostov in Yaroslavl is **NOT_VERIFIED**.

## Next

Do not claim live route defect closure. Obtain authorized protected-Preview access, then run the requested bounded desktop/mobile route and address scenarios on this exact SHA; review Photon 503/cooldown separately. No second push under this authorization. This checkpoint and the state/log update are local only.
