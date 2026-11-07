## Actual MASS state — 07.11.2026: PAUSED_HTTP_429

New44attempts/43HTTP200/1HTTP429;after429nocalls. [Results](../../2gis-mass300-evidence/CONTINUATION/EXECUTION/RESULTS_FINAL.md). Campaign55reserved/50observed/5pending;free935/conservative930.35scoped/8mismatch/1inconclusive;8pairedaggregatecounterexamples. 232primarypaused,13CKADexcluded,4unusedreserves. ResolveplatformlimitwithoutRoutingprobes,freshPM/key/terms,andunchangedexactapprovalgatesbeforefutureindependentrequests. Donotrepeat429ID,prior11orCKADunknown. No runtime/push. Historical sections below superseded by this entry.

## Current MASS continuation — 07.11.2026

Exact293-window manifest approved,maximum289newunits. Registered records and current state: [EXECUTION](../../2gis-mass300-evidence/CONTINUATION/EXECUTION/README.md). LiveexecutionBLOCKED_BY_PLATFORM_MANAGER:OperaUNAVAILABLE30s twice,currentquota/expiry/no-paidunconfirmed,keyabsent. No newRoutingattempts/reservations. Restore authorizedPMsession/key,thenresume prepared first14new without prior11/CKADreplay while exact approvals pass unchanged24hgate. Historical sections below are not current approval status.

# Handoff — 2GIS diagnostic packet (stage 3)

## Stage 8 tariff result — 2026-11-06

The first proven tariff correction is isolated to M-11 15–58 Category-I without transponder. Current official Appendix 3 has effective time 2026-11-02 01:00 Moscow; the prior runtime kept the April matrix after that date. Added a dated 42-pair/210-cell V3 matrix (60 values differ) plus date-aware legacy Moscow pricing. PVP18→Solnechnogorsk is now300 ₽ Friday/Saturday/Sunday; reverse direction210/230/300 ₽. Historical schedule remains for earlier trips. The full-route fixture weekday total5330 ₽ remains; weekend maximum changes6590→6440 ₽. Verification and source links: [Stage8 result](STAGE8_RESULT.md), [checkpoint](../../docs/checkpoints/2026-11-06-2gis-stage8-m11-tariff-fix-DONE-LOCAL.md).

M-4 PVP545 remains fail-closed because the requested Avtodor source pages returned403 and current lane/product/effective-fare evidence is missing. ZSD current sources confirm zones and a receipt-bound special no-second-payment rule only for Automobile Street↔Blagodatnaya Street within60min; do not generalize this to all re-entry. Stage8 made no 2GIS calls, no new quota debit, and no edits to Production/main/Android/PR14. Full audit187/190 due three child-process tests blocked by EPERM; TypeScript, scoped ESLint, M-11 tests, and webpack build passed.

## Stage 7 systemic audit — current state (IN PROGRESS, 2026-11-06)

Final Stage7 summary and five ranked next fixes: [STAGE7_FINAL.md](STAGE7_FINAL.md).

