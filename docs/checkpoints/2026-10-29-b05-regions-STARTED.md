# B05 explicit-region matching — STARTED, LOCAL

Base 0d1a3331366ebb061ac472a05470fb3aeb8c9c93. Regression-first tests reproduced ordinary Rostov/Moscow region suffixes failing to win over priority-area namesakes. Generic provider-region suffix matching now applies only outside the five coordinate-classified priority areas; a misleading provider state cannot override their geometry. Removed the older Donetsk-specific Rostov score bonus. Unqualified geographical tiers remain unchanged; matching namesakes stay in Photon results.

42 focused Photon tests PASS; 7 actual-data GeoNames/API/safety tests PASS with external fetch throwing. Added requested explicit city/region cases to the existing actual API test, retaining exact Donetsk IDs, route position validation, street fallback and omitted-record guard. Rostov's saved label uses source title case, so its semantic region comparison is case-insensitive; five compact product labels remain exact in Photon tests.

Pending mandatory offline gate, TypeScript/scoped ESLint and webpack build on these working changes; logs /tmp/b05-regions-*.log. No push, CI configuration change, Preview publication, source corpus rebuild or live audit. Next save completion, then existing Preview only if the existing CLI auth finishes.
