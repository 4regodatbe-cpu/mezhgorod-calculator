# Segment 6A3A2B — deterministic current M-11 matrix acquisition plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DIAGNOSTIC ONLY
Production `main`: unchanged.

## Trigger

The current official 58–679 source is an official PDF (order № 274 dated 03.09.2026) with dense matrices. Browser/PDF visual extraction proved unreliable for individual cells: one focused browser attempt returned internally inconsistent values and was rejected.

## Goal

Extract the official PDF deterministically on a GitHub Actions runner and persist the raw layout-preserving text as a workflow artifact before attempting any full A2 transcription.

## Method

1. Download only the already identified official PDF:
   `https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf`.
2. Hard-bound network transfer and job runtime.
3. Use `pdftotext -layout` so row/column relationships are preserved as much as the source permits.
4. Save:
   - raw PDF checksum and size;
   - `pdftotext -layout` output;
   - compact diagnostics for occurrences of `593`, `679`, `I категория`, and the two day-profile headings.
5. Upload the extracted text as an artifact for offline parsing/validation.
6. Do not write any tariff matrix into repository data in this acquisition step.
7. Do not touch `/api/v2/calculate`.

## Gates

- official PDF downloads successfully from the runner;
- extracted text is non-empty;
- `593` and `679` are present in extracted text;
- document metadata/order can be located;
- workflow <=20 minutes;
- no production source changes.

## Stop conditions

- if the PDF is image-only or layout text is structurally unusable, do not OCR hundreds of cells blindly; first split pages/regions and validate a smaller extraction method;
- if the origin blocks the runner deterministically, change acquisition method rather than retrying the same request unchanged;
- no ambiguous cell is promoted to A2.

## Next after green acquisition

Parse the artifact into explicit row candidates for both Category-I profiles, then independently validate point count/order, symmetry/shape, known p58 controls, multiple interior pairs, and every monetary cell before creating a complete A2 snapshot.
