# V3 corridor headings — Production released

2026-11-02 MSK. Owner authorized publication of prepared changes. Normal fast-forward push a05fba10→76442adbddcedceea8b9ff2b2ddc846ec861b5e7; remote readback and PR14 OPEN/Draft confirmed. Main, Android V2, tariffs/routing unchanged. Experimental corridor switch remains unimported by app/lib; it is not enabled on the website.

Actions 41416390537 (route-quality) and 41416402489 (verify/browser) SUCCESS. 41416402575 overall SUCCESS: mandatory offline1104 PASS/0 FAIL/1 SKIP, TS/build and timing PASS. Separate live_probe FAILED on known Photon Donetsk SOURCE_UNAVAILABLE, HTTP503/cooldown. No manual reruns or broad audits.

Preview dpl_6AnN6GnXCfMmWbUanDNhG7NZSAPX READY. Separate Production deployment dpl_7bL6TnTJBw9sPTBhJQaNzo7e4fcE READY on exact SHA, main alias assigned. Previous production dpl_VdMSM7rCqAvwK4jHAV9pasDXDm8x retained for rollback; no rollback needed.

Main-site /api/version returned commit76442adb and environment production. Fetched published /v3 scripts and verified all three corridor headings exist. Two real POSTs with a UI-format current departure instant returned HTTP200: Donetsk→Volnovakha specialOnly=true maps to “Выбран маршрут по новым территориям”; Donetsk→Yalta specialOnly=false with selected mainland metadata maps to “Выбран маршрут через материк”. This validates deployed response + production text + tested pure heading mapping; an interactive browser result screenshot was not captured.

APK is the existing WebView of /v3; no APK rebuild/signing change. Users receive new web UI after refreshing/reopening the app; physical-device refresh not tested. Main-site switch still absent until two real candidates are connected. Final result checkpoint/state committed locally after release, Production source remains76442adb.
