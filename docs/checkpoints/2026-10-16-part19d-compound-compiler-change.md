# part19d-compound-compiler-change

16.10.2026, parent f7d7831be1d472571648a2dc6aaf71d2a6900112, workingbranch/PR14draft only; no active writer observed. Parts19in_progress/20planned.

Code change DONE, regenerated register; tests NOT yet run, not accepted for completion.
Compiler now expands compound PVPs in directed multisection order. Standalone compound unchanged/no reverse invented. Source matrix/raw/live/REPORT unmodified. Added3 regressions. Compile exit0:728activekeys,428rawconflicts=404resolved+24excluded/0unknown,668excludedchains. Exactdiff36keysremoved/36added,0common-keyfarechanges;460→71 now1830/2300, stillunconfirmed. Intermediatecompound order corrected too; all scalarsections retain originalorder. Conflict accounting maps historical keys to normalized keys without losing counts.
First compiler attempt failed on scalar545-a/b IDs before write; restricted direction handling to actual compound multisection chains and admitted known suffix. Successful recompile. Read-only comparison hit defaultgit childbuffer ENOBUFS, repeated with8MB buffer and only summaryprinted; no raw loss. gitdiffcheckPASS.

NEXT STARTED: Run focused endpoint/adapter/source tests and eslint modified compiler/test, record exact PASS/FAIL then fullgate; do not replay another route before validation.
