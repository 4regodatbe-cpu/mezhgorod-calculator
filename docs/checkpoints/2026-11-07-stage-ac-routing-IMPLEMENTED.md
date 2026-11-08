# Stage AC routing diagnostics — IMPLEMENTED / final gates pending

From Stage AB `1f4987f9…`, isolated branch `codex/stage-ac-reliability`. Added safe typed provider failures and per-request routing attempt summaries to calculation timing. Preserved shared provider legacy error messages for V2 compatibility. V3 distinguishes upstream unavailability, exhausted provider timeouts, and rejected mandatory corridors. No route or toll data fabricated; no tariff edits.

Initial routing/classification/cancellation/timing suites 4/4 files PASS; partial-provider API plus classification/error mapping 3/3 PASS. Address/cancellation/UI suites 7/7 files PASS including all ten requested cities from admitted local corpus and Donetsk namesakes. These are controlled tests, not live street coverage/browser acceptance. TypeScript PASS before final source refinement. Build/full audit now pending on committed implementation.

No live requests, push or publication. Two historical 502 remain unidentifiable from old evidence. Browser dependency absent. Next: final offline/build/TS/lint checks, record exact remaining matrix gaps, portable bundle.
