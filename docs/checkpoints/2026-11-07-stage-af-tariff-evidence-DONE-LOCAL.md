# Stage AF — DONE LOCAL, evidence incomplete, 07.11.2026

Base: `e2949a98d59651aaaab8e70e3c1802b64dd98a2d`; worktree `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`. PR14 remains Draft. No push, merge, Production, main, Android, active mandatory gate or tariff-runtime changes.

## Scope and policy

Reviewed the two stale `avtodor-other-roads` rows against `docs/TARIFF_SOURCE_POLICY.md` and owner decisions 27–28. The 28 October decision carries forward the best available official rate/application without inventing a validity end; an old `observedAt` is a warning, not proof that a tariff expired. This does not waive the need for a trustworthy source cell, relevant category/payment mode, applicable period, conflict review or product identity. No observation date, `effectiveFrom`, tariff amount or active matrix changed.

## Primary source findings

The registry rows represent a single four-road snapshot, with two alternate payment-mode views. Original page response bytes for the snapshot observation dated 2026-10-01 are not retained; `data/tolls/2026-10-01-avtodor-other-roads-category1.json` is a derived transcription and is not treated as a primary document. Its observation date remains exactly as saved; it was not refreshed.

| Road | Retained source / edition | Category and payment | Applicable period in source | Outcome / limits |
|---|---|---|---|---|
| M‑3 | Official Appendix to Order53, 27.02.2026; `experiments/nationwide-tolls/source-documents/m3-order53-effective-2026-03-02.pdf`; SHA256 `d5344fd6bb54329466c5236e3d1657a14dd87ca8c3eddf2529276fbe1fa9d3a3` | Cat I; cash/card and listed transponders share tariff column. PVP86 100/100, PVP136 190/190, PVP168 190/230 RUB Mon–Thu/Fri–Sun. | Effective 2026-03-02 00:00 MSK; no end date printed in this appendix. | Source tariff cells verified visually on page1. No specific route passage or full trip total certified. |
| CKAD | Official Appendix to Order56, 27.02.2026; `experiments/nationwide-tolls/source-documents/ckad-order56-effective-2026-03-02.pdf`; SHA256 `839488fed07f8e611b5304498f22d49626ff0dc7529df67734a2052a49bea3e7` | Cat I: passenger car, height ≤2m, ≥2 axles; direct OD matrix applies to post-payment/listed transponders, no payment discount column. | Effective 2026-03-02 00:00 MSK; no end date printed in this appendix. | Source matrix visually checked page1; derived table `experiments/nationwide-tolls/source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json`, SHA256 `e6b2178c2448f071de92556d1d72237bd0281da9628f4855cb11b2cd32e6f9ca`. Do not sum separate cells or infer selected-route billing. |
| A‑289 | Official Appendix to Order55, 27.02.2026; `experiments/nationwide-tolls/source-documents/a289-order55-effective-2026-03-02.pdf`; SHA256 `da558d538e5a9e2ef8d36d46e0aec69c43b987f81c10d2186733a19aaca933bd` | Cat I; post-payment and listed transponders share the published matrix. | Effective 2026-03-02 00:00 MSK; no end date printed in this appendix. | Page1 direct OD cells: Maryanskaya–Slavyansk415; Slavyansk–Varenikovskaya205; Maryanskaya–Varenikovskaya620; Varenikovskaya–Temryuk180; Maryanskaya–Temryuk800; Slavyansk–Temryuk385 RUB. These are tariff cells, not route-crossing proof. |
| M‑1 33–66 | Saved registry cites official Order54 and URL `https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf`; registry metadata states 2026-03-02. | Saved audits report Cat I 230 RUB with transponder / 250 RUB without; the primary row itself cannot be reopened from retained bytes. | 2026-03-02 is metadata-only for this review; not independently verified against Order54 here. | **Missing primary artifact.** Neither Order54 PDF nor byte-exact 2026-10-01 official page response exists in the inspected repository. Cannot confirm exact M‑1 row/category/payment/date from primary bytes. Do not promote the reported values to a fully verified row. |

