# Restore without replay

Current11approvedwindows completed. Do not rerunanyoftheseIDs to recoverWKT,headersorquotadebit. OriginalAPPROVAL_MANIFEST staysimmutable; approvals are not refreshed automatically. RUN_APPROVED is thin archivedorchestration,not instructiontoexecute.

Newworkspace:restore repositoryfrombundle;verify MANIFEST/SHA and readsourceprior-history.json plus REQUEST_RESULTS.jsonl. Rebuild primaryignored.query-history.json attempts by retaining all prior records and appending eachactualrecord's id,status,requestParameters,expectedUnits=reservedUnits,startedAt,completedAt. Never drop outcome_unknown/response/reservedrecords. Existinggate willthenrejectall11andCKAD. gate-check.mjs actually tests this reconstruction. If an ID has durable result but primaryledgerlost,orchestrator refuses sending and requiresrestoration.

CSV300IDs includes289unallocatedslots,not289preparedrequests. Pendingbilling2units stayreserved untillaternormalPMreconciliation. No additionalAPIrequestneededtoverifybudget. Freshquota/expiry andnewexactconsent requiredforfuturevalidatedwindows;no assumptionthatthissessioncontinuesafterfinalmessage. No keyinpacket;do not reconstruct it fromlogs.