The owner authorizes a useful series up to 300 free-demo Route units without per-request approval; do not repeat CKAD. Opera Browser Connector timed out on a read-only Platform Manager count. Last owner-reported readback was 991 after CKAD, same as before; ledger shows 0 observed debit, but CKAD status remains `outcome_unknown`. Reserve its one expected unit for a conservative task working ceiling of 990 before Stage 7 calls; after PVP18 and ZSD expected units, next-call ceiling988. This is not a live counter and does not account for outside-key usage. Key expiry last read as 2026-12-03. Cloud policy is unrestricted/enforced; no key remains bound after execution. First `m11-15-58` query returned HTTP200/route OK, 6,369m, payment events2/aggregate entries1; own path attribution remains unverified, actual quota debit unread. Second `zsd-rvp64-exit` returned HTTP200/route OK,176m, nearest anchor distance26m, payment fields absent; this does not establish free or paid tariff. Do not repeat either window or CKAD. Added a fourth source-backed window `m11-pulkovo-airport-access`, a0.739km one-way path through named gate node13377945035, dry-run verified; it can test path/payment-field presence, not establish a fare. Third query `m11-pulkovo-airport-access`: HTTP200/route OK,741m/48s, event count2/aggregate entries1; source path is739m, but nearest geometry vertex is266m from gate and raw WKT was not retained, so exact gate passage and fare attribution remain unknown. Expected1 Route, actual counter unread, working ceiling987. Prepared an independent Pulkovo→M-11 reverse window through named gate13377945036 and separate one-way road chain; chord0.83km, dry-run plus 13 tests PASS. It is a directional control, not fare proof. Checkpoint `docs/checkpoints/2026-11-06-2gis-pulkovo-m11-reverse-PREPARED.md`. The reverse Pulkovo→M-11 request returned HTTP200/route OK,830m/51s and the same payment counts (2 events/1 aggregate) as M-11→airport; source chord~828m. Neither gate crossing is proven because only nearest-vertex summaries were saved (240m to reverse gate). No fare inference; actual counter unread; working ceiling986. Updated the in-memory geometry reducer: it now records nearest route-segment distance to a configured anchor as well as nearest-vertex distance, without saving WKT; synthetic segment-crossing regression passes. Existing Pulkovo calls cannot be retroactively recomputed. Prepared an M-4 PVP545 northbound bypass-side gate window with exact one-way OSM sequence and plan/atlas crosswalk; path~26m, dry-run PASS, no price-pair attribution. Checkpoint `docs/checkpoints/2026-11-06-2gis-m4-545-northbound-PREPARED.md`. M4 PVP545 live execution was blocked before network by the per-window runner approval gate, conflicting with owner series authorization. Auto-review rejected local timestamp refresh as bypass; no retry/workaround, API request, attempt ledger entry or debit. See `docs/checkpoints/2026-11-06-2gis-m4-545-northbound-EXECUTION-BLOCKED.md`. Tests13/13 PASS. Start: `docs/checkpoints/2026-11-06-2gis-systemic-audit-STARTED.md`; route results: `docs/checkpoints/2026-11-06-2gis-m11-pvp18-first-live-DONE.md`, `docs/checkpoints/2026-11-06-2gis-zsd-rvp64-short-exit-DONE.md`.

## Current runner gate — 2026-11-06

The current runner uses window-scoped write-ahead reservations. The prior `ckad-m11-m12` entry remains `outcome_unknown` and permanently blocks that window's replay; it does not block independent `m11-15-58`. Every actual execution still requires a fresh preflight and a recent owner approval whose `windowIds` contains the exact selected window. CKAD approval does not authorize PVP18. No request was sent in this change. See [checkpoint](../../docs/checkpoints/2026-11-06-2gis-window-scoped-runner-gate.md).

## Current state

Branch: codex/2gis-diagnostics. Stage 3 is prepared but live status is **NOT_RUN**. No Routing API calls, no quota debit, no key value handling. Main algorithm, tariffs, Production and PR14 unchanged; no push or merge.

The user-provided Platform Manager screenshot summary is retained without asking for it again: on 05.11.2026 demo Routing API active, 9/1000 used, 991 remaining, key date range 03.11–03.12. The original stage 3 preflight blockers were superseded by the later stage 4 owner confirmation and stage 4.1 network-permission check recorded below. Current runner expects DGIS_HTTP_API_KEY; no key handling or API execution occurred in this task.

## First query

Start only with ckad-m11-m12 if a later message separately authorizes it:
- A [37.1996241,56.0900701] (named M11 approach junction node9556466755).
- B [37.2148620,56.0915116] (node8087316060 after booth node8087316064).
- Route direction is M11→M12 only, own forward directed scope, chord 0.96 km, expected route <2 km.
- Request: POST /routing/7.0.0/global; driving; fastest; jam; detailed; need_payment_info=true; alternative=0; utc omitted.
- Inspect HTTP status, route internal status, selection geometry against own witnesses and payment information separately.
- Do not infer the 981-ruble CKAD component or exact fare product from an aggregate.

