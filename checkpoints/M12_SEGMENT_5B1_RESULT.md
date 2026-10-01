# M-12 Segment 5B1 — official tariff core result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5B1 M12 official tariffs`
- run id: `36757287887`
- head: `35a38762605844e93e07547f2f912f7ae5b15a94`
- artifact id: `11117840735`
- result: success

## Assertions

- total: `96`
- passed: `96`
- failed: `0`
- Moscow -> Kazan (R239): `5847 RUB`
- Moscow -> Shali: `5909 RUB`
- reverse-direction adjacent tariffs: verified
- every adjacent Category-I section: verified
- unknown RVP: `status=unknown`, `amountRub=null`
- same-RVP result is explicitly `same_rvp`, not generic free-route evidence

## Build

`pnpm build` completed successfully under Next.js 16.3.4 / TypeScript. The new JSON snapshot and `lib/toll-engine/m12-tariffs.ts` are compatible with the real application build.

## Architecture now proven

- route/traversal evidence: Segment 5A
- official tariff evidence: Segment 5B1

These layers are independent. OSM/Valhalla never supplies the monetary tariff, and the tariff snapshot never decides which road section was actually travelled.

## Critical rule for the next segment

Do not price by destination-city label. The route to a city may leave M-12 at an earlier RVP. Segment 5B2 must determine the actually traversed official RVP/sections from route evidence before calling the tariff core.

## Next

Segment 5B2: map production route traversal to official M-12 RVP/section identities using official RVP kilometre markers and route-relative evidence. No user-API integration until this mapping is independently green.
