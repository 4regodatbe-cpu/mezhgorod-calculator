# Codebase audit block 13 — abuse/security/privacy — DONE — 26.10.2026 22:40 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `809ce964a4b00b6c2708b23650b3ddaf5356add2`; PR14 Draft; no active Actions pre-write. Static inspection only of suggest, collect, classify, debug handlers and saved address-search design. No probing/requests.

- Suggest endpoint rejects q>200, returns empty for <3, calls bounded shared address search and passes request.signal. Debug endpoints use CALCULATOR_DEBUG_TOKEN in Vercel, 404 unauthorized, bounded labels/timeouts; classify caps positions count at2.
- Collection endpoint validates/coarsens/truncates event fields and has feedback honeypot, but parses JSON before field truncation and handler shows no explicit byte cap, per-origin rate limit or timeout for outbound webhook. P2 probable abuse/resource risk, not exploited or established without deployment edge/rate limit configuration. Fix if platform protection is absent: pre-parse cap/WAF rate policy/upstream deadline. Low–medium risk, independent.
- No raw query logging in inspected suggest route; it logs bounded failure/source/elapsed metadata. No evidence of credential leakage in these files.

Block done 13/18 (72.2%). No code change. Next B14 static performance/resource analysis.
