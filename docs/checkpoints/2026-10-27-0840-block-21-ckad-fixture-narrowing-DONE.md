# Reliability block21 — CKAD M11 fixture and unresolved union narrowing — DONE — 27.10.2026 08:40 МСК

- Parent `7e3160e77c6ce55b3d3d3bf5bae27f2be04b7a61` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Updated the saved CKAD test fixture to the full `M11RoadEvidence` shape required by `calculateProductionCkadM4M11`; the shared CKAD resolver accepts that structural subtype. Added explicit unresolved-status assertions before checking string reasons in the M11 boundary gate. Expected prices, direction and rejection cases are unchanged.
- Both targeted scripts PASS; strict diagnostics18/5→14/3; scoped ESLint and `git diff --check` PASS. Temporary strict config removed; no CI gate added.
- No application runtime behavior or business rules changed. Block21 remains IN PROGRESS; overall21/24 (87.5%).
