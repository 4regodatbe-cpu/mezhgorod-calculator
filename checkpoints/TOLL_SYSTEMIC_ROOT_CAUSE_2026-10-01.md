# Systemic toll underpricing — root cause checkpoint

Date: 2026-10-01
Branch: `fix-systemic-toll-composition`

## User production observations
- Голубицкая → Санкт-Петербург: live route distance ≈2214.7 km, toll UI only 3220/3810 RUB while Yandex screenshot for essentially the same route shows ≈13,350 RUB.
- Краснодар → Санкт-Петербург: live route ≈2057.9 km, toll UI again 3220/3810 RUB.
- Краснодар → Москва: live route ≈1349.3 km, toll UI again 3220/3810 RUB.
- Витязево → Санкт-Петербург: user also observed only ~3000+ RUB.

The repeated identical toll amount over routes whose northern paid-road composition differs is diagnostic evidence of a route-level composition failure, not a one-route data typo.

## Confirmed code causes
1. `/api/v2/calculate` currently chooses a single road-specific toll result with null-coalescing precedence:
   `productionM4.tolls ?? productionM12?.tolls ?? verifiedTollFallback(...)`.
   It does not add independent paid-road systems on the same route.
2. M-11 production machinery exists (`m11-production.ts`) but is not wired into `/api/v2/calculate` at all.
3. A positive partial road result suppresses `verifiedTollFallback`, so a plausible but incomplete amount can be presented as the whole-route toll.
4. M-4 validator `complete` means only "all discovered local candidates were checked". It does not prove that every tariff event along a long M-4 traversal was discovered; therefore candidate-set incompleteness can still be promoted as exact.
5. Current UI text says the toll estimate is for a car without a transponder, while the existing A-289 engine still uses the older 800 RUB transponder-like full-corridor composition. The current official 2026-10-01 snapshot records 1103 RUB without transponder for Марьянская→Темрюк.
6. CKAD current tariff data exist in the repository with explicit no-transponder values, but there is no route-level CKAD exact engine wired into production composition.

## Fix direction
- replace single-source precedence with route-level component composition;
- wire M-11 evidence/pricing into the live route;
- require route-level completeness: if any detected/expected paid system is unpriced, total must be `unknown`, never a lower partial numeric total;
- strengthen M-4 completeness beyond "all discovered candidates checked";
- use explicit no-transponder A-289 tariffs;
- add CKAD section evidence/pricing before claiming an exact long-route total;
- keep the user-observed routes as regression controls, but do not hardcode their total as production logic.
