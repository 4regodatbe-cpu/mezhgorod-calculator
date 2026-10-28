# Recovery publication of Codex 28 Oct local patch — verified status

Source patch user-uploaded and verified SHA256 `2e4b3ddf01ddcb4167620d3c5e1435efaf649423aecc4b2d108fbd1a95220604`, original40 changed paths. This checkpoint is **new**; all earlier local-only reports are historical evidence. One writer, branch `fix/v3-missing-route-prices-2026-10-15`, PR#14 Draft, not merged.

## Published stages

| Commit | Published | Acceptance |
| --- | --- | --- |
| `61f736eb4a111a9176bf00499ce646457bd64129` | B05 approved working M4 545 quote + five tests | Both GitHub workflows SUCCESS: 40675207791, 40675207815; not application integration |
| `375baa6bb99db909d9fd10a594300f4d54a04481` | B11 exact-SHA CI classifier, mandatory offline gate, full API parity tests | Both workflows SUCCESS: 40675848925, 40675848957; live/timing jobs SKIPPED |
| `c59fc7096f8bf3e34886be6f0f8883338639fbf6` | Exact 3-line `app/api/v3/calculate/route.ts` optimization using `option.split` | Runtime blob matches `5fad968f64202bb14bf3fcdfe920ad364a312cd0`; both workflows SUCCESS: 40676195180, 40676195188; not Production |
| `88cee7851c730fc09502b571427236137b96367e` | B01 disabled Geoapify adapter metadata whitelist and negative test; M11 and CKAD allocation tests | Exact source Git SHA match; workflows 40676522021 and 40676522081 SUCCESS |

## Real remaining issues

- B11: remote application code updated and mandatory CI green, but no *deployed* or representative end-to-end SLA measurement; paired local saved-case result 3100→2015ms is one handler replay only.
- B05: approved 73.9km northbound Taman→Voronezh through gate5818209495: 140+180=**320RUB** Thursday, 160+250=**410RUB** weekend, owner policy accepted. Module `experiments/tariff-proof-selection/m4-545-accepted-working.mjs` tested but **not connected to runtime**. Carry complete direction/trace witness through composition and replace/mark both M4 product obligations to avoid double-count; do not append 320 to an old subtotal or present as whole-trip amount.
- B01: fix experimental metadata leakage published but fallback remains off; no approved API key, no real regional coverage.
- B06: M11 15–58 and 58–679 composition regressions checked; concrete directed boundary and charging conditions pending.
- B07: M12↔CKAD official 120-minute registration rule reviewed; 16 affected **CKAD** rows require registration context, not automatic amount.
- B08: paid/free georeferenced Golitsyno edge mapping remains unresolved.
- B09: ZSD cash/card zone payment breakdown unknown; operator official map reported maintenance.

## Publication scope and safe handling

Previously GitHub Connector security checks rejected full-text upload of `experiments/address-search/NEXT_STEPS.md` and `experiments/address-search/WORK_LOG.md` containing historical Vercel deployment identifiers. These files are **not uploaded or edited** by this recovery; admin security disposition still outstanding for them. The two binary evidence gzip logs are present in the original user-owned reconstructed patch, but were not included in the text-only GitHub transfer. No intentional redaction, encoding bypass or alternate auth transport. This is partial exact-file recovery, with remaining artifacts preserved externally. Read the retained local-results docs and checkpoints (which explicitly distinguish original local status from verified GitHub deployment).

## Codex handoff

Start from actual remote head/PR and CI, not the old local SHA `b7da7d62...`. Do not repeat completed tests or wide audits unless new delta demands it. Focus on safe B05 routing integration, B01 credentialed regional evaluation when key is provisioned, and one precise missing operator/source fact per B06–B09. Keep last-available-official tariff policy and fastest-route/unknown guards. No main, Production, merge, Android, backup edits without separate direct request. Commit small independent units only after mandatory CI gates; preserve data provenance, evidence and safe workspace handoff.
