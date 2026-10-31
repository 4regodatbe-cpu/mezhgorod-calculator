# Address retry published — CI and browser acceptance PARTIAL

28.10.2026 MSK. Remote source/branch: fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7, fix/v3-missing-route-prices-2026-10-15. PR14 Draft. No Production/main/Android/backup changes.

## One authorized publication

Owner authorized one normal update and its automatic broad CI plus one local offline gate. Base checked8fb4d137308450affc984de272adebbfd67d0851, no concurrent changes. Connector recreated exact local commit trees: 8d362961→30c5afe722658d03a643275c2a89962c775ce91e (tree2cd4e178e29f2e1318d2cd4e24323e44e3a9674d); 6e8ab678→fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7 (treec14dc278dfdc143b8ff68162b8ff053bd306269b). One non-force ref update with expected parent; remote HEAD/tree read back match. No workflow edits, manual audit dispatch or job reruns.

## Actual results

- Local authorized npm run test:audit:991/991 PASS + quote/API adapter PASS; log /tmp/address-resilience-authorized-audit.log SHA256839556aea0727bfdbe3009ccd75ef28242421923102f42234509f9706465f0f2.
- Actions40740322418 overallSUCCESS, attempt1; verifyPASS on Node24.22.1,991/991, TS and Next buildPASS. Warnings: preferredRegion deprecation, punycode/url.parse, forced Node24 for Node20-targeting actions.
- calculation_timingPASS: handler7391.266ms, supervisor7773.603ms; one Donetsk→Moscow handler, not deployed E2E/independent tariff verification. Artifact12839851250 SHA2562a703563800931b7bd5508ebd040b56ab8ee120af8b2139cc4817f47c39de136; downloaded/hash verified.
- live_probeFAIL despite workflow-levelSUCCESS (existing continue-on-error). Geometry/per-leg stepPASS. Address stepCHECK_FAILED: RostovPASS4695ms; КраснPASS3158ms with2HTTP503; Donetsk1018ms returned DNR first but not Rostov homonym second, failures={http_503:3,source_cooldown:3}. 20features returned, no budget exhaustion in this request. No claim that retry fixed HTTP503/circuit coverage. 50-settlement/Yandex stepsSKIPPED after address failure. Artifact12838399589 SHA2566ce095d16fd99abb780819c61fea6111fe3b85755e2c936053c43c924624ff64; downloaded/hash verified. Primary JSON address-search-runtime-probe.json retains raw features/checks. No retry of live job.
- Actions40740322659SUCCESS: verifyPASS and browser18/18PASS (legacy8/current10), sourceSHAfc83523d, Node24.22.1/Chrome156.0.8078.47. Artifact12839346702 SHA2567188d942f663c7f142d77aa6ee6d5b739590fc5dea0e87b3a86fa62d899aa4c7; downloaded/hash verified.
- New prepared browser scenario run locally against built production app: Chromium141.0.7390.37, desktop1280x900/mobile375x812,20A/B replacements each (40total), second address retained, no automatic Donetsk homonym substitution, controlled502→retryPASS. All /r and API replies deliberately mocked. /tmp/address-local-browser-results/results.json SHA25683cff23a291c379f71607c8ec662ca2fc27151e806855ced175e216164588b8a. Not real route calculation/geocoder/Preview evidence.

## Preview access blocker and remaining defects

Automatic Git Preview dpl_7X8NtHuMWxVWnBi1zoQUG1h7oJ12 READY for exact remotefc83523d; targetnull, URL https://mezhgorod-calculator-ambdlctdc-4regodatbe-5310.vercel.app. No redeploy/promote/Production change.

No authenticated Vercel CLI/OIDC credentials in this execution environment. Connector get_access_to_vercel_url was REJECTED by automatic approval review: a share link would grant access to anyone holding it for23hours, not explicitly authorized. No alternate tool used to recreate that link or disable protection. Preview real browser/mobile flow NOT RUN. Need existing approved authenticated Preview access or explicit authorization for that temporary share link.

Connection retry only mitigates transient connect timeouts within original20s. Complete Photon outage and HTTP503/circuit-breaker loss of homonyms remain unresolved. No independent provider/guaranteed instance switching implemented. Search is NOT declared fully fixed.

This final checkpoint/WORK_STATE update is LOCAL ONLY: a second publication may trigger more historical PR workflows, outside the one-update authorization. Preserve local report and portable patch; remote remainsfc83523d. Next: authorize safe Preview access and an appropriately scoped follow-up for proven503/cooldown coverage; no broad live reruns without approval.
