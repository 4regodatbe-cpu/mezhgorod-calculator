# M-11 Stage 8 integration pack

## Exact source results

- Current operator Appendix 3: official Category I no-transponder tariff, effective `2026-11-02T01:00:00+03:00`. Source PDF SHA-256 `543bf97c5ab7900897440c3432b735db86e5707b21417f3f8e35b3a8764bc835`; source URL `https://m11-neva.ru/upload/iblock/418/q6jhzdwnwegcud7xfjcsutj7ssa081m6.pdf`.
- Prior April edition matrix: 42 directed pairs / 210 cells, effective 2026-04-24 01:00 MSK. Matrix SHA is in `SOURCES.json`; published main at inspected time contains the same source file bytes.
- November extracted matrix: 42 directed pairs / 210 cells, SHA `b801eb896b4a29848e49164498d4b25041adda54950dbb708c1c23185c519279`.
- Offline comparison in `tests/verify_matrix.py` asserts all 210 cells and produces the exact changed-60 CSV. 03 November uses Friday profile; 04 November uses Saturday profile. Source PDF page 4 states both mappings and the effective time; the script confirms metadata fields, not production calendar code.
- Passage Rules Appendix 2 retained at `sources/section15-58-passage-rules-2026-10-14.pdf`; SHA listed in `SOURCES.json`. It defines the closed entry/exit PVP model and fare selected at exit PVP passage.

## Base and patch applicability

- Historical Stage 8 implementation patch `patches/stage8-legacy-implementation.patch` was authored against `3a000f64c82a7e89715cdea09a13e1edf9354bef`; its SHA-256 is in `SOURCES.json`, and the exact original Stage 8 packet is retained at `patches/stage8-original-packet.tar.gz`. Its applicability was verified against that base only.
- The actual read-only remote `main` inspected for this handoff is `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9`, not the older user-provided `d60e733…`. The old patch does **not** apply there: current main has `m11-production.ts`, `m11-current-selection.ts`, and `m11-current-tariffs.ts`; the old patch expects `m11-moscow-production.ts`, `m11-moscow-schedule.ts`, and the former V3 route adapter. Therefore do not apply the old runtime patch to current main.
- The new official source PDF and dated 210-cell matrix are independently reviewable data. Main's existing tariff model is partial and for 58–679; it does not directly consume this complete 15–58 matrix. Primary Codex must add a versioned full-pair 15–58 lookup/adapter and connect it only when entry/exit PVP are independently resolved. This packet does not edit main or prescribe silently replacing the existing partial model.

## Runtime contract and timing limitation

Use exact directed `fromPointId`→`toPointId`, vehicle category, payment mode, edition, and profile. Unknown boundary, unsupported direction, or unproven route/product must return `unknown/null`; never infer from aggregate 2GIS payment. Do not combine the 15–58 pair with the 58–679 product unless a verified shared PVP boundary and operator rule establish a valid composite.

Current calculator policy freezes an estimate at trip departure time; operator terms select the tariff at exit-PVP passage. If a trip crosses the 01:00 edition boundary or a day-profile transition en route, estimated and actual charged tariff can differ. Do not claim exact exit-time billing until the app has a reliable predicted/observed exit time.
