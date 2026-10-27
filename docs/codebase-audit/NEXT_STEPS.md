# Codebase audit fixes — next steps

## Unified 24-block reliability sprint — current status

Latest: block20 DONE for bounded saved-route computation + Valhalla response decode profiling; deterministic geometry/result hashes match, 0 external requests. Limits are not E2E or network performance. [Checkpoint](../checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md). Block18 is DONE [checkpoint](../checkpoints/2026-10-27-0430-block-18-road-composition-DONE.md). Overall progress21/24 (87.5%).

- [x] Block2 — V2 unknown/null display: verified server-rendered RouteCard and presentation helpers; manually entered toll on unknown provider pricing now computes a clearly manual total without the contradictory “full total not calculated” message. Unknown provider status remains visible. [Checkpoint](../checkpoints/2026-10-27-0228-block-2-v2-unknown-DONE.md).
- [x] Block3 — V3 unknown/null response contract, shared fastest-route render and copied status; no defect reproduced. [Checkpoint](../checkpoints/2026-10-27-0231-block-3-v3-unknown-DONE.md).
- [x] Block4 — V2/V3 HTTP/network/malformed response errors; generic handling of unexpected details, retry, abort and stale response. [Checkpoint](../checkpoints/2026-10-27-0234-block-4-ui-errors-DONE.md).
- [x] Block5 — V2/V3 request cancellation/races, V2 clear state and delayed clipboard completion. No hosted B03 rerun. [Checkpoint](../checkpoints/2026-10-27-0236-block-5-v2-races-DONE.md).
- [x] Block6 — V2/V3 input/output contracts after date/error/trace changes; no defect reproduced. [Checkpoint](../checkpoints/2026-10-27-0237-block-6-api-contracts-DONE.md).
- [x] Block7 — 16KiB streamed request-body cap for V2/V3; malformed/non-object JSON is a client error. [Checkpoint](../checkpoints/2026-10-27-0240-block-7-request-size-DONE.md).
- [x] Block8 — route-point labels capped at256 Unicode code points for both APIs; oversized values rejected before providers. [Checkpoint](../checkpoints/2026-10-27-0242-block-8-label-bounds-DONE.md).
- [x] Block9 — `/api/collect` streamed size/object validation and privacy-safe coarse regions; unknown toll stays null. [Checkpoint](../checkpoints/2026-10-27-0244-block-9-collect-DONE.md).
- [x] Block10 — `/api/collect` webhook uses an8s abort deadline, generic error response and no retry. [Checkpoint](../checkpoints/2026-10-27-0245-block-10-webhook-deadline-DONE.md).
- [x] Block11 — retained B10 captures show max individual body652,899 B; Valhalla/OSRM/BRouter now use a streaming8MiB cap, and malformed/incomplete geometry is rejected. Focused tests, API error mapping, tsc/ESLint/diff PASS. [Checkpoint](../checkpoints/2026-10-27-0252-block-11-provider-response-bounds-DONE.md).
- [x] Block13 — current V2 candidate fan-out compared with retained B10 request logs; all 68 recorded `(method, URL, body)` keys unique, no redundant exact request reproduced. No behavior changed. [Checkpoint](../checkpoints/2026-10-27-0301-block-13-provider-request-counts-DONE.md).
- [x] Block14 — mocked Valhalla rejection leaves a valid faster OSRM route selectable; existing candidates preserve fastest-route geometry and unknown/null pricing. Route-selection/pipeline suites, tsc, ESLint, diff PASS. [Checkpoint](../checkpoints/2026-10-27-0314-block-14-provider-fallback-DONE.md).
- [x] Block15 — reviewed route and address cache keys/TTLs/LRU/cancellation. Three mocked suites PASS; no defect reproduced, no code change. [Checkpoint](../checkpoints/2026-10-27-0322-block-15-cache-review-DONE.md).
- [x] Block16 — app diagnostics use bounded fields; V2 production error boundary no longer exposes raw internal exception/digest. Render test2/2, tsc, ESLint, diff PASS. [Checkpoint](../checkpoints/2026-10-27-0340-block-16-diagnostics-privacy-DONE.md).
- [~] Block21 — typing groups leave24/9 under the corrected strict config; not a ready CI gate. Root app typecheck remains PASS. Unexpected hosted run40469828321: verify/build/timing PASS, tolerated live_probe failure on address HTTP503; no rerun. Artifact12718511135. [Initial evidence](../checkpoints/2026-10-27-0352-block-21-typecheck-BLOCKED.md) · group checkpoints `0522`, `0530`, `0540`, `0550`, `0610`, `0630`, `0645`, `0700`, `0715`, `0735`.
- [~] Block23 — focused18/18 regression plus app tsc/scoped ESLint/diff passes; full build/CI remains unrun, so acceptance is partial. [Checkpoint](../checkpoints/2026-10-27-0408-block-23-focused-regression-PARTIAL.md).

Technical progress: 21/24 (87.5%): blocks1–20 except none, plus22. Block21 candidate check IN PROGRESS, not DONE; block23 PARTIAL; block24 open. B02/B04–B09 remain data-blocked.

## Follow-up plan (started 26.10.2026 23:49 МСК; separate from the completed prior six-block plan)

- [x] Block 1 — V2 full/incomplete trace characterization against saved synthetic case; 0 network calls. Checkpoint: [trace regression](../checkpoints/2026-10-26-2349-aud-trace-regression-DONE.md).
- [x] Block 2 — approved V2 public-pricing guard implemented; [decision](AUD-TRACE-RECOVERY-DECISION.md), [checkpoint](../checkpoints/2026-10-27-0054-aud-trace-recovery-fix-DONE.md).
- [x] Block 3 — freshness gate uses actual run date by default and a fixed test date override; preserve UNKNOWN effective dates. Checkpoint: [freshness gate](../checkpoints/2026-10-26-2353-tariff-freshness-date-DONE.md).
- [x] Block 4 — documented the three unknown-date rows and exact primary evidence required; no tariff-data edits. [Evidence list](AUD-DATA-01-UNKNOWN-EFFECTIVE-DATES.md), [checkpoint](../checkpoints/2026-10-26-2355-aud-data-unknown-dates-DONE.md).

Current follow-up progress: 4/4 blocks complete. Previous six-block plan below is historical and remains complete.

Новый ограниченный план: 6 независимых блоков. Завершение одного блока не означает готовность проекта.

- [x] AUD-DATE-01 — strict V2 departure calendar validation aligned with V3.
- [x] AUD-ERROR-01 — classify client input, known upstream, and unexpected internal exceptions while retaining safe client messages.
- [x] AUD-CI-01 — Node 24 in both workflows; hosted verify PASS. Unplanned live-probe side effect documented; do not rerun.
- [x] AUD-UI-01 — abort active V2 calculation on unmount; focused lifecycle regression passes.
- [x] AUD-DATA-01 — evidence/recommendation saved; fare amounts/effectiveFrom unchanged; source-date clarification remains BLOCKED_BY_DATA.
- [x] AUD-TRACE-RECOVERY-01 — evidence/recommendation saved; recovery thresholds/policy unchanged.

Progress: all 6/6 requested blocks complete. The fix plan itself is 4/4 P2 code blocks (100%); the two accompanying reviews are evidence-only and do not imply product policy/data is resolved. AUD-DATA-01 source dates remain BLOCKED_BY_DATA; AUD-TRACE-RECOVERY-01 requires a separately authorized policy change after focused follow-up tests. No B03/B10 or mass route audit was repeated.
