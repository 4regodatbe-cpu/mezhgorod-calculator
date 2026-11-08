# Part19 automatic policy queue — READY / run observation pending

Parent428a9bde605f2fb7efb61275d471b6ec6f18a3a4, exact tree57622c629ed9af32cd17affa714cc92e18d54190 verified; working branch/PR14draft. Full684/focused8/lint3/quote/API/Next/TS/static16/16 PASS before activation. Runtime fares unchanged. User explicitly authorized automatic next after each checkpoint16.10.2026 10:27MSK.

Existing workflow now selects policy replay runner once parts1–18done/19in_progress. Preserved same branch guard/concurrency/onewriter/fullbuild before work; artifact also includes queue/plan/currenthandoff/logs for failedpush recovery. Selector syntax and actual current-plan result checked before finalpush. Remaining20/25 historical M4profile cases, not309freshlive routes. Everycase STARTED and DONE/FAILED separately pushed with exacthead/tree readback before next.

This commit changes workflow path, so its push should trigger a NEWrun (not rerun38824450386). AUTO_QUEUE_STATE READY has workflowRun=null deliberately: no inventedrunID. Discover via GET https://api.github.com/repos/4regodatbe-cpu/mezhgorod-calculator/actions/runs?branch=fix%2Fv3-missing-route-prices-2026-10-15&event=push&per_page=5 and match this new head/workflow. After observedactive/queued do not write inbranch; runner writes actual GITHUB_RUN_ID at persistedSTARTED afterbuild. If buildfails before pointer update, inspect observedrun's exactlogs instead of starting another writer.

Afterclassdone continue part19's other findings then part20 mandatory checks/handoff. UnknownZSD and other products remain unknown; subtotal notfulltotal, audited notpriceconfirmed. No main/merge/Production/Android/messages. Actualjob notclaimedrunning inthispre-activationrecord; observe afterpush.