The evidence path is experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/physical-directed.json. A route may be geometrically valid while its payment output is absent/ambiguous because this is a sub-kilometer ramp, not a full priced corridor.

## First-response gate

Before another call:
1. Inspect first HTTP status and internal route status separately.
2. Compare directed selection geometry against the saved witnesses; record whether it took the intended lane/booth/after-booth.
3. Inspect payment field presence and aggregate without assigning it to a named tariff.
4. Owner reads Routing API usage counter after first call and enters observed before/after in the local ignored preflight.
5. Mark whether the first output was useful and approve continuation separately. If not useful, keep both later queries NOT_RUN.

Runner requires owner approval for the exact window and fresh quota/terms preflight on every call. No automatic retries. Historical first-result review is retained as a process recommendation, not a global code lock; a prior unknown attempt blocks only its own reserved window.

## Conditional second and third

- m11-15-58: [37.2144063,56.0917554] → [37.2004102,56.0897492], northbound one-way ways954011576→954011577→791520973→1270188032 through gate8087316065. It is physically separate from window 1, but same interconnect and API payment aggregate cannot name which tariff product was charged. Use only if first answer's geometry/payment information proved useful and quota counter was reconciled.
- zsd-rvp64-exit: [30.2234101,59.9617618] → [30.2204329,59.9612328] on one-way way351741889, crossing mapped paid-road boundary node13020687195. RVP64 is not an established physical toll booth; do not expect a toll event at that point. This is an independent route geometry control, conditional on value and owner-approved remaining packet.

## Access/terms blockers

Official public rules reviewed 05.11.2026:
- demo route length cap 50 km;
- one route per single set of points billed; alternatives in the same request are not extra route charges;
- Routing API: 1,000 total demo billing-unit limit; official subscription rate table: 600/min;
- local limit deliberately stays at 5 expected route units/min until first counter reconciliation;
- need_payment_info returns payment details if the route has toll roads; detailed mode supports WKT route geometry;
- public docs do not grant enough evidence for retaining or importing that geometry/payment detail into the user's road database.

Before first request, owner must separately approve exactly the first window and exact parameters, provide the secret key only through approved environment injection, and confirm applicable terms/license and current counter. The screenshot data above is recorded and must not be re-requested; only a fresh counter reading is needed immediately before/after an eventual authorized call. Never put the key in a report, preflight, Git, URL output or logs. The actual request uses the API-required query key internally but the code suppresses its value and URL from output.

Do not request a second or third window unless first response is useful and post-call quota comparison was recorded. Do not repeat the 03.11.2026 pilot windows.

## Stage 4 update — 2026-11-06

Owner has authorized exactly one `ckad-m11-m12` request and supplied a credential in the conversation. It has not been copied to the shell or saved. The request remains NOT_RUN because there is no fresh numeric quota reading and the applicable terms for transient response processing/redacted-summary retention remain unconfirmed. A read-only browser tab check timed out; no retry or 2GIS call was made. Once the owner supplies the fresh counter and terms confirmation, run exactly the prepared first request once, then report the result and actual counter delta. Do not proceed to PVP18 or RVP64.

Owner confirmation received 2026-11-06: current quota and applicable terms are confirmed. The reply omitted the exact numeric remaining count needed by the runner's quota preflight. Ask only for that number; no need to repeat the key, permission or terms request. The earlier browser timeout is superseded by the owner's confirmation.

## Stage 4 execution result — 2026-11-06

One authorized CKAD M11→M12 attempt was made with pre-call counter 991. The client fetch timed out; no HTTP status or route response was received. No retry was made. Local private ledger is `outcome_unknown` with `expectedUnits: 1` and `observedQuotaDelta: null`; actual debit is unknown until the owner checks the post-attempt PM counter. Do not repeat the request. The supplied credential was used ephemerally and is no longer in the shell or repository. Stop after counter reconciliation/reporting.

Owner's after-counter readback is 991, equal to pre-call 991: observed quota change is 0 units. No HTTP response or route evidence was returned, so outcome remains unknown despite the counter. Local ignored ledger now records the readback while preserving `outcome_unknown`; this deliberately blocks subsequent calls. Stop here; no retry or other window.

