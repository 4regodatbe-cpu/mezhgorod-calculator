# Android V1.01 download button — LOCAL/PARTIAL

Date: 2026-11-01 23:24 MSK. Branch: `fix/v3-missing-route-prices-2026-10-15`; source remote HEAD: `f6cc7f4550010b4477f48b6d67d1c2abcc452e29`; PR #14 Draft. No push or Production deployment authorized in this task.

## Input and history

- Preserved the local unpublished hosted-acceptance commit `09f361fd…` and merged the two newer remote Android commits without rewriting history. The only merge conflict was the two new top entries in `docs/WORK_STATE.md`; both were retained. Local merge commit: `239def45a9995b80403b482dee5212eed23eedfb`.
- Existing V2 download button targets release `android-latest`; it and `android-app-v2` remain unchanged. The Android V1.01 Actions run [41340511993](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/41340511993) produced artifact `13097107982` for source commit `d306f5b8…`.
- The authenticated `gh run download` request returned 403 Forbidden from the artifact object store. The GitHub Connector's official artifact download succeeded. ZIP integrity passed; extracted `Iz-A-v-B-V1.01-debug.apk` is 819945 bytes with SHA-256 `a7a44d60a68940fa695532aec8482cd98111bd8841f2ec921205861ff1b6c69a`.

## Public-asset decision and implementation

- A separate GitHub prerelease asset was attempted because it would preserve the existing V2 release. GitHub's upload endpoint returned HTTP 401 Bad credentials. The release command rolled back: the proposed release ID/tag are absent. The same upload was not retried or bypassed.
- Used the existing Next.js `public/` static-file mechanism instead of adding a service: the verified APK was copied byte-for-byte to `public/downloads/Iz-A-v-B-V1.01-debug.apk`. The V3 page links to this relative path with a 40-pixel-high, keyboard-focusable button labeled “Скачать для Android · V1.01”; it is hidden inside the Android WebView. V2 code, routing, tariffs, search, Android builds and Production were not changed.
- The static URL is **not yet publicly deployed**. It is a prepared future same-origin download; do not present `https://mezhgorod-calculator.vercel.app/downloads/Iz-A-v-B-V1.01-debug.apk` as active before an authorized deployment and external readback. The debug signature does not guarantee installation over an older APK.

## Checks

- Before implementation, new targeted tests failed because the APK and V3 link were missing. After implementation: direct `node scripts/android-v101-download.test.mjs` **2 PASS, 0 FAIL**; it checks file length, SHA-256, V3 link, and preservation of the V2 release URL. `node --test` in the sandbox failed to spawn its child process, so direct execution was used.
- TypeScript `tsc --noEmit` exit 0; scoped ESLint exit 0; direct Next.js 16.3.4 production build exit 0. The existing `preferredRegion` deprecation warning is unrelated.
- Local full `pnpm test:audit` exit 1: **183/186 test files passed**, the three already known child-process tests failed under sandbox. No new failure in the changed test; hosted mandatory gate remains required after publication.
- Local production server `GET /downloads/Iz-A-v-B-V1.01-debug.apk`: HTTP 200, `Content-Type: application/vnd.android.package-archive`, `Content-Length: 819945`; downloaded bytes have the exact expected SHA-256. `GET /v3` rendered the link and label.
- Local desktop/mobile Chromium screenshot attempts did not finish because of recurring TLS `net_error -202`; no visual result is claimed. Published Preview and public no-auth download were **NOT_RUN**, because the new asset and button are not published.

## Next safe step

After separate publication authorization: recheck remote ancestry and changed files, perform one normal fast-forward push, wait for mandatory CI and exact-SHA Preview, verify the APK from a public URL without GitHub authentication and compare SHA-256, then test the button on desktop/mobile. Do not update Production without separate authorization. This checkpoint is local only.
