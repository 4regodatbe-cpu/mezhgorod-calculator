# Stage T — V3 input readiness and live-browser harness (STARTED)

- Date/time: 2026-11-06 10:15 MSK.
- Source local commit: `1e30ff192f7d6e1a807e98a04b62814b427b645f` (verified parent `7d5caee6602ae0431906566ab2ec074fd89b8540`; source commit is local-only).
- Published remote/PR #14 head at start: `7d5caee6602ae0431906566ab2ec074fd89b8540`; PR #14 OPEN / Draft.
- Isolated detached worktree: `/workspace/stage-t-v3-input-readiness`; main development worktree remains untouched at `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe` with its 91 local-only commits.
- Push is forbidden for this task. Production, main, Android, runtime pricing/routing, and 2GIS files must remain unchanged.

## Inputs and prior evidence

Stage S live workflow `42116523393`, artifact `13456406844`, recorded Yalta #01 and Donetsk→Melitopol #06 each timing out on suggestion buttons. Both recorded `requestSent=false`, no HTTP result, no visible search status, no JS errors, and failure screenshots with blank inputs. This localizes the observed failure before the `/r` request but does not distinguish a hydration/input-readiness race from an application interaction defect.

## Bounded plan

1. Inspect the current controlled `AddressField`, V3's standard/dual mode state transition, and existing live workflow contracts.
2. Add a deterministic readiness handshake using the existing mode buttons and observable React-rendered state change; restore the initial standard mode before typing.
3. Record page milestones, client-resource failures, navigation, input events, immediate/post-debounce input values, and bounded `/r` telemetry. Do not retry/replace a city automatically or alter `/r`/calculation responses.
4. Add a separately labeled independent address-replacement scenario starting from a previously successful city pair, while keeping original cases 01–04 dependent on the Yalta sequence.
5. Add a local delayed-hydration fixture test if available; it must not be represented as live V3 acceptance.
6. Run only relevant JS/browser/YAML/diff and outcome-classification checks; document any unavailable checks honestly.
7. Save a local DONE/FAILED checkpoint, WORK_STATE and work log, local commit and verified bundle. No push.

## Recovery and acceptance

If a check fails, preserve exact output and proceed only with the harness-only correction that evidence supports. Keep the input probe finite; use the app's known 350 ms address-search debounce only for post-fill observation, not as the readiness mechanism. Existing route tests remain real and unmocked. Do not alter production code to hide the issue. Finish with exact local SHA/bundle, readiness diagnosis, test outcomes, and what still needs a separately authorized push/Actions run.
