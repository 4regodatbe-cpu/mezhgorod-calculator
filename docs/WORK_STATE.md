# Калькулятор «Из А в Б»: часть19

16.10.2026. Только fix/v3-missing-route-prices-2026-10-15, PR14draft. Verified parentb5561005f5ec6ae5200958ae86a06c71df20b6d1/treeb921e18f. Latest workflow38869309675/job116869376746 SUCCESS; активногоwriter нет.

## DONE

Части1–18:155/155+154/154, frozenREPORT340/340. 19A/19B A289 bindings saved,57helper-only+2whole-routecases (не59полныхтарифов).
19C policy25/25DONE, автоматический переход и отдельные STARTED/DONE/head/tree доказаны.20wholeofflinequotes/5unknownZSD, не25подтверждённыхцен.
Последний fullgate684/684+quote/API/Next/TS/static16/16, focused8/lint3, GitHubbuildSUCCESS — предыдущаявалидация, кодрасчётаздесьне менялся.
[Policyитог](checkpoints/2026-10-16-part19-policy-25-done-m4-unpriced-started.md).

## 19D — текущий разбор m4:unpriced22cases

**Case1 Гранитное→Казань рассмотрен, unknown сохранён, source-gated hold.** Selected2toll-taggedways1182567076/31984600 покрывают≈1.966км и совпадаютсвыбраннойValhallaгеометрией;0booths,nearestsavedPVP1046≈8.638км. Это не пропущенныйрадиусомПВП. Но независимое exactcollection/freeproof не установлено, officialpage403 не обходили. Не назначатьцену/0/FREE. [Диагноз/NEXT](checkpoints/2026-10-16-part19d-granitnoe-kazan-scope-reviewed.md), [evidence](checkpoints/evidence/2026-10-16-granitnoe-kazan-m4-scope.json).
Trace response shape отсутствует: индексы737–746 не применятькrequest320points/полнойгеометрии.
Этотточечныйsourcegap не блокируетдругие21case.

## NEXT STARTED — автоматически, без«дальше»

1. DONE frozen dependencies: pnpm install --frozen-lockfile exit0,18.6s; Node24.19.0/pnpm11.25.0, lockfile unchanged. [Checkpoint](checkpoints/2026-10-16-part19d-dependencies-restored.md). Не новыйfullgate.
2. DONE **lnr-лисичанск-moscow-center**, m4:unpriced2/22: offline15/17окт complete2/2, endpoints460→71 resolved; exactdatedfaremissing, unknown сохранён. [Checkpoint](checkpoints/2026-10-16-part19d-lisichansk-moscow-replay.md). NEXT STARTED samecase adapter/matrix/primarysource review; не назначатьцену бездоказательств.
3. ДиагнозDONE: reverse sourcechain416+460→339→…→71 incorrectly flattens to416→71, losing460→71. [Correction STARTED](checkpoints/2026-10-16-part19d-reversed-compound-boundary-diagnosis.md): orient compound IDs in compiler, preserve source/fares/unknown; focused+fullgate before acceptance, durable eachstep.

Часть19 IN PROGRESS,20 ещёне начата; прочиеfindings неполностьюразобраны. [Очередь](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json), [план](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json).
Одинwriter; приactive/queuedGitHubjobнеписатьвветку, TIME_LIMIT возобновляем. Не перезапускатьзавершённые309live/25policycases.

Unknown≠0, subtotal≠итог. Всяпоездкапомоментуотправления, междорожныевекторыотложены. Raw/live/baseline/historyсохранять. Audited/replay≠подтверждённыйтариф/freshlive. No main/merge/Production/Android/messages.
[Protocol](CHECKPOINT_PROTOCOL.md) · [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md) · [NEXT](../experiments/nationwide-tolls/NEXT_STEPS.md).

Latest [part19d-compound-compiler-change](checkpoints/2026-10-16-part19d-compound-compiler-change.md). Code change DONE, regenerated register; tests NOT yet run, not accepted for completion. NEXT: Run focused endpoint/adapter/source tests and eslint modified compiler/test, record exact PASS/FAIL then fullgate; do not replay another route before validation.

Latest [part19d-compound-focused-pass](checkpoints/2026-10-16-part19d-compound-focused-pass.md). Focused validation DONE:26/26 PASS, eslint2modifiedfiles exit0. Commands: node --import ./scripts/register-ts-paths.mjs --test experiments/nationwide-tolls/m4-endpoint-register.test.mjs experiments/nationwide-tolls/engine/m4-route-adapter.test.mjs experiments/nationwide-tolls/m4-verified-source.test.mjs; pnpm exec eslint compiler/test. No runtime sums/newprice/reversefare invention; sourcePDF/receipt hashes verified by tests. Fullgate not yet run. NEXT: Run npm run build -- --webpack with log capture; inspect complete audit/quote/API/Next/TS/static summary and exitstatus; record before route replay.

Latest [part19d-focused-lint-failed](checkpoints/2026-10-16-part19d-focused-lint-failed.md). Correction / FAILED lint:26/26 focusedtestsPASS, but combined command exit1 from2no-require-imports violations at existing CommonJS compilerline1. Previous focused-pass checkpoint incorrectly asserted exit0 before finaloutput was inspected; superseded and visibly annotated, old log preserved. No fullgate launched, no pricing acceptance. Compiler is deliberately.cjs with unchanged native require; no new lintissue introduced by directionpatch. NEXT: Run eslint test normally and CJS compiler with explicit no-require-imports exception only; document exact command and inspect exit before recording. Then fullgate. Do not change global lint policy.

Latest [part19d-compound-lint-recovery-done](checkpoints/2026-10-16-part19d-compound-lint-recovery-done.md). Lint recovery DONE exit0: pnpm exec eslint experiments/nationwide-tolls/m4-endpoint-register.test.mjs && pnpm exec eslint experiments/nationwide-tolls/scripts/build-m4-endpoint-register.cjs --rule '@typescript-eslint/no-require-imports: off'. Explicit CJS-only exception for existing native require, not ordinary lintPASS/global policy change.26/26 focused tests passed earlier; plain eslint exit1 is retained in prior correction checkpoint. NEXT: Fullgate STARTED: npm run build -- --webpack, /tmp/part19-compound-fullgate.log. Require actual exit0 and audit/quote/API/Next/TS/static summaries; onfailure record exactfailure beforefix. Do not price/replay nextcase yet.

Latest [part19d-compound-fullgate-pass](checkpoints/2026-10-16-part19d-compound-fullgate-pass.md). Fullgate DONE: npm run build -- --webpack exit0,687/687testsPASS,0fail; quotecontractPASS, APIadapterPASS, Nextwebpackcompiled7.0s, TypeScript6.1s, static16/16. Previously684+3newregressions. Focused26/26PASS; eslint CJS exception documented separately, ordinarylintfailure retained. Worktree clean/diffcheckPASS aftergate. No deployment/merge/livechecks. NEXT: Replay ONLY Lisichansk→Moscow savedcapture again for15/17October09:00MSK on correctedengine; verify outputs/hash/unknownstatus and record durablecase before nextcase.
