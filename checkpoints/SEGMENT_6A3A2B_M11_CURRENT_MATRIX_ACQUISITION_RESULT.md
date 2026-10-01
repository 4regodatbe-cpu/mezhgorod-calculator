# Segment 6A3A2B — current M-11 58–679 full-matrix acquisition result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: BLOCKED BY SOURCE ACCESS / SAFE STOP
Production `main`: unchanged.

## Goal

Acquire the complete current post-September 2026 Category-I 58–679 tariff matrices from an authoritative source before allowing arbitrary-pair current M-11 pricing.

## What is already accepted

The green A1 checkpoint remains authoritative only for the evidence it explicitly contains:

- current 22-point order including `p593` / Любань;
- current official document metadata: order No. 274 dated 03.09.2026;
- directly observed controls only:
  - `p58 -> p593`: 3600 RUB Mon–Thu / 4390 RUB Fri–Sun;
  - `p58 -> p679`: 4200 RUB Mon–Thu / 4940 RUB Fri–Sun;
- `completeMatrix=false`;
- no reverse-direction amount and no interior pair may be inferred from those controls.

Source file:
`data/tolls/m11/2026-10-01-58-679-category1-a1-current.json`.

## Acquisition attempts and evidence

### 1. Direct official PDF download from GitHub Actions

Workflow: `Segment 6A3A2B M11 current PDF extract`
Run: `36838385389`

Observed:

- PDF tooling installed successfully;
- direct `curl` request to the official current PDF returned HTTP 403;
- extraction never ran;
- no tariff data were produced.

### 2. Browser-session acquisition from GitHub Actions

Run `36838610690` first exposed a local harness syntax error before network access; that harness error was corrected.

Corrected run: `36838839115`.

Observed with real headless Chrome:

- `https://avtodor-tr.ru/road/tariffs/` returned HTTP 403;
- the current PDF URL returned HTTP 403 / `text/html`;
- therefore the GitHub-hosted runner is blocked by the operator/CDN layer even when using a real browser session.

### 3. External browser diagnostics

Read-only browser inspection identified DDoS-Guard protection and did not find a stable public JSON/XHR tariff API for the current 58–679 matrix. The official detailed PDF remains the authoritative detailed source.

Some broad DOM-inspection attempts returned internally inconsistent/corrupted mixed-site output. That output was explicitly rejected and none of it was persisted as tariff data.

Strict follow-up selectors did not reproduce a machine-readable embedded matrix reliably.

### 4. Reader/proxy attempt

A text-reader path was blocked by Cloudflare security verification before the official PDF content could be extracted.

## Decision

The current complete A2 matrix is **not acquired** and must not be synthesized.

Therefore:

- March 2026 matrices remain historical evidence only;
- current A1 remains partial diagnostic evidence only;
- no missing pair is copied from March data;
- no pair is derived by subtraction or symmetry;
- no source failure becomes `0 RUB`;
- arbitrary-pair October 2026 M-11 58–679 pricing remains `unknown` until directly covered by verified current data.

## Safe continuation

Proceed with a pure **partial current tariff coverage core** that consumes only A1-confirmed directed controls and returns `unknown/null` for every uncovered pair. It must remain outside `/api/v2/calculate` and must not be presented as the complete A2 matrix.

This keeps Segment 6 moving without weakening pricing truth. A full 6A3B3 arbitrary-pair resolver remains gated on complete current A2 acquisition and sufficient spatial evidence.
