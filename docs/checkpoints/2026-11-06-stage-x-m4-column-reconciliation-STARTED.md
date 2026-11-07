# Stage X — M‑4 tariff column reconciliation — STARTED

- Status: **STARTED**, 2026-11-06 UTC.
- Source branch/head: `codex/stage-w-m4-tariffs` / `b1733ceda10dc3e0577be803900fe6116f856c1f`.
- Published base: `d60e733313860d2412d8be64f4be10ef71f7de28`; PR #14 remains Draft.
- Scope: verify Stage W's interpretation of Avtodor M‑4 Order 58 and the recorded HTML snapshot; determine impact on 722 vector rows, PVP 355 rules and the saved Yalta→Rostov replay; recover dependencies without deleting any existing pnpm store; diagnose the five carried-over Stage V gate failures; run required local gates where feasible.
- Safety: no push/publication, no route geometry/selection changes, no changes to the protected primary clone, Production, Android or PR.
- First evidence: local PDF `experiments/nationwide-tolls/source-documents/m4-order58-effective-2026-03-02.pdf`, SHA256 `25fdb9a430934f47617c8cc1563f95e49c6ebe41c6303e9bd67465b3c568662d`, is scanned and has no text layer. Rendered pages 1–4 to `/tmp/stage-x-pdf`; visual page-1 header shows payment methods (cash/card/transponder) over two temporal columns `пн–чт` and `пт–вс`, with separate rows for categories I–IV. This contradicts the Stage W four-column schema, but row-by-row reconciliation and all downstream impacts remain pending.
- Exact current HTML bytes/capture have not yet been located. Stage W evidence reports direct page HTTP 403 and does not preserve response HTML; therefore its exact retrieved HTML variant and retrieval time remain unproven.
- Recovery: continue from this commit; do not regenerate, replace or delete any existing source store. Compare raw PDF rows to the immutable source transcription and Stage W snapshot before editing.
- Next step: extract and visually verify the six user-specified PVP rows and inspect all Stage W raw-source artifacts/commit diff.
