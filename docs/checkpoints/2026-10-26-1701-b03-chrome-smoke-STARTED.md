# B03 Chromium hosted smoke — STARTED

26.10.2026 17:01 МСК. Source/parent: allowed branch `fix/v3-missing-route-prices-2026-10-15`, remote SHA `1ac7776dea54139554cfce39b20d11b7a04125a2`; PR #14 Draft. No active Actions at start.

## Scope

This first B03 block checks only that GitHub-hosted Chrome can launch and create the DOM for `about:blank`. It does not checkout/run the application, install project dependencies, use snapshot data, access `/r`, or begin any of the eight UI scenarios. The isolated workflow `.github/workflows/b03-chromium-dom-smoke.yml` installs stable Chrome using `browser-actions/setup-chrome` pinned to `c785b87e244131f27c9f19c1a33e2ead956ab7ce`, records runner/Node/Chrome versions, and captures DOM stdout, stderr, exit code, and a DOM check artifact. Chromium has a 30-second process limit and opens no external page; background browser networking is disabled for the smoke.

## Command and success criterion

```text
timeout 30s "$CHROME_PATH" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-background-networking --disable-extensions --disable-sync --no-first-run --no-default-browser-check --user-data-dir="$RUNNER_TEMP/b03-chrome-smoke-profile" --dump-dom about:blank
```

Success requires exit code 0 and an `<html>` element in the captured DOM. Any setup/launch failure is recorded once with exact environment/error; do not repeat in an unchanged runner image. Eight B03 scenarios remain NOT_RUN until this prerequisite passes.

## Data and guardrails

Current source snapshot `data/address-city-snapshot.json` has `expiresAt=2026-10-31T08:24:54Z` (31.10.2026 11:24:54 МСК) and is fresh on 26.10.2026. Recheck this exact field immediately before the eight-scenario block; do not use it as fresh after expiry without new capture/review. `addressCitySnapshot` remains false. No Production, main, Android, backup, merge, tariff, or application code changes are authorized here.

## Trigger constraint / continuation

The workflow is restricted to a push touching its own file on the allowed branch. If a GitHub Connector ref update does not create an Actions run, leave the smoke BLOCKED_BY_ACTIONS_TRIGGER and do not start UI scenarios. One-time owner action: open the allowed branch in GitHub, edit `.github/workflows/b03-chromium-dom-smoke.yml` with a harmless comment (for example `# one-time push trigger`), and commit directly to this same branch. This creates the required normal push event without touching main. Do not use workflow_dispatch: this workflow is not installed on the default branch and changing that branch is out of scope.

## Verification

Workflow YAML parsing/diff checks and remote readback are pending before test/event assessment. Hosted browser version, DOM, exit, stderr, and artifact are pending. If the Connector starts no run, record that exact result and require the one-time push above. If smoke passes, save a separate B03 STARTED before building the mocked `/r` browser scenarios.
