# B03 hosted Chromium DOM smoke — 26.10.2026

- Run [40336150199](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40336150199), push on allowed branch, source SHA `0895948e294b9f17efa00cb8a9a52c14bf9eef27`.
- Result: `completed/success`; `chromium-dom-smoke` job passed all five steps.
- Runner: GitHub-hosted Linux/Ubuntu 24.04 image, Node `v22.23.3`, Chrome `156.0.8078.47` (stable).
- Smoke only: `--headless=new --no-sandbox ... --dump-dom about:blank`; no application checkout, dependencies, app server, `/r`, or address lookup.
- Exit code: `0`; DOM: `<html><head></head><body></body></html>`; DOM criterion PASS.
- Chrome stderr contains environment-only D-Bus/UPower warnings/errors. They did not prevent browser launch or DOM creation; no app page was loaded.
- GitHub artifact ID `12656264139`, expiry 25.11.2026 14:04 UTC, SHA-256 `3645c3441239a8bd16a57c5abe5b8fba7b67ff95732bd1d788ecdb27acb5dd8e`.
- Downloaded ZIP is retained here as `b03-chromium-dom-smoke-40336150199.zip`; its SHA-256 matches the Actions artifact digest. It contains runner/browser versions, environment stderr, DOM, Chrome stderr, exit code, and DOM check.

This closes only the browser-runtime prerequisite. It is not an address-search UI test and does not establish that the B-only issue is fixed.
