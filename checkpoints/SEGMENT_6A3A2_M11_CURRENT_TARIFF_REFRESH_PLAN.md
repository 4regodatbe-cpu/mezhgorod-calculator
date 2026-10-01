# Segment 6A3A2 — current M-11 58–679 tariff refresh plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DATA REFRESH ONLY
Production `main`: unchanged.

## Trigger

The repository currently stores a March 2026 58–679 A1 snapshot with 21 tariff points. Current official operator infrastructure and the live official Avtodor tariff calculator now expose a 593-km tariff point (`Любань`).

The live official detailed-tariff document linked from the calculator also contains `593 км — Любань`, while the old March PDF stored in the repository does not.

Therefore the March snapshot must remain historical evidence and must not represent current October 2026 tariff structure.

## Goal

Create a new versioned **current A1 diagnostic snapshot** for 58–679 before any arbitrary-pair M-11 pricing is allowed.

The A1 refresh may contain only:

- current ordered tariff-point inventory;
- exact current row controls that have been independently observed from the official live calculator/document;
- source/document metadata and extraction caveats;
- explicit `completeMatrix=false` until both complete Category-I matrices are transcribed and independently validated.

## Current authoritative observations

Current official detailed-tariff source linked by the Avtodor calculator:

`https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf`

Observed ordered Category-I tariff-point labels for the 58–679 system:

58, 67, 89, 97, 124, 149, 159, 177, 208, 214, 258, 334, 348, 385, 402, 444, 524, 543, **593 (Любань)**, 646, 668, 679 km.

Observed no-transponder controls from the live official source:

- 58→593: Mon–Thu 3600 RUB; Fri–Sun 4390 RUB;
- 58→679: Mon–Thu 4200 RUB; Fri–Sun 4940 RUB.

The extracted detailed document states tariffs valid from `01:00 12.01.2026`; this is not contradictory to physical opening of PVP593 on 18.09.2026 because a tariff point can be defined before the facility opens. The repository must store these as separate facts.

The current source extraction did **not** expose a separate 593→679 matrix row. Therefore that pair remains unavailable/unknown in A1 and must not be derived by subtraction.

## Implementation

1. Add a new current A1 snapshot rather than overwriting March history.
2. Use 22 ordered tariff points, inserting `p593` between 543 and 646.
3. Bind `p593` to the independently confirmed physical `pvp593` only in the current model/snapshot path; do not mutate the historical March snapshot.
4. Persist only the two independently observed p58 controls above in the current A1 data unless more rows are directly extracted.
5. Keep `completeMatrix=false` and `usage=diagnostic_controls_only_not_for_arbitrary_pair_pricing`.
6. Do not derive 593→679 by `58→679 - 58→593`; closed-system tariff matrices are not assumed additive.
7. Add deterministic assertions for point count/order, p593 insertion, current controls, and historical March immutability.
8. Run <=20-minute deterministic validation + production build.
9. Do not import current A1 data into `/api/v2/calculate`.

## Gates

- historical March files remain unchanged;
- current snapshot contains exactly 22 ordered points;
- `p593` is present only in the current snapshot;
- no unobserved pair is assigned a monetary value;
- no production M-11 pricing changes;
- build green.

## Next after green A1 refresh

Acquire/transcribe both complete current Category-I matrices from the current detailed PDF with independent structural checks. Only a complete green A2 matrix can unlock the exact tariff core/resolver for arbitrary 58–679 pairs.