Exact partial records for each of the two payment modes are in `experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json`. Both have `coverageComplete:false`, no single complete source, and `fareKnown:false`. They also record that payment modes are alternatives, not additive products; route crossing and completeness of other journey costs remain outside this source snapshot.

## Patch and isolated integration

The exact mandatory-script patch remains `experiments/tariff-gate-proposal/approval.patch`; it is unapplied. It changes the CLI to evaluate reviewed evidence and preserve warning/error distinction. The experimental evaluator adds a fail-closed `coverageComplete` check: one or several verified files cannot certify an aggregate four-road snapshot when M‑1 is absent. `git apply --check` passed; active CI workflow and active gate source are unchanged.

In temporary copy `/tmp/stage-af-integration-j8BoPV`, the patch was applied with the prepared evidence and run strict at `TARIFF_AS_OF=2026-11-07`. Actual result: stale age warnings for the two rows; exit2 as expected. For each other-roads ID it reported `official_source_missing_or_unverified`, `official_fare_unproven`, `official_source_coverage_incomplete`, `material_or_unresolved_contradiction`, `product_binding_unproven` and `double_charge_risk_unresolved`; M‑11 and M‑12 reported `evidence_missing_or_duplicate`. Separate mutation controls produced BLOCKED for: no evidence (`evidence_missing_or_invalid`), wrong application date (`application_date_unproven_or_wrong`), material tariff conflict (`material_or_unresolved_contradiction`) and double-charge risk (`double_charge_risk_unresolved`). This is a temporary negative integration only, not active CI.

## Checks and preservation

- `node scripts/tariff-gate-approval.test.mjs`: 8/8 PASS.
- `node --test scripts/tariff-gate-approval.test.mjs scripts/tariff-freshness-proposal.test.mjs scripts/check-tariff-freshness.test.mjs`: 3/3 file suites PASS.
- `node --check experiments/tariff-gate-proposal/gate.mjs` and `node --check scripts/tariff-gate-approval.test.mjs`: PASS.
- All three Order53/55/56 source PDF hashes and CKAD transcription hash matched; prepared evidence JSON parsed.
- `git apply --check experiments/tariff-gate-proposal/approval.patch`, `git diff --check`: PASS.
- The current mandatory gate still has 2 stale entries and strict exit2; no change to the mandatory gate was applied.

## Bundle verification and limitation

Incremental Git bundle `/workspace/stage-af-273a462.bundle` passed `git bundle verify`; it advertises prerequisite `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`, and SHA256 at creation was `e892bbe0206d2e94e6a49562494a0acb5ac6fe3783f0ad74e8b6e2a67dfe2cad`. A separate temporary checkout attempt could not seed that prerequisite from this partial/promisor repository: fetch failed on missing promised object `c22625803e0302fa28bbc613e62e647a8c004e2f`. The failure occurred while fetching the base from the source repository, before fetching this bundle; it does not contradict `git bundle verify`, but a standalone reconstruction was not proven. File readback against the committed tree was checked with `git show`; evidence JSON SHA256 is `c8a2cf165fdaf8dde139fee4d9c6ff19195ebc26cb6cf58bf8d9958f9c0991da`, checkpoint SHA256 at first commit was `df055b7156c05d910b822d8c34b6088312df2cbb03550110444e6a01fc3cb184`. Use an existing object-complete copy containing the prerequisite when importing the incremental bundle.

No network requests or new source retrievals were made. No tariff price, runtime, geometry, route policy, V2/Android, Production, main, PR or remote ref changed. Local evidence bundle/commit are recorded in the final Stage AF handoff after commit. Next: obtain the already identified official Order54 artifact or original page capture; prepare the M‑11 and M‑12 evidence rows from their retained official sources; then have the owner review the exact patch and full manifest. Do not refresh the observation date merely because it is old.
