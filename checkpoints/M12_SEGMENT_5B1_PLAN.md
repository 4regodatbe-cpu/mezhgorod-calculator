# M-12 Segment 5B1 — official category-I tariff snapshot and pure pricing core

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Separate official M-12 money calculation from route detection. Build a versioned, deterministic Category-I tariff snapshot and a pure `entry RVP -> exit RVP` pricing function. No geometry is used in this segment.

## Official sources

Primary source: State Company Avtodor order No. 57 dated 2026-02-27, Appendix No. 1, M-12 "Vostok" tariff matrix. Effective from 2026-03-02.

Supporting current tariff page: Avtodor paid-road tariffs, M-12 "Vostok" adjacent sections.

Category I adjacent fees from Moscow through Shali:

`176, 322, 244, 359, 636, 165, 522, 205, 510, 311, 602, 348, 392, 215, 243, 155, 280, 162, 62` rubles.

Authoritative matrix checkpoints used as assertions:

- Moscow -> Kazan (R239): 5847 RUB
- Kazan (R239) -> Moscow: 5847 RUB
- Moscow -> Shali: 5909 RUB
- Elektro ugli -> Kazan (R239): 5671 RUB
- CKAD -> Kazan (R239): 5349 RUB
- Orekhovo-Zuevo (A108) -> Kazan (R239): 5105 RUB

## Planned implementation

1. Store a versioned JSON snapshot under `data/tolls/` with:
   - order/date/effective date/source URLs;
   - vehicle category I only;
   - stable RVP IDs and official display names;
   - 19 adjacent tariffs.
2. Add `lib/toll-engine/m12-tariffs.ts` as a pure pricing module.
3. Price any known pair by summing adjacent tariffs between their ordered RVP indices. Reverse direction must be symmetric.
4. Unknown RVP IDs return `unknown`, never `0`.
5. Same RVP may return a deterministic zero-distance result, but must be explicitly identified as same-RVP rather than interpreted as evidence that an unknown route is free.
6. Add deterministic assertions against the official matrix checkpoints above plus every adjacent section.
7. Run TypeScript/build validation and the tariff assertion script under Node 22.
8. Timeout <= 20 minutes.

## Non-goals

- No mapping from route gantries to official RVPs yet.
- No `/api/v2/calculate` integration.
- No M-4 changes.
- No tariff inference from OSM.

## Next

Segment 5B2 maps ordered route traversal to official M-12 RVP entry/exit identities. Only after that mapping is proven will Segment 5C integrate pricing into the user API with legacy recovery as fallback.
