# Segment 6A3D — production-safe M-11 wrapper plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Build a production-shaped M-11 adapter without wiring it into `/api/v2/calculate` yet.

## Inputs

- existing fast-route geometry;
- strict M-11 road evidence derived from the same Valhalla response;
- existing legacy geometric segment labels only as a mixed-road safety guard;
- departure date/profile.

## Rules

- resolve boundaries using current verified spatial anchors;
- select only directly verified current Category-I tariff cells;
- compute weekday/weekend values by two explicit lookups, never arithmetic inference;
- block exact M-11 replacement if legacy geometric evidence contains any non-M-11 paid-road family;
- unresolved/reverse/unsupported pair => no replacement;
- return production-shaped tolls + validation only on exact safe result;
- no additional network request.

## Gate

Deterministic p58→p593/p679 controls, reverse/partial/mixed-road rejection, metadata validation and full build. Only after green may the wrapper be wired into the user API.