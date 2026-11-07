# B10 Maykop-only case selector — DONE

- Time: 26.10.2026 20:20 МСК.
- Remote branch/head: `fix/v3-missing-route-prices-2026-10-15` / `edd7e79fbb42d81fb4b385636a7b6909b8b609c5`.
- PR #14 is open/Draft; no GitHub Actions are active. Main, Android, backup, Production, merge, and force-push paths untouched.

## Changes

The existing hosted capture harness now has a strict allow-listed `B10_CAPTURE_CASES` selector. Undefined means both prepared cases (backward compatible); an explicit list is validated for non-empty, unique, known case IDs. Provider preflight uses the first selected route; V2 capture and V3 Thursday/Saturday replay/comparison iterate only selected IDs. A pure parser module was separated so focused tests do not import the Next API route or make network requests. The `special-territory-policy` `verify` job now runs the B10 selector test file. The B10 workflow itself remains unchanged and still defaults to both cases; `B10_CAPTURE_CASES` is not yet set in its hosted environment.

## Verification

- Local `node scripts/v2-issue2-github-capture.test.mjs`: 4/4 PASS; cases cover default both, exact Maykop-only, subsets, invalid, duplicate, and empty input.
- Local classifier model: 10/10 PASS; syntax/YAML/`git diff --check` PASS.
- CI metadata concern was resolved: run40366544254 returned `head-already-checked` at f63a58d, while direct GitHub comparison f2208fdae…→f63a58d… is ahead by16 commits. Classifier now compares immutable workflow-run `head_sha`, with PR association required; missing/uncertain values fail open.
- Hosted run [40367512131](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40367512131): SUCCESS. Classifier reason `no-route-runtime-change-in-update`; `verify` PASS (435 existing tests + 10 classifier tests + 4 B10 selector tests, TypeScript and Next build); wide live jobs skipped. This is the hosted test of the immutable-head correction and selector contract.
- No provider preflight, B10 capture, or route request has been made in this block. Existing Eisk capture remains untouched.

## Next

The current-head STARTED exists. Set `B10_CAPTURE_CASES: maykop-to-moscow` with `[skip ci]`, prove this exact pending workflow diff by a separate docs-only special CI run (no B10 push path), and only then add a useful one-time comment in the B10 workflow to start one normal run. Require the actual run classifier to skip wide probes. Then perform one Maykop preflight/capture, preserve raw bodies/status/SHA/artifacts, run only offline Thursday/Saturday replay and selected V2/V3 comparison. Do not recapture Eisk or alter fares from algorithm-only differences.
