# B03 hosted browser runner bootstrap — FAILED

- Status: FAILED (scenario suite NOT_RUN), 26.10.2026 17:26 МСК.
- Branch: `fix/v3-missing-route-prices-2026-10-15`; run commit: `685685bcc5b31f05ecf2cc46f2f95a0ecc5184d9`; PR #14 remained Draft.
- Run: [40339480704](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40339480704), job `address-ui`.

The GitHub-hosted Ubuntu 24.04 job checked out the intended commit and Node `v24.21.0`. It failed at `actions/setup-node@v4` before installing pnpm, Chrome or Playwright and before starting the application. Exact error: `Unable to locate executable file: pnpm. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.` The workflow configured `cache: pnpm` before invoking `pnpm/action-setup@v4`; setup-node could not resolve the package manager needed for cache discovery.

Consequences: all eight browser cases are NOT_RUN; no browser version/DOM/UI behavior was measured; no scenario artifact was produced (`upload-artifact` reported no files). This is a workflow bootstrap error, not an application result. Full runner log remains available at the run URL above.

Correction prepared: order `pnpm/action-setup@v4` before `actions/setup-node@v4` so the pnpm executable exists when setup-node resolves the pnpm cache. No assertions or application code changed. No retry should occur until this correction and a new STARTED checkpoint are durably saved. The independent `special-territory-policy` run `40339494194` was still active when this result was recorded; no remote write is permitted until all Actions are idle.

Next step: save the one-line workflow ordering correction and this failure record to the allowed branch using a non-force update; then run the eight scenarios once, provided the snapshot is still before `2026-10-31T08:24:54Z` and the push creates the expected Actions run.
