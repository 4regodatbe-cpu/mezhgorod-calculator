# Segment 1 — COMPLETE

Date: 2026-09-30
Branch: `optimize-calculator-2`
Validated head: `5bafe9dd34ef441f6e05e0e0c74b77ad163fccc0`
Workflow run: `36677462903`
Result: SUCCESS

## Goal completed

The proven local M-4 PVP validator + route-context pricing is now used by the real user `/api/v2/calculate` path, with conservative fallback behavior and mixed-road protection.

## Final gate results

Build/TypeScript: PASS.
User API regression: PASS.
Differential production comparison: PASS.
Artifact: `segment1-regression`, artifact id `11081140241`, SHA256 `cf671113364d29a3e6e48d07ba9010ebc489bd63c46fee9ae2566ffa33059502`.

### Exact pure M-4 controls
- Ейск → Москва: 5240 / 7240 ₽ PASS
- Москва → Ейск: 5240 / 7240 ₽ PASS
- Майкоп → Москва: 6090 / 8400 ₽ PASS
- Москва → Майкоп: 6090 / 8400 ₽ PASS
- Краснодар → Москва: 6090 / 8400 ₽ PASS
- Москва → Краснодар: 6090 / 8400 ₽ PASS
- Сочи → Москва: 6090 / 8400 ₽ PASS
- Москва → Сочи: 6090 / 8400 ₽ PASS

For all eight, the user endpoint used the exact M-4 local-PVP adapter and returned `tollValidation.status=toll`.

### M-4 + A-289 controls
- Ялта → Москва: 5625 / 7625 ₽ PASS
- Москва → Ялта: 5625 / 7625 ₽ PASS

Evidence required and observed:
- A-289 RVP 82 present;
- A-289 RVP 103 present;
- A-289 RVP 23 absent.

### Protected non-M-4/mixed controls
- Москва → Санкт-Петербург: 710.3 km, paid total 4580 ₽ retained.
- Сочи → Санкт-Петербург: 2338.4 km, paid total 9620 ₽ retained; not replaced by M-4-only adapter.
- Санкт-Петербург → Сочи: 2339.4 km, paid total 9620 ₽ retained; not replaced by M-4-only adapter.
- Москва → Казань: 820.2 km route-distance guard retained. Toll amount remains a known later-segment defect.

## Baseline availability rule validated

Production baseline became unavailable for one Moscow→Yalta comparison during the final run. The candidate still passed its independent exact invariants and the baseline outage was explicitly recorded as unavailable rather than converted into a false candidate failure. When the baseline was available, distance and protected toll-total comparisons remained enforced.

## Safety invariants retained

- incomplete/unknown M-4 validation cannot create an exact new amount;
- existing fallback remains available;
- mixed M-4+M-11 cannot be replaced by M-4-only exact pricing;
- exact A-289 composition is used only with the exact M-4 result in this segment;
- `main` / production remains unchanged.

## Known follow-up defects

1. Diagnostic and production M-4 orchestration are still duplicated and must share one core.
2. The free-route truth model still treats provider avoid-toll candidates too optimistically.
3. M-12 Moscow→Kazan is underpriced by the legacy detector; official target is 5847 ₽.
4. M-4 local validation still has a 24-second external matching budget and needs a performance pass.
5. UI still contains obsolete copy claiming Yandex API would make monetary toll calculation maximally accurate.

## Next action

Segment 2: pure shared-core M-4 refactor. No tariff mathematics or route-selection behavior should change. Segment 1 regression must remain green after the refactor.
