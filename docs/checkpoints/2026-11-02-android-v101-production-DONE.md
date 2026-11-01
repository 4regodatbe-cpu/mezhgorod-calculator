# Android V1.01 public download — Production published

2026-11-02 MSK. Owner explicitly authorized working-branch push, Production publication and public APK. PR14 remains OPEN/Draft; main and Android V2 unchanged.

- Clean local HEAD `2bba1f4036409ea1a45021fd04c783cce0fc5d4e`; remote `f6cc7f45…` verified as ancestor. Ordinary fast-forward push succeeded; remote readback matches.
- Actions 41352242498 and 41352242447 SUCCESS. Mandatory offline gate 1092 PASS, 0 FAIL, 1 SKIP; TypeScript, Next build and controlled address browser regressions PASS. Live jobs SKIPPED by existing classifier; no manual broad audit.
- Preview `dpl_5JsENcgeR5Lbm6YxGYXrzM8DkA1i` READY on this SHA; protected HTTP302 prevented direct Preview acceptance.
- Created a separate Production deployment with Production configuration from the exact source SHA through Vercel: `dpl_7YckGZayaDjZLPQgiSJ6JGws3w5p`, READY, target production. Its aliases include `mezhgorod-calculator.vercel.app`; previous deployment `dpl_6qV3pqU2bTx9kK3JpKa6hyw3yWSX` retained for rollback. No rollback required.
- https://mezhgorod-calculator.vercel.app/v3 returns the download link. Existing Opera browser session read the loaded page and found the accessible link “Скачать для Android”, targeting the correct same-origin APK. Initial navigation timed out, subsequent accessibility read succeeded. Automated click/download-manager behavior and mobile visual acceptance were not tested.
- Public unauthenticated GET https://mezhgorod-calculator.vercel.app/downloads/Iz-A-v-B-V1.01-debug.apk returned HTTP200, 819945 bytes; SHA256 `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a` matches the original Actions APK. Public raw GitHub snapshot download also returned HTTP200 and the same SHA.
- Basic Production check: `/api/suggest?q=Ростов` HTTP200, 20 items, first Ростов-на-Дону. Real POST `/api/v3/calculate` Donetsk (37.8029,48.0156) → Volnovakha (37.4968,47.6019), departure 2026-11-02: HTTP200, 56678 m, 3414 s, specialOnly true. Standard/comfort/comfort_plus/minivan totals 3967/4534/5101/6235 RUB, one special segment each; toll status free. This single successful case does not close all earlier route/provider issues.

Debug signing remains unchanged; installation on a physical Android device and update over an old APK are unverified. No signing secrets published. Further functional acceptance is separate from this completed publication. Final documentation is committed locally after the release; the running Production source remains `2bba1f40…`.
