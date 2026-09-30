# M-12 Segment 5B2D-4D2 — UI and analytics pricing truth result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Scope

This segment completed the propagation of the API pricing truth model `priced | free | unknown` through the V2 client, clipboard output, dual-route presentation, and anonymous route analytics.

No M-4/M-12 pricing core, route selection, tariff snapshot, or production `main` behavior was changed by this segment.

## Promotion harness failure and fix

The first promotion attempts failed during `pnpm build` before API regression execution.

Confirmed cause: the Python promotion harness used a regex replacement string directly with `re.subn`. The intended JavaScript literal `"\\n"` inside `lines.join(...)` was interpreted by the regex replacement engine, producing a real newline inside the generated TypeScript string and causing Turbopack to report `Unterminated string constant`.

Accepted harness fix:

- commit: `2c2ce196bfcee3175eed1c92f914be2a7a79ce54`
- change: insert the replacement through a callable (`lambda`) so backslashes are preserved literally.

This was an automation/promotion defect only; it was not a toll-calculation defect.

## Successful promotion gate

Workflow: `Segment 5B2D-4D2 promote UI truth`
Run: `36783522336` (#5)
Result: SUCCESS

Passed in order:

1. promotion patch application;
2. dependency installation;
3. production `pnpm build` / TypeScript gate;
4. local production server startup;
5. strict existing 4D-1 `unknown` API truth assertion;
6. commit/push only after all preceding gates were green.

Validated promoted commit:

- `ed7bf089cb62f258b542afa413dbfb6f37909f1b`
- message: `Segment 5B2D-4D2: preserve pricing truth in UI and analytics`

## Accepted UI truth semantics

`TollView` now carries nullable monetary fields plus required `pricingStatus`.

Rules preserved by the V2 UI:

- `unknown` is unresolved pricing, not free travel;
- empty toll `segments` no longer proves the fast route is toll-free;
- unknown automatic toll price is shown as `Стоимость не определена`;
- manual toll entry remains available;
- clipboard output writes `Платная дорога: стоимость не определена` instead of formatting null as `0 ₽`;
- dual mode marks aggregate toll pricing unresolved if any fast leg has `pricingStatus=unknown`;
- known `priced` and independently proven `free` results retain their existing behavior.

## Accepted analytics truth semantics

`route_v2` analytics now accepts:

- `tollWeekday: number | null`;
- `tollWeekend: number | null`;
- optional `tollPricingStatus: priced | free | unknown` for backward compatibility.

Validation rules:

- `unknown` => monetary toll values must be `null`;
- `free` => exact numeric zero is allowed;
- priced/free numeric values must be finite and non-negative;
- older clients that send numeric toll values without the new status remain accepted.

## Invariant after 4D-2

The `unknown != 0 ₽` invariant now survives the complete user-facing path covered by Segment 5B2D:

API boundary -> V2 response type -> route classification -> UI -> dual-route presentation -> clipboard -> anonymous analytics.

A missing/unresolved toll price is no longer silently coerced into an exact zero in those layers.

## Segment 5B2D status

The conservative M-12 user-API integration defined by `M12_SEGMENT_5B2D_PLAN.md` is complete:

- pure M-12 core is reused from the existing fast Valhalla route evidence;
- no second full-route request was introduced;
- M-4/A-289/mixed-road protections remain intact;
- unknown pricing is preserved as unknown at the API and client boundaries;
- production build and targeted regression gates are green.

Production `main` remains intentionally unchanged.

## Next

Close Segment 5 in the master optimization plan as the current M-12 stabilization checkpoint, then begin Segment 6 with M-11 as a diagnostic-first road-family stage. Do not change M-11 user pricing until its current route evidence, tariff model, failure modes, and regression controls are documented.
