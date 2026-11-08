# GeoNames admission and bounded loading — STARTED

29.10.2026 МСК. Source local a4b5cdf4a33361ac45247ecd58e03a556bbcc535; remote fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7 confirmed with git ls-remote; PR14 open/Draft/merged=false confirmed with public GitHub API. Clean local checkout; prior commits preserved. User explicitly authorizes LOCAL commits only, superseding remote-persistence step for this task. No push/CI/Production/main/Android/backup changes.

Bounded sequential work:
1. Admission matrix for requested real settlements, source types/admin bindings/aliases and coordinate evidence. Reuse catalog SHA2860aaeca95ff9b97f6778cbbaf64912b42e94ba47ceabc0bb409e4845d2b6f1 from existing portable bundle, not new GeoNames downloads or old collision audit. New single batch Wikipedia coordinate request returned HTTP503/curl22; no repeated requests. Type P is distinct from administrative centroid A, but does not itself certify road access.
2. Reuse existing search implementation in a disk-sharded lazy loader, benchmark separate process against saved full-index baseline. No runtime activation until data admission; preserve provenance/CC BY4.0.
3. Only if data acceptance is demonstrated, API integration and focused endpoint/build checks; otherwise record exact data gates and retain working runtime untouched. Do not claim unintegrated Next bundle or Photon-outage success.

Recovery: catalog extracted to /tmp/local-gazetteer-review/catalog.json; original durable local archive /workspace/free-gazetteer-prototype-2026-10-28.tar.gz. Save scripts/results/checkpoints in local commits after each bounded block. Existing denied historical WORK_LOG/NEXT_STEPS remain untouched per WORKFLOW_RULES; new checkpoint files are the journal. No new paid services or Geoapify edits.
