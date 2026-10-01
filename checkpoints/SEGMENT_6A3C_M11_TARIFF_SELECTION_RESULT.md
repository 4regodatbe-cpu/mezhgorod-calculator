# Segment 6A3C — pure M-11 current tariff-selection result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / NON-PRODUCTION
Production `main`: unchanged.

Added `lib/toll-engine/m11-current-selection.ts`, composing the boundary resolver result with the previously validated strict current partial tariff core.

Exact current Category-I coverage remains deliberately limited to the directly verified directed controls:
- p58→p593: 3600 / 4390 RUB (Mon–Thu / Fri–Sun);
- p58→p679: 4200 / 4940 RUB.

Reverse directions, p593→p679, same-point, unsupported profile and unresolved boundary all return `unknown` with `amountRub=null`; no subtraction, interpolation, March fallback or false zero is possible.

Initial workflow run `36874166152` failed only because direct Node type-stripping requires a `.ts` extension on the runtime import. The import was corrected without changing pricing semantics.

Accepted workflow: `Segment 6A3C M11 current tariff selection`, run `36874293738`, head `739328c0d76a19e4e916ef56592ff797409e7284`, result SUCCESS including deterministic assertions, no-production-import gate and full build.

## Next

6A3D: production-wrapper integration design. It must use already available route/provider evidence where possible, must not add a slow full-route request merely to obtain M-11 pricing, and must preserve existing M-4/M-12/A-289 mixed-road composition. Exact M-11 replacement is allowed only when both boundary resolution and current tariff selection are exact.