## Stage 4.1 network conclusion — 2026-11-06

Status: **NETWORK_BLOCKED**. Current Codex network path fails direct DNS (`EAI_AGAIN`) and configured proxy egress before TLS (`EPERM`/curl connection failure). The prior route attempt's exact stage is unknown because the runner suppressed the error cause; DNS is the leading hypothesis from current tests only. Opera Browser Connector is unresponsive and no POST-capable browser is verified. Stage 4.1 sent no Routing API requests. Do not retry CKAD or call another window. Future separately authorized work needs a network-enabled runner or verified POST-capable browser plus public HTTPS/TLS preflight.

## Network permission resolution — 2026-11-06

The earlier default-sandbox `NETWORK_BLOCKED` diagnosis is refined. The official per-command permission request `with_additional_permissions` + `network.enabled=true` succeeded. Public HTTPS pages returned HTTP200, and a proxy-tunneled TLS1.3 handshake to `routing.api.2gis.com:443` verified the target certificate without sending an HTTP method or API request. Node requires `NODE_USE_ENV_PROXY=1` for its built-in fetch to use the configured proxy; with that per-process setting, public HTTPS succeeded. For a future separately authorized query, direct Codex command execution through this route is preferred. Opera is responsive for reading the active Platform Manager tab but has no exposed POST/input/JS control, so it is not a suitable API client. No global settings or Windows move required.

## Client recovery follow-up — 2026-11-06

The named original client commit (`f0f435ce…`) is not present in this checkout; the GitHub commit endpoint returned not-found, its five named files returned 404 from the default branch, the remote branch search returned no matching diagnostic branch, and the available stage2/stage3 archives do not include the files. Do not claim its historical 20/20 suite was run. The working source must be imported from the original executor or a supplied portable artifact before exact comparison can be completed.

The existing `diagnose.mjs` runner was used, not replaced. Narrow compatibility changes now use `DGIS_HTTP_API_KEY`, add `locale: "ru"`, remove the extra `traffic_mode`, allow only alternatives 0 or 2, and count historical `route_points[]` and `total_payments[]` without retaining entries. The WKT collector already follows nested `selection` fields under maneuvers/outcoming_path and the parser already handles LINESTRING/MULTILINESTRING. Tests prove request shape and that raw payment entries are not retained; they do not prove numeric decoding of the unavailable original `total_payments[]` format.

Prepared new query: `m11-15-58`, A `[37.2144063,56.0917554]` to B `[37.2004102,56.0897492]`, northbound via one-way ways954011576→954011577→791520973→1270188032 through PVP18 gate node8087316065, `alternative=2`. It tests whether route selection follows the independent northbound PVP18 geometry and whether the response has payment data; it does not distinguish the M11 15–58 product from CKAD by aggregate alone. Operator tariff matrix remains necessary. Dry-run chord is 0.90 km; allowlist cap 5 km and demo cap 50 km. Alternatives do not add billed Route units for the same point set per saved official pricing review.

No Routing API call was made. Execution remains blocked by the unresolved CKAD ledger entry (no retry) and lack of separate authorization for this new window. Future Node execution in Codex must use a command-scoped network grant and `NODE_USE_ENV_PROXY=1` to use the verified proxy path.


## Stage 9 geometry handoff — 2026-11-06

The sequential offline reuse pass is complete. See [result](STAGE9_GEOMETRY_RESULT.md) and [technical handoff](STAGE9_HANDOFF.md). Stage 8 compact packet SHA and patch application/reverse-check were verified in isolation; correction SHA is `136a5a72f76076188b3768897951a2b700a3d728`. M-4 PVP545 physical northbound branch is established, tariff product unknown; CKAD remains no-replay; M-12 exits are physical-only without operator binding; ZSD RVP64 is not proven as a separate toll product. No 2GIS calls or units were added. The primary curator owns Stage 8 runtime/tariff integration. No push, merge, Production, or main change.
