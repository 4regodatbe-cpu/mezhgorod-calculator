# 2026-11-08 — release closeout and route analytics diagnosis

Status: release DONE (verified Vercel metadata + CI references), analytics IN PROGRESS. Base `b2b34d24440c018d887ada5db60d5f0062443b79`; PR #14 Draft; no Production deployment in this step.

## Verified release
Vercel deployment dpl_GwLhsBvyXoeUMkWuESpV326JYE3d target production READY and metadata Git SHA `b2b34d24440c018d887ada5db60d5f0062443b79`. By supplied release report calculator final gate push run 42427180745 and PR run 42427185100, B03 run 42427180727, route quality 42427180732 succeeded. Two live routes and V2 reported successful; not repeated during this step. Old local documentation commit 5104d504 is not found by GitHub and its original bytes are unavailable. Historical prior handoff is retained below current state, not rewritten as if original commit were recovered.

## User-reported issue and read-only evidence
Owner reports feedback saved, route addresses absent. Google spreadsheet route tab A:O headers read 08.11.2026: A timestamp; B origin; C destination; D km; E duration minutes; F rate; G total; H version; I route variant; J:M four vehicle totals; N:O weekday/weekend tolls. Inspection A480:O550 found last nonempty rows dated 2026-10-01; this is a bounded observation, not a scan beyond row 550. Feedback sheet header A:E includes message ID. No sheet mutation performed.

At `b2b34d24440c018d887ada5db60d5f0062443b79`, `app/api/collect/route.ts` validates duration but omits durationMin from forwarded route webhook; `app/v3/components/use-v3-calculation.ts` suppresses records when any vehicle total is null/requires split. Repository `google-apps-script/Code.gs` is old and cannot establish deployed Web App code. Prior attached historical installed candidate requires durationMin and schema migration (H duration), incompatible with observed H and occupied I; actual deployed source/marker not inspected in this session. Need establish intended recording semantics: calculated routes vs partial input searches; currently V3 records calculated legs only. Raw search telemetry is not assumed.

No code fixes, live webhook calls, migrations, tests, releases or user data changes in this step. Next inspect deployed Apps Script and recover completed b4b654... candidate if available, design append preserving all A:O, validate on isolated dummy spreadsheet, and stage compatible API sender. Requires no production modification absent owner direct request. Preserve 91-commit worktrees and Draft PR.
