# Segment 6A3C — pure M-11 tariff-selection core plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Compose deterministic boundary resolution with the already validated current partial tariff core without widening monetary coverage.

## Rules

- unresolved boundary => `status=unknown`, `amountRub=null`;
- resolved boundary IDs are passed unchanged to the current directed tariff lookup;
- only p58→p593 and p58→p679 current Category-I controls can price for supported profiles;
- reverse, p593→p679, cross-system, same-point, unsupported profile and unknown boundary remain unknown/null;
- no subtraction, interpolation, March fallback or zero synthesis;
- preserve source/effective-date metadata from the current tariff core;
- remain outside production API until a dedicated integration/regression segment.

## Success

Deterministic controls for both exact directed pairs and all fail-closed cases; full build green; no production import.