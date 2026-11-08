# AUD-DATA-01 — three UNKNOWN tariff effective dates

Read-only inventory based on `lib/toll-engine/tariff-registry.ts` and the existing Segment 6 evidence. No new source requests were made. All three registry fields remain `effectiveFrom: null`.

| Registry record | Existing source evidence | Exact primary evidence needed before setting a date |
| --- | --- | --- |
| `m11-58-679-2026-10-01-a1-current` | Avtodor order No. 274 dated 2026-09-03; current A1 extraction is explicitly partial. | The complete signed official text of order No. 274 and every tariff appendix for M-11 km 58–679, including the full Category I matrix and the clause stating when these rates enter into force. If amended/superseded, include the official amendment/order and its commencement clause. The saved PDF is `experiments/nationwide-tolls/source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf`; saved searchable/OCR material is only partial and does not independently establish the date. |
| `avtodor-other-roads-2026-10-01-category1-transponder` | Official tariff-page snapshot, observed 2026-10-01: `https://avtodor-tr.ru/road/tariffs/`; `publishedAt` and `effectiveFrom` are null. The saved consolidated data covers M1, M3, CKAD, and A289 rows. | An official Avtodor order/decision or archived official tariff publication with an explicit effective-from clause and annex/table proving Category I **with transponder** rates for every row in `data/tolls/2026-10-01-avtodor-other-roads-category1.json`. If different roads/rate tables became effective on different dates, split the registry/source mapping rather than assign one date to the aggregate. |
| `avtodor-other-roads-2026-10-01-category1-no-transponder` | Same official page snapshot; no effective date independently extracted. | The corresponding official order/decision or archived operator publication with an explicit effective-from clause and annex/table proving Category I **without transponder** rates for every underlying M1, M3, CKAD, and A289 row. It must establish applicability across the entire aggregate or the registry must be split by source/date. |

## Acceptance evidence

For any row, retain the original operator-published document/page version, its publication/version date, complete relevant annex pages, and the exact effective-date clause. The document must match vehicle category, payment mode, road/section, and tariff rows represented by the snapshot. A page capture's observation date, an order signing/publication date, a neighboring product's effective date, or a value already present in a data file is not by itself proof of legal commencement.

Until these items are supplied and reviewed, preserve `UNKNOWN`; do not infer dates, copy the M12 date, or change tariff amounts. See [AUD-DATA-01 evidence](AUD-DATA-01.md) and [the technical freshness-gate checkpoint](../checkpoints/2026-10-26-2353-tariff-freshness-date-DONE.md).
